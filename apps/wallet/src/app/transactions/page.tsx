'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useWallet } from '@/hooks/useWallet';
import { SupabaseService } from '@/lib/supabase-service';
import { formatAddress } from '@/lib/utils';
import { WalletService } from '@/lib/wallet-service';
import { getDemoTransactions, DemoTransaction } from '@/lib/demo-assets';

interface Transaction {
  id: string;
  tx_hash?: string;
  hash?: string;
  from: string;
  to?: string;
  account_address?: string;
  value: string;
  asset?: string;
  status: string;
  created_at?: string;
  timestamp?: string;
  direction?: 'incoming' | 'outgoing';
}

interface TransactionRowProps {
  tx: Transaction | DemoTransaction;
  onClick: () => void;
}

function TransactionRow({ tx, onClick }: TransactionRowProps) {
  return (
    <div
      onClick={onClick}
      className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-2 h-2 rounded-full ${
              tx.status === 'confirmed'
                ? 'bg-green-500'
                : tx.status === 'pending'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
          />
          <span className="text-white font-semibold">
            {tx.status === 'confirmed' ? 'Confirmed' : tx.status}
          </span>
        </div>
        <p className="text-white/60 text-sm">
          {(tx as any).direction === 'outgoing' ? 'To' : 'From'}: {formatAddress((tx as any).to || (tx as any).account_address || '')}
        </p>
        <p className="text-white/40 text-xs mt-1">
          {new Date((tx as any).created_at || (tx as any).timestamp || Date.now()).toLocaleString()}
        </p>
      </div>
      <div className="text-right">
        <p className="text-white font-semibold">
          {tx.value ? parseFloat(tx.value).toFixed(4) : '0.0000'} {(tx as any).asset || 'ETH'}
        </p>
        <p className="text-primary-light text-xs">Tap to view</p>
      </div>
    </div>
  );
}

function TransactionsPageContent() {
  const router = useRouter();
  const { wallet } = useWallet();
  const [transactions, setTransactions] = useState<(Transaction | DemoTransaction)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseService = SupabaseService.getInstance();
  const walletService = WalletService.getInstance();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!wallet?.accounts[0]) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Check if this is a demo wallet
        if (walletService.isDemoWallet()) {
          // Load demo transactions
          const demoTx = getDemoTransactions();
          setTransactions(demoTx as any);
          setIsLoading(false);
          return;
        }

        // Load real transactions from Supabase
        const txList = await supabaseService.fetchTransactions(
          wallet.accounts[0].chain || 'xaheen'
        );
        setTransactions(txList);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [wallet]);

  return (
    <div className="min-h-screen bg-gradient-primary">
      <header className="px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
        </div>
      </header>

      <div className="px-6 pb-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-white/60">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 mb-4">No transactions yet</p>
            <button
              onClick={() => router.push('/send')}
              className="px-6 py-3 rounded-xl bg-primary-light hover:bg-primary transition-colors text-white font-semibold"
            >
              Send First Transaction
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                onClick={() => router.push(`/transactions/${(tx as any).tx_hash || (tx as any).hash || tx.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <ProtectedRoute>
      <TransactionsPageContent />
    </ProtectedRoute>
  );
}

