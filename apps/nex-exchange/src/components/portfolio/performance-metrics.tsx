"use client";

import { TrendingUp, TrendingDown, Activity, PieChart } from 'lucide-react';

interface PerformanceMetricsProps {
  readonly totalValue: number;
  readonly change24h: number;
  readonly allTimeHigh?: number;
  readonly allTimeLow?: number;
  readonly totalProfit?: number;
  readonly totalReturn?: number;
}

export const PerformanceMetrics = ({
  totalValue,
  change24h,
  allTimeHigh = totalValue * 1.25,
  allTimeLow = totalValue * 0.65,
  totalProfit = totalValue * 0.15,
  totalReturn = 15.5,
}: PerformanceMetricsProps): JSX.Element => {
  const metrics = [
    {
      label: 'Total P&L',
      value: totalProfit.toLocaleString('no-NO', {
        style: 'currency',
        currency: 'NOK',
      }),
      change: totalReturn,
      icon: <Activity className="h-5 w-5" />,
      color: totalProfit >= 0 ? 'text-success' : 'text-error',
    },
    {
      label: 'All-Time High',
      value: allTimeHigh.toLocaleString('no-NO', {
        style: 'currency',
        currency: 'NOK',
      }),
      change: ((totalValue / allTimeHigh - 1) * 100),
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-foreground',
    },
    {
      label: 'All-Time Low',
      value: allTimeLow.toLocaleString('no-NO', {
        style: 'currency',
        currency: 'NOK',
      }),
      change: ((totalValue / allTimeLow - 1) * 100),
      icon: <TrendingDown className="h-5 w-5" />,
      color: 'text-foreground',
    },
    {
      label: 'Portfolio Diversity',
      value: '65%',
      change: 0,
      icon: <PieChart className="h-5 w-5" />,
      color: 'text-foreground',
      hideChange: true,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Performance Metrics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-background border border-border rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/70">{metric.label}</span>
              <div className={metric.color}>{metric.icon}</div>
            </div>

            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </div>

            {!metric.hideChange && (
              <div
                className={`text-sm flex items-center space-x-1 ${
                  metric.change >= 0 ? 'text-success' : 'text-error'
                }`}
              >
                {metric.change >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {metric.change >= 0 ? '+' : ''}
                  {metric.change.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
