import { useState, useEffect } from 'react'
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

/* ─── App ─── */

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 sm:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="text-lg font-bold text-indigo-600">Tour Expense Tracker</h1>
          </div>
          <nav className="hidden items-center gap-1 sm:flex">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
        {menuOpen && (
          <nav className="border-t border-gray-100 bg-white px-4 pb-3 pt-2 sm:hidden">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key)
                    setMenuOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        )}
      </header>

      {/* Page Content */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'expenses' && <Expenses />}
        {activeTab === 'advances' && <Advances />}
        {activeTab === 'contributions' && <Contributions />}
        {activeTab === 'settlement' && <Settlement />}
      </main>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════════════ */

function Dashboard() {
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

  useEffect(() => {
    fetchDashboardData()
  }, [])

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
    { label: 'My Net Spending', value: `৳${stats.netSpending.toFixed(2)}`, icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'People Who Owe', value: String(stats.peopleOwing), icon: Users, color: 'text-rose-600', bg: 'bg-rose-100' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">{c.label}</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{c.value}</p>
                </div>
                <div className={`rounded-lg ${c.bg} p-2.5`}>
                  <Icon className={`h-5 w-5 ${c.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Category Breakdown</h3>
          <div className="space-y-2">
            {categoryBreakdown.map((cat) => {
              const maxAmt = categoryBreakdown[0]?.amount || 1
              const pct = (cat.amount / maxAmt) * 100
              const Icon = CATEGORY_ICONS[cat.name]
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      {Icon ? <Icon className="h-4 w-4 text-indigo-500" /> : <Package className="h-4 w-4 text-gray-400" />}
                      {cat.name}
                    </span>
                    <span className="font-medium text-gray-900">৳{cat.amount.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {categoryBreakdown.length === 0 && <p className="text-sm text-gray-400">No expenses yet</p>}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Recent Expenses</h3>
          <div className="space-y-2">
            {recentExpenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{exp.description}</p>
                  <p className="text-xs text-gray-500">{exp.expense_date} · {exp.paid_by?.name || 'Unknown'}</p>
                </div>
                <span className="ml-3 text-sm font-semibold text-gray-900">৳{Number(exp.amount).toFixed(2)}</span>
              </div>
            ))}
            {recentExpenses.length === 0 && <p className="text-sm text-gray-400">No expenses yet</p>}
          </div>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Balance Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="pb-2 pr-4">Person</th>
                <th className="pb-2 pr-4">Their Share</th>
                <th className="pb-2 pr-4">They Paid</th>
                <th className="pb-2 pr-4">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {balances.filter((b) => b.member_name !== 'Abir').map((b) => {
                const bal = Number(b.balance)
                const owes = bal > 0
                const owed = bal < 0
                return (
                  <tr key={b.member_name} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-4 font-medium text-gray-900">{b.member_name}</td>
                    <td className="py-2.5 pr-4 text-gray-700">৳{Number(b.expense_share).toFixed(2)}</td>
                    <td className="py-2.5 pr-4 text-gray-700">৳{(Number(b.advance_paid) + Number(b.contribution_for_them) + Number(b.direct_paid)).toFixed(2)}</td>
                    <td className="py-2.5 pr-4">
                      <BalanceBadge balance={bal} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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

function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY_EXPENSE_FORM)

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

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.category_id || !form.description || !form.amount || !form.paid_by) return
    try {
      setSubmitting(true)
      const { error: insErr } = await supabase.from('expenses').insert({
        expense_date: form.expense_date,
        category_id: form.category_id,
        description: form.description,
        amount: Number(form.amount),
        paid_by: form.paid_by,
      })
      if (insErr) throw insErr
      setForm(EMPTY_EXPENSE_FORM)
      await fetchData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    try {
      const { error: delErr } = await supabase.from('expenses').delete().eq('id', id)
      if (delErr) throw delErr
      await fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)

  if (loading) return <CenteredSpinner />
  if (error) return <ErrorBox msg={error} />

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>

      {/* Form */}
      <FormCard title="Add Expense">
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Date">
            <input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="input" />
          </FormField>
          <FormField label="Category">
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Description">
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Dinner" className="input" />
          </FormField>
          <FormField label="Amount (৳)">
            <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="input" />
          </FormField>
          <FormField label="Paid By">
            <select value={form.paid_by} onChange={(e) => setForm({ ...form, paid_by: e.target.value })} className="input">
              <option value="">Select person</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </FormField>
          <div className="flex items-end">
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Expense
            </button>
          </div>
        </form>
      </FormCard>

      {/* Table */}
      <DataTable
        headers={['Date', 'Category', 'Description', 'Amount', 'Paid By', '']}
        rows={expenses}
        total={total}
        renderRow={(exp) => (
          <>
            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{exp.expense_date}</td>
            <td className="whitespace-nowrap px-4 py-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                {(() => { const I = CATEGORY_ICONS[exp.expense_categories?.name]; return I ? <I className="h-3.5 w-3.5" /> : null })()}
                {exp.expense_categories?.name}
              </span>
            </td>
            <td className="px-4 py-3 font-medium text-gray-900">{exp.description}</td>
            <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-900">৳{Number(exp.amount).toFixed(2)}</td>
            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{exp.paid_by?.name}</td>
            <td className="whitespace-nowrap px-4 py-3 text-center">
              <DeleteBtn onClick={() => handleDelete(exp.id)} />
            </td>
          </>
        )}
        totalColSpan={3}
        emptyMsg="No expenses recorded yet"
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

function Advances() {
  const [advances, setAdvances] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY_ADVANCE_FORM)

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

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.member_id || !form.amount) return
    try {
      setSubmitting(true)
      const { error: insErr } = await supabase.from('advances').insert({
        payment_date: form.payment_date,
        member_id: form.member_id,
        amount: Number(form.amount),
        method: form.method,
        notes: form.notes || null,
      })
      if (insErr) throw insErr
      setForm(EMPTY_ADVANCE_FORM)
      await fetchData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    try {
      const { error: delErr } = await supabase.from('advances').delete().eq('id', id)
      if (delErr) throw delErr
      await fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const total = advances.reduce((s, a) => s + Number(a.amount), 0)

  if (loading) return <CenteredSpinner />
  if (error) return <ErrorBox msg={error} />

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Advances</h2>

      <FormCard title="Add Advance Payment">
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Date">
            <input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} className="input" />
          </FormField>
          <FormField label="Person">
            <select value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })} className="input">
              <option value="">Select person</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </FormField>
          <FormField label="Amount (৳)">
            <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="input" />
          </FormField>
          <FormField label="Method">
            <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="input">
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </FormField>
          <FormField label="Notes (optional)">
            <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any notes..." className="input" />
          </FormField>
          <div className="flex items-end">
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Advance
            </button>
          </div>
        </form>
      </FormCard>

      <DataTable
        headers={['Date', 'Person', 'Amount', 'Method', 'Notes', '']}
        rows={advances}
        total={total}
        renderRow={(adv) => (
          <>
            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{adv.payment_date}</td>
            <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{adv.members?.name}</td>
            <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-900">৳{Number(adv.amount).toFixed(2)}</td>
            <td className="whitespace-nowrap px-4 py-3">
              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{adv.method}</span>
            </td>
            <td className="px-4 py-3 text-gray-500">{adv.notes || '—'}</td>
            <td className="whitespace-nowrap px-4 py-3 text-center">
              <DeleteBtn onClick={() => handleDelete(adv.id)} />
            </td>
          </>
        )}
        totalColSpan={2}
        emptyMsg="No advances recorded yet"
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

function Contributions() {
  const [contributions, setContributions] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY_CONTRIB_FORM)

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

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.member_id || !form.amount || !form.reason) return
    try {
      setSubmitting(true)
      const { error: insErr } = await supabase.from('contributions').insert({
        contribution_date: form.contribution_date,
        member_id: form.member_id,
        amount: Number(form.amount),
        reason: form.reason,
      })
      if (insErr) throw insErr
      setForm(EMPTY_CONTRIB_FORM)
      await fetchData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    try {
      const { error: delErr } = await supabase.from('contributions').delete().eq('id', id)
      if (delErr) throw delErr
      await fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const total = contributions.reduce((s, c) => s + Number(c.amount), 0)

  if (loading) return <CenteredSpinner />
  if (error) return <ErrorBox msg={error} />

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Contributions</h2>
      <p className="text-sm text-gray-500">
        Track money that <strong>Abir</strong> paid on behalf of other people.
      </p>

      <FormCard title="Add Contribution">
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Date">
            <input type="date" value={form.contribution_date} onChange={(e) => setForm({ ...form, contribution_date: e.target.value })} className="input" />
          </FormField>
          <FormField label="Person">
            <select value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })} className="input">
              <option value="">Select person</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </FormField>
          <FormField label="Amount (৳)">
            <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="input" />
          </FormField>
          <FormField label="Reason">
            <input type="text" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Paid bus ticket" className="input" />
          </FormField>
          <div className="sm:col-span-2 lg:col-span-4">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Contribution
            </button>
          </div>
        </form>
      </FormCard>

      <DataTable
        headers={['Date', 'Person', 'Amount', 'Reason', '']}
        rows={contributions}
        total={total}
        renderRow={(con) => (
          <>
            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{con.contribution_date}</td>
            <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{con.members?.name}</td>
            <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-900">৳{Number(con.amount).toFixed(2)}</td>
            <td className="px-4 py-3 text-gray-500">{con.reason}</td>
            <td className="whitespace-nowrap px-4 py-3 text-center">
              <DeleteBtn onClick={() => handleDelete(con.id)} />
            </td>
          </>
        )}
        totalColSpan={2}
        emptyMsg="No contributions recorded yet"
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settlement</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Per Person Share</p>
              <p className="mt-1 text-xl font-bold text-gray-900">৳{perPersonShare.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-indigo-100 p-2.5"><Scale className="h-5 w-5 text-indigo-600" /></div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Total ৳{totalExpenses.toFixed(2)} ÷ 8 people</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Total Collected</p>
              <p className="mt-1 text-xl font-bold text-gray-900">৳{totalCollected.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-2.5"><Wallet className="h-5 w-5 text-emerald-600" /></div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Advances + Contributions + Direct payments</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3 text-right">Share</th>
                <th className="px-4 py-3 text-right">Advance</th>
                <th className="px-4 py-3 text-right">Contribution</th>
                <th className="px-4 py-3 text-right">Direct Paid</th>
                <th className="px-4 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {balances.map((b) => {
                const bal = Number(b.balance)
                const owes = bal > 0.01
                const owed = bal < -0.01
                return (
                  <tr key={b.member_name} className={`${owes ? 'bg-red-50/50' : owed ? 'bg-green-50/50' : ''} hover:bg-gray-50 transition-colors`}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {b.member_name}
                      {b.member_name === 'Abir' && <span className="ml-2 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">Manager</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">৳{Number(b.expense_share).toFixed(2)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">৳{Number(b.advance_paid).toFixed(2)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">৳{Number(b.contribution_for_them).toFixed(2)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">৳{Number(b.direct_paid).toFixed(2)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <BalanceBadge balance={bal} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Payment Instructions</h3>
        <div className="space-y-2">
          {instructions.length > 0 ? instructions.map((inst, idx) => (
            <div key={idx} className={`rounded-lg border px-4 py-3 text-sm ${inst.type === 'owes' ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}>
              {inst.type === 'owes' ? (
                <span><strong>{inst.from}</strong> should pay <strong>{inst.to}</strong>: <strong>৳{inst.amount.toFixed(2)}</strong></span>
              ) : (
                <span><strong>{inst.from}</strong> should return to <strong>{inst.to}</strong>: <strong>৳{inst.amount.toFixed(2)}</strong></span>
              )}
            </div>
          )) : (
            <p className="text-sm text-gray-500">All settled up! No payments needed.</p>
          )}
          {abir && (
            <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
              <strong>Net for Abir:</strong>{' '}
              {abirBalance > 0.01 ? (
                <span>Abir needs to collect <strong>৳{abirBalance.toFixed(2)}</strong> from others</span>
              ) : abirBalance < -0.01 ? (
                <span>Abir needs to return <strong>৳{Math.abs(abirBalance).toFixed(2)}</strong> to others</span>
              ) : (
                <span>Everything is settled!</span>
              )}
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
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
    </div>
  )
}

function ErrorBox({ msg }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      {msg}
    </div>
  )
}

function FormCard({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {title && <h3 className="mb-4 text-sm font-semibold text-gray-900">{title}</h3>}
      {children}
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  )
}

function DeleteBtn({ onClick }) {
  return (
    <button onClick={onClick} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
      <Trash2 className="h-4 w-4" />
    </button>
  )
}

function BalanceBadge({ balance }) {
  const owes = balance > 0.01
  const owed = balance < -0.01
  const settled = Math.abs(balance) <= 0.01
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${owes ? 'bg-red-100 text-red-700' : owed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {owes ? <ArrowUpRight className="h-3 w-3" /> : owed ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      ৳{Math.abs(balance).toFixed(2)}
      {owes && ' (owes)'}
      {owed && ' (gets back)'}
      {settled && ' (settled)'}
    </span>
  )
}

function DataTable({ headers, rows, total, renderRow, totalColSpan, emptyMsg }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {headers.map((h, i) => (
                <th key={i} className={`px-4 py-3 ${h === 'Amount' ? 'text-right' : ''} ${!h ? 'text-center' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">{renderRow(row)}</tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-gray-200 bg-gray-50">
            <tr>
              <td colSpan={totalColSpan} className="px-4 py-3 text-sm font-semibold text-gray-700">Total</td>
              <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">৳{total.toFixed(2)}</td>
              <td colSpan={Math.max(0, headers.length - totalColSpan - 1)} />
            </tr>
          </tfoot>
        </table>
      </div>
      {rows.length === 0 && <div className="px-4 py-8 text-center text-sm text-gray-400">{emptyMsg}</div>}
    </div>
  )
}
