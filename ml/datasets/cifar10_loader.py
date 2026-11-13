"""CIFAR-10 dataset loader with standard preprocessing."""

from __future__ import annotations

from pathlib import Path

import torch
from torch.utils.data import DataLoader, Subset
import torchvision
import torchvision.transforms as T

# Standard CIFAR-10 normalization (channel means / stds from training set)
CIFAR10_MEAN = (0.4914, 0.4822, 0.4465)
CIFAR10_STD = (0.2470, 0.2435, 0.2616)

CIFAR10_CLASSES = (
    "airplane", "automobile", "bird", "cat", "deer",
    "dog", "frog", "horse", "ship", "truck",
)


def _train_transform() -> T.Compose:
    return T.Compose([
        T.RandomCrop(32, padding=4),
        T.RandomHorizontalFlip(),
        T.ToTensor(),
        T.Normalize(CIFAR10_MEAN, CIFAR10_STD),
    ])


def _test_transform() -> T.Compose:
    return T.Compose([
        T.ToTensor(),
        T.Normalize(CIFAR10_MEAN, CIFAR10_STD),
    ])


def get_cifar10_loaders(
    data_dir: str | Path = "./data",
    batch_size: int = 128,
    num_workers: int = 2,
) -> tuple[DataLoader, DataLoader]:
    """Return (train_loader, test_loader) for CIFAR-10."""
    data_dir = str(data_dir)

    train_ds = torchvision.datasets.CIFAR10(
        root=data_dir, train=True, download=True, transform=_train_transform(),
    )
    test_ds = torchvision.datasets.CIFAR10(
        root=data_dir, train=False, download=True, transform=_test_transform(),
    )

    train_loader = DataLoader(
        train_ds, batch_size=batch_size, shuffle=True,
        num_workers=num_workers, pin_memory=torch.cuda.is_available(),
    )
    test_loader = DataLoader(
        test_ds, batch_size=batch_size, shuffle=False,
        num_workers=num_workers, pin_memory=torch.cuda.is_available(),
    )
    return train_loader, test_loader


def get_cifar10_test_dataset(
    data_dir: str | Path = "./data",
    max_samples: int | None = None,
) -> torchvision.datasets.CIFAR10:
    """Return the CIFAR-10 test dataset (optionally truncated)."""
    ds = torchvision.datasets.CIFAR10(
        root=str(data_dir), train=False, download=True, transform=_test_transform(),
    )
    if max_samples is not None and max_samples < len(ds):
        ds = Subset(ds, list(range(max_samples)))
    return ds
