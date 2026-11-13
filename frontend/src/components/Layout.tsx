import React, { useState, createContext, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Zap, ShieldCheck, Globe } from 'lucide-react';
import { useTelemetryWebSocket } from '../services/websocket';
import type { TelemetryPayload } from '../types';

interface TelemetryContextType {
  data: TelemetryPayload | null;
  isConnected: boolean;
}

const TelemetryContext = createContext<TelemetryContextType>({
  data: null,
  isConnected: false,
});

export const useTelemetry = () => useContext(TelemetryContext);

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { data: telemetryData, isConnected } = useTelemetryWebSocket();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'System Overview & Energy Dashboard';
      case '/workloads':
        return 'Workload Management & History';
      case '/benchmark':
        return 'Model Benchmarking & Quantization Matrix';
      case '/optimizer':
        return 'Pareto-Optimal Model Constrained Optimizer';
      case '/carbon':
        return 'Carbon-Aware Scheduling & Grid Emissions';
      case '/hardware':
        return 'ESP32 & INA219 Live Hardware Profiling';
      case '/settings':
        return 'System Configuration & Regional Weights';
      default:
        return 'GreenCompute AI Platform';
    }
  };

  return (
    <TelemetryContext.Provider value={{ data: telemetryData, isConnected }}>
      <div className="flex h-screen w-screen overflow-hidden bg-gray-950 text-gray-100 font-sans">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isWsConnected={isConnected}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Header */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-800 bg-gray-950/80 px-4 lg:px-8 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white lg:text-xl">
                  {getPageTitle(location.pathname)}
                </h1>
                <p className="text-xs text-gray-400 hidden sm:block">
                  Constrained Energy-Accuracy-Latency Multi-Objective Optimization
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Regional Grid Badge */}
              <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-gray-800 bg-gray-900/80 px-3 py-1 text-xs text-gray-300">
                <Globe className="h-3.5 w-3.5 text-emerald-400" />
                <span>IN-OD (Odisha Grid)</span>
                <span className="font-mono text-emerald-400 font-medium">0.82 kg/kWh</span>
              </div>

              {/* Energy Live Readout */}
              <div className="flex items-center gap-2 rounded-full border border-emerald-900/40 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-300">
                <Zap className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-mono font-medium">
                  {telemetryData ? `${telemetryData.power_w.toFixed(1)} W` : 'Live Stream'}
                </span>
              </div>

              {/* Guardrails Active Pill */}
              <div className="hidden md:flex items-center gap-1.5 rounded-full border border-teal-900/40 bg-teal-950/40 px-3 py-1 text-xs text-teal-300">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
                <span>Pareto Guardrails Active</span>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </TelemetryContext.Provider>
  );
};

export default Layout;
