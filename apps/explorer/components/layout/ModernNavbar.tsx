'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';

export const ModernNavbar = (): JSX.Element => {
  const pathname = usePathname();
  const { address, isConnected, connect, disconnect, chainId } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(38)}`;

  const NOR_CHAIN_ID = 65001;
  const isCorrectChain = chainId === NOR_CHAIN_ID;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-lg">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all">
              <span className="text-xl font-bold text-white">N</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-white">NorChain Explorer</span>
              <p className="text-xs text-slate-400">نور - Intelligent Blockchain</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg font-medium transition-all ${
                isActive('/')
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Home
            </Link>

            <Link
              href="/blocks"
              className={`px-3 py-2 rounded-lg font-medium transition-all ${
                isActive('/blocks')
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Blocks
            </Link>

            <Link
              href="/transactions"
              className={`px-3 py-2 rounded-lg font-medium transition-all ${
                isActive('/transactions')
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Transactions
            </Link>

            <Link
              href="/accounts"
              className={`px-3 py-2 rounded-lg font-medium transition-all ${
                isActive('/accounts')
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Accounts
            </Link>

            <Link
              href="/tokens"
              className={`px-3 py-2 rounded-lg font-medium transition-all ${
                isActive('/tokens')
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Tokens
            </Link>

            <Link
              href="/contracts"
              className={`px-3 py-2 rounded-lg font-medium transition-all ${
                isActive('/contracts')
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Contracts
            </Link>

            <Link
              href="/validators"
              className={`px-3 py-2 rounded-lg font-medium transition-all ${
                isActive('/validators')
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Validators
            </Link>

            <Link
              href="/analytics"
              className={`px-3 py-2 rounded-lg font-medium transition-all ${
                isActive('/analytics')
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Analytics
            </Link>

            <Link
              href="/api"
              className={`px-3 py-2 rounded-lg font-medium transition-all ${
                isActive('/api')
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              API
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <div className="hidden md:flex items-center space-x-2">
                {!isCorrectChain && (
                  <div className="px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 text-xs font-semibold flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Wrong Network
                  </div>
                )}
                <div className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg shadow-md">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-mono text-sm font-semibold">{formatAddress(address!)}</span>
                  </div>
                </div>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all border border-slate-700"
                  aria-label="Disconnect wallet"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="hidden md:block btn-primary"
                aria-label="Connect wallet"
              >
                Connect Wallet
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 border-t border-slate-800">
            <Link
              href="/"
              className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/blocks"
              className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/blocks') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Blocks
            </Link>
            <Link
              href="/transactions"
              className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/transactions') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Transactions
            </Link>
            <Link
              href="/accounts"
              className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/accounts') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Accounts
            </Link>
            <Link
              href="/tokens"
              className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/tokens') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Tokens
            </Link>
            <Link
              href="/contracts"
              className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/contracts') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contracts
            </Link>
            <Link
              href="/validators"
              className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/validators') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Validators
            </Link>
            <Link
              href="/analytics"
              className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/analytics') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Analytics
            </Link>
            <Link
              href="/api"
              className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/api') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              API
            </Link>

            {/* Mobile Wallet Connection */}
            <div className="pt-4 px-2 border-t border-slate-800">
              {isConnected ? (
                <div className="space-y-2">
                  {!isCorrectChain && (
                    <div className="px-3 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Wrong Network - Switch to NorChain
                    </div>
                  )}
                  <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white font-mono text-sm font-semibold">{formatAddress(address!)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      disconnect();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    connect();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full btn-primary"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
