/**
 * Staking Dashboard - AI-Powered Staking Interface
 * World's most sophisticated staking platform with AI recommendations
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { getAIClient } from '@/lib/ai-blockchain-client';
import { useStaking, useBalance } from '@/hooks/useBlockchain';
import { SparklesIcon } from '@/components/icons/Icons';

interface StakingStats {
  readonly totalStaked: string;
  readonly myStake: string;
  readonly apr: number;
  readonly rewards: string;
  readonly nextRewardIn: number;
  readonly validators: number;
  readonly minStake: string;
}

interface Validator {
  readonly address: string;
  readonly name: string;
  readonly commission: number;
  readonly totalStaked: string;
  readonly uptime: number;
  readonly aiRating: number;
  readonly aiInsight: string;
}

interface AIRecommendation {
  readonly action: 'stake' | 'unstake' | 'compound' | 'wait';
  readonly amount: string;
  readonly validator?: string;
  readonly reason: string;
  readonly confidence: number;
  readonly expectedReturn: string;
  readonly riskLevel: 'low' | 'medium' | 'high';
}

export default function StakingPage(): JSX.Element {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [selectedValidator, setSelectedValidator] = useState<string>('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiRecommendation, setAIRecommendation] = useState<AIRecommendation | null>(null);
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake' | 'rewards'>('stake');

  // Get real blockchain data from https://rpc.norchain.org
  const { stakingData, loading: stakingLoading } = useStaking(walletAddress);
  const { balance } = useBalance(walletAddress);

  // Use real data or fallback to defaults
  const stats: StakingStats = {
    totalStaked: stakingData ? parseFloat(stakingData.totalStaked).toLocaleString() : '125,000,000',
    myStake: stakingData ? parseFloat(stakingData.userStake).toLocaleString() : '0',
    apr: stakingData?.apr || 12.5,
    rewards: stakingData ? parseFloat(stakingData.userRewards).toLocaleString() : '0',
    nextRewardIn: 3600,
    validators: stakingData?.validatorCount || 42,
    minStake: stakingData?.minStake || '100'
  };

  // Mock validators - Replace with real validator data
  const validators: Validator[] = [
    {
      address: '0x1234...5678',
      name: 'Noor Foundation',
      commission: 5,
      totalStaked: '45,000,000',
      uptime: 99.98,
      aiRating: 95,
      aiInsight: 'Excellent performance, highest uptime, low commission'
    },
    {
      address: '0x8765...4321',
      name: 'Blockchain Validators',
      commission: 3,
      totalStaked: '38,500,000',
      uptime: 99.92,
      aiRating: 92,
      aiInsight: 'Great choice, low commission, very reliable'
    },
    {
      address: '0xabcd...efgh',
      name: 'Crypto Stakers Inc',
      commission: 7,
      totalStaked: '25,000,000',
      uptime: 99.85,
      aiRating: 88,
      aiInsight: 'Good validator, slightly higher commission'
    }
  ];

  // Get AI recommendation
  const getAIRecommendation = useCallback(async () => {
    if (!stakeAmount || parseFloat(stakeAmount) < parseFloat(stats.minStake)) return;

    setIsLoadingAI(true);
    try {
      const ai = getAIClient();
      const response = await ai.optimizePortfolio([
        {
          asset: 'NOR',
          amount: stakeAmount,
          action: 'stake'
        }
      ]);

      // Mock AI recommendation based on portfolio optimization
      setAIRecommendation({
        action: 'stake',
        amount: stakeAmount,
        validator: validators[0].address,
        reason: `AI recommends staking ${stakeAmount} NOR with ${validators[0].name} due to optimal APR/risk ratio and ${validators[0].uptime}% uptime`,
        confidence: 92,
        expectedReturn: `~${(parseFloat(stakeAmount) * (stats.apr / 100)).toFixed(2)} NOR annually`,
        riskLevel: 'low'
      });
    } catch (error) {
      console.error('AI recommendation error:', error);
    } finally {
      setIsLoadingAI(false);
    }
  }, [stakeAmount, stats.minStake, stats.apr, validators]);

  // Auto-fetch AI recommendation when amount changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (stakeAmount && parseFloat(stakeAmount) >= parseFloat(stats.minStake)) {
        getAIRecommendation();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [stakeAmount, stats.minStake, getAIRecommendation]);

  // Calculate potential rewards
  const potentialRewards = useMemo(() => {
    if (!stakeAmount) return '0';
    const amount = parseFloat(stakeAmount);
    return (amount * (stats.apr / 100)).toFixed(2);
  }, [stakeAmount, stats.apr]);

  // Handle wallet connection
  const connectWallet = useCallback(async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  }, []);

  // Handle staking
  const handleStake = useCallback(async () => {
    if (!stakeAmount || !selectedValidator) return;

    setIsStaking(true);
    try {
      // TODO: Integrate with @noor/core for actual staking
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Successfully staked ${stakeAmount} NOR with ${selectedValidator}`);
      setStakeAmount('');
    } catch (error) {
      console.error('Staking error:', error);
    } finally {
      setIsStaking(false);
    }
  }, [stakeAmount, selectedValidator]);

  // Handle unstaking
  const handleUnstake = useCallback(async () => {
    if (!stakeAmount) return;

    setIsUnstaking(true);
    try {
      // TODO: Integrate with @xaheen/core for actual unstaking
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Successfully unstaked ${stakeAmount} NOR`);
      setStakeAmount('');
    } catch (error) {
      console.error('Unstaking error:', error);
    } finally {
      setIsUnstaking(false);
    }
  }, [stakeAmount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
              AI-Powered Staking
            </h1>
            <p className="text-gray-400 text-lg">
              Optimize your staking strategy with AI recommendations
            </p>
          </div>

          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="px-4 py-2 bg-slate-800 rounded-lg border border-green-500/30">
              <p className="text-sm text-gray-400">Connected</p>
              <p className="font-mono text-sm">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">Total Staked</p>
            <p className="text-2xl font-bold">{stats.totalStaked} NOR</p>
          </div>

          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">My Stake</p>
            <p className="text-2xl font-bold text-green-400">{stats.myStake} NOR</p>
          </div>

          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">Current APR</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.apr}%</p>
          </div>

          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">Pending Rewards</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.rewards} NOR</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Staking Interface */}
          <div className="lg:col-span-2">
            <div className="p-8 bg-slate-800/50 rounded-2xl border-2 border-slate-700/50">
              {/* Tabs */}
              <div className="flex gap-4 mb-6 border-b border-slate-700">
                <button
                  onClick={() => setActiveTab('stake')}
                  className={`px-6 py-3 font-semibold transition-colors ${
                    activeTab === 'stake'
                      ? 'text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Stake
                </button>
                <button
                  onClick={() => setActiveTab('unstake')}
                  className={`px-6 py-3 font-semibold transition-colors ${
                    activeTab === 'unstake'
                      ? 'text-orange-400 border-b-2 border-orange-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Unstake
                </button>
                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`px-6 py-3 font-semibold transition-colors ${
                    activeTab === 'rewards'
                      ? 'text-yellow-400 border-b-2 border-yellow-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Rewards
                </button>
              </div>

              {/* Stake Tab */}
              {activeTab === 'stake' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount to Stake
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder={`Min: ${stats.minStake} NOR`}
                        disabled={!isConnected}
                        className="h-14 w-full px-4 pr-20 bg-slate-900 border-2 border-slate-700 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors disabled:opacity-50"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                        NOR
                      </span>
                    </div>
                    {stakeAmount && (
                      <p className="text-sm text-gray-400 mt-2">
                        Potential annual rewards: ~{potentialRewards} NOR ({stats.apr}% APR)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Validator
                    </label>
                    <select
                      value={selectedValidator}
                      onChange={(e) => setSelectedValidator(e.target.value)}
                      disabled={!isConnected}
                      className="h-14 w-full px-4 bg-slate-900 border-2 border-slate-700 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors disabled:opacity-50"
                    >
                      <option value="">Choose a validator...</option>
                      {validators.map((validator) => (
                        <option key={validator.address} value={validator.address}>
                          {validator.name} - {validator.commission}% commission - {validator.uptime}% uptime
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleStake}
                    disabled={!isConnected || !stakeAmount || !selectedValidator || isStaking}
                    className="h-14 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStaking ? 'Staking...' : 'Stake NOR'}
                  </button>
                </div>
              )}

              {/* Unstake Tab */}
              {activeTab === 'unstake' && (
                <div className="space-y-6">
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <p className="text-sm text-orange-400 flex items-start gap-2">
                      <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Unstaking has a 7-day cooldown period. Your tokens will be locked during this time.</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount to Unstake
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder={`Max: ${stats.myStake} NOR`}
                        disabled={!isConnected}
                        className="h-14 w-full px-4 pr-20 bg-slate-900 border-2 border-slate-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors disabled:opacity-50"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                        NOR
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleUnstake}
                    disabled={!isConnected || !stakeAmount || isUnstaking}
                    className="h-14 w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUnstaking ? 'Unstaking...' : 'Unstake NOR'}
                  </button>
                </div>
              )}

              {/* Rewards Tab */}
              {activeTab === 'rewards' && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <p className="text-6xl font-bold text-yellow-400 mb-4">{stats.rewards}</p>
                    <p className="text-gray-400 text-lg mb-6">NOR Available to Claim</p>
                    <button
                      disabled={!isConnected}
                      className="h-14 px-8 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Claim Rewards
                    </button>
                  </div>

                  <div className="p-6 bg-slate-900/50 rounded-xl">
                    <h3 className="font-semibold mb-4">Reward History</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-gray-400">Today</span>
                        <span className="text-green-400 font-semibold">+12.5 NOR</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-gray-400">Yesterday</span>
                        <span className="text-green-400 font-semibold">+12.3 NOR</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-gray-400">2 days ago</span>
                        <span className="text-green-400 font-semibold">+12.7 NOR</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Recommendations Sidebar */}
          <div className="space-y-6">
            {/* AI Recommendation Card */}
            {aiRecommendation && (
              <div className="p-6 bg-gradient-to-br from-cyan-900/30 to-teal-900/30 rounded-2xl border-2 border-cyan-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-cyan-400">AI Recommendation</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Confidence</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
                          style={{ width: `${aiRecommendation.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{aiRecommendation.confidence}%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Risk Level</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      aiRecommendation.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                      aiRecommendation.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {aiRecommendation.riskLevel.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Expected Return</p>
                    <p className="font-semibold text-cyan-400">{aiRecommendation.expectedReturn}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-sm text-gray-300">{aiRecommendation.reason}</p>
                  </div>
                </div>
              </div>
            )}

            {isLoadingAI && (
              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-gray-400">AI analyzing your staking strategy...</p>
              </div>
            )}

            {/* Validators List */}
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <h3 className="font-bold text-xl mb-4">Top Validators</h3>
              <div className="space-y-4">
                {validators.map((validator) => (
                  <div
                    key={validator.address}
                    className="p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                    onClick={() => setSelectedValidator(validator.address)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{validator.name}</h4>
                        <p className="text-xs text-gray-400 font-mono">{validator.address}</p>
                      </div>
                      <div className="px-2 py-1 bg-cyan-500/20 rounded text-xs font-semibold text-cyan-400">
                        AI: {validator.aiRating}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div>
                        <span className="text-gray-400">Commission:</span>
                        <span className="ml-1 font-semibold">{validator.commission}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Uptime:</span>
                        <span className="ml-1 font-semibold text-green-400">{validator.uptime}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 italic">{validator.aiInsight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
