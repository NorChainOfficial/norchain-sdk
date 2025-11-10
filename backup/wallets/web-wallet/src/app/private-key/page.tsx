'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useWallet } from '@/hooks/useWallet';
import { KeyManager } from '@/lib/key-manager';
import { PasswordModal } from '@/components/PasswordModal';
import { useToast } from '@/components/ToastProvider';
import { formatAddress, copyToClipboard } from '@/lib/utils';

function PrivateKeyPageContent() {
  const router = useRouter();
  const { wallet } = useWallet();
  const { showSuccess, showError } = useToast();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const keyManager = KeyManager.getInstance();

  const handleShowPrivateKey = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!wallet) {
      throw new Error('No wallet found');
    }

    setPasswordError(null);

    try {
      // Get private key from mnemonic
      const key = await keyManager.getPrivateKeyFromMnemonic(wallet.mnemonic, 0);
      setPrivateKey(key);
      setShowPasswordModal(false);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to retrieve private key';
      setPasswordError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const handleCopy = async () => {
    if (!privateKey) return;

    try {
      await copyToClipboard(privateKey);
      showSuccess('Private key copied to clipboard!');
    } catch (error) {
      showError('Failed to copy private key');
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
          <h1 className="text-2xl font-bold text-white">Private Key</h1>
        </div>
      </header>

      <div className="px-6 pb-8">
        {/* Warning */}
        <div className="glass-card p-4 rounded-xl mb-6 bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-400 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-red-200 font-semibold mb-1">⚠️ Warning</p>
              <p className="text-red-200/80 text-sm">
                Never share your private key with anyone. Anyone with access to
                your private key can control your wallet and steal your funds.
              </p>
            </div>
          </div>
        </div>

        {/* Account Info */}
        {currentAccount && (
          <div className="glass-card p-4 rounded-xl mb-6">
            <p className="text-white/60 text-sm mb-2">Account Address</p>
            <p className="text-white font-mono text-sm">
              {formatAddress(currentAccount.address)}
            </p>
          </div>
        )}

        {/* Private Key Display */}
        {privateKey ? (
          <div className="glass-card p-6 rounded-xl">
            <p className="text-white/60 text-sm mb-4">Your Private Key</p>
            <div className="bg-black/30 p-4 rounded-lg mb-4">
              <code className="text-white font-mono text-xs break-all">
                {privateKey}
              </code>
            </div>
            <button
              onClick={handleCopy}
              className="w-full py-3 rounded-xl bg-primary-light hover:bg-primary transition-colors text-white font-semibold"
            >
              Copy Private Key
            </button>
          </div>
        ) : (
          <div className="glass-card p-6 rounded-xl text-center">
            <p className="text-white/60 mb-4">
              Your private key is encrypted and stored securely.
            </p>
            <button
              onClick={handleShowPrivateKey}
              className="w-full py-3 rounded-xl bg-primary-light hover:bg-primary transition-colors text-white font-semibold"
            >
              Reveal Private Key
            </button>
          </div>
        )}
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordError(null);
        }}
        onConfirm={handlePasswordConfirm}
        title="Confirm Access"
        message="Enter your password to view your private key"
        error={passwordError}
      />
    </div>
  );
}

export default function PrivateKeyPage() {
  return (
    <ProtectedRoute>
      <PrivateKeyPageContent />
    </ProtectedRoute>
  );
}

