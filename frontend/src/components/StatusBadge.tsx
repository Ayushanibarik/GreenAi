import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'running' | 'completed' | 'failed';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = {
    pending: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500',
      ping: false,
      label: 'Pending',
    },
    running: {
      bg: 'bg-sky-500/10 dark:bg-sky-500/15',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-500/30',
      dot: 'bg-sky-500',
      ping: true,
      label: 'Executing',
    },
    completed: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-500',
      ping: false,
      label: 'Completed',
    },
    failed: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-500/30',
      dot: 'bg-rose-500',
      ping: false,
      label: 'Failed',
    },
  }[status] || {
    bg: 'bg-[var(--surface-muted)]',
    text: 'text-[var(--text-muted)]',
    border: 'border-[var(--border-subtle)]',
    dot: 'bg-slate-400',
    ping: false,
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {config.ping && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`} />
      </span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
