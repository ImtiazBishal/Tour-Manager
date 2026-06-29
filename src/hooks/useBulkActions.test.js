import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBulkActions } from './useBulkActions'

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      delete: vi.fn(() => ({
        in: vi.fn(() => Promise.resolve({ error: null })),
      })),
      update: vi.fn(() => ({
        in: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}))

// Mock downloadCSV
const mockDownloadCSV = vi.hoisted(() => vi.fn())
vi.mock('../lib/csv', () => ({
  downloadCSV: mockDownloadCSV,
}))

describe('useBulkActions', () => {
  const defaultProps = {
    tableName: 'test_table',
    items: [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
      { id: '3', name: 'Item 3' },
    ],
    assignColumn: 'assigned_to',
    itemLabel: 'items',
    csvMapFn: (item) => ({ Name: item.name }),
    csvFileName: 'test-export',
    fetchData: vi.fn(),
    showToast: vi.fn(),
    showConfirm: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty selection', () => {
    const { result } = renderHook(() => useBulkActions(defaultProps))

    expect(result.current.selectedIds.size).toBe(0)
    expect(result.current.selectedIds).toBeInstanceOf(Set)
    expect(result.current.bulkDeleting).toBe(false)
    expect(result.current.showBulkAssign).toBe(false)
  })

  describe('handleToggleSelect', () => {
    it('should add an id to selectedIds when not selected', () => {
      const { result } = renderHook(() => useBulkActions(defaultProps))

      act(() => {
        result.current.handleToggleSelect('1')
      })

      expect(result.current.selectedIds.has('1')).toBe(true)
      expect(result.current.selectedIds.size).toBe(1)
    })

    it('should remove an id from selectedIds when already selected', () => {
      const { result } = renderHook(() => useBulkActions(defaultProps))

      act(() => {
        result.current.handleToggleSelect('1')
      })
      act(() => {
        result.current.handleToggleSelect('2')
      })
      expect(result.current.selectedIds.size).toBe(2)

      act(() => {
        result.current.handleToggleSelect('1')
      })

      expect(result.current.selectedIds.has('1')).toBe(false)
      expect(result.current.selectedIds.size).toBe(1)
    })

    it('should toggle the same id multiple times', () => {
      const { result } = renderHook(() => useBulkActions(defaultProps))

      act(() => { result.current.handleToggleSelect('1') })
      expect(result.current.selectedIds.has('1')).toBe(true)

      act(() => { result.current.handleToggleSelect('1') })
      expect(result.current.selectedIds.has('1')).toBe(false)

      act(() => { result.current.handleToggleSelect('1') })
      expect(result.current.selectedIds.has('1')).toBe(true)
    })
  })

  describe('handleSelectAll', () => {
    it('should select all items when checked is true', () => {
      const { result } = renderHook(() => useBulkActions(defaultProps))

      act(() => {
        result.current.handleSelectAll(true)
      })

      expect(result.current.selectedIds.size).toBe(3)
      expect(result.current.selectedIds.has('1')).toBe(true)
      expect(result.current.selectedIds.has('2')).toBe(true)
      expect(result.current.selectedIds.has('3')).toBe(true)
    })

    it('should clear selection when checked is false', () => {
      const { result } = renderHook(() => useBulkActions(defaultProps))

      // First select all
      act(() => { result.current.handleSelectAll(true) })
      expect(result.current.selectedIds.size).toBe(3)

      // Then deselect all
      act(() => { result.current.handleSelectAll(false) })
      expect(result.current.selectedIds.size).toBe(0)
    })
  })

  describe('handleBulkDelete', () => {
    it('should not call showConfirm when no items are selected', () => {
      const { result } = renderHook(() => useBulkActions(defaultProps))

      act(() => {
        result.current.handleBulkDelete()
      })

      expect(defaultProps.showConfirm).not.toHaveBeenCalled()
    })

    it('should show confirm dialog with correct message when items selected', () => {
      const { result } = renderHook(() => useBulkActions(defaultProps))

      act(() => { result.current.handleSelectAll(true) })

      act(() => {
        result.current.handleBulkDelete()
      })

      expect(defaultProps.showConfirm).toHaveBeenCalledWith(
        'Delete 3 selected items?',
        expect.any(Function)
      )
    })

    it('should call supabase delete with selected ids and show success toast', async () => {
      const { result } = renderHook(() => useBulkActions(defaultProps))
      const { supabase } = await import('../lib/supabase')

      act(() => { result.current.handleSelectAll(true) })

      // The showConfirm calls the provided callback
      let confirmCallback
      act(() => {
        result.current.handleBulkDelete()
      })

      // Extract the callback that was passed to showConfirm
      confirmCallback = defaultProps.showConfirm.mock.calls[0][1]

      // Execute the confirm callback
      await act(async () => {
        await confirmCallback()
      })

      // Verify supabase was called correctly
      expect(supabase.from).toHaveBeenCalledWith('test_table')
      expect(defaultProps.showToast).toHaveBeenCalledWith('success', 'Deleted 3 items')
      expect(defaultProps.fetchData).toHaveBeenCalled()
      expect(result.current.selectedIds.size).toBe(0)
      expect(result.current.bulkDeleting).toBe(false)
    })

    it('should show error toast on supabase error', async () => {
      const { supabase } = await import('../lib/supabase')
      // Save original mock to restore later
      const origImpl = supabase.from.getMockImplementation()

      const mockDeleteIn = vi.fn(() => Promise.resolve({ error: new Error('DB error') }))
      const mockDelete = vi.fn(() => ({ in: mockDeleteIn }))
      // Override to return only delete (no update) for this test
      supabase.from.mockImplementation(() => ({ delete: mockDelete, update: vi.fn(() => ({ in: vi.fn() })) }))

      const { result } = renderHook(() => useBulkActions(defaultProps))

      act(() => { result.current.handleSelectAll(true) })
      act(() => { result.current.handleBulkDelete() })

      const confirmCallback = defaultProps.showConfirm.mock.calls[0][1]

      await act(async () => {
        await confirmCallback()
      })

      expect(defaultProps.showToast).toHaveBeenCalledWith('error', 'DB error')
      expect(result.current.bulkDeleting).toBe(false)

      // Restore original mock
      supabase.from.mockImplementation(origImpl)
    })

    it('should handle empty items array in handleSelectAll', () => {
      const { result } = renderHook(() => useBulkActions({ ...defaultProps, items: [] }))

      act(() => {
        result.current.handleSelectAll(true)
      })

      expect(result.current.selectedIds.size).toBe(0)
    })
  })

  describe('handleBulkAssign', () => {
    it('should call supabase update with correct column and member id', async () => {
      const { result } = renderHook(() => useBulkActions(defaultProps))
      const { supabase } = await import('../lib/supabase')

      act(() => { result.current.handleSelectAll(true) })

      await act(async () => {
        await result.current.handleBulkAssign('member-123')
      })

      expect(supabase.from).toHaveBeenCalledWith('test_table')
      expect(defaultProps.showToast).toHaveBeenCalledWith('success', 'Assigned 3 items')
      expect(defaultProps.fetchData).toHaveBeenCalled()
      expect(result.current.selectedIds.size).toBe(0)
    })

    it('should show error toast on supabase error', async () => {
      const { supabase } = await import('../lib/supabase')
      const origImpl = supabase.from.getMockImplementation()

      const mockUpdateIn = vi.fn(() => Promise.resolve({ error: new Error('Update failed') }))
      const mockUpdate = vi.fn(() => ({ in: mockUpdateIn }))
      supabase.from.mockImplementation(() => ({ delete: vi.fn(() => ({ in: vi.fn() })), update: mockUpdate }))

      const { result } = renderHook(() => useBulkActions(defaultProps))

      act(() => { result.current.handleSelectAll(true) })

      await act(async () => {
        await result.current.handleBulkAssign('member-123')
      })

      expect(defaultProps.showToast).toHaveBeenCalledWith('error', 'Update failed')

      supabase.from.mockImplementation(origImpl)
    })
  })

  describe('handleBulkExportCSV', () => {
    it('should call downloadCSV with mapped data and correct filename', () => {
      const { result } = renderHook(() => useBulkActions(defaultProps))

      act(() => {
        result.current.handleToggleSelect('1')
        result.current.handleToggleSelect('3')
      })

      act(() => {
        result.current.handleBulkExportCSV()
      })

      expect(mockDownloadCSV).toHaveBeenCalledWith(
        [{ Name: 'Item 1' }, { Name: 'Item 3' }],
        expect.stringContaining('test-export-')
      )
      expect(mockDownloadCSV).toHaveBeenCalledTimes(1)
    })

    it('should not call downloadCSV when no items selected', () => {
      const { result } = renderHook(() => useBulkActions(defaultProps))

      act(() => {
        result.current.handleBulkExportCSV()
      })

      expect(mockDownloadCSV).toHaveBeenCalledWith([], expect.any(String))
    })
  })
})
