/**
 * Charity Portal - AI-Verified Donation Platform
 * World's most sophisticated charity system with AI legitimacy verification
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { getAIClient } from '@/lib/ai-blockchain-client';
import { HeartIcon, CoinIcon, CheckCircleIcon, BookIcon, GlobeIcon, SparklesIcon } from '@/components/icons/Icons';

interface Charity {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'education' | 'health' | 'environment' | 'poverty' | 'disaster';
  readonly address: string;
  readonly totalReceived: number;
  readonly donors: number;
  readonly verified: boolean;
  readonly aiLegitimacyScore: number;
  readonly aiTransparencyScore: number;
  readonly impactReports: number;
  readonly logo: string;
  readonly website: string;
}

interface AICharityVerification {
  readonly legitimacyScore: number;
  readonly transparencyScore: number;
  readonly verificationStatus: 'verified' | 'pending' | 'flagged';
  readonly strengths: string[];
  readonly concerns: string[];
  readonly documentVerification: string;
  readonly fundUsageAnalysis: string;
  readonly impactAssessment: string;
  readonly recommendation: 'safe' | 'caution' | 'avoid';
}

interface ImpactMetric {
  readonly metric: string;
  readonly value: string;
  readonly trend: 'up' | 'down' | 'stable';
}

export default function CharityPage(): JSX.Element {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [aiVerification, setAIVerification] = useState<AICharityVerification | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [isDonating, setIsDonating] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [filter, setFilter] = useState<'all' | 'education' | 'health' | 'environment' | 'poverty' | 'disaster'>('all');

  // Mock charities - Replace with real blockchain data
  const charities: Charity[] = [
    {
      id: 'CHAR-001',
      name: 'Global Education Fund',
      description: 'Providing free education and learning resources to underprivileged children in developing countries.',
      category: 'education',
      address: '0x1234...5678',
      totalReceived: 125000,
      donors: 850,
      verified: true,
      aiLegitimacyScore: 98,
      aiTransparencyScore: 95,
      impactReports: 12,
      logo: 'book',
      website: 'https://globaleducation.org'
    },
    {
      id: 'CHAR-002',
      name: 'Clean Water Initiative',
      description: 'Building wells and water purification systems in communities without access to clean drinking water.',
      category: 'health',
      address: '0x8765...4321',
      totalReceived: 95000,
      donors: 620,
      verified: true,
      aiLegitimacyScore: 96,
      aiTransparencyScore: 92,
      impactReports: 8,
      logo: 'heart',
      website: 'https://cleanwater.org'
    },
    {
      id: 'CHAR-003',
      name: 'Reforestation Project',
      description: 'Planting trees and restoring forests to combat climate change and protect biodiversity.',
      category: 'environment',
      address: '0xabcd...efgh',
      totalReceived: 75000,
      donors: 1200,
      verified: true,
      aiLegitimacyScore: 94,
      aiTransparencyScore: 97,
      impactReports: 15,
      logo: 'globe',
      website: 'https://reforest.org'
    }
  ];

  // Filter charities
  const filteredCharities = useMemo(() => {
    if (filter === 'all') return charities;
    return charities.filter(c => c.category === filter);
  }, [filter, charities]);

  // Calculate impact metrics for selected charity
  const impactMetrics: ImpactMetric[] = useMemo(() => {
    if (!selectedCharity) return [];

    switch (selectedCharity.category) {
      case 'education':
        return [
          { metric: 'Children Educated', value: '12,500', trend: 'up' },
          { metric: 'Schools Built', value: '45', trend: 'up' },
          { metric: 'Teachers Trained', value: '320', trend: 'stable' }
        ];
      case 'health':
        return [
          { metric: 'Wells Built', value: '78', trend: 'up' },
          { metric: 'People Served', value: '25,000', trend: 'up' },
          { metric: 'Water Quality Tests', value: '1,200', trend: 'stable' }
        ];
      case 'environment':
        return [
          { metric: 'Trees Planted', value: '500,000', trend: 'up' },
          { metric: 'Hectares Restored', value: '2,400', trend: 'up' },
          { metric: 'CO2 Offset (tons)', value: '12,000', trend: 'up' }
        ];
      default:
        return [];
    }
  }, [selectedCharity]);

  // Get AI charity verification
  const getAIVerification = useCallback(async (charity: Charity) => {
    setIsLoadingAI(true);
    try {
      const ai = getAIClient();
      await ai.askQuestion(
        `Verify this charity: ${charity.name}. ${charity.description}`,
        { address: charity.address, category: charity.category }
      );

      // Mock AI verification
      setAIVerification({
        legitimacyScore: charity.aiLegitimacyScore,
        transparencyScore: charity.aiTransparencyScore,
        verificationStatus: 'verified',
        strengths: [
          'All registration documents verified on-chain',
          'Regular impact reports with third-party audits',
          'Transparent fund allocation (95% to programs, 5% operations)',
          'Strong community feedback and testimonials'
        ],
        concerns: [],
        documentVerification: 'All legal documents including registration, tax exemption, and governance docs have been verified and stored on IPFS',
        fundUsageAnalysis: '95% of funds directly support programs, 5% covers operational costs. All transactions are publicly auditable on-chain.',
        impactAssessment: `This charity has achieved measurable impact with ${charity.impactReports} detailed reports showing real-world results. AI analysis confirms correlation between donations and outcomes.`,
        recommendation: 'safe'
      });
    } catch (error) {
      console.error('AI verification error:', error);
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

  // Handle donation
  const handleDonate = useCallback(async () => {
    if (!selectedCharity || !donationAmount) return;

    setIsDonating(true);
    try {
      // TODO: Integrate with @nor/core for actual donation
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Successfully donated ${donationAmount} NOR to ${selectedCharity.name}!`);
      setDonationAmount('');
    } catch (error) {
      console.error('Donation error:', error);
    } finally {
      setIsDonating(false);
    }
  }, [selectedCharity, donationAmount]);

  // Handle charity selection
  const selectCharity = useCallback((charity: Charity) => {
    setSelectedCharity(charity);
    getAIVerification(charity);
  }, [getAIVerification]);

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'education': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'health': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'environment': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'poverty': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'disaster': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
              AI-Verified Charity Portal
            </h1>
            <p className="text-gray-400 text-lg">
              Donate with confidence using AI-powered charity verification
            </p>
          </div>

          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="h-12 px-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Donated</p>
              <p className="text-2xl font-bold text-orange-400">2,500 NOR</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">Verified Charities</p>
            <p className="text-2xl font-bold">{charities.filter(c => c.verified).length}</p>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">Total Donated</p>
            <p className="text-2xl font-bold text-orange-400">
              {charities.reduce((sum, c) => sum + c.totalReceived, 0).toLocaleString('en-US')} NOR
            </p>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">Total Donors</p>
            <p className="text-2xl font-bold text-red-400">
              {charities.reduce((sum, c) => sum + c.donors, 0).toLocaleString('en-US')}
            </p>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-2">Impact Reports</p>
            <p className="text-2xl font-bold text-green-400">
              {charities.reduce((sum, c) => sum + c.impactReports, 0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {(['all', 'education', 'health', 'environment', 'poverty', 'disaster'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charities List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredCharities.map((charity) => (
              <div
                key={charity.id}
                onClick={() => selectCharity(charity)}
                className={`p-6 bg-slate-800/50 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedCharity?.id === charity.id
                    ? 'border-orange-500 bg-slate-800'
                    : 'border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="h-16 w-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    {charity.logo === 'book' && <BookIcon className="w-8 h-8 text-blue-400" />}
                    {charity.logo === 'heart' && <HeartIcon className="w-8 h-8 text-pink-400" />}
                    {charity.logo === 'globe' && <GlobeIcon className="w-8 h-8 text-green-400" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold">{charity.name}</h3>
                          {charity.verified && (
                            <span className="flex items-center" title="AI Verified">
                              <CheckCircleIcon className="w-5 h-5 text-green-400" />
                            </span>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(charity.category)}`}>
                          {charity.category.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">{charity.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">AI Legitimacy</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                              style={{ width: `${charity.aiLegitimacyScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold">{charity.aiLegitimacyScore}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">AI Transparency</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                              style={{ width: `${charity.aiTransparencyScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold">{charity.aiTransparencyScore}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-400">
                        <span>{charity.totalReceived.toLocaleString('en-US')} NOR raised</span>
                        <span>{charity.donors} donors</span>
                        <span>{charity.impactReports} reports</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Donation & Verification Sidebar */}
          <div className="space-y-6">
            {selectedCharity ? (
              <>
                {/* Donation Panel */}
                <div className="p-6 bg-slate-800/50 rounded-2xl border-2 border-slate-700/50">
                  <h3 className="font-bold text-xl mb-4">Make a Donation</h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Donation Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="Enter amount"
                        disabled={!isConnected}
                        className="h-14 w-full px-4 pr-20 bg-slate-900 border-2 border-slate-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors disabled:opacity-50"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                        NOR
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900"
                    />
                    <label htmlFor="recurring" className="text-sm text-gray-300">
                      Make this a monthly recurring donation
                    </label>
                  </div>

                  <button
                    onClick={handleDonate}
                    disabled={!isConnected || !donationAmount || isDonating}
                    className="h-14 w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDonating ? 'Processing...' : 'Donate Now'}
                  </button>

                  <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <p className="text-xs text-orange-400 flex items-center gap-2">
                      <CoinIcon className="w-4 h-4 text-orange-400" />
                      100% of your donation goes to the charity. Gas fees are separate.
                    </p>
                  </div>
                </div>

                {/* Impact Metrics */}
                {impactMetrics.length > 0 && (
                  <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                    <h3 className="font-bold text-lg mb-4">Impact Metrics</h3>
                    <div className="space-y-3">
                      {impactMetrics.map((metric, i) => (
                        <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-400">{metric.metric}</span>
                            <span className={`text-xs ${
                              metric.trend === 'up' ? 'text-green-400' :
                              metric.trend === 'down' ? 'text-red-400' :
                              'text-gray-400'
                            }`}>
                              {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                            </span>
                          </div>
                          <p className="text-lg font-bold">{metric.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Verification */}
                {isLoadingAI ? (
                  <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-gray-400">AI verifying charity...</p>
                  </div>
                ) : aiVerification ? (
                  <div className="p-6 bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-2xl border-2 border-orange-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-orange-400">AI Verification</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">Status</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            aiVerification.verificationStatus === 'verified' ? 'bg-green-500/20 text-green-400' :
                            aiVerification.verificationStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {aiVerification.verificationStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Legitimacy</p>
                          <p className="text-2xl font-bold text-green-400">{aiVerification.legitimacyScore}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Transparency</p>
                          <p className="text-2xl font-bold text-blue-400">{aiVerification.transparencyScore}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-green-400 mb-2">Verified Strengths</p>
                        <ul className="space-y-1">
                          {aiVerification.strengths.map((strength, i) => (
                            <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-slate-700">
                        <p className="text-xs font-semibold text-gray-300 mb-1">Fund Usage</p>
                        <p className="text-xs text-gray-400">{aiVerification.fundUsageAnalysis}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-300 mb-1">Impact Assessment</p>
                        <p className="text-xs text-gray-400">{aiVerification.impactAssessment}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-700">
                        <div className={`px-4 py-3 rounded-lg text-center font-semibold ${
                          aiVerification.recommendation === 'safe' ? 'bg-green-500/20 text-green-400' :
                          aiVerification.recommendation === 'caution' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          AI Recommendation: {aiVerification.recommendation.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="p-8 bg-slate-800/50 rounded-xl border border-slate-700 text-center">
                <p className="text-gray-400">Select a charity to see AI verification and donate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
