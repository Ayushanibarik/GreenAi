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
      className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-sm transition-colors duration-200 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </span>
        {icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--accent-primary)]">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] tabular-nums sm:text-4xl">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
            {unit}
          </span>
        )}
      </div>

      {(trend || subtext) && (
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3 text-xs">
          {trend && (
            <div
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                trend.isPositive
                  ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="h-3 w-3 stroke-[2.5]" />
              )}
              <span>{Math.abs(trend.value)}%</span>
              {trend.label && <span className="opacity-80 ml-0.5">{trend.label}</span>}
            </div>
          )}
          {subtext && (
            <span className="truncate text-[11px] text-[var(--text-muted)]">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
