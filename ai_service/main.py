from fastapi import FastAPI
import joblib
import pandas as pd

from scripts.feature_extractor import extract_features
from scripts.preprocessing import normalize_url

app = FastAPI()

model = joblib.load("models/train2/final_model.pkl")
features = joblib.load("models/train2/features.pkl")
metadata = joblib.load("models/train2/metadata.pkl")
threshold = float(metadata.get("threshold", 0.5))

@app.post("/predict")
def predict(data: dict):
    try:
        raw_url = data.get("url")
        url = normalize_url(raw_url)

        if not url:
            return {"error": "URL is required"}

        #  Extract features
        extracted = extract_features(url)

        input_data = pd.DataFrame([extracted])

        # Fill missing features
        for col in features:
            if col not in input_data:
                input_data[col] = 0

        input_data = input_data[features]

        probabilities = model.predict_proba(input_data)[0]
        phishing_probability = float(probabilities[1])
        prediction = int(phishing_probability >= threshold)
        confidence = phishing_probability * 100 if prediction == 1 else (1 - phishing_probability) * 100

        return {
            "url": url,
            "prediction": prediction,
            "result": "phishing" if prediction == 1 else "legitimate",
            "confidence": round(confidence, 2),
            "phishing_probability": round(phishing_probability * 100, 2),
            "threshold": round(threshold * 100, 2),
        }

    except Exception as e:
        return {"error": str(e)}
