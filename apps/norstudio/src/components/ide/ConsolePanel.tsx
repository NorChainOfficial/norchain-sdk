'use client'

import React, { useRef, useEffect } from 'react'
import { Terminal, X, ChevronUp, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ConsoleMessage {
  readonly id: string
  readonly type: 'info' | 'success' | 'warning' | 'error'
  readonly message: string
  readonly timestamp: Date
  readonly details?: string
}

interface ConsolePanelProps {
  readonly messages: ConsoleMessage[]
  readonly onClear?: () => void
}

export const ConsolePanel = ({ messages, onClear }: ConsolePanelProps): JSX.Element => {
  const consoleEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="h-full flex flex-col bg-editor-bg dark:bg-editor-bg text-gray-300">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-200">Console</span>
          {messages.length > 0 && (
            <span className="text-xs text-gray-500">({messages.length})</span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {onClear && messages.length > 0 && (
            <button
              onClick={onClear}
              className="h-6 w-6 flex items-center justify-center rounded hover:bg-gray-700 transition-colors"
              aria-label="Clear console"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Console Messages */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-sm">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Console output will appear here</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <ConsoleMessageItem key={message.id} message={message} />
            ))}
            <div ref={consoleEndRef} />
          </div>
        )}
      </div>
    </div>
  )
}

interface ConsoleMessageItemProps {
  readonly message: ConsoleMessage
}

function ConsoleMessageItem({ message }: ConsoleMessageItemProps): JSX.Element {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const icon = {
    info: <Info className="h-4 w-4 text-blue-400" />,
    success: <CheckCircle className="h-4 w-4 text-green-400" />,
    warning: <AlertCircle className="h-4 w-4 text-yellow-400" />,
    error: <AlertCircle className="h-4 w-4 text-red-400" />,
  }[message.type]

  const colorClass = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  }[message.type]

  const bgClass = {
    info: 'bg-blue-900/20',
    success: 'bg-green-900/20',
    warning: 'bg-yellow-900/20',
    error: 'bg-red-900/20',
  }[message.type]

  return (
    <div className={cn('rounded p-2', bgClass)}>
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <p className={cn('text-sm', colorClass)}>{message.message}</p>
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {formatTime(message.timestamp)}
            </span>
          </div>
          {message.details && (
            <div className="mt-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-1 text-xs text-gray-400 hover:text-gray-300"
              >
                <ChevronUp
                  className={cn(
                    'h-3 w-3 transition-transform',
                    isExpanded ? 'transform rotate-180' : ''
                  )}
                />
                <span>{isExpanded ? 'Hide' : 'Show'} details</span>
              </button>
              {isExpanded && (
                <pre className="mt-2 text-xs text-gray-400 whitespace-pre-wrap bg-gray-900/50 p-2 rounded">
                  {message.details}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}
