import React, { useState, useEffect, useMemo } from 'react';
import {
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  ArrowRight,
  TrendingDown,
  Zap,
  Leaf,
  Timer,
  Award,
  Layers,
  Activity,
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
    name: 'ResNet-18 FP32 (Unoptimized Baseline)',
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
    name: 'ResNet-18 FP16 AMP',
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
    name: 'ResNet-18 ONNX Runtime Graph Engine',
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
    name: 'ResNet-18 INT8 Dynamic Quantization',
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
    name: 'MobileNet-V3 Small FP32 Architecture Swap',
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
    name: 'MobileNet-V3 ONNX Runtime Engine',
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
    name: 'MobileNet-V3 INT8 Ultra-Green Quantized',
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

  // Quick Preset Helper (Apple-style presets)
  const applyPreset = (preset: 'balanced' | 'edge' | 'accurate') => {
    if (preset === 'edge') {
      setMinAccuracy(88.5);
      setMaxLatency(30);
      setMaxMemory(256);
    } else if (preset === 'balanced') {
      setMinAccuracy(89.5);
      setMaxLatency(60);
      setMaxMemory(512);
    } else if (preset === 'accurate') {
      setMinAccuracy(92.5);
      setMaxLatency(90);
      setMaxMemory(1024);
    }
    setApplied(false);
  };

  // Multi-Objective Pareto Evaluation
  const evaluatedCandidates = useMemo(() => {
    return ALL_CANDIDATES.map((c) => {
      const meetsAcc = c.accuracy >= minAccuracy;
      const meetsLat = c.latency_ms <= maxLatency;
      const meetsMem = c.memory_mb <= maxMemory;
      const isFeasible = meetsAcc && meetsLat && meetsMem;

      // Normalized cost: lower is better
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

  // Find greenest feasible candidate
  const feasibleCandidates = evaluatedCandidates.filter((c) => c.isFeasible);
  const recommended = useMemo(() => {
    if (feasibleCandidates.length === 0) return evaluatedCandidates[0];
    return [...feasibleCandidates].sort((a, b) => a.score - b.score)[0];
  }, [feasibleCandidates, evaluatedCandidates]);

  // Connect to backend API when constraints change
  useEffect(() => {
    let active = true;
    const syncBackend = async () => {
      try {
        await api.optimize({
          min_accuracy: minAccuracy,
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
    setApplied(false);
    try {
      await api.predict({
        model_name: recommended.architecture,
        precision: recommended.precision,
        batch_size: 32,
      });
    } catch {
      // offline fallback
    }
    setTimeout(() => {
      setIsOptimizing(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header and Live Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">Constrained Model Pareto Optimizer</h2>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
              Pareto Frontier
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Formulation: <span className="text-emerald-400 font-semibold">min(E × CI)</span> subject to{' '}
            <span className="text-slate-200">Accuracy ≥ A_min, Latency ≤ L_max, Memory ≤ Mem_avail</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold glass-pill transition-colors ${
              apiSynced
                ? 'border-emerald-500/30 text-emerald-300'
                : 'text-slate-400 border-white/10'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${apiSynced ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            {apiSynced ? 'Backend Engine Connected' : 'Local Optimizer Active'}
          </span>
        </div>
      </div>

      {/* Main Grid: Controls vs Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dynamic Constraint Controls (Apple Settings Card) */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 border border-white/[0.08] shadow-lg shadow-black/40 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Sliders className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">SLA Constraints</h3>
            </div>
          </div>

          {/* SLA Preset Pills */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Optimization Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('edge')}
                className="rounded-xl glass-pill py-2 px-2.5 text-xs font-semibold text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-all text-center"
              >
                ⚡ Edge ≤30ms
              </button>
              <button
                type="button"
                onClick={() => applyPreset('balanced')}
                className="rounded-xl glass-pill py-2 px-2.5 text-xs font-semibold text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-all text-center"
              >
                ⚖️ Balanced
              </button>
              <button
                type="button"
                onClick={() => applyPreset('accurate')}
                className="rounded-xl glass-pill py-2 px-2.5 text-xs font-semibold text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-all text-center"
              >
                🎯 High Acc
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-5 text-xs">
            {/* Accuracy Slider */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1.5">
                <span className="font-medium">Minimum Accuracy SLA (A_min)</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {minAccuracy.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="85.0"
                max="94.0"
                step="0.5"
                value={minAccuracy}
                onChange={(e) => {
                  setMinAccuracy(Number(e.target.value));
                  setApplied(false);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>85.0% (Permissive)</span>
                <span>94.0% (Strict)</span>
              </div>
            </div>

            {/* Latency Slider */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1.5">
                <span className="font-medium">Maximum Latency Ceiling (L_max)</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {maxLatency} ms
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="5"
                value={maxLatency}
                onChange={(e) => {
                  setMaxLatency(Number(e.target.value));
                  setApplied(false);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>15 ms (Real-time Edge)</span>
                <span>120 ms (Batch Inference)</span>
              </div>
            </div>

            {/* Memory Slider */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1.5">
                <span className="font-medium">Memory / VRAM Ceiling</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {maxMemory} MB
                </span>
              </div>
              <input
                type="range"
                min="128"
                max="1500"
                step="64"
                value={maxMemory}
                onChange={(e) => {
                  setMaxMemory(Number(e.target.value));
                  setApplied(false);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>128 MB</span>
                <span>1500 MB</span>
              </div>
            </div>
          </div>

          {/* Objective Multi-Factor Weights */}
          <div className="border-t border-white/[0.06] pt-4 space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Objective Multi-Factor Weights
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>α - Energy Weight ({(alphaEnergy * 100).toFixed(0)}%)</span>
                <span className="text-emerald-400 font-bold text-[11px] bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                  Primary
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>β - Latency Weight ({(betaLatency * 100).toFixed(0)}%)</span>
                <span className="text-slate-300 font-medium">Secondary</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>γ - Accuracy Penalty ({(gammaAccuracy * 100).toFixed(0)}%)</span>
                <span className="text-slate-300 font-medium">Guardrail</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunOptimizer}
            disabled={isOptimizing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 active:scale-[0.99]"
          >
            <Sparkles className="h-4 w-4" />
            {isOptimizing ? 'Evaluating Pareto Frontier...' : 'Recompute ML Predictor'}
          </button>
        </div>

        {/* Right: Side-by-Side Comparison & Recommendation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Card: Unoptimized Baseline */}
            <div className="glass-card rounded-2xl p-5 border border-white/[0.08] shadow-lg relative">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Unoptimized Baseline
                </span>
                <span className="rounded-full glass-pill px-2.5 py-0.5 text-[10px] font-mono text-slate-300">
                  Standard FP32
                </span>
              </div>

              <h4 className="text-base font-bold text-white mb-4">{baseline.name}</h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl glass-pill p-3 border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Energy per Run</span>
                  <span className="text-lg font-bold text-rose-400 font-mono mt-0.5 block">{baseline.energy_wh} Wh</span>
                </div>
                <div className="rounded-xl glass-pill p-3 border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Inference Latency</span>
                  <span className="text-lg font-bold text-rose-400 font-mono mt-0.5 block">{baseline.latency_ms} ms</span>
                </div>
                <div className="rounded-xl glass-pill p-3 border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Top-1 Accuracy</span>
                  <span className="text-lg font-bold text-slate-200 font-mono mt-0.5 block">{baseline.accuracy}%</span>
                </div>
                <div className="rounded-xl glass-pill p-3 border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">CO₂e Emissions</span>
                  <span className="text-lg font-bold text-slate-400 font-mono mt-0.5 block">{baseline.co2_g} g</span>
                </div>
              </div>
            </div>

            {/* Right Card: Recommended Green Config (Apple Highlight Card) */}
            <div className="glass-card rounded-2xl p-5 border-2 border-emerald-500/60 bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950/80 shadow-[0_0_30px_rgba(16,185,129,0.2)] relative">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3 mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  RECOMMENDED GREEN CONFIG
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-500/40 font-bold">
                  {recommended.precision}
                </span>
              </div>

              <h4 className="text-base font-bold text-white mb-4">{recommended.name}</h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-950/60 p-3 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">Energy per Run</span>
                  <span className="text-lg font-bold text-emerald-300 font-mono mt-0.5 block">
                    {recommended.energy_wh} Wh <span className="text-xs text-emerald-400 font-bold">(-{energySavedPct}%)</span>
                  </span>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-3 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">Inference Latency</span>
                  <span className="text-lg font-bold text-white font-mono mt-0.5 block">
                    {recommended.latency_ms} ms <span className="text-xs text-emerald-400 font-bold">(-{latencyReductionPct}%)</span>
                  </span>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-3 border border-emerald-500/30">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Top-1 Accuracy</span>
                  <span className="text-lg font-bold text-white font-mono mt-0.5 block">
                    {recommended.accuracy}% <span className="text-xs text-emerald-400">({accuracyDelta}%)</span>
                  </span>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-3 border border-emerald-500/30">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">CO₂e Emissions</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">
                    {recommended.co2_g} g <span className="text-xs text-emerald-300">(-{co2AvoidedG}g)</span>
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-emerald-500/30 pt-3">
                <span className="text-[11px] text-emerald-300 font-medium">
                  ✓ Meets SLA: {recommended.accuracy}% ≥ {minAccuracy}% & {recommended.latency_ms}ms ≤ {maxLatency}ms
                </span>
                <button
                  onClick={() => setApplied(true)}
                  disabled={applied}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400 transition-colors disabled:bg-emerald-800 disabled:text-slate-400"
                >
                  {applied ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Applied
                    </>
                  ) : (
                    <>
                      Apply Config
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Architecture & Quantization Matrix Table */}
          <div className="glass-card rounded-2xl p-6 border border-white/[0.08] shadow-lg">
            <div className="mb-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Full Architecture & Quantization Matrix</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Feasible models meeting your SLA are active; optimal green choice highlighted in emerald
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-slate-400">
                    <th className="py-3 px-3 uppercase tracking-wider text-[10px] font-semibold">Candidate Model</th>
                    <th className="py-3 px-3 uppercase tracking-wider text-[10px] font-semibold">Precision</th>
                    <th className="py-3 px-3 uppercase tracking-wider text-[10px] font-semibold">Accuracy</th>
                    <th className="py-3 px-3 uppercase tracking-wider text-[10px] font-semibold">Latency</th>
                    <th className="py-3 px-3 uppercase tracking-wider text-[10px] font-semibold">Energy</th>
                    <th className="py-3 px-3 uppercase tracking-wider text-[10px] font-semibold">CO₂e</th>
                    <th className="py-3 px-3 uppercase tracking-wider text-[10px] font-semibold text-right">Feasibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-mono">
                  {evaluatedCandidates.map((c) => {
                    const isRec = c.id === recommended.id;
                    return (
                      <tr
                        key={c.id}
                        className={`transition-colors ${
                          isRec
                            ? 'bg-emerald-500/10 border-l-4 border-l-emerald-400 font-semibold'
                            : c.isFeasible
                            ? 'hover:bg-white/[0.02]'
                            : 'opacity-35 hover:bg-white/[0.01]'
                        }`}
                      >
                        <td className="py-3 px-3 text-white font-sans flex items-center gap-2">
                          {c.name}
                          {isRec && (
                            <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[9px] font-extrabold text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                              Optimal
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-emerald-400 font-bold">{c.precision}</td>
                        <td className={`py-3 px-3 ${!c.meetsAcc ? 'text-rose-400' : 'text-slate-200'}`}>
                          {c.accuracy}%
                        </td>
                        <td className={`py-3 px-3 ${!c.meetsLat ? 'text-rose-400' : 'text-slate-200'}`}>
                          {c.latency_ms} ms
                        </td>
                        <td className="py-3 px-3 text-emerald-300">{c.energy_wh} Wh</td>
                        <td className="py-3 px-3 text-slate-400">{c.co2_g} g</td>
                        <td className="py-3 px-3 text-right font-sans">
                          {isRec ? (
                            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                              RECOMMENDED
                            </span>
                          ) : c.isFeasible ? (
                            <span className="text-[10px] text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded-full border border-teal-500/30">
                              FEASIBLE
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">
                              {!c.meetsAcc ? 'Acc SLA Pruned' : !c.meetsLat ? 'Lat Ceiling Pruned' : 'Pruned'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizerPage;
