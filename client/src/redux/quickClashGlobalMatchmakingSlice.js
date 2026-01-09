// redux/quickClashGlobalMatchmakingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Async thunks for global matchmaking actions
export const joinGlobalMatchmaking = createAsyncThunk(
  'quickClashGlobalMatchmaking/join',
  async (_, { rejectWithValue }) => {
    try {
      // Check if user is a session player
      const sessionId = localStorage.getItem('playSessionId')
      const headers = sessionId ? { 'X-Session-Id': sessionId } : {}

      const response = await axios.post(
        '/api/quickClash/global-matchmaking/join',
        {},
        { headers }
      )
      return response.data
    } catch (error) {
      // Return full error object so hook can check error.code
      const errorData = error.response?.data || {}
      return rejectWithValue({
        code: errorData.code,
        message: errorData.message || errorData.reason || 'Failed to join global matchmaking',
        reason: errorData.reason,
      })
    }
  },
)

export const leaveGlobalMatchmaking = createAsyncThunk(
  'quickClashGlobalMatchmaking/leave',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        '/api/quickClash/global-matchmaking/leave',
      )
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to leave global matchmaking',
      )
    }
  },
)

export const getGlobalMatchmakingStatus = createAsyncThunk(
  'quickClashGlobalMatchmaking/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      // Check if user is a session player (has sessionId in localStorage)
      const sessionId = localStorage.getItem('playSessionId')

      if (sessionId) {
        // Session player - use play API endpoint with session header
        const response = await axios.get('/api/play/matchmaking/status', {
          headers: { 'X-Session-Id': sessionId }
        })
        return response.data
      } else {
        // Authenticated user - use standard endpoint
        const response = await axios.get(
          '/api/quickClash/global-matchmaking/status',
        )
        return response.data
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get matchmaking status',
      )
    }
  },
)

export const joinTeamMatchmaking = createAsyncThunk(
  'quickClashGlobalMatchmaking/joinTeam',
  async ({ teamId, teamName }, { rejectWithValue }) => {
    try {
      // Check if user is a session player
      const sessionId = localStorage.getItem('playSessionId')
      const headers = sessionId ? { 'X-Session-Id': sessionId } : {}

      const response = await axios.post(
        `/api/quickClash/team/${teamId}/matchmaking/join`,
        {},
        { headers }
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
  'quickClashGlobalMatchmaking/leaveTeam',
  async (teamId, { rejectWithValue }) => {
    try {
      // Check if user is a session player
      const sessionId = localStorage.getItem('playSessionId')
      const headers = sessionId ? { 'X-Session-Id': sessionId } : {}

      const response = await axios.post(
        `/api/quickClash/team/${teamId}/matchmaking/leave`,
        {},
        { headers }
      )

      // Handle "success: false" response (team not in matchmaking - e.g. match was found)
      if (response.data.success === false) {
        return rejectWithValue({
          message: response.data.message,
          code: 'NOT_IN_MATCHMAKING',
          isGraceful: true, // Flag to indicate this isn't a fatal error
        })
      }

      return { ...response.data, teamId }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to leave team matchmaking',
        code: error.response?.data?.code || 'UNKNOWN_ERROR',
        status: error.response?.status,
      })
    }
  },
)

export const getTeamMatchmakingStatus = createAsyncThunk(
  'quickClashGlobalMatchmaking/getTeamStatus',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/quickClash/team/${teamId}/matchmaking/status`,
      )
      return { ...response.data, teamId }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to get team matchmaking status',
      )
    }
  },
)

// Initial state
const initialState = {
  // General matchmaking state
  inMatchmaking: false,
  matchmakingType: null, // 'solo' or 'team'
  selectedTeamId: null,
  teamName: null,
  step: null,
  matchmakingTime: 0,

  // Battle info
  battleReady: null,
  // Battle creation state
  battleCreationStatus: null, // 'creating', 'failed', null
  battleCreationError: null,

  // Loading and error states
  loading: false,
  error: null,

  // Additional state
  teamMembers: [],

  // Socket connection status
  socketConnected: false,

  joinType: null, // 'regular', 'solo', or 'sourceTeam'
  originalTeam: null, // Source team details if user was part of a source team

  // Status updates for UI (moved from local state)
  statusUpdates: [],
  shouldRefetchTeams: false,

  // UI notification state
  showToast: null, // { type: 'success'|'error'|'info'|'warning', title: string, description: string }

  // Status check triggers
  shouldCheckStatus: false, // Flag to trigger status check in hook
}

const quickClashGlobalMatchmakingSlice = createSlice({
  name: 'quickClashGlobalMatchmaking',
  initialState,
  reducers: {
    resetGlobalMatchmakingState: (state, action) => {
      return { ...initialState, socketConnected: state.socketConnected }
    },
    setMatchmakingStep: (state, action) => {
      state.step = action.payload
    },
    setTeamName: (state, action) => {
      state.teamName = action.payload
    },

    // Update time
    incrementMatchmakingTime: state => {
      state.matchmakingTime += 1
    },
    resetMatchmakingTime: state => {
      state.matchmakingTime = 0
    },

    // Battle ready state
    setBattleReady: (state, action) => {
      console.log(
        'Global Matchmaking: Setting battle ready with payload:',
        action.payload,
      )
      state.battleReady = action.payload
      state.step = 'battleReady'
      // IMPORTANT: Clear any battle creation status when battle is ready
      state.battleCreationStatus = null
      state.battleCreationError = null
      console.log('Global Matchmaking: Updated state:', {
        battleReady: state.battleReady,
        step: state.step,
      })
    },

    setBattleCreationStatus: (state, action) => {
      state.battleCreationStatus = action.payload

      // Set step based on status
      if (action.payload === 'creating') {
        state.step = 'creating_battle'
      } else if (action.payload === 'failed') {
        state.step = 'ready'
      }
    },

    setBattleCreationError: (state, action) => {
      state.battleCreationError = action.payload
      state.battleCreationStatus = 'failed'
      state.step = 'ready'
    },

    clearBattleCreationError: state => {
      state.battleCreationError = null
      state.battleCreationStatus = null
    },

    clearBattleReady: state => {
      state.battleReady = null
      state.inMatchmaking = false
    },

    // User/team related actions
    setSelectedTeamId: (state, action) => {
      state.selectedTeamId = action.payload
    },

    setJoinType: (state, action) => {
      state.joinType = action.payload
    },

    setOriginalTeam: (state, action) => {
      state.originalTeam = action.payload
    },

    setTeamMembers: (state, action) => {
      state.teamMembers = action.payload
    },

    // Socket connection
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload
    },

    // Status updates management
    addStatusUpdate: (state, action) => {
      const { message, time } = action.payload
      state.statusUpdates = [
        {
          id: Date.now(),
          message,
          time: time || 0,
        },
        ...state.statusUpdates.slice(0, 2), // Keep only 3 updates
      ]
    },

    clearStatusUpdates: state => {
      state.statusUpdates = []
    },

    // Team refetch flag
    setShouldRefetchTeams: (state, action) => {
      state.shouldRefetchTeams = action.payload
    },

    // Status check triggers
    setShouldCheckStatus: (state, action) => {
      state.shouldCheckStatus = action.payload
    },

    // Toast notification management
    setToastNotification: (state, action) => {
      state.showToast = action.payload
    },

    clearToastNotification: state => {
      state.showToast = null
    },

    // Manual state updates (for socket events)
    updateMatchmakingState: (state, action) => {
      const {
        inMatchmaking,
        step,
        matchmakingType,
        battleReady,
        teamName,
        joinType,
        originalTeam,
        selectedTeamId,
      } = action.payload
      if (inMatchmaking !== undefined) state.inMatchmaking = inMatchmaking
      if (step !== undefined) state.step = step
      if (matchmakingType !== undefined) state.matchmakingType = matchmakingType
      if (teamName !== undefined) state.teamName = teamName
      if (joinType !== undefined) state.joinType = joinType
      if (originalTeam !== undefined) state.originalTeam = originalTeam
      if (selectedTeamId !== undefined) state.selectedTeamId = selectedTeamId

      if (step === 'battleReady') {
        if (battleReady) {
          state.battleReady = battleReady
        }
      }
    },

    // Socket event handlers
    handleTeamLeftMatchmaking: (state, action) => {
      // Reset matchmaking state
      state.inMatchmaking = false
      state.matchmakingType = null
      state.step = null
      state.matchmakingTime = 0
      state.battleReady = null
      state.statusUpdates = []
    },

    handleTeamReturnedToMatchmaking: (state, action) => {
      const { teamId, teamName, startTime } = action.payload || {}

      // Re-enable matchmaking state since team is back in queue
      state.inMatchmaking = true
      state.step = 'searching'
      state.battleCreationStatus = null
      state.battleCreationError = null

      // Update team info if provided
      if (teamId) {
        state.selectedTeamId = teamId
      }
      if (teamName) {
        state.teamName = teamName
      }

      state.shouldRefetchTeams = true

      // Add status update
      const currentTime = startTime
        ? Math.floor((Date.now() - startTime) / 1000)
        : 0
      state.statusUpdates = [
        {
          id: Date.now(),
          message: 'Team returned to matchmaking',
          time: currentTime,
        },
        ...state.statusUpdates.slice(0, 2),
      ]
    },

    handleTeamJoinedMatchmaking: (state, action) => {
      const { teamId, teamName, startTime, memberCount, teamMembers, avgTrophies } = action.payload || {}

      // Set core matchmaking state - this is what the button reads
      state.inMatchmaking = true
      state.matchmakingType = 'team'
      state.step = 'searching'

      // Set team details
      if (teamId) {
        state.selectedTeamId = teamId
      }
      if (teamName) {
        state.teamName = teamName
      }

      // Trigger refetch and status check
      state.shouldRefetchTeams = true
      state.shouldCheckStatus = true

      // Add status update
      const currentTime = startTime
        ? Math.floor((Date.now() - startTime) / 1000)
        : 0
      state.statusUpdates = [
        {
          id: Date.now(),
          message: 'Team joined matchmaking successfully',
          time: currentTime,
        },
        ...state.statusUpdates.slice(0, 2),
      ]
    },

    handleBattleCreationCleanup: (state, action) => {
      const { message, startTime } = action.payload

      // Reset matchmaking state when battle creation fails completely
      state.inMatchmaking = false
      state.matchmakingType = null
      state.battleCreationStatus = 'failed'
      state.battleCreationError =
        message || 'Battle creation failed. Please try again.'
      state.step = null
      state.battleReady = null

      // Set toast notification
      state.showToast = {
        type: 'error',
        title: 'Battle Creation Failed',
        description:
          'There was an issue creating your battle. Please try joining matchmaking again.',
      }

      // Add status update
      const currentTime = startTime
        ? Math.floor((Date.now() - startTime) / 1000)
        : 0
      state.statusUpdates = [
        {
          id: Date.now(),
          message: 'Battle creation failed. You can try again.',
          time: currentTime,
        },
        ...state.statusUpdates.slice(0, 2),
      ]

      // Keep selectedTeamId so user can retry with same team
    },

    clearBattleCreationState: state => {
      state.battleCreationStatus = null
      state.battleCreationError = null
      state.inMatchmaking = false
      state.step = null
      state.battleReady = null
    },
  },
  extraReducers: builder => {
    builder
      // Join global matchmaking
      .addCase(joinGlobalMatchmaking.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(joinGlobalMatchmaking.fulfilled, state => {
        state.loading = false
        state.inMatchmaking = true
        state.matchmakingType = 'solo'
        state.step = 'searching'
        state.matchmakingTime = 0
      })
      .addCase(joinGlobalMatchmaking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Leave global matchmaking
      .addCase(leaveGlobalMatchmaking.pending, state => {
        state.loading = true
      })
      .addCase(leaveGlobalMatchmaking.fulfilled, state => {
        state.loading = false
        state.inMatchmaking = false
        state.step = null
        state.matchmakingTime = 0
      })
      .addCase(leaveGlobalMatchmaking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Get global matchmaking status
      .addCase(getGlobalMatchmakingStatus.pending, state => {
        state.loading = true
      })
      .addCase(getGlobalMatchmakingStatus.fulfilled, (state, action) => {
        state.loading = false
        state.inMatchmaking = action.payload.inMatchmaking
        if (action.payload.matchmaking) {
          state.matchmakingType = 'solo'
          state.step = action.payload.step || 'searching'
        }
      })
      .addCase(getGlobalMatchmakingStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Join team matchmaking
      .addCase(joinTeamMatchmaking.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(joinTeamMatchmaking.fulfilled, (state, action) => {
        state.loading = false
        state.inMatchmaking = true
        state.matchmakingType = 'team'
        state.selectedTeamId = action.payload.teamId
        // If teamName is provided in the action payload, set it
        if (action.payload.teamName) {
          state.teamName = action.payload.teamName
        }
        state.step = 'searching'
        state.matchmakingTime = 0
      })
      .addCase(joinTeamMatchmaking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Leave team matchmaking
      .addCase(leaveTeamMatchmaking.pending, state => {
        state.loading = true
      })
      .addCase(leaveTeamMatchmaking.fulfilled, state => {
        state.loading = false
        state.inMatchmaking = false
        state.step = null
        state.matchmakingTime = 0
        // Keep selectedTeamId to maintain the selection in the UI
      })
      .addCase(leaveTeamMatchmaking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Get team matchmaking status
      .addCase(getTeamMatchmakingStatus.pending, state => {
        state.loading = true
      })
      .addCase(getTeamMatchmakingStatus.fulfilled, (state, action) => {
        state.loading = false
        state.inMatchmaking = action.payload.inMatchmaking
        if (action.payload.inMatchmaking) {
          state.matchmakingType = 'team'
          state.selectedTeamId = action.payload.teamId
          state.step = action.payload.step || 'searching'
        }
      })
      .addCase(getTeamMatchmakingStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const {
  resetGlobalMatchmakingState,
  setMatchmakingStep,
  setTeamName,
  setJoinType,
  setOriginalTeam,
  incrementMatchmakingTime,
  resetMatchmakingTime,
  setBattleReady,
  clearBattleReady,
  setSelectedTeamId,
  setTeamMembers,
  setSocketConnected,
  updateMatchmakingState,
  setBattleCreationStatus,
  setBattleCreationError,
  clearBattleCreationError,
  handleBattleCreationCleanup,
  clearBattleCreationState,
  addStatusUpdate,
  clearStatusUpdates,
  setShouldRefetchTeams,
  setShouldCheckStatus,
  setToastNotification,
  clearToastNotification,
  handleTeamLeftMatchmaking,
  handleTeamReturnedToMatchmaking,
  handleTeamJoinedMatchmaking,
} = quickClashGlobalMatchmakingSlice.actions

export default quickClashGlobalMatchmakingSlice.reducer
