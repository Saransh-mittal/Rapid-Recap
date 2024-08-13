import sys
import pickle
import os
import json

def load_tfidf_model():
    base_path = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_path, '..', 'model', 'tfidf_models')

    with open(os.path.join(model_path, 'tfv.pkl'), 'rb') as f:
        tfv = pickle.load(f)

    return tfv

def calculate_query_vector(query, tfv):
    query_vector = tfv.transform([query]).toarray()[0]
    return query_vector.tolist()

if __name__ == "__main__":
    query = sys.argv[1]
    tfv = load_tfidf_model()
    query_vector = calculate_query_vector(query, tfv)
    print(json.dumps(query_vector))
