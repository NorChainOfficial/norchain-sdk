"use client";

import { useState } from 'react';
import { TrendingUp, Minus, Plus, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Position {
  readonly id: string;
  readonly tokenA: string;
  readonly tokenB: string;
  readonly amountA: number;
  readonly amountB: number;
  readonly value: number;
  readonly share: number;
  readonly earned: number;
  readonly apy: number;
}

interface MyPositionsProps {
  readonly positions?: Position[];
}

export const MyPositions = ({ positions }: MyPositionsProps): JSX.Element => {
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);

  // Mock positions data
  const mockPositions: Position[] = positions || [
    {
      id: '1',
      tokenA: 'NOR',
      tokenB: 'USDT',
      amountA: 250000,
      amountB: 1537.5,
      value: 3075,
      share: 0.059,
      earned: 125.5,
      apy: 12.5,
    },
    {
      id: '2',
      tokenA: 'NOR',
      tokenB: 'BTCBR',
      amountA: 125000,
      amountB: 2.05,
      value: 1640,
      share: 0.078,
      earned: 68.2,
      apy: 10.3,
    },
  ];

  const displayPositions = positions || mockPositions;
  const totalValue = displayPositions.reduce((sum, p) => sum + p.value, 0);
  const totalEarned = displayPositions.reduce((sum, p) => sum + p.earned, 0);

  if (displayPositions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-background border border-border flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-foreground/30" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">No liquidity positions yet</h3>
        <p className="text-foreground/70 mb-6">
          Add liquidity to pools to start earning trading fees
        </p>
        <Button>Explore Pools</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="text-sm text-foreground/70 mb-1">Total Liquidity</div>
          <div className="text-2xl font-bold">
            ${totalValue.toLocaleString()}
          </div>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="text-sm text-foreground/70 mb-1">Total Earned</div>
          <div className="text-2xl font-bold text-success">
            ${totalEarned.toFixed(2)}
          </div>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="text-sm text-foreground/70 mb-1">Active Positions</div>
          <div className="text-2xl font-bold">{displayPositions.length}</div>
        </div>
      </div>

      {/* Positions List */}
      <div className="space-y-3">
        {displayPositions.map((position) => {
          const isExpanded = expandedPosition === position.id;

          return (
            <div
              key={position.id}
              className="bg-background border border-border rounded-lg overflow-hidden"
            >
              {/* Position Header */}
              <div
                className="p-4 cursor-pointer hover:bg-background/50 transition-colors"
                onClick={() =>
                  setExpandedPosition(isExpanded ? null : position.id)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white border-2 border-background">
                        {position.tokenA.slice(0, 2)}
                      </div>
                      <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center text-sm font-bold text-white border-2 border-background">
                        {position.tokenB.slice(0, 2)}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-lg">
                        {position.tokenA}/{position.tokenB}
                      </div>
                      <div className="text-sm text-foreground/70">
                        {position.share.toFixed(3)}% of pool
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      ${position.value.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-end space-x-1 text-sm text-success">
                      <TrendingUp className="h-4 w-4" />
                      <span>{position.apy.toFixed(2)}% APY</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Position Details (Expanded) */}
              {isExpanded && (
                <div className="border-t border-border p-4 bg-background/50 space-y-4">
                  {/* Token Amounts */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background border border-border rounded-lg p-3">
                      <div className="text-sm text-foreground/70 mb-1">
                        Pooled {position.tokenA}
                      </div>
                      <div className="text-lg font-mono font-semibold">
                        {position.amountA.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-background border border-border rounded-lg p-3">
                      <div className="text-sm text-foreground/70 mb-1">
                        Pooled {position.tokenB}
                      </div>
                      <div className="text-lg font-mono font-semibold">
                        {position.amountB.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Earnings */}
                  <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-foreground/70 mb-1">
                          Earned Fees
                        </div>
                        <div className="text-xl font-bold text-success">
                          ${position.earned.toFixed(2)}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90"
                      >
                        Claim
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <Button className="flex-1 bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Liquidity
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-error text-error hover:bg-error/10"
                    >
                      <Minus className="h-4 w-4 mr-2" />
                      Remove Liquidity
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
