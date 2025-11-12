'use client';

import { useState } from 'react';
import { useAuditContract, useNorAIChat } from '@/hooks/useAI';
import { Shield, AlertTriangle, CheckCircle, Info, Loader2, MessageSquare } from 'lucide-react';

interface TokenSafetyProps {
  contractAddress: string;
  tokenSymbol?: string;
  tokenName?: string;
}

export function TokenSafety({ contractAddress, tokenSymbol, tokenName }: TokenSafetyProps) {
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const audit = useAuditContract(contractAddress);
  const chat = useNorAIChat();

  const handleGetSummary = async () => {
    setLoadingSummary(true);
    try {
      const response = await chat.chatAsync({
        question: `Explain this token in simple terms: ${tokenName || tokenSymbol || contractAddress}. Summarize core risks and usage.`,
        context: {
          pageType: 'token',
          entityId: contractAddress,
        },
      });
      setSummary(response.answer || response.toString());
      setShowSummary(true);
    } catch (error) {
      console.error('Failed to get token summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

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

  return (
    <div className="space-y-4">
      {/* Security Audit */}
      {audit.data && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Token Safety Audit
              </h3>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(audit.data.score)}`}>
              {audit.data.score}/100
            </div>
          </div>

          {/* Audit Summary */}
          <div className="mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {audit.data.audit}
            </p>
          </div>

          {/* Vulnerabilities */}
          {audit.data.vulnerabilities.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Security Issues ({audit.data.vulnerabilities.length})
              </h4>
              <div className="space-y-2">
                {audit.data.vulnerabilities.slice(0, 3).map((vuln, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getSeverityColor(vuln.severity)}`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold uppercase">
                            {vuln.severity}
                          </span>
                        </div>
                        <p className="text-xs">{vuln.description}</p>
                        <p className="text-xs mt-1 opacity-80">{vuln.recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {audit.data.vulnerabilities.length === 0 && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">No security issues detected</span>
            </div>
          )}
        </div>
      )}

      {/* Token Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Token Summary
            </h3>
          </div>
          {!showSummary && (
            <button
              onClick={handleGetSummary}
              disabled={loadingSummary}
              className="text-sm text-primary hover:underline flex items-center gap-2"
            >
              {loadingSummary ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  Get AI Summary
                </>
              )}
            </button>
          )}
        </div>

        {showSummary && summary && (
          <div className="p-4 bg-blue-400/10 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {summary}
            </p>
          </div>
        )}

        {!showSummary && !loadingSummary && (
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Click "Get AI Summary" to get a plain-language explanation of this token, including risks and usage.
          </p>
        )}
      </div>
    </div>
  );
}

