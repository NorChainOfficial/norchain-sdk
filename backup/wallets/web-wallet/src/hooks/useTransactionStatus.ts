/**
 * React hook for monitoring transaction status
 */

import { useState, useEffect, useCallback } from 'react';
import { TransactionService, TransactionResult } from '@/lib/transaction-service';

export function useTransactionStatus(
  txHash: string | null,
  chain: string = 'xaheen',
  enabled: boolean = true
) {
  const [transaction, setTransaction] = useState<TransactionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transactionService = TransactionService.getInstance();

  const fetchStatus = useCallback(async () => {
    if (!txHash || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const status = await transactionService.getTransactionStatus(txHash, chain);
      setTransaction(status);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [txHash, chain, enabled, transactionService]);

  useEffect(() => {
    if (!txHash || !enabled) return;

    // Initial fetch
    fetchStatus();

    // Poll for status updates every 5 seconds if pending
    const interval = setInterval(() => {
      if (transaction?.status === 'pending') {
        fetchStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [txHash, enabled, transaction, fetchStatus]);

  return {
    transaction,
    isLoading,
    error,
    refetch: fetchStatus,
    isPending: transaction?.status === 'pending',
    isConfirmed: transaction?.status === 'confirmed',
    isFailed: transaction?.status === 'failed',
  };
}

