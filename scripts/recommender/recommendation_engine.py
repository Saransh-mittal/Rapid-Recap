import logging
import random
import time
from datetime import datetime
import pytz
import pandas as pd
import pymongo
from typing import Dict, List, Tuple
from collections import defaultdict
from scoring import (normalize_scores, sort_recommendations,
                    calculate_new_user_score)
from utils import log_recommendation_statistics
from trending_articles import get_trending_articles
from preference_calculator import calculate_preference_score
from parallel_recommendation import get_recommendations_parallel


# Configure logger
logger = logging.getLogger('recommendation.engine')

# Critical thresholds
RECOMMENDATION_THRESHOLDS = {
    'MIN_RECOMMENDATIONS': 50,
    'MAX_CATEGORY_PERCENTAGE': 0.25,
    'MIN_CATEGORY_PERCENTAGE': 0.05,
    'TRENDING_PERCENTAGE': 0.10,
    'MAX_PROCESS_TIME': 30,  # seconds
    'MIN_ARTICLES_PER_CATEGORY': 5
}

def validate_recommendations(recommendations: List[Dict],
                          user_preference_df: pd.DataFrame,
                          existing_recommendations: List[Dict],
                          trending_articles: List[Dict]) -> Tuple[bool, Dict]:
    """Validate recommendations against exclusions"""
    validation_stats = defaultdict(int)
    start_time = time.time()

    try:
        # Process interaction IDs
        interaction_ids = set(str(id_) for id_ in user_preference_df['_id'].dropna().astype(str).values)
        existing_ids = set(str(rec['_id']) for rec in existing_recommendations if '_id' in rec)
        trending_ids = set(str(article['_id']) for article in trending_articles if '_id' in article)
        recommendation_ids = set(str(rec['_id']) for rec in recommendations if '_id' in rec)

        # Calculate violations
        interaction_violations = interaction_ids & recommendation_ids
        existing_violations = existing_ids & recommendation_ids
        trending_overlaps = trending_ids & recommendation_ids

        # Update validation stats
        validation_stats.update({
            'total_recommendations': len(recommendation_ids),
            'interaction_violations': len(interaction_violations),
            'existing_violations': len(existing_violations),
            'trending_overlaps': len(trending_overlaps),
            'validation_time': time.time() - start_time
        })

        # Monitor category distribution
        category_counts = defaultdict(int)
        for rec in recommendations:
            category_counts[rec.get('category', 'unknown')] += 1

        # Log critical issues
        if interaction_violations:
            logger.error(f"Recommendation validation failed - {len(interaction_violations)} interaction violations")

        if existing_violations:
            logger.error(f"Recommendation validation failed - {len(existing_violations)} existing recommendation violations")

        for category, count in category_counts.items():
            percentage = count / len(recommendations) if recommendations else 0
            if percentage > RECOMMENDATION_THRESHOLDS['MAX_CATEGORY_PERCENTAGE']:
                logger.warning(f"Category imbalance: {category} ({percentage:.1%})")

        is_valid = len(interaction_violations) == 0 and len(existing_violations) == 0
        return is_valid, dict(validation_stats)

    except Exception as e:
        logger.error(f"Validation error: {str(e)}", exc_info=True)
        return False, dict(validation_stats)

def recommend_articles_with_vector_search(user_id, articles_df, quiz_attempts_df,
                                        time_spent_df, user_preferred_categories,
                                        num_recommendations=270, mongo_uri=None):
    """Generate personalized article recommendations"""
    start_time = time.time()
    process_metrics = defaultdict(float)

    try:
        # Initialize recommendation parameters
        trending_count = int(num_recommendations * RECOMMENDATION_THRESHOLDS['TRENDING_PERCENTAGE'])
        remaining_count = num_recommendations - trending_count
        user_id = str(user_id)

        # Get user preferences
        pref_start = time.time()
        user_preference_df, updated_categories = calculate_preference_score(
            user_id, quiz_attempts_df, time_spent_df, articles_df, user_preferred_categories
        )
        process_metrics['preference_time'] = time.time() - pref_start

        # Get trending articles
        trending_start = time.time()
        client = pymongo.MongoClient(mongo_uri)
        db = client.get_database("RapidRecap0")
        articles_collection = db.get_collection("Articles")
        trending_articles = get_trending_articles(articles_collection, trending_count)
        process_metrics['trending_time'] = time.time() - trending_start

        # Handle empty preferences case
        if user_preference_df.empty:
            logger.info(f"New user recommendation path for user {user_id}")
            return handle_new_user_recommendations(
                trending_articles, user_preferred_categories,
                num_recommendations, articles_collection
            )

        # Generate recommendations
        rec_start = time.time()
        recommended_articles = get_recommendations_parallel(
            calculate_category_targets(
                updated_categories, remaining_count,
                RECOMMENDATION_THRESHOLDS['MIN_CATEGORY_PERCENTAGE'],
                RECOMMENDATION_THRESHOLDS['MAX_CATEGORY_PERCENTAGE']
            ),
            articles_collection,
            user_preference_df,
            trending_articles,
            [],
            mongo_uri
        )
        process_metrics['recommendation_time'] = time.time() - rec_start

        # Validation and processing
        final_recommendations = trending_articles + recommended_articles
        is_valid, validation_stats = validate_recommendations(
            final_recommendations,
            user_preference_df,
            [],
            trending_articles
        )

        # Filter invalid recommendations if necessary
        if not is_valid:
            logger.warning("Filtering invalid recommendations")
            final_recommendations = filter_invalid_recommendations(
                final_recommendations,
                user_preference_df
            )

        # Process final recommendations
        final_recommendations = normalize_scores(final_recommendations)
        final_recommendations = sort_recommendations(
            final_recommendations,
            trending_articles
        )

        # Monitor performance
        total_time = time.time() - start_time
        if total_time > RECOMMENDATION_THRESHOLDS['MAX_PROCESS_TIME']:
            logger.warning(f"Slow recommendation generation: {total_time:.2f}s")

        logger.info(f"Recommendation metrics - "
                   f"User: {user_id}, "
                   f"Total time: {total_time:.2f}s, "
                   f"Recommendations: {len(final_recommendations)}, "
                   f"Categories: {len(updated_categories)}")
        # Log final statistics
        # log_recommendation_statistics(
        #     final_recommendations,
        #     trending_count,
        #     articles_df,
        #     start_time
        # )
        return ([str(article['_id']) for article in final_recommendations[:num_recommendations]],
                updated_categories)

    except Exception as e:
        logger.error(f"Critical recommendation error: {str(e)}", exc_info=True)
        return handle_recommendation_failure(
            user_id, user_preferred_categories,
            num_recommendations, mongo_uri
        )

def recommend_articles_for_new_users(articles_collection, user_preferred_categories,
                                   num_recommendations):
    """Generate recommendations for new users"""
    start_time = time.time()
    process_metrics = defaultdict(float)

    try:
        # Filter categories
        non_inferred_categories = [
            cat['category'] for cat in user_preferred_categories
            if not cat.get('isInferred', False)
        ]

        if not non_inferred_categories:
            logger.warning("No non-inferred categories found for new user")
            return []

        # Calculate distribution
        num_preferred = int(num_recommendations * 0.8)
        num_other = num_recommendations - num_preferred

        # Get articles
        preferred_start = time.time()
        preferred_articles = get_scored_articles_by_category(
            articles_collection,
            non_inferred_categories,
            num_preferred
        )
        process_metrics['preferred_time'] = time.time() - preferred_start

        other_start = time.time()
        other_categories = [
            cat for cat in set(articles_collection.find(
                {}, {"category": 1}).distinct('category')
            ) if cat not in non_inferred_categories
        ]
        other_articles = get_scored_articles_by_category(
            articles_collection,
            other_categories,
            num_other
        )
        process_metrics['other_time'] = time.time() - other_start

        # Process articles
        combined_articles = preferred_articles + other_articles
        if not combined_articles:
            logger.error("No articles found for new user")
            return []

        # Score and sort
        scoring_start = time.time()
        scored_articles = [
            calculate_new_user_score(article)
            for article in combined_articles
        ]
        sorted_articles = sorted(
            scored_articles,
            key=lambda x: x['score'],
            reverse=True
        )
        process_metrics['scoring_time'] = time.time() - scoring_start

        # Shuffle to prevent category clumping
        random.shuffle(sorted_articles)

        # Monitor recommendations
        total_time = time.time() - start_time
        logger.info(f"New user recommendation metrics - "
                   f"Articles: {len(sorted_articles)}, "
                   f"Categories: {len(non_inferred_categories)}, "
                   f"Processing time: {total_time:.2f}s")

        return [str(article['_id']) for article in sorted_articles[:num_recommendations]]

    except Exception as e:
        logger.error(f"Error in new user recommendations: {str(e)}", exc_info=True)
        return []

def get_scored_articles_by_category(articles_collection, categories, num_articles):
    """Get and score articles for each category"""
    if not categories:
        return []

    start_time = time.time()
    articles = []

    try:
        num_categories = len(categories)
        articles_per_category = num_articles // num_categories
        remaining_articles = num_articles
        now = datetime.now(pytz.UTC)

        for i, category in enumerate(categories):
            target_count = (
                articles_per_category
                if i < num_categories - 1
                else remaining_articles
            )

            pipeline = [
                {"$match": {"category": category}},
                {
                    "$addFields": {
                        "daysOld": {
                            "$divide": [
                                {"$subtract": [now, {"$dateFromString": {
                                    "dateString": "$dateTime",
                                    "onError": now
                                }}]},
                                1000 * 60 * 60 * 24
                            ]
                        }
                    }
                },
                {"$sort": {"daysOld": 1}},
                {"$limit": target_count},
                {
                    "$lookup": {
                        "from": "timespents",
                        "localField": "_id",
                        "foreignField": "articleId",
                        "as": "timeSpentData"
                    }
                },
                {
                    "$addFields": {
                        "totalTimeSpent": {
                            "$ifNull": [{"$sum": "$timeSpentData.timeSpent"}, 0]
                        }
                    }
                },
                {
                    "$project": {
                        "_id": 1,
                        "category": 1,
                        "dateTime": 1,
                        "daysOld": 1,
                        "totalTimeSpent": 1
                    }
                }
            ]

            category_articles = list(articles_collection.aggregate(pipeline))

            if len(category_articles) < RECOMMENDATION_THRESHOLDS['MIN_ARTICLES_PER_CATEGORY']:
                logger.warning(f"Low article count for category {category}: "
                             f"{len(category_articles)} articles")

            articles.extend(category_articles)
            remaining_articles -= len(category_articles)

            if remaining_articles <= 0:
                break

        process_time = time.time() - start_time
        logger.info(f"Article scoring completed - Categories: {len(categories)}, "
                   f"Articles: {len(articles)}, Time: {process_time:.2f}s")

        return articles

    except Exception as e:
        logger.error(f"Error scoring articles: {str(e)}", exc_info=True)
        return []

def handle_new_user_recommendations(trending_articles, user_preferred_categories,
                                  num_recommendations, articles_collection):
    """Handle recommendations for new users"""
    logger.info("Processing new user recommendations")
    start_time = time.time()

    try:
        trending_categories = set(article['category'] for article in trending_articles)
        preferred_categories = set(cat['category'] for cat in user_preferred_categories)

        filtered_trending = [
            article for article in trending_articles
            if article['category'] in preferred_categories.union(trending_categories)
        ]

        if not filtered_trending:
            logger.warning("No trending articles match user preferences")

        recommendations = [str(article['_id']) for article in filtered_trending[:num_recommendations]]

        if len(recommendations) < RECOMMENDATION_THRESHOLDS['MIN_RECOMMENDATIONS']:
            logger.warning(f"Insufficient recommendations ({len(recommendations)}). "
                         "Falling back to new user system.")
            return recommend_articles_for_new_users(
                articles_collection,
                user_preferred_categories,
                num_recommendations
            )

        process_time = time.time() - start_time
        logger.info(f"New user recommendations generated in {process_time:.2f}s")

        return recommendations, {
            cat_info['category']: {
                'weight': float(cat_info.get('weight', 0)),
                'isInferred': bool(cat_info.get('isInferred', False))
            }
            for cat_info in user_preferred_categories
        }

    except Exception as e:
        logger.error(f"Error in new user recommendations: {str(e)}", exc_info=True)
        raise

def calculate_category_targets(updated_categories, remaining_count, min_percentage, max_percentage):
    """Calculate target distribution for each category"""
    start_time = time.time()

    try:
        # Sort categories by weight
        sorted_categories = sorted(
            updated_categories.items(),
            key=lambda x: x[1]['weight'],
            reverse=True
        )

        # Calculate minimum and maximum counts
        min_per_category = int(remaining_count * min_percentage)
        max_per_category = int(remaining_count * max_percentage)

        # Calculate initial targets
        total_weight = sum(info['weight'] for _, info in sorted_categories)
        initial_targets = {
            cat: max(
                min_per_category,
                min(
                    max_per_category,
                    int(remaining_count * (info['weight'] / total_weight))
                )
            )
            for cat, info in sorted_categories
            if info['weight'] > 0.01
        }

        # Adjust targets
        target_sum = sum(initial_targets.values())
        if target_sum != remaining_count:
            adjustment_factor = remaining_count / target_sum
            category_targets = {
                cat: max(min_per_category,
                        min(max_per_category,
                            int(count * adjustment_factor)))
                for cat, count in initial_targets.items()
            }

            # Distribute remaining slots
            remaining_slots = remaining_count - sum(category_targets.values())
            if remaining_slots > 0:
                for cat in sorted(category_targets, key=lambda x: category_targets[x]):
                    if category_targets[cat] < max_per_category:
                        category_targets[cat] += 1
                        remaining_slots -= 1
                    if remaining_slots == 0:
                        break
        else:
            category_targets = initial_targets

        # Monitor category distribution
        for category, target in category_targets.items():
            percentage = target / remaining_count
            if percentage > max_percentage:
                logger.warning(f"Category {category} exceeds maximum percentage: {percentage:.1%}")
            elif percentage < min_percentage:
                logger.warning(f"Category {category} below minimum percentage: {percentage:.1%}")

        process_time = time.time() - start_time
        logger.info(f"Category distribution calculated in {process_time:.2f}s")

        return category_targets

    except Exception as e:
        logger.error(f"Error calculating category targets: {str(e)}", exc_info=True)
        raise

def filter_invalid_recommendations(recommendations, user_preference_df):
    """Filter out invalid recommendations"""
    try:
        allowed_ids = set(rec['_id'] for rec in recommendations) - \
                     set(id_ for id_ in user_preference_df['_id'].values if pd.notna(id_))

        filtered_recommendations = [
            rec for rec in recommendations
            if rec['_id'] in allowed_ids
        ]

        removed_count = len(recommendations) - len(filtered_recommendations)
        if removed_count > 0:
            logger.warning(f"Filtered out {removed_count} invalid recommendations")

        return filtered_recommendations

    except Exception as e:
        logger.error(f"Error filtering recommendations: {str(e)}", exc_info=True)
        return recommendations

def handle_recommendation_failure(user_id, user_preferred_categories, num_recommendations, mongo_uri):
    """Handle recommendation system failures gracefully"""
    try:
        logger.error("Main recommendation system failed. Attempting fallback...")

        client = pymongo.MongoClient(mongo_uri)
        db = client.get_database("RapidRecap0")
        articles_collection = db.get_collection("Articles")

        fallback_recommendations = recommend_articles_for_new_users(
            articles_collection,
            user_preferred_categories,
            num_recommendations
        )

        if fallback_recommendations:
            logger.info("Successfully generated fallback recommendations")
            return fallback_recommendations, {
                cat_info['category']: {
                    'weight': float(cat_info.get('weight', 0)),
                    'isInferred': bool(cat_info.get('isInferred', False))
                }
                for cat_info in user_preferred_categories
            }
        else:
            logger.error("Fallback recommendation generation failed")
            return [], {}

    except Exception as e:
        logger.error(f"Critical error in fallback system: {str(e)}", exc_info=True)
        return [], {}
