import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import sigmoid_kernel
from datetime import datetime, timedelta
import pytz
import sys
import os
import pymongo
from bson import ObjectId
from dotenv import load_dotenv
import pickle
import time
import concurrent.futures
from scipy import sparse
import logging
import traceback

# Configure logging to log only errors
logging.basicConfig(level=logging.ERROR, format='%(asctime)s - %(levelname)s - %(message)s')

def load_data_from_db(mongo_uri, user_id):
    client = pymongo.MongoClient(mongo_uri)
    db = client.get_database("RapidRecap0")

    articles_collection = db.get_collection("Articles")
    quiz_attempts_collection = db.get_collection("quiz_attempts")
    time_spent_collection = db.get_collection("timespents")

    def fetch_latest_quiz_attempt():
        return quiz_attempts_collection.find_one(
            {"user": ObjectId(user_id)},
            sort=[("createdAt", pymongo.DESCENDING)],
            projection={"_id": 1, "user": 1, "article": 1, "RQM_score": 1, "userPercentile": 1, "createdAt": 1}
        )

    def fetch_latest_time_spent():
        return time_spent_collection.find_one(
            {"userId": ObjectId(user_id)},
            sort=[("date", pymongo.DESCENDING)],
            projection={"_id": 1, "userId": 1, "articleId": 1, "timeSpent": 1, "date": 1}
        )

    with concurrent.futures.ThreadPoolExecutor() as executor:
        latest_quiz_attempt_future = executor.submit(fetch_latest_quiz_attempt)
        latest_time_spent_future = executor.submit(fetch_latest_time_spent)

        latest_quiz_attempt = latest_quiz_attempt_future.result()
        latest_time_spent = latest_time_spent_future.result()

    if latest_quiz_attempt and latest_time_spent:
        latest_date = min(latest_quiz_attempt['createdAt'], latest_time_spent['date'])
    elif latest_quiz_attempt:
        latest_date = latest_quiz_attempt['createdAt']
    elif latest_time_spent:
        latest_date = latest_time_spent['date']
    else:
        latest_date = datetime.now(pytz.utc)

    start_date = latest_date - timedelta(days=30)

    def fetch_quiz_attempts():
        return list(quiz_attempts_collection.find(
            {"user": ObjectId(user_id), "createdAt": {"$gte": start_date}},
            projection={"_id": 1, "user": 1, "article": 1, "RQM_score": 1, "userPercentile": 1, "createdAt": 1}
        ))

    def fetch_time_spent():
        return list(time_spent_collection.find(
            {"userId": ObjectId(user_id), "date": {"$gte": start_date}},
            projection={"_id": 1, "userId": 1, "articleId": 1, "timeSpent": 1, "date": 1}
        ))

    with concurrent.futures.ThreadPoolExecutor() as executor:
        quiz_attempts_future = executor.submit(fetch_quiz_attempts)
        time_spent_future = executor.submit(fetch_time_spent)

        quiz_attempts = quiz_attempts_future.result()
        time_spent = time_spent_future.result()

    start_date_for_articles = start_date - timedelta(days=15)
    last_updated_str1 = start_date_for_articles.strftime("%Y-%m-%dT%H:%M:%SZ")
    last_updated_str2 = start_date_for_articles.strftime("%Y-%m-%d %H:%M:%S")

    pipeline = [
        {
            "$match": {
                "$or": [
                    {"dateTime": {"$gt": last_updated_str1}},
                    {"dateTime": {"$gt": last_updated_str2}}
                ]
            }
        },
        {
            "$project": {
                "_id": 1,
                "author": 1,
                "title": 1,
                "mainText": 1,
                "category": 1,
                "dateTime": 1,
            }
        }
    ]

    articles = list(articles_collection.aggregate(pipeline))

    articles_df = pd.DataFrame(articles)
    articles_df['dateTime'] = pd.to_datetime(articles_df['dateTime'], format='mixed', utc=True)
    quiz_attempts_df = pd.DataFrame(quiz_attempts)
    time_spent_df = pd.DataFrame(time_spent)

    return articles_df, quiz_attempts_df, time_spent_df

def load_tfidf():
    base_path = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_path, '..', 'model', 'tfidf_models')

    with open(os.path.join(model_path, 'tfv.pkl'), 'rb') as f:
        tfv = pickle.load(f)
    with open(os.path.join(model_path, 'tfv_matrix.pkl'), 'rb') as f:
        tfv_matrix = pickle.load(f)

    return tfv, tfv_matrix

def get_user_articles(user_id, quiz_attempts_df, time_spent_df):
    user_id_obj = ObjectId(user_id)

    if 'user' not in quiz_attempts_df.columns:
        quiz_articles = np.array([])
    else:
        quiz_articles = quiz_attempts_df[quiz_attempts_df['user'] == user_id_obj]['article'].unique()

    if 'userId' not in time_spent_df.columns:
        time_spent_articles = np.array([])
    else:
        time_spent_articles = time_spent_df[time_spent_df['userId'] == user_id_obj]['articleId'].unique()

    return np.union1d(quiz_articles, time_spent_articles)

def calculate_preference_score(user_id, quiz_attempts_df, time_spent_df):
    user_id_obj = ObjectId(user_id)
    current_date = datetime.now(pytz.utc)
    last_7_days = current_date - timedelta(days=7)

    if 'user' not in quiz_attempts_df.columns:
        user_quiz_attempts = pd.DataFrame()
    else:
        user_quiz_attempts = quiz_attempts_df[quiz_attempts_df['user'] == user_id_obj].copy()

    if 'userId' not in time_spent_df.columns:
        user_time_spent = pd.DataFrame()
    else:
        user_time_spent = time_spent_df[time_spent_df['userId'] == user_id_obj].copy()

    if 'createdAt' in user_quiz_attempts.columns:
        user_quiz_attempts['createdAt'] = pd.to_datetime(user_quiz_attempts['createdAt']).dt.tz_localize('UTC')

    if 'date' in user_time_spent.columns:
        user_time_spent['date'] = pd.to_datetime(user_time_spent['date']).dt.tz_localize('UTC')

    if not user_time_spent.empty:
        user_time_spent['normalized_timeSpent'] = user_time_spent['timeSpent'] / user_time_spent['timeSpent'].max()
        user_time_spent['preference_score'] = user_time_spent['normalized_timeSpent'] * 2

    if not user_quiz_attempts.empty:
        user_quiz_attempts['preference_score'] = 1

    for df in [user_quiz_attempts, user_time_spent]:
        if 'preference_score' not in df.columns:
            df['preference_score'] = 0.0
        df['preference_score'] = df['preference_score'].astype(np.float64)

    if 'createdAt' in user_quiz_attempts.columns:
        user_quiz_attempts.loc[user_quiz_attempts['createdAt'] >= last_7_days, 'preference_score'] *= 1.5

    if 'date' in user_time_spent.columns:
        user_time_spent.loc[user_time_spent['date'] >= last_7_days, 'preference_score'] *= 1.5

    quiz_preference = user_quiz_attempts[['article', 'preference_score']] if 'article' in user_quiz_attempts.columns else pd.DataFrame()
    time_preference = user_time_spent[['articleId', 'preference_score']].rename(columns={'articleId': 'article'}) if 'articleId' in user_time_spent.columns else pd.DataFrame()
    
    user_preference_df = pd.concat([quiz_preference, time_preference])

    if user_preference_df.empty:
        return pd.DataFrame(columns=['article', 'preference_score'])

    return user_preference_df.groupby('article')['preference_score'].mean().reset_index()

def recommend_random_articles(articles_df, num_recommendations):
    cutoff_date = pd.Timestamp.now(tz='UTC') - pd.Timedelta(days=30)
    recent_articles_df = articles_df[articles_df['dateTime'] >= cutoff_date]

    now = pd.Timestamp.now(tz='UTC')
    days_old = (now - recent_articles_df['dateTime']).dt.days.values
    time_decay = 1 / (1 + 0.1 * days_old)

    time_decay /= time_decay.sum()

    recent_article_ids = recent_articles_df['_id'].values
    recommended_indices = np.random.choice(len(recent_article_ids), size=num_recommendations, replace=False, p=time_decay)
    return recent_articles_df.iloc[recommended_indices]['_id'].astype(str).tolist()

def recommend_articles(user_id, articles_df, sig, quiz_attempts_df, time_spent_df, num_recommendations=270):
    user_articles = get_user_articles(user_id, quiz_attempts_df, time_spent_df)

    if user_articles.size == 0:
        return recommend_random_articles(articles_df, num_recommendations)

    user_preference_df = calculate_preference_score(user_id, quiz_attempts_df, time_spent_df)

    user_articles = np.array([article for article in user_articles if str(article) in articles_df['_id'].astype(str).values])
    user_preference_df = user_preference_df[user_preference_df['article'].isin(user_articles)]

    cutoff_date = pd.Timestamp.now(tz='UTC') - pd.Timedelta(days=30)
    recent_articles_df = articles_df[articles_df['dateTime'] >= cutoff_date]

    recent_articles = recent_articles_df[['_id', 'dateTime']].drop_duplicates()
    recent_articles = recent_articles[~recent_articles['_id'].isin(user_articles)]

    articles_index = {str(article_id): idx for idx, article_id in enumerate(articles_df['_id'])}
    user_indices = np.array([articles_index[str(article)] for article in user_articles if str(article) in articles_index])
    recent_indices = np.array([articles_index[str(article)] for article in recent_articles['_id'] if str(article) in articles_index])

    valid_user_indices = user_indices[user_indices < sig.shape[0]]
    valid_recent_indices = recent_indices[recent_indices < sig.shape[1]]

    if valid_user_indices.size == 0 or valid_recent_indices.size == 0:
        return recommend_random_articles(articles_df, num_recommendations)

    sig_subset = sig[valid_user_indices][:, valid_recent_indices]

    now = pd.Timestamp.now(tz='UTC')
    days_old = (now - recent_articles['dateTime']).dt.days.values
    time_decay = 1 / (1 + 0.1 * days_old)

    preference_scores = user_preference_df.set_index('article')['preference_score'].reindex(user_articles).fillna(0).values
    preference_scores = preference_scores.astype(float)

    preference_matrix = np.repeat(preference_scores[:, np.newaxis], sig_subset.shape[1], axis=1)

    weighted_scores = (sig_subset * preference_matrix).sum(axis=0)

    if weighted_scores.shape[0] != time_decay.shape[0]:
        return recommend_random_articles(articles_df, num_recommendations)

    weighted_scores *= time_decay

    top_indices = np.argsort(weighted_scores)[::-1][:num_recommendations]
    return recent_articles.iloc[top_indices]['_id'].astype(str).tolist()

def get_recommendations(user_id, articles_df, sig, quiz_attempts_df, time_spent_df):
    recommendations = recommend_articles(user_id, articles_df, sig, quiz_attempts_df, time_spent_df)
    if not recommendations:
        return []
    recommended_df = pd.DataFrame(recommendations, columns=['_id'])
    articles_df['_id'] = articles_df['_id'].astype(str)
    recommended_df = pd.merge(recommended_df, articles_df[['_id', 'title', 'category']], on='_id')
    return recommended_df.to_dict('records')

def update_recommendations_in_db(user_id, recommendations, mongo_uri):
    client = pymongo.MongoClient(mongo_uri)
    db = client.get_database("RapidRecap0")
    recommendation_collection = db.get_collection("recommendations")

    recommendation_collection.find_one_and_update(
        {"user_id": ObjectId(user_id)},
        {
            "$set": {
                "recommendations": [
                    {**rec, "served": False, "notified": False} for rec in recommendations
                ],
                "lastUpdated": datetime.now(),
                "isUpdating": False,
            }
        },
        upsert=True
    )

if __name__ == "__main__":
    try:
        base_path = os.path.dirname(os.path.abspath(__file__))
        dotenv_path = os.path.join(base_path, '..', 'config.env')

        load_dotenv(dotenv_path=dotenv_path)

        user_id = sys.argv[1]
        mongo_uri = os.getenv("DATABASE")

        articles_df, quiz_attempts_df, time_spent_df = load_data_from_db(mongo_uri, user_id)
        tfv, tfv_matrix = load_tfidf()
        sig = sigmoid_kernel(tfv_matrix, tfv_matrix)

        recommendations = get_recommendations(user_id, articles_df, sig, quiz_attempts_df, time_spent_df)

        update_recommendations_in_db(user_id, recommendations, mongo_uri)

    except Exception as e:
        logging.error(f"An error occurred for user {user_id}: {str(e)}")
        logging.error(f"Traceback:\n{traceback.format_exc()}")
        sys.exit(1)
