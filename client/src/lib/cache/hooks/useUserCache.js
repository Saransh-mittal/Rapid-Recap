// src/lib/cache/hooks/useUserCache.js
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { userCacheService } from '../services/userCache'

export const useUserCache = () => {
  const user = useSelector(state => state.auth.user)
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)

  // Sync Redux user changes with cache
  useEffect(() => {
    const syncUserCache = async () => {
      if (user && isAuthenticated) {
        await userCacheService.cacheUser(user)
      }
    }

    syncUserCache()
  }, [user, isAuthenticated])

  // Handle page unload
  useEffect(() => {
    const handleUnload = () => {
      if (user) {
        userCacheService.saveUserOnUnload(user)
      }
    }

    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [user])
}
