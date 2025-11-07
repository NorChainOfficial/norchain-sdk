'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { createPublicClient, createWalletClient, custom, parseUnits, type Address } from 'viem';
import { bsc } from 'viem/chains';

// Add ethereum type to Window
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Bridge token types
type BridgeToken = 'BNB' | 'USDT' | 'ETH';

interface TokenInfo {
  readonly name: string;
  readonly symbol: string;
  readonly icon: string;
  readonly minAmount: string;
  readonly maxAmount: string;
  readonly bridgeAddress: Address;
  readonly tokenAddress?: Address; // undefined for native BNB
  readonly decimals: number;
}

// Bridge contract addresses from deployment
const BRIDGE_CONTRACTS: Record<BridgeToken, TokenInfo> = {
  BNB: {
    name: 'Binance Coin',
    symbol: 'BNB',
    icon: '💎',
    minAmount: '0.01',
    maxAmount: '10',
    bridgeAddress: '0x9bEFFFa3b43D34a2B470DA21aab3CA3263D0e8C0',
    decimals: 18,
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    icon: '💵',
    minAmount: '10',
    maxAmount: '50000',
    bridgeAddress: '0x7E1c4448A9d87d5C5478B86085AF4e3715a06f48',
    tokenAddress: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
  },
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '💠',
    minAmount: '0.005',
    maxAmount: '5',
    bridgeAddress: '0x99883F508F41Ad3750695E68B456A50909f0F3Fe',
    tokenAddress: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    decimals: 18,
  },
};

// ERC20 ABI for approve
const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Bridge ABI
const BRIDGE_ABI = [
  {
    inputs: [{ name: 'recipient', type: 'address' }],
    name: 'bridgeBNB',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'bridgeUSDT',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'bridgeETH',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

type BridgeStatus = 'idle' | 'connecting' | 'approving' | 'bridging' | 'success' | 'error';

export default function BridgeWidget() {
  const [selectedToken, setSelectedToken] = useState<BridgeToken>('BNB');
  const [amount, setAmount] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<Address | null>(null);
  const [status, setStatus] = useState<BridgeStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  const tokenInfo = BRIDGE_CONTRACTS[selectedToken];

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask not installed. Please install MetaMask to continue.');
      return;
    }

    try {
      setStatus('connecting');
      setStatusMessage('Connecting to MetaMask...');
      setError('');

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as Address[];

      if (accounts && accounts[0]) {
        setWalletAddress(accounts[0]);
        setStatus('idle');
        setStatusMessage('');

        // Check if on BSC network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0x38') {
          setError('Please switch to BSC Mainnet (Chain ID: 56)');
        }
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet. Please try again.');
      setStatus('idle');
    }
  }, []);

  // Check wallet connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          }) as Address[];
          if (accounts && accounts[0]) {
            setWalletAddress(accounts[0]);
          }
        } catch (err) {
          console.log('No wallet connected:', err);
        }
      }
    };
    checkConnection();
  }, []);

  // Auto-fill recipient with connected wallet if empty
  useEffect(() => {
    if (walletAddress && !recipient) {
      setRecipient(walletAddress);
    }
  }, [walletAddress, recipient]);

  // Bridge tokens
  const handleBridge = useCallback(async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      setError('Please enter a valid recipient address');
      return;
    }

    const amountNum = parseFloat(amount);
    const minAmount = parseFloat(tokenInfo.minAmount);
    const maxAmount = parseFloat(tokenInfo.maxAmount);

    if (amountNum < minAmount) {
      setError(`Minimum amount is ${minAmount} ${tokenInfo.symbol}`);
      return;
    }

    if (amountNum > maxAmount) {
      setError(`Maximum amount is ${maxAmount} ${tokenInfo.symbol}`);
      return;
    }

    try {
      setError('');
      setTxHash('');

      const publicClient = createPublicClient({
        chain: bsc,
        transport: custom(window.ethereum!),
      });

      const walletClient = createWalletClient({
        account: walletAddress,
        chain: bsc,
        transport: custom(window.ethereum!),
      });

      const amountWei = parseUnits(amount, tokenInfo.decimals);

      // For ERC20 tokens (USDT, ETH), need to approve first
      if (tokenInfo.tokenAddress) {
        setStatus('approving');
        setStatusMessage(`Approving ${tokenInfo.symbol}...`);

        // Check current allowance
        const allowance = await publicClient.readContract({
          address: tokenInfo.tokenAddress,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [walletAddress, tokenInfo.bridgeAddress],
        });

        if (allowance < amountWei) {
          // Need approval
          const approveTx = await walletClient.writeContract({
            address: tokenInfo.tokenAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [tokenInfo.bridgeAddress, amountWei],
          });

          setStatusMessage(`Waiting for approval confirmation...`);
          await publicClient.waitForTransactionReceipt({ hash: approveTx });
          setStatusMessage(`${tokenInfo.symbol} approved!`);
        }
      }

      // Execute bridge
      setStatus('bridging');
      setStatusMessage(`Bridging ${amount} ${tokenInfo.symbol} to Noor Chain...`);

      let bridgeTx: `0x${string}`;

      if (selectedToken === 'BNB') {
        bridgeTx = await walletClient.writeContract({
          address: tokenInfo.bridgeAddress,
          abi: BRIDGE_ABI,
          functionName: 'bridgeBNB',
          args: [recipient as Address],
          value: amountWei,
        });
      } else if (selectedToken === 'USDT') {
        bridgeTx = await walletClient.writeContract({
          address: tokenInfo.bridgeAddress,
          abi: BRIDGE_ABI,
          functionName: 'bridgeUSDT',
          args: [recipient as Address, amountWei],
        });
      } else {
        // ETH
        bridgeTx = await walletClient.writeContract({
          address: tokenInfo.bridgeAddress,
          abi: BRIDGE_ABI,
          functionName: 'bridgeETH',
          args: [recipient as Address, amountWei],
        });
      }

      setTxHash(bridgeTx);
      setStatusMessage('Waiting for confirmation...');

      await publicClient.waitForTransactionReceipt({ hash: bridgeTx });

      setStatus('success');
      const fee = (parseFloat(amount) * 0.002).toFixed(6);
      const received = (parseFloat(amount) - parseFloat(fee)).toFixed(6);
      setStatusMessage(
        `Success! ${received} W${tokenInfo.symbol} will arrive on Noor Chain in ~30 seconds. Fee: ${fee} ${tokenInfo.symbol} (0.2%)`
      );

      // Reset form
      setAmount('');
    } catch (err: any) {
      console.error('Bridge error:', err);
      setStatus('error');
      setError(err.message || 'Bridge transaction failed. Please try again.');
    }
  }, [walletAddress, amount, recipient, selectedToken, tokenInfo]);

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Bridge to Noor Chain</h2>
        <p className="text-gray-600 mb-6">Transfer assets from BSC to Noor in 30 seconds</p>

        {/* Wallet Connection */}
        {!walletAddress ? (
          <div className="mb-6">
            <button
              onClick={connectWallet}
              disabled={status === 'connecting'}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors shadow-md"
              aria-label="Connect MetaMask wallet"
            >
              {status === 'connecting' ? 'Connecting...' : 'Connect MetaMask'}
            </button>
            <p className="text-sm text-gray-500 mt-2 text-center">
              You need MetaMask to use the bridge
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-800">
              <strong>Connected:</strong> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
        )}

        {/* Token Selection */}
        <div className="mb-6">
          <label htmlFor="token-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Token
          </label>
          <div className="grid grid-cols-3 gap-4">
            {(Object.keys(BRIDGE_CONTRACTS) as BridgeToken[]).map((token) => {
              const info = BRIDGE_CONTRACTS[token];
              return (
                <button
                  key={token}
                  onClick={() => setSelectedToken(token)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedToken === token
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-label={`Select ${info.name}`}
                >
                  <div className="text-3xl mb-2">{info.icon}</div>
                  <div className="font-semibold text-gray-900">{info.symbol}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Min: ${tokenInfo.minAmount}, Max: ${tokenInfo.maxAmount}`}
            step="0.001"
            min={tokenInfo.minAmount}
            max={tokenInfo.maxAmount}
            className="w-full h-14 px-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
            disabled={!walletAddress || status === 'approving' || status === 'bridging'}
          />
          <p className="text-xs text-gray-500 mt-1">
            Range: {tokenInfo.minAmount} - {tokenInfo.maxAmount} {tokenInfo.symbol}
          </p>
        </div>

        {/* Recipient Address */}
        <div className="mb-6">
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
            Noor Address
          </label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full h-14 px-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono text-sm"
            disabled={!walletAddress || status === 'approving' || status === 'bridging'}
          />
          <p className="text-xs text-gray-500 mt-1">
            The address that will receive W{tokenInfo.symbol} on Noor Chain
          </p>
        </div>

        {/* Fee Display */}
        {amount && parseFloat(amount) > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">{amount} {tokenInfo.symbol}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Bridge Fee (0.2%):</span>
              <span className="font-semibold">{(parseFloat(amount) * 0.002).toFixed(6)} {tokenInfo.symbol}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-gray-300 pt-2">
              <span className="text-gray-900">You Receive:</span>
              <span className="text-green-600">{(parseFloat(amount) * 0.998).toFixed(6)} W{tokenInfo.symbol}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ⏱️ Estimated time: 30 seconds
            </p>
          </div>
        )}

        {/* Bridge Button */}
        <button
          onClick={handleBridge}
          disabled={
            !walletAddress ||
            !amount ||
            !recipient ||
            status === 'approving' ||
            status === 'bridging'
          }
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl transition-all shadow-lg disabled:cursor-not-allowed"
          aria-label="Bridge tokens to Noor Chain"
        >
          {status === 'approving' && 'Approving...'}
          {status === 'bridging' && 'Bridging...'}
          {status !== 'approving' && status !== 'bridging' && 'Bridge Now'}
        </button>

        {/* Status Messages */}
        {statusMessage && (
          <div
            className={`mt-6 p-4 rounded-xl border ${
              status === 'success'
                ? 'bg-green-50 border-green-200'
                : status === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <p
              className={`text-sm ${
                status === 'success'
                  ? 'text-green-800'
                  : status === 'error'
                  ? 'text-red-800'
                  : 'text-blue-800'
              }`}
            >
              {statusMessage}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Transaction Link */}
        {txHash && (
          <div className="mt-6">
            <a
              href={`https://bscscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View Transaction on BSCScan
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        )}

        {/* Network Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Network Information</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>From:</strong> BSC Mainnet (Chain ID: 56)</p>
            <p><strong>To:</strong> Noor Chain (Chain ID: 65001)</p>
            <p><strong>Bridge Fee:</strong> 0.2%</p>
            <p><strong>Time:</strong> ~30 seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
}
