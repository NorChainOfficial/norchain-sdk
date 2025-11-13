/**
 * API Health Check Hook
 *
 * Monitors the API connection status and provides real-time feedback
 * about backend availability. Falls back to offline mode gracefully.
 */

import { useState, useEffect, useCallback } from 'react'
import { checkAPIHealth } from '@/config/api'

export interface APIHealthStatus {
  readonly isOnline: boolean
  readonly isChecking: boolean
  readonly lastChecked: Date | null
  readonly error: string | null
}

const CHECK_INTERVAL = 60000 // Check every 60 seconds
const INITIAL_CHECK_DELAY = 2000 // Wait 2 seconds before first check

/**
 * Hook to monitor API health status
 */
export function useAPIHealth() {
  const [status, setStatus] = useState<APIHealthStatus>({
    isOnline: false,
    isChecking: true,
    lastChecked: null,
    error: null,
  })

  const checkHealth = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isChecking: true }))

    try {
      const isHealthy = await checkAPIHealth()
      setStatus({
        isOnline: isHealthy,
        isChecking: false,
        lastChecked: new Date(),
        error: null,
      })
    } catch (error) {
      setStatus({
        isOnline: false,
        isChecking: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }, [])

  // Initial check after delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkHealth()
    }, INITIAL_CHECK_DELAY)

    return () => clearTimeout(timeoutId)
  }, [checkHealth])

  // Periodic health checks
  useEffect(() => {
    const intervalId = setInterval(() => {
      checkHealth()
    }, CHECK_INTERVAL)

    return () => clearInterval(intervalId)
  }, [checkHealth])

  // Manual refresh function
  const refresh = useCallback(() => {
    checkHealth()
  }, [checkHealth])

  return {
    ...status,
    refresh,
  }
}
