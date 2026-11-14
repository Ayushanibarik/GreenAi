import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { PlusCircle, Search, Filter, Layers, RefreshCw, X, Cpu, Clock, Zap, Leaf } from 'lucide-react';
import api from '../services/api';
import type { Workload } from '../types';

const fallbackWorkloads: Workload[] = [
  {
    id: 'WL-1001',
    name: 'ResNet-18 ImageNet Validation',
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
    name: 'BERT-Base Sentiment Evaluation',
    model_type: 'NLP Transformer',
    status: 'completed',
    energy_wh: 22.4,
    carbon_g: 18.3,
    latency_ms: 45,
    accuracy: 91.2,
    created_at: '2026-11-13T10:15:00Z',
  },
  {
    id: 'WL-1003',
    name: 'MobileNet-V3 Batch Profiling',
    model_type: 'Edge Vision',
    status: 'running',
    energy_wh: 6.8,
    carbon_g: 5.5,
    latency_ms: 18,
    accuracy: 89.4,
    created_at: '2026-11-13T11:45:00Z',
  },
  {
    id: 'WL-1004',
    name: 'Whisper-Small Speech Transcribe',
    model_type: 'Audio Processing',
    status: 'pending',
    energy_wh: 0,
    carbon_g: 0,
    latency_ms: 0,
    accuracy: 0,
    created_at: '2026-11-13T12:00:00Z',
  },
  {
    id: 'WL-1005',
    name: 'Stable Diffusion Latent Probe',
    model_type: 'Generative AI',
    status: 'completed',
    energy_wh: 84.2,
    carbon_g: 68.9,
    latency_ms: 380,
    accuracy: 88.5,
    created_at: '2026-11-13T08:10:00Z',
  },
];

export const WorkloadPage: React.FC = () => {
  const [workloads, setWorkloads] = useState<Workload[]>(fallbackWorkloads);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    model_type: 'Computer Vision',
    dataset: '',
    precision: 'INT8',
    min_accuracy: 90,
    max_latency: 100,
  });

  const loadWorkloads = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getWorkloads();
      if (res.data && res.data.length > 0) {
        setWorkloads(res.data);
      }
    } catch {
      // retain current state
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkloads();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.submitWorkload({
        name: formData.name || 'Untitled Benchmark Workload',
        model_type: formData.model_type,
        dataset: formData.dataset || undefined,
      });

      if (res.data) {
        setWorkloads([res.data, ...workloads]);
      }
    } catch {
      // Local fallback addition
      const newWorkload: Workload = {
        id: `WL-${Math.floor(1000 + Math.random() * 9000)}`,
        name: formData.name || 'New ML Benchmark Run',
        model_type: formData.model_type,
        status: 'running',
        energy_wh: 18.5,
        carbon_g: 15.1,
        latency_ms: 42,
        accuracy: formData.min_accuracy,
        created_at: new Date().toISOString(),
      };
      setWorkloads([newWorkload, ...workloads]);
    } finally {
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
    }
  };

  const filteredWorkloads = workloads.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.model_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalEnergy = workloads.reduce((acc, curr) => acc + (curr.energy_wh || 0), 0);
  const totalCarbon = workloads.reduce((acc, curr) => acc + (curr.carbon_g || 0), 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Machine Learning Workload Registry
            </h1>
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
              {workloads.length} Workloads Registered
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
            Lifecycle monitoring, real-time power profiling, and empirical emissions traces for model runs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadWorkloads}
            disabled={isRefreshing}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowModal(true)}
            leftIcon={<PlusCircle className="h-3.5 w-3.5" />}
          >
            Submit Workload
          </Button>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
            Total Workload Trace
          </span>
          <span className="text-2xl font-bold text-[var(--text-primary)] font-mono mt-1 block">
            {workloads.length}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
            {workloads.filter((w) => w.status === 'completed').length} completed
          </span>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
            Active Executions
          </span>
          <span className="text-2xl font-bold text-sky-600 dark:text-sky-400 font-mono mt-1 block">
            {workloads.filter((w) => w.status === 'running').length}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
            Inference / Training Jobs
          </span>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
            Cumulative Energy
          </span>
          <span className="text-2xl font-bold text-[var(--text-primary)] font-mono mt-1 block">
            {totalEnergy.toFixed(1)}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
            Watt-hours dissipation
          </span>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
            Quantified Carbon
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
            {totalCarbon.toFixed(1)}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
            Grams CO₂e emitted
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search workloads by ID, name, or architecture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] py-1.5 pl-9 pr-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-[var(--text-muted)] ml-1" />
          <span className="text-xs text-[var(--text-muted)] mr-1">Status:</span>
          {(['all', 'completed', 'running', 'pending', 'failed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Workload Table */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-muted)]">
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Workload ID</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Task &amp; Model</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Energy (Wh)</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Emissions (g CO₂e)</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Mean Latency</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Accuracy</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredWorkloads.map((wl) => (
                <tr key={wl.id} className="hover:bg-[var(--surface-muted)] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-[var(--accent-primary)]">{wl.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-[var(--text-primary)]">{wl.name}</div>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">{wl.model_type}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={wl.status} />
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-[var(--text-primary)]">
                    {wl.energy_wh ? `${wl.energy_wh.toFixed(1)} Wh` : '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[var(--text-muted)]">
                    {wl.carbon_g ? `${wl.carbon_g.toFixed(1)} g` : '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[var(--text-muted)]">
                    {wl.latency_ms ? `${wl.latency_ms} ms` : '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-[var(--text-primary)]">
                    {wl.accuracy ? `${wl.accuracy.toFixed(1)}%` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right text-[var(--text-muted)] text-[11px] font-mono">
                    {new Date(wl.created_at).toLocaleDateString()} {new Date(wl.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Workload Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Submit New ML Workload"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-[var(--text-secondary)] font-medium mb-1">Workload Name</label>
            <input
              type="text"
              required
              placeholder="e.g. ResNet-50 ImageNet Profiling"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--text-secondary)] font-medium mb-1">Model Architecture</label>
              <select
                value={formData.model_type}
                onChange={(e) => setFormData({ ...formData, model_type: e.target.value })}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-[var(--text-primary)] focus:outline-none"
              >
                <option value="Computer Vision">Computer Vision (ResNet / ViT)</option>
                <option value="Edge Vision">Edge Vision (MobileNet-V3)</option>
                <option value="NLP Transformer">NLP Transformer (BERT / RoBERTa)</option>
                <option value="Audio Processing">Audio Processing (Whisper)</option>
                <option value="Generative AI">Generative AI (Diffusion / LLM)</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-medium mb-1">Precision Profile</label>
              <select
                value={formData.precision}
                onChange={(e) => setFormData({ ...formData, precision: e.target.value })}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-[var(--text-primary)] focus:outline-none"
              >
                <option value="INT8">INT8 Quantized (Post-Training)</option>
                <option value="ONNX">ONNX Runtime Optimized</option>
                <option value="FP16">FP16 Half-Precision</option>
                <option value="FP32">FP32 Unconstrained Baseline</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] font-medium mb-1">Dataset Identifier (Optional)</label>
            <input
              type="text"
              placeholder="e.g. ImageNet-1K / GLUE-SST2"
              value={formData.dataset}
              onChange={(e) => setFormData({ ...formData, dataset: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Dispatch Workload'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkloadPage;
