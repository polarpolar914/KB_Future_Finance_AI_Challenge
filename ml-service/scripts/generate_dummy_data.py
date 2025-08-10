from pathlib import Path
from sklearn.datasets import make_classification
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
FILE_PATH = DATA_DIR / "dummy_data.csv"

def main():
    X, y = make_classification(n_samples=100, n_features=4, n_informative=2,
                               n_redundant=0, random_state=42)
    df = pd.DataFrame(X, columns=[f"feature_{i}" for i in range(X.shape[1])])
    df["target"] = y
    df.to_csv(FILE_PATH, index=False)

if __name__ == "__main__":
    main()
