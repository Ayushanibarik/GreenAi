import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import EnergyGauge from '../components/EnergyGauge';
import EnergyTimeChart from '../charts/EnergyTimeChart';
import StatusBadge from '../components/StatusBadge';
import { useTelemetry } from '../context/TelemetryContext';
import api from '../services/api';
import type { Workload } from '../types';
import {
  Zap,
  Leaf,
  CheckCircle2,
  ArrowUpRight,
  Layers,
  Cpu,
  Activity,
  Sliders,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatWh, formatCO2, formatLatency } from '../utils/format';

export const Dashboard: React.FC = () => {
  const { data: telemetry, connectionStatus } = useTelemetry();
  const [workloads, setWorkloads] = useState<Workload[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchWorkloads = async () => {
      try {
        const res = await api.getWorkloads();
        if (mounted && res.data && res.data.length > 0) {
          setWorkloads(res.data);
        }
      } catch {
        if (mounted) {
          setWorkloads([
            {
              id: 'WL-8941',
              name: 'ResNet-18 ImageNet Validation',
              model_type: 'Computer Vision',
              status: 'completed',
              energy_wh: 15.6,
              carbon_g: 12.8,
              latency_ms: 42,
              accuracy: 93.2,
              created_at: new Date(Date.now() - 300000).toISOString(),
            },
            {
              id: 'WL-8942',
              name: 'MobileNet-V3 Edge Inference',
              model_type: 'Edge Vision',
              status: 'completed',
              energy_wh: 6.4,
              carbon_g: 5.2,
              latency_ms: 16,
              accuracy: 89.4,
              created_at: new Date(Date.now() - 720000).toISOString(),
            },
            {
              id: 'WL-8943',
              name: 'BERT-Base Sentiment Profiling',
              model_type: 'NLP Transformer',
              status: 'running',
              energy_wh: 48.2,
              carbon_g: 39.5,
              latency_ms: 128,
              accuracy: 91.8,
              created_at: new Date(Date.now() - 60000).toISOString(),
            },
            {
              id: 'WL-8944',
              name: 'Whisper-Small Speech Transcribe',
              model_type: 'Speech Processing',
              status: 'pending',
              energy_wh: 0,
              carbon_g: 0,
              latency_ms: 0,
              accuracy: 0,
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }
    };
    fetchWorkloads();
    return () => {
      mounted = false;
    };
  }, []);

  const currentPower = telemetry?.power_w ?? 84.6;
  const completedCount = workloads.filter((w) => w.status === 'completed').length;

  return (
    <div className="space-y-5 pb-8">
      {/* Top Banner */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1.5fr_0.9fr] lg:items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Real-Time Workload Intelligence
            </h1>
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <Link
                to="/optimizer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-primary)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                <Sliders className="h-3.5 w-3.5" />
                Optimizer
              </Link>
              <Link
                to="/carbon"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-card)] transition-colors"
              >
                <Calendar className="h-3.5 w-3.5" />
                Scheduler
              </Link>
              <Link
                to="/hardware"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-card)] transition-colors"
              >
                <Cpu className="h-3.5 w-3.5" />
                Hardware Bus
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Energy Reduction
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                INT8 / ONNX
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="text-3xl font-bold tracking-tight text-[var(--text-primary)] font-mono">
                62.9%
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)]">vs FP32 baseline</span>
            </div>
            <div className="mt-3 border-t border-[var(--border-subtle)] pt-2 text-[11px] font-mono text-[var(--text-muted)] flex items-center justify-between">
              <span>12.02V · 7.04A</span>
              <span>PUE 1.15</span>
            </div>
          </div>
        </div>
      </section>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Energy Saved"
          value="1,428.6"
          unit="Wh"
          trend={{ value: 62.9, isPositive: true, label: 'vs FP32' }}
          icon={<Zap className="h-4 w-4" />}
        />

        <MetricCard
          label="CO₂ Avoided"
          value="1,171.5"
          unit="g"
          trend={{ value: 44.8, isPositive: true, label: 'offset' }}
          icon={<Leaf className="h-4 w-4" />}
        />

        <MetricCard
          label="Workloads"
          value={workloads.length.toString()}
          trend={{ value: completedCount, isPositive: true, label: 'done' }}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />

        <MetricCard
          label="Power Draw"
          value={currentPower.toFixed(1)}
          unit="W"
          trend={{ value: 14.2, isPositive: true, label: 'under cap' }}
          icon={<Cpu className="h-4 w-4" />}
        />
      </div>

      {/* Main Analytical Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EnergyTimeChart />
        </div>

        <div>
          <EnergyGauge currentPower={currentPower} maxPower={250} />
        </div>
      </div>

      {/* Recent Workloads Registry */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
          <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-[var(--accent-primary)]" />
            Recent Workloads
          </h3>
          <Link
            to="/workloads"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-primary)] hover:underline"
          >
            All Workloads <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="sci-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Model</th>
                <th>Status</th>
                <th>Energy</th>
                <th>Emissions</th>
                <th>Latency</th>
                <th className="text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {workloads.slice(0, 5).map((wl) => (
                <tr key={wl.id}>
                  <td className="font-mono font-medium text-[var(--accent-primary)]">{wl.id}</td>
                  <td>
                    <div className="font-medium text-[var(--text-primary)]">{wl.name}</div>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">{wl.model_type}</span>
                  </td>
                  <td>
                    <StatusBadge status={wl.status} />
                  </td>
                  <td className="font-mono font-medium text-[var(--text-primary)]">
                    {wl.energy_wh ? formatWh(wl.energy_wh) : '—'}
                  </td>
                  <td className="font-mono text-[var(--text-muted)]">
                    {wl.carbon_g ? formatCO2(wl.carbon_g) : '—'}
                  </td>
                  <td className="font-mono text-[var(--text-muted)]">
                    {wl.latency_ms ? formatLatency(wl.latency_ms) : '—'}
                  </td>
                  <td className="text-right text-[var(--text-muted)] text-[11px] font-mono">
                    {new Date(wl.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
