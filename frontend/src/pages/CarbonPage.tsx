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
      {/* Top Hero Glass Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-6 border border-white/[0.08] shadow-[0_12px_40px_rgb(0,0,0,0.35)]">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Grid planning
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Choose a better time to run.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              See when regional electricity is cleaner, then plan your next run with confidence.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl glass-pill px-4 py-2 border border-white/[0.08] text-xs">
            <MapPin className="h-4 w-4 text-emerald-400" />
            <div className="leading-tight">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Region</span>
              <span className="font-semibold text-white">Odisha</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Highlights (Apple Activity Style Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-3xl glass-card p-5 border border-white/[0.08] shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Grid estimate now</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">0.78</span>
            <span className="text-xs text-amber-400 font-mono font-semibold">kg CO₂e/kWh</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Current regional mix</span>
        </div>

        <div className="rounded-3xl glass-card p-5 border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-transparent to-transparent shadow-[0_0_30px_rgba(10,132,255,0.18)] relative overflow-hidden">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sun className="h-3.5 w-3.5 text-emerald-400" />
            Cleaner period
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-300 font-mono tracking-tight">0.54</span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">kg CO₂e/kWh</span>
          </div>
          <span className="text-[11px] text-emerald-300/80 mt-2 block">Usually lower from 11:00 – 15:00</span>
        </div>

        <div className="rounded-3xl glass-card p-5 border border-rose-500/30 shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-rose-400" />
            Peak period
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400 font-mono tracking-tight">0.98</span>
            <span className="text-xs text-rose-300 font-mono font-semibold">kg CO₂e/kWh</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Usually higher from 18:00 – 21:00</span>
        </div>

        <div className="rounded-3xl glass-card p-5 border border-white/[0.08] shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
            Potential difference
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">-44.9%</span>
            <span className="text-xs text-emerald-300 font-semibold">Emissions</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Cleaner period compared with peak time</span>
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
        <div className="lg:col-span-1 rounded-3xl glass-card p-6 border border-white/[0.08] shadow-lg space-y-5">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Choose a time</h3>
              <p className="text-[11px] text-slate-400">Adjust a few details for this run.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Workload Duration */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-2">
                <span className="font-medium text-slate-400">Run length</span>
                <span className="rounded-full glass-pill px-2.5 py-0.5 text-emerald-300 font-mono font-bold">
                  {durationHours} Hours
                </span>
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

            {/* Deadline Hours */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-2">
                <span className="font-medium text-slate-400">Finish by</span>
                <span className="rounded-full glass-pill px-2.5 py-0.5 text-emerald-300 font-mono font-bold">
                  Within {deadlineHours}h (by {(currentHour + deadlineHours) % 24}:00)
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

            {/* Workload Energy Consumption */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-2">
                <span className="font-medium text-slate-400">Expected energy</span>
                <span className="rounded-full glass-pill px-2.5 py-0.5 text-emerald-300 font-mono font-bold">
                  {workloadEnergyKwh.toFixed(1)} kWh
                </span>
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
              className="button-primary inline-flex w-full items-center justify-center gap-2 py-3 text-xs font-semibold cursor-pointer"
            >
              {scheduled ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Scheduled for {optimalWindow.timeString}
                </>
              ) : (
                <>
                  Choose this time
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Graphical Window Comparison Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Immediate Window (Coal Peak) */}
            <div className="rounded-3xl glass-card p-5 border border-rose-500/20 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-rose-400" />
                  Run now
                </span>
                <span className="text-[10px] font-mono text-slate-400 glass-pill px-2.5 py-0.5 rounded-full">
                  Current
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Window</span>
                  <span className="font-mono text-white font-bold">{immediateWindow.timeString}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Grid estimate</span>
                  <span className="font-mono text-rose-400 font-bold">{immediateWindow.avgCI.toFixed(2)} kg/kWh</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Impact</span>
                  <span className="font-mono text-rose-400 text-sm font-bold">
                    {immediateWindow.emissionsKg.toFixed(2)} kg CO₂e
                  </span>
                </div>
                <div className="pt-2 text-[11px] text-slate-400 border-t border-white/[0.05]">
                  This is the current period.
                </div>
              </div>
            </div>

            {/* Optimal Green Window (Solar Peak) */}
            <div className="rounded-3xl glass-card p-5 border-2 border-emerald-500/80 bg-gradient-to-br from-emerald-500/15 via-indigo-500/5 to-transparent shadow-[0_0_30px_rgba(10,132,255,0.22)] relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sun className="h-4 w-4 text-emerald-400" />
                  Recommended time
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                  Lower impact
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Window</span>
                  <span className="font-mono text-white font-bold">{optimalWindow.timeString}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Grid estimate</span>
                  <span className="font-mono text-emerald-300 font-bold">{optimalWindow.avgCI.toFixed(2)} kg/kWh</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Impact</span>
                  <span className="font-mono text-emerald-300 text-sm font-bold">
                    {optimalWindow.emissionsKg.toFixed(2)} kg CO₂e
                  </span>
                </div>
                <div className="pt-2 text-[11px] text-emerald-300 border-t border-emerald-500/20 font-medium">
                  A lower-impact option that fits your timeframe.
                </div>
              </div>
            </div>
          </div>

          {/* Net Carbon Avoided Banner (Apple Environmental Report Style) */}
          <div className="rounded-3xl glass-card p-6 border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_20px_rgba(10,132,255,0.3)] shrink-0">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs text-slate-300 font-medium block">Estimated reduction</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                    {co2AvoidedKg.toFixed(2)} kg CO₂e
                  </span>
                  <span className="text-emerald-400 text-lg font-bold">(-{co2SavingsPct}%)</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <span className="text-slate-400 block">By choosing</span>
              <span className="text-emerald-400 font-bold text-sm">a better time</span>
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
