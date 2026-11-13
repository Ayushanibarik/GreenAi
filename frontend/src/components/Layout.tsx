import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Zap, ShieldCheck, Globe, Cpu, Radio, Play, Pause } from 'lucide-react';
import { useTelemetryWebSocket } from '../services/websocket';
import type { TelemetryPayload, HardwareReading } from '../types';

export interface TelemetryContextType {
  data: TelemetryPayload | null;
  isConnected: boolean;
  isSimulating: boolean;
  toggleSimulation: () => void;
  hardwareHistory: HardwareReading[];
  hardwareStatus: {
    device: string;
    port: string;
    signal: string;
    isOnline: boolean;
  };
}

const TelemetryContext = createContext<TelemetryContextType>({
  data: null,
  isConnected: false,
  isSimulating: true,
  toggleSimulation: () => {},
  hardwareHistory: [],
  hardwareStatus: {
    device: 'ESP32-WROOM-32D',
    port: 'COM3 (115200 baud)',
    signal: '-62 dBm',
    isOnline: true,
  },
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

  // Simulation toggle state (defaults to true for instant demo satisfaction)
  const [isSimulating, setIsSimulating] = useState(true);
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

  const toggleSimulation = useCallback(() => {
    setIsSimulating((prev) => !prev);
  }, []);

  // Simulator interval loop
  useEffect(() => {
    if (!isSimulating && isConnected) return;

    const interval = setInterval(() => {
      setSimTelemetry((prev) => {
        // Natural fluctuations around realistic inference benchmarks
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
  }, [isSimulating, isConnected]);

  // Use real WS data if connected and simulation is disabled, otherwise simulated telemetry
  const activeTelemetry: TelemetryPayload =
    !isSimulating && isConnected && wsTelemetry
      ? {
          ...wsTelemetry,
          voltage_v: wsTelemetry.voltage_v ?? 12.01,
          current_ma: wsTelemetry.current_ma ?? Math.round((wsTelemetry.power_w / 12.01) * 1000),
          power_mw: wsTelemetry.power_mw ?? Math.round(wsTelemetry.power_w * 1000),
          energy_mwh: wsTelemetry.energy_mwh ?? Math.round(wsTelemetry.energy_wh * 1000),
        }
      : simTelemetry;

  const hardwareStatus = {
    device: 'ESP32-WROOM-32D + INA219',
    port: isConnected ? 'WebSocket /ws/telemetry' : 'COM3 (115200 baud)',
    signal: 'Strong -62 dBm',
    isOnline: isConnected || isSimulating,
  };

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
    <TelemetryContext.Provider
      value={{
        data: activeTelemetry,
        isConnected: isConnected || isSimulating,
        isSimulating,
        toggleSimulation,
        hardwareHistory,
        hardwareStatus,
      }}
    >
      <div className="flex h-screen w-screen overflow-hidden bg-gray-950 text-gray-100 font-sans">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isWsConnected={isConnected || isSimulating}
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

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Live Simulator Toggle Switch */}
              <button
                onClick={toggleSimulation}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
                  isSimulating
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-950'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
                title={isSimulating ? 'Click to pause simulator' : 'Click to start live telemetry simulator'}
              >
                {isSimulating ? (
                  <>
                    <Pause className="h-3 w-3 text-emerald-400" />
                    <span>Simulator: Active</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 text-gray-400" />
                    <span>Simulator: Paused</span>
                  </>
                )}
              </button>

              {/* Hardware Device Badge */}
              <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-gray-800 bg-gray-900/80 px-3 py-1 text-xs text-gray-300">
                <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-mono text-emerald-400">{hardwareStatus.port.split(' ')[0]}</span>
                <span className="text-gray-500">|</span>
                <span className="text-[11px] text-gray-400">{hardwareStatus.signal}</span>
              </div>

              {/* Regional Grid Badge */}
              <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-gray-800 bg-gray-900/80 px-3 py-1 text-xs text-gray-300">
                <Globe className="h-3.5 w-3.5 text-emerald-400" />
                <span>IN-OD (Odisha)</span>
                <span className="font-mono text-emerald-400 font-medium">0.82 kg/kWh</span>
              </div>

              {/* Live Power Readout */}
              <div className="flex items-center gap-2 rounded-full border border-emerald-900/50 bg-emerald-950/60 px-3 py-1 text-xs text-emerald-300">
                <Zap className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="font-mono font-bold">
                  {activeTelemetry.power_w.toFixed(1)} W
                </span>
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
