import React from 'react';
import { Zap, Activity } from 'lucide-react';

interface EnergyGaugeProps {
  currentPower: number; // Watts
  maxPower?: number; // default e.g. 250W
  title?: string;
  subtitle?: string;
}

export const EnergyGauge: React.FC<EnergyGaugeProps> = ({
  currentPower,
  maxPower = 250,
  title = 'Live Power Consumption',
  subtitle = 'Instantaneous Draw',
}) => {
  const percentage = Math.min(Math.max((currentPower / maxPower) * 100, 0), 100);
  const radius = 70;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // 180-deg half-circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center rounded-2xl glass-card p-5 border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
      {/* Top subtle highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="flex w-full items-center justify-between border-b border-white/[0.06] pb-3 mb-1">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">{title}</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
          Scale: {maxPower}W
        </span>
      </div>

      <div className="relative my-3 flex items-center justify-center">
        {/* Glow behind the arc */}
        <div className="absolute top-4 h-24 w-36 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />

        <svg className="w-52 h-32 overflow-visible" viewBox="0 0 160 92">
          {/* Background Track */}
          <path
            d="M 10 82 A 70 70 0 0 1 150 82"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <path
            d="M 10 82 A 70 70 0 0 1 150 82"
            fill="none"
            stroke="url(#appleEmeraldGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="appleEmeraldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Readout */}
        <div className="absolute bottom-1 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl lg:text-4xl font-extrabold text-white font-mono tracking-tight drop-shadow-sm">
              {currentPower.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-emerald-400 font-mono">W</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">{subtitle}</span>
        </div>
      </div>

      <div className="flex w-full justify-between px-3 text-[11px] font-mono text-slate-400 pt-2 border-t border-white/[0.05]">
        <span>0W</span>
        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          {percentage.toFixed(0)}% Load Capacity
        </span>
        <span>{maxPower}W</span>
      </div>
    </div>
  );
};

export default EnergyGauge;
