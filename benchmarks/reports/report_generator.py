#!/usr/bin/env python3
"""Generate a markdown comparison report from benchmark JSON result files."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

_PROJECT_ROOT = str(Path(__file__).resolve().parent.parent.parent)
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)


def _load_results(directory: Path) -> list[dict]:
    """Load all JSON result files from *directory*."""
    results = []
    for p in sorted(directory.glob("*.json")):
        try:
            with open(p) as f:
                data = json.load(f)
            if "model_name" in data:
                data["_file"] = p.name
                results.append(data)
        except (json.JSONDecodeError, KeyError):
            continue
    return results


def generate_report(results_dir: str, output_path: str | None = None) -> str:
    """Generate markdown report and optionally write to *output_path*."""
    rd = Path(results_dir)
    results = _load_results(rd)

    if not results:
        return "# Benchmark Report\n\nNo benchmark results found.\n"

    lines: list[str] = [
        "# GreenCompute AI — Benchmark Comparison Report",
        "",
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        f"Results directory: `{rd.resolve()}`",
        "",
        "## Summary Table",
        "",
        "| Model | Precision | Accuracy | Mean Latency (ms) | Std Latency (ms) | Throughput (rps) | Energy (Wh) | Peak Mem (MB) | CO₂ (kg) | Device |",
        "|-------|-----------|----------|--------------------|-------------------|------------------|-------------|---------------|----------|--------|",
    ]

    for r in results:
        lines.append(
            f"| {r.get('model_name', '?')} "
            f"| {r.get('precision', '?')} "
            f"| {r.get('accuracy', 0):.2%} "
            f"| {r.get('mean_latency_ms', 0):.2f} "
            f"| {r.get('std_latency_ms', 0):.2f} "
            f"| {r.get('throughput_rps', 0):.1f} "
            f"| {r.get('energy_wh', 0):.6f} "
            f"| {r.get('peak_memory_mb', 0):.1f} "
            f"| {r.get('co2_kg', 0):.8f} "
            f"| {r.get('device', '?')} |"
        )

    # Highlight best / worst
    if len(results) > 1:
        fastest = min(results, key=lambda r: r.get("mean_latency_ms", float("inf")))
        greenest = min(results, key=lambda r: r.get("energy_wh", float("inf")))
        most_accurate = max(results, key=lambda r: r.get("accuracy", 0))

        lines.extend([
            "",
            "## Highlights",
            "",
            f"- **Fastest**: {fastest['model_name']} / {fastest['precision']} — {fastest['mean_latency_ms']:.2f} ms",
            f"- **Greenest**: {greenest['model_name']} / {greenest['precision']} — {greenest['energy_wh']:.6f} Wh",
            f"- **Most accurate**: {most_accurate['model_name']} / {most_accurate['precision']} — {most_accurate['accuracy']:.2%}",
        ])

    # Hardware info from first result
    hw = results[0].get("hardware_info", {})
    if hw:
        lines.extend([
            "",
            "## Hardware",
            "",
            f"- **Platform**: {hw.get('platform', '?')}",
            f"- **Processor**: {hw.get('processor', '?')}",
            f"- **CPU cores**: {hw.get('cpu_count_physical', '?')} physical / {hw.get('cpu_count_logical', '?')} logical",
            f"- **RAM**: {hw.get('ram_total_gb', '?')} GB",
            f"- **PyTorch**: {hw.get('torch_version', '?')}",
            f"- **CUDA**: {'Yes — ' + hw.get('cuda_device', '') if hw.get('cuda_available') else 'Not available (CPU only)'}",
        ])

    report = "\n".join(lines) + "\n"

    if output_path:
        op = Path(output_path)
        op.parent.mkdir(parents=True, exist_ok=True)
        with open(op, "w") as f:
            f.write(report)
        print(f"📄 Report written to {op}")

    return report


def main() -> None:
    p = argparse.ArgumentParser(description="Generate benchmark comparison report")
    p.add_argument("--results-dir", default="benchmarks/reports/", help="Dir with JSON result files")
    p.add_argument("--output", default=None, help="Output markdown file path")
    args = p.parse_args()

    if args.output is None:
        args.output = str(Path(args.results_dir) / "benchmark_report.md")

    report = generate_report(args.results_dir, args.output)
    print(report)


if __name__ == "__main__":
    main()
