'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SupabaseService } from '@/lib/supabase-service';
import { WalletService } from '@/lib/wallet-service';

export const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabaseService = SupabaseService.getInstance();
  const walletService = WalletService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await supabaseService.signUp(email, password);
      } else {
        await supabaseService.signIn(email, password);
      }
      // Navigate to wallet page after authentication
      router.push('/wallet');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary px-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">Nor Wallet</h1>
          <p className="text-white/60">Your secure crypto wallet</p>
        </div>

        {/* Auth Form */}
        <div className="glass-card p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-primary-light hover:bg-primary transition-colors font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>

        {/* Wallet Actions */}
        <div className="mt-8 space-y-3">
          <button
            onClick={async () => {
              try {
                setIsLoading(true);
                setError(null);
                await walletService.createDemoWallet();
                // Force navigation - router.push sometimes needs a small delay
                setTimeout(() => {
                  window.location.href = '/wallet';
                }, 100);
              } catch (err: any) {
                setError(err.message || 'Failed to create demo wallet');
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary-light hover:bg-primary transition-colors text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : '🚀 Quick Demo'}
          </button>
          <button
            onClick={() => router.push('/create')}
            className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition-colors"
          >
            Create New Wallet
          </button>
          <button
            onClick={() => router.push('/import')}
            className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition-colors"
          >
            Import Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

