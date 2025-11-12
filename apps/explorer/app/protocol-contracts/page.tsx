'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBlockchainService } from '@/lib/blockchain-service';
import { DiamondIcon, BadgeIcon, CoinIcon, FireIcon, CheckCircleIcon, LightningBoltIcon, HeartIcon } from '@/components/icons/Icons';

interface ProtocolContract {
  readonly name: string;
  readonly address: string;
  readonly description: string;
  readonly category: 'Token' | 'DeFi' | 'Governance' | 'Social' | 'Utility';
  readonly icon: string;
  readonly verified: boolean;
  readonly dappUrl?: string;
}

// All verified protocol contracts on Nor Chain
const PROTOCOL_CONTRACTS: ProtocolContract[] = [
  {
    name: 'XHN Governance Token',
    address: '0x24719ba3b4AD49cC7edcbDc536fd97C8526830A0',
    description: 'Native governance token - Captures all platform value, rewards long-term holders, enables DAO voting',
    category: 'Governance',
    icon: 'diamond',
    verified: true,
    dappUrl: '/governance',
  },
  {
    name: 'BTCBR Token',
    address: '0x0cF8e180350253271f4b917CcFb0aCCc4862F262',
    description: 'Bitcoin Brasil - Genesis ERC-20 token with 21 septillion supply',
    category: 'Token',
    icon: 'badge',
    verified: true,
    dappUrl: '/tokens',
  },
  {
    name: 'NOR Staking',
    address: '0xAe1C7ebcbE42C66a7C03A661505Cc39A5963e286',
    description: 'Staking protocol with dynamic APY (8-20%) and validator rewards',
    category: 'DeFi',
    icon: 'coin',
    verified: true,
    dappUrl: '/staking',
  },
  {
    name: 'NOR Burn Mechanism',
    address: '0xe447647577cc340B0D853F9A8F052E9BF5D673c1',
    description: 'Deflationary mechanism burning 50-80% of gas fees',
    category: 'Utility',
    icon: 'fire',
    verified: true,
  },
  {
    name: 'NOR Governance',
    address: '0xCff12037d60452F18B2D347c8602F03e0C3089C0',
    description: 'DAO governance with 7-day voting and 2-day timelock',
    category: 'Governance',
    icon: 'check',
    verified: true,
    dappUrl: '/governance',
  },
  {
    name: 'NOR Revenue',
    address: '0xE4bC805e5ED3eB8715A27D4CBAdDF510764aAF53',
    description: 'Revenue distribution: 50% stakers, 30% validators, 10% burn, 10% treasury',
    category: 'DeFi',
    icon: 'coin',
    verified: true,
  },
  {
    name: 'NOR Crowdfunding',
    address: '0xbbb1ec421b156f0442D435A875E5267B8A2FDc39',
    description: 'Decentralized crowdfunding platform with 2% fee and escrow',
    category: 'Social',
    icon: 'lightning',
    verified: true,
    dappUrl: '/crowdfunding',
  },
  {
    name: 'NOR Charity',
    address: '0x0f8498072DB1611497e2068f9896aeFfcf173583',
    description: 'Zero-fee charity donations with verified organizations',
    category: 'Social',
    icon: 'heart',
    verified: true,
    dappUrl: '/charity',
  },
];

const CATEGORY_COLORS = {
  Token: 'bg-orange-600/20 border-orange-500/30 text-orange-400',
  DeFi: 'bg-blue-600/20 border-blue-500/30 text-blue-400',
  Governance: 'bg-purple-600/20 border-purple-500/30 text-purple-400',
  Social: 'bg-pink-600/20 border-pink-500/30 text-pink-400',
  Utility: 'bg-green-600/20 border-green-500/30 text-green-400',
};

export default function ProtocolContractsPage(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [contractsData, setContractsData] = useState<Map<string, { balance: string; bytecodeSize: number }>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const service = getBlockchainService();
        const dataMap = new Map();

        for (const contract of PROTOCOL_CONTRACTS) {
          try {
            const balance = await service.getBalance(contract.address);
            const code = await service.provider.getCode(contract.address);
            dataMap.set(contract.address, {
              balance,
              bytecodeSize: code.length,
            });
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

  const filteredContracts = selectedCategory === 'all'
    ? PROTOCOL_CONTRACTS
    : PROTOCOL_CONTRACTS.filter(c => c.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(PROTOCOL_CONTRACTS.map(c => c.category)))];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Protocol Contracts</h1>
            <p className="text-gray-400 text-lg">
              All verified protocol contracts deployed on Nor Chain
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-green-600/20 rounded-lg border border-green-500/30">
              <div className="text-sm text-gray-400">Total Contracts</div>
              <div className="text-2xl font-bold text-white">{PROTOCOL_CONTRACTS.length}</div>
            </div>
            <div className="px-4 py-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
              <div className="text-sm text-gray-400">Verified</div>
              <div className="text-2xl font-bold text-white">
                {PROTOCOL_CONTRACTS.filter(c => c.verified).length}
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-6 bg-purple-600/10 border border-purple-500/30 rounded-xl mb-6">
          <div className="flex items-start gap-4">
            <svg className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Nor Chain Infrastructure</h3>
              <p className="text-gray-300">
                These are the core protocol contracts that power Nor Chain. All contracts are verified, audited, and operational.
                Click on any contract to view details, or use the dApp links to interact with them.
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              {category === 'all' ? 'All Contracts' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredContracts.map((contract) => {
          const data = contractsData.get(contract.address);

          return (
            <div
              key={contract.address}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6 hover:border-blue-500/50 transition-all hover:shadow-xl"
            >
              {/* Contract Header */}
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
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${CATEGORY_COLORS[contract.category]}`}>
                        {contract.category}
                      </span>
                      {contract.verified && (
                        <span className="px-2 py-1 text-xs font-medium rounded border bg-green-600/20 border-green-500/30 text-green-400 flex items-center gap-1">
                          <CheckCircleIcon className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4">{contract.description}</p>

              {/* Contract Stats */}
              {!loading && data && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Balance</div>
                    <div className="text-white font-semibold">{parseFloat(data.balance).toFixed(4)} NOR</div>
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Contract Size</div>
                    <div className="text-white font-semibold">{(data.bytecodeSize / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
              )}

              {/* Contract Address */}
              <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Contract Address</div>
                <Link
                  href={`/address/${contract.address}`}
                  className="font-mono text-sm text-blue-400 hover:text-blue-300 break-all"
                >
                  {contract.address}
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/address/${contract.address}`}
                  className="flex-1 h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                >
                  View Contract
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

      {/* Empty State */}
      {filteredContracts.length === 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <div className="text-gray-400 text-lg">No contracts found in this category</div>
        </div>
      )}

      {/* Statistics Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6">
          <div className="text-blue-400 text-sm font-medium mb-2">DeFi Protocols</div>
          <div className="text-3xl font-bold text-white mb-2">
            {PROTOCOL_CONTRACTS.filter(c => c.category === 'DeFi').length}
          </div>
          <div className="text-gray-400 text-sm">Staking & Revenue Distribution</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6">
          <div className="text-purple-400 text-sm font-medium mb-2">Governance</div>
          <div className="text-3xl font-bold text-white mb-2">
            {PROTOCOL_CONTRACTS.filter(c => c.category === 'Governance').length}
          </div>
          <div className="text-gray-400 text-sm">DAO & Voting Systems</div>
        </div>

        <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 border border-pink-500/30 rounded-xl p-6">
          <div className="text-pink-400 text-sm font-medium mb-2">Social Impact</div>
          <div className="text-3xl font-bold text-white mb-2">
            {PROTOCOL_CONTRACTS.filter(c => c.category === 'Social').length}
          </div>
          <div className="text-gray-400 text-sm">Crowdfunding & Charity</div>
        </div>
      </div>

      {/* Developer Info */}
      <div className="mt-12 bg-slate-800 rounded-xl border border-slate-700 p-8">
        <h2 className="text-2xl font-bold text-white mb-4">For Developers</h2>
        <div className="space-y-4 text-gray-300">
          <p>
            All contracts are deployed on Nor Chain and available for integration.
            You can interact with these contracts using Web3 libraries like ethers.js or web3.js.
          </p>
          <div className="p-4 bg-slate-900 rounded-lg font-mono text-sm">
            <div className="text-gray-400 mb-2">// Example: Connect to NOR Staking</div>
            <div className="text-green-400">const stakingAddress = "0xAe1C7ebcbE42C66a7C03A661505Cc39A5963e286";</div>
            <div className="text-blue-400">const provider = new ethers.JsonRpcProvider("http://3.91.50.187:8545");</div>
            <div className="text-yellow-400">const contract = new ethers.Contract(stakingAddress, ABI, provider);</div>
          </div>
        </div>
      </div>
    </div>
  );
}
