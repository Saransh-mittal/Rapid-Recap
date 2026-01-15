// redux/quickClashTeamBattleSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Helper to check if user is a session player (no JWT auth)
const isSessionPlayer = () => {
  if (typeof window === 'undefined') return false
  const sessionId = localStorage.getItem('playSessionId')
  // Check if we have a session ID but no user in Redux (we can't access Redux state here directly)
  // The axios interceptor will add X-Session-Id header if sessionId exists
  return !!sessionId
}

// Helper to get the appropriate API base path
const getApiPath = (authPath, sessionPath) => {
  return isSessionPlayer() ? sessionPath : authPath
}

// Async thunks
export const fetchTeamBattles = createAsyncThunk(
  'quickClashTeamBattle/fetchTeamBattles',
  async (
    { status = 'active', page = 1, limit = 10 } = {},
    { rejectWithValue },
  ) => {
    try {
      // Use session API path for session players
      const endpoint = getApiPath('/api/quickClash/team-battles', '/api/play/team-battles')
      const response = await axios.get(endpoint, {
        params: { status, page, limit },
      })

      return {
        battles: response.data.battles || [],
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
        error.response?.data?.message || 'Failed to fetch team battles',
      )
    }
  },
)

export const fetchTeamBattleDetails = createAsyncThunk(
  'quickClashTeamBattle/fetchTeamBattleDetails',
  async (battleId, { rejectWithValue, getState }) => {
    const MAX_RETRIES = 5
    const RETRY_DELAY = 1000 // 1 second between retries

    const attemptFetch = async (retryCount = 0) => {
      try {
        // Check if user is authenticated via Redux OR localStorage token
        // This handles cases where Redux state hasn't loaded yet but user has a token
        const { auth } = getState()
        const hasUser = !!auth?.user
        const hasToken = !!localStorage.getItem('token')
        const hasSessionId = !!localStorage.getItem('playSessionId')

        // User is authenticated if they have a token OR are in Redux state
        // Only use session endpoint if they have a session ID AND no token
        const isAuthenticatedUser = hasUser || hasToken
        const isSessionPlayer = hasSessionId && !hasToken

        // Use session endpoint only if explicitly a session player
        const endpoint = isSessionPlayer
          ? `/api/play/battle/${battleId}`
          : `/api/quickClash/team-battle/${battleId}`

        const response = await axios.get(endpoint)
        return response.data.battle
      } catch (error) {
        // If battle not found (404) and we haven't exhausted retries, retry after delay
        // This handles the race condition where transaction may not have committed yet
        if (error.response?.status === 404 && retryCount < MAX_RETRIES) {
          console.log(`Battle ${battleId} not found, retrying in ${RETRY_DELAY}ms (attempt ${retryCount + 1}/${MAX_RETRIES})...`)
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
          return attemptFetch(retryCount + 1)
        }
        throw error
      }
    }

    try {
      return await attemptFetch()
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch team battle details',
      )
    }
  },
)

export const joinTeamMatchmaking = createAsyncThunk(
  'quickClashGlobalMatchmaking/joinTeam',
  async ({ teamId, teamName }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/quickClash/team/${teamId}/matchmaking/join`,
      )
      return { ...response.data, teamId, teamName }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.reason ||
          error.response?.data?.message ||
          'Failed to join team matchmaking',
      )
    }
  },
)

export const leaveTeamMatchmaking = createAsyncThunk(
  'quickClashTeamBattle/leaveTeamMatchmaking',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/quickClash/team/${teamId}/matchmaking/leave`,
      )
      return response.data.success
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to leave team matchmaking',
      )
    }
  },
)

export const getTeamMatchmakingStatus = createAsyncThunk(
  'quickClashTeamBattle/getTeamMatchmakingStatus',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/quickClash/team/${teamId}/matchmaking/status`,
      )
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get matchmaking status',
      )
    }
  },
)

export const selectBattleCategory = createAsyncThunk(
  'quickClashTeamBattle/selectBattleCategory',
  async ({ battleId, category }, { rejectWithValue, getState }) => {
    try {
      // Check if user is authenticated via Redux OR localStorage token
      const { auth } = getState()
      const hasUser = !!auth?.user
      const hasToken = !!localStorage.getItem('token')
      const hasSessionId = !!localStorage.getItem('playSessionId')
      const isSessionPlayer = hasSessionId && !hasToken

      const endpoint = isSessionPlayer
        ? `/api/play/battle/${battleId}/select-category`
        : `/api/quickClash/team-battle/${battleId}/select-category`

      const response = await axios.post(endpoint, { category })
      return {
        battle: response.data.battle,
        category,
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to select category',
      )
    }
  },
)

export const beginBattleChallenge = createAsyncThunk(
  'quickClashTeamBattle/beginBattleChallenge',
  async ({ battleId }, { rejectWithValue, getState }) => {
    try {
      // Check if user is authenticated via Redux OR localStorage token
      const { auth } = getState()
      const hasUser = !!auth?.user
      const hasToken = !!localStorage.getItem('token')
      const hasSessionId = !!localStorage.getItem('playSessionId')
      const isSessionPlayer = hasSessionId && !hasToken

      const endpoint = isSessionPlayer
        ? `/api/play/battle/${battleId}/begin-challenge`
        : `/api/quickClash/team-battle/${battleId}/begin-challenge`

      const response = await axios.post(endpoint)
      return {
        battle: response.data.battle,
        sessionInfo: response.data.sessionInfo,
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to start challenge',
      )
    }
  },
)

export const deselectBattleCategory = createAsyncThunk(
  'quickClashTeamBattle/deselectBattleCategory',
  async ({ battleId }, { rejectWithValue, getState }) => {
    try {
      // Check if user is authenticated via Redux OR localStorage token
      const { auth } = getState()
      const hasUser = !!auth?.user
      const hasToken = !!localStorage.getItem('token')
      const hasSessionId = !!localStorage.getItem('playSessionId')
      const isSessionPlayer = hasSessionId && !hasToken

      const endpoint = isSessionPlayer
        ? `/api/play/battle/${battleId}/deselect-category`
        : `/api/quickClash/team-battle/${battleId}/deselect-category`

      const response = await axios.post(endpoint)
      return {
        battle: response.data.battle,
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to deselect category',
      )
    }
  },
)

// Powerup Reward Thunks
export const fetchUnclaimedBattles = createAsyncThunk(
  'quickClashTeamBattle/fetchUnclaimedBattles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/quickClash/powerup/unclaimed-battles')
      return response.data.battles || []
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch unclaimed battles',
      )
    }
  },
)

export const claimPowerupReward = createAsyncThunk(
  'quickClashTeamBattle/claimPowerupReward',
  async (battleId, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/quickClash/powerup/claim-reward', {
        battleId,
      })
      return {
        battleId,
        ...response.data,
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to claim reward',
      )
    }
  },
)

export const markBattleViewed = createAsyncThunk(
  'quickClashTeamBattle/markBattleViewed',
  async (battleId, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/quickClash/powerup/mark-viewed', {
        battleId,
      })
      return {
        battleId,
        viewedAt: response.data.viewedAt,
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark battle as viewed',
      )
    }
  },
)

// Slice definition
const initialState = {
  // Active team battles
  activeBattles: [],
  activeBattlesPage: 1,
  activeBattlesHasMore: true,
  activeBattlesTotal: 0,
  activeBattlesLoading: false,
  activeBattlesError: null,

  // Completed team battles
  completedBattles: [],
  completedBattlesPage: 1,
  completedBattlesHasMore: true,
  completedBattlesTotal: 0,
  completedBattlesLoading: false,
  completedBattlesError: null,

  // Current battle details
  currentBattle: null,
  battleDetailsLoading: false,
  battleDetailsError: null,

  // Category operations loading states
  categoryOperationLoading: false,
  categoryOperationType: null, // 'selecting', 'deselecting', 'beginning'
  categoryOperationError: null,
  selectedCategoryForOperation: null,

  // Keep existing states
  categorySelectionLoading: false,
  categorySelectionError: null,
  sessionInfo: null,

  // Team matchmaking
  inMatchmaking: false,
  matchmakingEntry: null,
  matchmakingLoading: false,
  matchmakingError: null,

  matchmakingStep: null,

  // Battle ready
  battleReady: null,

  // Unclaimed battle rewards
  unclaimedBattles: [],
  unclaimedBattlesLoading: false,
  unclaimedBattlesError: null,
  claimingRewardLoading: false,
  claimingRewardError: null,

  // Battles in ending state (timer expired, waiting for completion)
  battlesEnding: [], // Array of battleIds currently ending
}

const quickClashTeamBattleSlice = createSlice({
  name: 'quickClashTeamBattle',
  initialState,
  reducers: {
    resetTeamBattleState: () => initialState,
    clearCurrentBattle: state => {
      state.currentBattle = null
    },
    clearBattleError: state => {
      state.battleDetailsError = null
      state.categorySelectionError = null
    },
    setMatchmakingStep: (state, action) => {
      state.matchmakingStep = action.payload
    },
    setBattleReady: (state, action) => {
      state.battleReady = action.payload
      state.matchmakingStep = 'battleReady'
      state.inMatchmaking = false
    },
    clearBattleReady: state => {
      state.battleReady = null
      state.inMatchmaking = false
    },
    setInMatchmaking: (state, action) => {
      state.inMatchmaking = action.payload
    },
    clearCategoryOperationError: state => {
      state.categoryOperationError = null
    },
    resetCategoryOperationState: state => {
      state.categoryOperationLoading = false
      state.categoryOperationType = null
      state.categoryOperationError = null
      state.selectedCategoryForOperation = null
    },
    // Battle ending state management
    setBattleEnding: (state, action) => {
      const { battleId, isEnding } = action.payload
      if (isEnding && !state.battlesEnding.includes(battleId)) {
        state.battlesEnding.push(battleId)
      } else if (!isEnding) {
        state.battlesEnding = state.battlesEnding.filter(id => id !== battleId)
      }
    },
    clearBattleEnding: (state, action) => {
      const battleId = action.payload
      state.battlesEnding = state.battlesEnding.filter(id => id !== battleId)
    },
  },
  extraReducers: builder => {
    builder
      // Fetch active team battles
      .addCase(fetchTeamBattles.pending, (state, action) => {
        const { status = 'active' } = action.meta.arg || {}

        if (status === 'active') {
          state.activeBattlesLoading = true
          state.activeBattlesError = null
        } else if (status === 'completed') {
          state.completedBattlesLoading = true
          state.completedBattlesError = null
        }
      })
      .addCase(fetchTeamBattles.fulfilled, (state, action) => {
        const { status = 'active' } = action.meta.arg || {}
        const { battles, pagination } = action.payload

        if (status === 'active') {
          if (pagination.page === 1) {
            state.activeBattles = battles
          } else {
            // Add new battles, avoiding duplicates
            const existingIds = new Set(state.activeBattles.map(b => b._id))
            const newBattles = battles.filter(b => !existingIds.has(b._id))
            state.activeBattles = [...state.activeBattles, ...newBattles]
          }

          state.activeBattlesPage = pagination.page
          state.activeBattlesHasMore = pagination.hasMore
          state.activeBattlesTotal = pagination.total
          state.activeBattlesLoading = false
        } else if (status === 'completed') {
          if (pagination.page === 1) {
            state.completedBattles = battles
          } else {
            // Add new battles, avoiding duplicates
            const existingIds = new Set(state.completedBattles.map(b => b._id))
            const newBattles = battles.filter(b => !existingIds.has(b._id))
            state.completedBattles = [...state.completedBattles, ...newBattles]
          }

          state.completedBattlesPage = pagination.page
          state.completedBattlesHasMore = pagination.hasMore
          state.completedBattlesTotal = pagination.total
          state.completedBattlesLoading = false
        }
      })
      .addCase(fetchTeamBattles.rejected, (state, action) => {
        const { status = 'active' } = action.meta.arg || {}

        if (status === 'active') {
          state.activeBattlesLoading = false
          state.activeBattlesError = action.payload
        } else if (status === 'completed') {
          state.completedBattlesLoading = false
          state.completedBattlesError = action.payload
        }
      })

      // Fetch team battle details
      .addCase(fetchTeamBattleDetails.pending, state => {
        state.battleDetailsLoading = true
        state.battleDetailsError = null
      })
      .addCase(fetchTeamBattleDetails.fulfilled, (state, action) => {
        state.currentBattle = action.payload
        state.battleDetailsLoading = false
      })
      .addCase(fetchTeamBattleDetails.rejected, (state, action) => {
        state.battleDetailsLoading = false
        state.battleDetailsError = action.payload
      })

      // Select battle category
      .addCase(selectBattleCategory.pending, state => {
        state.categorySelectionLoading = true
        state.categorySelectionError = null
      })
      .addCase(selectBattleCategory.fulfilled, (state, action) => {
        state.currentBattle = action.payload.battle
        state.sessionInfo = action.payload.sessionInfo
        state.categorySelectionLoading = false
      })
      .addCase(selectBattleCategory.rejected, (state, action) => {
        state.categorySelectionLoading = false
        state.categorySelectionError = action.payload
      })

      // Add after beginBattleChallenge cases
      .addCase(deselectBattleCategory.pending, state => {
        state.categoryOperationLoading = true
        state.categoryOperationType = 'deselecting'
        state.categoryOperationError = null
      })
      .addCase(deselectBattleCategory.fulfilled, (state, action) => {
        state.currentBattle = action.payload.battle
        state.categoryOperationLoading = false
        state.categoryOperationType = null
      })
      .addCase(deselectBattleCategory.rejected, (state, action) => {
        state.categoryOperationLoading = false
        state.categoryOperationType = null
        state.categoryOperationError = action.payload
      })

      // Join team matchmaking
      .addCase(joinTeamMatchmaking.pending, state => {
        state.matchmakingLoading = true
        state.matchmakingError = null
        state.inMatchmaking = true
      })
      .addCase(joinTeamMatchmaking.fulfilled, (state, action) => {
        state.matchmakingEntry = action.payload
        state.matchmakingLoading = false
      })
      .addCase(joinTeamMatchmaking.rejected, (state, action) => {
        state.matchmakingLoading = false
        state.matchmakingError = action.payload
        state.inMatchmaking = false
      })

      // Leave team matchmaking
      .addCase(leaveTeamMatchmaking.pending, state => {
        state.matchmakingLoading = true
      })
      .addCase(leaveTeamMatchmaking.fulfilled, state => {
        state.inMatchmaking = false
        state.matchmakingEntry = null
        state.matchmakingLoading = false
        state.matchmakingStep = null
      })
      .addCase(leaveTeamMatchmaking.rejected, (state, action) => {
        state.matchmakingLoading = false
        state.matchmakingError = action.payload
      })

      // Get team matchmaking status
      .addCase(getTeamMatchmakingStatus.pending, state => {
        state.matchmakingLoading = true
      })
      .addCase(getTeamMatchmakingStatus.fulfilled, (state, action) => {
        state.inMatchmaking = action.payload.inMatchmaking
        state.matchmakingEntry = action.payload.matchmaking
        state.matchmakingLoading = false
      })
      .addCase(getTeamMatchmakingStatus.rejected, (state, action) => {
        state.matchmakingLoading = false
        state.matchmakingError = action.payload
      })

      // Fetch unclaimed battles for rewards
      .addCase(fetchUnclaimedBattles.pending, state => {
        state.unclaimedBattlesLoading = true
        state.unclaimedBattlesError = null
      })
      .addCase(fetchUnclaimedBattles.fulfilled, (state, action) => {
        state.unclaimedBattles = action.payload
        state.unclaimedBattlesLoading = false
      })
      .addCase(fetchUnclaimedBattles.rejected, (state, action) => {
        state.unclaimedBattlesLoading = false
        state.unclaimedBattlesError = action.payload
      })

      // Claim powerup reward
      .addCase(claimPowerupReward.pending, state => {
        state.claimingRewardLoading = true
        state.claimingRewardError = null
      })
      .addCase(claimPowerupReward.fulfilled, (state, action) => {
        state.claimingRewardLoading = false
        // Remove claimed battle from unclaimed list
        state.unclaimedBattles = state.unclaimedBattles.filter(
          b => b._id !== action.payload.battleId
        )
      })
      .addCase(claimPowerupReward.rejected, (state, action) => {
        state.claimingRewardLoading = false
        state.claimingRewardError = action.payload
      })

      // Mark battle as viewed
      .addCase(markBattleViewed.fulfilled, (state, action) => {
        const battle = state.unclaimedBattles.find(
          b => b._id === action.payload.battleId
        )
        if (battle) {
          battle.isViewed = true
        }
      })
  },
})

export const {
  resetTeamBattleState,
  clearCurrentBattle,
  clearBattleError,
  setMatchmakingStep,
  setBattleReady,
  clearBattleReady,
  setInMatchmaking,
  clearCategoryOperationError,
  resetCategoryOperationState,
  setBattleEnding,
  clearBattleEnding,
} = quickClashTeamBattleSlice.actions

export default quickClashTeamBattleSlice.reducer

