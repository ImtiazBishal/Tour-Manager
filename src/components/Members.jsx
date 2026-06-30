import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Modal from './Modal'
import { queueOrRun } from '../lib/sync'
import {
  Plus,
  Loader2,
  Check,
  User,
  Trash2,
  AlertCircle,
  Crown,
  Search,
  Pencil,
} from 'lucide-react'

export default function Members({ showToast, showConfirm, dataVersion }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formRole, setFormRole] = useState('member')
  const [submitting, setSubmitting] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  useEffect(() => { fetchMembers() }, [dataVersion])



  async function fetchMembers() {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('members')
        .select('*')
        .order('name')
      if (err) throw err
      setMembers(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleEditMember(member) {
    setEditingMember(member)
    setFormName(member.name)
    setFormRole(member.role)
    setModalOpen(true)
  }

  function cancelForm() {
    setEditingMember(null)
    setFormName('')
    setFormRole('member')
    setModalOpen(false)
  }

  async function handleAddMember() {
    const name = formName.trim()
    if (!name) {
      showToast('error', 'Member name is required')
      return
    }
    if (name.length < 2) {
      showToast('error', 'Name must be at least 2 characters')
      return
    }
    if (name.length > 100) {
      showToast('error', 'Name must be under 100 characters')
      return
    }
    try {
      setSubmitting(true)
      if (editingMember) {
          const { error: err } = await queueOrRun({ table: 'members', operation: 'update', data: { name, role: formRole }, filters: [{ column: 'id', value: editingMember.id }] })
        if (err) {
          if (err.code === '23505') {
            showToast('error', `Member "${name}" already exists`)
            return
          }
          throw err
        }
        showToast('success', `Member "${name}" updated`)
      } else {          const { data, error: err } = await queueOrRun({ table: 'members', operation: 'insert', data: { name, role: formRole } })
        if (err) {
          if (err.code === '23505') {
            showToast('error', `Member "${name}" already exists`)
            return
          }
          throw err
        }
        showToast('success', `Member "${name}" added as ${formRole === 'manager' ? 'Manager' : 'Member'}`)
      }
      setFormName('')
      setFormRole('member')
      setEditingMember(null)
      setModalOpen(false)
      await fetchMembers()
    } catch (err) {
      showToast('error', err.message || 'Failed to save member')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateRole(memberId, newRole) {
    try {          const { error: err } = await queueOrRun({ table: 'members', operation: 'update', data: { role: newRole }, filters: [{ column: 'id', value: memberId }] })
      if (err) throw err
      showToast('success', `Role updated to ${newRole}`)
      await fetchMembers()
    } catch (err) {
      showToast('error', err.message || 'Failed to update role')
    }
  }

  async function handleDeleteMember(member) {
    showConfirm(
      `Delete member "${member.name}"? This will also remove all their related records (expenses, advances, contributions).`,
      async () => {
        try {
          // Delete related records first
          await Promise.all([
            queueOrRun({ table: 'expenses', operation: 'delete', data: null, filters: [{ column: 'paid_by', value: member.id }] }),
            queueOrRun({ table: 'advances', operation: 'delete', data: null, filters: [{ column: 'member_id', value: member.id }] }),
            queueOrRun({ table: 'contributions', operation: 'delete', data: null, filters: [{ column: 'member_id', value: member.id }] }),
          ])
          const { error: err } = await queueOrRun({ table: 'members', operation: 'delete', data: null, filters: [{ column: 'id', value: member.id }] })
          if (err) throw err
          showToast('success', `Member "${member.name}" deleted`)
          await fetchMembers()
        } catch (err) {
          showToast('error', err.message || 'Failed to delete member')
        }
      }
    )
  }

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const managersCount = members.filter((m) => m.role === 'manager').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300">
        <AlertCircle className="mx-auto mb-2 h-6 w-6" />
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">Members</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {members.length} member{members.length !== 1 ? 's' : ''} · {managersCount} manager{managersCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingMember(null)
            setFormName('')
            setFormRole('member')
            setModalOpen(true)
          }}
          className="btn-primary px-4 py-2.5 text-xs sm:text-sm sm:px-5 sm:py-3"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      {/* Add/Edit Form in Modal */}
      <Modal open={modalOpen} onClose={cancelForm} title={editingMember ? 'Edit Member' : 'Add New Member'}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Member Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMember(); } }}
              placeholder="Enter member name"
              className="input"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Role</label>
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              className="input input-select"
            >
              <option value="member">👤 Member</option>
              <option value="manager">👑 Manager</option>
            </select>
          </div>
          <button
            onClick={handleAddMember}
            disabled={submitting || !formName.trim()}
            className="btn-primary w-full"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {editingMember ? 'Update Member' : 'Add Member'}
          </button>
        </div>
      </Modal>

      {/* Search */}
      {members.length > 0 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="input pl-9"
          />
        </div>
      )}

      {/* Members Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200/80 bg-white/85 px-4 py-10 text-center text-sm text-gray-400 backdrop-blur-lg dark:border-gray-700/40 dark:bg-gray-900/40 dark:text-gray-500 dark:backdrop-blur-lg">
          {searchQuery ? 'No members match your search' : 'No members added yet. Add your first member above.'}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((member) => {
            const isManager = member.role === 'manager'
            return (
              <div
                key={member.id}
                className={`group relative rounded-2xl border bg-white/85 p-4 shadow-sm transition-all duration-200 hover:shadow-md backdrop-blur-lg ${
                  isManager
                    ? 'border-emerald-200/80 bg-gradient-to-br from-white/90 to-emerald-50/30 dark:border-emerald-700/40 dark:from-gray-900/40 dark:to-emerald-950/20'
                    : 'border-gray-200/80 dark:border-gray-700/40'
                } dark:bg-gray-900/40 dark:backdrop-blur-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isManager ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {isManager ? (
                        <Crown className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <User className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                      <div className="flex items-center gap-1.5 text-xs">
                        {isManager ? (
                          <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                            <Crown className="h-3 w-3" />
                            Manager
                          </span>
                        ) : (
                          <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Member</span>
                        )}
                        <span className="text-gray-400 dark:text-gray-500">·</span>
                        <span className="text-gray-400 dark:text-gray-500">
                          {new Date(member.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Role toggle button */}
                  <div className="flex items-center gap-1">
                    {!isManager && (
                      <button
                        onClick={() => handleUpdateRole(member.id, 'manager')}
                        className="btn-ghost rounded-lg p-1.5 text-xs text-gray-400 opacity-0 transition-all hover:text-emerald-600 group-hover:opacity-100"
                        title="Promote to Manager"
                      >
                        <Crown className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {isManager && members.filter((m) => m.role === 'manager').length > 1 && (
                      <button
                        onClick={() => handleUpdateRole(member.id, 'member')}
                        className="btn-ghost rounded-lg p-1.5 text-xs text-gray-400 opacity-0 transition-all hover:text-amber-600 group-hover:opacity-100"
                        title="Demote to Member"
                      >
                        <User className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEditMember(member)}
                      className="btn-ghost rounded-lg p-1.5 text-xs text-gray-400 opacity-0 transition-all hover:text-emerald-600 group-hover:opacity-100"
                      title="Edit member"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member)}
                      className="btn-ghost rounded-lg p-1.5 text-xs text-gray-400 opacity-0 transition-all hover:text-red-600 group-hover:opacity-100"
                      title="Delete member"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
