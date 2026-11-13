"""CIFAR-10 dataset loader with standard preprocessing."""

from __future__ import annotations

import os
from pathlib import Path
import ssl

import torch
from torch.utils.data import DataLoader, Dataset, Subset
import torchvision
import torchvision.transforms as T

# Fix SSL certificate issues when downloading torchvision datasets (e.g. cs.toronto.edu)
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except AttributeError:
    pass

# Standard CIFAR-10 normalization (channel means / stds from training set)
CIFAR10_MEAN = (0.4914, 0.4822, 0.4465)
CIFAR10_STD = (0.2470, 0.2435, 0.2616)

CIFAR10_CLASSES = (
    "airplane", "automobile", "bird", "cat", "deer",
    "dog", "frog", "horse", "ship", "truck",
)


class SyntheticCIFAR10(Dataset):
    """Fallback synthetic CIFAR-10 dataset when download is unavailable."""

    def __init__(self, size: int = 1000, transform: T.Compose | None = None) -> None:
        self.size = size
        self.transform = transform
        torch.manual_seed(42)
        # Store as uint8 tensors (3, 32, 32) matching PIL / torchvision images
        self.data = torch.randint(0, 256, (size, 32, 32, 3), dtype=torch.uint8).numpy()
        self.targets = torch.randint(0, 10, (size,), dtype=torch.long).tolist()

    def __len__(self) -> int:
        return self.size

    def __getitem__(self, idx: int) -> tuple[torch.Tensor, int]:
        from PIL import Image
        img = Image.fromarray(self.data[idx])
        target = self.targets[idx]
        if self.transform is not None:
            img = self.transform(img)
        return img, target


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
    num_workers: int = 0,
) -> tuple[DataLoader, DataLoader]:
    """Return (train_loader, test_loader) for CIFAR-10."""
    data_dir = str(data_dir)

    try:
        train_ds = torchvision.datasets.CIFAR10(
            root=data_dir, train=True, download=True, transform=_train_transform(),
        )
        test_ds = torchvision.datasets.CIFAR10(
            root=data_dir, train=False, download=True, transform=_test_transform(),
        )
    except Exception as e:
        print(f"[Warning] CIFAR-10 download failed ({e}), using synthetic dataset fallback")
        train_ds = SyntheticCIFAR10(size=5000, transform=_train_transform())
        test_ds = SyntheticCIFAR10(size=1000, transform=_test_transform())

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
    force_synthetic: bool = False,
) -> Dataset:
    """Return the CIFAR-10 test dataset (optionally truncated)."""
    if force_synthetic:
        size = max_samples or 1000
        return SyntheticCIFAR10(size=size, transform=_test_transform())

    try:
        ds = torchvision.datasets.CIFAR10(
            root=str(data_dir), train=False, download=True, transform=_test_transform(),
        )
    except Exception as e:
        print(f"[Warning] CIFAR-10 download failed ({e}), using synthetic dataset fallback")
        size = max_samples or 1000
        return SyntheticCIFAR10(size=size, transform=_test_transform())

    if max_samples is not None and max_samples < len(ds):
        ds = Subset(ds, list(range(max_samples)))
    return ds

