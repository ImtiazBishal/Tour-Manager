import { useState, useEffect } from 'react'
import { X, Check, Minus, Users, Crown } from 'lucide-react'

export default function ExpenseSharingEditor({ members, managerId, expenseAmount, existingShares, onChange }) {
  const [shares, setShares] = useState({})

  // Initialize shares from existing data or defaults
  useEffect(() => {
    const initial = {}
    // Try to preserve existing shares first
    if (existingShares && Object.keys(existingShares).length > 0) {
      members.forEach((m) => {
        if (existingShares[m.id]) {
          initial[m.id] = { ...existingShares[m.id] }
        } else {
          initial[m.id] = { type: 'equal' }
        }
      })
    } else {
      members.forEach((m) => {
        initial[m.id] = { type: 'equal' }
      })
    }
    setShares(initial)
  }, [members, existingShares])

  function setShareType(memberId, type) {
    const next = {
      ...shares,
      [memberId]: { type, fixedAmount: type === 'fixed' ? (shares[memberId]?.fixedAmount || '') : undefined },
    }
    setShares(next)
    onChange(next)
  }

  function setFixedAmount(memberId, amount) {
    const next = {
      ...shares,
      [memberId]: { ...shares[memberId], fixedAmount: amount },
    }
    setShares(next)
    onChange(next)
  }

  // Calculate sharing summary
  const amount = Number(expenseAmount) || 0
  const excludedCount = Object.values(shares).filter((s) => s.type === 'excluded').length
  const fixedShares = Object.entries(shares)
    .filter(([_, s]) => s.type === 'fixed' && Number(s.fixedAmount) > 0)
    .map(([id, s]) => ({ memberId: id, amount: Number(s.fixedAmount) }))
  const totalFixed = fixedShares.reduce((sum, f) => sum + f.amount, 0)
  const remainingAmount = Math.max(0, amount - totalFixed)
  const activeShareCount = members.length - excludedCount - fixedShares.length
  const perPersonShare = activeShareCount > 0 ? remainingAmount / activeShareCount : 0

  return (
    <div className="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-800/50 dark:bg-indigo-950/30">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Expense Sharing</span>
        <span className="ml-auto badge bg-indigo-100 text-indigo-700 text-[10px] dark:bg-indigo-900/50 dark:text-indigo-300">
          {excludedCount > 0 ? `${members.length - excludedCount} sharers` : `${members.length} equal`}
        </span>
      </div>

      <div className="space-y-1.5">
        {members.map((m) => {
          const s = shares[m.id] || { type: 'equal' }
          const isManager = m.id === managerId
          return (
            <div
              key={m.id}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                s.type === 'excluded'
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                  : s.type === 'fixed'
                  ? 'bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50'
                  : 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className={`font-medium truncate ${s.type === 'excluded' ? 'line-through' : ''} dark:text-gray-200`}>
                  {m.name}
                </span>
                {isManager && <Crown className="h-3 w-3 text-indigo-500 flex-shrink-0 dark:text-indigo-400" />}
              </div>

              {/* Share type selector */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShareType(m.id, 'equal')}
                  className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                    s.type === 'equal'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Equal
                </button>
                <button
                  type="button"
                  onClick={() => setShareType(m.id, 'fixed')}
                  className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                    s.type === 'fixed'
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Fixed
                </button>
                <button
                  type="button"
                  onClick={() => setShareType(m.id, 'excluded')}
                  className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                    s.type === 'excluded'
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Minus className="h-3 w-3 inline" /> Exclude
                </button>
              </div>

              {/* Fixed amount input */}
              {s.type === 'fixed' && (
                <div className="flex-shrink-0">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={s.fixedAmount || ''}
                    onChange={(e) => setFixedAmount(m.id, e.target.value)}
                    placeholder="Amount"
                    className="w-24 rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs text-right focus:border-amber-400 focus:outline-none dark:border-amber-700 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-amber-500"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sharing summary */}
      {amount > 0 && (
        <div className="rounded-xl bg-white border border-gray-200 px-3 py-2.5 text-xs space-y-1 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-between text-gray-500">
            <span>Total expense</span>
            <span className="font-medium text-gray-700">{Number(amount).toFixed(2)}</span>
          </div>
          {totalFixed > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Fixed shares ({fixedShares.length} member{fixedShares.length > 1 ? 's' : ''})</span>
              <span className="font-medium text-amber-700">−{totalFixed.toFixed(2)}</span>
            </div>
          )}
          {excludedCount > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Excluded ({excludedCount})</span>
              <span className="font-medium text-gray-400">−</span>
            </div>
          )}
          {activeShareCount > 0 && (
            <div className="flex justify-between border-t border-gray-100 pt-1 text-gray-700">
              <span>Remaining ÷ {activeShareCount} equal</span>
              <span className="font-semibold text-gray-900">{perPersonShare.toFixed(2)} each</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
