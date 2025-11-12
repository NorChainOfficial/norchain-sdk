'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBlockchainService } from '@/lib/blockchain-service';
import { DiamondIcon, BadgeIcon, CoinIcon, FireIcon, CheckCircleIcon, LightningBoltIcon, HeartIcon, DocumentIcon, CubeIcon } from '@/components/icons/Icons';

interface ContractInfo {
  readonly name: string;
  readonly address: string;
  readonly description: string;
  readonly category: 'Token' | 'DeFi' | 'Governance' | 'Social' | 'Utility';
  readonly type: 'ERC-20' | 'Protocol';
  readonly icon: string;
  readonly verified: boolean;
  readonly dappUrl?: string;
  readonly isToken: boolean;
}

// All verified contracts on Nor Chain
const CONTRACTS: ContractInfo[] = [
  {
    name: 'XHN Governance Token',
    address: '0x24719ba3b4AD49cC7edcbDc536fd97C8526830A0',
    description: 'Native governance token - Captures all platform value, rewards long-term holders, enables DAO voting',
    category: 'Governance',
    type: 'ERC-20',
    icon: 'diamond',
    verified: true,
    isToken: true,
  },
  {
    name: 'BTCBR Token',
    address: '0x0cF8e180350253271f4b917CcFb0aCCc4862F262',
    description: 'Bitcoin Brasil - Genesis ERC-20 token with 21 septillion supply',
    category: 'Token',
    type: 'ERC-20',
    icon: 'badge',
    verified: true,
    isToken: true,
  },
  {
    name: 'NOR Staking',
    address: '0xAe1C7ebcbE42C66a7C03A661505Cc39A5963e286',
    description: 'Staking protocol with dynamic APY (8-20%) and validator rewards',
    category: 'DeFi',
    type: 'Protocol',
    icon: 'coin',
    verified: true,
    dappUrl: '/staking',
    isToken: false,
  },
  {
    name: 'NOR Burn Mechanism',
    address: '0xe447647577cc340B0D853F9A8F052E9BF5D673c1',
    description: 'Deflationary mechanism burning 50-80% of gas fees',
    category: 'Utility',
    type: 'Protocol',
    icon: 'fire',
    verified: true,
    isToken: false,
  },
  {
    name: 'NOR Governance',
    address: '0xCff12037d60452F18B2D347c8602F03e0C3089C0',
    description: 'DAO governance with 7-day voting and 2-day timelock',
    category: 'Governance',
    type: 'Protocol',
    icon: 'check',
    verified: true,
    dappUrl: '/governance',
    isToken: false,
  },
  {
    name: 'NOR Revenue',
    address: '0xE4bC805e5ED3eB8715A27D4CBAdDF510764aAF53',
    description: 'Revenue distribution: 50% stakers, 30% validators, 10% burn, 10% treasury',
    category: 'DeFi',
    type: 'Protocol',
    icon: 'coin',
    verified: true,
    isToken: false,
  },
  {
    name: 'NOR Crowdfunding',
    address: '0xbbb1ec421b156f0442D435A875E5267B8A2FDc39',
    description: 'Decentralized crowdfunding platform with 2% fee and escrow',
    category: 'Social',
    type: 'Protocol',
    icon: 'lightning',
    verified: true,
    dappUrl: '/crowdfunding',
    isToken: false,
  },
  {
    name: 'NOR Charity',
    address: '0x0f8498072DB1611497e2068f9896aeFfcf173583',
    description: 'Zero-fee charity donations with verified organizations',
    category: 'Social',
    type: 'Protocol',
    icon: 'heart',
    verified: true,
    dappUrl: '/charity',
    isToken: false,
  },
];

export default function ContractsPage(): JSX.Element {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'tokens' | 'protocols'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [contractsData, setContractsData] = useState<Map<string, { balance: string; code: string }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const service = getBlockchainService();
        const dataMap = new Map();

        for (const contract of CONTRACTS) {
          try {
            const [balance, code] = await Promise.all([
              service.getBalance(contract.address),
              service.provider.getCode(contract.address),
            ]);
            dataMap.set(contract.address, { balance, code });
          } catch (error) {
            console.error(`Error fetching data for ${contract.name}:`, error);
          }
        }

        setContractsData(dataMap);
      } catch (error) {
        console.error('Error fetching contract data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContractData();
  }, []);

  const filteredContracts = CONTRACTS.filter((contract) => {
    // Type filter
    if (selectedFilter === 'tokens' && !contract.isToken) return false;
    if (selectedFilter === 'protocols' && contract.isToken) return false;

    // Category filter
    if (selectedCategory !== 'all' && contract.category !== selectedCategory) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        contract.name.toLowerCase().includes(query) ||
        contract.address.toLowerCase().includes(query) ||
        contract.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const categories = ['all', ...Array.from(new Set(CONTRACTS.map((c) => c.category)))];
  const tokenCount = CONTRACTS.filter((c) => c.isToken).length;
  const protocolCount = CONTRACTS.filter((c) => !c.isToken).length;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Smart Contracts</h1>
          <p className="text-gray-400 text-lg">
            All verified contracts deployed on Nor Chain
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Contracts</p>
                <p className="text-3xl font-bold text-white">{CONTRACTS.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <DocumentIcon className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">ERC-20 Tokens</p>
                <p className="text-3xl font-bold text-white">{tokenCount}</p>
              </div>
              <div className="h-12 w-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <BadgeIcon className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Protocol Contracts</p>
                <p className="text-3xl font-bold text-white">{protocolCount}</p>
              </div>
              <div className="h-12 w-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <CubeIcon className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
          <div className="space-y-4">
            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Contract Type</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  All Contracts ({CONTRACTS.length})
                </button>
                <button
                  onClick={() => setSelectedFilter('tokens')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFilter === 'tokens'
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  Tokens ({tokenCount})
                </button>
                <button
                  onClick={() => setSelectedFilter('protocols')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFilter === 'protocols'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  Protocols ({protocolCount})
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, address, or description..."
                className="w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Contracts Grid */}
        {loading ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-lg">Loading contracts from blockchain...</p>
            </div>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
            <p className="text-gray-400 text-lg">No contracts found matching your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredContracts.map((contract) => {
              const data = contractsData.get(contract.address);
              const isDeployed = data && data.code !== '0x';

              return (
                <div
                  key={contract.address}
                  className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-blue-500/50 transition-all hover:shadow-xl"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                        {contract.icon === 'diamond' && <DiamondIcon className="w-6 h-6 text-purple-400" />}
                        {contract.icon === 'badge' && <BadgeIcon className="w-6 h-6 text-orange-400" />}
                        {contract.icon === 'coin' && <CoinIcon className="w-6 h-6 text-green-400" />}
                        {contract.icon === 'fire' && <FireIcon className="w-6 h-6 text-orange-400" />}
                        {contract.icon === 'check' && <CheckCircleIcon className="w-6 h-6 text-violet-400" />}
                        {contract.icon === 'lightning' && <LightningBoltIcon className="w-6 h-6 text-blue-400" />}
                        {contract.icon === 'heart' && <HeartIcon className="w-6 h-6 text-pink-400" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{contract.name}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded border ${
                              contract.isToken
                                ? 'bg-orange-600/20 border-orange-500/30 text-orange-400'
                                : 'bg-purple-600/20 border-purple-500/30 text-purple-400'
                            }`}
                          >
                            {contract.type}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium rounded border bg-blue-600/20 border-blue-500/30 text-blue-400">
                            {contract.category}
                          </span>
                          {contract.verified && (
                            <span className="px-2 py-1 text-xs font-medium rounded border bg-green-600/20 border-green-500/30 text-green-400 flex items-center gap-1">
                              <CheckCircleIcon className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                          {isDeployed && (
                            <span className="px-2 py-1 text-xs font-medium rounded border bg-green-600/20 border-green-500/30 text-green-400">
                              ● Live
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4">{contract.description}</p>

                  {/* Stats */}
                  {!loading && data && isDeployed && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-slate-700/50 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Balance</div>
                        <div className="text-white font-semibold">{parseFloat(data.balance).toFixed(4)} NOR</div>
                      </div>
                      <div className="p-3 bg-slate-700/50 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Contract Size</div>
                        <div className="text-white font-semibold">{(data.code.length / 2 / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Contract Address</div>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-sm text-blue-400 font-mono break-all">{contract.address}</code>
                      <button
                        onClick={() => navigator.clipboard.writeText(contract.address)}
                        className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition-colors flex-shrink-0"
                        aria-label="Copy address"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/contracts/${contract.address}`}
                      className="flex-1 h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                    >
                      View Details
                    </Link>
                    {contract.dappUrl && (
                      <Link
                        href={contract.dappUrl}
                        className="flex-1 h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                      >
                        Open dApp
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
