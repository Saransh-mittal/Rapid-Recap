// contexts/FeedbackContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react'

const FeedbackContext = createContext()

export const useFeedbackContext = () => {
  const context = useContext(FeedbackContext)
  if (!context) {
    throw new Error('useFeedbackContext must be used within a FeedbackProvider')
  }
  return context
}

export const FeedbackProvider = ({ children }) => {
  // Cache for feedback status to avoid repeated API calls
  const [feedbackCache, setFeedbackCache] = useState({})
  const [loadingCache, setLoadingCache] = useState({})
  const checkingRef = useRef(new Set()) // Track ongoing checks

  // Generate cache key for feedback status
  const getCacheKey = useCallback((analysisId, insightTitle) => {
    if (!analysisId || !insightTitle) return null
    return `${analysisId}_${insightTitle}`
  }, [])

  // Check if feedback exists with caching
  const checkFeedbackExists = useCallback(
    async (analysisId, insightTitle) => {
      const cacheKey = getCacheKey(analysisId, insightTitle)
      if (!cacheKey) return false

      // Return cached result if available
      if (feedbackCache.hasOwnProperty(cacheKey)) {
        return feedbackCache[cacheKey]
      }

      // Return false if already checking this combination
      if (checkingRef.current.has(cacheKey)) {
        return false
      }

      // Add to checking set
      checkingRef.current.add(cacheKey)
      setLoadingCache(prev => ({ ...prev, [cacheKey]: true }))

      try {
        const response = await fetch(
          `/api/quickClash/analysis/check-feedback?analysisId=${analysisId}&insightTitle=${encodeURIComponent(
            insightTitle,
          )}`,
        )

        if (response.ok) {
          const data = await response.json()
          const exists = data.exists || false

          // Cache the result
          setFeedbackCache(prev => ({ ...prev, [cacheKey]: exists }))
          return exists
        }

        // Cache false on error to avoid repeated failures
        setFeedbackCache(prev => ({ ...prev, [cacheKey]: false }))
        return false
      } catch (error) {
        console.error('Error checking feedback existence:', error)
        // Cache false on error
        setFeedbackCache(prev => ({ ...prev, [cacheKey]: false }))
        return false
      } finally {
        // Remove from checking set and loading cache
        checkingRef.current.delete(cacheKey)
        setLoadingCache(prev => {
          const newCache = { ...prev }
          delete newCache[cacheKey]
          return newCache
        })
      }
    },
    [feedbackCache, getCacheKey],
  )

  // Mark feedback as provided (update cache)
  const markFeedbackProvided = useCallback(
    (analysisId, insightTitle) => {
      const cacheKey = getCacheKey(analysisId, insightTitle)
      if (cacheKey) {
        setFeedbackCache(prev => ({ ...prev, [cacheKey]: true }))
      }
    },
    [getCacheKey],
  )

  // Check if feedback is currently being loaded
  const isFeedbackLoading = useCallback(
    (analysisId, insightTitle) => {
      const cacheKey = getCacheKey(analysisId, insightTitle)
      return cacheKey ? loadingCache[cacheKey] || false : false
    },
    [loadingCache, getCacheKey],
  )

  // Clear cache for specific analysis (useful when leaving page)
  const clearFeedbackCache = useCallback(analysisId => {
    if (!analysisId) {
      setFeedbackCache({})
      setLoadingCache({})
      checkingRef.current.clear()
      return
    }

    // Clear cache entries for specific analysis
    setFeedbackCache(prev => {
      const newCache = {}
      Object.keys(prev).forEach(key => {
        if (!key.startsWith(`${analysisId}_`)) {
          newCache[key] = prev[key]
        }
      })
      return newCache
    })

    setLoadingCache(prev => {
      const newCache = {}
      Object.keys(prev).forEach(key => {
        if (!key.startsWith(`${analysisId}_`)) {
          newCache[key] = prev[key]
        }
      })
      return newCache
    })

    // Clear from checking set
    const keysToDelete = Array.from(checkingRef.current).filter(key =>
      key.startsWith(`${analysisId}_`),
    )
    keysToDelete.forEach(key => checkingRef.current.delete(key))
  }, [])

  const value = {
    checkFeedbackExists,
    markFeedbackProvided,
    isFeedbackLoading,
    clearFeedbackCache,
    feedbackCache, // Expose for debugging
  }

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  )
}
