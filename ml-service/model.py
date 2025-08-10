from pathlib import Path
import joblib
from typing import List

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model.pkl"
_model = None

def load_model():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model

def predict(features: List[List[float]]):
    model = load_model()
    return model.predict(features).tolist()
