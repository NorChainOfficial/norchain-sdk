'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Block } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';

interface ChartDataPoint {
  readonly height: number;
  readonly txCount: number;
  readonly timestamp: string;
}

export const TransactionVolumeChart = (): JSX.Element => {
  const { data, isLoading } = useQuery({
    queryKey: ['transaction-volume-chart'],
    queryFn: async () => {
      const response = await apiClient.getBlocks({ page: 1, per_page: 30 });
      const blocks = response.data;

      const chartData: ChartDataPoint[] = blocks.map((block: Block) => ({
        height: block.height,
        txCount: block.transaction_count,
        timestamp: block.timestamp,
      })).reverse();

      return chartData;
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
            Transactions: <span className="font-bold text-purple-600">{payload[0].value}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {formatDistanceToNow(new Date(payload[0].payload.timestamp), { addSuffix: true })}
          </p>
        </div>
      );
    }
    return null;
  };

  const maxTxCount = Math.max(...(data?.map(d => d.txCount) || [0]));

  return (
    <div className="w-full h-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Volume</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Number of transactions per block</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="height"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(value) => `#${value}`}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            label={{ value: 'Transactions', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="txCount"
            name="Transactions"
            radius={[8, 8, 0, 0]}
          >
            {data?.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.txCount === 0 ? '#9CA3AF' : entry.txCount >= maxTxCount * 0.7 ? '#8B5CF6' : '#A78BFA'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
