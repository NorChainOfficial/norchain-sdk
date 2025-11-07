'use client';

/**
 * Wallet Portfolio Tracker
 * Multi-wallet balance aggregation with charts and analytics
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface WalletData {
  readonly address: string;
  readonly name?: string;
  readonly balance: string;
  readonly balanceUsd: number;
  readonly tokens: TokenBalance[];
  readonly transactions24h: number;
}

export interface TokenBalance {
  readonly symbol: string;
  readonly balance: string;
  readonly balanceUsd: number;
  readonly change24h: number;
}

export const WalletPortfolioTracker = (): JSX.Element => {
  const [wallets, setWallets] = useState<WalletData[]>([
    {
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      name: 'Main Wallet',
      balance: '1250.5',
      balanceUsd: 1563.13,
      tokens: [
        { symbol: 'BTCBR', balance: '1000', balanceUsd: 1250, change24h: 12.5 },
        { symbol: 'WBTCBR', balance: '250', balanceUsd: 312.5, change24h: 12.5 },
      ],
      transactions24h: 15,
    },
    {
      address: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      name: 'Trading Wallet',
      balance: '850.3',
      balanceUsd: 1062.88,
      tokens: [
        { symbol: 'BTCBR', balance: '850', balanceUsd: 1062.5, change24h: 12.5 },
      ],
      transactions24h: 42,
    },
  ]);

  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [showAddWallet, setShowAddWallet] = useState(false);

  // Calculate total portfolio value
  const totalPortfolioValue = useMemo(
    () => wallets.reduce((sum, wallet) => sum + wallet.balanceUsd, 0),
    [wallets]
  );

  // Calculate total 24h change
  const total24hChange = useMemo(() => {
    const allTokens = wallets.flatMap(w => w.tokens);
    const avgChange = allTokens.reduce((sum, t) => sum + t.change24h, 0) / allTokens.length;
    return avgChange;
  }, [wallets]);

  const handleAddWallet = () => {
    if (!newWalletAddress || !/^0x[0-9a-fA-F]{40}$/.test(newWalletAddress)) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    // Mock adding wallet
    const newWallet: WalletData = {
      address: newWalletAddress,
      name: `Wallet ${wallets.length + 1}`,
      balance: '0',
      balanceUsd: 0,
      tokens: [],
      transactions24h: 0,
    };

    setWallets([...wallets, newWallet]);
    setNewWalletAddress('');
    setShowAddWallet(false);
  };

  const handleRemoveWallet = (address: string) => {
    setWallets(wallets.filter(w => w.address !== address));
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatNumber = (value: number): string => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-bnb-yellow/20 dark:to-bnb-yellow/5 rounded-2xl shadow-xl border border-blue-500 dark:border-bnb-yellow/30 p-8 text-white dark:text-gray-100 overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-pattern"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-blue-100 dark:text-gray-400 text-sm font-medium mb-2">Total Portfolio Value</p>
              <div className="flex items-baseline gap-4">
                <h2 className="text-5xl font-bold">${formatNumber(totalPortfolioValue)}</h2>
                <span className={`text-2xl font-semibold ${
                  total24hChange >= 0 ? 'text-green-300' : 'text-red-300'
                }`}>
                  {total24hChange >= 0 ? '+' : ''}{total24hChange.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Add Wallet Button */}
            <button
              onClick={() => setShowAddWallet(!showAddWallet)}
              className="h-12 px-6 bg-white/20 hover:bg-white/30 dark:bg-bnb-yellow/20 dark:hover:bg-bnb-yellow/30 backdrop-blur-sm border-2 border-white/50 dark:border-bnb-yellow/50 rounded-xl transition-all shadow-lg flex items-center gap-2 font-medium"
              aria-label="Add wallet"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Wallet
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-blue-100 dark:text-gray-400 text-sm mb-1">Total Wallets</p>
              <p className="text-2xl font-bold">{wallets.length}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-blue-100 dark:text-gray-400 text-sm mb-1">24h Transactions</p>
              <p className="text-2xl font-bold">
                {wallets.reduce((sum, w) => sum + w.transactions24h, 0)}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-blue-100 dark:text-gray-400 text-sm mb-1">Avg Wallet Value</p>
              <p className="text-2xl font-bold">
                ${formatNumber(totalPortfolioValue / wallets.length)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Wallet Form */}
      {showAddWallet && (
        <div className="bg-white dark:bg-gradient-dark rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 animate-slideDown">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Wallet</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="wallet-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wallet Address
              </label>
              <input
                id="wallet-address"
                type="text"
                value={newWalletAddress}
                onChange={(e) => setNewWalletAddress(e.target.value)}
                placeholder="0x..."
                className="h-14 w-full px-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-bnb-yellow focus:ring-2 focus:ring-blue-200 dark:focus:ring-bnb-yellow/20 text-gray-900 dark:text-white transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddWallet}
                className="flex-1 h-12 px-6 bg-blue-600 dark:bg-bnb-yellow text-white dark:text-gray-900 rounded-lg hover:bg-blue-700 dark:hover:bg-bnb-yellow/90 transition-colors font-medium shadow-md"
              >
                Add Wallet
              </button>
              <button
                onClick={() => {
                  setShowAddWallet(false);
                  setNewWalletAddress('');
                }}
                className="h-12 px-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallets List */}
      <div className="space-y-4">
        {wallets.map((wallet, index) => (
          <div
            key={wallet.address}
            className="bg-white dark:bg-gradient-dark rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 overflow-hidden relative hover:shadow-2xl transition-shadow animate-slideUp"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Wallet Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Wallet Icon */}
                <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-bnb-yellow dark:to-bnb-yellow/60 rounded-full flex items-center justify-center text-white dark:text-gray-900 font-bold text-xl shadow-lg">
                  {wallet.name ? wallet.name.charAt(0) : 'W'}
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {wallet.name || 'Unnamed Wallet'}
                  </h4>
                  <div className="flex items-center gap-2">
                    <code className="text-gray-600 dark:text-gray-400 text-sm font-mono">
                      {formatAddress(wallet.address)}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(wallet.address)}
                      className="text-blue-600 dark:text-bnb-yellow hover:text-blue-700 dark:hover:text-bnb-yellow/80 transition-colors"
                      aria-label="Copy address"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveWallet(wallet.address)}
                className="h-10 px-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
                aria-label="Remove wallet"
              >
                Remove
              </button>
            </div>

            {/* Wallet Balance */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Balance</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${formatNumber(wallet.balanceUsd)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">24h Txns</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {wallet.transactions24h}
                  </p>
                </div>
              </div>
            </div>

            {/* Token Balances */}
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Token Balances</h5>

              {wallet.tokens.map(token => (
                <div
                  key={token.symbol}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-bnb-yellow dark:to-bnb-yellow/60 rounded-full flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">
                      {token.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{token.symbol}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{token.balance}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      ${formatNumber(token.balanceUsd)}
                    </p>
                    <p className={`text-sm font-semibold ${
                      token.change24h >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}

              {wallet.tokens.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No tokens found
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {wallets.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">No wallets added yet</p>
          <button
            onClick={() => setShowAddWallet(true)}
            className="h-12 px-6 bg-blue-600 dark:bg-bnb-yellow text-white dark:text-gray-900 rounded-lg hover:bg-blue-700 dark:hover:bg-bnb-yellow/90 transition-colors font-medium shadow-lg"
          >
            Add Your First Wallet
          </button>
        </div>
      )}
    </div>
  );
};
