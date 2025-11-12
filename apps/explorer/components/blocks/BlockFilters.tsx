'use client';

import React, { useState } from 'react';

interface BlockFiltersProps {
  onFilterChange: (filters: BlockFilters) => void;
  onExport: (format: 'csv' | 'json') => void;
}

export interface BlockFilters {
  validator?: string;
  minHeight?: number;
  maxHeight?: number;
  minTxns?: number;
  maxTxns?: number;
  dateFrom?: string;
  dateTo?: string;
}

export function BlockFilters({ onFilterChange, onExport }: BlockFiltersProps): JSX.Element {
  const [filters, setFilters] = useState<BlockFilters>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof BlockFilters, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: BlockFilters = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters & Export
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {Object.values(filters).filter((v) => v !== undefined && v !== '').length}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onExport('csv')}
            className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => onExport('json')}
            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Export JSON
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-700">
          {/* Validator Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Validator Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={filters.validator || ''}
              onChange={(e) => handleFilterChange('validator', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm font-mono"
            />
          </div>

          {/* Block Height Range */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Min Height</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minHeight || ''}
              onChange={(e) => handleFilterChange('minHeight', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Max Height</label>
            <input
              type="number"
              placeholder="∞"
              value={filters.maxHeight || ''}
              onChange={(e) => handleFilterChange('maxHeight', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
            />
          </div>

          {/* Transaction Count Range */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Min Transactions</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minTxns || ''}
              onChange={(e) => handleFilterChange('minTxns', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Max Transactions</label>
            <input
              type="number"
              placeholder="∞"
              value={filters.maxTxns || ''}
              onChange={(e) => handleFilterChange('maxTxns', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">From Date</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">To Date</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

