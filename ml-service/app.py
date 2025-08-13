from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib
import os

MODEL_PATH = os.getenv("MODEL_PATH", "model.pkl")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
model = joblib.load(MODEL_PATH)


class Features(BaseModel):
    trader_history: float
    route_risk: float
    commodity_volatility: float
    geopolitical_index: float
    weather_forecast: float
    network_health: float


@app.post("/predict")
def predict(features: Features):
    x = np.array([
        [
            features.trader_history,
            features.route_risk,
            features.commodity_volatility,
            features.geopolitical_index,
            features.weather_forecast,
            features.network_health,
        ]
    ])
    score = float(model.predict(x)[0])
    return {"ml_score": score, "sub_scores": features.dict()}
