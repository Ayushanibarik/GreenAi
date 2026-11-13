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
  Zap,
  Sparkles,
  Wifi,
  X,
} from 'lucide-react';
import { useTelemetry } from './Layout';

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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col glass-panel border-r border-white/[0.08] p-5 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header (Apple Studio Aesthetic) */}
        <div className="flex items-center justify-between px-3 py-3 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_0_25px_rgba(16,185,129,0.45)]">
              <Leaf className="h-6 w-6 text-white" />
              <div className="absolute inset-0 rounded-2xl border border-white/30" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">GreenCompute</h1>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30 uppercase tracking-widest font-mono">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight mt-0.5">Carbon-Aware Inference</p>
            </div>
          </div>

          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
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
                  `group relative flex items-center gap-3.5 rounded-2xl px-4 py-3 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Edge Sensor Hardware Status (Apple Watch Complication Widget) */}
        <div className="rounded-3xl glass-card p-4 mt-auto border border-white/[0.08]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                Edge Telemetry
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Wifi className="h-3 w-3 text-emerald-400" />
              {hardwareStatus.signal}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Shunt Device</span>
              <span className="text-xs font-bold font-mono text-white">ESP32 + INA219</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">Sampling</span>
              <span className="text-xs font-bold font-mono text-emerald-400">10Hz Stream</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
