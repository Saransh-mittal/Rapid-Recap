// src/lib/cache/drivers/indexedDB.js
import { openDB } from 'idb'
import { CACHE_CONFIG } from '../config'

const { DATABASE_NAME, STORES, VERSION } = CACHE_CONFIG

export const initializeDB = async () => {
  try {
    return await openDB(DATABASE_NAME, VERSION, {
      upgrade(db) {
        // Create stores if they don't exist
        Object.values(STORES).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            // Simple store with just id as keyPath
            db.createObjectStore(storeName, { keyPath: 'id' })
          }
        })
      },
    })
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error)
    return null
  }
}

export const dbOperations = {
  async get(storeName, id) {
    const db = await initializeDB()

    if (!db) return null
    return db.get(storeName, id)
  },

  async put(storeName, data) {
    const db = await initializeDB()
    if (!db) return false
    await db.put(storeName, data)
    return true
  },

  async delete(storeName, id) {
    const db = await initializeDB()
    if (!db) return false
    await db.delete(storeName, id)
    return true
  },

  // Helper method for debugging/monitoring
  async getAllFromStore(storeName) {
    const db = await initializeDB()
    if (!db) return []
    return db.getAll(storeName)
  },
}
