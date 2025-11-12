'use client';

import { useState } from 'react';
import { useAddressAI } from '@/hooks/useAI';
import { TrendingUp, Shield, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';

interface AddressAIProps {
  address: string;
}

export function AddressAI({ address }: AddressAIProps) {
  const [showPortfolio, setShowPortfolio] = useState(false);
  const { anomalies, portfolio, isLoading } = useAddressAI(address);

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskBg = (score: number) => {
    if (score >= 70) return 'bg-red-400/10 border-red-400/20';
    if (score >= 40) return 'bg-yellow-400/10 border-yellow-400/20';
    return 'bg-green-400/10 border-green-400/20';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Risk Score Card */}
      {anomalies.data && (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border p-6 ${getRiskBg(anomalies.data.riskScore)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Address Risk Score
              </h3>
            </div>
            <div className={`text-3xl font-bold ${getRiskColor(anomalies.data.riskScore)}`}>
              {anomalies.data.riskScore}/100
            </div>
          </div>

          {/* Risk Meter */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  anomalies.data.riskScore >= 70
                    ? 'bg-red-400'
                    : anomalies.data.riskScore >= 40
                    ? 'bg-yellow-400'
                    : 'bg-green-400'
                }`}
                style={{ width: `${anomalies.data.riskScore}%` }}
              />
            </div>
          </div>

          {/* Summary */}
          {anomalies.data.summary && (
            <div className="mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {anomalies.data.summary}
              </p>
            </div>
          )}

          {/* Anomaly Count */}
          {anomalies.data.anomalies.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {anomalies.data.anomalies.length} anomaly{anomalies.data.anomalies.length !== 1 ? 'ies' : 'y'} detected in last 30 days
              </span>
            </div>
          )}

          {anomalies.data.anomalies.length === 0 && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-600 dark:text-gray-400">
                No anomalies detected in last 30 days
              </span>
            </div>
          )}
        </div>
      )}

      {/* Portfolio Optimization */}
      {portfolio.data && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Portfolio Optimization
              </h3>
            </div>
            <button
              onClick={() => setShowPortfolio(!showPortfolio)}
              className="text-sm text-primary hover:underline"
            >
              {showPortfolio ? 'Hide' : 'Show'} Recommendations
            </button>
          </div>

          {/* Value Comparison */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {portfolio.data.currentValue}
              </div>
            </div>
            <div className="p-3 bg-green-400/10 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Optimized</div>
              <div className="text-lg font-semibold text-green-400">
                {portfolio.data.optimizedValue}
              </div>
            </div>
          </div>

          {/* Improvement */}
          <div className="mb-4 p-3 bg-blue-400/10 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">
                Potential Improvement: {portfolio.data.improvement}
              </span>
            </div>
          </div>

          {/* Recommendations */}
          {showPortfolio && portfolio.data.recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Recommendations ({portfolio.data.recommendations.length})
              </h4>
              {portfolio.data.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    rec.impact === 'high'
                      ? 'bg-green-400/10 border-green-400/20'
                      : rec.impact === 'medium'
                      ? 'bg-yellow-400/10 border-yellow-400/20'
                      : 'bg-blue-400/10 border-blue-400/20'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-semibold uppercase text-gray-500">
                      {rec.impact} Impact
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {rec.action}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {rec.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

