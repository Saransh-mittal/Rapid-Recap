import logging
import time
import pandas as pd
import json

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
