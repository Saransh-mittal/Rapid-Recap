// customHooks/useQuickClashSocket.js
import { useCallback, useEffect, useRef } from 'react'
import { useSocket } from './useSocket'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

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
} from '../redux/quickClashMatchmakingSlice'

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
} from '../redux/quickClashGlobalMatchmakingSlice'

// Team battle Redux imports
import {
  fetchTeamBattles,
  fetchTeamBattleDetails,
  setBattleReady as setTeamBattleReady,
  setInMatchmaking as setTeamInMatchmaking,
} from '../redux/quickClashTeamBattleSlice'

/**
 * Single, centralized Quick Clash socket manager
 * Handles ALL Quick Clash socket events in one place with one connection
 * FIXED: Resolves stale state closure issues by accessing current state properly
 */
const useQuickClashSocket = () => {
  const {
    getSocket,
    emitWithDeviceContext,
    addEventListener,
    deviceFingerprint,
    deviceConflictDetected,
    isSocketReady,
  } = useSocket()

  const dispatch = useDispatch()
  const store = useStore() // ADD: Get store to access current state
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useTranslation('QuickClash')

  // Refs for managing lifecycle
  const eventCleanupFunctions = useRef([])
  const isInitializedRef = useRef(false)
  const isComponentMountedRef = useRef(true)

  // Redux state selectors
  const socketState = useSelector(state => state.quickClashSocket)
  const { user } = useSelector(state => state.auth)

  const userId = user?._id

  // ADD: Helper function to get current state from store
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

  // Component lifecycle
  useEffect(() => {
    isComponentMountedRef.current = true
    return () => {
      isComponentMountedRef.current = false
      cleanupSocketListeners()
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

  /**
   * Helper function to log socket events
   */
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

  /**
   * Helper function to join a room and update state
   */
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

  /**
   * Cleanup all socket listeners
   */
  const cleanupSocketListeners = useCallback(() => {
    console.log('[QC_SOCKET] Cleaning up all socket listeners')

    // Clean up event listeners
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

    // Reset state
    dispatch(resetSocketState())
    isInitializedRef.current = false

    console.log('[QC_SOCKET] All socket listeners cleaned up')
  }, [dispatch])

  /**
   * Setup all Quick Clash socket listeners in one place
   * FIXED: Uses getCurrentState() to avoid stale closure issues
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

    // Clean up any existing listeners first
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
    // SOLO CHALLENGE EVENTS
    // ==========================================

    // New challenge received
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

        toast({
          title: t('New Challenge!'),
          description: t(
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

    // Challenger notified
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

          toast({
            title: t('Challenge Failed'),
            description: data.errorMessage || t('Failed to create challenge'),
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }

        dispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupChallengerNotified)

    // Challenge accepted
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

        toast({
          title: t('Challenge Accepted!'),
          description: t('{{opponent}} has accepted your challenge!', {
            opponent:
              data.opponent?.inGameName ||
              data.opponent?.name ||
              'Your opponent',
          }),
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        dispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupChallengeAccepted)

    // Challenge rejected
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

        toast({
          title: t('Challenge Rejected'),
          description: t('{{opponent}} has declined your challenge', {
            opponent:
              data.opponent?.inGameName ||
              data.opponent?.name ||
              'Your opponent',
          }),
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })

        dispatch(fetchActiveChallenges())
      },
    )
    cleanupFunctions.push(cleanupChallengeRejected)

    // Challenge completed
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

    // Challenge completed by both players
    const cleanupChallengeCompletedByBoth = addEventListener(
      'quickClash:challengeCompletedByBothPlayers',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('challenge_completed_both', data)

        // FIXED: Get current userId from store instead of stale closure
        const currentState = getCurrentState()
        const currentUserId = currentState.authState.user?._id

        // Only show notification if this user didn't just complete it
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

          toast({
            title: isTie
              ? t('Challenge Tied!')
              : userWon
              ? t('Challenge Won!')
              : t('Challenge Lost!'),
            description: t(
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

          dispatch(fetchActiveChallenges())
          dispatch(fetchUserTrophies())
          dispatch(fetchUserStats())
        }

        // Handle task updates
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

    // Analysis ready
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

        toast({
          title: t('Analysis Ready!'),
          description: t('Your challenge analysis is ready to view'),
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

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

    // Match found
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

    // Challenge progress
    const cleanupChallengeProgress = addEventListener(
      'quickClash:challengeProgress',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('challenge_progress', data)

        // FIXED: Get current matchmaking state from store
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

    // Match challenge ready
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

    // Match creation failed
    const cleanupMatchCreationFailed = addEventListener(
      'quickClash:matchCreationFailed',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('match_creation_failed', data)

        dispatch(resetMatchmakingState())

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

    // Joined matchmaking
    const cleanupJoinedMatchmaking = addEventListener(
      'quickClash:joinedMatchmaking',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('joined_matchmaking', data)

        // FIXED: Get current matchmaking state from store
        const currentState = getCurrentState()
        const currentMatchmakingState = currentState.matchmakingState

        if (!currentMatchmakingState.inMatchmaking) {
          dispatch(setInMatchmaking(true))
        }
      },
    )
    cleanupFunctions.push(cleanupJoinedMatchmaking)

    // Left matchmaking
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

    // Team battle ready
    const cleanupTeamBattleReady = addEventListener(
      'quickClash:teamBattleReady',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_battle_ready', data)

        dispatch(setBattleReady(data))
        dispatch(setTeamBattleReady(data))
        dispatch(fetchTeamBattles())
      },
    )
    cleanupFunctions.push(cleanupTeamBattleReady)

    // Battle creation events
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
        toast({
          title: t('Battle Creation Failed'),
          description: t('Something went wrong. Please try again.'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
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

        toast({
          title: t('Battle Creation Failed'),
          description: t(
            'There was an issue creating your battle. Please try joining matchmaking again.',
          ),
          status: 'error',
          duration: 6000,
          isClosable: true,
          position: 'top',
        })
      },
    )
    cleanupFunctions.push(cleanupBattleCreationCleanedUp)

    // Battle completed
    const cleanupTeamBattleCompleted = addEventListener(
      'quickClash:teamBattleCompleted',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_battle_completed', data)

        toast({
          title: t('Battle Completed!'),
          description: t('Your team battle has been completed.'),
          status: 'info',
          duration: 5000,
          isClosable: true,
        })

        // FIXED: Get current team battle state from store instead of stale closure
        const currentState = getCurrentState()
        const currentTeamBattleState = currentState.teamBattleState

        console.log(
          '[QC_SOCKET] Current team battle state:',
          currentTeamBattleState,
        )

        if (
          currentTeamBattleState.currentBattle &&
          currentTeamBattleState.currentBattle._id === data.battleId
        ) {
          console.log(
            '[QC_SOCKET] Fetching updated battle details for:',
            data.battleId,
          )
          dispatch(fetchTeamBattleDetails(data.battleId))
        } else {
          console.log(
            '[QC_SOCKET] No matching current battle found for category selection',
          )
        }
      },
    )
    cleanupFunctions.push(cleanupTeamBattleCompleted)

    // customHooks/useQuickClashSocket.js
    // MODIFICATION: Add this new event listener in setupAllSocketListeners function
    // Add this code after the existing team battle events (around line 710, after cleanupTeamBattleCompleted)

    // Team battle quiz completed - refresh battle details
    const cleanupTeamBattleQuizCompleted = addEventListener(
      'quickClash:teamBattleQuizCompleted',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_battle_quiz_completed', data)

        // FIXED: Get current team battle state from store instead of stale closure
        const currentState = getCurrentState()
        const currentTeamBattleState = currentState.teamBattleState

        // If this battle is currently being viewed, refresh the battle details
        if (
          currentTeamBattleState.currentBattle &&
          currentTeamBattleState.currentBattle._id === data.battleId
        ) {
          console.log(
            '[QC_SOCKET] Refreshing battle details after quiz completion:',
            data.battleId,
          )
          dispatch(fetchTeamBattleDetails(data.battleId))
        } else {
          console.log(
            '[QC_SOCKET] Quiz completed in different battle, not refreshing current view',
          )
        }

        // Show notification if someone else completed the quiz
        if (!data.completedByCurrentUser) {
          const currentUserId = currentState.authState.user?._id

          // Only show toast if the current user is part of this battle
          if (
            data.allTeamMembers &&
            data.allTeamMembers.includes(currentUserId)
          ) {
            toast({
              title: t('Quiz Completed'),
              description: t(
                'A team member has completed their quiz in the battle.',
              ),
              status: 'info',
              duration: 3000,
              isClosable: true,
            })
          }
        }

        // Refresh team battles list to update any status changes
        dispatch(fetchTeamBattles({ status: 'active' }))
      },
    )
    cleanupFunctions.push(cleanupTeamBattleQuizCompleted)

    // FIXED: Team member category selection - using current state
    const cleanupMemberSelectedCategory = addEventListener(
      'quickClash:teamMemberSelectedCategory',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('member_selected_category', data)

        // FIXED: Get current team battle state from store instead of stale closure
        const currentState = getCurrentState()
        const currentTeamBattleState = currentState.teamBattleState

        console.log(
          '[QC_SOCKET] Current team battle state:',
          currentTeamBattleState,
        )

        if (
          currentTeamBattleState.currentBattle &&
          currentTeamBattleState.currentBattle._id === data.battleId
        ) {
          console.log(
            '[QC_SOCKET] Fetching updated battle details for:',
            data.battleId,
          )
          dispatch(fetchTeamBattleDetails(data.battleId))
        } else {
          console.log(
            '[QC_SOCKET] No matching current battle found for category selection',
          )
        }
      },
    )
    cleanupFunctions.push(cleanupMemberSelectedCategory)

    // FIXED: Team member category deselection - using current state
    const cleanupMemberDeselectedCategory = addEventListener(
      'quickClash:teamMemberDeselectedCategory',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('member_deselected_category', data)

        // FIXED: Get current team battle state from store instead of stale closure
        const currentState = getCurrentState()
        const currentTeamBattleState = currentState.teamBattleState

        console.log(
          '[QC_SOCKET] Current team battle state:',
          currentTeamBattleState,
        )

        if (
          currentTeamBattleState.currentBattle &&
          currentTeamBattleState.currentBattle._id === data.battleId
        ) {
          console.log(
            '[QC_SOCKET] Fetching updated battle details for:',
            data.battleId,
          )
          dispatch(fetchTeamBattleDetails(data.battleId))
        } else {
          console.log(
            '[QC_SOCKET] No matching current battle found for category deselection',
          )
        }
      },
    )
    cleanupFunctions.push(cleanupMemberDeselectedCategory)

    // ==========================================
    // TEAM MANAGEMENT EVENTS
    // ==========================================

    // Team invitation received
    const cleanupTeamInvitationReceived = addEventListener(
      'quickClash:teamInvitationReceived',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_invitation_received', data)

        toast({
          title: t('Team Invitation Received'),
          description: t(
            '{{inviterName}} has invited you to join their team "{{teamName}}". Check your inbox to accept or decline.',
            {
              inviterName: data.inviterName,
              teamName: data.teamName,
            },
          ),
          status: 'info',
          duration: 7000,
          isClosable: true,
        })

        dispatch(fetchAppUpdates())
      },
    )
    cleanupFunctions.push(cleanupTeamInvitationReceived)

    // Team invitation accepted
    const cleanupTeamInvitationAccepted = addEventListener(
      'quickClash:teamInvitationAccepted',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_invitation_accepted', data)

        // FIXED: Get current userId from store instead of stale closure
        const currentState = getCurrentState()
        const currentUserId = currentState.authState.user?._id

        if (data.userId !== currentUserId) {
          toast({
            title: t('A new member has joined!'),
            description: `${data.userName} (@${data.userInGameName}) has joined the team`,
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top',
          })
        }
      },
    )
    cleanupFunctions.push(cleanupTeamInvitationAccepted)

    // Team invitation rejected
    const cleanupTeamInvitationRejected = addEventListener(
      'quickClash:teamInvitationRejected',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_invitation_rejected', data)

        // FIXED: Get current userId from store instead of stale closure
        const currentState = getCurrentState()
        const currentUserId = currentState.authState.user?._id

        if (data.userId !== currentUserId) {
          toast({
            title: t('Invitation Declined'),
            description: `${data.userName} (@${data.userInGameName}) has declined the invitation`,
            status: 'warning',
            duration: 5000,
            isClosable: true,
            position: 'top',
          })
        }
      },
    )
    cleanupFunctions.push(cleanupTeamInvitationRejected)

    // Team member joined
    const cleanupTeamMemberJoined = addEventListener(
      'quickClash:teamMemberJoined',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_member_joined', data)

        // FIXED: Get current userId from store instead of stale closure
        const currentState = getCurrentState()
        const currentUserId = currentState.authState.user?._id

        if (data.userId !== currentUserId) {
          toast({
            title: t('New Team Member'),
            description: `${data.userName} (@${data.userInGameName}) has joined your team`,
            status: 'info',
            duration: 3000,
            isClosable: true,
          })
        }
      },
    )
    cleanupFunctions.push(cleanupTeamMemberJoined)

    // Team member left
    const cleanupTeamMemberLeft = addEventListener(
      'quickClash:teamMemberLeft',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_member_left', data)

        // FIXED: Get current userId from store instead of stale closure
        const currentState = getCurrentState()
        const currentUserId = currentState.authState.user?._id

        if (data.userId !== currentUserId) {
          toast({
            title: t('Team Member Left'),
            description: `${data.userName} (@${data.userInGameName}) has left the team`,
            status: 'warning',
            duration: 3000,
            isClosable: true,
          })
        }
      },
    )
    cleanupFunctions.push(cleanupTeamMemberLeft)

    // Team member removed
    const cleanupTeamMemberRemoved = addEventListener(
      'quickClash:teamMemberRemoved',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_member_removed', data)

        // FIXED: Get current userId from store instead of stale closure
        const currentState = getCurrentState()
        const currentUserId = currentState.authState.user?._id

        if (data.removedMemberId === currentUserId) {
          toast({
            title: `You have been removed from the team ${data.teamName}`,
            description: t('You can join another team or create your own.'),
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top',
          })
        } else {
          toast({
            title: t('Team Member Removed'),
            description: `${data.removedMemberName} (@${data.removedMemberInGameName}) has been removed from the team`,
            status: 'warning',
            duration: 5000,
            isClosable: true,
            position: 'top',
          })
        }
      },
    )
    cleanupFunctions.push(cleanupTeamMemberRemoved)

    // ==========================================
    // GLOBAL MATCHMAKING EVENTS (NEWLY ADDED)
    // ==========================================

    // Team left matchmaking - centralized from GlobalMatchmakingModal
    const cleanupTeamLeftMatchmaking = addEventListener(
      'quickClash:teamLeftMatchmaking',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_left_matchmaking', data)

        // Dispatch Redux action to handle state update and toast
        dispatch(handleTeamLeftMatchmaking(data))
      },
    )
    cleanupFunctions.push(cleanupTeamLeftMatchmaking)

    // Team returned to matchmaking - centralized from GlobalMatchmakingModal
    const cleanupTeamReturnedToMatchmaking = addEventListener(
      'quickClash:teamReturnedToMatchmaking',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_returned_to_matchmaking', data)

        // FIXED: Get current user from store instead of stale closure
        const currentState = getCurrentState()
        const currentUser = currentState.authState.user

        if (currentUser?._id) {
          // Dispatch Redux action to handle state update
          dispatch(
            handleTeamReturnedToMatchmaking({
              ...data,
              startTime: Date.now(), // Pass current time for status updates
            }),
          )

          // Set flag to refetch teams
          dispatch(setShouldRefetchTeams(true))

          // Trigger status check in the global matchmaking hook
          dispatch(setShouldCheckStatus(true))
        }
      },
    )
    cleanupFunctions.push(cleanupTeamReturnedToMatchmaking)

    // Team joined matchmaking - centralized from GlobalMatchmakingModal
    const cleanupTeamJoinedMatchmaking = addEventListener(
      'quickClash:teamJoinedMatchmaking',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('team_joined_matchmaking', data)

        // FIXED: Get current user from store instead of stale closure
        const currentState = getCurrentState()
        const currentUser = currentState.authState.user

        if (currentUser?._id) {
          // Dispatch Redux action to handle state update
          dispatch(
            handleTeamJoinedMatchmaking({
              ...data,
              startTime: Date.now(), // Pass current time for status updates
            }),
          )

          // Set flag to refetch teams
          dispatch(setShouldRefetchTeams(true))

          // Trigger status check in the global matchmaking hook
          dispatch(setShouldCheckStatus(true))
        }
      },
    )
    cleanupFunctions.push(cleanupTeamJoinedMatchmaking)

    // Battle creation cleanup - centralized from GlobalMatchmakingModal
    const cleanupBattleCreationCleanupGlobal = addEventListener(
      'quickClash:battleCreationCleanedUp',
      data => {
        if (!isComponentMountedRef.current) return
        logSocketEvent('battle_creation_cleanup_global', data)

        console.log(
          'Battle creation cleanup received in centralized socket:',
          data,
        )

        // Dispatch Redux action to handle cleanup
        dispatch(
          handleBattleCreationCleanup({
            message:
              data.message ||
              'Battle creation failed after multiple attempts. Please try joining matchmaking again.',
            startTime: Date.now(), // Pass current time for status updates
          }),
        )
      },
    )
    cleanupFunctions.push(cleanupBattleCreationCleanupGlobal)

    // ==========================================
    // GLOBAL SOCKET EVENTS
    // ==========================================

    // Socket error handling
    const cleanupSocketError = addEventListener('quickClash:error', data => {
      if (!isComponentMountedRef.current) return
      logSocketEvent('socket_error', data)

      dispatch(setSocketError(data.message || 'An error occurred'))
      dispatch(setMatchmakingError(data.message || 'An error occurred'))

      toast({
        title: t('Socket Error'),
        description: data.message || t('An error occurred'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    })
    cleanupFunctions.push(cleanupSocketError)

    // Reconnection handling
    const cleanupReconnect = addEventListener('reconnect', () => {
      if (!isComponentMountedRef.current) return
      logSocketEvent('socket_reconnected', {})

      console.log('[QC_SOCKET] Socket reconnected, re-initializing...')
      dispatch(incrementReconnectCount())
      dispatch(clearErrors())

      // Reset initialization and re-setup
      isInitializedRef.current = false
      setTimeout(() => {
        if (isComponentMountedRef.current) {
          initializeQuickClashSocket()
        }
      }, 1000)
    })
    cleanupFunctions.push(cleanupReconnect)

    // Disconnect handling
    const cleanupDisconnect = addEventListener('disconnect', () => {
      if (!isComponentMountedRef.current) return
      logSocketEvent('socket_disconnected', {})

      console.log('[QC_SOCKET] Socket disconnected')
      dispatch(setSocketConnected(false))
      dispatch(setSocketListening(false))
      dispatch(setMatchmakingSocketConnected(false))
      dispatch(setGlobalMatchmakingSocketConnected(false))
      isInitializedRef.current = false
    })
    cleanupFunctions.push(cleanupDisconnect)

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
    toast,
    t,
    navigate,
    getCurrentState, // ADDED: Include getCurrentState in dependencies
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

    // Clear any errors
    dispatch(clearErrors())

    // Setup all listeners
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
    dispatch(clearEventHistory())
  }, [dispatch])

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

    // Socket utilities
    emitWithDeviceContext,
    socket: getSocket(),
    getSocket,
  }
}

export default useQuickClashSocket
