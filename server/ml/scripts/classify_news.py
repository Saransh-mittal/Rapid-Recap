import sys
import joblib
import os

# Get the directory of the current script
current_dir = os.path.dirname(os.path.abspath(__file__))
# Construct the path to the models directory
models_dir = os.path.join(current_dir, '..', 'models')

def load_model_and_vectorizer():
    clf_path = os.path.join(models_dir, 'multi_dataset_news_classifier_model.joblib')
    vectorizer_path = os.path.join(models_dir, 'multi_dataset_news_classifier_vectorizer.joblib')

    loaded_clf = joblib.load(clf_path)
    loaded_vectorizer = joblib.load(vectorizer_path)
    return loaded_clf, loaded_vectorizer

def classify_article(text, clf, vectorizer):
    vectorized_text = vectorizer.transform([text])
    return clf.predict(vectorized_text)[0]

if __name__ == "__main__":
    text = sys.argv[1]
    clf, vectorizer = load_model_and_vectorizer()
    category = classify_article(text, clf, vectorizer)
    print(category)
