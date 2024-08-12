import pickle
import sys
import json

model_path = sys.argv[1]

# Load the TfidfVectorizer object from the pickle file
with open(model_path, 'rb') as f:
    tfidf_model = pickle.load(f)

# Extract the vocabulary and IDF values
model_data = {
    'vocabulary': tfidf_model.vocabulary_,
    'idf': tfidf_model.idf_.tolist()
}

# Print the data as a JSON string
print(json.dumps(model_data))
