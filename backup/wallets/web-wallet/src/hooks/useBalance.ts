/**
 * React hook for fetching account balance
 */

import { useState, useEffect } from 'react';
import { TransactionService } from '@/lib/transaction-service';
import { useWallet } from './useWallet';
import { WalletService } from '@/lib/wallet-service';
import { getDemoBalance } from '@/lib/demo-assets';

export function useBalance(chain: string = 'xaheen') {
  const { wallet } = useWallet();
  const [balance, setBalance] = useState<string>('0.0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const transactionService = TransactionService.getInstance();
  const walletService = WalletService.getInstance();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet?.accounts[0]?.address) {
        setIsLoading(false);
        return;
      }

      // Check if this is a demo wallet
      if (walletService.isDemoWallet()) {
        // Return demo balance (2.5432 ETH)
        setBalance('2.5432');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const accountBalance = await transactionService.getAccountBalance(
          wallet.accounts[0].address,
          chain
        );
        setBalance(accountBalance);
      } catch (err: any) {
        setError(err.message);
        setBalance('0.0');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // Refresh balance every 30 seconds (only for real wallets)
    if (!walletService.isDemoWallet()) {
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [wallet?.accounts[0]?.address, chain]);

  return { balance, isLoading, error };
}

