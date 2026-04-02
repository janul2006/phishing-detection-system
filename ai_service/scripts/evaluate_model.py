import pandas as pd
import joblib
import os
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    roc_curve,
    roc_auc_score
)

# ===============================
# 🔹 LOAD DATA
# ===============================

df = pd.read_csv("../data/cleaned_dataset.csv")

# ===============================
# 🔹 LOAD FEATURE LIST (IMPORTANT )
# ===============================

features = joblib.load("../models/train/features.pkl")

X = df[features]   # ensure same feature order
y = df["label"]

# ===============================
# 🔹 TRAIN / TEST SPLIT
# ===============================

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# ===============================
# 🔹 LOAD MODEL
# ===============================

model = joblib.load("../models/train/lightgbm_model.pkl")

# ===============================
# 🔹 PREDICTIONS
# ===============================

y_train_pred = model.predict(X_train)
y_test_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

# ===============================
# 📊 METRICS
# ===============================

train_acc = accuracy_score(y_train, y_train_pred)
test_acc = accuracy_score(y_test, y_test_pred)

report = classification_report(y_test, y_test_pred)
cm = confusion_matrix(y_test, y_test_pred)

# ===============================
# 📁 CREATE RESULTS FOLDER
# ===============================

os.makedirs("../results", exist_ok=True)

# ===============================
# 💾 SAVE METRICS
# ===============================

with open("../results/metrics.txt", "w") as f:
    f.write(f"Train Accuracy: {train_acc}\n")
    f.write(f"Test Accuracy: {test_acc}\n\n")
    f.write("Classification Report:\n")
    f.write(report)
    f.write("\nConfusion Matrix:\n")
    f.write(str(cm))

# ===============================
# 📊 SAVE CONFUSION MATRIX IMAGE
# ===============================

plt.figure()
sns.heatmap(cm, annot=True, fmt="d")
plt.title("Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.savefig("../results/confusion_matrix.png")
plt.close()

# ===============================
# 📈 SAVE ROC CURVE
# ===============================

fpr, tpr, _ = roc_curve(y_test, y_prob)
roc_auc = roc_auc_score(y_test, y_prob)

plt.figure()
plt.plot(fpr, tpr, label=f"AUC = {roc_auc:.4f}")
plt.plot([0, 1], [0, 1], linestyle="--")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve")
plt.legend()
plt.savefig("../results/roc_curve.png")
plt.close()

# ===============================
# 🔁 CROSS VALIDATION (NO LEAKAGE)
# ===============================

from lightgbm import LGBMClassifier

cv_model = LGBMClassifier(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=-1,
    num_leaves=31,
    random_state=42
)

cv_scores = cross_val_score(cv_model, X, y, cv=5)

with open("../results/cv_scores.txt", "w") as f:
    f.write("CV Scores:\n")
    f.write(str(cv_scores))
    f.write(f"\nMean CV Accuracy: {cv_scores.mean()}")

# ===============================
# 🔍 OVERFITTING CHECK
# ===============================

with open("../results/overfitting_check.txt", "w") as f:
    f.write(f"Train Accuracy: {train_acc}\n")
    f.write(f"Test Accuracy: {test_acc}\n\n")

    gap = abs(train_acc - test_acc)

    f.write(f"Difference: {gap}\n\n")

    if gap < 0.01:
        f.write("Model is NOT overfitting\n")
    else:
        f.write("Model MAY be overfitting\n")

print("✅ Full evaluation completed. Check /results folder.")