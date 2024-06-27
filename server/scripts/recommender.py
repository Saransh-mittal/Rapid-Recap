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

def load_data_from_db(mongo_uri, user_id):
    client = pymongo.MongoClient(mongo_uri)
    db = client.get_database("RapidRecap0")

    articles_collection = db.get_collection("Articles")
    quiz_attempts_collection = db.get_collection("quiz_attempts")
    time_spent_collection = db.get_collection("timespents")

    latest_quiz_attempt = quiz_attempts_collection.find_one(
        {"user": ObjectId(user_id)},
        sort=[("createdAt", pymongo.DESCENDING)],
        projection={"_id": 1, "user": 1, "article": 1, "RQM_score": 1, "userPercentile": 1, "createdAt": 1}
    )
    latest_time_spent = time_spent_collection.find_one(
        {"userId": ObjectId(user_id)},
        sort=[("date", pymongo.DESCENDING)],
        projection={"_id": 1, "userId": 1, "articleId": 1, "timeSpent": 1, "date": 1}
    )

    if latest_quiz_attempt and latest_time_spent:
        latest_date = min(latest_quiz_attempt['createdAt'], latest_time_spent['date'])
    elif latest_quiz_attempt:
        latest_date = latest_quiz_attempt['createdAt']
    elif latest_time_spent:
        latest_date = latest_time_spent['date']
    else:
        latest_date = datetime.now(pytz.utc)

    start_date = latest_date - timedelta(days=30)

    quiz_attempts = list(quiz_attempts_collection.find(
        {"user": ObjectId(user_id), "createdAt": {"$gte": start_date}},
        projection={"_id": 1, "user": 1, "article": 1, "RQM_score": 1, "userPercentile": 1, "createdAt": 1}
    ))

    time_spent = list(time_spent_collection.find(
        {"userId": ObjectId(user_id), "date": {"$gte": start_date}},
        projection={"_id": 1, "userId": 1, "articleId": 1, "timeSpent": 1, "date": 1}
    ))

    start_date_for_articles = start_date - timedelta(days=30)
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

    # print(f"Total number of articles loaded: {len(articles)}")

    articles_df = pd.DataFrame(articles)
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
    quiz_articles = quiz_attempts_df[quiz_attempts_df['user'] == user_id_obj]['article'].unique()
    time_spent_articles = time_spent_df[time_spent_df['userId'] == user_id_obj]['articleId'].unique()
    user_articles = np.union1d(quiz_articles, time_spent_articles)
    
    # print(f"Type of user_id: {type(user_id)}")
    # print(f"Type of quiz_attempts_df['user']: {type(quiz_attempts_df['user'].iloc[0])}")
    # print(f"Quiz attempts match: \n{quiz_attempts_df['user'] == user_id_obj}")
    # print(f"Number of user-interacted articles: {len(user_articles)}")
    
    return user_articles

def calculate_preference_score(user_id, quiz_attempts_df, time_spent_df):
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
    # print(f"User preference scores calculated for {len(user_preference_df)} articles")
    return user_preference_df

def recommend_articles(user_id, articles_df, sig, quiz_attempts_df, time_spent_df, num_recommendations=100):
    user_articles = get_user_articles(user_id, quiz_attempts_df, time_spent_df)
    user_preference_df = calculate_preference_score(user_id, quiz_attempts_df, time_spent_df)

    articles_df['date'] = pd.to_datetime(articles_df['dateTime'], errors='coerce').dt.date
    articles_df = articles_df.dropna(subset=['date'])
    cutoff_date = datetime.now().date() - timedelta(days=30)
    recent_articles_df = articles_df[articles_df['date'] >= cutoff_date]

    # print(f"Number of articles after filtering by date: {len(recent_articles_df)}")

    recent_articles = recent_articles_df[['_id', 'date']].drop_duplicates()
    recent_articles = recent_articles[~recent_articles['_id'].isin(user_articles)]

    articles_index = {str(article_id): idx for idx, article_id in enumerate(articles_df['_id'])}
    valid_indices = [articles_index[str(article)] for article in recent_articles['_id'] if str(article) in articles_index]
    sig_subset = sig[:, valid_indices]

    recommended_articles = {}
    for article in user_articles:
        if str(article) in articles_index:
            idx = articles_index[str(article)]
            similarity_scores = sig_subset[idx, :]
            preference_score = user_preference_df[user_preference_df['article'] == article]['preference_score'].values[0]
            weighted_scores = similarity_scores * preference_score
            for article_idx, score in zip(recent_articles['_id'].values, weighted_scores):
                if article_idx not in recommended_articles or recommended_articles[article_idx] < score:
                    recommended_articles[article_idx] = score

    recommended_articles = sorted(recommended_articles.items(), key=lambda x: x[1], reverse=True)[:num_recommendations]
    # print(f"Number of recommendations generated: {len(recommended_articles)}")
    return [str(article[0]) for article in recommended_articles]

def get_recommendations(user_id, articles_df, sig, quiz_attempts_df, time_spent_df):
    recommendations = recommend_articles(user_id, articles_df, sig, quiz_attempts_df, time_spent_df)
    recommended_df = pd.DataFrame(recommendations, columns=['_id'])
    # Ensure _id is of the same type (string) in articles_df
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
                    {**rec, "served": False} for rec in recommendations
                ],
                "lastUpdated": datetime.now(),
                "isUpdating": False,
            }
        },
        upsert=True
    )

if __name__ == "__main__":
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

    print("Recommendations generated and saved to MongoDB")
