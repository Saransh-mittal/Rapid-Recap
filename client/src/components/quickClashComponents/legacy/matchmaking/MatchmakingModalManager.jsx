// components/quickClashComponents/matchmaking/MatchmakingModalManager.jsx - FAITHFUL CONVERSION to Tailwind with Blue-Cyan Color Scheme
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { useTranslation } from 'react-i18next'
import useQuickClashMatchmaking from '../../../customHooks/useQuickClashMatchmaking'
import useMatchmakingModal from '../../../../customHooks/useMatchmakingModal'
import MatchmakingButton from './MatchmakingButton'
import SearchModal from '../../matchmaking/SearchModal'
import MatchPreparationModal from '../../modals/MatchPreparationModal'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../../utils/quickClashColors'

// Custom Toast Hook (simplified replacement for Chakra's useToast)
const useToast = () => {
  const showToast = useCallback(
    ({ title, description, status, duration = 5000, isClosable = true }) => {
      // Simple implementation - you'd implement a real toast system here
      console.log(`Toast (${status}): ${title} - ${description}`)

      // Create a temporary visual notification
      const toastEl = document.createElement('div')
      toastEl.className = `
      fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-lg max-w-sm
      ${
        status === 'error'
          ? 'bg-red-500/90 text-white'
          : status === 'success'
          ? 'bg-green-500/90 text-white'
          : status === 'warning'
          ? 'bg-orange-500/90 text-white'
          : 'bg-blue-500/90 text-white'
      }
      backdrop-blur-md border border-white/20
    `
      toastEl.innerHTML = `
      <div class="font-bold text-sm">${title}</div>
      <div class="text-xs mt-1 opacity-90">${description}</div>
      ${
        isClosable
          ? '<button class="absolute top-2 right-2 text-white/70 hover:text-white">×</button>'
          : ''
      }
    `

      document.body.appendChild(toastEl)

      // Auto remove after duration
      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.remove()
        }
      }, duration)

      // Close button functionality
      if (isClosable) {
        const closeBtn = toastEl.querySelector('button')
        if (closeBtn) {
          closeBtn.onclick = () => toastEl.remove()
        }
      }
    },
    [],
  )

  return { toast: showToast }
}

/**
 * Enhanced Modal Manager with blue-cyan theme - FAITHFUL CONVERSION
 * Properly handles minimized states and modal reopening with improved styling
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
  const { toast } = useToast()

  // Timer state - EXACTLY as original
  const [searchTime, setSearchTime] = useState(0)
  const [isJoining, setIsJoining] = useState(false)

  // Refs - EXACTLY as original
  const timerRef = useRef(null)
  const searchStartTimeRef = useRef(null)
  const mountedRef = useRef(true)

  // Matchmaking hook - EXACTLY as original
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

  // Enhanced modal state management - EXACTLY as original
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

  // ALL ORIGINAL EFFECTS PRESERVED EXACTLY

  // Cleanup on unmount - EXACTLY as original
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Timer management - EXACTLY as original
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

  // Handle matchmaking errors - EXACTLY as original
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

  // Join matchmaking handler - EXACTLY as original
  const handleJoinMatchmaking = useCallback(async () => {
    if (isJoining || !isSocketReady) return

    try {
      setIsJoining(true)
      searchStartTimeRef.current = Date.now()
      setSearchTime(0)

      await joinMatchmaking()

      if (mountedRef.current) {
        setIsJoining(false)
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

  // Leave matchmaking handler - EXACTLY as original
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

  // Handle challenge ready - navigate to challenge - EXACTLY as original
  const handlePlayNow = useCallback(() => {
    const challengeId = challengeReady?.challengeId
    if (challengeId) {
      closeModal()
      searchStartTimeRef.current = null
      setSearchTime(0)
      navigateToChallenge(challengeId)
    }
  }, [challengeReady, closeModal, navigateToChallenge])

  // Enhanced modal handlers - EXACTLY as original
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

  // Enhanced modal opening handlers - EXACTLY as original
  const handleOpenSearchModal = useCallback(() => {
    console.log('[MODAL_MANAGER] Opening search modal requested')
    openSearchModal()
  }, [openSearchModal])

  const handleOpenPreparationModal = useCallback(() => {
    console.log('[MODAL_MANAGER] Opening preparation modal requested')
    openPreparationModal()
  }, [openPreparationModal])

  // Expose functions to parent - EXACTLY as original
  useImperativeHandle(
    ref,
    () => ({
      handleJoinMatchmaking,
      openSearchModal: handleOpenSearchModal,
      openPreparationModal: handleOpenPreparationModal,
    }),
    [handleJoinMatchmaking, handleOpenSearchModal, handleOpenPreparationModal],
  )

  // Initialize status check on mount - EXACTLY as original
  useEffect(() => {
    if (isSocketReady) {
      checkMatchmakingStatus()
    }
  }, [isSocketReady, checkMatchmakingStatus])

  // Debug logging for modal state - EXACTLY as original
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
      {/* Enhanced Button Component with all necessary state - EXACTLY as original */}
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
        // Pass complete modal state information to button
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
