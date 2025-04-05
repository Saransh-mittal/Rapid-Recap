// redux/quickClashTeamBattleSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Async thunks
export const fetchTeamBattles = createAsyncThunk(
  'quickClashTeamBattle/fetchTeamBattles',
  async (
    { status = 'active', page = 1, limit = 10 } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.get('/api/quickClash/team-battles', {
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
  async (battleId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/quickClash/team-battle/${battleId}`,
      )
      return response.data.battle
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch team battle details',
      )
    }
  },
)

export const selectBattleCategory = createAsyncThunk(
  'quickClashTeamBattle/selectBattleCategory',
  async ({ battleId, category }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/quickClash/team-battle/${battleId}/select-category`,
        { category },
      )
      return {
        battle: response.data.battle,
        sessionInfo: response.data.sessionInfo,
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to select category',
      )
    }
  },
)

export const joinTeamMatchmaking = createAsyncThunk(
  'quickClashTeamBattle/joinTeamMatchmaking',
  async ({ teamId, allowBots = true }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/quickClash/team/${teamId}/matchmaking/join`,
        { allowBots },
      )
      return response.data.matchmaking
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to join team matchmaking',
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

  // Category selection
  categorySelectionLoading: false,
  categorySelectionError: null,
  sessionInfo: null,

  // Team matchmaking
  inMatchmaking: false,
  matchmakingEntry: null,
  matchmakingLoading: false,
  matchmakingError: null,

  // Matchmaking progress
  matchmakingProgress: 0,
  matchmakingStep: null,

  // Battle ready
  battleReady: null,
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
    setMatchmakingProgress: (state, action) => {
      state.matchmakingProgress = action.payload
    },
    setMatchmakingStep: (state, action) => {
      state.matchmakingStep = action.payload
    },
    setBattleReady: (state, action) => {
      state.battleReady = action.payload
      state.matchmakingProgress = 100
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
        state.matchmakingProgress = 0
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
  },
})

export const {
  resetTeamBattleState,
  clearCurrentBattle,
  clearBattleError,
  setMatchmakingProgress,
  setMatchmakingStep,
  setBattleReady,
  clearBattleReady,
  setInMatchmaking,
} = quickClashTeamBattleSlice.actions

export default quickClashTeamBattleSlice.reducer
