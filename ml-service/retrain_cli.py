"""Command‑line interface for validating and retraining the model.

The script evaluates a model using randomly generated sample data.  If the
computed accuracy drops below a user supplied threshold, ``train_model.py``
will be executed to create a new model version.  In a real system the
``evaluate`` function would load a dataset and use the actual model to
produce predictions.  The simplified workflow here keeps the repository
lightweight while demonstrating the control flow required by the user
story.
"""

from __future__ import annotations

import argparse
import random
from typing import List

from model_version import get_latest_model_path
from train_model import train
from validation import calculate_metrics


def generate_sample_data(size: int = 100) -> (List[int], List[int]):
    """Generate dummy ground‑truth and predictions for demonstration."""
    actuals = [random.randint(0, 1) for _ in range(size)]
    predictions = [random.randint(0, 1) for _ in range(size)]
    return predictions, actuals


def evaluate_and_retrain(threshold: float) -> None:
    """Evaluate model performance and retrain if necessary."""
    model_path = get_latest_model_path()
    if model_path is None:
        print("No existing model – training a new one.")
        train()
        model_path = get_latest_model_path()

    print(f"Evaluating model located at {model_path}")
    preds, trues = generate_sample_data()
    metrics = calculate_metrics(preds, trues)
    print("Metrics:", metrics)

    if metrics["accuracy"] < threshold:
        print("Performance below threshold. Retraining...")
        train()
    else:
        print("Performance is acceptable; no retraining needed.")


def main():  # pragma: no cover - CLI entry point
    parser = argparse.ArgumentParser(description="Validate model and retrain if needed")
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.8,
        help="Minimum acceptable accuracy before retraining is triggered",
    )
    args = parser.parse_args()
    evaluate_and_retrain(args.threshold)


if __name__ == "__main__":
    main()
