import React from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { Sun, Flame, Clock } from 'lucide-react';

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
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-sm transition-colors duration-200 sm:p-6">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              CEA Baseline v19 Diurnal Model
            </span>
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
            Regional Grid Carbon Intensity (24-Hour Profile)
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Marginal grid emission factor (kg CO₂e / kWh) across Eastern Regional Grid
          </p>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-sky-700 dark:text-sky-300 font-medium">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            <span>Odisha (Eastern Grid)</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1 text-[var(--text-muted)] font-medium">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span>National Average</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="odishaCarbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="var(--border-subtle)"
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="var(--border-subtle)"
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'monospace' }}
              domain={[0.45, 1.05]}
              unit=" kg"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--chart-tooltip-bg)',
                borderColor: 'var(--chart-tooltip-border)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--chart-tooltip-text)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                padding: '8px 12px',
              }}
              formatter={(val: any) => [`${Number(val).toFixed(2)} kg CO₂e / kWh`]}
            />

            {/* Optimal Green Window Highlight Area */}
            {optimalWindow && (
              <ReferenceArea
                x1={data[optimalWindow.startHour]?.timeLabel}
                x2={data[optimalWindow.endHour % 24]?.timeLabel}
                fill="#10b981"
                fillOpacity={0.15}
                stroke="#10b981"
                strokeDasharray="4 4"
              />
            )}

            {/* Immediate Window Area */}
            {immediateWindow && (
              <ReferenceArea
                x1={data[immediateWindow.startHour]?.timeLabel}
                x2={data[immediateWindow.endHour % 24]?.timeLabel}
                fill="#f43f5e"
                fillOpacity={0.1}
                stroke="#f43f5e"
                strokeDasharray="4 4"
              />
            )}

            <Area
              type="monotone"
              dataKey="odisha_ci"
              stroke="#0284c7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#odishaCarbonGrad)"
              name="Odisha Grid"
            />
            <Line
              type="monotone"
              dataKey="national_ci"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="National Baseline"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Scientific Insights Footer */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-[var(--border-subtle)] text-xs">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-[var(--text-muted)]">
          <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
          <span>00:00 – 05:00: Basal Thermal Equilibrium</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-700 dark:text-emerald-300 font-medium">
          <Sun className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>11:00 – 15:00: Solar High Dispatch Window</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-700 dark:text-rose-300 font-medium">
          <Flame className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>18:00 – 21:00: Evening Thermal Peaker Load</span>
        </div>
      </div>
    </div>
  );
};

export default CarbonScheduleChart;
