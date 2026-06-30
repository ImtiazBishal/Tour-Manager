import { useState, useEffect, useCallback } from 'react'

/**
 * Hook to track online/offline status.
 * Returns an object with:
 * - isOnline: boolean - whether the browser is currently online
 * - wasOffline: boolean - whether the app was offline since mount (useful for showing reconnection)
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(!navigator.onLine)

  const handleOnline = useCallback(() => {
    setIsOnline(true)
    setWasOffline(true)
  }, [])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
  }, [])

  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  const clearWasOffline = useCallback(() => setWasOffline(false), [])

  return { isOnline, wasOffline, clearWasOffline }
}
