// redux/quickClashSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Async thunks for fetching data
export const fetchActiveChallenges = createAsyncThunk(
  'quickClash/fetchActiveChallenges',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/quickClash/challenges', {
        params: { page, limit },
      })
      return {
        challenges: response.data.challenges || [],
        pagination: response.data.pagination || {
          page,
          limit,
          total: 0,
          pages: 0,
          hasMore: false,
        },
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch active challenges',
      )
    }
  },
)

export const fetchCompletedChallenges = createAsyncThunk(
  'quickClash/fetchCompletedChallenges',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/quickClash/challenges/completed', {
        params: { page, limit },
      })
      return {
        challenges: response.data.challenges || [],
        hasMore: response.data.hasMore,
        total: response.data.total,
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch completed challenges',
      )
    }
  },
)

export const fetchUserStats = createAsyncThunk(
  'quickClash/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/quickClash/stats')
      return response.data.stats || {}
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user stats',
      )
    }
  },
)

export const createNewChallenge = createAsyncThunk(
  'quickClash/createNewChallenge',
  async ({ opponentId, categories }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/quickClash/challenge/create', {
        opponentId,
        categories,
      })
      return response.data.challenge
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create challenge',
      )
    }
  },
)

export const acceptChallenge = createAsyncThunk(
  'quickClash/acceptChallenge',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/quickClash/challenge/${challengeId}/accept`,
      )
      return response.data.challenge
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to accept challenge',
      )
    }
  },
)

export const rejectChallenge = createAsyncThunk(
  'quickClash/rejectChallenge',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/quickClash/challenge/${challengeId}/reject`,
      )
      return response.data.challenge
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reject challenge',
      )
    }
  },
)

export const startChallengeSession = createAsyncThunk(
  'quickClash/startChallengeSession',
  async ({ challengeId, language }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/quickClash/session/${challengeId}`,
        { language },
      )
      return response.data.session
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to start challenge session',
      )
    }
  },
)

export const getChallengeAnalysis = createAsyncThunk(
  'quickClash/getChallengeAnalysis',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/quickClash/analysis/${challengeId}`,
      )
      return {
        challengeId,
        analysis: response.data.analysis,
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch challenge analysis',
      )
    }
  },
)

export const fetchUserTrophies = createAsyncThunk(
  'quickClash/fetchUserTrophies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/quickClash/trophies')
      return response.data.trophies || 0
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch trophies',
      )
    }
  },
)

// Add new async thunk for fetching trophy history
export const fetchTrophyHistory = createAsyncThunk(
  'quickClash/fetchTrophyHistory',
  async ({ limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/quickClash/trophies/history', {
        params: { limit },
      })
      return response.data.history || []
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch trophy history',
      )
    }
  },
)

const initialState = {
  // Active challenges section
  activeChallenges: [],
  activeChallengesPage: 1,
  activeChallengesHasMore: true,
  activeChallengesTotal: 0,
  activeChallengesLoading: false,
  activeChallengesError: null,

  // Completed challenges section
  completedChallenges: [],
  completedChallengesPage: 1,
  completedChallengesHasMore: true,
  completedChallengesTotal: 0,
  completedChallengesLoading: false,
  completedChallengesError: null,

  // User stats
  userStats: {
    winRate: 0,
    avgCompletionTime: 0,
    totalChallenges: 0,
    bestCategory: null,
    totalWins: 0,
    totalLosses: 0,
    totalTies: 0,
    avgReadingTime: 0,
  },
  userStatsLoading: false,
  userStatsError: null,

  // Current session/challenge
  currentSession: null,
  currentChallenge: null,
  sessionLoading: false,
  sessionError: null,

  // Challenge creation status
  challengeCreating: false,
  challengeCreationError: null,

  // Challenge analyses cache
  challengeAnalyses: {},
  challengeAnalysesLoading: {},
  challengeAnalysesError: {},

  userTrophies: 0,
  userTrophiesLoading: false,
  userTrophiesError: null,

  trophyHistory: [],
  trophyHistoryLoading: false,
  trophyHistoryError: null,

  potentialTrophyExchange: null,
  trophyExchangeLoading: false,
  trophyExchangeError: null,

  socketListening: false,
}

const quickClashSlice = createSlice({
  name: 'quickClash',
  initialState,
  reducers: {
    setCurrentChallenge: (state, action) => {
      state.currentChallenge = action.payload
    },
    clearCurrentSession: state => {
      state.currentSession = null
    },
    clearActiveChallenges: state => {
      state.activeChallenges = []
    },
    updateCompletedChallengesPage: (state, action) => {
      state.completedChallengesPage = action.payload
    },
    resetCompletedChallenges: state => {
      state.completedChallenges = []
      state.completedChallengesPage = 1
      state.completedChallengesHasMore = true
    },
    setChallengeAnalysisLoading: (state, action) => {
      const { challengeId, isLoading } = action.payload
      state.challengeAnalysesLoading[challengeId] = isLoading
    },
    setChallengeAnalysis: (state, action) => {
      const { challengeId, analysis } = action.payload
      state.challengeAnalyses[challengeId] = analysis
      // Clear any error when we successfully set the analysis
      state.challengeAnalysesError[challengeId] = null
    },
    setChallengeAnalysisError: (state, action) => {
      const { challengeId, error } = action.payload
      state.challengeAnalysesError[challengeId] = error
    },
    setSocketListening: (state, action) => {
      state.socketListening = action.payload
    },
    setChallengeCreating: (state, action) => {
      state.challengeCreating = action.payload
    },
    updateActiveChallengesPage: (state, action) => {
      state.activeChallengesPage = action.payload
    },
    resetActiveChallenges: state => {
      state.activeChallenges = []
      state.activeChallengesPage = 1
      state.activeChallengesHasMore = true
    },
    resetAllQuickClashState: () => initialState,
  },
  extraReducers: builder => {
    builder
      // Fetch active challenges
      .addCase(fetchActiveChallenges.pending, state => {
        state.activeChallengesLoading = true
        state.activeChallengesError = null
      })
      .addCase(fetchActiveChallenges.fulfilled, (state, action) => {
        const { challenges, pagination } = action.payload

        if (pagination.page === 1) {
          state.activeChallenges = challenges
        } else {
          // Add new challenges, avoiding duplicates
          const existingIds = new Set(state.activeChallenges.map(c => c._id))
          const newChallenges = challenges.filter(c => !existingIds.has(c._id))
          state.activeChallenges = [...state.activeChallenges, ...newChallenges]
        }

        state.activeChallengesPage = pagination.page
        state.activeChallengesHasMore = pagination.hasMore
        state.activeChallengesTotal = pagination.total
        state.activeChallengesLoading = false
      })
      .addCase(fetchActiveChallenges.rejected, (state, action) => {
        state.activeChallengesLoading = false
        state.activeChallengesError = action.payload
      })

      // Fetch completed challenges
      .addCase(fetchCompletedChallenges.pending, state => {
        state.completedChallengesLoading = true
        state.completedChallengesError = null
      })
      .addCase(fetchCompletedChallenges.fulfilled, (state, action) => {
        const { challenges, hasMore, total } = action.payload
        if (state.completedChallengesPage === 1) {
          state.completedChallenges = challenges
        } else {
          // Add new challenges, avoiding duplicates
          const existingIds = new Set(state.completedChallenges.map(c => c._id))
          const newChallenges = challenges.filter(c => !existingIds.has(c._id))
          // FIXED: Append new challenges to existing ones instead of replacing
          state.completedChallenges = [
            ...state.completedChallenges,
            ...newChallenges,
          ]
        }

        // Preserve existing analyses when loading more challenges
        state.completedChallengesHasMore = hasMore
        state.completedChallengesTotal = total
        state.completedChallengesLoading = false
      })
      .addCase(fetchCompletedChallenges.rejected, (state, action) => {
        state.completedChallengesLoading = false
        state.completedChallengesError = action.payload
      })

      .addCase(fetchUserTrophies.pending, state => {
        state.userTrophiesLoading = true
        state.userTrophiesError = null
      })
      .addCase(fetchUserTrophies.fulfilled, (state, action) => {
        state.userTrophies = action.payload
        state.userTrophiesLoading = false
      })
      .addCase(fetchUserTrophies.rejected, (state, action) => {
        state.userTrophiesLoading = false
        state.userTrophiesError = action.payload
      })

      .addCase(fetchTrophyHistory.pending, state => {
        state.trophyHistoryLoading = true
        state.trophyHistoryError = null
      })
      .addCase(fetchTrophyHistory.fulfilled, (state, action) => {
        state.trophyHistory = action.payload
        state.trophyHistoryLoading = false
      })
      .addCase(fetchTrophyHistory.rejected, (state, action) => {
        state.trophyHistoryLoading = false
        state.trophyHistoryError = action.payload
      })

      // Fetch user stats
      .addCase(fetchUserStats.pending, state => {
        state.userStatsLoading = true
        state.userStatsError = null
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStats = action.payload
        // Copy the trophy count from userStats to userTrophies if it exists
        if (action.payload.trophies !== undefined) {
          state.userTrophies = action.payload.trophies
        }
        state.userStatsLoading = false
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.userStatsLoading = false
        state.userStatsError = action.payload
      })

      // Create challenge
      .addCase(createNewChallenge.pending, state => {
        state.challengeCreating = true
        state.challengeCreationError = null
      })
      .addCase(createNewChallenge.fulfilled, (state, action) => {
        state.activeChallenges = [action.payload, ...state.activeChallenges]
        state.challengeCreating = false
      })
      .addCase(createNewChallenge.rejected, (state, action) => {
        state.challengeCreating = false
        state.challengeCreationError = action.payload
      })

      // Accept challenge
      .addCase(acceptChallenge.fulfilled, (state, action) => {
        const index = state.activeChallenges.findIndex(
          c => c._id === action.payload._id,
        )
        if (index !== -1) {
          state.activeChallenges[index] = action.payload
        }
      })

      // Reject challenge
      .addCase(rejectChallenge.fulfilled, (state, action) => {
        const index = state.activeChallenges.findIndex(
          c => c._id === action.payload._id,
        )
        if (index !== -1) {
          state.activeChallenges[index] = action.payload
        }
      })

      // Start session
      .addCase(startChallengeSession.pending, state => {
        state.sessionLoading = true
        state.sessionError = null
      })
      .addCase(startChallengeSession.fulfilled, (state, action) => {
        state.currentSession = action.payload
        state.sessionLoading = false
      })
      .addCase(startChallengeSession.rejected, (state, action) => {
        state.sessionLoading = false
        state.sessionError = action.payload
      })

      // Get challenge analysis
      .addCase(getChallengeAnalysis.pending, (state, action) => {
        const challengeId = action.meta.arg
        state.challengeAnalysesLoading[challengeId] = true
        state.challengeAnalysesError[challengeId] = null
      })
      .addCase(getChallengeAnalysis.fulfilled, (state, action) => {
        const { challengeId, analysis } = action.payload
        state.challengeAnalyses[challengeId] = analysis
        state.challengeAnalysesLoading[challengeId] = false
        state.challengeAnalysesError[challengeId] = null
      })
      .addCase(getChallengeAnalysis.rejected, (state, action) => {
        const challengeId = action.meta.arg
        state.challengeAnalysesLoading[challengeId] = false
        state.challengeAnalysesError[challengeId] = action.payload
      })
  },
})

export const {
  setCurrentChallenge,
  clearCurrentSession,
  clearActiveChallenges,
  updateCompletedChallengesPage,
  resetCompletedChallenges,
  setChallengeAnalysisLoading,
  setChallengeAnalysis,
  setChallengeAnalysisError,
  setSocketListening,
  setChallengeCreating,
  updateActiveChallengesPage,
  resetActiveChallenges,
  resetAllQuickClashState,
} = quickClashSlice.actions

export default quickClashSlice.reducer
