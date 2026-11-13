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
  { config: 'ResNet18 FP32 Baseline', energy_wh: 4.86, latency_ms: 114, accuracy_pct: 93.2, memory_mb: 455 },
  { config: 'ResNet18 INT8 Dynamic', energy_wh: 5.52, latency_ms: 124, accuracy_pct: 92.4, memory_mb: 432 },
  { config: 'MobileNetV3 FP32', energy_wh: 3.82, latency_ms: 85, accuracy_pct: 89.6, memory_mb: 387 },
  { config: 'MobileNetV3 ONNX Runtime', energy_wh: 1.18, latency_ms: 9, accuracy_pct: 89.4, memory_mb: 380 },
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
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-gray-400">Comparing quantization targets for Pareto frontier analysis</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis dataKey="config" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
            <YAxis yAxisId="left" stroke="#10B981" tick={{ fill: '#34D399', fontSize: 11 }} unit=" Wh" />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#6EE7B7"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              unit=" ms"
            />
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
              formatter={(value) => <span className="text-gray-300">{value}</span>}
            />
            <Bar
              yAxisId="left"
              dataKey="energy_wh"
              name="Energy Consumed (Wh)"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="latency_ms"
              name="Inference Latency (ms)"
              fill="#065F46"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ModelComparisonChart;
