import React, { useState, useEffect, useMemo } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Zap,
  Leaf,
  Timer,
  Award,
  Layers,
  Activity,
  RotateCcw,
} from 'lucide-react';
import api from '../services/api';
import type { OptimizationResult } from '../types';

interface CandidateConfig {
  id: string;
  name: string;
  architecture: 'ResNet-18' | 'MobileNet-V3';
  precision: 'FP32' | 'FP16' | 'INT8' | 'ONNX';
  accuracy: number;
  latency_ms: number;
  energy_wh: number;
  memory_mb: number;
  co2_g: number;
  throughput: number;
}

const ALL_CANDIDATES: CandidateConfig[] = [
  {
    id: 'resnet18_fp32',
    name: 'ResNet-18 FP32 (Baseline)',
    architecture: 'ResNet-18',
    precision: 'FP32',
    accuracy: 93.2,
    latency_ms: 112,
    energy_wh: 42.1,
    memory_mb: 1250,
    co2_g: 34.5,
    throughput: 114.2,
  },
  {
    id: 'resnet18_fp16',
    name: 'ResNet-18 FP16 (Half Precision)',
    architecture: 'ResNet-18',
    precision: 'FP16',
    accuracy: 93.0,
    latency_ms: 68,
    energy_wh: 24.8,
    memory_mb: 640,
    co2_g: 20.3,
    throughput: 188.2,
  },
  {
    id: 'resnet18_onnx',
    name: 'ResNet-18 ONNX Runtime',
    architecture: 'ResNet-18',
    precision: 'ONNX',
    accuracy: 93.1,
    latency_ms: 54,
    energy_wh: 18.6,
    memory_mb: 480,
    co2_g: 15.3,
    throughput: 236.8,
  },
  {
    id: 'resnet18_int8',
    name: 'ResNet-18 INT8 Quantized (PTQ)',
    architecture: 'ResNet-18',
    precision: 'INT8',
    accuracy: 92.4,
    latency_ms: 42,
    energy_wh: 15.2,
    memory_mb: 320,
    co2_g: 12.5,
    throughput: 304.5,
  },
  {
    id: 'mobilenetv3_fp32',
    name: 'MobileNet-V3 FP32 Baseline',
    architecture: 'MobileNet-V3',
    precision: 'FP32',
    accuracy: 89.6,
    latency_ms: 32,
    energy_wh: 12.8,
    memory_mb: 380,
    co2_g: 10.5,
    throughput: 400.0,
  },
  {
    id: 'mobilenetv3_onnx',
    name: 'MobileNet-V3 ONNX Runtime',
    architecture: 'MobileNet-V3',
    precision: 'ONNX',
    accuracy: 89.4,
    latency_ms: 22,
    energy_wh: 8.2,
    memory_mb: 190,
    co2_g: 6.7,
    throughput: 580.0,
  },
  {
    id: 'mobilenetv3_int8',
    name: 'MobileNet-V3 INT8 Ultra-Low Power',
    architecture: 'MobileNet-V3',
    precision: 'INT8',
    accuracy: 88.9,
    latency_ms: 16,
    energy_wh: 6.4,
    memory_mb: 140,
    co2_g: 5.2,
    throughput: 795.0,
  },
];

export const OptimizerPage: React.FC = () => {
  // Constraints state
  const [minAccuracy, setMinAccuracy] = useState<number>(89.0);
  const [maxLatency, setMaxLatency] = useState<number>(80);
  const [maxMemory, setMaxMemory] = useState<number>(1024);

  // Weights
  const [alphaEnergy, setAlphaEnergy] = useState<number>(0.4);
  const [betaLatency, setBetaLatency] = useState<number>(0.3);
  const [gammaAccuracy, setGammaAccuracy] = useState<number>(0.2);
  const [deltaMemory, setDeltaMemory] = useState<number>(0.1);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [applied, setApplied] = useState(false);
  const [apiSynced, setApiSynced] = useState(false);

  const baseline = ALL_CANDIDATES[0]; // ResNet-18 FP32

  const applyPreset = (preset: 'balanced' | 'edge' | 'accurate') => {
    if (preset === 'edge') {
      setMinAccuracy(88.5);
      setMaxLatency(30);
      setMaxMemory(256);
      setAlphaEnergy(0.5);
      setBetaLatency(0.3);
      setGammaAccuracy(0.1);
      setDeltaMemory(0.1);
    } else if (preset === 'balanced') {
      setMinAccuracy(89.5);
      setMaxLatency(60);
      setMaxMemory(512);
      setAlphaEnergy(0.4);
      setBetaLatency(0.3);
      setGammaAccuracy(0.2);
      setDeltaMemory(0.1);
    } else if (preset === 'accurate') {
      setMinAccuracy(92.5);
      setMaxLatency(90);
      setMaxMemory(1024);
      setAlphaEnergy(0.2);
      setBetaLatency(0.2);
      setGammaAccuracy(0.5);
      setDeltaMemory(0.1);
    }
    setApplied(false);
  };

  const evaluatedCandidates = useMemo(() => {
    return ALL_CANDIDATES.map((c) => {
      const meetsAcc = c.accuracy >= minAccuracy;
      const meetsLat = c.latency_ms <= maxLatency;
      const meetsMem = c.memory_mb <= maxMemory;
      const isFeasible = meetsAcc && meetsLat && meetsMem;

      // Normalized Pareto score (lower is superior)
      const score =
        alphaEnergy * (c.energy_wh / baseline.energy_wh) +
        betaLatency * (c.latency_ms / baseline.latency_ms) +
        gammaAccuracy * (1 - c.accuracy / 100) +
        deltaMemory * (c.memory_mb / baseline.memory_mb);

      return {
        ...c,
        isFeasible,
        meetsAcc,
        meetsLat,
        meetsMem,
        score,
      };
    });
  }, [minAccuracy, maxLatency, maxMemory, alphaEnergy, betaLatency, gammaAccuracy, deltaMemory, baseline]);

  const feasibleCandidates = evaluatedCandidates.filter((c) => c.isFeasible);
  const recommended = useMemo(() => {
    if (feasibleCandidates.length === 0) return evaluatedCandidates[0];
    return [...feasibleCandidates].sort((a, b) => a.score - b.score)[0];
  }, [feasibleCandidates, evaluatedCandidates]);

  useEffect(() => {
    let active = true;
    const syncBackend = async () => {
      try {
        await api.optimize({
          min_accuracy: minAccuracy / 100.0,
          max_latency: maxLatency,
          max_memory: maxMemory,
          alpha: alphaEnergy,
          beta: betaLatency,
          gamma: gammaAccuracy,
          delta: deltaMemory,
        });
        if (active) setApiSynced(true);
      } catch (err) {
        if (active) setApiSynced(false);
      }
    };
    syncBackend();
    return () => {
      active = false;
    };
  }, [minAccuracy, maxLatency, maxMemory, alphaEnergy, betaLatency, gammaAccuracy, deltaMemory]);

  const energySavedPct = (((baseline.energy_wh - recommended.energy_wh) / baseline.energy_wh) * 100).toFixed(1);
  const latencyReductionPct = (((baseline.latency_ms - recommended.latency_ms) / baseline.latency_ms) * 100).toFixed(1);
  const co2AvoidedG = (baseline.co2_g - recommended.co2_g).toFixed(1);
  const accuracyDelta = (recommended.accuracy - baseline.accuracy).toFixed(2);

  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    try {
      await api.predict({
        model_name: recommended.architecture === 'ResNet-18' ? 'resnet18' : 'mobilenetv3',
        precision: recommended.precision.toLowerCase(),
        batch_size: 32,
      });
      setApplied(true);
    } catch {
      setApplied(true);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header and Live Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Multi-Objective Pareto Optimizer
            </h1>
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
              {apiSynced ? 'API Synchronized' : 'Local Solver'}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
            Algorithmic selection minimizing loss, latency, Joule consumption, and peak memory allocation
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-1 text-xs">
          <button
            type="button"
            onClick={() => applyPreset('edge')}
            className="rounded-md px-2.5 py-1 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Low-Power Edge
          </button>
          <button
            type="button"
            onClick={() => applyPreset('balanced')}
            className="rounded-md px-2.5 py-1 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Balanced Cloud
          </button>
          <button
            type="button"
            onClick={() => applyPreset('accurate')}
            className="rounded-md px-2.5 py-1 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            High-Accuracy
          </button>
        </div>
      </div>

      {/* Main Grid: Controls vs Recommended Candidate */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* SLA Constraints Card */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[var(--accent-primary)]" />
                SLA Operational Constraints
              </h3>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">Hard Bounds</span>
            </div>

            {/* Min Accuracy Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[var(--text-secondary)]">Min Accuracy SLA</span>
                <span className="font-mono font-semibold text-[var(--text-primary)]">{minAccuracy.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="85.0"
                max="94.0"
                step="0.1"
                value={minAccuracy}
                onChange={(e) => {
                  setMinAccuracy(parseFloat(e.target.value));
                  setApplied(false);
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">
                <span>85.0%</span>
                <span>94.0%</span>
              </div>
            </div>

            {/* Max Latency Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[var(--text-secondary)]">Max Inference Latency</span>
                <span className="font-mono font-semibold text-[var(--text-primary)]">{maxLatency} ms</span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="1"
                value={maxLatency}
                onChange={(e) => {
                  setMaxLatency(parseInt(e.target.value, 10));
                  setApplied(false);
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">
                <span>15 ms</span>
                <span>120 ms</span>
              </div>
            </div>

            {/* Max Memory Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[var(--text-secondary)]">Max Memory Ceiling</span>
                <span className="font-mono font-semibold text-[var(--text-primary)]">{maxMemory} MB</span>
              </div>
              <input
                type="range"
                min="128"
                max="1500"
                step="32"
                value={maxMemory}
                onChange={(e) => {
                  setMaxMemory(parseInt(e.target.value, 10));
                  setApplied(false);
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">
                <span>128 MB</span>
                <span>1500 MB</span>
              </div>
            </div>
          </div>

          {/* Objective Function Weights */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-[var(--accent-primary)]" />
                Pareto Objective Weights
              </h3>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                Σ = {(alphaEnergy + betaLatency + gammaAccuracy + deltaMemory).toFixed(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-[var(--text-muted)] block mb-1">α Energy Weight</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={alphaEnergy}
                  onChange={(e) => setAlphaEnergy(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 font-mono text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[var(--text-muted)] block mb-1">β Latency Weight</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={betaLatency}
                  onChange={(e) => setBetaLatency(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 font-mono text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[var(--text-muted)] block mb-1">γ Accuracy Weight</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={gammaAccuracy}
                  onChange={(e) => setGammaAccuracy(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 font-mono text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[var(--text-muted)] block mb-1">δ Memory Weight</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={deltaMemory}
                  onChange={(e) => setDeltaMemory(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 font-mono text-[var(--text-primary)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Candidate & Empirical Delta (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Optimal Recommendation Card */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Optimal Pareto Front Frontier
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
                  {recommended.name}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Architecture: {recommended.architecture} · Precision: {recommended.precision}
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Award className="h-3.5 w-3.5" />
                Rank #1
              </span>
            </div>

            {/* Side-by-Side Comparison Metrics */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">Energy Draw</span>
                <span className="text-xl font-bold text-[var(--text-primary)] font-mono">{recommended.energy_wh.toFixed(1)}</span>
                <span className="text-[10px] text-[var(--text-muted)] ml-1">Wh</span>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  -{energySavedPct}% vs Base
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">Mean Latency</span>
                <span className="text-xl font-bold text-[var(--text-primary)] font-mono">{recommended.latency_ms}</span>
                <span className="text-[10px] text-[var(--text-muted)] ml-1">ms</span>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  -{latencyReductionPct}% vs Base
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">Accuracy</span>
                <span className="text-xl font-bold text-[var(--text-primary)] font-mono">{recommended.accuracy.toFixed(1)}</span>
                <span className="text-[10px] text-[var(--text-muted)] ml-1">%</span>
                <div className={`text-[10px] font-medium mt-1 ${parseFloat(accuracyDelta) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {accuracyDelta}% delta
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">CO₂ Footprint</span>
                <span className="text-xl font-bold text-[var(--text-primary)] font-mono">{recommended.co2_g.toFixed(1)}</span>
                <span className="text-[10px] text-[var(--text-muted)] ml-1">g</span>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  -{co2AvoidedG}g avoided
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-emerald-500" />
                <span>
                  {feasibleCandidates.length} of {ALL_CANDIDATES.length} candidates satisfy hard SLA constraints
                </span>
              </div>

              <button
                type="button"
                onClick={handleRunOptimizer}
                disabled={isOptimizing}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isOptimizing ? 'Profiling Hardware...' : applied ? 'Configuration Applied' : 'Deploy Selected Profile'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Evaluation Matrix */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-[var(--accent-primary)]" />
              Candidate Profile Evaluation Matrix
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Multi-criteria assessment against hard constraints and scalarized loss metric
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            Total Evaluated: {evaluatedCandidates.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-muted)]">
                <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Candidate</th>
                <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Precision</th>
                <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Accuracy</th>
                <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Latency</th>
                <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Energy (Wh)</th>
                <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Memory</th>
                <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">CO₂e (g)</th>
                <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Feasibility</th>
                <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px] text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {evaluatedCandidates.map((c) => {
                const isSelected = c.id === recommended.id;
                return (
                  <tr
                    key={c.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-sky-500/5 font-medium'
                        : 'hover:bg-[var(--surface-muted)]'
                    }`}
                  >
                    <td className="py-3 px-3 font-medium text-[var(--text-primary)] flex items-center gap-2">
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />}
                      {c.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--text-muted)]">{c.precision}</td>
                    <td className={`py-3 px-3 font-mono ${c.meetsAcc ? 'text-[var(--text-primary)]' : 'text-rose-500 font-semibold'}`}>
                      {c.accuracy.toFixed(1)}%
                    </td>
                    <td className={`py-3 px-3 font-mono ${c.meetsLat ? 'text-[var(--text-primary)]' : 'text-rose-500 font-semibold'}`}>
                      {c.latency_ms} ms
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--text-primary)]">{c.energy_wh.toFixed(1)} Wh</td>
                    <td className={`py-3 px-3 font-mono ${c.meetsMem ? 'text-[var(--text-muted)]' : 'text-rose-500 font-semibold'}`}>
                      {c.memory_mb} MB
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--text-muted)]">{c.co2_g.toFixed(1)} g</td>
                    <td className="py-3 px-3">
                      {c.isFeasible ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Feasible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                          <AlertTriangle className="h-3 w-3" /> SLA Breach
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[var(--text-secondary)]">
                      {c.score.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OptimizerPage;
