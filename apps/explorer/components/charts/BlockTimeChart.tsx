'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';

interface ChartDataPoint {
  readonly height: number;
  readonly time: number;
  readonly timestamp: string;
}

export const BlockTimeChart = (): JSX.Element => {
  const { data, isLoading } = useQuery({
    queryKey: ['block-time-chart'],
    queryFn: async () => {
      const response = await apiClient.getBlocks({ page: 1, per_page: 50 });
      const blocks = response.data;

      // Calculate time between blocks
      const chartData: ChartDataPoint[] = [];
      for (let i = 0; i < blocks.length - 1; i++) {
        const current = blocks[i];
        const previous = blocks[i + 1];
        const timeDiff = (new Date(current.timestamp).getTime() - new Date(previous.timestamp).getTime()) / 1000;

        chartData.push({
          height: current.height,
          time: timeDiff,
          timestamp: current.timestamp,
        });
      }

      return chartData.reverse();
    },
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="w-full h-80 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse flex items-center justify-center">
        <div className="text-gray-400">Loading chart...</div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Block #{payload[0].payload.height.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Block Time: <span className="font-bold text-blue-600">{payload[0].value.toFixed(2)}s</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {formatDistanceToNow(new Date(payload[0].payload.timestamp), { addSuffix: true })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Block Production Time</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Time between consecutive blocks (seconds)</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="height"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(value) => `#${value}`}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            label={{ value: 'Seconds', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="time"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 3 }}
            activeDot={{ r: 6, fill: '#2563EB' }}
            name="Block Time (s)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
