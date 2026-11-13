import React from 'react';
import { Zap } from 'lucide-react';

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
  // Calculate arc SVG path
  // Semi-circle from -90 to +90 degrees or 180-deg arc
  const radius = 70;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // Half-circle perimeter
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm">
      <div className="flex w-full items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold text-gray-200">{title}</span>
        </div>
        <span className="text-xs text-gray-500 font-mono">Max: {maxPower}W</span>
      </div>

      <div className="relative my-4 flex items-center justify-center">
        <svg className="w-48 h-28 overflow-visible" viewBox="0 0 160 90">
          {/* Background Arc */}
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke="#1F2937"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke="url(#emeraldGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
          <defs>
            <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="70%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Readout */}
        <div className="absolute bottom-0 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {currentPower.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-emerald-400">W</span>
          </div>
          <span className="text-xs text-gray-400">{subtitle}</span>
        </div>
      </div>

      <div className="flex w-full justify-between px-4 text-xs font-mono text-gray-500">
        <span>0W</span>
        <span className="text-emerald-400 font-medium">{percentage.toFixed(0)}% Load</span>
        <span>{maxPower}W</span>
      </div>
    </div>
  );
};

export default EnergyGauge;
