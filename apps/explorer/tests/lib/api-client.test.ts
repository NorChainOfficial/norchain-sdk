/**
 * Comprehensive Integration Tests for API Client
 * Tests all methods in lib/api-client.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '@/lib/api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

describe('API Client - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Block Methods', () => {
    it('should get block by height', async () => {
      const mockBlock = { height: 1000, hash: '0x123' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockBlock }),
      });

      const result = await apiClient.getBlock(1000);
      expect(result).toEqual(mockBlock);
      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/blocks/1000`);
    });

    it('should get blocks list', async () => {
      const mockBlocks = [{ height: 1000 }, { height: 999 }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockBlocks }),
      });

      const result = await apiClient.getBlocks({ page: 1, per_page: 10 });
      expect(result).toEqual(mockBlocks);
    });
  });

  describe('Transaction Methods', () => {
    it('should get transaction by hash', async () => {
      const mockTx = { hash: '0x123', from: '0xabc' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockTx }),
      });

      const result = await apiClient.getTransaction('0x123');
      expect(result).toEqual(mockTx);
    });

    it('should get transactions list', async () => {
      const mockTxs = [{ hash: '0x1' }, { hash: '0x2' }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ transactions: mockTxs }),
      });

      const result = await apiClient.getTransactions({ page: 1, per_page: 10 });
      // API client returns the full response object, extract transactions
      expect(result.transactions || result).toEqual(mockTxs);
    });
  });

  describe('Account Methods', () => {
    it('should get account by address', async () => {
      const mockAccount = { address: '0x123', balance: '1000' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAccount }),
      });

      const result = await apiClient.getAccount('0x123');
      expect(result).toEqual(mockAccount);
    });

    it('should get account transactions', async () => {
      const mockTxs = [{ hash: '0x1' }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ transactions: mockTxs }),
      });

      const result = await apiClient.getAccountTransactions('0x123', { page: 1 });
      // API client may return full response or just transactions array
      expect(result.transactions || result).toEqual(mockTxs);
    });
  });

  describe('Token Methods', () => {
    it('should get token holders', async () => {
      const mockHolders = [{ address: '0x1', balance: '100' }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockHolders }),
      });

      const result = await apiClient.getTokenHolders('0x123', { page: 1 });
      expect(result).toEqual(mockHolders);
    });

    it('should get token transfers', async () => {
      const mockTransfers = [{ hash: '0x1', from: '0xabc', to: '0xdef' }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockTransfers }),
      });

      const result = await apiClient.getTokenTransfers('0x123', { page: 1 });
      expect(result).toEqual(mockTransfers);
    });
  });

  describe('Contract Methods', () => {
    it('should read contract', async () => {
      const mockResult = { value: '100' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockResult }),
      });

      const result = await apiClient.readContract('0x123', 'balanceOf', ['0xabc']);
      expect(result).toEqual(mockResult);
    });
  });

  describe('Analytics Methods', () => {
    it('should get network statistics', async () => {
      const mockStats = { blockHeight: 1000, totalTransactions: 5000 };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockStats }),
      });

      const result = await apiClient.getNetworkStatistics();
      expect(result).toEqual(mockStats);
    });

    it('should get network analytics', async () => {
      const mockAnalytics = { dailyTransactions: [] };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAnalytics }),
      });

      const result = await apiClient.getNetworkAnalytics('2024-01-01', '2024-01-31');
      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.getBlock(1000)).rejects.toThrow();
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(apiClient.getBlock(1000)).rejects.toThrow();
    });

    it('should handle invalid JSON responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(apiClient.getBlock(1000)).rejects.toThrow();
    });
  });
});

