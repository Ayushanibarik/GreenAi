import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTelemetryWebSocket } from '../services/websocket';
import type { TelemetryPayload, HardwareReading } from '../types';

export interface TelemetryContextType {
  data: TelemetryPayload | null;
  isConnected: boolean;
  isSimulating: boolean;
  isPaused: boolean;
  connectionStatus: 'live' | 'simulation' | 'offline';
  toggleSimulation: () => void;
  togglePause: () => void;
  hardwareHistory: HardwareReading[];
  hardwareStatus: {
    device: string;
    port: string;
    signal: string;
    isOnline: boolean;
  };
}

export const initialHardwareHistory: HardwareReading[] = [
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

const TelemetryContext = createContext<TelemetryContextType>({
  data: null,
  isConnected: false,
  isSimulating: true,
  isPaused: false,
  connectionStatus: 'simulation',
  toggleSimulation: () => {},
  togglePause: () => {},
  hardwareHistory: initialHardwareHistory,
  hardwareStatus: {
    device: 'ESP32-WROOM-32D + INA219',
    port: 'COM3 (115200 baud)',
    signal: '-62 dBm',
    isOnline: true,
  },
});

export const useTelemetry = () => useContext(TelemetryContext);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: wsTelemetry, isConnected } = useTelemetryWebSocket();

  // Simulation mode defaults to true for immediate out-of-the-box telemetry demonstration
  const [isSimulating, setIsSimulating] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
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

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Simulator interval loop (1Hz tick)
  useEffect(() => {
    if (isPaused) return;
    if (!isSimulating && isConnected) return;

    const interval = setInterval(() => {
      setSimTelemetry((prev) => {
        const jitterPower = (Math.random() - 0.48) * 7.5;
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
  }, [isSimulating, isConnected, isPaused]);

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

  const connectionStatus: 'live' | 'simulation' | 'offline' =
    isConnected && !isSimulating ? 'live' : isSimulating ? 'simulation' : 'offline';

  return (
    <TelemetryContext.Provider
      value={{
        data: activeTelemetry,
        isConnected: isConnected || isSimulating,
        isSimulating,
        isPaused,
        connectionStatus,
        toggleSimulation,
        togglePause,
        hardwareHistory,
        hardwareStatus,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};
