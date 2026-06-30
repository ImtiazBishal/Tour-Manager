import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAddCategory({ onCategoryAdded, showToast }) {
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategoryLoading, setAddingCategoryLoading] = useState(false)

  async function handleAddCategory() {
    const name = newCategoryName.trim()
    if (!name) {
      showToast('error', 'Category name is required')
      return
    }
    if (name.length < 2) {
      showToast('error', 'Category name must be at least 2 characters')
      return
    }
    if (name.length > 100) {
      showToast('error', 'Category name must be under 100 characters')
      return
    }
    // Check if offline — can't add new categories without a connection
    if (!navigator.onLine) {
      showToast('error', 'You are offline. Go online to add a new category.')
      setAddingCategoryLoading(false)
      return
    }

    try {
      setAddingCategoryLoading(true)

      // First check if a category with this name already exists
      const { data: existing, error: lookupErr } = await supabase
        .from('expense_categories')
        .select('*')
        .ilike('name', name)
        .maybeSingle()

      if (lookupErr) throw lookupErr

      if (existing) {
        // Use existing category
        await onCategoryAdded(existing)
        setAddingCategory(false)
        setNewCategoryName('')
        showToast('success', `Using existing category "${name}"`)
        return
      }

      const { data, error: insErr } = await supabase
        .from('expense_categories')
        .insert({ name, icon: 'package' })
        .select()
        .single()
      if (insErr) {
        // Handle race condition: another client may have inserted between our check and insert
        if (insErr.code === '23505') {
          const { data: retryExisting } = await supabase
            .from('expense_categories')
            .select('*')
            .ilike('name', name)
            .maybeSingle()
          if (retryExisting) {
            await onCategoryAdded(retryExisting)
            setAddingCategory(false)
            setNewCategoryName('')
            showToast('success', `Using existing category "${name}"`)
            return
          }
        }
        throw insErr
      }
      await onCategoryAdded(data)
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

  return {
    addingCategory,
    setAddingCategory,
    newCategoryName,
    setNewCategoryName,
    addingCategoryLoading,
    handleAddCategory,
    handleCancelAddCategory,
  }
}
