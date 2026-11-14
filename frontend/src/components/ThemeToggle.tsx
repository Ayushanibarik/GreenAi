import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'segmented') {
    const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
      { mode: 'light', label: 'Light', icon: <Sun className="h-3.5 w-3.5" /> },
      { mode: 'dark', label: 'Dark', icon: <Moon className="h-3.5 w-3.5" /> },
      { mode: 'system', label: 'System', icon: <Laptop className="h-3.5 w-3.5" /> },
    ];

    return (
      <div
        className={`inline-flex items-center gap-1 rounded-xl p-1 border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-xs ${className}`}
        role="radiogroup"
        aria-label="Color theme selection"
      >
        {options.map((opt) => {
          const isActive = theme === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => setTheme(opt.mode)}
              role="radio"
              aria-checked={isActive}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-[var(--surface-panel)] text-[var(--text-primary)] shadow-xs border border-[var(--border-subtle)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Compact icon button for header bar
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all cursor-pointer ${className}`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Current: ${resolvedTheme} mode (Click to toggle)`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-4 w-4 text-[var(--brand-amber)] transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-[var(--brand-blue)] transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
};

export default ThemeToggle;
