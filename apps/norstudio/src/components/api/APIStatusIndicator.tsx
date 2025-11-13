'use client'

import React, { useState } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useAPIHealth } from '@/lib/hooks/useAPIHealth'

export const APIStatusIndicator = (): JSX.Element => {
  const { isOnline, isChecking, lastChecked, error, refresh } = useAPIHealth()
  const [showTooltip, setShowTooltip] = useState(false)

  const handleRefresh = () => {
    refresh()
  }

  const formatLastChecked = (date: Date | null): string => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)

    if (minutes === 0) return `${'$'}{seconds}s ago`
    if (minutes < 60) return `${'$'}{minutes}m ago`
    return date.toLocaleTimeString()
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={handleRefresh}
        disabled={isChecking}
        aria-label={`API Status: ${'$'}{isOnline ? 'Online' : 'Offline'}`}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${'$'}{
          isOnline
            ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
            : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
        } ${'$'}{isChecking ? 'cursor-wait' : 'cursor-pointer'}`}
      >
        {isChecking ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : isOnline ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}

        <span className="hidden sm:inline">
          {isChecking ? 'Checking...' : isOnline ? 'Online' : 'Offline'}
        </span>

        <span
          className={`sm:hidden h-2 w-2 rounded-full ${'$'}{
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </button>

      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-64 z-50 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 border border-gray-700">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Connection:</span>
              <span
                className={`font-medium ${'$'}{
                  isOnline ? 'text-green-400' : 'text-gray-400'
                }`}
              >
                {isOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Last Checked:</span>
              <span className="text-gray-300">{formatLastChecked(lastChecked)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Mode:</span>
              <span className="text-gray-300">
                {isOnline ? 'Live API' : 'Development (Mock)'}
              </span>
            </div>

            {error && (
              <div className="pt-2 border-t border-gray-700">
                <span className="text-red-400 text-xs">{error}</span>
              </div>
            )}

            <div className="pt-2 border-t border-gray-700 text-gray-400">
              {isOnline ? (
                <p>Connected to backend API. All features available.</p>
              ) : (
                <p>
                  Running in offline mode with mock responses. AI features will use
                  development placeholders.
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-gray-700">
              <button
                onClick={handleRefresh}
                disabled={isChecking}
                className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className={`h-3 w-3 ${'$'}{isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : 'Refresh Status'}
              </button>
            </div>
          </div>

          <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 transform rotate-45" />
        </div>
      )}
    </div>
  )
}
