import logging
import pandas as pd
import pytz
import pymongo
from datetime import datetime, timedelta
from bson import ObjectId

# Configure logger
logger = logging.getLogger('recommendation.db')

# Critical thresholds for monitoring
MIN_ARTICLES_THRESHOLD = 100
DB_OPERATION_TIMEOUT = 10  # seconds

def load_user_data(mongo_uri, user_id, days=30):
    """
    Load data from MongoDB with content vectors.
    Returns DataFrames with correct columns even when no data exists.
    """
    start_time = datetime.now()
    try:
        client = pymongo.MongoClient(mongo_uri)
        db = client.get_database("RapidRecap0")

        articles_collection = db.get_collection("Articles")
        quiz_attempts_collection = db.get_collection("quiz_attempts")
        time_spent_collection = db.get_collection("timespents")

        start_date = datetime.now(pytz.UTC) - timedelta(days=days)

        # Articles pipeline
        pipeline = [
            {
                "$match": {
                    "$and": [
                        {
                            "$or": [
                                {"dateTime": {"$gte": start_date.strftime("%Y-%m-%dT%H:%M:%SZ")}},
                                {"dateTime": {"$gte": start_date.strftime("%Y-%m-%d %H:%M:%S")}}
                            ]
                        },
                        {"contentVector": {"$exists": True}},
                        {"vectorized": True},
                        {"category": {"$ne": "onBoardingArticle"}}
                    ]
                }
            },
            {
                "$project": {
                    "_id": {"$toString": "$_id"},
                    "category": 1,
                    "dateTime": {"$toDate": "$dateTime"},
                }
            }
        ]

        # Monitor article data retrieval
        article_start = datetime.now()
        articles = list(articles_collection.aggregate(pipeline))
        articles_df = pd.DataFrame(articles)
        article_time = (datetime.now() - article_start).total_seconds()

        if article_time > DB_OPERATION_TIMEOUT:
            logger.warning(f"Slow article data retrieval: {article_time:.2f}s for user {user_id}")

        if len(articles_df) < MIN_ARTICLES_THRESHOLD:
            logger.warning(f"Low article count ({len(articles_df)}) for recommendations")

        # Quiz attempts with monitoring
        quiz_start = datetime.now()
        quiz_attempts = list(quiz_attempts_collection.find(
            {"user": ObjectId(user_id), "createdAt": {"$gte": start_date}},
            {"_id": 1, "user": 1, "article": {"$toString": "$article"}, "RQM_score": 1, "createdAt": 1}
        ))
        quiz_time = (datetime.now() - quiz_start).total_seconds()

        quiz_attempts_df = pd.DataFrame(quiz_attempts) if quiz_attempts else pd.DataFrame(
            columns=['_id', 'user', 'article', 'RQM_score', 'createdAt']
        )

        if not quiz_attempts_df.empty:
            quiz_attempts_df['article'] = quiz_attempts_df['article'].astype(str)

        # Time spent data with monitoring
        time_spent_start = datetime.now()
        time_spent = list(time_spent_collection.find(
            {"userId": ObjectId(user_id), "date": {"$gte": start_date}},
            {"_id": 1, "userId": 1, "articleId": {"$toString": "$articleId"}, "timeSpent": 1, "date": 1}
        ))
        time_spent_time = (datetime.now() - time_spent_start).total_seconds()

        time_spent_df = pd.DataFrame(time_spent) if time_spent else pd.DataFrame(
            columns=['_id', 'userId', 'articleId', 'timeSpent', 'date']
        )

        if not time_spent_df.empty:
           time_spent_df['articleId'] = time_spent_df['articleId'].astype(str)

        # Log critical metrics
        total_time = (datetime.now() - start_time).total_seconds()
        if total_time > DB_OPERATION_TIMEOUT:
            logger.warning(f"Total data load time exceeded threshold: {total_time:.2f}s")

        logger.info(f"Data load metrics - User: {user_id}, "
                   f"Articles: {len(articles_df)}, "
                   f"Quiz attempts: {len(quiz_attempts_df)}, "
                   f"Time spent records: {len(time_spent_df)}, "
                   f"Total time: {total_time:.2f}s")

        return articles_df, quiz_attempts_df, time_spent_df

    except Exception as e:
        logger.error(f"Critical error loading data for user {user_id}: {str(e)}", exc_info=True)
        raise

def update_recommendations(mongo_uri, user_id, recommendations, updated_categories):
    """
    Update recommendations and user preferred categories in the database.
    """
    start_time = datetime.now()
    try:
        client = pymongo.MongoClient(mongo_uri)
        db = client.get_database("RapidRecap0")
        recommendation_collection = db.get_collection("recommendations")
        user_collection = db.get_collection("Users")

        # Update recommendations with monitoring
        rec_start = datetime.now()
        result = recommendation_collection.find_one_and_update(
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
        rec_time = (datetime.now() - rec_start).total_seconds()

        if rec_time > DB_OPERATION_TIMEOUT:
            logger.warning(f"Slow recommendation update: {rec_time:.2f}s for user {user_id}")

        # Update categories if they exist
        if updated_categories:
            cat_start = datetime.now()
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
            cat_time = (datetime.now() - cat_start).total_seconds()

            if cat_time > DB_OPERATION_TIMEOUT:
                logger.warning(f"Slow category update: {cat_time:.2f}s for user {user_id}")

        total_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"Update metrics - User: {user_id}, "
                   f"Recommendations: {len(recommendations)}, "
                   f"Categories: {len(updated_categories) if updated_categories else 0}, "
                   f"Total time: {total_time:.2f}s")

    except Exception as e:
        logger.error(f"Critical error updating recommendations for user {user_id}: {str(e)}",
                    exc_info=True)
        raise
