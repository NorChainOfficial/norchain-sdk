'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getWebSocketClient, WebSocketEvent } from '@/lib/websocket-client';
import { getApiClient, type Block } from '@/lib/api-client-v2';
import Link from 'next/link';

interface LiveBlockStreamProps {
  readonly maxBlocks?: number;
  readonly showTransactionCount?: boolean;
  readonly compact?: boolean;
}

export const LiveBlockStream = ({
  maxBlocks = 10,
  showTransactionCount = true,
  compact = false,
}: LiveBlockStreamProps): JSX.Element => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newBlockCount, setNewBlockCount] = useState(0);
  const [lastBlockTime, setLastBlockTime] = useState<number | null>(null);
  const [averageBlockTime, setAverageBlockTime] = useState<number | null>(null);

  const ws = useRef(getWebSocketClient({ debug: true }));
  const api = useRef(getApiClient());
  const blockTimestamps = useRef<number[]>([]);

  // Calculate average block time
  const calculateAverageBlockTime = useCallback((timestamp: number) => {
    blockTimestamps.current.push(timestamp);

    // Keep only last 10 timestamps
    if (blockTimestamps.current.length > 10) {
      blockTimestamps.current.shift();
    }

    if (blockTimestamps.current.length >= 2) {
      const times: number[] = [];
      for (let i = 1; i < blockTimestamps.current.length; i++) {
        times.push(blockTimestamps.current[i] - blockTimestamps.current[i - 1]);
      }
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      setAverageBlockTime(avg);
    }
  }, []);

  // Load initial blocks
  const loadInitialBlocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.current.getBlocks(1, maxBlocks);
      setBlocks(response.data);

      // Initialize timestamps for average calculation
      response.data.forEach(block => {
        const timestamp = new Date(block.timestamp).getTime();
        blockTimestamps.current.push(timestamp);
      });

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blocks');
      setLoading(false);
    }
  }, [maxBlocks]);

  // Handle new block from WebSocket
  const handleNewBlock = useCallback((data: { block: Block }) => {
    const newBlock = data.block;
    const timestamp = new Date(newBlock.timestamp).getTime();

    setBlocks(prev => {
      const updated = [newBlock, ...prev];
      return updated.slice(0, maxBlocks);
    });

    setNewBlockCount(prev => prev + 1);
    setLastBlockTime(timestamp);
    calculateAverageBlockTime(timestamp);

    // Auto-reset counter after 3 seconds
    setTimeout(() => {
      setNewBlockCount(prev => Math.max(0, prev - 1));
    }, 3000);
  }, [maxBlocks, calculateAverageBlockTime]);

  // Setup WebSocket connection
  useEffect(() => {
    const wsClient = ws.current;

    // Connection event handlers
    const unsubConnected = wsClient.on(WebSocketEvent.CONNECTED, () => {
      setConnected(true);
      setError(null);
    });

    const unsubDisconnected = wsClient.on(WebSocketEvent.DISCONNECTED, () => {
      setConnected(false);
    });

    const unsubError = wsClient.on(WebSocketEvent.ERROR, () => {
      setError('WebSocket connection error');
    });

    // Block event handler
    const unsubNewBlock = wsClient.on(WebSocketEvent.NEW_BLOCK, handleNewBlock);

    // Connect
    if (!wsClient.isConnected()) {
      wsClient.connect();
    } else {
      setConnected(true);
    }

    // Load initial blocks
    loadInitialBlocks();

    return () => {
      unsubConnected();
      unsubDisconnected();
      unsubError();
      unsubNewBlock();
    };
  }, [handleNewBlock, loadInitialBlocks]);

  const formatTimeAgo = (timestamp: string): string => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatBlockTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
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
            <p className="mt-4 text-xl font-semibold text-gray-900">Loading blocks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Compact Header - HIGH CONTRAST */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Live Blocks</h3>
          <div className="flex items-center space-x-3">
            {averageBlockTime && (
              <div className="text-sm text-gray-300">
                Avg: <span className="font-semibold text-white">{formatBlockTime(averageBlockTime)}</span>
              </div>
            )}
            <div className={`h-3 w-3 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          </div>
        </div>

        {/* Compact Block List - HIGH CONTRAST */}
        <div className="space-y-2">
          {blocks.map((block, idx) => (
            <Link
              key={block.height}
              href={`/blocks/${block.height}`}
              className={`block p-3 bg-slate-800 rounded-lg border-2 border-purple-500 hover:border-blue-400 hover:shadow-lg hover:bg-slate-700 transition-all ${idx === 0 && newBlockCount > 0 ? 'animate-pulse bg-blue-900 border-blue-400' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                    {block.height.toString().slice(-2)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">Block #{block.height}</div>
                    <div className="text-sm text-gray-400">{formatTimeAgo(block.timestamp)}</div>
                  </div>
                </div>
                {showTransactionCount && (
                  <div className="text-sm text-gray-300">
                    <span className="font-semibold text-white">{block.transaction_count || 0}</span> txs
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-500">
      {/* Header - HIGH CONTRAST */}
      <div className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Live Block Stream</h2>
            <p className="text-blue-100 mt-2 text-lg">Real-time blockchain updates</p>
          </div>
          <div className="flex items-center space-x-4">
            {averageBlockTime && (
              <div className="text-right">
                <div className="text-sm text-blue-200 font-medium">Avg Block Time</div>
                <div className="text-2xl font-bold">{formatBlockTime(averageBlockTime)}</div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <div className={`h-4 w-4 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-lg font-bold">{connected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {newBlockCount > 0 && (
          <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm animate-pulse">
            <div className="flex items-center justify-center space-x-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{newBlockCount} new block{newBlockCount > 1 ? 's' : ''} received</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-900 bg-opacity-50 border-l-4 border-red-500" role="alert">
          <p className="text-red-200 font-medium">{error}</p>
        </div>
      )}

      {/* Block Stream - HIGH CONTRAST */}
      <div className="divide-y-2 divide-slate-700">
        {blocks.map((block, idx) => (
          <Link
            key={block.height}
            href={`/blocks/${block.height}`}
            className={`block p-6 hover:bg-slate-700 transition-colors ${idx === 0 && newBlockCount > 0 ? 'bg-blue-900 bg-opacity-30' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                {/* Block Icon - HIGH CONTRAST */}
                <div className={`h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${idx === 0 && newBlockCount > 0 ? 'animate-pulse' : ''}`}>
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>

                {/* Block Info - HIGH CONTRAST */}
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <h3 className="text-2xl font-bold text-white">Block #{block.height}</h3>
                    {idx === 0 && (
                      <span className="px-4 py-1 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg">
                        Latest
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-3">
                    <div>
                      <div className="text-sm text-gray-400 font-medium mb-1">Timestamp</div>
                      <div className="text-xl font-bold text-white">{formatTimeAgo(block.timestamp)}</div>
                    </div>

                    {showTransactionCount && (
                      <div>
                        <div className="text-sm text-gray-400 font-medium mb-1">Transactions</div>
                        <div className="text-xl font-bold text-white">{block.transaction_count || 0}</div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm text-gray-400 font-medium mb-1">Validator</div>
                      <div className="font-mono text-sm text-purple-400 truncate">
                        {block.miner ? `${block.miner.slice(0, 10)}...` : 'N/A'}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 font-medium mb-1">Gas Used</div>
                      <div className="text-xl font-bold text-white">
                        {block.gas_used ? (parseInt(block.gas_used) / 1000000).toFixed(2) + 'M' : '0M'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 font-medium mb-2">Block Hash</div>
                    <div className="font-mono text-sm text-blue-400 bg-slate-900 px-4 py-3 rounded-lg border border-slate-700">
                      {block.hash}
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow - HIGH CONTRAST */}
              <svg className="h-8 w-8 text-gray-500 flex-shrink-0 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {blocks.length === 0 && !loading && (
        <div className="p-12 text-center">
          <p className="text-gray-400 text-lg">No blocks available</p>
        </div>
      )}
    </div>
  );
};
