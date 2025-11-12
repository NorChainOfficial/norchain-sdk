/**
 * Component Tests for RiskScore
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskScore } from '@/components/accounts/RiskScore';
import { render as customRender } from '../../utils/test-utils';

describe('RiskScore', () => {
  it('should render placeholder when no risk score', () => {
    customRender(<RiskScore address="0x123" />);
    expect(screen.getByText(/Risk Score/i)).toBeInTheDocument();
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it('should display low risk score', () => {
    customRender(<RiskScore address="0x123" riskScore={25} />);
    expect(screen.getByText(/Risk Score/i)).toBeInTheDocument();
    expect(screen.getByText(/25/i)).toBeInTheDocument();
  });

  it('should display medium risk score', () => {
    customRender(<RiskScore address="0x123" riskScore={50} />);
    expect(screen.getByText(/50/i)).toBeInTheDocument();
  });

  it('should display high risk score', () => {
    customRender(<RiskScore address="0x123" riskScore={85} />);
    expect(screen.getByText(/85/i)).toBeInTheDocument();
  });

  it('should display risk factors', () => {
    const riskFactors = ['Suspicious activity', 'High transaction volume'];
    customRender(<RiskScore address="0x123" riskScore={75} riskFactors={riskFactors} />);
    expect(screen.getByText(/Suspicious activity/i)).toBeInTheDocument();
  });
});

