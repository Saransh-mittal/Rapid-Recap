// components/quickClashComponents/matchmaking/MatchmakingModalManager.jsx - FIXED MODAL MANAGEMENT
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import useQuickClashMatchmaking from '../../../customHooks/useQuickClashMatchmaking'
import useMatchmakingModal from '../../../customHooks/useMatchmakingModal'
import MatchmakingButton from '../MatchmakingButton'
import SearchModal from './SearchModal'
import MatchPreparationModal from '../modals/MatchPreparationModal'

/**
 * FIXED Modal Manager with enhanced state communication
 * Properly handles minimized states and modal reopening
 */
const MatchmakingModalManager = forwardRef((props, ref) => {
  const {
    // Button props passed through
    buttonSize,
    buttonWidth,
    buttonHeight,
    buttonMinWidth,
    buttonTextOverride,
    iconOverride,
    bgGradientOverride,
    shadowColorOverride,
    compact,
    ...buttonProps
  } = props

  const { t } = useTranslation('QuickClash')
  const toast = useToast()

  // Timer state
  const [searchTime, setSearchTime] = useState(0)
  const [isJoining, setIsJoining] = useState(false)

  // Refs
  const timerRef = useRef(null)
  const searchStartTimeRef = useRef(null)
  const mountedRef = useRef(true)

  // Matchmaking hook
  const {
    inMatchmaking,
    matchmakingLoading,
    matchmakingError,
    preparingChallenge,
    challengeReady,
    preparationProgress,
    preparationStep,
    socketConnected,
    isSocketReady,
    joinMatchmaking,
    leaveMatchmaking,
    checkMatchmakingStatus,
    clearMatchmakingError,
    navigateToChallenge,
  } = useQuickClashMatchmaking()

  // FIXED: Enhanced modal state management with proper minimized state handling
  const {
    activeModal,
    isMinimized,
    userDismissed,
    isSearchModalOpen,
    isPreparationModalOpen,
    shouldShowSearch,
    shouldShowPreparation,
    searchModalWasMinimized,
    canOpenSearch,
    canOpenPreparation,
    openSearchModal,
    openPreparationModal,
    minimizeModal,
    dismissSearchModal,
    closeModal,
  } = useMatchmakingModal({
    inMatchmaking,
    preparingChallenge,
    challengeReady,
    preparationProgress,
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Timer management
  useEffect(() => {
    if (inMatchmaking) {
      if (!searchStartTimeRef.current) {
        searchStartTimeRef.current = Date.now()
        setSearchTime(0)
      }

      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          if (!mountedRef.current) return
          const elapsed = Math.floor(
            (Date.now() - searchStartTimeRef.current) / 1000,
          )
          setSearchTime(elapsed)
        }, 1000)
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (!preparingChallenge && !challengeReady && preparationProgress === 0) {
        searchStartTimeRef.current = null
        setSearchTime(0)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [inMatchmaking, preparingChallenge, challengeReady, preparationProgress])

  // Handle matchmaking errors
  useEffect(() => {
    if (matchmakingError) {
      setIsJoining(false)
      searchStartTimeRef.current = null
      setSearchTime(0)

      toast({
        title: t('Matchmaking Error'),
        description: matchmakingError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })

      setTimeout(clearMatchmakingError, 100)
    }
  }, [matchmakingError, toast, t, clearMatchmakingError])

  // Join matchmaking handler
  const handleJoinMatchmaking = useCallback(async () => {
    if (isJoining || !isSocketReady) return

    try {
      setIsJoining(true)
      searchStartTimeRef.current = Date.now()
      setSearchTime(0)

      await joinMatchmaking()

      if (mountedRef.current) {
        setIsJoining(false)
        // REMOVED: Manual modal opening - let useMatchmakingModal handle this automatically
        // The modal will open automatically when inMatchmaking becomes true
      }
    } catch (error) {
      if (mountedRef.current) {
        setIsJoining(false)
        searchStartTimeRef.current = null
        setSearchTime(0)

        toast({
          title: t('Failed to Join'),
          description: error.message || t('Could not join matchmaking'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }
  }, [isJoining, isSocketReady, joinMatchmaking, toast, t])

  // Leave matchmaking handler
  const handleLeaveMatchmaking = useCallback(async () => {
    try {
      await leaveMatchmaking()

      if (mountedRef.current) {
        setIsJoining(false)
        searchStartTimeRef.current = null
        setSearchTime(0)
        closeModal()

        toast({
          title: t('Left Matchmaking'),
          description: t('You have left the queue'),
          status: 'info',
          duration: 2000,
          isClosable: true,
        })
      }
    } catch (error) {
      if (mountedRef.current) {
        toast({
          title: t('Error'),
          description: error.message || t('Could not leave matchmaking'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }
  }, [leaveMatchmaking, closeModal, toast, t])

  // Handle challenge ready - navigate to challenge
  const handlePlayNow = useCallback(() => {
    const challengeId = challengeReady?.challengeId
    if (challengeId) {
      closeModal()
      searchStartTimeRef.current = null
      setSearchTime(0)
      navigateToChallenge(challengeId)
    }
  }, [challengeReady, closeModal, navigateToChallenge])

  // FIXED: Enhanced modal handlers with proper state management
  const handleSearchModalClose = useCallback(() => {
    console.log('[MODAL_MANAGER] Search modal close requested')
    minimizeModal() // This will set isMinimized: true and searchModalWasMinimized: true
  }, [minimizeModal])

  const handlePreparationModalClose = useCallback(
    (reason = 'minimize') => {
      console.log('[MODAL_MANAGER] Preparation modal close requested:', reason)
      if (reason === 'navigate') {
        closeModal() // Completely close when navigating to challenge
      } else {
        minimizeModal() // Minimize to allow reopening
      }
    },
    [closeModal, minimizeModal],
  )

  // FIXED: Enhanced modal opening handlers
  const handleOpenSearchModal = useCallback(() => {
    console.log('[MODAL_MANAGER] Opening search modal requested')
    openSearchModal()
  }, [openSearchModal])

  const handleOpenPreparationModal = useCallback(() => {
    console.log('[MODAL_MANAGER] Opening preparation modal requested')
    openPreparationModal()
  }, [openPreparationModal])

  // Expose functions to parent
  useImperativeHandle(
    ref,
    () => ({
      handleJoinMatchmaking,
      openSearchModal: handleOpenSearchModal,
      openPreparationModal: handleOpenPreparationModal,
    }),
    [handleJoinMatchmaking, handleOpenSearchModal, handleOpenPreparationModal],
  )

  // Initialize status check on mount
  useEffect(() => {
    if (isSocketReady) {
      checkMatchmakingStatus()
    }
  }, [isSocketReady, checkMatchmakingStatus])

  // FIXED: Debug logging for modal state
  useEffect(() => {
    console.log('[MODAL_MANAGER] Modal state changed:', {
      activeModal,
      isMinimized,
      searchModalWasMinimized,
      canOpenSearch,
      canOpenPreparation,
      shouldShowSearch,
      shouldShowPreparation,
      inMatchmaking,
    })
  }, [
    activeModal,
    isMinimized,
    searchModalWasMinimized,
    canOpenSearch,
    canOpenPreparation,
    shouldShowSearch,
    shouldShowPreparation,
    inMatchmaking,
  ])

  return (
    <>
      {/* FIXED: Enhanced Button Component with all necessary state */}
      <MatchmakingButton
        // Pass through all button props
        buttonSize={buttonSize}
        buttonWidth={buttonWidth}
        buttonHeight={buttonHeight}
        buttonMinWidth={buttonMinWidth}
        buttonTextOverride={buttonTextOverride}
        iconOverride={iconOverride}
        bgGradientOverride={bgGradientOverride}
        shadowColorOverride={shadowColorOverride}
        compact={compact}
        // FIXED: Pass complete modal state information to button
        isModalMinimized={isMinimized}
        canOpenSearch={canOpenSearch}
        canOpenPreparation={canOpenPreparation}
        searchModalWasMinimized={searchModalWasMinimized}
        // Event handlers
        onJoinMatchmaking={handleJoinMatchmaking}
        onOpenSearchModal={handleOpenSearchModal}
        onOpenPreparationModal={handleOpenPreparationModal}
        {...buttonProps}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={handleSearchModalClose}
        onLeave={handleLeaveMatchmaking}
        socketConnected={socketConnected}
        searchTime={searchTime}
        isJoining={isJoining}
        isLeaving={matchmakingLoading}
      />

      {/* Preparation Modal */}
      <MatchPreparationModal
        isOpen={isPreparationModalOpen}
        onClose={handlePreparationModalClose}
        preparingData={preparingChallenge}
        challengeId={challengeReady?.challengeId}
        onPlayNow={handlePlayNow}
        progress={preparationProgress}
        step={preparationStep}
      />
    </>
  )
})

MatchmakingModalManager.displayName = 'MatchmakingModalManager'

export default MatchmakingModalManager
