import numpy as np
import logging
from datetime import datetime
import pytz
from trending_articles import calculate_recency_factor_for_trending_articles

# Configure logger
logger = logging.getLogger('recommendation.scoring')

# Constants
SCORE_WEIGHTS = {
    'VECTOR': 0.5,
    'TIME': 0.3,
    'ENGAGEMENT': 0.2
}

TRENDING_CONSTANTS = {
    'BASE_BOOST': 0.12,
    'TIME_DECAY': 0.08,
    'MAX_DAYS': 30
}

TIME_WEIGHTS = {
    1: 2.0,     # Last 24 hours: 200% weight
    3: 1.5,     # 2-3 days ago: 150% weight
    7: 1.2,     # 4-7 days ago: 120% weight
    14: 1.0,    # 8-14 days ago: normal weight
    30: 0.8     # 15-30 days ago: 80% weight
}

def normalize_scores(recommendations):
    """
    Normalize different scoring factors to 0-1 scale with safety checks
    """
    start_time = datetime.now()

    if not recommendations:
        logger.warning("No recommendations to normalize!")
        return []

    try:
        # Extract scores with safety checks
        vector_scores = np.array([float(rec.get('vectorScore', 0) or 0) for rec in recommendations])
        time_decay_scores = np.array([float(rec.get('timeDecay', 0) or 0) for rec in recommendations])
        engagement_scores = np.array([float(rec.get('engagementScore', 0) or 0) for rec in recommendations])

        # Safe normalization function
        def min_max_normalize(scores, score_type):
            if len(scores) == 0:
                logger.warning(f"Empty array for {score_type} scores!")
                return np.zeros_like(scores)

            score_range = scores.max() - scores.min()
            if score_range == 0:
                logger.warning(f"Zero range for {score_type} scores! Using default values.")
                return np.full_like(scores, 0.5)  # Use 0.5 as default when all scores are equal

            return (scores - scores.min()) / score_range

        # Normalize scores
        norm_vector_scores = min_max_normalize(vector_scores, "vector")
        norm_time_scores = min_max_normalize(time_decay_scores, "time decay")
        norm_engagement_scores = min_max_normalize(engagement_scores, "engagement")

        # Calculate combined scores with safety checks
        for i, rec in enumerate(recommendations):
            try:
                combined_score = (
                    SCORE_WEIGHTS['VECTOR'] * float(norm_vector_scores[i]) +
                    SCORE_WEIGHTS['TIME'] * float(norm_time_scores[i]) +
                    SCORE_WEIGHTS['ENGAGEMENT'] * float(norm_engagement_scores[i])
                )
                rec['normalized_score'] = float(combined_score)

            except (TypeError, ValueError) as e:
                logger.warning(f"Error calculating score for article {rec.get('_id')}: {str(e)}")
                rec['normalized_score'] = 0.0

        process_time = (datetime.now() - start_time).total_seconds()
        if process_time > 1:
            logger.warning(f"Slow score normalization: {process_time:.2f}s")

        return recommendations

    except Exception as e:
        logger.error(f"Error in score normalization: {str(e)}")
        for rec in recommendations:
            rec['normalized_score'] = 0.0
        return recommendations

def sort_recommendations(recommendations, trending_articles=None):
    """
    Sort recommendations by balancing trending status, normalized scores, and recency
    with time decay factor for all articles
    """
    start_time = datetime.now()

    if not recommendations:
        return []

    try:
        trending_articles = trending_articles or []
        trending_ids = {str(article.get('_id', '')) for article in trending_articles}
        now = datetime.now(pytz.UTC)

        for rec in recommendations:
            try:
                rec_id = str(rec.get('_id', ''))
                current_score = float(rec.get('normalized_score', 0) or 0)

                # Calculate time decay for all articles
                try:
                    date_str = rec.get('dateTime')
                    if not date_str:
                        article_date = now
                    else:
                        try:
                            if isinstance(date_str, datetime):
                                article_date = date_str if date_str.tzinfo else date_str.replace(tzinfo=pytz.UTC)
                            else:
                                if date_str.endswith('Z'):
                                    article_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                                elif '+' in date_str or '-' in date_str[-6:]:
                                    article_date = datetime.fromisoformat(date_str)
                                else:
                                    article_date = datetime.fromisoformat(date_str).replace(tzinfo=pytz.UTC)
                        except (ValueError, AttributeError):
                            article_date = now

                    days_old = (now - article_date).total_seconds() / (24 * 3600)

                    # Calculate time decay boost (inversely proportional to age)
                    time_decay = max(0, 1 - (days_old / TRENDING_CONSTANTS['MAX_DAYS']))
                    time_boost = TRENDING_CONSTANTS['TIME_DECAY'] * time_decay

                    # Add trending boost if applicable
                    if rec_id in trending_ids:
                        recency_factor = calculate_recency_factor_for_trending_articles(days_old)
                        trending_boost = min(TRENDING_CONSTANTS['BASE_BOOST'], 1.0 - current_score) * recency_factor
                    else:
                        trending_boost = 0

                    # Combine all factors
                    final_score = min(1.0, current_score + trending_boost + time_boost)
                    rec['final_score'] = final_score

                    # Store components for debugging
                    rec['_score_components'] = {
                        'base_score': current_score,
                        'trending_boost': trending_boost,
                        'time_boost': time_boost,
                        'days_old': days_old
                    }

                except Exception as e:
                    logger.warning(f"Error calculating time decay for article {rec_id}: {str(e)}")
                    rec['final_score'] = current_score

            except Exception as e:
                logger.warning(f"Error processing recommendation: {str(e)}")
                rec['final_score'] = 0.0

        # Safe sorting
        sorted_recommendations = sorted(
            recommendations,
            key=lambda x: float(x.get('final_score', 0) or 0),
            reverse=True
        )

        # Log score components for top recommendations
        if sorted_recommendations:
            logger.info("\nScore Components for top 3 articles:")
            for i, rec in enumerate(sorted_recommendations[:3]):
                components = rec.get('_score_components', {})
                logger.info(
                    f"Article {i+1}: final_score={rec.get('final_score', 0):.3f} "
                    f"(base={components.get('base_score', 0):.3f}, "
                    f"trending={components.get('trending_boost', 0):.3f}, "
                    f"time={components.get('time_boost', 0):.3f}, "
                    f"age={components.get('days_old', 0):.1f} days)"
                )

        process_time = (datetime.now() - start_time).total_seconds()
        if process_time > 1:
            logger.warning(f"Slow recommendation sorting: {process_time:.2f}s")

        return sorted_recommendations

    except Exception as e:
        logger.error(f"Error in recommendation sorting: {str(e)}")
        return recommendations

def calculate_new_user_score(article):
    """Calculate a score for new users based on time spent and time decay with safety checks"""
    try:
        time_spent = float(article.get("totalTimeSpent", 0) or 0)
        days_old = float(article.get("daysOld", 0) or 0)

        recency_weight = calculate_recency_weight(days_old)
        capped_time_spent = min(time_spent, 300)
        normalized_time_spent = capped_time_spent / 300

        score = (0.7 * normalized_time_spent) + (0.3 * recency_weight)
        article['score'] = float(score)

        return article

    except Exception as e:
        logger.warning(f"Error calculating new user score: {str(e)}")
        article['score'] = 0.0
        return article

def calculate_recency_weight(days_old):
    """Calculates recency weight based on days old with safety checks"""
    try:
        days_old = float(days_old or 0)
        return next(
            (w for d, w in sorted(TIME_WEIGHTS.items(), reverse=True) if days_old <= d),
            0.5
        )
    except Exception as e:
        logger.warning(f"Error calculating recency weight: {str(e)}")
        return 0.5
