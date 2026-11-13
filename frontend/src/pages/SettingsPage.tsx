import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, RotateCcw, Shield, Sliders, Globe, Server, Sparkles } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [carbonIntensity, setCarbonIntensity] = useState<number>(0.82);
  const [region, setRegion] = useState<string>('IN-OD');
  const [alpha, setAlpha] = useState<number>(0.4);
  const [beta, setBeta] = useState<number>(0.3);
  const [gamma, setGamma] = useState<number>(0.2);
  const [delta, setDelta] = useState<number>(0.1);
  const [apiUrl, setApiUrl] = useState<string>('http://localhost:8000');
  const [wsUrl, setWsUrl] = useState<string>('ws://localhost:8000/ws/telemetry');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleResetDefaults = () => {
    setCarbonIntensity(0.82);
    setRegion('IN-OD');
    setAlpha(0.4);
    setBeta(0.3);
    setGamma(0.2);
    setDelta(0.1);
    setApiUrl('http://localhost:8000');
    setWsUrl('ws://localhost:8000/ws/telemetry');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-6 border border-white/[0.08] shadow-[0_12px_40px_rgb(0,0,0,0.35)]">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                System Preferences & Policies
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              GreenCompute Governance Settings
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Configure grid emissions baseline, multi-objective Pareto optimization weights, and telemetry endpoints.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Regional Carbon Grid Settings (macOS Grouped Section) */}
        <div className="rounded-3xl glass-card p-6 border border-white/[0.08] shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Regional Grid Carbon Settings</h3>
              <p className="text-[11px] text-slate-400">Marginal emissions factor for grid conversion calculations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Grid Region</label>
              <select
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  if (e.target.value === 'IN-OD') setCarbonIntensity(0.82);
                  else if (e.target.value === 'US-EAST') setCarbonIntensity(0.38);
                  else if (e.target.value === 'EU-CENTRAL') setCarbonIntensity(0.28);
                }}
                className="w-full rounded-xl glass-pill p-3 text-white border border-white/[0.08] focus:border-emerald-500 focus:outline-none bg-slate-900 cursor-pointer"
              >
                <option value="IN-OD">India / Odisha (Coal-heavy baseline ~0.82 kg/kWh)</option>
                <option value="US-EAST">US East / Virginia (~0.38 kg/kWh)</option>
                <option value="EU-CENTRAL">EU Central / Germany (~0.28 kg/kWh)</option>
                <option value="CUSTOM">Custom Carbon Intensity Value</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Marginal Carbon Intensity (kg CO₂e/kWh)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.05"
                max="1.50"
                value={carbonIntensity}
                onChange={(e) => setCarbonIntensity(Number(e.target.value))}
                className="w-full rounded-xl glass-pill p-3 text-white font-mono border border-white/[0.08] focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Multi-Objective Optimization Weights */}
        <div className="rounded-3xl glass-card p-6 border border-white/[0.08] shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Multi-Objective Optimization Weights</h3>
              <p className="text-[11px] text-slate-400">
                Formulation: <code className="text-emerald-400 font-mono">Score = α·Energy + β·Latency + γ·(1-Accuracy) + δ·Memory</code>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="rounded-2xl glass-pill p-4 border border-white/[0.06]">
              <div className="flex justify-between items-center text-slate-300 mb-2">
                <span className="font-medium text-slate-400">α - Energy Consumption Weight</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">{alpha.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="rounded-2xl glass-pill p-4 border border-white/[0.06]">
              <div className="flex justify-between items-center text-slate-300 mb-2">
                <span className="font-medium text-slate-400">β - Latency Weight</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">{beta.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={beta}
                onChange={(e) => setBeta(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="rounded-2xl glass-pill p-4 border border-white/[0.06]">
              <div className="flex justify-between items-center text-slate-300 mb-2">
                <span className="font-medium text-slate-400">γ - Accuracy Penalty Weight</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">{gamma.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={gamma}
                onChange={(e) => setGamma(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="rounded-2xl glass-pill p-4 border border-white/[0.06]">
              <div className="flex justify-between items-center text-slate-300 mb-2">
                <span className="font-medium text-slate-400">δ - Memory Footprint Weight</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">{delta.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Backend & Hardware Endpoints */}
        <div className="rounded-3xl glass-card p-6 border border-white/[0.08] shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">API Ingestion & Telemetry Bus</h3>
              <p className="text-[11px] text-slate-400">FastAPI backend and WebSocket stream parameters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">FastAPI Backend URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full rounded-xl glass-pill p-3 text-white font-mono border border-white/[0.08] focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">WebSocket Telemetry URL</label>
              <input
                type="text"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                className="w-full rounded-xl glass-pill p-3 text-white font-mono border border-white/[0.08] focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-2 rounded-2xl glass-pill px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/20 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Defaults
          </button>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium animate-fadeIn">
                <CheckCircle2 className="h-4 w-4" />
                Configuration saved successfully!
              </span>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/60 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
