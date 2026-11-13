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
  { name: 'Content processing', value: 412.5 },
  { name: 'Image processing', value: 184.2 },
  { name: 'Text processing', value: 95.8 },
  { name: 'Batch processing', value: 68.4 },
  { name: 'Audio processing', value: 142.1 },
];

const EMERALD_SHADES = ['#0A84FF', '#5AA9FF', '#5E5CE6', '#8CC2FF', '#A8A5FF', '#6E6ADD'];

interface CarbonBreakdownChartProps {
  data?: CarbonSegment[];
  title?: string;
}

export const CarbonBreakdownChart: React.FC<CarbonBreakdownChartProps> = ({
  data = defaultData,
  title = 'Impact by activity',
}) => {
  const totalCarbon = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold tracking-tight text-white">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Tracked impact: <span className="text-emerald-400 font-mono font-bold">{totalCarbon.toFixed(1)} g CO₂e</span>
        </p>
      </div>

      <div className="h-72 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={EMERALD_SHADES[index % EMERALD_SHADES.length]}
                  stroke="#15161a"
                  strokeWidth={3}
                />
              ))}
            </Pie>
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
              formatter={(val: number) => [`${val.toFixed(1)} g CO₂e`, 'Emissions']}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '8px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CarbonBreakdownChart;
