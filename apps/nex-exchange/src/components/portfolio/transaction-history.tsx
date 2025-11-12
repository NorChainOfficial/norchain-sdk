"use client";

import { formatDistance } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';

interface Transaction {
  readonly id: string;
  readonly type: 'swap' | 'send' | 'receive';
  readonly fromAsset: string;
  readonly toAsset: string;
  readonly fromAmount: string;
  readonly toAmount: string;
  readonly timestamp: number;
  readonly status: 'completed' | 'pending' | 'failed';
  readonly txHash: string;
}

interface TransactionHistoryProps {
  readonly transactions?: Transaction[];
}

export const TransactionHistory = ({ transactions }: TransactionHistoryProps): JSX.Element => {
  // Mock data if none provided
  const mockTransactions: Transaction[] = transactions || [
    {
      id: '1',
      type: 'swap',
      fromAsset: 'NOR',
      toAsset: 'USDT',
      fromAmount: '1000',
      toAmount: '6.15',
      timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
      status: 'completed',
      txHash: '0x1234...5678',
    },
    {
      id: '2',
      type: 'receive',
      fromAsset: 'NOR',
      toAsset: 'NOR',
      fromAmount: '5000',
      toAmount: '5000',
      timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
      status: 'completed',
      txHash: '0x2345...6789',
    },
    {
      id: '3',
      type: 'swap',
      fromAsset: 'USDT',
      toAsset: 'BTCBR',
      fromAmount: '100',
      toAmount: '0.0015',
      timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      status: 'completed',
      txHash: '0x3456...7890',
    },
    {
      id: '4',
      type: 'send',
      fromAsset: 'NOR',
      toAsset: 'NOR',
      fromAmount: '2000',
      toAmount: '2000',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
      status: 'completed',
      txHash: '0x4567...8901',
    },
  ];

  const displayTransactions = transactions || mockTransactions;

  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="h-5 w-5 text-error" />;
      case 'receive':
        return <ArrowDownLeft className="h-5 w-5 text-success" />;
      case 'swap':
        return <RefreshCw className="h-5 w-5 text-primary" />;
    }
  };

  const getTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return 'Sent';
      case 'receive':
        return 'Received';
      case 'swap':
        return 'Swapped';
    }
  };

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>

      <div className="space-y-2">
        {displayTransactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border hover:bg-background transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border">
                {getIcon(tx.type)}
              </div>

              <div>
                <div className="font-semibold">
                  {getTypeLabel(tx.type)} {tx.fromAsset}
                  {tx.type === 'swap' && ` → ${tx.toAsset}`}
                </div>
                <div className="text-sm text-foreground/70">
                  {formatDistance(tx.timestamp, Date.now(), { addSuffix: true })}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold font-mono">
                {tx.type === 'send' && '-'}
                {tx.type === 'receive' && '+'}
                {tx.fromAmount} {tx.fromAsset}
              </div>
              {tx.type === 'swap' && (
                <div className="text-sm text-foreground/70">
                  +{tx.toAmount} {tx.toAsset}
                </div>
              )}
              <div className="text-xs text-foreground/50 mt-1">
                {formatTxHash(tx.txHash)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
