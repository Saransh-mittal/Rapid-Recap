import axios from 'axios'

// Store the CSRF token in memory
let csrfToken = null

/**
 * Fetch a new CSRF token from the server
 */
export const fetchCsrfToken = async () => {
  try {
    const response = await axios.get('/api/user/csrf-token')
    csrfToken = response.data.csrfToken
    return csrfToken
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error)
    return null
  }
}

/**
 * Get the current CSRF token
 */
export const getCsrfToken = () => csrfToken

/**
 * Initialize CSRF protection for the app
 * This configures axios to automatically include the token
 */
export const initializeCsrf = () => {
  // First fetch the token
  fetchCsrfToken()

  // Set up axios interceptor to include token in every request
  axios.interceptors.request.use(
    async config => {
      // Only include CSRF for state-changing methods
      if (!['get', 'head', 'options'].includes(config.method)) {
        // If we don't have a token yet, fetch one
        if (!csrfToken) {
          await fetchCsrfToken()
        }

        // Include token in header
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken
        }
      }

      // Add X-Session-Id header for session players (Spark Engine)
      // This enables session players to make API calls without JWT auth
      const sessionId = localStorage.getItem('playSessionId')
      if (sessionId) {
        config.headers['X-Session-Id'] = sessionId
      }

      return config
    },
    error => {
      return Promise.reject(error)
    },
  )

  // Set up response interceptor to refresh token if needed
  axios.interceptors.response.use(
    response => {
      return response
    },
    async error => {
      // If we get a 403 CSRF error, try refreshing the token and retrying
      if (
        error.response?.status === 403 &&
        error.response?.data?.error?.includes('CSRF')
      ) {
        await fetchCsrfToken()

        // Retry the request once with the new token
        const config = error.config
        if (!config._retryCount || config._retryCount < 1) {
          config._retryCount = 1
          if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken
          }
          return axios(config)
        }
      }

      return Promise.reject(error)
    },
  )
}
