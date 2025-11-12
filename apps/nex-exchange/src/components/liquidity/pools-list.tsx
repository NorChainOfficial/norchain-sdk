"use client";

import { useState } from 'react';
import { Search, TrendingUp, Droplets } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Pool {
  readonly id: string;
  readonly tokenA: string;
  readonly tokenB: string;
  readonly tvl: number;
  readonly volume24h: number;
  readonly apy: number;
  readonly fee: number;
  readonly myLiquidity?: number;
}

interface PoolsListProps {
  readonly onSelectPool?: (pool: Pool) => void;
}

export const PoolsList = ({ onSelectPool }: PoolsListProps): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'tvl' | 'volume' | 'apy'>('tvl');

  // Mock pools data
  const pools: Pool[] = [
    {
      id: '1',
      tokenA: 'NOR',
      tokenB: 'USDT',
      tvl: 5250000,
      volume24h: 850000,
      apy: 12.5,
      fee: 0.3,
      myLiquidity: 1500,
    },
    {
      id: '2',
      tokenA: 'BTCBR',
      tokenB: 'USDT',
      tvl: 3800000,
      volume24h: 620000,
      apy: 15.2,
      fee: 0.3,
    },
    {
      id: '3',
      tokenA: 'DRHT',
      tokenB: 'NOR',
      tvl: 1200000,
      volume24h: 180000,
      apy: 8.7,
      fee: 0.3,
    },
    {
      id: '4',
      tokenA: 'NOR',
      tokenB: 'BTCBR',
      tvl: 2100000,
      volume24h: 310000,
      apy: 10.3,
      fee: 0.3,
      myLiquidity: 750,
    },
    {
      id: '5',
      tokenA: 'DRHT',
      tokenB: 'USDT',
      tvl: 950000,
      volume24h: 95000,
      apy: 6.5,
      fee: 0.3,
    },
  ];

  const filteredPools = pools
    .filter(pool => {
      const query = searchQuery.toLowerCase();
      return (
        pool.tokenA.toLowerCase().includes(query) ||
        pool.tokenB.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'tvl':
          return b.tvl - a.tvl;
        case 'volume':
          return b.volume24h - a.volume24h;
        case 'apy':
          return b.apy - a.apy;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
          <Input
            type="text"
            placeholder="Search pools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-foreground/70">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'tvl' | 'volume' | 'apy')}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="tvl">TVL</option>
            <option value="volume">Volume</option>
            <option value="apy">APY</option>
          </select>
        </div>
      </div>

      {/* Pools Table */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-background/50 border-b border-border text-sm font-semibold text-foreground/70">
          <div className="col-span-3">Pool</div>
          <div className="col-span-2 text-right">TVL</div>
          <div className="col-span-2 text-right">Volume (24h)</div>
          <div className="col-span-2 text-right">APY</div>
          <div className="col-span-2 text-right">My Liquidity</div>
          <div className="col-span-1"></div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {filteredPools.map((pool) => (
            <div
              key={pool.id}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-background/50 transition-colors cursor-pointer"
              onClick={() => onSelectPool?.(pool)}
            >
              {/* Pool Name */}
              <div className="col-span-3 flex items-center space-x-3">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white border-2 border-background">
                    {pool.tokenA.slice(0, 2)}
                  </div>
                  <div className="h-8 w-8 rounded-full bg-success flex items-center justify-center text-xs font-bold text-white border-2 border-background">
                    {pool.tokenB.slice(0, 2)}
                  </div>
                </div>
                <div>
                  <div className="font-semibold">
                    {pool.tokenA}/{pool.tokenB}
                  </div>
                  <div className="text-xs text-foreground/70">{pool.fee}% fee</div>
                </div>
              </div>

              {/* TVL */}
              <div className="col-span-2 flex items-center justify-end">
                <div className="text-right">
                  <div className="font-semibold">
                    ${(pool.tvl / 1000000).toFixed(2)}M
                  </div>
                </div>
              </div>

              {/* Volume */}
              <div className="col-span-2 flex items-center justify-end">
                <div className="text-right">
                  <div className="font-mono">
                    ${(pool.volume24h / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>

              {/* APY */}
              <div className="col-span-2 flex items-center justify-end">
                <div className="flex items-center space-x-1 text-success font-semibold">
                  <TrendingUp className="h-4 w-4" />
                  <span>{pool.apy.toFixed(2)}%</span>
                </div>
              </div>

              {/* My Liquidity */}
              <div className="col-span-2 flex items-center justify-end">
                {pool.myLiquidity ? (
                  <div className="text-right">
                    <div className="font-semibold">
                      ${pool.myLiquidity.toLocaleString()}
                    </div>
                    <div className="text-xs text-foreground/70">
                      {((pool.myLiquidity / pool.tvl) * 100).toFixed(3)}% share
                    </div>
                  </div>
                ) : (
                  <span className="text-foreground/50 text-sm">—</span>
                )}
              </div>

              {/* Action */}
              <div className="col-span-1 flex items-center justify-end">
                <button className="h-8 px-3 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-1">
                  <Droplets className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="text-sm text-foreground/70 mb-1">Total Pools</div>
          <div className="text-2xl font-bold">{pools.length}</div>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="text-sm text-foreground/70 mb-1">Total TVL</div>
          <div className="text-2xl font-bold">
            ${(pools.reduce((sum, p) => sum + p.tvl, 0) / 1000000).toFixed(2)}M
          </div>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="text-sm text-foreground/70 mb-1">24h Volume</div>
          <div className="text-2xl font-bold">
            ${(pools.reduce((sum, p) => sum + p.volume24h, 0) / 1000000).toFixed(2)}M
          </div>
        </div>
      </div>
    </div>
  );
};
