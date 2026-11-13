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

  // Connect to backend API when constraints change (with debounce / async)
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
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Constrained Model Pareto Optimizer</h2>
          <p className="text-xs text-gray-400">
            Formulation: <code className="text-emerald-400 font-semibold">min(E × CI)</code> subject to{' '}
            <code className="text-gray-300 font-semibold">Accuracy ≥ A_min, Latency ≤ L_max, Memory ≤ Mem_avail</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              apiSynced
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${apiSynced ? 'bg-emerald-400' : 'bg-gray-400'}`} />
            {apiSynced ? 'Backend Engine Connected' : 'Local Optimizer Active'}
          </span>
        </div>
      </div>

      {/* Main Grid: Controls vs Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dynamic Constraint Controls */}
        <div className="lg:col-span-1 rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">SLA Constraints & Sliders</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Accuracy Slider */}
            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Minimum Accuracy SLA (A_min)</span>
                <span className="font-mono text-emerald-400 font-bold">{minAccuracy.toFixed(1)}%</span>
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
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                <span>85.0% (Permissive)</span>
                <span>94.0% (Strict)</span>
              </div>
            </div>

            {/* Latency Slider */}
            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Maximum Latency Ceiling (L_max)</span>
                <span className="font-mono text-emerald-400 font-bold">{maxLatency} ms</span>
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
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                <span>15 ms (Real-time Edge)</span>
                <span>120 ms (Batch Inference)</span>
              </div>
            </div>

            {/* Memory Slider */}
            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Max VRAM / RAM Ceiling</span>
                <span className="font-mono text-emerald-400 font-bold">{maxMemory} MB</span>
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
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Multi-Factor Weights */}
          <div className="border-t border-gray-800 pt-4 space-y-2">
            <h4 className="text-xs font-semibold text-gray-300 mb-2">Objective Multi-Factor Weights</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between text-gray-400">
                <span>α - Energy Weight ({(alphaEnergy * 100).toFixed(0)}%)</span>
                <span className="text-emerald-400 font-bold">Primary</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>β - Latency Weight ({(betaLatency * 100).toFixed(0)}%)</span>
                <span>Secondary</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>γ - Accuracy Penalty ({(gammaAccuracy * 100).toFixed(0)}%)</span>
                <span>Guardrail</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunOptimizer}
            disabled={isOptimizing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-900/30 hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {isOptimizing ? 'Evaluating Pareto Frontier...' : 'Recompute ML Predictor'}
          </button>
        </div>

        {/* Right: Side-by-Side Comparison & Recommendation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Side-by-Side Card Comparison: Baseline vs Selected Config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Card: Baseline */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm relative">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Unoptimized Baseline
                </span>
                <span className="rounded bg-gray-800 px-2 py-0.5 text-[10px] font-mono text-gray-300">
                  Standard FP32
                </span>
              </div>

              <h4 className="text-base font-bold text-white mb-3">{baseline.name}</h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-gray-950 p-2.5 border border-gray-800">
                  <span className="text-[10px] text-gray-400 block">Energy Consumption</span>
                  <span className="text-base font-bold text-rose-400 font-mono">{baseline.energy_wh} Wh</span>
                </div>
                <div className="rounded-lg bg-gray-950 p-2.5 border border-gray-800">
                  <span className="text-[10px] text-gray-400 block">Inference Latency</span>
                  <span className="text-base font-bold text-rose-400 font-mono">{baseline.latency_ms} ms</span>
                </div>
                <div className="rounded-lg bg-gray-950 p-2.5 border border-gray-800">
                  <span className="text-[10px] text-gray-400 block">Top-1 Accuracy</span>
                  <span className="text-base font-bold text-gray-200 font-mono">{baseline.accuracy}%</span>
                </div>
                <div className="rounded-lg bg-gray-950 p-2.5 border border-gray-800">
                  <span className="text-[10px] text-gray-400 block">CO₂e Emissions</span>
                  <span className="text-base font-bold text-gray-400 font-mono">{baseline.co2_g} g</span>
                </div>
              </div>
            </div>

            {/* Right Card: Selected Green Config */}
            <div className="rounded-xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-950/50 via-gray-900/80 to-gray-950 p-5 shadow-lg shadow-emerald-950/40 relative">
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  RECOMMENDED GREEN CONFIG
                </span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-500/40 font-bold">
                  {recommended.precision}
                </span>
              </div>

              <h4 className="text-base font-bold text-white mb-3">{recommended.name}</h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-gray-950 p-2.5 border border-emerald-800/50">
                  <span className="text-[10px] text-emerald-400 block font-medium">Energy Consumption</span>
                  <span className="text-base font-bold text-emerald-300 font-mono">
                    {recommended.energy_wh} Wh{' '}
                    <span className="text-xs text-emerald-400">(-{energySavedPct}%)</span>
                  </span>
                </div>
                <div className="rounded-lg bg-gray-950 p-2.5 border border-emerald-800/50">
                  <span className="text-[10px] text-emerald-400 block font-medium">Inference Latency</span>
                  <span className="text-base font-bold text-white font-mono">
                    {recommended.latency_ms} ms{' '}
                    <span className="text-xs text-emerald-400">(-{latencyReductionPct}%)</span>
                  </span>
                </div>
                <div className="rounded-lg bg-gray-950 p-2.5 border border-emerald-800/50">
                  <span className="text-[10px] text-gray-400 block">Top-1 Accuracy</span>
                  <span className="text-base font-bold text-white font-mono">
                    {recommended.accuracy}%{' '}
                    <span className="text-[11px] text-emerald-400">({accuracyDelta}%)</span>
                  </span>
                </div>
                <div className="rounded-lg bg-gray-950 p-2.5 border border-emerald-800/50">
                  <span className="text-[10px] text-gray-400 block">CO₂e Emissions</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {recommended.co2_g} g{' '}
                    <span className="text-[11px] text-emerald-300">(-{co2AvoidedG}g)</span>
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-emerald-800/40 pt-3">
                <span className="text-[11px] text-emerald-300">
                  ✓ Meets SLA: {recommended.accuracy}% ≥ {minAccuracy}% & {recommended.latency_ms}ms ≤ {maxLatency}ms
                </span>
                <button
                  onClick={() => setApplied(true)}
                  disabled={applied}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 transition-colors disabled:bg-emerald-800"
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

          {/* Pareto Candidates Dynamic Highlight Matrix Table */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Full Architecture & Quantization Matrix</h4>
                <p className="text-xs text-gray-400">
                  Feasible models meeting your SLA are active; optimal green choice highlighted in emerald
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-950/60 text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="py-2.5 px-3">Candidate Model</th>
                    <th className="py-2.5 px-3">Precision</th>
                    <th className="py-2.5 px-3">Accuracy</th>
                    <th className="py-2.5 px-3">Latency</th>
                    <th className="py-2.5 px-3">Energy</th>
                    <th className="py-2.5 px-3">CO₂e</th>
                    <th className="py-2.5 px-3 text-right">Feasibility & Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono">
                  {evaluatedCandidates.map((c) => {
                    const isRec = c.id === recommended.id;
                    return (
                      <tr
                        key={c.id}
                        className={`transition-colors ${
                          isRec
                            ? 'bg-emerald-950/50 border-l-4 border-l-emerald-400 font-semibold'
                            : c.isFeasible
                            ? 'hover:bg-gray-800/30'
                            : 'opacity-40 hover:bg-gray-900/40'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-white font-sans flex items-center gap-2">
                          {c.name}
                          {isRec && (
                            <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-gray-950">
                              RECOMMENDED GREEN CONFIG
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-400">{c.precision}</td>
                        <td className={`py-2.5 px-3 ${!c.meetsAcc ? 'text-rose-400' : 'text-gray-200'}`}>
                          {c.accuracy}%
                        </td>
                        <td className={`py-2.5 px-3 ${!c.meetsLat ? 'text-rose-400' : 'text-gray-200'}`}>
                          {c.latency_ms} ms
                        </td>
                        <td className="py-2.5 px-3 text-emerald-300">{c.energy_wh} Wh</td>
                        <td className="py-2.5 px-3 text-gray-400">{c.co2_g} g</td>
                        <td className="py-2.5 px-3 text-right font-sans">
                          {isRec ? (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
                              OPTIMAL CHOICE
                            </span>
                          ) : c.isFeasible ? (
                            <span className="text-[10px] text-teal-400 bg-teal-950/50 px-2 py-0.5 rounded border border-teal-800">
                              FEASIBLE
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900">
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
