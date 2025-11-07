/**
 * React hook for wallet management
 */

import { useState, useEffect, useCallback } from 'react';
import { WalletService, WalletInfo } from '@/lib/wallet-service';

export function useWallet() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const walletService = WalletService.getInstance();

  useEffect(() => {
    const currentWallet = walletService.getCurrentWallet();
    setWallet(currentWallet);
    setIsLoading(false);
  }, []);

  const createWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newWallet = await walletService.createWallet();
      setWallet(newWallet);
      return newWallet;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [walletService]);

  const importWallet = useCallback(async (mnemonic: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const importedWallet = await walletService.importWallet(mnemonic);
      setWallet(importedWallet);
      return importedWallet;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [walletService]);

  const clearWallet = useCallback(() => {
    walletService.clearWallet();
    setWallet(null);
    setError(null);
  }, [walletService]);

  return {
    wallet,
    isLoading,
    error,
    createWallet,
    importWallet,
    clearWallet,
    hasWallet: !!wallet,
  };
}

