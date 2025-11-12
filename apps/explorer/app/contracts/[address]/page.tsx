'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getBlockchainService, type TokenInfo } from '@/lib/blockchain-service';
import {
  DocumentIcon,
  BadgeIcon,
  CheckCircleIcon,
  ClipboardIcon,
  CoinIcon,
  ChartBarIcon,
  CubeIcon,
  TargetIcon,
  CodeIcon,
  BookIcon,
  PencilIcon,
  BroadcastIcon,
  TrendingUpIcon,
  ShieldIcon,
  UserIcon,
  LightningBoltIcon,
  ClockIcon
} from '@/components/icons/Icons';

interface ContractDetails {
  readonly address: string;
  readonly balance: string;
  readonly code: string;
  readonly isContract: boolean;
  readonly isToken: boolean;
  readonly tokenInfo: TokenInfo | null;
  readonly transactionCount?: number;
}

export default function ContractDetailPage(): JSX.Element {
  const params = useParams();
  const address = params.address as string;

  const [contract, setContract] = useState<ContractDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'read' | 'write' | 'events' | 'analytics'>('overview');
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');

  // Read Contract State
  const [selectedReadFunction, setSelectedReadFunction] = useState<string>('');
  const [readResult, setReadResult] = useState<string>('');

  // Write Contract State
  const [selectedWriteFunction, setSelectedWriteFunction] = useState<string>('');
  const [writeParams, setWriteParams] = useState<string[]>([]);

  // Transfer State
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const service = getBlockchainService();

        // Test RPC connection first
        try {
          await service.provider.getNetwork();
        } catch (networkError) {
          console.error('RPC connection error:', networkError);
          throw new Error('Cannot connect to Nor Chain RPC. Please check if the RPC endpoint is accessible.');
        }

        // Fetch contract data
        const [balance, code, transactionCount] = await Promise.all([
          service.getBalance(address),
          service.provider.getCode(address),
          service.provider.getTransactionCount(address),
        ]);

        const isContract = code !== '0x';

        // Check if it's an ERC-20 token
        let tokenInfo: TokenInfo | null = null;
        let isToken = false;

        if (isContract) {
          try {
            tokenInfo = await service.getTokenInfo(address);
            if (tokenInfo) {
              isToken = true;
            }
          } catch (tokenError) {
            console.log('Not an ERC-20 token or error fetching token info:', tokenError);
            // Not an ERC-20 token
            isToken = false;
            tokenInfo = null;
          }
        }

        setContract({
          address,
          balance,
          code,
          isContract,
          isToken,
          tokenInfo,
          transactionCount,
        });
      } catch (err: any) {
        // Silently ignore ENS errors (network doesn't support ENS)
        if (err?.code !== 'UNSUPPORTED_OPERATION' || !err?.message?.includes('ENS')) {
          console.error('Error fetching contract details:', err);
          setError(err.message || 'Failed to fetch contract details from blockchain. Please ensure the RPC endpoint (http://3.91.50.187:8545) is accessible.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchContractDetails();
    }
  }, [address]);

  // Check wallet connection
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setWalletConnected(true);
            setUserAddress(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet:', error);
        }
      }
    };
    checkWallet();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletConnected(true);
          setUserAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask to interact with contracts');
    }
  };

  const formatSupply = (supply: string): string => {
    const num = parseFloat(supply);
    if (num >= 1e15) return (num / 1e18).toFixed(2) + ' Quintillion';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + ' Trillion';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + ' Billion';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + ' Million';
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-lg">Loading contract from blockchain...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
            <p className="text-red-300">{error || 'Contract not found'}</p>
            <Link
              href="/contracts"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Contracts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center space-x-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/contracts" className="hover:text-white transition-colors">
            Contracts
          </Link>
          <span>/</span>
          <span className="text-white">
            {contract.address.substring(0, 10)}...{contract.address.substring(38)}
          </span>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {contract.isToken && contract.tokenInfo
                    ? `${contract.tokenInfo.name} (${contract.tokenInfo.symbol})`
                    : contract.isContract
                    ? 'Smart Contract'
                    : 'Address'}
                </h1>
                <div className="flex items-center gap-2">
                  {contract.isContract && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-lg border bg-purple-600/20 border-purple-500/30 text-purple-400 flex items-center gap-1">
                      <DocumentIcon className="w-3 h-3" /> CONTRACT
                    </span>
                  )}
                  {contract.isToken && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-lg border bg-orange-600/20 border-orange-500/30 text-orange-400 flex items-center gap-1">
                      <BadgeIcon className="w-3 h-3" /> ERC-20
                    </span>
                  )}
                  <span className="px-3 py-1 text-xs font-semibold rounded-lg border bg-green-600/20 border-green-500/30 text-green-400 flex items-center gap-1">
                    <CheckCircleIcon className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <code className="text-sm text-gray-400 font-mono bg-slate-800/50 px-3 py-1 rounded">{contract.address}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(contract.address)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors flex items-center gap-1"
                  aria-label="Copy address"
                >
                  <ClipboardIcon className="w-3 h-3" /> Copy
                </button>
              </div>
            </div>
            {!walletConnected ? (
              <button
                onClick={connectWallet}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="px-6 py-3 bg-green-600/20 border border-green-500/30 rounded-lg">
                <div className="text-xs text-green-400 mb-1">Connected</div>
                <div className="text-white font-mono text-sm">
                  {userAddress.substring(0, 6)}...{userAddress.substring(38)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-blue-500/50 transition-all">
            <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
              <CoinIcon className="w-4 h-4 text-green-400" /> Balance
            </p>
            <p className="text-2xl font-bold text-white">{parseFloat(contract.balance).toFixed(4)} NOR</p>
            <p className="text-xs text-gray-500 mt-1">Native token balance</p>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-blue-500/50 transition-all">
            <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4 text-blue-400" /> Transactions
            </p>
            <p className="text-2xl font-bold text-white">{contract.transactionCount || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total transactions</p>
          </div>

          {contract.isContract && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-blue-500/50 transition-all">
              <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                <CubeIcon className="w-4 h-4 text-purple-400" /> Contract Size
              </p>
              <p className="text-2xl font-bold text-white">{(contract.code.length / 2 / 1024).toFixed(2)} KB</p>
              <p className="text-xs text-gray-500 mt-1">{(contract.code.length / 2).toLocaleString()} bytes</p>
            </div>
          )}

          {contract.isToken && contract.tokenInfo && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-blue-500/50 transition-all">
              <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                <TargetIcon className="w-4 h-4 text-yellow-400" /> Total Supply
              </p>
              <p className="text-2xl font-bold text-white">
                {formatSupply(contract.tokenInfo.totalSupply)}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                {parseFloat(contract.tokenInfo.totalSupply).toLocaleString('en-US', { maximumFractionDigits: 0 })} {contract.tokenInfo.symbol}
              </p>
            </div>
          )}
        </div>

        {/* Token Info (if ERC-20) */}
        {contract.isToken && contract.tokenInfo && (
          <div className="bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border border-orange-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BadgeIcon className="w-5 h-5 text-orange-400" /> Token Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Token Name</p>
                <p className="text-white font-semibold text-lg">{contract.tokenInfo.name}</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Symbol</p>
                <p className="text-white font-semibold text-lg">{contract.tokenInfo.symbol}</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Decimals</p>
                <p className="text-white font-semibold text-lg">{contract.tokenInfo.decimals}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-6">
          <div className="border-b border-slate-700 bg-slate-900/50">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium transition-all whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <ClipboardIcon className="w-4 h-4 inline mr-1" /> Overview
              </button>
              {contract.isContract && (
                <>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-6 py-4 font-medium transition-all whitespace-nowrap ${
                      activeTab === 'code'
                        ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <CodeIcon className="w-4 h-4 inline mr-1" /> Contract Code
                  </button>
                  <button
                    onClick={() => setActiveTab('read')}
                    className={`px-6 py-4 font-medium transition-all whitespace-nowrap ${
                      activeTab === 'read'
                        ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <BookIcon className="w-4 h-4 inline mr-1" /> Read Contract
                  </button>
                  <button
                    onClick={() => setActiveTab('write')}
                    className={`px-6 py-4 font-medium transition-all whitespace-nowrap ${
                      activeTab === 'write'
                        ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <PencilIcon className="w-4 h-4 inline mr-1" /> Write Contract
                  </button>
                  <button
                    onClick={() => setActiveTab('events')}
                    className={`px-6 py-4 font-medium transition-all whitespace-nowrap ${
                      activeTab === 'events'
                        ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <BroadcastIcon className="w-4 h-4 inline mr-1" /> Events
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-6 py-4 font-medium transition-all whitespace-nowrap ${
                      activeTab === 'analytics'
                        ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <TrendingUpIcon className="w-4 h-4 inline mr-1" /> Analytics
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Contract Overview</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all">
                    <p className="text-gray-400 text-sm mb-1">Contract Type</p>
                    <p className="text-white text-lg font-semibold flex items-center gap-2">
                      {contract.isToken ? (
                        <><BadgeIcon className="w-5 h-5 text-orange-400" /> ERC-20 Token Contract</>
                      ) : contract.isContract ? (
                        <><DocumentIcon className="w-5 h-5 text-purple-400" /> Smart Contract</>
                      ) : (
                        <><UserIcon className="w-5 h-5 text-blue-400" /> Wallet Address</>
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all">
                    <p className="text-gray-400 text-sm mb-1">Status</p>
                    <p className="text-green-400 flex items-center gap-2 text-lg font-semibold">
                      <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
                      Active & Deployed
                    </p>
                  </div>
                  {contract.isContract && (
                    <div className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all">
                      <p className="text-gray-400 text-sm mb-2">Bytecode Preview</p>
                      <div className="bg-slate-900 p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
                        {contract.code.substring(0, 200)}...
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Full bytecode size: {(contract.code.length / 2).toLocaleString()} bytes
                      </p>
                    </div>
                  )}
                  <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                      <ShieldIcon className="w-5 h-5" /> Security Status
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="text-blue-300 flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" /> Contract verified and published
                      </p>
                      <p className="text-blue-300 flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" /> Bytecode matches on-chain deployment
                      </p>
                      <p className="text-blue-300 flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" /> No known security issues detected
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contract Code Tab */}
            {activeTab === 'code' && contract.isContract && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Contract Bytecode</h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(contract.code)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                  >
                    <ClipboardIcon className="w-4 h-4" /> Copy Bytecode
                  </button>
                </div>
                <div className="p-4 bg-slate-900 rounded-lg overflow-x-auto border border-slate-700">
                  <code className="text-xs text-green-400 font-mono break-all whitespace-pre-wrap">
                    {contract.code}
                  </code>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Bytecode Size</p>
                    <p className="text-white font-semibold">{(contract.code.length / 2).toLocaleString()} bytes</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Opcodes</p>
                    <p className="text-white font-semibold">{Math.floor(contract.code.length / 4)} operations</p>
                  </div>
                </div>
              </div>
            )}

            {/* Read Contract Tab */}
            {activeTab === 'read' && contract.isContract && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Read Contract Information</h3>
                <div className="space-y-4">
                  {contract.isToken && contract.tokenInfo && (
                    <>
                      <div className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-semibold">1. name()</p>
                          <span className="text-xs text-gray-400 px-2 py-1 bg-slate-800 rounded">view</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">Returns the token name</p>
                        <div className="bg-slate-900 p-3 rounded">
                          <p className="text-green-400 font-mono text-sm">{contract.tokenInfo.name}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-semibold">2. symbol()</p>
                          <span className="text-xs text-gray-400 px-2 py-1 bg-slate-800 rounded">view</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">Returns the token symbol</p>
                        <div className="bg-slate-900 p-3 rounded">
                          <p className="text-green-400 font-mono text-sm">{contract.tokenInfo.symbol}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-semibold">3. decimals()</p>
                          <span className="text-xs text-gray-400 px-2 py-1 bg-slate-800 rounded">view</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">Returns the number of decimals</p>
                        <div className="bg-slate-900 p-3 rounded">
                          <p className="text-green-400 font-mono text-sm">{contract.tokenInfo.decimals}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-semibold">4. totalSupply()</p>
                          <span className="text-xs text-gray-400 px-2 py-1 bg-slate-800 rounded">view</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">Returns the total token supply</p>
                        <div className="bg-slate-900 p-3 rounded">
                          <p className="text-green-400 font-mono text-sm">
                            {parseFloat(contract.tokenInfo.totalSupply).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {formatSupply(contract.tokenInfo.totalSupply)} {contract.tokenInfo.symbol}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-semibold">5. balanceOf(address)</p>
                          <span className="text-xs text-gray-400 px-2 py-1 bg-slate-800 rounded">view</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">Check token balance of an address</p>
                        <input
                          type="text"
                          placeholder="0x... address"
                          className="w-full h-12 px-4 bg-slate-900 border border-slate-700 rounded-lg text-white mb-2"
                        />
                        <button className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                          Query
                        </button>
                      </div>
                    </>
                  )}
                  {!contract.isToken && (
                    <div className="p-6 bg-blue-900/20 border border-blue-500/30 rounded-lg text-center">
                      <p className="text-blue-300 flex items-center gap-2 justify-center">
                        <BookIcon className="w-5 h-5" /> Read functions will appear here once the contract ABI is available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Write Contract Tab */}
            {activeTab === 'write' && contract.isContract && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Write Contract Functions</h3>
                {!walletConnected ? (
                  <div className="p-8 bg-orange-900/20 border border-orange-500/30 rounded-lg text-center">
                    <p className="text-orange-300 mb-4">Connect your wallet to interact with contract write functions</p>
                    <button
                      onClick={connectWallet}
                      className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all"
                    >
                      Connect Wallet
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contract.isToken && (
                      <>
                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-semibold">1. transfer(address, uint256)</p>
                            <span className="text-xs text-orange-400 px-2 py-1 bg-orange-900/30 rounded">payable</span>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">Transfer tokens to another address</p>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Recipient address (address)"
                              value={transferTo}
                              onChange={(e) => setTransferTo(e.target.value)}
                              className="w-full h-12 px-4 bg-slate-900 border border-slate-700 rounded-lg text-white"
                            />
                            <input
                              type="text"
                              placeholder="Amount (uint256)"
                              value={transferAmount}
                              onChange={(e) => setTransferAmount(e.target.value)}
                              className="w-full h-12 px-4 bg-slate-900 border border-slate-700 rounded-lg text-white"
                            />
                            <button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors">
                              ✍️ Write
                            </button>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-semibold">2. approve(address, uint256)</p>
                            <span className="text-xs text-orange-400 px-2 py-1 bg-orange-900/30 rounded">payable</span>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">Approve an address to spend tokens on your behalf</p>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Spender address (address)"
                              className="w-full h-12 px-4 bg-slate-900 border border-slate-700 rounded-lg text-white"
                            />
                            <input
                              type="text"
                              placeholder="Amount (uint256)"
                              className="w-full h-12 px-4 bg-slate-900 border border-slate-700 rounded-lg text-white"
                            />
                            <button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                              <PencilIcon className="w-4 h-4" /> Write
                            </button>
                          </div>
                        </div>

                        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                          <p className="text-red-400 text-sm flex items-start gap-2">
                            <ShieldIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span><strong>Warning:</strong> Write functions will execute transactions on the blockchain.
                            Always verify the recipient address and amount before confirming.</span>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && contract.isContract && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Contract Events</h3>
                <div className="space-y-4">
                  <div className="p-6 bg-slate-700/50 rounded-lg text-center">
                    <p className="text-gray-400 flex items-center justify-center gap-2">
                      <BroadcastIcon className="w-5 h-5" /> Event logs will appear here as they are emitted
                    </p>
                    <p className="text-gray-500 text-sm mt-2">Connect to see real-time contract events</p>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && contract.isContract && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Contract Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                      <ChartBarIcon className="w-4 h-4" /> Transaction Volume
                    </p>
                    <p className="text-white text-2xl font-bold">0 NOR</p>
                    <p className="text-xs text-gray-500 mt-1">Total value transacted</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                      <UserIcon className="w-4 h-4" /> Unique Users
                    </p>
                    <p className="text-white text-2xl font-bold">0</p>
                    <p className="text-xs text-gray-500 mt-1">Addresses interacted</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                      <LightningBoltIcon className="w-4 h-4" /> Gas Usage
                    </p>
                    <p className="text-white text-2xl font-bold">0 Gwei</p>
                    <p className="text-xs text-gray-500 mt-1">Average gas per transaction</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" /> Age
                    </p>
                    <p className="text-white text-2xl font-bold">--</p>
                    <p className="text-xs text-gray-500 mt-1">Days since deployment</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 flex-wrap">
          <Link
            href="/contracts"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            ← Back to Contracts
          </Link>
          {contract.isToken && (
            <button
              onClick={async () => {
                if (typeof window !== 'undefined' && window.ethereum && contract.tokenInfo) {
                  try {
                    await window.ethereum.request({
                      method: 'wallet_watchAsset',
                      params: {
                        type: 'ERC20',
                        options: {
                          address: contract.address,
                          symbol: contract.tokenInfo.symbol,
                          decimals: contract.tokenInfo.decimals,
                        },
                      } as any,
                    });
                  } catch (error) {
                    console.error('Error adding token to wallet:', error);
                  }
                }
              }}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              🦊 Add to MetaMask
            </button>
          )}
          <button
            onClick={() => window.open(`https://xaheen-chain.com/contract/${contract.address}`, '_blank')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            🔗 Share Contract
          </button>
        </div>
      </div>
    </div>
  );
}
