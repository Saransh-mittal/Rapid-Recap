// client/src/utils/authStateManager.js
// Utility to manage authentication state signals in both localStorage and cookies

const AUTH_SIGNAL_COOKIE = 'auth_signal'
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

/**
 * Set a cookie with proper domain and security settings
 */
const setCookie = (name, value, maxAge = COOKIE_MAX_AGE) => {
  const expires = new Date(Date.now() + maxAge).toUTCString()
  const domain = window.location.hostname
  const isSecure = window.location.protocol === 'https:'

  document.cookie = `${name}=${value}; expires=${expires}; path=/; domain=${domain}${
    isSecure ? '; secure' : ''
  }; samesite=lax`
}

/**
 * Get a cookie value
 */
const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

/**
 * Delete a cookie
 */
const deleteCookie = name => {
  const domain = window.location.hostname
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`
}

/**
 * Check if user has authentication signals in localStorage
 */
const hasAuthSignals = () => {
  return !!(
    localStorage.getItem('token') ||
    localStorage.getItem('user_unload_cache') ||
    localStorage.getItem('userProfile') ||
    localStorage.getItem('role')
  )
}

/**
 * Update auth signal cookie based on localStorage state
 */
const updateAuthSignalCookie = () => {
  if (hasAuthSignals()) {
    setCookie(AUTH_SIGNAL_COOKIE, 'true')
  } else {
    deleteCookie(AUTH_SIGNAL_COOKIE)
  }
}

/**
 * Enhanced localStorage setItem that also updates cookie
 */
const setLocalStorageWithSignal = (key, value) => {
  localStorage.setItem(key, value)
  updateAuthSignalCookie()
}

/**
 * Enhanced localStorage removeItem that also updates cookie
 */
const removeLocalStorageWithSignal = key => {
  localStorage.removeItem(key)
  updateAuthSignalCookie()
}

/**
 * Enhanced localStorage clear that also updates cookie
 */
const clearLocalStorageWithSignal = () => {
  localStorage.clear()
  deleteCookie(AUTH_SIGNAL_COOKIE)
}

/**
 * Initialize auth signals on app start
 */
const initializeAuthSignals = () => {
  updateAuthSignalCookie()

  console.log('[Auth Signals] Initialized', {
    hasAuthSignals: hasAuthSignals(),
    cookieUpdated: true,
  })
}

export {
  AUTH_SIGNAL_COOKIE,
  hasAuthSignals,
  updateAuthSignalCookie,
  setLocalStorageWithSignal,
  removeLocalStorageWithSignal,
  clearLocalStorageWithSignal,
  initializeAuthSignals,
  setCookie,
  getCookie,
  deleteCookie,
}
