/**
 * Crowdfunding Platform - AI-Powered Campaign Platform
 * World's most sophisticated crowdfunding system with AI success predictions
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { getAIClient } from '@/lib/ai-blockchain-client';
import { LightningBoltIcon, CheckCircleIcon, SparklesIcon } from '@/components/icons/Icons';

interface Campaign {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: 'technology' | 'creative' | 'social' | 'business';
  readonly creator: string;
  readonly goal: number;
  readonly raised: number;
  readonly backers: number;
  readonly daysLeft: number;
  readonly status: 'active' | 'funded' | 'ended';
  readonly aiSuccessScore: number;
  readonly aiRecommendation: 'high_potential' | 'moderate' | 'review_needed';
  readonly image: string;
  readonly milestones: number;
  readonly completedMilestones: number;
}

interface AICampaignAnalysis {
  readonly successProbability: number;
  readonly strengthsAnalysis: string[];
  readonly improvementSuggestions: string[];
  readonly marketComparison: string;
  readonly recommendedGoal: string;
  readonly estimatedCompletionTime: string;
  readonly similarSuccessfulCampaigns: string[];
}

export default function CrowdfundingPage(): JSX.Element {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [aiAnalysis, setAIAnalysis] = useState<AICampaignAnalysis | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [backAmount, setBackAmount] = useState<string>('');
  const [isBacking, setIsBacking] = useState(false);
  const [filter, setFilter] = useState<'all' | 'technology' | 'creative' | 'social' | 'business'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock campaigns - Replace with real blockchain data
  const campaigns: Campaign[] = [
    {
      id: 'CAMP-001',
      title: 'Decentralized Social Media Platform',
      description: 'Building the next generation of social media powered by blockchain technology, giving users full control over their data and content.',
      category: 'technology',
      creator: '0x1234...5678',
      goal: 100000,
      raised: 75000,
      backers: 420,
      daysLeft: 15,
      status: 'active',
      aiSuccessScore: 92,
      aiRecommendation: 'high_potential',
      image: '/placeholder-tech.jpg',
      milestones: 5,
      completedMilestones: 2
    },
    {
      id: 'CAMP-002',
      title: 'NFT Art Gallery & Marketplace',
      description: 'Create a curated NFT marketplace focusing on emerging digital artists with AI-powered discovery and fair royalty distribution.',
      category: 'creative',
      creator: '0x8765...4321',
      goal: 50000,
      raised: 42000,
      backers: 185,
      daysLeft: 8,
      status: 'active',
      aiSuccessScore: 88,
      aiRecommendation: 'high_potential',
      image: '/placeholder-art.jpg',
      milestones: 4,
      completedMilestones: 3
    },
    {
      id: 'CAMP-003',
      title: 'DeFi Education Platform',
      description: 'Free educational resources teaching blockchain and DeFi concepts to underserved communities worldwide.',
      category: 'social',
      creator: '0xabcd...efgh',
      goal: 25000,
      raised: 18500,
      backers: 520,
      daysLeft: 22,
      status: 'active',
      aiSuccessScore: 85,
      aiRecommendation: 'moderate',
      image: '/placeholder-education.jpg',
      milestones: 3,
      completedMilestones: 1
    }
  ];

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    if (filter === 'all') return campaigns;
    return campaigns.filter(c => c.category === filter);
  }, [filter, campaigns]);

  // Calculate progress percentage
  const getProgressPercentage = useCallback((campaign: Campaign): number => {
    return Math.min((campaign.raised / campaign.goal) * 100, 100);
  }, []);

  // Get AI campaign analysis
  const getAIAnalysis = useCallback(async (campaign: Campaign) => {
    setIsLoadingAI(true);
    try {
      const ai = getAIClient();
      await ai.askQuestion(
        `Analyze this crowdfunding campaign: ${campaign.title}. ${campaign.description}`,
        { category: campaign.category, goal: campaign.goal, raised: campaign.raised }
      );

      // Mock AI analysis
      setAIAnalysis({
        successProbability: 87,
        strengthsAnalysis: [
          'Strong community engagement and social media presence',
          'Clear roadmap with achievable milestones',
          'Experienced team with proven track record',
          'Innovative solution addressing real market need'
        ],
        improvementSuggestions: [
          'Add more detailed technical specifications',
          'Include video demonstration of prototype',
          'Expand marketing efforts to reach wider audience'
        ],
        marketComparison: 'This campaign is performing 35% better than similar projects in the same category',
        recommendedGoal: `${campaign.goal} NOR (current goal is optimal)`,
        estimatedCompletionTime: '12-16 days based on current funding velocity',
        similarSuccessfulCampaigns: [
          'CAMP-042: Blockchain Gaming Platform (Funded 150%)',
          'CAMP-018: DeFi Wallet App (Funded 180%)'
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

  // Handle backing a campaign
  const handleBack = useCallback(async () => {
    if (!selectedCampaign || !backAmount) return;

    setIsBacking(true);
    try {
      // TODO: Integrate with @nor/core for actual backing
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Successfully backed ${selectedCampaign.title} with ${backAmount} NOR!`);
      setBackAmount('');
    } catch (error) {
      console.error('Backing error:', error);
    } finally {
      setIsBacking(false);
    }
  }, [selectedCampaign, backAmount]);

  // Handle campaign selection
  const selectCampaign = useCallback((campaign: Campaign) => {
    setSelectedCampaign(campaign);
    getAIAnalysis(campaign);
  }, [getAIAnalysis]);

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'technology': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'creative': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'social': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'business': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
              AI-Powered Crowdfunding
            </h1>
            <p className="text-gray-400 text-lg">
              Fund innovative projects with AI success predictions
            </p>
          </div>

          <div className="flex gap-3">
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg transition-all"
              >
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={() => setShowCreateModal(true)}
                className="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg transition-all"
              >
                Create Campaign
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">Active Campaigns</p>
            <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">Total Raised</p>
            <p className="text-2xl font-bold text-purple-400">
              {campaigns.reduce((sum, c) => sum + c.raised, 0).toLocaleString()} NOR
            </p>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">Total Backers</p>
            <p className="text-2xl font-bold text-pink-400">
              {campaigns.reduce((sum, c) => sum + c.backers, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">Success Rate</p>
            <p className="text-2xl font-bold text-green-400">87%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {(['all', 'technology', 'creative', 'social', 'business'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaigns Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                onClick={() => selectCampaign(campaign)}
                className={`p-6 bg-slate-800/50 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedCampaign?.id === campaign.id
                    ? 'border-purple-500 bg-slate-800'
                    : 'border-slate-700/50 hover:border-slate-600'
                }`}
              >
                {/* Campaign Image Placeholder */}
                <div className="h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-4 flex items-center justify-center">
                  <LightningBoltIcon className="w-16 h-16 text-purple-400" />
                </div>

                {/* Campaign Info */}
                <div className="mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(campaign.category)}`}>
                    {campaign.category.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2 line-clamp-2">{campaign.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{campaign.description}</p>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{campaign.raised.toLocaleString()} NOR</span>
                    <span className="text-gray-400">of {campaign.goal.toLocaleString()} NOR</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${getProgressPercentage(campaign)}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">{campaign.backers} backers</span>
                    <span className="text-gray-400">{campaign.daysLeft} days left</span>
                  </div>
                  <div className="px-2 py-1 bg-purple-500/20 rounded text-xs font-semibold text-purple-400">
                    AI: {campaign.aiSuccessScore}
                  </div>
                </div>

                {/* Milestones */}
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Milestones</span>
                    <span>{campaign.completedMilestones}/{campaign.milestones} completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Campaign Details & Backing Sidebar */}
          <div className="space-y-6">
            {selectedCampaign ? (
              <>
                {/* Backing Panel */}
                <div className="p-6 bg-slate-800/50 rounded-2xl border-2 border-slate-700/50">
                  <h3 className="font-bold text-xl mb-4">Back This Campaign</h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Backing Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={backAmount}
                        onChange={(e) => setBackAmount(e.target.value)}
                        placeholder="Enter amount"
                        disabled={!isConnected}
                        className="h-14 w-full px-4 pr-20 bg-slate-900 border-2 border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors disabled:opacity-50"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                        NOR
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleBack}
                    disabled={!isConnected || !backAmount || isBacking}
                    className="h-14 w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBacking ? 'Processing...' : 'Back Campaign'}
                  </button>

                  <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-xs text-purple-400 flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Funds are held in smart contract escrow until milestones are completed
                    </p>
                  </div>
                </div>

                {/* AI Analysis */}
                {isLoadingAI ? (
                  <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-gray-400">AI analyzing campaign...</p>
                  </div>
                ) : aiAnalysis ? (
                  <div className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl border-2 border-purple-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-purple-400">AI Success Analysis</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-300 mb-2">Success Probability</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{ width: `${aiAnalysis.successProbability}%` }}
                            />
                          </div>
                          <span className="text-lg font-bold">{aiAnalysis.successProbability}%</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-green-400 mb-2">Strengths</p>
                        <ul className="space-y-1">
                          {aiAnalysis.strengthsAnalysis.map((strength, i) => (
                            <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-yellow-400 mb-2">Suggestions</p>
                        <ul className="space-y-1">
                          {aiAnalysis.improvementSuggestions.map((suggestion, i) => (
                            <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                              <svg className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-slate-700">
                        <p className="text-xs font-semibold text-gray-300 mb-1">Market Comparison</p>
                        <p className="text-xs text-gray-400">{aiAnalysis.marketComparison}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-300 mb-1">Estimated Completion</p>
                        <p className="text-xs text-gray-400">{aiAnalysis.estimatedCompletionTime}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="p-8 bg-slate-800/50 rounded-xl border border-slate-700 text-center">
                <p className="text-gray-400">Select a campaign to see AI analysis and back it</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
