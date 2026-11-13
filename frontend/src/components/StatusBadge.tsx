import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    pending: {
      bg: 'bg-amber-950/50',
      text: 'text-amber-400',
      border: 'border-amber-800',
      dot: 'bg-amber-400',
      label: 'Pending',
    },
    running: {
      bg: 'bg-emerald-950/50',
      text: 'text-emerald-400',
      border: 'border-emerald-800',
      dot: 'bg-emerald-400 animate-pulse',
      label: 'Running',
    },
    completed: {
      bg: 'bg-teal-950/50',
      text: 'text-teal-400',
      border: 'border-teal-800',
      dot: 'bg-teal-400',
      label: 'Completed',
    },
    failed: {
      bg: 'bg-rose-950/50',
      text: 'text-rose-400',
      border: 'border-rose-800',
      dot: 'bg-rose-400',
      label: 'Failed',
    },
  }[status] || {
    bg: 'bg-gray-800',
    text: 'text-gray-300',
    border: 'border-gray-700',
    dot: 'bg-gray-400',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
