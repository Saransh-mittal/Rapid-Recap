// client/src/services/localStorageWrapper.js
// Wrapper service to keep localStorage and auth signal cookies in sync

import {
  updateAuthSignalCookie,
  setLocalStorageWithSignal,
  removeLocalStorageWithSignal,
  clearLocalStorageWithSignal,
} from '../utils/authStateManager.js'

// Auth-related keys that should trigger cookie updates
const AUTH_KEYS = ['token', 'user_unload_cache', 'userProfile', 'role']

/**
 * Enhanced localStorage wrapper that automatically updates auth signal cookies
 */
class LocalStorageWrapper {
  /**
   * Set item in localStorage and update auth signal if it's an auth-related key
   */
  setItem(key, value) {
    if (AUTH_KEYS.includes(key)) {
      setLocalStorageWithSignal(key, value)
    } else {
      localStorage.setItem(key, value)
    }
  }

  /**
   * Get item from localStorage (no changes needed)
   */
  getItem(key) {
    return localStorage.getItem(key)
  }

  /**
   * Remove item from localStorage and update auth signal if it's an auth-related key
   */
  removeItem(key) {
    if (AUTH_KEYS.includes(key)) {
      removeLocalStorageWithSignal(key)
    } else {
      localStorage.removeItem(key)
    }
  }

  /**
   * Clear all localStorage and update auth signal
   */
  clear() {
    clearLocalStorageWithSignal()
  }

  /**
   * Get the key at the specified index (no changes needed)
   */
  key(index) {
    return localStorage.key(index)
  }

  /**
   * Get the length of localStorage (no changes needed)
   */
  get length() {
    return localStorage.length
  }

  /**
   * Batch set multiple items
   */
  setItems(items) {
    let shouldUpdateSignal = false

    Object.entries(items).forEach(([key, value]) => {
      localStorage.setItem(key, value)
      if (AUTH_KEYS.includes(key)) {
        shouldUpdateSignal = true
      }
    })

    if (shouldUpdateSignal) {
      updateAuthSignalCookie()
    }
  }

  /**
   * Batch remove multiple items
   */
  removeItems(keys) {
    let shouldUpdateSignal = false

    keys.forEach(key => {
      localStorage.removeItem(key)
      if (AUTH_KEYS.includes(key)) {
        shouldUpdateSignal = true
      }
    })

    if (shouldUpdateSignal) {
      updateAuthSignalCookie()
    }
  }

  /**
   * Check if any auth-related keys exist
   */
  hasAuthKeys() {
    return AUTH_KEYS.some(key => localStorage.getItem(key))
  }

  /**
   * Get all auth-related values
   */
  getAuthData() {
    const authData = {}
    AUTH_KEYS.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        authData[key] = value
      }
    })
    return authData
  }

  /**
   * Clear only auth-related keys
   */
  clearAuthData() {
    AUTH_KEYS.forEach(key => {
      localStorage.removeItem(key)
    })
    updateAuthSignalCookie()
  }
}

// Create singleton instance
const localStorageService = new LocalStorageWrapper()

export default localStorageService
