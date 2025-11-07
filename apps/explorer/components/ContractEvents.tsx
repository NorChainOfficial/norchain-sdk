'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { apiClient } from '@/lib/api-client';
import { ContractEvent, AbiEvent } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';

interface ContractEventsProps {
  readonly contractAddress: string;
  readonly abi: any[];
}

interface FilterState {
  eventName: string;
  fromBlock: string;
  toBlock: string;
}

export const ContractEvents = ({ contractAddress, abi }: ContractEventsProps): JSX.Element => {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    eventName: '',
    fromBlock: '',
    toBlock: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());

  // Extract event names from ABI
  const eventNames = abi
    .filter((item) => item.type === 'event')
    .map((item) => item.name);

  const fetchEvents = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { page, per_page: 20 };
      if (filters.eventName) params.event_name = filters.eventName;
      if (filters.fromBlock) params.from_block = parseInt(filters.fromBlock);
      if (filters.toBlock) params.to_block = parseInt(filters.toBlock);

      const response = await apiClient.getContractEvents(contractAddress, params);

      if (response.success) {
        setEvents(response.data);
        setTotalPages(response.meta?.last_page || 1);
        setCurrentPage(page);
      } else {
        setError(response.message || 'Failed to load events');
      }
    } catch (err) {
      setError('Failed to load contract events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [contractAddress, filters]);

  useEffect(() => {
    fetchEvents(1);
  }, [fetchEvents]);

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    fetchEvents(1);
  };

  const clearFilters = () => {
    setFilters({
      eventName: '',
      fromBlock: '',
      toBlock: '',
    });
    setTimeout(() => fetchEvents(1), 0);
  };

  const toggleEventExpansion = (eventId: number) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const formatParameterValue = (value: any, type: string): string => {
    if (value === null || value === undefined) return 'null';

    if (typeof value === 'boolean') return value ? 'true' : 'false';

    if (type === 'address' && typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value)) {
      return JSON.stringify(value, null, 2);
    }

    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  };

  const truncateHash = (hash: string): string => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  if (loading && events.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Contract Events</h2>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Contract Events</h2>
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
          <p className="text-red-400">{error}</p>
          <Button onClick={() => fetchEvents(1)} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header and Filters */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Contract Events</h2>
            <p className="text-gray-400">
              {events.length > 0 ? `Showing ${events.length} events` : 'No events found'}
            </p>
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? 'primary' : 'secondary'}
          >
            {showFilters ? '✕ Close Filters' : '⚙ Filters'}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border-t border-gray-700 pt-4 mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Event Name Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Event Name
                </label>
                <select
                  value={filters.eventName}
                  onChange={(e) => handleFilterChange('eventName', e.target.value)}
                  className="w-full h-12 px-4 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Events</option>
                  {eventNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* From Block */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  From Block
                </label>
                <input
                  type="number"
                  value={filters.fromBlock}
                  onChange={(e) => handleFilterChange('fromBlock', e.target.value)}
                  placeholder="e.g., 1000"
                  className="w-full h-12 px-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* To Block */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  To Block
                </label>
                <input
                  type="number"
                  value={filters.toBlock}
                  onChange={(e) => handleFilterChange('toBlock', e.target.value)}
                  placeholder="e.g., 2000"
                  className="w-full h-12 px-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center gap-3">
              <Button onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button onClick={clearFilters} variant="secondary">
                Clear All
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Events List */}
      {events.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-white mb-2">No Events Found</h3>
            <p className="text-gray-400 mb-6">
              This contract hasn't emitted any events yet, or they don't match your filter criteria.
            </p>
            {(filters.eventName || filters.fromBlock || filters.toBlock) && (
              <Button onClick={clearFilters} variant="secondary">
                Clear Filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* Event Cards */}
          <div className="space-y-3">
            {events.map((event) => {
              const isExpanded = expandedEvents.has(event.id);

              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Event Header */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="info" className="text-sm">
                            Event
                          </Badge>
                          <h3 className="text-lg font-bold text-white font-mono truncate">
                            {event.event_name || 'Unknown Event'}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Transaction:</span>
                            <a
                              href={`/transactions/${event.transaction_hash}`}
                              className="text-blue-400 hover:text-blue-300 font-mono truncate"
                            >
                              {truncateHash(event.transaction_hash)}
                            </a>
                            <CopyButton value={event.transaction_hash} />
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Block:</span>
                            <a
                              href={`/blocks/${event.block_height}`}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              {event.block_height.toLocaleString()}
                            </a>
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-gray-400">
                          {formatTimeAgo(event.timestamp)}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleEventExpansion(event.id)}
                        className="flex-shrink-0 px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        {isExpanded ? '▼ Hide Details' : '▶ View Details'}
                      </button>
                    </div>
                  </div>

                  {/* Event Details (Expanded) */}
                  {isExpanded && (
                    <div className="p-4 space-y-4 bg-gray-800/50">
                      {/* Topics */}
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Topics</h4>
                        <div className="space-y-2">
                          {event.topics.map((topic, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-3 bg-gray-900 rounded-lg"
                            >
                              <span className="text-gray-400 text-sm flex-shrink-0">
                                [{index}]
                              </span>
                              <code className="text-sm text-green-400 font-mono break-all flex-1">
                                {topic}
                              </code>
                              <CopyButton value={topic} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Decoded Parameters */}
                      {event.decoded_params && event.decoded_params.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">
                            Decoded Parameters
                          </h4>
                          <div className="space-y-2">
                            {event.decoded_params.map((param, index) => (
                              <div
                                key={index}
                                className="p-4 bg-gray-900 rounded-lg border border-gray-700"
                              >
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-blue-400 font-mono text-sm">
                                      {param.name || `param${index}`}
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                      {param.type}
                                    </Badge>
                                    {param.indexed && (
                                      <Badge variant="warning" className="text-xs">
                                        indexed
                                      </Badge>
                                    )}
                                  </div>
                                  <CopyButton
                                    value={formatParameterValue(param.value, param.type)}
                                  />
                                </div>
                                <div className="mt-2">
                                  <pre className="text-sm text-white font-mono whitespace-pre-wrap break-all bg-black/30 p-3 rounded">
                                    {formatParameterValue(param.value, param.type)}
                                  </pre>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Raw Data */}
                      {event.data && (
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Raw Data</h4>
                          <div className="p-3 bg-gray-900 rounded-lg">
                            <code className="text-sm text-gray-400 font-mono break-all">
                              {event.data}
                            </code>
                          </div>
                        </div>
                      )}

                      {/* Event Signature */}
                      {event.event_signature && (
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">
                            Event Signature
                          </h4>
                          <div className="flex items-center gap-2 p-3 bg-gray-900 rounded-lg">
                            <code className="text-sm text-purple-400 font-mono break-all flex-1">
                              {event.event_signature}
                            </code>
                            <CopyButton value={event.event_signature} />
                          </div>
                        </div>
                      )}

                      {/* Log Index */}
                      <div className="text-sm text-gray-400">
                        Log Index: {event.log_index}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => fetchEvents(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    variant="secondary"
                  >
                    ← Previous
                  </Button>
                  <Button
                    onClick={() => fetchEvents(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    variant="secondary"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Loading Overlay */}
      {loading && events.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="text-white">Loading events...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
