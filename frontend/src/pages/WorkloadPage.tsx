import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { PlusCircle, Search, Filter, Layers, Zap, Clock, RefreshCw, X, Sparkles } from 'lucide-react';
import type { Workload } from '../types';

const mockWorkloads: Workload[] = [
  {
    id: 'WL-1001',
    name: 'ResNet-50 ImageNet-1k Validation',
    model_type: 'Computer Vision',
    status: 'completed',
    energy_wh: 14.8,
    carbon_g: 12.1,
    latency_ms: 38,
    accuracy: 93.8,
    created_at: '2026-11-13T09:30:00Z',
  },
  {
    id: 'WL-1002',
    name: 'BERT-Base Sentiment Embeddings',
    model_type: 'NLP Inference',
    status: 'completed',
    energy_wh: 22.4,
    carbon_g: 18.3,
    latency_ms: 45,
    accuracy: 91.2,
    created_at: '2026-11-13T10:15:00Z',
  },
  {
    id: 'WL-1003',
    name: 'Llama-3-8B QLoRA Instruct Finetune',
    model_type: 'Generative AI',
    status: 'running',
    energy_wh: 248.6,
    carbon_g: 203.8,
    latency_ms: 420,
    accuracy: 89.4,
    created_at: '2026-11-13T11:45:00Z',
  },
  {
    id: 'WL-1004',
    name: 'Whisper-Large-v3 Audio Benchmark',
    model_type: 'Audio Speech',
    status: 'pending',
    energy_wh: 0,
    carbon_g: 0,
    latency_ms: 0,
    accuracy: 0,
    created_at: '2026-11-13T12:00:00Z',
  },
  {
    id: 'WL-1005',
    name: 'YOLOv8 Real-Time Video Object Detection',
    model_type: 'Computer Vision',
    status: 'completed',
    energy_wh: 31.2,
    carbon_g: 25.5,
    latency_ms: 22,
    accuracy: 88.5,
    created_at: '2026-11-13T08:10:00Z',
  },
];

export const WorkloadPage: React.FC = () => {
  const [workloads, setWorkloads] = useState<Workload[]>(mockWorkloads);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    model_type: 'Computer Vision',
    dataset: '',
    precision: 'INT8',
    min_accuracy: 90,
    max_latency: 100,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newWorkload: Workload = {
        id: `WL-${Math.floor(1000 + Math.random() * 9000)}`,
        name: formData.name || 'Custom ML Workload',
        model_type: formData.model_type,
        status: 'running',
        energy_wh: 18.5,
        carbon_g: 15.1,
        latency_ms: 42,
        accuracy: formData.min_accuracy,
        created_at: new Date().toISOString(),
      };
      setWorkloads([newWorkload, ...workloads]);
      setIsSubmitting(false);
      setShowModal(false);
      setFormData({
        name: '',
        model_type: 'Computer Vision',
        dataset: '',
        precision: 'INT8',
        min_accuracy: 90,
        max_latency: 100,
      });
    }, 600);
  };

  const filteredWorkloads = workloads.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-6 border border-white/[0.08] shadow-[0_12px_40px_rgb(0,0,0,0.35)]">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Workload Orchestrator
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Workload Pipeline & Queue Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Dispatch and monitor AI workloads with strict energy, carbon, and latency SLA guarantees.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-950/60 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Submit New Workload</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (Apple Segmented Style) */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl glass-card p-4 border border-white/[0.08] shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search workloads by name, model, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl glass-pill py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 border border-white/[0.06] focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl glass-pill px-3.5 py-2.5 text-xs text-slate-200 border border-white/[0.06] focus:border-emerald-500/50 focus:outline-none cursor-pointer bg-slate-900"
          >
            <option value="all">All Statuses ({workloads.length})</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Workload History Table */}
      <div className="overflow-hidden rounded-3xl glass-card border border-white/[0.08] shadow-[0_12px_40px_rgb(0,0,0,0.35)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-400 bg-white/[0.02]">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">ID</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Workload / Model</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Energy (Wh)</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Emissions</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Latency</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Accuracy</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-right">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredWorkloads.map((wl) => (
                <tr key={wl.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-emerald-400">{wl.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{wl.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{wl.model_type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={wl.status} />
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-emerald-300">
                    {wl.energy_wh > 0 ? `${wl.energy_wh.toFixed(1)} Wh` : '—'}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-300">
                    {wl.carbon_g > 0 ? `${wl.carbon_g.toFixed(1)} g CO₂` : '—'}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-300">
                    {wl.latency_ms > 0 ? `${wl.latency_ms} ms` : '—'}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-300">
                    {wl.accuracy > 0 ? `${wl.accuracy.toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400 font-mono text-[11px]">
                    {new Date(wl.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Submitting New Workload (Apple Sheet Style) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md transition-opacity">
          <div className="w-full max-w-lg rounded-3xl glass-card bg-[#0b0f19]/95 p-6 sm:p-7 border border-white/[0.12] shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Submit Green Workload</h3>
                  <p className="text-[11px] text-slate-400">Specify pipeline accuracy & latency thresholds</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Workload Identifier / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VisionTransformer-ViT-B16 Eval"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl glass-pill p-3 text-white border border-white/[0.08] focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1.5">Model Architecture</label>
                  <select
                    value={formData.model_type}
                    onChange={(e) => setFormData({ ...formData, model_type: e.target.value })}
                    className="w-full rounded-xl glass-pill p-3 text-white border border-white/[0.08] focus:border-emerald-500 focus:outline-none bg-slate-900"
                  >
                    <option value="Computer Vision">Computer Vision (CNN / ViT)</option>
                    <option value="NLP Inference">NLP Inference (BERT / RoBERTa)</option>
                    <option value="Generative AI">Generative AI (Llama / Mistral)</option>
                    <option value="Audio Speech">Audio Speech (Whisper)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1.5">Target Quantization</label>
                  <select
                    value={formData.precision}
                    onChange={(e) => setFormData({ ...formData, precision: e.target.value })}
                    className="w-full rounded-xl glass-pill p-3 text-white border border-white/[0.08] focus:border-emerald-500 focus:outline-none bg-slate-900"
                  >
                    <option value="INT8">INT8 (Max Energy Reduction)</option>
                    <option value="ONNX">ONNX Runtime Graph Optimized</option>
                    <option value="FP16">FP16 Half Precision</option>
                    <option value="FP32">FP32 Full Precision Baseline</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-medium text-slate-300">Min Accuracy SLA</label>
                    <span className="font-mono text-emerald-400 font-bold">{formData.min_accuracy}%</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="99"
                    value={formData.min_accuracy}
                    onChange={(e) => setFormData({ ...formData, min_accuracy: Number(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-medium text-slate-300">Max Latency SLA</label>
                    <span className="font-mono text-emerald-400 font-bold">{formData.max_latency} ms</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    value={formData.max_latency}
                    onChange={(e) => setFormData({ ...formData, max_latency: Number(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="rounded-2xl glass-pill p-3.5 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  GreenCompute Orchestrator will benchmark candidate execution profiles and select the minimum energy-carbon configuration satisfying your SLA.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl glass-pill px-4 py-2.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 font-bold text-white shadow-lg shadow-emerald-950/60 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  Dispatch to Orchestrator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkloadPage;
