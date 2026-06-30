import { supabase } from './supabase'
import { enqueue, getAll, remove } from './offlineQueue'

/**
 * Apply filters to a supabase query chain.
 * Each filter: { column, value, type } where type is 'eq' (default) or 'in'
 */
function applyFilters(query, filters) {
  let result = query
  for (const filter of filters) {
    if (filter.type === 'in') {
      result = result.in(filter.column, filter.value)
    } else {
      result = result.eq(filter.column, filter.value)
    }
  }
  return result
}

/**
 * Execute a mutation directly against Supabase.
 */
async function runDirectMutation({ table, operation, data, filters }) {
  let query
  if (operation === 'delete') {
    query = supabase.from(table).delete()
  } else if (operation === 'update') {
    query = supabase.from(table).update(data)
  } else if (operation === 'insert') {
    query = supabase.from(table).insert(data)
  } else if (operation === 'upsert') {
    // Upsert is only used for backup restore — keep direct
    query = supabase.from(table).upsert(data, { onConflict: 'id' })
    return await query
  } else {
    query = supabase.from(table)[operation](data)
  }
  query = applyFilters(query, filters || [])
  return await query
}

/**
 * Either runs a Supabase mutation directly (if online) or queues it
 * for later replay (if offline).
 *
 * @param {{ table: string, operation: string, data: any, filters?: {column: string, value: any, type?: 'eq'|'in'}[] }} mutation
 * @returns {Promise<{ data: any, error: any, queued: boolean }>}
 */
export async function queueOrRun({ table, operation, data, filters = [] }) {
  if (navigator.onLine) {
    const result = await runDirectMutation({ table, operation, data, filters })
    return { ...result, queued: false }
  } else {
    await enqueue({ table, operation, data, filters })
    return { data: null, error: null, queued: true }
  }
}

/**
 * Flush all queued mutations. Called when the app comes back online.
 * Replays each mutation in order, removing successful ones from the queue.
 *
 * @param {(msg: string) => void} onProgress - Optional callback for progress updates
 * @returns {Promise<{ flushed: number, failed: number }>}
 */
export async function flushQueue(onProgress) {
  const mutations = await getAll()
  if (mutations.length === 0) return { flushed: 0, failed: 0 }

  let flushed = 0
  let failed = 0

  for (const mutation of mutations) {
    try {
      const { error } = await runDirectMutation(mutation)
      if (error) {
        console.error('Failed to sync mutation:', mutation, error)
        failed++
        continue
      }
      await remove(mutation.id)
      flushed++
      onProgress?.(`Synced ${mutation.table} (${mutation.operation})`)
    } catch (err) {
      console.error('Error syncing mutation:', mutation, err)
      failed++
    }
  }

  return { flushed, failed }
}

/**
 * Get the count of pending mutations.
 */
export async function getPendingCount() {
  const mutations = await getAll()
  return mutations.length
}
