import React from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';

export interface HourGridPoint {
  hour: number;
  timeLabel: string;
  odisha_ci: number; // kg CO2e / kWh
  national_ci: number; // kg CO2e / kWh
  solar_mw?: number;
}

export const ODISHA_24H_DATA: HourGridPoint[] = [
  { hour: 0, timeLabel: '00:00', odisha_ci: 0.74, national_ci: 0.72 },
  { hour: 1, timeLabel: '01:00', odisha_ci: 0.72, national_ci: 0.71 },
  { hour: 2, timeLabel: '02:00', odisha_ci: 0.70, national_ci: 0.70 },
  { hour: 3, timeLabel: '03:00', odisha_ci: 0.69, national_ci: 0.69 },
  { hour: 4, timeLabel: '04:00', odisha_ci: 0.71, national_ci: 0.70 },
  { hour: 5, timeLabel: '05:00', odisha_ci: 0.78, national_ci: 0.74 },
  { hour: 6, timeLabel: '06:00', odisha_ci: 0.86, national_ci: 0.80 },
  { hour: 7, timeLabel: '07:00', odisha_ci: 0.91, national_ci: 0.84 },
  { hour: 8, timeLabel: '08:00', odisha_ci: 0.94, national_ci: 0.86 },
  { hour: 9, timeLabel: '09:00', odisha_ci: 0.88, national_ci: 0.82 },
  { hour: 10, timeLabel: '10:00', odisha_ci: 0.78, national_ci: 0.75 },
  { hour: 11, timeLabel: '11:00', odisha_ci: 0.65, national_ci: 0.68 },
  { hour: 12, timeLabel: '12:00', odisha_ci: 0.56, national_ci: 0.62 },
  { hour: 13, timeLabel: '13:00', odisha_ci: 0.54, national_ci: 0.60 },
  { hour: 14, timeLabel: '14:00', odisha_ci: 0.55, national_ci: 0.61 },
  { hour: 15, timeLabel: '15:00', odisha_ci: 0.64, national_ci: 0.66 },
  { hour: 16, timeLabel: '16:00', odisha_ci: 0.75, national_ci: 0.73 },
  { hour: 17, timeLabel: '17:00', odisha_ci: 0.89, national_ci: 0.82 },
  { hour: 18, timeLabel: '18:00', odisha_ci: 0.98, national_ci: 0.88 },
  { hour: 19, timeLabel: '19:00', odisha_ci: 0.96, national_ci: 0.87 },
  { hour: 20, timeLabel: '20:00', odisha_ci: 0.91, national_ci: 0.83 },
  { hour: 21, timeLabel: '21:00', odisha_ci: 0.84, national_ci: 0.78 },
  { hour: 22, timeLabel: '22:00', odisha_ci: 0.78, national_ci: 0.75 },
  { hour: 23, timeLabel: '23:00', odisha_ci: 0.75, national_ci: 0.73 },
];

interface CarbonScheduleChartProps {
  data?: HourGridPoint[];
  optimalWindow?: { startHour: number; endHour: number };
  immediateWindow?: { startHour: number; endHour: number };
}

export const CarbonScheduleChart: React.FC<CarbonScheduleChartProps> = ({
  data = ODISHA_24H_DATA,
  optimalWindow,
  immediateWindow,
}) => {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">
            24-Hour Regional Carbon Intensity: Odisha State Grid vs All-India Average
          </h3>
          <p className="text-xs text-gray-400">
            Source: Central Electricity Authority (CEA) Baseline v19 + POSOCO State Load Dispatch Centre
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Odisha Grid (ER)
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
            National Average
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOdisha" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis dataKey="timeLabel" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
            <YAxis
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              domain={[0.4, 1.1]}
              unit=" kg"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                borderColor: '#374151',
                borderRadius: '0.5rem',
                fontSize: '12px',
                color: '#F9FAFB',
              }}
              formatter={(val: any) => [`${Number(val).toFixed(2)} kg CO₂e/kWh`]}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              formatter={(value) => (
                <span className="text-gray-300">
                  {value === 'odisha_ci' ? 'Odisha Grid Intensity' : 'All-India National Average'}
                </span>
              )}
            />

            {/* Optimal Green Window Highlight Area */}
            {optimalWindow && (
              <ReferenceArea
                x1={data[optimalWindow.startHour]?.timeLabel}
                x2={data[optimalWindow.endHour % 24]?.timeLabel}
                fill="#10B981"
                fillOpacity={0.25}
                stroke="#10B981"
                strokeDasharray="3 3"
              />
            )}

            {/* Immediate Window Area */}
            {immediateWindow && (
              <ReferenceArea
                x1={data[immediateWindow.startHour]?.timeLabel}
                x2={data[immediateWindow.endHour % 24]?.timeLabel}
                fill="#EF4444"
                fillOpacity={0.15}
                stroke="#EF4444"
                strokeDasharray="3 3"
              />
            )}

            <Area
              type="monotone"
              dataKey="odisha_ci"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorOdisha)"
              name="odisha_ci"
            />
            <Line
              type="monotone"
              dataKey="national_ci"
              stroke="#0D9488"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              name="national_ci"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 px-2">
        <span>00:00 - Night Base Load</span>
        <span className="text-emerald-400 font-medium">11:00 - 15:00: Solar Influx Dip (0.54 kg/kWh)</span>
        <span className="text-rose-400">18:00 - 21:00: Evening Fossil Peak (0.98 kg/kWh)</span>
      </div>
    </div>
  );
};

export default CarbonScheduleChart;
