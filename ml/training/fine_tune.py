"""Fine-tune a model on CIFAR-10."""

from __future__ import annotations

import torch
import torch.nn as nn
from torch.utils.data import DataLoader


def fine_tune_model(
    model: nn.Module,
    train_loader: DataLoader,
    test_loader: DataLoader,
    epochs: int = 5,
    lr: float = 1e-3,
    device: str | None = None,
) -> tuple[nn.Module, float]:
    """Fine-tune *model* on CIFAR-10 for *epochs*. Returns (model, test_accuracy)."""
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    model = model.to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    model.train()
    for epoch in range(epochs):
        running_loss = 0.0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()

    # Quick accuracy check
    model.eval()
    correct = total = 0
    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            preds = model(images).argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

    accuracy = correct / total if total else 0.0
    return model, accuracy
