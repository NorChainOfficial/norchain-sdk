'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SupabaseService } from '@/lib/supabase-service';
import { BalanceCard } from './BalanceCard';
import { InteractiveAssetRow } from './InteractiveAssetRow';
import { SkeletonLoader } from './SkeletonLoader';
import { StatsCard } from './StatsCard';
import { useWallet } from '@/hooks/useWallet';
import { useBalance } from '@/hooks/useBalance';
import { WalletService } from '@/lib/wallet-service';
import { getDemoAssets, getDemoBalance, DEMO_ASSETS } from '@/lib/demo-assets';
import { ThemeToggle } from './ThemeToggle';

export const WalletHomeScreen: React.FC = () => {
  const router = useRouter();
  const { wallet } = useWallet();
  const { balance: ethBalance, isLoading: isLoadingBalance } = useBalance();
  const [balance, setBalance] = useState('$0.00');
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseService = SupabaseService.getInstance();
  const walletService = WalletService.getInstance();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      await supabaseService.checkSession();
      setIsAuthenticated(supabaseService.isAuthenticated);
    };
    checkAuth();

    const unsubscribe = supabaseService.onSessionChange((session) => {
      setIsAuthenticated(!!session);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (walletService.isDemoWallet()) {
          setBalance(getDemoBalance());
          setAssets(DEMO_ASSETS.map(asset => ({
            id: asset.id,
            symbol: asset.symbol,
            name: asset.name,
            balance: asset.balance,
            usdValue: asset.usdValue,
            change24h: asset.change24h,
          })));
          setIsLoading(false);
          return;
        }

        if (!isAuthenticated) {
          setIsLoading(false);
          return;
        }
        
        setAssets([]);
        setBalance('$0.00');
      } catch (error) {
        console.error('Failed to load wallet data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, wallet]);

  const handleSignOut = async () => {
    await supabaseService.signOut();
    router.push('/');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  // Calculate stats
  const totalValue = parseFloat(balance.replace(/[^0-9.]/g, '')) || 0;
  const totalAssets = assets.length;
  const totalChange = '+2.45%';

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Dashboard Header */}
      <header className="px-6 pt-6 pb-4 border-b border-border-primary">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-primary mb-1">Nor Wallet</h1>
            <p className="text-sm text-tertiary">Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            {walletService.isDemoWallet() && (
              <span className="px-2.5 py-1 rounded-md text-xs font-medium text-secondary bg-surface-elevated border border-border-primary">
                DEMO
              </span>
            )}
            <ThemeToggle />
            <button
              onClick={handleSettings}
              className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-lg text-sm text-secondary hover:bg-surface-hover transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        {/* Balance Card Section */}
        <div className="mb-8">
          <BalanceCard
            balance={balance}
            isLoading={isLoadingBalance}
            change="+2.45%"
            changePositive={true}
          />
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Total Assets"
            value={totalAssets.toString()}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
          <StatsCard
            title="24h Change"
            value={totalChange}
            change={totalChange}
            changePositive={true}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <StatsCard
            title="Active Chains"
            value="1"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
        </div>

        {/* Assets Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-primary mb-1">Assets</h2>
              <p className="text-sm text-tertiary">
                {assets.length} tokens
              </p>
            </div>
            <button
              onClick={() => router.push('/transactions')}
              className="px-3 py-1.5 rounded-lg text-sm text-secondary hover:bg-surface-hover transition-colors flex items-center gap-2"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonLoader key={i} variant="asset" />
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className="glass-card p-12 rounded-xl text-center">
              <p className="text-secondary mb-4">No assets found</p>
              <button className="px-4 py-2 rounded-lg bg-primary-light text-white font-medium hover:opacity-90 transition-opacity">
                Add Asset
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {assets.map((asset, index) => (
                <InteractiveAssetRow
                  key={asset.id}
                  asset={{
                    id: asset.id,
                    symbol: asset.symbol,
                    name: asset.name,
                    balance: asset.balance,
                    usdValue: asset.usdValue,
                    change24h: asset.change24h,
                    changePositive: asset.change24h?.startsWith('+'),
                    chartData: generateChartData(),
                  }}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Generate sample chart data
function generateChartData(): number[] {
  const data: number[] = [];
  let value = 50;
  for (let i = 0; i < 30; i++) {
    value += (Math.random() - 0.5) * 10;
    value = Math.max(30, Math.min(100, value));
    data.push(value);
  }
  return data;
}
