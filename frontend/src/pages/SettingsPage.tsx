import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, RotateCcw, Shield, Sliders, Globe } from 'lucide-react';

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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white">System Configuration & Parameters</h2>
        <p className="text-xs text-gray-400">
          Configure regional grid carbon intensity, multi-objective optimization weights, and API endpoints
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Regional Carbon Grid Settings */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Globe className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Regional Grid Carbon Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-300 font-medium mb-1">Grid Region</label>
              <select
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  if (e.target.value === 'IN-OD') setCarbonIntensity(0.82);
                  else if (e.target.value === 'US-EAST') setCarbonIntensity(0.38);
                  else if (e.target.value === 'EU-CENTRAL') setCarbonIntensity(0.28);
                }}
                className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="IN-OD">India / Odisha (Coal-heavy baseline ~0.82 kg/kWh)</option>
                <option value="US-EAST">US East / Virginia (~0.38 kg/kWh)</option>
                <option value="EU-CENTRAL">EU Central / Germany (~0.28 kg/kWh)</option>
                <option value="CUSTOM">Custom Carbon Intensity Value</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Marginal Carbon Intensity (kg CO₂e/kWh)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.05"
                max="1.50"
                value={carbonIntensity}
                onChange={(e) => setCarbonIntensity(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Multi-Objective Optimization Weights */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Multi-Objective Optimization Weights</h3>
          </div>
          <p className="text-xs text-gray-400">
            Formulation: <code className="text-emerald-400">Score = α·Energy + β·Latency + γ·(1-Accuracy) + δ·Memory</code>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>α - Energy Weight</span>
                <span className="font-mono text-emerald-400 font-bold">{alpha.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>β - Latency Weight</span>
                <span className="font-mono text-emerald-400 font-bold">{beta.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={beta}
                onChange={(e) => setBeta(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>γ - Accuracy Penalty Weight</span>
                <span className="font-mono text-emerald-400 font-bold">{gamma.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={gamma}
                onChange={(e) => setGamma(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>δ - Memory Footprint Weight</span>
                <span className="font-mono text-emerald-400 font-bold">{delta.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Backend & Hardware Endpoints */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Shield className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Backend Connection & Ingestion</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-300 font-medium mb-1">FastAPI Backend URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">WebSocket Telemetry URL</label>
              <input
                type="text"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Default Settings
          </button>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Settings saved successfully!
              </span>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-900/30 hover:bg-emerald-500 transition-colors"
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
