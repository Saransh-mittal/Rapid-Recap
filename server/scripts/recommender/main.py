import sys
import json
import os
import logging
from dotenv import load_dotenv
import pymongo
import time

# Add parent directory to Python path to enable imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from db_operations import load_user_data, update_recommendations
from recommendation_engine import (recommend_articles_with_vector_search,
                                 recommend_articles_for_new_users)

# Configure production logging with timestamp and level
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [%(name)s] - %(message)s',
    stream=sys.stdout  # This is the key change to print to stdout
)
logger = logging.getLogger('recommendation_system')

def main():
    """
    Main recommendation system entry point.
    Handles user data loading, recommendation generation, and database updates.
    """
    start_time = time.time()

    try:
        # Initialize system
        base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        dotenv_path = os.path.join(base_path, 'config.env')
        load_dotenv(dotenv_path=dotenv_path)

        # Validate inputs
        if len(sys.argv) < 3:
            raise ValueError("Missing required arguments: user_id and preferences")

        user_id = sys.argv[1]
        user_preferred_categories = json.loads(sys.argv[2])
        if not isinstance(user_preferred_categories, list):
            user_preferred_categories = []

        # Monitor environment setup
        mongo_uri = os.getenv("DATABASE")
        if not mongo_uri:
            logger.error("Critical configuration error: DATABASE environment variable not set")
            raise ValueError("DATABASE environment variable not set")

        # Load user data with performance monitoring
        data_load_start = time.time()
        articles_df, quiz_attempts_df, time_spent_df = load_user_data(mongo_uri, user_id)
        data_load_time = time.time() - data_load_start

        # Monitor data quality
        if len(articles_df) == 0:
            logger.error(f"No vectorized articles available for user {user_id}")
            print(json.dumps({"status": "error", "message": "No vectorized articles available"}))
            sys.exit(1)

        # Log critical metrics for data availability
        logger.info(f"Data metrics - Articles: {len(articles_df)}, "
                   f"Quiz attempts: {len(quiz_attempts_df)}, "
                   f"Time spent records: {len(time_spent_df)}, "
                   f"Load time: {data_load_time:.2f}s")

        if data_load_time > 10:  # Alert on slow data loading
            logger.warning(f"Slow data loading detected: {data_load_time:.2f}s for user {user_id}")

        # Initialize database connections
        client = pymongo.MongoClient(mongo_uri)
        db = client.get_database("RapidRecap0")
        articles_collection = db.get_collection("Articles")
        time_spent_collection = db.get_collection("timespents")

        # Generate recommendations with monitoring
        rec_start_time = time.time()

        if time_spent_df.empty:
            logger.info(f"New user detected: {user_id}")
            recommendations = recommend_articles_for_new_users(
                articles_collection,
                user_preferred_categories,
                270
            )
            updated_categories = {
                cat_info['category']: {
                    'weight': float(cat_info.get('weight', 0)),
                    'isInferred': bool(cat_info.get('isInferred', False))
                }
                for cat_info in user_preferred_categories
            }
        else:
            recommendations, updated_categories = recommend_articles_with_vector_search(
                user_id,
                articles_df,
                quiz_attempts_df,
                time_spent_df,
                user_preferred_categories,
                370,
                mongo_uri,
            )

        rec_time = time.time() - rec_start_time

        # Monitor recommendation generation performance
        if rec_time > 20:  # Alert on slow recommendation generation
            logger.warning(f"Slow recommendation generation: {rec_time:.2f}s for user {user_id}")

        # Update recommendations and monitor results
        if recommendations:
            update_start = time.time()
            update_recommendations(mongo_uri, user_id, recommendations, updated_categories)
            update_time = time.time() - update_start

            # Log success metrics
            logger.info(f"Recommendation metrics - Count: {len(recommendations)}, "
                       f"Generation time: {rec_time:.2f}s, "
                       f"Update time: {update_time:.2f}s, "
                       f"Categories: {len(updated_categories)}")

            print(json.dumps({
                "status": "success",
                "message": "Recommendations updated successfully",
                "count": len(recommendations)
            }))
        else:
            logger.error(f"Failed to generate recommendations for user {user_id}")
            print(json.dumps({"status": "error", "message": "No recommendations generated"}))

        # Monitor total execution time
        total_time = time.time() - start_time
        if total_time > 30:  # Alert on overall slow execution
            logger.warning(f"High total execution time: {total_time:.2f}s for user {user_id}")

    except Exception as e:
        logger.error(f"Critical system error for user {user_id}: {str(e)}", exc_info=True)
        print(json.dumps({"status": "error", "message": str(e)}))
        raise

if __name__ == "__main__":
    main()
