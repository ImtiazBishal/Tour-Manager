/**
 * Offline Mutation Queue - IndexedDB-backed queue for storing mutations
 * when the app is offline, to be replayed when connectivity returns.
 */

const DB_NAME = 'tour-manager-offline'
const STORE_NAME = 'mutations'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('createdAt', 'createdAt', { unique: false })
        store.createIndex('table', 'table', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Add a mutation to the offline queue.
 * @param {{ table: string, operation: string, data: any, filters?: {column: string, value: any}[] }} mutation
 */
export async function enqueue(mutation) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.add({
      table: mutation.table,
      operation: mutation.operation,
      data: mutation.data,
      filters: mutation.filters || [],
      createdAt: new Date().toISOString(),
    })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(new Error('Transaction aborted'))
  })
}

/**
 * Get all queued mutations, ordered by creation time.
 */
export async function getAll() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const index = store.index('createdAt')
    const request = index.getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get count of pending mutations.
 */
export async function getCount() {
  const all = await getAll()
  return all.length
}

/**
 * Remove a mutation from the queue by id.
 * @param {number} id
 */
export async function remove(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Clear all queued mutations.
 */
export async function clear() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Check if IndexedDB is available.
 */
export function isSupported() {
  return typeof indexedDB !== 'undefined'
}
