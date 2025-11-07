'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function FlashCoinsPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'send' | 'claim' | 'history'>('send');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-20 w-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-2xl mb-6">
            <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            Flash Coins
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Time-locked tokens with automatic refund. Send secure payments that automatically return if not claimed within the specified time.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="h-12 w-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center text-white mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Time-Locked</h3>
            <p className="text-gray-600">
              Set expiry time in blocks. Coins automatically return to sender if not claimed before expiry.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Secure Payments</h3>
            <p className="text-gray-600">
              Send payments with confidence. No risk of permanent loss if recipient doesn't claim.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center text-white mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Auto-Refund</h3>
            <p className="text-gray-600">
              Expired flash coins are automatically refunded to the original sender address.
            </p>
          </div>
        </div>

        {/* Main Interface */}
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex items-center space-x-2 mb-6 bg-white rounded-xl p-2 shadow-lg">
            <button
              onClick={() => setActiveTab('send')}
              className={`flex-1 h-12 rounded-lg font-semibold transition-all ${
                activeTab === 'send'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Send Flash Coin
            </button>
            <button
              onClick={() => setActiveTab('claim')}
              className={`flex-1 h-12 rounded-lg font-semibold transition-all ${
                activeTab === 'claim'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Claim Flash Coin
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 h-12 rounded-lg font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              History
            </button>
          </div>

          {/* Send Tab */}
          {activeTab === 'send' && (
            <div className="p-8 bg-white rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Flash Coin</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="w-full h-14 px-6 border-2 border-gray-300 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <div className="flex space-x-4">
                    <input
                      type="number"
                      placeholder="0.00"
                      className="flex-1 h-14 px-6 border-2 border-gray-300 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200"
                    />
                    <select className="h-14 px-6 border-2 border-gray-300 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 bg-white">
                      <option>ETH</option>
                      <option>USDC</option>
                      <option>USDT</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry (blocks)
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    defaultValue="1000"
                    className="w-full h-14 px-6 border-2 border-gray-300 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Approximately 3.5 hours (assuming 12.5s per block)
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-900 mb-1">How it works</h4>
                      <p className="text-sm text-yellow-800">
                        Your flash coin will be sent to the recipient. If they don't claim it within the specified blocks,
                        it will automatically be refunded to your address.
                      </p>
                    </div>
                  </div>
                </div>

                <button className="w-full h-14 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all">
                  Send Flash Coin
                </button>
              </div>
            </div>
          )}

          {/* Claim Tab */}
          {activeTab === 'claim' && (
            <div className="p-8 bg-white rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Claim Flash Coin</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flash Coin ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter flash coin ID..."
                    className="w-full h-14 px-6 border-2 border-gray-300 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 font-mono text-sm"
                  />
                </div>

                <button className="w-full h-14 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all">
                  Claim Flash Coin
                </button>

                <div className="pt-6 border-t-2 border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Claims</h3>
                  <div className="text-center py-12 text-gray-500">
                    No pending flash coins to claim
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="p-8 bg-white rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Flash Coin History</h2>

              <div className="space-y-4">
                <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-400 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-mono text-sm text-gray-600 mb-1">Flash Coin #12345</div>
                      <div className="text-2xl font-bold text-gray-900">1.5 ETH</div>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-800 font-semibold rounded-lg">
                      Claimed
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Recipient</div>
                      <div className="font-mono text-gray-900">0x1234...5678</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Claimed At</div>
                      <div className="font-semibold text-gray-900">Block #123456</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-400 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-mono text-sm text-gray-600 mb-1">Flash Coin #12344</div>
                      <div className="text-2xl font-bold text-gray-900">0.5 ETH</div>
                    </div>
                    <span className="px-4 py-2 bg-red-100 text-red-800 font-semibold rounded-lg">
                      Refunded
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Recipient</div>
                      <div className="font-mono text-gray-900">0xabcd...ef01</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Expired At</div>
                      <div className="font-semibold text-gray-900">Block #123400</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-2 border-orange-300 rounded-xl bg-orange-50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-mono text-sm text-gray-600 mb-1">Flash Coin #12346</div>
                      <div className="text-2xl font-bold text-gray-900">2.0 ETH</div>
                    </div>
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-800 font-semibold rounded-lg animate-pulse">
                      Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Recipient</div>
                      <div className="font-mono text-gray-900">0x9876...5432</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Expires In</div>
                      <div className="font-semibold text-orange-700">~456 blocks (~1.5h)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="p-4 bg-white rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-gray-900">1,234</div>
              <div className="text-sm text-gray-600 mt-1">Total Created</div>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-green-600">890</div>
              <div className="text-sm text-gray-600 mt-1">Claimed</div>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-red-600">234</div>
              <div className="text-sm text-gray-600 mt-1">Refunded</div>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-yellow-600">110</div>
              <div className="text-sm text-gray-600 mt-1">Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
