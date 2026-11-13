"""MobileNetV3-Small adapted for CIFAR-10 (10 classes)."""

from __future__ import annotations

import torch.nn as nn
import torchvision.models as models


def get_mobilenetv3_small(pretrained: bool = True, num_classes: int = 10) -> nn.Module:
    """Load MobileNetV3-Small, replace classifier head for *num_classes*."""
    weights = None
    if pretrained:
        try:
            weights = models.MobileNet_V3_Small_Weights.DEFAULT
            model = models.mobilenet_v3_small(weights=weights)
        except Exception as e:
            print(f"[Warning] Failed to load pretrained weights ({e}), initializing without weights")
            model = models.mobilenet_v3_small(weights=None)
    else:
        model = models.mobilenet_v3_small(weights=None)
    in_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_features, num_classes)
    return model
