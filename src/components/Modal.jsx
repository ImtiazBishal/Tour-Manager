import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/60" onClick={onClose} />
      <div className="animate-modal-slide-up relative z-10 w-full rounded-2xl rounded-b-none border border-gray-200/80 bg-white/90 backdrop-blur-lg shadow-2xl sm:max-w-lg sm:rounded-2xl max-h-[90vh] overflow-y-auto dark:border-gray-700/40 dark:bg-gray-900/40 dark:backdrop-blur-lg">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100/80 bg-white/90 backdrop-blur-lg px-5 py-4 dark:border-gray-700/30 dark:bg-gray-900/40">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <button onClick={onClose} className="btn-ghost flex h-8 w-8 items-center justify-center rounded-lg p-0" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
