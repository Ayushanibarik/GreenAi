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
  title = 'Hardware Telemetry (10Hz)',
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'power' | 'current' | 'voltage' | 'energy'>('all');

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
    { id: 'all', label: 'All' },
    { id: 'power', label: 'Power (W)' },
    { id: 'current', label: 'Current (mA)' },
    { id: 'voltage', label: 'Voltage (V)' },
    { id: 'energy', label: 'Energy (Wh)' },
  ] as const;

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 sm:p-5 shadow-sm transition-colors duration-200">
      <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h3>

        {/* Channel Segmented Control */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-1 text-xs">
          {channels.map((ch) => {
            const active = selectedChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={`rounded-md px-2.5 py-1 font-medium transition-all duration-150 cursor-pointer ${
                  active
                    ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-xs border border-[var(--border-subtle)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {ch.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-68 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="var(--border-subtle)"
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              yAxisId="primary"
              stroke="#0284c7"
              tick={{ fill: '#0284c7', fontSize: 10, fontFamily: 'monospace' }}
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

            {selectedChannel === 'all' && (
              <YAxis
                yAxisId="secondary"
                orientation="right"
                stroke="#0ea5e9"
                tick={{ fill: '#0ea5e9', fontSize: 10, fontFamily: 'monospace' }}
                unit=" mA"
                axisLine={false}
                tickLine={false}
              />
            )}

            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--chart-tooltip-bg)',
                borderColor: 'var(--chart-tooltip-border)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--chart-tooltip-text)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                padding: '8px 12px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              formatter={(value) => <span className="text-[var(--text-secondary)] font-medium capitalize">{value}</span>}
            />

            {(selectedChannel === 'all' || selectedChannel === 'power') && (
              <Line
                yAxisId="primary"
                type="monotone"
                dataKey="power_w"
                name="Power (W)"
                stroke="#0284c7"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#0284c7' }}
              />
            )}

            {(selectedChannel === 'all' || selectedChannel === 'current') && (
              <Line
                yAxisId={selectedChannel === 'all' ? 'secondary' : 'primary'}
                type="monotone"
                dataKey="current_ma"
                name="Current (mA)"
                stroke="#0ea5e9"
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 4, fill: '#0ea5e9' }}
              />
            )}

            {(selectedChannel === 'all' || selectedChannel === 'voltage') && (
              <Line
                yAxisId="primary"
                type="monotone"
                dataKey="voltage_v"
                name="Voltage (V)"
                stroke="#d97706"
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
                name="Energy (Wh)"
                stroke="#8b5cf6"
                strokeWidth={1.75}
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
