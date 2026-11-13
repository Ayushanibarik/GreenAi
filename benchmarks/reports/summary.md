# GreenCompute AI — Benchmark Comparison Report

Generated: 2026-11-13 12:55:53

Results directory: `A:\blobs\WORK\green\benchmarks\reports`

## Summary Table

| Model | Precision | Accuracy | Mean Latency (ms) | Std Latency (ms) | Throughput (rps) | Energy (Wh) | Peak Mem (MB) | CO₂ (kg) | Device |
|-------|-----------|----------|--------------------|-------------------|------------------|-------------|---------------|----------|--------|
| mobilenetv3 | fp32 | 12.50% | 105.16 | 0.00 | 608.6 | 0.001232 | 346.3 | 0.00000088 | cpu |
| mobilenetv3 | onnx | 8.00% | 16.81 | 6.72 | 2974.3 | 0.000910 | 472.0 | 0.00000065 | cpu |
| resnet18 | fp32 | 10.00% | 92.47 | 0.00 | 540.7 | 0.001339 | 392.7 | 0.00000096 | cpu |
| resnet18 | fp32 | 15.62% | 221.23 | 0.00 | 289.3 | 0.002232 | 411.6 | 0.00000159 | cpu |
| resnet18 | fp32 | 16.00% | 48.37 | 10.92 | 1033.6 | 0.000000 | 374.6 | 0.00000000 | cpu |
| resnet18 | fp32 | 10.00% | 47.79 | 0.00 | 209.2 | 0.000638 | 449.1 | 0.00000046 | cpu |
| resnet18 | int8 | 14.06% | 244.77 | 0.00 | 261.5 | 0.002249 | 416.6 | 0.00000160 | cpu |
| resnet18 | onnx | 16.00% | 36.78 | 9.75 | 1359.3 | 0.001131 | 600.1 | 0.00000081 | cpu |

## Highlights

- **Fastest**: mobilenetv3 / onnx — 16.81 ms
- **Greenest**: resnet18 / fp32 — 0.000000 Wh
- **Most accurate**: resnet18 / fp32 — 16.00%

## Hardware

- **Platform**: Windows-10-10.0.26300-SP0
- **Processor**: Intel64 Family 6 Model 186 Stepping 2, GenuineIntel
- **CPU cores**: 8 physical / 12 logical
- **RAM**: 15.7 GB
- **PyTorch**: 2.10.0+cpu
- **CUDA**: Not available (CPU only)
