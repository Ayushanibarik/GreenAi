export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const DEFAULT_CARBON_INTENSITY = 0.82;

export const DEFAULT_OPTIMIZATION_WEIGHTS = {
  alpha: 0.4,
  beta: 0.3,
  gamma: 0.2,
  delta: 0.1,
} as const;
