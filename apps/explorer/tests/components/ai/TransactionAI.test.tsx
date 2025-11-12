/**
 * Component Tests for TransactionAI
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TransactionAI } from '@/components/ai/TransactionAI';
import { useTransactionAI } from '@/hooks/useAI';
import { render as customRender } from '../../utils/test-utils';

vi.mock('@/hooks/useAI');

describe('TransactionAI', () => {
  const defaultProps = {
    txHash: '0x123',
    fromAddress: '0xabc',
    gasUsed: '21000',
    gasPrice: '20',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    (useTransactionAI as any).mockReturnValue({
      analysis: { isLoading: true, data: null },
      fromAnomalies: { isLoading: true, data: null },
      gasPrediction: { isLoading: true, data: null },
      isLoading: true,
    });

    customRender(<TransactionAI {...defaultProps} />);

    expect(screen.getByText(/AI Transaction Analysis/i)).toBeInTheDocument();
    // Check for loading spinner
    const loader = document.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it('should render transaction analysis', async () => {
    const mockAnalysis = {
      analysis: 'This transaction swaps tokens',
      riskScore: 25,
      insights: ['Normal transaction'],
      recommendations: ['Looks safe'],
    };

    (useTransactionAI as any).mockReturnValue({
      analysis: {
        isLoading: false,
        data: mockAnalysis,
        isSuccess: true,
      },
      fromAnomalies: { isLoading: false, data: null },
      gasPrediction: { isLoading: false, data: null },
      isLoading: false,
    });

    customRender(<TransactionAI {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/This transaction swaps tokens/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Low Risk/i)).toBeInTheDocument();
    expect(screen.getByText(/Normal transaction/i)).toBeInTheDocument();
  });

  it('should display risk badge correctly', async () => {
    const mockAnalysis = {
      analysis: 'Test',
      riskScore: 75,
      insights: [],
      recommendations: [],
    };

    (useTransactionAI as any).mockReturnValue({
      analysis: {
        isLoading: false,
        data: mockAnalysis,
        isSuccess: true,
      },
      fromAnomalies: { isLoading: false, data: null },
      gasPrediction: { isLoading: false, data: null },
      isLoading: false,
    });

    customRender(<TransactionAI {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/High Risk/i)).toBeInTheDocument();
    });
  });

  it('should display anomaly banner when anomalies detected', async () => {
    const mockAnomalies = {
      anomalies: [
        {
          type: 'unusual',
          description: 'Unusual activity',
          severity: 'high' as const,
          timestamp: new Date().toISOString(),
        },
      ],
      riskScore: 60,
      summary: 'Unusual activity detected',
    };

    (useTransactionAI as any).mockReturnValue({
      analysis: {
        isLoading: false,
        data: {
          analysis: 'Test',
          riskScore: 25,
          insights: [],
          recommendations: [],
        },
        isSuccess: true,
      },
      fromAnomalies: {
        isLoading: false,
        data: mockAnomalies,
        isSuccess: true,
      },
      gasPrediction: { isLoading: false, data: null },
      isLoading: false,
    });

    customRender(<TransactionAI {...defaultProps} />);

    await waitFor(() => {
      const anomalyTexts = screen.getAllByText(/Unusual Activity Detected/i);
      expect(anomalyTexts.length).toBeGreaterThan(0);
    });
  });

  it('should display gas analysis when available', async () => {
    const mockGas = {
      predictedGasPrice: '25',
      confidence: 0.9,
      trend: 'increasing' as const,
      recommendation: 'Gas prices are rising',
    };

    (useTransactionAI as any).mockReturnValue({
      analysis: {
        isLoading: false,
        data: {
          analysis: 'Test',
          riskScore: 25,
          insights: [],
          recommendations: [],
        },
        isSuccess: true,
      },
      fromAnomalies: { isLoading: false, data: null },
      gasPrediction: {
        isLoading: false,
        data: mockGas,
        isSuccess: true,
      },
      isLoading: false,
    });

    customRender(<TransactionAI {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Gas Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/25 Gwei/i)).toBeInTheDocument();
    });
  });
});

