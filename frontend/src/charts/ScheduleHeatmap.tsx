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
    if (isSelected) {
      switch (status) {
        case 'optimal':
          return 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(10,132,255,0.5)] border-emerald-300 scale-105';
        case 'moderate':
          return 'bg-teal-500 text-slate-950 shadow-[0_0_20px_rgba(20,184,166,0.5)] border-teal-300 scale-105';
        case 'peak':
          return 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] border-rose-300 scale-105';
      }
    }

    switch (status) {
      case 'optimal':
        return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30';
      case 'moderate':
        return 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.08]';
      case 'peak':
        return 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25';
    }
  };

  return (
    <div className="rounded-3xl glass-card p-6 border border-white/[0.08] shadow-[0_12px_40px_rgb(0,0,0,0.35)] relative overflow-hidden">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Hourly grid view
            </h3>
            <p className="text-[11px] text-slate-400">Select a time to inspect its estimate.</p>
          </div>
        </div>

        {/* Legend Chips */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 rounded-full glass-pill px-2.5 py-1 text-emerald-300 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(90,169,255,0.8)]" />
            <span>Lower impact</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full glass-pill px-2.5 py-1 text-slate-400 border border-white/[0.06]">
            <span className="h-2 w-2 rounded-full bg-slate-500" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full glass-pill px-2.5 py-1 text-rose-300 border border-rose-500/30">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span>Higher impact</span>
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
              className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all duration-200 cursor-pointer ${getColor(
                slot.status,
                isSelected
              )}`}
            >
              <span className="text-[9px] font-mono opacity-80">{slot.label.split(':')[0]}h</span>
              <span className="text-xs font-bold font-mono mt-0.5">{slot.intensity.toFixed(2)}</span>
            </button>
          );
        })}
      </div>

      {/* Detail card for selected hour (Apple Inspector Card) */}
      {selectedSlot && (
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl glass-pill p-4 border border-white/[0.08] text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 shrink-0">
              {selectedSlot.hour >= 6 && selectedSlot.hour <= 17 ? (
                <Sun className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Window {selectedSlot.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedSlot.status === 'optimal'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : selectedSlot.status === 'peak'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {selectedSlot.status === 'optimal' ? 'Lower impact' : selectedSlot.status}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Grid estimate:{' '}
                <strong className="text-white font-mono">{selectedSlot.intensity.toFixed(2)} kg CO₂e / kWh</strong>
              </p>
            </div>
          </div>

          <div className="mt-3 sm:mt-0 flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Cleaner mix</span>
              <span className="font-mono text-emerald-400 font-bold text-base">{selectedSlot.renewablePct}%</span>
            </div>
            <div className="h-8 w-px bg-white/[0.08]" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Relative impact</span>
              <span className="font-mono text-slate-200 font-semibold text-sm">
                {selectedSlot.status === 'optimal' ? 'Lowest' : selectedSlot.status === 'peak' ? 'Peak +40%' : 'Standard'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleHeatmap;
