// customHooks/useQuickClashAnalysis.js
import { useCallback, useEffect } from 'react'
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

  const getBattleAnalysis = useCallback(
    battleId => {
      return dispatch(fetchBattleAnalysis(battleId))
        .unwrap()
        .catch(error => {
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
    navigate('/quickclash')
  }, [navigate])

  const handleSelectInsight = useCallback(
    index => {
      dispatch(selectInsight(index))
    },
    [dispatch],
  )

  const handleToggleSection = useCallback(
    section => {
      dispatch(toggleSection(section))
    },
    [dispatch],
  )

  const handleExpandAll = useCallback(() => {
    dispatch(expandAllSections())
  }, [dispatch])

  const handleCollapseAll = useCallback(() => {
    dispatch(collapseAllSections())
  }, [dispatch])

  const clearAnalysis = useCallback(() => {
    dispatch(clearCurrentAnalysis())
  }, [dispatch])

  // Progressive Q&A functions - REMOVED TOAST
  const answerQuestion = useCallback(
    async ({ battleId, questionId, questionText }) => {
      try {
        console.log('Answering question:', {
          battleId,
          questionId,
          questionText,
        })

        const result = await dispatch(
          answerFollowUpQuestion({ battleId, questionId, questionText }),
        ).unwrap()

        console.log('Question answered, result:', result)

        // NO TOAST - removed the toast notification

        return result
      } catch (error) {
        console.error('Error answering question:', error)
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

  // Typewriter effect functions
  const startTypewriterEffect = useCallback(
    questionId => {
      console.log('Starting typewriter effect for question:', questionId)
      dispatch(startTypewriter({ questionId }))
    },
    [dispatch],
  )

  const updateTypewriterState = useCallback(
    ({ questionId, text, isComplete }) => {
      dispatch(updateTypewriterText({ questionId, text, isComplete }))
    },
    [dispatch],
  )

  const skipTypewriterEffect = useCallback(
    ({ questionId, fullText }) => {
      console.log('Skipping typewriter effect for question:', questionId)
      dispatch(skipTypewriter({ questionId, fullText }))
    },
    [dispatch],
  )

  const submitInsightFeedbackToServer = useCallback(
    async (insightData, feedbackType, comment = '') => {
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
        const feedbackPayload = {
          analysisId: analysisState.analysisId,
          insightTitle: insightData.title,
          insightDescription: insightData.description,
          insightType: insightData.type,
          feedbackType,
          comment,
        }

        await axios.post(
          '/api/quickClash/analysis/insight-feedback',
          feedbackPayload,
        )

        toast({
          title: t('Feedback Submitted', 'Feedback Submitted'),
          description: t(
            'Thank you for your feedback!',
            'Thank you for your feedback!',
          ),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        console.error('Error submitting insight feedback to server:', error)
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
      }
    },
    [analysisState.analysisId, toast, t],
  )

  // Debug function to log current state
  const debugState = useCallback(() => {
    console.log('Current Analysis State:', {
      battleRecap: !!analysisState.battleRecap,
      followUpQuestions: analysisState.followUpQuestions?.length || 0,
      allQuestions: analysisState.allQuestions?.length || 0,
      questionProgression: analysisState.questionProgression,
      typewriterStates: Object.keys(analysisState.typewriterStates),
      loading: analysisState.questionAnswerLoading,
    })
  }, [analysisState])

  // Auto-debug in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      debugState()
    }
  }, [analysisState.allQuestions, analysisState.followUpQuestions, debugState])

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

    // Debug function
    debugState,
  }
}

export default useQuickClashAnalysis
