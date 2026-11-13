"""Day 3 Verification: AI Model Benchmarking, Quantization, ONNX Runtime, and Statistical Reporting."""

from __future__ import annotations

import json
from pathlib import Path
import tempfile
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import pytest

from ml.models.resnet18 import get_resnet18
from ml.models.mobilenetv3 import get_mobilenetv3_small
from benchmarks.run_benchmark import _load_model, _run_single_pass, _export_onnx, _hardware_info
from benchmarks.reports.report_generator import generate_report


class TestDay3ModelLoadingAndQuantization:
    """Verify PyTorch model definitions, dynamic INT8 quantization, and device routing."""

    def test_load_resnet18_fp32(self):
        device = torch.device("cpu")
        model = _load_model("resnet18", "fp32", device)
        assert model is not None
        assert isinstance(model, nn.Module)
        # Test forward pass with dummy tensor
        dummy = torch.randn(2, 3, 32, 32)
        out = model(dummy)
        assert out.shape == (2, 10)

    def test_load_mobilenetv3_fp32(self):
        device = torch.device("cpu")
        model = _load_model("mobilenetv3", "fp32", device)
        assert model is not None
        assert isinstance(model, nn.Module)
        dummy = torch.randn(2, 3, 32, 32)
        out = model(dummy)
        assert out.shape == (2, 10)

    def test_load_resnet18_int8_quantization(self):
        device = torch.device("cpu")
        model = _load_model("resnet18", "int8", device)
        assert model is not None
        # Check that model executes correctly on CPU
        dummy = torch.randn(2, 3, 32, 32)
        out = model(dummy)
        assert out.shape == (2, 10)


class TestDay3BenchmarkExecution:
    """Verify single-pass inference profiling, latency measurement, and peak memory tracking."""

    def test_single_pass_inference_metrics(self):
        device = torch.device("cpu")
        model = get_resnet18(pretrained=False).eval()
        # Synthetic dataset: 16 samples, 2 batches of 8
        x = torch.randn(16, 3, 32, 32)
        y = torch.randint(0, 10, (16,))
        loader = DataLoader(TensorDataset(x, y), batch_size=8)

        metrics = _run_single_pass(
            model=model,
            ort_session=None,
            data_loader=loader,
            device=device,
            precision="fp32",
        )

        assert "accuracy" in metrics
        assert 0.0 <= metrics["accuracy"] <= 1.0
        assert len(metrics["latencies_ms"]) == 2  # 2 batches
        assert metrics["total_samples"] == 16
        assert metrics["throughput_rps"] > 0.0
        assert metrics["peak_memory_mb"] > 0.0

    def test_hardware_metadata_collection(self):
        info = _hardware_info()
        assert "platform" in info
        assert "cpu_count_logical" in info
        assert "ram_total_gb" in info
        assert "torch_version" in info
        assert isinstance(info["cuda_available"], bool)


class TestDay3ONNXExportAndReporting:
    """Verify ONNX export, session creation, and Markdown reporting."""

    def test_onnx_export_and_report_generation(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            # 1. Export ONNX
            onnx_file = _export_onnx("mobilenetv3", tmp_path)
            assert Path(onnx_file).exists()
            assert Path(onnx_file).stat().st_size > 0

            # 2. Write mock benchmark JSON results
            result_a = {
                "model_name": "resnet18",
                "precision": "fp32",
                "accuracy": 0.932,
                "mean_latency_ms": 42.15,
                "std_latency_ms": 1.25,
                "throughput_rps": 23.7,
                "energy_wh": 0.0825,
                "peak_memory_mb": 115.4,
                "co2_kg": 0.000058,
                "device": "cpu",
                "hardware_info": {"platform": "Windows", "ram_total_gb": 16.0},
            }
            result_b = {
                "model_name": "resnet18",
                "precision": "int8",
                "accuracy": 0.924,
                "mean_latency_ms": 18.40,
                "std_latency_ms": 0.85,
                "throughput_rps": 54.3,
                "energy_wh": 0.0381,
                "peak_memory_mb": 62.1,
                "co2_kg": 0.000027,
                "device": "cpu",
                "hardware_info": {"platform": "Windows", "ram_total_gb": 16.0},
            }

            with open(tmp_path / "resnet18_fp32.json", "w") as f:
                json.dump(result_a, f)
            with open(tmp_path / "resnet18_int8.json", "w") as f:
                json.dump(result_b, f)

            # 3. Generate Markdown summary
            report_md = generate_report(str(tmp_path), str(tmp_path / "summary.md"))
            assert "GreenCompute AI — Benchmark Comparison Report" in report_md
            assert "resnet18" in report_md
            assert "int8" in report_md
            assert "Fastest" in report_md
            assert "Greenest" in report_md

