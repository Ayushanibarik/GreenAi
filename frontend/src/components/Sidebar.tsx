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
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/workloads', label: 'Workloads', icon: Layers },
  { to: '/benchmark', label: 'Benchmarks', icon: BarChart3 },
  { to: '/optimizer', label: 'Optimizer', icon: Sliders },
  { to: '/carbon', label: 'Carbon', icon: Leaf },
  { to: '/hardware', label: 'Hardware', icon: Cpu },
  { to: '/settings', label: 'Settings', icon: Settings },
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
        className={`fixed left-0 top-0 z-50 flex h-screen w-60 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-panel)] p-4 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-white shadow-xs">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              GreenCompute <span className="text-[10px] text-[var(--brand-primary)] font-mono">AI</span>
            </span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
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

        {/* Minimal Hardware Sensor Widget */}
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2.5 mt-auto">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-mono text-[var(--text-primary)] font-medium">ESP32 + INA219</span>
            <span className="flex items-center gap-1 font-mono text-[var(--brand-primary)] text-[10px]">
              <Wifi className="h-3 w-3" />
              10Hz
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
