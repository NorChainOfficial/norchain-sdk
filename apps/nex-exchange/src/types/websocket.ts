export interface WebSocketMessage {
  readonly type: string;
  readonly data: unknown;
  readonly timestamp: number;
}

export interface OrderBookUpdate {
  readonly type: 'orderbook';
  readonly data: {
    readonly pair: string;
    readonly bids: Array<{
      readonly price: number;
      readonly amount: number;
      readonly total: number;
    }>;
    readonly asks: Array<{
      readonly price: number;
      readonly amount: number;
      readonly total: number;
    }>;
    readonly timestamp: number;
  };
}

export interface TradeUpdate {
  readonly type: 'trade';
  readonly data: {
    readonly id: string;
    readonly pair: string;
    readonly price: number;
    readonly amount: number;
    readonly side: 'buy' | 'sell';
    readonly timestamp: number;
  };
}

export interface PriceUpdate {
  readonly type: 'price';
  readonly data: {
    readonly pair: string;
    readonly price: number;
    readonly change24h: number;
    readonly volume24h: number;
    readonly high24h: number;
    readonly low24h: number;
    readonly timestamp: number;
  };
}

export interface CandlestickUpdate {
  readonly type: 'candlestick';
  readonly data: {
    readonly pair: string;
    readonly interval: string;
    readonly time: number;
    readonly open: number;
    readonly high: number;
    readonly low: number;
    readonly close: number;
    readonly volume: number;
  };
}

export type WSMessage =
  | OrderBookUpdate
  | TradeUpdate
  | PriceUpdate
  | CandlestickUpdate;

export interface WebSocketConfig {
  readonly url: string;
  readonly reconnectDelay?: number;
  readonly maxReconnectAttempts?: number;
  readonly heartbeatInterval?: number;
}

export interface WebSocketState {
  readonly isConnected: boolean;
  readonly reconnectAttempts: number;
  readonly lastError: string | null;
}
