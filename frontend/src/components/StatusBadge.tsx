import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    pending: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-300',
      border: 'border-amber-500/30',
      dot: 'bg-amber-400',
      ping: false,
      label: 'Pending',
    },
    running: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40',
      dot: 'bg-emerald-400',
      ping: true,
      label: 'Running',
    },
    completed: {
      bg: 'bg-teal-500/15',
      text: 'text-teal-300',
      border: 'border-teal-500/30',
      dot: 'bg-teal-400',
      ping: false,
      label: 'Completed',
    },
    failed: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-300',
      border: 'border-rose-500/30',
      dot: 'bg-rose-400',
      ping: false,
      label: 'Failed',
    },
  }[status] || {
    bg: 'bg-slate-800/50',
    text: 'text-slate-300',
    border: 'border-slate-700/50',
    dot: 'bg-slate-400',
    ping: false,
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md ${config.bg} ${config.text} ${config.border} shadow-sm`}
    >
      <span className="relative flex h-2 w-2">
        {config.ping && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
