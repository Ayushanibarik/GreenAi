import React, { useState, useMemo } from 'react';
import CarbonScheduleChart, { ODISHA_24H_DATA } from '../charts/CarbonScheduleChart';
import CarbonBreakdownChart from '../charts/CarbonBreakdownChart';
import ScheduleHeatmap from '../charts/ScheduleHeatmap';
import {
  Leaf,
  Calendar,
  ArrowRight,
  Clock,
  MapPin,
  Zap,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Sun,
  Flame,
} from 'lucide-react';
import api from '../services/api';

export const CarbonPage: React.FC = () => {
  // Scheduler parameters
  const [currentHour] = useState<number>(10); // 10:00 AM Current Time
  const [durationHours, setDurationHours] = useState<number>(2);
  const [deadlineHours, setDeadlineHours] = useState<number>(10); // within 10 hours (by 20:00 / 8:00 PM)
  const [workloadEnergyKwh, setWorkloadEnergyKwh] = useState<number>(4.8); // 4.8 kWh batch training job
  const [scheduled, setScheduled] = useState(false);
  const [apiDispatched, setApiDispatched] = useState(false);

  // Compute immediate window vs optimal green window
  const immediateWindow = useMemo(() => {
    const start = currentHour;
    const end = (start + durationHours) % 24;
    let sumCI = 0;
    for (let i = 0; i < durationHours; i++) {
      sumCI += ODISHA_24H_DATA[(start + i) % 24].odisha_ci;
    }
    const avgCI = sumCI / durationHours;
    const emissionsKg = workloadEnergyKwh * avgCI;
    return {
      startHour: start,
      endHour: end,
      avgCI,
      emissionsKg,
      timeString: `${start.toString().padStart(2, '0')}:00 - ${end.toString().padStart(2, '0')}:00`,
    };
  }, [currentHour, durationHours, workloadEnergyKwh]);

  const optimalWindow = useMemo(() => {
    let bestStart = currentHour;
    let bestAvgCI = Infinity;

    const maxStart = currentHour + (deadlineHours - durationHours);
    for (let h = currentHour; h <= maxStart; h++) {
      let sum = 0;
      for (let d = 0; d < durationHours; d++) {
        sum += ODISHA_24H_DATA[(h + d) % 24].odisha_ci;
      }
      const avg = sum / durationHours;
      if (avg < bestAvgCI) {
        bestAvgCI = avg;
        bestStart = h % 24;
      }
    }

    const end = (bestStart + durationHours) % 24;
    const emissionsKg = workloadEnergyKwh * bestAvgCI;

    return {
      startHour: bestStart,
      endHour: end,
      avgCI: bestAvgCI,
      emissionsKg,
      timeString: `${bestStart.toString().padStart(2, '0')}:00 - ${end.toString().padStart(2, '0')}:00`,
    };
  }, [currentHour, durationHours, deadlineHours, workloadEnergyKwh]);

  // Savings calculation
  const co2AvoidedKg = Math.max(0, immediateWindow.emissionsKg - optimalWindow.emissionsKg);
  const co2SavingsPct = ((co2AvoidedKg / immediateWindow.emissionsKg) * 100).toFixed(1);

  const handleDispatchSchedule = async () => {
    setScheduled(true);
    try {
      await api.getScheduleRecommendation({
        energy_wh: workloadEnergyKwh * 1000,
        deadline_hours: deadlineHours,
        duration_hours: durationHours,
      });
      setApiDispatched(true);
    } catch {
      // offline fallback
      setApiDispatched(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Regional Carbon Intelligence & Dispatcher</h2>
          <p className="text-xs text-gray-400">
            Real-time grid marginal emissions factor tracking and carbon-aware batch dispatch
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-gray-900 border border-gray-800 px-3 py-2 text-xs">
          <MapPin className="h-4 w-4 text-emerald-400" />
          <span className="text-gray-300">Active Grid Region:</span>
          <span className="font-semibold text-white">India / Odisha State Grid (ER)</span>
        </div>
      </div>

      {/* Grid Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <span className="text-xs text-gray-400">Current Time & Grid CI</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">10:00 AM</span>
            <span className="text-xs text-amber-400 font-mono">0.78 kg/kWh</span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">Eastern Region thermal baseload</span>
        </div>

        <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4">
          <span className="text-xs text-emerald-400 font-medium">Midday Solar Window (Lowest CI)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">0.54</span>
            <span className="text-xs text-emerald-400 font-mono">kg CO₂e/kWh</span>
          </div>
          <span className="text-[10px] text-emerald-300 mt-1 block">Peak solar generation 12:00 - 14:00</span>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <span className="text-xs text-gray-400">Evening Fossil Peak (Avoid)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400 font-mono">0.98</span>
            <span className="text-xs text-rose-300 font-mono">kg CO₂e/kWh</span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">High coal ramp 18:00 - 21:00</span>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <span className="text-xs text-gray-400">Solar Displacement Factor</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">-44.9%</span>
            <span className="text-xs text-emerald-300">Emissions</span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">Solar vs evening peak coal</span>
        </div>
      </div>

      {/* Interactive 24-Hour Carbon Schedule Chart (Odisha vs National Average) */}
      <CarbonScheduleChart
        optimalWindow={{ startHour: optimalWindow.startHour, endHour: optimalWindow.endHour }}
        immediateWindow={{ startHour: immediateWindow.startHour, endHour: immediateWindow.endHour }}
      />

      {/* Workload Execution Scheduler & Tradeoff Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scheduler Controls */}
        <div className="lg:col-span-1 rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Workload Execution Scheduler</h3>
          </div>

          <p className="text-xs text-gray-400">
            Shift flexible AI training or batch inference to the hours of cleanest solar/renewable generation.
          </p>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Workload Duration: <strong>{durationHours} Hours</strong></span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={durationHours}
                onChange={(e) => {
                  setDurationHours(Number(e.target.value));
                  setScheduled(false);
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>
                  Completion Deadline: <strong>Within {deadlineHours} Hours</strong> (by {(currentHour + deadlineHours) % 24}:00)
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="14"
                step="1"
                value={deadlineHours}
                onChange={(e) => {
                  setDeadlineHours(Number(e.target.value));
                  setScheduled(false);
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Estimated Energy: <strong>{workloadEnergyKwh.toFixed(1)} kWh</strong></span>
              </div>
              <input
                type="range"
                min="1.0"
                max="20.0"
                step="0.5"
                value={workloadEnergyKwh}
                onChange={(e) => {
                  setWorkloadEnergyKwh(Number(e.target.value));
                  setScheduled(false);
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <button
              onClick={handleDispatchSchedule}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-900/30 hover:bg-emerald-500 transition-colors"
            >
              {scheduled ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Dispatched to Green Window ({optimalWindow.timeString})
                </>
              ) : (
                <>
                  Dispatch to Carbon-Aware Scheduler
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Graphical Window Comparison Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Immediate Window (Coal Peak) */}
            <div className="rounded-xl border border-rose-900/40 bg-gray-900/70 p-5 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-rose-400" />
                  Immediate Execution (10:00 AM)
                </span>
                <span className="text-[10px] font-mono text-gray-400">Default Run</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Execution Time:</span>
                  <span className="font-mono text-white font-bold">{immediateWindow.timeString}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Average Grid Intensity:</span>
                  <span className="font-mono text-rose-400 font-bold">{immediateWindow.avgCI.toFixed(2)} kg/kWh</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Total Carbon Emissions:</span>
                  <span className="font-mono text-rose-400 text-sm font-bold">
                    {immediateWindow.emissionsKg.toFixed(2)} kg CO₂e
                  </span>
                </div>
                <div className="pt-2 text-[11px] text-gray-500 border-t border-gray-800">
                  High reliance on Odisha coal thermal generation; zero solar displacement.
                </div>
              </div>
            </div>

            {/* Optimal Green Window (Solar Peak) */}
            <div className="rounded-xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-950/60 via-gray-900/80 to-gray-950 p-5 shadow-lg shadow-emerald-950/30 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sun className="h-4 w-4 text-emerald-400" />
                  OPTIMAL GREEN WINDOW
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Solar Peak
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Scheduled Time:</span>
                  <span className="font-mono text-white font-bold">{optimalWindow.timeString}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Average Grid Intensity:</span>
                  <span className="font-mono text-emerald-400 font-bold">{optimalWindow.avgCI.toFixed(2)} kg/kWh</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Total Carbon Emissions:</span>
                  <span className="font-mono text-emerald-300 text-sm font-bold">
                    {optimalWindow.emissionsKg.toFixed(2)} kg CO₂e
                  </span>
                </div>
                <div className="pt-2 text-[11px] text-emerald-300 border-t border-emerald-800/40 font-medium">
                  Displaces grid energy with local solar influx; strictly meets deadline by {(currentHour + deadlineHours) % 24}:00.
                </div>
              </div>
            </div>
          </div>

          {/* Net Carbon Avoided Banner */}
          <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Total Carbon Avoided by Temporal Shifting</span>
                <span className="text-2xl font-extrabold text-white font-mono">
                  {co2AvoidedKg.toFixed(2)} kg CO₂e{' '}
                  <span className="text-emerald-400 text-lg font-bold">(-{co2SavingsPct}%)</span>
                </span>
              </div>
            </div>

            <div className="text-right text-xs text-gray-400">
              <span>Savings achieved purely through</span>
              <span className="block text-emerald-400 font-semibold">Zero-Hardware Temporal Load Shifting</span>
            </div>
          </div>

          {/* 24h Heatmap Component */}
          <ScheduleHeatmap />
        </div>
      </div>
    </div>
  );
};

export default CarbonPage;
