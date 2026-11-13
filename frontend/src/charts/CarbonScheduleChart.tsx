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
} from 'recharts';
import { Sun, Flame } from 'lucide-react';

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
    <div className="rounded-3xl glass-card p-6 border border-white/[0.08] shadow-[0_12px_40px_rgb(0,0,0,0.35)] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Grid pattern
            </span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Regional grid impact through the day
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            A lower number means a lower impact.
          </p>
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-2 rounded-full glass-pill px-3 py-1 border border-emerald-500/30 text-emerald-300 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(90,169,255,0.8)]" />
            <span>Odisha</span>
          </div>
          <div className="flex items-center gap-2 rounded-full glass-pill px-3 py-1 border border-white/[0.06] text-slate-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
          <span>National average</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOdishaGrid" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0A84FF" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#0A84FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              domain={[0.45, 1.05]}
              unit=" kg"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(16px)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '1rem',
                fontSize: '12px',
                color: '#F8FAFC',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                padding: '10px 14px',
              }}
              formatter={(val: any) => [`${Number(val).toFixed(2)} kg CO₂e / kWh`]}
            />

            {/* Optimal Green Window Highlight Area */}
            {optimalWindow && (
              <ReferenceArea
                x1={data[optimalWindow.startHour]?.timeLabel}
                x2={data[optimalWindow.endHour % 24]?.timeLabel}
                fill="#0A84FF"
                fillOpacity={0.2}
                stroke="#0A84FF"
                strokeDasharray="4 4"
              />
            )}

            {/* Immediate Window Area */}
            {immediateWindow && (
              <ReferenceArea
                x1={data[immediateWindow.startHour]?.timeLabel}
                x2={data[immediateWindow.endHour % 24]?.timeLabel}
                fill="#F43F5E"
                fillOpacity={0.12}
                stroke="#F43F5E"
                strokeDasharray="4 4"
              />
            )}

            <Area
              type="monotone"
              dataKey="odisha_ci"
              stroke="#0A84FF"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorOdishaGrid)"
              name="Odisha"
            />
            <Line
              type="monotone"
              dataKey="national_ci"
              stroke="#5E5CE6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="National average"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Micro-insights pill footer */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-white/[0.06] text-xs">
        <div className="flex items-center gap-2 rounded-xl glass-pill px-3 py-2 text-slate-400">
          <span className="h-2 w-2 rounded-full bg-slate-500" />
          <span>00:00 – 05:00: steady period</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl glass-pill px-3 py-2 text-emerald-300 border border-emerald-500/20 bg-emerald-500/5">
          <Sun className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>11:00 – 15:00: lower impact</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl glass-pill px-3 py-2 text-rose-300 border border-rose-500/20 bg-rose-500/5">
          <Flame className="h-3.5 w-3.5 text-rose-400 shrink-0" />
          <span>18:00 – 21:00: higher impact</span>
        </div>
      </div>
    </div>
  );
};

export default CarbonScheduleChart;
