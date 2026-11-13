import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { HardwareReading } from '../types';

interface HardwareTelemetryChartProps {
  data?: HardwareReading[];
  title?: string;
}

export const HardwareTelemetryChart: React.FC<HardwareTelemetryChartProps> = ({
  data,
  title = 'ESP32 + INA219 Real-Time Telemetry Stream',
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'power' | 'current' | 'voltage' | 'energy'>('all');

  // Format data for chart (reversed so chronological left-to-right)
  const chartData = (data && data.length > 0 ? [...data].reverse() : [
    { timestamp: '12:00:01', voltage_v: 12.04, current_ma: 6500, power_mw: 78200, energy_mwh: 1211 },
    { timestamp: '12:00:02', voltage_v: 12.02, current_ma: 7200, power_mw: 86500, energy_mwh: 1215 },
    { timestamp: '12:00:03', voltage_v: 11.98, current_ma: 9800, power_mw: 117400, energy_mwh: 1219 },
    { timestamp: '12:00:04', voltage_v: 11.95, current_ma: 10400, power_mw: 124200, energy_mwh: 1223 },
    { timestamp: '12:00:05', voltage_v: 11.94, current_ma: 10800, power_mw: 128900, energy_mwh: 1227 },
    { timestamp: '12:00:06', voltage_v: 11.96, current_ma: 10100, power_mw: 120800, energy_mwh: 1231 },
    { timestamp: '12:00:07', voltage_v: 12.01, current_ma: 7400, power_mw: 88900, energy_mwh: 1234 },
    { timestamp: '12:00:08', voltage_v: 12.05, current_ma: 5900, power_mw: 71100, energy_mwh: 1236 },
    { timestamp: '12:00:09', voltage_v: 12.03, current_ma: 6100, power_mw: 73400, energy_mwh: 1238 },
    { timestamp: '12:00:10', voltage_v: 12.02, current_ma: 6300, power_mw: 75700, energy_mwh: 1240 },
  ]).map((p) => ({
    time: p.timestamp.includes(' ') ? p.timestamp.split(' ')[1] : p.timestamp,
    voltage_v: Number(p.voltage_v.toFixed(3)),
    current_ma: p.current_ma,
    power_w: Number((p.power_mw / 1000).toFixed(2)),
    energy_wh: Number((p.energy_mwh / 1000).toFixed(3)),
  }));

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-gray-400">Direct hardware shunt sensor telemetry: V, I, P, E</p>
        </div>

        {/* Channel filter tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-gray-950 p-1 border border-gray-800 text-[11px]">
          <button
            onClick={() => setSelectedChannel('all')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              selectedChannel === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            All 4 Channels
          </button>
          <button
            onClick={() => setSelectedChannel('power')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              selectedChannel === 'power'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Power (W)
          </button>
          <button
            onClick={() => setSelectedChannel('current')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              selectedChannel === 'current'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Current (mA)
          </button>
          <button
            onClick={() => setSelectedChannel('voltage')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              selectedChannel === 'voltage'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Voltage (V)
          </button>
          <button
            onClick={() => setSelectedChannel('energy')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              selectedChannel === 'energy'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Energy (Wh)
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis dataKey="time" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
            
            {/* Primary Left YAxis: Power or Current */}
            <YAxis
              yAxisId="primary"
              stroke="#10B981"
              tick={{ fill: '#34D399', fontSize: 11 }}
              unit={selectedChannel === 'current' ? ' mA' : selectedChannel === 'voltage' ? ' V' : selectedChannel === 'energy' ? ' Wh' : ' W'}
              domain={selectedChannel === 'voltage' ? [11.8, 12.2] : ['auto', 'auto']}
            />

            {/* Secondary Right YAxis for Multi-channel view */}
            {selectedChannel === 'all' && (
              <YAxis
                yAxisId="secondary"
                orientation="right"
                stroke="#6EE7B7"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                unit=" mA"
              />
            )}

            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                borderColor: '#374151',
                borderRadius: '0.5rem',
                fontSize: '12px',
                color: '#F9FAFB',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              formatter={(value) => <span className="text-gray-300 capitalize">{value}</span>}
            />

            {(selectedChannel === 'all' || selectedChannel === 'power') && (
              <Line
                yAxisId="primary"
                type="monotone"
                dataKey="power_w"
                name="Power Draw (W)"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: '#34D399' }}
              />
            )}

            {(selectedChannel === 'all' || selectedChannel === 'current') && (
              <Line
                yAxisId={selectedChannel === 'all' ? 'secondary' : 'primary'}
                type="monotone"
                dataKey="current_ma"
                name="Current (mA)"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
              />
            )}

            {(selectedChannel === 'all' || selectedChannel === 'voltage') && (
              <Line
                yAxisId="primary"
                type="monotone"
                dataKey="voltage_v"
                name="Bus Voltage (V)"
                stroke="#F59E0B"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            )}

            {(selectedChannel === 'all' || selectedChannel === 'energy') && (
              <Line
                yAxisId="primary"
                type="monotone"
                dataKey="energy_wh"
                name="Accumulated Energy (Wh)"
                stroke="#A7F3D0"
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HardwareTelemetryChart;
