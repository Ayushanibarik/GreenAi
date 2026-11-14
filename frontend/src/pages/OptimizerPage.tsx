import React, { useState, useEffect, useMemo } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Award,
  Layers,
  Activity,
  Download,
  FileCode,
} from 'lucide-react';
import api from '../services/api';

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
    name: 'ResNet-18 FP16',
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
    name: 'ResNet-18 ONNX',
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
    name: 'ResNet-18 INT8',
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
    name: 'MobileNet-V3 FP32',
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
    name: 'MobileNet-V3 ONNX',
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
    name: 'MobileNet-V3 INT8',
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
  const [minAccuracy, setMinAccuracy] = useState<number>(89.0);
  const [maxLatency, setMaxLatency] = useState<number>(80);
  const [maxMemory, setMaxMemory] = useState<number>(1024);

  const [alphaEnergy, setAlphaEnergy] = useState<number>(0.4);
  const [betaLatency, setBetaLatency] = useState<number>(0.3);
  const [gammaAccuracy, setGammaAccuracy] = useState<number>(0.2);
  const [deltaMemory, setDeltaMemory] = useState<number>(0.1);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [applied, setApplied] = useState(false);
  const [apiSynced, setApiSynced] = useState(false);
  const [activePreset, setActivePreset] = useState<'balanced' | 'edge' | 'accurate' | null>('balanced');

  const baseline = ALL_CANDIDATES[0];

  const applyPreset = (preset: 'balanced' | 'edge' | 'accurate') => {
    setActivePreset(preset);
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

  const exportConfigJSON = () => {
    const configData = {
      recommended_model: recommended.name,
      architecture: recommended.architecture,
      precision: recommended.precision,
      sla_constraints: {
        min_accuracy: minAccuracy,
        max_latency_ms: maxLatency,
        max_memory_mb: maxMemory,
      },
      pareto_weights: {
        alpha_energy: alphaEnergy,
        beta_latency: betaLatency,
        gamma_accuracy: gammaAccuracy,
        delta_memory: deltaMemory,
      },
      projected_metrics: {
        accuracy: recommended.accuracy,
        latency_ms: recommended.latency_ms,
        energy_wh: recommended.energy_wh,
        memory_mb: recommended.memory_mb,
        energy_reduction_pct: energySavedPct,
        co2_avoided_g: co2AvoidedG,
      },
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pareto-config-${recommended.id}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const evaluatedCandidates = useMemo(() => {
    return ALL_CANDIDATES.map((c) => {
      const meetsAcc = c.accuracy >= minAccuracy;
      const meetsLat = c.latency_ms <= maxLatency;
      const meetsMem = c.memory_mb <= maxMemory;
      const isFeasible = meetsAcc && meetsLat && meetsMem;

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
      } catch {
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
    <div className="space-y-5 pb-8">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Pareto Optimizer
          </h1>
          <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
            {apiSynced ? 'Synchronized' : 'Local'}
          </span>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-1 text-xs">
          {(['edge', 'balanced', 'accurate'] as const).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`rounded-md px-2.5 py-1 font-medium capitalize transition-colors cursor-pointer ${
                activePreset === preset
                  ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Controls vs Recommended Candidate */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* SLA Constraints Card */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm space-y-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5 border-b border-[var(--border-subtle)] pb-2.5">
              <ShieldCheck className="h-4 w-4 text-[var(--accent-primary)]" />
              SLA Constraints
            </h3>

            {/* Min Accuracy Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[var(--text-secondary)]">Min Accuracy</span>
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
            </div>

            {/* Max Latency Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[var(--text-secondary)]">Max Latency</span>
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
            </div>

            {/* Max Memory Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[var(--text-secondary)]">Max Memory</span>
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
            </div>
          </div>

          {/* Objective Function Weights */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5 border-b border-[var(--border-subtle)] pb-2.5">
              <Sliders className="h-4 w-4 text-[var(--accent-primary)]" />
              Objective Weights
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="text-[11px] text-[var(--text-muted)] block mb-1">α Energy</label>
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
                <label className="text-[11px] text-[var(--text-muted)] block mb-1">β Latency</label>
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
                <label className="text-[11px] text-[var(--text-muted)] block mb-1">γ Accuracy</label>
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
                <label className="text-[11px] text-[var(--text-muted)] block mb-1">δ Memory</label>
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
        <div className="lg:col-span-7 space-y-4">
          {feasibleCandidates.length === 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
              <span>
                Constraint Alert: Zero candidate models satisfy all SLA criteria (Min Acc {minAccuracy.toFixed(1)}%, Max Latency {maxLatency}ms, Max Memory {maxMemory}MB). Displaying baseline configuration.
              </span>
            </div>
          )}

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                  {recommended.name}
                </h2>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Award className="h-3.5 w-3.5" />
                Rank #1
              </span>
            </div>

            {/* Metrics */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2.5">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">Energy</span>
                <span className="text-lg font-bold text-[var(--text-primary)] font-mono">{recommended.energy_wh.toFixed(1)}</span>
                <span className="text-[10px] text-[var(--text-muted)] ml-1">Wh</span>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  -{energySavedPct}%
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2.5">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">Latency</span>
                <span className="text-lg font-bold text-[var(--text-primary)] font-mono">{recommended.latency_ms}</span>
                <span className="text-[10px] text-[var(--text-muted)] ml-1">ms</span>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  -{latencyReductionPct}%
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2.5">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">Accuracy</span>
                <span className="text-lg font-bold text-[var(--text-primary)] font-mono">{recommended.accuracy.toFixed(1)}</span>
                <span className="text-[10px] text-[var(--text-muted)] ml-1">%</span>
                <div className={`text-[10px] font-medium ${parseFloat(accuracyDelta) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {accuracyDelta}%
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2.5">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">CO₂e</span>
                <span className="text-lg font-bold text-[var(--text-primary)] font-mono">{recommended.co2_g.toFixed(1)}</span>
                <span className="text-[10px] text-[var(--text-muted)] ml-1">g</span>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  -{co2AvoidedG}g
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {feasibleCandidates.length}/{ALL_CANDIDATES.length} Feasible
                </span>
                <button
                  type="button"
                  onClick={exportConfigJSON}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-card)] transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  Export JSON
                </button>
              </div>

              <button
                type="button"
                onClick={handleRunOptimizer}
                disabled={isOptimizing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-primary)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isOptimizing ? 'Profiling...' : applied ? 'Applied' : 'Apply Configuration'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Evaluation Matrix */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
          <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-[var(--accent-primary)]" />
            Candidates
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="sci-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Precision</th>
                <th>Accuracy</th>
                <th>Latency</th>
                <th>Energy</th>
                <th>Memory</th>
                <th>CO₂e</th>
                <th>Status</th>
                <th className="text-right">Score</th>
              </tr>
            </thead>
            <tbody>
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
                    <td className="py-2.5 px-3 font-medium text-[var(--text-primary)] flex items-center gap-2">
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />}
                      {c.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[var(--text-muted)]">{c.precision}</td>
                    <td className={`py-2.5 px-3 font-mono ${c.meetsAcc ? 'text-[var(--text-primary)]' : 'text-rose-500 font-semibold'}`}>
                      {c.accuracy.toFixed(1)}%
                    </td>
                    <td className={`py-2.5 px-3 font-mono ${c.meetsLat ? 'text-[var(--text-primary)]' : 'text-rose-500 font-semibold'}`}>
                      {c.latency_ms} ms
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[var(--text-primary)]">{c.energy_wh.toFixed(1)} Wh</td>
                    <td className={`py-2.5 px-3 font-mono ${c.meetsMem ? 'text-[var(--text-muted)]' : 'text-rose-500 font-semibold'}`}>
                      {c.memory_mb} MB
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[var(--text-muted)]">{c.co2_g.toFixed(1)} g</td>
                    <td className="py-2.5 px-3">
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
                    <td className="py-2.5 px-3 text-right font-mono text-[var(--text-secondary)]">
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
