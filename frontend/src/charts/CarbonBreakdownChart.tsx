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
  value: number; // grams CO2
}

const defaultData: CarbonSegment[] = [
  { name: 'LLM Fine-Tuning (Llama-3-8B)', value: 412.5 },
  { name: 'Vision Transformer Inference', value: 184.2 },
  { name: 'BERT Embeddings Pipeline', value: 95.8 },
  { name: 'ResNet-50 Batch Classifier', value: 68.4 },
  { name: 'Speech Whisper Transcription', value: 142.1 },
];

const EMERALD_SHADES = ['#10B981', '#34D399', '#059669', '#6EE7B7', '#047857', '#A7F3D0'];

interface CarbonBreakdownChartProps {
  data?: CarbonSegment[];
  title?: string;
}

export const CarbonBreakdownChart: React.FC<CarbonBreakdownChartProps> = ({
  data = defaultData,
  title = 'CO₂e Emissions by Workload Type (g CO₂e)',
}) => {
  const totalCarbon = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-gray-400">Total tracked emissions: {totalCarbon.toFixed(1)} g CO₂e</p>
      </div>

      <div className="h-72 w-full">
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
                  fill={EMERALD_SHADES[index % EMERALD_SHADES.length]}
                  stroke="#111827"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                borderColor: '#374151',
                borderRadius: '0.5rem',
                fontSize: '12px',
                color: '#F9FAFB',
              }}
              formatter={(value: any) => [`${Number(value).toFixed(1)} g CO₂e`, 'Emissions']}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => <span className="text-gray-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CarbonBreakdownChart;
