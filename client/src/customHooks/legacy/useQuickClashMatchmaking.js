// customHooks/useQuickClashMatchmaking.js - COMPLETE SIMPLIFIED VERSION
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  joinMatchmaking,
  leaveMatchmaking,
  getMatchmakingStatus,
  clearChallengeError,
  clearMatchmakingError,
  clearPreparationState,
  clearMatchmakingAfterChallengeReady,
  clearMatchmakingAfterModalClose,
  resetMatchmakingState,
} from '../redux/legacy/quickClashMatchmakingSlice'

/**
 * Complete simplified hook for 1v1 Matchmaking
 * No socket management - that's handled by useQuickClashSocket
 */
const useQuickClashMatchmaking = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useTranslation('QuickClash')

  const socketState = useSelector(state => state.quickClashSocket)
  const matchmakingState = useSelector(state => state.quickClashMatchmaking)

  // Join matchmaking
  const handleJoinMatchmaking = useCallback(() => {
    dispatch(clearMatchmakingError())
    dispatch(clearChallengeError())

    return dispatch(joinMatchmaking())
      .unwrap()
      .then(result => {
        console.log('[MM_HOOK] Successfully joined matchmaking:', result)
        return result
      })
      .catch(error => {
        console.error('[MM_HOOK] Error joining matchmaking:', error)
        throw error
      })
  }, [dispatch])

  // Leave matchmaking
  const handleLeaveMatchmaking = useCallback(() => {
    return dispatch(leaveMatchmaking())
      .unwrap()
      .then(result => {
        dispatch(resetMatchmakingState())
        return result
      })
      .catch(error => {
        console.error('[MM_HOOK] Error leaving matchmaking:', error)
        throw error
      })
  }, [dispatch])

  // Check status
  const checkMatchmakingStatus = useCallback(() => {
    return dispatch(getMatchmakingStatus())
  }, [dispatch])

  // Navigate to challenge
  const navigateToChallenge = useCallback(
    challengeId => {
      if (challengeId) {
        navigate(`/quickclash/session/${challengeId}`)
      }
    },
    [navigate],
  )

  return {
    // Core state
    inMatchmaking: matchmakingState.inMatchmaking,
    matchmakingEntry: matchmakingState.matchmakingEntry,
    matchmakingLoading: matchmakingState.matchmakingLoading,
    matchmakingError: matchmakingState.matchmakingError,

    // Challenge states
    challengeCreating: matchmakingState.challengeCreating,
    challengeCreationResult: matchmakingState.challengeCreationResult,
    challengeCreationError: matchmakingState.challengeCreationError,
    challengeCreationData: matchmakingState.challengeCreationData,
    challengeReady: matchmakingState.challengeReady,

    // Preparation flow
    preparingChallenge: matchmakingState.preparingChallenge,
    preparationProgress: matchmakingState.preparationProgress,
    preparationStep: matchmakingState.preparationStep,

    // UI state
    showSearchModal: matchmakingState.showSearchModal,
    showPreparationModal: matchmakingState.showPreparationModal,

    // Connection state
    socketConnected: socketState.isConnected,
    deviceFingerprint: socketState.deviceFingerprint,
    isSocketReady: socketState.isConnected,
    autoInitialize: true,
    socketListenersSetup: socketState.isInitialized,

    // Socket state
    isSocketConnected: socketState.isConnected,
    isInMatchmakingRoom: socketState.rooms.matchmaking,

    // Actions
    joinMatchmaking: handleJoinMatchmaking,
    leaveMatchmaking: handleLeaveMatchmaking,
    checkMatchmakingStatus,
    navigateToChallenge,

    // State management
    clearChallengeError: () => dispatch(clearChallengeError()),
    clearMatchmakingError: () => dispatch(clearMatchmakingError()),
    clearPreparationState: () => dispatch(clearPreparationState()),
    clearAllMatchmakingStates: () => dispatch(resetMatchmakingState()),
    clearMatchmakingAfterChallenge: () =>
      dispatch(clearMatchmakingAfterChallengeReady()),
    clearMatchmakingAfterModal: () =>
      dispatch(clearMatchmakingAfterModalClose()),

    // Dummy socket management functions for backward compatibility
    setupSocketListeners: () => true,
    cleanupSocketListeners: () => {},
    reinitialize: () => true,

    // Status checks
    isReady: () => socketState.isConnected && socketState.rooms.matchmaking,
    isInitialized: () => socketState.isInitialized,
    isRoomJoined: () => socketState.rooms.matchmaking,
  }
}

export default useQuickClashMatchmaking
