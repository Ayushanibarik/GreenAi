export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const COLORS = {
  primary: '#0A84FF',
  primaryLight: '#5AA9FF',
  primaryDark: '#0071E3',
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
  '#0A84FF', '#5AA9FF', '#8CC2FF', '#B9D8FF',
  '#0071E3', '#005BB5', '#004A95', '#003B76',
] as const;

export const DEFAULT_CARBON_INTENSITY = 0.82; // kg CO2e/kWh India grid
export const DEFAULT_OPTIMIZATION_WEIGHTS = {
  alpha: 0.4, // energy weight
  beta: 0.3,  // latency weight
  gamma: 0.2, // accuracy weight
  delta: 0.1, // memory weight
};
