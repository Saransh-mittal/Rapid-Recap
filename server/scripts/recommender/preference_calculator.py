import logging
import pandas as pd
import pytz
from datetime import datetime
from bson import ObjectId
import numpy as np
from collections import defaultdict

# Configure logger
logger = logging.getLogger('recommendation.preferences')

# Critical thresholds for monitoring
INTERACTION_THRESHOLDS = {
    'MIN_TOTAL': 8,  # Minimum total interactions
    'MIN_PREFERRED_CATEGORIES': 2,  # Minimum preferred categories with interactions
    'MIN_CATEGORY_INTERACTIONS': 4,  # Minimum interactions in preferred categories
    'MIN_SCORE_THRESHOLD': 0.01,  # Minimum weight to consider category
    'TIME_WEIGHTS': {
        1: 2.0,   # Last 24 hours: 200% weight
        3: 1.5,   # 2-3 days ago: 150% weight
        7: 1.2,   # 4-7 days ago: 120% weight
        14: 1.0,  # 8-14 days ago: normal weight
        30: 0.8   # 15-30 days ago: 80% weight
    }
}

def validate_interaction_data(quiz_attempts_df, time_spent_df, user_id_obj, articles_df, metrics):
    """Validate user interaction data and update metrics"""
    relevant_quiz_attempts = len(quiz_attempts_df[quiz_attempts_df['user'] == user_id_obj])
    relevant_time_spent = len(time_spent_df[time_spent_df['userId'] == user_id_obj])
    total_interactions = relevant_quiz_attempts + relevant_time_spent

    metrics.update({
        'quiz_attempts': relevant_quiz_attempts,
        'time_spent_records': relevant_time_spent,
        'total_interactions': total_interactions,
        'total_articles': len(articles_df)
    })

    return total_interactions >= INTERACTION_THRESHOLDS['MIN_TOTAL']

def calculate_preference_score(user_id, quiz_attempts_df, time_spent_df, articles_df, user_preferred_categories):
    """Calculate user preference scores with dynamic weighting and time-based recency"""
    start_time = datetime.now()
    metrics = defaultdict(int)

    try:
        # Initialize and validate
        user_id = str(user_id)
        user_id_obj = ObjectId(user_id)

        if not validate_interaction_data(quiz_attempts_df, time_spent_df, user_id_obj, articles_df, metrics):
            logger.warning(f"Insufficient interactions for user {user_id}: {metrics['total_interactions']}")
            return create_empty_preference(user_preferred_categories)

        # Data preparation and type conversion
        articles_df['_id'] = articles_df['_id'].astype(str)
        preferred_categories = {cat['category'] for cat in user_preferred_categories}

        # Calculate category interactions
        category_interactions = calculate_category_interactions(
            quiz_attempts_df, time_spent_df, articles_df, user_id_obj
        )

        # Validate category distribution
        if not validate_category_distribution(category_interactions, preferred_categories):
            logger.warning(f"Insufficient category distribution for user {user_id}")
            return create_empty_preference(user_preferred_categories)

        # Process user preferences
        user_preference_df = process_user_preferences(
            quiz_attempts_df, time_spent_df, articles_df, user_id_obj
        )

        if user_preference_df.empty:
            logger.warning(f"No valid preferences generated for user {user_id}")
            return create_empty_preference(user_preferred_categories)

        # Calculate category weights
        combined_categories = calculate_category_weights(
            user_preference_df, user_preferred_categories
        )

        # Monitor processing time and result quality
        process_time = (datetime.now() - start_time).total_seconds()
        if process_time > 5:  # Alert if processing takes too long
            logger.warning(f"Slow preference calculation: {process_time:.2f}s for user {user_id}")

        logger.info(f"Preference calculation complete - "
                   f"User: {user_id}, "
                   f"Categories: {len(combined_categories)}, "
                   f"Interactions: {metrics['total_interactions']}, "
                   f"Time: {process_time:.2f}s")

        return user_preference_df, combined_categories

    except Exception as e:
        logger.error(f"Critical error calculating preferences for user {user_id}: {str(e)}",
                    exc_info=True)
        raise

def calculate_category_interactions(quiz_attempts_df, time_spent_df, articles_df, user_id_obj):
    """Calculate interaction counts per category"""
    category_interactions = defaultdict(int)

    try:
        # Process quiz attempts
        if not quiz_attempts_df.empty:
            quiz_attempts_df['article'] = quiz_attempts_df['article'].astype(str)
            quiz_attempts_df = quiz_attempts_df.dropna(subset=['article'])

            quiz_categories = quiz_attempts_df[quiz_attempts_df['user'] == user_id_obj].merge(
                articles_df[['_id', 'category']],
                left_on='article',
                right_on='_id',
                suffixes=('_quiz', '_articles')
            )['category'].value_counts().to_dict()

            for cat, count in quiz_categories.items():
                category_interactions[cat] += count

        # Process time spent
        if not time_spent_df.empty:
            time_spent_df['articleId'] = time_spent_df['articleId'].astype(str)
            time_spent_df = time_spent_df.dropna(subset=['articleId'])

            time_spent_categories = time_spent_df[time_spent_df['userId'] == user_id_obj].merge(
                articles_df[['_id', 'category']],
                left_on='articleId',
                right_on='_id',
                suffixes=('_time', '_articles')
            )['category'].value_counts().to_dict()

            for cat, count in time_spent_categories.items():
                category_interactions[cat] += count

        return dict(category_interactions)

    except Exception as e:
        logger.error(f"Error calculating category interactions: {str(e)}")
        return {}

def process_user_preferences(quiz_attempts_df, time_spent_df, articles_df, user_id_obj):
    """Process user interaction data into preference scores"""
    current_date = datetime.now(pytz.UTC)
    recent_article_ids = set(articles_df['_id'])

    try:
        # Process quiz attempts
        quiz_preference = process_quiz_preferences(
            quiz_attempts_df, user_id_obj, recent_article_ids, current_date
        )

        # Process time spent
        time_preference = process_time_preferences(
            time_spent_df, user_id_obj, recent_article_ids, current_date
        )

        # Combine preferences
        user_preference_df = pd.concat([quiz_preference, time_preference])
        if user_preference_df.empty:
            return pd.DataFrame()

        # Calculate final scores
        user_preference_df['article'] = user_preference_df['article'].astype(str)
        user_preference_df = user_preference_df.groupby('article').agg({
            'preference_score': 'sum',
            'time_weight': 'max'
        }).reset_index()

        # Merge with article data
        return articles_df[['_id', 'category']].merge(
            user_preference_df,
            left_on='_id',
            right_on='article',
            how='inner'
        )

    except Exception as e:
        logger.error(f"Error processing user preferences: {str(e)}")
        return pd.DataFrame()

def create_empty_preference(user_preferred_categories):
    """Create empty preference dataframe with base categories"""
    return (
        pd.DataFrame(columns=[
            '_id', 'category', 'article', 'preference_score', 'recency_weight'
        ]).astype({'preference_score': 'float'}),
        {
            cat_info['category']: {
                'weight': float(cat_info.get('weight', 0)),
                'isInferred': bool(cat_info.get('isInferred', False))
            }
            for cat_info in user_preferred_categories
        }
    )

def validate_category_distribution(category_interactions, preferred_categories):
    """
    Validate the distribution of interactions across categories
    """
    try:
        # Check preferred categories criteria
        preferred_categories_with_interactions = sum(
            1 for cat in preferred_categories
            if category_interactions.get(cat, 0) > 0
        )
        total_preferred_interactions = sum(
            category_interactions.get(cat, 0)
            for cat in preferred_categories
        )

        # Validate against thresholds
        has_sufficient_categories = (
            preferred_categories_with_interactions >=
            INTERACTION_THRESHOLDS['MIN_PREFERRED_CATEGORIES']
        )
        has_sufficient_interactions = (
            total_preferred_interactions >=
            INTERACTION_THRESHOLDS['MIN_CATEGORY_INTERACTIONS']
        )

        if not has_sufficient_categories:
            logger.warning(
                f"Insufficient preferred categories with interactions: "
                f"{preferred_categories_with_interactions} < "
                f"{INTERACTION_THRESHOLDS['MIN_PREFERRED_CATEGORIES']}"
            )

        if not has_sufficient_interactions:
            logger.warning(
                f"Insufficient interactions in preferred categories: "
                f"{total_preferred_interactions} < "
                f"{INTERACTION_THRESHOLDS['MIN_CATEGORY_INTERACTIONS']}"
            )

        return has_sufficient_categories and has_sufficient_interactions

    except Exception as e:
        logger.error(f"Error validating category distribution: {str(e)}")
        return False

def calculate_category_weights(user_preference_df, user_preferred_categories):
    """
    Calculate category weights based on user interactions and preferences
    """
    try:
        # Calculate category-wise metrics
        category_interactions = user_preference_df.groupby('category').agg({
            'preference_score': 'sum',
            '_id': 'count'
        }).reset_index()

        total_interactions = category_interactions['_id'].sum()
        total_score = category_interactions['preference_score'].sum()

        if total_interactions == 0 or total_score == 0:
            logger.warning("No valid interactions or scores for weight calculation")
            return {}

        # Calculate weights
        category_interactions['interaction_weight'] = (
            category_interactions['_id'] / total_interactions
        )
        category_interactions['score_weight'] = (
            category_interactions['preference_score'] / total_score
        )

        # Combined weighting with preference for scores
        alpha = 0.7  # Weight factor favoring scores over interaction counts
        category_interactions['combined_weight'] = (
            alpha * category_interactions['score_weight'] +
            (1 - alpha) * category_interactions['interaction_weight']
        )

        # Normalize weights
        total_weight = category_interactions['combined_weight'].sum()
        category_interactions['normalized_weight'] = (
            category_interactions['combined_weight'] / total_weight
        )

        # Create final category mapping
        user_preferred_set = {
            cat_info['category'] for cat_info in user_preferred_categories
        }
        combined_categories = {}

        for _, row in category_interactions.iterrows():
            category = row['category']
            weight = row['normalized_weight']
            is_user_preferred = category in user_preferred_set

            if weight >= INTERACTION_THRESHOLDS['MIN_SCORE_THRESHOLD']:
                combined_categories[category] = {
                    'weight': float(weight),
                    'isInferred': not is_user_preferred,
                    'interactionCount': int(row['_id']),
                    'scoreWeight': float(row['score_weight'])
                }

        return combined_categories

    except Exception as e:
        logger.error(f"Error calculating category weights: {str(e)}")
        return {}

def process_quiz_preferences(quiz_attempts_df, user_id_obj, recent_article_ids, current_date):
    """
    Process quiz attempts into preference scores
    """
    try:
        if quiz_attempts_df.empty:
            return pd.DataFrame(columns=[
                'article', 'preference_score', 'date', 'time_weight'
            ])

        # Filter relevant attempts
        user_quiz_attempts = quiz_attempts_df[
            (quiz_attempts_df['user'] == user_id_obj) &
            (quiz_attempts_df['article'].astype(str).isin(recent_article_ids))
        ].copy()

        if user_quiz_attempts.empty:
            return pd.DataFrame(columns=[
                'article', 'preference_score', 'date', 'time_weight'
            ])

        # Calculate time weights
        user_quiz_attempts['createdAt'] = pd.to_datetime(
            user_quiz_attempts['createdAt']
        ).dt.tz_localize(pytz.UTC)

        user_quiz_attempts['days_ago'] = (
            current_date - user_quiz_attempts['createdAt']
        ).dt.days

        user_quiz_attempts['time_weight'] = user_quiz_attempts['days_ago'].apply(
            lambda x: next(
                (w for d, w in sorted(
                    INTERACTION_THRESHOLDS['TIME_WEIGHTS'].items(),
                    reverse=True
                ) if x <= d),
                0.5
            )
        )

        # Calculate preference scores
        user_quiz_attempts['preference_score'] = (
            user_quiz_attempts['RQM_score'].astype(float) *
            user_quiz_attempts['time_weight']
        )

        # Monitor score distribution
        score_stats = user_quiz_attempts['preference_score'].describe()
        if score_stats['std'] > score_stats['mean'] * 2:
            logger.warning("High variance in quiz preference scores")

        return user_quiz_attempts[[
            'article', 'preference_score', 'createdAt', 'time_weight'
        ]]

    except Exception as e:
        logger.error(f"Error processing quiz preferences: {str(e)}")
        return pd.DataFrame(columns=[
            'article', 'preference_score', 'date', 'time_weight'
        ])

def process_time_preferences(time_spent_df, user_id_obj, recent_article_ids, current_date):
    """
    Process time spent data into preference scores
    """
    try:
        if time_spent_df.empty:
            return pd.DataFrame(columns=[
                'article', 'preference_score', 'date', 'time_weight'
            ])

        # Filter relevant time spent records
        user_time_spent = time_spent_df[
            (time_spent_df['userId'] == user_id_obj) &
            (time_spent_df['articleId'].astype(str).isin(recent_article_ids))
        ].copy()

        if user_time_spent.empty:
            return pd.DataFrame(columns=[
                'article', 'preference_score', 'date', 'time_weight'
            ])

        # Calculate time weights
        user_time_spent['date'] = pd.to_datetime(
            user_time_spent['date']
        ).dt.tz_localize(pytz.UTC)

        user_time_spent['days_ago'] = (
            current_date - user_time_spent['date']
        ).dt.days

        user_time_spent['time_weight'] = user_time_spent['days_ago'].apply(
            lambda x: next(
                (w for d, w in sorted(
                    INTERACTION_THRESHOLDS['TIME_WEIGHTS'].items(),
                    reverse=True
                ) if x <= d),
                0.5
            )
        )

        # Normalize time spent
        max_time = user_time_spent['timeSpent'].max()
        user_time_spent['normalized_timeSpent'] = (
            user_time_spent['timeSpent'] / max_time if max_time > 0 else 0
        )

        # Calculate preference scores
        user_time_spent['preference_score'] = (
            user_time_spent['normalized_timeSpent'] *
            user_time_spent['time_weight'] * 2
        )

        # Monitor outliers
        mean_time = user_time_spent['timeSpent'].mean()
        std_time = user_time_spent['timeSpent'].std()
        if std_time > mean_time * 3:
            logger.warning("High variance in time spent distribution")

        return user_time_spent[['articleId', 'preference_score', 'date', 'time_weight']].rename(
            columns={'articleId': 'article'}
        )

    except Exception as e:
        logger.error(f"Error processing time preferences: {str(e)}")
        return pd.DataFrame(columns=[
            'article', 'preference_score', 'date', 'time_weight'
        ])
