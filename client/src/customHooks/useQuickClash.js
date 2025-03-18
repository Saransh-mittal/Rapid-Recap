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
  setChallengeAnalysisError,
  resetActiveChallenges,
} from '../redux/quickClashSlice'
import { useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { isRetryableError } from '../components/quickClashComponents/analysisCard/AnalysisErrorCard'

// List of error substrings that indicate a non-retryable error (duplicated here for the hook)
const NON_RETRYABLE_ERRORS = [
  'did not complete the challenge',
  'not completed',
  'player has not completed',
  'challenge not completed',
  'opponent has not completed',
  'incomplete challenge',
]

const useQuickClash = () => {
  const dispatch = useDispatch()
  const quickClashState = useSelector(state => state.quickClash)
  const toast = useToast()
  const { t } = useTranslation('QuickClash')

  // Utility function to check if an error is retryable
  const isErrorRetryable = useCallback(errorMessage => {
    if (!errorMessage) return false

    // Check if any non-retryable error substring exists in the message
    return !NON_RETRYABLE_ERRORS.some(substring =>
      errorMessage.toLowerCase().includes(substring.toLowerCase()),
    )
  }, [])

  // Active challenges
  const loadActiveChallenges = useCallback(
    (page = 1, limit = 20) => {
      return dispatch(fetchActiveChallenges({ page, limit }))
    },
    [dispatch],
  )

  // Add a new function to load more challenges
  const loadMoreActiveChallenges = useCallback(() => {
    const nextPage = quickClashState.activeChallengesPage + 1
    return dispatch(
      fetchActiveChallenges({
        page: nextPage,
        limit: 20,
      }),
    )
  }, [dispatch, quickClashState.activeChallengesPage])

  // Add a function to reset the active challenges state
  const resetActiveChallengesState = useCallback(() => {
    dispatch(resetActiveChallenges())
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

  // Challenge analysis with proper error handling
  const fetchChallengeAnalysis = useCallback(
    async challengeId => {
      // Check if we already have the analysis
      if (quickClashState.challengeAnalyses[challengeId]) {
        return Promise.resolve(quickClashState.challengeAnalyses[challengeId])
      }

      // Check if we already have an error for this challenge
      if (quickClashState.challengeAnalysesError[challengeId]) {
        const errorMsg = quickClashState.challengeAnalysesError[challengeId]

        // Don't retry if the error is non-retryable
        if (!isErrorRetryable(errorMsg)) {
          return null
        }
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
          // Analysis is complete or not started yet, fetch it
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
            dispatch(
              setChallengeAnalysisLoading({ challengeId, isLoading: false }),
            )
            return response.data.analysis
          }

          // If we got a success response but no analysis, handle it as an error
          const errorMsg = 'Analysis not found or incomplete'
          dispatch(
            setChallengeAnalysisError({
              challengeId,
              error: errorMsg,
            }),
          )
          dispatch(
            setChallengeAnalysisLoading({ challengeId, isLoading: false }),
          )
          return null
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
                const errorMessage =
                  error.response?.data?.message ||
                  error.message ||
                  'Error checking analysis status'

                // If we get a non-retryable error during polling, stop the polling
                if (!isErrorRetryable(errorMessage)) {
                  clearInterval(checkInterval)

                  dispatch(
                    setChallengeAnalysisError({
                      challengeId,
                      error: errorMessage,
                    }),
                  )

                  reject(new Error(errorMessage))
                } else {
                  // For retryable errors, just log and continue polling
                  console.log(
                    `Waiting for analysis to complete for challenge ${challengeId}`,
                  )
                }
              }
            }, 3000) // Check every 3 seconds

            // Set a timeout to stop checking after 30 seconds
            setTimeout(() => {
              clearInterval(checkInterval)
              // If we still don't have the analysis, consider it an error
              if (!quickClashState.challengeAnalyses[challengeId]) {
                const errorMsg = 'Analysis generation timed out'
                dispatch(
                  setChallengeAnalysisError({
                    challengeId,
                    error: errorMsg,
                  }),
                )
                reject(new Error(errorMsg))
              }
            }, 30000)
          }).finally(() => {
            dispatch(
              setChallengeAnalysisLoading({ challengeId, isLoading: false }),
            )
          })
        } else {
          // Unknown status
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

        // Get the actual error message
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch analysis'

        // Store the error in Redux
        dispatch(
          setChallengeAnalysisError({
            challengeId,
            error: errorMessage,
          }),
        )

        dispatch(setChallengeAnalysisLoading({ challengeId, isLoading: false }))
        return null
      }
    },
    [
      dispatch,
      quickClashState.challengeAnalyses,
      quickClashState.challengeAnalysesLoading,
      quickClashState.challengeAnalysesError,
      isErrorRetryable,
    ],
  )

  // Retry analysis fetch (to be used with the error card)
  const retryAnalysisFetch = useCallback(
    challengeId => {
      // Get the current error message
      const currentError = quickClashState.challengeAnalysesError[challengeId]

      // Don't retry if the error is non-retryable
      if (currentError && !isErrorRetryable(currentError)) {
        toast({
          title: t('Cannot retry'),
          description: t(
            'This analysis is unavailable until your opponent completes their challenge',
          ),
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return Promise.resolve(null)
      }

      // Clear the error so we can try again
      dispatch(
        setChallengeAnalysisError({
          challengeId,
          error: null,
        }),
      )
      // Then fetch the analysis again
      return fetchChallengeAnalysis(challengeId)
    },
    [
      dispatch,
      fetchChallengeAnalysis,
      quickClashState.challengeAnalysesError,
      isErrorRetryable,
      toast,
      t,
    ],
  )

  // Manual analysis generation
  const generateAnalysis = useCallback(
    async challengeId => {
      // Check for existing errors that are non-retryable
      const existingError = quickClashState.challengeAnalysesError[challengeId]
      if (existingError && !isErrorRetryable(existingError)) {
        toast({
          title: t('Cannot generate analysis'),
          description: t(
            'This analysis is unavailable until your opponent completes their challenge',
          ),
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return null
      }

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
        const errorMessage =
          error.response?.data?.message || t('Please try again in a moment')

        // Store the error in Redux
        dispatch(
          setChallengeAnalysisError({
            challengeId,
            error: errorMessage,
          }),
        )

        // Use different toast based on whether it's retryable
        if (isErrorRetryable(errorMessage)) {
          toast({
            title: t('Analysis failed'),
            description: errorMessage,
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
        } else {
          toast({
            title: t('Analysis unavailable'),
            description: t(
              'This analysis cannot be generated until your opponent completes their challenge',
            ),
            status: 'warning',
            duration: 3000,
            isClosable: true,
          })
        }

        return null
      } finally {
        dispatch(setChallengeAnalysisLoading({ challengeId, isLoading: false }))
      }
    },
    [
      dispatch,
      toast,
      t,
      quickClashState.challengeAnalysesError,
      isErrorRetryable,
    ],
  )

  return {
    // State
    activeChallenges: quickClashState.activeChallenges,
    activeChallengesLoading: quickClashState.activeChallengesLoading,
    activeChallengesError: quickClashState.activeChallengesError,
    activeChallengesPage: quickClashState.activeChallengesPage,
    activeChallengesHasMore: quickClashState.activeChallengesHasMore,
    activeChallengesTotal: quickClashState.activeChallengesTotal,

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
    loadMoreActiveChallenges,
    resetActiveChallengesState,
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
    retryAnalysisFetch,
    generateAnalysis,
    isErrorRetryable, // Expose this utility function
  }
}

export default useQuickClash
