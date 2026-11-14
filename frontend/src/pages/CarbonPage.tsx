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
  const [deadlineHours, setDeadlineHours] = useState<number>(10); // within 10 hours (by 20:00)
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
      setApiDispatched(false);
    }
    setTimeout(() => setScheduled(false), 3000);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header and Region Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Regional Grid Carbon Intelligence &amp; Dispatch
            </h1>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              CEA Baseline v19: Odisha Grid
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
            Diurnal marginal emission accounting and temporal workload shifting for zero-performance-penalty decarbonization
          </p>
        </div>
      </div>

      {/* Main Grid: Scheduler Parameters vs Window Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scheduler Controls (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[var(--accent-primary)]" />
              Temporal Dispatch Planner
            </h3>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">Real-Time Solver</span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-[var(--text-secondary)]">Estimated Run Duration</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">{durationHours} hours</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={durationHours}
              onChange={(e) => setDurationHours(parseInt(e.target.value, 10))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">
              <span>1 hr</span>
              <span>8 hrs</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-[var(--text-secondary)]">SLA Completion Deadline</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">Within {deadlineHours} hours</span>
            </div>
            <input
              type="range"
              min="2"
              max="24"
              step="1"
              value={deadlineHours}
              onChange={(e) => setDeadlineHours(Math.max(durationHours, parseInt(e.target.value, 10)))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">
              <span>2 hrs</span>
              <span>24 hrs</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-[var(--text-secondary)]">Workload Energy Required</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">{workloadEnergyKwh.toFixed(1)} kWh</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="20.0"
              step="0.5"
              value={workloadEnergyKwh}
              onChange={(e) => setWorkloadEnergyKwh(parseFloat(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">
              <span>0.5 kWh</span>
              <span>20.0 kWh</span>
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-4">
            <button
              type="button"
              onClick={handleDispatchSchedule}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-all cursor-pointer"
            >
              {scheduled ? 'Workload Dispatched to Queue' : 'Schedule for Cleanest Window'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Immediate vs Optimal Window Comparison (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
                Emissions Avoidance Analysis
              </span>
              <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                Immediate Execution vs Solar Window Shifting
              </h2>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              -{co2SavingsPct}% CO₂e
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Immediate Window */}
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">Immediate Run</span>
                <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400">{immediateWindow.timeString}</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                {immediateWindow.emissionsKg.toFixed(2)}{' '}
                <span className="text-xs font-normal text-[var(--text-muted)]">kg CO₂e</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Average Intensity: {immediateWindow.avgCI.toFixed(2)} kg CO₂e / kWh
              </p>
            </div>

            {/* Optimal Window */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Cleanest Window</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">{optimalWindow.timeString}</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                {optimalWindow.emissionsKg.toFixed(2)}{' '}
                <span className="text-xs font-normal text-[var(--text-muted)]">kg CO₂e</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Average Intensity: {optimalWindow.avgCI.toFixed(2)} kg CO₂e / kWh
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 text-xs flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Operational Carbon Avoided:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {co2AvoidedKg.toFixed(3)} kg CO₂e ({co2SavingsPct}% net reduction)
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts: 24-Hour Diurnal Curve & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <CarbonScheduleChart
            optimalWindow={optimalWindow}
            immediateWindow={immediateWindow}
          />
        </div>
        <div className="lg:col-span-4">
          <CarbonBreakdownChart />
        </div>
      </div>

      {/* Heatmap Section */}
      <ScheduleHeatmap />
    </div>
  );
};

export default CarbonPage;
