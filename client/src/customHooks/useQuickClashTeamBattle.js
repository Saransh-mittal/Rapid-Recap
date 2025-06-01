// customHooks/useQuickClashTeamBattle.js
import { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  fetchTeamBattles,
  fetchTeamBattleDetails,
  selectBattleCategory,
  joinTeamMatchmaking,
  leaveTeamMatchmaking,
  getTeamMatchmakingStatus,
  clearCurrentBattle,
  setBattleReady,
  clearBattleReady,
  deselectBattleCategory,
  beginBattleChallenge,
  clearCategoryOperationError,
  resetCategoryOperationState,
} from '../redux/quickClashTeamBattleSlice'
import { useSocket } from './useSocket'
import axios from 'axios'
import { fetchAppUpdates } from '../redux/appSlice'

/**
 * Enhanced custom hook for team battle functionality with device fingerprinting
 */
const useQuickClashTeamBattle = () => {
  const dispatch = useDispatch()
  const {
    getSocket,
    emitWithDeviceContext,
    addEventListener,
    deviceFingerprint,
    isSocketReady,
  } = useSocket()
  const toast = useToast()
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()
  const joinedTeamsRoom = useRef(false)
  const eventCleanupFunctions = useRef([])
  const { user } = useSelector(state => state.auth)

  // Get state from Redux
  const teamBattleState = useSelector(state => state.quickClashTeamBattle)

  // Setup socket listeners for team battles and matchmaking with device awareness
  const setupTeamBattleSocketListeners = useCallback(() => {
    if (!isSocketReady()) {
      console.warn('Socket not ready for team battle listeners setup')
      return
    }

    // Join the teams room first to receive team battle events
    if (!joinedTeamsRoom.current) {
      emitWithDeviceContext('quickClash:joinTeamsRoom')
      joinedTeamsRoom.current = true
    }

    // Clean up any existing listeners first
    cleanupSocketListeners()

    const cleanupFunctions = []

    // Battle ready notification
    const cleanupBattleReady = addEventListener(
      'quickClash:teamBattleReady',
      data => {
        console.log('Team battle ready event received:', data)
        dispatch(setBattleReady(data))
      },
    )
    cleanupFunctions.push(cleanupBattleReady)

    // Battle completed notification
    const cleanupBattleCompleted = addEventListener(
      'quickClash:teamBattleCompleted',
      data => {
        toast({
          title: t('Battle Completed!'),
          description: t('Your team battle has been completed.'),
          status: 'info',
          duration: 5000,
          isClosable: true,
        })

        // Refresh battles list
        dispatch(fetchTeamBattles())
      },
    )
    cleanupFunctions.push(cleanupBattleCompleted)

    // Member category selection notification
    const cleanupMemberSelectedCategory = addEventListener(
      'quickClash:teamMemberSelectedCategory',
      data => {
        // If we're viewing this battle, refresh it
        if (
          teamBattleState.currentBattle &&
          teamBattleState.currentBattle._id === data.battleId
        ) {
          dispatch(fetchTeamBattleDetails(data.battleId))
        }
      },
    )
    cleanupFunctions.push(cleanupMemberSelectedCategory)

    // Member category deselection notification
    const cleanupMemberDeselectedCategory = addEventListener(
      'quickClash:teamMemberDeselectedCategory',
      data => {
        // If we're viewing this battle, refresh it
        if (
          teamBattleState.currentBattle &&
          teamBattleState.currentBattle._id === data.battleId
        ) {
          dispatch(fetchTeamBattleDetails(data.battleId))
        }
      },
    )
    cleanupFunctions.push(cleanupMemberDeselectedCategory)

    // Team invitation received
    const cleanupTeamInvitationReceived = addEventListener(
      'quickClash:teamInvitationReceived',
      data => {
        // Show toast notification for team invitation
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
        // User accepted an invitation, refresh teams list
        if (data.userId === user?._id) {
          return
        } else {
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
        // User rejected an invitation, show notification
        if (data.userId === user?._id) {
          return
        } else {
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
        if (data.userId === user?._id) {
          return
        }
        toast({
          title: t('New Team Member'),
          description: `${data.userName} (@${data.userInGameName}) has joined your team`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
      },
    )
    cleanupFunctions.push(cleanupTeamMemberJoined)

    // Team member left
    const cleanupTeamMemberLeft = addEventListener(
      'quickClash:teamMemberLeft',
      data => {
        if (data.userId === user?._id) {
          return
        }
        toast({
          title: t('Team Member Left'),
          description: `${data.userName} (@${data.userInGameName}) has left the team`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
      },
    )
    cleanupFunctions.push(cleanupTeamMemberLeft)

    // Team member removed
    const cleanupTeamMemberRemoved = addEventListener(
      'quickClash:teamMemberRemoved',
      data => {
        console.log('Team member removed:', data)
        if (data.removedMemberId === user?._id) {
          // If the user was removed from their own team, navigate to team selection
          toast({
            title: `You have been removed from the team ${data.teamName}`,
            description: t('You can join another team or create your own.'),
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top',
          })
          return
        }
        toast({
          title: t('Team Member Removed'),
          description: `${data.removedMemberName} (@${data.removedMemberInGameName}) has been removed from the team`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      },
    )
    cleanupFunctions.push(cleanupTeamMemberRemoved)

    // Store cleanup functions
    eventCleanupFunctions.current = cleanupFunctions

    return () => cleanupSocketListeners()
  }, [
    isSocketReady,
    emitWithDeviceContext,
    addEventListener,
    dispatch,
    toast,
    t,
    navigate,
    teamBattleState.currentBattle,
    user?._id,
  ])

  // Clean up socket listeners with device awareness
  const cleanupSocketListeners = useCallback(() => {
    // Clean up all registered event listeners
    eventCleanupFunctions.current.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    })
    eventCleanupFunctions.current = []

    // Reset joined room flag
    joinedTeamsRoom.current = false
  }, [])

  // Setup socket listeners on mount
  useEffect(() => {
    setupTeamBattleSocketListeners()

    return () => {
      cleanupSocketListeners()
      // Reset joined room flag when unmounting
      joinedTeamsRoom.current = false
    }
  }, [setupTeamBattleSocketListeners, cleanupSocketListeners])

  // Fetch team battles with status filter
  const loadTeamBattles = useCallback(
    (status = 'active', page = 1, limit = 10) => {
      // Signal to the server that we're viewing team battles with device context
      if (isSocketReady() && !joinedTeamsRoom.current) {
        emitWithDeviceContext('quickClash:viewTeamBattles')
        joinedTeamsRoom.current = true
      }

      return dispatch(fetchTeamBattles({ status, page, limit }))
    },
    [dispatch, isSocketReady, emitWithDeviceContext],
  )

  // Fetch more team battles (pagination)
  const loadMoreTeamBattles = useCallback(
    (status = 'active') => {
      const page =
        status === 'active'
          ? teamBattleState.activeBattlesPage + 1
          : teamBattleState.completedBattlesPage + 1

      return dispatch(fetchTeamBattles({ status, page }))
    },
    [
      dispatch,
      teamBattleState.activeBattlesPage,
      teamBattleState.completedBattlesPage,
    ],
  )

  // Fetch team battle details
  const getBattleDetails = useCallback(
    battleId => {
      // Ensure we're in the teams socket room when viewing battle details
      if (isSocketReady() && !joinedTeamsRoom.current) {
        emitWithDeviceContext('quickClash:viewTeamBattles')
        joinedTeamsRoom.current = true
      }

      return dispatch(fetchTeamBattleDetails(battleId))
    },
    [dispatch, isSocketReady, emitWithDeviceContext],
  )

  const selectCategory = useCallback(
    (battleId, category) => {
      return dispatch(selectBattleCategory({ battleId, category }))
        .unwrap()
        .then(result => {
          return result
        })
        .catch(error => {
          toast({
            title: t('Error'),
            description: error || t('Failed to select category'),
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
          throw error
        })
    },
    [dispatch, toast, t],
  )

  const deselectCategory = useCallback(
    battleId => {
      return dispatch(deselectBattleCategory({ battleId }))
        .unwrap()
        .then(result => {
          return result
        })
        .catch(error => {
          toast({
            title: t('Error'),
            description: error || t('Failed to deselect category'),
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
          throw error
        })
    },
    [dispatch, toast, t],
  )

  const beginChallenge = useCallback(
    battleId => {
      return dispatch(beginBattleChallenge({ battleId }))
        .unwrap()
        .then(result => {
          const sessionInfo = result.sessionInfo

          if (sessionInfo && sessionInfo.challengeId) {
            // Store the assignment in localStorage to prevent URL sharing
            localStorage.setItem(
              `challenge_${sessionInfo.challengeId}`,
              JSON.stringify({
                userId: user?._id,
                battleId: battleId,
                timestamp: Date.now(),
              }),
            )

            // Navigate to challenge session
            navigate(`/quickclash/session/${sessionInfo.challengeId}`)
          }

          return result
        })
        .catch(error => {
          toast({
            title: t('Error'),
            description: error || t('Failed to start challenge'),
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
          throw error
        })
    },
    [dispatch, navigate, toast, t, user?._id],
  )

  // Clear operation error
  const clearOperationError = useCallback(() => {
    dispatch(clearCategoryOperationError())
  }, [dispatch])

  // Reset operation state
  const resetOperationState = useCallback(() => {
    dispatch(resetCategoryOperationState())
  }, [dispatch])

  // Join team matchmaking
  const joinMatchmaking = useCallback(
    teamId => {
      // Ensure we're in the teams socket room
      if (isSocketReady() && !joinedTeamsRoom.current) {
        emitWithDeviceContext('quickClash:joinTeamsRoom')
        joinedTeamsRoom.current = true
      }

      return dispatch(joinTeamMatchmaking({ teamId }))
        .unwrap()
        .then(result => {
          toast({
            title: t('Joined Matchmaking'),
            description: t('Looking for opponents...'),
            status: 'info',
            duration: 3000,
            isClosable: true,
          })

          return result
        })
        .catch(error => {
          // Check for special error codes
          if (error.code === 'ALREADY_IN_MATCHMAKING') {
            // If we have a member name, create a more personalized message
            let title = t('Already in Matchmaking')
            if (error.memberName) {
              title = t(`${error.memberName} Already in Matchmaking`)
            }

            toast({
              title: title,
              description:
                error.reason ||
                error.message ||
                t('A team member is already in an active matchmaking queue'),
              status: 'warning',
              duration: 5000, // Longer duration for more detailed messages
              isClosable: true,
            })
          } else {
            toast({
              title: t('Error'),
              description:
                error.reason ||
                error.message ||
                t('Failed to join matchmaking'),
              status: 'error',
              duration: 5000, // Longer duration for more detailed messages
              isClosable: true,
            })
          }

          throw error
        })
    },
    [dispatch, toast, t, isSocketReady, emitWithDeviceContext],
  )

  // Leave team matchmaking
  const leaveMatchmaking = useCallback(
    teamId => {
      return dispatch(leaveTeamMatchmaking(teamId))
        .unwrap()
        .then(result => {
          toast({
            title: t('Left Matchmaking'),
            status: 'info',
            duration: 3000,
            isClosable: true,
          })

          return result
        })
        .catch(error => {
          toast({
            title: t('Error'),
            description: error || t('Failed to leave matchmaking'),
            status: 'error',
            duration: 3000,
            isClosable: true,
          })

          throw error
        })
    },
    [dispatch, toast, t],
  )

  // Check matchmaking status
  const checkMatchmakingStatus = useCallback(
    teamId => {
      // Ensure we're in the teams socket room
      if (isSocketReady() && !joinedTeamsRoom.current) {
        emitWithDeviceContext('quickClash:joinTeamsRoom')
        joinedTeamsRoom.current = true
      }

      return dispatch(getTeamMatchmakingStatus(teamId))
    },
    [dispatch, isSocketReady, emitWithDeviceContext],
  )

  // Clear current battle
  const clearBattle = useCallback(() => {
    dispatch(clearCurrentBattle())
  }, [dispatch])

  // Go to battle page
  const goToBattle = useCallback(
    battleId => {
      // Ensure we're in the teams socket room when navigating to a battle
      if (isSocketReady() && !joinedTeamsRoom.current) {
        emitWithDeviceContext('quickClash:viewTeamBattles')
        joinedTeamsRoom.current = true
      }

      navigate(`/quickclash/teamBattle/${battleId}`)
    },
    [navigate, isSocketReady, emitWithDeviceContext],
  )

  // Clear battle ready notification
  const clearBattleReadyNotification = useCallback(() => {
    dispatch(clearBattleReady())
  }, [dispatch])

  return {
    // State
    activeBattles: teamBattleState.activeBattles,
    activeBattlesLoading: teamBattleState.activeBattlesLoading,
    activeBattlesError: teamBattleState.activeBattlesError,
    activeBattlesHasMore: teamBattleState.activeBattlesHasMore,

    completedBattles: teamBattleState.completedBattles,
    completedBattlesLoading: teamBattleState.completedBattlesLoading,
    completedBattlesError: teamBattleState.completedBattlesError,
    completedBattlesHasMore: teamBattleState.completedBattlesHasMore,

    currentBattle: teamBattleState.currentBattle,
    battleDetailsLoading: teamBattleState.battleDetailsLoading,
    battleDetailsError: teamBattleState.battleDetailsError,

    // Category operation loading states
    categoryOperationLoading: teamBattleState.categoryOperationLoading,
    categoryOperationType: teamBattleState.categoryOperationType,
    categoryOperationError: teamBattleState.categoryOperationError,
    selectedCategoryForOperation: teamBattleState.selectedCategoryForOperation,

    // Legacy loading states (for backward compatibility)
    categorySelectionLoading: teamBattleState.categorySelectionLoading,
    categorySelectionError: teamBattleState.categorySelectionError,
    sessionInfo: teamBattleState.sessionInfo,

    inMatchmaking: teamBattleState.inMatchmaking,
    matchmakingEntry: teamBattleState.matchmakingEntry,
    matchmakingLoading: teamBattleState.matchmakingLoading,
    matchmakingError: teamBattleState.matchmakingError,
    matchmakingStep: teamBattleState.matchmakingStep,

    battleReady: teamBattleState.battleReady,

    // Device information
    deviceFingerprint,
    isSocketReady: isSocketReady(),

    // Actions
    loadTeamBattles,
    loadMoreTeamBattles,
    getBattleDetails,
    selectCategory,
    deselectCategory,
    beginChallenge,
    clearOperationError,
    resetOperationState,
    joinMatchmaking,
    leaveMatchmaking,
    checkMatchmakingStatus,
    clearBattle,
    goToBattle,
    setupTeamBattleSocketListeners,
    cleanupSocketListeners,
    clearBattleReadyNotification,
  }
}

export default useQuickClashTeamBattle
