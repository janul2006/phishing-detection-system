import lightgbm as lgb
import joblib
import os

import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_recall_curve,
    precision_score,
    recall_score,
)
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split

from scripts.feature_extractor import extract_features
from scripts.preprocessing import clean_dataset, find_dataset_path


def find_best_threshold(y_true: pd.Series, probabilities) -> tuple[float, dict]:
    precision, recall, thresholds = precision_recall_curve(y_true, probabilities)
    candidate_thresholds = list(thresholds) + [0.99]
    best_threshold = 0.30
    best_score = -1.0
    best_metrics = {"precision": 0.0, "recall": 0.0, "f2": 0.0}

    for threshold in candidate_thresholds:
        predictions = (probabilities >= threshold).astype(int)
        current_precision = precision_score(y_true, predictions, zero_division=0)
        current_recall = recall_score(y_true, predictions, zero_division=0)
        if current_precision + current_recall == 0:
            current_f2 = 0.0
        else:
            current_f2 = (5 * current_precision * current_recall) / ((4 * current_precision) + current_recall)

        if current_f2 > best_score:
            best_score = current_f2
            best_threshold = float(threshold)
            best_metrics = {
                "precision": float(current_precision),
                "recall": float(current_recall),
                "f2": float(current_f2),
            }

    return best_threshold, best_metrics

# ===============================
# 🔹 LOAD DATA
# ===============================

dataset_path = find_dataset_path()
df = pd.read_csv(dataset_path)
df, cleaning_stats = clean_dataset(df)

print("Dataset shape:", df.shape)
print("Cleaning stats:", cleaning_stats)

# ===============================
# 🔹 FEATURE EXTRACTION
# ===============================

print("Extracting features...")

features = df["url"].apply(extract_features)
X = pd.DataFrame(features.tolist())
y = df["label"].astype(int)

# ===============================
# 🔹 TRAIN / VALIDATION / TEST SPLIT
# ===============================

X_train, X_holdout, y_train, y_holdout = train_test_split(
    X, y,
    test_size=0.3,
    random_state=42,
    stratify=y
)

X_val, X_test, y_val, y_test = train_test_split(
    X_holdout, y_holdout,
    test_size=0.5,
    random_state=42,
    stratify=y_holdout
)

# ===============================
# 🔥 LIGHTGBM MODEL
# ===============================

model = lgb.LGBMClassifier(
    n_estimators=800,
    learning_rate=0.02,
    num_leaves=50,
    max_depth=10,
    subsample=0.9,
    colsample_bytree=0.9,
    objective="binary",
    random_state=42
)

# ===============================
# 🔹 TRAIN
# ===============================
print("Training model...")
model.fit(X_train, y_train)

# ===============================
# 🔹 THRESHOLD TUNING
# ===============================

val_proba = model.predict_proba(X_val)[:, 1]
best_threshold, threshold_metrics = find_best_threshold(y_val, val_proba)

test_proba = model.predict_proba(X_test)[:, 1]
y_pred = (test_proba >= best_threshold).astype(int)

# ===============================
# 📊 EVALUATION
# ===============================

print("\n🔥 RESULTS 🔥")

accuracy = accuracy_score(y_test, y_pred)
print("Accuracy:", accuracy)
print("Chosen threshold:", round(best_threshold, 4))
print("Validation threshold metrics:", threshold_metrics)

print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:\n")
print(confusion_matrix(y_test, y_pred))

# ===============================
# 🔁 CROSS VALIDATION
# ===============================

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_validate(
    model,
    X,
    y,
    cv=cv,
    scoring={"recall": "recall", "precision": "precision", "roc_auc": "roc_auc"},
)

print("\n📊 Mean CV Recall:", cv_scores["test_recall"].mean())
print("📊 Mean CV Precision:", cv_scores["test_precision"].mean())
print("📊 Mean CV ROC-AUC:", cv_scores["test_roc_auc"].mean())

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
#  SAVE MODEL
# ===============================

os.makedirs("../models/train2", exist_ok=True)
os.makedirs("../results/train2", exist_ok=True)

joblib.dump(model, "../models/train2/final_model.pkl")
joblib.dump(list(X.columns), "../models/train2/features.pkl")
joblib.dump(
    {
        "threshold": best_threshold,
        "cleaning_stats": cleaning_stats,
        "validation_threshold_metrics": threshold_metrics,
    },
    "../models/train2/metadata.pkl",
)

print("\n✅ MODEL SAVED SUCCESSFULLY")
print(y.value_counts())
# ===============================
#  SAVE RESULTS
# ===============================

with open("../results/train2/metrics.txt", "w") as f:
    f.write("RESULTS\n\n")
    f.write(f"Accuracy: {accuracy}\n\n")
    f.write(f"Chosen threshold: {best_threshold:.4f}\n")
    f.write(f"Validation threshold metrics: {threshold_metrics}\n")
    f.write(f"Cleaning stats: {cleaning_stats}\n\n")
    f.write("Classification Report:\n")
    f.write(classification_report(y_test, y_pred))
    f.write("\nConfusion Matrix:\n")
    f.write(str(confusion_matrix(y_test, y_pred)))
    f.write("\n\nCross-validation mean recall: ")
    f.write(str(cv_scores["test_recall"].mean()))
    f.write("\nCross-validation mean precision: ")
    f.write(str(cv_scores["test_precision"].mean()))
    f.write("\nCross-validation mean roc_auc: ")
    f.write(str(cv_scores["test_roc_auc"].mean()))

importance.to_csv("../results/train2/feature_importance.csv", index=False)

print("\n Results saved successfully")
