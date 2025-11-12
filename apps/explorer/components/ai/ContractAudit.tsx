'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Shield, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';

interface ContractAuditProps {
  contractAddress: string;
}

interface Vulnerability {
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

interface AuditResult {
  audit: string;
  vulnerabilities: Vulnerability[];
  score: number;
}

export function ContractAudit({ contractAddress }: ContractAuditProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<AuditResult>({
    queryKey: ['contract-audit', contractAddress],
    queryFn: () => apiClient.auditContract(contractAddress),
    enabled: !!contractAddress,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'high':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Contract Audit
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
              Audit Failed
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
          {error instanceof Error ? error.message : 'Failed to audit contract'}
        </p>
      </div>
    );
  }

  if (!data) return null;

  const criticalCount = data.vulnerabilities.filter(v => v.severity === 'critical').length;
  const highCount = data.vulnerabilities.filter(v => v.severity === 'high').length;
  const mediumCount = data.vulnerabilities.filter(v => v.severity === 'medium').length;
  const lowCount = data.vulnerabilities.filter(v => v.severity === 'low').length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Security Audit
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
            {data.score}/100
          </span>
          <button
            onClick={() => refetch()}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Refresh audit"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {criticalCount > 0 && (
          <div className="text-center p-2 bg-red-400/10 rounded">
            <div className="text-red-400 font-bold">{criticalCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Critical</div>
          </div>
        )}
        {highCount > 0 && (
          <div className="text-center p-2 bg-orange-400/10 rounded">
            <div className="text-orange-400 font-bold">{highCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">High</div>
          </div>
        )}
        {mediumCount > 0 && (
          <div className="text-center p-2 bg-yellow-400/10 rounded">
            <div className="text-yellow-400 font-bold">{mediumCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Medium</div>
          </div>
        )}
        {lowCount > 0 && (
          <div className="text-center p-2 bg-blue-400/10 rounded">
            <div className="text-blue-400 font-bold">{lowCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Low</div>
          </div>
        )}
      </div>

      {/* Audit Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {data.audit}
        </p>
      </div>

      {/* Vulnerabilities */}
      {data.vulnerabilities.length > 0 && (
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary mb-2"
          >
            {isExpanded ? 'Hide' : 'Show'} {data.vulnerabilities.length} Issue{data.vulnerabilities.length !== 1 ? 's' : ''} ↓
          </button>

          {isExpanded && (
            <div className="space-y-3">
              {data.vulnerabilities.map((vuln, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getSeverityColor(vuln.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase">
                          {vuln.severity}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{vuln.description}</p>
                      <div className="flex items-start gap-2 mt-2 pt-2 border-t border-current/20">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p className="text-xs">{vuln.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {data.vulnerabilities.length === 0 && (
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">No vulnerabilities detected</span>
        </div>
      )}
    </div>
  );
}

