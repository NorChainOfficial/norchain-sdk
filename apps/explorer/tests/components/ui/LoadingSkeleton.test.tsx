/**
 * Component Tests for LoadingSkeleton
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingSkeleton, TableSkeleton, CardSkeleton, BlockSkeleton, TransactionSkeleton } from '@/components/ui/LoadingSkeleton';
import { render as customRender } from '../../utils/test-utils';

describe('LoadingSkeleton', () => {
  it('should render skeleton loader', () => {
    const { container } = customRender(<LoadingSkeleton />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render with custom lines', () => {
    const { container } = customRender(<LoadingSkeleton lines={5} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should apply custom className', () => {
    const { container } = customRender(<LoadingSkeleton className="custom-class" />);
    const skeleton = container.querySelector('.custom-class');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render TableSkeleton', () => {
    const { container } = customRender(<TableSkeleton rows={3} columns={4} />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render CardSkeleton', () => {
    const { container } = customRender(<CardSkeleton />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render BlockSkeleton', () => {
    const { container } = customRender(<BlockSkeleton />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render TransactionSkeleton', () => {
    const { container } = customRender(<TransactionSkeleton />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });
});

