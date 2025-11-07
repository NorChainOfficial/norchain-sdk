'use client';

import React from 'react';
import Link from 'next/link';

export default function BuyNORPage(): JSX.Element {
  const addNoorNetwork = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xD8680',
              chainName: 'NorChain',
              nativeCurrency: {
                name: 'Noor Token',
                symbol: 'NOR',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.norchain.org'],
              blockExplorerUrls: ['https://explorer.norchain.org'],
            },
          ],
        });
        alert('NorChain added to MetaMask!');
      } catch (error) {
        console.error('Error adding network:', error);
        alert('Failed to add network. Please add manually.');
      }
    } else {
      alert('Please install MetaMask first!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            How to Buy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">NOR</span>
          </h1>
          <p className="text-xl text-gray-300">
            Complete guide to purchasing Noor Token (NOR) on NoorSwap
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-xl p-6">
            <div className="text-blue-400 text-sm font-medium mb-2">Current Price</div>
            <div className="text-white text-3xl font-bold mb-1">$0.0000024</div>
            <div className="text-green-400 text-sm">↑ 2.3% (24h)</div>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-xl p-6">
            <div className="text-purple-400 text-sm font-medium mb-2">Total Supply</div>
            <div className="text-white text-3xl font-bold">1T NOR</div>
            <div className="text-gray-400 text-sm">Fixed supply</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-700/20 border border-indigo-500/30 rounded-xl p-6">
            <div className="text-indigo-400 text-sm font-medium mb-2">Market Cap</div>
            <div className="text-white text-3xl font-bold">$2.4M</div>
            <div className="text-gray-400 text-sm">Fully diluted</div>
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <div className="space-y-8 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Step-by-Step Guide</h2>

          {/* Step 1 */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-4">Install MetaMask Wallet</h3>
                <p className="text-gray-300 mb-4">
                  MetaMask is a cryptocurrency wallet that allows you to interact with the Noor Chain.
                  If you don't have it installed yet, download it from the official website.
                </p>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.9 9.9c-.2-.5-.9-1.1-1.4-1-1.5.4-3.6 1-5.1 1.4-.3 0-.5.2-.5.5v8.3c0 .3.2.5.5.5.2 0 .3 0 .5-.2 1.4-1 3.5-2.6 4.9-3.7.5-.4.8-1 .8-1.6V11c0-.4-.1-.7-.3-1.1zM9 3.5c0-.3-.2-.5-.5-.5H3c-.3 0-.5.2-.5.5v5.6c0 .6.3 1.2.8 1.6 1.4 1.1 3.5 2.7 4.9 3.7.2.1.3.2.5.2.3 0 .5-.2.5-.5V3.5zm11.5 0c0-.3-.2-.5-.5-.5h-5.5c-.3 0-.5.2-.5.5v10.6c0 .3.2.5.5.5.2 0 .3 0 .5-.2 1.4-1 3.5-2.6 4.9-3.7.5-.4.8-1 .8-1.6V3.5z"/>
                  </svg>
                  Download MetaMask
                </a>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-4">Add Noor Chain to MetaMask</h3>
                <p className="text-gray-300 mb-4">
                  Connect your MetaMask wallet to the Noor Chain network. Click the button below to automatically
                  add the network configuration to MetaMask.
                </p>
                <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400 mb-1">Network Name</div>
                      <div className="text-white font-mono">Noor Chain</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Chain ID</div>
                      <div className="text-white font-mono">885824</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">RPC URL</div>
                      <div className="text-white font-mono text-xs">https://rpc.norchain.org</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Symbol</div>
                      <div className="text-white font-mono">NOR</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={addNoorNetwork}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Noor Network
                </button>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-4">Get USDT on Noor Chain</h3>
                <p className="text-gray-300 mb-4">
                  You need USDT on Noor Chain to buy NOR. You have two options:
                </p>

                <div className="space-y-4">
                  {/* Option A: Bridge */}
                  <div className="bg-slate-700/50 rounded-lg p-6 border-l-4 border-blue-500">
                    <h4 className="text-lg font-bold text-white mb-3">Option A: Bridge from BSC (Recommended)</h4>
                    <p className="text-gray-300 mb-4">
                      Bridge USDT from Binance Smart Chain to Noor Chain using our cross-chain bridge.
                    </p>
                    <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-blue-200">
                          Bridge UI coming soon! For now, you can buy NOR with native NOR tokens if you already have them on Noor Chain.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Option B: Buy Native NOR */}
                  <div className="bg-slate-700/50 rounded-lg p-6 border-l-4 border-green-500">
                    <h4 className="text-lg font-bold text-white mb-3">Option B: Already Have Native NOR?</h4>
                    <p className="text-gray-300 mb-4">
                      If you already have native NOR tokens in your wallet, you can proceed directly to the DEX to swap for other tokens.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-4">Swap USDT for NOR on NoorSwap</h3>
                <p className="text-gray-300 mb-4">
                  Once you have USDT on Noor Chain, you can swap it for NOR on our decentralized exchange.
                </p>
                <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                  <h5 className="text-white font-medium mb-3">Swap Process:</h5>
                  <ol className="space-y-2 text-gray-300 text-sm list-decimal list-inside">
                    <li>Visit NoorSwap DEX</li>
                    <li>Connect your MetaMask wallet</li>
                    <li>Select USDT as the "From" token</li>
                    <li>Select NOR as the "To" token</li>
                    <li>Enter the amount you want to swap</li>
                    <li>Review the quote and slippage settings</li>
                    <li>Click "Swap" and confirm the transaction</li>
                    <li>Wait for confirmation (usually 3-5 seconds)</li>
                  </ol>
                </div>
                <Link
                  href="/dex"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-bold rounded-lg transition-colors shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  Start Swapping on NoorSwap
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">What is NOR?</h3>
              <p className="text-gray-300">
                NOR is the native token of Noor Chain, a high-performance blockchain designed for DeFi applications.
                It's used for gas fees, staking, and governance.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">What are the fees?</h3>
              <p className="text-gray-300">
                NoorSwap charges a 0.3% trading fee on all swaps, which goes to liquidity providers.
                Gas fees on Noor Chain are extremely low, typically less than $0.01 per transaction.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">How long does a swap take?</h3>
              <p className="text-gray-300">
                Swaps on Noor Chain are near-instant, with block times of just 3 seconds.
                Most transactions are confirmed within 5-10 seconds.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">Is it safe?</h3>
              <p className="text-gray-300">
                NoorSwap uses audited smart contracts based on Uniswap V2. Your funds are always in your control -
                we never have access to your private keys. Always ensure you're on the official website: explorer.norchain.org
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">What if I need help?</h3>
              <p className="text-gray-300">
                Join our community on Telegram or Discord for support. Our team is active and ready to help with any questions.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Buy NOR?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start swapping in less than 5 minutes!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dex"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg text-lg"
            >
              Go to NoorSwap
            </Link>
            <a
              href="https://docs.norchain.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors text-lg"
            >
              Read Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
