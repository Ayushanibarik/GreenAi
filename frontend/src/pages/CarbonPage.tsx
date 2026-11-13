import React, { useState } from 'react';
import ScheduleHeatmap from '../charts/ScheduleHeatmap';
import CarbonBreakdownChart from '../charts/CarbonBreakdownChart';
import { Leaf, Calendar, ArrowRight, Clock, MapPin, Zap, CheckCircle2 } from 'lucide-react';

export const CarbonPage: React.FC = () => {
  const [jobDurationHours, setJobDurationHours] = useState<number>(3);
  const [deadlineHours, setDeadlineHours] = useState<number>(18);
  const [scheduled, setScheduled] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Carbon Intelligence & Green Scheduling</h2>
          <p className="text-xs text-gray-400">
            Real-time grid marginal emissions factor tracking and carbon-aware batch dispatch
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-gray-900 border border-gray-800 px-3 py-2 text-xs">
          <MapPin className="h-4 w-4 text-emerald-400" />
          <span className="text-gray-300">Active Grid Region:</span>
          <span className="font-semibold text-white">India / Odisha (ER-Grid)</span>
        </div>
      </div>

      {/* Grid Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <span className="text-xs text-gray-400">Current Grid Intensity</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">0.82</span>
            <span className="text-xs text-emerald-400">kg CO₂e/kWh</span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">CEA / POSOCO National Grid data</span>
        </div>

        <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4">
          <span className="text-xs text-emerald-400 font-medium">Solar Window (Lowest CI)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">0.54</span>
            <span className="text-xs text-emerald-400">kg CO₂e/kWh</span>
          </div>
          <span className="text-[10px] text-emerald-300 mt-1 block">Expected at 12:00 - 14:00 (-34% CO₂)</span>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <span className="text-xs text-gray-400">Cumulative CO₂ Avoided</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">1,171.5</span>
            <span className="text-xs text-emerald-400">g CO₂e</span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">Equivalent to 48.8 miles driven</span>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <span className="text-xs text-gray-400">Renewable Energy Penetration</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">31.4%</span>
            <span className="text-xs text-emerald-400">Solar + Wind</span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">Peak solar generation active</span>
        </div>
      </div>

      {/* 24-Hour Schedule Heatmap */}
      <ScheduleHeatmap />

      {/* Carbon Scheduling Engine Form & Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Carbon-Aware Job Dispatcher</h3>
          </div>

          <p className="text-xs text-gray-400">
            Shift flexible batch training or large inference pipelines to times when grid energy is cleanest.
          </p>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Estimated Job Duration: <strong>{jobDurationHours} Hours</strong></span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={jobDurationHours}
                onChange={(e) => setJobDurationHours(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Completion Deadline: <strong>Within {deadlineHours} Hours</strong></span>
              </div>
              <input
                type="range"
                min="4"
                max="48"
                value={deadlineHours}
                onChange={(e) => setDeadlineHours(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="rounded-lg bg-gray-950/70 p-3.5 border border-gray-800 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-400">
                <span>Immediate Run Emissions (Peak):</span>
                <span className="text-rose-400 font-mono">245.0 g CO₂e</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Green Window Emissions (Scheduled):</span>
                <span className="text-emerald-400 font-mono font-bold">158.2 g CO₂e</span>
              </div>
              <div className="flex justify-between border-t border-gray-800 pt-1.5 text-white font-medium">
                <span>Net Carbon Avoided:</span>
                <span className="text-emerald-400 font-mono font-bold">86.8 g CO₂e (-35.4%)</span>
              </div>
            </div>

            <button
              onClick={() => setScheduled(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-900/30 hover:bg-emerald-500 transition-colors"
            >
              {scheduled ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Scheduled for Optimal Solar Window (11:00 AM)
                </>
              ) : (
                <>
                  Schedule Job for Cleanest Window
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Workload Emissions Breakdown Chart */}
        <CarbonBreakdownChart />
      </div>
    </div>
  );
};

export default CarbonPage;
