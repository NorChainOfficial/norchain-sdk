'use client';

import { useState } from 'react';
import { formatXAHEEN } from '@/lib/utils';

interface OutputAddress {
  readonly id: string;
  readonly address: string;
  readonly percentage: number;
}

interface MixTransaction {
  readonly id: string;
  readonly amount: string;
  readonly status: 'pending' | 'mixing' | 'completed' | 'failed';
  readonly progress: number;
  readonly createdAt: string;
  readonly completedAt?: string;
  readonly depositAddress: string;
  readonly withdrawAddresses: string[];
  readonly delayHours: number;
}

type DelayOption = {
  readonly label: string;
  readonly hours: number;
  readonly description: string;
};

const DELAY_OPTIONS: DelayOption[] = [
  { label: 'No Delay', hours: 0, description: 'Mix and withdraw immediately' },
  { label: '15 Minutes', hours: 0.25, description: 'Quick privacy boost' },
  { label: '1 Hour', hours: 1, description: 'Standard privacy' },
  { label: '6 Hours', hours: 6, description: 'Enhanced privacy' },
  { label: '24 Hours', hours: 24, description: 'Maximum privacy' },
];

export default function MixerPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'mix' | 'active' | 'history'>('mix');
  const [amount, setAmount] = useState('');
  const [outputAddresses, setOutputAddresses] = useState<OutputAddress[]>([
    { id: '1', address: '', percentage: 100 }
  ]);
  const [selectedDelay, setSelectedDelay] = useState<number>(0);
  const [mixTransactions] = useState<MixTransaction[]>([
    {
      id: '1',
      amount: '500000000000000000000000000',
      status: 'mixing',
      progress: 65,
      createdAt: new Date().toISOString(),
      depositAddress: 'btcbr1deposit123456789',
      withdrawAddresses: ['btcbr1withdraw987654321'],
      delayHours: 1,
    },
  ]);

  const handleStartMix = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with blockchain API
    console.log('Starting mix:', {
      amount,
      outputAddresses: outputAddresses.map(o => ({ address: o.address, percentage: o.percentage })),
      delayHours: selectedDelay
    });
  };

  const addOutputAddress = () => {
    if (outputAddresses.length < 5) {
      setOutputAddresses([
        ...outputAddresses,
        { id: Date.now().toString(), address: '', percentage: 0 }
      ]);
    }
  };

  const removeOutputAddress = (id: string) => {
    if (outputAddresses.length > 1) {
      setOutputAddresses(outputAddresses.filter(addr => addr.id !== id));
    }
  };

  const updateOutputAddress = (id: string, field: 'address' | 'percentage', value: string | number) => {
    setOutputAddresses(outputAddresses.map(addr =>
      addr.id === id ? { ...addr, [field]: value } : addr
    ));
  };

  const distributeEvenly = () => {
    const percentage = Math.floor(100 / outputAddresses.length);
    const remainder = 100 - (percentage * outputAddresses.length);
    setOutputAddresses(outputAddresses.map((addr, idx) => ({
      ...addr,
      percentage: idx === 0 ? percentage + remainder : percentage
    })));
  };

  const totalPercentage = outputAddresses.reduce((sum, addr) => sum + (addr.percentage || 0), 0);
  const isPercentageValid = totalPercentage === 100;

  const getStatusColor = (status: MixTransaction['status']): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'mixing':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Enhanced */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 mb-4">
            🎭 XAHEEN Mixer
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-medium max-w-3xl mx-auto">
            Enhance your transaction privacy by mixing your XAHEEN tokens
          </p>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
            Break on-chain links • No logs kept • Maximum privacy
          </p>
        </div>

        {/* Privacy Warning */}
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-6 mb-6 border-2 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">How the Mixer Works</h3>
              <p className="text-sm text-indigo-800 dark:text-indigo-200 mb-2">
                The mixer enhances privacy by breaking the on-chain link between your deposit and withdrawal addresses through a
                series of transactions with other users' funds.
              </p>
              <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1 list-disc list-inside">
                <li>Minimum mix amount: 10 XAHEEN</li>
                <li>Mixing fee: 0.5% + network fees</li>
                <li>Average mixing time: 30-60 minutes</li>
                <li>No logs kept after completion</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {(['mix', 'active', 'history'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab === 'mix' ? 'New Mix' : tab === 'active' ? 'Active Sessions' : 'History'}
                  {tab === 'active' && mixTransactions.filter(m => m.status === 'mixing' || m.status === 'pending').length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                      {mixTransactions.filter(m => m.status === 'mixing' || m.status === 'pending').length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Mix Tab */}
            {activeTab === 'mix' && (
              <div>
                <form onSubmit={handleStartMix} className="space-y-8">
                  {/* Amount Input - Enhanced */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border-2 border-indigo-200 dark:border-indigo-800">
                    <label htmlFor="amount" className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                      💰 Amount to Mix
                    </label>
                    <div className="relative">
                      <input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.000001"
                        min="10"
                        required
                        className="w-full px-6 py-5 text-2xl font-bold bg-white dark:bg-gray-800 border-3 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-900/30 transition-all"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-500 dark:text-gray-400">
                        XAHEEN
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Minimum:</span> 10 XAHEEN
                      </p>
                      {amount && parseFloat(amount) >= 10 && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Valid Amount
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Privacy Delay Selection - Enhanced */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <label className="block text-lg font-bold text-gray-900 dark:text-white">
                          🕐 Privacy Delay
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Add time delay to enhance privacy and avoid timing analysis
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {DELAY_OPTIONS.map((option) => (
                        <button
                          key={option.hours}
                          type="button"
                          onClick={() => setSelectedDelay(option.hours)}
                          className={`p-5 rounded-xl border-3 transition-all transform hover:scale-105 ${
                            selectedDelay === option.hours
                              ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 shadow-lg'
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700'
                          }`}
                        >
                          <div className="text-base font-bold mb-1">{option.label}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Output Addresses - Enhanced */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582z" />
                            <path d="M11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582-.155.103-.346.196-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <label className="block text-lg font-bold text-gray-900 dark:text-white">
                            💸 Withdrawal Addresses
                          </label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {outputAddresses.length}/5 addresses • Split your mix for better privacy
                          </p>
                        </div>
                      </div>
                      {outputAddresses.length > 1 && (
                        <button
                          type="button"
                          onClick={distributeEvenly}
                          className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 rounded-lg text-sm font-semibold transition-colors"
                        >
                          ⚖️ Distribute Evenly
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {outputAddresses.map((output, index) => (
                        <div key={output.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                          <div className="flex gap-3 items-start">
                            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                  Address
                                </label>
                                <input
                                  type="text"
                                  value={output.address}
                                  onChange={(e) => updateOutputAddress(output.id, 'address', e.target.value)}
                                  placeholder="btcbr1..."
                                  required
                                  className="w-full px-4 py-3 text-base bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/30"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                  Percentage
                                </label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="range"
                                    value={output.percentage}
                                    onChange={(e) => updateOutputAddress(output.id, 'percentage', parseInt(e.target.value) || 0)}
                                    min="0"
                                    max="100"
                                    className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                  />
                                  <input
                                    type="number"
                                    value={output.percentage}
                                    onChange={(e) => updateOutputAddress(output.id, 'percentage', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                    max="100"
                                    required
                                    className="w-20 px-3 py-2 text-lg font-bold bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-center focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/30"
                                  />
                                  <span className="text-lg font-bold text-gray-600 dark:text-gray-400">%</span>
                                </div>
                              </div>
                            </div>
                            {outputAddresses.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeOutputAddress(output.id)}
                                className="flex-shrink-0 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                aria-label="Remove address"
                              >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Percentage Validation */}
                    <div className={`mt-4 p-4 rounded-xl border-2 ${
                      isPercentageValid
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
                    }`}>
                      <div className="flex items-center gap-3">
                        {isPercentageValid ? (
                          <>
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="font-bold text-green-900 dark:text-green-100">Perfect! Total: 100%</p>
                              <p className="text-sm text-green-700 dark:text-green-300">All addresses are properly configured</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="font-bold text-red-900 dark:text-red-100">Total must equal 100%</p>
                              <p className="text-sm text-red-700 dark:text-red-300">Currently: {totalPercentage}% • {totalPercentage < 100 ? 'Add' : 'Remove'} {Math.abs(100 - totalPercentage)}%</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {outputAddresses.length < 5 && (
                      <button
                        type="button"
                        onClick={addOutputAddress}
                        className="mt-4 w-full py-4 border-3 border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-base font-bold"
                      >
                        + Add Another Address (Max 5)
                      </button>
                    )}
                  </div>

                  {/* Fee Breakdown - Enhanced */}
                  <div className="bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582z" />
                          <path d="M11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582-.155.103-.346.196-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">💸 Fee Breakdown</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <span className="text-base font-medium text-gray-700 dark:text-gray-300">Amount to Mix:</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {amount || '0'} XAHEEN
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <span className="text-base font-medium text-gray-700 dark:text-gray-300">Mixing Fee (0.5%):</span>
                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          - {amount ? (parseFloat(amount) * 0.005).toFixed(6) : '0'} XAHEEN
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <span className="text-base font-medium text-gray-700 dark:text-gray-300">Network Fee:</span>
                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          - {amount ? (0.001 * outputAddresses.length).toFixed(6) : '0'} XAHEEN
                        </span>
                      </div>
                      <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-300 dark:border-green-800">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">You Will Receive:</span>
                          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {amount ? (parseFloat(amount) - parseFloat(amount) * 0.005 - 0.001 * outputAddresses.length).toFixed(6) : '0'} XAHEEN
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions - Enhanced */}
                  <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-300 dark:border-yellow-800 rounded-xl">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-base text-yellow-900 dark:text-yellow-100 cursor-pointer">
                      <span className="font-bold">I understand and agree:</span> Mixing transactions are irreversible. I have verified all withdrawal addresses carefully.
                      The mixing process may take up to 60 minutes{selectedDelay > 0 && ` plus ${DELAY_OPTIONS.find(d => d.hours === selectedDelay)?.label.toLowerCase()} privacy delay`}.
                    </label>
                  </div>

                  {/* Submit Button - Enhanced */}
                  <button
                    type="submit"
                    disabled={!isPercentageValid || !amount || parseFloat(amount) < 10}
                    className="w-full h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white text-xl font-bold rounded-xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                  >
                    <svg className="w-7 h-7 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span>Start Mixing Now</span>
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Privacy Reminder */}
                  <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <p className="text-base text-indigo-900 dark:text-indigo-100">
                      🔒 <span className="font-semibold">Your privacy is our priority.</span> All mixing data is encrypted and automatically deleted after completion.
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* Active Sessions Tab */}
            {activeTab === 'active' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Active Mixing Sessions</h3>
                {mixTransactions.filter(m => m.status === 'pending' || m.status === 'mixing').length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-lg font-medium">No Active Sessions</p>
                    <p className="text-sm mt-1">Start a new mix to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mixTransactions.filter(m => m.status === 'pending' || m.status === 'mixing').map((mix) => (
                      <div key={mix.id} className="p-6 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {formatXAHEEN(mix.amount)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Started: {new Date(mix.createdAt).toLocaleString()}
                            </p>
                            {mix.delayHours > 0 && (
                              <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                                🕐 Delay: {DELAY_OPTIONS.find(d => d.hours === mix.delayHours)?.label}
                              </p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(mix.status)}`}>
                            {mix.status.charAt(0).toUpperCase() + mix.status.slice(1)}
                          </span>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Mixing Progress:</span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{mix.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${mix.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Estimated completion: {Math.floor((100 - mix.progress) / 2)} minutes
                          </p>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Deposit Address:</span>
                            <span className="font-mono text-xs text-gray-900 dark:text-white break-all">
                              {mix.depositAddress}
                            </span>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <span className="text-gray-500 dark:text-gray-400 block mb-2">Withdrawal Addresses ({mix.withdrawAddresses.length}):</span>
                            {mix.withdrawAddresses.map((addr, idx) => (
                              <div key={idx} className="font-mono text-xs text-gray-900 dark:text-white break-all mt-1">
                                {idx + 1}. {addr}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Completed Mixes</h3>
                {mixTransactions.filter(m => m.status === 'completed' || m.status === 'failed').length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-lg font-medium">No Mixing History</p>
                    <p className="text-sm mt-1">Your completed mixes will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mixTransactions.filter(m => m.status === 'completed' || m.status === 'failed').map((mix) => (
                      <div key={mix.id} className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatXAHEEN(mix.amount)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Started: {new Date(mix.createdAt).toLocaleString()}
                            </p>
                            {mix.completedAt && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Completed: {new Date(mix.completedAt).toLocaleString()}
                              </p>
                            )}
                            {mix.delayHours > 0 && (
                              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                Delay used: {DELAY_OPTIONS.find(d => d.hours === mix.delayHours)?.label}
                              </p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(mix.status)}`}>
                            {mix.status.charAt(0).toUpperCase() + mix.status.slice(1)}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Deposit Address:</span>
                            <span className="font-mono text-xs text-gray-900 dark:text-white break-all">
                              {mix.depositAddress}
                            </span>
                          </div>
                          {mix.withdrawAddresses.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                              <span className="text-gray-500 dark:text-gray-400 block mb-2">Withdrawal Addresses ({mix.withdrawAddresses.length}):</span>
                              {mix.withdrawAddresses.map((addr, idx) => (
                                <div key={idx} className="font-mono text-xs text-gray-900 dark:text-white break-all mt-1">
                                  {idx + 1}. {addr}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Enhanced Privacy</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Break the link between sender and receiver for maximum transaction privacy
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">No Logs</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mixing data is automatically deleted after completion - no records kept
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Low Fees</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Only 0.5% mixing fee plus network costs - competitive and transparent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
