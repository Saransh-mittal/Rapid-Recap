// redux/quickClashMatchmakingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Async thunks for matchmaking actions
export const joinMatchmaking = createAsyncThunk(
  'quickClashMatchmaking/join',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/quickClash/matchmaking/join')
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

const initialState = {
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

    // Handle challenge preparation
    setPreparingChallenge: (state, action) => {
      state.preparingChallenge = action.payload
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
        state.challengeCreationData.tempChallengeId
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
    setInMatchmaking: (state, action) => {
      state.inMatchmaking = action.payload
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
      // Join matchmaking
      .addCase(joinMatchmaking.pending, state => {
        state.matchmakingLoading = true
        state.matchmakingError = null
      })
      .addCase(joinMatchmaking.fulfilled, (state, action) => {
        state.matchmakingEntry = action.payload
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
  },
})

export const {
  setSocketConnected,
  setPreparingChallenge,
  setChallengeReady,
  setMatchCreationStarted,
  setMatchChallengeReady,
  setMatchCreationFailed,
  setInMatchmaking,
  clearChallengeStates,
  clearChallengeError,
  resetMatchmakingState,
} = quickClashMatchmakingSlice.actions

export default quickClashMatchmakingSlice.reducer
