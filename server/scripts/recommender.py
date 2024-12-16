import sys
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import pytz
from bson import ObjectId
import pymongo
from dotenv import load_dotenv
import os
import logging
import random
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_data_from_db(mongo_uri, user_id):
    """
    Load data from MongoDB with content vectors.
    Returns DataFrames with correct columns even when no data exists.
    """
    try:
        client = pymongo.MongoClient(mongo_uri)
        db = client.get_database("RapidRecap0")
        logging.info("Connected to database")
        articles_collection = db.get_collection("Articles")
        quiz_attempts_collection = db.get_collection("quiz_attempts")
        time_spent_collection = db.get_collection("timespents")

        start_date = datetime.now(pytz.UTC) - timedelta(days=30)
        logging.info(f"Loading data for user {user_id} since {start_date}")
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
                        {"category": {"$ne": "onBoardingArticle"}}  # Exclude onBoardingArticle articles
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

        logging.info("Starting articles aggregation pipeline")
        articles = list(articles_collection.aggregate(pipeline))
        articles_df = pd.DataFrame(articles)
        logging.info(f"Found {len(articles_df)} articles")
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
        logging.info(f"Found {len(quiz_attempts_df)} quiz attempts and {len(time_spent_df)} time spent records")
        return articles_df, quiz_attempts_df, time_spent_df

    except Exception as e:
        logging.error(f"Error loading data from database: {str(e)}")
        raise

def calculate_preference_score(user_id, quiz_attempts_df, time_spent_df, articles_df, user_preferred_categories):
    """
    Calculate user preference scores with dynamic category weighting and enhanced time-based recency
    """
    try:
        logging.info("\nStarting Enhanced Preference Score Calculation")

        # Time windows and weights for recency
        time_weights = {
            1: 2.0,     # Last 24 hours: 200% weight
            3: 1.5,     # 2-3 days ago: 150% weight
            7: 1.2,     # 4-7 days ago: 120% weight
            14: 1.0,    # 8-14 days ago: normal weight
            30: 0.8     # 15-30 days ago: 80% weight
        }

        # If no interaction data, return original preferences
        if quiz_attempts_df.empty and time_spent_df.empty:
            return pd.DataFrame(columns=['_id', 'category', 'article', 'preference_score', 'recency_weight']), {
                cat_info['category']: {
                    'weight': float(cat_info.get('weight', 0)),
                    'isInferred': bool(cat_info.get('isInferred', False))
                }
                for cat_info in user_preferred_categories
            }

        user_id_obj = ObjectId(user_id)
        current_date = datetime.now(pytz.UTC)
        recent_article_ids = set(articles_df['_id'].astype(str))

        # Process quiz attempts with enhanced recency weighting
        quiz_preference = pd.DataFrame(columns=['article', 'preference_score', 'date', 'time_weight'])
        if not quiz_attempts_df.empty:
            user_quiz_attempts = quiz_attempts_df[
                (quiz_attempts_df['user'] == user_id_obj) &
                (quiz_attempts_df['article'].astype(str).isin(recent_article_ids))
            ].copy()

            if not user_quiz_attempts.empty:
                # Ensure timezone awareness for createdAt
                user_quiz_attempts['createdAt'] = pd.to_datetime(user_quiz_attempts['createdAt']).dt.tz_localize(pytz.UTC)

                # Calculate days ago
                user_quiz_attempts['days_ago'] = (current_date - user_quiz_attempts['createdAt']).dt.days

                # Apply time weights
                user_quiz_attempts['time_weight'] = user_quiz_attempts['days_ago'].apply(
                    lambda x: next((w for d, w in sorted(time_weights.items(), reverse=True) if x <= d), 0.5)
                )

                # Enhanced scoring that considers both RQM score and time weight
                user_quiz_attempts['preference_score'] = (
                    user_quiz_attempts['RQM_score'].astype(float) *
                    user_quiz_attempts['time_weight']
                )

                quiz_preference = user_quiz_attempts[['article', 'preference_score', 'createdAt', 'time_weight']]

        # Process time spent with enhanced recency weighting
        time_preference = pd.DataFrame(columns=['article', 'preference_score', 'date', 'time_weight'])
        if not time_spent_df.empty:
            user_time_spent = time_spent_df[
                (time_spent_df['userId'] == user_id_obj) &
                (time_spent_df['articleId'].astype(str).isin(recent_article_ids))
            ].copy()

            if not user_time_spent.empty:
                # Ensure timezone awareness for date
                user_time_spent['date'] = pd.to_datetime(user_time_spent['date']).dt.tz_localize(pytz.UTC)

                # Calculate days ago
                user_time_spent['days_ago'] = (current_date - user_time_spent['date']).dt.days

                # Apply time weights
                user_time_spent['time_weight'] = user_time_spent['days_ago'].apply(
                    lambda x: next((w for d, w in sorted(time_weights.items(), reverse=True) if x <= d), 0.5)
                )

                # Normalize time spent on a per-article basis
                max_time = user_time_spent['timeSpent'].max()
                user_time_spent['normalized_timeSpent'] = user_time_spent['timeSpent'] / max_time if max_time > 0 else 0

                # Calculate weighted preference score with recency
                user_time_spent['preference_score'] = (
                    user_time_spent['normalized_timeSpent'] *
                    user_time_spent['time_weight'] * 2
                )

                time_preference = user_time_spent[['articleId', 'preference_score', 'date', 'time_weight']].rename(
                    columns={'articleId': 'article'}
                )

        # Combine preferences with weighted averaging
        user_preference_df = pd.concat([quiz_preference, time_preference])

        if user_preference_df.empty:
            return pd.DataFrame(columns=['_id', 'category', 'article', 'preference_score', 'recency_weight']), {
                cat_info['category']: {
                    'weight': float(cat_info.get('weight', 0)),
                    'isInferred': bool(cat_info.get('isInferred', False))
                }
                for cat_info in user_preferred_categories
            }

        # Group by article and calculate final scores
        user_preference_df = user_preference_df.groupby('article').agg({
            'preference_score': 'sum',
            'time_weight': 'max'
        }).reset_index()

        # Merge with article data to get categories
        articles_df['_id'] = articles_df['_id'].astype(str)
        user_preference_df = articles_df[['_id', 'category']].merge(
            user_preference_df,
            left_on='_id',
            right_on='article',
            how='inner'
        )

        # Keep the existing category preference calculation logic
        category_interactions = user_preference_df.groupby('category').agg({
            'preference_score': 'sum',
            '_id': 'count'  # Count of interactions per category
        }).reset_index()

        total_interactions = category_interactions['_id'].sum()
        total_score = category_interactions['preference_score'].sum()

        # Calculate dynamic weights
        category_interactions['interaction_weight'] = category_interactions['_id'] / total_interactions
        category_interactions['score_weight'] = category_interactions['preference_score'] / total_score

        # Combine weights with exponential smoothing
        alpha = 0.7  # Weight for recent behavior vs historical preferences
        category_interactions['combined_weight'] = (
            alpha * category_interactions['score_weight'] +
            (1 - alpha) * category_interactions['interaction_weight']
        )

        # Normalize weights
        total_weight = category_interactions['combined_weight'].sum()
        category_interactions['normalized_weight'] = category_interactions['combined_weight'] / total_weight

        # Create updated category preferences
        combined_categories = {}

        # Start with existing preferred categories
        user_preferred_set = {cat_info['category'] for cat_info in user_preferred_categories}

        for _, row in category_interactions.iterrows():
            category = row['category']
            weight = row['normalized_weight']
            is_user_preferred = category in user_preferred_set

            combined_categories[category] = {
                'weight': float(weight),
                'isInferred': not is_user_preferred,
                'interactionCount': int(row['_id']),
                'scoreWeight': float(row['score_weight'])
            }

        # Log category weight changes
        logging.info("\nCategory Weight Analysis:")
        for category, info in sorted(combined_categories.items(), key=lambda x: x[1]['weight'], reverse=True):
            status = "User Preferred" if category in user_preferred_set else "Inferred"
            logging.info(f"• {category}: Weight={info['weight']:.3f}, Interactions={info['interactionCount']}, Status={status}")

        return user_preference_df, combined_categories

    except Exception as e:
        logging.error(f"Error calculating preference score: {str(e)}", exc_info=True)
        raise

def recommend_articles_with_vector_search(user_id, articles_df, quiz_attempts_df, time_spent_df, user_preferred_categories, num_recommendations=270):
    """
    Recommend articles using balanced category distribution and personalization
    """
    try:
        start_time = time.time()
        logging.info(f"\n{'='*50}\nStarting Recommendation Process\n{'='*50}")

        # Constants for category balancing
        MAX_CATEGORY_PERCENTAGE = 0.30  # Maximum 30% from any category
        MIN_CATEGORY_PERCENTAGE = 0.05  # Minimum 5% for important categories
        TRENDING_PERCENTAGE = 0.10      # 10% trending articles

        # Calculate base numbers
        trending_count = int(num_recommendations * TRENDING_PERCENTAGE)
        remaining_count = num_recommendations - trending_count
        max_per_category = int(remaining_count * MAX_CATEGORY_PERCENTAGE)
        min_per_category = int(remaining_count * MIN_CATEGORY_PERCENTAGE)

        # Get user preferences and trending articles
        user_preference_df, updated_categories = calculate_preference_score(
            user_id, quiz_attempts_df, time_spent_df, articles_df, user_preferred_categories
        )

        logging.info(f"User preferences calculated - Found {len(user_preference_df)} interactions")

        client = pymongo.MongoClient(mongo_uri)
        db = client.get_database("RapidRecap0")
        articles_collection = db.get_collection("Articles")

        # Get trending articles
        trending_articles = get_trending_articles(articles_collection, trending_count)
        logging.info(f"Found {len(trending_articles)} trending articles")

        if not trending_articles:
            trending_count = 0
            remaining_count = num_recommendations
            max_per_category = int(remaining_count * MAX_CATEGORY_PERCENTAGE)
            min_per_category = int(remaining_count * MIN_CATEGORY_PERCENTAGE)

        # Sort categories by weight and calculate target distribution
        sorted_categories = sorted(
            updated_categories.items(),
            key=lambda x: x[1]['weight'],
            reverse=True
        )

        # Calculate initial targets based on weights
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
            if info['weight'] > 0.01  # Ignore very low-weight categories
        }

        # Adjust targets to match remaining_count
        target_sum = sum(initial_targets.values())
        if target_sum != remaining_count:
            adjustment_factor = remaining_count / target_sum
            category_targets = {
                cat: max(min_per_category, min(max_per_category, int(count * adjustment_factor)))
                for cat, count in initial_targets.items()
            }

            # Distribute any remaining slots
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

        logging.info("Target distribution:")
        logging.info(json.dumps(category_targets, indent=2))

        # Get recommendations for each category
        recommended_articles = []
        for category, target_count in category_targets.items():
            category_start = time.time()

            # Get user's most engaged articles in this category
            category_interactions = user_preference_df[
                user_preference_df['category'] == category
            ].nlargest(3, 'preference_score')

            logging.info(f"Processing {category} - Target: {target_count}")

            category_recommendations = get_category_recommendations(
                articles_collection,
                category_interactions,
                category,
                target_count,
                trending_articles,
                recommended_articles
            )

            recommended_articles.extend(category_recommendations)

            processing_time = time.time() - category_start
            if category_recommendations:
                logging.info(
                    f"Category {category} processed in {processing_time:.2f}s - "
                    f"Selected {len(category_recommendations)} articles"
                )

        # Fill remaining slots with diverse content
        current_count = len(recommended_articles) + len(trending_articles)
        if current_count < num_recommendations:
            remaining = get_diverse_recommendations(
                articles_collection,
                num_recommendations - current_count,
                trending_articles,
                recommended_articles,
                category_targets.keys()
            )
            recommended_articles.extend(remaining)

        # Combine trending and recommended articles
        final_recommendations = trending_articles + recommended_articles

        # Log final statistics
        log_recommendation_statistics(
            final_recommendations,
            trending_count,
            articles_df,
            start_time
        )

        # Convert to list of IDs and shuffle
        recommendations = [str(article['_id']) for article in final_recommendations]
        random.shuffle(recommendations)

        return recommendations[:num_recommendations], updated_categories

    except Exception as e:
        logging.error(f"Error recommending articles: {str(e)}", exc_info=True)
        raise

def get_trending_articles(articles_collection, count):
    """Get trending articles with recency boost and engagement metrics"""
    try:
        now = datetime.now(pytz.UTC)
        pipeline = [
            {
                "$match": {
                    "dateTime": {
                        "$gte": (now - timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ")
                    }
                }
            },
            {
                "$lookup": {
                    "from": "timespents",
                    "localField": "_id",
                    "foreignField": "articleId",
                    "as": "timeSpentData"
                }
            },
            {
                "$lookup": {
                    "from": "quiz_attempts",
                    "localField": "_id",
                    "foreignField": "article",
                    "as": "attempts"
                }
            },
            {
                "$addFields": {
                    "totalTimeSpent": {
                        "$ifNull": [{"$sum": "$timeSpentData.timeSpent"}, 0]
                    },
                    "attemptCount": {
                        "$size": "$attempts"
                    },
                    "daysOld": {
                        "$divide": [
                            {
                                "$subtract": [
                                    now,
                                    {
                                        "$dateFromString": {
                                            "dateString": "$dateTime",
                                            "onError": now
                                        }
                                    }
                                ]
                            },
                            1000 * 60 * 60 * 24
                        ]
                    }
                }
            },
            {
                "$addFields": {
                    "recencyScore": {
                        "$switch": {
                            "branches": [
                                {
                                    "case": { "$lte": ["$daysOld", 1] },
                                    "then": 2.0  # Last 24 hours
                                },
                                {
                                    "case": { "$lte": ["$daysOld", 2] },
                                    "then": 1.75  # 1-2 days old
                                },
                                {
                                    "case": { "$lte": ["$daysOld", 3] },
                                    "then": 1.5   # 2-3 days old
                                },
                                {
                                    "case": { "$lte": ["$daysOld", 5] },
                                    "then": 1.25  # 3-5 days old
                                }
                            ],
                            "default": 1.0
                        }
                    }
                }
            },
            {
                "$addFields": {
                    "engagementScore": {
                        "$min": [
                            100,  # Cap at 100
                            {
                                "$add": [
                                    {"$multiply": [
                                        {"$divide": ["$totalTimeSpent", 60]},
                                        0.7
                                    ]},
                                    {"$multiply": ["$attemptCount", 0.3]}
                                ]
                            }
                        ]
                    }
                }
            },
            {
                "$addFields": {
                    "trendingScore": {
                        "$multiply": [
                            "$engagementScore",
                            "$recencyScore"
                        ]
                    }
                }
            },
            {
                "$match": {
                    "$or": [
                        {"totalTimeSpent": {"$gt": 0}},
                        {"attemptCount": {"$gt": 0}}
                    ]
                }
            },
            {
                "$sort": {"trendingScore": -1}
            },
            {
                "$limit": count
            },
            {
                "$project": {
                    "_id": 1,
                    "category": 1,
                    "dateTime": 1,
                    "daysOld": 1,
                    "recencyScore": 1,
                    "engagementScore": 1,
                    "trendingScore": 1,
                    "totalTimeSpent": 1,
                    "attemptCount": 1
                }
            }
        ]

        trending = list(articles_collection.aggregate(pipeline))

        if trending:
            logging.info("\nTrending Article Scores:")
            for article in trending[:5]:
                logging.info(
                    f"Article ID: {article['_id']} - "
                    f"Age: {article['daysOld']:.1f} days - "
                    f"Recency Score: {article['recencyScore']:.2f} - "
                    f"Engagement Score: {article['engagementScore']:.2f} - "
                    f"Total Score: {article['trendingScore']:.2f}"
                )

        return trending

    except Exception as e:
        logging.error(f"Error getting trending articles: {str(e)}")
        return []

def get_category_recommendations(articles_collection, category_interactions, category, target_count, trending_articles, existing_recommendations):
    """Get recommendations for a specific category using vector similarity, excluding only past interactions"""
    recommendations = []

    # Get all articles user has interacted with
    user_interactions = set(category_interactions['_id'].values)  # Previous quiz attempts

    # Only exclude previously interacted articles and already recommended ones
    # Don't exclude trending articles
    excluded_ids = [
        *[ObjectId(id_) for id_ in user_interactions],  # Previously interacted articles
        *[article['_id'] for article in existing_recommendations]  # Already recommended in this session
    ]

    for _, article in category_interactions.iterrows():
        vector = get_article_vector(articles_collection, article['_id'])
        if not vector:
            continue

        similar_articles = perform_vector_search(
            articles_collection,
            vector,
            category,
            excluded_ids,
            target_count
        )

        recommendations.extend(similar_articles)
        excluded_ids.extend([a['_id'] for a in similar_articles])

        if len(recommendations) >= target_count:
            break

    return recommendations[:target_count]

def get_diverse_recommendations(articles_collection, count, trending_articles, recommended_articles, excluded_categories):
    """Get diverse recommendations from non-primary categories"""
    excluded_ids = [
        article['_id'] for article in trending_articles + recommended_articles
    ]

    pipeline = [
        {
            "$match": {
                "category": {"$nin": list(excluded_categories)},
                "_id": {"$nin": excluded_ids}
            }
        },
        {
            "$sample": {"size": count}
        }
    ]

    return list(articles_collection.aggregate(pipeline))

def get_article_vector(articles_collection, article_id):
    """Get content vector for a single article"""
    try:
        result = articles_collection.find_one(
            {"_id": ObjectId(article_id)},
            {"contentVector": 1}
        )
        return result.get("contentVector") if result else None
    except Exception as e:
        logging.error(f"Error getting article vector: {str(e)}")
        return None

def perform_vector_search(articles_collection, query_vector, category, excluded_ids, limit):
    """
    Perform vector search with time decay
    """
    try:
        now = datetime.now(pytz.UTC)

        # Simplified time decay pipeline
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "contentVector",
                    "queryVector": query_vector,
                    "numCandidates": limit * 3,
                    "limit": limit * 3
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
                "$match": {
                    "category": category,
                    "_id": {"$nin": excluded_ids}
                }
            },
            {
                "$addFields": {
                    # Simple time decay for older articles
                    "timeDecay": {
                        "$divide": [
                            1,
                            {"$add": [1, {"$multiply": [0.1, "$daysOld"]}]}
                        ]
                    }
                }
            },
            {
                "$addFields": {
                    "finalScore": {
                        "$multiply": [
                            {"$meta": "vectorSearchScore"},
                            "$timeDecay"
                        ]
                    }
                }
            },
            {"$sort": {"finalScore": -1}},
            {"$limit": limit},
            {
                "$project": {
                    "_id": 1,
                    "category": 1,
                    "dateTime": 1,
                    "daysOld": 1,
                    "timeDecay": 1,
                    "vectorScore": {"$meta": "vectorSearchScore"},
                    "finalScore": 1
                }
            }
        ]

        results = list(articles_collection.aggregate(pipeline))
        if results:
            logging.info(f"Vector search found {len(results)} articles for category {category}")
            logging.info(f"Score range: {results[0]['finalScore']:.2f} to {results[-1]['finalScore']:.2f}")
        return results

    except Exception as e:
        logging.error(f"Error in vector search: {str(e)}")
        return []

def get_recommended_candidates(articles_collection, category, excluded_ids, limit):
    """
    Get candidate articles for a category when vector search fails
    """
    try:
        now = datetime.now(pytz.UTC)
        pipeline = [
            {
                "$match": {
                    "category": category,
                    "_id": {"$nin": excluded_ids},
                    "dateTime": {"$gte": (now - timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%SZ")}
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
                    "timeScore": {
                        "$divide": [1, {"$add": [1, {"$multiply": [0.1, "$daysOld"]}]}]
                    }
                }
            },
            {
                "$sort": {"timeScore": -1}
            },
            {
                "$limit": limit
            }
        ]

        return list(articles_collection.aggregate(pipeline))

    except Exception as e:
        logging.error(f"Error getting candidate articles: {str(e)}")
        return []

def log_recommendation_statistics(recommendations, trending_count, articles_df, start_time):
    """Log detailed statistics about recommendations"""
    total_time = time.time() - start_time

    category_counts = {}
    for rec in recommendations:
        category_counts[rec['category']] = category_counts.get(rec['category'], 0) + 1

    logging.info("\nFinal Recommendation Statistics:")
    logging.info(f"Total articles recommended: {len(recommendations)}")
    logging.info(f"Including {trending_count} trending articles")

    logging.info("\nCategory Distribution:")
    total = len(recommendations)
    for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
        percentage = (count/total) * 100
        logging.info(f"  {category}: {count} articles ({percentage:.1f}%)")
        if percentage < 5:
            logging.warning(f"  ⚠️ Category {category} is underrepresented at {percentage:.1f}%")

    diversity_score = len(category_counts) / len(set(articles_df['category'])) * 100
    balance_score = 1 - (pd.Series(category_counts).std() / pd.Series(category_counts).mean())

    logging.info(f"\nQuality Metrics:")
    logging.info(f"• Category Coverage: {len(category_counts)}/{len(set(articles_df['category']))}")
    logging.info(f"• Diversity Score: {diversity_score:.1f}%")
    logging.info(f"• Category Balance Score: {balance_score:.2f}")
    logging.info(f"• Processing Time: {total_time:.2f}s")

pd.set_option('future.no_silent_downcasting', True)

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

        # Remove articles without content vectors
        # articles_df = articles_df.dropna(subset=['contentVector'])

        if len(articles_df) == 0:
            print(json.dumps({"status": "error", "message": "No vectorized articles available"}))
            sys.exit(1)

        recommendations, updated_categories = recommend_articles_with_vector_search(
            user_id,
            articles_df,
            quiz_attempts_df,
            time_spent_df,
            user_preferred_categories
        )

        if recommendations:
            update_recommendations_in_db(user_id, recommendations, updated_categories, mongo_uri)
            print(json.dumps({
                "status": "success",
                "message": "Recommendations updated successfully",
                "count": len(recommendations)
            }))
        else:
            print(json.dumps({"status": "error", "message": "No recommendations generated"}))

    except Exception as e:
        logging.error(f"An error occurred in main execution: {str(e)}")
        print(json.dumps({"status": "error", "message": str(e)}))
        raise
