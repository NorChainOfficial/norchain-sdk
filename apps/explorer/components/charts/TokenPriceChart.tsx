'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Token {
  readonly symbol: string;
  readonly name: string;
  readonly address: string;
  readonly currentPrice: number;
  readonly priceChange24h: number;
  readonly volume24h: number;
  readonly marketCap?: number;
}

interface ChartData {
  readonly time: number;
  readonly value: number;
}

export const TokenPriceChart = (): JSX.Element => {
  const [selectedToken, setSelectedToken] = useState('NOR');
  const [timeframe, setTimeframe] = useState('24H');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Mock tokens data - replace with real data from your API
  const tokens: Token[] = [
    {
      symbol: 'NOR',
      name: 'Nor Token',
      address: '0x...',
      currentPrice: 0.0418,
      priceChange24h: 2.6,
      volume24h: 45200,
      marketCap: 1250000
    },
    {
      symbol: 'BTCBR',
      name: 'Bitcoin Brazil',
      address: '0x...',
      currentPrice: 42500.00,
      priceChange24h: -1.2,
      volume24h: 125000,
      marketCap: 850000000
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0x...',
      currentPrice: 1.00,
      priceChange24h: 0.01,
      volume24h: 250000,
      marketCap: 90000000
    }
  ];

  const selectedTokenData = tokens.find(t => t.symbol === selectedToken) || tokens[0];

  useEffect(() => {
    // Generate mock chart data - replace with real historical data
    const generateMockData = (): ChartData[] => {
      const now = Date.now();
      const dataPoints = timeframe === '24H' ? 24 : timeframe === '7D' ? 168 : 720;
      const interval = timeframe === '24H' ? 3600000 : timeframe === '7D' ? 3600000 : 3600000;

      const data: ChartData[] = [];
      let price = selectedTokenData.currentPrice;

      for (let i = dataPoints; i >= 0; i--) {
        const timestamp = now - (i * interval);
        // Simulate price movement
        const change = (Math.random() - 0.5) * price * 0.02;
        price = Math.max(price + change, price * 0.8);

        data.push({
          time: Math.floor(timestamp / 1000),
          value: price
        });
      }

      return data;
    };

    setIsLoading(true);
    setTimeout(() => {
      setChartData(generateMockData());
      setIsLoading(false);
    }, 300);
  }, [selectedToken, timeframe, selectedTokenData.currentPrice]);

  const timeframes = ['24H', '7D', '30D', '1Y'];

  return (
    <div className="bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Token Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">{selectedTokenData.symbol[0]}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedTokenData.name}</h3>
                <p className="text-sm text-gray-400">{selectedTokenData.symbol}</p>
              </div>
            </div>

            {/* Token Pills */}
            <div className="hidden md:flex items-center gap-2 ml-6">
              {tokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => setSelectedToken(token.symbol)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedToken === token.symbol
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                      : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                  }`}
                  aria-label={`Select ${token.symbol}`}
                >
                  {token.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Price Info */}
          <div className="flex items-center gap-6">
            <div>
              <div className="text-3xl font-bold text-white">
                ${selectedTokenData.currentPrice.toFixed(selectedTokenData.currentPrice < 1 ? 4 : 2)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm font-semibold ${selectedTokenData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedTokenData.priceChange24h >= 0 ? '↑' : '↓'} {Math.abs(selectedTokenData.priceChange24h).toFixed(2)}%
                </span>
                <span className="text-xs text-gray-400">24h</span>
              </div>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    timeframe === tf
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-slate-700'
                  }`}
                  aria-label={`View ${tf} timeframe`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
            <div className="text-xs text-gray-400 mb-1">24h Volume</div>
            <div className="text-lg font-bold text-white">
              ${(selectedTokenData.volume24h / 1000).toFixed(1)}K
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
            <div className="text-xs text-gray-400 mb-1">Market Cap</div>
            <div className="text-lg font-bold text-white">
              ${selectedTokenData.marketCap ? (selectedTokenData.marketCap / 1000000).toFixed(2) + 'M' : 'N/A'}
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
            <div className="text-xs text-gray-400 mb-1">24h High</div>
            <div className="text-lg font-bold text-green-400">
              ${(selectedTokenData.currentPrice * 1.05).toFixed(4)}
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
            <div className="text-xs text-gray-400 mb-1">24h Low</div>
            <div className="text-lg font-bold text-red-400">
              ${(selectedTokenData.currentPrice * 0.95).toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative" style={{ height: '400px' }}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-white font-medium">Loading chart data...</span>
            </div>
          </div>
        ) : (
          <div ref={chartContainerRef} className="w-full h-full p-6">
            {/* SVG Chart */}
            <svg width="100%" height="100%" className="chart-svg">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={selectedTokenData.priceChange24h >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={selectedTokenData.priceChange24h >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0" />
                </linearGradient>
              </defs>

              {chartData.length > 0 && (
                <>
                  {/* Area Chart */}
                  <path
                    d={(() => {
                      const width = chartContainerRef.current?.clientWidth || 800;
                      const height = chartContainerRef.current?.clientHeight || 350;
                      const padding = 40;

                      const minValue = Math.min(...chartData.map(d => d.value));
                      const maxValue = Math.max(...chartData.map(d => d.value));
                      const valueRange = maxValue - minValue;

                      const xStep = (width - padding * 2) / (chartData.length - 1);

                      let path = `M ${padding} ${height - padding}`;

                      chartData.forEach((point, i) => {
                        const x = padding + (i * xStep);
                        const y = height - padding - ((point.value - minValue) / valueRange) * (height - padding * 2);
                        path += ` L ${x} ${y}`;
                      });

                      path += ` L ${padding + (chartData.length - 1) * xStep} ${height - padding}`;
                      path += ` Z`;

                      return path;
                    })()}
                    fill="url(#chartGradient)"
                    opacity="0.5"
                  />

                  {/* Line Chart */}
                  <path
                    d={(() => {
                      const width = chartContainerRef.current?.clientWidth || 800;
                      const height = chartContainerRef.current?.clientHeight || 350;
                      const padding = 40;

                      const minValue = Math.min(...chartData.map(d => d.value));
                      const maxValue = Math.max(...chartData.map(d => d.value));
                      const valueRange = maxValue - minValue;

                      const xStep = (width - padding * 2) / (chartData.length - 1);

                      return chartData.map((point, i) => {
                        const x = padding + (i * xStep);
                        const y = height - padding - ((point.value - minValue) / valueRange) * (height - padding * 2);
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ');
                    })()}
                    fill="none"
                    stroke={selectedTokenData.priceChange24h >= 0 ? '#10b981' : '#ef4444'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </svg>
          </div>
        )}
      </div>

      {/* Chart Footer */}
      <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live Price Updates</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Last updated: Just now</span>
          <button className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            View Full Analytics →
          </button>
        </div>
      </div>
    </div>
  );
};
