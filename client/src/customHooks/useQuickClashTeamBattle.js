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

/**
 * Custom hook for team battle functionality
 */
const useQuickClashTeamBattle = () => {
  const dispatch = useDispatch()
  const { getSocket } = useSocket()
  const toast = useToast()
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()
  const joinedTeamsRoom = useRef(false)
  const { user } = useSelector(state => state.auth)

  // Get state from Redux
  const teamBattleState = useSelector(state => state.quickClashTeamBattle)

  // Setup socket listeners for team battles and matchmaking
  const setupTeamBattleSocketListeners = useCallback(() => {
    const socket = getSocket()
    if (!socket) return

    // Join the teams room first to receive team battle events
    if (!joinedTeamsRoom.current) {
      socket.emit('quickClash:joinTeamsRoom')
      joinedTeamsRoom.current = true
    }

    // Clean up any existing listeners first
    cleanupSocketListeners()

    // Battle ready notification
    socket.on('quickClash:teamBattleReady', data => {
      dispatch(setBattleReady(data))
    })

    // Battle completed notification
    socket.on('quickClash:teamBattleCompleted', data => {
      toast({
        title: t('Battle Completed!'),
        description: t('Your team battle has been completed.'),
        status: 'info',
        duration: 5000,
        isClosable: true,
      })

      // Refresh battles list
      dispatch(fetchTeamBattles())
    })

    // Member category selection notification
    socket.on('quickClash:teamMemberSelectedCategory', data => {
      // If we're viewing this battle, refresh it
      if (
        teamBattleState.currentBattle &&
        teamBattleState.currentBattle._id === data.battleId
      ) {
        dispatch(fetchTeamBattleDetails(data.battleId))
      }
    })

    socket.on('quickClash:teamMemberDeselectedCategory', data => {
      // If we're viewing this battle, refresh it
      if (
        teamBattleState.currentBattle &&
        teamBattleState.currentBattle._id === data.battleId
      ) {
        dispatch(fetchTeamBattleDetails(data.battleId))
      }
    })

    return () => cleanupSocketListeners()
  }, [dispatch, getSocket, toast, t, navigate, teamBattleState.currentBattle])

  // Clean up socket listeners
  const cleanupSocketListeners = useCallback(() => {
    const socket = getSocket()
    if (!socket) return

    socket.off('quickClash:teamBattleReady')
    socket.off('quickClash:teamBattleCompleted')
    socket.off('quickClash:teamMemberSelectedCategory')
    socket.off('quickClash:teamBattleRefetch')
    socket.off('quickClash:teamMemberDeselectedCategory')
  }, [getSocket])

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
      // Signal to the server that we're viewing team battles
      const socket = getSocket()
      if (socket && !joinedTeamsRoom.current) {
        socket.emit('quickClash:viewTeamBattles')
        joinedTeamsRoom.current = true
      }

      return dispatch(fetchTeamBattles({ status, page, limit }))
    },
    [dispatch, getSocket],
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
      const socket = getSocket()
      if (socket && !joinedTeamsRoom.current) {
        socket.emit('quickClash:viewTeamBattles')
        joinedTeamsRoom.current = true
      }

      return dispatch(fetchTeamBattleDetails(battleId))
    },
    [dispatch, getSocket],
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
      return dispatch(deselectBattleCategory({ battleId })) // Fixed: was deselectCategoryForUser
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
                userId: user?._id, // You'll need to get user from Redux state
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
    [dispatch, navigate, toast, t, user?._id], // Add user._id to dependencies
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
      const socket = getSocket()
      if (socket && !joinedTeamsRoom.current) {
        socket.emit('quickClash:joinTeamsRoom')
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
    [dispatch, toast, t, getSocket],
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
      const socket = getSocket()
      if (socket && !joinedTeamsRoom.current) {
        socket.emit('quickClash:joinTeamsRoom')
        joinedTeamsRoom.current = true
      }

      return dispatch(getTeamMatchmakingStatus(teamId))
    },
    [dispatch, getSocket],
  )

  // Clear current battle
  const clearBattle = useCallback(() => {
    dispatch(clearCurrentBattle())
  }, [dispatch])

  // Go to battle page
  const goToBattle = useCallback(
    battleId => {
      // Ensure we're in the teams socket room when navigating to a battle
      const socket = getSocket()
      if (socket && !joinedTeamsRoom.current) {
        socket.emit('quickClash:viewTeamBattles')
        joinedTeamsRoom.current = true
      }

      navigate(`/quickclash/teamBattle/${battleId}`)
    },
    [navigate, getSocket],
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
