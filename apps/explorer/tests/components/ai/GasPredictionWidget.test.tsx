/**
 * Component Tests for GasPredictionWidget
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GasPredictionWidget } from '@/components/ai/GasPredictionWidget';
import { usePredictGas } from '@/hooks/useAI';
import { render as customRender } from '../../utils/test-utils';

vi.mock('@/hooks/useAI');

describe('GasPredictionWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    (usePredictGas as any).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    customRender(<GasPredictionWidget />);
    expect(screen.getByText(/Loading gas prediction/i)).toBeInTheDocument();
  });

  it('should display gas prediction', async () => {
    const mockData = {
      predictedGasPrice: '25',
      confidence: 0.9,
      trend: 'increasing' as const,
      recommendation: 'Gas prices are rising',
    };

    (usePredictGas as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    customRender(<GasPredictionWidget />);

    await waitFor(() => {
      expect(screen.getByText(/25 Gwei/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/increasing/i)).toBeInTheDocument();
    expect(screen.getByText(/90%/i)).toBeInTheDocument();
  });

  it('should display trend icon correctly', () => {
    const mockData = {
      predictedGasPrice: '20',
      confidence: 0.85,
      trend: 'decreasing' as const,
      recommendation: 'Gas prices are falling',
    };

    (usePredictGas as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    customRender(<GasPredictionWidget />);
    expect(screen.getByText(/decreasing/i)).toBeInTheDocument();
  });

  it('should handle errors gracefully', () => {
    (usePredictGas as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });

    customRender(<GasPredictionWidget />);
    expect(screen.getByText(/Failed to load gas prediction/i)).toBeInTheDocument();
  });
});

