// customHooks/useQuickClashSocket.js
import { useState, useCallback, useRef, useEffect } from 'react'
import { useSocket } from './useSocket'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchActiveChallenges,
  setChallengeAnalysisLoading,
  setChallengeAnalysis,
  setSocketListening,
  fetchUserTrophies,
  fetchUserStats,
} from '../redux/quickClashSlice'
import { addNoteMessageIfAllowed } from '../redux/appSlice'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import { updateTaskProgressDirectInRedux } from '../redux/quickClashDailyTasksSlice'
import { fetchTeamBattleDetails } from '../redux/quickClashTeamBattleSlice'

/**
 * Enhanced custom hook for managing Quick Clash socket events with device fingerprinting
 * Simplified to work with consolidated socket handling in quickClashSocket.utils.js
 * @returns {Object} Quick Clash socket event handlers and state
 */
const useQuickClashSocket = () => {
  const {
    socket,
    getSocket,
    emitWithDeviceContext,
    addEventListener,
    deviceFingerprint,
    deviceConflictDetected,
    isSocketReady,
  } = useSocket()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation('QuickClash')

  // Ref to track initialization status and cleanup functions
  const initAttemptedRef = useRef(false)
  const eventCleanupFunctions = useRef([])

  // State for tracking socket events
  const [lastEvent, setLastEvent] = useState(null)
  const [deviceConflictCount, setDeviceConflictCount] = useState(0)
  const isListening = useSelector(state => state.quickClash.socketListening)
  const { user } = useSelector(state => state.auth)
  const userId = user?._id

  // Handle device conflicts
  useEffect(() => {
    if (deviceConflictDetected) {
      setDeviceConflictCount(prev => prev + 1)

      // Add note message for device conflict
      dispatch(
        addNoteMessageIfAllowed({
          id: uuidv4(),
          messageType: 'system',
          eventType: 'deviceConflict',
          data: {
            message: t('Another device/tab is using your account'),
            deviceFingerprint,
          },
          duration: 8000,
          width: '350px',
        }),
      )
    }
  }, [deviceConflictDetected, deviceFingerprint, dispatch, t])

  // Initialize and setup socket handlers
  const initializeQuickClashSocket = useCallback(() => {
    // Prevent duplicate initialization attempts
    if (isListening || initAttemptedRef.current) {
      console.log(
        '[QC_SOCKET_HOOK] Already listening or initialization attempted, skipping',
      )
      return
    }

    // Mark that we've attempted initialization
    initAttemptedRef.current = true

    if (!isSocketReady()) {
      console.warn(
        '[QC_SOCKET_HOOK] Socket not ready for Quick Clash initialization',
      )

      // Reset the attempted flag to allow future attempts
      setTimeout(() => {
        initAttemptedRef.current = false
      }, 500)

      return
    }

    console.log('[QC_SOCKET_HOOK] Initializing Quick Clash socket listeners')

    // Clean up any existing listeners first
    cleanupSocketListeners()

    // Set up event listeners with device context
    setupSocketListeners()

    // Join the quick clash notification room with device context
    emitWithDeviceContext('quickClash:join')

    // Mark as listening
    dispatch(setSocketListening(true))

    console.log('[QC_SOCKET_HOOK] Quick Clash socket initialization completed')
  }, [isSocketReady, isListening, dispatch, emitWithDeviceContext])

  // Set up socket event listeners with device awareness
  const setupSocketListeners = useCallback(() => {
    const cleanupFunctions = []

    console.log('[QC_SOCKET_HOOK] Setting up Quick Clash socket listeners')

    // New challenge received
    const cleanupNewChallenge = addEventListener(
      'quickClash:newChallenge',
      data => {
        console.log('[QC_SOCKET_HOOK] New challenge received:', data)
        setLastEvent({ type: 'newChallenge', data, timestamp: new Date() })

        // Add to note message queue for in-app notification
        dispatch(
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
        dispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupNewChallenge)

    // Challenger notified
    const cleanupChallengerNotified = addEventListener(
      'quickClash:challengerNotified',
      data => {
        console.log('[QC_SOCKET_HOOK] Challenger notified:', data)
        setLastEvent({
          type: 'challengerNotified',
          data,
          timestamp: new Date(),
        })

        if (data.success) {
          // Add to note message queue for success notification
          dispatch(
            addNoteMessageIfAllowed({
              id: uuidv4(),
              messageType: 'quickClash',
              eventType: 'challengeCreated',
              data: data,
              duration: 8000,
              width: '350px',
            }),
          )
        } else {
          // Add to note message queue for failure notification
          dispatch(
            addNoteMessageIfAllowed({
              id: uuidv4(),
              messageType: 'quickClash',
              eventType: 'challengeCreateFailed',
              data: {
                ...data,
                errorMessage: data.errorMessage || t('Unknown error'),
              },
              duration: 8000,
              width: '350px',
            }),
          )
        }

        // Refresh active challenges list in either case
        dispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupChallengerNotified)

    // Challenge accepted
    const cleanupChallengeAccepted = addEventListener(
      'quickClash:challengeAccepted',
      data => {
        console.log('[QC_SOCKET_HOOK] Challenge accepted:', data)
        setLastEvent({ type: 'challengeAccepted', data, timestamp: new Date() })

        // Add to note message queue
        dispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'challengeAccepted',
            data: data,
            duration: 10000,
            width: '350px',
          }),
        )

        // Refresh active challenges list
        dispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupChallengeAccepted)

    // Challenge rejected
    const cleanupChallengeRejected = addEventListener(
      'quickClash:challengeRejected',
      data => {
        console.log('[QC_SOCKET_HOOK] Challenge rejected:', data)
        setLastEvent({ type: 'challengeRejected', data, timestamp: new Date() })

        // Add to note message queue
        dispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'challengeRejected',
            data: data,
            duration: 8000,
            width: '350px',
          }),
        )

        // Refresh active challenges list
        dispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupChallengeRejected)

    // Team battle refetch
    const cleanupTeamBattleRefetch = addEventListener(
      'quickClash:teamBattleRefetch',
      data => {
        console.log('[QC_SOCKET_HOOK] Team battle refetch:', data)
        if (data.battleId) {
          dispatch(fetchTeamBattleDetails(data.battleId))
        }
      },
    )
    cleanupFunctions.push(cleanupTeamBattleRefetch)

    // Challenge completed
    const cleanupChallengeCompleted = addEventListener(
      'quickClash:challengeCompleted',
      data => {
        console.log('[QC_SOCKET_HOOK] Challenge completed:', data)
        setLastEvent({
          type: 'challengeCompleted',
          data,
          timestamp: new Date(),
        })

        // Add to note message queue
        dispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'challengeCompleted',
            data: data,
            duration: 10000,
            width: '350px',
          }),
        )

        // Refresh active challenges list
        dispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupChallengeCompleted)

    // Challenge completed by both players
    const cleanupChallengeCompletedByBoth = addEventListener(
      'quickClash:challengeCompletedByBothPlayers',
      data => {
        console.log(
          '[QC_SOCKET_HOOK] Challenge completed by both players:',
          data,
        )

        // Add to note message queue
        if (data.completedByUserId != userId) {
          dispatch(
            addNoteMessageIfAllowed({
              id: uuidv4(),
              messageType: 'quickClash',
              eventType: 'challengeCompletedByBothPlayers',
              data: data,
              duration: 10000,
              width: '350px',
            }),
          )

          if (data.battleId) {
            dispatch(fetchTeamBattleDetails(data.battleId))
          }
          // Refresh active challenges list
          dispatch(fetchActiveChallenges())
          dispatch(fetchUserTrophies())
          dispatch(fetchUserStats())
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
              dispatch(updateTaskProgressDirectInRedux(task))
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
        console.log('[QC_SOCKET_HOOK] Analysis ready:', data)
        setLastEvent({ type: 'analysisReady', data, timestamp: new Date() })

        // Add to note message queue
        dispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'analysisReady',
            data: data,
            duration: 10000,
            width: '350px',
          }),
        )

        // Update the analysis state if needed
        dispatch(
          setChallengeAnalysisLoading({
            challengeId: data.challengeId,
            isLoading: false,
          }),
        )
      },
    )
    cleanupFunctions.push(cleanupAnalysisReady)

    // Handle socket reconnection
    const cleanupReconnect = addEventListener('reconnect', () => {
      console.log('[QC_SOCKET_HOOK] Socket reconnected, re-initializing...')

      // Reset the initialization flag
      initAttemptedRef.current = false
      dispatch(setSocketListening(false))

      // Re-initialize after a short delay
      setTimeout(() => {
        initializeQuickClashSocket()
      }, 1000)
    })
    cleanupFunctions.push(cleanupReconnect)

    // Store cleanup functions for later use
    eventCleanupFunctions.current = cleanupFunctions

    console.log('[QC_SOCKET_HOOK] Socket listeners setup completed')
  }, [
    addEventListener,
    dispatch,
    t,
    fetchActiveChallenges,
    userId,
    initializeQuickClashSocket,
  ])

  // Clean up event listeners
  const cleanupSocketListeners = useCallback(() => {
    console.log('[QC_SOCKET_HOOK] Cleaning up socket listeners')

    // Clean up all registered event listeners
    eventCleanupFunctions.current.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    })
    eventCleanupFunctions.current = []

    // Reset state
    initAttemptedRef.current = false
    dispatch(setSocketListening(false))
  }, [dispatch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSocketListeners()
    }
  }, [cleanupSocketListeners])

  // Enhanced emit functions with device context
  const emitChallengeCreated = useCallback(
    data => {
      if (isSocketReady()) {
        try {
          emitWithDeviceContext('quickClash:createChallenge', data)
          console.log('[QC_SOCKET_HOOK] Emitted quickClash:createChallenge')
        } catch (error) {
          console.error(
            '[QC_SOCKET_HOOK] Error emitting quickClash:createChallenge:',
            error,
          )
        }
      } else {
        console.warn(
          '[QC_SOCKET_HOOK] Socket not ready, unable to emit quickClash:createChallenge',
        )
      }
    },
    [isSocketReady, emitWithDeviceContext],
  )

  const emitChallengeAccepted = useCallback(
    data => {
      if (isSocketReady()) {
        try {
          emitWithDeviceContext('quickClash:acceptChallenge', data)
          console.log('[QC_SOCKET_HOOK] Emitted quickClash:acceptChallenge')
        } catch (error) {
          console.error(
            '[QC_SOCKET_HOOK] Error emitting quickClash:acceptChallenge:',
            error,
          )
        }
      } else {
        console.warn(
          '[QC_SOCKET_HOOK] Socket not ready, unable to emit quickClash:acceptChallenge',
        )
      }
    },
    [isSocketReady, emitWithDeviceContext],
  )

  const emitChallengeRejected = useCallback(
    data => {
      if (isSocketReady()) {
        try {
          emitWithDeviceContext('quickClash:rejectChallenge', data)
          console.log('[QC_SOCKET_HOOK] Emitted quickClash:rejectChallenge')
        } catch (error) {
          console.error(
            '[QC_SOCKET_HOOK] Error emitting quickClash:rejectChallenge:',
            error,
          )
        }
      } else {
        console.warn(
          '[QC_SOCKET_HOOK] Socket not ready, unable to emit quickClash:rejectChallenge',
        )
      }
    },
    [isSocketReady, emitWithDeviceContext],
  )

  const emitChallengeCompleted = useCallback(
    data => {
      if (isSocketReady()) {
        try {
          emitWithDeviceContext('quickClash:completeChallenge', data)
          console.log('[QC_SOCKET_HOOK] Emitted quickClash:completeChallenge')
        } catch (error) {
          console.error(
            '[QC_SOCKET_HOOK] Error emitting quickClash:completeChallenge:',
            error,
          )
        }
      } else {
        console.warn(
          '[QC_SOCKET_HOOK] Socket not ready, unable to emit quickClash:completeChallenge',
        )
      }
    },
    [isSocketReady, emitWithDeviceContext],
  )

  const emitAnalysisReady = useCallback(
    data => {
      if (isSocketReady()) {
        try {
          emitWithDeviceContext('quickClash:analysisReady', data)
          console.log('[QC_SOCKET_HOOK] Emitted quickClash:analysisReady')
        } catch (error) {
          console.error(
            '[QC_SOCKET_HOOK] Error emitting quickClash:analysisReady:',
            error,
          )
        }
      } else {
        console.warn(
          '[QC_SOCKET_HOOK] Socket not ready, unable to emit quickClash:analysisReady',
        )
      }
    },
    [isSocketReady, emitWithDeviceContext],
  )

  // Enhanced join room functions with device context
  const joinQuickClashRoom = useCallback(() => {
    if (isSocketReady()) {
      emitWithDeviceContext('quickClash:join')
      console.log('[QC_SOCKET_HOOK] Joined Quick Clash room')
    }
  }, [isSocketReady, emitWithDeviceContext])

  const joinTeamsRoom = useCallback(() => {
    if (isSocketReady()) {
      emitWithDeviceContext('quickClash:joinTeamsRoom')
      console.log('[QC_SOCKET_HOOK] Joined teams room')
    }
  }, [isSocketReady, emitWithDeviceContext])

  const viewTeamBattles = useCallback(() => {
    if (isSocketReady()) {
      emitWithDeviceContext('quickClash:viewTeamBattles')
      console.log('[QC_SOCKET_HOOK] Viewing team battles')
    }
  }, [isSocketReady, emitWithDeviceContext])

  return {
    // State
    isListening,
    lastEvent,
    deviceFingerprint,
    deviceConflictDetected,
    deviceConflictCount,
    isSocketReady: isSocketReady(),

    // Core functions
    initializeQuickClashSocket,
    cleanupSocketListeners,

    // Enhanced emit functions with device context
    emitChallengeCreated,
    emitChallengeAccepted,
    emitChallengeRejected,
    emitChallengeCompleted,
    emitAnalysisReady,

    // Room management with device context
    joinQuickClashRoom,
    joinTeamsRoom,
    viewTeamBattles,

    // Generic emit with device context
    emitWithDeviceContext,
  }
}

export default useQuickClashSocket
