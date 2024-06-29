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

def load_data_from_db(mongo_uri, user_id):
    start_time = time.time()

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

    end_time = time.time()
    print(f"load_data_from_db execution time: {(end_time - start_time) * 1000:.2f} milliseconds")

    return articles_df, quiz_attempts_df, time_spent_df

def load_tfidf():
    start_time = time.time()

    base_path = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_path, '..', 'model', 'tfidf_models')

    with open(os.path.join(model_path, 'tfv.pkl'), 'rb') as f:
        tfv = pickle.load(f)
    with open(os.path.join(model_path, 'tfv_matrix.pkl'), 'rb') as f:
        tfv_matrix = pickle.load(f)

    end_time = time.time()
    print(f"load_tfidf execution time: {end_time - start_time} seconds")

    return tfv, tfv_matrix

def get_user_articles(user_id, quiz_attempts_df, time_spent_df):
    start_time = time.time()

    user_id_obj = ObjectId(user_id)

    if quiz_attempts_df.empty:
        quiz_articles = np.array([])
    else:
        quiz_articles = quiz_attempts_df[quiz_attempts_df['user'] == user_id_obj]['article'].unique()

    if time_spent_df.empty:
        time_spent_articles = np.array([])
    else:
        time_spent_articles = time_spent_df[time_spent_df['userId'] == user_id_obj]['articleId'].unique()

    user_articles = np.union1d(quiz_articles, time_spent_articles)

    end_time = time.time()
    print(f"get_user_articles execution time: {end_time - start_time} seconds")
    print("User articles shape:", user_articles.shape)

    return user_articles


def calculate_preference_score(user_id, quiz_attempts_df, time_spent_df):
    start_time = time.time()

    user_id_obj = ObjectId(user_id)
    current_date = datetime.now(pytz.utc)
    last_7_days = current_date - timedelta(days=7)

    user_quiz_attempts = quiz_attempts_df[quiz_attempts_df['user'] == user_id_obj].copy()
    user_time_spent = time_spent_df[time_spent_df['userId'] == user_id_obj].copy()

    user_quiz_attempts['createdAt'] = pd.to_datetime(user_quiz_attempts['createdAt']).dt.tz_localize('UTC')
    user_time_spent['date'] = pd.to_datetime(user_time_spent['date']).dt.tz_localize('UTC')

    user_time_spent['normalized_timeSpent'] = user_time_spent['timeSpent'] / user_time_spent['timeSpent'].max()
    user_time_spent['preference_score'] = user_time_spent['normalized_timeSpent'] * 2
    user_quiz_attempts['preference_score'] = 1

    user_quiz_attempts['preference_score'] = user_quiz_attempts['preference_score'].astype(np.float64)
    user_time_spent['preference_score'] = user_time_spent['preference_score'].astype(np.float64)

    user_quiz_attempts.loc[user_quiz_attempts['createdAt'] >= last_7_days, 'preference_score'] *= 1.5
    user_time_spent.loc[user_time_spent['date'] >= last_7_days, 'preference_score'] *= 1.5

    user_preference_df = pd.concat([
        user_quiz_attempts[['article', 'preference_score']],
        user_time_spent[['articleId', 'preference_score']].rename(columns={'articleId': 'article'})
    ])

    user_preference_df = user_preference_df.groupby('article')['preference_score'].mean().reset_index()

    end_time = time.time()
    print(f"calculate_preference_score execution time: {end_time - start_time} seconds")
    print("User preference scores shape:", user_preference_df.shape)

    return user_preference_df

def recommend_articles(user_id, articles_df, sig, quiz_attempts_df, time_spent_df, num_recommendations=270):
    start_time = time.time()

    user_articles = get_user_articles(user_id, quiz_attempts_df, time_spent_df)

    if user_articles.size == 0:
        print("No articles found for the user. Returning random recommendations.")
        
        # Filter recent articles
        cutoff_date = pd.Timestamp.now(tz='UTC') - pd.Timedelta(days=30)
        recent_articles_df = articles_df[articles_df['dateTime'] >= cutoff_date]

        # Calculate time decay
        now = pd.Timestamp.now(tz='UTC')
        days_old = (now - recent_articles_df['dateTime']).dt.days.values
        time_decay = 1 / (1 + 0.1 * days_old)

        # Normalize time decay to sum to 1
        time_decay /= time_decay.sum()

        # Select random articles based on time decay weights
        recent_article_ids = recent_articles_df['_id'].values
        recommended_indices = np.random.choice(len(recent_article_ids), size=num_recommendations, replace=False, p=time_decay)
        recommended_articles = recent_articles_df.iloc[recommended_indices]['_id'].astype(str).tolist()

        end_time = time.time()
        print(f"recommend_articles execution time: {end_time - start_time} seconds")
        print("Recommended articles shape:", len(recommended_articles))

        return recommended_articles

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

    print("user_indices shape:", user_indices.shape)
    print("recent_indices shape:", recent_indices.shape)

    sig_subset = sig[user_indices][:, recent_indices]

    print("sig_subset shape:", sig_subset.shape)

    now = pd.Timestamp.now(tz='UTC')
    days_old = (now - recent_articles['dateTime']).dt.days.values
    time_decay = 1 / (1 + 0.1 * days_old)

    preference_scores = user_preference_df.set_index('article')['preference_score'].reindex(user_articles).fillna(0).values
    preference_scores = preference_scores.astype(float)
    print("preference_scores shape:", preference_scores.shape)

    preference_matrix = np.repeat(preference_scores[:, np.newaxis], sig_subset.shape[1], axis=1)
    
    print("preference_matrix shape:", preference_matrix.shape)
    print("time_decay shape:", time_decay.shape)

    weighted_scores = (sig_subset * preference_matrix).sum(axis=0)

    if weighted_scores.shape[0] != time_decay.shape[0]:
        print("Mismatch in shapes between weighted_scores and time_decay")
        print(f"weighted_scores shape: {weighted_scores.shape}")
        print(f"time_decay shape: {time_decay.shape}")
        return []

    weighted_scores *= time_decay

    print("weighted_scores shape after sum and decay:", weighted_scores.shape)

    top_indices = np.argsort(weighted_scores)[::-1][:num_recommendations]
    recommended_articles = recent_articles.iloc[top_indices]['_id'].astype(str).tolist()

    end_time = time.time()
    print(f"recommend_articles execution time: {end_time - start_time} seconds")
    print("Recommended articles shape:", len(recommended_articles))

    return recommended_articles

def get_recommendations(user_id, articles_df, sig, quiz_attempts_df, time_spent_df):
    start_time = time.time()

    recommendations = recommend_articles(user_id, articles_df, sig, quiz_attempts_df, time_spent_df)
    if not recommendations:
        return []
    recommended_df = pd.DataFrame(recommendations, columns=['_id'])
    articles_df['_id'] = articles_df['_id'].astype(str)
    recommended_df = pd.merge(recommended_df, articles_df[['_id', 'title', 'category']], on='_id')

    end_time = time.time()
    print(f"get_recommendations execution time: {end_time - start_time} seconds")

    return recommended_df.to_dict('records')

def update_recommendations_in_db(user_id, recommendations, mongo_uri):
    start_time = time.time()

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

    end_time = time.time()
    print(f"update_recommendations_in_db execution time: {end_time - start_time} seconds")

if __name__ == "__main__":
    start_time = time.time()

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

    end_time = time.time()
    print(f"Total script execution time: {end_time - start_time} seconds")
