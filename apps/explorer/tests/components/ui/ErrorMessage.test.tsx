/**
 * Component Tests for ErrorMessage
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorMessage, EmptyState } from '@/components/ui/ErrorMessage';
import { render as customRender } from '../../utils/test-utils';

describe('ErrorMessage', () => {
  it('should render error message', () => {
    customRender(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    customRender(<ErrorMessage title="Custom Error" message="Error message" />);
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  it('should call onRetry when retry button clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    customRender(<ErrorMessage message="Error" onRetry={onRetry} />);

    const retryButton = screen.getByText(/Try Again/i);
    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should not show retry button when onRetry not provided', () => {
    customRender(<ErrorMessage message="Error" />);
    expect(screen.queryByText(/Try Again/i)).not.toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('should render empty state', () => {
    customRender(<EmptyState title="No Data" message="No items found" />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should call action onClick when action button clicked', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    customRender(
      <EmptyState
        title="Empty"
        message="No data"
        action={{ label: 'Create', onClick: onAction }}
      />
    );

    const actionButton = screen.getByText('Create');
    await user.click(actionButton);

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});

