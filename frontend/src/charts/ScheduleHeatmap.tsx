import React, { useState } from 'react';
import { Calendar, Sun, Moon } from 'lucide-react';

interface HourSlot {
  hour: number;
  label: string;
  intensity: number; // kg CO2 / kWh
  status: 'optimal' | 'moderate' | 'peak';
  renewablePct: number;
}

const generate24hProfile = (): HourSlot[] => {
  const slots: HourSlot[] = [];
  const baseProfile = [
    0.74, 0.72, 0.70, 0.69, 0.72, 0.81,
    0.89, 0.92, 0.86, 0.73, 0.62, 0.56,
    0.54, 0.58, 0.65, 0.74, 0.85, 0.95,
    0.98, 0.96, 0.88, 0.82, 0.78, 0.75,
  ];

  for (let h = 0; h < 24; h++) {
    const intensity = baseProfile[h];
    let status: 'optimal' | 'moderate' | 'peak' = 'moderate';
    if (intensity <= 0.65) status = 'optimal';
    else if (intensity >= 0.88) status = 'peak';

    const renewablePct = Math.round(100 - (intensity / 1.0) * 80);

    slots.push({
      hour: h,
      label: `${h.toString().padStart(2, '0')}:00`,
      intensity,
      status,
      renewablePct,
    });
  }
  return slots;
};

interface ScheduleHeatmapProps {
  slots?: HourSlot[];
}

export const ScheduleHeatmap: React.FC<ScheduleHeatmapProps> = ({
  slots = generate24hProfile(),
}) => {
  const [selectedSlot, setSelectedSlot] = useState<HourSlot | null>(slots[12]);

  const getColor = (status: HourSlot['status'], isSelected: boolean) => {
    let base = '';
    switch (status) {
      case 'optimal':
        base = isSelected
          ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20';
        break;
      case 'moderate':
        base = isSelected
          ? 'bg-slate-700 text-white border-slate-600 ring-2 ring-slate-400'
          : 'bg-[var(--surface-muted)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-card)]';
        break;
      case 'peak':
        base = isSelected
          ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-400'
          : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20';
        break;
    }
    return base;
  };

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-sm transition-colors duration-200 sm:p-6">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--accent-primary)]">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
              24-Hour Dispatch Heatmap (Marginal Carbon Intensity)
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">Select an hourly window to inspect grid conditions and optimal dispatch</p>
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-emerald-700 dark:text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Optimal Window (Solar Peak)</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-0.5 text-[var(--text-muted)] font-medium">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span>Nominal Dispatch</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-rose-700 dark:text-rose-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Peak Thermal Peaker</span>
          </div>
        </div>
      </div>

      {/* Grid of 24 Hours */}
      <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-24 gap-1.5 py-2">
        {slots.map((slot) => {
          const isSelected = selectedSlot?.hour === slot.hour;
          return (
            <button
              key={slot.hour}
              onClick={() => setSelectedSlot(slot)}
              className={`flex flex-col items-center justify-center rounded-lg border p-1.5 text-center transition-all duration-150 cursor-pointer ${getColor(
                slot.status,
                isSelected
              )}`}
            >
              <span className="text-[9px] font-mono opacity-80">{slot.label.split(':')[0]}h</span>
              <span className="text-xs font-semibold font-mono mt-0.5">{slot.intensity.toFixed(2)}</span>
            </button>
          );
        })}
      </div>

      {/* Detail card for selected hour */}
      {selectedSlot && (
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] shrink-0">
              {selectedSlot.hour >= 6 && selectedSlot.hour <= 17 ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--text-primary)] text-sm">Window {selectedSlot.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    selectedSlot.status === 'optimal'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : selectedSlot.status === 'peak'
                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                      : 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30'
                  }`}
                >
                  {selectedSlot.status === 'optimal' ? 'Optimal Dispatch' : selectedSlot.status}
                </span>
              </div>
              <p className="text-[var(--text-muted)] text-[11px] mt-0.5">
                Marginal Emission Factor:{' '}
                <strong className="text-[var(--text-primary)] font-mono">{selectedSlot.intensity.toFixed(2)} kg CO₂e / kWh</strong>
              </p>
            </div>
          </div>

          <div className="mt-3 sm:mt-0 flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] block">Renewable Blend</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">{selectedSlot.renewablePct}%</span>
            </div>
            <div className="h-6 w-px bg-[var(--border-subtle)]" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] block">Delta vs Peak</span>
              <span className="font-mono text-[var(--text-primary)] font-medium text-xs">
                {selectedSlot.status === 'optimal' ? '-44.9% (Best)' : selectedSlot.status === 'peak' ? 'Reference Peak' : '-22.4%'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleHeatmap;
