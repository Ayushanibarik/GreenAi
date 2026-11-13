import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    isPositive?: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  subtext?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  trend,
  icon,
  subtext,
  className = '',
}) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl glass-card p-5.5 border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:border-emerald-500/40 hover:shadow-[0_12px_36px_rgba(16,185,129,0.18)] transition-all duration-300 ${className}`}
    >
      {/* Top subtle inset highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow-sm">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
            {unit}
          </span>
        )}
      </div>

      {(trend || subtext) && (
        <div className="mt-3.5 flex items-center gap-2 pt-3 border-t border-white/[0.05] text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold border transition-colors ${
                trend.isPositive !== false
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}
            >
              {trend.value > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : trend.value < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
          {trend?.label && <span className="text-slate-400 text-[11px]">{trend.label}</span>}
          {subtext && !trend?.label && <span className="text-slate-400 text-[11px] truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
