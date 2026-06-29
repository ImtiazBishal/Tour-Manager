import { useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useSettings } from '../lib/settings'
import {
  X,
  Check,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  Moon,
  Sun,
  DollarSign,
  Database,
  Trash2,
  Shield,
  FileText,
  Plus,
  Pencil,
  Tag,
} from 'lucide-react'

export default function Settings({ showToast, showConfirm }) {
  const { currency, setCurrency, darkMode, setDarkMode, currencies, formatAmount } = useSettings()
  const [resetting, setResetting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)

  // ── Categories ──
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editCategoryName, setEditCategoryName] = useState('')

  useEffect(() => { fetchCategories() }, [])

  async function fetchCategories() {
    try {
      setCategoriesLoading(true)
      const { data, error } = await supabase.from('expense_categories').select('*').order('name')
      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    } finally {
      setCategoriesLoading(false)
    }
  }

  async function handleAddCategory() {
    const name = newCategoryName.trim()
    if (!name) { showToast('error', 'Category name is required'); return }
    if (name.length < 2) { showToast('error', 'Name must be at least 2 characters'); return }
    if (name.length > 50) { showToast('error', 'Name must be under 50 characters'); return }
    try {
      setAddingCategory(true)
      const { error: err } = await supabase.from('expense_categories').insert({ name })
      if (err) {
        if (err.code === '23505') { showToast('error', `Category "${name}" already exists`); return }
        throw err
      }
      showToast('success', `Category "${name}" added`)
      setNewCategoryName('')
      await fetchCategories()
    } catch (err) {
      showToast('error', err.message || 'Failed to add category')
    } finally {
      setAddingCategory(false)
    }
  }

  function handleStartEditCategory(cat) {
    setEditingCategory(cat)
    setEditCategoryName(cat.name)
  }

  function handleCancelEditCategory() {
    setEditingCategory(null)
    setEditCategoryName('')
  }

  async function handleUpdateCategory() {
    const name = editCategoryName.trim()
    if (!name) { showToast('error', 'Category name is required'); return }
    if (name.length < 2) { showToast('error', 'Name must be at least 2 characters'); return }
    if (name.length > 50) { showToast('error', 'Name must be under 50 characters'); return }
    try {
      const { error: err } = await supabase.from('expense_categories').update({ name }).eq('id', editingCategory.id)
      if (err) {
        if (err.code === '23505') { showToast('error', `Category "${name}" already exists`); return }
        throw err
      }
      showToast('success', `Category renamed to "${name}"`)
      setEditingCategory(null)
      setEditCategoryName('')
      await fetchCategories()
    } catch (err) {
      showToast('error', err.message || 'Failed to update category')
    }
  }

  async function handleDeleteCategory(cat) {
    showConfirm(
      `Delete category "${cat.name}"? Expenses using this category will be affected.`,
      async () => {
        try {
          const { error: err } = await supabase.from('expense_categories').delete().eq('id', cat.id)
          if (err) throw err
          showToast('success', `Category "${cat.name}" deleted`)
          await fetchCategories()
        } catch (err) {
          showToast('error', err.message || 'Failed to delete category')
        }
      }
    )
  }

  // ── Reset All Data ──
  async function handleResetAllData() {
    showConfirm(
      'Are you sure you want to delete ALL data? This will remove all expenses, advances, and contributions. Members and categories will be preserved.',
      async () => {
        try {
          setResetting(true)
          await Promise.all([
            supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
            supabase.from('advances').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
            supabase.from('contributions').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          ])
          showToast('success', 'All data has been cleared!')
          // Clear settlement session
          sessionStorage.removeItem('settlement_done')
        } catch (err) {
          showToast('error', err.message || 'Failed to reset data')
        } finally {
          setResetting(false)
        }
      }
    )
  }

  // ── Export Backup ──
  async function handleExportBackup() {
    try {
      setExporting(true)
      const [expRes, advRes, conRes, memRes, catRes] = await Promise.all([
        supabase.from('expenses').select('*').order('created_at'),
        supabase.from('advances').select('*').order('created_at'),
        supabase.from('contributions').select('*').order('created_at'),
        supabase.from('members').select('*').order('name'),
        supabase.from('expense_categories').select('*').order('name'),
      ])

      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
          members: memRes.data || [],
          expense_categories: catRes.data || [],
          expenses: expRes.data || [],
          advances: advRes.data || [],
          contributions: conRes.data || [],
        },
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tour-manager-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToast('success', 'Backup exported successfully!')
    } catch (err) {
      showToast('error', err.message || 'Failed to export backup')
    } finally {
      setExporting(false)
    }
  }

  // ── Import Restore ──
  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setImporting(true)
      const text = await file.text()
      const backup = JSON.parse(text)

      if (!backup.data || !backup.version) {
        showToast('error', 'Invalid backup file format')
        return
      }

      // Show confirmation before restoring
      showConfirm(
        'This will REPLACE all current data with the backup data. Continue?',
        async () => {
          try {
            // Clear existing data
            await Promise.all([
              supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
              supabase.from('advances').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
              supabase.from('contributions').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
              supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
              supabase.from('expense_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
            ])

            // Restore data
            if (backup.data.members?.length) {
              const { error: mErr } = await supabase.from('members').upsert(backup.data.members, { onConflict: 'id' })
              if (mErr) throw mErr
            }
            if (backup.data.expense_categories?.length) {
              const { error: cErr } = await supabase.from('expense_categories').upsert(backup.data.expense_categories, { onConflict: 'id' })
              if (cErr) throw cErr
            }
            if (backup.data.expenses?.length) {
              const { error: eErr } = await supabase.from('expenses').upsert(backup.data.expenses, { onConflict: 'id' })
              if (eErr) throw eErr
            }
            if (backup.data.advances?.length) {
              const { error: aErr } = await supabase.from('advances').upsert(backup.data.advances, { onConflict: 'id' })
              if (aErr) throw aErr
            }
            if (backup.data.contributions?.length) {
              const { error: ctErr } = await supabase.from('contributions').upsert(backup.data.contributions, { onConflict: 'id' })
              if (ctErr) throw ctErr
            }

            showToast('success', `Backup restored! ${backup.data.members?.length || 0} members, ${backup.data.expenses?.length || 0} expenses, and more.`)
            sessionStorage.removeItem('settlement_done')
          } catch (err) {
            showToast('error', err.message || 'Failed to restore backup')
          } finally {
            setImporting(false)
          }
        }
      )
    } catch (err) {
      showToast('error', err.message || 'Failed to parse backup file')
      setImporting(false)
    }
    // Reset file input
    e.target.value = ''
  }

  // ── Sample data check ──
  const settingsSections = [
    {
      id: 'general',
      title: 'General',
      icon: Shield,
      items: [
        {
          id: 'currency',
          label: 'Currency',
          description: 'Select the currency for all financial displays',
          icon: DollarSign,
          control: (
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input input-select !w-40 !py-2 !text-sm"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} — {c.name}
                </option>
              ))}
            </select>
          ),
        },
        {
          id: 'darkmode',
          label: 'Dark Mode',
          description: 'Toggle dark mode for the entire app',
          icon: darkMode ? Moon : Sun,
          control: (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
                darkMode ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              >
                {darkMode ? (
                  <Moon className="h-3 w-3 text-indigo-600" />
                ) : (
                  <Sun className="h-3 w-3 text-amber-500" />
                )}
              </span>
            </button>
          ),
        },
      ],
    },
    {
      id: 'data',
      title: 'Data Management',
      icon: Database,
      items: [
        {
          id: 'backup',
          label: 'Backup Data',
          description: 'Export all data as a JSON file for safekeeping',
          icon: Download,
          control: (
            <button
              onClick={handleExportBackup}
              disabled={exporting}
              className="btn-secondary !py-2 !px-4 !text-xs"
            >
              {exporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {exporting ? 'Exporting...' : 'Export JSON'}
            </button>
          ),
        },
        {
          id: 'restore',
          label: 'Restore Data',
          description: 'Import data from a previous backup file',
          icon: Upload,
          control: (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileSelected}
              />
              <button
                onClick={handleImportClick}
                disabled={importing}
                className="btn-secondary !py-2 !px-4 !text-xs"
              >
                {importing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {importing ? 'Restoring...' : 'Restore JSON'}
              </button>
            </>
          ),
        },
      ],
    },
    {
      id: 'categories',
      title: 'Expense Categories',
      icon: Tag,
      items: [
        {
          id: 'category-list',
          label: 'Manage Categories',
          description: 'Add, rename, or delete expense categories',
          icon: Tag,
          control: <span />,
        },
      ],
    },
    {
      id: 'danger',
      title: 'Danger Zone',
      icon: AlertTriangle,
      variant: 'danger',
      items: [
        {
          id: 'reset',
          label: 'Reset All Data',
          description: 'Permanently delete all expenses, advances, and contributions. Members and categories are kept.',
          icon: Trash2,
          control: (
            <button
              onClick={handleResetAllData}
              disabled={resetting}
              className="btn-danger !py-2 !px-4 !text-xs"
            >
              {resetting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              {resetting ? 'Clearing...' : 'Reset All Data'}
            </button>
          ),
        },
      ],
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">Settings</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure your app preferences and manage data</p>
      </div>

      {settingsSections.map((section) => {
        const SectionIcon = section.icon
        const isDanger = section.variant === 'danger'

        return (
          <div key={section.id}>
            <div className={`mb-3 flex items-center gap-2 ${
              isDanger ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
            }`}>
              <SectionIcon className="h-4 w-4" />
              <h3 className="text-sm font-semibold">{section.title}</h3>
            </div>
            <div className={`space-y-0.5 overflow-hidden rounded-2xl border ${
              isDanger ? 'border-red-200/80' : 'border-gray-200/80'
            }`}>
              {section.items.map((item) => {
                const ItemIcon = item.icon
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-4 bg-white px-4 py-3.5 sm:px-5 ${
                      isDanger ? 'hover:bg-red-50/50' : 'hover:bg-gray-50/50'
                    } transition-colors ${
                      section.items.indexOf(item) < section.items.length - 1
                        ? `border-b ${isDanger ? 'border-red-100/50' : 'border-gray-100'}`
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${
                        isDanger ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <ItemIcon className={`h-4 w-4 ${
                          isDanger ? 'text-red-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium ${
                          isDanger ? 'text-red-800' : 'text-gray-900'
                        }`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {item.control}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Categories */}
      {settingsSections.find((s) => s.id === 'categories') && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-gray-700">
            <Tag className="h-4 w-4" />
            <h3 className="text-sm font-semibold">Expense Categories</h3>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200/80">
            {/* Add new category */}
            <div className="flex items-center gap-2 border-b border-gray-100 bg-white px-4 py-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                placeholder="New category name..."
                className="input flex-1 !py-2 !text-sm"
              />
              <button
                onClick={handleAddCategory}
                disabled={addingCategory || !newCategoryName.trim()}
                className="btn-primary !py-2 !px-3 !text-xs"
              >
                {addingCategory ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Add
              </button>
            </div>

            {/* Category list */}
            {categoriesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : categories.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No categories yet. Add one above.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <div key={cat.id} className="group flex items-center gap-2 bg-white px-4 py-2.5 transition-colors hover:bg-gray-50/50">
                    {editingCategory?.id === cat.id ? (
                      <>
                        <input
                          type="text"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); handleUpdateCategory() }
                            if (e.key === 'Escape') { handleCancelEditCategory() }
                          }}
                          className="input flex-1 !py-1.5 !text-sm"
                          autoFocus
                        />
                        <button
                          onClick={handleUpdateCategory}
                          className="btn-primary !py-1.5 !px-2.5 !text-xs"
                          title="Save"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={handleCancelEditCategory}
                          className="btn-secondary !py-1.5 !px-2.5 !text-xs"
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Tag className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="flex-1 text-sm font-medium text-gray-900">{cat.name}</span>
                        <button
                          onClick={() => handleStartEditCategory(cat)}
                          className="btn-ghost rounded-lg p-1.5 text-gray-400 opacity-0 transition-all hover:text-indigo-600 group-hover:opacity-100"
                          title="Rename category"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="btn-ghost rounded-lg p-1.5 text-gray-400 opacity-0 transition-all hover:text-red-600 group-hover:opacity-100"
                          title="Delete category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* App Info */}
      <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
        Tour Expense Tracker v1.0 · All data stored securely in Supabase
      </div>
    </div>
  )
}
