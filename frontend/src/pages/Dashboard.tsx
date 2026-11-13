import React from 'react';
import MetricCard from '../components/MetricCard';
import EnergyGauge from '../components/EnergyGauge';
import EnergyTimeChart from '../charts/EnergyTimeChart';
import CarbonBreakdownChart from '../charts/CarbonBreakdownChart';
import StatusBadge from '../components/StatusBadge';
import { useTelemetry } from '../components/Layout';
import { Zap, Leaf, CheckCircle2, Timer, ArrowUpRight, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { data: telemetry } = useTelemetry();

  const currentPower = telemetry?.power_w ?? 128.4;

  const recentWorkloads = [
    {
      id: 'WL-8941',
      name: 'ResNet-50 ImageNet Batch-128',
      model_type: 'Computer Vision',
      status: 'completed' as const,
      energy_saved: '64.2 Wh (-42%)',
      carbon_avoided: '52.6 g',
      created_at: '10 mins ago',
    },
    {
      id: 'WL-8942',
      name: 'Llama-3-8B LoRA Fine-Tuning',
      model_type: 'LLM Fine-Tuning',
      status: 'running' as const,
      energy_saved: '182.4 Wh (-38%)',
      carbon_avoided: '149.5 g',
      created_at: 'Just now',
    },
    {
      id: 'WL-8943',
      name: 'BERT Sentiment Embeddings',
      model_type: 'NLP Inference',
      status: 'completed' as const,
      energy_saved: '28.1 Wh (-48%)',
      carbon_avoided: '23.0 g',
      created_at: '25 mins ago',
    },
    {
      id: 'WL-8944',
      name: 'Whisper-Large-v3 Audio Transcription',
      model_type: 'Audio Speech',
      status: 'pending' as const,
      energy_saved: 'Est. 94.0 Wh',
      carbon_avoided: 'Est. 77.0 g',
      created_at: 'Scheduled 13:00',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Energy Saved"
          value="1,428.6"
          unit="Wh"
          trend={{ value: 38.4, isPositive: true, label: 'vs FP32 baseline' }}
          icon={<Zap className="h-5 w-5" />}
          subtext="Net cumulative savings"
        />

        <MetricCard
          label="CO₂ Avoided"
          value="1,171.5"
          unit="g CO₂e"
          trend={{ value: 41.2, isPositive: true, label: 'grid offset' }}
          icon={<Leaf className="h-5 w-5" />}
          subtext="Based on 0.82 kg/kWh India grid"
        />

        <MetricCard
          label="Workloads Optimized"
          value="84"
          unit="runs"
          trend={{ value: 18.0, isPositive: true, label: 'this week' }}
          icon={<CheckCircle2 className="h-5 w-5" />}
          subtext="100% met SLA accuracy thresholds"
        />

        <MetricCard
          label="Avg Latency Reduction"
          value="46.8"
          unit="%"
          trend={{ value: 12.5, isPositive: true, label: 'speedup' }}
          icon={<Timer className="h-5 w-5" />}
          subtext="Throughput increased by 1.88x"
        />
      </div>

      {/* Main Realtime & Energy Gauges Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EnergyTimeChart />
        </div>
        <div className="flex flex-col gap-6">
          <EnergyGauge currentPower={currentPower} maxPower={300} />
          
          {/* Quick Hardware Stats */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-gray-200">Hardware Telemetry</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                ESP32 Online
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-gray-950/60 p-2 border border-gray-800">
                <span className="text-gray-400 block text-[10px]">CPU Utilization</span>
                <span className="text-white font-mono font-bold text-sm">
                  {telemetry ? `${telemetry.cpu_percent.toFixed(1)}%` : '42.8%'}
                </span>
              </div>
              <div className="rounded-lg bg-gray-950/60 p-2 border border-gray-800">
                <span className="text-gray-400 block text-[10px]">GPU Utilization</span>
                <span className="text-emerald-400 font-mono font-bold text-sm">
                  {telemetry ? `${telemetry.gpu_percent.toFixed(1)}%` : '78.5%'}
                </span>
              </div>
              <div className="rounded-lg bg-gray-950/60 p-2 border border-gray-800">
                <span className="text-gray-400 block text-[10px]">Memory / VRAM</span>
                <span className="text-white font-mono font-bold text-sm">
                  {telemetry ? `${telemetry.ram_percent.toFixed(1)}%` : '61.2%'}
                </span>
              </div>
              <div className="rounded-lg bg-gray-950/60 p-2 border border-gray-800">
                <span className="text-gray-400 block text-[10px]">Grid Emission</span>
                <span className="text-white font-mono font-bold text-sm">0.82 g/Wh</span>
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

        <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Workload Optimizations</h3>
              <p className="text-xs text-gray-400">Latest pipeline executions governed by GreenCompute engine</p>
            </div>
            <Link
              to="/workloads"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="pb-3 font-medium">Workload ID</th>
                  <th className="pb-3 font-medium">Model / Pipeline</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Energy Saved</th>
                  <th className="pb-3 font-medium">CO₂ Avoided</th>
                  <th className="pb-3 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {recentWorkloads.map((wl) => (
                  <tr key={wl.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 font-mono font-medium text-emerald-400">{wl.id}</td>
                    <td className="py-3 text-white">
                      <div>{wl.name}</div>
                      <span className="text-[10px] text-gray-500">{wl.model_type}</span>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={wl.status} />
                    </td>
                    <td className="py-3 font-mono text-emerald-300">{wl.energy_saved}</td>
                    <td className="py-3 font-mono text-gray-300">{wl.carbon_avoided}</td>
                    <td className="py-3 text-right text-gray-500">{wl.created_at}</td>
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
