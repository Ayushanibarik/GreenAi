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
  { config: 'ResNet-18 FP32', energy_wh: 4.86, latency_ms: 114, accuracy_pct: 93.2, memory_mb: 455 },
  { config: 'ResNet-18 INT8', energy_wh: 3.12, latency_ms: 42, accuracy_pct: 92.4, memory_mb: 320 },
  { config: 'MobileNet-V3 FP32', energy_wh: 3.82, latency_ms: 85, accuracy_pct: 89.6, memory_mb: 387 },
  { config: 'MobileNet-V3 ONNX', energy_wh: 1.18, latency_ms: 9, accuracy_pct: 89.4, memory_mb: 380 },
];

interface ModelComparisonChartProps {
  data?: ConfigMetric[];
  title?: string;
}

export const ModelComparisonChart: React.FC<ModelComparisonChartProps> = ({
  data = defaultData,
  title = 'Energy vs Latency',
}) => {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 sm:p-5 shadow-sm transition-colors duration-200">
      <div className="mb-3">
        <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h3>
      </div>

      <div className="h-68 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="config"
              stroke="var(--border-subtle)"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace' }}
            />
            <YAxis
              yAxisId="left"
              stroke="#0284c7"
              tick={{ fill: '#0284c7', fontSize: 11, fontFamily: 'monospace' }}
              unit=" Wh"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#7c3aed"
              tick={{ fill: '#7c3aed', fontSize: 11, fontFamily: 'monospace' }}
              unit=" ms"
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
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              formatter={(value) => <span className="text-[var(--text-secondary)] font-medium">{value}</span>}
            />
            <Bar
              yAxisId="left"
              dataKey="energy_wh"
              name="Energy (Wh)"
              fill="#0284c7"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="latency_ms"
              name="Latency (ms)"
              fill="#7c3aed"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ModelComparisonChart;
