// redux/quickClashAnalysisSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Async thunks
export const fetchBattleAnalysis = createAsyncThunk(
  'quickClashAnalysis/fetchBattleAnalysis',
  async (battleId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/quickClash/analysis/battle/${battleId}`,
      )
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch battle analysis',
      )
    }
  },
)

export const fetchUserBattleHistory = createAsyncThunk(
  'quickClashAnalysis/fetchUserBattleHistory',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/quickClash/analysis/history', {
        params: { limit },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch battle history',
      )
    }
  },
)



const initialState = {
  currentBattleAnalysis: null,
  userTeam: null,
  aiInsights: [],
  battleRecap: null,
  followUpQuestions: [],
  allQuestions: [],
  questionProgression: null,
  trophyHistory: [],
  analysisId: null,
  battleAnalysisLoading: false,
  battleAnalysisError: null,
  questionAnswerLoading: false,
  questionAnswerError: null,
  userBattleHistory: [],
  userBattleStats: null,
  historyLoading: false,
  historyError: null,
  selectedInsightIndex: 0,
  typewriterStates: {},
  // NEW: Track which question is currently being processed
  currentlyProcessingQuestionId: null,
  // NEW: Track if we're waiting for next question to appear
  waitingForNextQuestion: false,
  expandedSections: {
    battleResult: true,
    trophies: true,
    aiInsights: true,
    teamPerformance: true,
    categoryBreakdown: false,
    bonuses: false,
    mvpRecognition: true,
  },
  mvpAwards: {
    matchMVP: null,
    teamMVP: null,
    pivotalPlayer: null,
    performanceRecognitions: [],
  },
  simplifiedTrophyData: {
    userTrophyChange: 0,
    activeBonuses: [],
    finalAmount: 0,
    perPlayerAmount: 0,
    showBaseAmount: false,
    bonusTotalAmount: 0,
  },
  enhancedMemberPerformance: false,
}

const quickClashAnalysisSlice = createSlice({
  name: 'quickClashAnalysis',
  initialState,
  reducers: {
    resetAnalysisState: () => initialState,
    clearCurrentAnalysis: state => {
      state.currentBattleAnalysis = null
      state.userTeam = null
      state.aiInsights = []
      state.battleRecap = null
      state.followUpQuestions = []
      state.allQuestions = []
      state.questionProgression = null
      state.trophyHistory = []
      state.analysisId = null
      state.battleAnalysisLoading = false
      state.battleAnalysisError = null
      state.questionAnswerLoading = false
      state.questionAnswerError = null
      state.selectedInsightIndex = 0
      state.typewriterStates = {}
      state.currentlyProcessingQuestionId = null
      state.waitingForNextQuestion = false
      // RESET NEW FIELDS
      state.mvpAwards = {
        matchMVP: null,
        teamMVP: null,
        pivotalPlayer: null,
        performanceRecognitions: [],
      }
      state.simplifiedTrophyData = {
        userTrophyChange: 0,
        activeBonuses: [],
        finalAmount: 0,
        perPlayerAmount: 0,
        showBaseAmount: false,
        bonusTotalAmount: 0,
      }
      state.enhancedMemberPerformance = false
    },
    selectInsight: (state, action) => {
      state.selectedInsightIndex = action.payload
    },
    toggleSection: (state, action) => {
      const section = action.payload
      if (state.expandedSections.hasOwnProperty(section)) {
        state.expandedSections[section] = !state.expandedSections[section]
      }
    },
    expandAllSections: state => {
      Object.keys(state.expandedSections).forEach(section => {
        state.expandedSections[section] = true
      })
    },
    collapseAllSections: state => {
      Object.keys(state.expandedSections).forEach(section => {
        state.expandedSections[section] = false
      })
    },
    setAnalysisId: (state, action) => {
      state.analysisId = action.payload
    },
    startTypewriter: (state, action) => {
      const { questionId } = action.payload
      state.typewriterStates[questionId] = {
        isTyping: true,
        currentText: '',
        isComplete: false,
      }
    },
    updateTypewriterText: (state, action) => {
      const { questionId, text, isComplete } = action.payload
      if (state.typewriterStates[questionId]) {
        state.typewriterStates[questionId].currentText = text
        state.typewriterStates[questionId].isComplete = isComplete
        if (isComplete) {
          state.typewriterStates[questionId].isTyping = false
        }
      }
    },
    skipTypewriter: (state, action) => {
      const { questionId, fullText } = action.payload
      if (state.typewriterStates[questionId]) {
        state.typewriterStates[questionId].currentText = fullText
        state.typewriterStates[questionId].isTyping = false
        state.typewriterStates[questionId].isComplete = true
      }
    },
    updateQuestionInPlace: (state, action) => {
      const { questionId, updates } = action.payload
      const followUpIndex = state.followUpQuestions.findIndex(
        q => q.id === questionId,
      )
      if (followUpIndex !== -1) {
        state.followUpQuestions[followUpIndex] = {
          ...state.followUpQuestions[followUpIndex],
          ...updates,
        }
      }
      const allIndex = state.allQuestions.findIndex(q => q.id === questionId)
      if (allIndex !== -1) {
        state.allQuestions[allIndex] = {
          ...state.allQuestions[allIndex],
          ...updates,
        }
      }
    },
    // NEW: Action to handle typewriter completion and trigger next question visibility
    completeTypewriterAndShowNext: (state, action) => {
      const { questionId } = action.payload
      if (state.typewriterStates[questionId]) {
        state.typewriterStates[questionId].isTyping = false
        state.typewriterStates[questionId].isComplete = true
      }
      state.waitingForNextQuestion = false
      state.currentlyProcessingQuestionId = null

      // Check if there are pending questions to show
      const pendingQuestions = state.allQuestions.filter(
        q => q.isActive && !q.answered,
      )

      if (pendingQuestions.length > 0 && state.followUpQuestions.length === 0) {
        // Show the next pending question
        state.followUpQuestions = pendingQuestions.slice(0, 1)
      }
    },
    // NEW: Set waiting state for smooth transitions
    setWaitingForNextQuestion: (state, action) => {
      state.waitingForNextQuestion = action.payload
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchBattleAnalysis.pending, state => {
        state.battleAnalysisLoading = true
        state.battleAnalysisError = null
        state.analysisId = null
      })
      .addCase(fetchBattleAnalysis.fulfilled, (state, action) => {
        state.battleAnalysisLoading = false
        if (action.payload.success && action.payload.analysis) {
          state.currentBattleAnalysis = action.payload.analysis.battle
          state.userTeam = action.payload.analysis.userTeam

          if (action.payload.analysis.battleRecap) {
            // New progressive Q&A format
            state.battleRecap = action.payload.analysis.battleRecap

            // Backend now sends all questions (answered and current active)
            // if an analysis already existed.
            const allQuestionsFromAPI =
              action.payload.analysis.followUpQuestions || []

            // Ensure all questions have necessary fields, especially from older data or initial generation
            state.allQuestions = allQuestionsFromAPI.map((q, index) => ({
              ...q,
              questionIndex: q.questionIndex || index + 1, // Default if missing
              // isActive and answered should be correctly set by backend logic
              // For safety, we can ensure isActive is a boolean:
              isActive:
                typeof q.isActive === 'boolean' ? q.isActive : !q.answered,
              answered: typeof q.answered === 'boolean' ? q.answered : false,
            }))

            // followUpQuestions array should contain only the current *active* question to be asked.
            // This is the question for which `isActive` is true and `answered` is false.
            state.followUpQuestions = state.allQuestions.filter(
              q => q.isActive && !q.answered,
            )

            // Set questionProgression from backend, or initialize if not present
            if (action.payload.analysis.questionProgression) {
              state.questionProgression =
                action.payload.analysis.questionProgression
            } else {
              // Fallback initialization if backend didn't provide progression (e.g. very first load new system)
              const answeredCount = state.allQuestions.filter(
                q => q.answered,
              ).length
              const totalGenerated = state.allQuestions.length
              state.questionProgression = {
                currentQuestionIndex: Math.min(answeredCount + 1, 3),
                totalQuestionsGenerated: totalGenerated,
                isComplete:
                  answeredCount >= Math.min(totalGenerated, 3) &&
                  totalGenerated > 0,
                battleContext: JSON.stringify(
                  action.payload.analysis.battleRecap || {},
                ), // Basic context
                conversationHistory: state.allQuestions
                  .filter(q => q.answered && q.answer)
                  .map(q => ({
                    questionId: q.id,
                    question: q.question,
                    answer: q.answer.content,
                    timestamp: q.answer.answeredAt || new Date(),
                  })),
              }
            }

            state.aiInsights = [] // Clear old aiInsights format
          } else if (action.payload.analysis.aiInsights) {
            // Legacy aiInsights format
            state.aiInsights = action.payload.analysis.aiInsights
            state.battleRecap = null
            state.followUpQuestions = []
            state.allQuestions = []
            state.questionProgression = null
          }

          state.trophyHistory = action.payload.analysis.trophyHistory || []
          state.analysisId = action.payload.analysis.analysisId || null

          // NEW FIELDS
          state.mvpAwards = action.payload.analysis.mvpAwards || {
            matchMVP: null,
            teamMVP: null,
            pivotalPlayer: null,
            performanceRecognitions: [],
          }
          state.simplifiedTrophyData = action.payload.analysis
            .simplifiedTrophyData || {
            userTrophyChange: 0,
            activeBonuses: [],
            finalAmount: 0,
            perPlayerAmount: 0,
            showBaseAmount: false,
            bonusTotalAmount: 0,
          }
          state.enhancedMemberPerformance =
            action.payload.analysis.enhancedMemberPerformance || false
        } else {
          state.battleAnalysisError =
            action.payload.message || 'Failed to load battle analysis data.'
          // Reset states on failure to load analysis
          Object.assign(state, {
            currentBattleAnalysis: null,
            userTeam: null,
            aiInsights: [],
            battleRecap: null,
            followUpQuestions: [],
            allQuestions: [],
            questionProgression: null,
            trophyHistory: [],
          })
        }
      })
      .addCase(fetchBattleAnalysis.rejected, (state, action) => {
        state.battleAnalysisLoading = false
        state.battleAnalysisError = action.payload
        Object.assign(state, {
          currentBattleAnalysis: null,
          userTeam: null,
          aiInsights: [],
          battleRecap: null,
          followUpQuestions: [],
          allQuestions: [],
          questionProgression: null,
          trophyHistory: [],
          analysisId: null,
          mvpAwards: {
            matchMVP: null,
            teamMVP: null,
            pivotalPlayer: null,
            performanceRecognitions: [],
          },
          simplifiedTrophyData: {
            userTrophyChange: 0,
            activeBonuses: [],
            finalAmount: 0,
            perPlayerAmount: 0,
            showBaseAmount: false,
            bonusTotalAmount: 0,
          },
          enhancedMemberPerformance: false,
        })
      })

      .addCase(fetchUserBattleHistory.pending, state => {
        state.historyLoading = true
        state.historyError = null
      })
      .addCase(fetchUserBattleHistory.fulfilled, (state, action) => {
        state.historyLoading = false
        if (action.payload.success) {
          state.userBattleHistory = action.payload.trophyHistory || []
          state.userBattleStats = action.payload.stats || null
        } else {
          state.historyError =
            action.payload.message || 'Failed to load battle history data.'
        }
      })
      .addCase(fetchUserBattleHistory.rejected, (state, action) => {
        state.historyLoading = false
        state.historyError = action.payload
      })
  },
})

export const {
  resetAnalysisState,
  clearCurrentAnalysis,
  selectInsight,
  toggleSection,
  expandAllSections,
  collapseAllSections,
  setAnalysisId,
  startTypewriter,
  updateTypewriterText,
  skipTypewriter,
  updateQuestionInPlace,
  completeTypewriterAndShowNext,
  setWaitingForNextQuestion,
} = quickClashAnalysisSlice.actions

export default quickClashAnalysisSlice.reducer
