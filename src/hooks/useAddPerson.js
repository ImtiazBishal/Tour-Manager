import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAddPerson({ formFieldName, onPersonAdded, showToast }) {
  const [addingPerson, setAddingPerson] = useState(false)
  const [newPersonName, setNewPersonName] = useState('')
  const [addingPersonLoading, setAddingPersonLoading] = useState(false)

  async function handleAddPerson() {
    const name = newPersonName.trim()
    if (!name) {
      showToast('error', 'Person name is required')
      return
    }
    if (name.length < 2) {
      showToast('error', 'Person name must be at least 2 characters')
      return
    }
    if (name.length > 100) {
      showToast('error', 'Person name must be under 100 characters')
      return
    }
    try {
      setAddingPersonLoading(true)
      const { data, error: insErr } = await supabase
        .from('members')
        .insert({ name })
        .select()
        .single()
      if (insErr) throw insErr
      await onPersonAdded(data)
      setAddingPerson(false)
      setNewPersonName('')
      showToast('success', `Person "${name}" added!`)
    } catch (err) {
      showToast('error', err.message || 'Failed to add person')
    } finally {
      setAddingPersonLoading(false)
    }
  }

  function handleCancelAddPerson() {
    setAddingPerson(false)
    setNewPersonName('')
  }

  return {
    addingPerson,
    setAddingPerson,
    newPersonName,
    setNewPersonName,
    addingPersonLoading,
    handleAddPerson,
    handleCancelAddPerson,
  }
}
