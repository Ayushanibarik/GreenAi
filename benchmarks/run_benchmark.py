#!/usr/bin/env python3
"""GreenCompute AI — End-to-end ML benchmark runner.

Usage:
    python benchmarks/run_benchmark.py --model resnet18 --precision fp32 --samples 1000 --repeats 3 --output benchmarks/reports/
    python benchmarks/run_benchmark.py --model mobilenetv3 --precision fp16
    python benchmarks/run_benchmark.py --model resnet18 --precision onnx --samples 500

Supported configurations:
    resnet18   + fp32 | fp16 | int8 | onnx
    mobilenetv3 + fp32 | fp16
"""

from __future__ import annotations

import argparse
import gc
import json
import os
import platform
import sys
import time
import traceback
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import psutil
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Subset

# ---------------------------------------------------------------------------
# Ensure project root is on sys.path so `ml.*` imports resolve when running
# this script directly (e.g. `python benchmarks/run_benchmark.py`).
# ---------------------------------------------------------------------------
_PROJECT_ROOT = str(Path(__file__).resolve().parent.parent)
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.datasets.cifar10_loader import get_cifar10_test_dataset, CIFAR10_CLASSES
from ml.models.resnet18 import get_resnet18
from ml.models.mobilenetv3 import get_mobilenetv3_small

# Optional: CodeCarbon for energy tracking
try:
    from codecarbon import OfflineEmissionsTracker
    HAS_CODECARBON = True
except ImportError:
    HAS_CODECARBON = False

# Optional: ONNX Runtime
try:
    import onnxruntime as ort
    HAS_ORT = True
except ImportError:
    HAS_ORT = False


# ── Helpers ───────────────────────────────────────────────────────────────────

def _hardware_info() -> dict:
    """Collect basic hardware metadata."""
    info: dict = {
        "platform": platform.platform(),
        "processor": platform.processor() or platform.machine(),
        "cpu_count_physical": psutil.cpu_count(logical=False),
        "cpu_count_logical": psutil.cpu_count(logical=True),
        "ram_total_gb": round(psutil.virtual_memory().total / (1024 ** 3), 2),
        "python_version": platform.python_version(),
        "torch_version": torch.__version__,
        "cuda_available": torch.cuda.is_available(),
    }
    if torch.cuda.is_available():
        info["cuda_device"] = torch.cuda.get_device_name(0)
        info["cuda_version"] = torch.version.cuda
    return info


def _get_device() -> torch.device:
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ── Model Loaders ────────────────────────────────────────────────────────────

def _load_model(model_name: str, precision: str, device: torch.device) -> nn.Module | None:
    """Load and prepare a PyTorch model (returns None for onnx — handled separately)."""
    if precision == "onnx":
        return None  # ONNX path handled outside

    if model_name == "resnet18":
        model = get_resnet18(pretrained=True)
    elif model_name == "mobilenetv3":
        model = get_mobilenetv3_small(pretrained=True)
    else:
        raise ValueError(f"Unknown model: {model_name}")

    if precision == "fp16":
        model = model.half()
    elif precision == "int8":
        model = torch.quantization.quantize_dynamic(
            model, {nn.Linear, nn.Conv2d}, dtype=torch.qint8,
        )
        # INT8 quantized models must stay on CPU
        return model.cpu().eval()

    return model.to(device).eval()


def _export_onnx(model_name: str, output_dir: Path) -> str:
    """Export a model to ONNX and return the path."""
    if model_name == "resnet18":
        model = get_resnet18(pretrained=True).eval()
    elif model_name == "mobilenetv3":
        model = get_mobilenetv3_small(pretrained=True).eval()
    else:
        raise ValueError(f"Unknown model: {model_name}")

    onnx_path = output_dir / f"{model_name}.onnx"
    if not onnx_path.exists():
        dummy = torch.randn(1, 3, 32, 32)
        torch.onnx.export(
            model, dummy, str(onnx_path),
            input_names=["input"], output_names=["output"],
            dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},
            opset_version=17,
        )
    return str(onnx_path)


# ── Benchmark Core ────────────────────────────────────────────────────────────

def _run_single_pass(
    model: nn.Module | None,
    ort_session: "ort.InferenceSession | None",
    data_loader: DataLoader,
    device: torch.device,
    precision: str,
) -> dict:
    """Run one pass over *data_loader* and return timing / accuracy metrics."""
    latencies: list[float] = []
    correct = total = 0
    process = psutil.Process(os.getpid())

    # Peak memory baseline
    mem_before = process.memory_info().rss / (1024 ** 2)
    peak_mem = mem_before

    for images, labels in data_loader:
        if precision == "onnx" and ort_session is not None:
            np_images = images.numpy()
            t0 = time.perf_counter()
            outputs = ort_session.run(None, {"input": np_images})[0]
            t1 = time.perf_counter()
            preds = np.argmax(outputs, axis=1)
            correct += int((preds == labels.numpy()).sum())
        else:
            assert model is not None
            if precision == "int8":
                images = images.cpu()
            elif precision == "fp16":
                images = images.to(device).half()
            else:
                images = images.to(device)
            labels = labels.to(device if precision != "int8" else "cpu")

            t0 = time.perf_counter()
            with torch.no_grad():
                outputs = model(images)
            t1 = time.perf_counter()
            preds = outputs.argmax(dim=1)
            correct += (preds == labels).sum().item()

        total += labels.shape[0]
        latencies.append((t1 - t0) * 1000)  # ms

        cur_mem = process.memory_info().rss / (1024 ** 2)
        peak_mem = max(peak_mem, cur_mem)

    accuracy = correct / total if total else 0.0
    total_time_s = sum(latencies) / 1000
    throughput = total / total_time_s if total_time_s > 0 else 0.0

    return {
        "accuracy": accuracy,
        "latencies_ms": latencies,
        "total_samples": total,
        "throughput_rps": throughput,
        "peak_memory_mb": round(peak_mem, 2),
    }


def run_benchmark(
    model_name: str,
    precision: str,
    num_samples: int = 1000,
    num_repeats: int = 3,
    batch_size: int = 64,
    data_dir: str = "./data",
    output_dir: str = "benchmarks/reports",
) -> dict:
    """Run a full benchmark and return the results dict."""
    device = _get_device()
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    # ── Dataset ───────────────────────────────────────────────────────────
    test_ds = get_cifar10_test_dataset(data_dir=data_dir, max_samples=num_samples)
    loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=0)

    # ── Model ─────────────────────────────────────────────────────────────
    ort_session = None
    model = None

    if precision == "onnx":
        if not HAS_ORT:
            raise RuntimeError("onnxruntime is not installed — cannot run ONNX benchmark")
        onnx_path = _export_onnx(model_name, out_path)
        ort_session = ort.InferenceSession(onnx_path, providers=["CPUExecutionProvider"])
    else:
        model = _load_model(model_name, precision, device)

    # ── Warm-up (10 batches) ──────────────────────────────────────────────
    warmup_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=0)
    warmup_count = 0
    for images, labels in warmup_loader:
        if precision == "onnx" and ort_session is not None:
            ort_session.run(None, {"input": images.numpy()})
        elif model is not None:
            with torch.no_grad():
                if precision == "fp16":
                    model(images.to(device).half())
                elif precision == "int8":
                    model(images.cpu())
                else:
                    model(images.to(device))
        warmup_count += 1
        if warmup_count >= 10:
            break

    # ── Benchmark repeats ─────────────────────────────────────────────────
    all_accuracies: list[float] = []
    all_latencies: list[float] = []
    all_throughputs: list[float] = []
    all_peak_mems: list[float] = []
    total_energy_wh = 0.0
    total_co2_kg = 0.0

    tracker = None
    if HAS_CODECARBON:
        try:
            tracker = OfflineEmissionsTracker(
                country_iso_code="IND",
                log_level="error",
                save_to_file=False,
                tracking_mode="process",
            )
        except Exception:
            tracker = None

    for _rep in range(num_repeats):
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        if tracker is not None:
            try:
                tracker.start()
            except Exception:
                tracker = None

        result = _run_single_pass(model, ort_session, loader, device, precision)

        if tracker is not None:
            try:
                emissions = tracker.stop()
                if emissions is not None:
                    total_energy_wh += tracker._total_energy.kWh * 1000  # kWh → Wh
                    total_co2_kg += emissions
            except Exception:
                pass

        all_accuracies.append(result["accuracy"])
        all_latencies.extend(result["latencies_ms"])
        all_throughputs.append(result["throughput_rps"])
        all_peak_mems.append(result["peak_memory_mb"])

    mean_lat = float(np.mean(all_latencies))
    std_lat = float(np.std(all_latencies))
    mean_throughput = float(np.mean(all_throughputs))
    mean_accuracy = float(np.mean(all_accuracies))

    results = {
        "model_name": model_name,
        "precision": precision,
        "accuracy": round(mean_accuracy, 4),
        "mean_latency_ms": round(mean_lat, 4),
        "std_latency_ms": round(std_lat, 4),
        "throughput_rps": round(mean_throughput, 2),
        "energy_wh": round(total_energy_wh / max(num_repeats, 1), 6),
        "peak_memory_mb": round(max(all_peak_mems), 2),
        "co2_kg": round(total_co2_kg / max(num_repeats, 1), 8),
        "num_samples": num_samples,
        "num_repeats": num_repeats,
        "batch_size": batch_size,
        "hardware_info": _hardware_info(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "codecarbon_available": HAS_CODECARBON,
        "onnxruntime_available": HAS_ORT,
        "device": str(device),
    }

    # ── Save JSON ─────────────────────────────────────────────────────────
    fname = f"{model_name}_{precision}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    json_path = out_path / fname
    with open(json_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n✅ Benchmark complete: {model_name} / {precision}")
    print(f"   Accuracy      : {results['accuracy']:.2%}")
    print(f"   Mean latency  : {results['mean_latency_ms']:.2f} ± {results['std_latency_ms']:.2f} ms")
    print(f"   Throughput    : {results['throughput_rps']:.1f} samples/s")
    print(f"   Peak memory   : {results['peak_memory_mb']:.1f} MB")
    print(f"   Energy (avg)  : {results['energy_wh']:.6f} Wh")
    print(f"   CO₂ (avg)     : {results['co2_kg']:.8f} kg")
    print(f"   Results saved : {json_path}")

    return results


# ── CLI ───────────────────────────────────────────────────────────────────────

def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="GreenCompute AI benchmark runner")
    p.add_argument("--model", choices=["resnet18", "mobilenetv3"], default="resnet18")
    p.add_argument("--precision", choices=["fp32", "fp16", "int8", "onnx"], default="fp32")
    p.add_argument("--samples", type=int, default=1000, help="Number of test samples")
    p.add_argument("--repeats", type=int, default=3, help="Number of repeat runs")
    p.add_argument("--batch-size", type=int, default=64)
    p.add_argument("--data-dir", default="./data", help="CIFAR-10 data directory")
    p.add_argument("--output", default="benchmarks/reports/", help="Output directory for JSON results")
    return p.parse_args()


def main() -> None:
    args = _parse_args()
    print(f"🔬 GreenCompute AI Benchmark")
    print(f"   Model     : {args.model}")
    print(f"   Precision : {args.precision}")
    print(f"   Samples   : {args.samples}")
    print(f"   Repeats   : {args.repeats}")
    print(f"   Device    : {'cuda' if torch.cuda.is_available() else 'cpu'}")
    print(f"   CodeCarbon: {'yes' if HAS_CODECARBON else 'no (install codecarbon)'}")
    print()

    run_benchmark(
        model_name=args.model,
        precision=args.precision,
        num_samples=args.samples,
        num_repeats=args.repeats,
        batch_size=args.batch_size,
        data_dir=args.data_dir,
        output_dir=args.output,
    )


if __name__ == "__main__":
    main()
