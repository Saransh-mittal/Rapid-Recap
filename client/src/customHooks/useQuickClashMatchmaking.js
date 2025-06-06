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
  setMatchmakingError,
} from '../redux/quickClashMatchmakingSlice'
import { useSocket } from './useSocket'
import { fetchActiveChallenges } from '../redux/quickClashSlice'
import { addNoteMessageIfAllowed } from '../redux/appSlice'
import { v4 as uuidv4 } from 'uuid'

/**
 * Enhanced custom hook for Quick Clash matchmaking with consolidated socket event handling
 * Works with the consolidated socket handlers in quickClashSocket.utils.js
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

    // FIXED: Enhanced match found listener with deduplication and proper data structure
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

        // FIXED: Ensure proper data structure with opponent information
        const properPreparationData = {
          opponent: data?.opponent,
          tempChallengeId: data.tempChallengeId,
          isChallenger: data.isChallenger,
        }

        // IMMEDIATELY set match preparation state with proper data structure
        dispatch(setPreparingChallenge(properPreparationData))

        // Show notification
        toast({
          title: t('Match Found!'),
          description: t('Opponent found! Preparing challenge...'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        // Add note message
        dispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'matchFound',
            data: properPreparationData,
            duration: 5000,
            width: '350px',
          }),
        )
      },
    )
    cleanupFunctions.push(cleanupMatchFound)

    // FIXED: Enhanced challenge progress listener with better progress mapping and data preservation
    const cleanupChallengeProgress = addEventListener(
      'quickClash:challengeProgress',
      data => {
        if (!isComponentMountedRef.current) return

        console.log('[MM_HOOK] Challenge progress received:', data)

        // FIXED: Only set preparation state if we don't have it AND preserve existing opponent data
        if (!preparingChallenge && data.progress > 0) {
          console.log(
            '[MM_HOOK] Setting minimal preparation state from progress event',
          )
          // Don't override with minimal data, just set a flag that we're preparing
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

    // FIXED: Enhanced challenge ready listener
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

        // Show success notification
        toast({
          title: t('Challenge Ready!'),
          description: t('Your challenge is ready to play!'),
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        // Add interactive note message
        dispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'challengeReady',
            data: {
              challengeId: data.challengeId,
            },
            duration: 10000,
            width: '350px',
            actions: [
              {
                text: t('Play Now'),
                actionType: 'NAVIGATE',
                route: `/quickclash/session/${data.challengeId}`,
              },
            ],
          }),
        )
      },
    )
    cleanupFunctions.push(cleanupChallengeReady)

    // NEW: Enhanced match creation failed listener
    const cleanupMatchCreationFailed = addEventListener(
      'quickClash:matchCreationFailed',
      data => {
        if (!isComponentMountedRef.current) return

        console.error('[MM_HOOK] Match creation failed event received:', data)

        // Clear preparation state
        dispatch(clearPreparationState())

        // Set error state
        dispatch(
          setMatchmakingError(data.error || 'Failed to create challenge'),
        )

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

        // Add error note message
        dispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'system',
            eventType: 'error',
            data: {
              message: t('Challenge creation failed'),
              error: data.error,
            },
            duration: 8000,
            width: '350px',
          }),
        )
      },
    )
    cleanupFunctions.push(cleanupMatchCreationFailed)

    // Listen for joined matchmaking confirmation
    const cleanupJoinedMatchmaking = addEventListener(
      'quickClash:joinedMatchmaking',
      data => {
        if (!isComponentMountedRef.current) return
        console.log('[MM_HOOK] Joined matchmaking confirmation received:', data)

        // Ensure we're marked as in matchmaking
        if (!inMatchmaking) {
          dispatch(setInMatchmaking(true))
        }
      },
    )
    cleanupFunctions.push(cleanupJoinedMatchmaking)

    // Listen for left matchmaking confirmation
    const cleanupLeftMatchmaking = addEventListener(
      'quickClash:leftMatchmaking',
      data => {
        if (!isComponentMountedRef.current) return
        console.log('[MM_HOOK] Left matchmaking confirmation received:', data)

        // Clear all matchmaking state
        dispatch(setInMatchmaking(false))
        dispatch(clearPreparationState())
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

    // Enhanced reconnection handling
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

    // Enhanced disconnect handling
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

  // Enhanced function to join matchmaking
  const handleJoinMatchmaking = useCallback(() => {
    // Clear any previous errors
    dispatch(clearMatchmakingError())
    dispatch(clearChallengeError())
    dispatch(clearPreparationState())

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

  // Enhanced function to leave matchmaking
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

        // Clear all preparation states
        dispatch(clearPreparationState())

        // Reset room joined flag
        matchmakingRoomJoined.current = false

        return result
      })
      .catch(error => {
        console.error('[MM_HOOK] Error leaving matchmaking:', error)
        throw error
      })
  }, [dispatch, isSocketReady, emitWithDeviceContext])

  // Navigation helper
  const navigateToChallenge = useCallback(
    challengeId => {
      if (challengeId) {
        console.log(`[MM_HOOK] Navigating to challenge: ${challengeId}`)
        navigate(`/quickclash/session/${challengeId}`)

        // Clear preparation state after navigation
        dispatch(clearPreparationState())
      }
    },
    [navigate, dispatch],
  )

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

    // State management
    clearChallengeError: () => dispatch(clearChallengeError()),
    clearMatchmakingError: () => dispatch(clearMatchmakingError()),
    clearPreparationState: () => dispatch(clearPreparationState()),

    // Socket management
    setupSocketListeners,
    cleanupSocketListeners,
  }
}

export default useQuickClashMatchmaking
