import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Zap } from 'lucide-react';
import { useTelemetryWebSocket } from '../services/websocket';
import type { TelemetryPayload, HardwareReading } from '../types';

export interface TelemetryContextType {
  data: TelemetryPayload | null;
  isConnected: boolean;
  hardwareHistory: HardwareReading[];
}

const TelemetryContext = createContext<TelemetryContextType>({
  data: null,
  isConnected: false,
  hardwareHistory: [],
});

export const useTelemetry = () => useContext(TelemetryContext);

const initialHardwareHistory: HardwareReading[] = [
  { timestamp: '12:00:10', voltage_v: 12.02, current_ma: 6300, power_mw: 75726, energy_mwh: 1240 },
  { timestamp: '12:00:09', voltage_v: 12.03, current_ma: 6100, power_mw: 73383, energy_mwh: 1238 },
  { timestamp: '12:00:08', voltage_v: 12.05, current_ma: 5900, power_mw: 71095, energy_mwh: 1236 },
  { timestamp: '12:00:07', voltage_v: 12.01, current_ma: 7400, power_mw: 88874, energy_mwh: 1234 },
  { timestamp: '12:00:06', voltage_v: 11.96, current_ma: 10100, power_mw: 120796, energy_mwh: 1231 },
  { timestamp: '12:00:05', voltage_v: 11.94, current_ma: 10800, power_mw: 128952, energy_mwh: 1227 },
  { timestamp: '12:00:04', voltage_v: 11.95, current_ma: 10400, power_mw: 124280, energy_mwh: 1223 },
  { timestamp: '12:00:03', voltage_v: 11.98, current_ma: 9800, power_mw: 117404, energy_mwh: 1219 },
  { timestamp: '12:00:02', voltage_v: 12.02, current_ma: 7200, power_mw: 86544, energy_mwh: 1215 },
  { timestamp: '12:00:01', voltage_v: 12.04, current_ma: 6500, power_mw: 78260, energy_mwh: 1211 },
];

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { data: wsTelemetry, isConnected } = useTelemetryWebSocket();

  const [simTelemetry, setSimTelemetry] = useState<TelemetryPayload>({
    cpu_percent: 46.2,
    gpu_percent: 78.4,
    ram_percent: 62.1,
    power_w: 84.6,
    energy_wh: 124.8,
    voltage_v: 12.02,
    current_ma: 7038,
    power_mw: 84600,
    energy_mwh: 124800,
    timestamp: new Date().toLocaleTimeString(),
  });

  const [hardwareHistory, setHardwareHistory] = useState<HardwareReading[]>(initialHardwareHistory);

  useEffect(() => {
    if (isConnected) return;

    const interval = setInterval(() => {
      setSimTelemetry((prev) => {
        const jitterPower = (Math.random() - 0.48) * 8.0;
        const nextPower = Math.max(45.0, Math.min(185.0, prev.power_w + jitterPower));
        const nextEnergy = prev.energy_wh + (nextPower * 1.0) / 3600;
        const nextVoltage = 12.0 + (Math.random() * 0.08 - 0.04);
        const nextCurrentMa = Math.round((nextPower / nextVoltage) * 1000);
        const nextCpu = Math.max(20, Math.min(95, prev.cpu_percent + (Math.random() * 6 - 3)));
        const nextGpu = Math.max(30, Math.min(99, prev.gpu_percent + (Math.random() * 8 - 4)));
        const nextRam = Math.max(40, Math.min(85, prev.ram_percent + (Math.random() * 2 - 1)));
        const ts = new Date().toLocaleTimeString();

        const newPoint: HardwareReading = {
          timestamp: ts,
          voltage_v: nextVoltage,
          current_ma: nextCurrentMa,
          power_mw: Math.round(nextPower * 1000),
          energy_mwh: Math.round(nextEnergy * 1000),
        };

        setHardwareHistory((hist) => [newPoint, ...hist.slice(0, 24)]);

        return {
          cpu_percent: Number(nextCpu.toFixed(1)),
          gpu_percent: Number(nextGpu.toFixed(1)),
          ram_percent: Number(nextRam.toFixed(1)),
          power_w: Number(nextPower.toFixed(1)),
          energy_wh: Number(nextEnergy.toFixed(2)),
          voltage_v: Number(nextVoltage.toFixed(3)),
          current_ma: nextCurrentMa,
          power_mw: Math.round(nextPower * 1000),
          energy_mwh: Math.round(nextEnergy * 1000),
          timestamp: ts,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const activeTelemetry: TelemetryPayload =
    isConnected && wsTelemetry
      ? {
          ...wsTelemetry,
          voltage_v: wsTelemetry.voltage_v ?? 12.01,
          current_ma: wsTelemetry.current_ma ?? Math.round((wsTelemetry.power_w / 12.01) * 1000),
          power_mw: wsTelemetry.power_mw ?? Math.round(wsTelemetry.power_w * 1000),
          energy_mwh: wsTelemetry.energy_mwh ?? Math.round(wsTelemetry.energy_wh * 1000),
        }
      : simTelemetry;

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Overview';
      case '/workloads':
        return 'Runs';
      case '/benchmark':
        return 'Performance';
      case '/optimizer':
        return 'Planning';
      case '/carbon':
        return 'Grid impact';
      case '/hardware':
        return 'Devices';
      case '/settings':
        return 'Settings';
      default:
        return 'GreenCompute';
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <TelemetryContext.Provider
      value={{
        data: activeTelemetry,
        isConnected,
        hardwareHistory,
      }}
    >
      <div className="app-shell flex h-screen w-screen overflow-hidden text-slate-100 font-sans antialiased">

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <header className="glass-panel z-30 flex h-[72px] shrink-0 items-center justify-between border-b px-5 lg:px-8">
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white lg:hidden transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold tracking-tight text-white lg:text-xl truncate">
                  {pageTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs text-emerald-200">
                <Zap className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="font-mono font-bold tracking-tight">
                  {activeTelemetry.power_w.toFixed(1)} W
                </span>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TelemetryContext.Provider>
  );
};

export default Layout;
