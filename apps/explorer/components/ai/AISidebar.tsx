'use client';

import { useState, useEffect } from 'react';
import { useNorAIChat, ChatContext } from '@/hooks/useAI';
import { X, MessageSquare, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { usePathname, useParams } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AISidebar({ isOpen, onClose }: AISidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const pathname = usePathname();
  const params = useParams();
  const chat = useNorAIChat();

  // Build context based on current page
  const getContext = (): ChatContext => {
    const context: ChatContext = {};

    if (pathname.includes('/transactions/') && params?.hash) {
      context.pageType = 'transaction';
      context.entityId = params.hash as string;
    } else if (pathname.includes('/accounts/') || pathname.includes('/address/')) {
      context.pageType = 'address';
      context.entityId = params?.address as string;
    } else if (pathname.includes('/contracts/')) {
      context.pageType = 'contract';
      context.entityId = params?.address as string;
    } else if (pathname.includes('/tokens/')) {
      context.pageType = 'token';
      context.entityId = params?.address as string;
    } else if (pathname.includes('/blocks/')) {
      context.pageType = 'block';
      context.entityId = params?.height as string;
    }

    return context;
  };

  // Add welcome message with context
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const context = getContext();
      let welcomeMessage = "Hi! I'm NorAI, your blockchain assistant. How can I help you?";
      
      if (context.pageType && context.entityId) {
        const entityName = context.pageType === 'transaction' ? 'transaction' :
                          context.pageType === 'address' ? 'address' :
                          context.pageType === 'contract' ? 'contract' :
                          context.pageType === 'token' ? 'token' : 'block';
        welcomeMessage = `Hi! I'm analyzing ${entityName} ${context.entityId.slice(0, 10)}... Ask me anything about it!`;
      }

      setMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || chat.isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const context = getContext();
      const response = await chat.chatAsync({
        question: userMessage.content,
        context,
      });
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.answer || response.toString(),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What does this transaction do?",
    "Is this address safe?",
    "Explain this contract",
    "What are the risks?",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">NorAI Assistant</h3>
            <p className="text-xs text-gray-500 dark:text-gray-500">Context-aware help</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>
        ))}

        {chat.isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask NorAI anything..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={chat.isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || chat.isLoading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {chat.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          Press Enter to send • Context-aware based on current page
        </p>
      </div>
    </div>
  );
}

