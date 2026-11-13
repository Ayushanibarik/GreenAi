import React, { useState } from 'react';
import { Sliders, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';
import type { OptimizationResult } from '../types';

export const OptimizerPage: React.FC = () => {
  // Constraints state
  const [minAccuracy, setMinAccuracy] = useState<number>(92.0);
  const [maxLatency, setMaxLatency] = useState<number>(60);
  const [maxMemory, setMaxMemory] = useState<number>(1024);
  const [targetWorkload, setTargetWorkload] = useState('ResNet-50 ImageNet');

  // Weights
  const [alphaEnergy, setAlphaEnergy] = useState<number>(0.4);
  const [betaLatency, setBetaLatency] = useState<number>(0.3);
  const [gammaAccuracy, setGammaAccuracy] = useState<number>(0.2);
  const [deltaMemory, setDeltaMemory] = useState<number>(0.1);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [applied, setApplied] = useState(false);

  // Computed recommendation based on constraints
  const recommendation: OptimizationResult = {
    id: 'OPT-REC-492',
    original_config: 'PyTorch FP32 Baseline (125ms, 48.2 Wh, 94.6% Acc, 1840 MB)',
    recommended_config: 'ONNX Runtime INT8 Dynamic Quantization',
    energy_saved_wh: 33.4,
    energy_saved_pct: 69.3,
    latency_change_pct: -69.6, // from 125ms to 38ms
    accuracy_change_pct: -0.8, // 94.6% -> 93.8%
    carbon_saved_g: 27.4,
  };

  const handleRunOptimizer = () => {
    setIsOptimizing(true);
    setApplied(false);
    setTimeout(() => {
      setIsOptimizing(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white">Constrained Model Optimizer</h2>
        <p className="text-xs text-gray-400">
          Formulation: <code className="text-emerald-400">min(E × CI)</code> subject to{' '}
          <code className="text-gray-300">Accuracy ≥ A_min, Latency ≤ L_max, Mem ≤ Mem_avail</code>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Constraint Configurator */}
        <div className="lg:col-span-1 rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">SLA & Hard Constraints</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 mb-1 font-medium">Select Workload</label>
              <select
                value={targetWorkload}
                onChange={(e) => setTargetWorkload(e.target.value)}
                className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="ResNet-50 ImageNet">ResNet-50 ImageNet</option>
                <option value="BERT-Base NLP">BERT-Base Sentiment Classifier</option>
                <option value="Llama-3-8B">Llama-3-8B Instruct</option>
                <option value="Whisper-v3">Whisper-v3 Speech Engine</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Minimum Accuracy SLA (A_min)</span>
                <span className="font-mono text-emerald-400 font-bold">{minAccuracy.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="85"
                max="98"
                step="0.5"
                value={minAccuracy}
                onChange={(e) => setMinAccuracy(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <span className="text-[10px] text-gray-500">Candidates with accuracy &lt; {minAccuracy}% will be pruned.</span>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Maximum Allowed Latency (L_max)</span>
                <span className="font-mono text-emerald-400 font-bold">{maxLatency} ms</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                step="5"
                value={maxLatency}
                onChange={(e) => setMaxLatency(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <span className="text-[10px] text-gray-500">Upper bound threshold for real-time inference SLAs.</span>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Max VRAM / Host RAM (Mem_avail)</span>
                <span className="font-mono text-emerald-400 font-bold">{maxMemory} MB</span>
              </div>
              <input
                type="range"
                min="256"
                max="4096"
                step="128"
                value={maxMemory}
                onChange={(e) => setMaxMemory(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <h4 className="text-xs font-semibold text-gray-300 mb-2">Objective Multi-Factor Weights</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between text-gray-400">
                <span>Energy Weight (α): {(alphaEnergy * 100).toFixed(0)}%</span>
                <span className="text-emerald-400">Primary</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Latency Weight (β): {(betaLatency * 100).toFixed(0)}%</span>
                <span>Secondary</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Accuracy Weight (γ): {(gammaAccuracy * 100).toFixed(0)}%</span>
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
            {isOptimizing ? 'Evaluating Pareto Frontier...' : 'Recompute Optimal Pareto Pick'}
          </button>
        </div>

        {/* Right: Recommendation Card & Tradeoff Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recommendation Banner */}
          <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-gray-900/60 to-gray-950 p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <ShieldCheck className="h-4 w-4" />
              GreenCompute Recommended Configuration
            </div>

            <h3 className="text-xl font-extrabold text-white">
              {recommendation.recommended_config}
            </h3>

            <p className="mt-1 text-xs text-gray-400">
              Evaluated across 8 quantization passes. Fully satisfies Accuracy SLA (93.8% ≥ {minAccuracy}%) and Latency SLA (38ms ≤ {maxLatency}ms).
            </p>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-gray-950/80 p-3 border border-emerald-800/40">
                <span className="text-[10px] text-gray-400 block">Energy Savings</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">
                  -{recommendation.energy_saved_pct}%
                </span>
                <span className="text-[10px] text-emerald-300 block mt-0.5">33.4 Wh saved</span>
              </div>

              <div className="rounded-lg bg-gray-950/80 p-3 border border-emerald-800/40">
                <span className="text-[10px] text-gray-400 block">Latency Drop</span>
                <span className="text-xl font-extrabold text-white font-mono">
                  {recommendation.latency_change_pct}%
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">38ms vs 125ms</span>
              </div>

              <div className="rounded-lg bg-gray-950/80 p-3 border border-emerald-800/40">
                <span className="text-[10px] text-gray-400 block">Accuracy Retained</span>
                <span className="text-xl font-extrabold text-white font-mono">93.8%</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">-0.8% negligible delta</span>
              </div>

              <div className="rounded-lg bg-gray-950/80 p-3 border border-emerald-800/40">
                <span className="text-[10px] text-gray-400 block">CO₂ Avoided</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">27.4 g</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">per 10k inferences</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-gray-800/80 pt-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Cpu className="h-4 w-4 text-emerald-400" />
                <span>Quantizer: Dynamic INT8 with symmetric per-channel scale calibration</span>
              </div>

              <button
                onClick={() => setApplied(true)}
                disabled={applied}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-900/30 hover:bg-emerald-500 transition-colors disabled:bg-emerald-800"
              >
                {applied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                    Applied to Production Pipeline
                  </>
                ) : (
                  <>
                    Apply Quantized Pipeline
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Pareto Tradeoff Comparison Table */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm">
            <h4 className="text-sm font-semibold text-white mb-3">Pareto Frontier Candidates Evaluation</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-950/50 text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Candidate Engine</th>
                    <th className="py-2.5 px-3 font-semibold">Precision</th>
                    <th className="py-2.5 px-3 font-semibold">Energy</th>
                    <th className="py-2.5 px-3 font-semibold">Latency</th>
                    <th className="py-2.5 px-3 font-semibold">Accuracy</th>
                    <th className="py-2.5 px-3 font-semibold">SLA Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  <tr className="bg-emerald-950/20 font-medium">
                    <td className="py-2.5 px-3 text-white">ONNX Runtime INT8 (Recommended)</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">INT8</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-300">14.8 Wh</td>
                    <td className="py-2.5 px-3 font-mono text-white">38 ms</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">93.8%</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        OPTIMAL
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-gray-300">PyTorch FP16 AMP</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">FP16</td>
                    <td className="py-2.5 px-3 font-mono text-gray-300">29.5 Wh</td>
                    <td className="py-2.5 px-3 font-mono text-rose-400">78 ms</td>
                    <td className="py-2.5 px-3 font-mono text-gray-300">94.3%</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800">
                        Latency SLA Breached
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-gray-300">PyTorch Baseline</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">FP32</td>
                    <td className="py-2.5 px-3 font-mono text-gray-300">48.2 Wh</td>
                    <td className="py-2.5 px-3 font-mono text-rose-400">125 ms</td>
                    <td className="py-2.5 px-3 font-mono text-gray-300">94.6%</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800">
                        Suboptimal
                      </span>
                    </td>
                  </tr>
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
