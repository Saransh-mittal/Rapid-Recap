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
  // Core matchmaking state
  inMatchmaking: false,
  matchmakingEntry: null,
  matchmakingLoading: false,
  matchmakingError: null,

  // Challenge creation and preparation
  challengeCreating: false,
  challengeCreationResult: null,
  challengeCreationError: null,
  challengeCreationData: null,

  // Match preparation flow
  preparingChallenge: null, // Contains opponent data when match is found
  preparationProgress: 0,
  preparationStep: null, // 'matchFound', 'contentLoading', 'generatingQuiz', 'challengeReady'

  // Challenge ready state
  challengeReady: null, // Contains challengeId when ready

  // Socket connection status
  socketConnected: false,

  // UI state
  showSearchModal: false,
  showPreparationModal: false,
}

const quickClashMatchmakingSlice = createSlice({
  name: 'quickClashMatchmaking',
  initialState,
  reducers: {
    // Socket connection management
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload
    },

    // Matchmaking state management
    setInMatchmaking: (state, action) => {
      state.inMatchmaking = action.payload

      // Reset other states when leaving matchmaking
      if (!action.payload) {
        state.matchmakingEntry = null
        state.preparingChallenge = null
        state.preparationProgress = 0
        state.preparationStep = null
      }
    },

    // Match preparation flow
    setPreparingChallenge: (state, action) => {
      state.preparingChallenge = action.payload
      state.inMatchmaking = false // User is no longer searching
      state.preparationProgress = 5 // Initial progress
      state.preparationStep = 'matchFound'
      state.challengeCreationData = null // Clear any old challenge data
      state.challengeReady = null // Clear any old ready state
    },

    // Progress tracking
    setPreparationProgress: (state, action) => {
      const newProgress = Math.max(state.preparationProgress, action.payload)
      state.preparationProgress = Math.min(newProgress, 100)
    },

    setPreparationStep: (state, action) => {
      state.preparationStep = action.payload

      // Auto-update progress based on step if not already higher
      const stepProgressMap = {
        matchFound: 5,
        contentLoading: 20,
        generatingQuiz: 60,
        challengeReady: 100,
      }

      const stepProgress =
        stepProgressMap[action.payload] || state.preparationProgress
      if (stepProgress > state.preparationProgress) {
        state.preparationProgress = stepProgress
      }
    },

    // Challenge ready state
    setChallengeReady: (state, action) => {
      state.challengeReady = action.payload
      state.preparationProgress = 100
      state.preparationStep = 'challengeReady'
      state.challengeCreationError = null
    },

    setMatchChallengeReady: (state, action) => {
      // Handle when the real challenge ID is available
      state.challengeReady = {
        ...action.payload,
        fromMatchmaking: true,
      }
      state.preparationProgress = 100
      state.preparationStep = 'challengeReady'
      state.challengeCreationData = null // Clear temporary data
    },

    // Challenge creation flow (legacy support)
    setMatchCreationStarted: (state, action) => {
      state.challengeCreationData = action.payload
      state.challengeCreating = true
    },

    setMatchCreationFailed: (state, action) => {
      state.challengeCreationError = action.payload.error
      state.challengeCreating = false
      state.challengeCreationData = null
    },

    // Error handling
    clearChallengeError: state => {
      state.challengeCreationError = null
    },

    setMatchmakingError: (state, action) => {
      state.matchmakingError = action.payload
    },

    clearMatchmakingError: state => {
      state.matchmakingError = null
    },

    // State cleanup
    clearChallengeStates: state => {
      state.challengeCreationData = null
      state.challengeReady = null
      state.preparingChallenge = null
      state.preparationProgress = 0
      state.preparationStep = null
      state.challengeCreationError = null
    },

    clearPreparationState: state => {
      state.preparingChallenge = null
      state.preparationProgress = 0
      state.preparationStep = null
      state.challengeReady = null
    },

    // UI state management
    setShowSearchModal: (state, action) => {
      state.showSearchModal = action.payload
    },

    setShowPreparationModal: (state, action) => {
      state.showPreparationModal = action.payload
    },

    // Complete reset
    resetMatchmakingState: () => initialState,

    // Batch state updates for efficiency
    updateMatchmakingState: (state, action) => {
      const updates = action.payload
      Object.keys(updates).forEach(key => {
        if (key in state) {
          state[key] = updates[key]
        }
      })
    },
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
        state.inMatchmaking = true

        // Clear any previous challenge states
        state.preparingChallenge = null
        state.challengeReady = null
        state.preparationProgress = 0
        state.preparationStep = null
      })
      .addCase(joinMatchmaking.rejected, (state, action) => {
        state.matchmakingLoading = false
        state.matchmakingError = action.payload
        state.inMatchmaking = false
      })

      // Leave matchmaking
      .addCase(leaveMatchmaking.pending, state => {
        state.matchmakingLoading = true
      })
      .addCase(leaveMatchmaking.fulfilled, state => {
        state.inMatchmaking = false
        state.matchmakingEntry = null
        state.matchmakingLoading = false
        state.matchmakingError = null

        // Clear all related states
        state.preparingChallenge = null
        state.challengeReady = null
        state.preparationProgress = 0
        state.preparationStep = null
        state.challengeCreationData = null
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
        state.matchmakingError = null
      })
      .addCase(getMatchmakingStatus.rejected, (state, action) => {
        state.matchmakingLoading = false
        state.matchmakingError = action.payload
      })
  },
})

export const {
  // Socket management
  setSocketConnected,

  // Matchmaking state
  setInMatchmaking,

  // Match preparation flow
  setPreparingChallenge,
  setPreparationProgress,
  setPreparationStep,

  // Challenge ready state
  setChallengeReady,
  setMatchChallengeReady,

  // Legacy challenge creation (for backward compatibility)
  setMatchCreationStarted,
  setMatchCreationFailed,

  // Error handling
  clearChallengeError,
  setMatchmakingError,
  clearMatchmakingError,

  // State cleanup
  clearChallengeStates,
  clearPreparationState,

  // UI state
  setShowSearchModal,
  setShowPreparationModal,

  // Utility actions
  resetMatchmakingState,
  updateMatchmakingState,
} = quickClashMatchmakingSlice.actions

export default quickClashMatchmakingSlice.reducer
