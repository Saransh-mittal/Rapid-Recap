import sys
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import pytz
from bson import ObjectId
import pymongo
from dotenv import load_dotenv
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import sigmoid_kernel
import pickle
import logging
from scipy.sparse import csr_matrix

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_data_from_db(mongo_uri, user_id):
    try:
        client = pymongo.MongoClient(mongo_uri)
        db = client.get_database("RapidRecap0")

        articles_collection = db.get_collection("Articles")
        quiz_attempts_collection = db.get_collection("quiz_attempts")
        time_spent_collection = db.get_collection("timespents")

        start_date = datetime.now(pytz.UTC) - timedelta(days=30)

        pipeline = [
            {
                "$match": {
                    "$or": [
                        {"dateTime": {"$gte": start_date.strftime("%Y-%m-%dT%H:%M:%SZ")}},
                        {"dateTime": {"$gte": start_date.strftime("%Y-%m-%d %H:%M:%S")}}
                    ]
                }
            },
            {
                "$project": {
                    "_id": {"$toString": "$_id"},
                    "author": 1,
                    "title": 1,
                    "mainText": 1,
                    "category": 1,
                    "dateTime": {"$toDate": "$dateTime"},  # Convert to date object
                }
            }
        ]

        articles = list(articles_collection.aggregate(pipeline))

        quiz_attempts = list(quiz_attempts_collection.find(
            {"user": ObjectId(user_id), "createdAt": {"$gte": start_date}},
            {"_id": 1, "user": 1, "article": {"$toString": "$article"}, "RQM_score": 1, "createdAt": 1}  # Convert article to string
        ))

        time_spent = list(time_spent_collection.find(
            {"userId": ObjectId(user_id), "date": {"$gte": start_date}},
            {"_id": 1, "userId": 1, "articleId": {"$toString": "$articleId"}, "timeSpent": 1, "date": 1}  # Convert articleId to string
        ))

        articles_df = pd.DataFrame(articles)
        quiz_attempts_df = pd.DataFrame(quiz_attempts)
        time_spent_df = pd.DataFrame(time_spent)

        return articles_df, quiz_attempts_df, time_spent_df

    except Exception as e:
        logging.error(f"Error loading data from database: {str(e)}")
        raise

def load_tfidf():
    try:
        base_path = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_path, '..', 'model', 'tfidf_models')

        with open(os.path.join(model_path, 'tfv.pkl'), 'rb') as f:
            tfv = pickle.load(f)
        with open(os.path.join(model_path, 'tfv_matrix.pkl'), 'rb') as f:
            tfv_matrix = pickle.load(f)

        return tfv, tfv_matrix
    except Exception as e:
        logging.error(f"Error loading TF-IDF model: {str(e)}")
        raise

def calculate_preference_score(user_id, quiz_attempts_df, time_spent_df, articles_df, user_preferred_categories):
    try:
        user_id_obj = ObjectId(user_id)
        current_date = datetime.now(pytz.utc)
        last_7_days = current_date - timedelta(days=7)
        last_3_days = current_date - timedelta(days=3)

        # Filter recent articles
        recent_article_ids = set(articles_df['_id'].astype(str))
        logging.info(f"Number of recent articles: {len(recent_article_ids)}")

        # Filter and process quiz attempts
        user_quiz_attempts = quiz_attempts_df[
            (quiz_attempts_df['user'] == user_id_obj) &
            (quiz_attempts_df['article'].astype(str).isin(recent_article_ids))
        ].copy()
        logging.info(f"Number of user quiz attempts: {len(user_quiz_attempts)}")

        # Ensure 'createdAt' is timezone-aware
        user_quiz_attempts['createdAt'] = pd.to_datetime(user_quiz_attempts['createdAt']).dt.tz_localize(pytz.UTC)
        user_quiz_attempts['preference_score'] = user_quiz_attempts['RQM_score'].astype(float)

        # Filter and process time spent
        user_time_spent = time_spent_df[
            (time_spent_df['userId'] == user_id_obj) &
            (time_spent_df['articleId'].astype(str).isin(recent_article_ids))
        ].copy()
        logging.info(f"Number of user time spent records: {len(user_time_spent)}")

        # Ensure 'date' is timezone-aware
        user_time_spent['date'] = pd.to_datetime(user_time_spent['date']).dt.tz_localize(pytz.UTC)

        # Calculate time-based weights
        if not user_time_spent.empty:
            user_time_spent['normalized_timeSpent'] = user_time_spent['timeSpent'] / user_time_spent['timeSpent'].max()
            user_time_spent['preference_score'] = user_time_spent['normalized_timeSpent'] * 2

        # Increase weightage for recent interactions
        user_quiz_attempts.loc[user_quiz_attempts['createdAt'] >= last_7_days, 'preference_score'] *= 1.5
        user_quiz_attempts.loc[user_quiz_attempts['createdAt'] >= last_3_days, 'preference_score'] *= 2
        user_time_spent.loc[user_time_spent['date'] >= last_7_days, 'preference_score'] *= 1.5
        user_time_spent.loc[user_time_spent['date'] >= last_3_days, 'preference_score'] *= 2

        # Combine quiz and time spent preferences
        quiz_preference = user_quiz_attempts[['article', 'preference_score']]
        time_preference = user_time_spent[['articleId', 'preference_score']].rename(columns={'articleId': 'article'})
        user_preference_df = pd.concat([quiz_preference, time_preference])

        logging.info(f"Quiz preference shape: {quiz_preference.shape}")
        logging.info(f"Time preference shape: {time_preference.shape}")
        logging.info(f"Combined user preference shape: {user_preference_df.shape}")

        inferred_categories = {}
        if not user_preference_df.empty:
            user_preference_df = user_preference_df.groupby('article')['preference_score'].sum().reset_index()
            user_preference_df['article'] = user_preference_df['article'].astype(str)

            # Debug logging
            logging.info(f"User preference df before merge: {user_preference_df.head()}")
            logging.info(f"Articles df _id sample: {articles_df['_id'].head()}")

            # Convert articles_df '_id' to string for comparison
            articles_df['_id'] = articles_df['_id'].astype(str)

            # Merge with articles_df to get categories
            user_preference_df = articles_df[['_id', 'category']].merge(
                user_preference_df,
                left_on='_id',
                right_on='article',
                how='inner'
            )

            logging.info(f"User preference df after merge: {user_preference_df.head()}")
            logging.info(f"Unique categories in user_preference_df: {user_preference_df['category'].unique()}")

            # Infer category preferences
            category_scores = user_preference_df.groupby('category')['preference_score'].sum()
            logging.info(f"Category scores: {category_scores}")

            total_preference = category_scores.sum()
            logging.info(f"Total preference score: {total_preference}")

            if total_preference > 0:
                inferred_categories = (category_scores / total_preference).to_dict()

        logging.info(f"Inferred categories: {inferred_categories}")

        # Combine with existing preferred categories
        combined_categories = user_preferred_categories.copy()
        for category, weight in inferred_categories.items():
            if category in combined_categories:
                combined_categories[category]['weight'] = combined_categories[category]['weight'] * 0.7 + weight * 0.3
                combined_categories[category]['isInferred'] = False
            else:
                combined_categories[category] = {'weight': weight, 'isInferred': True}

        # If there are no preferred categories, use the inferred ones
        if not combined_categories:
            combined_categories = {cat: {'weight': weight, 'isInferred': True} for cat, weight in inferred_categories.items()}

        # Normalize weights
        total_weight = sum(cat['weight'] for cat in combined_categories.values())
        if total_weight > 0:
            for category in combined_categories:
                combined_categories[category]['weight'] /= total_weight

        logging.info(f"User preferred categories: {user_preferred_categories}")
        logging.info(f"Combined categories: {combined_categories}")

        return user_preference_df, combined_categories

    except Exception as e:
        logging.error(f"Error calculating preference score: {str(e)}")
        logging.error(f"quiz_attempts_df shape: {quiz_attempts_df.shape}")
        logging.error(f"time_spent_df shape: {time_spent_df.shape}")
        logging.error(f"articles_df shape: {articles_df.shape}")
        raise

def calculate_sigmoid_kernel(tfv_matrix):
    try:
        tfv_matrix_sparse = csr_matrix(tfv_matrix)
        return sigmoid_kernel(tfv_matrix_sparse, tfv_matrix_sparse)
    except Exception as e:
        logging.error(f"Error calculating sigmoid kernel: {str(e)}")
        raise

def recommend_articles(user_id, articles_df, sig, quiz_attempts_df, time_spent_df, user_preferred_categories, num_recommendations=270):
    try:
        user_preference_df, updated_categories = calculate_preference_score(user_id, quiz_attempts_df, time_spent_df, articles_df, user_preferred_categories)

        logging.info(f"User preference df shape: {user_preference_df.shape}")
        logging.info(f"User preference df columns: {user_preference_df.columns}")
        logging.info(f"User preference df non-zero scores: {user_preference_df[user_preference_df['preference_score'] > 0].shape[0]}")

        if user_preference_df.empty or user_preference_df['preference_score'].sum() == 0:
            logging.warning("No user preferences found. Recommending recent articles.")
            recent_articles = articles_df.sort_values('dateTime', ascending=False)
            return recent_articles['_id'].astype(str).tolist()[:num_recommendations], updated_categories

        if not updated_categories:
            logging.warning("No categories inferred. Using user interactions for recommendations.")
            recommended_articles = user_preference_df.sort_values('preference_score', ascending=False)
            return recommended_articles['_id'].astype(str).tolist()[:num_recommendations], updated_categories

        preferred_categories = {cat: info['weight'] for cat, info in updated_categories.items()}

        now = pd.Timestamp.now(tz='UTC')

        # Convert 'dateTime' to datetime if it's not already
        articles_df['dateTime'] = pd.to_datetime(articles_df['dateTime'], utc=True)

        days_old = (now - articles_df['dateTime']).dt.days.values
        time_decay = 1 / (1 + 0.1 * days_old)

        category_boost = articles_df['category'].map(lambda x: preferred_categories.get(x, 0.1)).values

        # Ensure sig_subset matches the shape of articles_df
        sig_subset = sig[:len(articles_df), :len(articles_df)]

        # Convert category_boost to a 2D numpy array
        category_boost_2d = category_boost[:, np.newaxis]

        weighted_scores = (sig_subset * category_boost_2d).sum(axis=0)
        weighted_scores *= time_decay

        top_indices = np.argsort(weighted_scores)[::-1]

        main_recommendations_count = int(num_recommendations * 0.9)
        main_recommendations = articles_df.iloc[top_indices[:main_recommendations_count]]

        other_categories = set(articles_df['category']) - set(preferred_categories.keys())
        other_articles = articles_df[articles_df['category'].isin(other_categories)]

        if len(other_articles) > 0:
            diverse_recommendations_count = num_recommendations - main_recommendations_count
            diverse_recommendations = other_articles.sample(n=min(diverse_recommendations_count, len(other_articles)))
        else:
            diverse_recommendations = pd.DataFrame(columns=articles_df.columns)

        final_recommendations = pd.concat([main_recommendations, diverse_recommendations])
        final_recommendations = final_recommendations.sample(frac=1).reset_index(drop=True)

        return final_recommendations['_id'].astype(str).tolist()[:num_recommendations], updated_categories

    except Exception as e:
        logging.error(f"Error recommending articles: {str(e)}")
        logging.error(f"Shape of articles_df: {articles_df.shape}")
        logging.error(f"Shape of user_preference_df: {user_preference_df.shape if 'user_preference_df' in locals() else 'N/A'}")
        logging.error(f"Shape of sig: {sig.shape}")
        raise

def recommend_random_articles(articles_df, num_recommendations):
    try:
        now = pd.Timestamp.now(tz='UTC')
        days_old = (now - articles_df['dateTime']).dt.days.values
        time_decay = 1 / (1 + 0.1 * days_old)

        time_decay /= time_decay.sum()

        recommended_indices = np.random.choice(len(articles_df), size=num_recommendations, replace=False, p=time_decay)
        return articles_df.iloc[recommended_indices]['_id'].astype(str).tolist()
    except Exception as e:
        logging.error(f"Error recommending random articles: {str(e)}")
        raise

def update_recommendations_in_db(user_id, recommendations, updated_categories, mongo_uri):
    try:
        client = pymongo.MongoClient(mongo_uri)
        db = client.get_database("RapidRecap0")
        recommendation_collection = db.get_collection("recommendations")
        user_collection = db.get_collection("Users")

        recommendation_collection.find_one_and_update(
            {"user_id": ObjectId(user_id)},
            {
                "$set": {
                    "recommendations": [
                        {"_id": rec, "served": False, "notified": False} for rec in recommendations
                    ],
                    "lastUpdated": datetime.now(),
                    "isUpdating": False,
                }
            },
            upsert=True
        )
        # log the updated categories
        logging.info(f"Updated categories for user {user_id}: {updated_categories}")
        # Update user's preferred categories
        user_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "preferredCategories": [
                        {"category": cat, "weight": info['weight'], "isInferred": info.get('isInferred', False)}
                        for cat, info in updated_categories.items()
                    ]
                }
            }
        )

        logging.info(f"Updated recommendations and preferred categories for user {user_id}")
    except Exception as e:
        logging.error(f"Error updating recommendations in database: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        base_path = os.path.dirname(os.path.abspath(__file__))
        dotenv_path = os.path.join(base_path, '..', 'config.env')
        load_dotenv(dotenv_path=dotenv_path)

        user_id = sys.argv[1]
        user_preferred_categories = json.loads(sys.argv[2])
        mongo_uri = os.getenv("DATABASE")

        articles_df, quiz_attempts_df, time_spent_df = load_data_from_db(mongo_uri, user_id)
        logging.info(f"Loaded data shapes: articles_df={articles_df.shape}, quiz_attempts_df={quiz_attempts_df.shape}, time_spent_df={time_spent_df.shape}")
        logging.info(f"Articles df _id dtype: {articles_df['_id'].dtype}")
        logging.info(f"Quiz attempts df article dtype: {quiz_attempts_df['article'].dtype}")
        logging.info(f"Time spent df articleId dtype: {time_spent_df['articleId'].dtype}")

        tfv, tfv_matrix = load_tfidf()
        sig = calculate_sigmoid_kernel(tfv_matrix)

        recommendations, updated_categories = recommend_articles(user_id, articles_df, sig, quiz_attempts_df, time_spent_df, user_preferred_categories)

        if recommendations:
            update_recommendations_in_db(user_id, recommendations, updated_categories, mongo_uri)
            print(json.dumps({"status": "success", "message": "Recommendations updated successfully", "count": len(recommendations)}))
        else:
            print(json.dumps({"status": "error", "message": "No recommendations generated"}))

    except Exception as e:
        logging.error(f"An error occurred in main execution: {str(e)}")
        print(json.dumps({"status": "error", "message": str(e)}))
        raise
