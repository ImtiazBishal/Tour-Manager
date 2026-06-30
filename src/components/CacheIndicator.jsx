import { Clock } from 'lucide-react'

/**
 * A subtle badge that appears next to page titles when data is loaded from
 * the local cache (i.e. the user is offline or the fetch failed and fell back to cached data).
 */
export default function CacheIndicator() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-amber-200/60 bg-amber-50/80 px-2 py-0.5 text-[10px] font-medium text-amber-600 shadow-sm backdrop-blur-sm dark:border-amber-800/40 dark:bg-amber-900/30 dark:text-amber-400"
      title="Showing previously synced data — you are offline or the server is unavailable"
    >
      <Clock className="h-2.5 w-2.5" />
      <span>Cached</span>
    </span>
  )
}
