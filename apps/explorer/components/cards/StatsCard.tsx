'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly change?: number;
  readonly changeLabel?: string;
  readonly icon?: ReactNode;
  readonly trend?: 'up' | 'down' | 'neutral';
  readonly loading?: boolean;
  readonly subtitle?: string;
}

export const StatsCard = ({
  title,
  value,
  change,
  changeLabel = 'from yesterday',
  icon,
  trend,
  loading = false,
  subtitle,
}: StatsCardProps): JSX.Element => {
  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
    );
  }

  const getTrendColor = () => {
    if (!trend && change === undefined) return '';
    const trendDirection = trend || (change && change > 0 ? 'up' : change && change < 0 ? 'down' : 'neutral');

    switch (trendDirection) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = () => {
    if (!trend && change === undefined) return null;
    const trendDirection = trend || (change && change > 0 ? 'up' : change && change < 0 ? 'down' : 'neutral');

    switch (trendDirection) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  return (
    <div className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </p>

          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums truncate">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>

          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}

          {change !== undefined && (
            <div className="mt-3 flex items-center gap-1 text-sm font-medium">
              <span className={getTrendColor()}>
                {getTrendIcon()} {Math.abs(change)}%
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {changeLabel}
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div className="ml-4 p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
            <div className="text-white">{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
};
