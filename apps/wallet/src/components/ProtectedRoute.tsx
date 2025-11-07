/**
 * Protected Route Component
 * Allows access if authenticated OR has wallet (demo or real)
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import { WalletService } from '@/lib/wallet-service';
import { LoadingScreen } from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useSupabase();
  const [hasWallet, setHasWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const walletService = WalletService.getInstance();
    const wallet = walletService.getCurrentWallet();
    setHasWallet(!!wallet);
    setIsLoading(false);
  }, []);

  // Allow access if authenticated OR has wallet (including demo)
  const hasAccess = isAuthenticated || hasWallet;
  const isLoadingCheck = authLoading || isLoading;

  useEffect(() => {
    if (!isLoadingCheck && !hasAccess) {
      router.push('/');
    }
  }, [hasAccess, isLoadingCheck, router]);

  if (isLoadingCheck) {
    return <LoadingScreen />;
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}

