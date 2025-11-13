'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Send, Sparkles, Loader2, Trash2, Code2, Shield, TestTube2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAIStore } from '@/store/aiStore'
import ReactMarkdown from 'react-markdown'

export const AIChat = (): JSX.Element => {
  const { messages, isLoading, sendMessage, clearMessages } = useAIStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput('')
    await sendMessage(message)

    // Focus input after sending
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickActions = [
    { icon: Code2, label: 'Generate Contract', prompt: 'Generate an ERC-20 token contract' },
    { icon: Shield, label: 'Security Audit', prompt: 'Review my contract for security issues' },
    { icon: TestTube2, label: 'Generate Tests', prompt: 'Generate test cases for my contract' },
  ]

  return (
    <div className="h-full flex flex-col bg-editor-bg-light dark:bg-editor-bg-light">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-defi-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">NorAI Assistant</h3>
            <p className="text-xs text-gray-400">Powered by AI</p>
          </div>
        </div>
        <button
          onClick={clearMessages}
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          aria-label="Clear chat"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Actions (shown when chat is empty) */}
      {messages.length <= 1 && (
        <div className="p-4 border-b border-gray-700">
          <p className="text-xs text-gray-400 mb-3">Quick Actions:</p>
          <div className="grid grid-cols-1 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(action.prompt)
                  inputRef.current?.focus()
                }}
                className="flex items-center space-x-2 p-2 rounded bg-gray-800/50 hover:bg-gray-700 text-left text-sm text-gray-300 transition-colors"
              >
                <action.icon className="h-4 w-4 text-primary-400 flex-shrink-0" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">NorAI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask NorAI anything..."
            disabled={isLoading}
            className="flex-1 h-10 px-3 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-10 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

interface ChatMessageProps {
  readonly message: {
    readonly id: string
    readonly role: 'user' | 'assistant' | 'system'
    readonly content: string
    readonly timestamp: Date
  }
}

function ChatMessage({ message }: ChatMessageProps): JSX.Element {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="bg-blue-900/20 border border-blue-700/50 rounded p-3">
        <ReactMarkdown className="text-sm text-blue-300 prose prose-invert prose-sm max-w-none">
          {message.content}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-lg p-3',
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-gray-800 text-gray-200'
        )}
      >
        {!isUser && (
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="h-3 w-3 text-primary-400" />
            <span className="text-xs font-semibold text-primary-400">NorAI</span>
          </div>
        )}
        <ReactMarkdown
          className={cn(
            'text-sm prose prose-invert prose-sm max-w-none',
            'prose-code:bg-gray-900/50 prose-code:px-1 prose-code:rounded',
            'prose-pre:bg-gray-900/50'
          )}
        >
          {message.content}
        </ReactMarkdown>
        <div className="flex justify-end mt-2">
          <span className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  )
}
