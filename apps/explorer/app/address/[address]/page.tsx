'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getBlockchainService, type TokenInfo } from '@/lib/blockchain-service';

interface AddressDetails {
  readonly address: string;
  readonly balance: string;
  readonly code: string;
  readonly isContract: boolean;
  readonly isToken: boolean;
  readonly tokenInfo: TokenInfo | null;
  readonly transactionCount: number;
}

export default function AddressDetailPage(): JSX.Element {
  const params = useParams();
  const address = params.address as string;

  const [addressData, setAddressData] = useState<AddressDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddressDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const service = getBlockchainService();

        // Fetch address data from blockchain
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
            isToken = tokenInfo !== null;
          } catch {
            // Not an ERC-20 token
            isToken = false;
            tokenInfo = null;
          }
        }

        setAddressData({
          address,
          balance,
          code,
          isContract,
          isToken,
          tokenInfo,
          transactionCount,
        });
      } catch (err) {
        console.error('Error fetching address details:', err);
        setError('Failed to fetch address details from blockchain');
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchAddressDetails();
    }
  }, [address]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-lg">Loading address from blockchain...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !addressData) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
            <p className="text-red-300">{error || 'Address not found'}</p>
            <Link
              href="/"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If it's a contract, redirect to the contract page
  if (addressData.isContract) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Contract Detected</h3>
            <p className="text-blue-300 mb-4">This address is a smart contract. Redirecting to contract viewer...</p>
            <Link
              href={`/contracts/${address}`}
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              View Contract Details
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
          <span className="text-white">
            {address.substring(0, 10)}...{address.substring(38)}
          </span>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-8 text-white mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold">Address Details</h1>
                <p className="text-emerald-100 mt-2">Wallet address information</p>
              </div>
            </div>

            {/* Balance Badge */}
            <div className="px-6 py-3 bg-white/10 rounded-lg border border-white/20">
              <div className="text-sm text-emerald-100 mb-1">Balance</div>
              <div className="text-2xl font-bold">{parseFloat(addressData.balance).toFixed(4)} NOR</div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="text-sm text-emerald-100 mb-2">Address</div>
            <div className="flex items-center justify-between gap-2">
              <code className="font-mono text-sm break-all">{address}</code>
              <button
                onClick={() => navigator.clipboard.writeText(address)}
                className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded transition-colors flex-shrink-0"
                aria-label="Copy address"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <p className="text-gray-400 text-sm mb-1">Balance</p>
            <p className="text-2xl font-bold text-white">{parseFloat(addressData.balance).toFixed(4)} NOR</p>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <p className="text-gray-400 text-sm mb-1">Transaction Count</p>
            <p className="text-2xl font-bold text-white">{addressData.transactionCount || 0}</p>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <p className="text-gray-400 text-sm mb-1">Type</p>
            <p className="text-2xl font-bold text-white">Wallet Address</p>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">Address Information</h2>
          </div>
          <div className="divide-y divide-slate-700">
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-gray-400 text-sm uppercase tracking-wider">Address</div>
              <div className="md:col-span-2">
                <code className="text-white font-mono text-sm break-all">{address}</code>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-gray-400 text-sm uppercase tracking-wider">Balance</div>
              <div className="md:col-span-2 text-white font-mono">
                {parseFloat(addressData.balance).toFixed(4)} NOR
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-gray-400 text-sm uppercase tracking-wider">Transaction Count</div>
              <div className="md:col-span-2 text-white">{addressData.transactionCount || 0}</div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-gray-400 text-sm uppercase tracking-wider">Type</div>
              <div className="md:col-span-2 text-white">External Wallet Address</div>
            </div>
          </div>
        </div>

        {/* Transactions Notice */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">Transaction History</h3>
          <p className="text-blue-300 mb-4">
            Transaction history is available through the backend API indexer. The indexer service is currently not running.
          </p>
          <p className="text-gray-400 text-sm">
            Once the indexer is enabled, you'll be able to see all transactions for this address.
          </p>
        </div>
      </div>
    </div>
  );
}
