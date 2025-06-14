import axios from 'axios'
import { setLoginCheckStatus, logoutAuth } from '../redux/authSlice'
import { store } from '../redux/store'

/**
 * Initialize token refresh interceptor
 * This automatically refreshes the access token when it expires
 */
export const initializeTokenRefresh = () => {
  // Set up response interceptor to handle token expiry
  axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config

      const hasAuthState =
        !!localStorage.getItem('token') ||
        document.cookie.includes('refresh_token')
      // If the error is 401 and indicates token expiration and we haven't tried refreshing yet
      if (
        error.response?.status === 401 &&
        error.response?.data?.tokenExpired &&
        !originalRequest._retry &&
        hasAuthState
      ) {
        originalRequest._retry = true

        try {
          // Set auth status to pending
          store.dispatch(setLoginCheckStatus('pending'))

          // Call the refresh endpoint
          await axios.post('/api/user/auth/refresh')

          // Retry the original request now that we have a new token
          store.dispatch(setLoginCheckStatus('fulfilled'))
          return axios(originalRequest)
        } catch (refreshError) {
          // If refresh fails, log the user out
          if (hasAuthState) {
            store.dispatch(logoutAuth())
            // Clear any local storage
            localStorage.removeItem('token')
            localStorage.removeItem('role')
          }

          store.dispatch(setLoginCheckStatus('fulfilled'))

          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    },
  )
}
