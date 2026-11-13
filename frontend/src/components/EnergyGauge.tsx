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
    <div className="glass-card relative overflow-hidden p-6 flex flex-col items-center justify-between min-h-[340px]">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-white/[0.06] pb-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Active Power Draw
          </span>
        </div>
        <span className="rounded-full glass-pill px-2.5 py-0.5 text-[10px] font-mono text-emerald-300 font-bold">
          10Hz Shunt
        </span>
      </div>

      {/* Apple Watch Style SVG Activity Arc */}
      <div className="relative flex items-center justify-center my-auto">
        <svg className="w-52 h-52 -rotate-[210deg] transform" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="appleEnergyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
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
          <span className="text-4xl font-extrabold text-white tracking-tight font-mono drop-shadow-md">
            {currentPower.toFixed(1)}
          </span>
          <span className="text-xs font-bold text-emerald-400 font-mono tracking-wider mt-0.5">
            WATTS
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
            Dynamic Load
          </span>
        </div>
      </div>

      {/* Footer Pill Status */}
      <div className="w-full flex items-center justify-between rounded-2xl glass-pill px-4 py-2.5 border border-white/[0.06] text-xs">
        <span className="text-slate-400 font-medium">Headroom ({maxPower}W Max)</span>
        <span className="font-mono font-bold text-emerald-300">
          {percentage.toFixed(0)}% Utilized
        </span>
      </div>
    </div>
  );
};

export default EnergyGauge;
