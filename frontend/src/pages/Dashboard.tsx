import React from 'react';
import MetricCard from '../components/MetricCard';
import EnergyGauge from '../components/EnergyGauge';
import EnergyTimeChart from '../charts/EnergyTimeChart';
import CarbonBreakdownChart from '../charts/CarbonBreakdownChart';
import StatusBadge from '../components/StatusBadge';
import { useTelemetry } from '../components/Layout';
import { Zap, Leaf, CheckCircle2, Timer, ArrowUpRight, Cpu, Play, Pause, Wifi, Radio } from 'lucide-react';
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
      {/* Top Banner with Live Simulator / Hardware Feed Toggle & Hardware Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-gray-800 bg-gray-900/60 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-emerald-400 animate-pulse" />
            <div>
              <span className="text-sm font-bold text-white">Edge Sensor Bridge</span>
              <span className="text-xs text-gray-400 block sm:inline sm:ml-2">
                Physical current shunt telemetry via ESP32 + INA219
              </span>
            </div>
          </div>

          {/* Hardware status badge */}
          <div className="flex items-center gap-2 rounded-lg bg-gray-950 px-3 py-1.5 border border-gray-800 text-xs">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span className="text-white font-medium">ESP32 Connected</span>
            <span className="font-mono text-emerald-400 font-bold">({hardwareStatus.port})</span>
            <span className="text-gray-500">|</span>
            <span className="text-emerald-300 font-mono text-[11px] flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Signal: {hardwareStatus.signal}
            </span>
          </div>
        </div>

        {/* Live Simulator / Hardware Feed Toggle Switch */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-300">Live Simulator / Hardware Feed:</span>
          <button
            onClick={toggleSimulation}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${
              isSimulating
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Simulating 10Hz Feed</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Start Live Simulator</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Top Metric Cards */}
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
          label="Workloads Optimized"
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

      {/* Main Realtime & Energy Gauges Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EnergyTimeChart />
        </div>
        <div className="flex flex-col gap-6">
          <EnergyGauge currentPower={currentPower} maxPower={250} />

          {/* Quick Hardware Stats */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-gray-200">Live Hardware Telemetry</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                10Hz Shunt Sampling
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-gray-950/60 p-2 border border-gray-800">
                <span className="text-gray-400 block text-[10px]">Bus Voltage</span>
                <span className="text-emerald-300 font-mono font-bold text-sm">
                  {telemetry?.voltage_v ? `${telemetry.voltage_v.toFixed(2)} V` : '12.02 V'}
                </span>
              </div>
              <div className="rounded-lg bg-gray-950/60 p-2 border border-gray-800">
                <span className="text-gray-400 block text-[10px]">Load Current</span>
                <span className="text-white font-mono font-bold text-sm">
                  {telemetry?.current_ma ? `${telemetry.current_ma.toLocaleString()} mA` : '7,038 mA'}
                </span>
              </div>
              <div className="rounded-lg bg-gray-950/60 p-2 border border-gray-800">
                <span className="text-gray-400 block text-[10px]">Host CPU Utilization</span>
                <span className="text-white font-mono font-bold text-sm">
                  {telemetry ? `${telemetry.cpu_percent.toFixed(1)}%` : '46.2%'}
                </span>
              </div>
              <div className="rounded-lg bg-gray-950/60 p-2 border border-gray-800">
                <span className="text-gray-400 block text-[10px]">Host GPU / NPU</span>
                <span className="text-emerald-400 font-mono font-bold text-sm">
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

        <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Workload Optimizations</h3>
              <p className="text-xs text-gray-400">Governed by GreenCompute Multi-Objective Engine</p>
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
