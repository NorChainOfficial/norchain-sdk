"use client";

import { useEffect, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useRealtimeStore } from '@/store/realtime.store';
import { WSMessage } from '@/types/websocket';

interface WebSocketProviderProps {
  readonly children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps): JSX.Element => {
  const { handleMessage, setConnected } = useRealtimeStore();

  // Get WebSocket URL from environment or use mock mode
  const wsUrl = process.env.NEXT_PUBLIC_NORCHAIN_WS || '';
  const useMockData = !wsUrl; // Use mock data if WebSocket URL is not configured

  const { isConnected, reconnectAttempts, lastError } = useWebSocket({
    url: wsUrl,
    onMessage: (message: WSMessage) => {
      handleMessage(message);
    },
    onConnect: () => {
      setConnected(true);
      console.log('WebSocket connected');
    },
    onDisconnect: () => {
      setConnected(false);
      console.log('WebSocket disconnected');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
    autoReconnect: true,
    reconnectDelay: 3000,
    maxReconnectAttempts: 5,
  });

  // Mock data generator when WebSocket is not configured
  useEffect(() => {
    if (!useMockData) return;

    const generateMockOrderBook = () => {
      const generateOrders = (basePrice: number, count: number, isBid: boolean) => {
        const orders = [];
        let cumulativeTotal = 0;

        for (let i = 0; i < count; i++) {
          const priceOffset = (i * 0.00001) * (isBid ? -1 : 1);
          const price = basePrice + priceOffset;
          const amount = Math.random() * 50000 + 5000;
          cumulativeTotal += amount * price;

          orders.push({
            price,
            amount,
            total: cumulativeTotal,
          });
        }

        return orders;
      };

      return {
        type: 'orderbook' as const,
        data: {
          pair: 'NOR/USDT',
          bids: generateOrders(0.0061, 15, true),
          asks: generateOrders(0.0062, 15, false),
          timestamp: Date.now(),
        },
      };
    };

    const generateMockTrade = () => {
      return {
        type: 'trade' as const,
        data: {
          id: `trade-${Date.now()}-${Math.random()}`,
          pair: 'NOR/USDT',
          price: 0.00615 + (Math.random() - 0.5) * 0.0001,
          amount: Math.random() * 10000 + 1000,
          side: Math.random() > 0.5 ? 'buy' as const : 'sell' as const,
          timestamp: Date.now(),
        },
      };
    };

    const generateMockPrice = () => {
      return {
        type: 'price' as const,
        data: {
          pair: 'NOR/USDT',
          price: 0.00615,
          change24h: (Math.random() - 0.5) * 10,
          volume24h: Math.random() * 1000000 + 500000,
          high24h: 0.00625,
          low24h: 0.00605,
          timestamp: Date.now(),
        },
      };
    };

    // Simulate WebSocket messages
    setConnected(true);

    // Initial order book
    handleMessage(generateMockOrderBook());
    handleMessage(generateMockPrice());

    // Update order book every 2 seconds
    const orderBookInterval = setInterval(() => {
      handleMessage(generateMockOrderBook());
    }, 2000);

    // Add trades every 3-7 seconds
    const tradeInterval = setInterval(() => {
      handleMessage(generateMockTrade());
    }, 3000 + Math.random() * 4000);

    // Update price every 5 seconds
    const priceInterval = setInterval(() => {
      handleMessage(generateMockPrice());
    }, 5000);

    return () => {
      clearInterval(orderBookInterval);
      clearInterval(tradeInterval);
      clearInterval(priceInterval);
    };
  }, [useMockData, handleMessage, setConnected]);

  // Show connection status in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (useMockData) {
        console.log('Using mock WebSocket data (NEXT_PUBLIC_NORCHAIN_WS not configured)');
      } else {
        console.log(`WebSocket status: ${isConnected ? 'Connected' : 'Disconnected'}`);
        if (reconnectAttempts > 0) {
          console.log(`Reconnect attempts: ${reconnectAttempts}`);
        }
        if (lastError) {
          console.log(`Last error: ${lastError}`);
        }
      }
    }
  }, [isConnected, reconnectAttempts, lastError, useMockData]);

  return <>{children}</>;
};
