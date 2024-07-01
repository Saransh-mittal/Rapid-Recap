import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
import pickle
import pymongo
from datetime import datetime
from dotenv import load_dotenv
import pytz

def get_articles_after_date(mongo_uri, start_date):
    client = pymongo.MongoClient(mongo_uri)
    db = client.get_database("RapidRecap0")
    articles_collection = db.get_collection("Articles")

    start_date_str1 = start_date.strftime("%Y-%m-%dT%H:%M:%SZ")
    start_date_str2 = start_date.strftime("%Y-%m-%d %H:%M:%S")

    pipeline = [
        {
            "$match": {
                "$or": [
                    {"dateTime": {"$gte": start_date_str1}},
                    {"dateTime": {"$gte": start_date_str2}}
                ]
            }
        },
        {
            "$project": {
                "_id": 1,
                "author": 1,
                "title": 1,
                "mainText": 1,
                "category": 1,
                "dateTime": 1,
            }
        }
    ]

    articles = articles_collection.aggregate(pipeline)
    articles_df = pd.DataFrame(list(articles))
    return articles_df

def prepare_article_data(articles_df):
    articles_df['full_detail'] = articles_df['author'] + ' ' + articles_df['title'] + ' ' + articles_df['category'] + ' ' + articles_df['mainText']
    return articles_df

def create_tfidf_matrix(articles_df):
    tfv = TfidfVectorizer(min_df=3, max_features=None, strip_accents='unicode', analyzer='word', token_pattern=r'\w{1,}', ngram_range=(1, 3), stop_words='english')
    articles_df['full_detail'] = articles_df['full_detail'].fillna('')
    tfv_matrix = tfv.fit_transform(articles_df['full_detail'])
    return tfv, tfv_matrix

def save_tfidf(tfv, tfv_matrix):
    base_path = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_path, '..', 'model', 'tfidf_models')
    if not os.path.exists(model_path):
        os.makedirs(model_path)

    with open(os.path.join(model_path, 'tfv.pkl'), 'wb') as f:
        pickle.dump(tfv, f)
    with open(os.path.join(model_path, 'tfv_matrix.pkl'), 'wb') as f:
        pickle.dump(tfv_matrix, f)

def update_similar_articles(mongo_uri, articles_df, tfv_matrix):
    client = pymongo.MongoClient(mongo_uri)
    db = client.get_database("RapidRecap0")
    articles_collection = db.get_collection("Articles")

    cosine_similarities = cosine_similarity(tfv_matrix)
    bulk_operations = []
    
    for idx, article in articles_df.iterrows():
        similar_indices = cosine_similarities[idx].argsort()[:-11:-1]
        similar_articles = articles_df.iloc[similar_indices]['_id'].tolist()
        similar_articles = [str(article_id) for article_id in similar_articles if article_id != article['_id']]
        
        bulk_operations.append(
            pymongo.UpdateOne(
                {"_id": article['_id']},
                {"$set": {"relatedArticles": similar_articles}}
            )
        )
    
    if bulk_operations:
        articles_collection.bulk_write(bulk_operations)

if __name__ == "__main__":
    base_path = os.path.dirname(os.path.abspath(__file__))
    dotenv_path = os.path.join(base_path, '..', 'config.env')
    load_dotenv(dotenv_path=dotenv_path)

    mongo_uri = os.getenv("DATABASE")

    # Set start date to April 1, 2024
    start_date = datetime(2024, 4, 1, tzinfo=pytz.UTC)
    
    print(f"Fetching articles from {start_date} onwards...")

    articles_df = get_articles_after_date(mongo_uri, start_date)
    
    print(f"Number of articles fetched: {len(articles_df)}")

    articles_df = prepare_article_data(articles_df)
    tfv, tfv_matrix = create_tfidf_matrix(articles_df)
    save_tfidf(tfv, tfv_matrix)

    print("TF-IDF matrix calculation completed and saved.")

    print("Updating similar articles in the database...")
    update_similar_articles(mongo_uri, articles_df, tfv_matrix)
    print("Similar articles update completed.")
