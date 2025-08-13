"""Simple training script used by the retraining CLI.

The "training" performed here is intentionally lightweight – it can either
train a small real model when data is present or fall back to a dummy model
with random weights. The purpose is to demonstrate how a model could be
saved and versioned, rather than to implement a full ML pipeline.
"""

from __future__ import annotations

import pickle
import random
from pathlib import Path
from typing import Any

# Versioning helpers (must exist alongside this script)
from model_version import get_version, update_version
from generate_dummy_data import main as generate_dummy_data

# ---- Constants (kept compatible with original script expectations) ----
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR.parent / "models"  # same as original
DATA_PATH = BASE_DIR / "data" / "dummy_data.csv"  # used when available


class DummyModel(dict):
    """A stand-in model storing random weights."""

    def predict(self, features):  # pragma: no cover - trivial example
        return [0 for _ in features]


def _train_real_model() -> Any:
    """Try to train a small real model if dependencies and data are available.
    Returns a fitted model (e.g., sklearn estimator).
    Raises RuntimeError if not possible.
    """
    try:
        import pandas as pd
        from sklearn.ensemble import RandomForestClassifier
    except Exception as e:  # Missing deps or import error
        raise RuntimeError(f"Real model training unavailable: {e}")

    if not DATA_PATH.exists():
        raise RuntimeError(f"Training data not found at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    if "target" not in df.columns:
        raise RuntimeError("Training data must contain a 'target' column.")

    X = df.drop("target", axis=1)
    y = df["target"]

    model = RandomForestClassifier(random_state=42)
    model.fit(X, y)
    return model


def _train_dummy_model() -> DummyModel:
    """Fallback training: create a dummy model with random weights."""
    weights = [random.random() for _ in range(5)]
    return DummyModel(weights=weights)


def train() -> Path:
    """Train a new model and store it on disk.

    Returns
    -------
    Path
        Location of the newly saved model file.
    """
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # Ensure some training data exists.  If the demo dataset is missing we
    # synthesise it so that the service can operate in a self-contained manner.
    if not DATA_PATH.exists():
        # Create the directory structure expected for the training data. Without
        # this ``to_csv`` would fail with ``OSError`` when the parent directory
        # is missing.
        DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        generate_dummy_data(out_path=str(DATA_PATH))

    # Prefer real training if possible; otherwise fall back to a lightweight
    # dummy model.  Any errors from the real training path simply trigger the
    # dummy model so that startup never fails.
    try:
        model = _train_real_model()
    except Exception:
        model = _train_dummy_model()

    # Determine next version and file path (unchanged I/O contract).
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
