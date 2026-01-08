// customHooks/useQuickClashTeamBattle.js - COMPLETE SIMPLIFIED VERSION
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { notificationManager } from '../utils/notifications'
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
  const { t } = useTranslation('QuickClash')

  const socketState = useSelector(state => state.quickClashSocket)
  const teamBattleState = useSelector(state => state.quickClashTeamBattle)
  const authState = useSelector(state => state.auth)

  // Support both authenticated users and session players
  const sessionId = typeof window !== 'undefined' ? localStorage.getItem('playSessionId') : null
  const user = authState.user
  const isSession = !user && !!sessionId
  const playerId = user?._id || sessionId

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
          notificationManager.error(t('Error'), error || t('Failed to select category'))
          throw error
        })
    },
    [dispatch, t],
  )

  // Deselect category
  const deselectCategory = useCallback(
    battleId => {
      return dispatch(deselectBattleCategory({ battleId }))
        .unwrap()
        .then(result => result)
        .catch(error => {
          notificationManager.error(t('Error'), error || t('Failed to deselect category'))
          throw error
        })
    },
    [dispatch, t],
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
                playerId: playerId,
                battleId: battleId,
                timestamp: Date.now(),
                isSession: isSession,
              }),
            )
            // Use different route for session players
            if (isSession) {
              navigate(`/play/session/${sessionInfo.challengeId}`)
            } else {
              navigate(`/quickclash/session/${sessionInfo.challengeId}`)
            }
          }
          return result
        })
        .catch(error => {
          notificationManager.error(t('Error'), error || t('Failed to start challenge'))
          throw error
        })
    },
    [dispatch, navigate, t, playerId, isSession],
  )

  // Join matchmaking
  const joinMatchmaking = useCallback(
    teamId => {
      return dispatch(joinTeamMatchmaking({ teamId }))
        .unwrap()
        .then(result => {
          notificationManager.matchmaking(t('Joined Matchmaking'), t('Looking for opponents...'))
          return result
        })
        .catch(error => {
          if (error.code === 'ALREADY_IN_MATCHMAKING') {
            let title = t('Already in Matchmaking')
            if (error.memberName) {
              title = t(`${error.memberName} Already in Matchmaking`)
            }
            notificationManager.warning(
              title,
              error.reason || error.message || t('A team member is already in an active matchmaking queue')
            )
          } else {
            notificationManager.error(
              t('Error'),
              error.reason || error.message || t('Failed to join matchmaking')
            )
          }
          throw error
        })
    },
    [dispatch, t],
  )

  // Leave matchmaking
  const leaveMatchmaking = useCallback(
    teamId => {
      return dispatch(leaveTeamMatchmaking(teamId))
        .unwrap()
        .then(result => {
          notificationManager.info(t('Left Matchmaking'))
          return result
        })
        .catch(error => {
          notificationManager.error(t('Error'), error || t('Failed to leave matchmaking'))
          throw error
        })
    },
    [dispatch, t],
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
    goToBattle: battleId => navigate(isSession ? `/play/battle/${battleId}` : `/quickclash/teamBattle/${battleId}`),
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
