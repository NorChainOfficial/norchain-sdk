'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WalletService } from '@/lib/wallet-service';
import { useToast } from './ToastProvider';

export const CreateWalletScreen: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const walletService = WalletService.getInstance();

  const handleCreateWallet = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const wallet = await walletService.createWallet();
      setMnemonic(wallet.mnemonic);
      showSuccess('Wallet created successfully!');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create wallet';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportWallet = () => {
    router.push('/import');
  };

  if (mnemonic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary px-4">
        <div className="w-full max-w-md glass-card p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Your Recovery Phrase</h2>
            <p className="text-white/60 mb-6 text-sm">
            Write down these 12 words in order and keep them safe. You&apos;ll need them to recover your wallet.
          </p>
          
          <div className="bg-white/5 p-4 rounded-xl mb-6">
            <div className="grid grid-cols-2 gap-2">
              {mnemonic.split(' ').map((word, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-white/40 text-xs w-6">{index + 1}.</span>
                  <span className="text-white font-semibold">{word}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(mnemonic);
                  showSuccess('Copied to clipboard!');
                } catch (err) {
                  showError('Failed to copy');
                }
              }}
              className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition-colors"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={() => router.push('/wallet')}
              className="w-full py-3 rounded-xl bg-primary-light hover:bg-primary transition-colors text-white font-semibold"
            >
              I've Saved My Phrase
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Wallet</h1>
          <p className="text-white/60">Generate a new wallet</p>
        </div>

        <div className="glass-card p-8 rounded-2xl mb-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-white font-semibold mb-2">Important:</h3>
            <ul className="text-white/60 text-sm space-y-1 list-disc list-inside">
              <li>You&apos;ll receive a 12-word recovery phrase</li>
              <li>Write it down and keep it safe</li>
              <li>Never share it with anyone</li>
              <li>It&apos;s the only way to recover your wallet</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCreateWallet}
              disabled={isCreating}
              className="w-full py-3 rounded-xl bg-primary-light hover:bg-primary transition-colors text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create New Wallet'}
            </button>
            <button
              onClick={handleImportWallet}
              className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition-colors"
            >
              Import Existing Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

