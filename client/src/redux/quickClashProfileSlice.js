// redux/quickClashProfileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Async thunks for fetching profile data
export const fetchQuickClashProfile = createAsyncThunk(
  'quickClashProfile/fetchProfile',
  async ({ userId } = {}, { rejectWithValue }) => {
    try {
      const endpoint = userId
        ? `/api/quickClash/profile/${userId}`
        : '/api/quickClash/profile'

      const response = await axios.get(endpoint)
      return {
        userId: userId || 'current',
        profile: response.data.profile,
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch Quick Clash profile',
      )
    }
  },
)

export const fetchQuickClashAchievements = createAsyncThunk(
  'quickClashProfile/fetchAchievements',
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/quickClash/profile/${userId}/achievements`,
      )
      return {
        userId,
        achievements: response.data.achievements,
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch achievements',
      )
    }
  },
)

export const fetchQuickClashRecentMatches = createAsyncThunk(
  'quickClashProfile/fetchRecentMatches',
  async ({ userId, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/quickClash/profile/${userId}/matches`,
        {
          params: { limit },
        },
      )
      return {
        userId,
        matches: response.data.matches,
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch recent matches',
      )
    }
  },
)

export const fetchQuickClashStatistics = createAsyncThunk(
  'quickClashProfile/fetchStatistics',
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/quickClash/profile/${userId}/statistics`,
      )
      return {
        userId,
        statistics: response.data.statistics,
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch statistics',
      )
    }
  },
)

const initialState = {
  // Cache profiles by userId (including 'current' for logged-in user)
  profiles: {},

  // Loading states
  profileLoading: {},
  achievementsLoading: {},
  matchesLoading: {},
  statisticsLoading: {},

  // Error states
  profileError: {},
  achievementsError: {},
  matchesError: {},
  statisticsError: {},

  // Separate data for detailed views
  achievements: {},
  recentMatches: {},
  detailedStatistics: {},

  // Last fetch times for cache invalidation
  lastFetch: {},
}

const quickClashProfileSlice = createSlice({
  name: 'quickClashProfile',
  initialState,
  reducers: {
    clearProfileCache: (state, action) => {
      const { userId } = action.payload
      if (userId) {
        delete state.profiles[userId]
        delete state.profileLoading[userId]
        delete state.profileError[userId]
        delete state.lastFetch[userId]
      } else {
        // Clear all cache
        state.profiles = {}
        state.profileLoading = {}
        state.profileError = {}
        state.lastFetch = {}
      }
    },

    updateProfileTrophies: (state, action) => {
      const { userId, trophies } = action.payload
      const userKey = userId || 'current'

      if (state.profiles[userKey]) {
        state.profiles[userKey].trophies.current = trophies
      }
    },

    updateProfileStats: (state, action) => {
      const { userId, stats } = action.payload
      const userKey = userId || 'current'

      if (state.profiles[userKey]) {
        state.profiles[userKey].statistics = {
          ...state.profiles[userKey].statistics,
          ...stats,
        }
      }
    },

    resetProfileState: () => initialState,
  },

  extraReducers: builder => {
    builder
      // Fetch Profile
      .addCase(fetchQuickClashProfile.pending, (state, action) => {
        const userId = action.meta.arg?.userId || 'current'
        state.profileLoading[userId] = true
        state.profileError[userId] = null
      })
      .addCase(fetchQuickClashProfile.fulfilled, (state, action) => {
        const { userId, profile } = action.payload
        const userKey = userId || 'current'

        state.profiles[userKey] = profile
        state.profileLoading[userKey] = false
        state.profileError[userKey] = null
        state.lastFetch[userKey] = Date.now()
      })
      .addCase(fetchQuickClashProfile.rejected, (state, action) => {
        const userId = action.meta.arg?.userId || 'current'
        state.profileLoading[userId] = false
        state.profileError[userId] = action.payload
      })

      // Fetch Achievements
      .addCase(fetchQuickClashAchievements.pending, (state, action) => {
        const { userId } = action.meta.arg
        state.achievementsLoading[userId] = true
        state.achievementsError[userId] = null
      })
      .addCase(fetchQuickClashAchievements.fulfilled, (state, action) => {
        const { userId, achievements } = action.payload
        state.achievements[userId] = achievements
        state.achievementsLoading[userId] = false
        state.achievementsError[userId] = null
      })
      .addCase(fetchQuickClashAchievements.rejected, (state, action) => {
        const { userId } = action.meta.arg
        state.achievementsLoading[userId] = false
        state.achievementsError[userId] = action.payload
      })

      // Fetch Recent Matches
      .addCase(fetchQuickClashRecentMatches.pending, (state, action) => {
        const { userId } = action.meta.arg
        state.matchesLoading[userId] = true
        state.matchesError[userId] = null
      })
      .addCase(fetchQuickClashRecentMatches.fulfilled, (state, action) => {
        const { userId, matches } = action.payload
        state.recentMatches[userId] = matches
        state.matchesLoading[userId] = false
        state.matchesError[userId] = null
      })
      .addCase(fetchQuickClashRecentMatches.rejected, (state, action) => {
        const { userId } = action.meta.arg
        state.matchesLoading[userId] = false
        state.matchesError[userId] = action.payload
      })

      // Fetch Statistics
      .addCase(fetchQuickClashStatistics.pending, (state, action) => {
        const { userId } = action.meta.arg
        state.statisticsLoading[userId] = true
        state.statisticsError[userId] = null
      })
      .addCase(fetchQuickClashStatistics.fulfilled, (state, action) => {
        const { userId, statistics } = action.payload
        state.detailedStatistics[userId] = statistics
        state.statisticsLoading[userId] = false
        state.statisticsError[userId] = null
      })
      .addCase(fetchQuickClashStatistics.rejected, (state, action) => {
        const { userId } = action.meta.arg
        state.statisticsLoading[userId] = false
        state.statisticsError[userId] = action.payload
      })
  },
})

export const {
  clearProfileCache,
  updateProfileTrophies,
  updateProfileStats,
  resetProfileState,
} = quickClashProfileSlice.actions

export default quickClashProfileSlice.reducer

// Selectors
export const selectProfile = (state, userId = 'current') =>
  state.quickClashProfile.profiles[userId]

export const selectProfileLoading = (state, userId = 'current') =>
  state.quickClashProfile.profileLoading[userId] || false

export const selectProfileError = (state, userId = 'current') =>
  state.quickClashProfile.profileError[userId]

export const selectAchievements = (state, userId) =>
  state.quickClashProfile.achievements[userId]

export const selectRecentMatches = (state, userId) =>
  state.quickClashProfile.recentMatches[userId]

export const selectDetailedStatistics = (state, userId) =>
  state.quickClashProfile.detailedStatistics[userId]
