'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw, Sparkles } from 'lucide-react';

interface PortfolioOptimizationProps {
  address: string;
}

interface Recommendation {
  action: string;
  reason: string;
  impact: 'high' | 'medium' | 'low';
}

interface OptimizationResult {
  recommendations: Recommendation[];
  currentValue: string;
  optimizedValue: string;
  improvement: string;
}

export function PortfolioOptimization({ address }: PortfolioOptimizationProps) {
  const { data, isLoading, error, refetch } = useQuery<OptimizationResult>({
    queryKey: ['portfolio-optimization', address],
    queryFn: () => apiClient.optimizePortfolio(address),
    enabled: !!address,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Portfolio Optimization
          </h3>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Optimization Failed
            </h3>
          </div>
          <button
            onClick={() => refetch()}
            className="text-sm text-primary hover:underline"
          >
            Retry
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {error instanceof Error ? error.message : 'Failed to optimize portfolio'}
        </p>
      </div>
    );
  }

  if (!data) return null;

  const improvementValue = parseFloat(data.improvement.replace(/[^0-9.-]/g, '')) || 0;
  const isPositive = improvementValue > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Portfolio Optimization
          </h3>
        </div>
        <button
          onClick={() => refetch()}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Refresh optimization"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Value Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Value</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {data.currentValue}
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Optimized Value</div>
          <div className="text-lg font-semibold text-green-400">
            {data.optimizedValue}
          </div>
        </div>
      </div>

      {/* Improvement */}
      <div className={`flex items-center gap-2 mb-6 p-4 rounded-lg ${
        isPositive ? 'bg-green-400/10 border border-green-400/20' : 'bg-gray-100 dark:bg-gray-900'
      }`}>
        {isPositive ? (
          <ArrowUpRight className="w-5 h-5 text-green-400" />
        ) : (
          <ArrowDownRight className="w-5 h-5 text-gray-400" />
        )}
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Potential Improvement</div>
          <div className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-gray-400'}`}>
            {data.improvement}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Recommendations ({data.recommendations.length})
          </h4>
          <div className="space-y-3">
            {data.recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getImpactColor(rec.impact)}`}
              >
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase">
                        {rec.impact} Impact
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{rec.action}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {rec.reason}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recommendations.length === 0 && (
        <div className="flex items-center gap-2 text-green-400">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm">Portfolio is already optimized</span>
        </div>
      )}
    </div>
  );
}

