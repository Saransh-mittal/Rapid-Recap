import logging
from datetime import datetime, timedelta
import pytz
from vector_search import normalize_id

# Configure logger
logger = logging.getLogger('recommendation.trending')

# Constants for trending calculations
TRENDING_THRESHOLDS = {
    'MAX_DAYS_OLD': 7,
    'MIN_TRENDING_SCORE': 0.5,
    'MIN_TRENDING_COUNT': 5,
    'MAX_ENGAGEMENT_SCORE': 100,
    'RECENCY_WEIGHTS': {
        1: 2.0,   # Last 24 hours
        2: 1.75,  # 1-2 days old
        3: 1.5,   # 2-3 days old
        5: 1.25,  # 3-5 days old
        7: 1.0    # 5-7 days old
    },
    'ENGAGEMENT_WEIGHTS': {
        'TIME_SPENT': 0.7,
        'ATTEMPTS': 0.3
    }
}

def get_trending_articles(articles_collection, count):
    """Get trending articles with recency boost and engagement metrics"""
    start_time = datetime.now()
    metrics = {'articles_processed': 0, 'high_engagement': 0}

    try:
        now = datetime.now(pytz.UTC)
        max_age = now - timedelta(days=TRENDING_THRESHOLDS['MAX_DAYS_OLD'])

        pipeline = [
            # Time-based filtering
            {
                "$match": {
                    "dateTime": {"$gte": max_age.strftime("%Y-%m-%dT%H:%M:%SZ")}
                }
            },
            # Engagement data lookup
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
            # Calculate base metrics
            {
                "$addFields": {
                    "totalTimeSpent": {
                        "$ifNull": [{"$sum": "$timeSpentData.timeSpent"}, 0]
                    },
                    "attemptCount": {"$size": "$attempts"},
                    "daysOld": {
                        "$divide": [
                            {
                                "$subtract": [
                                    now,
                                    {"$dateFromString": {
                                        "dateString": "$dateTime",
                                        "onError": now
                                    }}
                                ]
                            },
                            1000 * 60 * 60 * 24
                        ]
                    }
                }
            },
            # Calculate recency score
            {
                "$addFields": {
                    "recencyScore": {
                        "$switch": {
                            "branches": [
                                {"case": {"$lte": ["$daysOld", d]}, "then": w}
                                for d, w in TRENDING_THRESHOLDS['RECENCY_WEIGHTS'].items()
                            ],
                            "default": 1.0
                        }
                    }
                }
            },
            # Calculate engagement score
            {
                "$addFields": {
                    "engagementScore": {
                        "$min": [
                            TRENDING_THRESHOLDS['MAX_ENGAGEMENT_SCORE'],
                            {
                                "$add": [
                                    {"$multiply": [
                                        {"$divide": ["$totalTimeSpent", 60]},
                                        TRENDING_THRESHOLDS['ENGAGEMENT_WEIGHTS']['TIME_SPENT']
                                    ]},
                                    {"$multiply": [
                                        "$attemptCount",
                                        TRENDING_THRESHOLDS['ENGAGEMENT_WEIGHTS']['ATTEMPTS']
                                    ]}
                                ]
                            }
                        ]
                    }
                }
            },
            # Calculate final trending score
            {
                "$addFields": {
                    "trendingScore": {
                        "$multiply": ["$engagementScore", "$recencyScore"]
                    }
                }
            },
            # Filter out non-engaged content
            {
                "$match": {
                    "$or": [
                        {"totalTimeSpent": {"$gt": 0}},
                        {"attemptCount": {"$gt": 0}}
                    ]
                }
            },
            # Sort and limit results
            {"$sort": {"trendingScore": -1}},
            {"$limit": count},
            # Project final fields
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
        metrics['articles_processed'] = len(trending)

        # Validate results
        if not trending:
            logger.warning("No trending articles found")
            return []

        # Monitor score distribution
        high_scores = [
            art for art in trending
            if art['trendingScore'] > TRENDING_THRESHOLDS['MIN_TRENDING_SCORE']
        ]
        metrics['high_engagement'] = len(high_scores)

        if len(trending) < TRENDING_THRESHOLDS['MIN_TRENDING_COUNT']:
            logger.warning(
                f"Low trending article count: {len(trending)} < "
                f"{TRENDING_THRESHOLDS['MIN_TRENDING_COUNT']}"
            )

        # Normalize IDs and validate data
        for article in trending:
            try:
                article['_id'] = normalize_id(article['_id'])
            except Exception as e:
                logger.error(f"Error normalizing ID for article: {str(e)}")

        # Log performance metrics
        process_time = (datetime.now() - start_time).total_seconds()
        logger.info(
            f"Trending articles processed - "
            f"Count: {len(trending)}, "
            f"High engagement: {metrics['high_engagement']}, "
            f"Time: {process_time:.2f}s"
        )

        return trending

    except Exception as e:
        logger.error(f"Critical error getting trending articles: {str(e)}",
                    exc_info=True)
        return []

def calculate_recency_factor_for_trending_articles(days_old):
    """Calculate recency factor based on article age"""
    try:
        if not isinstance(days_old, (int, float)):
            logger.error(f"Invalid days_old value: {days_old}")
            return TRENDING_THRESHOLDS['RECENCY_WEIGHTS'][max(TRENDING_THRESHOLDS['RECENCY_WEIGHTS'].keys())]

        for days, weight in sorted(TRENDING_THRESHOLDS['RECENCY_WEIGHTS'].items()):
            if days_old <= days:
                return weight

        return TRENDING_THRESHOLDS['RECENCY_WEIGHTS'][max(TRENDING_THRESHOLDS['RECENCY_WEIGHTS'].keys())]

    except Exception as e:
        logger.error(f"Error calculating recency factor: {str(e)}")
        return 1.0
