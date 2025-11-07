'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getWebSocketClient, WebSocketEvent } from '@/lib/websocket-client';
import { getApiClient, type GasPrice } from '@/lib/api-client-v2';

interface GasTrackerProps {
  readonly showPrediction?: boolean;
  readonly autoRefresh?: boolean;
  readonly refreshInterval?: number;
}

export const RealTimeGasTracker = ({
  showPrediction = true,
  autoRefresh = true,
  refreshInterval = 30000,
}: GasTrackerProps): JSX.Element => {
  const [gasPrice, setGasPrice] = useState<GasPrice | null>(null);
  const [prediction, setPrediction] = useState<{ prediction: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [priceHistory, setPriceHistory] = useState<{ timestamp: number; price: number }[]>([]);

  const ws = useRef(getWebSocketClient());
  const api = useRef(getApiClient());

  // Load initial gas prices
  const loadGasPrices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const prices = await api.current.getGasPrices();
      setGasPrice(prices);
      setLastUpdate(new Date());

      // Add to history
      setPriceHistory(prev => {
        const newHistory = [
          ...prev,
          { timestamp: Date.now(), price: parseFloat(prices.standard) },
        ].slice(-20); // Keep last 20 data points
        return newHistory;
      });

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gas prices');
      setLoading(false);
    }
  }, []);

  // Load AI prediction
  const loadPrediction = useCallback(async () => {
    if (!showPrediction) return;

    try {
      setPredictionLoading(true);
      const pred = await api.current.predictGasPrice();
      setPrediction(pred);
      setPredictionLoading(false);
    } catch (err) {
      console.error('Failed to load AI prediction:', err);
      setPredictionLoading(false);
    }
  }, [showPrediction]);

  // Handle gas price update from WebSocket
  const handleGasPriceUpdate = useCallback((data: GasPrice) => {
    setGasPrice(data);
    setLastUpdate(new Date());

    // Add to history
    setPriceHistory(prev => {
      const newHistory = [
        ...prev,
        { timestamp: Date.now(), price: parseFloat(data.standard) },
      ].slice(-20);
      return newHistory;
    });
  }, []);

  // Setup WebSocket and initial load
  useEffect(() => {
    const wsClient = ws.current;

    // Connection handlers
    const unsubConnected = wsClient.on(WebSocketEvent.CONNECTED, () => {
      setConnected(true);
    });

    const unsubDisconnected = wsClient.on(WebSocketEvent.DISCONNECTED, () => {
      setConnected(false);
    });

    // Gas price update handler
    const unsubGasUpdate = wsClient.on(WebSocketEvent.GAS_PRICE_UPDATE, handleGasPriceUpdate);

    // Connect if not already connected
    if (!wsClient.isConnected()) {
      wsClient.connect();
    } else {
      setConnected(true);
    }

    // Load initial data
    loadGasPrices();
    loadPrediction();

    // Auto-refresh
    let refreshTimer: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      refreshTimer = setInterval(() => {
        loadGasPrices();
        loadPrediction();
      }, refreshInterval);
    }

    return () => {
      unsubConnected();
      unsubDisconnected();
      unsubGasUpdate();
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [handleGasPriceUpdate, loadGasPrices, loadPrediction, autoRefresh, refreshInterval]);

  const formatGwei = (value: string): string => {
    const gwei = parseFloat(value) / 1e9;
    return gwei.toFixed(2);
  };

  const formatUSD = (gwei: string, gasLimit: number = 21000): string => {
    const ethPrice = 2000; // Placeholder - should come from API
    const gweiValue = parseFloat(gwei) / 1e9;
    const ethCost = gweiValue * gasLimit;
    const usdCost = ethCost * ethPrice;
    return `$${usdCost.toFixed(2)}`;
  };

  const getSpeedColor = (speed: 'slow' | 'standard' | 'fast' | 'instant'): string => {
    switch (speed) {
      case 'slow':
        return 'from-gray-500 to-gray-600';
      case 'standard':
        return 'from-blue-500 to-blue-600';
      case 'fast':
        return 'from-purple-500 to-purple-600';
      case 'instant':
        return 'from-pink-500 to-pink-600';
    }
  };

  const getSpeedIcon = (speed: 'slow' | 'standard' | 'fast' | 'instant'): JSX.Element => {
    const className = "h-6 w-6 text-white";

    switch (speed) {
      case 'slow':
        return (
          <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'standard':
        return (
          <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'fast':
        return (
          <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'instant':
        return (
          <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-lg">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-16 w-16 mx-auto text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="mt-4 text-xl font-semibold text-gray-900">Loading gas prices...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !gasPrice) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-lg">
        <div className="p-6 bg-red-50 border-2 border-red-300 rounded-lg" role="alert">
          <p className="text-red-800 font-medium">{error || 'Failed to load gas prices'}</p>
          <button
            onClick={loadGasPrices}
            className="mt-4 h-12 px-6 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Real-Time Gas Tracker</h2>
            <p className="text-blue-100 mt-1">Live network gas prices with AI predictions</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                loadGasPrices();
                loadPrediction();
              }}
              className="h-12 px-6 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium rounded-lg transition-all backdrop-blur-sm"
              aria-label="Refresh gas prices"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm font-medium">{connected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {lastUpdate && (
          <div className="mt-4 text-sm text-blue-100">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Gas Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(['slow', 'standard', 'fast', 'instant'] as const).map((speed) => (
          <div
            key={speed}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className={`p-6 bg-gradient-to-br ${getSpeedColor(speed)}`}>
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  {getSpeedIcon(speed)}
                </div>
                <div className="text-right text-white">
                  <div className="text-sm font-medium opacity-90 capitalize">{speed}</div>
                  <div className="text-3xl font-bold">{formatGwei(gasPrice[speed])}</div>
                  <div className="text-sm opacity-75">Gwei</div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Wait Time</span>
                <span className="font-semibold text-gray-900">
                  ~{gasPrice[`${speed}_wait_time` as keyof GasPrice]}s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cost (21k gas)</span>
                <span className="font-semibold text-gray-900">{formatUSD(gasPrice[speed])}</span>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(formatGwei(gasPrice[speed]))}
                className="w-full h-10 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors text-sm"
              >
                Copy Value
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Prediction */}
      {showPrediction && prediction && (
        <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg border-2 border-purple-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="h-14 w-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Gas Prediction</h3>
                <p className="text-gray-700">
                  Predicted optimal gas price: <span className="font-bold text-purple-600">{prediction.prediction}</span>
                </p>
                <div className="mt-3">
                  <span className="text-sm text-gray-600">Confidence: </span>
                  <span className={`font-semibold ${prediction.confidence >= 80 ? 'text-green-600' : prediction.confidence >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {prediction.confidence}%
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Recommended</div>
              <div className="text-3xl font-bold text-purple-600">
                {prediction.prediction}
              </div>
              <div className="text-sm text-gray-600">Gwei</div>
            </div>
          </div>
        </div>
      )}

      {predictionLoading && showPrediction && (
        <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
          <div className="flex items-center justify-center space-x-3">
            <svg className="animate-spin h-5 w-5 text-purple-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-gray-700">Loading AI prediction...</span>
          </div>
        </div>
      )}

      {/* Mini Chart */}
      {priceHistory.length > 1 && (
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Price Trend (Last 20 Updates)</h3>
          <div className="h-32 flex items-end space-x-1">
            {priceHistory.map((point, idx) => {
              const maxPrice = Math.max(...priceHistory.map(p => p.price));
              const height = (point.price / maxPrice) * 100;
              return (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-blue-600 to-purple-600 rounded-t transition-all hover:opacity-75"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                  title={`${point.price.toFixed(2)} Gwei`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
