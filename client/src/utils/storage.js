/**
 * Enhanced storage utilities with SSR safety and error handling
 */

import { isClient } from './environment'

// Storage types enum
export const StorageType = {
  LOCAL: 'localStorage',
  SESSION: 'sessionStorage',
}

// Error types
export const StorageError = {
  NOT_AVAILABLE: 'STORAGE_NOT_AVAILABLE',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  INVALID_VALUE: 'INVALID_VALUE',
  PARSE_ERROR: 'PARSE_ERROR',
}

class StorageWrapper {
  constructor(type) {
    this.type = type
    this.storage = isClient ? window[type] : null
  }

  /**
   * Safely stringifies value for storage
   */
  _serialize(value) {
    try {
      return JSON.stringify(value)
    } catch (error) {
      console.warn(`Failed to serialize value for ${this.type}:`, error)
      throw new Error(StorageError.INVALID_VALUE)
    }
  }

  /**
   * Safely parses stored value
   */
  _deserialize(value) {
    if (!value) return null
    try {
      return JSON.parse(value)
    } catch (error) {
      console.warn(`Failed to parse value from ${this.type}:`, error)
      throw new Error(StorageError.PARSE_ERROR)
    }
  }

  /**
   * Gets item from storage with fallback
   */
  get(key, fallback = null) {
    try {
      if (!this.storage) return fallback
      const value = this.storage.getItem(key)
      return value ? this._deserialize(value) : fallback
    } catch (error) {
      console.warn(`Error accessing ${this.type}:`, error)
      return fallback
    }
  }

  /**
   * Sets item in storage with error handling
   */
  set(key, value) {
    try {
      if (!this.storage) throw new Error(StorageError.NOT_AVAILABLE)
      const serialized = this._serialize(value)
      this.storage.setItem(key, serialized)
      return true
    } catch (error) {
      console.warn(`Error setting ${this.type}:`, error)
      if (error.name === 'QuotaExceededError') {
        throw new Error(StorageError.QUOTA_EXCEEDED)
      }
      return false
    }
  }

  /**
   * Removes item from storage
   */
  remove(key) {
    try {
      if (!this.storage) return false
      this.storage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Error removing from ${this.type}:`, error)
      return false
    }
  }

  /**
   * Clears all items from storage
   */
  clear() {
    try {
      if (!this.storage) return false
      this.storage.clear()
      return true
    } catch (error) {
      console.warn(`Error clearing ${this.type}:`, error)
      return false
    }
  }

  /**
   * Gets all keys from storage
   */
  keys() {
    try {
      if (!this.storage) return []
      return Object.keys(this.storage)
    } catch (error) {
      console.warn(`Error getting keys from ${this.type}:`, error)
      return []
    }
  }

  /**
   * Checks if storage has key
   */
  has(key) {
    try {
      if (!this.storage) return false
      return key in this.storage
    } catch (error) {
      console.warn(`Error checking key in ${this.type}:`, error)
      return false
    }
  }
}

// Create storage instances
export const localStorage = new StorageWrapper(StorageType.LOCAL)
export const sessionStorage = new StorageWrapper(StorageType.SESSION)

// Utility function to check storage availability
export const isStorageAvailable = type => {
  if (!isClient) return false
  try {
    const storage = window[type]
    const x = '__storage_test__'
    storage.setItem(x, x)
    storage.removeItem(x)
    return true
  } catch (e) {
    return false
  }
}
