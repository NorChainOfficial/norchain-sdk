'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatTimeAgo, formatAddress, formatNumber, formatHash } from '@/lib/api-client';
import { BlockFilters } from './BlockFilters';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

interface Block {
  height: number;
  hash: string;
  validator: string;
  transactions: number;
  gasUsed: string | number;
  timestamp: number | string;
}

interface BlocksTableProps {
  initialBlocks: Block[];
  stats: {
    blockHeight?: number;
    averageBlockTime?: number;
  };
}

export function BlocksTable({ initialBlocks, stats }: BlocksTableProps): JSX.Element {
  const [blocks] = useState<Block[]>(initialBlocks);
  const [filters, setFilters] = useState<BlockFilters>({});

  // Apply client-side filtering
  const filteredBlocks = useMemo(() => {
    return blocks.filter((block) => {
      // Validator filter
      if (filters.validator) {
        const validatorLower = filters.validator.toLowerCase();
        if (!block.validator.toLowerCase().includes(validatorLower)) {
          return false;
        }
      }

      // Height range filter
      if (filters.minHeight !== undefined && block.height < filters.minHeight) {
        return false;
      }
      if (filters.maxHeight !== undefined && block.height > filters.maxHeight) {
        return false;
      }

      // Transaction count filter
      if (filters.minTxns !== undefined && block.transactions < filters.minTxns) {
        return false;
      }
      if (filters.maxTxns !== undefined && block.transactions > filters.maxTxns) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const blockTimestamp = typeof block.timestamp === 'string' 
          ? new Date(block.timestamp).getTime() 
          : block.timestamp * 1000;
        
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom).getTime();
          if (blockTimestamp < fromDate) {
            return false;
          }
        }
        
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo).getTime() + 86400000; // Add 1 day to include the full day
          if (blockTimestamp > toDate) {
            return false;
          }
        }
      }

      return true;
    });
  }, [blocks, filters]);

  const handleExport = (format: 'csv' | 'json') => {
    const data = filteredBlocks.map((block) => ({
      Height: block.height,
      Hash: block.hash,
      Validator: block.validator,
      Transactions: block.transactions,
      'Gas Used': block.gasUsed,
      Timestamp: typeof block.timestamp === 'string' 
        ? block.timestamp 
        : new Date(block.timestamp * 1000).toISOString(),
    }));

    if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(data[0] || {});
      const csvRows = [
        headers.join(','),
        ...data.map((row) =>
          headers.map((header) => {
            const value = row[header as keyof typeof row];
            return typeof value === 'string' && value.includes(',')
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          }).join(',')
        ),
      ];
      const csv = csvRows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blocks-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Export as JSON
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blocks-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      {/* Filters and Export */}
      <BlockFilters onFilterChange={setFilters} onExport={handleExport} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Total Blocks</div>
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white">#{formatNumber(stats?.blockHeight || 0)}</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Avg Block Time</div>
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.averageBlockTime || 3}s</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Filtered Results</div>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-green-400">
            {filteredBlocks.length} {filteredBlocks.length !== blocks.length && `of ${blocks.length}`}
          </div>
        </div>
      </div>

      {/* Blocks Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-3 md:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Block</th>
                <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hash</th>
                <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Validator</th>
                <th className="px-3 md:px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Txns</th>
                <th className="hidden md:table-cell px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Gas Used</th>
                <th className="px-3 md:px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredBlocks.length > 0 ? filteredBlocks.map((block) => (
                <tr key={block.height} className="hover:bg-slate-700 transition-colors">
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/blocks/${block.height}`}
                      className="text-blue-400 hover:text-blue-300 font-semibold font-mono transition-colors text-sm md:text-base"
                    >
                      #{formatNumber(block.height)}
                    </Link>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/blocks/${block.height}`}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      <code className="text-sm font-mono">{formatHash(block.hash)}</code>
                    </Link>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/accounts/${block.validator}`}
                      className="text-gray-300 hover:text-blue-400 transition-colors"
                    >
                      <code className="text-sm font-mono">{formatAddress(block.validator)}</code>
                    </Link>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-white font-medium text-sm md:text-base">{block.transactions}</span>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-gray-300 text-sm">{formatNumber(parseInt(String(block.gasUsed)))}</span>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-gray-400 text-xs md:text-sm">{formatTimeAgo(typeof block.timestamp === 'string' ? undefined : block.timestamp)}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    {blocks.length === 0 ? 'No blocks found' : 'No blocks match the current filters'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

