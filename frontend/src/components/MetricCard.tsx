import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  subtext?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  trend,
  icon,
  subtext,
}) => {
  return (
    <div className="glass-card relative overflow-hidden p-6">
      {/* Ambient Micro Glow */}
      <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      <div className="relative flex items-center justify-between gap-3 mb-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/[0.08] text-emerald-400 shadow-sm shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="relative flex items-baseline gap-2">
        <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
          {value}
        </span>
        {unit && (
          <span className="text-base font-semibold text-emerald-400/90 font-mono">
            {unit}
          </span>
        )}
      </div>

      {(trend || subtext) && (
        <div className="relative mt-4 flex items-center justify-between gap-2 pt-3 border-t border-white/[0.05] text-xs">
          {trend && (
            <div
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                trend.isPositive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="h-3 w-3 stroke-[2.5]" />
              )}
              <span>{Math.abs(trend.value)}%</span>
              {trend.label && <span className="opacity-75 ml-0.5">{trend.label}</span>}
            </div>
          )}
          {subtext && (
            <span className="text-[11px] text-slate-400 font-medium truncate">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
