import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import { Menu, Zap, Pause, Play } from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';

export { useTelemetry } from '../context/TelemetryContext';
export type { TelemetryContextType } from '../context/TelemetryContext';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { data: telemetry, isConnected, isSimulating, toggleSimulation } = useTelemetry();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Dashboard';
      case '/workloads':
        return 'Workloads';
      case '/benchmark':
        return 'Benchmarks';
      case '/optimizer':
        return 'Optimizer';
      case '/carbon':
        return 'Carbon';
      case '/hardware':
        return 'Hardware';
      case '/settings':
        return 'Settings';
      default:
        return 'GreenCompute';
    }
  };

  const pageTitle = getPageTitle(location.pathname);
  const activePower = telemetry?.power_w ?? 84.6;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--surface-canvas)] text-[var(--text-primary)] font-sans antialiased">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isWsConnected={isConnected}
      />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-panel)] px-4 sm:px-6 z-30 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] lg:hidden transition-colors cursor-pointer"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold tracking-tight text-[var(--text-primary)] truncate">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Telemetry Stream Pill */}
            <button
              onClick={toggleSimulation}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                isSimulating
                  ? 'bg-[var(--brand-primary-subtle)] border-[var(--brand-primary-border)] text-[var(--brand-primary)]'
                  : 'bg-[var(--surface-muted)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title={isSimulating ? '10Hz Stream Active (Click to pause)' : 'Stream Paused (Click to resume)'}
            >
              {isSimulating ? (
                <>
                  <Pause className="h-3 w-3 text-[var(--brand-primary)]" />
                  <span>10Hz</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 text-[var(--text-muted)]" />
                  <span>Paused</span>
                </>
              )}
            </button>

            {/* Power Pill */}
            <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs border border-[var(--border-subtle)] bg-[var(--surface-muted)] font-mono font-medium">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>{activePower.toFixed(1)} W</span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle variant="compact" />
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
