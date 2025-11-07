'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { getApiClient, type AIDecodeResult } from '@/lib/api-client-v2';

interface AITransactionDecoderProps {
  readonly transactionHash: string;
  readonly autoLoad?: boolean;
}

export const AITransactionDecoder = ({
  transactionHash,
  autoLoad = false,
}: AITransactionDecoderProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIDecodeResult | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const api = getApiClient();

  const decodeTransaction = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const decoded = await api.decodeWithAI(transactionHash);
      setResult(decoded);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decode transaction');
    } finally {
      setLoading(false);
    }
  }, [transactionHash, api]);

  useEffect(() => {
    if (autoLoad) {
      decodeTransaction();
    }
  }, [autoLoad, decodeTransaction]);

  const toggleParameter = useCallback((paramName: string) => {
    setExpanded(prev => ({
      ...prev,
      [paramName]: !prev[paramName],
    }));
  }, []);

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!autoLoad && !result) {
    return (
      <div className="max-w-4xl p-8 bg-white rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Transaction Decoder</h2>
            <p className="text-gray-600 mt-2">
              Decode complex smart contract interactions with AI-powered analysis
            </p>
          </div>
          <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>

        <button
          onClick={decodeTransaction}
          disabled={loading}
          className="h-14 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          aria-label="Decode transaction with AI"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Decoding with AI...
            </span>
          ) : (
            'Decode Transaction'
          )}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg" role="alert">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl p-8 bg-white rounded-xl shadow-lg">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-16 w-16 mx-auto text-purple-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="mt-4 text-xl font-semibold text-gray-900">Analyzing with AI...</p>
            <p className="mt-2 text-gray-600">Decoding smart contract interaction</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl p-8 bg-white rounded-xl shadow-lg">
        <div className="p-6 bg-red-50 border-2 border-red-300 rounded-lg" role="alert">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-red-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-red-800">Decoding Failed</h3>
              <p className="mt-2 text-red-700">{error}</p>
              <button
                onClick={decodeTransaction}
                className="mt-4 h-12 px-6 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors shadow-md"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return <div className="p-4 text-gray-400 text-center">No AI decode result available</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="p-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-xl text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">AI Transaction Analysis</h2>
            <p className="text-purple-100 text-lg">{result.description}</p>
          </div>
          <div className="ml-6 text-right">
            <div className="text-sm text-purple-200 mb-1">Confidence</div>
            <div className={`text-4xl font-bold ${result.confidence >= 90 ? 'text-white' : result.confidence >= 70 ? 'text-yellow-200' : 'text-red-200'}`}>
              {result.confidence}%
            </div>
          </div>
        </div>

        {result.contract_name && (
          <div className="mt-6 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-purple-200">Contract:</span>
              <span className="font-semibold">{result.contract_name}</span>
            </div>
            {result.contract_type && (
              <div className="flex items-center space-x-2">
                <span className="text-purple-200">Type:</span>
                <span className="px-3 py-1 bg-white bg-opacity-20 rounded-lg font-medium">
                  {result.contract_type}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Risk Level & Warnings */}
      {(result.risk_level || result.warnings) && (
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <div className="flex items-start space-x-4">
            {result.risk_level && (
              <div className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 ${getRiskColor(result.risk_level)}`}>
                <div className="text-sm font-medium uppercase">Risk Level</div>
                <div className="text-xl font-bold capitalize mt-1">{result.risk_level}</div>
              </div>
            )}

            {result.warnings && result.warnings.length > 0 && (
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Warnings
                </h3>
                <ul className="space-y-2">
                  {result.warnings.map((warning, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      <span className="text-gray-700">{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Method Information */}
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Method Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Method Name</div>
            <div className="font-mono text-lg font-semibold text-purple-600">{result.method}</div>
          </div>
          {result.method_signature && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Method Signature</div>
              <div className="font-mono text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded-lg break-all">
                {result.method_signature}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Parameters */}
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Parameters</h3>

        {Object.keys(result.parameters).length === 0 ? (
          <p className="text-gray-600">No parameters for this transaction</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(result.parameters).map(([name, param]) => (
              <div key={name} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleParameter(name)}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-semibold text-gray-900">{param.name || name}</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded font-medium">
                        {param.type}
                      </span>
                    </div>
                    {param.description && (
                      <p className="text-sm text-gray-600 mt-1">{param.description}</p>
                    )}
                  </div>
                  <svg
                    className={`h-5 w-5 text-gray-600 transition-transform ${expanded[name] ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expanded[name] && (
                  <div className="p-4 bg-white border-t-2 border-gray-200">
                    <div className="mb-2 text-sm text-gray-600">Raw Value:</div>
                    <div className="font-mono text-sm bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
                      {typeof param.value === 'object'
                        ? JSON.stringify(param.value, null, 2)
                        : String(param.value)
                      }
                    </div>
                    {param.decoded_value && (
                      <>
                        <div className="mt-4 mb-2 text-sm text-gray-600">Decoded Value:</div>
                        <div className="font-mono text-sm bg-blue-50 text-blue-900 p-3 rounded-lg">
                          {param.decoded_value}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Hash */}
      <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
        <div className="text-sm text-gray-600 mb-1">Transaction Hash</div>
        <div className="font-mono text-sm text-gray-900 break-all">{result.hash}</div>
      </div>
    </div>
  );
};
