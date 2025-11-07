'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Block } from '@/types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { CopyButton } from '../ui/CopyButton';
import { truncateHash } from '@/lib/utils';

export const RecentBlocksFeed = (): JSX.Element => {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-blocks'],
    queryFn: () => apiClient.getBlocks({ page: 1, per_page: 10 }),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const blocks = data?.data || [];

  return (
    <div className="space-y-3">
      {blocks.length === 0 ? (
        <div className="p-8 text-center text-gray-600 dark:text-gray-400">
          No blocks found
        </div>
      ) : (
        blocks.map((block: Block, index: number) => (
          <div
            key={block.id}
            className="group p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all duration-300 animate-fadeIn"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Link
                    href={`/blocks/${block.height}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-sm group-hover:scale-110 transition-transform">
                      #
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {block.height.toLocaleString()}
                    </span>
                  </Link>

                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDistanceToNow(new Date(block.timestamp), { addSuffix: true })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Hash:</span>
                  <code className="font-mono text-gray-800 dark:text-gray-300">
                    {truncateHash(block.hash, 12)}
                  </code>
                  <CopyButton value={block.hash} />
                </div>

                {block.transaction_count > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    {block.transaction_count} {block.transaction_count === 1 ? 'transaction' : 'transactions'}
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="inline-flex items-center justify-center px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Confirmed
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
