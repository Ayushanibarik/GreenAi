"""ResNet18 adapted for CIFAR-10 (10 classes)."""

from __future__ import annotations

import torch
import torch.nn as nn
import torchvision.models as models


def get_resnet18(pretrained: bool = True, num_classes: int = 10) -> nn.Module:
    """Load ResNet18, replace the final FC layer for *num_classes*."""
    weights = models.ResNet18_Weights.DEFAULT if pretrained else None
    model = models.resnet18(weights=weights)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    return model
