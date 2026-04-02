from fastapi import FastAPI
import joblib
import pandas as pd

app = FastAPI()

# Load model + features
model = joblib.load("models/train2/final_model.pkl")
features = joblib.load("models/train2/features.pkl")

@app.get("/")
def home():
    return {"message": "Phishing Detection API Running 🚀"}

@app.post("/predict")
def predict(data: dict):
    try:
        input_data = pd.DataFrame([data])

        # Ensure correct feature order
        input_data = input_data[features]

        prediction = model.predict(input_data)[0]

        return {
            "prediction": int(prediction),
            "result": "phishing" if prediction == 1 else "legitimate"
        }

    except Exception as e:
        return {"error": str(e)}