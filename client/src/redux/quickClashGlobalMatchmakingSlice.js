// redux/quickClashGlobalMatchmakingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Async thunks for global matchmaking actions
export const joinGlobalMatchmaking = createAsyncThunk(
  'quickClashGlobalMatchmaking/join',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        '/api/quickClash/global-matchmaking/join',
      )
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to join global matchmaking',
      )
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
      const response = await axios.get(
        '/api/quickClash/global-matchmaking/status',
      )
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get matchmaking status',
      )
    }
  },
)

export const joinTeamMatchmaking = createAsyncThunk(
  'quickClashGlobalMatchmaking/joinTeam',
  async ({ teamId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/quickClash/team/${teamId}/matchmaking/join`,
      )
      return { ...response.data, teamId }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to join team matchmaking',
      )
    }
  },
)

export const leaveTeamMatchmaking = createAsyncThunk(
  'quickClashGlobalMatchmaking/leaveTeam',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/quickClash/team/${teamId}/matchmaking/leave`,
      )
      return { ...response.data, teamId }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to leave team matchmaking',
      )
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

  // Progress and status
  progress: 0,
  step: null,
  matchmakingTime: 0,

  // Battle info
  battleReady: null,

  // Loading and error states
  loading: false,
  error: null,

  // Additional state
  teamMembers: [],

  // Socket connection status
  socketConnected: false,
}

const quickClashGlobalMatchmakingSlice = createSlice({
  name: 'quickClashGlobalMatchmaking',
  initialState,
  reducers: {
    resetGlobalMatchmakingState: () => initialState,

    // Update progress and step
    setMatchmakingProgress: (state, action) => {
      state.progress = action.payload
    },
    setMatchmakingStep: (state, action) => {
      state.step = action.payload
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
      state.progress = 100
      state.step = 'battleReady'

      console.log('Global Matchmaking: Updated state:', {
        battleReady: state.battleReady,
        progress: state.progress,
        step: state.step,
      })
    },
    clearBattleReady: state => {
      state.battleReady = null
      state.inMatchmaking = false
    },

    // User/team related actions
    setSelectedTeamId: (state, action) => {
      state.selectedTeamId = action.payload
    },
    setTeamMembers: (state, action) => {
      state.teamMembers = action.payload
    },

    // Socket connection
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload
    },

    // Manual state updates (for socket events)
    updateMatchmakingState: (state, action) => {
      const { inMatchmaking, progress, step, matchmakingType, battleReady } =
        action.payload
      console.log('Updating matchmaking state with:', action.payload)

      if (inMatchmaking !== undefined) state.inMatchmaking = inMatchmaking
      if (progress !== undefined) state.progress = progress
      if (step !== undefined) state.step = step
      if (matchmakingType !== undefined) state.matchmakingType = matchmakingType

      // If step is battleReady, ensure progress is 100%
      if (step === 'battleReady') {
        state.progress = 100
        // If battleReady payload is provided, update that too
        if (battleReady) {
          state.battleReady = battleReady
        }
      }
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
        state.progress = 10
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
        state.progress = 0
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
          state.progress = action.payload.progress || 0
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
        state.progress = 10
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
        state.progress = 0
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
          state.progress = action.payload.progress || 0
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
  setMatchmakingProgress,
  setMatchmakingStep,
  incrementMatchmakingTime,
  resetMatchmakingTime,
  setBattleReady,
  clearBattleReady,
  setSelectedTeamId,
  setTeamMembers,
  setSocketConnected,
  updateMatchmakingState,
} = quickClashGlobalMatchmakingSlice.actions

export default quickClashGlobalMatchmakingSlice.reducer
