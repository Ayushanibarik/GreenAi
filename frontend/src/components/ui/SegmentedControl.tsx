import React from 'react';

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
  name?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'sm',
  className = '',
  name,
}: SegmentedControlProps<T>) {
  const padClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm';

  return (
    <div
      role="radiogroup"
      aria-label={name ?? 'Selection control'}
      className={`inline-flex items-center gap-1 rounded-xl p-1 border border-[var(--border-subtle)] bg-[var(--surface-muted)] ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer ${padClass} ${
              isSelected
                ? 'bg-[var(--surface-panel)] text-[var(--text-primary)] shadow-xs border border-[var(--border-subtle)] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
