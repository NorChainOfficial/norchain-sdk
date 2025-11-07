"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { LiveCounter } from "@/components/ui/LiveCounter";
import { QuickSearch } from "@/components/search/QuickSearch";
import { NetworkPerformance } from "@/components/dashboard/NetworkPerformance";
import { RealtimeActivityFeed } from "@/components/dashboard/RealtimeActivityFeed";
import { WalletConnector } from "@/components/wallet/WalletConnector";

export default function Home(): JSX.Element {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: () => apiClient.getStats(),
    refetchInterval: 5000,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-bnb-dark-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Title, Search, and Counter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 items-center animate-fadeIn">
          {/* Left Side - Title and Search */}
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="text-gray-900 dark:bg-gradient-bnb dark:bg-clip-text dark:text-transparent">
                Noor Chain
              </span>
            </h1>
            <p className="text-lg text-gray-800 dark:text-gray-300 mb-6 font-medium">
              Real-time Blockchain Explorer & Analytics
            </p>

            {/* Quick Search */}
            <div className="mt-6">
              <QuickSearch />
            </div>
          </div>

          {/* Right Side - Live Block Counter */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative p-8 bg-gradient-to-br from-blue-600 to-purple-600 dark:bg-gradient-bnb rounded-2xl shadow-xl hover:shadow-2xl dark:hover:shadow-bnb-glow-lg transition-all duration-300 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

              <div className="relative text-white dark:text-gray-900">
                <div className="text-sm font-bold opacity-90 mb-3 uppercase tracking-wider">
                  Current Block Height
                </div>
                <div className="mb-4">
                  <LiveCounter
                    value={stats?.latest_block?.height || 0}
                    label=""
                    animate={true}
                  />
                </div>
                <div className="flex items-center justify-center gap-2 text-sm border-t border-white/30 dark:border-gray-800/20 pt-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 dark:bg-bnb-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-300 dark:bg-bnb-green"></span>
                  </span>
                  <span className="opacity-90 font-bold">
                    Live Syncing • ~5s blocks
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Connector - Added for automatic token detection */}
        <div className="mb-8 animate-fadeIn">
          <WalletConnector />
        </div>

        {/* Network Performance Dashboard */}
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: "50ms" }}>
          <NetworkPerformance />
        </div>

        {/* Quick Stats Grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fadeIn"
          style={{ animationDelay: "100ms" }}
        >
          <div className="bg-white dark:bg-gradient-dark rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-bnb-glow transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-bnb-yellow/20 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-bnb-yellow"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Total Blocks
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : (stats?.blocks || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gradient-dark rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-green-glow transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-bnb-green/20 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-bnb-green"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Transactions
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading
                    ? "..."
                    : (stats?.transactions || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gradient-dark rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-bnb-glow transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-bnb-yellow/20 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-bnb-yellow"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Accounts
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : (stats?.accounts || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gradient-dark rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-green-glow transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 dark:bg-bnb-green/20 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600 dark:text-bnb-green"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Validators
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : stats?.validators || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Activity Feed - Full Width */}
        <div
          className="mb-8 animate-fadeIn"
          style={{ animationDelay: "150ms" }}
        >
          <RealtimeActivityFeed />
        </div>

        {/* Network Status */}
        <div
          className="bg-white dark:bg-gradient-dark rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 animate-fadeIn"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-bnb rounded-xl shadow-bnb-glow">
                <svg
                  className="w-8 h-8 text-gray-900"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Network Status
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All systems operational
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-bnb-green/20 border-2 border-green-500 dark:border-bnb-green/30 rounded-lg">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 dark:bg-bnb-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 dark:bg-bnb-green"></span>
              </span>
              <span className="text-green-700 dark:text-bnb-green text-sm font-bold uppercase">
                Healthy
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
