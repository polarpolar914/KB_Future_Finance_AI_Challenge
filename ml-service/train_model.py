"""Simple training script used by the retraining CLI.

The "training" performed here is intentionally lightweight – it simply
creates a dummy model object containing random weights.  The purpose of the
script is to demonstrate how a model could be saved and versioned, rather
than to implement a real machine learning pipeline.
"""

from __future__ import annotations

import pickle
import random
from pathlib import Path

from model_version import get_version, update_version

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"


class DummyModel(dict):
    """A stand‑in model storing random weights."""

    def predict(self, features):  # pragma: no cover - trivial example
        return [0 for _ in features]


def train() -> Path:
    """Train a new model and store it on disk.

    Returns
    -------
    Path
        Location of the newly saved model file.
    """
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    weights = [random.random() for _ in range(5)]
    model = DummyModel(weights=weights)

    # Determine next version and file path.
    current_version, _ = get_version()
    version = current_version + 1
    model_path = MODEL_DIR / f"model_v{version}.pkl"

    # Persist model and write version information.
    with model_path.open("wb") as f:
        pickle.dump(model, f)
    update_version(str(model_path))
    print(f"Saved model version {version} to {model_path}")
    return model_path


if __name__ == "__main__":
    train()
