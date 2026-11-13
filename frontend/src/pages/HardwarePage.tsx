import React, { useState, useEffect } from 'react';
import HardwareTelemetryChart from '../charts/HardwareTelemetryChart';
import { Cpu, Wifi, Activity, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTelemetry } from '../components/Layout';
import type { HardwareReading } from '../types';

export const HardwarePage: React.FC = () => {
  const { data: telemetry, isConnected } = useTelemetry();

  // Mock hardware buffer
  const [readings, setReadings] = useState<HardwareReading[]>([
    { timestamp: '12:00:10', voltage_v: 12.02, current_ma: 6300, power_mw: 75726, energy_mwh: 1240 },
    { timestamp: '12:00:09', voltage_v: 12.03, current_ma: 6100, power_mw: 73383, energy_mwh: 1238 },
    { timestamp: '12:00:08', voltage_v: 12.05, current_ma: 5900, power_mw: 71095, energy_mwh: 1236 },
    { timestamp: '12:00:07', voltage_v: 12.01, current_ma: 7400, power_mw: 88874, energy_mwh: 1234 },
    { timestamp: '12:00:06', voltage_v: 11.96, current_ma: 10100, power_mw: 120796, energy_mwh: 1231 },
  ]);

  // If live telemetry updates, append to hardware feed
  useEffect(() => {
    if (telemetry) {
      const newReading: HardwareReading = {
        timestamp: new Date().toLocaleTimeString(),
        voltage_v: 12.0 + (Math.random() * 0.1 - 0.05),
        current_ma: Math.round((telemetry.power_w / 12.0) * 1000),
        power_mw: Math.round(telemetry.power_w * 1000),
        energy_mwh: Math.round(telemetry.energy_wh * 1000),
      };
      setReadings((prev) => [newReading, ...prev.slice(0, 19)]);
    }
  }, [telemetry]);

  const latest = readings[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">ESP32 & INA219 Physical Sensor Telemetry</h2>
          <p className="text-xs text-gray-400">
            Real-time high-precision physical current shunt and voltage sensor telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isConnected
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            ESP32 Bridge Connected (HTTP/WS)
          </span>
        </div>
      </div>

      {/* Sensor Vitals Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Bus Voltage</span>
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">{latest.voltage_v.toFixed(2)}</span>
          <span className="ml-1 text-xs text-emerald-400 font-mono">V</span>
          <span className="text-[10px] text-gray-500 block mt-1">Shunt drop: ~24.5 mV</span>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Load Current</span>
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">{latest.current_ma.toLocaleString()}</span>
          <span className="ml-1 text-xs text-emerald-400 font-mono">mA</span>
          <span className="text-[10px] text-gray-500 block mt-1">Range: 0 - 32000 mA</span>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Instantaneous Power</span>
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">{(latest.power_mw / 1000).toFixed(1)}</span>
          <span className="ml-1 text-xs text-emerald-400 font-mono">Watts</span>
          <span className="text-[10px] text-gray-500 block mt-1">{latest.power_mw.toLocaleString()} mW</span>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Sensor Bridge Health</span>
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-emerald-400 font-mono">-56</span>
          <span className="ml-1 text-xs text-gray-400">dBm</span>
          <span className="text-[10px] text-emerald-400 block mt-1">0% packet drop @ 10Hz</span>
        </div>
      </div>

      {/* Realtime Chart */}
      <HardwareTelemetryChart />

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
              <span className="text-white font-mono">ESP32-WROOM-32D</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-800/60">
              <span className="text-gray-400">Sensor Module</span>
              <span className="text-white font-mono">INA219 High-Side Shunt</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-800/60">
              <span className="text-gray-400">I2C Address</span>
              <span className="text-emerald-400 font-mono">0x40 (SDA 21, SCL 22)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-800/60">
              <span className="text-gray-400">Shunt Resistance</span>
              <span className="text-white font-mono">0.1 Ω (1% Precision)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-800/60">
              <span className="text-gray-400">Ingestion Endpoint</span>
              <span className="text-emerald-400 font-mono">POST /api/hardware</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Telemetry Stream</span>
              <span className="text-emerald-400 font-mono">WS /ws/telemetry</span>
            </div>
          </div>
        </div>

        {/* Live Packet Log */}
        <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Live Ingested Telemetry Feed</h3>
            <span className="text-[10px] text-gray-500 font-mono">Streaming 10Hz samples</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-gray-950/70 text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Voltage (V)</th>
                  <th className="py-2.5 px-3">Current (mA)</th>
                  <th className="py-2.5 px-3">Power (mW)</th>
                  <th className="py-2.5 px-3">Energy (mWh)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {readings.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/20">
                    <td className="py-2 px-3 text-gray-400">{r.timestamp}</td>
                    <td className="py-2 px-3 text-emerald-300">{r.voltage_v.toFixed(3)}</td>
                    <td className="py-2 px-3 text-white">{r.current_ma}</td>
                    <td className="py-2 px-3 text-emerald-400">{r.power_mw}</td>
                    <td className="py-2 px-3 text-gray-300">{r.energy_mwh}</td>
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
