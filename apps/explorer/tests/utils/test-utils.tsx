/**
 * Test Utilities
 * Shared utilities for testing React components and hooks
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a test query client with default options
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Custom render function that includes providers
interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { createTestQueryClient };

// Mock API responses
export const mockAIResponses = {
  analyzeTransaction: {
    analysis: 'This transaction swaps 1.2 NOR for 50 USDT on NorSwap',
    riskScore: 25,
    insights: ['Normal swap transaction', 'No suspicious patterns detected'],
    recommendations: ['Transaction looks safe', 'Consider checking gas fees'],
  },
  auditContract: {
    audit: 'Contract appears secure with no critical vulnerabilities',
    vulnerabilities: [
      {
        severity: 'low' as const,
        description: 'Minor optimization opportunity',
        recommendation: 'Consider gas optimization',
      },
    ],
    score: 85,
  },
  predictGas: {
    predictedGasPrice: '20',
    confidence: 0.85,
    trend: 'stable' as const,
    recommendation: 'Gas prices are stable, good time to transact',
  },
  detectAnomalies: {
    anomalies: [
      {
        type: 'unusual_activity',
        description: 'Unusual transaction pattern detected',
        severity: 'medium' as const,
        timestamp: new Date().toISOString(),
      },
    ],
    riskScore: 45,
    summary: 'Some unusual activity detected in the last 7 days',
  },
  optimizePortfolio: {
    recommendations: [
      {
        action: 'Diversify holdings',
        reason: 'High concentration in single token',
        impact: 'high' as const,
      },
    ],
    currentValue: '1000 NOR',
    optimizedValue: '1100 NOR',
    improvement: '+10%',
  },
  chat: {
    answer: 'This is a test AI response',
  },
};

// Helper to mock fetch responses
export const mockFetch = (response: any, ok: boolean = true) => {
  (global.fetch as any).mockResolvedValueOnce({
    ok,
    json: async () => response,
    status: ok ? 200 : 400,
    statusText: ok ? 'OK' : 'Bad Request',
  });
};

// Helper to create mock API client
export const createMockAPIClient = () => ({
  analyzeTransaction: vi.fn().mockResolvedValue(mockAIResponses.analyzeTransaction),
  auditContract: vi.fn().mockResolvedValue(mockAIResponses.auditContract),
  predictGas: vi.fn().mockResolvedValue(mockAIResponses.predictGas),
  detectAnomalies: vi.fn().mockResolvedValue(mockAIResponses.detectAnomalies),
  optimizePortfolio: vi.fn().mockResolvedValue(mockAIResponses.optimizePortfolio),
  aiChat: vi.fn().mockResolvedValue(mockAIResponses.chat),
});

