import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Zap, Globe, Cpu, Pause, Play, Sparkles } from 'lucide-react';
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
        return { title: 'System Overview & Telemetry', sub: 'Instantaneous multi-source energy telemetry & carbon tracking' };
      case '/workloads':
        return { title: 'Workload Orchestration', sub: 'Submit, schedule, and profile AI model execution jobs' };
      case '/benchmark':
        return { title: 'Model Benchmark Matrix', sub: 'Empirical accuracy, latency, and energy scaling comparisons' };
      case '/optimizer':
        return { title: 'Constrained Pareto Optimizer', sub: 'Multi-objective model selection subject to accuracy and latency SLAs' };
      case '/carbon':
        return { title: 'Carbon Intelligence', sub: 'Diurnal regional grid forecasting & optimal green execution window dispatch' };
      case '/hardware':
        return { title: 'Physical Hardware Telemetry', sub: 'Direct ESP32 + INA219 high-side DC current shunt measurements' };
      case '/settings':
        return { title: 'System Settings', sub: 'Regional grid emission factors, telemetry rate, and platform preferences' };
      default:
        return { title: 'GreenCompute AI Platform', sub: 'Autonomous energy-aware machine learning orchestrator' };
    }
  };

  const pageInfo = getPageTitle(location.pathname);

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
      <div className="flex h-screen w-screen overflow-hidden bg-[#080b11] text-slate-100 font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {/* Subtle Ambient Radial Lighting (Apple Pro Display Ambient Glow) */}
        <div className="fixed top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
        <div className="fixed top-1/3 right-10 -z-10 h-[600px] w-[600px] rounded-full bg-cyan-500/4 blur-[140px] pointer-events-none" />
        <div className="fixed bottom-10 left-1/3 -z-10 h-[400px] w-[400px] rounded-full bg-teal-500/4 blur-[120px] pointer-events-none" />

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isWsConnected={isConnected || isSimulating}
        />

        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {/* Frosted Glass Top Navigation Bar */}
          <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/[0.06] glass-panel bg-[#080b11]/70 px-5 lg:px-8 z-30">
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white lg:hidden transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white truncate">
                  {pageInfo.title}
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block truncate mt-0.5">
                  {pageInfo.sub}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {/* Live Simulator Toggle Pill (Apple Control Center style) */}
              <button
                onClick={toggleSimulation}
                className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 border ${
                  isSimulating
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'glass-pill text-slate-400 hover:text-slate-200 hover:border-white/20'
                }`}
                title={isSimulating ? 'Pause telemetry stream' : 'Resume live stream'}
              >
                {isSimulating ? (
                  <>
                    <Pause className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="hidden md:inline">Simulator: 10Hz Feed</span>
                    <span className="md:hidden">10Hz</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 text-slate-400" />
                    <span>Paused</span>
                  </>
                )}
              </button>

              {/* Hardware Device Badge */}
              <div className="hidden xl:flex items-center gap-2 rounded-full glass-pill px-3.5 py-1.5 text-xs text-slate-300">
                <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-mono text-emerald-400 font-semibold">{hardwareStatus.port.split(' ')[0]}</span>
                <span className="text-slate-600">|</span>
                <span className="text-[11px] text-slate-400 font-mono">{hardwareStatus.signal}</span>
              </div>

              {/* Regional Grid Badge */}
              <div className="hidden sm:flex items-center gap-2 rounded-full glass-pill px-3.5 py-1.5 text-xs text-slate-300">
                <Globe className="h-3.5 w-3.5 text-emerald-400" />
                <span>IN-OD (Odisha)</span>
                <span className="font-mono text-emerald-300 font-bold bg-emerald-500/15 px-1.5 py-0.5 rounded text-[11px]">
                  0.82 kg/kWh
                </span>
              </div>

              {/* Live Power Readout Pill with Ambient Pulse */}
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-teal-500/15 px-3.5 py-1.5 text-xs text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                <Zap className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="font-mono font-bold tracking-tight">
                  {activeTelemetry.power_w.toFixed(1)} W
                </span>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TelemetryContext.Provider>
  );
};

export default Layout;
