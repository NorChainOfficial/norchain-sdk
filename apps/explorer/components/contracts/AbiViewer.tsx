'use client';

import React, { useState } from 'react';

interface AbiItem {
  type: string;
  name?: string;
  inputs?: Array<{ name: string; type: string; indexed?: boolean }>;
  outputs?: Array<{ name: string; type: string }>;
  stateMutability?: string;
}

interface AbiViewerProps {
  abi: AbiItem[] | string;
  contractAddress: string;
}

export function AbiViewer({ abi, contractAddress }: AbiViewerProps): JSX.Element {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<'all' | 'function' | 'event' | 'constructor' | 'fallback'>('all');

  // Parse ABI if it's a string
  const abiArray: AbiItem[] = typeof abi === 'string' ? JSON.parse(abi) : abi;

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const filteredAbi = abiArray.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'function') return item.type === 'function';
    if (filter === 'event') return item.type === 'event';
    if (filter === 'constructor') return item.type === 'constructor';
    if (filter === 'fallback') return item.type === 'fallback' || item.type === 'receive';
    return true;
  });

  const getTypeColor = (type: string) => {
    const colors = {
      function: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      event: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      constructor: 'bg-green-500/20 text-green-400 border-green-500/30',
      fallback: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      receive: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const formatFunctionSignature = (item: AbiItem): string => {
    if (!item.name) return item.type;
    const inputs = item.inputs?.map((input) => `${input.type} ${input.name || ''}`).join(', ') || '';
    return `${item.name}(${inputs})`;
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Contract ABI</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const json = JSON.stringify(abiArray, null, 2);
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `abi-${contractAddress.substring(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download JSON
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', 'function', 'event', 'constructor', 'fallback'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === filterType
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600 hover:text-white'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            {filterType !== 'all' && (
              <span className="ml-2 text-xs">
                ({abiArray.filter((item) => item.type === filterType).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ABI Items List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredAbi.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>No ABI items found</p>
          </div>
        ) : (
          filteredAbi.map((item, index) => (
            <div
              key={index}
              className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded border ${getTypeColor(item.type)}`}>
                    {item.type}
                  </span>
                  <code className="text-sm text-white font-mono">
                    {formatFunctionSignature(item)}
                  </code>
                  {item.stateMutability && (
                    <span className="text-xs text-gray-500">({item.stateMutability})</span>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedItems.has(index) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedItems.has(index) && (
                <div className="px-4 py-3 bg-slate-950 border-t border-slate-700">
                  {/* Inputs */}
                  {item.inputs && item.inputs.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-semibold text-gray-400 mb-2">Inputs</h5>
                      <div className="space-y-1">
                        {item.inputs.map((input, inputIndex) => (
                          <div key={inputIndex} className="flex items-center gap-2 text-sm">
                            <code className="text-gray-300 font-mono">{input.type}</code>
                            {input.name && <span className="text-gray-500">{input.name}</span>}
                            {input.indexed && (
                              <span className="px-1.5 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">indexed</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Outputs */}
                  {item.outputs && item.outputs.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-400 mb-2">Outputs</h5>
                      <div className="space-y-1">
                        {item.outputs.map((output, outputIndex) => (
                          <div key={outputIndex} className="flex items-center gap-2 text-sm">
                            <code className="text-gray-300 font-mono">{output.type}</code>
                            {output.name && <span className="text-gray-500">{output.name}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* State Mutability */}
                  {item.stateMutability && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <span className="text-xs text-gray-500">State Mutability: </span>
                      <span className="text-xs text-blue-400 font-semibold">{item.stateMutability}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-slate-700 text-sm text-gray-400">
        <p>
          Total: {abiArray.length} item{abiArray.length !== 1 ? 's' : ''} •{' '}
          {abiArray.filter((item) => item.type === 'function').length} function{abiArray.filter((item) => item.type === 'function').length !== 1 ? 's' : ''} •{' '}
          {abiArray.filter((item) => item.type === 'event').length} event{abiArray.filter((item) => item.type === 'event').length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}

