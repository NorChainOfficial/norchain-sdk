"use client";

import { useMemo } from "react";
import { useRealtimeStore } from "@/store/realtime.store";

interface OrderBookEntry {
  readonly price: number;
  readonly amount: number;
  readonly total: number;
}

interface OrderBookData {
  readonly bids: OrderBookEntry[];
  readonly asks: OrderBookEntry[];
}

interface OrderBookProps {
  readonly pair?: string;
}

export function OrderBook({ pair = 'NOR/USDT' }: OrderBookProps): JSX.Element {
  const { orderBooks, isConnected } = useRealtimeStore();
  const orderBook = orderBooks[pair];

  const maxBidTotal = useMemo(() => {
    if (!orderBook?.bids.length) return 0;
    return Math.max(...orderBook.bids.map(b => b.amount));
  }, [orderBook?.bids]);

  const maxAskTotal = useMemo(() => {
    if (!orderBook?.asks.length) return 0;
    return Math.max(...orderBook.asks.map(a => a.amount));
  }, [orderBook?.asks]);

  const spread = useMemo(() => {
    if (!orderBook || !orderBook.bids.length || !orderBook.asks.length) return 0;
    return orderBook.asks[0].price - orderBook.bids[0].price;
  }, [orderBook]);

  const spreadPercentage = useMemo(() => {
    if (!orderBook || !orderBook.bids.length || !orderBook.asks.length) return 0;
    const midPrice = (orderBook.asks[0].price + orderBook.bids[0].price) / 2;
    return (spread / midPrice) * 100;
  }, [orderBook, spread]);

  if (!orderBook || !orderBook.bids.length || !orderBook.asks.length) {
    return (
      <div className="text-center py-8 text-foreground/70">
        {isConnected ? 'Loading order book...' : 'Connecting to real-time data...'}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Bids */}
      <div className="bg-background border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-success">Bids (Buy Orders)</h3>
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-success animate-pulse' : 'bg-foreground/30'
              }`}
              title={isConnected ? 'Connected' : 'Disconnected'}
            />
          </div>
          <span className="text-xs text-foreground/70">
            Spread: {spread.toFixed(6)} ({spreadPercentage.toFixed(2)}%)
          </span>
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-2 text-xs text-foreground/70 mb-2 pb-2 border-b border-border">
            <div>Price (USDT)</div>
            <div className="text-right">Amount (NOR)</div>
            <div className="text-right">Total</div>
          </div>

          {orderBook.bids.map((bid, index) => {
            const depthPercentage = (bid.amount / maxBidTotal) * 100;

            return (
              <div
                key={index}
                className="relative grid grid-cols-3 gap-2 text-sm hover:bg-background/50 rounded p-1 overflow-hidden group cursor-pointer"
              >
                {/* Depth visualization bar */}
                <div
                  className="absolute inset-0 bg-success/10 transition-all duration-300"
                  style={{ width: `${depthPercentage}%` }}
                />

                {/* Content */}
                <div className="relative z-10 text-success font-mono">
                  {bid.price.toFixed(6)}
                </div>
                <div className="relative z-10 text-right font-mono">
                  {bid.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div className="relative z-10 text-right font-mono text-foreground/70">
                  {bid.total.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Asks */}
      <div className="bg-background border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-error">Asks (Sell Orders)</h3>
          <span className="text-xs text-foreground/70">
            Mid Price: {((orderBook.asks[0].price + orderBook.bids[0].price) / 2).toFixed(6)}
          </span>
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-2 text-xs text-foreground/70 mb-2 pb-2 border-b border-border">
            <div>Price (USDT)</div>
            <div className="text-right">Amount (NOR)</div>
            <div className="text-right">Total</div>
          </div>

          {orderBook.asks.map((ask, index) => {
            const depthPercentage = (ask.amount / maxAskTotal) * 100;

            return (
              <div
                key={index}
                className="relative grid grid-cols-3 gap-2 text-sm hover:bg-background/50 rounded p-1 overflow-hidden group cursor-pointer"
              >
                {/* Depth visualization bar */}
                <div
                  className="absolute inset-0 bg-error/10 transition-all duration-300"
                  style={{ width: `${depthPercentage}%` }}
                />

                {/* Content */}
                <div className="relative z-10 text-error font-mono">
                  {ask.price.toFixed(6)}
                </div>
                <div className="relative z-10 text-right font-mono">
                  {ask.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div className="relative z-10 text-right font-mono text-foreground/70">
                  {ask.total.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

