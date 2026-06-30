/**
 * Local Data Cache - IndexedDB-backed cache for storing Supabase query results
 * so that pages can show previously fetched data when offline.
 *
 * Uses a separate database from the offline mutation queue.
 */

const DB_NAME = 'tour-manager-data-cache'
const STORE_NAME = 'page_cache'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Store data in the local cache.
 * @param {string} key - Unique cache key (e.g. 'dashboard', 'expenses')
 * @param {any} data - The data to cache (will be serialized via structured clone)
 */
export async function setCache(key, data) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put({ key, data, cachedAt: Date.now() })
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.warn('Failed to write to data cache:', err)
  }
}

/**
 * Retrieve data from the local cache.
 * @param {string} key - Cache key to look up
 * @returns {Promise<any|null>} The cached data, or null if not found
 */
export async function getCache(key) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const request = tx.objectStore(STORE_NAME).get(key)
      request.onsuccess = () => resolve(request.result?.data ?? null)
      request.onerror = () => reject(request.error)
    })
  } catch (err) {
    console.warn('Failed to read from data cache:', err)
    return null
  }
}

/**
 * Remove a specific cache entry.
 * @param {string} key
 */
export async function removeCache(key) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.warn('Failed to remove from data cache:', err)
  }
}

/**
 * Clear all cached data.
 */
export async function clearCache() {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.warn('Failed to clear data cache:', err)
  }
}

/**
 * Check if the data cache is supported (IndexedDB available).
 */
export function isCacheSupported() {
  return typeof indexedDB !== 'undefined'
}
