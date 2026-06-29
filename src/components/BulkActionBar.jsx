import { X, Loader2, Trash2, User, Download } from 'lucide-react'

export default function BulkActionBar({ selectedCount, actions, onClearSelection }) {
  if (selectedCount === 0) return null
  return (
    <div className="animate-slide-up fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] backdrop-blur-lg sm:left-14 sm:bottom-auto sm:top-14 sm:border-b sm:border-t-0 sm:shadow-md dark:border-gray-700 dark:bg-gray-900/95">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            {selectedCount}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedCount} selected
          </span>
          <button
            onClick={onClearSelection}
            className="btn-ghost !py-1 !px-2 !text-xs text-gray-500"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        </div>
        <div className="flex items-center gap-2">
          {actions.map((action, idx) => {
            const Icon = action.icon
            const isDanger = action.variant === 'danger'
            return (
              <button
                key={idx}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm transition-all duration-200 ${
                  isDanger
                    ? 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {action.loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : Icon ? (
                  <Icon className="h-3.5 w-3.5" />
                ) : null}
                {action.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
