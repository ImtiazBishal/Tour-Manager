import { useState, useCallback } from 'react'
import {
  X,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Receipt,
  Banknote,
  HeartHandshake,
  Scale,
  Users,
  Settings,
  Wallet,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'

const TOUR_STEPS = [
  {
    icon: Sparkles,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    darkBg: 'dark:bg-emerald-900/50',
    title: 'Welcome to Tour Expense Tracker! 🎉',
    description:
      'Track shared expenses with your travel group, manage advances and contributions, and settle up at the end — all in one place.',
    highlight: 'group',
  },
  {
    icon: LayoutDashboard,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    darkBg: 'dark:bg-amber-900/50',
    title: 'Dashboard — Your Command Center',
    description:
      'Get a bird\'s-eye view of total expenses, advances, net spending, and who owes what. See today\'s activity, latest transactions, category breakdown, and a full balance overview.',
    highlight: 'dashboard',
  },
  {
    icon: Receipt,
    color: 'text-teal-600',
    bg: 'bg-teal-100',
    darkBg: 'dark:bg-teal-900/50',
    title: 'Expenses — Record Everything',
    description:
      'Log every group expense with date, category, description, amount, and who paid. Split expenses unequally using the expense sharing editor. Select multiple records for bulk actions.',
    highlight: 'expenses',
  },
  {
    icon: Banknote,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    darkBg: 'dark:bg-emerald-900/50',
    title: 'Advances — Track Payments',
    description:
      'Record advance payments given to members — cash, bKash, Nagad, or bank transfer. Advances reduce what each person still owes toward their share of the total expenses.',
    highlight: 'advances',
  },
  {
    icon: HeartHandshake,
    color: 'text-rose-600',
    bg: 'bg-rose-100',
    darkBg: 'dark:bg-rose-900/50',
    title: 'Contributions — Manager Payments',
    description:
      'Track money the tour manager paid on behalf of specific people — like buying a bus ticket for someone. These count toward that person\'s share of the total.',
    highlight: 'contributions',
  },
  {
    icon: Scale,
    color: 'text-violet-600',
    bg: 'bg-violet-100',
    darkBg: 'dark:bg-violet-900/50',
    title: 'Settlement — Settle Up Fairly',
    description:
      'When the trip ends, generate a complete settlement summary showing each person\'s share vs what they paid. Download as PNG or PDF to share with the group.',
    highlight: 'settlement',
  },
  {
    icon: Users,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    darkBg: 'dark:bg-amber-900/50',
    title: 'Members — Manage Your Group',
    description:
      'Add, edit, or remove members and assign roles (Manager vs Member). The manager tracks overall expenses, while members can receive advances and contributions.',
    highlight: 'members',
  },
  {
    icon: Settings,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    darkBg: 'dark:bg-gray-800',
    title: 'Settings & Data Management',
    description:
      'Change currency, toggle dark mode, manage expense categories, backup/restore your data with JSON exports, and reset all data if needed.',
    highlight: 'settings',
  },
  {
    icon: Wallet,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    darkBg: 'dark:bg-emerald-900/50',
    title: 'You\'re All Set! 🚀',
    description:
      'Start by adding members, then record expenses as they happen. Use the navigation bar to move between sections. You can replay this tour anytime from the Help Guide or Settings.',
    highlight: 'done',
  },
]

export default function TourOverlay({ onClose }) {
  const [step, setStep] = useState(0)
  const current = TOUR_STEPS[step]
  const isFirst = step === 0
  const isLast = step === TOUR_STEPS.length - 1
  const StepIcon = current.icon

  const handleNext = useCallback(() => {
    if (isLast) {
      onClose()
    } else {
      setStep((s) => s + 1)
    }
  }, [isLast, onClose])

  const handlePrev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1))
  }, [])

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70"
        onClick={onClose}
      />

      {/* Tour Card */}
      <div className="animate-scale-in relative z-10 mx-auto w-full max-w-md rounded-t-2xl border border-gray-200/80 bg-white/95 px-5 pb-6 pt-5 shadow-2xl backdrop-blur-xl sm:rounded-2xl dark:border-gray-700/60 dark:bg-gray-900/95">
        {/* Close button */}
        <button
          onClick={onClose}
          className="btn-ghost absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg p-0"
          aria-label="Close tour"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Step counter */}
        <div className="mb-1 text-[11px] font-medium text-gray-400 dark:text-gray-500">
          {step + 1} of {TOUR_STEPS.length}
        </div>

        {/* Icon */}
        <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${current.bg} ${current.darkBg}`}>
          <StepIcon className={`h-7 w-7 ${current.color}`} />
        </div>

        {/* Title */}
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          {current.title}
        </h3>

        {/* Description */}
        <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {current.description}
        </p>

        {/* Progress dots */}
        <div className="mb-5 flex items-center justify-center gap-1.5">
          {TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setStep(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === step
                  ? 'w-6 bg-emerald-600 dark:bg-emerald-400'
                  : 'w-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500'
              }`}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="btn-ghost px-3 py-2 text-xs"
          >
            Skip tour
          </button>

          <div className="flex-1" />

          {!isFirst && (
            <button
              onClick={handlePrev}
              className="btn-secondary px-3 py-2 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>
          )}

          <button
            onClick={handleNext}
            className={`btn-ghost px-4 py-2 text-xs font-semibold ${
              isLast
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60'
            }`}
          >
            {isLast ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Get Started
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
