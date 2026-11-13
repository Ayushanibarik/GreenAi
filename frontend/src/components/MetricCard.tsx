import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    isPositive?: boolean; // isPositive indicates if this change is considered good (e.g. reduction in carbon is positive)
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
      className={`relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm transition-all hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/20 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-emerald-400">{unit}</span>}
      </div>

      {(trend || subtext) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-medium ${
                trend.isPositive !== false
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {trend.value > 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : trend.value < 0 ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
          {trend?.label && <span className="text-gray-500">{trend.label}</span>}
          {subtext && <span className="text-gray-500">{subtext}</span>}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
