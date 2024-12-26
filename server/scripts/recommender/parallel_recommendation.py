from multiprocessing import Pool, cpu_count
import logging
from typing import Dict, List
import time
from vector_search import get_category_recommendations
import pymongo
import pandas as pd
from collections import defaultdict

# Configure logger
logger = logging.getLogger('recommendation.parallel')

# Performance thresholds
PERFORMANCE_THRESHOLDS = {
    'CATEGORY_PROCESSING_TIME': 30,  # seconds
    'MIN_CATEGORY_RECOMMENDATIONS': 5,
    'MAX_PROCESSES': cpu_count() - 1,
    'MIN_TARGET_COUNT': 10
}

def process_category_parallel(category: str,
                            target_count: int,
                            mongo_uri: str,
                            user_preference_data: List[Dict],
                            trending_articles: List[Dict],
                            recommended_articles: List[Dict]) -> List[Dict]:
    """Process a single category in parallel with serializable arguments"""
    start_time = time.time()
    process_metrics = defaultdict(float)

    try:
        # Initialize MongoDB connection
        client = pymongo.MongoClient(mongo_uri)
        db = client.get_database("RapidRecap0")
        articles_collection = db.get_collection("Articles")

        # Convert and validate user preferences
        user_preference_df = pd.DataFrame(user_preference_data)
        if user_preference_df.empty:
            logger.error(f"Empty preference data for category {category}")
            return []

        # Get category interactions
        category_interactions = user_preference_df[
            user_preference_df['category'] == category
        ].nlargest(3, 'preference_score')

        if category_interactions.empty:
            logger.warning(f"No interactions found for category {category}")
            return []

        # Get recommendations
        process_metrics['processing_start'] = time.time()
        category_recommendations = get_category_recommendations(
            articles_collection,
            category_interactions,
            category,
            target_count,
            trending_articles,
            recommended_articles
        )
        process_metrics['processing_time'] = time.time() - process_metrics['processing_start']

        # Monitor recommendation quality
        if len(category_recommendations) < PERFORMANCE_THRESHOLDS['MIN_CATEGORY_RECOMMENDATIONS']:
            logger.warning(
                f"Low recommendation count for category {category}: "
                f"{len(category_recommendations)} recommendations"
            )

        # Monitor performance
        total_time = time.time() - start_time
        if total_time > PERFORMANCE_THRESHOLDS['CATEGORY_PROCESSING_TIME']:
            logger.warning(
                f"Slow category processing: {total_time:.2f}s for category {category}"
            )

        logger.info(
            f"Category metrics - Name: {category}, "
            f"Recommendations: {len(category_recommendations)}, "
            f"Processing time: {total_time:.2f}s"
        )

        return category_recommendations

    except Exception as e:
        logger.error(f"Critical error processing category {category}: {str(e)}",
                    exc_info=True)
        return []
    finally:
        try:
            client.close()
        except:
            pass

def get_recommendations_parallel(category_targets: Dict[str, int],
                               articles_collection,
                               user_preference_df: pd.DataFrame,
                               trending_articles: List[Dict],
                               recommended_articles: List[Dict],
                               mongo_uri: str) -> List[Dict]:
    """Get recommendations for all categories in parallel"""
    start_time = time.time()
    process_metrics = defaultdict(float)

    try:
        # Validate inputs
        if not category_targets:
            logger.error("No category targets provided")
            return []

        if user_preference_df.empty:
            logger.error("Empty user preference data")
            return []

        # Optimize process count
        num_processes = min(
            len(category_targets),
            PERFORMANCE_THRESHOLDS['MAX_PROCESSES']
        )

        # Prepare data for parallel processing
        try:
            user_preference_data = user_preference_df.to_dict('records')
        except Exception as e:
            logger.error(f"Error converting preference data: {str(e)}")
            return []

        # Monitor target distribution
        for category, target_count in category_targets.items():
            if target_count < PERFORMANCE_THRESHOLDS['MIN_TARGET_COUNT']:
                logger.warning(
                    f"Low target count for category {category}: {target_count}"
                )

        # Process categories in parallel
        with Pool(processes=num_processes) as pool:
            category_args = [
                (category, target_count, mongo_uri, user_preference_data,
                 trending_articles, recommended_articles)
                for category, target_count in category_targets.items()
            ]

            process_metrics['processing_start'] = time.time()
            results = pool.starmap(process_category_parallel, category_args)
            process_metrics['processing_time'] = time.time() - process_metrics['processing_start']

        # Process results
        flattened_results = [rec for category_recs in results for rec in category_recs]

        # Monitor results
        total_time = time.time() - start_time
        logger.info(
            f"Parallel processing complete - "
            f"Categories: {len(category_targets)}, "
            f"Recommendations: {len(flattened_results)}, "
            f"Processing time: {total_time:.2f}s"
        )

        return flattened_results

    except Exception as e:
        logger.error("Critical error in parallel processing", exc_info=True)
        return []
