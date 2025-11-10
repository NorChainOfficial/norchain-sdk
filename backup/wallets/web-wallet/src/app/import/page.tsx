'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { WalletService } from '@/lib/wallet-service';
import { useToast } from '@/components/ToastProvider';
import { validateMnemonic } from '@/lib/crypto';

function ImportWalletPageContent() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [mnemonic, setMnemonic] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const walletService = WalletService.getInstance();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsImporting(true);
    setError(null);

    try {
      // Validate mnemonic before importing
      const trimmedMnemonic = mnemonic.trim();
      if (!validateMnemonic(trimmedMnemonic)) {
        throw new Error('Invalid mnemonic phrase. Please check your recovery phrase.');
      }

      await walletService.importWallet(trimmedMnemonic);
      showSuccess('Wallet imported successfully!');
      router.push('/wallet');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to import wallet';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Import Wallet</h1>
          <p className="text-white/60">Restore wallet from recovery phrase</p>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">
                Recovery Phrase (12 words)
              </label>
              <textarea
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                placeholder="Enter your 12-word recovery phrase"
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-light resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isImporting || !mnemonic.trim()}
              className="w-full py-3 rounded-xl bg-primary-light hover:bg-primary transition-colors text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Importing...' : 'Import Wallet'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/create')}
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              Don&apos;t have a wallet? Create one
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ImportWalletPage() {
  return (
    <ProtectedRoute>
      <ImportWalletPageContent />
    </ProtectedRoute>
  );
}

