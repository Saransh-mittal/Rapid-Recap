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
    """
    Load data from MongoDB with proper handling of empty results.
    Returns DataFrames with correct columns even when no data exists.
    """
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
        articles_df = pd.DataFrame(articles)

        # Create empty DataFrames with correct columns if no data exists
        quiz_attempts = list(quiz_attempts_collection.find(
            {"user": ObjectId(user_id), "createdAt": {"$gte": start_date}},
            {"_id": 1, "user": 1, "article": {"$toString": "$article"}, "RQM_score": 1, "createdAt": 1}
        ))
        quiz_attempts_df = pd.DataFrame(quiz_attempts) if quiz_attempts else pd.DataFrame(columns=['_id', 'user', 'article', 'RQM_score', 'createdAt'])

        time_spent = list(time_spent_collection.find(
            {"userId": ObjectId(user_id), "date": {"$gte": start_date}},
            {"_id": 1, "userId": 1, "articleId": {"$toString": "$articleId"}, "timeSpent": 1, "date": 1}
        ))
        time_spent_df = pd.DataFrame(time_spent) if time_spent else pd.DataFrame(columns=['_id', 'userId', 'articleId', 'timeSpent', 'date'])

        # logging.info(f"Loaded data shapes: articles_df={articles_df.shape}, quiz_attempts_df={quiz_attempts_df.shape}, time_spent_df={time_spent_df.shape}")

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
    """
    Calculate user preference scores with proper handling of empty DataFrames.
    Returns preference DataFrame and updated categories.
    """
    try:
        # If both quiz_attempts and time_spent are empty, return empty preference df but keep categories
        if quiz_attempts_df.empty and time_spent_df.empty:
            # logging.info("No user interaction data found")
            # Return empty DataFrame but preserve user categories
            return pd.DataFrame(columns=['_id', 'category', 'article', 'preference_score']), {
                cat_info['category']: {
                    'weight': float(cat_info.get('weight', 0)),
                    'isInferred': bool(cat_info.get('isInferred', False))
                }
                for cat_info in user_preferred_categories
            }

        user_id_obj = ObjectId(user_id)
        current_date = datetime.now(pytz.utc)
        last_7_days = current_date - timedelta(days=7)
        last_3_days = current_date - timedelta(days=3)

        recent_article_ids = set(articles_df['_id'].astype(str))
        # logging.info(f"Number of recent articles: {len(recent_article_ids)}")

        # Initialize empty DataFrames for preferences
        quiz_preference = pd.DataFrame(columns=['article', 'preference_score'])
        time_preference = pd.DataFrame(columns=['article', 'preference_score'])

        # Process quiz attempts if they exist
        if not quiz_attempts_df.empty:
            user_quiz_attempts = quiz_attempts_df[
                (quiz_attempts_df['user'] == user_id_obj) &
                (quiz_attempts_df['article'].astype(str).isin(recent_article_ids))
            ].copy()
            # logging.info(f"Number of user quiz attempts: {len(user_quiz_attempts)}")

            if not user_quiz_attempts.empty:
                user_quiz_attempts['createdAt'] = pd.to_datetime(user_quiz_attempts['createdAt']).dt.tz_localize(pytz.UTC)
                user_quiz_attempts['preference_score'] = user_quiz_attempts['RQM_score'].astype(float)

                user_quiz_attempts.loc[user_quiz_attempts['createdAt'] >= last_7_days, 'preference_score'] *= 1.5
                user_quiz_attempts.loc[user_quiz_attempts['createdAt'] >= last_3_days, 'preference_score'] *= 2

                quiz_preference = user_quiz_attempts[['article', 'preference_score']]

        # Process time spent if they exist
        if not time_spent_df.empty:
            user_time_spent = time_spent_df[
                (time_spent_df['userId'] == user_id_obj) &
                (time_spent_df['articleId'].astype(str).isin(recent_article_ids))
            ].copy()
            # logging.info(f"Number of user time spent records: {len(user_time_spent)}")

            if not user_time_spent.empty:
                user_time_spent['date'] = pd.to_datetime(user_time_spent['date']).dt.tz_localize(pytz.UTC)
                user_time_spent['normalized_timeSpent'] = user_time_spent['timeSpent'] / user_time_spent['timeSpent'].max()
                user_time_spent['preference_score'] = user_time_spent['normalized_timeSpent'] * 2

                user_time_spent.loc[user_time_spent['date'] >= last_7_days, 'preference_score'] *= 1.5
                user_time_spent.loc[user_time_spent['date'] >= last_3_days, 'preference_score'] *= 2

                time_preference = user_time_spent[['articleId', 'preference_score']].rename(columns={'articleId': 'article'})

        # Combine preferences
        user_preference_df = pd.concat([quiz_preference, time_preference])

        if user_preference_df.empty:
            # Return empty DataFrame but preserve user categories
            return pd.DataFrame(columns=['_id', 'category', 'article', 'preference_score']), {
                cat_info['category']: {
                    'weight': float(cat_info.get('weight', 0)),
                    'isInferred': bool(cat_info.get('isInferred', False))
                }
                for cat_info in user_preferred_categories
            }

        user_preference_df = user_preference_df.groupby('article')['preference_score'].sum().reset_index()
        user_preference_df['article'] = user_preference_df['article'].astype(str)

        articles_df['_id'] = articles_df['_id'].astype(str)
        user_preference_df = articles_df[['_id', 'category']].merge(
            user_preference_df,
            left_on='_id',
            right_on='article',
            how='inner'
        )

        # Calculate category preferences
        inferred_categories = {}
        category_scores = user_preference_df.groupby('category')['preference_score'].sum()
        total_preference = category_scores.sum()

        if total_preference > 0:
            inferred_categories = (category_scores / total_preference).to_dict()

        # Calculate interaction factors
        total_interactions = len(quiz_preference) + len(time_preference)
        interaction_factor = min(total_interactions / 100, 1)

        # Process and combine categories
        combined_categories = {}
        for category_info in user_preferred_categories:
            try:
                category = category_info.get('category', '')
                weight = float(category_info.get('weight', 0))
                is_inferred = bool(category_info.get('isInferred', False))

                last_updated_str = category_info.get('lastUpdated')
                if last_updated_str:
                    try:
                        last_updated = datetime.fromisoformat(last_updated_str.replace('Z', '+00:00'))
                    except (ValueError, TypeError):
                        last_updated = current_date
                else:
                    last_updated = current_date

                days_since_update = (current_date - last_updated).days
                time_factor = max(0, 1 - (days_since_update * 0.01))

                if is_inferred:
                    adjusted_weight = weight * (1 + (interaction_factor * 0.5))
                else:
                    adjusted_weight = weight * time_factor * (1 - (interaction_factor * 0.5))

                combined_categories[category] = {
                    'weight': adjusted_weight,
                    'isInferred': is_inferred
                }
            except Exception as e:
                logging.warning(f"Error processing category info: {str(e)}")
                continue

        # Add inferred categories
        for category, score in inferred_categories.items():
            if category not in combined_categories:
                combined_categories[category] = {
                    'weight': score * interaction_factor,
                    'isInferred': True
                }

        # Normalize weights
        total_weight = sum(cat['weight'] for cat in combined_categories.values())
        if total_weight > 0:
            for category in combined_categories:
                combined_categories[category]['weight'] /= total_weight

        # logging.info(f"Combined categories: {combined_categories}")

        return user_preference_df, combined_categories

    except Exception as e:
        logging.error(f"Error calculating preference score: {str(e)}")
        raise

def calculate_sigmoid_kernel(tfv_matrix):
    try:
        tfv_matrix_sparse = csr_matrix(tfv_matrix)
        return sigmoid_kernel(tfv_matrix_sparse, tfv_matrix_sparse)
    except Exception as e:
        logging.error(f"Error calculating sigmoid kernel: {str(e)}")
        raise

def recommend_articles(user_id, articles_df, sig, quiz_attempts_df, time_spent_df, user_preferred_categories, num_recommendations=270):
    """
    Recommend articles with proper handling of empty preference data.
    Falls back to trending recommendations while preserving category preferences.
    """
    try:
        user_preference_df, updated_categories = calculate_preference_score(user_id, quiz_attempts_df, time_spent_df, articles_df, user_preferred_categories)

        # logging.info(f"User preference df shape: {user_preference_df.shape}")
        # logging.info(f"User preference df columns: {user_preference_df.columns}")
        # logging.info(f"User preference df non-zero scores: {len(user_preference_df[user_preference_df['preference_score'] > 0]) if not user_preference_df.empty else 0}")

        # Check if we have meaningful preference data
        if user_preference_df.empty or (not user_preference_df.empty and user_preference_df['preference_score'].sum() == 0):
            if user_preferred_categories:
                # logging.warning("No user interactions found. Recommending trending articles with category preferences.")
                recommendations = recommend_trending_articles(
                    articles_df,
                    quiz_attempts_df,
                    time_spent_df,
                    user_preferred_categories,
                    num_recommendations
                )
                # Return recommendations and preserve original category preferences
                return recommendations, {
                    cat_info['category']: {
                        'weight': float(cat_info.get('weight', 0)),
                        'isInferred': bool(cat_info.get('isInferred', False))
                    }
                    for cat_info in user_preferred_categories
                }
            else:
                # logging.warning("No user preferences or interactions found. Recommending general trending articles.")
                return recommend_trending_articles(articles_df, quiz_attempts_df, time_spent_df, None, num_recommendations), {}

        if not updated_categories and user_preferred_categories:
            # logging.warning("Using original category preferences for recommendations.")
            return recommend_trending_articles(articles_df, quiz_attempts_df, time_spent_df, user_preferred_categories, num_recommendations), {
                cat_info['category']: {
                    'weight': float(cat_info.get('weight', 0)),
                    'isInferred': bool(cat_info.get('isInferred', False))
                }
                for cat_info in user_preferred_categories
            }

        # Sort categories by weight and get top 5
        top_5_categories = sorted(updated_categories.items(), key=lambda x: x[1]['weight'], reverse=True)[:5]
        top_5_category_names = [cat for cat, _ in top_5_categories]

        # Calculate recommendation scores
        now = pd.Timestamp.now(tz='UTC')
        articles_df['dateTime'] = pd.to_datetime(articles_df['dateTime'], utc=True)
        days_old = (now - articles_df['dateTime']).dt.days.values
        time_decay = 1 / (1 + 0.1 * days_old)

        category_boost = articles_df['category'].map(lambda x: updated_categories.get(x, {'weight': 0})['weight']).values

        sig_subset = sig[:len(articles_df), :len(articles_df)]
        category_boost_2d = category_boost[:, np.newaxis]
        weighted_scores = (sig_subset * category_boost_2d).sum(axis=0)
        weighted_scores *= time_decay

        articles_df['final_score'] = weighted_scores

        # Select recommendations with category diversity
        main_recommendations = articles_df[articles_df['category'].isin(top_5_category_names)].nlargest(int(num_recommendations * 0.9), 'final_score')
        other_categories = set(articles_df['category']) - set(top_5_category_names)
        diverse_recommendations = articles_df[articles_df['category'].isin(other_categories)].nlargest(num_recommendations - len(main_recommendations), 'final_score')

        final_recommendations = pd.concat([main_recommendations, diverse_recommendations])
        final_recommendations = final_recommendations.sample(frac=1).reset_index(drop=True)

        return final_recommendations['_id'].astype(str).tolist()[:num_recommendations], updated_categories

    except Exception as e:
        logging.error(f"Error recommending articles: {str(e)}")
        raise

pd.set_option('future.no_silent_downcasting', True)
def recommend_trending_articles(articles_df, quiz_attempts_df, time_spent_df, user_preferred_categories=None, num_recommendations=270):
    """
    Recommend trending articles with category preferences consideration.
    If user_preferred_categories is provided, trending articles will be biased towards these categories.
    """
    try:
        # First handle quiz attempts
        quiz_attempts_count = pd.DataFrame()
        if not quiz_attempts_df.empty:
            quiz_attempts_count = quiz_attempts_df.groupby('article').size().reset_index(name='attempt_count')
        else:
            quiz_attempts_count = pd.DataFrame(columns=['article', 'attempt_count'])

        # Then handle time spent
        time_spent_sum = pd.DataFrame()
        if not time_spent_df.empty:
            time_spent_sum = time_spent_df.groupby('articleId')['timeSpent'].sum().reset_index(name='total_time_spent')
        else:
            time_spent_sum = pd.DataFrame(columns=['articleId', 'total_time_spent'])

        # Create trending dataframe
        trending_df = articles_df.copy()

        # Merge with quiz attempts
        trending_df = trending_df.merge(
            quiz_attempts_count,
            left_on='_id',
            right_on='article',
            how='left'
        )

        # Merge with time spent
        trending_df = trending_df.merge(
            time_spent_sum,
            left_on='_id',
            right_on='articleId',
            how='left'
        )

        # Convert columns to float and fill NaN values
        # Initialize columns as float type before filling NaN
        trending_df['attempt_count'] = trending_df['attempt_count'].astype('float64').fillna(0)
        trending_df['total_time_spent'] = trending_df['total_time_spent'].astype('float64').fillna(0)

        # Calculate normalized scores
        max_attempts = trending_df['attempt_count'].max()
        max_time_spent = trending_df['total_time_spent'].max()

        trending_df['normalized_attempts'] = 0 if max_attempts == 0 else trending_df['attempt_count'] / max_attempts
        trending_df['normalized_time'] = 0 if max_time_spent == 0 else trending_df['total_time_spent'] / max_time_spent

        trending_df['trending_score'] = (trending_df['normalized_attempts'] + trending_df['normalized_time']) / 2

        # Rest of the function remains the same...
        trending_df['dateTime'] = pd.to_datetime(trending_df['dateTime'])
        if trending_df['dateTime'].dt.tz is None:
            trending_df['dateTime'] = trending_df['dateTime'].dt.tz_localize('UTC')

        now = pd.Timestamp.now(tz='UTC')
        trending_df['days_old'] = (now - trending_df['dateTime']).dt.days
        trending_df['time_decay'] = 1 / (1 + 0.1 * trending_df['days_old'])

        if user_preferred_categories:
            category_weights = {cat_info['category']: float(cat_info.get('weight', 0))
                              for cat_info in user_preferred_categories}

            if category_weights:
                trending_df['category_boost'] = trending_df['category'].map(
                    lambda x: category_weights.get(x, 0)
                )
                max_boost = trending_df['category_boost'].max()
                if max_boost > 0:
                    trending_df['category_boost'] = trending_df['category_boost'] / max_boost

                trending_df['final_score'] = (trending_df['trending_score'] * 0.4 +
                                            trending_df['category_boost'] * 0.6) * trending_df['time_decay']
            else:
                trending_df['final_score'] = trending_df['trending_score'] * trending_df['time_decay']
        else:
            trending_df['final_score'] = trending_df['trending_score'] * trending_df['time_decay']

        if user_preferred_categories:
            preferred_categories = {cat_info['category'] for cat_info in user_preferred_categories}
            preferred_count = int(num_recommendations * 0.8)
            other_count = num_recommendations - preferred_count

            preferred_recommendations = trending_df[
                trending_df['category'].isin(preferred_categories)
            ].nlargest(preferred_count, 'final_score')

            other_recommendations = trending_df[
                ~trending_df['category'].isin(preferred_categories)
            ].nlargest(other_count, 'final_score')

            recommended_articles = pd.concat([preferred_recommendations, other_recommendations])
        else:
            recommended_articles = trending_df.nlargest(num_recommendations, 'final_score')

        recommended_articles = recommended_articles.sample(frac=1).reset_index(drop=True)

        return recommended_articles['_id'].astype(str).tolist()

    except Exception as e:
        logging.error(f"Error recommending trending articles: {str(e)}")
        raise

def update_recommendations_in_db(user_id, recommendations, updated_categories, mongo_uri):
    """
    Update recommendations and user preferred categories in the database.
    Ensures category preferences are preserved even without user interactions.
    """
    try:
        client = pymongo.MongoClient(mongo_uri)
        db = client.get_database("RapidRecap0")
        recommendation_collection = db.get_collection("recommendations")
        user_collection = db.get_collection("Users")

        # Update recommendations
        recommendation_collection.find_one_and_update(
            {"user_id": ObjectId(user_id)},
            {
                "$set": {
                    "recommendations": [
                        {"_id": rec, "served": False, "notified": False} for rec in recommendations
                    ],
                    "lastUpdated": datetime.now(pytz.utc),
                    "isUpdating": False,
                }
            },
            upsert=True
        )

        # Only update categories if they exist
        if updated_categories:
            current_date = datetime.now(pytz.utc)
            user_collection.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$set": {
                        "preferredCategories": [
                            {
                                "category": cat,
                                "weight": info['weight'],
                                "isInferred": info.get('isInferred', False),
                                "lastUpdated": current_date
                            }
                            for cat, info in updated_categories.items()
                        ]
                    }
                }
            )

        # logging.info(f"Updated recommendations and preferred categories for user {user_id}")
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
        if not isinstance(user_preferred_categories, list):
            user_preferred_categories = []

        mongo_uri = os.getenv("DATABASE")

        articles_df, quiz_attempts_df, time_spent_df = load_data_from_db(mongo_uri, user_id)
        # logging.info(f"Loaded data shapes: articles_df={articles_df.shape}, quiz_attempts_df={quiz_attempts_df.shape}, time_spent_df={time_spent_df.shape}")
        # logging.info(f"Articles df _id dtype: {articles_df['_id'].dtype}")
        # logging.info(f"Quiz attempts df article dtype: {quiz_attempts_df['article'].dtype}")
        # logging.info(f"Time spent df articleId dtype: {time_spent_df['articleId'].dtype}")

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
