import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface HardwarePoint {
  time: string;
  voltage_v: number;
  current_ma: number;
  power_w: number;
}

const defaultData: HardwarePoint[] = [
  { time: '12:00:01', voltage_v: 12.04, current_ma: 6500, power_w: 78.2 },
  { time: '12:00:02', voltage_v: 12.02, current_ma: 7200, power_w: 86.5 },
  { time: '12:00:03', voltage_v: 11.98, current_ma: 9800, power_w: 117.4 },
  { time: '12:00:04', voltage_v: 11.95, current_ma: 10400, power_w: 124.3 },
  { time: '12:00:05', voltage_v: 11.94, current_ma: 10800, power_w: 128.9 },
  { time: '12:00:06', voltage_v: 11.96, current_ma: 10100, power_w: 120.8 },
  { time: '12:00:07', voltage_v: 12.01, current_ma: 7400, power_w: 88.9 },
  { time: '12:00:08', voltage_v: 12.05, current_ma: 5900, power_w: 71.1 },
  { time: '12:00:09', voltage_v: 12.03, current_ma: 6100, power_w: 73.4 },
  { time: '12:00:10', voltage_v: 12.02, current_ma: 6300, power_w: 75.7 },
];

interface HardwareTelemetryChartProps {
  data?: HardwarePoint[];
  title?: string;
}

export const HardwareTelemetryChart: React.FC<HardwareTelemetryChartProps> = ({
  data = defaultData,
  title = 'ESP32 + INA219 Real-Time Telemetry Stream',
}) => {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-gray-400">Direct hardware shunt sensor readings @ 10Hz sampling frequency</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis dataKey="time" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
            <YAxis
              yAxisId="power"
              stroke="#10B981"
              tick={{ fill: '#34D399', fontSize: 11 }}
              unit=" W"
            />
            <YAxis
              yAxisId="voltage"
              orientation="right"
              stroke="#6EE7B7"
              domain={[11, 13]}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              unit=" V"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                borderColor: '#374151',
                borderRadius: '0.5rem',
                fontSize: '12px',
                color: '#F9FAFB',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              formatter={(value) => <span className="text-gray-300">{value}</span>}
            />
            <Line
              yAxisId="power"
              type="monotone"
              dataKey="power_w"
              name="Power Draw (W)"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#34D399' }}
            />
            <Line
              yAxisId="voltage"
              type="monotone"
              dataKey="voltage_v"
              name="Bus Voltage (V)"
              stroke="#059669"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HardwareTelemetryChart;
