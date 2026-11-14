import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CarbonSegment {
  name: string;
  value: number;
}

const defaultData: CarbonSegment[] = [
  { name: 'Inference', value: 412.5 },
  { name: 'Data Pipeline', value: 184.2 },
  { name: 'Fine-Tuning', value: 142.1 },
  { name: 'Evaluation', value: 95.8 },
  { name: 'PUE Overhead', value: 68.4 },
];

const SCIENTIFIC_PALETTE = ['#0284c7', '#2563eb', '#059669', '#d97706', '#7c3aed'];

interface CarbonBreakdownChartProps {
  data?: CarbonSegment[];
  title?: string;
}

export const CarbonBreakdownChart: React.FC<CarbonBreakdownChartProps> = ({
  data = defaultData,
  title = 'Emissions Breakdown',
}) => {
  const totalCarbon = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 sm:p-5 shadow-sm transition-colors duration-200">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h3>
        <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
          {totalCarbon.toFixed(1)} g CO₂e
        </span>
      </div>

      <div className="relative h-68 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={SCIENTIFIC_PALETTE[index % SCIENTIFIC_PALETTE.length]}
                  stroke="var(--surface-card)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
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
              formatter={(val: number) => [`${val.toFixed(1)} g CO₂e`, 'Emissions']}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)', paddingTop: '8px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CarbonBreakdownChart;
