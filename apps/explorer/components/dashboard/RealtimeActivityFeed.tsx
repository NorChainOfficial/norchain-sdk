'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Block, Transaction } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { truncateHash, formatXAHEEN } from '@/lib/utils';

type ActivityType = 'block' | 'transaction' | 'flashcoin' | 'mixer';

interface ActivityItem {
  type: ActivityType;
  id: string | number;
  title: string;
  subtitle: string;
  timestamp: string;
  link: string;
  amount?: string;
}

export const RealtimeActivityFeed = (): JSX.Element => {
  const { data: blocks } = useQuery({
    queryKey: ['activity-blocks'],
    queryFn: () => apiClient.getBlocks({ page: 1, per_page: 8 }),
    refetchInterval: 5000,
  });

  const { data: transactions } = useQuery({
    queryKey: ['activity-transactions'],
    queryFn: () => apiClient.getTransactions({ page: 1, per_page: 8 }),
    refetchInterval: 5000,
  });

  // Mock FlashCoin and Mixer activities for demonstration
  const mockFlashCoins: ActivityItem[] = [
    {
      type: 'flashcoin',
      id: 'flash-1',
      title: '⚡ FlashCoin Created',
      subtitle: '1000 XAHEEN • 1 hour duration',
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      link: '/flashcoins',
      amount: '1000'
    },
    {
      type: 'flashcoin',
      id: 'flash-2',
      title: '⚡ FlashCoin Burned',
      subtitle: '5000 XAHEEN • Auto-expired',
      timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
      link: '/flashcoins',
      amount: '5000'
    },
  ];

  const mockMixer: ActivityItem[] = [
    {
      type: 'mixer',
      id: 'mix-1',
      title: '🎭 Mix Started',
      subtitle: '2500 XAHEEN • 3 outputs',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      link: '/mixer',
      amount: '2500'
    },
  ];

  const activityItems: ActivityItem[] = [
    ...(blocks?.data || []).map((block: Block) => ({
      type: 'block' as const,
      id: block.height || block.id || `block-${Date.now()}-${Math.random()}`,
      title: `Block #${block.height}`,
      subtitle: `${block.transaction_count} transactions`,
      timestamp: block.timestamp,
      link: `/blocks/${block.height}`,
    })),
    ...(transactions?.data || []).map((tx: Transaction) => ({
      type: 'transaction' as const,
      id: tx.hash || `tx-${Date.now()}-${Math.random()}`,
      title: `Transaction ${truncateHash(tx.hash, 10)}`,
      subtitle: `Block #${tx.block_height}`,
      timestamp: tx.timestamp || new Date().toISOString(),
      link: `/transactions/${tx.hash}`,
    })),
    ...mockFlashCoins,
    ...mockMixer,
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'block':
        return (
          <div className="p-3 bg-gradient-to-br from-bnb-yellow to-bitcoin-gold rounded-xl shadow-bnb-glow">
            <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
        );
      case 'transaction':
        return (
          <div className="p-3 bg-gradient-to-br from-bnb-green to-emerald-600 rounded-xl shadow-green-glow">
            <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'flashcoin':
        return (
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg shadow-purple-500/50">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'mixer':
        return (
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-xl shadow-lg shadow-indigo-500/50">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gradient-dark rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-700 p-8 hover:shadow-2xl dark:hover:shadow-bnb-glow transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 dark:bg-gradient-bnb rounded-xl shadow-lg dark:shadow-bnb-glow animate-pulse-slow">
            <svg className="w-7 h-7 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">🌊 Live Activity Feed</h3>
            <p className="text-gray-600 dark:text-gray-400 text-base">Blocks • Transactions • FlashCoins • Mixer</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-bnb-yellow/30 rounded-xl">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 dark:bg-bnb-yellow opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600 dark:bg-bnb-yellow"></span>
          </span>
          <span className="text-blue-600 dark:text-bnb-yellow text-sm font-bold">LIVE</span>
        </div>
      </div>

      {/* Activity Grid - 3 columns on large screens, 2 on medium, 1 on small */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {activityItems.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-600 dark:text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-lg font-medium">No recent activity</p>
          </div>
        ) : (
          activityItems.map((item, index) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.link}
              className="group flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-bnb-yellow/50 hover:shadow-xl dark:hover:shadow-bnb-glow transition-all duration-200 animate-slideIn"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Icon */}
              {getActivityIcon(item.type)}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-gray-900 dark:text-white font-bold text-base mb-1 group-hover:text-blue-600 dark:group-hover:text-bnb-yellow transition-colors">
                  {item.title}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  {item.subtitle}
                </div>
                <div className="text-gray-500 dark:text-gray-500 text-xs">
                  {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                </div>
              </div>

              {/* Arrow */}
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-600 group-hover:text-blue-600 dark:group-hover:text-bnb-yellow group-hover:translate-x-1 transition-all flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          ))
        )}
      </div>

      {/* Activity Type Legend */}
      <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-bnb-yellow to-bitcoin-gold rounded-lg shadow-sm">
              <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Blocks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-bnb-green to-emerald-600 rounded-lg shadow-sm">
              <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Transactions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-sm">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">FlashCoins</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-lg shadow-sm">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mixer</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Showing last 20 network events • Auto-refreshing every 5 seconds</span>
          <Link href="/blocks" className="flex items-center gap-2 text-blue-600 dark:text-bnb-yellow hover:text-blue-700 dark:hover:text-bnb-green font-bold transition-colors">
            View All Activity
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};
