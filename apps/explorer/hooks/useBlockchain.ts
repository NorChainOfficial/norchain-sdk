/**
 * React Hooks for Blockchain Data
 * Provides real-time access to NorChain via https://rpc.norchain.org
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBlockchainService, type BlockchainStats, type StakingData, type ValidatorInfo, type ProposalData } from '@/lib/blockchain-service';

/**
 * Hook to get blockchain stats
 */
export function useBlockchainStats(refreshInterval: number = 10000) {
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const service = getBlockchainService();
      const data = await service.getBlockchainStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchStats, refreshInterval]);

  return { stats, loading, error, refetch: fetchStats };
}

/**
 * Hook to get account balance
 */
export function useBalance(address: string | null, refreshInterval: number = 10000) {
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance('0');
      setLoading(false);
      return;
    }

    try {
      const service = getBlockchainService();
      const data = await service.getBalance(address);
      setBalance(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
    if (address) {
      const interval = setInterval(fetchBalance, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchBalance, address, refreshInterval]);

  return { balance, loading, error, refetch: fetchBalance };
}

/**
 * Hook to get staking data
 */
export function useStaking(userAddress: string | null, refreshInterval: number = 15000) {
  const [stakingData, setStakingData] = useState<StakingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStakingData = useCallback(async () => {
    try {
      const service = getBlockchainService();
      const data = await service.getStakingData(userAddress || undefined);
      setStakingData(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetchStakingData();
    const interval = setInterval(fetchStakingData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchStakingData, refreshInterval]);

  return { stakingData, loading, error, refetch: fetchStakingData };
}

/**
 * Hook to get validators
 */
export function useValidators(refreshInterval: number = 30000) {
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchValidators = useCallback(async () => {
    try {
      const service = getBlockchainService();
      const data = await service.getValidators();
      setValidators(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchValidators();
    const interval = setInterval(fetchValidators, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchValidators, refreshInterval]);

  return { validators, loading, error, refetch: fetchValidators };
}

/**
 * Hook to get governance proposals
 */
export function useProposals(refreshInterval: number = 20000) {
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProposals = useCallback(async () => {
    try {
      const service = getBlockchainService();
      const data = await service.getProposals();
      setProposals(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
    const interval = setInterval(fetchProposals, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchProposals, refreshInterval]);

  return { proposals, loading, error, refetch: fetchProposals };
}

/**
 * Hook to get voting power
 */
export function useVotingPower(address: string | null, refreshInterval: number = 15000) {
  const [votingPower, setVotingPower] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVotingPower = useCallback(async () => {
    if (!address) {
      setVotingPower('0');
      setLoading(false);
      return;
    }

    try {
      const service = getBlockchainService();
      const data = await service.getVotingPower(address);
      setVotingPower(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchVotingPower();
    if (address) {
      const interval = setInterval(fetchVotingPower, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchVotingPower, address, refreshInterval]);

  return { votingPower, loading, error, refetch: fetchVotingPower };
}

/**
 * Hook to get latest blocks
 */
export function useLatestBlocks(count: number = 10, refreshInterval: number = 5000) {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBlocks = useCallback(async () => {
    try {
      const service = getBlockchainService();
      const data = await service.getLatestBlocks(count);
      setBlocks(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [count]);

  useEffect(() => {
    fetchBlocks();
    const interval = setInterval(fetchBlocks, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchBlocks, refreshInterval]);

  return { blocks, loading, error, refetch: fetchBlocks };
}

/**
 * Hook to get gas price
 */
export function useGasPrice(refreshInterval: number = 10000) {
  const [gasPrice, setGasPrice] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGasPrice = useCallback(async () => {
    try {
      const service = getBlockchainService();
      const data = await service.getGasPrice();
      setGasPrice(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGasPrice();
    const interval = setInterval(fetchGasPrice, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchGasPrice, refreshInterval]);

  return { gasPrice, loading, error, refetch: fetchGasPrice };
}

/**
 * Hook to get transaction
 */
export function useTransaction(hash: string | null) {
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransaction = useCallback(async () => {
    if (!hash) {
      setTransaction(null);
      setLoading(false);
      return;
    }

    try {
      const service = getBlockchainService();
      const data = await service.getTransaction(hash);
      setTransaction(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [hash]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  return { transaction, loading, error, refetch: fetchTransaction };
}
