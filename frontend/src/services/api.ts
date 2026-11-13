import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import type { Workload, BenchmarkResult, OptimizationResult, CarbonEstimate, HardwareReading } from '../types';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

export const api = {
  health: () => client.get<{ status: string }>('/health'),

  // Workloads
  getWorkloads: () => client.get<Workload[]>('/api/workloads'),
  submitWorkload: (data: { name: string; model_type: string; dataset?: string }) =>
    client.post<Workload>('/api/workloads', data),

  // Benchmark
  runBenchmark: (workloadId: string) =>
    client.post<BenchmarkResult[]>(`/api/benchmark/${workloadId}`),
  getBenchmarkResults: (workloadId: string) =>
    client.get<BenchmarkResult[]>(`/api/benchmark/${workloadId}`),

  // Optimizer
  optimize: (params: { workload_id: string; min_accuracy?: number; max_latency?: number; max_memory?: number }) =>
    client.post<OptimizationResult>('/api/optimize', params),

  // Carbon
  getCarbonEstimates: () => client.get<CarbonEstimate[]>('/api/carbon'),
  getScheduleRecommendation: (params: { energy_wh: number; deadline_hours: number }) =>
    client.post('/api/schedule', params),

  // Hardware
  getHardwareReadings: (limit?: number) =>
    client.get<HardwareReading[]>('/api/hardware', { params: { limit } }),
};

export default api;
