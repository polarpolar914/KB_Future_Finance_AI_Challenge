"""Utility helpers for tracking model versions.

This module reads and writes the ``models/version.json`` file. The file
stores the path to the latest model along with a monotonically increasing
version number.  The helper functions are intentionally lightweight and do
not depend on any external libraries.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional, Tuple

# Path to the version file relative to this script.
VERSION_FILE = Path(__file__).resolve().parent.parent / "models" / "version.json"


def get_version() -> Tuple[int, Optional[str]]:
    """Return the current version number and model path.

    If the version file does not yet exist, version ``0`` and ``None`` are
    returned.  The function never raises an exception and instead uses safe
    defaults so the caller can easily handle the "no model" case.
    """
    if VERSION_FILE.exists():
        with VERSION_FILE.open("r", encoding="utf-8") as f:
            data = json.load(f)
        return int(data.get("current_version", 0)), data.get("model_path")
    return 0, None


def update_version(model_path: str) -> int:
    """Record a new model version.

    Parameters
    ----------
    model_path:
        Filesystem path to the newly trained model.

    Returns
    -------
    int
        The new model version number.
    """
    current_version, _ = get_version()
    next_version = current_version + 1
    VERSION_FILE.parent.mkdir(parents=True, exist_ok=True)
    with VERSION_FILE.open("w", encoding="utf-8") as f:
        json.dump({"current_version": next_version, "model_path": model_path}, f, indent=2)
    return next_version


def get_latest_model_path() -> Optional[str]:
    """Convenience helper returning the path to the most recent model."""
    return get_version()[1]
