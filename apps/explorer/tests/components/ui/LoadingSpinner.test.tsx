/**
 * Component Tests for LoadingSpinner
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { render as customRender } from '../../utils/test-utils';

describe('LoadingSpinner', () => {
  it('should render spinner', () => {
    customRender(<LoadingSpinner />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with text', () => {
    customRender(<LoadingSpinner text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should apply size classes', () => {
    const { rerender } = customRender(<LoadingSpinner size="sm" />);
    let spinner = document.querySelector('.w-4.h-4');
    expect(spinner).toBeInTheDocument();

    rerender(<LoadingSpinner size="md" />);
    spinner = document.querySelector('.w-8.h-8');
    expect(spinner).toBeInTheDocument();

    rerender(<LoadingSpinner size="lg" />);
    spinner = document.querySelector('.w-12.h-12');
    expect(spinner).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    customRender(<LoadingSpinner className="custom-class" />);
    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });
});

