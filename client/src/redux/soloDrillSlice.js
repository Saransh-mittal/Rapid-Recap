import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import soloDrillService from '../services/soloDrillService'
import { setUser } from './authSlice' // To update coins if needed

// Async Thunks

export const fetchLimits = createAsyncThunk(
  'soloDrill/fetchLimits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await soloDrillService.getLimits()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch limits')
    }
  }
)

export const purchaseExtraDrills = createAsyncThunk(
  'soloDrill/purchase',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await soloDrillService.purchaseDrills()

      // Optimistically update user coins in auth slice if possible
      const { auth } = getState()
      if (auth.user && response.data.newCoinBalance !== undefined) {
        dispatch(setUser({ ...auth.user, coins: response.data.newCoinBalance }))
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Purchase failed')
    }
  }
)

export const startDrill = createAsyncThunk(
  'soloDrill/start',
  async ({ category, loadout }, { rejectWithValue }) => {
    try {
      const response = await soloDrillService.startSession(category, loadout)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start drill')
    }
  }
)

export const fetchDrillSession = createAsyncThunk(
  'soloDrill/getSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await soloDrillService.getSession(sessionId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get session')
    }
  }
)

export const submitForge = createAsyncThunk(
  'soloDrill/submitForge',
  async ({ sessionId, sectionNumber, answerIndex, timeSpent }, { rejectWithValue }) => {
    try {
      const response = await soloDrillService.submitForgeAnswer(sessionId, {
        sectionNumber,
        answerIndex,
        timeSpent
      })
      return { ...response.data, sectionNumber }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit answer')
    }
  }
)

export const advanceForgeSection = createAsyncThunk(
  'soloDrill/advanceForge',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await soloDrillService.advanceForge(sessionId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to advance')
    }
  }
)

export const submitQuiz = createAsyncThunk(
  'soloDrill/submitQuiz',
  async ({ sessionId, responses }, { rejectWithValue }) => {
    try {
      const response = await soloDrillService.submitQuiz(sessionId, responses)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit quiz')
    }
  }
)

export const fetchStats = createAsyncThunk(
  'soloDrill/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await soloDrillService.getStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats')
    }
  }
)

export const fetchCategories = createAsyncThunk(
  'soloDrill/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await soloDrillService.getCategories()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories')
    }
  }
)

export const fetchHistory = createAsyncThunk(
  'soloDrill/fetchHistory',
  async ({ page = 1 } = {}, { rejectWithValue }) => {
    try {
      const response = await soloDrillService.getHistory(page)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history')
    }
  }
)

// ── Custom Drill Thunks ──

export const startCustomDrill = createAsyncThunk(
  'soloDrill/startCustom',
  async ({ text, loadout, imageBase64 }, { rejectWithValue }) => {
    try {
      const response = await soloDrillService.startCustomSession(text, loadout, imageBase64)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate custom drill')
    }
  }
)

export const fetchCustomLimits = createAsyncThunk(
  'soloDrill/fetchCustomLimits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await soloDrillService.getCustomLimits()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch custom limits')
    }
  }
)

export const purchaseCustomDrills = createAsyncThunk(
  'soloDrill/purchaseCustom',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await soloDrillService.purchaseCustomDrills()
      const { auth } = getState()
      if (auth.user && response.data.newCoinBalance !== undefined) {
        dispatch(setUser({ ...auth.user, coins: response.data.newCoinBalance }))
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Purchase failed')
    }
  }
)

export const fetchCustomHistory = createAsyncThunk(
  'soloDrill/fetchCustomHistory',
  async ({ page = 1 } = {}, { rejectWithValue }) => {
    try {
      const response = await soloDrillService.getCustomHistory(page)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch custom history')
    }
  }
)

const initialState = {
  // Limits
  dailyDrillsRemaining: 5,
  purchasedDrillsRemaining: 0,
  dailyUsed: 0,
  nextReset: null,

  // Session
  activeSession: null,
  sessionId: null,
  phase: 'idle', // 'idle' | 'category_select' | 'loadout' | 'forge' | 'quiz' | 'results'

  // Selection
  selectedCategory: null,
  availableCategories: [],
  loadout: [],
  loadoutHousingUsed: 0,

  // Results
  lastResult: null,
  stats: null,
  initialForgeQuestion: null,

  // History
  history: [],
  historyLoading: false,
  historyPage: 1,
  historyHasMore: true,
  historyTotal: 0,

  // UI
  modalOpen: false,
  loading: false,
  purchasing: false,
  error: null,

  // Custom Drill
  customText: '',
  customDrillLimits: null,
  isCustomDrill: false,
  processingCustom: false,
  customHistory: [],
  customHistoryLoading: false,
  customHistoryPage: 1,
  customHistoryHasMore: true,
}

const soloDrillSlice = createSlice({
  name: 'soloDrill',
  initialState,
  reducers: {
    openModal: (state) => {
      // Reset flow state when opening
      state.modalOpen = true
      state.phase = 'category_select'
      state.selectedCategory = null
      state.loadout = []
      state.loadoutHousingUsed = 0
      state.error = null
      state.initialForgeQuestion = null
    },
    closeModal: (state) => {
      state.modalOpen = false
      state.phase = 'idle'
      state.activeSession = null
      state.sessionId = null
      state.initialForgeQuestion = null
    },
    selectCategory: (state, action) => {
      state.selectedCategory = action.payload
      state.phase = 'loadout'
    },
    updateLoadout: (state, action) => {
      // Payload: entire new loadout array
      state.loadout = action.payload
      state.loadoutHousingUsed = action.payload.reduce((sum, item) => sum + item.cost, 0)
    },
    resetFlow: (state) => {
      state.phase = 'category_select'
      state.selectedCategory = null
      state.loadout = []
      state.loadoutHousingUsed = 0
      state.activeSession = null
      state.sessionId = null
      state.lastResult = null
      state.initialForgeQuestion = null
    },
    // For handling session persistence or direct navigation
    setSessionId: (state, action) => {
      state.sessionId = action.payload
    },
    markPowerupUsed: (state, action) => {
      const powerupId = action.payload
      if (state.activeSession?.activePowerups) {
        const powerup = state.activeSession.activePowerups.find(p => p.powerupId === powerupId && !p.used)
        if (powerup) {
          powerup.used = true
        }
      }
      // Also update loadout if used for initial render (legacy/fallback)
       if (state.activeSession?.loadout) {
        const powerup = state.activeSession.loadout.find(p => p.powerupId === powerupId && !p.used) // Loadout items might not have 'used' prop initially but we can add it
         if (powerup) {
          powerup.used = true
        }
      }
    },
    setQuizResult: (state, action) => {
      state.phase = 'results'
      state.lastResult = action.payload
      state.activeSession = null
      state.loading = false
    },
    setPhaseHistory: (state) => {
      state.phase = 'history'
      state.history = []
      state.historyPage = 1
      state.historyHasMore = true
    },
    // Custom Drill
    setCustomText: (state, action) => {
      state.customText = action.payload
    },
    setPhaseCustomInput: (state) => {
      state.phase = 'custom_input'
      state.isCustomDrill = true
      state.error = null
    },
    setPhaseCustomHistory: (state) => {
      state.phase = 'custom_history'
      state.customHistory = []
      state.customHistoryPage = 1
      state.customHistoryHasMore = true
    },
    launchCustomDrill: (state) => {
      state.phase = 'forge'
    },
  },
  extraReducers: (builder) => {
    builder
      // Limits
      .addCase(fetchLimits.fulfilled, (state, action) => {
        state.dailyDrillsRemaining = action.payload.dailyDrillsRemaining
        state.purchasedDrillsRemaining = action.payload.purchasedDrillsRemaining
        state.dailyUsed = action.payload.dailyUsed
        state.nextReset = action.payload.nextReset
      })
      // Purchase
      .addCase(purchaseExtraDrills.pending, (state) => {
        state.purchasing = true
        state.error = null
      })
      .addCase(purchaseExtraDrills.fulfilled, (state, action) => {
        state.purchasing = false
        state.purchasedDrillsRemaining = action.payload.purchasedDrillsRemaining
      })
      .addCase(purchaseExtraDrills.rejected, (state, action) => {
        state.purchasing = false
        state.error = action.payload
      })
      // Start Session
      .addCase(startDrill.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(startDrill.fulfilled, (state, action) => {
        state.loading = false
        // Backend now returns { session, initialForgeQuestion }
        state.activeSession = action.payload.session
        state.sessionId = action.payload.session._id
        state.initialForgeQuestion = action.payload.initialForgeQuestion
        state.phase = 'forge'
        // Decrement local limits optimistically
        if (state.dailyDrillsRemaining > 0) state.dailyDrillsRemaining -= 1
        else if (state.purchasedDrillsRemaining > 0) state.purchasedDrillsRemaining -= 1
      })
      .addCase(startDrill.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Session (Resume)
      .addCase(fetchDrillSession.fulfilled, (state, action) => {
        state.activeSession = action.payload
        state.sessionId = action.payload._id
        if (action.payload.status === 'completed') {
          state.phase = 'results'
          state.lastResult = {
             totalScore: action.payload.totalScore,
             benchmark: action.payload.benchmark,
             forgeScore: action.payload.forgeScore,
             quizScore: action.payload.quizScore
          }
        } else if (action.payload.forgeProgress?.completed) {
          state.phase = 'quiz'
        } else {
          state.phase = 'forge'
        }
      })
      // Submit Forge
      .addCase(submitForge.fulfilled, (state, action) => {
        if (state.activeSession && state.activeSession.forgeProgress) {
          state.activeSession.forgeScore = action.payload.newTotalScore
          state.activeSession.forgeProgress.streak = action.payload.streak
          // We could update responses array locally but simpler to re-fetch or trust local tracking
        }
      })
      // Advance Forge
      .addCase(advanceForgeSection.fulfilled, (state, action) => {
        state.activeSession = action.payload
        if (action.payload.forgeProgress.completed) {
          state.phase = 'quiz'
        }
      })
      // Submit Quiz
      .addCase(submitQuiz.pending, (state) => {
        state.loading = true
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.loading = false
        state.phase = 'results'
        state.lastResult = action.payload
        state.activeSession = null // Clear active session as it's done
      })
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.availableCategories = action.payload
      })
      // Stats
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
      // History
      .addCase(fetchHistory.pending, (state) => {
        state.historyLoading = true
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.historyLoading = false
        const { sessions, page, hasMore, total } = action.payload
        if (page === 1) {
          state.history = sessions
        } else {
          state.history = [...state.history, ...sessions]
        }
        state.historyPage = page
        state.historyHasMore = hasMore
        state.historyTotal = total
      })
      .addCase(fetchHistory.rejected, (state) => {
        state.historyLoading = false
      })
      // ── Custom Drill ──
      .addCase(startCustomDrill.pending, (state) => {
        state.processingCustom = true
        state.error = null
      })
      .addCase(startCustomDrill.fulfilled, (state, action) => {
        state.processingCustom = false
        state.isCustomDrill = true
        state.activeSession = action.payload.session
        state.sessionId = action.payload.session._id
        state.initialForgeQuestion = action.payload.initialForgeQuestion
        state.phase = 'custom_ready'
      })
      .addCase(startCustomDrill.rejected, (state, action) => {
        state.processingCustom = false
        state.error = action.payload
      })
      .addCase(fetchCustomLimits.fulfilled, (state, action) => {
        state.customDrillLimits = action.payload
      })
      .addCase(purchaseCustomDrills.pending, (state) => {
        state.purchasing = true
      })
      .addCase(purchaseCustomDrills.fulfilled, (state, action) => {
        state.purchasing = false
        if (state.customDrillLimits) {
          state.customDrillLimits.purchasedCustomDrillsRemaining = action.payload.purchasedCustomDrillsRemaining
          state.customDrillLimits.totalCustomDrillsRemaining =
            state.customDrillLimits.dailyCustomDrillsRemaining + action.payload.purchasedCustomDrillsRemaining
        }
      })
      .addCase(purchaseCustomDrills.rejected, (state, action) => {
        state.purchasing = false
        state.error = action.payload
      })
      .addCase(fetchCustomHistory.pending, (state) => {
        state.customHistoryLoading = true
      })
      .addCase(fetchCustomHistory.fulfilled, (state, action) => {
        state.customHistoryLoading = false
        const { sessions, page, hasMore } = action.payload
        if (page === 1) {
          state.customHistory = sessions
        } else {
          state.customHistory = [...state.customHistory, ...sessions]
        }
        state.customHistoryPage = page
        state.customHistoryHasMore = hasMore
      })
      .addCase(fetchCustomHistory.rejected, (state) => {
        state.customHistoryLoading = false
      })
  }
})

export const {
  openModal,
  closeModal,
  selectCategory,
  updateLoadout,
  resetFlow,
  setSessionId,
  markPowerupUsed,
  setQuizResult,
  setPhaseHistory,
  setCustomText,
  setPhaseCustomInput,
  setPhaseCustomHistory,
  launchCustomDrill,
} = soloDrillSlice.actions

export default soloDrillSlice.reducer
