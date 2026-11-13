"""Model evaluation: accuracy + per-class accuracy on a test set."""

from __future__ import annotations

from collections import defaultdict

import torch
import torch.nn as nn
from torch.utils.data import DataLoader


def evaluate_model(
    model: nn.Module,
    test_loader: DataLoader,
    device: str | None = None,
) -> float:
    """Return overall top-1 accuracy on *test_loader*."""
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    model = model.to(device).eval()
    correct = total = 0
    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            preds = model(images).argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
    return correct / total if total else 0.0


def evaluate_per_class(
    model: nn.Module,
    test_loader: DataLoader,
    class_names: list[str] | None = None,
    device: str | None = None,
) -> dict[str, float]:
    """Return per-class accuracy as {class_name: accuracy}."""
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    model = model.to(device).eval()
    correct_per_class: dict[int, int] = defaultdict(int)
    total_per_class: dict[int, int] = defaultdict(int)

    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            preds = model(images).argmax(dim=1)
            for pred, label in zip(preds, labels):
                total_per_class[label.item()] += 1
                if pred.item() == label.item():
                    correct_per_class[label.item()] += 1

    results: dict[str, float] = {}
    for cls_idx in sorted(total_per_class.keys()):
        name = class_names[cls_idx] if class_names else str(cls_idx)
        total = total_per_class[cls_idx]
        results[name] = correct_per_class[cls_idx] / total if total else 0.0
    return results
