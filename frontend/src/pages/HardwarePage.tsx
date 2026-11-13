import React from 'react';
import HardwareTelemetryChart from '../charts/HardwareTelemetryChart';
import { Activity, Zap, ShieldCheck } from 'lucide-react';
import { useTelemetry } from '../components/Layout';

export const HardwarePage: React.FC = () => {
  const { data: telemetry, hardwareHistory } = useTelemetry();

  const latest = hardwareHistory[0] || {
    timestamp: '12:00:10',
    voltage_v: telemetry?.voltage_v ?? 12.02,
    current_ma: telemetry?.current_ma ?? 7038,
    power_mw: telemetry?.power_mw ?? 84600,
    energy_mwh: telemetry?.energy_mwh ?? 124800,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl glass-card p-5 border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase text-[10px] font-semibold tracking-wider">Voltage</span>
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">{latest.voltage_v.toFixed(3)}</span>
          <span className="ml-1 text-xs text-emerald-400 font-mono">V</span>
        </div>

        <div className="rounded-2xl glass-card p-5 border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase text-[10px] font-semibold tracking-wider">Current</span>
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">{latest.current_ma.toLocaleString()}</span>
          <span className="ml-1 text-xs text-emerald-400 font-mono">mA</span>
        </div>

        <div className="rounded-2xl glass-card p-5 border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase text-[10px] font-semibold tracking-wider">Power</span>
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">{(latest.power_mw / 1000).toFixed(2)}</span>
          <span className="ml-1 text-xs text-emerald-400 font-mono">W</span>
        </div>

        <div className="rounded-2xl glass-card p-5 border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase text-[10px] font-semibold tracking-wider">Energy</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-emerald-400 font-mono">{(latest.energy_mwh / 1000).toFixed(2)}</span>
          <span className="ml-1 text-xs text-slate-300 font-mono">Wh</span>
        </div>
      </div>

      {/* Realtime Multi-channel Chart */}
      <HardwareTelemetryChart data={hardwareHistory} />
    </div>
  );
};

export default HardwarePage;
