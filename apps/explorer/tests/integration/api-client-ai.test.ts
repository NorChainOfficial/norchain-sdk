/**
 * Integration Tests for API Client AI Methods
 * Tests the actual API client integration with mocked fetch
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '@/lib/api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

describe('API Client AI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('analyzeTransaction', () => {
    it('should call correct endpoint with transaction hash', async () => {
      const mockResponse = {
        data: {
          analysis: 'Test analysis',
          riskScore: 25,
          insights: [],
          recommendations: [],
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.analyzeTransaction('0x123');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/ai/analyze-transaction`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ txHash: '0x123' }),
        },
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(apiClient.analyzeTransaction('0x123')).rejects.toThrow();
    });
  });

  describe('auditContract', () => {
    it('should call correct endpoint with contract address', async () => {
      const mockResponse = {
        data: {
          audit: 'Contract is secure',
          vulnerabilities: [],
          score: 90,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.auditContract('0xabc');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/ai/audit-contract`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractAddress: '0xabc' }),
        },
      );

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('predictGas', () => {
    it('should call correct endpoint', async () => {
      const mockResponse = {
        data: {
          predictedGasPrice: '20',
          confidence: 0.85,
          trend: 'stable',
          recommendation: 'Good time to transact',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.predictGas();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/ai/predict-gas`,
      );

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('detectAnomalies', () => {
    it('should call correct endpoint with address and days', async () => {
      const mockResponse = {
        data: {
          anomalies: [],
          riskScore: 25,
          summary: 'No anomalies',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.detectAnomalies('0xdef', 7);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/ai/detect-anomalies?address=0xdef&days=7`,
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should use default days parameter', async () => {
      const mockResponse = { data: { anomalies: [], riskScore: 25, summary: '' } };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await apiClient.detectAnomalies('0xdef');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/ai/detect-anomalies?address=0xdef&days=7`,
      );
    });
  });

  describe('optimizePortfolio', () => {
    it('should call correct endpoint with address', async () => {
      const mockResponse = {
        data: {
          recommendations: [],
          currentValue: '1000 NOR',
          optimizedValue: '1100 NOR',
          improvement: '+10%',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.optimizePortfolio('0xghi');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/ai/optimize-portfolio`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: '0xghi' }),
        },
      );

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('aiChat', () => {
    it('should call correct endpoint with question and context', async () => {
      const mockResponse = {
        data: {
          answer: 'Test response',
        },
      };

      const context = {
        pageType: 'transaction',
        entityId: '0x123',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.aiChat('What is this?', context);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/ai/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: 'What is this?',
            context,
          }),
        },
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle missing context', async () => {
      const mockResponse = { data: { answer: 'Test' } };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await apiClient.aiChat('Test question');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/ai/chat`,
        expect.objectContaining({
          body: JSON.stringify({
            question: 'Test question',
            context: undefined,
          }),
        }),
      );
    });
  });
});

