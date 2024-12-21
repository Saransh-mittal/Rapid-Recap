import logging
import time
import pandas as pd
import json

logger = logging.getLogger('recommendation.utils')
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

def get_top_weighted_categories(user_preferred_categories, max_categories=5):
    """
    Get the top weighted categories from user preferences

    Args:
        user_preferred_categories (list): List of category dictionaries with weights
        max_categories (int): Maximum number of categories to return

    Returns:
        list: Top weighted categories
    """
    try:
        # Sort categories by weight
        sorted_categories = sorted(
            user_preferred_categories,
            key=lambda x: float(x.get('weight', 0)),
            reverse=True
        )

        # Get top categories
        top_categories = [
            cat['category']
            for cat in sorted_categories[:max_categories]
            if float(cat.get('weight', 0)) > 0  # Only include categories with positive weights
        ]

        if not top_categories:
            logger.warning("No weighted categories found")
            return get_default_categories()

        logger.info(f"Selected top {len(top_categories)} categories by weight")
        return top_categories

    except Exception as e:
        logger.error(f"Error getting top weighted categories: {str(e)}")
        return get_default_categories()

def get_default_categories():
    """Return default categories when no weights are available"""
    return ['general', 'technology', 'business', 'science', 'health']
