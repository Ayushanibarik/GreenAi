# GreenCompute AI — Benchmark Comparison Report

Generated: 2026-11-13 12:28:33

Results directory: `A:\blobs\WORK\green\benchmarks\reports`

## Summary Table

| Model | Precision | Accuracy | Mean Latency (ms) | Std Latency (ms) | Throughput (rps) | Energy (Wh) | Peak Mem (MB) | CO₂ (kg) | Device |
|-------|-----------|----------|--------------------|-------------------|------------------|-------------|---------------|----------|--------|
| mobilenetv3 | fp32 | 12.50% | 105.16 | 0.00 | 608.6 | 0.001232 | 346.3 | 0.00000088 | cpu |
| resnet18 | fp32 | 10.00% | 92.47 | 0.00 | 540.7 | 0.001339 | 392.7 | 0.00000096 | cpu |
| resnet18 | fp32 | 15.62% | 221.23 | 0.00 | 289.3 | 0.002232 | 411.6 | 0.00000159 | cpu |
| resnet18 | int8 | 14.06% | 244.77 | 0.00 | 261.5 | 0.002249 | 416.6 | 0.00000160 | cpu |

## Highlights

- **Fastest**: resnet18 / fp32 — 92.47 ms
- **Greenest**: mobilenetv3 / fp32 — 0.001232 Wh
- **Most accurate**: resnet18 / fp32 — 15.62%

## Hardware

- **Platform**: Windows-10-10.0.26300-SP0
- **Processor**: Intel64 Family 6 Model 186 Stepping 2, GenuineIntel
- **CPU cores**: 8 physical / 12 logical
- **RAM**: 15.7 GB
- **PyTorch**: 2.10.0+cpu
- **CUDA**: Not available (CPU only)
