from fastapi import FastAPI
import joblib
import pandas as pd

from scripts.feature_extractor import extract_features

app = FastAPI()

model = joblib.load("models/train2/final_model.pkl")
features = joblib.load("models/train2/features.pkl")

@app.post("/predict")
def predict(data: dict):
    try:
        url = data.get("url")

        if not url:
            return {"error": "URL is required"}

        # 🔥 Extract features
        extracted = extract_features(url)

        input_data = pd.DataFrame([extracted])

        # Fill missing features
        for col in features:
            if col not in input_data:
                input_data[col] = 0

        input_data = input_data[features]

        prediction = model.predict(input_data)[0]

        return {
            "url": url,
            "prediction": int(prediction),
            "result": "phishing" if prediction == 1 else "legitimate"
        }

    except Exception as e:
        return {"error": str(e)}