import React, { useState, useMemo } from 'react';
import CarbonScheduleChart, { ODISHA_24H_DATA } from '../charts/CarbonScheduleChart';
import CarbonBreakdownChart from '../charts/CarbonBreakdownChart';
import ScheduleHeatmap from '../charts/ScheduleHeatmap';
import { Calendar, ArrowRight, MapPin } from 'lucide-react';
import api from '../services/api';

export const CarbonPage: React.FC = () => {
  const [currentHour] = useState<number>(10);
  const [durationHours, setDurationHours] = useState<number>(2);
  const [deadlineHours, setDeadlineHours] = useState<number>(10);
  const [workloadEnergyKwh, setWorkloadEnergyKwh] = useState<number>(4.8);
  const [scheduled, setScheduled] = useState(false);

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
    } catch {
      // offline simulation fallback
    }
    setTimeout(() => setScheduled(false), 3000);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header and Region Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Carbon Dispatch
          </h1>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Odisha Grid (CEA v19)
          </span>
        </div>
      </div>

      {/* Main Grid: Scheduler Parameters vs Window Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Scheduler Controls (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm space-y-3.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5 border-b border-[var(--border-subtle)] pb-2.5">
            <Calendar className="h-4 w-4 text-[var(--accent-primary)]" />
            Dispatch Planner
          </h3>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-[var(--text-secondary)]">Duration</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">{durationHours}h</span>
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
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-[var(--text-secondary)]">Deadline</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">Within {deadlineHours}h</span>
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
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-[var(--text-secondary)]">Workload Energy</span>
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
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-3">
            <button
              type="button"
              onClick={handleDispatchSchedule}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-all cursor-pointer"
            >
              {scheduled ? 'Scheduled' : 'Schedule Cleanest Window'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Immediate vs Optimal Window Comparison (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              Dispatch Comparison
            </h2>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              -{co2SavingsPct}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Immediate Window */}
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">Immediate</span>
                <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400">{immediateWindow.timeString}</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                {immediateWindow.emissionsKg.toFixed(2)}{' '}
                <span className="text-xs font-normal text-[var(--text-muted)]">kg CO₂e</span>
              </div>
            </div>

            {/* Optimal Window */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Cleanest Window</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">{optimalWindow.timeString}</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                {optimalWindow.emissionsKg.toFixed(2)}{' '}
                <span className="text-xs font-normal text-[var(--text-muted)]">kg CO₂e</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2.5 text-xs flex items-center justify-between font-mono">
            <span className="text-[var(--text-muted)]">Avoided:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {co2AvoidedKg.toFixed(3)} kg CO₂e ({co2SavingsPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts: 24-Hour Diurnal Curve & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
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
