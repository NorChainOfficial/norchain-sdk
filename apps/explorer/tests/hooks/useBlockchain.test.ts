/**
 * Unit Tests for Blockchain Hooks
 * Tests all hooks in hooks/useBlockchain.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useBlockchainStats,
  useBalance,
  useStaking,
  useValidators,
  useProposals,
  useVotingPower,
  useLatestBlocks,
  useGasPrice,
  useTransaction,
} from '@/hooks/useBlockchain';
import { getBlockchainService } from '@/lib/blockchain-service';

// Mock the blockchain service
vi.mock('@/lib/blockchain-service', () => ({
  getBlockchainService: vi.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const React = require('react');
  return React.createElement('div', null, children);
};

describe('useBlockchainStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch blockchain stats', async () => {
    const mockStats = {
      blockHeight: 1000,
      totalTransactions: 5000,
      gasPrice: '20',
    };

    const mockService = {
      getBlockchainStats: vi.fn().mockResolvedValue(mockStats),
    };

    (getBlockchainService as any).mockReturnValue(mockService);

    const { result } = renderHook(() => useBlockchainStats(10000), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toEqual(mockStats);
    expect(mockService.getBlockchainStats).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to fetch stats');
    const mockService = {
      getBlockchainStats: vi.fn().mockRejectedValue(error),
    };

    (getBlockchainService as any).mockReturnValue(mockService);

    const { result } = renderHook(() => useBlockchainStats(10000), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.stats).toBeNull();
  });

  it('should refetch on interval', async () => {
    const mockStats = { blockHeight: 1000 };
    const mockService = {
      getBlockchainStats: vi.fn().mockResolvedValue(mockStats),
    };

    (getBlockchainService as any).mockReturnValue(mockService);

    const { result } = renderHook(() => useBlockchainStats(1000), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockService.getBlockchainStats).toHaveBeenCalledTimes(1);
  });
});

describe('useBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should fetch balance for address', async () => {
    const mockBalance = '1000000000000000000000000000';
    const mockService = {
      getBalance: vi.fn().mockResolvedValue(mockBalance),
    };

    (getBlockchainService as any).mockReturnValue(mockService);

    const { result } = renderHook(() => useBalance('0x123', 10000), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.balance).toBe(mockBalance);
    expect(mockService.getBalance).toHaveBeenCalledWith('0x123');
  });

  it('should not fetch when address is null', () => {
    const mockService = {
      getBalance: vi.fn(),
    };

    (getBlockchainService as any).mockReturnValue(mockService);

    const { result } = renderHook(() => useBalance(null, 10000), { wrapper });

    expect(result.current.balance).toBe('0');
    expect(result.current.loading).toBe(false);
    expect(mockService.getBalance).not.toHaveBeenCalled();
  });
});

describe('useStaking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch staking data', async () => {
    const mockStakingData = {
      totalStaked: '1000000',
      rewards: '10000',
    };

    const mockService = {
      getStakingData: vi.fn().mockResolvedValue(mockStakingData),
    };

    (getBlockchainService as any).mockReturnValue(mockService);

    const { result } = renderHook(() => useStaking('0x123', 15000), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stakingData).toEqual(mockStakingData);
  });
});

describe('useValidators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch validators', async () => {
    const mockValidators = [
      { address: '0x1', votingPower: '1000' },
      { address: '0x2', votingPower: '2000' },
    ];

    const mockService = {
      getValidators: vi.fn().mockResolvedValue(mockValidators),
    };

    (getBlockchainService as any).mockReturnValue(mockService);

    const { result } = renderHook(() => useValidators(30000), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.validators).toEqual(mockValidators);
  });
});

describe('useProposals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch proposals', async () => {
    const mockProposals = [
      { id: 1, title: 'Proposal 1', status: 'active' },
      { id: 2, title: 'Proposal 2', status: 'passed' },
    ];

    const mockService = {
      getProposals: vi.fn().mockResolvedValue(mockProposals),
    };

    (getBlockchainService as any).mockReturnValue(mockService);

    const { result } = renderHook(() => useProposals(20000), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.proposals).toEqual(mockProposals);
  });
});

describe('useVotingPower', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch voting power', async () => {
    const mockVotingPower = '5000';
    const mockService = {
      getVotingPower: vi.fn().mockResolvedValue(mockVotingPower),
    };

    (getBlockchainService as any).mockReturnValue(mockService);

    const { result } = renderHook(() => useVotingPower('0x123', 15000), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.votingPower).toBe(mockVotingPower);
  });
});

describe('useLatestBlocks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch latest blocks', async () => {
    const mockBlocks = [
      { height: 1000, hash: '0x1' },
      { height: 999, hash: '0x2' },
    ];

    const mockService = {
      getLatestBlocks: vi.fn().mockResolvedValue(mockBlocks),
    };

    (getBlockchainService as any).mockReturnValue(mockService);

    const { result } = renderHook(() => useLatestBlocks(10, 5000), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.blocks).toEqual(mockBlocks);
    expect(mockService.getLatestBlocks).toHaveBeenCalledWith(10);
  });
});

describe('useGasPrice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch gas price', async () => {
    const mockGasPrice = '20';
    const mockService = {
      getGasPrice: vi.fn().mockResolvedValue(mockGasPrice),
    };

    (getBlockchainService as any).mockReturnValue(mockService);

    const { result } = renderHook(() => useGasPrice(10000), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.gasPrice).toBe(mockGasPrice);
  });
});

describe('useTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch transaction', async () => {
    const mockTransaction = {
      hash: '0x123',
      from: '0xabc',
      to: '0xdef',
      value: '1000',
    };

    const mockService = {
      getTransaction: vi.fn().mockResolvedValue(mockTransaction),
    };

    (getBlockchainService as any).mockReturnValue(mockService);

    const { result } = renderHook(() => useTransaction('0x123'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.transaction).toEqual(mockTransaction);
    expect(mockService.getTransaction).toHaveBeenCalledWith('0x123');
  });

  it('should not fetch when hash is null', () => {
    const mockService = {
      getTransaction: vi.fn(),
    };

    (getBlockchainService as any).mockReturnValue(mockService);

    const { result } = renderHook(() => useTransaction(null), { wrapper });

    expect(result.current.transaction).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(mockService.getTransaction).not.toHaveBeenCalled();
  });
});

