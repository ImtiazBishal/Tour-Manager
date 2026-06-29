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
    try {
      setAddingCategoryLoading(true)
      const { data, error: insErr } = await supabase
        .from('expense_categories')
        .insert({ name, icon: 'package' })
        .select()
        .single()
      if (insErr) throw insErr
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
