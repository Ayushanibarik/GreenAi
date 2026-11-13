import React from 'react';
import HardwareTelemetryChart from '../charts/HardwareTelemetryChart';
import { Cpu, Wifi, Activity, Zap, Play, Pause, Radio, RefreshCw, ShieldCheck } from 'lucide-react';
import { useTelemetry } from '../components/Layout';

export const HardwarePage: React.FC = () => {
  const { data: telemetry, isSimulating, toggleSimulation, hardwareHistory, hardwareStatus } = useTelemetry();

  const latest = hardwareHistory[0] || {
    timestamp: '12:00:10',
    voltage_v: telemetry?.voltage_v ?? 12.02,
    current_ma: telemetry?.current_ma ?? 7038,
    power_mw: telemetry?.power_mw ?? 84600,
    energy_mwh: telemetry?.energy_mwh ?? 124800,
  };

  return (
    <div className="space-y-6">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">ESP32 & INA219 Physical Shunt Telemetry</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Microsecond-resolution physical current, voltage, and Joules metering from edge compute testbed
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Hardware Device Status Badge */}
          <div className="flex items-center gap-2 rounded-2xl glass-pill px-3.5 py-2 text-xs border border-white/[0.08]">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span className="text-white font-medium">ESP32 Connected</span>
            <span className="font-mono text-emerald-400 font-bold">({hardwareStatus.port.split(' ')[0]})</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-300 font-mono text-[11px] flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Signal: {hardwareStatus.signal}
            </span>
          </div>

          {/* Live Simulator Toggle Switch */}
          <button
            onClick={toggleSimulation}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold text-white shadow-lg transition-all border ${
              isSimulating
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'glass-pill border-white/[0.08] hover:border-white/20 text-slate-300'
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
                <span>Start Telemetry Simulator</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sensor Vitals Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl glass-card p-5 border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase text-[10px] font-semibold tracking-wider">Bus Voltage</span>
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">{latest.voltage_v.toFixed(3)}</span>
          <span className="ml-1 text-xs text-emerald-400 font-mono">V</span>
          <span className="text-[10px] text-slate-500 block mt-1">Shunt drop: ~24.5 mV</span>
        </div>

        <div className="rounded-2xl glass-card p-5 border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase text-[10px] font-semibold tracking-wider">Load Current</span>
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">{latest.current_ma.toLocaleString()}</span>
          <span className="ml-1 text-xs text-emerald-400 font-mono">mA</span>
          <span className="text-[10px] text-slate-500 block mt-1">0.1Ω shunt resistor</span>
        </div>

        <div className="rounded-2xl glass-card p-5 border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase text-[10px] font-semibold tracking-wider">Power Draw</span>
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">{(latest.power_mw / 1000).toFixed(2)}</span>
          <span className="ml-1 text-xs text-emerald-400 font-mono">W</span>
          <span className="text-[10px] text-slate-500 block mt-1">{latest.power_mw.toLocaleString()} mW</span>
        </div>

        <div className="rounded-2xl glass-card p-5 border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="uppercase text-[10px] font-semibold tracking-wider">Accumulated Energy</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-emerald-400 font-mono">{(latest.energy_mwh / 1000).toFixed(2)}</span>
          <span className="ml-1 text-xs text-slate-300 font-mono">Wh</span>
          <span className="text-[10px] text-emerald-400 block mt-1">{latest.energy_mwh.toLocaleString()} mWh</span>
        </div>
      </div>

      {/* Realtime Multi-channel Chart */}
      <HardwareTelemetryChart data={hardwareHistory} />

      {/* Hardware Configuration & Raw Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Information Card */}
        <div className="rounded-2xl glass-card p-6 border border-white/[0.08] shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Cpu className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">ESP32 Shunt Sensor Specs</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">Microcontroller</span>
              <span className="text-white font-mono">ESP32-WROOM-32D (Dual-Core)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">Sensor Module</span>
              <span className="text-white font-mono">Texas Instruments INA219</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">I2C Address</span>
              <span className="text-emerald-400 font-mono">0x40 (SDA 21, SCL 22)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">Shunt Resistance</span>
              <span className="text-white font-mono">0.1 Ω (1% Precision R100)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">Sampling Frequency</span>
              <span className="text-emerald-400 font-mono">10 Hz (100ms cycle)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">Ingestion Protocol</span>
              <span className="text-emerald-400 font-mono">HTTP POST / WS Telemetry</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">WiFi Link Quality</span>
              <span className="text-emerald-400 font-mono">-62 dBm (Strong)</span>
            </div>
          </div>
        </div>

        {/* Live Packet Log Feed */}
        <div className="lg:col-span-2 rounded-2xl glass-card p-6 border border-white/[0.08] shadow-lg">
          <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live Ingested Telemetry Feed</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono glass-pill px-2.5 py-0.5 rounded-full">
              Buffer: Last {hardwareHistory.length} frames
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/[0.06] text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 uppercase text-[10px] font-semibold tracking-wider">Timestamp</th>
                  <th className="py-2.5 px-3 uppercase text-[10px] font-semibold tracking-wider">Voltage (V)</th>
                  <th className="py-2.5 px-3 uppercase text-[10px] font-semibold tracking-wider">Current (mA)</th>
                  <th className="py-2.5 px-3 uppercase text-[10px] font-semibold tracking-wider">Power (W)</th>
                  <th className="py-2.5 px-3 uppercase text-[10px] font-semibold tracking-wider">Energy (Wh)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {hardwareHistory.slice(0, 8).map((r, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-2.5 px-3 text-slate-400">{r.timestamp}</td>
                    <td className="py-2.5 px-3 text-emerald-300 font-semibold">{r.voltage_v.toFixed(3)} V</td>
                    <td className="py-2.5 px-3 text-white">{r.current_ma.toLocaleString()} mA</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold">{(r.power_mw / 1000).toFixed(2)} W</td>
                    <td className="py-2.5 px-3 text-slate-300">{(r.energy_mwh / 1000).toFixed(3)} Wh</td>
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

export default HardwarePage;
