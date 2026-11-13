export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const COLORS = {
  primary: '#10B981',
  primaryLight: '#34D399',
  primaryDark: '#059669',
  accent: '#6EE7B7',
  muted: '#6B7280',
  bg: '#030712',
  card: '#111827',
  cardBorder: '#1F2937',
  text: '#F9FAFB',
  textMuted: '#9CA3AF',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const;

export const CHART_COLORS = [
  '#10B981', '#34D399', '#6EE7B7', '#A7F3D0',
  '#059669', '#047857', '#065F46', '#064E3B',
] as const;

export const DEFAULT_CARBON_INTENSITY = 0.82; // kg CO2e/kWh India grid
export const DEFAULT_OPTIMIZATION_WEIGHTS = {
  alpha: 0.4, // energy weight
  beta: 0.3,  // latency weight
  gamma: 0.2, // accuracy weight
  delta: 0.1, // memory weight
};
