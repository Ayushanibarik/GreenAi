import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface EnergyDataPoint {
  time: string;
  baseline_power: number;
  optimized_power: number;
  gpu_power: number;
}

const defaultData: EnergyDataPoint[] = [
  { time: '00:00', baseline_power: 185, optimized_power: 110, gpu_power: 75 },
  { time: '02:00', baseline_power: 190, optimized_power: 112, gpu_power: 78 },
  { time: '04:00', baseline_power: 175, optimized_power: 105, gpu_power: 70 },
  { time: '06:00', baseline_power: 210, optimized_power: 125, gpu_power: 85 },
  { time: '08:00', baseline_power: 240, optimized_power: 140, gpu_power: 95 },
  { time: '10:00', baseline_power: 260, optimized_power: 155, gpu_power: 110 },
  { time: '12:00', baseline_power: 250, optimized_power: 148, gpu_power: 105 },
  { time: '14:00', baseline_power: 275, optimized_power: 160, gpu_power: 115 },
  { time: '16:00', baseline_power: 245, optimized_power: 142, gpu_power: 100 },
  { time: '18:00', baseline_power: 220, optimized_power: 130, gpu_power: 90 },
  { time: '20:00', baseline_power: 195, optimized_power: 118, gpu_power: 82 },
  { time: '22:00', baseline_power: 180, optimized_power: 108, gpu_power: 74 },
];

interface EnergyTimeChartProps {
  data?: EnergyDataPoint[];
  title?: string;
}

export const EnergyTimeChart: React.FC<EnergyTimeChartProps> = ({
  data = defaultData,
  title = 'Power Trajectory',
}) => {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 sm:p-5 shadow-sm transition-colors duration-200">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h3>
        <div className="flex items-center gap-2.5 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 font-medium text-sky-700 dark:text-sky-300">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Optimized
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-0.5 font-medium text-[var(--text-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Baseline
          </span>
        </div>
      </div>

      <div className="h-68 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartOptimizedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="chartBaselineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="var(--border-subtle)"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace' }}
            />
            <YAxis
              stroke="var(--border-subtle)"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace' }}
              unit="W"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--chart-tooltip-bg)',
                borderColor: 'var(--chart-tooltip-border)',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                fontSize: '12px',
                color: 'var(--chart-tooltip-text)',
                padding: '8px 12px',
              }}
              itemStyle={{ color: 'var(--accent-primary)', fontWeight: 600 }}
              labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 500 }}
              formatter={(val: number) => [`${val} W`, 'Power Draw']}
            />
            <Area
              type="monotone"
              dataKey="baseline_power"
              name="Baseline FP32"
              stroke="#64748b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#chartBaselineGrad)"
            />
            <Area
              type="monotone"
              dataKey="optimized_power"
              name="Optimized DFS"
              stroke="#0284c7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#chartOptimizedGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnergyTimeChart;
