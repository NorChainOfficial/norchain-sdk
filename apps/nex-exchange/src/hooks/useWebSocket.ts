"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { WSMessage, WebSocketConfig, WebSocketState } from '@/types/websocket';

interface UseWebSocketOptions {
  readonly url: string;
  readonly onMessage?: (message: WSMessage) => void;
  readonly onConnect?: () => void;
  readonly onDisconnect?: () => void;
  readonly onError?: (error: Event) => void;
  readonly autoReconnect?: boolean;
  readonly reconnectDelay?: number;
  readonly maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  readonly isConnected: boolean;
  readonly reconnectAttempts: number;
  readonly lastError: string | null;
  readonly send: (message: string | object) => void;
  readonly connect: () => void;
  readonly disconnect: () => void;
}

export const useWebSocket = ({
  url,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  autoReconnect = true,
  reconnectDelay = 3000,
  maxReconnectAttempts = 5,
}: UseWebSocketOptions): UseWebSocketReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    reconnectAttempts: 0,
    lastError: null,
  });

  const connect = useCallback(() => {
    try {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
      }

      const ws = new WebSocket(url);

      ws.onopen = () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          reconnectAttempts: 0,
          lastError: null,
        }));
        onConnect?.();
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error: Event) => {
        setState(prev => ({
          ...prev,
          lastError: 'WebSocket error occurred',
        }));
        onError?.(error);
      };

      ws.onclose = () => {
        setState(prev => ({
          ...prev,
          isConnected: false,
        }));
        onDisconnect?.();

        // Auto-reconnect logic
        if (autoReconnect && state.reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setState(prev => ({
              ...prev,
              reconnectAttempts: prev.reconnectAttempts + 1,
            }));
            connect();
          }, reconnectDelay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setState(prev => ({
        ...prev,
        lastError: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [url, onConnect, onMessage, onDisconnect, onError, autoReconnect, reconnectDelay, maxReconnectAttempts, state.reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const send = useCallback((message: string | object) => {
    if (wsRef.current && state.isConnected) {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      wsRef.current.send(data);
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }, [state.isConnected]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected: state.isConnected,
    reconnectAttempts: state.reconnectAttempts,
    lastError: state.lastError,
    send,
    connect,
    disconnect,
  };
};
