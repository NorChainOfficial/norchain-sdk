'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useWallet } from '@/hooks/useWallet';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { formatAddress, copyToClipboard } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';

function ReceivePageContent() {
  const router = useRouter();
  const { wallet } = useWallet();
  const { showSuccess } = useToast();
  const [selectedAccount, setSelectedAccount] = useState(wallet?.accounts[0]);

  const address = selectedAccount?.address || '';

  const handleCopy = async () => {
    try {
      await copyToClipboard(address);
      showSuccess('Address copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

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
          <h1 className="text-2xl font-bold text-white">Receive</h1>
        </div>
      </header>

      <div className="px-6 pb-8">
        <div className="glass-card p-8 rounded-2xl text-center mb-6">
          <QRCodeDisplay value={address} size={200} className="mb-6" />
          
          <p className="text-white/60 text-sm mb-2">Your Address</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <code className="text-white font-mono text-sm break-all">
              {formatAddress(address)}
            </code>
            <button
              onClick={handleCopy}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 rounded-xl bg-primary-light hover:bg-primary transition-colors text-white font-semibold"
          >
            Copy Address
          </button>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <p className="text-white/60 text-sm mb-2">Network</p>
          <p className="text-white font-semibold">{selectedAccount?.chain || 'Unknown'}</p>
        </div>
      </div>
    </div>
  );
}

export default function ReceivePage() {
  return (
    <ProtectedRoute>
      <ReceivePageContent />
    </ProtectedRoute>
  );
}

