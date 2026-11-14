import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sliders,
  BarChart3,
  Leaf,
  Cpu,
  Layers,
  Settings,
  Wifi,
  X,
} from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isWsConnected?: boolean;
}

const navItems = [
  { to: '/', label: 'Executive Overview', icon: LayoutDashboard },
  { to: '/optimizer', label: 'Green Optimizer', icon: Sliders },
  { to: '/benchmark', label: 'Model Benchmarks', icon: BarChart3 },
  { to: '/carbon', label: 'Carbon Intelligence', icon: Leaf },
  { to: '/hardware', label: 'Edge Oscilloscope', icon: Cpu },
  { to: '/workloads', label: 'Workload Pipeline', icon: Layers },
  { to: '/settings', label: 'System Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { hardwareStatus } = useTelemetry();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-panel)] p-4 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2.5 py-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-white shadow-xs">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">GreenCompute</span>
                <span className="rounded-md bg-[var(--brand-primary-subtle)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--brand-primary)] border border-[var(--brand-primary-border)] uppercase tracking-wider font-mono">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] tracking-tight">Sustainable Observability</p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] cursor-pointer"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Core Workspaces
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] border border-[var(--brand-primary-border)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                        isActive ? 'text-[var(--brand-primary)]' : 'text-[var(--text-muted)]'
                      }`}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Edge Hardware Status Widget */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3.5 mt-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                Shunt Telemetry
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1">
              <Wifi className="h-3 w-3 text-[var(--brand-primary)]" />
              {hardwareStatus.signal.split(' ')[0]}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block font-medium">Device</span>
              <span className="text-xs font-bold font-mono text-[var(--text-primary)]">ESP32 + INA219</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[var(--text-muted)] block font-medium">Sampling</span>
              <span className="text-xs font-bold font-mono text-[var(--brand-primary)]">10Hz Shunt</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
