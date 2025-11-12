'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Account, Transaction } from '@/types';
import Link from 'next/link';
import { formatXAHEEN, truncateHash, isContractAddress } from '@/lib/utils';
import { ContractBadge } from '@/components/ui/ContractBadge';
import { CopyButton } from '@/components/ui/CopyButton';
import { TokenHoldings } from '@/components/accounts/TokenHoldings';
import { InternalTransactions } from '@/components/accounts/InternalTransactions';
import { BalanceHistoryChart } from '@/components/accounts/BalanceHistoryChart';
import { RiskScore } from '@/components/accounts/RiskScore';
import { AddressLabelManager } from '@/components/search/AddressLabels';

type TabType = 'overview' | 'transactions' | 'tokens' | 'contract';

export default function AddressDetailPage(): JSX.Element {
  const params = useParams();
  const address = params?.address as string;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [txPage, setTxPage] = useState(1);

  // Fetch account details
  const { data: accountData, isLoading: accountLoading, error: accountError } = useQuery({
    queryKey: ['account', address],
    queryFn: () => apiClient.getAccount(address),
    enabled: !!address,
  });

  const account: Account | undefined = accountData?.data;
  const isContract = account ? isContractAddress(account.address, account.type) : false;

  // Fetch account transactions
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['account-transactions', address, txPage],
    queryFn: () => apiClient.getAccountTransactions(address, { page: txPage, per_page: 20 }),
    enabled: !!address && activeTab === 'transactions',
  });

  if (accountError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Error Loading Account</h2>
            <p className="text-red-700 dark:text-red-300">
              {accountError instanceof Error ? accountError.message : 'Account not found'}
            </p>
            <Link
              href="/accounts"
              className="mt-4 inline-block text-red-600 dark:text-red-400 hover:underline"
            >
              ← Back to Accounts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions', count: account?.tx_count || 0 },
    { id: 'tokens', label: 'Tokens', count: 1 }, // Native token + ERC-20 tokens
  ];

  // Add internal transactions tab if available
  // Note: Internal transactions feature will be added when internal transaction indexing is implemented
  const hasInternalTxs = false;

  if (isContract) {
    tabs.push({ id: 'contract', label: 'Contract' });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href="/accounts"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Accounts
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Address Details</h1>
                  {isContract && <ContractBadge isContract={true} size="md" />}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Detailed information about this account</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <span className="font-mono text-sm text-gray-900 dark:text-white break-all flex-1">
              {address}
            </span>
            <CopyButton value={address} />
            <AddressLabelManager address={address} />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTabEnhanced
                address={address}
                account={account}
                isLoading={accountLoading}
              />
            )}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <TransactionsTab
                  transactions={txData?.data || []}
                  isLoading={txLoading}
                  pagination={txData?.meta}
                  currentPage={txPage}
                  onPageChange={setTxPage}
                />
                {/* Internal Transactions Section */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Internal Transactions</h3>
                  <InternalTransactions address={address} />
                </div>
              </div>
            )}
            {activeTab === 'tokens' && (
              <TokensTabEnhanced
                address={address}
                account={account}
                isLoading={accountLoading}
              />
            )}
            {activeTab === 'contract' && isContract && <ContractTab address={address} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ account, isLoading }: { readonly account?: Account; readonly isLoading: boolean }): JSX.Element {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse flex justify-between py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!account) {
    return <div className="text-center text-gray-500 dark:text-gray-400 py-8">Account not found</div>;
  }

  const details = [
    { label: 'Balance', value: `${formatXAHEEN(account.balance)} XAHEEN`, highlight: true },
    { label: 'Transaction Count', value: account.tx_count?.toString() || '0' },
    { label: 'Account Type', value: account.type || 'standard' },
    { label: 'First Seen', value: account.first_seen_at ? new Date(account.first_seen_at).toLocaleString() : 'Unknown' },
    { label: 'Last Active', value: account.last_active_at ? new Date(account.last_active_at).toLocaleString() : 'Never' },
  ];

  return (
    <div className="space-y-1">
      {details.map((detail, index) => (
        <div
          key={index}
          className="flex justify-between py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <span className="text-gray-600 dark:text-gray-400 font-medium">{detail.label}</span>
          <span className={`${detail.highlight ? 'text-blue-600 dark:text-blue-400 font-bold text-lg' : 'text-gray-900 dark:text-white'}`}>
            {detail.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// Transactions Tab Component
interface TransactionsTabProps {
  readonly transactions: Transaction[];
  readonly isLoading: boolean;
  readonly pagination?: {
    readonly current_page: number;
    readonly last_page: number;
    readonly per_page: number;
    readonly total: number;
  };
  readonly currentPage: number;
  readonly onPageChange: (page: number) => void;
}

function TransactionsTab({ transactions, isLoading, pagination, currentPage, onPageChange }: TransactionsTabProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium">No transactions found</p>
        <p className="text-sm mt-1">This address hasn't made any transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Transactions List */}
      <div className="space-y-3">
        {transactions.map((tx: Transaction) => (
          <Link
            key={tx.id}
            href={`/transactions/${tx.hash}`}
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                  {truncateHash(tx.hash)}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  tx.status === 'success'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {tx.status}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Block #{tx.block_height}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {formatXAHEEN(tx.amount || '0')} XAHEEN
              </span>
              <span className="text-gray-500 dark:text-gray-500 text-xs">
                {new Date(tx.timestamp).toLocaleString()}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total > pagination.per_page && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentPage - 1) * pagination.per_page) + 1} to {Math.min(currentPage * pagination.per_page, pagination.total)} of {pagination.total} transactions
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= pagination.last_page}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Overview Tab Component
function OverviewTabEnhanced({
  address,
  account,
  isLoading,
}: {
  readonly address: string;
  readonly account?: Account;
  readonly isLoading: boolean;
}): JSX.Element {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse flex justify-between py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!account) {
    return <div className="text-center text-gray-500 dark:text-gray-400 py-8">Account not found</div>;
  }

  const details = [
    { label: 'Balance', value: `${formatXAHEEN(account.balance)} NOR`, highlight: true },
    { label: 'Transaction Count', value: account.tx_count?.toString() || '0' },
    { label: 'Account Type', value: account.type || 'standard' },
    { label: 'First Seen', value: account.first_seen_at ? new Date(account.first_seen_at).toLocaleString() : 'Unknown' },
    { label: 'Last Active', value: account.last_active_at ? new Date(account.last_active_at).toLocaleString() : 'Never' },
  ];

  return (
    <div className="space-y-6">
      {/* Account Details */}
      <div className="space-y-1">
        {details.map((detail, index) => (
          <div
            key={index}
            className="flex justify-between py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <span className="text-gray-600 dark:text-gray-400 font-medium">{detail.label}</span>
            <span className={`${detail.highlight ? 'text-blue-600 dark:text-blue-400 font-bold text-lg' : 'text-gray-900 dark:text-white'}`}>
              {detail.value}
            </span>
          </div>
        ))}
      </div>

      {/* Risk Score */}
      <RiskScore address={address} />

      {/* Balance History */}
      <BalanceHistoryChart address={address} />
    </div>
  );
}

// Enhanced Tokens Tab Component
function TokensTabEnhanced({
  address,
  account,
  isLoading,
}: {
  readonly address: string;
  readonly account?: Account;
  readonly isLoading: boolean;
}): JSX.Element {
  if (!account) {
    return <div className="text-center text-gray-500 dark:text-gray-400 py-8">No token data available</div>;
  }

  // TODO: Fetch ERC-20 token holdings from API
  // For now, just show native token
  const tokenHoldings: any[] = []; // Will be populated from API

  return (
    <TokenHoldings
      address={address}
      nativeBalance={account.balance || '0'}
      tokenHoldings={tokenHoldings}
      isLoading={isLoading}
    />
  );
}

// Contract Tab Component
function ContractTab({ address }: { readonly address: string }): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contract Address</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">This is a smart contract or module account</p>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg font-mono text-sm break-all">
          {address}
        </div>
      </div>

      {/* Contract Verification - Coming Soon */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Contract Verification</h4>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">Coming Soon</p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Contract verification and source code viewing features will be available in a future update.
                This will allow you to verify contract bytecode and view the source code.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Contract Type</p>
              <p className="text-sm text-gray-900 dark:text-white">Module / Smart Contract</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Verification Status</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Not Verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Contract Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">About Contract Accounts</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Contract accounts on Nor Chain can be Cosmos SDK module accounts or WebAssembly smart contracts.
              They have special permissions and capabilities beyond regular user accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
