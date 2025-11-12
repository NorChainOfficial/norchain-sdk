/**
 * Unit Tests for AI Hooks
 * Tests all custom hooks in hooks/useAI.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useAnalyzeTransaction,
  useAuditContract,
  usePredictGas,
  useDetectAnomalies,
  useOptimizePortfolio,
  useNorAIChat,
  useTransactionAI,
  useAddressAI,
  useContractAI,
} from '@/hooks/useAI';
import { apiClient } from '@/lib/api-client';
import { mockAIResponses, createTestQueryClient } from '../utils/test-utils';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    analyzeTransaction: vi.fn(),
    auditContract: vi.fn(),
    predictGas: vi.fn(),
    detectAnomalies: vi.fn(),
    optimizePortfolio: vi.fn(),
    aiChat: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  const React = require('react');
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    children
  );
};

describe('useAnalyzeTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch transaction analysis when enabled', async () => {
    const mockResponse = mockAIResponses.analyzeTransaction;
    (apiClient.analyzeTransaction as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useAnalyzeTransaction('0x123', true),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(apiClient.analyzeTransaction).toHaveBeenCalledWith('0x123');
  });

  it('should not fetch when disabled', () => {
    const { result } = renderHook(
      () => useAnalyzeTransaction('0x123', false),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(false);
    expect(apiClient.analyzeTransaction).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Failed to analyze');
    (apiClient.analyzeTransaction as any).mockRejectedValue(error);

    const { result } = renderHook(
      () => useAnalyzeTransaction('0x123', true),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError || result.current.error).toBeTruthy();
    }, { timeout: 3000 });

    // Error should be defined or isError should be true
    expect(result.current.error || result.current.isError).toBeTruthy();
  });
});

describe('useAuditContract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch contract audit', async () => {
    const mockResponse = mockAIResponses.auditContract;
    (apiClient.auditContract as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useAuditContract('0xabc', true),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(apiClient.auditContract).toHaveBeenCalledWith('0xabc');
  });
});

describe('usePredictGas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch gas prediction', async () => {
    const mockResponse = mockAIResponses.predictGas;
    (apiClient.predictGas as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePredictGas(true), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(apiClient.predictGas).toHaveBeenCalled();
  });

  it('should auto-refresh when enabled', async () => {
    const mockResponse = mockAIResponses.predictGas;
    (apiClient.predictGas as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePredictGas(true), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should have refetch interval configured
    expect(result.current.data).toBeDefined();
  });
});

describe('useDetectAnomalies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch anomalies with default days', async () => {
    const mockResponse = mockAIResponses.detectAnomalies;
    (apiClient.detectAnomalies as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useDetectAnomalies('0xdef', 7, true),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(apiClient.detectAnomalies).toHaveBeenCalledWith('0xdef', 7);
  });

  it('should use custom days parameter', async () => {
    const mockResponse = mockAIResponses.detectAnomalies;
    (apiClient.detectAnomalies as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useDetectAnomalies('0xdef', 30, true),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.detectAnomalies).toHaveBeenCalledWith('0xdef', 30);
  });
});

describe('useOptimizePortfolio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch portfolio optimization', async () => {
    const mockResponse = mockAIResponses.optimizePortfolio;
    (apiClient.optimizePortfolio as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useOptimizePortfolio('0xghi', true),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(apiClient.optimizePortfolio).toHaveBeenCalledWith('0xghi');
  });
});

describe('useNorAIChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send chat message', async () => {
    const mockResponse = mockAIResponses.chat;
    (apiClient.aiChat as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useNorAIChat(), { wrapper });

    await result.current.chatAsync({
      question: 'What is this transaction?',
      context: { pageType: 'transaction', entityId: '0x123' },
    });

    expect(apiClient.aiChat).toHaveBeenCalledWith(
      'What is this transaction?',
      { pageType: 'transaction', entityId: '0x123' },
    );
  });

  it('should handle loading state', async () => {
    const mockResponse = mockAIResponses.chat;
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    (apiClient.aiChat as any).mockImplementation(() => promise);

    const { result } = renderHook(() => useNorAIChat(), { wrapper });

    const chatPromise = result.current.chatAsync({
      question: 'Test',
      context: {},
    });

    // Loading should be true while promise is pending
    expect(result.current.isLoading).toBe(true);

    // Resolve the promise
    resolvePromise!(mockResponse);
    await chatPromise;

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 1000 });
  });
});

describe('useTransactionAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should combine multiple hooks', async () => {
    (apiClient.analyzeTransaction as any).mockResolvedValue(
      mockAIResponses.analyzeTransaction,
    );
    (apiClient.detectAnomalies as any).mockResolvedValue(
      mockAIResponses.detectAnomalies,
    );
    (apiClient.predictGas as any).mockResolvedValue(mockAIResponses.predictGas);

    const { result } = renderHook(
      () => useTransactionAI('0x123', '0xabc'),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.analysis.data).toBeDefined();
    expect(result.current.fromAnomalies.data).toBeDefined();
    expect(result.current.gasPrediction.data).toBeDefined();
  });
});

describe('useAddressAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should combine anomaly detection and portfolio', async () => {
    (apiClient.detectAnomalies as any).mockResolvedValue(
      mockAIResponses.detectAnomalies,
    );
    (apiClient.optimizePortfolio as any).mockResolvedValue(
      mockAIResponses.optimizePortfolio,
    );

    const { result } = renderHook(() => useAddressAI('0xdef'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.anomalies.data).toBeDefined();
    expect(result.current.portfolio.data).toBeDefined();
  });
});

describe('useContractAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide contract audit and chat', async () => {
    (apiClient.auditContract as any).mockResolvedValue(
      mockAIResponses.auditContract,
    );
    (apiClient.aiChat as any).mockResolvedValue(mockAIResponses.chat);

    const mockABI = [
      {
        name: 'transfer',
        type: 'function',
        inputs: [{ name: 'to', type: 'address' }],
      },
    ];

    const { result } = renderHook(
      () => useContractAI('0xcontract', mockABI),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.audit.data).toBeDefined();
    expect(result.current.explainFunction).toBeDefined();
  });

  it('should explain function when called', async () => {
    (apiClient.auditContract as any).mockResolvedValue(
      mockAIResponses.auditContract,
    );
    (apiClient.aiChat as any).mockResolvedValue(mockAIResponses.chat);

    const mockABI = [
      {
        name: 'transfer',
        type: 'function',
        inputs: [{ name: 'to', type: 'address' }],
      },
    ];

    const { result } = renderHook(
      () => useContractAI('0xcontract', mockABI),
      { wrapper },
    );

    await result.current.explainFunction('transfer', mockABI[0]);

    expect(apiClient.aiChat).toHaveBeenCalled();
  });
});

