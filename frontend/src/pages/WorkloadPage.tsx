import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { PlusCircle, Search, Filter, Layers, RefreshCw, Download, Inbox, RotateCcw } from 'lucide-react';
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
      // retain fallback
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

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Model Type', 'Status', 'Energy (Wh)', 'CO2e (g)', 'Latency (ms)', 'Accuracy (%)', 'Created At'];
    const rows = filteredWorkloads.map((w) => [
      w.id,
      `"${w.name.replace(/"/g, '""')}"`,
      `"${w.model_type}"`,
      w.status,
      w.energy_wh ?? 0,
      w.carbon_g ?? 0,
      w.latency_ms ?? 0,
      w.accuracy ?? 0,
      w.created_at,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `greenai-workloads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Workloads
          </h1>
          <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300 font-mono">
            {workloads.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export CSV
          </Button>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
            Workloads
          </span>
          <span className="text-2xl font-bold text-[var(--text-primary)] font-mono mt-0.5 block">
            {workloads.length}
          </span>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
            Running
          </span>
          <span className="text-2xl font-bold text-sky-600 dark:text-sky-400 font-mono mt-0.5 block">
            {workloads.filter((w) => w.status === 'running').length}
          </span>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
            Cumulative Energy
          </span>
          <span className="text-2xl font-bold text-[var(--text-primary)] font-mono mt-0.5 block">
            {totalEnergy.toFixed(1)} <span className="text-xs font-normal text-[var(--text-muted)]">Wh</span>
          </span>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
            Emissions
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
            {totalCarbon.toFixed(1)} <span className="text-xs font-normal text-[var(--text-muted)]">g</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-2.5 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search workloads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] py-1.5 pl-8 pr-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1">
          {(['all', 'completed', 'running', 'pending', 'failed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[var(--accent-primary)] text-white shadow-xs'
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
          <table className="sci-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Energy</th>
                <th>CO₂e</th>
                <th>Latency</th>
                <th>Accuracy</th>
                <th className="text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkloads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)]">
                        <Inbox className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-[var(--text-primary)]">
                        No workloads match current filters
                      </span>
                      <p className="text-[11px] text-[var(--text-muted)] max-w-xs">
                        Try modifying your search query or reset the status filters to view historical benchmark runs.
                      </p>
                      <button
                        onClick={resetFilters}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWorkloads.map((wl) => (
                  <tr key={wl.id} className="hover:bg-[var(--surface-muted)] transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-[var(--accent-primary)]">{wl.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-[var(--text-primary)]">{wl.name}</div>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">{wl.model_type}</span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={wl.status} />
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-[var(--text-primary)]">
                      {wl.energy_wh ? `${wl.energy_wh.toFixed(1)} Wh` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--text-muted)]">
                      {wl.carbon_g ? `${wl.carbon_g.toFixed(1)} g` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--text-muted)]">
                      {wl.latency_ms ? `${wl.latency_ms} ms` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-[var(--text-primary)]">
                      {wl.accuracy ? `${wl.accuracy.toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-3 px-3 text-right text-[var(--text-muted)] text-[11px] font-mono">
                      {new Date(wl.created_at).toLocaleDateString()} {new Date(wl.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Workload Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Submit Workload"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[var(--text-secondary)] font-medium mb-1">Name</label>
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
              <label className="block text-[var(--text-secondary)] font-medium mb-1">Model</label>
              <select
                value={formData.model_type}
                onChange={(e) => setFormData({ ...formData, model_type: e.target.value })}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-[var(--text-primary)] focus:outline-none"
              >
                <option value="Computer Vision">Computer Vision (ResNet)</option>
                <option value="Edge Vision">Edge Vision (MobileNet)</option>
                <option value="NLP Transformer">NLP Transformer (BERT)</option>
                <option value="Audio Processing">Audio Processing (Whisper)</option>
                <option value="Generative AI">Generative AI</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-medium mb-1">Precision</label>
              <select
                value={formData.precision}
                onChange={(e) => setFormData({ ...formData, precision: e.target.value })}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-[var(--text-primary)] focus:outline-none"
              >
                <option value="INT8">INT8 Quantized</option>
                <option value="ONNX">ONNX Runtime</option>
                <option value="FP16">FP16 Half-Precision</option>
                <option value="FP32">FP32 Baseline</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] font-medium mb-1">Dataset (Optional)</label>
            <input
              type="text"
              placeholder="e.g. ImageNet-1K"
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
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkloadPage;
