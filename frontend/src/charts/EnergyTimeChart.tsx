import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
  title = 'Energy Consumption Profile: Baseline vs. Optimized (Watts)',
}) => {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-gray-400">Comparing unoptimized FP32 baseline against INT8/ONNX pipeline</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Optimized
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-800" />
            Baseline
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOptimized" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorBaseline" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="5%" stopColor="#047857" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis dataKey="time" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
            <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} unit="W" />
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
              wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              formatter={(value) => (
                <span className="text-gray-300 capitalize">{value.replace('_', ' ')}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="baseline_power"
              name="Baseline (FP32)"
              stroke="#047857"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBaseline)"
            />
            <Area
              type="monotone"
              dataKey="optimized_power"
              name="Optimized (INT8/ONNX)"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorOptimized)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnergyTimeChart;
