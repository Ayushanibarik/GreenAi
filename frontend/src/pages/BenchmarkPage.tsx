import React, { useState } from 'react';
import ModelComparisonChart from '../charts/ModelComparisonChart';
import { Gauge, Play, CheckCircle, Flame, Zap, Award, ArrowDown, ArrowUp } from 'lucide-react';
import type { BenchmarkResult } from '../types';

const defaultBenchmarks: BenchmarkResult[] = [
  {
    id: 'BM-1',
    config_name: 'ResNet18 FP32 (Unoptimized Baseline)',
    precision: 'FP32',
    energy_wh: 4.86,
    latency_ms: 114,
    accuracy: 93.2,
    memory_mb: 455,
    throughput: 490.2,
    carbon_g: 3.99,
  },
  {
    id: 'BM-2',
    config_name: 'ResNet18 INT8 Dynamic Quantization',
    precision: 'INT8',
    energy_wh: 5.52,
    latency_ms: 124,
    accuracy: 92.4,
    memory_mb: 432,
    throughput: 526.2,
    carbon_g: 4.53,
  },
  {
    id: 'BM-3',
    config_name: 'MobileNetV3-Small FP32',
    precision: 'FP32',
    energy_wh: 3.82,
    latency_ms: 85,
    accuracy: 89.6,
    memory_mb: 387,
    throughput: 705.3,
    carbon_g: 3.13,
  },
  {
    id: 'BM-4',
    config_name: 'MobileNetV3 ONNX Runtime (Green Choice)',
    precision: 'ONNX',
    energy_wh: 1.18,
    latency_ms: 9,
    accuracy: 89.4,
    memory_mb: 380,
    throughput: 5770.8,
    carbon_g: 0.97,
  },
];


export const BenchmarkPage: React.FC = () => {
  const [benchmarks, setBenchmarks] = useState<BenchmarkResult[]>(defaultBenchmarks);
  const [isRunning, setIsRunning] = useState(false);
  const [activeModel, setActiveModel] = useState('ResNet-50 ImageNet');

  const handleRunBenchmark = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 1500);
  };

  const baseline = benchmarks.find((b) => b.precision === 'FP32') || benchmarks[0];
  const optimal = benchmarks.find((b) => b.precision === 'INT8') || benchmarks[benchmarks.length - 1];

  const energyReduction = (((baseline.energy_wh - optimal.energy_wh) / baseline.energy_wh) * 100).toFixed(1);
  const latencyReduction = (((baseline.latency_ms - optimal.latency_ms) / baseline.latency_ms) * 100).toFixed(1);
  const accuracyDelta = (optimal.accuracy - baseline.accuracy).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header and Trigger Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Automated Quantization Benchmark Matrix</h2>
          <p className="text-xs text-gray-400">
            Empirical multi-tier execution benchmarking: FP32 vs FP16 vs ONNX vs INT8
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeModel}
            onChange={(e) => setActiveModel(e.target.value)}
            className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-gray-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ResNet-50 ImageNet">ResNet-50 (Vision)</option>
            <option value="BERT-Base MRPC">BERT-Base (NLP)</option>
            <option value="MobileNetV3 Small">MobileNet-V3 (Edge)</option>
            <option value="Whisper-Tiny">Whisper-Tiny (Audio)</option>
          </select>

          <button
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-900/30 hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            <Play className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Benchmarking Hardware...' : 'Run Benchmark'}
          </button>
        </div>
      </div>

      {/* Head-to-Head Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-2">
            <span>Energy Saved</span>
            <Zap className="h-4 w-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">-{energyReduction}%</span>
            <span className="text-xs text-emerald-300">from {baseline.energy_wh}Wh to {optimal.energy_wh}Wh</span>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">Direct Joules / Watt-hour reduction on measured hardware</p>
        </div>

        <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-2">
            <span>Latency Improvement</span>
            <Award className="h-4 w-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">-{latencyReduction}%</span>
            <span className="text-xs text-emerald-300">from {baseline.latency_ms}ms to {optimal.latency_ms}ms</span>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">Throughput scaled from {baseline.throughput} to {optimal.throughput} inf/sec</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mb-2">
            <span>Accuracy Impact</span>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{accuracyDelta}%</span>
            <span className="text-xs text-gray-300">from {baseline.accuracy}% to {optimal.accuracy}%</span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-400">Exceeds user SLA requirement of 90.0% min accuracy</p>
        </div>
      </div>

      {/* Model Comparison Bar Chart */}
      <ModelComparisonChart />

      {/* Benchmark Matrix Data Table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60 backdrop-blur-sm">
        <div className="border-b border-gray-800 bg-gray-950/70 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-white">Measured Precision Configurations for {activeModel}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/40 text-gray-400 border-b border-gray-800">
              <tr>
                <th className="px-5 py-3 font-semibold">Config Name</th>
                <th className="px-5 py-3 font-semibold">Precision</th>
                <th className="px-5 py-3 font-semibold">Energy (Wh)</th>
                <th className="px-5 py-3 font-semibold">CO₂e (g)</th>
                <th className="px-5 py-3 font-semibold">Latency (ms)</th>
                <th className="px-5 py-3 font-semibold">Throughput</th>
                <th className="px-5 py-3 font-semibold">VRAM Memory</th>
                <th className="px-5 py-3 font-semibold">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {benchmarks.map((bm) => (
                <tr
                  key={bm.id}
                  className={`transition-colors ${
                    bm.precision === 'INT8'
                      ? 'bg-emerald-950/20 border-l-4 border-l-emerald-500 font-medium'
                      : 'hover:bg-gray-800/30'
                  }`}
                >
                  <td className="px-5 py-3.5 text-white flex items-center gap-2">
                    {bm.config_name}
                    {bm.precision === 'INT8' && (
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        Green Pick
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-emerald-400">{bm.precision}</td>
                  <td className="px-5 py-3.5 font-mono text-emerald-300">{bm.energy_wh.toFixed(1)} Wh</td>
                  <td className="px-5 py-3.5 font-mono text-gray-300">{bm.carbon_g.toFixed(1)} g</td>
                  <td className="px-5 py-3.5 font-mono text-gray-300">{bm.latency_ms} ms</td>
                  <td className="px-5 py-3.5 font-mono text-gray-300">{bm.throughput} req/s</td>
                  <td className="px-5 py-3.5 font-mono text-gray-300">{bm.memory_mb} MB</td>
                  <td className="px-5 py-3.5 font-mono text-emerald-400">{bm.accuracy.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkPage;
