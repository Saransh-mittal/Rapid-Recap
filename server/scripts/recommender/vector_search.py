import logging
from datetime import datetime
import pytz
from bson import ObjectId
import numpy as np
import pandas as pd
from collections import defaultdict

# Configure logger
logger = logging.getLogger('recommendation.vector')

# Performance thresholds
VECTOR_THRESHOLDS = {
    'MIN_TARGET_COUNT': 5,
    'MAX_CANDIDATES_MULTIPLIER': 3,
    'MIN_VECTOR_SCORE': 0.3,
    'MAX_SEARCH_TIME': 5,  # seconds
    'TIME_DECAY_FACTOR': 0.1
}

def normalize_id(id_value):
    """Safely normalize ID to string format"""
    try:
        if isinstance(id_value, ObjectId):
            return str(id_value)
        if isinstance(id_value, str):
            return id_value.strip()
        return ""
    except Exception as e:
        logger.error(f"Error normalizing ID {id_value}: {str(e)}")
        return ""

def get_article_vector(articles_collection, article_id):
    """Retrieve content vector for an article"""
    start_time = datetime.now()
    try:
        result = articles_collection.find_one(
            {"_id": ObjectId(article_id)},
            {"contentVector": 1}
        )

        if not result:
            logger.warning(f"No vector found for article {article_id}")
            return None

        vector = result.get("contentVector")
        if not vector or len(vector) == 0:
            logger.warning(f"Empty vector for article {article_id}")
            return None

        process_time = (datetime.now() - start_time).total_seconds()
        if process_time > 1:
            logger.warning(f"Slow vector retrieval: {process_time:.2f}s for article {article_id}")

        return vector

    except Exception as e:
        logger.error(f"Error retrieving vector for article {article_id}: {str(e)}")
        return None

def perform_vector_search(articles_collection, query_vector, category, excluded_ids, limit):
    """Execute vector search with performance monitoring"""
    start_time = datetime.now()
    metrics = defaultdict(int)

    try:
        now = datetime.now(pytz.UTC)
        normalized_excluded = {normalize_id(id_) for id_ in excluded_ids if id_}
        excluded_object_ids = [
            ObjectId(id_) for id_ in normalized_excluded
            if id_ and ObjectId.is_valid(id_)
        ]

        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "contentVector",
                    "queryVector": query_vector,
                    "numCandidates": limit * VECTOR_THRESHOLDS['MAX_CANDIDATES_MULTIPLIER'],
                    "limit": limit * VECTOR_THRESHOLDS['MAX_CANDIDATES_MULTIPLIER']
                }
            },
            {
                "$match": {
                    "category": category,
                    "_id": {"$nin": excluded_object_ids}
                }
            },
            {
                "$addFields": {
                    "daysOld": {
                        "$divide": [
                            {"$subtract": [now, {"$toDate": "$dateTime"}]},
                            1000 * 60 * 60 * 24
                        ]
                    }
                }
            },
            {
                "$addFields": {
                    "timeDecay": {
                        "$divide": [
                            1,
                            {"$add": [1, {"$multiply": [
                                VECTOR_THRESHOLDS['TIME_DECAY_FACTOR'],
                                "$daysOld"
                            ]}]}
                        ]
                    },
                    "vectorScore": {"$meta": "vectorSearchScore"}
                }
            },
            {
                "$addFields": {
                    "finalScore": {"$multiply": ["$vectorScore", "$timeDecay"]}
                }
            },
            {"$sort": {"finalScore": -1}},
            {"$limit": limit}
        ]

        # Execute search
        results = list(articles_collection.aggregate(pipeline))
        metrics['total_results'] = len(results)

        # Validate results
        final_results = []
        result_ids = set()

        for result in results:
            result_id = normalize_id(result['_id'])
            if result_id and result_id not in normalized_excluded and result_id not in result_ids:
                if result.get('vectorScore', 0) >= VECTOR_THRESHOLDS['MIN_VECTOR_SCORE']:
                    result_ids.add(result_id)
                    final_results.append(result)
                else:
                    metrics['low_score_filtered'] += 1

        metrics['final_count'] = len(final_results)
        process_time = (datetime.now() - start_time).total_seconds()

        if process_time > VECTOR_THRESHOLDS['MAX_SEARCH_TIME']:
            logger.warning(f"Slow vector search: {process_time:.2f}s")

        if metrics['final_count'] < VECTOR_THRESHOLDS['MIN_TARGET_COUNT']:
            logger.warning(
                f"Low recommendation count for category {category}: "
                f"{metrics['final_count']} results"
            )

        logger.info(
            f"Vector search complete - "
            f"Category: {category}, "
            f"Results: {metrics['final_count']}, "
            f"Filtered: {metrics['low_score_filtered']}, "
            f"Time: {process_time:.2f}s"
        )

        return final_results[:limit]

    except Exception as e:
        logger.error(f"Critical error in vector search: {str(e)}", exc_info=True)
        return []

def get_category_recommendations(articles_collection, category_interactions,
                               category, target_count, trending_articles,
                               existing_recommendations):
    """Get recommendations for a specific category"""
    start_time = datetime.now()
    metrics = defaultdict(int)

    try:
        # Process exclusions
        interaction_ids = {
            normalize_id(id_) for id_ in category_interactions["_id"].values
            if pd.notna(id_)
        }
        existing_ids = {
            normalize_id(rec["_id"]) for rec in existing_recommendations
        }
        trending_ids = {
            normalize_id(article["_id"]) for article in trending_articles
        }

        excluded_ids = interaction_ids | existing_ids | trending_ids
        metrics.update({
            'interaction_exclusions': len(interaction_ids),
            'existing_exclusions': len(existing_ids),
            'trending_exclusions': len(trending_ids),
            'total_exclusions': len(excluded_ids)
        })

        # Get recommendations
        if not category_interactions.empty:
            article = category_interactions.iloc[0]
            vector = get_article_vector(articles_collection, article["_id"])

            if vector:
                recommendations = perform_vector_search(
                    articles_collection,
                    vector,
                    category,
                    excluded_ids,
                    target_count
                )
            else:
                logger.error(f"No vector available for category {category}")
                return []
        else:
            logger.warning(f"No interactions for category {category}")
            return []

        process_time = (datetime.now() - start_time).total_seconds()
        logger.info(
            f"Category recommendations complete - "
            f"Category: {category}, "
            f"Recommendations: {len(recommendations)}, "
            f"Exclusions: {metrics['total_exclusions']}, "
            f"Time: {process_time:.2f}s"
        )

        return recommendations

    except Exception as e:
        logger.error(f"Error getting category recommendations: {str(e)}",
                    exc_info=True)
        return []

def get_diverse_recommendations(articles_collection, count, trending_articles,
                              recommended_articles, excluded_categories):
    """Get diverse recommendations with monitoring"""
    start_time = datetime.now()
    metrics = defaultdict(int)

    try:
        excluded_ids = {
            normalize_id(rec["_id"])
            for rec in trending_articles + recommended_articles
        }
        metrics['excluded_ids'] = len(excluded_ids)

        pipeline = [
            {
                "$match": {
                    "category": {"$nin": list(excluded_categories)},
                    "_id": {"$nin": [
                        ObjectId(id_) for id_ in excluded_ids
                        if id_ and ObjectId.is_valid(id_)
                    ]}
                }
            },
            {"$sample": {"size": count}}
        ]

        results = list(articles_collection.aggregate(pipeline))
        metrics['results'] = len(results)

        process_time = (datetime.now() - start_time).total_seconds()
        logger.info(
            f"Diverse recommendations complete - "
            f"Results: {metrics['results']}, "
            f"Excluded categories: {len(excluded_categories)}, "
            f"Excluded IDs: {metrics['excluded_ids']}, "
            f"Time: {process_time:.2f}s"
        )

        return results

    except Exception as e:
        logger.error(f"Error getting diverse recommendations: {str(e)}",
                    exc_info=True)
        return []
