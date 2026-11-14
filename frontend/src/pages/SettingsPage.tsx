import React, { useState } from 'react';
import { Save, CheckCircle2, RotateCcw, Sliders, Globe, Server, Palette } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';

export const SettingsPage: React.FC = () => {
  const { theme } = useTheme();

  const [carbonIntensity, setCarbonIntensity] = useState<number>(() => {
    const saved = localStorage.getItem('greencompute_ci');
    return saved ? parseFloat(saved) : 0.82;
  });
  const [region, setRegion] = useState<string>(() => {
    return localStorage.getItem('greencompute_region') || 'IN-OD';
  });
  const [alpha, setAlpha] = useState<number>(0.4);
  const [beta, setBeta] = useState<number>(0.3);
  const [gamma, setGamma] = useState<number>(0.2);
  const [delta, setDelta] = useState<number>(0.1);
  const [apiUrl, setApiUrl] = useState<string>('http://localhost:8000');
  const [wsUrl, setWsUrl] = useState<string>('ws://localhost:8000/ws/telemetry');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('greencompute_ci', carbonIntensity.toString());
    localStorage.setItem('greencompute_region', region);
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
    localStorage.removeItem('greencompute_ci');
    localStorage.removeItem('greencompute_region');
  };

  return (
    <div className="space-y-5 max-w-4xl pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Settings
          </h1>
        </div>

        {saved && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Appearance & Design Theme */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--accent-primary)]">
                <Palette className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                Appearance
              </h3>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)] capitalize">
              {theme}
            </span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Theme Mode
            </span>
            <ThemeToggle variant="segmented" />
          </div>
        </div>

        {/* Regional Carbon Accounting Parameters */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--accent-primary)]">
              <Globe className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Regional Grid Carbon
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[var(--text-secondary)] font-medium mb-1">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5 text-[var(--text-primary)] focus:outline-none"
              >
                <option value="IN-OD">India - Odisha (Eastern Grid)</option>
                <option value="IN-NAT">India - National Average</option>
                <option value="US-EAST">US - PJM Interconnection</option>
                <option value="EU-DE">Europe - Germany</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-medium mb-1">
                Baseline Factor (kg CO₂e / kWh)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="2.0"
                value={carbonIntensity}
                onChange={(e) => setCarbonIntensity(parseFloat(e.target.value) || 0.82)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5 text-[var(--text-primary)] font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Multi-Objective Optimization Weights */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--accent-primary)]">
              <Sliders className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Default Objective Weights
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="block text-[var(--text-muted)] mb-1">α Energy</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 font-mono text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[var(--text-muted)] mb-1">β Latency</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={beta}
                onChange={(e) => setBeta(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 font-mono text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[var(--text-muted)] mb-1">γ Accuracy</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={gamma}
                onChange={(e) => setGamma(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 font-mono text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[var(--text-muted)] mb-1">δ Memory</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={delta}
                onChange={(e) => setDelta(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 font-mono text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Backend Endpoints */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--accent-primary)]">
              <Server className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Endpoints
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[var(--text-secondary)] font-medium mb-1">REST API</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5 text-[var(--text-primary)] font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-medium mb-1">WebSocket</label>
              <input
                type="text"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5 text-[var(--text-primary)] font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={handleResetDefaults}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Reset Defaults
          </Button>

          <Button
            variant="primary"
            size="sm"
            type="submit"
            leftIcon={<Save className="h-3.5 w-3.5" />}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
