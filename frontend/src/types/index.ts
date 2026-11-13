export interface Workload {
  id: string;
  name: string;
  model_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  energy_wh: number;
  carbon_g: number;
  latency_ms: number;
  accuracy: number;
  created_at: string;
}

export interface BenchmarkResult {
  id: string;
  config_name: string;
  precision: 'FP32' | 'FP16' | 'INT8' | 'ONNX';
  energy_wh: number;
  latency_ms: number;
  accuracy: number;
  memory_mb: number;
  throughput: number;
  carbon_g: number;
}

export interface EnergyReading {
  timestamp: string;
  cpu_percent: number;
  gpu_percent: number;
  ram_percent: number;
  power_w: number;
  energy_wh: number;
}

export interface CarbonEstimate {
  workload_id: string;
  workload_name: string;
  carbon_g: number;
  energy_wh: number;
  carbon_intensity: number;
  region: string;
}

export interface HardwareReading {
  timestamp: string;
  voltage_v: number;
  current_ma: number;
  power_mw: number;
  energy_mwh: number;
}

export interface OptimizationResult {
  id: string;
  original_config: string;
  recommended_config: string;
  energy_saved_wh: number;
  energy_saved_pct: number;
  latency_change_pct: number;
  accuracy_change_pct: number;
  carbon_saved_g: number;
}

export interface TelemetryPayload {
  cpu_percent: number;
  gpu_percent: number;
  ram_percent: number;
  power_w: number;
  energy_wh: number;
  voltage_v?: number;
  current_ma?: number;
  power_mw?: number;
  energy_mwh?: number;
  timestamp: string;
}

