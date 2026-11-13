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
          <h2 className="text-xl font-bold text-white">ESP32 & INA219 Physical Shunt Telemetry</h2>
          <p className="text-xs text-gray-400">
            Microsecond-resolution physical current, voltage, and Joules metering from edge compute testbed
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Hardware Device Status Badge */}
          <div className="flex items-center gap-2 rounded-lg bg-gray-900 border border-gray-800 px-3 py-1.5 text-xs">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span className="text-white font-medium">ESP32 Connected</span>
            <span className="font-mono text-emerald-400">({hardwareStatus.port})</span>
            <span className="text-gray-500">|</span>
            <span className="text-emerald-300 font-mono text-[11px] flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Signal: {hardwareStatus.signal}
            </span>
          </div>

          {/* Live Simulator Toggle Switch */}
          <button
            onClick={toggleSimulation}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors border ${
              isSimulating
                ? 'bg-emerald-600 border-emerald-500 hover:bg-emerald-500 shadow-emerald-950'
                : 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-200'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Simulating 10Hz Hardware Feed</span>
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
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Bus Voltage (V)</span>
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">{latest.voltage_v.toFixed(3)}</span>
          <span className="ml-1 text-xs text-emerald-400 font-mono">V</span>
          <span className="text-[10px] text-gray-500 block mt-1">Shunt drop: ~24.5 mV</span>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Load Current (mA)</span>
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">{latest.current_ma.toLocaleString()}</span>
          <span className="ml-1 text-xs text-emerald-400 font-mono">mA</span>
          <span className="text-[10px] text-gray-500 block mt-1">0.1Ω shunt resistor</span>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Power Draw (Watts)</span>
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">{(latest.power_mw / 1000).toFixed(2)}</span>
          <span className="ml-1 text-xs text-emerald-400 font-mono">W</span>
          <span className="text-[10px] text-gray-500 block mt-1">{latest.power_mw.toLocaleString()} mW</span>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Accumulated Energy (Wh)</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-emerald-400 font-mono">{(latest.energy_mwh / 1000).toFixed(2)}</span>
          <span className="ml-1 text-xs text-gray-300 font-mono">Wh</span>
          <span className="text-[10px] text-emerald-400 block mt-1">{latest.energy_mwh.toLocaleString()} mWh</span>
        </div>
      </div>

      {/* Realtime Multi-channel Chart */}
      <HardwareTelemetryChart data={hardwareHistory} />

      {/* Hardware Configuration & Raw Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Information Card */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">ESP32 Shunt Sensor Specs</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-800/60">
              <span className="text-gray-400">Microcontroller</span>
              <span className="text-white font-mono">ESP32-WROOM-32D (Dual-Core 240MHz)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-800/60">
              <span className="text-gray-400">Sensor Module</span>
              <span className="text-white font-mono">Texas Instruments INA219</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-800/60">
              <span className="text-gray-400">I2C Address</span>
              <span className="text-emerald-400 font-mono">0x40 (SDA 21, SCL 22)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-800/60">
              <span className="text-gray-400">Shunt Resistance</span>
              <span className="text-white font-mono">0.1 Ω (1% Precision R100)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-800/60">
              <span className="text-gray-400">Sampling Frequency</span>
              <span className="text-emerald-400 font-mono">10 Hz (100ms cycle)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-800/60">
              <span className="text-gray-400">Ingestion Protocol</span>
              <span className="text-emerald-400 font-mono">HTTP POST / WS Telemetry</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-400">WiFi Link Quality</span>
              <span className="text-emerald-400 font-mono">-62 dBm (Strong)</span>
            </div>
          </div>
        </div>

        {/* Live Packet Log Feed */}
        <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
              <h3 className="text-sm font-semibold text-white">Live Ingested Telemetry Feed</h3>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">Buffer: Last {hardwareHistory.length} frames</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-gray-950/70 text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Voltage (V)</th>
                  <th className="py-2.5 px-3">Current (mA)</th>
                  <th className="py-2.5 px-3">Power (W)</th>
                  <th className="py-2.5 px-3">Energy (Wh)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {hardwareHistory.slice(0, 8).map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/20">
                    <td className="py-2 px-3 text-gray-400">{r.timestamp}</td>
                    <td className="py-2 px-3 text-emerald-300">{r.voltage_v.toFixed(3)} V</td>
                    <td className="py-2 px-3 text-white">{r.current_ma.toLocaleString()} mA</td>
                    <td className="py-2 px-3 text-emerald-400">{(r.power_mw / 1000).toFixed(2)} W</td>
                    <td className="py-2 px-3 text-gray-300">{(r.energy_mwh / 1000).toFixed(3)} Wh</td>
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
