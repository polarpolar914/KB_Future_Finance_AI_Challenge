import numpy as np
import pandas as pd
from pathlib import Path


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
    # The training pipeline expects a ``target`` column containing the value the
    # model should learn to predict.  For demo purposes we synthesise the target
    # from the feature means with a bit of noise so that the model has something
    # resembling a signal to fit on.
    df["target"] = df.mean(axis=1) + rng.normal(0, 5, n)

    # Ensure the output directory exists before attempting to write the file.
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)


if __name__ == "__main__":
    main()
