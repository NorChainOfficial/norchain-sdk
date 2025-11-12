'use client';

import { useState } from 'react';
import { useTransactionAI } from '@/hooks/useAI';
import { Zap, AlertTriangle, CheckCircle, TrendingUp, Info, Loader2 } from 'lucide-react';
import { CopyButton } from '@/components/ui/CopyButton';

interface TransactionAIProps {
  txHash: string;
  fromAddress?: string;
  gasUsed?: string;
  gasPrice?: string;
}

export function TransactionAI({ txHash, fromAddress, gasUsed, gasPrice }: TransactionAIProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { analysis, fromAnomalies, gasPrediction, isLoading } = useTransactionAI(txHash, fromAddress);

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (score >= 40) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-green-400 bg-green-400/10 border-green-400/20';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Transaction Analysis
          </h3>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI Analysis Card */}
      {analysis.data && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Transaction Analysis
              </h3>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(analysis.data.riskScore)}`}>
              {getRiskLabel(analysis.data.riskScore)}
            </div>
          </div>

          {/* Plain Language Summary */}
          <div className="mb-4">
            <div className="flex items-start gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Summary</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-6">
              {analysis.data.analysis}
            </p>
          </div>

          {/* Insights */}
          {analysis.data.insights && analysis.data.insights.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Insights</span>
              </div>
              <ul className="space-y-1 pl-6">
                {analysis.data.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {analysis.data.recommendations && analysis.data.recommendations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recommendations</span>
              </div>
              <ul className="space-y-1 pl-6">
                {analysis.data.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Anomaly Detection Banner */}
      {fromAnomalies.data && fromAnomalies.data.anomalies.length > 0 && (
        <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-400 mb-1">
                Unusual Activity Detected
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {fromAnomalies.data.summary}
              </p>
              {fromAnomalies.data.anomalies.length > 0 && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-yellow-400 hover:underline mt-2"
                >
                  {showDetails ? 'Hide' : 'Show'} {fromAnomalies.data.anomalies.length} detail{fromAnomalies.data.anomalies.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gas Analysis */}
      {gasPrediction.data && gasUsed && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gas Analysis</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Predicted: {gasPrediction.data.predictedGasPrice} Gwei
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {gasPrediction.data.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}

