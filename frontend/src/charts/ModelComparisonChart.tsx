import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ConfigMetric {
  config: string;
  energy_wh: number;
  latency_ms: number;
  accuracy_pct: number;
  memory_mb: number;
}

const defaultData: ConfigMetric[] = [
  { config: 'ResNet18 FP32', energy_wh: 4.86, latency_ms: 114, accuracy_pct: 93.2, memory_mb: 455 },
  { config: 'ResNet18 INT8', energy_wh: 5.52, latency_ms: 124, accuracy_pct: 92.4, memory_mb: 432 },
  { config: 'MobileNetV3 FP32', energy_wh: 3.82, latency_ms: 85, accuracy_pct: 89.6, memory_mb: 387 },
  { config: 'MobileNetV3 ONNX', energy_wh: 1.18, latency_ms: 9, accuracy_pct: 89.4, memory_mb: 380 },
];

interface ModelComparisonChartProps {
  data?: ConfigMetric[];
  title?: string;
}

export const ModelComparisonChart: React.FC<ModelComparisonChartProps> = ({
  data = defaultData,
  title = 'Model Precision Comparison: Energy (Wh) vs Latency (ms)',
}) => {
  return (
    <div className="glass-card rounded-2xl p-6 border border-white/[0.08] shadow-lg shadow-black/40">
      <div className="mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Empirical hardware measurements comparing FP32 baseline, dynamic INT8 quantization, and ONNX Runtime
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis dataKey="config" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
            <YAxis yAxisId="left" stroke="#10b981" tick={{ fill: '#34d399', fontSize: 11, fontFamily: 'monospace' }} unit=" Wh" />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#06b6d4"
              tick={{ fill: '#22d3ee', fontSize: 11, fontFamily: 'monospace' }}
              unit=" ms"
            />
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
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
            />
            <Bar
              yAxisId="left"
              dataKey="energy_wh"
              name="Energy Consumed (Wh)"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="latency_ms"
              name="Inference Latency (ms)"
              fill="#06b6d4"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ModelComparisonChart;
