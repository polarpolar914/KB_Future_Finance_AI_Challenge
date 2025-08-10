import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib


def main(data_path: str = "dummy_data.csv", model_path: str = "model.pkl") -> None:
    df = pd.read_csv(data_path)
    X = df.drop("ml_score", axis=1)
    y = df["ml_score"]
    model = RandomForestRegressor(n_estimators=50, random_state=0)
    model.fit(X, y)
    joblib.dump(model, model_path)


if __name__ == "__main__":
    main()
