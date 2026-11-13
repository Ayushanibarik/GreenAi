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
    <div className="glass-card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          {label}
        </span>
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-[-0.05em] text-white tabular-nums sm:text-[2.7rem]">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-emerald-300">
            {unit}
          </span>
        )}
      </div>

      {(trend || subtext) && (
        <div className="mt-5 flex items-center justify-between gap-2 border-t border-white/[0.07] pt-3 text-xs">
          {trend && (
            <div
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                trend.isPositive
                  ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/25'
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
            <span className="truncate text-[11px] font-medium text-slate-400">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
