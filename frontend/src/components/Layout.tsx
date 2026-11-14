import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import { Menu, Zap, Globe, Cpu, Pause, Play } from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';

// Re-export for backward compatibility across existing views
export { useTelemetry } from '../context/TelemetryContext';
export type { TelemetryContextType } from '../context/TelemetryContext';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { data: telemetry, isConnected, isSimulating, toggleSimulation, hardwareStatus } = useTelemetry();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return {
          title: 'Executive Overview',
          sub: 'Multi-source energy telemetry, empirical savings, and workload governance',
        };
      case '/workloads':
        return {
          title: 'Workload Pipeline & Queue',
          sub: 'Submit, profile, and track machine learning training and inference jobs',
        };
      case '/benchmark':
        return {
          title: 'Model Benchmark Matrix',
          sub: 'Empirical precision scaling comparisons across FP32, FP16, INT8, and ONNX Runtime',
        };
      case '/optimizer':
        return {
          title: 'Constrained Pareto Optimizer',
          sub: 'Multi-objective model selection subject to strict accuracy, latency, and memory SLAs',
        };
      case '/carbon':
        return {
          title: 'Regional Carbon Intelligence',
          sub: 'CEA Baseline v19 diurnal grid forecasting and temporal load-shifting dispatch',
        };
      case '/hardware':
        return {
          title: 'Physical Hardware Telemetry',
          sub: 'Direct ESP32 + TI INA219 high-side DC current shunt oscilloscope stream (10Hz)',
        };
      case '/settings':
        return {
          title: 'System Preferences & Policies',
          sub: 'Regional grid emission factors, multi-objective weights, and theme controls',
        };
      default:
        return {
          title: 'GREEN AI Platform',
          sub: 'Sustainable AI observability and optimization engine',
        };
    }
  };

  const pageInfo = getPageTitle(location.pathname);
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
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-panel)] px-4 sm:px-6 lg:px-8 z-30 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] lg:hidden transition-colors cursor-pointer"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)] truncate">
                {pageInfo.title}
              </h1>
              <p className="text-xs text-[var(--text-muted)] hidden md:block truncate">
                {pageInfo.sub}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* 10Hz Feed Simulator Pill */}
            <button
              onClick={toggleSimulation}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                isSimulating
                  ? 'bg-[var(--brand-primary-subtle)] border-[var(--brand-primary-border)] text-[var(--brand-primary)]'
                  : 'bg-[var(--surface-muted)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title={isSimulating ? '10Hz Telemetry Stream Active (Click to pause)' : 'Telemetry Stream Paused (Click to resume)'}
            >
              {isSimulating ? (
                <>
                  <Pause className="h-3 w-3 text-[var(--brand-primary)]" />
                  <span className="hidden sm:inline">10Hz Stream</span>
                  <span className="sm:hidden">10Hz</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 text-[var(--text-muted)]" />
                  <span>Paused</span>
                </>
              )}
            </button>

            {/* Regional Grid Indicator Badge */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-secondary)]">
              <Globe className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
              <span className="font-medium">IN-OD</span>
              <span className="font-mono text-[11px] font-bold text-[var(--brand-primary)]">
                0.82 kg/kWh
              </span>
            </div>

            {/* Instantaneous Power Readout Badge */}
            <div className="flex items-center gap-1.5 rounded-full border border-[var(--brand-blue-border)] bg-[var(--brand-blue-subtle)] px-3 py-1.5 text-xs text-[var(--brand-blue)]">
              <Zap className="h-3.5 w-3.5 animate-pulse" />
              <span className="font-mono font-bold tracking-tight">
                {activePower.toFixed(1)} W
              </span>
            </div>

            {/* Dark / Light Theme Toggle */}
            <ThemeToggle variant="compact" />
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
