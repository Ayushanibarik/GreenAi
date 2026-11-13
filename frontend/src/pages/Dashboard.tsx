import React from 'react';
import MetricCard from '../components/MetricCard';
import EnergyGauge from '../components/EnergyGauge';
import EnergyTimeChart from '../charts/EnergyTimeChart';
import StatusBadge from '../components/StatusBadge';
import { useTelemetry } from '../components/Layout';
import {
  Zap,
  Leaf,
  CheckCircle2,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { data: telemetry } = useTelemetry();

  const currentPower = telemetry?.power_w ?? 84.6;

  const recentWorkloads = [
    {
      id: 'WL-8941',
      name: 'Product image review',
      model_type: 'Image processing',
      status: 'completed' as const,
      energy_saved: '26.5 Wh (-62.9%)',
      carbon_avoided: '21.7 g',
      created_at: '5 mins ago',
    },
    {
      id: 'WL-8942',
      name: 'Mobile photo export',
      model_type: 'Media processing',
      status: 'completed' as const,
      energy_saved: '35.7 Wh (-84.8%)',
      carbon_avoided: '29.3 g',
      created_at: '12 mins ago',
    },
    {
      id: 'WL-8943',
      name: 'Customer note review',
      model_type: 'Text processing',
      status: 'running' as const,
      energy_saved: '18.1 Wh (-48.2%)',
      carbon_avoided: '14.8 g',
      created_at: 'Just now',
    },
    {
      id: 'WL-8944',
      name: 'Audio archive',
      model_type: 'Audio processing',
      status: 'pending' as const,
      energy_saved: 'Est. 12.0 Wh',
      carbon_avoided: 'Est. 9.8 g',
      created_at: 'Scheduled 13:00',
    },
  ];

  return (
    <div className="space-y-7 pb-8">
      <section className="hero-surface relative overflow-hidden p-7 sm:p-9">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_70%_25%,rgba(90,169,255,0.18),transparent_56%)] pointer-events-none" />
        <div className="relative grid gap-8 lg:grid-cols-[1.45fr_0.8fr] lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="section-eyebrow">GreenCompute</span>
            </div>
            <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-4xl">
              Run your systems with <span className="text-gradient-emerald">clarity.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-[15px]">
              See energy use, plan runs and make thoughtful choices in one focused workspace.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/optimizer" className="button-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold">
                Review options <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/15 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Energy reduction</span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">Live now</span>
            </div>
            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <div className="text-4xl font-semibold tracking-[-0.05em] text-white">62.9%</div>
                <p className="mt-1 text-xs text-slate-400">less energy than a typical run</p>
              </div>
              <div className="h-16 w-28 rounded-xl border border-emerald-400/20 bg-[linear-gradient(135deg,rgba(10,132,255,0.32),rgba(94,92,230,0.06))] p-2">
                <div className="mt-7 h-1.5 rounded-full bg-emerald-400/70" />
                <div className="mt-2 h-1.5 w-2/3 rounded-full bg-emerald-400/35" />
              </div>
            </div>
            <div className="mt-5 border-t border-white/[0.08] pt-3 text-[11px] text-slate-400">
              Based on your current system activity.
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <MetricCard
          label="Energy saved"
          value="1,428.6"
          unit="Wh"
          trend={{ value: 44.8, isPositive: true, label: 'vs standard' }}
          icon={<Zap className="h-5 w-5" />}
          subtext="Across all completed runs"
        />

        <MetricCard
          label="Emissions avoided"
          value="1,171.5"
          unit="g CO₂e"
          trend={{ value: 44.8, isPositive: true, label: 'grid offset' }}
          icon={<Leaf className="h-5 w-5" />}
          subtext="Current regional estimate"
        />

        <MetricCard
          label="Completed runs"
          value="84"
          unit="runs"
          trend={{ value: 18.0, isPositive: true, label: 'this week' }}
          icon={<CheckCircle2 className="h-5 w-5" />}
          subtext="This week"
        />

      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EnergyTimeChart />
        </div>

        <div>
          <EnergyGauge currentPower={currentPower} maxPower={250} />
        </div>
      </div>

      <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                Recent activity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">A clear view of your latest runs.</p>
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
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Run</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Activity</th>
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
  );
};

export default Dashboard;
