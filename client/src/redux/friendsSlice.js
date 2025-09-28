// src/redux/friendsSlice.js - Enhanced with fault tolerance and performance optimizations
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Enhanced helper functions
const ensureArray = value => {
  if (value instanceof Set) return Array.from(value)
  if (!Array.isArray(value)) return []
  return value
}

const sanitizeState = state => ({
  ...state,
  friends: ensureArray(state.friends),
  friendRequests: ensureArray(state.friendRequests),
  searchResults: ensureArray(state.searchResults),
  pendingRequests: ensureArray(state.pendingRequests),
})

// Enhanced API configuration
const createApiCall = (url, options = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

  return axios({
    ...options,
    url,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId))
}

// Retry wrapper for API calls
const withRetry = async (apiCall, maxRetries = 2) => {
  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error

      // Don't retry on client errors (4xx) except 408, 429
      if (error.response?.status >= 400 && error.response?.status < 500) {
        if (![408, 429].includes(error.response.status)) {
          throw error
        }
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000),
        )
      }
    }
  }

  throw lastError
}

// Enhanced async thunks with fault tolerance
export const fetchFriends = createAsyncThunk(
  'friends/fetchFriends',
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await withRetry(() => createApiCall('/api/friends/'))
      return response.data
    } catch (error) {
      if (signal?.aborted) {
        return rejectWithValue('Request was cancelled')
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch friends',
      )
    }
  },
)

export const fetchFriendRequests = createAsyncThunk(
  'friends/fetchFriendRequests',
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await withRetry(() =>
        createApiCall('/api/friends/get-requests'),
      )
      return response.data
    } catch (error) {
      if (signal?.aborted) {
        return rejectWithValue('Request was cancelled')
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch friend requests',
      )
    }
  },
)

export const sendFriendRequest = createAsyncThunk(
  'friends/sendFriendRequest',
  async ({ fromId, toId }, { rejectWithValue, signal }) => {
    try {
      const response = await withRetry(() =>
        createApiCall('/api/friends/send-request', {
          method: 'POST',
          data: { fromId, toId },
        }),
      )
      return { message: response.data.message, toId }
    } catch (error) {
      if (signal?.aborted) {
        return rejectWithValue('Request was cancelled')
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send friend request',
      )
    }
  },
)

export const acceptFriendRequest = createAsyncThunk(
  'friends/acceptFriendRequest',
  async ({ requestId }, { rejectWithValue, dispatch, signal }) => {
    try {
      const response = await withRetry(() =>
        createApiCall('/api/friends/accept-request', {
          method: 'POST',
          data: { requestId },
        }),
      )

      // Optimistic updates - refresh data in background
      Promise.all([
        dispatch(fetchFriends()),
        dispatch(fetchFriendRequests()),
      ]).catch(console.error)

      return { message: response.data.message, requestId }
    } catch (error) {
      if (signal?.aborted) {
        return rejectWithValue('Request was cancelled')
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to accept friend request',
      )
    }
  },
)

export const rejectFriendRequest = createAsyncThunk(
  'friends/rejectFriendRequest',
  async ({ requestId }, { rejectWithValue, signal }) => {
    try {
      const response = await withRetry(() =>
        createApiCall('/api/friends/reject-request', {
          method: 'POST',
          data: { requestId },
        }),
      )
      return { message: response.data.message, requestId }
    } catch (error) {
      if (signal?.aborted) {
        return rejectWithValue('Request was cancelled')
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reject friend request',
      )
    }
  },
)

export const removeFriend = createAsyncThunk(
  'friends/removeFriend',
  async ({ friendId }, { rejectWithValue, signal }) => {
    try {
      const response = await withRetry(() =>
        createApiCall('/api/friends/sever-ties', {
          method: 'POST',
          data: { friendId },
        }),
      )
      return { message: response.data.message, friendId }
    } catch (error) {
      if (signal?.aborted) {
        return rejectWithValue('Request was cancelled')
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove friend',
      )
    }
  },
)

export const searchUsers = createAsyncThunk(
  'friends/searchUsers',
  async ({ query }, { rejectWithValue, signal }) => {
    try {
      if (!query || query.trim().length < 2) {
        return []
      }

      const response = await withRetry(() =>
        createApiCall(`/api/friends/search?q=${encodeURIComponent(query)}`),
      )
      return response.data
    } catch (error) {
      if (signal?.aborted) {
        return rejectWithValue('Request was cancelled')
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to search users',
      )
    }
  },
)

// Enhanced initial state with better error tracking and socket status
const initialState = {
  friends: [],
  friendRequests: [],
  searchResults: [],
  pendingRequests: [],
  loading: {
    friends: false,
    requests: false,
    search: false,
    sendRequest: false,
    acceptRequest: false,
    rejectRequest: false,
    removeFriend: false,
  },
  error: {
    friends: null,
    requests: null,
    search: null,
    sendRequest: null,
    acceptRequest: null,
    rejectRequest: null,
    removeFriend: null,
  },
  retryCount: {
    friends: 0,
    requests: 0,
    search: 0,
  },
  lastFetch: {
    friends: null,
    requests: null,
  },
  searchQuery: '',
  isWiseWebOpen: false,
  networkStatus: 'online', // online, offline, poor

  // Socket-specific state
  socketStatus: {
    isConnected: false,
    isConnecting: false,
    lastConnected: null,
    reconnectCount: 0,
  },
  socketErrors: {},
}

const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
      if (!action.payload.trim()) {
        state.searchResults = []
        state.error.search = null
      }
    },

    clearSearchResults: state => {
      state.searchResults = []
      state.searchQuery = ''
      state.error.search = null
    },

    setWiseWebOpen: (state, action) => {
      state.isWiseWebOpen = action.payload
    },

    clearErrors: state => {
      state.error = Object.keys(state.error).reduce((acc, key) => {
        acc[key] = null
        return acc
      }, {})
    },

    clearSpecificError: (state, action) => {
      if (state.error[action.payload]) {
        state.error[action.payload] = null
      }
    },

    updateFriendOnlineStatus: (state, action) => {
      const { friendId, isOnline } = action.payload
      const friend = state.friends.find(f => f._id === friendId)
      if (friend) {
        friend.isOnline = isOnline
        friend.lastLogin = isOnline
          ? new Date().toISOString()
          : friend.lastLogin
      }
    },

    updateMultipleFriendsOnlineStatus: (state, action) => {
      const statusUpdates = action.payload // Array of {friendId, isOnline}
      statusUpdates.forEach(({ friendId, isOnline }) => {
        const friend = state.friends.find(f => f._id === friendId)
        if (friend) {
          friend.isOnline = isOnline
          friend.lastLogin = isOnline
            ? new Date().toISOString()
            : friend.lastLogin
        }
      })
    },

    addPendingRequest: (state, action) => {
      const userId = action.payload
      const pendingArray = ensureArray(state.pendingRequests)
      if (!pendingArray.includes(userId)) {
        state.pendingRequests = [...pendingArray, userId]
      }
    },

    removePendingRequest: (state, action) => {
      const userId = action.payload
      state.pendingRequests = ensureArray(state.pendingRequests).filter(
        id => id !== userId,
      )
    },

    sanitizeFriendsState: state => {
      Object.assign(state, sanitizeState(state))
    },

    setNetworkStatus: (state, action) => {
      state.networkStatus = action.payload
    },

    optimisticAddFriend: (state, action) => {
      const { request } = action.payload
      // Move from requests to friends optimistically
      state.friendRequests = ensureArray(state.friendRequests).filter(
        req => req._id !== request._id,
      )
      if (
        request.from &&
        !state.friends.find(f => f._id === request.from._id)
      ) {
        state.friends.push({
          ...request.from,
          isOnline: false, // Default to offline
        })
      }
    },

    optimisticRemoveFriend: (state, action) => {
      const { friendId } = action.payload
      state.friends = ensureArray(state.friends).filter(
        friend => friend._id !== friendId,
      )
    },

    revertOptimisticUpdate: (state, action) => {
      const { type, data } = action.payload
      switch (type) {
        case 'addFriend':
          // Revert friend addition
          state.friends = ensureArray(state.friends).filter(
            friend => friend._id !== data.friendId,
          )
          if (data.request) {
            state.friendRequests.push(data.request)
          }
          break
        case 'removeFriend':
          // Revert friend removal
          if (
            data.friend &&
            !state.friends.find(f => f._id === data.friend._id)
          ) {
            state.friends.push(data.friend)
          }
          break
      }
    },

    // Socket-related reducers
    handleSocketFriendRequestReceived: (state, action) => {
      const { requestData } = action.payload

      // Add to received requests if not already present
      const existingRequest = state.friendRequests.find(
        req => req._id === requestData.requestId,
      )

      if (!existingRequest && requestData.from) {
        state.friendRequests.push({
          _id: requestData.requestId,
          from: requestData.from,
          status: 'pending',
          unread: true,
          createdAt: new Date().toISOString(),
        })
      }

      // Clear any related errors
      state.error.requests = null
    },

    handleSocketFriendRequestAccepted: (state, action) => {
      const { requestId, friend } = action.payload

      // Remove from friend requests
      state.friendRequests = ensureArray(state.friendRequests).filter(
        req => req._id !== requestId,
      )

      // Add to friends list if not already present
      const existingFriend = state.friends.find(f => f._id === friend._id)
      if (!existingFriend) {
        state.friends.push({
          ...friend,
          relationshipStatus: 'friend',
        })
      }

      // Remove from pending requests
      state.pendingRequests = ensureArray(state.pendingRequests).filter(
        id => id !== friend._id,
      )

      // Clear errors
      state.error.sendRequest = null
      state.error.acceptRequest = null
    },

    handleSocketFriendRequestRejected: (state, action) => {
      const { requestId, rejectedBy } = action.payload

      // Remove from pending requests
      state.pendingRequests = ensureArray(state.pendingRequests).filter(
        id => id !== rejectedBy._id,
      )

      // Clear send request error
      state.error.sendRequest = null
    },

    handleSocketFriendRemoved: (state, action) => {
      const { removedBy } = action.payload

      // Remove from friends list
      state.friends = ensureArray(state.friends).filter(
        friend => friend._id !== removedBy,
      )

      // Clear related errors
      state.error.removeFriend = null
    },

    updateSocketConnectionStatus: (state, action) => {
      const { isConnected, isConnecting } = action.payload

      state.socketStatus = {
        isConnected,
        isConnecting,
        lastConnected: isConnected
          ? new Date().toISOString()
          : state.socketStatus?.lastConnected,
        reconnectCount: isConnected
          ? 0
          : state.socketStatus?.reconnectCount || 0,
      }

      // Update network status based on socket connection
      if (isConnected) {
        state.networkStatus = 'online'
      } else if (isConnecting) {
        state.networkStatus = 'poor'
      }
    },

    incrementSocketReconnectCount: state => {
      if (!state.socketStatus) {
        state.socketStatus = { reconnectCount: 0 }
      }
      state.socketStatus.reconnectCount =
        (state.socketStatus.reconnectCount || 0) + 1
    },

    handleSocketError: (state, action) => {
      const { error, eventType } = action.payload

      // Store socket-specific errors
      if (!state.socketErrors) {
        state.socketErrors = {}
      }

      state.socketErrors[eventType || 'general'] = {
        message: error.message || error,
        timestamp: new Date().toISOString(),
      }

      // Update network status
      state.networkStatus = 'poor'
    },

    clearSocketErrors: state => {
      state.socketErrors = {}
    },

    // Batch update friends online status (for socket efficiency)
    updateBatchFriendsOnlineStatus: (state, action) => {
      const { statusUpdates } = action.payload // Array of {friendId, isOnline, lastLogin}

      statusUpdates.forEach(({ friendId, isOnline, lastLogin }) => {
        const friend = state.friends.find(f => f._id === friendId)
        if (friend) {
          friend.isOnline = isOnline
          if (lastLogin) {
            friend.lastLogin = lastLogin
          }
        }

        // Also update in search results if present
        const searchResult = state.searchResults.find(u => u._id === friendId)
        if (searchResult) {
          searchResult.isOnline = isOnline
          if (lastLogin) {
            searchResult.lastLogin = lastLogin
          }
        }
      })
    },
  },

  extraReducers: builder => {
    builder
      // Fetch Friends
      .addCase(fetchFriends.pending, state => {
        state.loading.friends = true
        state.error.friends = null
        Object.assign(state, sanitizeState(state))
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading.friends = false
        state.friends = ensureArray(action.payload)
        state.lastFetch.friends = new Date().toISOString()
        state.retryCount.friends = 0
        state.error.friends = null
        Object.assign(state, sanitizeState(state))
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading.friends = false
        state.error.friends = action.payload
        state.retryCount.friends += 1
        Object.assign(state, sanitizeState(state))
      })

      // Fetch Friend Requests
      .addCase(fetchFriendRequests.pending, state => {
        state.loading.requests = true
        state.error.requests = null
        Object.assign(state, sanitizeState(state))
      })
      .addCase(fetchFriendRequests.fulfilled, (state, action) => {
        state.loading.requests = false
        state.friendRequests = ensureArray(action.payload)
        state.lastFetch.requests = new Date().toISOString()
        state.retryCount.requests = 0
        state.error.requests = null
        Object.assign(state, sanitizeState(state))
      })
      .addCase(fetchFriendRequests.rejected, (state, action) => {
        state.loading.requests = false
        state.error.requests = action.payload
        state.retryCount.requests += 1
        Object.assign(state, sanitizeState(state))
      })

      // Send Friend Request
      .addCase(sendFriendRequest.pending, (state, action) => {
        state.loading.sendRequest = true
        state.error.sendRequest = null
        if (action.meta.arg.toId) {
          const pendingArray = ensureArray(state.pendingRequests)
          if (!pendingArray.includes(action.meta.arg.toId)) {
            state.pendingRequests = [...pendingArray, action.meta.arg.toId]
          }
        }
        Object.assign(state, sanitizeState(state))
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.loading.sendRequest = false
        state.error.sendRequest = null
        Object.assign(state, sanitizeState(state))
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.loading.sendRequest = false
        state.error.sendRequest = action.payload
        if (action.meta.arg.toId) {
          state.pendingRequests = ensureArray(state.pendingRequests).filter(
            id => id !== action.meta.arg.toId,
          )
        }
        Object.assign(state, sanitizeState(state))
      })

      // Accept Friend Request
      .addCase(acceptFriendRequest.pending, state => {
        state.loading.acceptRequest = true
        state.error.acceptRequest = null
        Object.assign(state, sanitizeState(state))
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.loading.acceptRequest = false
        state.error.acceptRequest = null
        state.friendRequests = ensureArray(state.friendRequests).filter(
          request => request._id !== action.meta.arg.requestId,
        )
        Object.assign(state, sanitizeState(state))
      })
      .addCase(acceptFriendRequest.rejected, (state, action) => {
        state.loading.acceptRequest = false
        state.error.acceptRequest = action.payload
        Object.assign(state, sanitizeState(state))
      })

      // Reject Friend Request
      .addCase(rejectFriendRequest.pending, state => {
        state.loading.rejectRequest = true
        state.error.rejectRequest = null
        Object.assign(state, sanitizeState(state))
      })
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.loading.rejectRequest = false
        state.error.rejectRequest = null
        state.friendRequests = ensureArray(state.friendRequests).filter(
          request => request._id !== action.meta.arg.requestId,
        )
        Object.assign(state, sanitizeState(state))
      })
      .addCase(rejectFriendRequest.rejected, (state, action) => {
        state.loading.rejectRequest = false
        state.error.rejectRequest = action.payload
        Object.assign(state, sanitizeState(state))
      })

      // Remove Friend
      .addCase(removeFriend.pending, state => {
        state.loading.removeFriend = true
        state.error.removeFriend = null
        Object.assign(state, sanitizeState(state))
      })
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.loading.removeFriend = false
        state.error.removeFriend = null
        state.friends = ensureArray(state.friends).filter(
          friend => friend._id !== action.meta.arg.friendId,
        )
        Object.assign(state, sanitizeState(state))
      })
      .addCase(removeFriend.rejected, (state, action) => {
        state.loading.removeFriend = false
        state.error.removeFriend = action.payload
        Object.assign(state, sanitizeState(state))
      })

      // Search Users
      .addCase(searchUsers.pending, state => {
        state.loading.search = true
        state.error.search = null
        Object.assign(state, sanitizeState(state))
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading.search = false
        state.searchResults = ensureArray(action.payload)
        state.retryCount.search = 0
        state.error.search = null
        Object.assign(state, sanitizeState(state))
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading.search = false
        state.error.search = action.payload
        state.searchResults = []
        state.retryCount.search += 1
        Object.assign(state, sanitizeState(state))
      })
  },
})

export const {
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

  // Socket-related exports
  handleSocketFriendRequestReceived,
  handleSocketFriendRequestAccepted,
  handleSocketFriendRequestRejected,
  handleSocketFriendRemoved,
  updateSocketConnectionStatus,
  incrementSocketReconnectCount,
  handleSocketError,
  clearSocketErrors,
  updateBatchFriendsOnlineStatus,
} = friendsSlice.actions

export default friendsSlice.reducer
