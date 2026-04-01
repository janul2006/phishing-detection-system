from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
def home():
    return {"message": "ML Service Running"}


class URLRequest(BaseModel):
    url: str

@app.post("/predict")
def predict(data: URLRequest):
    url = data.url

    return {
        "result": "safe",
        "confidence": 90
    }