import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { PlusCircle, Search, Filter, Layers, Zap, Clock, RefreshCw } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Workload Pipeline Management</h2>
          <p className="text-xs text-gray-400">
            Submit machine learning jobs with strict energy and latency SLAs
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-900/30 hover:bg-emerald-500 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Submit New Workload
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by workload name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-800 bg-gray-950 py-2 pl-9 pr-3 text-xs text-gray-200 placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Workload History Table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/70 text-gray-400 border-b border-gray-800">
              <tr>
                <th className="px-5 py-3 font-semibold">ID</th>
                <th className="px-5 py-3 font-semibold">Workload / Model</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Energy (Wh)</th>
                <th className="px-5 py-3 font-semibold">Emissions</th>
                <th className="px-5 py-3 font-semibold">Latency</th>
                <th className="px-5 py-3 font-semibold">Accuracy</th>
                <th className="px-5 py-3 font-semibold text-right">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredWorkloads.map((wl) => (
                <tr key={wl.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4 font-mono font-medium text-emerald-400">{wl.id}</td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{wl.name}</div>
                    <div className="text-[10px] text-gray-500">{wl.model_type}</div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={wl.status} />
                  </td>
                  <td className="px-5 py-4 font-mono text-emerald-300">
                    {wl.energy_wh > 0 ? `${wl.energy_wh.toFixed(1)} Wh` : '—'}
                  </td>
                  <td className="px-5 py-4 font-mono text-gray-300">
                    {wl.carbon_g > 0 ? `${wl.carbon_g.toFixed(1)} g CO₂` : '—'}
                  </td>
                  <td className="px-5 py-4 font-mono text-gray-300">
                    {wl.latency_ms > 0 ? `${wl.latency_ms} ms` : '—'}
                  </td>
                  <td className="px-5 py-4 font-mono text-gray-300">
                    {wl.accuracy > 0 ? `${wl.accuracy.toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-5 py-4 text-right text-gray-500 font-mono text-[11px]">
                    {new Date(wl.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Submitting New Workload */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-400" />
                Submit New Green Workload
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-300 mb-1">Workload Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VisionTransformer-ViT-B16 Eval"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-800 bg-gray-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-300 mb-1">Model Architecture</label>
                  <select
                    value={formData.model_type}
                    onChange={(e) => setFormData({ ...formData, model_type: e.target.value })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Computer Vision">Computer Vision (CNN / ViT)</option>
                    <option value="NLP Inference">NLP Inference (BERT / RoBERTa)</option>
                    <option value="Generative AI">Generative AI (Llama / Mistral)</option>
                    <option value="Audio Speech">Audio Speech (Whisper)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-300 mb-1">Target Quantization</label>
                  <select
                    value={formData.precision}
                    onChange={(e) => setFormData({ ...formData, precision: e.target.value })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="INT8">INT8 (Max Energy Reduction)</option>
                    <option value="ONNX">ONNX Runtime Graph Optimized</option>
                    <option value="FP16">FP16 Half Precision</option>
                    <option value="FP32">FP32 Full Precision Baseline</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-300 mb-1">
                    Min Accuracy SLA ({formData.min_accuracy}%)
                  </label>
                  <input
                    type="range"
                    min="80"
                    max="99"
                    value={formData.min_accuracy}
                    onChange={(e) => setFormData({ ...formData, min_accuracy: Number(e.target.value) })}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-300 mb-1">
                    Max Latency SLA ({formData.max_latency} ms)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    value={formData.max_latency}
                    onChange={(e) => setFormData({ ...formData, max_latency: Number(e.target.value) })}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-emerald-950/30 border border-emerald-900/50 p-3 text-[11px] text-emerald-300">
                🌱 GreenCompute Orchestrator will benchmark candidate execution profiles and select the minimum energy-carbon configuration satisfying your SLA.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg bg-gray-800 px-4 py-2 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
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
