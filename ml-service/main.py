from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import os

class ScoreRequest(BaseModel):
    features: dict

class ScoreResponse(BaseModel):
    ml_score: float
    sub_scores: dict

app = FastAPI()

MODEL_PATH = os.getenv("MODEL_PATH", "/app/models/model_v1.pkl")
_model = None

def load_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
    return _model

@app.post("/score", response_model=ScoreResponse)
def score(req: ScoreRequest):
    try:
        model = load_model()
        s = sum(v for v in req.features.values() if isinstance(v, (int, float)))
        ml_score = float(s % 100) / 100.0
        sub_scores = {k: float(v % 10) / 10.0 for k, v in req.features.items() if isinstance(v, (int, float))}
        return ScoreResponse(ml_score=ml_score, sub_scores=sub_scores)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
