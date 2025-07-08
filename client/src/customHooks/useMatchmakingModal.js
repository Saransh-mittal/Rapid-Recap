// customHooks/useMatchmakingModal.js - FIXED MODAL STATE MANAGEMENT
import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * FIXED modal state management hook with proper minimized state handling
 * Prevents race conditions and ensures proper modal reopening
 */
const useMatchmakingModal = ({
  inMatchmaking,
  preparingChallenge,
  challengeReady,
  preparationProgress,
}) => {
  // FIXED: Enhanced modal state with proper minimized tracking
  const [modalState, setModalState] = useState({
    activeModal: null, // 'search' | 'preparation' | null
    isMinimized: false,
    userDismissed: false,
    // Track what should be shown when not minimized
    shouldShowSearch: false,
    shouldShowPreparation: false,
    // ADDED: Track if modal was manually closed during search
    searchModalWasMinimized: false,
  })

  // Prevent rapid state changes
  const updateTimeoutRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  // Safe state updater with debouncing
  const updateModalState = useCallback(updates => {
    if (!mountedRef.current) return

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    updateTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setModalState(prev => ({ ...prev, ...updates }))
      }
    }, 5) // Reduced debounce for faster response
  }, [])

  // FIXED: Determine which modal should be active and what should be available
  useEffect(() => {
    if (!mountedRef.current) return

    // Clear timeout to prevent stale updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    // Immediate update for better responsiveness
    const determineModalState = () => {
      if (!mountedRef.current) return

      // FIXED: Determine what should be shown (regardless of minimized state)
      let shouldShowSearch = false
      let shouldShowPreparation = false

      // Priority 1: Match found/preparing (highest priority)
      if (preparingChallenge || challengeReady || preparationProgress > 0) {
        shouldShowPreparation = true
      }
      // Priority 2: Searching for match
      else if (
        inMatchmaking &&
        !preparingChallenge &&
        !challengeReady &&
        preparationProgress === 0
      ) {
        shouldShowSearch = true
      }

      // FIXED: Determine what should actually be displayed
      let activeModal = null
      let searchModalWasMinimized = modalState.searchModalWasMinimized

      // Show preparation modal if needed and not minimized
      if (shouldShowPreparation && !modalState.isMinimized) {
        activeModal = 'preparation'
        searchModalWasMinimized = false // Reset search minimized state
      }
      // Show search modal if needed, not dismissed, and not minimized
      else if (
        shouldShowSearch &&
        !modalState.userDismissed &&
        !modalState.isMinimized
      ) {
        activeModal = 'search'
      }
      // If we're searching but modal is minimized, remember this state
      else if (shouldShowSearch && modalState.isMinimized) {
        searchModalWasMinimized = true
      }

      // FIXED: Reset states when not in matchmaking
      if (
        !inMatchmaking &&
        !preparingChallenge &&
        !challengeReady &&
        preparationProgress === 0
      ) {
        updateModalState({
          activeModal: null,
          isMinimized: false,
          userDismissed: false,
          shouldShowSearch: false,
          shouldShowPreparation: false,
          searchModalWasMinimized: false,
        })
        return
      }

      // Update state with what should be shown and what is currently active
      updateModalState({
        activeModal,
        shouldShowSearch,
        shouldShowPreparation,
        searchModalWasMinimized,
      })
    }

    // Use immediate execution for better responsiveness
    determineModalState()
  }, [
    inMatchmaking,
    preparingChallenge,
    challengeReady,
    preparationProgress,
    modalState.isMinimized,
    modalState.userDismissed,
    modalState.searchModalWasMinimized,
    updateModalState,
  ])

  // FIXED: Modal control functions with proper state management
  const openSearchModal = useCallback(() => {
    updateModalState({
      activeModal: 'search',
      isMinimized: false,
      userDismissed: false,
      searchModalWasMinimized: false,
    })
  }, [updateModalState])

  const openPreparationModal = useCallback(() => {
    updateModalState({
      activeModal: 'preparation',
      isMinimized: false,
      searchModalWasMinimized: false,
    })
  }, [updateModalState])

  const minimizeModal = useCallback(() => {
    updateModalState({
      activeModal: null,
      isMinimized: true,
      // Preserve search minimized state if we're currently showing search
      searchModalWasMinimized:
        modalState.activeModal === 'search'
          ? true
          : modalState.searchModalWasMinimized,
    })
  }, [
    updateModalState,
    modalState.activeModal,
    modalState.searchModalWasMinimized,
  ])

  const dismissSearchModal = useCallback(() => {
    updateModalState({
      activeModal: null,
      isMinimized: true,
      userDismissed: true,
      searchModalWasMinimized: true,
    })
  }, [updateModalState])

  const closeModal = useCallback(() => {
    updateModalState({
      activeModal: null,
      isMinimized: false,
      userDismissed: false,
      searchModalWasMinimized: false,
    })
  }, [updateModalState])

  // FIXED: Calculate derived states for button logic
  const canOpenSearch =
    modalState.shouldShowSearch &&
    (modalState.isMinimized || modalState.searchModalWasMinimized)

  const canOpenPreparation =
    modalState.shouldShowPreparation && modalState.isMinimized

  return {
    // State
    activeModal: modalState.activeModal,
    isMinimized: modalState.isMinimized,
    userDismissed: modalState.userDismissed,
    isSearchModalOpen: modalState.activeModal === 'search',
    isPreparationModalOpen: modalState.activeModal === 'preparation',

    // FIXED: Enhanced state information for button
    shouldShowSearch: modalState.shouldShowSearch,
    shouldShowPreparation: modalState.shouldShowPreparation,
    searchModalWasMinimized: modalState.searchModalWasMinimized,
    canOpenSearch,
    canOpenPreparation,

    // Actions
    openSearchModal,
    openPreparationModal,
    minimizeModal,
    dismissSearchModal,
    closeModal,
  }
}

export default useMatchmakingModal
