'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBlockchainService, type TokenInfo } from '@/lib/blockchain-service';

// Known token addresses on NorChain
// Only ERC-20 tokens should be added here
const KNOWN_TOKEN_ADDRESSES = [
  '0x0cF8e180350253271f4b917CcFb0aCCc4862F262', // BTCBR Token (Genesis)
  // Protocol contracts (these are NOT ERC-20 tokens):
  // - NORStaking: 0xAe1C7ebcbE42C66a7C03A661505Cc39A5963e286
  // - NORBurnMechanism: 0xe447647577cc340B0D853F9A8F052E9BF5D673c1
  // - NORGovernance: 0xCff12037d60452F18B2D347c8602F03e0C3089C0
  // - NORRevenue: 0xE4bC805e5ED3eB8715A27D4CBAdDF510764aAF53
  // - NORCrowdfunding: 0xbbb1ec421b156f0442D435A875E5267B8A2FDc39
  // - NORCharity: 0x0f8498072DB1611497e2068f9896aeFfcf173583
  // These won't appear in token list as they don't implement ERC-20 standard
];

export default function TokensPage(): JSX.Element {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryProgress, setDiscoveryProgress] = useState('');

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        setDiscoveryProgress('Discovering tokens from blockchain...');

        const service = getBlockchainService();

        // First, try to discover tokens from the blockchain
        // Since NorChain is young, scan all blocks from genesis
        setIsDiscovering(true);
        const discoveredAddresses = await service.discoverTokens(10000); // Scan up to 10000 blocks (all history)

        // Combine discovered tokens with known tokens
        const allAddresses = Array.from(new Set([
          ...KNOWN_TOKEN_ADDRESSES,
          ...discoveredAddresses,
        ]));

        setDiscoveryProgress(`Found ${allAddresses.length} tokens, fetching details...`);

        // Fetch info for all tokens
        const tokensData = await service.getTokensInfo(allAddresses);
        setTokens(tokensData);
        setError(null);
        setIsDiscovering(false);
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setError('Failed to fetch token information from blockchain');
        setIsDiscovering(false);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const handleAddToWallet = async (token: TokenInfo) => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: token.address,
              symbol: token.symbol,
              decimals: token.decimals,
            },
          } as any,
        });
      } catch (error) {
        console.error('Error adding token to wallet:', error);
      }
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Token Tracker</h1>
            <p className="text-gray-400 text-lg">
              ERC-20 tokens deployed on NorChain
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
              <div className="text-sm text-gray-400">Total Tokens</div>
              <div className="text-2xl font-bold text-white">
                {loading ? (
                  <div className="h-8 w-12 bg-gray-700 animate-pulse rounded"></div>
                ) : (
                  tokens.length
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-6 bg-blue-600/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-4">
            <svg className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Token Information</h3>
              <p className="text-gray-300">
                This page displays ERC-20 tokens deployed on NorChain. All data is fetched directly from the blockchain in real-time.
                Click on any token to view detailed information, and you can add tokens to your wallet directly from the explorer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-lg">
              {isDiscovering ? discoveryProgress : 'Loading tokens from blockchain...'}
            </p>
            {isDiscovering && (
              <div className="mt-4 text-sm text-gray-500">
                <p>Scanning blockchain for ERC-20 token contracts...</p>
                <p className="mt-2">This may take a moment on the first load</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <svg className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Tokens</h3>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tokens Table */}
      {!loading && !error && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Contract Address
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total Supply
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Decimals
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {tokens.map((token) => (
                  <tr
                    key={token.address}
                    className="hover:bg-slate-700 transition-colors"
                  >
                    {/* Token Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {token.symbol.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-semibold">{token.name}</div>
                          <div className="text-gray-400 text-sm">{token.symbol}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contract Address */}
                    <td className="px-6 py-4">
                      <Link
                        href={`/address/${token.address}`}
                        className="font-mono text-blue-400 hover:text-blue-300 text-sm"
                      >
                        {token.address.substring(0, 10)}...{token.address.substring(38)}
                      </Link>
                    </td>

                    {/* Total Supply */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-white font-mono">
                        {parseFloat(token.totalSupply).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    {/* Decimals */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-white">{token.decimals}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/address/${token.address}`}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleAddToWallet(token)}
                          aria-label={`Add ${token.symbol} to wallet`}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Add to Wallet
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tokens.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">No tokens found on NorChain</p>
              <p className="text-sm mt-2">Add token addresses to KNOWN_TOKEN_ADDRESSES in the code</p>
            </div>
          )}
        </div>
      )}

      {/* First Token Details Card (if tokens exist) */}
      {!loading && tokens.length > 0 && (
        <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8">
          <div className="flex items-start gap-6">
            <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">
                {tokens[0].symbol.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                {tokens[0].name} ({tokens[0].symbol})
              </h2>
              <p className="text-gray-400 mb-4">
                {tokens[0].symbol} token on NorChain - Live data from blockchain.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Contract</div>
                  <Link
                    href={`/address/${tokens[0].address}`}
                    className="text-blue-400 hover:text-blue-300 font-mono text-sm"
                  >
                    {tokens[0].address.substring(0, 6)}...{tokens[0].address.substring(38)}
                  </Link>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Total Supply</div>
                  <div className="text-white font-semibold">
                    {parseFloat(tokens[0].totalSupply).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Decimals</div>
                  <div className="text-white font-semibold">{tokens[0].decimals}</div>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Type</div>
                  <div className="text-white font-semibold">ERC-20</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
