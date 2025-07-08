// redux/gameHubSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import i18n from 'i18next'

// Async thunks for GameHub operations
export const fetchGameData = createAsyncThunk(
  'gameHub/fetchGameData',
  async ({ articleId, language = 'en' }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/gamehub/data/${articleId}`)
      return response.data.gameData
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch game data',
      )
    }
  },
)

export const createGameSession = createAsyncThunk(
  'gameHub/createGameSession',
  async ({ articleId, gameType, language = 'en' }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/gamehub/session/create', {
        articleId,
        gameType,
        language,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to create game session',
      )
    }
  },
)

export const startGameSession = createAsyncThunk(
  'gameHub/startGameSession',
  async ({ sessionId, onBoarding = false }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/gamehub/session/start/${sessionId}?onBoarding=${onBoarding}`,
      )
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to start game session',
      )
    }
  },
)

export const submitGameAttempt = createAsyncThunk(
  'gameHub/submitGameAttempt',
  async ({ sessionId, userResponses, timeTaken }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/gamehub/attempt', {
        sessionId,
        userResponses,
        timeTaken,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to submit game attempt',
      )
    }
  },
)

export const fetchGameSummary = createAsyncThunk(
  'gameHub/fetchGameSummary',
  async ({ sessionId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/gamehub/summary/${sessionId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch game summary',
      )
    }
  },
)

export const importGameData = createAsyncThunk(
  'gameHub/importGameData',
  async ({ gameData }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/gamehub/import', { gameData })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to import game data',
      )
    }
  },
)

const initialState = {
  // Game data
  gameData: null,
  gameDataLoading: false,
  gameDataError: null,

  // Game session
  sessionId: null,
  gameSession: null,
  sessionStatus: 'idle', // idle, creating, ready, playing, completed, error
  sessionError: null,

  // Game state
  currentGameType: null,
  currentQuestionIndex: 0,
  selectedAnswers: [],
  timeLeft: 0,
  totalTime: 0,
  gameState: 'menu', // menu, loading, instructions, playing, paused, submitting, completed, error

  // Results
  gameResults: null,
  gameSummary: null,
  summaryLoading: false,
  summaryError: null,

  // Progress tracking
  submissionProgress: 0,
  generationProgress: 0,

  // UI state
  showInstructions: false,
  showResults: false,
  showImportModal: false,

  // Import/Export
  importLoading: false,
  importError: null,

  error: null,
}

const gameHubSlice = createSlice({
  name: 'gameHub',
  initialState,
  reducers: {
    // Game state management
    setCurrentGameType: (state, action) => {
      state.currentGameType = action.payload
    },
    setGameState: (state, action) => {
      state.gameState = action.payload
    },
    setSessionStatus: (state, action) => {
      state.sessionStatus = action.payload
    },

    // Question navigation
    setCurrentQuestionIndex: (state, action) => {
      state.currentQuestionIndex = action.payload
    },
    nextQuestion: state => {
      if (state.gameSession?.questions) {
        const maxIndex = state.gameSession.questions.length - 1
        state.currentQuestionIndex = Math.min(
          state.currentQuestionIndex + 1,
          maxIndex,
        )
      }
    },
    previousQuestion: state => {
      state.currentQuestionIndex = Math.max(state.currentQuestionIndex - 1, 0)
    },

    // Answer management
    setSelectedAnswer: (state, action) => {
      const { questionIndex, answer } = action.payload
      state.selectedAnswers[questionIndex] = answer
    },
    setSelectedAnswers: (state, action) => {
      state.selectedAnswers = action.payload
    },
    clearSelectedAnswers: state => {
      state.selectedAnswers = []
    },

    // Timer management
    setTimeLeft: (state, action) => {
      state.timeLeft = action.payload
    },
    setTotalTime: (state, action) => {
      state.totalTime = action.payload
    },
    decrementTimer: state => {
      if (state.timeLeft > 0) {
        state.timeLeft -= 1
      }
    },

    // Progress tracking
    setSubmissionProgress: (state, action) => {
      state.submissionProgress = action.payload
    },
    setGenerationProgress: (state, action) => {
      state.generationProgress = action.payload
    },

    // UI state
    setShowInstructions: (state, action) => {
      state.showInstructions = action.payload
    },
    setShowResults: (state, action) => {
      state.showResults = action.payload
    },
    setShowImportModal: (state, action) => {
      state.showImportModal = action.payload
    },

    // Reset functions
    resetGameSession: state => {
      state.sessionId = null
      state.gameSession = null
      state.sessionStatus = 'idle'
      state.currentQuestionIndex = 0
      state.selectedAnswers = []
      state.timeLeft = 0
      state.totalTime = 0
      state.gameState = 'menu'
      state.gameResults = null
      state.submissionProgress = 0
    },

    resetGameHub: state => {
      return { ...initialState }
    },

    // Error handling
    clearError: state => {
      state.error = null
      state.gameDataError = null
      state.sessionError = null
      state.summaryError = null
      state.importError = null
    },

    // Manual session data setting (for existing quiz compatibility)
    setSessionData: (state, action) => {
      const { sessionId, gameSession, timer } = action.payload
      state.sessionId = sessionId
      state.gameSession = gameSession
      state.timeLeft = timer
      state.totalTime = timer
      state.sessionStatus = 'ready'
    },
  },

  extraReducers: builder => {
    builder
      // Fetch game data
      .addCase(fetchGameData.pending, state => {
        state.gameDataLoading = true
        state.gameDataError = null
      })
      .addCase(fetchGameData.fulfilled, (state, action) => {
        state.gameDataLoading = false
        state.gameData = action.payload
      })
      .addCase(fetchGameData.rejected, (state, action) => {
        state.gameDataLoading = false
        state.gameDataError = action.payload
      })

      // Create game session
      .addCase(createGameSession.pending, state => {
        state.sessionStatus = 'creating'
        state.sessionError = null
      })
      .addCase(createGameSession.fulfilled, (state, action) => {
        state.sessionStatus = 'ready'
        state.sessionId = action.payload.sessionId
        state.totalTime = action.payload.timer
      })
      .addCase(createGameSession.rejected, (state, action) => {
        state.sessionStatus = 'error'
        state.sessionError = action.payload
      })

      // Start game session
      .addCase(startGameSession.pending, state => {
        state.gameState = 'loading'
      })
      .addCase(startGameSession.fulfilled, (state, action) => {
        state.gameState = 'playing'
        state.gameSession = action.payload.gameSession
        state.timeLeft = action.payload.timer
        state.totalTime = action.payload.timer
      })
      .addCase(startGameSession.rejected, (state, action) => {
        state.gameState = 'error'
        state.sessionError = action.payload
      })

      // Submit game attempt
      .addCase(submitGameAttempt.pending, state => {
        state.gameState = 'submitting'
        state.submissionProgress = 0
      })
      .addCase(submitGameAttempt.fulfilled, (state, action) => {
        state.gameState = 'completed'
        state.gameResults = action.payload
        state.submissionProgress = 100
      })
      .addCase(submitGameAttempt.rejected, (state, action) => {
        state.gameState = 'error'
        state.error = action.payload
        state.submissionProgress = 0
      })

      // Fetch game summary
      .addCase(fetchGameSummary.pending, state => {
        state.summaryLoading = true
        state.summaryError = null
      })
      .addCase(fetchGameSummary.fulfilled, (state, action) => {
        state.summaryLoading = false
        state.gameSummary = action.payload
      })
      .addCase(fetchGameSummary.rejected, (state, action) => {
        state.summaryLoading = false
        state.summaryError = action.payload
      })

      // Import game data
      .addCase(importGameData.pending, state => {
        state.importLoading = true
        state.importError = null
      })
      .addCase(importGameData.fulfilled, (state, action) => {
        state.importLoading = false
        state.showImportModal = false
      })
      .addCase(importGameData.rejected, (state, action) => {
        state.importLoading = false
        state.importError = action.payload
      })
  },
})

export const {
  setCurrentGameType,
  setGameState,
  setSessionStatus,
  setCurrentQuestionIndex,
  nextQuestion,
  previousQuestion,
  setSelectedAnswer,
  setSelectedAnswers,
  clearSelectedAnswers,
  setTimeLeft,
  setTotalTime,
  decrementTimer,
  setSubmissionProgress,
  setGenerationProgress,
  setShowInstructions,
  setShowResults,
  setShowImportModal,
  resetGameSession,
  resetGameHub,
  clearError,
  setSessionData,
} = gameHubSlice.actions

export default gameHubSlice.reducer
