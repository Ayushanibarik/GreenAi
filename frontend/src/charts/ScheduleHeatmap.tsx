import React, { useState } from 'react';
import { Calendar, Sun, Moon, Info } from 'lucide-react';

interface HourSlot {
  hour: number;
  label: string;
  intensity: number; // kg CO2 / kWh
  status: 'optimal' | 'moderate' | 'peak';
  renewablePct: number;
}

const generate24hProfile = (): HourSlot[] => {
  const slots: HourSlot[] = [];
  // Typical Indian / regional grid profile:
  // Night (0-5h): Moderate coal/wind base ~0.78
  // Morning peak (6-9h): High demand ~0.88 - 0.92
  // Solar peak (10-15h): High solar penetration, lowest intensity ~0.55 - 0.68
  // Evening peak (17-21h): Highest fossil peak ~0.94 - 0.98
  // Late night (22-23h): Drop ~0.75
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

  const getColor = (status: HourSlot['status']) => {
    switch (status) {
      case 'optimal':
        return 'bg-emerald-500/80 border-emerald-400 text-emerald-950 hover:bg-emerald-400';
      case 'moderate':
        return 'bg-emerald-900/60 border-emerald-700/50 text-emerald-200 hover:bg-emerald-800/80';
      case 'peak':
        return 'bg-rose-950/60 border-rose-800/50 text-rose-300 hover:bg-rose-900/80';
    }
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">
            24-Hour Carbon Intensity & Green Scheduling Window
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-emerald-500 border border-emerald-400" />
            <span className="text-gray-300">Optimal (Solar Peak)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-emerald-900 border border-emerald-700" />
            <span className="text-gray-300">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-rose-950 border border-rose-800" />
            <span className="text-gray-300">Grid Peak (Avoid)</span>
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
              className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all cursor-pointer ${getColor(
                slot.status
              )} ${isSelected ? 'ring-2 ring-emerald-300 scale-105' : ''}`}
            >
              <span className="text-[10px] font-mono font-medium">{slot.label}</span>
              <span className="text-xs font-bold font-mono mt-1">{slot.intensity.toFixed(2)}</span>
            </button>
          );
        })}
      </div>

      {/* Detail card for selected hour */}
      {selectedSlot && (
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg bg-gray-950/70 p-3.5 border border-gray-800 text-xs">
          <div className="flex items-center gap-3">
            {selectedSlot.hour >= 6 && selectedSlot.hour <= 18 ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-400" />
            )}
            <div>
              <span className="font-semibold text-white">Window {selectedSlot.label}</span>
              <span className="ml-2 text-gray-400">
                Grid Carbon Intensity: <strong className="text-emerald-400">{selectedSlot.intensity.toFixed(2)} kg CO₂e/kWh</strong>
              </span>
            </div>
          </div>
          <div className="mt-2 sm:mt-0 flex items-center gap-3">
            <span className="text-gray-400">Renewable Mix: <strong className="text-white">{selectedSlot.renewablePct}%</strong></span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                selectedSlot.status === 'optimal'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : selectedSlot.status === 'peak'
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              {selectedSlot.status === 'optimal' ? 'Best Green Window' : selectedSlot.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleHeatmap;
