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
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isWsConnected?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isWsConnected }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/workloads', label: 'Workloads', icon: Layers },
    { to: '/benchmark', label: 'Benchmark', icon: Gauge },
    { to: '/optimizer', label: 'Optimizer', icon: Sliders },
    { to: '/carbon', label: 'Carbon Intelligence', icon: Leaf },
    { to: '/hardware', label: 'Hardware Telemetry', icon: Cpu },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-800 bg-gray-950 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">GreenCompute</span>
              <span className="ml-1 text-xs font-semibold uppercase text-emerald-400 tracking-wider">AI</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 shadow-sm shadow-emerald-950/40'
                    : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
                }`
              }
            >
              {({ isActive }) => {
                const Icon = item.icon;
                return (
                  <>
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive ? 'text-emerald-400' : 'text-gray-400 group-hover:text-gray-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>

        {/* Live Status indicator */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center justify-between rounded-lg bg-gray-900/80 p-3 border border-gray-800">
            <div className="flex items-center gap-2">
              <Radio className={`h-4 w-4 ${isWsConnected ? 'text-emerald-400 animate-pulse' : 'text-gray-500'}`} />
              <span className="text-xs text-gray-300">Live Telemetry</span>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                isWsConnected
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {isWsConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
