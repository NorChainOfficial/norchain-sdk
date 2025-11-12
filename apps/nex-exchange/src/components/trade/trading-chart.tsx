"use client";

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { useQuery } from '@tanstack/react-query';

interface TradingChartProps {
  readonly pair?: string;
  readonly interval?: string;
}

interface CandlestickDataPoint {
  readonly time: number;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
}

export const TradingChart = ({
  pair = 'NOR/USDT',
  interval = '1h'
}: TradingChartProps): JSX.Element => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');

  // Fetch initial data if not available in store
  const { data: initialData } = useQuery({
    queryKey: ['candlestick-initial', pair, interval],
    queryFn: async (): Promise<CandlestickDataPoint[]> => {
      // TODO: Fetch historical data from API
      // Generate mock historical data for demonstration
      const now = Date.now();
      const intervalMs = getIntervalMs(interval);
      const data: CandlestickDataPoint[] = [];

      let price = 0.006;
      for (let i = 100; i >= 0; i--) {
        const time = now - (i * intervalMs);
        const change = (Math.random() - 0.5) * 0.0002;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * 0.0001;
        const low = Math.min(open, close) - Math.random() * 0.0001;
        const volume = Math.random() * 100000 + 50000;

        data.push({
          time: Math.floor(time / 1000),
          open,
          high,
          low,
          close,
          volume,
        });

        price = close;
      }

      return data;
    },
    staleTime: 60000, // Cache for 1 minute
  });

  // Use realtime data if available, otherwise use initial data
  const candlestickData = initialData;

  useEffect(() => {
    if (!chartContainerRef.current || !candlestickData) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0a0a0a' },
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
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    });

    volumeSeriesRef.current = volumeSeries;

    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Set data
    const chartData = candlestickData.map(d => ({
      time: d.time as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const volumeData = candlestickData.map(d => ({
      time: d.time as Time,
      value: d.volume,
      color: d.close >= d.open ? '#10b98180' : '#ef444480',
    }));

    candlestickSeries.setData(chartData);
    volumeSeries.setData(volumeData);

    // Handle resize
    const handleResize = (): void => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [candlestickData, chartType]);

  const intervals = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;

  return (
    <div className="space-y-4">
      {/* Chart Controls */}
      <div className="flex items-center justify-between bg-background border border-border rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-foreground">{pair}</span>
          <span className="text-xs text-foreground/70">
            {candlestickData && candlestickData.length > 0
              ? `$${candlestickData[candlestickData.length - 1].close.toFixed(6)}`
              : 'Loading...'}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Chart Type Toggle */}
          <div className="flex items-center space-x-1 bg-background/50 rounded-lg p-1">
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                chartType === 'candlestick'
                  ? 'bg-primary text-white'
                  : 'text-foreground/70 hover:text-foreground'
              }`}
            >
              Candlestick
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                chartType === 'line'
                  ? 'bg-primary text-white'
                  : 'text-foreground/70 hover:text-foreground'
              }`}
            >
              Line
            </button>
          </div>

          {/* Interval Selector */}
          <div className="flex items-center space-x-1">
            {intervals.map((int) => (
              <button
                key={int}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  interval === int
                    ? 'bg-primary text-white'
                    : 'text-foreground/70 hover:text-foreground hover:bg-background/50'
                }`}
              >
                {int}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <div ref={chartContainerRef} />
      </div>

      {/* Chart Info */}
      {candlestickData && candlestickData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="text-xs text-foreground/70 mb-1">Open</div>
            <div className="text-sm font-mono text-foreground">
              ${candlestickData[candlestickData.length - 1].open.toFixed(6)}
            </div>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="text-xs text-foreground/70 mb-1">High</div>
            <div className="text-sm font-mono text-success">
              ${candlestickData[candlestickData.length - 1].high.toFixed(6)}
            </div>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="text-xs text-foreground/70 mb-1">Low</div>
            <div className="text-sm font-mono text-error">
              ${candlestickData[candlestickData.length - 1].low.toFixed(6)}
            </div>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="text-xs text-foreground/70 mb-1">Volume</div>
            <div className="text-sm font-mono text-foreground">
              {candlestickData[candlestickData.length - 1].volume.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getIntervalMs(interval: string): number {
  const value = parseInt(interval);
  const unit = interval.slice(-1);

  switch (unit) {
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 60 * 60 * 1000; // Default 1 hour
  }
}
