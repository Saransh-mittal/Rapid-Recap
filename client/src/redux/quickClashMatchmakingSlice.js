// redux/quickClashMatchmakingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Async thunks for matchmaking actions
export const fetchMatchmakingUsers = createAsyncThunk(
  'quickClashMatchmaking/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/quickClash/matchmaking/users')
      return response.data.users || []
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch matchmaking users',
      )
    }
  },
)

export const joinMatchmaking = createAsyncThunk(
  'quickClashMatchmaking/join',
  async ({ categories }, { rejectWithValue }) => {
    // Validate exactly 2 categories
    if (!categories || !Array.isArray(categories) || categories.length !== 2) {
      return rejectWithValue('Exactly 2 categories must be selected')
    }

    try {
      const response = await axios.post('/api/quickClash/matchmaking/join', {
        categories,
      })
      return response.data.matchmaking
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to join matchmaking',
      )
    }
  },
)

export const leaveMatchmaking = createAsyncThunk(
  'quickClashMatchmaking/leave',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/quickClash/matchmaking/leave')
      return response.data.success
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to leave matchmaking',
      )
    }
  },
)

export const getMatchmakingStatus = createAsyncThunk(
  'quickClashMatchmaking/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/quickClash/matchmaking/status')
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get matchmaking status',
      )
    }
  },
)

export const acceptMatchmakingChallenge = createAsyncThunk(
  'quickClashMatchmaking/acceptChallenge',
  async ({ creatorId, categories }, { rejectWithValue }) => {
    // Validate exactly 2 categories
    if (!categories || !Array.isArray(categories) || categories.length !== 2) {
      return rejectWithValue('Exactly 2 categories must be selected')
    }

    try {
      const response = await axios.post('/api/quickClash/matchmaking/accept', {
        creatorId,
        categories,
      })

      return response.data
    } catch (error) {
      // Special handling for race conditions (409 Conflict)
      if (error.response?.status === 409) {
        return rejectWithValue(
          'This user is no longer available for challenges',
        )
      }

      return rejectWithValue(
        error.response?.data?.message || 'Failed to accept challenge',
      )
    }
  },
)

const initialState = {
  // Available users for matchmaking
  users: [],
  usersLoading: false,
  usersError: null,

  // Current user's matchmaking state
  inMatchmaking: false,
  matchmakingEntry: null,
  matchmakingLoading: false,
  matchmakingError: null,

  // Challenge creation
  challengeCreating: false,
  challengeCreationResult: null,
  challengeCreationError: null,

  // Socket connection status
  socketConnected: false,

  // Pending challenge data (for UI state)
  pendingChallenge: null,
  preparingChallenge: null,
  challengeCreationData: null,
  challengeReady: null,
}

const quickClashMatchmakingSlice = createSlice({
  name: 'quickClashMatchmaking',
  initialState,
  reducers: {
    // Socket-related actions
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload
    },

    // User joined/left via socket
    addUser: (state, action) => {
      const newUser = action.payload
      // Prevent duplicates
      if (!state.users.some(u => u.user._id === newUser.user._id)) {
        state.users.push(newUser)
      }
    },
    removeUser: (state, action) => {
      const userId = action.payload
      state.users = state.users.filter(u => u.user._id !== userId)
    },
    updateUserStatus: (state, action) => {
      const { userId, status } = action.payload
      const userIndex = state.users.findIndex(u => u.user._id === userId)
      if (userIndex !== -1) {
        state.users[userIndex].status = status
      }
    },

    // Challenge state management
    setPendingChallenge: (state, action) => {
      state.pendingChallenge = action.payload
    },
    clearPendingChallenge: state => {
      state.pendingChallenge = null
    },
    removeLockedUser: (state, action) => {
      const userId = action.payload
      state.users = state.users.filter(u => u.user._id !== userId)
    },

    // Handle challenge preparation
    setPreparingChallenge: (state, action) => {
      state.preparingChallenge = action.payload
      // Clear users list when preparing a challenge
      state.users = []
    },

    // Handle challenge ready notification
    setChallengeReady: (state, action) => {
      state.preparingChallenge = null
      state.challengeReady = action.payload
    },

    setMatchCreationStarted: (state, action) => {
      state.challengeCreationData = action.payload
      state.inMatchmaking = false // Auto leave matchmaking
    },

    // For when challenge is actually created
    setMatchChallengeReady: (state, action) => {
      // Update the challengeId in the creation data
      if (
        state.challengeCreationData &&
        state.challengeCreationData.tempChallengeId ===
          action.payload.oldChallengeId
      ) {
        state.challengeReady = {
          ...action.payload,
          fromMatchmaking: true,
        }
      }
    },

    // For when creation fails
    setMatchCreationFailed: (state, action) => {
      if (
        state.challengeCreationData &&
        state.challengeCreationData.tempChallengeId ===
          action.payload.oldChallengeId
      ) {
        state.challengeCreationError = action.payload.error
        state.challengeCreationData = null
      }
    },
    clearChallengeError: state => {
      state.challengeCreationError = null
    },

    clearChallengeStates: state => {
      state.challengeCreationData = null
      state.challengeReady = null
    },

    // Reset state
    resetMatchmakingState: () => initialState,
  },
  extraReducers: builder => {
    builder
      // Fetch users
      .addCase(fetchMatchmakingUsers.pending, state => {
        state.usersLoading = true
        state.usersError = null
      })
      .addCase(fetchMatchmakingUsers.fulfilled, (state, action) => {
        state.users = action.payload
        state.usersLoading = false
      })
      .addCase(fetchMatchmakingUsers.rejected, (state, action) => {
        state.usersLoading = false
        state.usersError = action.payload
      })

      // Join matchmaking
      .addCase(joinMatchmaking.pending, state => {
        state.matchmakingLoading = true
        state.matchmakingError = null
      })
      .addCase(joinMatchmaking.fulfilled, (state, action) => {
        state.matchmakingEntry = action.payload
        state.inMatchmaking = true
        state.matchmakingLoading = false
      })
      .addCase(joinMatchmaking.rejected, (state, action) => {
        state.matchmakingLoading = false
        state.matchmakingError = action.payload
      })

      // Leave matchmaking
      .addCase(leaveMatchmaking.pending, state => {
        state.matchmakingLoading = true
      })
      .addCase(leaveMatchmaking.fulfilled, state => {
        state.inMatchmaking = false
        state.matchmakingEntry = null
        state.matchmakingLoading = false
      })
      .addCase(leaveMatchmaking.rejected, (state, action) => {
        state.matchmakingLoading = false
        state.matchmakingError = action.payload
      })

      // Get matchmaking status
      .addCase(getMatchmakingStatus.pending, state => {
        state.matchmakingLoading = true
      })
      .addCase(getMatchmakingStatus.fulfilled, (state, action) => {
        state.inMatchmaking = action.payload.inMatchmaking
        state.matchmakingEntry = action.payload.matchmaking
        state.matchmakingLoading = false
      })
      .addCase(getMatchmakingStatus.rejected, (state, action) => {
        state.matchmakingLoading = false
        state.matchmakingError = action.payload
      })
      // Accept challenge
      .addCase(acceptMatchmakingChallenge.pending, state => {
        state.challengeCreating = true
        state.challengeCreationError = null
      })
      .addCase(acceptMatchmakingChallenge.fulfilled, (state, action) => {
        state.challengeCreationResult = action.payload
        state.challengeCreating = false
      })
      .addCase(acceptMatchmakingChallenge.rejected, (state, action) => {
        state.challengeCreating = false
        state.challengeCreationError = action.payload
      })
  },
})

export const {
  setSocketConnected,
  addUser,
  removeUser,
  updateUserStatus,
  setPendingChallenge,
  clearPendingChallenge,
  resetMatchmakingState,
  removeLockedUser,
  setPreparingChallenge,
  setChallengeReady,
  setMatchCreationStarted,
  setMatchChallengeReady,
  setMatchCreationFailed,
  clearChallengeStates,
  clearChallengeError,
} = quickClashMatchmakingSlice.actions

export default quickClashMatchmakingSlice.reducer
