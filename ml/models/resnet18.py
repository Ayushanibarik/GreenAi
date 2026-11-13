"""ResNet18 adapted for CIFAR-10 (10 classes)."""

from __future__ import annotations

import torch
import torch.nn as nn
import torchvision.models as models


def get_resnet18(pretrained: bool = True, num_classes: int = 10) -> nn.Module:
    """Load ResNet18, replace the final FC layer for *num_classes*."""
    weights = None
    if pretrained:
        try:
            weights = models.ResNet18_Weights.DEFAULT
            model = models.resnet18(weights=weights)
        except Exception as e:
            print(f"[Warning] Failed to load pretrained weights ({e}), initializing without weights")
            model = models.resnet18(weights=None)
    else:
        model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    return model
