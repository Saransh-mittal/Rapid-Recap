// src/customHooks/useFriends.js - Enhanced with performance optimizations and fault tolerance
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { notificationManager } from '../utils/notifications.jsx'
import { useTranslation } from 'react-i18next'
import debounce from 'lodash.debounce'
import {
  fetchFriends,
  fetchFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  searchUsers,
  setSearchQuery,
  clearSearchResults,
  setWiseWebOpen,
  clearErrors,
  clearSpecificError,
  updateFriendOnlineStatus,
  updateMultipleFriendsOnlineStatus,
  addPendingRequest,
  removePendingRequest,
  sanitizeFriendsState,
  setNetworkStatus,
  optimisticAddFriend,
  optimisticRemoveFriend,
  revertOptimisticUpdate,
} from '../redux/friendsSlice'

// Helper function to ensure arrays with performance optimization
const ensureArray = value => {
  if (value instanceof Set) return Array.from(value)
  if (!Array.isArray(value)) return []
  return value
}

// Network status detection
const useNetworkStatus = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const updateNetworkStatus = () => {
      const status = navigator.onLine ? 'online' : 'offline'
      dispatch(setNetworkStatus(status))
    }

    const handleConnectionChange = () => {
      // Slight delay to ensure connection is stable
      setTimeout(updateNetworkStatus, 500)
    }

    window.addEventListener('online', handleConnectionChange)
    window.addEventListener('offline', handleConnectionChange)

    // Initial status check
    updateNetworkStatus()

    return () => {
      window.removeEventListener('online', handleConnectionChange)
      window.removeEventListener('offline', handleConnectionChange)
    }
  }, [dispatch])
}

// Enhanced retry mechanism
const useRetryMechanism = () => {
  const dispatch = useDispatch()
  const retryTimeouts = useRef(new Set())

  const scheduleRetry = useCallback(
    (action, delay = 3000) => {
      const timeoutId = setTimeout(() => {
        dispatch(action())
        retryTimeouts.current.delete(timeoutId)
      }, delay)

      retryTimeouts.current.add(timeoutId)
      return timeoutId
    },
    [dispatch],
  )

  const cancelAllRetries = useCallback(() => {
    retryTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId))
    retryTimeouts.current.clear()
  }, [])

  useEffect(() => {
    return () => cancelAllRetries()
  }, [cancelAllRetries])

  return { scheduleRetry, cancelAllRetries }
}

/**
 * Enhanced useFriends hook with performance optimizations and fault tolerance
 *
 * Key Features:
 * - Automatic network status detection and retry logic
 * - Optimistic updates for better UX
 * - Memoized selectors to prevent unnecessary re-renders
 * - Enhanced error handling with auto-recovery
 * - Performance optimizations for large friend lists
 */
const useFriends = ({
  autoFetch = false,
  enableOptimisticUpdates = true,
  enableAutoRetry = true,
} = {}) => {
  const dispatch = useDispatch()

  const { t } = useTranslation('WiseWeb')

  // Network status monitoring
  useNetworkStatus()

  // Enhanced retry mechanism
  const { scheduleRetry, cancelAllRetries } = useRetryMechanism()

  // Get state with memoized selectors
  const friendsState = useSelector(state => state.friends)
  const { user } = useSelector(state => state.auth)

  // Defensive state extraction with fallbacks
  const {
    friends = [],
    friendRequests = [],
    searchResults = [],
    pendingRequests = [],
    loading = {},
    error = {},
    retryCount = {},
    lastFetch = {},
    searchQuery = '',
    isWiseWebOpen = false,
    networkStatus = 'online',
  } = friendsState || {}

  // Refs for performance optimization
  const lastSearchQuery = useRef('')
  const searchAbortController = useRef(null)

  // Auto-sanitize state on critical operations
  useEffect(() => {
    if (friendsState) {
      const needsSanitization =
        pendingRequests instanceof Set ||
        friends instanceof Set ||
        friendRequests instanceof Set ||
        searchResults instanceof Set ||
        !Array.isArray(pendingRequests) ||
        !Array.isArray(friends) ||
        !Array.isArray(friendRequests) ||
        !Array.isArray(searchResults)

      if (needsSanitization) {
        console.warn('[FRIENDS_HOOK] Sanitizing corrupted state')
        dispatch(sanitizeFriendsState())
      }
    }
  }, [friendsState, dispatch])

  // Memoized selectors for performance optimization
  const memoizedSelectors = useMemo(() => {
    const friendsArray = ensureArray(friends)
    const requestsArray = ensureArray(friendRequests)
    const pendingArray = ensureArray(pendingRequests)

    const onlineFriends = friendsArray
      .filter(friend => friend?.isOnline)
      .sort(
        (a, b) => (b?.quickClashTrophies || 0) - (a?.quickClashTrophies || 0),
      )

    const offlineFriends = friendsArray
      .filter(friend => !friend?.isOnline)
      .sort((a, b) => {
        // Sort by last login for offline friends
        const aLastLogin = new Date(a?.lastLogin || 0).getTime()
        const bLastLogin = new Date(b?.lastLogin || 0).getTime()
        return bLastLogin - aLastLogin
      })

    const onlineCount = onlineFriends.length
    const totalFriends = friendsArray.length
    const totalRequests = requestsArray.length

    return {
      friendsArray,
      requestsArray,
      pendingArray,
      onlineFriends,
      offlineFriends,
      onlineCount,
      totalFriends,
      totalRequests,
    }
  }, [friends, friendRequests, pendingRequests])

  // Enhanced debounced search with abort capability
  const debouncedSearch = useMemo(
    () =>
      debounce(query => {
        // Cancel previous search
        if (searchAbortController.current) {
          searchAbortController.current.abort()
        }

        if (query && query.trim().length >= 2) {
          searchAbortController.current = new AbortController()
          dispatch(
            searchUsers({
              query,
              signal: searchAbortController.current.signal,
            }),
          )
        } else {
          dispatch(clearSearchResults())
        }

        lastSearchQuery.current = query
      }, 300),
    [dispatch],
  )

  // Auto-retry failed requests based on network status
  useEffect(() => {
    if (networkStatus === 'online' && enableAutoRetry) {
      // Retry failed friends fetch
      if (error.friends && retryCount.friends < 3) {
        const shouldRetry =
          !lastFetch.friends ||
          Date.now() - new Date(lastFetch.friends).getTime() > 300000 // 5 minutes

        if (shouldRetry) {
          scheduleRetry(() => fetchFriends(), 2000)
        }
      }

      // Retry failed requests fetch
      if (error.requests && retryCount.requests < 3) {
        const shouldRetry =
          !lastFetch.requests ||
          Date.now() - new Date(lastFetch.requests).getTime() > 300000

        if (shouldRetry) {
          scheduleRetry(() => fetchFriendRequests(), 2500)
        }
      }
    }
  }, [
    networkStatus,
    error,
    retryCount,
    lastFetch,
    enableAutoRetry,
    scheduleRetry,
  ])

  // Effect to trigger search when query changes
  useEffect(() => {
    if (searchQuery !== lastSearchQuery.current) {
      debouncedSearch(searchQuery)
    }

    return () => {
      debouncedSearch.cancel()
      if (searchAbortController.current) {
        searchAbortController.current.abort()
      }
    }
  }, [searchQuery, debouncedSearch])

  // Initialize friends data when hook is first used
  const initializeFriends = useCallback(async () => {
    if (networkStatus === 'offline') {
      notificationManager.warning(t('Network Error'), t('Please check your internet connection'))
      return
    }

    try {
      await Promise.allSettled([
        dispatch(fetchFriends()).unwrap(),
        dispatch(fetchFriendRequests()).unwrap(),
      ])
    } catch (error) {
      console.error('[FRIENDS_HOOK] Failed to initialize:', error)
    }
  }, [dispatch, networkStatus, t])

  useEffect(() => {
    if (autoFetch) initializeFriends()
  }, [autoFetch])

  // Enhanced search operations
  const handleSearchQueryChange = useCallback(
    query => {
      dispatch(setSearchQuery(query))
    },
    [dispatch],
  )

  const clearSearch = useCallback(() => {
    // Cancel any ongoing search
    if (searchAbortController.current) {
      searchAbortController.current.abort()
    }

    dispatch(clearSearchResults())
    dispatch(clearSpecificError('search'))
  }, [dispatch])

  // Enhanced friend request operations with optimistic updates
  const handleSendFriendRequest = useCallback(
    async toUserId => {
      if (!user?._id) {
        notificationManager.error(t('Error'), t('You must be logged in to send friend requests'))
        return false
      }

      if (networkStatus === 'offline') {
        notificationManager.warning(t('Network Error'), t('Please check your internet connection'))
        return false
      }

      try {
        // Optimistic update
        if (enableOptimisticUpdates) {
          dispatch(addPendingRequest(toUserId))
        }

        const result = await dispatch(
          sendFriendRequest({
            fromId: user._id,
            toId: toUserId,
          }),
        ).unwrap()

        notificationManager.success(
          t('Success'),
          result.message || t('Friend request sent successfully'),
        )

        return true
      } catch (error) {
        // Revert optimistic update on error
        if (enableOptimisticUpdates) {
          dispatch(removePendingRequest(toUserId))
        }

        notificationManager.error(t('Error'), error || t('Failed to send friend request'))

        return false
      }
    },
    [dispatch, user, t, networkStatus, enableOptimisticUpdates],
  )

  const handleAcceptFriendRequest = useCallback(
    async requestId => {
      if (networkStatus === 'offline') {
        notificationManager.warning(t('Network Error'), t('Please check your internet connection'))
        return false
      }

      const request = memoizedSelectors.requestsArray.find(
        r => r._id === requestId,
      )

      try {
        // Optimistic update
        if (enableOptimisticUpdates && request) {
          dispatch(optimisticAddFriend({ request }))
        }

        const result = await dispatch(
          acceptFriendRequest({ requestId }),
        ).unwrap()

        notificationManager.success(
          t('Success'),
          result.message || t('Friend request accepted'),
        )

        return true
      } catch (error) {
        // Revert optimistic update on error
        if (enableOptimisticUpdates && request) {
          dispatch(
            revertOptimisticUpdate({
              type: 'addFriend',
              data: { friendId: request.from._id, request },
            }),
          )
        }

        notificationManager.error(t('Error'), error || t('Failed to accept friend request'))

        return false
      }
    },
    [
      dispatch,

      t,
      networkStatus,
      enableOptimisticUpdates,
      memoizedSelectors.requestsArray,
    ],
  )

  const handleRejectFriendRequest = useCallback(
    async requestId => {
      try {
        const result = await dispatch(
          rejectFriendRequest({ requestId }),
        ).unwrap()

        notificationManager.info(
          t('Request Rejected'),
          result.message || t('Friend request rejected'),
        )

        return true
      } catch (error) {
        notificationManager.error(t('Error'), error || t('Failed to reject friend request'))

        return false
      }
    },
    [dispatch, t],
  )

  const handleRemoveFriend = useCallback(
    async friendId => {
      const friend = memoizedSelectors.friendsArray.find(
        f => f._id === friendId,
      )

      try {
        // Optimistic update
        if (enableOptimisticUpdates) {
          dispatch(optimisticRemoveFriend({ friendId }))
        }

        const result = await dispatch(removeFriend({ friendId })).unwrap()

        notificationManager.info(
          t('Friend Removed'),
          result.message || t('Friend removed successfully'),
        )

        return true
      } catch (error) {
        // Revert optimistic update on error
        if (enableOptimisticUpdates && friend) {
          dispatch(
            revertOptimisticUpdate({
              type: 'removeFriend',
              data: { friend },
            }),
          )
        }

        notificationManager.error(t('Error'), error || t('Failed to remove friend'))

        return false
      }
    },
    [
      dispatch,

      t,
      enableOptimisticUpdates,
      memoizedSelectors.friendsArray,
    ],
  )

  // WiseWeb modal operations
  const openWiseWeb = useCallback(() => {
    dispatch(setWiseWebOpen(true))
    // Clear any search errors when opening
    dispatch(clearSpecificError('search'))
  }, [dispatch])

  const closeWiseWeb = useCallback(() => {
    dispatch(setWiseWebOpen(false))
    clearSearch()
    cancelAllRetries()
  }, [dispatch, clearSearch, cancelAllRetries])

  // Enhanced helper functions
  const isFriend = useCallback(
    userId => {
      return memoizedSelectors.friendsArray.some(
        friend => friend?._id === userId,
      )
    },
    [memoizedSelectors.friendsArray],
  )

  const hasPendingRequest = useCallback(
    userId => {
      return (
        memoizedSelectors.pendingArray.includes(userId) ||
        memoizedSelectors.requestsArray.some(
          request => request?.from?._id === userId,
        )
      )
    },
    [memoizedSelectors.pendingArray, memoizedSelectors.requestsArray],
  )

  const getFriendById = useCallback(
    userId => {
      return memoizedSelectors.friendsArray.find(
        friend => friend?._id === userId,
      )
    },
    [memoizedSelectors.friendsArray],
  )

  // Cleanup function
  const cleanup = useCallback(() => {
    debouncedSearch.cancel()
    if (searchAbortController.current) {
      searchAbortController.current.abort()
    }
    cancelAllRetries()
    dispatch(clearErrors())
  }, [debouncedSearch, cancelAllRetries, dispatch])

  // Enhanced online status management
  const updateOnlineStatus = useCallback(
    (friendId, isOnline) => {
      dispatch(updateFriendOnlineStatus({ friendId, isOnline }))
    },
    [dispatch],
  )

  const updateMultipleOnlineStatus = useCallback(
    statusUpdates => {
      dispatch(updateMultipleFriendsOnlineStatus(statusUpdates))
    },
    [dispatch],
  )

  // Manual refresh function
  const refreshData = useCallback(async () => {
    if (networkStatus === 'offline') {
      notificationManager.warning(t('Network Error'), t('Please check your internet connection'))
      return false
    }

    try {
      await Promise.allSettled([
        dispatch(fetchFriends()).unwrap(),
        dispatch(fetchFriendRequests()).unwrap(),
      ])
      return true
    } catch (error) {
      console.error('[FRIENDS_HOOK] Refresh failed:', error)
      return false
    }
  }, [dispatch, networkStatus, t])

  return {
    // Data - all guaranteed to be arrays with performance optimizations
    friends: memoizedSelectors.friendsArray,
    onlineFriends: memoizedSelectors.onlineFriends,
    offlineFriends: memoizedSelectors.offlineFriends,
    friendRequests: memoizedSelectors.requestsArray,
    searchResults: ensureArray(searchResults),
    searchQuery: searchQuery || '',
    isWiseWebOpen: !!isWiseWebOpen,
    networkStatus,

    // Loading states
    loading: loading || {},

    // Error states
    error: error || {},

    // Stats
    totalFriends: memoizedSelectors.totalFriends,
    totalRequests: memoizedSelectors.totalRequests,
    onlineCount: memoizedSelectors.onlineCount,

    // Enhanced actions
    initializeFriends,
    refreshData,
    handleSearchQueryChange,
    clearSearch,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleRemoveFriend,
    openWiseWeb,
    closeWiseWeb,
    cleanup,

    // Enhanced helper functions
    isFriend,
    hasPendingRequest,
    getFriendById,
    updateOnlineStatus,
    updateMultipleOnlineStatus,

    // Performance and debugging
    retryCount,
    lastFetch,
  }
}

export default useFriends
