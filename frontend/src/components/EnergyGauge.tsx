import React from 'react';
import { Zap, Activity } from 'lucide-react';

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
    <div className="glass-card flex min-h-[330px] flex-col items-center justify-between p-5 sm:p-6">
      <div className="mb-2 flex w-full items-center justify-between border-b border-white/[0.07] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold tracking-tight text-white">
            Power right now
          </span>
        </div>
        <span className="glass-pill rounded-full px-2.5 py-0.5 text-[10px] font-medium text-emerald-200">
          Live reading
        </span>
      </div>

      <div className="relative flex items-center justify-center my-auto">
        <svg className="w-52 h-52 -rotate-[210deg] transform" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="appleEnergyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8cc2ff" />
              <stop offset="60%" stopColor="#0a84ff" />
              <stop offset="100%" stopColor="#5e5ce6" />
            </linearGradient>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.06)"
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
            stroke="url(#appleEnergyGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#gaugeGlow)"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Center Digital Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-semibold text-white tracking-[-0.05em] tabular-nums">
            {currentPower.toFixed(1)}
          </span>
          <span className="mt-0.5 text-xs font-semibold tracking-[0.14em] text-emerald-400">
            WATTS
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
            Current draw
          </span>
        </div>
      </div>

      <div className="glass-pill flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-xs">
        <span className="text-slate-400 font-medium">Available capacity ({maxPower}W)</span>
        <span className="font-mono font-bold text-emerald-300">
          {percentage.toFixed(0)}% Utilized
        </span>
      </div>
    </div>
  );
};

export default EnergyGauge;
