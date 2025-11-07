'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { dexService, TOKENS, type SwapQuote } from '@/lib/dex-service';
import { DiamondIcon, SwapIcon } from '@/components/icons/Icons';
import type { Address, Hash } from 'viem';
import BridgeWidget from '@/components/bridge/BridgeWidget';

// DEX Contract Addresses
const DEX_CONTRACTS = {
  WNOR: '0x1299b31D4BC22AF4cBE9c5dC3A760F4636393651',
  Factory: '0x502ec2Ce7cd266Eff9e147d66Df3e4D4fcB9e812',
  Router: '0x0D8e7Ed1B328302bbAA0249CeFD6ca52E050F86e',
  XHN: '0x24719ba3b4AD49cC7edcbDc536fd97C8526830A0',
  BTCBR: '0x0cF8e180350253271f4b917CcFb0aCCc4862F262',
  Pair_NOR_BTCBR: '0x96BEFeb7cE1a6545f0288F62b314f26852999A9B',
};

interface TokenBalance {
  readonly symbol: string;
  readonly balance: string;
  readonly address: string;
}

export default function DEXPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity' | 'bridge' | 'info'>('swap');
  const [fromToken, setFromToken] = useState<'NOR' | 'XHN' | 'BTCBR'>('NOR');
  const [toToken, setToToken] = useState<'NOR' | 'XHN' | 'BTCBR'>('XHN');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<Address | null>(null);
  const [tokenBalances, setTokenBalances] = useState<Record<string, TokenBalance>>({});
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [swapStatus, setSwapStatus] = useState<'idle' | 'approving' | 'swapping' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check wallet connection
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setWalletConnected(true);
            setUserAddress(accounts[0]);
            await fetchBalances(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet:', error);
        }
      }
    };
    checkWallet();
  }, []);

  const fetchBalances = async (address: Address) => {
    try {
      const [xhtBalance, xhnBalance, btcbrBalance] = await Promise.all([
        dexService.getTokenBalance('NOR', address),
        dexService.getTokenBalance('XHN', address),
        dexService.getTokenBalance('BTCBR', address),
      ]);

      setTokenBalances({
        NOR: { symbol: 'NOR', balance: parseFloat(xhtBalance.formatted).toFixed(4), address: 'native' },
        XHN: { symbol: 'XHN', balance: parseFloat(xhnBalance.formatted).toFixed(4), address: DEX_CONTRACTS.XHN },
        BTCBR: { symbol: 'BTCBR', balance: parseFloat(btcbrBalance.formatted).toFixed(4), address: DEX_CONTRACTS.BTCBR },
      });
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletConnected(true);
          setUserAddress(accounts[0]);
          await fetchBalances(accounts[0]);
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask to use the DEX');
    }
  };

  const switchTokens = useCallback(() => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  }, [fromToken, toToken, fromAmount, toAmount]);

  // Get quote when amount changes
  useEffect(() => {
    const getQuote = async () => {
      if (!fromAmount || parseFloat(fromAmount) <= 0 || !userAddress) {
        setQuote(null);
        setToAmount('');
        return;
      }

      setQuoting(true);
      try {
        const quoteResult = await dexService.getSwapQuote({
          fromToken,
          toToken,
          amount: fromAmount,
          slippage: parseFloat(slippage),
          userAddress,
        });
        setQuote(quoteResult);
        setToAmount(quoteResult.amountOut);
        setErrorMessage(null);
      } catch (error) {
        console.error('Error getting quote:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to get quote');
        setQuote(null);
        setToAmount('');
      } finally {
        setQuoting(false);
      }
    };

    const debounce = setTimeout(getQuote, 500);
    return () => clearTimeout(debounce);
  }, [fromAmount, fromToken, toToken, slippage, userAddress]);

  const handleSwap = async () => {
    if (!walletConnected || !userAddress) {
      await connectWallet();
      return;
    }

    if (!quote || !fromAmount) {
      return;
    }

    setLoading(true);
    setSwapStatus('idle');
    setErrorMessage(null);
    setTxHash(null);

    try {
      // Execute swap
      setSwapStatus('swapping');
      const hash = await dexService.executeSwap(
        {
          fromToken,
          toToken,
          amount: fromAmount,
          slippage: parseFloat(slippage),
          userAddress,
        },
        quote
      );

      setTxHash(hash);
      setSwapStatus('success');

      // Wait for confirmation
      await dexService.waitForTransaction(hash);

      // Refresh balances
      await fetchBalances(userAddress);

      // Clear form
      setFromAmount('');
      setToAmount('');
      setQuote(null);

      // Show success message
      alert(`Swap successful! Transaction: ${hash.substring(0, 10)}...`);
    } catch (error) {
      console.error('Swap error:', error);
      setSwapStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Swap failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Noor DEX</h1>
              <p className="text-gray-400 text-lg">Decentralized Exchange on Noor Chain</p>
            </div>

            {/* Wallet Connection */}
            {!walletConnected ? (
              <button
                onClick={connectWallet}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-colors shadow-lg"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="px-6 py-3 bg-green-600/20 border border-green-500/30 rounded-lg">
                <div className="text-sm text-green-400 mb-1">Connected</div>
                <div className="text-white font-mono text-sm">
                  {userAddress?.substring(0, 6)}...{userAddress?.substring(38)}
                </div>
              </div>
            )}
          </div>

          {/* Info Banner */}
          <div className="p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl mb-6">
            <div className="flex items-start gap-4">
              <svg className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Noor Native DEX - Powered by NoorDEXRouter</h3>
                <p className="text-gray-300">
                  Trade NOR, BTCBR, and other tokens directly on Noor Chain. Ultra-low fees, instant swaps, and full decentralization.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('swap')}
            className={`px-6 py-3 font-medium rounded-lg transition-colors ${
              activeTab === 'swap'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            Swap
          </button>
          <button
            onClick={() => setActiveTab('liquidity')}
            className={`px-6 py-3 font-medium rounded-lg transition-colors ${
              activeTab === 'liquidity'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            Liquidity
          </button>
          <button
            onClick={() => setActiveTab('bridge')}
            className={`px-6 py-3 font-medium rounded-lg transition-colors ${
              activeTab === 'bridge'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            Bridge from BSC
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-medium rounded-lg transition-colors ${
              activeTab === 'info'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            DEX Info
          </button>
        </div>

        {/* Swap Interface */}
        {activeTab === 'swap' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Swap Card */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Swap Tokens</h2>

                {/* From Token */}
                <div className="bg-slate-700/50 rounded-lg p-4 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">From</span>
                    {walletConnected && (
                      <span className="text-gray-400 text-sm">
                        Balance: {tokenBalances[fromToken]?.balance || '0'} {fromToken}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 bg-transparent text-2xl font-bold text-white outline-none"
                    />
                    <select
                      value={fromToken}
                      onChange={(e) => setFromToken(e.target.value as 'NOR' | 'XHN' | 'BTCBR')}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 font-medium"
                    >
                      <option value="NOR">NOR</option>
                      <option value="XHN">XHN</option>
                      <option value="BTCBR">BTCBR</option>
                    </select>
                  </div>
                </div>

                {/* Switch Button */}
                <div className="flex justify-center -my-2 relative z-10">
                  <button
                    onClick={switchTokens}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg border-4 border-slate-800 transition-colors"
                  >
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </div>

                {/* To Token */}
                <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">To</span>
                    {walletConnected && (
                      <span className="text-gray-400 text-sm">
                        Balance: {tokenBalances[toToken]?.balance || '0'} {toToken}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={toAmount}
                      onChange={(e) => setToAmount(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 bg-transparent text-2xl font-bold text-white outline-none"
                    />
                    <select
                      value={toToken}
                      onChange={(e) => setToToken(e.target.value as 'NOR' | 'XHN' | 'BTCBR')}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 font-medium"
                    >
                      <option value="NOR">NOR</option>
                      <option value="XHN">XHN</option>
                      <option value="BTCBR">BTCBR</option>
                    </select>
                  </div>
                </div>

                {/* Slippage Settings */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Slippage Tolerance</span>
                    <span className="text-white font-medium">{slippage}%</span>
                  </div>
                  <div className="flex gap-2">
                    {['0.1', '0.5', '1.0'].map((value) => (
                      <button
                        key={value}
                        onClick={() => setSlippage(value)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          slippage === value
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                    <input
                      type="number"
                      value={slippage}
                      onChange={(e) => setSlippage(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 outline-none"
                      placeholder="Custom"
                    />
                  </div>
                </div>

                {/* Quote Details */}
                {quote && fromAmount && toAmount && !errorMessage && (
                  <div className="mb-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-300">
                        <span>Rate:</span>
                        <span className="font-medium text-white">
                          1 {fromToken} = {(parseFloat(quote.amountOut) / parseFloat(quote.amountIn)).toFixed(6)} {toToken}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Minimum Received:</span>
                        <span className="font-medium text-white">{parseFloat(quote.amountOutMin).toFixed(6)} {toToken}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Fee (0.3%):</span>
                        <span className="font-medium text-white">{parseFloat(quote.fee).toFixed(6)} {fromToken}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className="mb-4 p-4 bg-red-600/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
                )}

                {/* Transaction Status */}
                {swapStatus === 'success' && txHash && (
                  <div className="mb-4 p-4 bg-green-600/20 border border-green-500/50 rounded-lg">
                    <p className="text-green-400 text-sm font-medium mb-2">Swap Successful!</p>
                    <a
                      href={`/transactions/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs font-mono break-all"
                    >
                      {txHash}
                    </a>
                  </div>
                )}

                {/* Swap Button */}
                <button
                  onClick={handleSwap}
                  disabled={loading || !fromAmount || !toAmount || quoting || !!errorMessage}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all shadow-lg disabled:cursor-not-allowed"
                >
                  {loading
                    ? swapStatus === 'approving'
                      ? 'Approving Token...'
                      : swapStatus === 'swapping'
                      ? 'Swapping...'
                      : 'Processing...'
                    : quoting
                    ? 'Getting Quote...'
                    : !walletConnected
                    ? 'Connect Wallet to Swap'
                    : !fromAmount || !toAmount
                    ? 'Enter Amount'
                    : errorMessage
                    ? 'Quote Error'
                    : 'Swap'}
                </button>
              </div>
            </div>

            {/* Stats & Info Sidebar */}
            <div className="space-y-6">
              {/* Trading Stats */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Trading Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">24h Volume</div>
                    <div className="text-white font-bold text-xl">$0</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Total Liquidity</div>
                    <div className="text-white font-bold text-xl">$0</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Trading Pairs</div>
                    <div className="text-white font-bold text-xl">3</div>
                  </div>
                </div>
              </div>

              {/* DEX Contracts */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">DEX Contracts</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Router</div>
                    <Link
                      href={`/contracts/${DEX_CONTRACTS.Router}`}
                      className="text-blue-400 hover:text-blue-300 font-mono text-xs break-all"
                    >
                      {DEX_CONTRACTS.Router}
                    </Link>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Factory</div>
                    <Link
                      href={`/contracts/${DEX_CONTRACTS.Factory}`}
                      className="text-blue-400 hover:text-blue-300 font-mono text-xs break-all"
                    >
                      {DEX_CONTRACTS.Factory}
                    </Link>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">WNOR</div>
                    <Link
                      href={`/contracts/${DEX_CONTRACTS.WNOR}`}
                      className="text-blue-400 hover:text-blue-300 font-mono text-xs break-all"
                    >
                      {DEX_CONTRACTS.WNOR}
                    </Link>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                      <DiamondIcon className="w-3 h-3 text-purple-400" />
                      XHN Token
                    </div>
                    <Link
                      href={`/contracts/${DEX_CONTRACTS.XHN}`}
                      className="text-blue-400 hover:text-blue-300 font-mono text-xs break-all"
                    >
                      {DEX_CONTRACTS.XHN}
                    </Link>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">BTCBR Token</div>
                    <Link
                      href={`/contracts/${DEX_CONTRACTS.BTCBR}`}
                      className="text-blue-400 hover:text-blue-300 font-mono text-xs break-all"
                    >
                      {DEX_CONTRACTS.BTCBR}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liquidity Interface */}
        {activeTab === 'liquidity' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Liquidity Pools</h2>
            <p className="text-gray-400 mb-6">Provide liquidity to earn trading fees</p>

            {/* NOR/BTCBR Pool */}
            <div className="bg-slate-700/50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                    <SwapIcon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">NOR / BTCBR</h3>
                    <Link
                      href={`/contracts/${DEX_CONTRACTS.Pair_NOR_BTCBR}`}
                      className="text-blue-400 hover:text-blue-300 text-sm font-mono"
                    >
                      View Pair Contract
                    </Link>
                  </div>
                </div>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  Add Liquidity
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">TVL</div>
                  <div className="text-white font-bold">$0</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">24h Volume</div>
                  <div className="text-white font-bold">$0</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">APY</div>
                  <div className="text-green-400 font-bold">0%</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Your Liquidity</div>
                  <div className="text-white font-bold">$0</div>
                </div>
              </div>
            </div>

            {/* Coming Soon */}
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">More Pools Coming Soon</h3>
              <p className="text-gray-300">Additional trading pairs will be added based on demand</p>
            </div>
          </div>
        )}

        {/* DEX Info */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overview */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">DEX Overview</h2>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Noor DEX is a decentralized exchange built on Noor Chain, offering ultra-low fees and instant token swaps.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Total Volume</div>
                    <div className="text-white font-bold text-xl">$0</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Total Liquidity</div>
                    <div className="text-white font-bold text-xl">$0</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Trading Fee</div>
                    <div className="text-white font-bold text-xl">0.3%</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Total Traders</div>
                    <div className="text-white font-bold text-xl">0</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Features</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-green-600/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">Ultra-Low Fees</div>
                    <div className="text-gray-400 text-sm">Gas fees on Noor Chain are minimal</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-green-600/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">Instant Swaps</div>
                    <div className="text-gray-400 text-sm">5-second block time for fast transactions</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-green-600/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">Non-Custodial</div>
                    <div className="text-gray-400 text-sm">You always control your funds</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-green-600/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">Earn Fees</div>
                    <div className="text-gray-400 text-sm">Liquidity providers earn 0.3% of all trades</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bridge Interface */}
        {activeTab === 'bridge' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3">
                  Bridge from <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">BSC</span>
                </h2>
                <p className="text-gray-300 text-lg mb-4">
                  Transfer BNB, USDT, and ETH from Binance Smart Chain in just 30 seconds
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>0.2% Fee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>30 Second Transfer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Multi-Sig Secure</span>
                  </div>
                </div>
              </div>
              <BridgeWidget />

              {/* Bridge Info */}
              <div className="mt-8 bg-blue-600/10 border border-blue-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">After Bridging</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong className="text-white">Switch to Noor Network:</strong> Your bridged assets will appear after you add Noor Chain to MetaMask
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong className="text-white">Swap for NOR:</strong> Use the Swap tab to trade your wrapped tokens for NOR
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong className="text-white">Start Trading:</strong> Enjoy lightning-fast trades with minimal fees!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
