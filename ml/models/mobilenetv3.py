"""MobileNetV3-Small adapted for CIFAR-10 (10 classes)."""

from __future__ import annotations

import torch.nn as nn
import torchvision.models as models


def get_mobilenetv3_small(pretrained: bool = True, num_classes: int = 10) -> nn.Module:
    """Load MobileNetV3-Small, replace classifier head for *num_classes*."""
    weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
    model = models.mobilenet_v3_small(weights=weights)
    in_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_features, num_classes)
    return model
