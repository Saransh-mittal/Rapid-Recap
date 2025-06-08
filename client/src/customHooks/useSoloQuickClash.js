// customHooks/useSoloQuickClash.js
import { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  fetchActiveChallenges,
  setChallengeAnalysisLoading,
  setChallengeAnalysis,
  fetchUserTrophies,
  fetchUserStats,
} from '../redux/quickClashSlice'
import { addNoteMessageIfAllowed } from '../redux/appSlice'
import { useSocket } from './useSocket'
import { v4 as uuidv4 } from 'uuid'
import { updateTaskProgressDirectInRedux } from '../redux/quickClashDailyTasksSlice'

/**
 * Enhanced custom hook for managing Solo Quick Clash (1v1) challenge events
 * Handles all 1v1 challenge-specific socket events and room management
 * @returns {Object} Solo Quick Clash socket event handlers and state
 */
const useSoloQuickClash = () => {
  const {
    getSocket,
    emitWithDeviceContext,
    addEventListener,
    deviceFingerprint,
    isSocketReady,
  } = useSocket()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useTranslation('QuickClash')

  // Refs for cleanup and component lifecycle
  const eventCleanupFunctions = useRef([])
  const isComponentMountedRef = useRef(true)
  const soloRoomJoined = useRef(false)
  const socketListenersSetup = useRef(false)

  // REMOVED: Debug console.log that was causing issues

  // Redux state selectors
  const { user } = useSelector(state => state.auth)
  const { socketListening: baseIsListening } = useSelector(
    state => state.quickClash,
  )
  const userId = user?._id

  // Component lifecycle management
  useEffect(() => {
    isComponentMountedRef.current = true
    return () => {
      isComponentMountedRef.current = false
      cleanupSocketListeners()
    }
  }, [])

  // FIXED: Stable cleanup function that doesn't change on every render
  const cleanupSocketListeners = useCallback(() => {
    console.log('[SOLO_QC] Cleaning up socket listeners')

    // Clean up all registered event listeners
    eventCleanupFunctions.current.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    })
    eventCleanupFunctions.current = []

    // Reset flags
    soloRoomJoined.current = false
    socketListenersSetup.current = false

    console.log(`[SOLO_QC] Socket listeners cleaned up for user ${userId}`)
  }, [userId]) // Only depends on userId

  // FIXED: Stable socket listeners setup with minimal dependencies
  const setupSoloSocketListeners = useCallback(() => {
    if (!isSocketReady()) {
      console.warn(
        '[SOLO_QC] Socket not ready for solo challenge listeners setup',
      )
      return
    }

    if (socketListenersSetup.current) {
      console.log('[SOLO_QC] Socket listeners already setup, skipping')
      return
    }

    console.log('[SOLO_QC] Setting up solo Quick Clash socket listeners')

    // Clean up any existing listeners first to avoid duplicates
    cleanupSocketListeners()

    const cleanupFunctions = []

    // Join solo challenges room with device context if not already joined
    if (!soloRoomJoined.current) {
      emitWithDeviceContext('quickClash:join')
      soloRoomJoined.current = true
      console.log(`[SOLO_QC] Joined solo challenges room for user ${userId}`)
    }

    // FIXED: Capture current values to avoid dependency issues
    const currentDispatch = dispatch
    const currentToast = toast
    const currentT = t
    const currentUserId = userId

    // New challenge received
    const cleanupNewChallenge = addEventListener(
      'quickClash:newChallenge',
      data => {
        if (!isComponentMountedRef.current) return

        console.log('[SOLO_QC] New challenge received:', data)

        // Add to note message queue for in-app notification
        currentDispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'newChallenge',
            data: data,
            duration: 10000,
            width: '350px',
          }),
        )

        // Refresh active challenges list
        currentDispatch(fetchActiveChallenges())

        // Show toast notification
        currentToast({
          title: currentT('New Challenge!'),
          description: currentT(
            '{{challenger}} has challenged you to a Quick Clash!',
            {
              challenger:
                data.challenger?.inGameName ||
                data.challenger?.name ||
                'Someone',
            },
          ),
          status: 'info',
          duration: 5000,
          isClosable: true,
        })
      },
    )
    cleanupFunctions.push(cleanupNewChallenge)

    // Challenger notified (challenge creation feedback)
    const cleanupChallengerNotified = addEventListener(
      'quickClash:challengerNotified',
      data => {
        if (!isComponentMountedRef.current) return

        console.log('[SOLO_QC] Challenger notified:', data)

        if (data.success) {
          // Add to note message queue for success notification
          currentDispatch(
            addNoteMessageIfAllowed({
              id: uuidv4(),
              messageType: 'quickClash',
              eventType: 'challengeCreated',
              data: data,
              duration: 8000,
              width: '350px',
            }),
          )

          currentToast({
            title: currentT('Challenge Sent!'),
            description: currentT('Your challenge has been sent successfully'),
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
        } else {
          // Add to note message queue for failure notification
          currentDispatch(
            addNoteMessageIfAllowed({
              id: uuidv4(),
              messageType: 'quickClash',
              eventType: 'challengeCreateFailed',
              data: {
                ...data,
                errorMessage: data.errorMessage || currentT('Unknown error'),
              },
              duration: 8000,
              width: '350px',
            }),
          )

          currentToast({
            title: currentT('Challenge Failed'),
            description:
              data.errorMessage || currentT('Failed to create challenge'),
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }

        // Refresh active challenges list in either case
        currentDispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupChallengerNotified)

    // Challenge accepted
    const cleanupChallengeAccepted = addEventListener(
      'quickClash:challengeAccepted',
      data => {
        if (!isComponentMountedRef.current) return

        console.log('[SOLO_QC] Challenge accepted:', data)

        // Add to note message queue
        currentDispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'challengeAccepted',
            data: data,
            duration: 10000,
            width: '350px',
          }),
        )

        // Show toast notification
        currentToast({
          title: currentT('Challenge Accepted!'),
          description: currentT('{{opponent}} has accepted your challenge!', {
            opponent:
              data.opponent?.inGameName ||
              data.opponent?.name ||
              'Your opponent',
          }),
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        // Refresh active challenges list
        currentDispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupChallengeAccepted)

    // Challenge rejected
    const cleanupChallengeRejected = addEventListener(
      'quickClash:challengeRejected',
      data => {
        if (!isComponentMountedRef.current) return

        console.log('[SOLO_QC] Challenge rejected:', data)

        // Add to note message queue
        currentDispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'challengeRejected',
            data: data,
            duration: 8000,
            width: '350px',
          }),
        )

        // Show toast notification
        currentToast({
          title: currentT('Challenge Rejected'),
          description: currentT('{{opponent}} has declined your challenge', {
            opponent:
              data.opponent?.inGameName ||
              data.opponent?.name ||
              'Your opponent',
          }),
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })

        // Refresh active challenges list
        currentDispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupChallengeRejected)

    // Challenge completed (one player finished)
    const cleanupChallengeCompleted = addEventListener(
      'quickClash:challengeCompleted',
      data => {
        if (!isComponentMountedRef.current) return

        console.log('[SOLO_QC] Challenge completed (one player):', data)

        // Add to note message queue
        currentDispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'challengeCompleted',
            data: data,
            duration: 10000,
            width: '350px',
          }),
        )

        // Show toast notification
        currentToast({
          title: currentT('Your Turn!'),
          description: currentT(
            'Your opponent has completed their challenge. Your turn now!',
          ),
          status: 'info',
          duration: 5000,
          isClosable: true,
        })

        // Refresh active challenges list
        currentDispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupChallengeCompleted)

    // Challenge completed by both players (final results)
    const cleanupChallengeCompletedByBoth = addEventListener(
      'quickClash:challengeCompletedByBothPlayers',
      data => {
        if (!isComponentMountedRef.current) return

        console.log('[SOLO_QC] Challenge completed by both players:', data)

        // Only show notification if this user didn't just complete it
        if (data.completedByUserId != currentUserId) {
          currentDispatch(
            addNoteMessageIfAllowed({
              id: uuidv4(),
              messageType: 'quickClash',
              eventType: 'challengeCompletedByBothPlayers',
              data: data,
              duration: 10000,
              width: '350px',
            }),
          )

          // Determine result for toast
          const userWon = data.userScore > data.opponentScore
          const isTie = data.userScore === data.opponentScore

          currentToast({
            title: isTie
              ? currentT('Challenge Tied!')
              : userWon
              ? currentT('Challenge Won!')
              : currentT('Challenge Lost!'),
            description: currentT(
              'Final score: You {{userScore}} - {{opponentScore}} {{opponent}}',
              {
                userScore: data.userScore,
                opponentScore: data.opponentScore,
                opponent:
                  data.opponent?.inGameName ||
                  data.opponent?.name ||
                  'Opponent',
              },
            ),
            status: isTie ? 'info' : userWon ? 'success' : 'warning',
            duration: 8000,
            isClosable: true,
          })

          // Refresh data
          currentDispatch(fetchActiveChallenges())
          currentDispatch(fetchUserTrophies())
          currentDispatch(fetchUserStats())
        }

        // Handle task updates
        if (data?.trackWinnerOutcomeResult?.tasksDone) {
          // Convert tasksDone object to array
          const tasksDoneArray = Object.keys(
            data.trackWinnerOutcomeResult.tasksDone,
          ).map(key => data.trackWinnerOutcomeResult.tasksDone[key])
          // Update task progress directly in redux
          tasksDoneArray.forEach(task => {
            if (task) {
              currentDispatch(updateTaskProgressDirectInRedux(task))
            }
          })
        }
      },
    )
    cleanupFunctions.push(cleanupChallengeCompletedByBoth)

    // Analysis ready
    const cleanupAnalysisReady = addEventListener(
      'quickClash:analysisReady',
      data => {
        if (!isComponentMountedRef.current) return

        console.log('[SOLO_QC] Analysis ready:', data)

        // Add to note message queue
        currentDispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'analysisReady',
            data: data,
            duration: 10000,
            width: '350px',
          }),
        )

        // Show toast notification
        currentToast({
          title: currentT('Analysis Ready!'),
          description: currentT('Your challenge analysis is ready to view'),
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        // Update the analysis state if needed
        currentDispatch(
          setChallengeAnalysisLoading({
            challengeId: data.challengeId,
            isLoading: false,
          }),
        )
      },
    )
    cleanupFunctions.push(cleanupAnalysisReady)

    // Enhanced reconnection handling
    const cleanupReconnect = addEventListener('reconnect', () => {
      if (!isComponentMountedRef.current) return

      console.log('[SOLO_QC] Socket reconnected, re-checking solo challenges')

      // Reset flags to allow re-setup
      soloRoomJoined.current = false
      socketListenersSetup.current = false

      // Re-setup listeners after a delay
      setTimeout(() => {
        if (isComponentMountedRef.current) {
          setupSoloSocketListeners()
        }
      }, 1000)
    })
    cleanupFunctions.push(cleanupReconnect)

    // Enhanced disconnect handling
    const cleanupDisconnect = addEventListener('disconnect', () => {
      if (!isComponentMountedRef.current) return

      console.log('[SOLO_QC] Socket disconnected')
      soloRoomJoined.current = false
      socketListenersSetup.current = false
    })
    cleanupFunctions.push(cleanupDisconnect)

    // Store cleanup functions for later use
    eventCleanupFunctions.current = cleanupFunctions
    socketListenersSetup.current = true

    console.log(`[SOLO_QC] Socket listeners setup completed for user ${userId}`)
  }, [
    isSocketReady,
    emitWithDeviceContext,
    addEventListener,
    userId,
    dispatch,
    toast,
    t,
    cleanupSocketListeners,
  ]) // FIXED: Keep dependencies but capture values inside the function

  // FIXED: Auto-initialize when conditions are met - with proper dependency array
  useEffect(() => {
    // Only auto-setup if:
    // 1. User is authenticated
    // 2. Socket is ready
    // 3. Base socket is listening
    // 4. Solo listeners not already setup
    console.log(
      `[SOLO_QC] Checking auto-initialization conditions: userId=${userId}, isSocketReady=${isSocketReady()}, baseIsListening=${baseIsListening}, socketListenersSetup=${
        socketListenersSetup.current
      }`,
    )
    if (
      userId &&
      isSocketReady() &&
      baseIsListening &&
      !socketListenersSetup.current
    ) {
      console.log('[SOLO_QC] Auto-initializing solo socket listeners')
      setupSoloSocketListeners()
    }
  }, [userId, baseIsListening]) // REMOVED: isSocketReady and setupSoloSocketListeners to prevent loops

  // FIXED: Separate effect to handle socket readiness
  useEffect(() => {
    // This effect only runs when socket readiness changes
    // It will trigger the above effect when socket becomes ready
    if (isSocketReady()) {
      console.log('[SOLO_QC] Socket is ready for solo listeners')
    }
  }, [isSocketReady])

  // Room management functions
  const joinSoloRoom = useCallback(() => {
    if (isSocketReady() && !soloRoomJoined.current) {
      emitWithDeviceContext('quickClash:join')
      soloRoomJoined.current = true
      console.log('[SOLO_QC] Joined solo Quick Clash room')
    }
  }, [isSocketReady, emitWithDeviceContext])

  return {
    // State
    deviceFingerprint,
    isSocketReady: isSocketReady(),
    soloRoomJoined: soloRoomJoined.current,
    socketListenersSetup: socketListenersSetup.current,

    // Actions
    setupSoloSocketListeners,
    cleanupSocketListeners,
    joinSoloRoom,
  }
}

export default useSoloQuickClash
