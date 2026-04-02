import pandas as pd
import lightgbm as lgb
import joblib
import os

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score
from sklearn.model_selection import StratifiedKFold

# ===============================
# 🔹 LOAD DATA
# ===============================

df = pd.read_csv("../data/cleaned_dataset3.csv")

print("Dataset shape:", df.shape)

# ===============================
# 🔹 SPLIT FEATURES / LABEL
# ===============================

X = df.drop(columns=["label"])
y = df["label"]

# ===============================
# 🔹 TRAIN TEST SPLIT
# ===============================

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# ===============================
# 🔥 MODEL (OPTIMIZED)
# ===============================

model = lgb.LGBMClassifier(
    n_estimators=500,        # more trees = better learning
    learning_rate=0.03,      # slower learning = better accuracy
    num_leaves=31,
    max_depth=-1,
    subsample=0.8,           # prevent overfitting
    colsample_bytree=0.8,
    random_state=42
)

# ===============================
# 🔹 TRAIN
# ===============================

model.fit(X_train, y_train)

# ===============================
# 🔹 PREDICT
# ===============================

y_train_pred = model.predict(X_train)
y_test_pred = model.predict(X_test)

# ===============================
# 📊 EVALUATION
# ===============================

os.makedirs("../results/train2", exist_ok=True)

train_acc = accuracy_score(y_train, y_train_pred)
test_acc = accuracy_score(y_test, y_test_pred)

print("\n🔥 RESULTS 🔥")
print("Train Accuracy:", train_acc)
print("Test Accuracy:", test_acc)

print("\nClassification Report:\n")
print(classification_report(y_test, y_test_pred))

# ===============================
# 🔁 CROSS VALIDATION
# ===============================

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(model, X, y, cv=cv)

print("\n📊 Cross Validation Scores:", cv_scores)
print("Mean CV Accuracy:", cv_scores.mean())

# ===============================
# 🧠 FEATURE IMPORTANCE
# ===============================

importance = pd.DataFrame({
    "feature": X.columns,
    "importance": model.feature_importances_
}).sort_values(by="importance", ascending=False)

print("\n🔥 Top Features:\n")
print(importance.head(10))

# ===============================
# 💾 SAVE MODEL
# ===============================

os.makedirs("../models", exist_ok=True)

joblib.dump(model, "../models/train2/final_model.pkl")
joblib.dump(list(X.columns), "../models/train2/features.pkl")

print("\n✅ MODEL SAVED SUCCESSFULLY")

with open("../results/train2/metrics.txt", "w") as f:
    f.write(" RESULTS \n\n")
    f.write(f"Train Accuracy: {train_acc}\n")
    f.write(f"Test Accuracy: {test_acc}\n\n")

    f.write("Classification Report:\n")
    f.write(classification_report(y_test, y_test_pred))

# ===============================
# 💾 SAVE CROSS VALIDATION
# ===============================

with open("../results/train2/cv_scores.txt", "w") as f:
    f.write("Cross Validation Scores:\n")
    f.write(str(cv_scores))
    f.write(f"\n\nMean CV Accuracy: {cv_scores.mean()}")

# ===============================
# 💾 SAVE FEATURE IMPORTANCE
# ===============================

importance.to_csv("../results/train2/feature_importance.csv", index=False)

# ===============================
# 💾 SAVE SUMMARY (OPTIONAL CLEAN FILE)
# ===============================

with open("../results/train2/summary.txt", "w") as f:
    f.write("MODEL SUMMARY\n")
    f.write("====================\n")
    f.write(f"Train Accuracy: {train_acc}\n")
    f.write(f"Test Accuracy: {test_acc}\n")
    f.write(f"CV Mean Accuracy: {cv_scores.mean()}\n\n")

    f.write("Top 10 Features:\n")
    f.write(str(importance.head(10)))




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