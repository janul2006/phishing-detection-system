import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

from extract_features import extract_features

# 🔹 Load dataset
df = pd.read_csv("../data/dataset.csv")  # must have: url, label

# 🔹 Extract features
features = df['url'].apply(lambda x: extract_features(x))
X = pd.DataFrame(features.tolist())

# 🔹 Labels (convert)
y = df['label'].apply(lambda x: 1 if x == "phishing" else 0)

# 🔹 Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 🔥 LightGBM model
model = lgb.LGBMClassifier(
    n_estimators=200,
    learning_rate=0.05,
    max_depth=-1,
    random_state=42
)

# 🔹 Train
model.fit(X_train, y_train)

# 🔹 Predict
y_pred = model.predict(X_test)

# 🔹 Evaluate
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

#  Save model
joblib.dump(model, "../models/lightgbm_model.pkl")

print(" Model saved successfully!")