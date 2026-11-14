import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  pulsing?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  pulsing = false,
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  const styles = {
    success: {
      bg: 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-primary-border)]',
      dot: 'bg-[var(--brand-primary)]',
    },
    warning: {
      bg: 'bg-[var(--brand-amber-subtle)] text-[var(--brand-amber)] border-[var(--brand-amber-border)]',
      dot: 'bg-[var(--brand-amber)]',
    },
    error: {
      bg: 'bg-[var(--brand-rose-subtle)] text-[var(--brand-rose)] border-[var(--brand-rose-border)]',
      dot: 'bg-[var(--brand-rose)]',
    },
    info: {
      bg: 'bg-[var(--brand-blue-subtle)] text-[var(--brand-blue)] border-[var(--brand-blue-border)]',
      dot: 'bg-[var(--brand-blue)]',
    },
    neutral: {
      bg: 'bg-[var(--surface-muted)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
      dot: 'bg-[var(--text-muted)]',
    },
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses} ${styles.bg} ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulsing && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${styles.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${styles.dot}`} />
      </span>
      <span>{children}</span>
    </span>
  );
};

export default Badge;
