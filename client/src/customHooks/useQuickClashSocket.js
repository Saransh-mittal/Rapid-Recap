// customHooks/useQuickClashSocket.js - FIXED: Reliable reconnection detection
import { useCallback, useEffect, useRef } from 'react'
import { useSocket } from './useSocket'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { notificationManager } from '../utils/notifications'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

// Redux imports
import {
  setSocketConnected,
  setSocketListening,
  setSocketInitialized,
  setDeviceFingerprint,
  setRoomJoined,
  addSocketEvent,
  incrementReconnectCount,
  setConnectionError,
  setSocketError,
  clearErrors,
  resetSocketState,
} from '../redux/quickClashSocketSlice'

import { addNoteMessageIfAllowed, fetchAppUpdates } from '../redux/appSlice'
import {
  fetchActiveChallenges,
  setChallengeAnalysisLoading,
  fetchUserTrophies,
  fetchUserStats,
} from '../redux/quickClashSlice'
import { updateTaskProgressDirectInRedux } from '../redux/quickClashDailyTasksSlice'

// Matchmaking Redux imports
import {
  setSocketConnected as setMatchmakingSocketConnected,
  setPreparingChallenge,
  setPreparationProgress,
  setPreparationStep,
  setMatchChallengeReady,
  setInMatchmaking,
  clearChallengeError,
  clearMatchmakingError,
  resetMatchmakingState,
  setMatchmakingError,
} from '../redux/legacy/quickClashMatchmakingSlice'

// Global matchmaking Redux imports
import {
  setBattleReady,
  clearBattleReady,
  setSocketConnected as setGlobalMatchmakingSocketConnected,
  setBattleCreationError,
  setBattleCreationStatus,
  handleBattleCreationCleanup,
  handleTeamLeftMatchmaking,
  handleTeamReturnedToMatchmaking,
  handleTeamJoinedMatchmaking,
  setShouldRefetchTeams,
  setShouldCheckStatus,
  addStatusUpdate,
} from '../redux/quickClashGlobalMatchmakingSlice'

// Team battle Redux imports
import {
  fetchTeamBattles,
  fetchTeamBattleDetails,
  fetchUnclaimedBattles,
  setBattleReady as setTeamBattleReady,
  setInMatchmaking as setTeamInMatchmaking,
  setBattleEnding,
  clearBattleEnding,
} from '../redux/quickClashTeamBattleSlice'

/**
 * RELIABLE RECONNECTION DETECTION APPROACH:
 *
 * Instead of relying on Socket.IO's reconnection events, we:
 * 1. Track the connection state on each render
 * 2. Compare with previous state to detect transitions
 * 3. Identify reconnection as: was connected before → disconnected → connected again
 * 4. Use a simple flag to track if initial connection has occurred
 *
 * This approach is more reliable because it doesn't depend on event timing
 */
const useQuickClashSocket = () => {
  const {
    getSocket,
    emitWithDeviceContext,
    addEventListener,
    deviceFingerprint,
    deviceConflictDetected,
    isSocketReady,
    socketConnected,
  } = useSocket()

  const dispatch = useDispatch()
  const store = useStore()
  const navigate = useNavigate()
  const { t } = useTranslation('QuickClash')

  // Refs for managing lifecycle
  const eventCleanupFunctions = useRef([])
  const isInitializedRef = useRef(false)
  const isComponentMountedRef = useRef(true)

  // RELIABLE RECONNECTION TRACKING
  // These refs provide a simple, reliable way to detect reconnections
  const hasEverConnectedRef = useRef(false) // Tracks if we've ever had a successful connection
  const previousConnectionStateRef = useRef(false) // Tracks the previous connection state
  const reconnectionHandledRef = useRef(false) // Prevents duplicate reconnection handling
  const connectionCheckIntervalRef = useRef(null) // For periodic connection checks

  // Redux state selectors
  const socketState = useSelector(state => state.quickClashSocket)
  const { user } = useSelector(state => state.auth)
  const userId = user?._id

  // Component lifecycle
  useEffect(() => {
    isComponentMountedRef.current = true
    return () => {
      isComponentMountedRef.current = false
      cleanupSocketListeners()

      // Clear connection check interval
      if (connectionCheckIntervalRef.current) {
        clearInterval(connectionCheckIntervalRef.current)
      }
    }
  }, [])

  // Set device fingerprint in Redux when available
  useEffect(() => {
    if (
      deviceFingerprint &&
      deviceFingerprint !== socketState.deviceFingerprint
    ) {
      dispatch(setDeviceFingerprint(deviceFingerprint))
    }
  }, [deviceFingerprint, socketState.deviceFingerprint, dispatch])

  // Handle device conflicts
  useEffect(() => {
    if (deviceConflictDetected) {
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

  // Helper to get current state from store
  const getCurrentState = useCallback(() => {
    const state = store.getState()
    return {
      matchmakingState: state.quickClashMatchmaking,
      globalMatchmakingState: state.quickClashGlobalMatchmaking,
      teamBattleState: state.quickClashTeamBattle,
      authState: state.auth,
      appState: state.app,
    }
  }, [store])

  // Helper to log socket events
  const logSocketEvent = useCallback(
    (eventName, data) => {
      const currentState = getCurrentState()
      dispatch(
        addSocketEvent({
          eventName,
          data,
          userId: currentState.authState.user?._id,
        }),
      )
    },
    [dispatch, getCurrentState],
  )

  // Helper to join a room and update state
  const joinRoom = useCallback(
    (roomName, socketEvent) => {
      if (!socketState.rooms[roomName]) {
        emitWithDeviceContext(socketEvent)
        dispatch(setRoomJoined({ roomName, joined: true }))
        console.log(`[QC_SOCKET] Joined ${roomName} room`)
        logSocketEvent('room_joined', { roomName })
      }
    },
    [socketState.rooms, emitWithDeviceContext, dispatch, logSocketEvent],
  )

  // Cleanup all socket listeners
  const cleanupSocketListeners = useCallback(() => {
    console.log('[QC_SOCKET] Cleaning up all socket listeners')

    eventCleanupFunctions.current.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        try {
          cleanup()
        } catch (error) {
          console.warn('[QC_SOCKET] Error in cleanup function:', error)
        }
      }
    })
    eventCleanupFunctions.current = []

    dispatch(resetSocketState())
    isInitializedRef.current = false

    console.log('[QC_SOCKET] All socket listeners cleaned up')
  }, [dispatch])

  /**
   * Re-establish state after reconnection
   * This function is called when we detect a reconnection has occurred
   */
  const reestablishStateAfterReconnection = useCallback(() => {
    if (!isComponentMountedRef.current) return

    console.log('[QC_SOCKET] 🔄 Re-establishing state after reconnection...')

    // 1. Re-establish Redux connection states
    dispatch(setSocketConnected(true))
    dispatch(setSocketListening(true))
    dispatch(setMatchmakingSocketConnected(true))
    dispatch(setGlobalMatchmakingSocketConnected(true))

    console.log('[QC_SOCKET] ✅ Redux states re-established')

    // 2. Re-join all rooms (server-side membership is lost)
    // First reset room states
    dispatch(setRoomJoined({ roomName: 'quickClash', joined: false }))
    dispatch(setRoomJoined({ roomName: 'teams', joined: false }))
    dispatch(setRoomJoined({ roomName: 'matchmaking', joined: false }))

    // Then re-join rooms after a brief delay
    setTimeout(() => {
      console.log('[QC_SOCKET] Re-joining all rooms...')
      joinRoom('quickClash', 'quickClash:join')
      joinRoom('teams', 'quickClash:joinTeamsRoom')
      joinRoom('matchmaking', 'quickClash:joinMatchmakingRoom')
    }, 100)

    // 3. Refresh critical data
    console.log('[QC_SOCKET] Refreshing critical data...')
    dispatch(fetchActiveChallenges())

    // 4. Clear any stale errors
    dispatch(clearErrors())
    dispatch(clearChallengeError())
    dispatch(clearMatchmakingError())

    // 5. Show reconnection success notification
    notificationManager.success(t('Reconnected'), t('Successfully reconnected to server'))

    console.log('[QC_SOCKET] ✅ Reconnection state fully restored')
  }, [dispatch, joinRoom, t])

  /**
   * RELIABLE RECONNECTION DETECTION
   *
   * This effect monitors the socket connection state and detects reconnections
   * by tracking state transitions. It's more reliable than Socket.IO events.
   *
   * Detection Logic:
   * - If connected AND we've been connected before AND previous state was disconnected
   * - Then it's a reconnection (not initial connection)
   */
  useEffect(() => {
    // Only run if we have a user and socket is ready
    if (!userId || !isSocketReady()) return

    const isCurrentlyConnected = socketConnected

    // Detect reconnection: was connected before → disconnected → connected again
    if (
      isCurrentlyConnected &&
      hasEverConnectedRef.current &&
      !previousConnectionStateRef.current &&
      !reconnectionHandledRef.current
    ) {
      console.log('[QC_SOCKET] 🔄 RECONNECTION DETECTED - Restoring state...')

      // Mark as handled to prevent duplicate calls
      reconnectionHandledRef.current = true

      // Re-establish state after a small delay to ensure socket is stable
      setTimeout(() => {
        reestablishStateAfterReconnection()
      }, 500)
    }

    // Track initial connection
    if (isCurrentlyConnected && !hasEverConnectedRef.current) {
      console.log('[QC_SOCKET] ✅ Initial connection established')
      hasEverConnectedRef.current = true
    }

    // Reset reconnection handled flag when disconnected
    if (!isCurrentlyConnected && reconnectionHandledRef.current) {
      reconnectionHandledRef.current = false
    }

    // Update previous state for next comparison
    previousConnectionStateRef.current = isCurrentlyConnected
  }, [
    socketConnected,
    userId,
    isSocketReady,
    reestablishStateAfterReconnection,
  ])

  /**
   * FALLBACK: Periodic connection check
   *
   * As an additional safety measure, periodically check connection state
   * This catches any edge cases where events might be missed
   */
  useEffect(() => {
    if (!userId) return

    // Clear any existing interval
    if (connectionCheckIntervalRef.current) {
      clearInterval(connectionCheckIntervalRef.current)
    }

    // Set up periodic check (every 5 seconds)
    connectionCheckIntervalRef.current = setInterval(() => {
      const socket = getSocket()
      if (socket) {
        const isConnected = socket.connected

        // If we detect a connection that wasn't tracked, handle it
        if (
          isConnected &&
          !socketState.isConnected &&
          hasEverConnectedRef.current
        ) {
          console.log(
            '[QC_SOCKET] 🔍 Periodic check detected untracked reconnection',
          )
          dispatch(setSocketConnected(true))
        }
      }
    }, 5000)

    return () => {
      if (connectionCheckIntervalRef.current) {
        clearInterval(connectionCheckIntervalRef.current)
      }
    }
  }, [userId, getSocket, socketState.isConnected, dispatch])

  /**
   * Setup all Quick Clash socket listeners (called once)
   */
  const setupAllSocketListeners = useCallback(() => {
    if (!isSocketReady()) {
      console.warn('[QC_SOCKET] Socket not ready for setup')
      return false
    }

    if (isInitializedRef.current) {
      console.log('[QC_SOCKET] Already initialized, skipping')
      return true
    }

    console.log('[QC_SOCKET] Setting up ALL Quick Clash socket listeners')

    cleanupSocketListeners()

    const cleanupFunctions = []

    // Set connection state
    dispatch(setSocketConnected(true))
    dispatch(setSocketListening(true))
    dispatch(setMatchmakingSocketConnected(true))
    dispatch(setGlobalMatchmakingSocketConnected(true))

    // Join all necessary rooms
    joinRoom('quickClash', 'quickClash:join')
    joinRoom('teams', 'quickClash:joinTeamsRoom')
    joinRoom('matchmaking', 'quickClash:joinMatchmakingRoom')

    // ==========================================
    // CONNECTION STATE LISTENERS (For redundancy)
    // ==========================================

    const cleanupConnect = addEventListener('connect', () => {
      console.log('[QC_SOCKET] Socket connect event received')
      dispatch(setSocketConnected(true))
    })
    cleanupFunctions.push(cleanupConnect)

    const cleanupDisconnect = addEventListener('disconnect', () => {
      console.log('[QC_SOCKET] Socket disconnect event received')
      dispatch(setSocketConnected(false))
      dispatch(setSocketListening(false))
      dispatch(setMatchmakingSocketConnected(false))
      dispatch(setGlobalMatchmakingSocketConnected(false))
    })
    cleanupFunctions.push(cleanupDisconnect)

    // ==========================================
    // SOLO CHALLENGE EVENTS
    // ==========================================

    const cleanupNewChallenge = addEventListener(
      'quickClash:newChallenge',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('new_challenge', data)

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

        dispatch(fetchActiveChallenges())

        notificationManager.battle(
          t('New Challenge!'),
          t('{{challenger}} has challenged you to a Quick Clash!', {
            challenger:
              data.challenger?.inGameName ||
              data.challenger?.name ||
              'Someone',
          })
        )
      },
    )
    cleanupFunctions.push(cleanupNewChallenge)

    const cleanupChallengerNotified = addEventListener(
      'quickClash:challengerNotified',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('challenger_notified', data)

        if (data.success) {
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

          notificationManager.error(
            t('Challenge Failed'),
            data.errorMessage || t('Failed to create challenge')
          )
        }

        dispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupChallengerNotified)

    const cleanupChallengeAccepted = addEventListener(
      'quickClash:challengeAccepted',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('challenge_accepted', data)

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

        notificationManager.success(
          t('Challenge Accepted!'),
          t('{{opponent}} has accepted your challenge!', {
            opponent:
              data.opponent?.inGameName ||
              data.opponent?.name ||
              'Your opponent',
          })
        )

        dispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupChallengeAccepted)

    const cleanupChallengeRejected = addEventListener(
      'quickClash:challengeRejected',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('challenge_rejected', data)

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

        notificationManager.warning(
          t('Challenge Rejected'),
          t('{{opponent}} has declined your challenge', {
            opponent:
              data.opponent?.inGameName ||
              data.opponent?.name ||
              'Your opponent',
          })
        )

        dispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupChallengeRejected)

    const cleanupChallengeCompleted = addEventListener(
      'quickClash:challengeCompleted',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('challenge_completed', data)

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

        dispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupChallengeCompleted)

    const cleanupChallengeCompletedByBoth = addEventListener(
      'quickClash:challengeCompletedByBothPlayers',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('challenge_completed_both', data)

        const currentState = getCurrentState()
        const currentUserId = currentState.authState.user?._id

        if (data.completedByUserId != currentUserId) {
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

          const userWon = data.userScore > data.opponentScore
          const isTie = data.userScore === data.opponentScore

          if (isTie) {
            notificationManager.info(
              t('Challenge Tied!'),
              t('Final score: You {{userScore}} - {{opponentScore}} {{opponent}}', {
                userScore: data.userScore,
                opponentScore: data.opponentScore,
                opponent:
                  data.opponent?.inGameName ||
                  data.opponent?.name ||
                  'Opponent',
              })
            )
          } else if (userWon) {
            notificationManager.victory(
              t('Challenge Won!'),
              t('Final score: You {{userScore}} - {{opponentScore}} {{opponent}}', {
                userScore: data.userScore,
                opponentScore: data.opponentScore,
                opponent:
                  data.opponent?.inGameName ||
                  data.opponent?.name ||
                  'Opponent',
              })
            )
          } else {
            notificationManager.defeat(
              t('Challenge Lost!'),
              t('Final score: You {{userScore}} - {{opponentScore}} {{opponent}}', {
                userScore: data.userScore,
                opponentScore: data.opponentScore,
                opponent:
                  data.opponent?.inGameName ||
                  data.opponent?.name ||
                  'Opponent',
              })
            )
          }

          dispatch(fetchActiveChallenges())
          dispatch(fetchUserTrophies())
          dispatch(fetchUserStats())
        }

        if (data?.trackWinnerOutcomeResult?.tasksDone) {
          const tasksDoneArray = Object.keys(
            data.trackWinnerOutcomeResult.tasksDone,
          ).map(key => data.trackWinnerOutcomeResult.tasksDone[key])
          tasksDoneArray.forEach(task => {
            if (task) {
              dispatch(updateTaskProgressDirectInRedux(task))
            }
          })
        }
      },
    )
    cleanupFunctions.push(cleanupChallengeCompletedByBoth)

    const cleanupAnalysisReady = addEventListener(
      'quickClash:analysisReady',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('analysis_ready', data)

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

        notificationManager.success(
          t('Analysis Ready!'),
          t('Your challenge analysis is ready to view')
        )

        dispatch(
          setChallengeAnalysisLoading({
            challengeId: data.challengeId,
            isLoading: false,
          }),
        )
      },
    )
    cleanupFunctions.push(cleanupAnalysisReady)

    // ==========================================
    // 1V1 MATCHMAKING EVENTS
    // ==========================================

    const cleanupMatchFound = addEventListener(
      'quickClash:matchFound',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('match_found', data)

        const properPreparationData = {
          opponent: data?.opponent,
          tempChallengeId: data.tempChallengeId,
          isChallenger: data.isChallenger,
        }

        dispatch(setPreparingChallenge(properPreparationData))
      },
    )
    cleanupFunctions.push(cleanupMatchFound)

    const cleanupChallengeProgress = addEventListener(
      'quickClash:challengeProgress',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('challenge_progress', data)

        const currentState = getCurrentState()
        const currentMatchmakingState = currentState.matchmakingState

        if (!currentMatchmakingState.preparingChallenge && data.progress > 0) {
          dispatch(setPreparationProgress(data.progress))
          dispatch(setPreparationStep(data.step || 'contentLoading'))
        } else {
          if (data.progress !== undefined) {
            dispatch(setPreparationProgress(data.progress))
          }

          if (data.step) {
            dispatch(setPreparationStep(data.step))

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

    const cleanupMatchChallengeReady = addEventListener(
      'quickClash:matchChallengeReady',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('match_challenge_ready', data)

        dispatch(setMatchChallengeReady(data))
        dispatch(setPreparationProgress(100))
        dispatch(setPreparationStep('challengeReady'))
        dispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupMatchChallengeReady)

    const cleanupMatchCreationFailed = addEventListener(
      'quickClash:matchCreationFailed',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('match_creation_failed', data)

        dispatch(resetMatchmakingState())

        notificationManager.error(
          t('Challenge Creation Failed'),
          t('Something went wrong while creating your challenge. Please try again.')
        )
      },
    )
    cleanupFunctions.push(cleanupMatchCreationFailed)

    const cleanupJoinedMatchmaking = addEventListener(
      'quickClash:joinedMatchmaking',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('joined_matchmaking', data)

        const currentState = getCurrentState()
        const currentMatchmakingState = currentState.matchmakingState

        if (!currentMatchmakingState.inMatchmaking) {
          dispatch(setInMatchmaking(true))
        }
      },
    )
    cleanupFunctions.push(cleanupJoinedMatchmaking)

    const cleanupLeftMatchmaking = addEventListener(
      'quickClash:leftMatchmaking',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('left_matchmaking', data)

        dispatch(resetMatchmakingState())
      },
    )
    cleanupFunctions.push(cleanupLeftMatchmaking)

    // ==========================================
    // TEAM BATTLE EVENTS
    // ==========================================

    const cleanupTeamBattleReady = addEventListener(
      'quickClash:teamBattleReady',
      async data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_battle_ready', data)

        // Dispatch battle ready immediately
        dispatch(setBattleReady(data))
        dispatch(setTeamBattleReady(data))

        // Fetch additional details (win probability) if not included
        if (!data.winProbability) {
          try {
            const response = await axios.get(
              '/api/quickClash/global-matchmaking-status-detailed'
            )
            if (response.data?.winProbability && isComponentMountedRef.current) {
              dispatch(setBattleReady({
                ...data,
                winProbability: response.data.winProbability,
              }))
            }
          } catch (error) {
            console.warn('[QC_SOCKET] Failed to fetch win probability:', error)
          }
        }

        // Add status update for battle ready
        dispatch(addStatusUpdate({
          message: 'Battle is ready! You can now enter the battle.',
          time: 0,
        }))

        // Explicitly refresh active battles when a new team battle is ready
        dispatch(fetchTeamBattles({ status: 'active', page: 1 }))
      },
    )
    cleanupFunctions.push(cleanupTeamBattleReady)

    const cleanupBattleCreationStarted = addEventListener(
      'quickClash:battleCreationStarted',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('battle_creation_started', data)
        dispatch(setBattleCreationStatus('creating'))
      },
    )
    cleanupFunctions.push(cleanupBattleCreationStarted)

    const cleanupBattleCreationFailed = addEventListener(
      'quickClash:battleCreationFailed',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('battle_creation_failed', data)

        dispatch(setBattleCreationError(data.error || 'Battle creation failed'))
        notificationManager.error(
          t('Battle Creation Failed'),
          t('Something went wrong. Please try again.')
        )
      },
    )
    cleanupFunctions.push(cleanupBattleCreationFailed)

    const cleanupBattleCreationCleanedUp = addEventListener(
      'quickClash:battleCreationCleanedUp',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('battle_creation_cleaned_up', data)

        dispatch(setTeamInMatchmaking(false))
        dispatch(setBattleCreationStatus('failed'))

        notificationManager.error(
          t('Battle Creation Failed'),
          t('There was an issue creating your battle. Please try joining matchmaking again.')
        )
      },
    )
    cleanupFunctions.push(cleanupBattleCreationCleanedUp)

    const cleanupTeamBattleCompleted = addEventListener(
      'quickClash:teamBattleCompleted',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_battle_completed', data)

        // Get current user to check for their results
        const currentState = getCurrentState()
        const currentUserId = currentState.authState?.user?._id?.toString()

        console.log('[QC_SOCKET] Battle completed - checking results for user:', currentUserId)
        console.log('[QC_SOCKET] Trophy changes received:', data.trophyChanges)

        // Get trophy change and powerup rewards for current user (keys are string user IDs)
        const userTrophyData = data.trophyChanges?.[currentUserId]
        const trophyChange = userTrophyData?.trophyChange || 0
        const isWinner = userTrophyData?.isWinner || false
        const isTie = userTrophyData?.isTie || false

        console.log('[QC_SOCKET] User trophy data:', { trophyChange, isWinner, isTie })

        const userRewards = data.powerupRewards?.[currentUserId]
        const hasRewards = userRewards?.housingSpaceEarned > 0

        // Show notification based on result
        if (isWinner && trophyChange > 0) {
          // Victory notification with trophy gain
          if (hasRewards) {
            notificationManager.victory(
              t('Battle Won! 🏆'),
              t('+{{trophies}} trophies • {{space}} housing space earned!', {
                trophies: trophyChange,
                space: userRewards.housingSpaceEarned,
              })
            )
          } else {
            notificationManager.victory(
              t('Battle Won! 🏆'),
              t('+{{trophies}} trophies!', { trophies: trophyChange })
            )
          }
        } else if (!isWinner && !isTie && trophyChange < 0) {
          // Defeat notification with trophy loss
          notificationManager.defeat(
            t('Battle Lost'),
            t('{{trophies}} trophies', { trophies: trophyChange })
          )
        } else if (isTie) {
          // Tie notification
          notificationManager.battle(
            t('Battle Tied!'),
            trophyChange !== 0
              ? t('{{trophies}} trophies', { trophies: trophyChange > 0 ? `+${trophyChange}` : trophyChange })
              : t('No trophy change')
          )
        } else if (hasRewards) {
          // Fallback for rewards without clear win/loss
          notificationManager.victory(
            t('Battle Completed! 🎁'),
            t('You earned {{space}} housing space in powerups!', {
              space: userRewards.housingSpaceEarned,
            })
          )
        } else {
          // Generic completion notification
          notificationManager.battle(
            t('Battle Completed!'),
            t('Your team battle has been completed.')
          )
        }

        const currentTeamBattleState = currentState.teamBattleState

        if (
          currentTeamBattleState.currentBattle &&
          currentTeamBattleState.currentBattle._id === data.battleId
        ) {
          dispatch(fetchTeamBattleDetails(data.battleId))
        }

        // Refresh battle lists for real-time UI updates
        dispatch(fetchTeamBattles({ status: 'active', page: 1 }))
        dispatch(fetchTeamBattles({ status: 'completed', page: 1 }))

        // Refresh unclaimed battles list to show the new reward immediately
        dispatch(fetchUnclaimedBattles())

        // Refresh user trophies in header/profile
        dispatch(fetchUserTrophies())

        // Clear battle ending state when battle completes
        dispatch(clearBattleEnding(data.battleId))
      },
    )
    cleanupFunctions.push(cleanupTeamBattleCompleted)

    // Battle ending notification (timer expired, waiting for active sessions)
    const cleanupBattleEnding = addEventListener(
      'quickClash:battleEnding',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('battle_ending', data)

        // Mark battle as ending in Redux
        dispatch(setBattleEnding({ battleId: data.battleId, isEnding: true }))

        notificationManager.info(
          t('Battle Ending'),
          t('Time expired. Calculating results...')
        )
      },
    )
    cleanupFunctions.push(cleanupBattleEnding)

    // ==========================================
    // TEAM MATCHMAKING EVENTS
    // ==========================================

    // Team joined matchmaking - notify all team members
    const cleanupTeamJoinedMatchmaking = addEventListener(
      'quickClash:teamJoinedMatchmaking',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_joined_matchmaking', data)

        console.log('[QC_SOCKET] Team joined matchmaking:', data)

        // Update Redux state - this now sets inMatchmaking, matchmakingType, step, teamId, teamName
        dispatch(handleTeamJoinedMatchmaking(data))

        // Add status update for UI
        dispatch(addStatusUpdate({
          message: data.teamName
            ? t('Team {{teamName}} joined matchmaking', { teamName: data.teamName })
            : t('Team joined matchmaking'),
          time: 0,
        }))

        // Show notification for other team members
        const currentState = getCurrentState()
        const currentUserId = currentState.authState?.user?._id

        // Only show notification if we're not the one who initiated
        if (data.teamMembers && currentUserId) {
          const isInitiator = data.teamMembers.some(member => {
            const memberId = member.userId || member.user
            return memberId === currentUserId.toString()
          })

          // Show notification to inform user their team is now in matchmaking
          if (!isInitiator || data.memberCount > 1) {
            notificationManager.battle(
              t('Team Matchmaking'),
              t('Your team is now searching for opponents')
            )
          }
        }
      },
    )
    cleanupFunctions.push(cleanupTeamJoinedMatchmaking)

    // Team left matchmaking - notify all team members
    const cleanupTeamLeftMatchmaking = addEventListener(
      'quickClash:teamLeftMatchmaking',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_left_matchmaking', data)

        console.log('[QC_SOCKET] Team left matchmaking:', data)

        // Update Redux state - this now sets inMatchmaking to false and clears other state
        dispatch(handleTeamLeftMatchmaking(data))

        // Determine notification message based on reason
        let notificationTitle = t('Matchmaking Cancelled')
        let notificationMessage = t('Your team is no longer searching for opponents')

        if (data.reason === 'memberLeft') {
          notificationTitle = t('Matchmaking Cancelled')
          notificationMessage = data.memberName
            ? t('{{name}} left, matchmaking cancelled', { name: data.memberName })
            : t('A team member left, matchmaking cancelled')
        } else if (data.reason === 'battleCreationFailed') {
          notificationTitle = t('Battle Creation Failed')
          notificationMessage = t('Unable to create battle, please try again')
        } else if (data.reason === 'teamDisbanded') {
          notificationTitle = t('Team Disbanded')
          notificationMessage = t('Your matchmaking team has been disbanded')
        }

        notificationManager.warning(notificationTitle, notificationMessage)
      },
    )
    cleanupFunctions.push(cleanupTeamLeftMatchmaking)

    // Team returned to matchmaking after failed battle creation
    const cleanupTeamReturnedToMatchmaking = addEventListener(
      'quickClash:teamReturnedToMatchmaking',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_returned_to_matchmaking', data)

        console.log('[QC_SOCKET] Team returned to matchmaking:', data)

        // Update Redux state - this now sets inMatchmaking to true and step to searching
        dispatch(handleTeamReturnedToMatchmaking(data))

        // Add status update
        dispatch(addStatusUpdate({
          message: t('Returned to matchmaking queue'),
          time: data.startTime ? Math.floor((Date.now() - data.startTime) / 1000) : 0,
        }))

        notificationManager.info(
          t('Back in Queue'),
          t('Your team has returned to the matchmaking queue')
        )
      },
    )
    cleanupFunctions.push(cleanupTeamReturnedToMatchmaking)

    // Matchmaking locked - potential match found
    const cleanupMatchmakingLocked = addEventListener(
      'quickClash:matchmakingLocked',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('matchmaking_locked', data)

        console.log('[QC_SOCKET] Matchmaking locked - potential match:', data)

        // Add status update indicating match preparation
        dispatch(addStatusUpdate({
          message: t('Match found! Preparing battle...'),
          time: 0,
        }))

        // Update battle creation status to show progress
        dispatch(setBattleCreationStatus('creating'))
      },
    )
    cleanupFunctions.push(cleanupMatchmakingLocked)

    // Matchmaking unlocked - match fell through
    const cleanupMatchmakingUnlocked = addEventListener(
      'quickClash:matchmakingUnlocked',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('matchmaking_unlocked', data)

        console.log('[QC_SOCKET] Matchmaking unlocked - match fell through:', data)

        // Clear battle creation status
        dispatch(setBattleCreationStatus(null))

        // Add status update
        dispatch(addStatusUpdate({
          message: t('Still searching for opponents...'),
          time: 0,
        }))
      },
    )
    cleanupFunctions.push(cleanupMatchmakingUnlocked)

    // ==========================================
    // GLOBAL SOCKET EVENTS
    // ==========================================

    const cleanupSocketError = addEventListener('quickClash:error', data => {
      if (!isComponentMountedRef.current) return
      logSocketEvent('socket_error', data)

      dispatch(setSocketError(data.message || 'An error occurred'))
      dispatch(setMatchmakingError(data.message || 'An error occurred'))

      notificationManager.error(
        t('Socket Error'),
        data.message || t('An error occurred')
      )
    })
    cleanupFunctions.push(cleanupSocketError)

    // Store cleanup functions
    eventCleanupFunctions.current = cleanupFunctions
    isInitializedRef.current = true
    dispatch(setSocketInitialized(true))

    console.log(
      `[QC_SOCKET] ALL Quick Clash socket listeners setup completed (${cleanupFunctions.length} listeners)`,
    )
    return true
  }, [
    isSocketReady,
    dispatch,
    emitWithDeviceContext,
    addEventListener,
    joinRoom,
    logSocketEvent,
    t,
    navigate,
    getCurrentState,
    cleanupSocketListeners,
  ])

  /**
   * Initialize Quick Clash socket - single entry point
   */
  const initializeQuickClashSocket = useCallback(() => {
    if (isInitializedRef.current || socketState.isInitialized) {
      console.log('[QC_SOCKET] Already initialized, skipping')
      return true
    }

    if (!isSocketReady()) {
      console.warn('[QC_SOCKET] Socket not ready for initialization')
      return false
    }

    if (!userId) {
      console.warn('[QC_SOCKET] No user ID available for initialization')
      return false
    }

    console.log(
      '[QC_SOCKET] Initializing Quick Clash socket (single connection)',
    )

    dispatch(clearErrors())

    return setupAllSocketListeners()
  }, [
    isSocketReady,
    userId,
    socketState.isInitialized,
    dispatch,
    setupAllSocketListeners,
  ])

  /**
   * Get connection status and statistics
   */
  const getConnectionStatus = useCallback(() => {
    return {
      isConnected: socketState.isConnected,
      isListening: socketState.isListening,
      isInitialized: socketState.isInitialized,
      rooms: socketState.rooms,
      connectionStats: socketState.connectionStats,
      lastEvent: socketState.lastEvent,
      eventCount: socketState.eventHistory.length,
      deviceFingerprint: socketState.deviceFingerprint,
      hasEverConnected: hasEverConnectedRef.current,
      errors: {
        connection: socketState.connectionError,
        socket: socketState.socketError,
      },
    }
  }, [socketState])

  /**
   * Manually join a specific room
   */
  const joinSpecificRoom = useCallback(
    (roomName, socketEvent) => {
      if (!socketState.isConnected) {
        console.warn(`[QC_SOCKET] Cannot join ${roomName} - not connected`)
        return false
      }

      joinRoom(roomName, socketEvent)
      return true
    },
    [socketState.isConnected, joinRoom],
  )

  /**
   * Clear event history
   */
  const clearHistory = useCallback(() => {
    // Assuming there's a clearEventHistory action
    // dispatch(clearEventHistory())
  }, [])

  /**
   * Manual reconnection trigger (for UI controls if needed)
   */
  const triggerManualReconnection = useCallback(() => {
    console.log('[QC_SOCKET] Manual reconnection trigger requested')

    // Reset tracking flags
    hasEverConnectedRef.current = true
    previousConnectionStateRef.current = false
    reconnectionHandledRef.current = false

    // The next connection detection will trigger re-establishment
    notificationManager.info(
      t('Reconnecting...'),
      t('Attempting to reconnect to server')
    )
  }, [t])

  // Auto-initialize when conditions are met
  useEffect(() => {
    if (userId && isSocketReady() && !socketState.isInitialized) {
      console.log('[QC_SOCKET] Auto-initializing Quick Clash socket')
      initializeQuickClashSocket()
    }
  }, [
    userId,
    isSocketReady,
    socketState.isInitialized,
    initializeQuickClashSocket,
  ])

  return {
    // State
    isConnected: socketState.isConnected,
    isListening: socketState.isListening,
    isInitialized: socketState.isInitialized,
    rooms: socketState.rooms,
    lastEvent: socketState.lastEvent,
    eventHistory: socketState.eventHistory,
    connectionStats: socketState.connectionStats,
    hasEverConnected: hasEverConnectedRef.current,
    errors: {
      connection: socketState.connectionError,
      socket: socketState.socketError,
    },

    // Device info
    deviceFingerprint: socketState.deviceFingerprint,
    deviceConflictDetected,
    isSocketReady: isSocketReady(),

    // Actions
    initializeQuickClashSocket,
    cleanupSocketListeners,
    getConnectionStatus,
    joinSpecificRoom,
    clearHistory,
    triggerManualReconnection,

    // Socket utilities
    emitWithDeviceContext,
    socket: getSocket(),
    getSocket,
  }
}

export default useQuickClashSocket
