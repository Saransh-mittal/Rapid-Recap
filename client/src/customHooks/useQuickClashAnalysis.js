// customHooks/useQuickClashAnalysis.js (Optimized Version)
import { useCallback, useEffect, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  fetchBattleAnalysis,
  fetchUserBattleHistory,
  answerFollowUpQuestion,
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
} from '../redux/quickClashAnalysisSlice'
import axios from 'axios'

const useQuickClashAnalysis = () => {
  const dispatch = useDispatch()
  const toast = useToast()
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()

  // Memoized selector to prevent unnecessary re-renders
  const analysisState = useSelector(
    state => state.quickClashAnalysis,
    (left, right) => {
      // Custom equality check for performance
      return (
        left.currentBattleAnalysis?._id === right.currentBattleAnalysis?._id &&
        left.battleAnalysisLoading === right.battleAnalysisLoading &&
        left.battleAnalysisError === right.battleAnalysisError &&
        left.followUpQuestions?.length === right.followUpQuestions?.length &&
        left.allQuestions?.length === right.allQuestions?.length &&
        left.expandedSections === right.expandedSections
      )
    },
  )

  // Refs for performance tracking
  const performanceRef = useRef({
    startTime: null,
    interactions: [],
    lastSubmission: null,
  })

  // Debounced interaction tracking
  const trackInteractionDebounced = useRef(
    debounce((interactionType, data = {}) => {
      if (process.env.NODE_ENV === 'development') {
        // Only log in development, removed console.log
      }

      performanceRef.current.interactions.push({
        type: interactionType,
        data,
        timestamp: Date.now(),
      })
    }, 100),
  ).current

  // Memoized analysis data
  const memoizedAnalysisData = useMemo(
    () => ({
      currentBattleAnalysis: analysisState.currentBattleAnalysis,
      userTeam: analysisState.userTeam,
      aiInsights: analysisState.aiInsights,
      battleRecap: analysisState.battleRecap,
      followUpQuestions: analysisState.followUpQuestions,
      allQuestions: analysisState.allQuestions,
      questionProgression: analysisState.questionProgression,
      trophyHistory: analysisState.trophyHistory,
      userBattleHistory: analysisState.userBattleHistory,
      userBattleStats: analysisState.userBattleStats,
      analysisId: analysisState.analysisId,
      mvpAwards: analysisState.mvpAwards,
      simplifiedTrophyData: analysisState.simplifiedTrophyData,
      enhancedMemberPerformance: analysisState.enhancedMemberPerformance,
    }),
    [analysisState],
  )

  // Memoized loading states
  const memoizedLoadingStates = useMemo(
    () => ({
      battleAnalysisLoading: analysisState.battleAnalysisLoading,
      battleAnalysisError: analysisState.battleAnalysisError,
      questionAnswerLoading: analysisState.questionAnswerLoading,
      questionAnswerError: analysisState.questionAnswerError,
      historyLoading: analysisState.historyLoading,
      historyError: analysisState.historyError,
    }),
    [
      analysisState.battleAnalysisLoading,
      analysisState.battleAnalysisError,
      analysisState.questionAnswerLoading,
      analysisState.questionAnswerError,
      analysisState.historyLoading,
      analysisState.historyError,
    ],
  )

  // Memoized UI states
  const memoizedUIStates = useMemo(
    () => ({
      selectedInsightIndex: analysisState.selectedInsightIndex,
      expandedSections: analysisState.expandedSections,
      typewriterStates: analysisState.typewriterStates,
    }),
    [
      analysisState.selectedInsightIndex,
      analysisState.expandedSections,
      analysisState.typewriterStates,
    ],
  )

  // Optimized battle analysis fetcher with caching
  const getBattleAnalysis = useCallback(
    async battleId => {
      // Prevent duplicate requests
      if (
        analysisState.battleAnalysisLoading ||
        analysisState.currentBattleAnalysis?._id === battleId
      ) {
        return
      }

      trackInteractionDebounced('analysis_request', { battleId })
      performanceRef.current.startTime = Date.now()

      try {
        const result = await dispatch(fetchBattleAnalysis(battleId)).unwrap()

        const loadTime = Date.now() - performanceRef.current.startTime
        trackInteractionDebounced('analysis_loaded', {
          battleId,
          loadTime,
          dataSize: JSON.stringify(result).length,
        })

        return result
      } catch (error) {
        trackInteractionDebounced('analysis_error', {
          battleId,
          error: error.message,
        })

        // Optimized error handling
        const errorMessage = getErrorMessage(error, t)
        toast({
          title: t('ErrorLoadingAnalysis', 'Error Loading Analysis'),
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        throw error
      }
    },
    [
      dispatch,
      toast,
      t,
      analysisState.battleAnalysisLoading,
      analysisState.currentBattleAnalysis,
      trackInteractionDebounced,
    ],
  )

  // Optimized user battle history fetcher
  const getUserBattleHistory = useCallback(
    async (limit = 10) => {
      // Prevent duplicate requests
      if (analysisState.historyLoading) return

      trackInteractionDebounced('history_request', { limit })

      try {
        return await dispatch(fetchUserBattleHistory(limit)).unwrap()
      } catch (error) {
        const errorMessage = getErrorMessage(error, t)
        toast({
          title: t('ErrorLoadingHistory', 'Error Loading History'),
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        throw error
      }
    },
    [
      dispatch,
      toast,
      t,
      analysisState.historyLoading,
      trackInteractionDebounced,
    ],
  )

  // Optimized navigation functions
  const goToAnalysis = useCallback(
    battleId => {
      navigate(`/quickclash/analysis/${battleId}`)
    },
    [navigate],
  )

  const goBack = useCallback(() => {
    // Submit final performance data
    if (performanceRef.current.startTime) {
      const totalTime = Date.now() - performanceRef.current.startTime
      submitPerformanceData({
        totalTime,
        interactions: performanceRef.current.interactions.length,
        exitAction: 'navigate_back',
      })
    }

    navigate('/quickclash')
  }, [navigate])

  // Memoized section handlers
  const handleSelectInsight = useCallback(
    index => {
      trackInteractionDebounced('insight_select', { index })
      dispatch(selectInsight(index))
    },
    [dispatch, trackInteractionDebounced],
  )

  const handleToggleSection = useCallback(
    section => {
      const isExpanding = !analysisState.expandedSections[section]
      trackInteractionDebounced('section_toggle', {
        section,
        expanding: isExpanding,
      })
      dispatch(toggleSection(section))
    },
    [dispatch, analysisState.expandedSections, trackInteractionDebounced],
  )

  const handleExpandAll = useCallback(() => {
    trackInteractionDebounced('expand_all_sections')
    dispatch(expandAllSections())
  }, [dispatch, trackInteractionDebounced])

  const handleCollapseAll = useCallback(() => {
    trackInteractionDebounced('collapse_all_sections')
    dispatch(collapseAllSections())
  }, [dispatch, trackInteractionDebounced])

  // Optimized clear function
  const clearAnalysis = useCallback(() => {
    performanceRef.current = {
      startTime: null,
      interactions: [],
      lastSubmission: null,
    }
    dispatch(clearCurrentAnalysis())
  }, [dispatch])

  // Optimized answer question function
  const answerQuestion = useCallback(
    async ({ battleId, questionId, questionText }) => {
      // Prevent duplicate submissions
      if (analysisState.questionAnswerLoading) return

      const submissionKey = `${questionId}-${Date.now()}`
      if (performanceRef.current.lastSubmission === submissionKey) return
      performanceRef.current.lastSubmission = submissionKey

      try {
        trackInteractionDebounced('question_answer_start', {
          questionId,
          questionText,
        })

        const result = await dispatch(
          answerFollowUpQuestion({ battleId, questionId, questionText }),
        ).unwrap()

        trackInteractionDebounced('question_answer_success', {
          questionId,
          hasNextQuestion: !!result.nextQuestion,
        })

        return result
      } catch (error) {
        trackInteractionDebounced('question_answer_error', {
          questionId,
          error: error.message,
        })

        const errorMessage = getErrorMessage(error, t)
        toast({
          title: t('Answer Generation Failed', 'Answer Generation Failed'),
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        throw error
      }
    },
    [
      dispatch,
      toast,
      t,
      analysisState.questionAnswerLoading,
      trackInteractionDebounced,
    ],
  )

  // Optimized typewriter functions
  const startTypewriterEffect = useCallback(
    questionId => {
      trackInteractionDebounced('typewriter_start', { questionId })
      dispatch(startTypewriter({ questionId }))
    },
    [dispatch, trackInteractionDebounced],
  )

  const updateTypewriterState = useCallback(
    ({ questionId, text, isComplete }) => {
      dispatch(updateTypewriterText({ questionId, text, isComplete }))

      if (isComplete) {
        trackInteractionDebounced('typewriter_complete', {
          questionId,
          textLength: text.length,
        })
      }
    },
    [dispatch, trackInteractionDebounced],
  )

  const skipTypewriterEffect = useCallback(
    ({ questionId, fullText }) => {
      trackInteractionDebounced('typewriter_skip', { questionId })
      dispatch(skipTypewriter({ questionId, fullText }))
    },
    [dispatch, trackInteractionDebounced],
  )

  // Optimized feedback submission
  const submitInsightFeedbackToServer = useCallback(
    async (insightData, feedbackType, rating, options = {}) => {
      if (!analysisState.analysisId) {
        toast({
          title: t('Invalid Data'),
          description: t('Cannot submit feedback without valid insight data.'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return { success: false, error: 'Invalid analysis ID' }
      }

      try {
        const feedbackPayload = {
          analysisId: analysisState.analysisId,
          insightTitle: insightData.title,
          insightDescription: insightData.description,
          insightType: insightData.type,
          insightCategory: insightData.category || 'general',
          feedbackType,
          rating,
          comment: options.comment || '',
          specificAspects: options.specificAspects || {},
          improvementSuggestions: options.improvementSuggestions || '',
          implicitFeedback: {
            interactions: performanceRef.current.interactions.length,
            timeSpent: performanceRef.current.startTime
              ? Date.now() - performanceRef.current.startTime
              : 0,
          },
          contextData: {
            userScore: options.userScore || 0,
            trophyChange: options.trophyChange || 0,
            teamRole: options.teamRole || 'average',
            deviceType: /Mobile|Tablet/.test(navigator.userAgent)
              ? 'mobile'
              : 'desktop',
          },
        }

        const response = await axios.post(
          '/api/quickClash/analysis/insight-feedback',
          feedbackPayload,
        )

        trackInteractionDebounced('feedback_submitted', {
          feedbackType,
          rating,
          insightType: insightData.type,
        })

        toast({
          title: t('Feedback Submitted', 'Feedback Submitted'),
          description: t(
            'Thank you for your feedback!',
            'Thank you for your feedback! This helps improve our AI.',
          ),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        return { success: true, data: response.data }
      } catch (error) {
        trackInteractionDebounced('feedback_error', { error: error.message })

        const errorMessage = getErrorMessage(error, t)
        toast({
          title: t(
            'FeedbackSubmissionFailedTitle',
            'Feedback Submission Failed',
          ),
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })

        return { success: false, error: error.message }
      }
    },
    [analysisState.analysisId, toast, t, trackInteractionDebounced],
  )

  // Submit performance data for analytics
  const submitPerformanceData = useCallback(
    async data => {
      if (!analysisState.analysisId) return

      try {
        await axios.post('/api/quickClash/analysis/track-performance', {
          analysisId: analysisState.analysisId,
          performanceData: data,
        })
      } catch (error) {
        // Silent fail for performance tracking
        if (process.env.NODE_ENV === 'development') {
          // Only log in development
        }
      }
    },
    [analysisState.analysisId],
  )

  // Return optimized hook interface
  return {
    // Memoized data
    ...memoizedAnalysisData,
    ...memoizedLoadingStates,
    ...memoizedUIStates,

    // Optimized functions
    getBattleAnalysis,
    getUserBattleHistory,
    goToAnalysis,
    goBack,
    handleSelectInsight,
    handleToggleSection,
    handleExpandAll,
    handleCollapseAll,
    clearAnalysis,
    submitInsightFeedbackToServer,

    // Progressive Q&A functions
    answerQuestion,
    startTypewriterEffect,
    updateTypewriterState,
    skipTypewriterEffect,

    // Performance tracking
    trackInteraction: trackInteractionDebounced,
    submitPerformanceData,

    // Engagement data (simplified)
    engagementData: {
      interactions: performanceRef.current.interactions,
      startTime: performanceRef.current.startTime,
      timeSpent: performanceRef.current.startTime
        ? Date.now() - performanceRef.current.startTime
        : 0,
    },
  }
}

// Utility functions
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function getErrorMessage(error, t) {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  if (error?.message) {
    return error.message
  }
  return t('An unexpected error occurred. Please try again.')
}

export default useQuickClashAnalysis
