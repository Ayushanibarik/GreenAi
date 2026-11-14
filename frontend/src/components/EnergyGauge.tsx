import React from 'react';
import { Zap } from 'lucide-react';

interface EnergyGaugeProps {
  currentPower: number; // Watts
  maxPower?: number; // Watts, defaults to 250W
}

export const EnergyGauge: React.FC<EnergyGaugeProps> = ({
  currentPower,
  maxPower = 250,
}) => {
  const percentage = Math.min(100, Math.max(0, (currentPower / maxPower) * 100));

  // Circular gauge geometry (240 degree arc)
  const radius = 78;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * percentage) / 100;

  return (
    <div className="flex min-h-[310px] flex-col items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-sm transition-colors duration-200 sm:p-6">
      <div className="mb-2 flex w-full items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--accent-primary)]">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Power Draw
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      <div className="relative my-auto flex items-center justify-center">
        <svg className="h-50 w-50 -rotate-[210deg] transform" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="scientificEnergyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="var(--border-subtle)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Active Gradient Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="url(#scientificEnergyGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Center Digital Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-semibold tracking-tight text-[var(--text-primary)] tabular-nums">
            {currentPower.toFixed(1)}
          </span>
          <span className="mt-0.5 text-xs font-semibold tracking-widest text-[var(--accent-primary)] font-mono">
            W
          </span>
        </div>
      </div>

      <div className="flex w-full items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-xs">
        <span className="text-[var(--text-muted)] font-mono text-[11px]">Max {maxPower}W</span>
        <span className="font-mono font-semibold text-[var(--text-primary)]">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

export default EnergyGauge;
