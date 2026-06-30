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
    // Check if offline — can't add new people without a connection
    if (!navigator.onLine) {
      showToast('error', 'You are offline. Go online to add a new person.')
      setAddingPersonLoading(false)
      return
    }

    try {
      setAddingPersonLoading(true)

      // First check if a member with this name already exists
      const { data: existing, error: lookupErr } = await supabase
        .from('members')
        .select('*')
        .ilike('name', name)
        .maybeSingle()

      if (lookupErr) throw lookupErr

      if (existing) {
        // Use existing member
        await onPersonAdded(existing)
        setAddingPerson(false)
        setNewPersonName('')
        showToast('success', `Using existing person "${name}"`)
        return
      }

      const { data, error: insErr } = await supabase
        .from('members')
        .insert({ name })
        .select()
        .single()
      if (insErr) {
        // Handle race condition: another client may have inserted between our check and insert
        if (insErr.code === '23505') {
          const { data: retryExisting } = await supabase
            .from('members')
            .select('*')
            .ilike('name', name)
            .maybeSingle()
          if (retryExisting) {
            await onPersonAdded(retryExisting)
            setAddingPerson(false)
            setNewPersonName('')
            showToast('success', `Using existing person "${name}"`)
            return
          }
        }
        throw insErr
      }
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
