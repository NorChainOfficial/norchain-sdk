/**
 * Governance Voting Interface - AI-Powered Governance Platform
 * World's most sophisticated governance system with AI proposal analysis
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { getAIClient } from '@/lib/ai-blockchain-client';
import { useProposals, useVotingPower } from '@/hooks/useBlockchain';
import { CheckCircleIcon, SparklesIcon } from '@/components/icons/Icons';

interface Proposal {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: 'protocol_upgrade' | 'treasury' | 'parameter_change' | 'community';
  readonly proposer: string;
  readonly status: 'active' | 'passed' | 'rejected' | 'pending';
  readonly votesFor: number;
  readonly votesAgainst: number;
  readonly votesAbstain: number;
  readonly quorum: number;
  readonly endTime: number;
  readonly aiRiskScore: number;
  readonly aiImpactScore: number;
  readonly aiRecommendation: 'for' | 'against' | 'abstain' | 'review';
}

interface AIProposalAnalysis {
  readonly summary: string;
  readonly pros: string[];
  readonly cons: string[];
  readonly risks: string[];
  readonly impactAssessment: string;
  readonly recommendation: 'for' | 'against' | 'abstain' | 'review';
  readonly confidence: number;
  readonly similarProposals: string[];
}

export default function GovernancePage(): JSX.Element {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [aiAnalysis, setAIAnalysis] = useState<AIProposalAnalysis | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'passed' | 'rejected'>('active');

  // Get real blockchain data from https://rpc.norchain.org
  const { proposals: blockchainProposals, loading: proposalsLoading } = useProposals();
  const { votingPower: userVotingPower } = useVotingPower(walletAddress);

  const votingPower = userVotingPower ? parseFloat(userVotingPower).toLocaleString() : '0';

  // Mock proposals - Replace with real blockchain data
  const proposals: Proposal[] = [
    {
      id: 'PROP-001',
      title: 'Increase Block Gas Limit to 30M',
      description: 'Proposal to increase the block gas limit from 20M to 30M to improve network throughput and reduce congestion during peak times.',
      category: 'protocol_upgrade',
      proposer: '0x1234...5678',
      status: 'active',
      votesFor: 4500000,
      votesAgainst: 500000,
      votesAbstain: 100000,
      quorum: 5000000,
      endTime: Date.now() + 86400000 * 3, // 3 days
      aiRiskScore: 35,
      aiImpactScore: 85,
      aiRecommendation: 'for'
    },
    {
      id: 'PROP-002',
      title: 'Treasury Funding for DeFi Development',
      description: 'Allocate 500,000 NOR from treasury to fund DeFi protocol development over the next 6 months.',
      category: 'treasury',
      proposer: '0x8765...4321',
      status: 'active',
      votesFor: 3200000,
      votesAgainst: 1800000,
      votesAbstain: 200000,
      quorum: 5000000,
      endTime: Date.now() + 86400000 * 5, // 5 days
      aiRiskScore: 55,
      aiImpactScore: 75,
      aiRecommendation: 'review'
    },
    {
      id: 'PROP-003',
      title: 'Reduce Staking Minimum to 50 NOR',
      description: 'Lower the minimum staking requirement from 100 NOR to 50 NOR to increase accessibility for smaller holders.',
      category: 'parameter_change',
      proposer: '0xabcd...efgh',
      status: 'active',
      votesFor: 5500000,
      votesAgainst: 300000,
      votesAbstain: 150000,
      quorum: 5000000,
      endTime: Date.now() + 86400000 * 2, // 2 days
      aiRiskScore: 25,
      aiImpactScore: 90,
      aiRecommendation: 'for'
    }
  ];

  // Filter proposals
  const filteredProposals = useMemo(() => {
    if (filter === 'all') return proposals;
    return proposals.filter(p => p.status === filter);
  }, [filter, proposals]);

  // Calculate time remaining
  const getTimeRemaining = useCallback((endTime: number): string => {
    const diff = endTime - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  }, []);

  // Get AI analysis for proposal
  const getAIAnalysis = useCallback(async (proposal: Proposal) => {
    setIsLoadingAI(true);
    try {
      const ai = getAIClient();
      const response = await ai.askQuestion(
        `Analyze this governance proposal: ${proposal.title}. ${proposal.description}`,
        { category: proposal.category, proposer: proposal.proposer }
      );

      // Mock AI analysis - in production, this would be parsed from AI response
      setAIAnalysis({
        summary: 'This proposal aims to improve network performance by increasing the gas limit, which could reduce transaction congestion during peak usage periods.',
        pros: [
          'Improved network throughput and reduced congestion',
          'Better user experience during high-traffic periods',
          'Supports growing ecosystem demands'
        ],
        cons: [
          'Slightly increased storage requirements for nodes',
          'Potential for increased network spam',
          'May require node operators to upgrade hardware'
        ],
        risks: [
          'Low risk of centralization (only powerful nodes can handle larger blocks)',
          'Medium risk of increased costs for node operators'
        ],
        impactAssessment: 'High positive impact on user experience with manageable infrastructure costs. Expected to reduce failed transactions by ~40% during peak times.',
        recommendation: 'for',
        confidence: 87,
        similarProposals: [
          'PROP-042: Gas limit increase to 25M (Passed 2023)',
          'PROP-018: Block size optimization (Passed 2022)'
        ]
      });
    } catch (error) {
      console.error('AI analysis error:', error);
    } finally {
      setIsLoadingAI(false);
    }
  }, []);

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

  // Handle voting
  const handleVote = useCallback(async (vote: 'for' | 'against' | 'abstain') => {
    if (!selectedProposal) return;

    setIsVoting(true);
    try {
      // TODO: Integrate with @noor/core for actual voting
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Successfully voted ${vote.toUpperCase()} on ${selectedProposal.title}`);
    } catch (error) {
      console.error('Voting error:', error);
    } finally {
      setIsVoting(false);
    }
  }, [selectedProposal]);

  // Handle proposal selection
  const selectProposal = useCallback((proposal: Proposal) => {
    setSelectedProposal(proposal);
    getAIAnalysis(proposal);
  }, [getAIAnalysis]);

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'protocol_upgrade': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'treasury': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'parameter_change': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'community': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
              AI-Powered Governance
            </h1>
            <p className="text-gray-400 text-lg">
              Vote on proposals with AI-driven insights and analysis
            </p>
          </div>

          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="h-12 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="text-right">
              <p className="text-sm text-gray-400">Voting Power</p>
              <p className="text-2xl font-bold text-blue-400">{votingPower} NOR</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">Active Proposals</p>
            <p className="text-2xl font-bold">{proposals.filter(p => p.status === 'active').length}</p>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">Passed</p>
            <p className="text-2xl font-bold text-green-400">{proposals.filter(p => p.status === 'passed').length}</p>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">Your Votes</p>
            <p className="text-2xl font-bold text-blue-400">8</p>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">Participation Rate</p>
            <p className="text-2xl font-bold text-purple-400">76%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {(['all', 'active', 'passed', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Proposals List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredProposals.map((proposal) => (
              <div
                key={proposal.id}
                onClick={() => selectProposal(proposal)}
                className={`p-6 bg-slate-800/50 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedProposal?.id === proposal.id
                    ? 'border-blue-500 bg-slate-800'
                    : 'border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(proposal.category)}`}>
                        {proposal.category.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-400">#{proposal.id}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{proposal.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{proposal.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">AI Risk Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            proposal.aiRiskScore < 30 ? 'bg-green-500' :
                            proposal.aiRiskScore < 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${proposal.aiRiskScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{proposal.aiRiskScore}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">AI Impact Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                          style={{ width: `${proposal.aiImpactScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{proposal.aiImpactScore}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      <span className="font-semibold">{(proposal.votesFor / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="font-semibold">{(proposal.votesAgainst / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="8" strokeWidth={2} />
                      </svg>
                      <span className="font-semibold">{(proposal.votesAbstain / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">
                    Ends in {getTimeRemaining(proposal.endTime)}
                  </span>
                </div>

                <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full flex">
                    <div
                      className="bg-green-500"
                      style={{ width: `${(proposal.votesFor / proposal.quorum) * 100}%` }}
                    />
                    <div
                      className="bg-red-500"
                      style={{ width: `${(proposal.votesAgainst / proposal.quorum) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Analysis Sidebar */}
          <div className="space-y-6">
            {selectedProposal ? (
              <>
                {/* Voting Panel */}
                <div className="p-6 bg-slate-800/50 rounded-2xl border-2 border-slate-700/50">
                  <h3 className="font-bold text-xl mb-4">Cast Your Vote</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleVote('for')}
                      disabled={!isConnected || isVoting}
                      className="h-12 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Vote FOR
                    </button>
                    <button
                      onClick={() => handleVote('against')}
                      disabled={!isConnected || isVoting}
                      className="h-12 w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Vote AGAINST
                    </button>
                    <button
                      onClick={() => handleVote('abstain')}
                      disabled={!isConnected || isVoting}
                      className="h-12 w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Abstain
                    </button>
                  </div>
                </div>

                {/* AI Analysis */}
                {isLoadingAI ? (
                  <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-gray-400">AI analyzing proposal...</p>
                  </div>
                ) : aiAnalysis ? (
                  <div className="p-6 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-2xl border-2 border-blue-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-blue-400">AI Analysis</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-300 mb-2">Summary</p>
                        <p className="text-sm text-gray-400">{aiAnalysis.summary}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-green-400 mb-2">Pros</p>
                        <ul className="space-y-1">
                          {aiAnalysis.pros.map((pro, i) => (
                            <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-red-400 mb-2">Cons</p>
                        <ul className="space-y-1">
                          {aiAnalysis.cons.map((con, i) => (
                            <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                              <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-yellow-400 mb-2">Risks</p>
                        <ul className="space-y-1">
                          {aiAnalysis.risks.map((risk, i) => (
                            <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                              <svg className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-slate-700">
                        <p className="text-sm font-semibold text-gray-300 mb-2">AI Recommendation</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            aiAnalysis.recommendation === 'for' ? 'bg-green-500/20 text-green-400' :
                            aiAnalysis.recommendation === 'against' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {aiAnalysis.recommendation.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-400">
                            {aiAnalysis.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{aiAnalysis.impactAssessment}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="p-8 bg-slate-800/50 rounded-xl border border-slate-700 text-center">
                <p className="text-gray-400">Select a proposal to see AI analysis and vote</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
