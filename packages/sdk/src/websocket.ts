import EventEmitter from 'eventemitter3';
import WebSocket from 'ws';

export type WebSocketEvent =
  | 'transaction'
  | 'block'
  | 'payment'
  | 'order'
  | 'price'
  | 'balance';

export interface WebSocketMessage<T = any> {
  readonly event: string;
  readonly data: T;
  readonly timestamp: string;
}

export interface WebSocketConfig {
  readonly url: string;
  readonly apiKey?: string;
  readonly token?: string;
  readonly reconnect?: boolean;
  readonly reconnectInterval?: number;
  readonly maxReconnectAttempts?: number;
}

export interface SubscriptionOptions {
  readonly event: WebSocketEvent;
  readonly filter?: Record<string, any>;
}

/**
 * WebSocket client for real-time updates
 */
export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, SubscriptionOptions> = new Map();
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isIntentionallyClosed: boolean = false;

  constructor(private readonly config: WebSocketConfig) {
    super();
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isIntentionallyClosed = false;
    const headers: Record<string, string> = {};

    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }

    this.ws = new WebSocket(this.config.url, { headers });

    this.ws.on('open', () => {
      this.emit('connected');
      this.reconnectAttempts = 0;

      // Resubscribe to all previous subscriptions
      this.subscriptions.forEach((options, id) => {
        this.sendSubscribe(id, options);
      });
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.emit(message.event, message.data);
        this.emit('message', message);
      } catch (error) {
        this.emit('error', error);
      }
    });

    this.ws.on('error', (error: Error) => {
      this.emit('error', error);
    });

    this.ws.on('close', () => {
      this.emit('disconnected');

      if (!this.isIntentionallyClosed && this.config.reconnect !== false) {
        this.handleReconnect();
      }
    });
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    const maxAttempts = this.config.maxReconnectAttempts ?? 10;
    const interval = this.config.reconnectInterval ?? 5000;

    if (this.reconnectAttempts >= maxAttempts) {
      this.emit('reconnect-failed');
      return;
    }

    this.reconnectAttempts++;
    this.emit('reconnecting', this.reconnectAttempts);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, interval * Math.min(this.reconnectAttempts, 5)); // Exponential backoff capped at 5x
  }

  /**
   * Subscribe to real-time events
   */
  subscribe(options: SubscriptionOptions): string {
    const subscriptionId = this.generateSubscriptionId(options);
    this.subscriptions.set(subscriptionId, options);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe(subscriptionId, options);
    }

    return subscriptionId;
  }

  /**
   * Send subscribe message to server
   */
  private sendSubscribe(subscriptionId: string, options: SubscriptionOptions): void {
    this.send({
      action: 'subscribe',
      subscriptionId,
      event: options.event,
      filter: options.filter,
    });
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({
        action: 'unsubscribe',
        subscriptionId,
      });
    }

    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Unsubscribe from all events
   */
  unsubscribeAll(): void {
    const subscriptionIds = Array.from(this.subscriptions.keys());
    subscriptionIds.forEach((id) => this.unsubscribe(id));
  }

  /**
   * Send a message to the WebSocket server
   */
  private send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  /**
   * Close the WebSocket connection
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscriptions.clear();
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(options: SubscriptionOptions): string {
    const filterString = options.filter ? JSON.stringify(options.filter) : '';
    return `${options.event}-${filterString}-${Date.now()}`;
  }

  /**
   * Subscribe to new transactions
   */
  onTransaction(callback: (data: any) => void, filter?: Record<string, any>): string {
    const subscriptionId = this.subscribe({ event: 'transaction', filter });
    this.on('transaction', callback);
    return subscriptionId;
  }

  /**
   * Subscribe to new blocks
   */
  onBlock(callback: (data: any) => void): string {
    const subscriptionId = this.subscribe({ event: 'block' });
    this.on('block', callback);
    return subscriptionId;
  }

  /**
   * Subscribe to payment updates
   */
  onPayment(callback: (data: any) => void, filter?: Record<string, any>): string {
    const subscriptionId = this.subscribe({ event: 'payment', filter });
    this.on('payment', callback);
    return subscriptionId;
  }

  /**
   * Subscribe to order updates
   */
  onOrder(callback: (data: any) => void, filter?: Record<string, any>): string {
    const subscriptionId = this.subscribe({ event: 'order', filter });
    this.on('order', callback);
    return subscriptionId;
  }

  /**
   * Subscribe to price updates
   */
  onPrice(callback: (data: any) => void, filter?: Record<string, any>): string {
    const subscriptionId = this.subscribe({ event: 'price', filter });
    this.on('price', callback);
    return subscriptionId;
  }

  /**
   * Subscribe to balance updates
   */
  onBalance(callback: (data: any) => void, filter?: Record<string, any>): string {
    const subscriptionId = this.subscribe({ event: 'balance', filter });
    this.on('balance', callback);
    return subscriptionId;
  }
}
