'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useWallet } from '@/hooks/useWallet';
import { useBalance } from '@/hooks/useBalance';
import { useToast } from '@/components/ToastProvider';
import { isValidAddress } from '@/lib/crypto';
import { TransactionService } from '@/lib/transaction-service';
import { TransactionSyncService } from '@/lib/transaction-sync';
import { KeyManager } from '@/lib/key-manager';
import { PasswordModal } from '@/components/PasswordModal';

function SendPageContent() {
  const router = useRouter();
  const { wallet } = useWallet();
  const { balance, isLoading: isLoadingBalance } = useBalance();
  const { showSuccess, showError } = useToast();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const transactionService = TransactionService.getInstance();
  const transactionSyncService = TransactionSyncService.getInstance();
  const keyManager = KeyManager.getInstance();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate inputs
      if (!isValidAddress(toAddress)) {
        throw new Error('Invalid recipient address');
      }

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Invalid amount');
      }

      // Check balance
      const amountNum = parseFloat(amount);
      const balanceNum = parseFloat(balance);
      if (amountNum > balanceNum) {
        throw new Error('Insufficient balance');
      }

      // Show password modal for signing
      setShowPasswordModal(true);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send transaction';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!wallet) {
      throw new Error('No wallet found');
    }

    setPasswordError(null);
    setIsSending(true);

    try {
      // Get private key from mnemonic
      const privateKey = await keyManager.getPrivateKeyFromMnemonic(
        wallet.mnemonic,
        0
      );

      const chain = wallet.accounts[0]?.chain || 'xaheen';

      // Send transaction
      const result = await transactionService.sendTransaction(
        {
          to: toAddress,
          value: amount,
          chain,
        },
        privateKey
      );

      // Sync transaction to Supabase
      await transactionSyncService.syncTransaction(result, chain);

      showSuccess(`Transaction sent! Hash: ${result.hash}`);
      setShowPasswordModal(false);
      
      // Redirect to transaction details after a short delay
      setTimeout(() => {
        router.push(`/transactions/${result.hash}`);
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send transaction';
      setPasswordError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  const currentAccount = wallet?.accounts[0];

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
          <h1 className="text-2xl font-bold text-white">Send</h1>
        </div>
      </header>

      <div className="px-6 pb-8">
        {/* Balance Card */}
        <div className="glass-card p-6 rounded-2xl mb-6">
          <p className="text-white/60 text-sm mb-2">Available Balance</p>
          <p className="text-3xl font-bold text-white mb-2">
            {isLoadingBalance ? 'Loading...' : `${balance} ETH`}
          </p>
          {currentAccount && (
            <p className="text-white/40 text-xs">
              {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
            </p>
          )}
        </div>

        {/* Send Form */}
        <div className="glass-card p-6 rounded-2xl">
          <form onSubmit={handleSend} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-white/60 text-sm mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="0x..."
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                Amount
              </label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                required
                min="0"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>

            <button
              type="submit"
              disabled={isSending || !toAddress || !amount}
              className="w-full py-3 rounded-xl bg-primary-light hover:bg-primary transition-colors text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordError(null);
        }}
        onConfirm={handlePasswordConfirm}
        title="Confirm Transaction"
        message="Enter your password to sign and send this transaction"
        error={passwordError}
      />
    </div>
  );
}

export default function SendPage() {
  return (
    <ProtectedRoute>
      <SendPageContent />
    </ProtectedRoute>
  );
}

