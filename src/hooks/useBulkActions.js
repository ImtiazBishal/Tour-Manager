import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { downloadCSV } from '../lib/csv'

export function useBulkActions({ tableName, items, assignColumn, itemLabel, csvMapFn, csvFileName, fetchData, showToast, showConfirm }) {
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [showBulkAssign, setShowBulkAssign] = useState(false)

  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback((checked) => {
    setSelectedIds(checked ? new Set(items.map((r) => r.id)) : new Set())
  }, [items])

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.size === 0) return
    showConfirm(`Delete ${selectedIds.size} selected ${itemLabel}?`, async () => {
      try {
        setBulkDeleting(true)
        const { error } = await supabase.from(tableName).delete().in('id', [...selectedIds])
        if (error) throw error
        showToast('success', `Deleted ${selectedIds.size} ${itemLabel}`)
        setSelectedIds(new Set())
        await fetchData()
      } catch (err) {
        showToast('error', err.message || 'Failed to delete')
      } finally {
        setBulkDeleting(false)
      }
    })
  }, [selectedIds, tableName, itemLabel, showToast, showConfirm, fetchData])

  const handleBulkAssign = useCallback(async (memberId) => {
    try {
      const { error } = await supabase.from(tableName).update({ [assignColumn]: memberId }).in('id', [...selectedIds])
      if (error) throw error
      showToast('success', `Assigned ${selectedIds.size} ${itemLabel}`)
      setSelectedIds(new Set())
      await fetchData()
    } catch (err) {
      showToast('error', err.message || 'Failed to assign')
    }
  }, [selectedIds, tableName, assignColumn, showToast, fetchData, itemLabel])

  const handleBulkExportCSV = useCallback(() => {
    const selected = items.filter((item) => selectedIds.has(item.id))
    const data = selected.map(csvMapFn)
    downloadCSV(data, `${csvFileName}-${new Date().toISOString().split('T')[0]}.csv`)
  }, [items, selectedIds, csvMapFn, csvFileName])

  return {
    selectedIds,
    setSelectedIds,
    bulkDeleting,
    showBulkAssign,
    setShowBulkAssign,
    handleToggleSelect,
    handleSelectAll,
    handleBulkDelete,
    handleBulkAssign,
    handleBulkExportCSV,
  }
}
