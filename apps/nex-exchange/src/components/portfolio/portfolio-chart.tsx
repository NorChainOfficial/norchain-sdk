"use client";

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, Time } from 'lightweight-charts';

interface PortfolioChartProps {
  readonly data?: Array<{
    readonly time: number;
    readonly value: number;
  }>;
}

export const PortfolioChart = ({ data }: PortfolioChartProps): JSX.Element => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '1y' | 'all'>('7d');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#1f2937',
      },
      timeScale: {
        borderColor: '#1f2937',
        timeVisible: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
    });

    chartRef.current = chart;

    // Add area series
    const series = chart.addAreaSeries({
      topColor: 'rgba(34, 197, 94, 0.4)',
      bottomColor: 'rgba(34, 197, 94, 0.0)',
      lineColor: 'rgba(34, 197, 94, 1)',
      lineWidth: 2,
    });

    seriesRef.current = series;

    // Generate mock data if none provided
    const mockData = data || generateMockData(timeRange);
    series.setData(
      mockData.map(d => ({
        time: d.time as Time,
        value: d.value,
      }))
    );

    // Handle resize
    const handleResize = (): void => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, timeRange]);

  const timeRanges = [
    { label: '24H', value: '24h' as const },
    { label: '7D', value: '7d' as const },
    { label: '30D', value: '30d' as const },
    { label: '1Y', value: '1y' as const },
    { label: 'ALL', value: 'all' as const },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Portfolio Value</h3>
        <div className="flex items-center space-x-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                timeRange === range.value
                  ? 'bg-primary text-white'
                  : 'text-foreground/70 hover:text-foreground hover:bg-background/50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
};

function generateMockData(range: string): Array<{ time: number; value: number }> {
  const now = Date.now();
  let intervalMs: number;
  let points: number;

  switch (range) {
    case '24h':
      intervalMs = 60 * 60 * 1000; // 1 hour
      points = 24;
      break;
    case '7d':
      intervalMs = 6 * 60 * 60 * 1000; // 6 hours
      points = 28;
      break;
    case '30d':
      intervalMs = 24 * 60 * 60 * 1000; // 1 day
      points = 30;
      break;
    case '1y':
      intervalMs = 7 * 24 * 60 * 60 * 1000; // 1 week
      points = 52;
      break;
    default:
      intervalMs = 30 * 24 * 60 * 60 * 1000; // 1 month
      points = 12;
  }

  const data: Array<{ time: number; value: number }> = [];
  let value = 100000;

  for (let i = points; i >= 0; i--) {
    const time = now - (i * intervalMs);
    value = value + (Math.random() - 0.45) * 5000; // Slight upward trend
    data.push({
      time: Math.floor(time / 1000),
      value: Math.max(value, 50000), // Ensure positive values
    });
  }

  return data;
}
