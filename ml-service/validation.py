"""Model evaluation helpers.

The :func:`calculate_metrics` function compares predicted values with the
corresponding ground‑truth labels and returns a collection of common
classification metrics.  The implementation relies only on the Python
standard library to keep the environment lightweight.
"""

from __future__ import annotations

from typing import Iterable, Dict


def _safe_divide(numerator: float, denominator: float) -> float:
    return numerator / denominator if denominator else 0.0


def calculate_metrics(predictions: Iterable[int], actuals: Iterable[int]) -> Dict[str, float]:
    """Compute basic evaluation metrics.

    Parameters
    ----------
    predictions:
        Iterable of predicted labels.
    actuals:
        Iterable of actual ground‑truth labels.

    Returns
    -------
    dict
        Dictionary containing ``accuracy``, ``precision``, ``recall``, ``f1``
        and ``mse`` (mean squared error).
    """
    preds = list(predictions)
    trues = list(actuals)
    if len(preds) != len(trues):
        raise ValueError("Predictions and actuals must be of equal length")
    total = len(trues)

    # Classification metrics for a binary problem.
    tp = sum(1 for p, t in zip(preds, trues) if p == t == 1)
    tn = sum(1 for p, t in zip(preds, trues) if p == t == 0)
    fp = sum(1 for p, t in zip(preds, trues) if p == 1 and t == 0)
    fn = sum(1 for p, t in zip(preds, trues) if p == 0 and t == 1)

    accuracy = _safe_divide(tp + tn, total)
    precision = _safe_divide(tp, tp + fp)
    recall = _safe_divide(tp, tp + fn)
    f1 = _safe_divide(2 * precision * recall, precision + recall)

    mse = _safe_divide(sum((p - t) ** 2 for p, t in zip(preds, trues)), total)

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "mse": mse,
    }


if __name__ == "__main__":  # pragma: no cover - simple manual test
    # Example usage for quick manual verification
    metrics = calculate_metrics([1, 0, 1, 1], [1, 0, 0, 1])
    print(metrics)
