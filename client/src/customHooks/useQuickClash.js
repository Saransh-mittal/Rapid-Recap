// customHooks/useQuickClash.js
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchActiveChallenges,
  fetchCompletedChallenges,
  fetchUserStats,
  createNewChallenge,
  acceptChallenge,
  rejectChallenge,
  startChallengeSession,
  getChallengeAnalysis,
  setCurrentChallenge,
  clearCurrentSession,
  updateCompletedChallengesPage,
  resetCompletedChallenges,
  setChallengeAnalysisLoading,
  setChallengeAnalysis,
} from '../redux/quickClashSlice'
import { useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

const useQuickClash = () => {
  const dispatch = useDispatch()
  const quickClashState = useSelector(state => state.quickClash)
  const toast = useToast()
  const { t } = useTranslation('QuickClash')

  // Active challenges
  const loadActiveChallenges = useCallback(() => {
    return dispatch(fetchActiveChallenges())
  }, [dispatch])

  // Completed challenges
  const loadCompletedChallenges = useCallback(
    (page = 1, limit = 10) => {
      dispatch(updateCompletedChallengesPage(page))
      return dispatch(fetchCompletedChallenges({ page, limit }))
    },
    [dispatch],
  )

  const resetCompletedChallengesState = useCallback(() => {
    dispatch(resetCompletedChallenges())
  }, [dispatch])

  // User stats
  const loadUserStats = useCallback(() => {
    return dispatch(fetchUserStats())
  }, [dispatch])

  // Challenge creation
  const createChallenge = useCallback(
    (opponentId, categories) => {
      return dispatch(createNewChallenge({ opponentId, categories }))
        .unwrap()
        .then(result => {
          toast({
            title: t('Challenge created!'),
            description: t('Your challenge has been sent successfully'),
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
          return result
        })
        .catch(error => {
          toast({
            title: t('Error'),
            description: error || t('Failed to create challenge'),
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
          throw error
        })
    },
    [dispatch, toast, t],
  )

  // Challenge responses
  const handleAcceptChallenge = useCallback(
    challengeId => {
      return dispatch(acceptChallenge(challengeId))
        .unwrap()
        .then(result => {
          toast({
            title: t('Challenge accepted'),
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
          return result
        })
        .catch(error => {
          toast({
            title: t('Error'),
            description: error || t('Failed to accept challenge'),
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
          throw error
        })
    },
    [dispatch, toast, t],
  )

  const handleRejectChallenge = useCallback(
    challengeId => {
      return dispatch(rejectChallenge(challengeId))
        .unwrap()
        .then(result => {
          toast({
            title: t('Challenge rejected'),
            status: 'info',
            duration: 3000,
            isClosable: true,
          })
          return result
        })
        .catch(error => {
          toast({
            title: t('Error'),
            description: error || t('Failed to reject challenge'),
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
          throw error
        })
    },
    [dispatch, toast, t],
  )

  // Session management
  const startSession = useCallback(
    (challengeId, language) => {
      return dispatch(startChallengeSession({ challengeId, language })).unwrap()
    },
    [dispatch],
  )

  const setActiveChallenge = useCallback(
    challenge => {
      dispatch(setCurrentChallenge(challenge))
    },
    [dispatch],
  )

  const endSession = useCallback(() => {
    dispatch(clearCurrentSession())
  }, [dispatch])

  // Challenge analysis with polling
  const fetchChallengeAnalysis = useCallback(
    async challengeId => {
      // Check if we already have the analysis
      if (quickClashState.challengeAnalyses[challengeId]) {
        return Promise.resolve(quickClashState.challengeAnalyses[challengeId])
      }

      // Check if already loading
      if (quickClashState.challengeAnalysesLoading[challengeId]) {
        return null
      }

      // Mark as loading
      dispatch(setChallengeAnalysisLoading({ challengeId, isLoading: true }))

      try {
        // First check the analysis status to see if it exists or is in progress
        const statusResponse = await axios.get(
          `/api/quickClash/analysis/${challengeId}/status`,
        )

        if (
          statusResponse.data.status === 'completed' ||
          statusResponse.data.status === 'not_started'
        ) {
          // Analysis is complete, fetch it
          const response = await axios.get(
            `/api/quickClash/analysis/${challengeId}`,
          )

          if (response.data.success && response.data.analysis) {
            dispatch(
              setChallengeAnalysis({
                challengeId,
                analysis: response.data.analysis,
              }),
            )
            return response.data.analysis
          }

          throw new Error('Analysis not found')
        } else if (statusResponse.data.status === 'in_progress') {
          // Analysis is in progress, set up polling for the STATUS endpoint
          console.log(
            `Analysis for challenge ${challengeId} is already in progress. Setting up polling.`,
          )

          return new Promise((resolve, reject) => {
            // Start polling the STATUS endpoint until it's completed
            const checkInterval = setInterval(async () => {
              try {
                // Check the STATUS endpoint
                const statusCheck = await axios.get(
                  `/api/quickClash/analysis/${challengeId}/status`,
                )

                // Only fetch the full analysis when the status is completed
                if (statusCheck.data.status === 'completed') {
                  // Analysis is complete, now fetch the full analysis
                  const analysisResponse = await axios.get(
                    `/api/quickClash/analysis/${challengeId}`,
                  )

                  if (
                    analysisResponse.data.success &&
                    analysisResponse.data.analysis
                  ) {
                    // Update state with the completed analysis
                    dispatch(
                      setChallengeAnalysis({
                        challengeId,
                        analysis: analysisResponse.data.analysis,
                      }),
                    )

                    // Stop checking
                    clearInterval(checkInterval)

                    // Resolve the promise with the analysis
                    resolve(analysisResponse.data.analysis)
                  }
                }
              } catch (error) {
                // Error checking status, continue polling
                console.log(
                  `Waiting for analysis to complete for challenge ${challengeId}`,
                )
              }
            }, 3000) // Check every 3 seconds

            // Set a timeout to stop checking after 30 seconds
            setTimeout(() => {
              clearInterval(checkInterval)
              // If we still don't have the analysis, reject the promise
              if (!quickClashState.challengeAnalyses[challengeId]) {
                reject(new Error('Analysis generation timeout'))
              }
            }, 30000)
          }).finally(() => {
            dispatch(
              setChallengeAnalysisLoading({ challengeId, isLoading: false }),
            )
          })
        } else {
          // Analysis not started yet
          dispatch(
            setChallengeAnalysisLoading({ challengeId, isLoading: false }),
          )
          return null
        }
      } catch (error) {
        console.error(
          `Error fetching analysis for challenge ${challengeId}:`,
          error,
        )
        dispatch(setChallengeAnalysisLoading({ challengeId, isLoading: false }))
        return null
      }
    },
    [
      dispatch,
      quickClashState.challengeAnalyses,
      quickClashState.challengeAnalysesLoading,
    ],
  )

  // Manual analysis generation
  const generateAnalysis = useCallback(
    async challengeId => {
      dispatch(setChallengeAnalysisLoading({ challengeId, isLoading: true }))

      try {
        toast({
          title: t('Generating analysis'),
          description: t('Please wait while AI analyzes your performance'),
          status: 'info',
          duration: 5000,
          isClosable: true,
        })

        const response = await axios.post(
          `/api/quickClash/analysis/${challengeId}/generate`,
        )

        if (response.data.success && response.data.analysis) {
          dispatch(
            setChallengeAnalysis({
              challengeId,
              analysis: response.data.analysis,
            }),
          )

          toast({
            title: t('Analysis ready!'),
            description: t('Your battle performance has been analyzed'),
            status: 'success',
            duration: 3000,
            isClosable: true,
          })

          return response.data.analysis
        }

        throw new Error('Failed to generate analysis')
      } catch (error) {
        toast({
          title: t('Analysis failed'),
          description:
            error.response?.data?.message || t('Please try again in a moment'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })

        return null
      } finally {
        dispatch(setChallengeAnalysisLoading({ challengeId, isLoading: false }))
      }
    },
    [dispatch, toast, t],
  )

  return {
    // State
    activeChallenges: quickClashState.activeChallenges,
    activeChallengesLoading: quickClashState.activeChallengesLoading,
    activeChallengesError: quickClashState.activeChallengesError,

    completedChallenges: quickClashState.completedChallenges,
    completedChallengesPage: quickClashState.completedChallengesPage,
    completedChallengesHasMore: quickClashState.completedChallengesHasMore,
    completedChallengesTotal: quickClashState.completedChallengesTotal,
    completedChallengesLoading: quickClashState.completedChallengesLoading,
    completedChallengesError: quickClashState.completedChallengesError,

    userStats: quickClashState.userStats,
    userStatsLoading: quickClashState.userStatsLoading,
    userStatsError: quickClashState.userStatsError,

    currentSession: quickClashState.currentSession,
    currentChallenge: quickClashState.currentChallenge,
    sessionLoading: quickClashState.sessionLoading,
    sessionError: quickClashState.sessionError,

    challengeCreating: quickClashState.challengeCreating,
    challengeCreationError: quickClashState.challengeCreationError,

    challengeAnalyses: quickClashState.challengeAnalyses,
    challengeAnalysesLoading: quickClashState.challengeAnalysesLoading,
    challengeAnalysesError: quickClashState.challengeAnalysesError,

    // Actions
    loadActiveChallenges,
    loadCompletedChallenges,
    resetCompletedChallengesState,
    loadUserStats,
    createChallenge,
    handleAcceptChallenge,
    handleRejectChallenge,
    startSession,
    setActiveChallenge,
    endSession,
    fetchChallengeAnalysis,
    generateAnalysis,
  }
}

export default useQuickClash
