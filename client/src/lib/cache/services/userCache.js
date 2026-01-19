// src/lib/cache/services/userCache.js
import { CACHE_CONFIG } from '../config'
import { dbOperations } from '../drivers/indexedDB'
import { setUser, setLoginCheckStatus } from '../../../redux/authSlice'
import { setTaskProgress } from '../../../redux/loadingProgressSlice'
import axios from 'axios'

const { STORES, KEYS } = CACHE_CONFIG

export const userCacheService = {
  async getUser() {
    try {
      // CRITICAL: Ensure we have a token before hydrating user
      // This prevents "ghost logins" where user data exists but no token
      const token = localStorage.getItem('token')
      if (!token) {
        // If no token, user is effectively logged out. Clear any stale cache.
        await this.deleteUser()
        return null
      }

      // Check IndexedDB first
      const cachedData = await dbOperations.get(STORES.USER, 'currentUser')

      if (!cachedData) {
        // If no IndexedDB data, check unload cache
        const unloadCache = localStorage.getItem(KEYS.UNLOAD_CACHE)
        if (unloadCache) {
          const { data } = JSON.parse(unloadCache)
          // Clear unload cache after reading
          localStorage.removeItem(KEYS.UNLOAD_CACHE)
          // Store in IndexedDB for next time
          await this.cacheUser(data)
          return data
        }
        return null
      }

      return cachedData.data
    } catch (error) {
      console.error('Error in getUser:', error)
      return null
    }
  },

  async cacheUser(userData) {
    if (!userData) return false

    try {
      return await dbOperations.put(STORES.USER, {
        id: 'currentUser',
        data: userData,
        lastUpdated: Date.now(), // Keeping timestamp just for debugging
      })
    } catch (error) {
      console.error('Error in cacheUser:', error)
      return false
    }
  },

  async deleteUser() {
    try {
      await dbOperations.delete(STORES.USER, 'currentUser')
      localStorage.removeItem(KEYS.UNLOAD_CACHE)
      return true
    } catch (error) {
      console.error('Error in deleteUser:', error)
      return false
    }
  },

  saveUserOnUnload(userData) {
    if (!userData) return

    try {
      localStorage.setItem(
        KEYS.UNLOAD_CACHE,
        JSON.stringify({
          data: userData,
          timestamp: Date.now(),
        }),
      )
    } catch (error) {
      console.error('Error in saveUserOnUnload:', error)
    }
  },

  async fetchFreshUserData(dispatch) {
    try {
      const response = await axios.get('/api/user/loginCheck')

      const userData = response.data

      dispatch(setUser(userData))

      await this.cacheUser(userData)
    } catch (error) {
      console.error('Error fetching fresh user data:', error)
      dispatch(setUser(null))
    } finally {
      dispatch(setLoginCheckStatus('fulfilled'))
      dispatch(setTaskProgress({ task: 'fetchUser', progress: 100 }))
    }
  },

  async fetchAndCacheUser(dispatch) {
    dispatch(setTaskProgress({ task: 'fetchUser', progress: 50 }))
    dispatch(setLoginCheckStatus('pending'))

    try {
      // Double check token existence before even attempting to get user
      if (!localStorage.getItem('token')) {
         dispatch(setUser(null))
         dispatch(setLoginCheckStatus('fulfilled'))
         dispatch(setTaskProgress({ task: 'fetchUser', progress: 100 }))
         return
      }

      const cachedUser = await this.getUser()

      if (cachedUser) {
        // Use cached data immediately
        dispatch(setUser(cachedUser))
        dispatch(setLoginCheckStatus('fulfilled'))
        dispatch(setTaskProgress({ task: 'fetchUser', progress: 100 }))

        // Then fetch fresh data in background
        this.fetchFreshUserData(dispatch)
      } else {
        // No cache, fetch directly
        await this.fetchFreshUserData(dispatch)
      }
    } catch (error) {
      console.error('Error in fetchAndCacheUser:', error)
      dispatch(setUser(null))
      dispatch(setLoginCheckStatus('fulfilled'))
      dispatch(setTaskProgress({ task: 'fetchUser', progress: 100 }))
    }
  },
}
