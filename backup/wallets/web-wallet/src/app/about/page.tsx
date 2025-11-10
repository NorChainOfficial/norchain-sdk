'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

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
          <h1 className="text-2xl font-bold text-white">About</h1>
        </div>
      </header>

      <div className="px-6 pb-8">
        <div className="glass-card p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Nor Wallet</h2>
          <p className="text-white/60 mb-4">
            Multi-platform cryptocurrency wallet with cross-platform sync.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Version</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Platform</span>
              <span className="text-white">Web (Next.js)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Backend</span>
              <span className="text-white">Supabase</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
          <ul className="space-y-2 text-white/60">
            <li>✅ Secure wallet creation & import</li>
            <li>✅ Multi-chain support</li>
            <li>✅ Transaction signing & broadcasting</li>
            <li>✅ Real-time transaction monitoring</li>
            <li>✅ Cross-platform sync</li>
            <li>✅ Password-protected operations</li>
          </ul>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-xl font-semibold text-white mb-4">Security</h2>
          <p className="text-white/60 text-sm mb-4">
            Your private keys are never stored unencrypted and never leave your device.
            All sensitive operations require password confirmation.
          </p>
          <div className="space-y-2 text-sm text-white/60">
            <p>• Private keys derived on-demand</p>
            <p>• Password protection for signing</p>
            <p>• Secure storage practices</p>
            <p>• Client-side encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}

