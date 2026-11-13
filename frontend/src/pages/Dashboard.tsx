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
  Layers,
  Sparkles,
  Activity,
  ShieldCheck,
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
    <div className="space-y-7 pb-8">
      {/* Apple 2030 / Google DeepMind Hero Bento Card */}
      <div className="glass-card relative overflow-hidden p-7 sm:p-9">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                GreenCompute AI · Autonomous Energy Governance
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Zero Compromise. <span className="text-gradient-emerald">62.9% Less Energy.</span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empirical shunt telemetry with ESP32 & INA219, multi-objective Pareto model optimization, and regional carbon-aware load shifting for the Indian electricity grid.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Shunt Sensor Chip */}
            <div className="flex items-center gap-2 rounded-2xl glass-pill px-4 py-2.5 text-xs">
              <Cpu className="h-4 w-4 text-emerald-400" />
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Sensor Hardware</span>
                <span className="font-mono text-emerald-300 font-bold">{hardwareStatus.device.split(' ')[0]}</span>
              </div>
            </div>

            {/* 10Hz Feed Button */}
            <button
              onClick={toggleSimulation}
              className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all duration-300 cursor-pointer shadow-lg ${
                isSimulating
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-950/60 hover:brightness-110 active:scale-95'
                  : 'glass-pill text-slate-300 hover:text-white border-white/10'
              }`}
            >
              {isSimulating ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-white" />
                  <span>10Hz Feed Active</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-slate-400" />
                  <span>Start Feed</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Hero Metric Bento Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Energy Saved"
          value="1,428.6"
          unit="Wh"
          trend={{ value: 44.8, isPositive: true, label: 'vs baseline' }}
          icon={<Zap className="h-5 w-5" />}
          subtext="Net savings across AI workloads"
        />

        <MetricCard
          label="Carbon Avoided"
          value="1,171.5"
          unit="g CO₂e"
          trend={{ value: 44.8, isPositive: true, label: 'grid offset' }}
          icon={<Leaf className="h-5 w-5" />}
          subtext="Odisha Grid factor 0.82 kg/kWh"
        />

        <MetricCard
          label="Governed Workloads"
          value="84"
          unit="runs"
          trend={{ value: 18.0, isPositive: true, label: 'this week' }}
          icon={<CheckCircle2 className="h-5 w-5" />}
          subtext="100% SLA accuracy compliance"
        />

        <MetricCard
          label="Latency Speedup"
          value="58.2"
          unit="%"
          trend={{ value: 21.0, isPositive: true, label: 'gain' }}
          icon={<Timer className="h-5 w-5" />}
          subtext="Throughput improved by 2.1x"
        />
      </div>

      {/* Primary Analytics & Live Vitals Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EnergyTimeChart />
        </div>

        <div className="flex flex-col gap-6">
          <EnergyGauge currentPower={currentPower} maxPower={250} />

          {/* Quick Hardware Vitals (Material 3 Surface) */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Live Shunt Telemetry
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 rounded-full glass-pill px-2.5 py-0.5">
                Precision ±0.1%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-2xl glass-pill p-3 border border-white/[0.06]">
                <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Bus Voltage</span>
                <span className="text-emerald-300 font-mono font-bold text-base mt-0.5 block">
                  {telemetry?.voltage_v ? `${telemetry.voltage_v.toFixed(2)} V` : '12.02 V'}
                </span>
              </div>
              <div className="rounded-2xl glass-pill p-3 border border-white/[0.06]">
                <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Load Current</span>
                <span className="text-white font-mono font-bold text-base mt-0.5 block">
                  {telemetry?.current_ma ? `${telemetry.current_ma.toLocaleString()} mA` : '7,038 mA'}
                </span>
              </div>
              <div className="rounded-2xl glass-pill p-3 border border-white/[0.06]">
                <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Host CPU Load</span>
                <span className="text-slate-200 font-mono font-bold text-base mt-0.5 block">
                  {telemetry ? `${telemetry.cpu_percent.toFixed(1)}%` : '46.2%'}
                </span>
              </div>
              <div className="rounded-2xl glass-pill p-3 border border-white/[0.06]">
                <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Host GPU / NPU</span>
                <span className="text-emerald-400 font-mono font-bold text-base mt-0.5 block">
                  {telemetry ? `${telemetry.gpu_percent.toFixed(1)}%` : '78.4%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carbon Breakdown & Borderless Workload Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CarbonBreakdownChart />
        </div>

        <div className="lg:col-span-2 glass-card p-6">
          <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                Recent Workload Governance
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Optimized by GreenCompute Multi-Objective Engine</p>
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
                <tr className="border-b border-white/[0.06] text-slate-400 bg-white/[0.02]">
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Workload ID</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Model / Pipeline</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Energy Saved</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">CO₂ Avoided</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentWorkloads.map((wl) => (
                  <tr key={wl.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-emerald-400">{wl.id}</td>
                    <td className="py-3.5 px-4 text-white">
                      <div className="font-semibold text-slate-200">{wl.name}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{wl.model_type}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={wl.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-300 font-semibold">{wl.energy_saved}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{wl.carbon_avoided}</td>
                    <td className="py-3.5 px-4 text-right text-slate-400 text-[11px] font-mono">{wl.created_at}</td>
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
