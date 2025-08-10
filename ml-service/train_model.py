from pathlib import Path
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "dummy_data.csv"
MODEL_PATH = BASE_DIR / "model.pkl"

def main():
    data = pd.read_csv(DATA_PATH)
    X = data.drop("target", axis=1)
    y = data["target"]
    model = RandomForestClassifier(random_state=42)
    model.fit(X, y)
    joblib.dump(model, MODEL_PATH)

if __name__ == "__main__":
    main()
