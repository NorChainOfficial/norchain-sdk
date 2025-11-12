/**
 * WebSocket Client for Real-time Updates
 * Handles real-time blockchain events and updates
 *
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Event subscription management
 * - Heartbeat/ping-pong for connection health
 * - Type-safe event handlers
 * - Connection state management
 * - Message queue for offline messages
 */

import { Block, Transaction } from './api-client-v2';

// ============================================================================
// WebSocket Events
// ============================================================================

export enum WebSocketEvent {
  // Connection events
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',

  // Blockchain events
  NEW_BLOCK = 'new_block',
  NEW_TRANSACTION = 'new_transaction',
  PENDING_TRANSACTION = 'pending_transaction',

  // Network events
  GAS_PRICE_UPDATE = 'gas_price_update',
  NETWORK_STATS_UPDATE = 'network_stats_update',

  // Account events
  ACCOUNT_BALANCE_UPDATE = 'account_balance_update',
  ACCOUNT_TRANSACTION = 'account_transaction',
}

export interface WebSocketMessage {
  readonly event: WebSocketEvent;
  readonly data: any;
  readonly timestamp: string;
}

// ============================================================================
// Event Payloads
// ============================================================================

export interface NewBlockPayload {
  readonly block: Block;
}

export interface NewTransactionPayload {
  readonly transaction: Transaction;
}

export interface GasPriceUpdatePayload {
  readonly slow: string;
  readonly standard: string;
  readonly fast: string;
  readonly instant: string;
}

export interface NetworkStatsUpdatePayload {
  readonly tps: number;
  readonly pending_transactions: number;
  readonly average_block_time: number;
}

export interface AccountBalanceUpdatePayload {
  readonly address: string;
  readonly balance: string;
  readonly previous_balance: string;
}

// ============================================================================
// WebSocket Client Configuration
// ============================================================================

export interface WebSocketConfig {
  readonly url?: string;
  readonly reconnect?: boolean;
  readonly reconnectInterval?: number;
  readonly reconnectMaxInterval?: number;
  readonly reconnectDecay?: number;
  readonly heartbeatInterval?: number;
  readonly debug?: boolean;
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR',
}

// ============================================================================
// WebSocket Client Class
// ============================================================================

type EventHandler = (data: any) => void;

export class NorWebSocketClient {
  private ws: WebSocket | null = null;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private readonly url: string;
  private readonly config: Required<WebSocketConfig>;

  // Event handlers
  private eventHandlers: Map<WebSocketEvent, Set<EventHandler>> = new Map();

  // Reconnection logic
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private currentReconnectInterval: number;

  // Heartbeat
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = 0;

  // Message queue for offline messages
  private messageQueue: any[] = [];
  private maxQueueSize: number = 100;

  // Subscriptions
  private subscriptions: Set<string> = new Set();

  constructor(config: WebSocketConfig = {}) {
    this.url = config.url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

    this.config = {
      url: this.url,
      reconnect: config.reconnect !== false,
      reconnectInterval: config.reconnectInterval || 1000,
      reconnectMaxInterval: config.reconnectMaxInterval || 30000,
      reconnectDecay: config.reconnectDecay || 1.5,
      heartbeatInterval: config.heartbeatInterval || 30000,
      debug: config.debug || false,
    };

    this.currentReconnectInterval = this.config.reconnectInterval;
  }

  // ==========================================================================
  // Connection Management
  // ==========================================================================

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.state === ConnectionState.CONNECTED || this.state === ConnectionState.CONNECTING) {
      this.log('Already connected or connecting');
      return;
    }

    this.state = ConnectionState.CONNECTING;
    this.log('Connecting to WebSocket server:', this.url);

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      this.log('Connection error:', error);
      this.handleError(error as Event);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.log('Disconnecting from WebSocket server');

    this.config.reconnect = false;
    this.stopReconnect();
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.state = ConnectionState.DISCONNECTED;
    this.emit(WebSocketEvent.DISCONNECTED, { reason: 'manual' });
  }

  /**
   * Reconnect to WebSocket server
   */
  private reconnect(): void {
    if (!this.config.reconnect || this.state === ConnectionState.CONNECTED) {
      return;
    }

    this.stopReconnect();
    this.state = ConnectionState.RECONNECTING;

    this.log(`Reconnecting in ${this.currentReconnectInterval}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.emit(WebSocketEvent.RECONNECTING, {
        attempt: this.reconnectAttempts,
        nextDelay: this.currentReconnectInterval,
      });

      this.connect();

      // Exponential backoff
      this.currentReconnectInterval = Math.min(
        this.currentReconnectInterval * this.config.reconnectDecay,
        this.config.reconnectMaxInterval
      );
    }, this.currentReconnectInterval);
  }

  /**
   * Stop reconnection attempts
   */
  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // ==========================================================================
  // WebSocket Event Handlers
  // ==========================================================================

  private handleOpen(event: Event): void {
    this.log('WebSocket connected');

    this.state = ConnectionState.CONNECTED;
    this.reconnectAttempts = 0;
    this.currentReconnectInterval = this.config.reconnectInterval;

    this.startHeartbeat();
    this.emit(WebSocketEvent.CONNECTED, { timestamp: new Date().toISOString() });

    // Resubscribe to previous subscriptions
    this.resubscribe();

    // Send queued messages
    this.flushMessageQueue();
  }

  private handleClose(event: CloseEvent): void {
    this.log('WebSocket disconnected:', event.code, event.reason);

    this.stopHeartbeat();
    this.ws = null;

    if (this.config.reconnect && event.code !== 1000) {
      this.reconnect();
    } else {
      this.state = ConnectionState.DISCONNECTED;
      this.emit(WebSocketEvent.DISCONNECTED, {
        code: event.code,
        reason: event.reason,
      });
    }
  }

  private handleError(event: Event): void {
    this.log('WebSocket error:', event);

    this.state = ConnectionState.ERROR;
    this.emit(WebSocketEvent.ERROR, {
      error: 'WebSocket error occurred',
      timestamp: new Date().toISOString(),
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.log('Received message:', message.event);

      // Update last heartbeat time
      this.lastHeartbeat = Date.now();

      // Handle pong messages
      if (message.event === 'pong' as any) {
        return;
      }

      // Emit to registered handlers
      this.emit(message.event, message.data);
    } catch (error) {
      this.log('Error parsing message:', error);
    }
  }

  // ==========================================================================
  // Heartbeat / Ping-Pong
  // ==========================================================================

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.state === ConnectionState.CONNECTED) {
        // Check if we received heartbeat recently
        const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat;

        if (timeSinceLastHeartbeat > this.config.heartbeatInterval * 2) {
          this.log('Heartbeat timeout, reconnecting...');
          this.ws?.close();
          return;
        }

        // Send ping
        this.send({ event: 'ping', timestamp: new Date().toISOString() });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ==========================================================================
  // Event Subscription
  // ==========================================================================

  /**
   * Subscribe to an event
   */
  on(event: WebSocketEvent, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.off(event, handler);
    };
  }

  /**
   * Unsubscribe from an event
   */
  off(event: WebSocketEvent, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit event to all registered handlers
   */
  private emit(event: WebSocketEvent, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          this.log('Error in event handler:', error);
        }
      });
    }
  }

  // ==========================================================================
  // Channel Subscriptions
  // ==========================================================================

  /**
   * Subscribe to a channel
   */
  subscribe(channel: string): void {
    this.subscriptions.add(channel);

    if (this.state === ConnectionState.CONNECTED) {
      this.send({
        event: 'subscribe',
        channel,
      });
    }
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel: string): void {
    this.subscriptions.delete(channel);

    if (this.state === ConnectionState.CONNECTED) {
      this.send({
        event: 'unsubscribe',
        channel,
      });
    }
  }

  /**
   * Resubscribe to all channels after reconnection
   */
  private resubscribe(): void {
    this.subscriptions.forEach(channel => {
      this.send({
        event: 'subscribe',
        channel,
      });
    });
  }

  // ==========================================================================
  // Message Sending
  // ==========================================================================

  /**
   * Send message to WebSocket server
   */
  private send(message: any): void {
    if (this.state === ConnectionState.CONNECTED && this.ws) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        this.log('Error sending message:', error);
        this.queueMessage(message);
      }
    } else {
      this.queueMessage(message);
    }
  }

  /**
   * Queue message for later sending
   */
  private queueMessage(message: any): void {
    if (this.messageQueue.length >= this.maxQueueSize) {
      this.messageQueue.shift(); // Remove oldest message
    }
    this.messageQueue.push(message);
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      state: this.state,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions),
      queuedMessages: this.messageQueue.length,
      lastHeartbeat: this.lastHeartbeat,
    };
  }

  /**
   * Debug logging
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[WebSocket]', ...args);
    }
  }

  /**
   * Cleanup and destroy client
   */
  destroy(): void {
    this.disconnect();
    this.eventHandlers.clear();
    this.subscriptions.clear();
    this.messageQueue = [];
  }
}

// ============================================================================
// Singleton Instance Export
// ============================================================================

let wsClientInstance: NorWebSocketClient | null = null;

export function getWebSocketClient(config?: WebSocketConfig): NorWebSocketClient {
  if (!wsClientInstance) {
    wsClientInstance = new NorWebSocketClient(config);
  }
  return wsClientInstance;
}

export default NorWebSocketClient;
