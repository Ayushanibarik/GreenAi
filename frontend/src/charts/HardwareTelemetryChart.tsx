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
import { Cpu, Activity } from 'lucide-react';
import type { HardwareReading } from '../types';

interface HardwareTelemetryChartProps {
  data?: HardwareReading[];
  title?: string;
}

export const HardwareTelemetryChart: React.FC<HardwareTelemetryChartProps> = ({
  data,
  title = 'Power readings over time',
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

  const channels = [
    { id: 'all', label: 'All readings' },
    { id: 'power', label: 'Power (W)' },
    { id: 'current', label: 'Current (mA)' },
    { id: 'voltage', label: 'Voltage (V)' },
    { id: 'energy', label: 'Energy (Wh)' },
  ] as const;

  return (
    <div className="rounded-3xl glass-card p-6 border border-white/[0.08] shadow-[0_12px_40px_rgb(0,0,0,0.35)] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative mb-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
        </div>

        {/* Channel Segmented Control (Apple Glass Pills) */}
        <div className="flex flex-wrap items-center gap-1 rounded-2xl glass-pill p-1 border border-white/[0.08] text-xs">
          {channels.map((ch) => {
            const active = selectedChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={`rounded-xl px-3 py-1.5 font-semibold transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ch.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
            />

            {/* Primary Left YAxis: Power or Current */}
            <YAxis
              yAxisId="primary"
              stroke="#0A84FF"
              tick={{ fill: '#8CC2FF', fontSize: 10, fontFamily: 'monospace' }}
              unit={
                selectedChannel === 'current'
                  ? ' mA'
                  : selectedChannel === 'voltage'
                  ? ' V'
                  : selectedChannel === 'energy'
                  ? ' Wh'
                  : ' W'
              }
              domain={selectedChannel === 'voltage' ? [11.8, 12.2] : ['auto', 'auto']}
              axisLine={false}
              tickLine={false}
            />

            {/* Secondary Right YAxis for Multi-channel view */}
            {selectedChannel === 'all' && (
              <YAxis
                yAxisId="secondary"
                orientation="right"
                stroke="#38BDF8"
                tick={{ fill: '#7dd3fc', fontSize: 10, fontFamily: 'monospace' }}
                unit=" mA"
                axisLine={false}
                tickLine={false}
              />
            )}

            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(16px)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '1rem',
                fontSize: '12px',
                color: '#F8FAFC',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                padding: '10px 14px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => <span className="text-slate-300 font-medium capitalize">{value}</span>}
            />

            {(selectedChannel === 'all' || selectedChannel === 'power') && (
              <Line
                yAxisId="primary"
                type="monotone"
                dataKey="power_w"
                name="Power Draw (W)"
                stroke="#0A84FF"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: '#8CC2FF', stroke: '#003b76', strokeWidth: 2 }}
              />
            )}

            {(selectedChannel === 'all' || selectedChannel === 'current') && (
              <Line
                yAxisId={selectedChannel === 'all' ? 'secondary' : 'primary'}
                type="monotone"
                dataKey="current_ma"
                name="Current (mA)"
                stroke="#38BDF8"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#38BDF8' }}
              />
            )}

            {(selectedChannel === 'all' || selectedChannel === 'voltage') && (
              <Line
                yAxisId="primary"
                type="monotone"
                dataKey="voltage_v"
                name="Bus Voltage (V)"
                stroke="#FBBF24"
                strokeWidth={2}
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
                stroke="#A78BFA"
                strokeWidth={2.5}
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
