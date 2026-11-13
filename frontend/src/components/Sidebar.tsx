import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Gauge,
  Sliders,
  Leaf,
  Cpu,
  Settings,
  X,
  Radio,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isWsConnected?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isWsConnected = true }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { to: '/workloads', label: 'Workloads', icon: Layers },
    { to: '/benchmark', label: 'Benchmark', icon: Gauge },
    { to: '/optimizer', label: 'Optimizer', icon: Sliders, badge: 'Pareto' },
    { to: '/carbon', label: 'Carbon Intelligence', icon: Leaf },
    { to: '/hardware', label: 'Hardware Telemetry', icon: Cpu, badge: 'ESP32' },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop with high-blur scrim */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container - Apple macOS / iPadOS frosted panel style */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col glass-panel border-r border-white/[0.08] bg-[#090d16]/80 transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 via-emerald-500/10 to-teal-500/20 border border-emerald-400/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <Leaf className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-gradient-silver">GreenCompute</span>
                <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 tracking-wide">
                Energy & Carbon Orchestrator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-white lg:hidden transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="px-4 py-3">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Platform Navigation
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-semibold'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 hover:border hover:border-white/[0.05]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                        isActive
                          ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                          : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Hardware Status & OAIC Badge (Apple Watch style widget) */}
        <div className="p-4 border-t border-white/[0.06] space-y-3">
          <div className="rounded-2xl glass-card p-3.5 border border-white/[0.08] bg-slate-900/60 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                Edge Hardware
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                ONLINE
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">ESP32 + INA219</span>
              <span className="font-mono text-emerald-300 font-bold">5.0V / 1 Hz</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="h-3 w-3 text-emerald-400" /> OAIC 2026 Edition
            </span>
            <span className="font-mono text-[10px]">v1.2 Pro</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
