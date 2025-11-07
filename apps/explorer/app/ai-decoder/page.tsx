'use client';

import React, { useState } from 'react';
import { AITransactionDecoder } from '@/components/ai/AITransactionDecoder';

export default function AIDecoderPage(): JSX.Element {
  const [txHash, setTxHash] = useState('');
  const [selectedHash, setSelectedHash] = useState<string | null>(null);

  const exampleHashes = [
    {
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      label: 'ERC-20 Transfer',
    },
    {
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      label: 'Uniswap Swap',
    },
    {
      hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
      label: 'NFT Mint',
    },
  ];

  const handleDecode = () => {
    if (txHash.trim()) {
      setSelectedHash(txHash.trim());
    }
  };

  const handleExampleClick = (hash: string) => {
    setTxHash(hash);
    setSelectedHash(hash);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
            AI Transaction Decoder
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Decode complex smart contract interactions with cutting-edge AI technology.
            Get human-readable explanations, risk analysis, and detailed parameter breakdowns.
          </p>
        </div>

        {/* Input Section */}
        {!selectedHash && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="p-8 bg-white rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Enter Transaction Hash</h2>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 h-14 px-6 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-200 font-mono text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleDecode();
                    }
                  }}
                />
                <button
                  onClick={handleDecode}
                  disabled={!txHash.trim()}
                  className="h-14 px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Decode with AI
                </button>
              </div>

              {/* Example Transactions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Try Example Transactions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {exampleHashes.map((example) => (
                    <button
                      key={example.hash}
                      onClick={() => handleExampleClick(example.hash)}
                      className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all text-left"
                    >
                      <div className="font-semibold text-purple-700 mb-2">{example.label}</div>
                      <div className="font-mono text-xs text-gray-600 truncate">{example.hash}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="p-6 bg-white rounded-xl shadow-lg">
                <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600">
                  Advanced machine learning models analyze contract interactions and provide detailed explanations
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-lg">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center text-white mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Risk Assessment</h3>
                <p className="text-gray-600">
                  Automatic risk level detection and security warnings for potentially dangerous transactions
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-lg">
                <div className="h-12 w-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-lg flex items-center justify-center text-white mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Parameter Decoding</h3>
                <p className="text-gray-600">
                  Human-readable parameter explanations with type information and decoded values
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Decoder Component */}
        {selectedHash && (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => {
                setSelectedHash(null);
                setTxHash('');
              }}
              className="mb-6 flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-semibold"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Decode Another Transaction</span>
            </button>

            <AITransactionDecoder transactionHash={selectedHash} autoLoad={true} />
          </div>
        )}
      </div>
    </div>
  );
}
