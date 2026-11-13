import React from 'react';
import MetricCard from '../components/MetricCard';
import EnergyGauge from '../components/EnergyGauge';
import EnergyTimeChart from '../charts/EnergyTimeChart';
import CarbonBreakdownChart from '../charts/CarbonBreakdownChart';
import StatusBadge from '../components/StatusBadge';
import { useTelemetry } from '../components/Layout';
import {
  Zap,
  Leaf,
  CheckCircle2,
  Timer,
  ArrowUpRight,
  Cpu,
  Play,
  Pause,
  Wifi,
  Radio,
  Sparkles,
  Layers,
  Flame,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { data: telemetry, isSimulating, toggleSimulation, hardwareStatus } = useTelemetry();

  const currentPower = telemetry?.power_w ?? 84.6;

  const recentWorkloads = [
    {
      id: 'WL-8941',
      name: 'ResNet-18 CIFAR-10 Evaluation',
      model_type: 'Computer Vision',
      status: 'completed' as const,
      energy_saved: '26.5 Wh (-62.9%)',
      carbon_avoided: '21.7 g',
      created_at: '5 mins ago',
    },
    {
      id: 'WL-8942',
      name: 'MobileNet-V3 Small INT8 Quantized',
      model_type: 'Edge Vision',
      status: 'completed' as const,
      energy_saved: '35.7 Wh (-84.8%)',
      carbon_avoided: '29.3 g',
      created_at: '12 mins ago',
    },
    {
      id: 'WL-8943',
      name: 'BERT-Base Sentiment Embeddings',
      model_type: 'NLP Inference',
      status: 'running' as const,
      energy_saved: '18.1 Wh (-48.2%)',
      carbon_avoided: '14.8 g',
      created_at: 'Just now',
    },
    {
      id: 'WL-8944',
      name: 'Whisper-Tiny Audio Transcription',
      model_type: 'Audio Speech',
      status: 'pending' as const,
      energy_saved: 'Est. 12.0 Wh',
      carbon_avoided: 'Est. 9.8 g',
      created_at: 'Scheduled 13:00',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Hero Glass Banner with Live Telemetry State */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-6 border border-white/[0.08] shadow-[0_12px_40px_rgb(0,0,0,0.35)]">
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Autonomous Energy Governance Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
              Real-Time AI Telemetry & Pareto Optimization
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Continuous empirical shunt profiling via ESP32 & INA219, regional grid emissions forecasting for Odisha Grid (0.82 kg/kWh), and zero-loss model quantization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Hardware badge */}
            <div className="flex items-center gap-2 rounded-2xl glass-pill px-4 py-2 border border-white/[0.08] text-xs">
              <Cpu className="h-4 w-4 text-emerald-400" />
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Edge Sensor</span>
                <span className="font-mono text-emerald-300 font-bold">{hardwareStatus.port.split(' ')[0]}</span>
              </div>
            </div>

            {/* Live Simulator Switch */}
            <button
              onClick={toggleSimulation}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-300 border shadow-lg ${
                isSimulating
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400/40 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'glass-pill text-slate-300 hover:text-white border-white/10 hover:border-white/20'
              }`}
            >
              {isSimulating ? (
                <>
                  <Pause className="h-4 w-4 text-white" />
                  <span>10Hz Feed Active</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 text-slate-400" />
                  <span>Start Feed Simulator</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Top Metric Cards (Apple HIG Glass Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Energy Saved"
          value="1,428.6"
          unit="Wh"
          trend={{ value: 44.8, isPositive: true, label: 'vs FP32 baseline' }}
          icon={<Zap className="h-5 w-5" />}
          subtext="Net cumulative savings across workloads"
        />

        <MetricCard
          label="CO₂ Avoided"
          value="1,171.5"
          unit="g CO₂e"
          trend={{ value: 44.8, isPositive: true, label: 'grid offset' }}
          icon={<Leaf className="h-5 w-5" />}
          subtext="Based on 0.82 kg/kWh Odisha grid"
        />

        <MetricCard
          label="Workloads Governed"
          value="84"
          unit="runs"
          trend={{ value: 18.0, isPositive: true, label: 'this week' }}
          icon={<CheckCircle2 className="h-5 w-5" />}
          subtext="100% met SLA accuracy thresholds"
        />

        <MetricCard
          label="Avg Latency Reduction"
          value="58.2"
          unit="%"
          trend={{ value: 21.0, isPositive: true, label: 'speedup' }}
          icon={<Timer className="h-5 w-5" />}
          subtext="Throughput increased by 2.1x"
        />
      </div>

      {/* Main Charts & Telemetry Visuals Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EnergyTimeChart />
        </div>

        <div className="flex flex-col gap-6">
          <EnergyGauge currentPower={currentPower} maxPower={250} />

          {/* Quick Hardware Vitals (Material 3 Surface) */}
          <div className="rounded-2xl glass-card p-5 border border-white/[0.08] shadow-lg">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Cpu className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Live Edge Telemetry
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                10Hz Shunt
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl glass-pill p-3 border border-white/[0.06]">
                <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Bus Voltage</span>
                <span className="text-emerald-300 font-mono font-bold text-base mt-0.5 block">
                  {telemetry?.voltage_v ? `${telemetry.voltage_v.toFixed(2)} V` : '12.02 V'}
                </span>
              </div>
              <div className="rounded-xl glass-pill p-3 border border-white/[0.06]">
                <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Load Current</span>
                <span className="text-white font-mono font-bold text-base mt-0.5 block">
                  {telemetry?.current_ma ? `${telemetry.current_ma.toLocaleString()} mA` : '7,038 mA'}
                </span>
              </div>
              <div className="rounded-xl glass-pill p-3 border border-white/[0.06]">
                <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Host CPU Load</span>
                <span className="text-slate-200 font-mono font-bold text-base mt-0.5 block">
                  {telemetry ? `${telemetry.cpu_percent.toFixed(1)}%` : '46.2%'}
                </span>
              </div>
              <div className="rounded-xl glass-pill p-3 border border-white/[0.06]">
                <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Host GPU / NPU</span>
                <span className="text-emerald-400 font-mono font-bold text-base mt-0.5 block">
                  {telemetry ? `${telemetry.gpu_percent.toFixed(1)}%` : '78.4%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carbon Breakdown & Recent Workload Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CarbonBreakdownChart />
        </div>

        <div className="lg:col-span-2 rounded-3xl glass-card p-6 border border-white/[0.08] shadow-lg">
          <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                Recent Workload Optimizations
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Governed by GreenCompute Multi-Objective Engine</p>
            </div>
            <Link
              to="/workloads"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 glass-pill px-3 py-1.5 rounded-full transition-colors"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400">
                  <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">Workload ID</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">Model / Pipeline</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">Energy Saved</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">CO₂ Avoided</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider text-[10px] text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentWorkloads.map((wl) => (
                  <tr key={wl.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 font-mono font-medium text-emerald-400">{wl.id}</td>
                    <td className="py-3.5 text-white">
                      <div className="font-medium text-slate-200">{wl.name}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{wl.model_type}</span>
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={wl.status} />
                    </td>
                    <td className="py-3.5 font-mono text-emerald-300 font-semibold">{wl.energy_saved}</td>
                    <td className="py-3.5 font-mono text-slate-300">{wl.carbon_avoided}</td>
                    <td className="py-3.5 text-right text-slate-400 text-[11px] font-mono">{wl.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
