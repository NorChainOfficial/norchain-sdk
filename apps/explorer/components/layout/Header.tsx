'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdvancedSearch } from '../search/AdvancedSearch';
import { ThemeToggle } from '../theme/ThemeToggle';

export const Header = (): JSX.Element => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-bnb-dark border-b border-gray-200 dark:border-gray-800 shadow-lg backdrop-blur-sm">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all shadow-lg">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                NorChain
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-400 ml-2 font-medium">Explorer</span>
            </div>
          </Link>

          {/* Desktop Navigation - Organized by Functionality */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Explorer Section */}
            <div className="flex items-center gap-1 px-2 border-r border-gray-300 dark:border-gray-700">
              <Link
                href="/blocks"
                className="px-3 py-2 text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-bnb-yellow hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-all font-semibold text-sm"
              >
                Blocks
              </Link>
              <Link
                href="/transactions"
                className="px-3 py-2 text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-bnb-yellow hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-all font-semibold text-sm"
              >
                Transactions
              </Link>
            </div>

            {/* Smart Contracts Section */}
            <div className="flex items-center gap-1 px-2 border-r border-gray-300 dark:border-gray-700">
              <Link
                href="/contracts"
                className="px-3 py-2 text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-bnb-yellow hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-all font-semibold flex items-center gap-1 text-sm"
              >
                <span>📜</span>
                Contracts
              </Link>
              <Link
                href="/tokens"
                className="px-3 py-2 text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-bnb-yellow hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-all font-semibold text-sm"
              >
                Tokens
              </Link>
            </div>

            {/* DeFi Section */}
            <div className="flex items-center gap-1 px-2 border-r border-gray-300 dark:border-gray-700">
              <Link
                href="/dex"
                className="px-3 py-2 text-gray-800 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all font-semibold flex items-center gap-1 text-sm"
              >
                <span>💱</span>
                DEX
              </Link>
              <Link
                href="/staking"
                className="px-3 py-2 text-gray-800 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all font-semibold flex items-center gap-1 text-sm"
              >
                <span>💰</span>
                Staking
              </Link>
            </div>

            {/* Governance & Social Section */}
            <div className="flex items-center gap-1 px-2">
              <Link
                href="/governance"
                className="px-3 py-2 text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all font-semibold flex items-center gap-1 text-sm"
              >
                <span>🗳️</span>
                Governance
              </Link>
              <Link
                href="/crowdfunding"
                className="px-3 py-2 text-gray-800 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all font-semibold flex items-center gap-1 text-sm"
              >
                <span>🚀</span>
                Crowdfunding
              </Link>
              <Link
                href="/charity"
                className="px-3 py-2 text-gray-800 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all font-semibold flex items-center gap-1 text-sm"
              >
                <span>❤️</span>
                Charity
              </Link>
            </div>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-700 dark:text-gray-400 hover:text-blue-600 dark:hover:text-bnb-yellow hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-all"
              aria-label="Toggle search"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-bnb-yellow dark:hover:text-bnb-yellow hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                {isMobileMenuOpen ? (
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar (Expanded) */}
      {isSearchOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 animate-slideIn">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-center">
              <AdvancedSearch />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-slideIn">
          <nav className="px-4 py-4 space-y-1">
            {/* Explorer Section */}
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-2">
              Blockchain Explorer
            </div>
            <Link
              href="/blocks"
              className="block px-4 py-3 text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                </svg>
                Blocks
              </div>
            </Link>

            <Link
              href="/transactions"
              className="block px-4 py-3 text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582z" />
                </svg>
                Transactions
              </div>
            </Link>

            <Link
              href="/contracts"
              className="block px-4 py-3 text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📜</span>
                Contracts
              </div>
            </Link>

            <Link
              href="/tokens"
              className="block px-4 py-3 text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                </svg>
                Tokens
              </div>
            </Link>

            {/* DeFi Section */}
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-2 mt-4">
              DeFi Services
            </div>

            <Link
              href="/dex"
              className="block px-4 py-3 text-gray-800 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">💱</span>
                DEX (Swap Tokens)
              </div>
            </Link>

            <Link
              href="/staking"
              className="block px-4 py-3 text-gray-800 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">💰</span>
                Staking (Earn Rewards)
              </div>
            </Link>

            {/* Governance & Social Section */}
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-2 mt-4">
              Governance & Social Impact
            </div>

            <Link
              href="/governance"
              className="block px-4 py-3 text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🗳️</span>
                Governance (Vote on Proposals)
              </div>
            </Link>

            <Link
              href="/crowdfunding"
              className="block px-4 py-3 text-gray-800 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🚀</span>
                Crowdfunding (Fund Projects)
              </div>
            </Link>

            <Link
              href="/charity"
              className="block px-4 py-3 text-gray-800 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">❤️</span>
                Charity (Make Donations)
              </div>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
