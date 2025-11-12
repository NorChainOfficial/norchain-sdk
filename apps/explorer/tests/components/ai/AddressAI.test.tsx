/**
 * Component Tests for AddressAI
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddressAI } from '@/components/ai/AddressAI';
import { useAddressAI } from '@/hooks/useAI';
import { render as customRender } from '../../utils/test-utils';

vi.mock('@/hooks/useAI');

describe('AddressAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    (useAddressAI as any).mockReturnValue({
      anomalies: { isLoading: true, data: null },
      portfolio: { isLoading: true, data: null },
      isLoading: true,
    });

    customRender(<AddressAI address="0x123" />);

    // Check for loading skeleton
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('should display risk score', async () => {
    const mockAnomalies = {
      anomalies: [],
      riskScore: 35,
      summary: 'No anomalies detected',
    };

    (useAddressAI as any).mockReturnValue({
      anomalies: {
        isLoading: false,
        data: mockAnomalies,
        isSuccess: true,
      },
      portfolio: { isLoading: false, data: null },
      isLoading: false,
    });

    customRender(<AddressAI address="0x123" />);

    await waitFor(() => {
      expect(screen.getByText(/35\/100/i)).toBeInTheDocument();
    });
  });

  it('should display portfolio optimization', async () => {
    const mockPortfolio = {
      recommendations: [
        {
          action: 'Diversify holdings',
          reason: 'High concentration risk',
          impact: 'high' as const,
        },
      ],
      currentValue: '1000 NOR',
      optimizedValue: '1100 NOR',
      improvement: '+10%',
    };

    (useAddressAI as any).mockReturnValue({
      anomalies: {
        isLoading: false,
        data: {
          anomalies: [],
          riskScore: 25,
          summary: 'Safe',
        },
        isSuccess: true,
      },
      portfolio: {
        isLoading: false,
        data: mockPortfolio,
        isSuccess: true,
      },
      isLoading: false,
    });

    customRender(<AddressAI address="0x123" />);

    await waitFor(() => {
      expect(screen.getByText(/Portfolio Optimization/i)).toBeInTheDocument();
      expect(screen.getByText(/1000 NOR/i)).toBeInTheDocument();
      expect(screen.getByText(/1100 NOR/i)).toBeInTheDocument();
    });
  });

  it('should toggle portfolio recommendations', async () => {
    const user = userEvent.setup();
    const mockPortfolio = {
      recommendations: [
        {
          action: 'Test recommendation',
          reason: 'Test reason',
          impact: 'high' as const,
        },
      ],
      currentValue: '1000 NOR',
      optimizedValue: '1100 NOR',
      improvement: '+10%',
    };

    (useAddressAI as any).mockReturnValue({
      anomalies: {
        isLoading: false,
        data: {
          anomalies: [],
          riskScore: 25,
          summary: 'Safe',
        },
        isSuccess: true,
      },
      portfolio: {
        isLoading: false,
        data: mockPortfolio,
        isSuccess: true,
      },
      isLoading: false,
    });

    customRender(<AddressAI address="0x123" />);

    const showButton = await screen.findByText(/Show Recommendations/i);
    await user.click(showButton);

    await waitFor(() => {
      expect(screen.getByText(/Test recommendation/i)).toBeInTheDocument();
    });
  });
});

