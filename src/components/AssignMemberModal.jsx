import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X, Loader2, User, Check } from 'lucide-react'

export default function AssignMemberModal({ open, onClose, onAssign, title = 'Assign to Member' }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      fetchMembers()
    }
  }, [open])

  async function fetchMembers() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name')
      if (error) throw error
      setMembers(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAssign() {
    if (!selectedMember) return
    try {
      setSubmitting(true)
      await onAssign(selectedMember)
      setSelectedMember('')
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/60" onClick={onClose} />
      <div className="animate-scale-in relative z-10 w-full max-w-sm rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur-lg p-6 shadow-2xl dark:border-gray-700/40 dark:bg-gray-900/40 dark:backdrop-blur-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
              <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          </div>
          <button onClick={onClose} className="btn-ghost !p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600 dark:text-emerald-400" />
          </div>
        ) : (
          <div className="space-y-4">
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="input input-select"
            >
              <option value="">Select a member...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedMember || submitting}
                className="btn-primary flex-1"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Assign
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
