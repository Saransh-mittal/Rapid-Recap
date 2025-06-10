// customHooks/useQuickClashTeamBattle.js - COMPLETE SIMPLIFIED VERSION
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  fetchTeamBattles,
  fetchTeamBattleDetails,
  selectBattleCategory,
  deselectBattleCategory,
  beginBattleChallenge,
  joinTeamMatchmaking,
  leaveTeamMatchmaking,
  getTeamMatchmakingStatus,
  clearCurrentBattle,
  clearBattleReady,
  clearCategoryOperationError,
  resetCategoryOperationState,
} from '../redux/quickClashTeamBattleSlice'

/**
 * Complete simplified hook for Team Battles
 * No socket management - that's handled by useQuickClashSocket
 */
const useQuickClashTeamBattle = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useTranslation('QuickClash')

  const socketState = useSelector(state => state.quickClashSocket)
  const teamBattleState = useSelector(state => state.quickClashTeamBattle)
  const { user } = useSelector(state => state.auth)

  // Load team battles
  const loadTeamBattles = useCallback(
    (status = 'active', page = 1, limit = 10) => {
      return dispatch(fetchTeamBattles({ status, page, limit }))
    },
    [dispatch],
  )

  // Load more team battles
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

  // Get battle details
  const getBattleDetails = useCallback(
    battleId => {
      return dispatch(fetchTeamBattleDetails(battleId))
    },
    [dispatch],
  )

  // Select category
  const selectCategory = useCallback(
    (battleId, category) => {
      return dispatch(selectBattleCategory({ battleId, category }))
        .unwrap()
        .then(result => result)
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

  // Deselect category
  const deselectCategory = useCallback(
    battleId => {
      return dispatch(deselectBattleCategory({ battleId }))
        .unwrap()
        .then(result => result)
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

  // Begin challenge
  const beginChallenge = useCallback(
    battleId => {
      return dispatch(beginBattleChallenge({ battleId }))
        .unwrap()
        .then(result => {
          const sessionInfo = result.sessionInfo
          if (sessionInfo?.challengeId) {
            localStorage.setItem(
              `challenge_${sessionInfo.challengeId}`,
              JSON.stringify({
                userId: user?._id,
                battleId: battleId,
                timestamp: Date.now(),
              }),
            )
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

  // Join matchmaking
  const joinMatchmaking = useCallback(
    teamId => {
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
          if (error.code === 'ALREADY_IN_MATCHMAKING') {
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
              duration: 5000,
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
              duration: 5000,
              isClosable: true,
            })
          }
          throw error
        })
    },
    [dispatch, toast, t],
  )

  // Leave matchmaking
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
      return dispatch(getTeamMatchmakingStatus(teamId))
    },
    [dispatch],
  )

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
    deviceFingerprint: socketState.deviceFingerprint,
    isSocketReady: socketState.isConnected,
    autoInitialize: true,
    socketListenersSetup: socketState.isInitialized,

    // Socket state
    isSocketConnected: socketState.isConnected,
    isInTeamsRoom: socketState.rooms.teams,

    // Actions
    loadTeamBattles,
    loadMoreTeamBattles,
    getBattleDetails,
    selectCategory,
    deselectCategory,
    beginChallenge,
    clearOperationError: () => dispatch(clearCategoryOperationError()),
    resetOperationState: () => dispatch(resetCategoryOperationState()),
    joinMatchmaking,
    leaveMatchmaking,
    checkMatchmakingStatus,
    clearBattle: () => dispatch(clearCurrentBattle()),
    goToBattle: battleId => navigate(`/quickclash/teamBattle/${battleId}`),
    clearBattleReadyNotification: () => dispatch(clearBattleReady()),

    // Dummy socket management functions for backward compatibility
    setupTeamBattleSocketListeners: () => true,
    cleanupSocketListeners: () => {},
    reinitialize: () => true,
    joinTeamsRoom: () => socketState.rooms.teams,

    // Status checks
    isReady: () => socketState.isConnected && socketState.rooms.teams,
    isInitialized: () => socketState.isInitialized,
    isRoomJoined: () => socketState.rooms.teams,
  }
}

export default useQuickClashTeamBattle
