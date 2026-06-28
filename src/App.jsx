import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './lib/supabase'
import {
  LayoutDashboard,
  Receipt,
  Banknote,
  HeartHandshake,
  Scale,
  Menu,
  X,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  TrendingDown,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Home,
  UtensilsCrossed,
  ArrowUp,
  ArrowDown,
  Package,
  CheckCircle2,
  Calendar,
  User,
  CreditCard,
  FileText,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  Pencil,
  Check,
} from 'lucide-react'

/* ─── Constants ─── */

const CATEGORY_ICONS = {
  'House Rent': Home,
  Food: UtensilsCrossed,
  'Travel Up': ArrowUp,
  'Travel Down': ArrowDown,
  Miscellaneous: Package,
}

const PAYMENT_METHODS = ['Cash', 'bKash', 'Nagad', 'Bank Transfer']

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'expenses', label: 'Expenses', icon: Receipt },
  { key: 'advances', label: 'Advances', icon: Banknote },
  { key: 'contributions', label: 'Contributions', icon: HeartHandshake },
  { key: 'settlement', label: 'Settlement', icon: Scale },
]

/* ══════════════════════════════════════════════════
   APP
   ══════════════════════════════════════════════════ */

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)

  // Toast state
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const showToast = useCallback((type, message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ type, message, id: Date.now() })
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }, [])

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(null)
  }, [])

  // Confirm dialog state
  const [confirm, setConfirm] = useState(null)

  const showConfirm = useCallback((message, onConfirm) => {
    setConfirm({ message, onConfirm })
  }, [])

  const closeConfirm = useCallback(() => setConfirm(null), [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50 pb-16 sm:pb-0">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              className="btn-ghost rounded-lg p-1.5 sm:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-base font-bold text-gray-900 sm:text-lg">Tour Expense Tracker</h1>
            </div>
          </div>
          <nav className="hidden items-center gap-1 sm:flex">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {activeTab === tab.key && (
                    <span className="absolute -bottom-[9px] left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-indigo-600" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
        {/* Mobile dropdown menu */}
        {menuOpen && (
          <nav className="animate-slide-up border-t border-gray-100 bg-white px-4 pb-3 pt-2 sm:hidden">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key)
                    setMenuOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${activeTab === tab.key ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {tab.label}
                  {activeTab === tab.key && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        )}
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200/80 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-lg sm:hidden">
        <div className="flex items-center justify-around px-2 py-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 transition-all duration-200 ${
                  isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`relative rounded-xl p-1.5 transition-all duration-200 ${
                  isActive ? 'bg-indigo-50' : ''
                }`}>
                  <Icon className={`h-5 w-5 transition-all duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`} />
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <span className={`text-[10px] font-medium leading-tight transition-all duration-200 ${
                  isActive ? 'font-semibold text-indigo-600' : ''
                }`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Page Content */}
      <main className="mx-auto max-w-5xl px-4 py-5 sm:py-6">
        <div className="animate-fade-in" key={activeTab}>
          {activeTab === 'dashboard' && (
            <Dashboard showToast={showToast} />
          )}
          {activeTab === 'expenses' && (
            <Expenses showToast={showToast} showConfirm={showConfirm} />
          )}
          {activeTab === 'advances' && (
            <Advances showToast={showToast} showConfirm={showConfirm} />
          )}
          {activeTab === 'contributions' && (
            <Contributions showToast={showToast} showConfirm={showConfirm} />
          )}
          {activeTab === 'settlement' && (
            <Settlement showToast={showToast} />
          )}
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <Toast toast={toast} onDismiss={dismissToast} />
      )}

      {/* Confirm Dialog */}
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={() => {
            confirm.onConfirm()
            closeConfirm()
          }}
          onCancel={closeConfirm}
        />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   TOAST NOTIFICATION
   ══════════════════════════════════════════════════ */

function Toast({ toast, onDismiss }) {
  const isSuccess = toast.type === 'success'

  return (
    <div className="fixed left-4 right-4 top-4 z-50 sm:left-1/2 sm:w-auto sm:-translate-x-1/2">
      <div
        className={`animate-slide-up flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-lg ${
          isSuccess
            ? 'border-emerald-200 bg-emerald-50/95 text-emerald-800'
            : 'border-red-200 bg-red-50/95 text-red-800'
        }`}
      >
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${
          isSuccess ? 'bg-emerald-100' : 'bg-red-100'
        }`}>
          {isSuccess ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
        </div>
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          onClick={onDismiss}
          className="btn-ghost flex h-7 w-7 items-center justify-center rounded-lg p-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   CONFIRM DIALOG
   ══════════════════════════════════════════════════ */

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="animate-scale-in relative z-10 w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Confirm Delete</h3>
        <p className="mb-6 text-sm leading-relaxed text-gray-600">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger flex-1">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════════════ */

function Dashboard({ showToast }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalAdvances: 0,
    netSpending: 0,
    peopleOwing: 0,
  })
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  const [recentExpenses, setRecentExpenses] = useState([])
  const [balances, setBalances] = useState([])

  useEffect(() => { fetchDashboardData() }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      setError(null)

      const { data: expenses, error: expErr } = await supabase
        .from('expenses')
        .select('amount, category_id, expense_date, description, expense_categories(name), paid_by:members(name)')
        .order('expense_date', { ascending: false })
      if (expErr) throw expErr

      const { data: advances, error: advErr } = await supabase
        .from('advances')
        .select('amount')
      if (advErr) throw advErr

      const { data: balanceData, error: balErr } = await supabase
        .from('v_balances')
        .select('*')
      if (balErr) throw balErr

      const totalExpenses = (expenses || []).reduce((s, e) => s + Number(e.amount), 0)
      const totalAdvances = (advances || []).reduce((s, a) => s + Number(a.amount), 0)
      const peopleOwing = (balanceData || []).filter(
        (b) => b.member_name !== 'Abir' && Number(b.balance) > 0
      ).length

      setStats({ totalExpenses, totalAdvances, netSpending: totalExpenses - totalAdvances, peopleOwing })

      const catMap = {}
      ;(expenses || []).forEach((e) => {
        const n = e.expense_categories?.name || 'Miscellaneous'
        catMap[n] = (catMap[n] || 0) + Number(e.amount)
      })
      setCategoryBreakdown(
        Object.entries(catMap)
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount)
      )
      setRecentExpenses(expenses?.slice(0, 5) || [])
      setBalances(balanceData || [])
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <CenteredSpinner />
  if (error) return <ErrorBox msg={error} />

  const cards = [
    { label: 'Total Expenses', value: `৳${stats.totalExpenses.toFixed(2)}`, icon: Receipt, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Advances Received', value: `৳${stats.totalAdvances.toFixed(2)}`, icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Net Spending', value: `৳${stats.netSpending.toFixed(2)}`, icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'People Who Owe', value: String(stats.peopleOwing), icon: Users, color: 'text-rose-600', bg: 'bg-rose-100' },
  ]

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Dashboard</h2>
        <button
          onClick={fetchDashboardData}
          className="btn-ghost text-xs sm:text-sm"
          aria-label="Refresh"
        >
          <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon
          return (
            <div
              key={c.label}
              className="animate-slide-up card"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-gray-500 sm:text-xs">{c.label}</p>
                  <p className="text-lg font-bold text-gray-900 sm:text-xl">{c.value}</p>
                </div>
                <div className={`rounded-xl ${c.bg} p-2.5`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${c.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2 sm:gap-6">
        <div className="card animate-slide-up">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Category Breakdown</h3>
          <div className="space-y-3">
            {categoryBreakdown.map((cat) => {
              const maxAmt = categoryBreakdown[0]?.amount || 1
              const pct = (cat.amount / maxAmt) * 100
              const Icon = CATEGORY_ICONS[cat.name]
              return (
                <div key={cat.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      {Icon ? <Icon className="h-4 w-4 text-indigo-500" /> : <Package className="h-4 w-4 text-gray-400" />}
                      <span className="text-xs sm:text-sm">{cat.name}</span>
                    </span>
                    <span className="font-semibold text-gray-900 text-xs sm:text-sm">৳{cat.amount.toFixed(2)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {categoryBreakdown.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">No expenses yet</p>
            )}
          </div>
        </div>

        <div className="card animate-slide-up">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Recent Expenses</h3>
          <div className="space-y-2">
            {recentExpenses.map((exp, idx) => (
              <div
                key={exp.id}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-3 transition-colors hover:bg-gray-100"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{exp.description}</p>
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {exp.expense_date} · {exp.paid_by?.name || 'Unknown'}
                  </p>
                </div>
                <span className="ml-3 text-sm font-bold text-gray-900">৳{Number(exp.amount).toFixed(2)}</span>
              </div>
            ))}
            {recentExpenses.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">No expenses yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="card animate-slide-up">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Balance Overview</h3>
        <DesktopTable
          headers={['Person', 'Their Share', 'They Paid', 'Balance']}
          rows={balances.filter((b) => b.member_name !== 'Abir')}
          renderRow={(b) => {
            const bal = Number(b.balance)
            return (
              <>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{b.member_name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">৳{Number(b.expense_share).toFixed(2)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">৳{(Number(b.advance_paid) + Number(b.contribution_for_them) + Number(b.direct_paid)).toFixed(2)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <BalanceBadge balance={bal} />
                </td>
              </>
            )
          }}
          emptyMsg="No data available"
        />
        {/* Mobile cards */}
        <div className="space-y-2 sm:hidden">
          {balances.filter((b) => b.member_name !== 'Abir').length === 0 && (
            <p className="py-4 text-center text-sm text-gray-400">No data available</p>
          )}
          {balances.filter((b) => b.member_name !== 'Abir').map((b) => {
            const bal = Number(b.balance)
            const paid = Number(b.advance_paid) + Number(b.contribution_for_them) + Number(b.direct_paid)
            return (
              <div key={b.member_name} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-gray-900 text-sm">{b.member_name}</span>
                  <BalanceBadge balance={bal} />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Share: <strong>৳{Number(b.expense_share).toFixed(2)}</strong></span>
                  <span>Paid: <strong>৳{paid.toFixed(2)}</strong></span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   EXPENSES
   ══════════════════════════════════════════════════ */

const EMPTY_EXPENSE_FORM = {
  expense_date: new Date().toISOString().split('T')[0],
  category_id: '',
  description: '',
  amount: '',
  paid_by: '',
}

function Expenses({ showToast, showConfirm }) {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY_EXPENSE_FORM)
  const [errors, setErrors] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const isEditing = editingRecord !== null
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategoryLoading, setAddingCategoryLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [expRes, catRes, memRes] = await Promise.all([
        supabase.from('expenses').select('*, expense_categories(*), paid_by:members(name)').order('expense_date', { ascending: false }),
        supabase.from('expense_categories').select('*').order('name'),
        supabase.from('members').select('*').order('name'),
      ])
      if (expRes.error) throw expRes.error
      if (catRes.error) throw catRes.error
      if (memRes.error) throw memRes.error
      setExpenses(expRes.data || [])
      setCategories(catRes.data || [])
      setMembers(memRes.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function validateForm() {
    const newErrors = {}
    if (!form.category_id) newErrors.category_id = 'Please select a category'
    if (!form.description?.trim()) newErrors.description = 'Description is required'
    if (!form.amount || Number(form.amount) <= 0) newErrors.amount = 'Enter a valid amount'
    if (!form.paid_by) newErrors.paid_by = 'Please select who paid'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function clearError(field) {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function updateForm(field, value) {
    setForm({ ...form, [field]: value })
    clearError(field)
  }

  function startEditing(record) {
    setEditingRecord(record)
    setForm({
      expense_date: record.expense_date,
      category_id: record.category_id,
      description: record.description,
      amount: String(record.amount),
      paid_by: record.paid_by,
    })
    setErrors({})
    setShowForm(true)
  }

  function cancelEditing() {
    setEditingRecord(null)
    setForm(EMPTY_EXPENSE_FORM)
    setErrors({})
    setShowForm(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateForm()) return
    try {
      setSubmitting(true)
      if (isEditing) {
        const { error: updErr } = await supabase.from('expenses')
          .update({
            expense_date: form.expense_date,
            category_id: form.category_id,
            description: form.description.trim(),
            amount: Number(form.amount),
            paid_by: form.paid_by,
          })
          .eq('id', editingRecord.id)
        if (updErr) throw updErr
        showToast('success', 'Expense updated successfully!')
      } else {
        const { error: insErr } = await supabase.from('expenses').insert({
          expense_date: form.expense_date,
          category_id: form.category_id,
          description: form.description.trim(),
          amount: Number(form.amount),
          paid_by: form.paid_by,
        })
        if (insErr) throw insErr
        showToast('success', 'Expense added successfully!')
      }
      setForm(EMPTY_EXPENSE_FORM)
      setEditingRecord(null)
      setErrors({})
      setShowForm(false)
      await fetchData()
    } catch (err) {
      showToast('error', err.message || 'Failed to save expense')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    try {
      const { error: delErr } = await supabase.from('expenses').delete().eq('id', id)
      if (delErr) throw delErr
      showToast('success', 'Expense deleted')
      await fetchData()
    } catch (err) {
      showToast('error', err.message || 'Failed to delete expense')
    }
  }

  async function handleAddCategory() {
    const name = newCategoryName.trim()
    if (!name) return
    try {
      setAddingCategoryLoading(true)
      const { data, error: insErr } = await supabase
        .from('expense_categories')
        .insert({ name, icon: 'package' })
        .select()
        .single()
      if (insErr) throw insErr
      await fetchData()
      // Select the new category
      updateForm('category_id', data.id)
      setAddingCategory(false)
      setNewCategoryName('')
      showToast('success', `Category "${name}" added!`)
    } catch (err) {
      showToast('error', err.message || 'Failed to add category')
    } finally {
      setAddingCategoryLoading(false)
    }
  }

  function handleCancelAddCategory() {
    setAddingCategory(false)
    setNewCategoryName('')
  }

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)

  if (loading) return <CenteredSpinner />
  if (error) return <ErrorBox msg={error} />

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Expenses</h2>
        <button
          onClick={() => {
            if (editingRecord) {
              cancelEditing()
            } else {
              setShowForm(!showForm)
            }
          }}
          className="btn-primary px-4 py-2.5 text-xs sm:text-sm sm:px-5 sm:py-3"
        >
          {editingRecord || showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {editingRecord ? 'Cancel' : showForm ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      {showForm && (
        <FormCard title={editingRecord ? 'Edit Expense' : 'Add Expense'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="Date" error={errors.expense_date}>
                <input
                  type="date"
                  value={form.expense_date}
                  onChange={(e) => updateForm('expense_date', e.target.value)}
                  className={`input ${errors.expense_date ? 'input-error' : ''}`}
                />
              </FormField>
              <FormField label="Category" error={errors.category_id}>
                {addingCategory ? (
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                        placeholder="Enter category name"
                        className={`input ${errors.category_id ? 'input-error' : ''}`}
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-1 pt-1">
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={addingCategoryLoading || !newCategoryName.trim()}
                        className="btn-primary !px-3 !py-2.5 !text-xs"
                        title="Add"
                      >
                        {addingCategoryLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelAddCategory}
                        className="btn-secondary !px-3 !py-2.5 !text-xs"
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={form.category_id}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === '__add__') {
                          setAddingCategory(true)
                          setNewCategoryName('')
                        } else {
                          updateForm('category_id', val)
                        }
                      }}
                      className={`input input-select ${errors.category_id ? 'input-error' : ''}`}
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      <option value="__add__">➕ Add new category...</option>
                    </select>
                  </div>
                )}
              </FormField>
              <FormField label="Description" error={errors.description}>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  placeholder="e.g. Dinner at restaurant"
                  className={`input ${errors.description ? 'input-error' : ''}`}
                />
              </FormField>
              <FormField label="Amount (৳)" error={errors.amount}>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => updateForm('amount', e.target.value)}
                  placeholder="0.00"
                  className={`input ${errors.amount ? 'input-error' : ''}`}
                />
              </FormField>
              <FormField label="Paid By" error={errors.paid_by}>
                <select
                  value={form.paid_by}
                  onChange={(e) => updateForm('paid_by', e.target.value)}
                  className={`input input-select ${errors.paid_by ? 'input-error' : ''}`}
                >
                  <option value="">Select person</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </FormField>
              <div className="flex items-end sm:col-span-2 lg:col-span-1">
                <SubmitButton loading={submitting} icon={editingRecord ? Check : Plus}>
                  {editingRecord ? 'Update Expense' : 'Add Expense'}
                </SubmitButton>
              </div>
            </div>
          </form>
        </FormCard>
      )}

      <DataTable
        headers={['Date', 'Category', 'Description', 'Amount', 'Paid By', '']}
        rows={expenses}
        total={total}
        totalColSpan={3}
        emptyMsg="No expenses recorded yet"
        renderRow={(exp) => (
          <>
            <td className="whitespace-nowrap px-4 py-3.5 text-gray-600 text-sm">{exp.expense_date}</td>
            <td className="whitespace-nowrap px-4 py-3.5">
              <span className="badge bg-indigo-100 text-indigo-700">
                {(() => { const I = CATEGORY_ICONS[exp.expense_categories?.name]; return I ? <I className="h-3 w-3" /> : null })()}
                {exp.expense_categories?.name}
              </span>
            </td>
            <td className="px-4 py-3.5 font-medium text-gray-900 text-sm">{exp.description}</td>
            <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-gray-900">৳{Number(exp.amount).toFixed(2)}</td>
            <td className="whitespace-nowrap px-4 py-3.5 text-gray-600 text-sm">{exp.paid_by?.name}</td>
            <td className="whitespace-nowrap px-4 py-3.5 text-center">
              <div className="flex items-center justify-center gap-1">
                <EditBtn onClick={() => startEditing(exp)} />
                <DeleteBtn onClick={() => showConfirm(`Delete this expense of ৳${Number(exp.amount).toFixed(2)}?`, () => handleDelete(exp.id))} />
              </div>
            </td>
          </>
        )}
        renderMobileCard={(exp) => (
          <MobileDataRow
            title={exp.description}
            subtitle={exp.expense_date}
            meta={exp.paid_by?.name}
            amount={Number(exp.amount)}
            badge={exp.expense_categories?.name}
            onEdit={() => startEditing(exp)}
            onDelete={() => showConfirm(`Delete this expense of ৳${Number(exp.amount).toFixed(2)}?`, () => handleDelete(exp.id))}
          />
        )}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════
   ADVANCES
   ══════════════════════════════════════════════════ */

const EMPTY_ADVANCE_FORM = {
  payment_date: new Date().toISOString().split('T')[0],
  member_id: '',
  amount: '',
  method: 'Cash',
  notes: '',
}

function Advances({ showToast, showConfirm }) {
  const [advances, setAdvances] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY_ADVANCE_FORM)
  const [errors, setErrors] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const isEditing = editingRecord !== null

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [advRes, memRes] = await Promise.all([
        supabase.from('advances').select('*, members(name)').order('payment_date', { ascending: false }),
        supabase.from('members').select('*').neq('name', 'Abir').order('name'),
      ])
      if (advRes.error) throw advRes.error
      if (memRes.error) throw memRes.error
      setAdvances(advRes.data || [])
      setMembers(memRes.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function validateForm() {
    const newErrors = {}
    if (!form.member_id) newErrors.member_id = 'Please select a person'
    if (!form.amount || Number(form.amount) <= 0) newErrors.amount = 'Enter a valid amount'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function clearError(field) {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function updateForm(field, value) {
    setForm({ ...form, [field]: value })
    clearError(field)
  }

  function startEditing(record) {
    setEditingRecord(record)
    setForm({
      payment_date: record.payment_date,
      member_id: record.member_id,
      amount: String(record.amount),
      method: record.method,
      notes: record.notes || '',
    })
    setErrors({})
    setShowForm(true)
  }

  function cancelEditing() {
    setEditingRecord(null)
    setForm(EMPTY_ADVANCE_FORM)
    setErrors({})
    setShowForm(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateForm()) return
    try {
      setSubmitting(true)
      if (isEditing) {
        const { error: updErr } = await supabase.from('advances')
          .update({
            payment_date: form.payment_date,
            member_id: form.member_id,
            amount: Number(form.amount),
            method: form.method,
            notes: form.notes || null,
          })
          .eq('id', editingRecord.id)
        if (updErr) throw updErr
        showToast('success', 'Advance payment updated successfully!')
      } else {
        const { error: insErr } = await supabase.from('advances').insert({
          payment_date: form.payment_date,
          member_id: form.member_id,
          amount: Number(form.amount),
          method: form.method,
          notes: form.notes || null,
        })
        if (insErr) throw insErr
        showToast('success', 'Advance payment added successfully!')
      }
      setForm(EMPTY_ADVANCE_FORM)
      setEditingRecord(null)
      setErrors({})
      setShowForm(false)
      await fetchData()
    } catch (err) {
      showToast('error', err.message || 'Failed to save advance payment')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    try {
      const { error: delErr } = await supabase.from('advances').delete().eq('id', id)
      if (delErr) throw delErr
      showToast('success', 'Advance deleted')
      await fetchData()
    } catch (err) {
      showToast('error', err.message || 'Failed to delete advance')
    }
  }

  const total = advances.reduce((s, a) => s + Number(a.amount), 0)

  if (loading) return <CenteredSpinner />
  if (error) return <ErrorBox msg={error} />

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Advances</h2>
        <button
          onClick={() => {
            if (editingRecord) {
              cancelEditing()
            } else {
              setShowForm(!showForm)
            }
          }}
          className="btn-primary px-4 py-2.5 text-xs sm:text-sm sm:px-5 sm:py-3"
        >
          {editingRecord || showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {editingRecord ? 'Cancel' : showForm ? 'Cancel' : 'Add Advance'}
        </button>
      </div>

      {showForm && (
        <FormCard title={editingRecord ? 'Edit Advance Payment' : 'Add Advance Payment'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="Date" error={errors.payment_date}>
                <input
                  type="date"
                  value={form.payment_date}
                  onChange={(e) => updateForm('payment_date', e.target.value)}
                  className={`input ${errors.payment_date ? 'input-error' : ''}`}
                />
              </FormField>
              <FormField label="Person" error={errors.member_id}>
                <select
                  value={form.member_id}
                  onChange={(e) => updateForm('member_id', e.target.value)}
                  className={`input input-select ${errors.member_id ? 'input-error' : ''}`}
                >
                  <option value="">Select person</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Amount (৳)" error={errors.amount}>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => updateForm('amount', e.target.value)}
                  placeholder="0.00"
                  className={`input ${errors.amount ? 'input-error' : ''}`}
                />
              </FormField>
              <FormField label="Method">
                <select
                  value={form.method}
                  onChange={(e) => updateForm('method', e.target.value)}
                  className="input input-select"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Notes (optional)">
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => updateForm('notes', e.target.value)}
                  placeholder="Any notes..."
                  className="input"
                />
              </FormField>
              <div className="flex items-end">
                <SubmitButton loading={submitting} icon={editingRecord ? Check : Plus}>
                  {editingRecord ? 'Update Advance' : 'Add Advance'}
                </SubmitButton>
              </div>
            </div>
          </form>
        </FormCard>
      )}

      <DataTable
        headers={['Date', 'Person', 'Amount', 'Method', 'Notes', '']}
        rows={advances}
        total={total}
        totalColSpan={2}
        emptyMsg="No advances recorded yet"
        renderRow={(adv) => (
          <>
            <td className="whitespace-nowrap px-4 py-3.5 text-gray-600 text-sm">{adv.payment_date}</td>
            <td className="whitespace-nowrap px-4 py-3.5 font-medium text-gray-900">{adv.members?.name}</td>
            <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-gray-900">৳{Number(adv.amount).toFixed(2)}</td>
            <td className="whitespace-nowrap px-4 py-3.5">
              <span className="badge bg-emerald-100 text-emerald-700">{adv.method}</span>
            </td>
            <td className="px-4 py-3.5 text-gray-500 text-sm">{adv.notes || '—'}</td>
            <td className="whitespace-nowrap px-4 py-3.5 text-center">
              <div className="flex items-center justify-center gap-1">
                <EditBtn onClick={() => startEditing(adv)} />
                <DeleteBtn onClick={() => showConfirm(`Delete this advance of ৳${Number(adv.amount).toFixed(2)} for ${adv.members?.name}?`, () => handleDelete(adv.id))} />
              </div>
            </td>
          </>
        )}
        renderMobileCard={(adv) => (
          <MobileDataRow
            title={adv.members?.name}
            subtitle={adv.payment_date}
            meta={adv.notes || adv.method}
            amount={Number(adv.amount)}
            badge={adv.method}
            onEdit={() => startEditing(adv)}
            onDelete={() => showConfirm(`Delete this advance of ৳${Number(adv.amount).toFixed(2)}?`, () => handleDelete(adv.id))}
          />
        )}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════
   CONTRIBUTIONS
   ══════════════════════════════════════════════════ */

const EMPTY_CONTRIB_FORM = {
  contribution_date: new Date().toISOString().split('T')[0],
  member_id: '',
  amount: '',
  reason: '',
}

function Contributions({ showToast, showConfirm }) {
  const [contributions, setContributions] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY_CONTRIB_FORM)
  const [errors, setErrors] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const isEditing = editingRecord !== null

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [conRes, memRes] = await Promise.all([
        supabase.from('contributions').select('*, members(name)').order('contribution_date', { ascending: false }),
        supabase.from('members').select('*').neq('name', 'Abir').order('name'),
      ])
      if (conRes.error) throw conRes.error
      if (memRes.error) throw memRes.error
      setContributions(conRes.data || [])
      setMembers(memRes.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function validateForm() {
    const newErrors = {}
    if (!form.member_id) newErrors.member_id = 'Please select a person'
    if (!form.amount || Number(form.amount) <= 0) newErrors.amount = 'Enter a valid amount'
    if (!form.reason?.trim()) newErrors.reason = 'Reason is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function clearError(field) {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function updateForm(field, value) {
    setForm({ ...form, [field]: value })
    clearError(field)
  }

  function startEditing(record) {
    setEditingRecord(record)
    setForm({
      contribution_date: record.contribution_date,
      member_id: record.member_id,
      amount: String(record.amount),
      reason: record.reason,
    })
    setErrors({})
    setShowForm(true)
  }

  function cancelEditing() {
    setEditingRecord(null)
    setForm(EMPTY_CONTRIB_FORM)
    setErrors({})
    setShowForm(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateForm()) return
    try {
      setSubmitting(true)
      if (isEditing) {
        const { error: updErr } = await supabase.from('contributions')
          .update({
            contribution_date: form.contribution_date,
            member_id: form.member_id,
            amount: Number(form.amount),
            reason: form.reason.trim(),
          })
          .eq('id', editingRecord.id)
        if (updErr) throw updErr
        showToast('success', 'Contribution updated successfully!')
      } else {
        const { error: insErr } = await supabase.from('contributions').insert({
          contribution_date: form.contribution_date,
          member_id: form.member_id,
          amount: Number(form.amount),
          reason: form.reason.trim(),
        })
        if (insErr) throw insErr
        showToast('success', 'Contribution added successfully!')
      }
      setForm(EMPTY_CONTRIB_FORM)
      setEditingRecord(null)
      setErrors({})
      setShowForm(false)
      await fetchData()
    } catch (err) {
      showToast('error', err.message || 'Failed to save contribution')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    try {
      const { error: delErr } = await supabase.from('contributions').delete().eq('id', id)
      if (delErr) throw delErr
      showToast('success', 'Contribution deleted')
      await fetchData()
    } catch (err) {
      showToast('error', err.message || 'Failed to delete contribution')
    }
  }

  const total = contributions.reduce((s, c) => s + Number(c.amount), 0)

  if (loading) return <CenteredSpinner />
  if (error) return <ErrorBox msg={error} />

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Contributions</h2>
        <button
          onClick={() => {
            if (editingRecord) {
              cancelEditing()
            } else {
              setShowForm(!showForm)
            }
          }}
          className="btn-primary px-4 py-2.5 text-xs sm:text-sm sm:px-5 sm:py-3"
        >
          {editingRecord || showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {editingRecord ? 'Cancel' : showForm ? 'Cancel' : 'Add Contribution'}
        </button>
      </div>
      <p className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-sm leading-relaxed text-indigo-700">
        Track money that <strong>Abir</strong> paid on behalf of other people.
      </p>

      {showForm && (
        <FormCard title={editingRecord ? 'Edit Contribution' : 'Add Contribution'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Date" error={errors.contribution_date}>
                <input
                  type="date"
                  value={form.contribution_date}
                  onChange={(e) => updateForm('contribution_date', e.target.value)}
                  className={`input ${errors.contribution_date ? 'input-error' : ''}`}
                />
              </FormField>
              <FormField label="Person" error={errors.member_id}>
                <select
                  value={form.member_id}
                  onChange={(e) => updateForm('member_id', e.target.value)}
                  className={`input input-select ${errors.member_id ? 'input-error' : ''}`}
                >
                  <option value="">Select person</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Amount (৳)" error={errors.amount}>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => updateForm('amount', e.target.value)}
                  placeholder="0.00"
                  className={`input ${errors.amount ? 'input-error' : ''}`}
                />
              </FormField>
              <FormField label="Reason" error={errors.reason}>
                <input
                  type="text"
                  value={form.reason}
                  onChange={(e) => updateForm('reason', e.target.value)}
                  placeholder="e.g. Paid bus ticket"
                  className={`input ${errors.reason ? 'input-error' : ''}`}
                />
              </FormField>
            </div>
            <SubmitButton loading={submitting} icon={editingRecord ? Check : Plus}>
              {editingRecord ? 'Update Contribution' : 'Add Contribution'}
            </SubmitButton>
          </form>
        </FormCard>
      )}

      <DataTable
        headers={['Date', 'Person', 'Amount', 'Reason', '']}
        rows={contributions}
        total={total}
        totalColSpan={2}
        emptyMsg="No contributions recorded yet"
        renderRow={(con) => (
          <>
            <td className="whitespace-nowrap px-4 py-3.5 text-gray-600 text-sm">{con.contribution_date}</td>
            <td className="whitespace-nowrap px-4 py-3.5 font-medium text-gray-900">{con.members?.name}</td>
            <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-gray-900">৳{Number(con.amount).toFixed(2)}</td>
            <td className="px-4 py-3.5 text-gray-500 text-sm">{con.reason}</td>
            <td className="whitespace-nowrap px-4 py-3.5 text-center">
              <div className="flex items-center justify-center gap-1">
                <EditBtn onClick={() => startEditing(con)} />
                <DeleteBtn onClick={() => showConfirm(`Delete this contribution of ৳${Number(con.amount).toFixed(2)} for ${con.members?.name}?`, () => handleDelete(con.id))} />
              </div>
            </td>
          </>
        )}
        renderMobileCard={(con) => (
          <MobileDataRow
            title={con.members?.name}
            subtitle={con.contribution_date}
            meta={con.reason}
            amount={Number(con.amount)}
            onEdit={() => startEditing(con)}
            onDelete={() => showConfirm(`Delete this contribution of ৳${Number(con.amount).toFixed(2)}?`, () => handleDelete(con.id))}
          />
        )}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════
   SETTLEMENT
   ══════════════════════════════════════════════════ */

function Settlement() {
  const [balances, setBalances] = useState([])
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)
      const [balRes, expRes] = await Promise.all([
        supabase.from('v_balances').select('*'),
        supabase.from('expenses').select('amount'),
      ])
      if (balRes.error) throw balRes.error
      if (expRes.error) throw expRes.error
      setBalances(balRes.data || [])
      setTotalExpenses((expRes.data || []).reduce((s, e) => s + Number(e.amount), 0))
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <CenteredSpinner />
  if (error) return <ErrorBox msg={error} />

  const perPersonShare = totalExpenses / 8
  const others = balances.filter((b) => b.member_name !== 'Abir')
  const abir = balances.find((b) => b.member_name === 'Abir')
  const totalCollected = balances.reduce((s, b) => s + Number(b.advance_paid) + Number(b.contribution_for_them) + Number(b.direct_paid), 0)
  const abirBalance = abir ? Number(abir.balance) : 0

  const instructions = []
  others.forEach((b) => {
    const bal = Number(b.balance)
    if (bal > 0.01) instructions.push({ from: b.member_name, to: 'Abir', amount: bal, type: 'owes' })
    else if (bal < -0.01) instructions.push({ from: 'Abir', to: b.member_name, amount: Math.abs(bal), type: 'getsBack' })
  })

  return (
    <div className="space-y-5 sm:space-y-6">
      <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Settlement</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500">Per Person Share</p>
              <p className="text-lg font-bold text-gray-900 sm:text-xl">৳{perPersonShare.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-indigo-100 p-2.5">
              <Scale className="h-4 w-4 text-indigo-600 sm:h-5 sm:w-5" />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Total ৳{totalExpenses.toFixed(2)} ÷ 8 people</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500">Total Collected</p>
              <p className="text-lg font-bold text-gray-900 sm:text-xl">৳{totalCollected.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-emerald-100 p-2.5">
              <Wallet className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5" />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Advances + Contributions + Direct payments</p>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <DesktopTable
          headers={['Member', 'Share', 'Advance', 'Contribution', 'Direct Paid', 'Balance']}
          rows={balances}
          renderRow={(b) => {
            const bal = Number(b.balance)
            const owes = bal > 0.01
            const owed = bal < -0.01
            return (
              <tr key={b.member_name} className={`${owes ? 'bg-red-50/50' : owed ? 'bg-green-50/50' : ''} transition-colors hover:bg-gray-50`}>
                <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                  {b.member_name}
                  {b.member_name === 'Abir' && (
                    <span className="ml-2 badge bg-indigo-100 text-indigo-700">Manager</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700 text-sm">৳{Number(b.expense_share).toFixed(2)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700 text-sm">৳{Number(b.advance_paid).toFixed(2)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700 text-sm">৳{Number(b.contribution_for_them).toFixed(2)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700 text-sm">৳{Number(b.direct_paid).toFixed(2)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <BalanceBadge balance={bal} />
                </td>
              </tr>
            )
          }}
          emptyMsg="No data available"
        />
        {/* Mobile cards */}
        <div className="space-y-2 p-4 sm:hidden">
          {balances.length === 0 && <p className="py-4 text-center text-sm text-gray-400">No data available</p>}
          {balances.map((b) => {
            const bal = Number(b.balance)
            const owes = bal > 0.01
            const owed = bal < -0.01
            return (
              <div key={b.member_name} className={`rounded-xl border p-3 ${
                owes ? 'border-red-100 bg-red-50/50' : owed ? 'border-green-100 bg-green-50/50' : 'border-gray-100'
              }`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-gray-900 text-sm">
                    {b.member_name}
                    {b.member_name === 'Abir' && (
                      <span className="badge bg-indigo-100 text-indigo-700 text-[10px]">Mgr</span>
                    )}
                  </span>
                  <BalanceBadge balance={bal} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <span>Share: <strong className="text-gray-700">৳{Number(b.expense_share).toFixed(2)}</strong></span>
                  <span>Advance: <strong className="text-gray-700">৳{Number(b.advance_paid).toFixed(2)}</strong></span>
                  <span>Contribution: <strong className="text-gray-700">৳{Number(b.contribution_for_them).toFixed(2)}</strong></span>
                  <span>Direct Paid: <strong className="text-gray-700">৳{Number(b.direct_paid).toFixed(2)}</strong></span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <MessageSquare className="h-4 w-4 text-indigo-500" />
          Payment Instructions
        </h3>
        <div className="space-y-2">
          {instructions.length > 0 ? instructions.map((inst, idx) => (
            <div
              key={idx}
              className={`animate-slide-up rounded-xl border px-4 py-3.5 text-sm leading-relaxed ${
                inst.type === 'owes'
                  ? 'border-red-100 bg-red-50 text-red-800'
                  : 'border-green-100 bg-green-50 text-green-800'
              }`}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                  inst.type === 'owes' ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {inst.type === 'owes' ? (
                    <ArrowUpRight className="h-4 w-4 text-red-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  {inst.type === 'owes' ? (
                    <span><strong>{inst.from}</strong> should pay <strong>{inst.to}</strong>: <strong>৳{inst.amount.toFixed(2)}</strong></span>
                  ) : (
                    <span><strong>{inst.from}</strong> should return to <strong>{inst.to}</strong>: <strong>৳{inst.amount.toFixed(2)}</strong></span>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-500">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              All settled up! No payments needed.
            </div>
          )}
          {abir && (
            <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3.5 text-sm text-indigo-800">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-indigo-500" />
                <strong>Net for Abir:</strong>{' '}
                {abirBalance > 0.01 ? (
                  <span>Needs to collect <strong>৳{abirBalance.toFixed(2)}</strong> from others</span>
                ) : abirBalance < -0.01 ? (
                  <span>Needs to return <strong>৳{Math.abs(abirBalance).toFixed(2)}</strong> to others</span>
                ) : (
                  <span>Everything is settled!</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   SHARED COMPONENTS
   ══════════════════════════════════════════════════ */

function CenteredSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
      <p className="text-sm font-medium text-gray-500">Loading...</p>
    </div>
  )
}

function ErrorBox({ msg }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-red-100">
        <AlertCircle className="h-4 w-4 text-red-600" />
      </div>
      <div className="flex-1 pt-1">{msg}</div>
    </div>
  )
}

function FormCard({ title, children }) {
  return (
    <div className="card border-indigo-100/50 animate-slide-up">
      {title && (
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100">
            <Plus className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      {children}
    </div>
  )
}

function FormField({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-600">
        {label === 'Amount (৳)' && <DollarSign className="h-3 w-3" />}
        {label === 'Date' && <Calendar className="h-3 w-3" />}
        {label === 'Person' || label === 'Paid By' ? <User className="h-3 w-3" /> : null}
        {label === 'Notes (optional)' || label === 'Reason' ? <FileText className="h-3 w-3" /> : null}
        {label === 'Method' && <CreditCard className="h-3 w-3" />}
        {label.replace(' (optional)', '')}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500 animate-fade-in">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}

function SubmitButton({ loading, icon: Icon, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="btn-primary w-full"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {loading ? (
        <span className="flex items-center gap-1">
          Saving...
        </span>
      ) : children}
    </button>
  )
}

function EditBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="btn-ghost rounded-lg p-2 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
      title="Edit"
      aria-label="Edit"
    >
      <Pencil className="h-4 w-4" />
    </button>
  )
}

function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="btn-ghost rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
      title="Delete"
      aria-label="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}

function BalanceBadge({ balance }) {
  const owes = balance > 0.01
  const owed = balance < -0.01
  const settled = Math.abs(balance) <= 0.01
  return (
    <span className={`badge gap-1 ${
      owes ? 'bg-red-100 text-red-700' : owed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
    }`}>
      {owes ? <ArrowUpRight className="h-3 w-3" /> : owed ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      ৳{Math.abs(balance).toFixed(2)}
      {owes && ' (owes)'}
      {owed && ' (gets back)'}
      {settled && ' (settled)'}
    </span>
  )
}

function MobileDataRow({ title, subtitle, meta, amount, badge, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md active:scale-[0.99]">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-gray-900">{title}</p>
          {badge && (
            <span className="badge flex-shrink-0 bg-indigo-100 text-indigo-700">{badge}</span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
          {subtitle && <span>{subtitle}</span>}
          {meta && (
            <>
              {subtitle && <span>·</span>}
              <span className="truncate">{meta}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold text-gray-900">৳{amount.toFixed(2)}</span>
        {onEdit && <EditBtn onClick={onEdit} />}
        {onDelete && <DeleteBtn onClick={onDelete} />}
      </div>
    </div>
  )
}

/* ─── Desktop Table (no mobile cards in it) ─── */

function DesktopTable({ headers, rows, renderRow, emptyMsg }) {
  return (
    <div className="hidden overflow-x-auto sm:block">
      <table className="w-full text-sm">
        <thead className="bg-gray-50/80">
          <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            {headers.map((h, i) => (
              <th key={i} className={`px-4 py-3 ${h === 'Amount' || h === 'Balance' || h === 'Share' || h === 'Advance' || h === 'Contribution' || h === 'Direct Paid' || h === 'They Paid' || h === 'Their Share' ? 'text-right' : ''} ${!h ? 'text-center' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-sm text-gray-400">
                {emptyMsg}
              </td>
            </tr>
          ) : (
            rows.map((row) => renderRow(row))
          )}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Responsive DataTable ─── */

function DataTable({ headers, rows, total, totalColSpan, emptyMsg, renderRow, renderMobileCard }) {
  const hasData = rows.length > 0

  return (
    <div className="card !p-0 overflow-hidden">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              {headers.map((h, i) => (
                <th key={i} className={`px-4 py-3 ${h === 'Amount' ? 'text-right' : ''} ${!h ? 'text-center' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-gray-50/80">{renderRow(row)}</tr>
            ))}
          </tbody>
          {hasData && (
            <tfoot className="border-t-2 border-gray-100 bg-gray-50/50">
              <tr>
                <td colSpan={totalColSpan} className="px-4 py-3.5 text-sm font-semibold text-gray-700">Total</td>
                <td className="px-4 py-3.5 text-right text-sm font-bold text-gray-900">৳{total.toFixed(2)}</td>
                <td colSpan={Math.max(0, headers.length - totalColSpan - 1)} />
              </tr>
            </tfoot>
          )}
        </table>
        {!hasData && (
          <div className="px-4 py-10 text-center text-sm text-gray-400">{emptyMsg}</div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 p-4 sm:hidden">
        {!hasData ? (
          <div className="py-8 text-center text-sm text-gray-400">{emptyMsg}</div>
        ) : renderMobileCard ? (
          rows.map((row) => (
            <div key={row.id} className="animate-slide-up">
              {renderMobileCard(row)}
            </div>
          ))
        ) : (
          rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
              <div className="text-sm text-gray-600">{row.id || row.name || '-'}</div>
              <div className="text-sm font-bold text-gray-900">৳{Number(row.amount || 0).toFixed(2)}</div>
            </div>
          ))
        )}
        {hasData && (
          <div className="flex items-center justify-between rounded-xl bg-indigo-50/50 px-3.5 py-3">
            <span className="text-sm font-semibold text-gray-700">Total</span>
            <span className="text-sm font-bold text-gray-900">৳{total.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
