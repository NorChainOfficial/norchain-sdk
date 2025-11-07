'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SupabaseService } from '@/lib/supabase-service';
import { WalletService } from '@/lib/wallet-service';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    const supabaseService = SupabaseService.getInstance();
    const walletService = WalletService.getInstance();

    const checkAuth = async () => {
      await supabaseService.checkSession();
      setIsAuthenticated(supabaseService.isAuthenticated);
      
      // Check if wallet exists (demo or real)
      const wallet = walletService.getCurrentWallet();
      setHasWallet(!!wallet);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const unsubscribe = supabaseService.onSessionChange((session) => {
      setIsAuthenticated(!!session);
    });

    // Check for wallet changes periodically (for demo wallet creation)
    const walletCheckInterval = setInterval(() => {
      const wallet = walletService.getCurrentWallet();
      if (wallet && !hasWallet) {
        setHasWallet(true);
      }
    }, 500);

    return () => {
      unsubscribe();
      clearInterval(walletCheckInterval);
    };
  }, [hasWallet]);

  // Redirect to wallet page if wallet exists (demo or authenticated)
  useEffect(() => {
    if (!isLoading && (hasWallet || isAuthenticated)) {
      router.push('/wallet');
    }
  }, [isAuthenticated, hasWallet, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show onboarding if no wallet and not authenticated
  if (!hasWallet && !isAuthenticated) {
    return <OnboardingScreen />;
  }

  return <LoadingScreen />;
}

