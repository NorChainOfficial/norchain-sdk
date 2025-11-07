'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Block } from '@/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

interface ChartDataPoint {
  readonly height: number;
  readonly blocks: number;
  readonly transactions: number;
  readonly timestamp: string;
  readonly label: string;
}

export const NetworkActivityChart = (): JSX.Element => {
  const { data, isLoading } = useQuery({
    queryKey: ['network-activity-chart'],
    queryFn: async () => {
      const response = await apiClient.getBlocks({ page: 1, per_page: 40 });
      const blocks = response.data;

      // Group blocks into buckets of 5 for better visualization
      const bucketSize = 5;
      const chartData: ChartDataPoint[] = [];

      for (let i = 0; i < blocks.length; i += bucketSize) {
        const bucket = blocks.slice(i, i + bucketSize);
        const totalTxs = bucket.reduce((sum: number, block: Block) => sum + block.transaction_count, 0);
        const avgHeight = Math.round(bucket.reduce((sum: number, block: Block) => sum + block.height, 0) / bucket.length);

        chartData.push({
          height: avgHeight,
          blocks: bucket.length,
          transactions: totalTxs,
          timestamp: bucket[0].timestamp,
          label: `#${avgHeight}`,
        });
      }

      return chartData.reverse();
    },
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse flex items-center justify-center">
        <div className="text-gray-400">Loading chart...</div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Block Range: ~#{payload[0].payload.height.toLocaleString()}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Blocks: <span className="font-bold text-blue-600">{payload[0].value}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transactions: <span className="font-bold text-purple-600">{payload[1].value}</span>
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {format(new Date(payload[0].payload.timestamp), 'MMM d, HH:mm:ss')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Network Activity</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Real-time blocks and transaction activity (grouped by 5 blocks)
        </p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorBlocks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="blocks"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorBlocks)"
            name="Blocks"
          />
          <Area
            type="monotone"
            dataKey="transactions"
            stroke="#8B5CF6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTransactions)"
            name="Transactions"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
