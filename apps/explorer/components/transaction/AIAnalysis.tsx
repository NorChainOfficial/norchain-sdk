/**
 * AI Transaction Analysis Component
 *
 * Displays AI-powered transaction insights including:
 * - Human-readable transaction description
 * - Security analysis with risk assessment
 * - Gas optimization recommendations
 * - Similar transaction detection
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Transaction } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import {
  TransactionAnalysisResult,
  AIAnalysisError,
  isAIAnalysisError,
  SecurityFlag,
  OptimizationSuggestion,
} from '@/lib/ai/types';

interface AIAnalysisProps {
  readonly transaction: Transaction;
}

export const AIAnalysis = ({ transaction }: AIAnalysisProps): JSX.Element => {
  const [analysis, setAnalysis] = useState<TransactionAnalysisResult | null>(null);
  const [error, setError] = useState<AIAnalysisError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  /**
   * Fetch AI analysis using Unified API
   */
  const fetchAnalysis = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Use Unified API endpoint
      const data = await apiClient.analyzeTransaction(transaction.hash);
      
      // Transform Unified API response to match existing component structure
      setAnalysis({
        description: data.analysis || 'Transaction analysis completed',
        riskScore: data.riskScore || 0,
        insights: data.insights || [],
        recommendations: data.recommendations || [],
        securityFlags: [],
        optimizations: [],
        similarTransactions: [],
        metadata: {
          confidence: 0.85,
          model: 'unified-api',
          timestamp: Date.now(),
        },
      });
    } catch (err) {
      console.error('Failed to fetch AI analysis:', err);
      setError({
        error: 'Network error',
        code: 'API_ERROR',
        message: err instanceof Error ? err.message : 'Failed to connect to AI service',
      });
    } finally {
      setIsLoading(false);
    }
  }, [transaction]);

  /**
   * Auto-fetch on mount
   */
  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gradient-dark rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 dark:border-bnb-yellow border-t-transparent"></div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Analyzing Transaction with AI...
          </h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="bg-white dark:bg-gradient-dark rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Analysis Failed</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
        {error.code === 'RATE_LIMIT' && error.retryAfter && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Please try again in {error.retryAfter} seconds
          </p>
        )}
        <button
          onClick={fetchAnalysis}
          className="h-12 px-6 bg-blue-600 dark:bg-bnb-yellow text-white dark:text-black font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-yellow-400 transition-colors shadow-md"
          aria-label="Retry analysis"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  /**
   * Render no data state
   */
  if (!analysis) {
    return (
      <div className="bg-white dark:bg-gradient-dark rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-600 dark:text-gray-400">No AI analysis available</p>
      </div>
    );
  }

  /**
   * Get risk level color
   */
  const getRiskLevelColor = (level: string): string => {
    switch (level) {
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-500';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500';
      case 'high':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 border-orange-500';
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-500';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30 border-gray-500';
    }
  };

  /**
   * Get flag icon
   */
  const getFlagIcon = (type: string): JSX.Element => {
    switch (type) {
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'danger':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gradient-dark rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-bnb-yellow dark:to-yellow-500 p-6">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white dark:text-black">AI Transaction Insights</h3>
            <p className="text-blue-100 dark:text-black/70 text-sm">
              Powered by Claude AI • Confidence: {analysis.confidence}%
            </p>
          </div>
          {analysis.metadata.cacheHit && (
            <span className="px-3 py-1 bg-white/20 dark:bg-black/20 text-white dark:text-black text-xs font-medium rounded-lg">
              Cached
            </span>
          )}
        </div>
      </div>

      {/* Main Description */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Description</h4>
        <p className="text-lg text-gray-900 dark:text-white leading-relaxed">
          {analysis.humanReadableDescription}
        </p>
      </div>

      {/* Security Analysis */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Security Analysis</h4>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border-2 ${getRiskLevelColor(analysis.securityAnalysis.riskLevel)}`}>
            {analysis.securityAnalysis.isSafe ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="font-semibold capitalize">{analysis.securityAnalysis.riskLevel} Risk</span>
            <span className="text-sm">({analysis.securityAnalysis.score}/100)</span>
          </div>
        </div>

        {/* Security Flags */}
        {analysis.securityAnalysis.flags.length > 0 && (
          <div className="space-y-3 mb-4">
            {analysis.securityAnalysis.flags.map((flag: SecurityFlag, index: number) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className={`mt-0.5 ${flag.type === 'danger' ? 'text-red-600' : flag.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`}>
                  {getFlagIcon(flag.type)}
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">{flag.title}</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{flag.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {analysis.securityAnalysis.recommendations.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Recommendations</h5>
            <ul className="space-y-1">
              {analysis.securityAnalysis.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Gas Optimization */}
      {analysis.gasOptimization.canOptimize && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Gas Optimization</h4>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analysis.gasOptimization.potentialSavings}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Potential Savings</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {analysis.gasOptimization.currentGasUsed.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Gas Used</p>
            </div>
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {analysis.gasOptimization.estimatedOptimizedGas.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Optimized Gas</p>
            </div>
          </div>

          {/* Optimization Suggestions */}
          {analysis.gasOptimization.suggestions.length > 0 && (
            <div className="space-y-3">
              {analysis.gasOptimization.suggestions.map((suggestion: OptimizationSuggestion, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-green-900 dark:text-green-100">{suggestion.title}</h5>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        suggestion.impact === 'high'
                          ? 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100'
                          : suggestion.impact === 'medium'
                          ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}>
                        {suggestion.impact} impact
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-bold">
                        -{suggestion.estimatedSavings}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">{suggestion.description}</p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Difficulty: <span className="font-medium capitalize">{suggestion.difficulty}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Decoded Function (if available) */}
      {analysis.decodedFunction && showDetails && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Decoded Function</h4>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Function</p>
              <code className="text-sm font-mono text-gray-900 dark:text-white">{analysis.decodedFunction.name}</code>
            </div>
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Signature</p>
              <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                {analysis.decodedFunction.signature}
              </code>
            </div>
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.decodedFunction.description}</p>
            </div>
            {analysis.decodedFunction.parameters.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Parameters</p>
                <div className="space-y-2">
                  {analysis.decodedFunction.parameters.map((param, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className="font-mono text-gray-600 dark:text-gray-400">{param.name}:</span>
                      <span className="font-mono text-gray-900 dark:text-white flex-1 break-all">
                        {param.decodedValue || param.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Analysis completed in {analysis.metadata.analysisTimeMs}ms</p>
            <p className="text-xs">Model: {analysis.metadata.aiModel}</p>
          </div>
          {analysis.decodedFunction && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="h-12 px-6 bg-blue-600 dark:bg-bnb-yellow text-white dark:text-black font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-yellow-400 transition-colors shadow-md"
              aria-label="Toggle details"
            >
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
