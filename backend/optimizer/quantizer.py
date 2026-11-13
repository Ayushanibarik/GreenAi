"""Quantization helpers — dynamic quantize, FP16, INT8, ONNX export."""

from __future__ import annotations

import io
import os
import tempfile
from typing import Any

import torch
import torch.nn as nn


def dynamic_quantize(model: nn.Module) -> nn.Module:
    """Apply PyTorch dynamic quantization (Linear layers → INT8 weights)."""
    return torch.quantization.quantize_dynamic(
        model,
        {nn.Linear},
        dtype=torch.qint8,
    )


def fp16_convert(model: nn.Module) -> nn.Module:
    """Convert model parameters to FP16 (half precision)."""
    return model.half()


def int8_quantize(model: nn.Module, calibration_data: Any = None) -> nn.Module:
    """Static INT8 quantization with a simple min/max observer.

    If *calibration_data* is provided (an iterable of input tensors) it is fed
    through the model in calibration mode.  Otherwise falls back to dynamic
    quantization as a safe default.
    """
    if calibration_data is None:
        return dynamic_quantize(model)

    model.eval()
    model.qconfig = torch.quantization.get_default_qconfig("x86")
    prepared = torch.quantization.prepare(model)
    with torch.no_grad():
        for batch in calibration_data:
            prepared(batch)
    return torch.quantization.convert(prepared)


def onnx_export(
    model: nn.Module,
    dummy_input: torch.Tensor,
    output_path: str | None = None,
    opset_version: int = 17,
) -> str:
    """Export a PyTorch model to ONNX format.

    Returns the file path of the exported model.
    """
    if output_path is None:
        fd, output_path = tempfile.mkstemp(suffix=".onnx")
        os.close(fd)

    model.eval()
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        opset_version=opset_version,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},
    )
    return output_path


def model_size_mb(model: nn.Module) -> float:
    """Estimate model size in MB by serialising to an in‑memory buffer."""
    buf = io.BytesIO()
    torch.save(model.state_dict(), buf)
    return buf.tell() / (1024 * 1024)
