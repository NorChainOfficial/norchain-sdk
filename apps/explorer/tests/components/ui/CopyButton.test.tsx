/**
 * Component Tests for CopyButton
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyButton } from '@/components/ui/CopyButton';
import { render as customRender } from '../../utils/test-utils';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

describe('CopyButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render copy button', () => {
    customRender(<CopyButton value="test-value" />);
    const button = screen.getByRole('button', { name: /copy/i });
    expect(button).toBeInTheDocument();
  });

  it('should copy value to clipboard on click', async () => {
    const user = userEvent.setup();
    customRender(<CopyButton value="test-value" />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-value');
    });
  });

  it('should show copied state after click', async () => {
    const user = userEvent.setup();
    customRender(<CopyButton value="test-value" />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Copied!/i)).toBeInTheDocument();
    });
  });

  it('should hide copied state after timeout', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    customRender(<CopyButton value="test-value" />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Copied!/i)).toBeInTheDocument();
    });

    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByText(/Copied!/i)).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('should display value when showValue is true', () => {
    customRender(<CopyButton value="0x1234567890abcdef" showValue />);
    expect(screen.getByText(/0x1234/i)).toBeInTheDocument();
  });

  it('should truncate value when truncate is true', () => {
    const longValue = '0x1234567890abcdef1234567890abcdef';
    customRender(<CopyButton value={longValue} showValue truncate />);
    // Check for truncated value (first 8 and last 8 chars)
    const text = screen.getByText(/0x12345678/i);
    expect(text).toBeInTheDocument();
  });

  it('should not truncate short values', () => {
    customRender(<CopyButton value="0x1234" showValue truncate />);
    expect(screen.getByText('0x1234')).toBeInTheDocument();
  });

  it('should handle clipboard errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockWriteText = vi.fn().mockRejectedValueOnce(new Error('Clipboard error'));
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const user = userEvent.setup();
    customRender(<CopyButton value="test-value" />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
});

