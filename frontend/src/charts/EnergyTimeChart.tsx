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
  title = 'Energy use over time',
}) => {
  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-white">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            A simple comparison with the standard profile.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="glass-pill flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Current profile
          </span>
          <span className="flex items-center gap-1.5 rounded-full glass-pill px-2.5 py-1 text-slate-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-slate-500" />
            Standard profile
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="appleColorOptimized" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#0A84FF" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="appleColorBaseline" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="5%" stopColor="#64748b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis dataKey="time" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
            <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} unit="W" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                borderRadius: '16px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
                fontSize: '12px',
                color: '#f8fafc',
                padding: '10px 14px',
              }}
              itemStyle={{ color: '#8cc2ff', fontWeight: 600 }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 500 }}
              formatter={(val: number) => [`${val} W`, 'Power Draw']}
            />
            <Area
              type="monotone"
              dataKey="baseline_power"
              name="Standard profile"
              stroke="#64748b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#appleColorBaseline)"
            />
            <Area
              type="monotone"
              dataKey="optimized_power"
              name="Current profile"
              stroke="#0a84ff"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#appleColorOptimized)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnergyTimeChart;
