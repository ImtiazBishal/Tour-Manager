import { useState, useEffect } from 'react'

export default function OfflineBanner({ pendingCount }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!navigator.onLine || pendingCount > 0) {
      setVisible(true)
      return
    }
    // When coming online with no pending items, show briefly then hide
    if (!navigator.onLine) return
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [navigator.onLine, pendingCount])

  // If online and no pending, and timer has run, hide
  useEffect(() => {
    if (navigator.onLine && pendingCount === 0) {
      const timer = setTimeout(() => setVisible(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [navigator.onLine, pendingCount])

  if (!visible && navigator.onLine && pendingCount === 0) return null

  return (
    <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 sm:top-4">
      <div
        className={`animate-slide-up flex items-center gap-2 rounded-2xl border px-4 py-2.5 shadow-xl backdrop-blur-lg transition-all duration-300 ${
          !navigator.onLine
            ? 'border-amber-200/80 bg-amber-50/95 text-amber-800 dark:border-amber-800/50 dark:bg-amber-900/40 dark:text-amber-200'
            : pendingCount > 0
              ? 'border-emerald-200/80 bg-emerald-50/95 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-900/40 dark:text-emerald-200'
              : 'border-emerald-200/80 bg-emerald-50/95 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-900/40 dark:text-emerald-200'
        }`}
      >
        {!navigator.onLine ? (
          <>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-800/50">
              <svg className="h-4 w-4 text-amber-600 dark:text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">You're offline</span>
              {pendingCount > 0 && (
                <span className="text-xs opacity-80">
                  {pendingCount} change{pendingCount !== 1 ? 's' : ''} pending sync
                </span>
              )}
            </div>
          </>
        ) : pendingCount > 0 ? (
          <>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-800/50">
              <svg className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
            <span className="text-sm font-semibold">
              Syncing {pendingCount} change{pendingCount !== 1 ? 's' : ''}...
            </span>
          </>
        ) : (
          <>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-800/50">
              <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="text-sm font-semibold">All changes synced!</span>
          </>
        )}
      </div>
    </div>
  )
}
