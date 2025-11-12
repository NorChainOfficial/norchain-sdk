/**
 * Component Tests for AISidebar
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AISidebar } from '@/components/ai/AISidebar';
import { useNorAIChat } from '@/hooks/useAI';
import { usePathname, useParams } from 'next/navigation';
import { render as customRender } from '../../utils/test-utils';

vi.mock('@/hooks/useAI');
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useParams: vi.fn(),
}));

describe('AISidebar', () => {
  const mockChat = {
    chat: vi.fn(),
    chatAsync: vi.fn(),
    isLoading: false,
    error: null,
    reset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useNorAIChat as any).mockReturnValue(mockChat);
    (usePathname as any).mockReturnValue('/');
    (useParams as any).mockReturnValue({});
  });

  it('should not render when closed', () => {
    customRender(<AISidebar isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText(/NorAI Assistant/i)).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    customRender(<AISidebar isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/NorAI Assistant/i)).toBeInTheDocument();
  });

  it('should display welcome message', () => {
    customRender(<AISidebar isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Hi! I'm NorAI/i)).toBeInTheDocument();
  });

  it('should display context-aware welcome on transaction page', () => {
    (usePathname as any).mockReturnValue('/transactions/0x123');
    (useParams as any).mockReturnValue({ hash: '0x123' });

    customRender(<AISidebar isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/transaction/i)).toBeInTheDocument();
  });

  it('should send message when input submitted', async () => {
    const user = userEvent.setup();
    mockChat.chatAsync.mockResolvedValue({ answer: 'Test response' });

    customRender(<AISidebar isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByPlaceholderText(/Ask NorAI/i);
    await user.type(input, 'Test question');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockChat.chatAsync).toHaveBeenCalled();
    });
  });

  it('should display loading state', async () => {
    mockChat.isLoading = true;
    customRender(<AISidebar isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should close when X button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    customRender(<AISidebar isOpen={true} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should display suggested questions', () => {
    customRender(<AISidebar isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/What does this transaction do\?/i)).toBeInTheDocument();
  });

  it('should fill input when suggested question clicked', async () => {
    const user = userEvent.setup();
    customRender(<AISidebar isOpen={true} onClose={vi.fn()} />);

    const suggestedQuestion = screen.getByText(/What does this transaction do\?/i);
    await user.click(suggestedQuestion);

    const input = screen.getByPlaceholderText(/Ask NorAI/i) as HTMLInputElement;
    expect(input.value).toContain('What does this transaction do?');
  });

  it('should display chat messages', async () => {
    const user = userEvent.setup();
    mockChat.chatAsync.mockResolvedValue({ answer: 'Test response' });

    customRender(<AISidebar isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByPlaceholderText(/Ask NorAI/i);
    await user.type(input, 'Test');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText(/Test response/i)).toBeInTheDocument();
    });
  });
});

