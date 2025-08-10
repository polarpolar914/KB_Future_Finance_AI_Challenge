import numpy as np
import pandas as pd


def main(n: int = 500, out_path: str = "dummy_data.csv") -> None:
    rng = np.random.default_rng(0)
    data = {
        "trader_history": rng.uniform(0, 100, n),
        "route_risk": rng.uniform(0, 100, n),
        "commodity_volatility": rng.uniform(0, 100, n),
        "geopolitical_index": rng.uniform(0, 100, n),
        "weather_forecast": rng.uniform(0, 100, n),
        "network_health": rng.uniform(0, 100, n),
    }
    df = pd.DataFrame(data)
    df["ml_score"] = df.mean(axis=1) + rng.normal(0, 5, n)
    df.to_csv(out_path, index=False)


if __name__ == "__main__":
    main()
