// customHooks/useQuickClashMatchmaking.js
import { useCallback, useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  joinMatchmaking,
  leaveMatchmaking,
  getMatchmakingStatus,
  setSocketConnected,
  setPreparingChallenge,
  setPreparationProgress,
  setPreparationStep,
  setMatchChallengeReady,
  setChallengeReady,
  setInMatchmaking,
  clearChallengeError,
  clearMatchmakingError,
  clearPreparationState,
  clearMatchmakingAfterChallengeReady,
  clearMatchmakingAfterModalClose,
  resetMatchmakingState,
  setMatchmakingError,
} from '../redux/quickClashMatchmakingSlice'
import { useSocket } from './useSocket'
import { fetchActiveChallenges } from '../redux/quickClashSlice'

/**
 * Enhanced custom hook for Quick Clash matchmaking with comprehensive state cleanup
 * @returns {Object} Matchmaking state and functions
 */
const useQuickClashMatchmaking = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {
    getSocket,
    emitWithDeviceContext,
    addEventListener,
    deviceFingerprint,
    isSocketReady,
  } = useSocket()
  const toast = useToast()
  const { t } = useTranslation('QuickClash')

  // Get current user ID
  const { user } = useSelector(state => state.auth)
  const userId = user?._id?.toString()

  // Refs for cleanup and component lifecycle
  const eventCleanupFunctions = useRef([])
  const isComponentMountedRef = useRef(true)
  const matchmakingRoomJoined = useRef(false)
  const lastEventTimestamp = useRef(0)
  const socketListenersSetup = useRef(false)

  // Redux state selectors
  const {
    inMatchmaking,
    matchmakingEntry,
    matchmakingLoading,
    matchmakingError,
    challengeCreating,
    challengeCreationResult,
    challengeCreationError,
    socketConnected,
    challengeCreationData,
    challengeReady,
    preparingChallenge,
    preparationProgress,
    preparationStep,
    showSearchModal,
    showPreparationModal,
  } = useSelector(state => state.quickClashMatchmaking)

  // Component lifecycle management
  useEffect(() => {
    isComponentMountedRef.current = true
    return () => {
      isComponentMountedRef.current = false
      cleanupSocketListeners()
    }
  }, [])

  // NOTE: Removed automatic cleanup when reaching 100% - let user decide when to proceed
  // Cleanup only happens based on explicit user actions (minimize, close, play now)

  // Debug logging for state changes
  useEffect(() => {
    console.log('[MM_HOOK] State update:', {
      inMatchmaking,
      preparingChallenge: !!preparingChallenge,
      challengeReady: !!challengeReady,
      preparationProgress,
      preparationStep,
      socketConnected,
      socketListenersSetup: socketListenersSetup.current,
    })
  }, [
    inMatchmaking,
    preparingChallenge,
    challengeReady,
    preparationProgress,
    preparationStep,
    socketConnected,
  ])

  // Enhanced socket listeners setup with device awareness
  const setupSocketListeners = useCallback(() => {
    if (!isSocketReady()) {
      console.warn('[MM_HOOK] Socket not ready for matchmaking listeners setup')
      return
    }

    if (socketListenersSetup.current) {
      console.log('[MM_HOOK] Socket listeners already setup, skipping')
      return
    }

    console.log('[MM_HOOK] Setting up 1v1 matchmaking socket listeners')

    // Clean up any existing listeners first to avoid duplicates
    cleanupSocketListeners()

    const cleanupFunctions = []

    // Join matchmaking room with device context if not already joined
    if (!matchmakingRoomJoined.current) {
      emitWithDeviceContext('quickClash:joinMatchmakingRoom')
      matchmakingRoomJoined.current = true
      console.log(`[MM_HOOK] Joined matchmaking room for user ${userId}`)
    }

    // Set connected status
    dispatch(setSocketConnected(true))

    // ENHANCED: Match found listener with comprehensive data handling
    const cleanupMatchFound = addEventListener(
      'quickClash:matchFound',
      data => {
        if (!isComponentMountedRef.current) return

        // Prevent duplicate events
        const now = Date.now()
        if (now - lastEventTimestamp.current < 1000) {
          console.log('[MM_HOOK] Ignoring duplicate matchFound event')
          return
        }
        lastEventTimestamp.current = now

        console.log('[MM_HOOK] Match found event received:', data)

        // Ensure proper data structure with opponent information
        const properPreparationData = {
          opponent: data?.opponent,
          tempChallengeId: data.tempChallengeId,
          isChallenger: data.isChallenger,
        }

        // IMMEDIATELY set match preparation state with proper data structure
        dispatch(setPreparingChallenge(properPreparationData))
      },
    )
    cleanupFunctions.push(cleanupMatchFound)

    // ENHANCED: Challenge progress listener with better progress mapping
    const cleanupChallengeProgress = addEventListener(
      'quickClash:challengeProgress',
      data => {
        if (!isComponentMountedRef.current) return

        console.log('[MM_HOOK] Challenge progress received:', data)

        // Only set preparation state if we don't have it AND preserve existing opponent data
        if (!preparingChallenge && data.progress > 0) {
          console.log(
            '[MM_HOOK] Setting minimal preparation state from progress event',
          )
          dispatch(setPreparationProgress(data.progress))
          dispatch(setPreparationStep(data.step || 'contentLoading'))
        } else {
          // Update progress without changing the opponent data
          if (data.progress !== undefined) {
            dispatch(setPreparationProgress(data.progress))
          }

          if (data.step) {
            dispatch(setPreparationStep(data.step))

            // Auto-progress based on step
            const stepProgressMap = {
              matchFound: 5,
              contentLoading: 25,
              generatingQuiz: 70,
              challengeReady: 100,
            }

            if (stepProgressMap[data.step]) {
              dispatch(setPreparationProgress(stepProgressMap[data.step]))
            }
          }
        }
      },
    )
    cleanupFunctions.push(cleanupChallengeProgress)

    // ENHANCED: Challenge ready listener with NO automatic cleanup
    const cleanupChallengeReady = addEventListener(
      'quickClash:matchChallengeReady',
      data => {
        if (!isComponentMountedRef.current) return

        console.log('[MM_HOOK] Match challenge ready event received:', data)

        // Update Redux state with the real challenge
        dispatch(setMatchChallengeReady(data))
        dispatch(setPreparationProgress(100))
        dispatch(setPreparationStep('challengeReady'))

        // Refresh active challenges list
        dispatch(fetchActiveChallenges())

        // NOTE: No automatic cleanup here - let user decide when to proceed
      },
    )
    cleanupFunctions.push(cleanupChallengeReady)

    // ENHANCED: Match creation failed listener with comprehensive cleanup
    const cleanupMatchCreationFailed = addEventListener(
      'quickClash:matchCreationFailed',
      data => {
        if (!isComponentMountedRef.current) return

        console.error('[MM_HOOK] Match creation failed event received:', data)

        // Clear all preparation and matchmaking state
        dispatch(resetMatchmakingState())

        // Show error notification
        toast({
          title: t('Challenge Creation Failed'),
          description: t(
            'Something went wrong while creating your challenge. Please try again.',
          ),
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      },
    )
    cleanupFunctions.push(cleanupMatchCreationFailed)

    // ENHANCED: Joined matchmaking confirmation
    const cleanupJoinedMatchmaking = addEventListener(
      'quickClash:joinedMatchmaking',
      data => {
        if (!isComponentMountedRef.current) return
        console.log('[MM_HOOK] Joined matchmaking confirmation received:', data)

        // Clear any previous states and ensure we're marked as in matchmaking
        dispatch(clearPreparationState())
        if (!inMatchmaking) {
          dispatch(setInMatchmaking(true))
        }
      },
    )
    cleanupFunctions.push(cleanupJoinedMatchmaking)

    // ENHANCED: Left matchmaking confirmation with full cleanup
    const cleanupLeftMatchmaking = addEventListener(
      'quickClash:leftMatchmaking',
      data => {
        if (!isComponentMountedRef.current) return
        console.log('[MM_HOOK] Left matchmaking confirmation received:', data)

        // Complete state reset when leaving matchmaking
        dispatch(resetMatchmakingState())
      },
    )
    cleanupFunctions.push(cleanupLeftMatchmaking)

    // Enhanced error handling
    const cleanupError = addEventListener('quickClash:error', data => {
      if (!isComponentMountedRef.current) return
      console.error('[MM_HOOK] Socket error received:', data)

      dispatch(setMatchmakingError(data.message || 'An error occurred'))

      toast({
        title: t('Matchmaking Error'),
        description: data.message || t('An error occurred'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    })
    cleanupFunctions.push(cleanupError)

    // ENHANCED: Reconnection handling with state preservation
    const cleanupReconnect = addEventListener('reconnect', () => {
      if (!isComponentMountedRef.current) return

      console.log(
        '[MM_HOOK] Socket reconnected, re-checking matchmaking status',
      )

      // Reset room joined flag to rejoin rooms
      matchmakingRoomJoined.current = false
      socketListenersSetup.current = false

      // Clear any connection errors
      dispatch(clearMatchmakingError())

      // Re-check matchmaking status after a delay
      setTimeout(() => {
        if (isComponentMountedRef.current) {
          checkMatchmakingStatus()
          // Re-setup listeners
          setupSocketListeners()
        }
      }, 1000)
    })
    cleanupFunctions.push(cleanupReconnect)

    // ENHANCED: Disconnect handling with state cleanup
    const cleanupDisconnect = addEventListener('disconnect', () => {
      if (!isComponentMountedRef.current) return

      console.log('[MM_HOOK] Socket disconnected')
      dispatch(setSocketConnected(false))
      matchmakingRoomJoined.current = false
      socketListenersSetup.current = false
    })
    cleanupFunctions.push(cleanupDisconnect)

    // Store cleanup functions for later use
    eventCleanupFunctions.current = cleanupFunctions
    socketListenersSetup.current = true

    console.log(`[MM_HOOK] Socket listeners setup completed for user ${userId}`)
  }, [
    isSocketReady,
    emitWithDeviceContext,
    addEventListener,
    userId,
    dispatch,
    toast,
    t,
    inMatchmaking,
    preparingChallenge,
  ])

  // Clean up socket event listeners
  const cleanupSocketListeners = useCallback(() => {
    console.log('[MM_HOOK] Cleaning up socket listeners')

    // Clean up all registered event listeners
    eventCleanupFunctions.current.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    })
    eventCleanupFunctions.current = []

    // Reset flags
    matchmakingRoomJoined.current = false
    socketListenersSetup.current = false
    dispatch(setSocketConnected(false))

    console.log(`[MM_HOOK] Socket listeners cleaned up for user ${userId}`)
  }, [dispatch, userId])

  // Function to check matchmaking status
  const checkMatchmakingStatus = useCallback(() => {
    return dispatch(getMatchmakingStatus())
      .unwrap()
      .then(result => {
        console.log('[MM_HOOK] Matchmaking status checked:', result)

        // Clear any errors on successful status check
        dispatch(clearMatchmakingError())

        return result
      })
      .catch(error => {
        console.error('[MM_HOOK] Error checking matchmaking status:', error)
        dispatch(setMatchmakingError(error))
      })
  }, [dispatch])

  // Initialize socket connection for matchmaking
  useEffect(() => {
    // Only attempt socket initialization if we have a userId
    if (!userId) {
      console.warn(
        '[MM_HOOK] No user ID available for matchmaking socket setup',
      )
      return
    }

    if (!isSocketReady()) {
      console.warn('[MM_HOOK] Socket not ready for matchmaking')
      dispatch(setSocketConnected(false))
      return
    }

    // Set up socket listeners and connections
    setupSocketListeners()

    // Check status on connection
    checkMatchmakingStatus()

    // Cleanup function
    return () => {
      cleanupSocketListeners()
    }
  }, [
    userId,
    isSocketReady,
    setupSocketListeners,
    cleanupSocketListeners,
    checkMatchmakingStatus,
    dispatch,
  ])

  // Handle errors with toast notifications
  useEffect(() => {
    if (matchmakingError) {
      toast({
        title: t('Matchmaking Error'),
        description: matchmakingError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [matchmakingError, toast, t])

  useEffect(() => {
    if (challengeCreationError) {
      toast({
        title: t('Challenge Creation Error'),
        description: challengeCreationError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })

      // Clear the error after showing it
      dispatch(clearChallengeError())
    }
  }, [challengeCreationError, toast, t, dispatch])

  // ENHANCED: Function to join matchmaking with comprehensive cleanup
  const handleJoinMatchmaking = useCallback(() => {
    // Clear any previous errors and states
    dispatch(clearMatchmakingError())
    dispatch(clearChallengeError())
    dispatch(resetMatchmakingState()) // Full reset before joining

    console.log('[MM_HOOK] Attempting to join matchmaking')

    return dispatch(joinMatchmaking())
      .unwrap()
      .then(result => {
        console.log('[MM_HOOK] Successfully joined matchmaking:', result)

        // Emit socket event to join matchmaking room
        if (isSocketReady() && result) {
          // This will trigger the server to emit confirmation back
          emitWithDeviceContext('quickClash:joinMatchmaking')
          console.log('[MM_HOOK] Emitted joinMatchmaking socket event')
        }

        return result
      })
      .catch(error => {
        console.error('[MM_HOOK] Error joining matchmaking:', error)

        // The error is already set in Redux by the rejected case
        throw error
      })
  }, [dispatch, isSocketReady, emitWithDeviceContext])

  // ENHANCED: Function to leave matchmaking with comprehensive cleanup
  const handleLeaveMatchmaking = useCallback(() => {
    console.log('[MM_HOOK] Attempting to leave matchmaking')

    return dispatch(leaveMatchmaking())
      .unwrap()
      .then(result => {
        console.log('[MM_HOOK] Successfully left matchmaking:', result)

        // Emit socket event to leave matchmaking room
        if (isSocketReady()) {
          emitWithDeviceContext('quickClash:leaveMatchmaking')
          console.log('[MM_HOOK] Emitted leaveMatchmaking socket event')
        }

        // Complete reset after leaving
        dispatch(resetMatchmakingState())

        // Reset refs
        matchmakingRoomJoined.current = false

        return result
      })
      .catch(error => {
        console.error('[MM_HOOK] Error leaving matchmaking:', error)
        throw error
      })
  }, [dispatch, isSocketReady, emitWithDeviceContext])

  // ENHANCED: Navigation helper with state cleanup
  const navigateToChallenge = useCallback(
    challengeId => {
      if (challengeId) {
        console.log(`[MM_HOOK] Navigating to challenge: ${challengeId}`)

        // Clear all matchmaking states before navigation
        dispatch(clearMatchmakingAfterChallengeReady())

        // Navigate to challenge
        navigate(`/quickclash/session/${challengeId}`)
      }
    },
    [navigate, dispatch],
  )

  // ENHANCED: Manual cleanup functions
  const clearAllMatchmakingStates = useCallback(() => {
    console.log('[MM_HOOK] Manual cleanup of all matchmaking states')
    dispatch(resetMatchmakingState())
  }, [dispatch])

  const clearMatchmakingAfterChallenge = useCallback(() => {
    console.log('[MM_HOOK] Manual cleanup after challenge ready')
    dispatch(clearMatchmakingAfterChallengeReady())
  }, [dispatch])

  const clearMatchmakingAfterModal = useCallback(() => {
    console.log('[MM_HOOK] Manual cleanup after modal close')
    dispatch(clearMatchmakingAfterModalClose())
  }, [dispatch])

  return {
    // Core state
    inMatchmaking,
    matchmakingEntry,
    matchmakingLoading,
    matchmakingError,

    // Challenge states
    challengeCreating,
    challengeCreationResult,
    challengeCreationError,
    challengeCreationData,
    challengeReady,

    // Preparation flow
    preparingChallenge,
    preparationProgress,
    preparationStep,

    // UI state
    showSearchModal,
    showPreparationModal,

    // Connection state
    socketConnected,
    deviceFingerprint,
    isSocketReady: isSocketReady(),

    // Actions
    joinMatchmaking: handleJoinMatchmaking,
    leaveMatchmaking: handleLeaveMatchmaking,
    checkMatchmakingStatus,
    navigateToChallenge,

    // ENHANCED: State management with cleanup options (close available when ready)
    clearChallengeError: () => dispatch(clearChallengeError()),
    clearMatchmakingError: () => dispatch(clearMatchmakingError()),
    clearPreparationState: () => dispatch(clearPreparationState()),
    clearAllMatchmakingStates,
    clearMatchmakingAfterChallenge,
    clearMatchmakingAfterModal,

    // Socket management
    setupSocketListeners,
    cleanupSocketListeners,
  }
}

export default useQuickClashMatchmaking
