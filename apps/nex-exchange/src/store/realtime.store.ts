import { create } from 'zustand';
import { WSMessage, OrderBookUpdate, TradeUpdate, PriceUpdate, CandlestickUpdate } from '@/types/websocket';

interface OrderBookEntry {
  readonly price: number;
  readonly amount: number;
  readonly total: number;
}

interface Trade {
  readonly id: string;
  readonly pair: string;
  readonly price: number;
  readonly amount: number;
  readonly side: 'buy' | 'sell';
  readonly timestamp: number;
}

interface PriceData {
  readonly pair: string;
  readonly price: number;
  readonly change24h: number;
  readonly volume24h: number;
  readonly high24h: number;
  readonly low24h: number;
  readonly timestamp: number;
}

interface CandlestickData {
  readonly time: number;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
}

interface RealtimeState {
  readonly orderBooks: Record<string, {
    readonly bids: OrderBookEntry[];
    readonly asks: OrderBookEntry[];
    readonly timestamp: number;
  }>;
  readonly recentTrades: Record<string, Trade[]>;
  readonly prices: Record<string, PriceData>;
  readonly candlesticks: Record<string, Record<string, CandlestickData[]>>;
  readonly isConnected: boolean;

  updateOrderBook: (pair: string, data: OrderBookUpdate['data']) => void;
  addTrade: (pair: string, trade: Trade) => void;
  updatePrice: (pair: string, price: PriceData) => void;
  addCandlestick: (pair: string, interval: string, candle: CandlestickData) => void;
  handleMessage: (message: WSMessage) => void;
  setConnected: (connected: boolean) => void;
  clearData: (pair?: string) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  orderBooks: {},
  recentTrades: {},
  prices: {},
  candlesticks: {},
  isConnected: false,

  updateOrderBook: (pair, data) =>
    set((state) => ({
      orderBooks: {
        ...state.orderBooks,
        [pair]: {
          bids: data.bids,
          asks: data.asks,
          timestamp: data.timestamp,
        },
      },
    })),

  addTrade: (pair, trade) =>
    set((state) => ({
      recentTrades: {
        ...state.recentTrades,
        [pair]: [trade, ...(state.recentTrades[pair] || []).slice(0, 99)],
      },
    })),

  updatePrice: (pair, price) =>
    set((state) => ({
      prices: {
        ...state.prices,
        [pair]: price,
      },
    })),

  addCandlestick: (pair, interval, candle) =>
    set((state) => {
      const pairCandles = state.candlesticks[pair] || {};
      const intervalCandles = pairCandles[interval] || [];
      const lastCandle = intervalCandles[intervalCandles.length - 1];

      // Update existing candle or add new one
      const updatedCandles =
        lastCandle && lastCandle.time === candle.time
          ? [...intervalCandles.slice(0, -1), candle]
          : [...intervalCandles, candle];

      return {
        candlesticks: {
          ...state.candlesticks,
          [pair]: {
            ...pairCandles,
            [interval]: updatedCandles.slice(-500), // Keep last 500 candles
          },
        },
      };
    }),

  handleMessage: (message) =>
    set((state) => {
      switch (message.type) {
        case 'orderbook': {
          const orderBookMsg = message as OrderBookUpdate;
          return {
            orderBooks: {
              ...state.orderBooks,
              [orderBookMsg.data.pair]: {
                bids: orderBookMsg.data.bids,
                asks: orderBookMsg.data.asks,
                timestamp: orderBookMsg.data.timestamp,
              },
            },
          };
        }

        case 'trade': {
          const tradeMsg = message as TradeUpdate;
          const pair = tradeMsg.data.pair;
          const trade: Trade = {
            id: tradeMsg.data.id,
            pair: tradeMsg.data.pair,
            price: tradeMsg.data.price,
            amount: tradeMsg.data.amount,
            side: tradeMsg.data.side,
            timestamp: tradeMsg.data.timestamp,
          };

          return {
            recentTrades: {
              ...state.recentTrades,
              [pair]: [trade, ...(state.recentTrades[pair] || []).slice(0, 99)],
            },
          };
        }

        case 'price': {
          const priceMsg = message as PriceUpdate;
          return {
            prices: {
              ...state.prices,
              [priceMsg.data.pair]: priceMsg.data,
            },
          };
        }

        case 'candlestick': {
          const candleMsg = message as CandlestickUpdate;
          const { pair, interval, ...candle } = candleMsg.data;
          const pairCandles = state.candlesticks[pair] || {};
          const intervalCandles = pairCandles[interval] || [];
          const lastCandle = intervalCandles[intervalCandles.length - 1];

          const updatedCandles =
            lastCandle && lastCandle.time === candle.time
              ? [...intervalCandles.slice(0, -1), candle]
              : [...intervalCandles, candle];

          return {
            candlesticks: {
              ...state.candlesticks,
              [pair]: {
                ...pairCandles,
                [interval]: updatedCandles.slice(-500),
              },
            },
          };
        }

        default:
          return state;
      }
    }),

  setConnected: (connected) =>
    set(() => ({
      isConnected: connected,
    })),

  clearData: (pair) =>
    set((state) => {
      if (pair) {
        const { [pair]: removedOrderBook, ...orderBooks } = state.orderBooks;
        const { [pair]: removedTrades, ...recentTrades } = state.recentTrades;
        const { [pair]: removedPrice, ...prices } = state.prices;
        const { [pair]: removedCandles, ...candlesticks } = state.candlesticks;

        return {
          orderBooks,
          recentTrades,
          prices,
          candlesticks,
        };
      }

      return {
        orderBooks: {},
        recentTrades: {},
        prices: {},
        candlesticks: {},
      };
    }),
}));
