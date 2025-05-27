// customHooks/useQuickClashAnalysis.js (Enhanced Version)
import { useCallback, useEffect, useRef, useState } from 'react'
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

  const analysisState = useSelector(state => state.quickClashAnalysis)

  // Enhanced tracking states
  const [engagementData, setEngagementData] = useState({
    startTime: null,
    readingTime: 0,
    scrollDepth: 0,
    expanded: false,
    interactions: [],
    lastScrollTime: null,
  })

  const [feedbackState, setFeedbackState] = useState({
    pendingFeedback: [],
    submittedFeedback: new Set(),
    autoFeedbackEnabled: true,
  })

  // Refs for tracking
  const pageVisitRef = useRef(null)
  const scrollTrackingRef = useRef(null)
  const readingTimerRef = useRef(null)
  const engagementTimerRef = useRef(null)

  // Initialize engagement tracking when analysis loads
  useEffect(() => {
    if (analysisState.currentBattleAnalysis && analysisState.analysisId) {
      setEngagementData(prev => ({
        ...prev,
        startTime: Date.now(),
        interactions: [],
      }))

      // Start engagement tracking
      startEngagementTracking()
    }

    return () => {
      // Cleanup timers
      if (readingTimerRef.current) clearInterval(readingTimerRef.current)
      if (engagementTimerRef.current) clearInterval(engagementTimerRef.current)
    }
  }, [analysisState.currentBattleAnalysis, analysisState.analysisId])

  // Auto-submit engagement data periodically
  useEffect(() => {
    if (analysisState.analysisId && engagementData.startTime) {
      const submitEngagementData = () => {
        const currentTime = Date.now()
        const totalTime = currentTime - engagementData.startTime

        if (totalTime > 5000) {
          // Only submit if user has been on page for 5+ seconds
          submitImplicitFeedback({
            readingTime: engagementData.readingTime,
            scrollDepth: engagementData.scrollDepth,
            expanded: engagementData.expanded,
            timeSpent: totalTime,
            interactions: engagementData.interactions.length,
          })
        }
      }

      // Submit engagement data every 30 seconds
      engagementTimerRef.current = setInterval(submitEngagementData, 30000)

      // Submit on page unload
      const handleBeforeUnload = () => {
        submitEngagementData()
      }
      window.addEventListener('beforeunload', handleBeforeUnload)

      return () => {
        clearInterval(engagementTimerRef.current)
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }, [analysisState.analysisId, engagementData.startTime])

  const startEngagementTracking = useCallback(() => {
    // Track reading time (when user is actively reading)
    let isReading = false
    let readingStartTime = null

    const handleMouseMove = () => {
      if (!isReading) {
        isReading = true
        readingStartTime = Date.now()
      }
    }

    const handleMouseLeave = () => {
      if (isReading && readingStartTime) {
        const readingDuration = Date.now() - readingStartTime
        setEngagementData(prev => ({
          ...prev,
          readingTime: prev.readingTime + readingDuration,
        }))
        isReading = false
      }
    }

    // Track scroll depth
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100,
      )

      setEngagementData(prev => ({
        ...prev,
        scrollDepth: Math.max(prev.scrollDepth, scrollPercent),
        lastScrollTime: Date.now(),
      }))
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('scroll', handleScroll)

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('scroll', handleScroll)

      if (isReading && readingStartTime) {
        const finalReadingTime = Date.now() - readingStartTime
        setEngagementData(prev => ({
          ...prev,
          readingTime: prev.readingTime + finalReadingTime,
        }))
      }
    }
  }, [])

  const getBattleAnalysis = useCallback(
    battleId => {
      // Track interaction
      trackInteraction('analysis_request', { battleId })

      return dispatch(fetchBattleAnalysis(battleId))
        .unwrap()
        .catch(error => {
          trackInteraction('analysis_error', { battleId, error })
          toast({
            title: t('ErrorLoadingAnalysis', 'Error Loading Analysis'),
            description:
              error ||
              t(
                'FailedToLoadBattleAnalysis',
                'Failed to load battle analysis details.',
              ),
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          throw error
        })
    },
    [dispatch, toast, t],
  )

  const getUserBattleHistory = useCallback(
    (limit = 10) => {
      trackInteraction('history_request', { limit })

      return dispatch(fetchUserBattleHistory(limit))
        .unwrap()
        .catch(error => {
          toast({
            title: t('ErrorLoadingHistory', 'Error Loading History'),
            description:
              error ||
              t(
                'FailedToLoadBattleHistory',
                'Failed to load your battle history.',
              ),
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          throw error
        })
    },
    [dispatch, toast, t],
  )

  const goToAnalysis = useCallback(
    battleId => {
      navigate(`/quickclash/analysis/${battleId}`)
    },
    [navigate],
  )

  const goBack = useCallback(() => {
    // Submit final engagement data before leaving
    if (analysisState.analysisId && engagementData.startTime) {
      const totalTime = Date.now() - engagementData.startTime
      submitImplicitFeedback({
        readingTime: engagementData.readingTime,
        scrollDepth: engagementData.scrollDepth,
        expanded: engagementData.expanded,
        timeSpent: totalTime,
        interactions: engagementData.interactions.length,
        exitAction: 'navigate_back',
      })
    }

    navigate('/quickclash')
  }, [navigate, analysisState.analysisId, engagementData])

  const handleSelectInsight = useCallback(
    index => {
      trackInteraction('insight_select', { index })
      dispatch(selectInsight(index))
    },
    [dispatch],
  )

  const handleToggleSection = useCallback(
    section => {
      const isExpanding = !analysisState.expandedSections[section]

      trackInteraction('section_toggle', { section, expanding: isExpanding })

      if (isExpanding) {
        setEngagementData(prev => ({
          ...prev,
          expanded: true,
          interactions: [
            ...prev.interactions,
            { type: 'expand', section, timestamp: Date.now() },
          ],
        }))
      }

      dispatch(toggleSection(section))
    },
    [dispatch, analysisState.expandedSections],
  )

  const handleExpandAll = useCallback(() => {
    trackInteraction('expand_all_sections')
    setEngagementData(prev => ({
      ...prev,
      expanded: true,
      interactions: [
        ...prev.interactions,
        { type: 'expand_all', timestamp: Date.now() },
      ],
    }))
    dispatch(expandAllSections())
  }, [dispatch])

  const handleCollapseAll = useCallback(() => {
    trackInteraction('collapse_all_sections')
    dispatch(collapseAllSections())
  }, [dispatch])

  const clearAnalysis = useCallback(() => {
    // Reset engagement tracking
    setEngagementData({
      startTime: null,
      readingTime: 0,
      scrollDepth: 0,
      expanded: false,
      interactions: [],
      lastScrollTime: null,
    })

    dispatch(clearCurrentAnalysis())
  }, [dispatch])

  const answerQuestion = useCallback(
    async ({ battleId, questionId, questionText }) => {
      try {
        trackInteraction('question_answer_start', { questionId, questionText })

        const result = await dispatch(
          answerFollowUpQuestion({ battleId, questionId, questionText }),
        ).unwrap()

        trackInteraction('question_answer_success', {
          questionId,
          hasNextQuestion: !!result.nextQuestion,
        })

        // Track successful question interaction
        setEngagementData(prev => ({
          ...prev,
          interactions: [
            ...prev.interactions,
            {
              type: 'question_answered',
              questionId,
              timestamp: Date.now(),
            },
          ],
        }))

        return result
      } catch (error) {
        trackInteraction('question_answer_error', { questionId, error })
        toast({
          title: t('Answer Generation Failed', 'Answer Generation Failed'),
          description:
            error ||
            t(
              'Failed to generate answer',
              'Failed to generate answer. Please try again.',
            ),
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        throw error
      }
    },
    [dispatch, toast, t],
  )

  const startTypewriterEffect = useCallback(
    questionId => {
      trackInteraction('typewriter_start', { questionId })
      dispatch(startTypewriter({ questionId }))
    },
    [dispatch],
  )

  const updateTypewriterState = useCallback(
    ({ questionId, text, isComplete }) => {
      dispatch(updateTypewriterText({ questionId, text, isComplete }))

      if (isComplete) {
        trackInteraction('typewriter_complete', {
          questionId,
          textLength: text.length,
        })
      }
    },
    [dispatch],
  )

  const skipTypewriterEffect = useCallback(
    ({ questionId, fullText }) => {
      trackInteraction('typewriter_skip', { questionId })
      dispatch(skipTypewriter({ questionId, fullText }))
    },
    [dispatch],
  )

  // Enhanced feedback submission with automatic data collection
  const submitInsightFeedbackToServer = useCallback(
    async (insightData, feedbackType, rating, options = {}) => {
      if (!analysisState.analysisId) {
        toast({
          title: t('ErrorNoAnalysisId', 'Error: Analysis ID Missing'),
          description: t(
            'AnalysisSessionNotFoundFeedback',
            'Analysis session not found. Cannot submit feedback.',
          ),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      try {
        const currentTime = Date.now()
        const totalEngagementTime = engagementData.startTime
          ? currentTime - engagementData.startTime
          : 0

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

          // Enhanced implicit feedback data
          implicitFeedback: {
            timeSpent: {
              readingTime: engagementData.readingTime,
              totalViewTime: totalEngagementTime,
              revisitCount: 1,
            },
            interactions: {
              expanded: engagementData.expanded,
              scrollDepth: engagementData.scrollDepth,
              clickedFollowUp: engagementData.interactions.some(
                i => i.type === 'question_answered',
              ),
              sharedInsight: options.shared || false,
              screenshotTaken: options.screenshot || false,
            },
            followUpBehavior: {
              askedFollowUp: engagementData.interactions.some(
                i => i.type === 'question_answered',
              ),
              followUpEngagementTime: engagementData.interactions
                .filter(i => i.type === 'question_answered')
                .reduce((total, i) => total + (i.duration || 1000), 0),
            },
          },

          // Context data
          contextData: {
            userScore: options.userScore || 0,
            trophyChange: options.trophyChange || 0,
            teamRole: options.teamRole || 'average',
            sessionLength: totalEngagementTime,
            battlesAnalyzedInSession: 1,
            deviceType: /Mobile|Tablet/.test(navigator.userAgent)
              ? 'mobile'
              : 'desktop',
          },
        }

        await axios.post(
          '/api/quickClash/analysis/insight-feedback',
          feedbackPayload,
        )

        // Track successful feedback submission
        trackInteraction('feedback_submitted', {
          feedbackType,
          rating,
          insightType: insightData.type,
        })

        // Update local feedback state
        setFeedbackState(prev => ({
          ...prev,
          submittedFeedback: new Set([
            ...prev.submittedFeedback,
            insightData.title,
          ]),
        }))

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

        return { success: true }
      } catch (error) {
        console.error('Error submitting enhanced insight feedback:', error)
        trackInteraction('feedback_error', { error: error.message })

        toast({
          title: t(
            'FeedbackSubmissionFailedTitle',
            'Feedback Submission Failed',
          ),
          description:
            error.response?.data?.message ||
            t(
              'CouldNotSubmitFeedback',
              'Could not submit feedback. Please try again.',
            ),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })

        return { success: false, error: error.message }
      }
    },
    [analysisState.analysisId, engagementData, toast, t],
  )

  // Submit implicit feedback without explicit user action
  const submitImplicitFeedback = useCallback(
    async data => {
      if (!analysisState.analysisId || !feedbackState.autoFeedbackEnabled) {
        return
      }

      try {
        await axios.post('/api/quickClash/analysis/track-engagement', {
          analysisId: analysisState.analysisId,
          engagementData: data,
        })

        trackInteraction('implicit_feedback_sent', data)
      } catch (error) {
        console.error('Error submitting implicit feedback:', error)
      }
    },
    [analysisState.analysisId, feedbackState.autoFeedbackEnabled],
  )

  // Track user interactions for analytics
  const trackInteraction = useCallback((interactionType, data = {}) => {
    setEngagementData(prev => ({
      ...prev,
      interactions: [
        ...prev.interactions,
        {
          type: interactionType,
          data,
          timestamp: Date.now(),
        },
      ],
    }))

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Engagement] ${interactionType}:`, data)
    }
  }, [])

  // Get feedback recommendations for user
  const getFeedbackRecommendations = useCallback(async () => {
    try {
      const response = await axios.get(
        '/api/quickClash/analysis/feedback-analytics',
      )
      return response.data
    } catch (error) {
      console.error('Error getting feedback recommendations:', error)
      return null
    }
  }, [])

  // Debug function to log current state
  const debugState = useCallback(() => {
    console.log('Current Analysis State:', {
      battleRecap: !!analysisState.battleRecap,
      followUpQuestions: analysisState.followUpQuestions?.length || 0,
      allQuestions: analysisState.allQuestions?.length || 0,
      questionProgression: analysisState.questionProgression,
      typewriterStates: Object.keys(analysisState.typewriterStates),
      loading: analysisState.questionAnswerLoading,
      engagement: engagementData,
      feedback: feedbackState,
      battle: analysisState.currentBattleAnalysis,
    })
  }, [analysisState, engagementData, feedbackState])

  // Auto-debug in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      debugState()
    }
  }, [
    analysisState.allQuestions,
    analysisState.followUpQuestions,
    debugState,
    analysisState.currentBattleAnalysis,
  ])

  return {
    // Data from slice
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

    // Loading and error states from slice
    battleAnalysisLoading: analysisState.battleAnalysisLoading,
    battleAnalysisError: analysisState.battleAnalysisError,
    questionAnswerLoading: analysisState.questionAnswerLoading,
    questionAnswerError: analysisState.questionAnswerError,
    historyLoading: analysisState.historyLoading,
    historyError: analysisState.historyError,

    // UI states from slice
    selectedInsightIndex: analysisState.selectedInsightIndex,
    expandedSections: analysisState.expandedSections,
    typewriterStates: analysisState.typewriterStates,

    // Enhanced engagement and feedback states
    engagementData,
    feedbackState,
    setFeedbackState,

    // Actions/Thunks dispatched from hook
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

    // Enhanced feedback functions
    submitImplicitFeedback,
    trackInteraction,
    getFeedbackRecommendations,

    // Debug function
    debugState,
  }
}

export default useQuickClashAnalysis
