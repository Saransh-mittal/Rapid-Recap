import { isClient } from './environment'

class SafeStorage {
  constructor(type = 'localStorage') {
    this.type = type
    this.storage = isClient ? window[type] : null
  }

  getItem(key, defaultValue = null) {
    try {
      if (!this.storage) return defaultValue
      const item = this.storage.getItem(key)
      if (!item) return defaultValue

      try {
        // Try parsing as JSON first
        return JSON.parse(item)
      } catch {
        // If parsing fails, return the raw value
        return item
      }
    } catch (error) {
      console.warn(`Error reading from ${this.type}:`, error)
      return defaultValue
    }
  }

  setItem(key, value) {
    try {
      if (!this.storage) return false

      const valueToStore =
        typeof value === 'string' ? value : JSON.stringify(value)

      this.storage.setItem(key, valueToStore)
      return true
    } catch (error) {
      console.warn(`Error writing to ${this.type}:`, error)
      return false
    }
  }

  removeItem(key) {
    try {
      if (!this.storage) return false
      this.storage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Error removing from ${this.type}:`, error)
      return false
    }
  }

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

  // Helper to check if value is JSON-serializable
  isJSONSerializable(value) {
    try {
      JSON.parse(JSON.stringify(value))
      return true
    } catch {
      return false
    }
  }
}

export const safeLocalStorage = new SafeStorage('localStorage')
export const safeSessionStorage = new SafeStorage('sessionStorage')
