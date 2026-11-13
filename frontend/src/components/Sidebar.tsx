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
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/optimizer', label: 'Planning', icon: Sliders },
  { to: '/benchmark', label: 'Performance', icon: BarChart3 },
  { to: '/carbon', label: 'Grid impact', icon: Leaf },
  { to: '/hardware', label: 'Devices', icon: Cpu },
  { to: '/workloads', label: 'Runs', icon: Layers },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
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
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col glass-panel border-r p-4 transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-[14px] bg-emerald-500 text-white shadow-[0_5px_14px_rgba(30,142,62,0.25)]">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-white">GreenCompute</h1>
              <p className="mt-0.5 text-[10px] tracking-tight text-slate-500">Compute, considered.</p>
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
        <nav className="flex-1 space-y-1 px-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Workspace
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
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/25'
                      : 'border border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
