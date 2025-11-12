'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  auth: 'Public' | 'JWT' | 'API Key';
  example?: string;
}

interface ApiSection {
  title: string;
  description: string;
  endpoints: ApiEndpoint[];
}

export default function ApiDocumentationPage(): JSX.Element {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const apiSections: ApiSection[] = [
    {
      title: 'Blocks',
      description: 'Retrieve block information and details',
      endpoints: [
        {
          method: 'GET',
          path: '/blocks',
          description: 'Get paginated list of blocks',
          auth: 'Public',
          example: 'curl https://api.norchain.org/api/v1/blocks?page=1&per_page=20',
        },
        {
          method: 'GET',
          path: '/blocks/:height',
          description: 'Get block by height',
          auth: 'Public',
          example: 'curl https://api.norchain.org/api/v1/blocks/12345',
        },
      ],
    },
    {
      title: 'Transactions',
      description: 'Query transaction data and details',
      endpoints: [
        {
          method: 'GET',
          path: '/transactions',
          description: 'Get paginated list of transactions',
          auth: 'Public',
          example: 'curl https://api.norchain.org/api/v1/transactions?page=1&per_page=20',
        },
        {
          method: 'GET',
          path: '/transactions/:hash',
          description: 'Get transaction by hash',
          auth: 'Public',
          example: 'curl https://api.norchain.org/api/v1/transactions/0x...',
        },
      ],
    },
    {
      title: 'Accounts',
      description: 'Get account information and balances',
      endpoints: [
        {
          method: 'GET',
          path: '/accounts/:address',
          description: 'Get account details',
          auth: 'Public',
          example: 'curl https://api.norchain.org/api/v1/accounts/0x...',
        },
        {
          method: 'GET',
          path: '/accounts/:address/balance',
          description: 'Get account balance',
          auth: 'Public',
          example: 'curl https://api.norchain.org/api/v1/accounts/0x.../balance',
        },
        {
          method: 'GET',
          path: '/accounts/:address/tokens',
          description: 'Get account token holdings',
          auth: 'Public',
          example: 'curl https://api.norchain.org/api/v1/accounts/0x.../tokens',
        },
      ],
    },
    {
      title: 'Contracts',
      description: 'Contract information and verification',
      endpoints: [
        {
          method: 'GET',
          path: '/contracts/:address',
          description: 'Get contract details',
          auth: 'Public',
          example: 'curl https://api.norchain.org/api/v1/contracts/0x...',
        },
        {
          method: 'GET',
          path: '/contracts/:address/abi',
          description: 'Get contract ABI',
          auth: 'Public',
          example: 'curl https://api.norchain.org/api/v1/contracts/0x.../abi',
        },
        {
          method: 'POST',
          path: '/contracts/verifycontract',
          description: 'Verify contract source code',
          auth: 'Public',
          example: 'curl -X POST https://api.norchain.org/api/v1/contracts/verifycontract -H "Content-Type: application/json" -d \'{"address":"0x...","sourceCode":"..."}\'',
        },
      ],
    },
    {
      title: 'Tokens',
      description: 'Token information and transfers',
      endpoints: [
        {
          method: 'GET',
          path: '/tokens/:address',
          description: 'Get token details',
          auth: 'Public',
          example: 'curl https://api.norchain.org/api/v1/tokens/0x...',
        },
        {
          method: 'GET',
          path: '/tokens/:address/holders',
          description: 'Get token holders',
          auth: 'Public',
          example: 'curl https://api.norchain.org/api/v1/tokens/0x.../holders?page=1&per_page=20',
        },
        {
          method: 'GET',
          path: '/tokens/:address/transfers',
          description: 'Get token transfers',
          auth: 'Public',
          example: 'curl https://api.norchain.org/api/v1/tokens/0x.../transfers?page=1&per_page=20',
        },
      ],
    },
    {
      title: 'Analytics',
      description: 'Network analytics and statistics',
      endpoints: [
        {
          method: 'GET',
          path: '/analytics/network',
          description: 'Get network statistics',
          auth: 'Public',
          example: 'curl https://api.norchain.org/api/v1/analytics/network',
        },
        {
          method: 'GET',
          path: '/analytics/realtime',
          description: 'Get real-time network metrics',
          auth: 'Public',
          example: 'curl https://api.norchain.org/api/v1/analytics/realtime',
        },
        {
          method: 'GET',
          path: '/analytics/transactions',
          description: 'Get transaction analytics for an address',
          auth: 'Public',
          example: 'curl https://api.norchain.org/api/v1/analytics/transactions?address=0x...&days=30',
        },
      ],
    },
    {
      title: 'Stats',
      description: 'Network statistics and metrics',
      endpoints: [
        {
          method: 'GET',
          path: '/stats',
          description: 'Get network statistics',
          auth: 'Public',
          example: 'curl https://api.norchain.org/api/v1/stats',
        },
      ],
    },
    {
      title: 'Authentication',
      description: 'API key management and authentication',
      endpoints: [
        {
          method: 'POST',
          path: '/auth/api-keys',
          description: 'Create a new API key',
          auth: 'JWT',
          example: 'curl -X POST https://api.norchain.org/api/v1/auth/api-keys -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d \'{"name":"My API Key"}\'',
        },
        {
          method: 'GET',
          path: '/auth/api-keys',
          description: 'Get all API keys for authenticated user',
          auth: 'JWT',
          example: 'curl https://api.norchain.org/api/v1/auth/api-keys -H "Authorization: Bearer <token>"',
        },
        {
          method: 'DELETE',
          path: '/auth/api-keys/:id',
          description: 'Delete an API key',
          auth: 'JWT',
          example: 'curl -X DELETE https://api.norchain.org/api/v1/auth/api-keys/<id> -H "Authorization: Bearer <token>"',
        },
      ],
    },
  ];

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'POST':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'PUT':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'DELETE':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getAuthBadgeColor = (auth: string) => {
    switch (auth) {
      case 'Public':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'JWT':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'API Key':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.norchain.org/api/v1';

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">API Documentation</h1>
          <p className="text-lg text-gray-400 mb-6">
            Comprehensive API reference for NorChain Explorer. Build powerful applications with our RESTful API.
          </p>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Link
              href={`${baseUrl.replace('/api/v1', '')}/api-docs`}
              target="_blank"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Interactive Swagger UI
            </Link>
            <Link
              href="/api/keys"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Manage API Keys
            </Link>
          </div>

          {/* Base URL */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Base URL</p>
                <code className="text-white font-mono text-lg">{baseUrl}</code>
              </div>
              <button
                onClick={() => copyToClipboard(baseUrl, 'base')}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {copiedEndpoint === 'base' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Authentication Section */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Authentication</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Public Endpoints</h3>
              <p className="text-gray-400">
                Most endpoints are publicly accessible and do not require authentication. Rate limits apply to prevent abuse.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">API Key Authentication</h3>
              <p className="text-gray-400 mb-2">
                For higher rate limits and access to premium features, use an API key:
              </p>
              <code className="block bg-slate-900 rounded-lg p-3 text-gray-300 font-mono text-sm mb-2">
                curl -H "X-API-Key: your-api-key" https://api.norchain.org/api/v1/blocks
              </code>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">JWT Authentication</h3>
              <p className="text-gray-400 mb-2">
                For user-specific endpoints, use JWT Bearer token:
              </p>
              <code className="block bg-slate-900 rounded-lg p-3 text-gray-300 font-mono text-sm">
                curl -H "Authorization: Bearer your-jwt-token" https://api.norchain.org/api/v1/auth/api-keys
              </code>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Rate Limits</h3>
              <ul className="text-yellow-300 space-y-1 text-sm">
                <li>• <strong>Public:</strong> 100 requests per minute</li>
                <li>• <strong>API Key:</strong> 1,000 requests per minute</li>
                <li>• <strong>Premium:</strong> 10,000 requests per minute</li>
              </ul>
              <p className="text-yellow-300/80 text-sm mt-2">
                Rate limit headers are included in all responses: <code className="bg-yellow-900/30 px-1 rounded">X-RateLimit-Limit</code>, <code className="bg-yellow-900/30 px-1 rounded">X-RateLimit-Remaining</code>, <code className="bg-yellow-900/30 px-1 rounded">X-RateLimit-Reset</code>
              </p>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="space-y-6">
          {apiSections.map((section) => (
            <div
              key={section.title}
              className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
            >
              <button
                onClick={() => setActiveSection(activeSection === section.title ? null : section.title)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
              >
                <div className="text-left">
                  <h2 className="text-xl font-bold text-white mb-1">{section.title}</h2>
                  <p className="text-sm text-gray-400">{section.description}</p>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    activeSection === section.title ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeSection === section.title && (
                <div className="border-t border-slate-700 p-6 space-y-4">
                  {section.endpoints.map((endpoint, index) => (
                    <div
                      key={`${endpoint.method}-${endpoint.path}-${index}`}
                      className="bg-slate-900 rounded-lg border border-slate-700 p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-lg border font-semibold text-sm ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                          <code className="text-white font-mono text-sm">{endpoint.path}</code>
                          <span className={`px-2 py-1 rounded border text-xs ${getAuthBadgeColor(endpoint.auth)}`}>
                            {endpoint.auth}
                          </span>
                        </div>
                        {endpoint.example && (
                          <button
                            onClick={() => copyToClipboard(endpoint.example!, `${endpoint.method}-${endpoint.path}`)}
                            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm flex items-center gap-1"
                          >
                            {copiedEndpoint === `${endpoint.method}-${endpoint.path}` ? (
                              <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Copied
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{endpoint.description}</p>
                      {endpoint.example && (
                        <div className="bg-slate-950 rounded-lg p-3 border border-slate-700">
                          <code className="text-gray-300 font-mono text-xs block whitespace-pre-wrap break-all">
                            {endpoint.example}
                          </code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Response Format */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Response Format</h2>
          <p className="text-gray-400 mb-4">
            All API responses follow a consistent format:
          </p>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <code className="text-gray-300 font-mono text-sm block whitespace-pre-wrap">
{`{
  "status": "1",
  "message": "Success",
  "result": {
    // Response data
  },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}`}
            </code>
          </div>
        </div>

        {/* Error Format */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mt-6">
          <h2 className="text-2xl font-bold text-white mb-4">Error Format</h2>
          <p className="text-gray-400 mb-4">
            Error responses follow this format:
          </p>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <code className="text-gray-300 font-mono text-sm block whitespace-pre-wrap">
{`{
  "status": "0",
  "message": "Error message",
  "result": null,
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

