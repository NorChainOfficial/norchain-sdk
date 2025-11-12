'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AlertTriangle, TrendingUp, Clock, Loader2, RefreshCw } from 'lucide-react';

interface AnomalyDetectionProps {
  address: string;
  days?: number;
}

interface Anomaly {
  type: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
}

interface AnomalyResult {
  anomalies: Anomaly[];
  riskScore: number;
  summary: string;
}

export function AnomalyDetection({ address, days = 7 }: AnomalyDetectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<AnomalyResult>({
    queryKey: ['anomaly-detection', address, days],
    queryFn: () => apiClient.detectAnomalies(address, days),
    enabled: !!address,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Anomaly Detection
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
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Detection Failed
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
          {error instanceof Error ? error.message : 'Failed to detect anomalies'}
        </p>
      </div>
    );
  }

  if (!data) return null;

  const highSeverityCount = data.anomalies.filter(a => a.severity === 'high').length;
  const mediumSeverityCount = data.anomalies.filter(a => a.severity === 'medium').length;
  const lowSeverityCount = data.anomalies.filter(a => a.severity === 'low').length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Anomaly Detection ({days}d)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${getRiskColor(data.riskScore)}`}>
            {data.riskScore}/100
          </span>
          <button
            onClick={() => refetch()}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Refresh detection"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {data.summary}
          </p>
        </div>
      )}

      {/* Anomaly Counts */}
      {data.anomalies.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {highSeverityCount > 0 && (
            <div className="text-center p-2 bg-red-400/10 rounded">
              <div className="text-red-400 font-bold">{highSeverityCount}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">High</div>
            </div>
          )}
          {mediumSeverityCount > 0 && (
            <div className="text-center p-2 bg-yellow-400/10 rounded">
              <div className="text-yellow-400 font-bold">{mediumSeverityCount}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Medium</div>
            </div>
          )}
          {lowSeverityCount > 0 && (
            <div className="text-center p-2 bg-blue-400/10 rounded">
              <div className="text-blue-400 font-bold">{lowSeverityCount}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Low</div>
            </div>
          )}
        </div>
      )}

      {/* Anomalies List */}
      {data.anomalies.length > 0 && (
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary mb-2"
          >
            {isExpanded ? 'Hide' : 'Show'} {data.anomalies.length} Anomal{data.anomalies.length !== 1 ? 'ies' : 'y'} ↓
          </button>

          {isExpanded && (
            <div className="space-y-3">
              {data.anomalies.map((anomaly, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold uppercase">
                          {anomaly.severity}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {new Date(anomaly.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-sm font-medium mb-1">{anomaly.type}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {anomaly.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {data.anomalies.length === 0 && (
        <div className="flex items-center gap-2 text-green-400">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm">No anomalies detected in the last {days} days</span>
        </div>
      )}
    </div>
  );
}

