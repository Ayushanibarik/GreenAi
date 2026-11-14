import React from 'react';
import HardwareTelemetryChart from '../charts/HardwareTelemetryChart';
import { Activity, Zap, ShieldCheck, Cpu, HardDrive, Pause, Play, Info } from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';

export const HardwarePage: React.FC = () => {
  const { data: telemetry, hardwareHistory, connectionStatus, isPaused, togglePause } = useTelemetry();

  const latest = hardwareHistory[0] || {
    timestamp: '12:00:10',
    voltage_v: telemetry?.voltage_v ?? 12.02,
    current_ma: telemetry?.current_ma ?? 7038,
    power_mw: telemetry?.power_mw ?? 84600,
    energy_mwh: telemetry?.energy_mwh ?? 124800,
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header and Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Hardware Bus Console
          </h1>
          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold flex items-center gap-1 font-mono ${
            connectionStatus === 'live'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${connectionStatus === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-sky-500 animate-pulse'}`} />
            {connectionStatus === 'live' ? 'Physical INA219 (10Hz)' : 'Laboratory Emulation'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={togglePause}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-500" />
                Resume Oscilloscope
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-500" />
                Freeze Waveform
              </>
            )}
          </button>
        </div>
      </div>

      {/* Provenance Transparency Alert */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 text-xs flex items-center justify-between text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-[var(--accent-primary)] shrink-0" />
          <span>
            {connectionStatus === 'live'
              ? 'Physical telemetry streaming from ESP32-S3 over WebSocket (/ws/telemetry).'
              : 'Staging environment active: Software RAPL + synthetic 12V bus jitter generated at 10Hz.'}
          </span>
        </div>
        <span className="font-mono text-[10px] text-[var(--text-muted)] hidden sm:inline">
          Sampling: 100ms · 12-bit ADC
        </span>
      </div>

      {/* Primary Hardware Instrument Readings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs mb-1">
            <span className="uppercase text-[10px] font-semibold tracking-wider">Voltage</span>
            <Zap className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-[var(--text-primary)] font-mono">{latest.voltage_v.toFixed(3)}</span>
          <span className="ml-1 text-xs text-[var(--text-muted)] font-mono">V</span>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs mb-1">
            <span className="uppercase text-[10px] font-semibold tracking-wider">Current</span>
            <Activity className="h-3.5 w-3.5 text-sky-500" />
          </div>
          <span className="text-2xl font-bold text-[var(--text-primary)] font-mono">{latest.current_ma.toLocaleString()}</span>
          <span className="ml-1 text-xs text-[var(--text-muted)] font-mono">mA</span>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs mb-1">
            <span className="uppercase text-[10px] font-semibold tracking-wider">Power</span>
            <Zap className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{(latest.power_mw / 1000).toFixed(2)}</span>
          <span className="ml-1 text-xs text-[var(--text-muted)] font-mono">W</span>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs mb-1">
            <span className="uppercase text-[10px] font-semibold tracking-wider">Energy</span>
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
          </div>
          <span className="text-2xl font-bold text-[var(--text-primary)] font-mono">{(latest.energy_mwh / 1000).toFixed(2)}</span>
          <span className="ml-1 text-xs text-[var(--text-muted)] font-mono">Wh</span>
        </div>
      </div>

      {/* Hardware Telemetry Chart */}
      <HardwareTelemetryChart data={hardwareHistory} />

      {/* Hardware Specifications & Calibration Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-[var(--accent-primary)]" />
              INA219 Specifications
            </h3>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Calibrated</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)]">I2C Address:</span>
              <span className="font-mono text-[var(--text-primary)]">0x40</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)]">Shunt:</span>
              <span className="font-mono text-[var(--text-primary)]">0.100 Ω (1%)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)]">Resolution:</span>
              <span className="font-mono text-[var(--text-primary)]">12-bit (532 µs)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)]">Max Current:</span>
              <span className="font-mono text-[var(--text-primary)]">±3.2 A</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--text-muted)]">Rate:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">10 Hz</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-[var(--accent-primary)]" />
              RAPL Counters
            </h3>
            <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400">MSR</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)]">Package Register:</span>
              <span className="font-mono text-[var(--text-primary)]">0x611 (PKG)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)]">DRAM Register:</span>
              <span className="font-mono text-[var(--text-primary)]">0x618 (DRAM)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)]">Unit:</span>
              <span className="font-mono text-[var(--text-primary)]">~61 µJ</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)]">Correlation:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">R² = 0.984</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--text-muted)]">Package Temp:</span>
              <span className="font-mono text-[var(--text-primary)]">52°C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwarePage;
