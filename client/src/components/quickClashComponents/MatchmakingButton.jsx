// components/quickClashComponents/MatchmakingButton.jsx
import React, {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react'
import {
  Button,
  Spinner,
  HStack,
  Text,
  useToast,
  Icon,
  Badge,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  Box,
  Flex,
  Divider,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Users,
  Activity,
  X,
  Clock,
  Shield,
  Zap,
  Globe,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import useQuickClashMatchmaking from '../../customHooks/useQuickClashMatchmaking'
import { useNavigate } from 'react-router-dom'
import { keyframes } from '@emotion/react'
import MatchPreparationModal from './modals/MatchPreparationModal'

const MotionButton = motion(Button)
const MotionFlex = motion(Flex)
const MotionBadge = motion(Badge)
const MotionBox = motion(Box)

// Pulsing animation for active matchmaking
const pulsing = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(92, 219, 149, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(92, 219, 149, 0); }
  100% { box-shadow: 0 0 0 0 rgba(92, 219, 149, 0); }
`

const MatchmakingButton = forwardRef(({ compact = false }, ref) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const navigate = useNavigate()

  // Local state for UI control
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [preparationModalOpen, setPreparationModalOpen] = useState(false)
  const [matchmakingTime, setMatchmakingTime] = useState(0)
  const [matchmakingStartTime, setMatchmakingStartTime] = useState(null)
  const [joinRequestTimeout, setJoinRequestTimeout] = useState(null)
  const [isRequestPending, setIsRequestPending] = useState(false)

  // NEW: Local state to store opponent data to prevent null issues
  const [storedOpponentData, setStoredOpponentData] = useState(null)
  const [storedChallengeId, setStoredChallengeId] = useState(null)

  // NEW: User dismissal tracking
  const [userDismissedSearch, setUserDismissedSearch] = useState(false)
  const [userDismissedPreparation, setUserDismissedPreparation] =
    useState(false)
  const [lastPreparationId, setLastPreparationId] = useState(null)

  // Refs for cleanup
  const joinTimeoutRef = useRef(null)
  const componentMounted = useRef(true)
  const userJustClosedSearchModal = useRef(false)
  const userJustClosedPreparationModal = useRef(false)

  // Get matchmaking state from hook
  const {
    inMatchmaking,
    matchmakingLoading,
    matchmakingError,
    preparingChallenge,
    challengeReady,
    preparationProgress,
    preparationStep,
    socketConnected,
    deviceFingerprint,
    isSocketReady,

    joinMatchmaking,
    leaveMatchmaking,
    checkMatchmakingStatus,
    clearChallengeError,
    clearMatchmakingError,
    navigateToChallenge,
  } = useQuickClashMatchmaking()

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      componentMounted.current = false
      userJustClosedSearchModal.current = false
      userJustClosedPreparationModal.current = false
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current)
      }
    }
  }, [])

  // NEW: Store opponent data when available to prevent null issues
  useEffect(() => {
    if (preparingChallenge?.opponent) {
      console.log(
        '[MM_BUTTON] Storing opponent data:',
        preparingChallenge.opponent,
      )
      setStoredOpponentData(preparingChallenge.opponent)
    }
  }, [preparingChallenge?.opponent])

  // NEW: Store challenge ID when available
  useEffect(() => {
    if (challengeReady?.challengeId) {
      console.log(
        '[MM_BUTTON] Storing challenge ID:',
        challengeReady.challengeId,
      )
      setStoredChallengeId(challengeReady.challengeId)
    }
  }, [challengeReady?.challengeId])

  // NEW: Clear stored data when matchmaking flow completely ends
  useEffect(() => {
    if (
      !inMatchmaking &&
      !preparingChallenge &&
      !challengeReady &&
      preparationProgress === 0
    ) {
      console.log('[MM_BUTTON] Clearing stored opponent data - flow ended')
      setStoredOpponentData(null)
      setStoredChallengeId(null)
    }
  }, [inMatchmaking, preparingChallenge, challengeReady, preparationProgress])

  // Debug logging
  useEffect(() => {
    console.log('[MM_BUTTON] State changed:', {
      inMatchmaking,
      preparingChallenge: !!preparingChallenge,
      challengeReady: !!challengeReady,
      preparationProgress,
      preparationStep,
      searchModalOpen,
      preparationModalOpen,
      socketConnected,
      isSocketReady,
      matchmakingLoading,
      isRequestPending,
      userDismissedSearch,
      userDismissedPreparation,
      lastPreparationId,
      matchmakingTime,
      matchmakingStartTime: matchmakingStartTime
        ? new Date(matchmakingStartTime).toLocaleTimeString()
        : null,
      userJustClosedSearch: userJustClosedSearchModal.current,
      userJustClosedPreparation: userJustClosedPreparationModal.current,
      storedOpponentData: !!storedOpponentData,
      storedChallengeId: !!storedChallengeId,
    })
  }, [
    inMatchmaking,
    preparingChallenge,
    challengeReady,
    preparationProgress,
    preparationStep,
    searchModalOpen,
    preparationModalOpen,
    socketConnected,
    isSocketReady,
    matchmakingLoading,
    isRequestPending,
    userDismissedSearch,
    userDismissedPreparation,
    lastPreparationId,
    matchmakingTime,
    matchmakingStartTime,
    storedOpponentData,
    storedChallengeId,
  ])

  // Expose method to parent components
  useImperativeHandle(ref, () => ({
    handleJoinMatchmaking,
  }))

  // Initialize and check status
  useEffect(() => {
    if (isSocketReady) {
      checkMatchmakingStatus()
    }
  }, [checkMatchmakingStatus, isSocketReady])

  // FIXED: Enhanced matchmaking timer with better persistence
  useEffect(() => {
    let interval

    // Start timer when in matchmaking OR when we have a start time (for persistence)
    // Keep timer running through entire flow: matchmaking → preparing → ready
    if (
      (inMatchmaking || preparingChallenge || challengeReady) &&
      matchmakingStartTime
    ) {
      // Calculate initial elapsed time immediately
      const initialElapsed = Math.floor(
        (Date.now() - matchmakingStartTime) / 1000,
      )
      setMatchmakingTime(initialElapsed)

      interval = setInterval(() => {
        if (!componentMounted.current) return
        const elapsed = Math.floor((Date.now() - matchmakingStartTime) / 1000)
        setMatchmakingTime(elapsed)
      }, 1000)

      console.log(
        '[MM_BUTTON] Timer started, initial time:',
        initialElapsed,
        'seconds',
      )
    } else if (!inMatchmaking && !preparingChallenge && !challengeReady) {
      // Only reset timer when completely out of matchmaking flow
      setMatchmakingTime(0)
      setMatchmakingStartTime(null)
      console.log('[MM_BUTTON] Timer reset - no active matchmaking')
    }

    return () => {
      if (interval) {
        clearInterval(interval)
        console.log('[MM_BUTTON] Timer interval cleared')
      }
    }
  }, [inMatchmaking, preparingChallenge, challengeReady, matchmakingStartTime])

  // Initialize start time when matchmaking begins
  useEffect(() => {
    if (inMatchmaking && !matchmakingStartTime) {
      const now = Date.now()
      setMatchmakingStartTime(now)
      setMatchmakingTime(0) // Reset timer display immediately
      console.log('[MM_BUTTON] Matchmaking start time set:', new Date(now))
    }
  }, [inMatchmaking, matchmakingStartTime])

  // Failsafe: Ensure timer starts even if Redux state loads after component mount
  useEffect(() => {
    // If we're in matchmaking but don't have a start time, set it
    if (inMatchmaking && !matchmakingStartTime && !isRequestPending) {
      const now = Date.now()
      setMatchmakingStartTime(now)
      setMatchmakingTime(0) // Reset timer display immediately
      console.log(
        '[MM_BUTTON] Failsafe: Setting missing start time:',
        new Date(now),
      )
    }
  }, [inMatchmaking, matchmakingStartTime, isRequestPending])

  // Handle request timeout
  useEffect(() => {
    if (isRequestPending && !joinTimeoutRef.current) {
      // Set a timeout for the join request
      joinTimeoutRef.current = setTimeout(() => {
        if (!componentMounted.current) return

        console.error('[MM_BUTTON] Join request timed out')
        setIsRequestPending(false)

        toast({
          title: t('Request Timeout'),
          description: t(
            'The matchmaking request took too long. Please try again.',
          ),
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }, 15000) // 15 second timeout
    } else if (!isRequestPending && joinTimeoutRef.current) {
      clearTimeout(joinTimeoutRef.current)
      joinTimeoutRef.current = null
    }

    return () => {
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current)
        joinTimeoutRef.current = null
      }
    }
  }, [isRequestPending, toast, t])

  // Clear request pending when loading changes
  useEffect(() => {
    if (!matchmakingLoading && isRequestPending) {
      setIsRequestPending(false)
    }
  }, [matchmakingLoading, isRequestPending])

  // NEW: Reset dismissal states when starting new processes
  useEffect(() => {
    // Reset search dismissal when starting new matchmaking
    if (inMatchmaking && userDismissedSearch) {
      console.log(
        '[MM_BUTTON] New matchmaking started, resetting search dismissal',
      )
      setUserDismissedSearch(false)
    }
  }, [inMatchmaking, userDismissedSearch])

  // NEW: Reset preparation dismissal for new matches
  useEffect(() => {
    if (preparingChallenge || challengeReady) {
      // Create a unique ID for this preparation session
      const newPreparationId =
        preparingChallenge?.opponent?.name ||
        challengeReady?.challengeId ||
        Date.now().toString()

      // If this is a new preparation session, reset dismissal
      if (lastPreparationId !== newPreparationId) {
        console.log(
          '[MM_BUTTON] New preparation detected, resetting dismissal',
          {
            old: lastPreparationId,
            new: newPreparationId,
          },
        )
        setLastPreparationId(newPreparationId)
        setUserDismissedPreparation(false)
      }
    }
  }, [preparingChallenge, challengeReady, lastPreparationId])

  // FIXED: Enhanced state transition logic with better preparation data handling
  useEffect(() => {
    console.log('[MM_BUTTON] Evaluating state transitions...', {
      inMatchmaking,
      preparingChallenge: !!preparingChallenge,
      challengeReady: !!challengeReady,
      preparationProgress,
      storedOpponentData: !!storedOpponentData,
      userDismissedSearch,
      userDismissedPreparation,
      searchModalOpen,
      preparationModalOpen,
      userJustClosedSearch: userJustClosedSearchModal.current,
      userJustClosedPreparation: userJustClosedPreparationModal.current,
    })

    // Don't override user actions immediately
    if (
      userJustClosedSearchModal.current ||
      userJustClosedPreparationModal.current
    ) {
      console.log(
        '[MM_BUTTON] Skipping state transition - user just closed modal',
      )
      return
    }

    // Rule 1: If in matchmaking (searching) and no match found yet
    if (
      inMatchmaking &&
      !preparingChallenge &&
      !challengeReady &&
      preparationProgress === 0
    ) {
      // Only open search modal if user hasn't dismissed it AND it's not already open
      if (!userDismissedSearch && !searchModalOpen) {
        console.log('[MM_BUTTON] Opening search modal (not dismissed)')
        setSearchModalOpen(true)
        setPreparationModalOpen(false)
      }
      return
    }

    // Rule 2: If match found (preparing challenge) or challenge ready OR we have progress > 0
    // FIXED: Also check if we have stored opponent data or progress indicating preparation
    if (
      preparingChallenge ||
      challengeReady ||
      preparationProgress > 0 ||
      storedOpponentData
    ) {
      // Close search modal first
      setSearchModalOpen(false)

      // FIXED: If challenge is ready and user dismissed modal, don't reopen it
      if (challengeReady && userDismissedPreparation) {
        console.log(
          '[MM_BUTTON] Challenge ready but user dismissed - not reopening modal',
        )
        return
      }

      // Only open preparation modal if user hasn't dismissed it AND it's not already open
      if (!userDismissedPreparation && !preparationModalOpen) {
        console.log('[MM_BUTTON] Opening preparation modal (not dismissed)')
        setPreparationModalOpen(true)
      }
      return
    }

    // Rule 3: If not in matchmaking and no preparation
    if (
      !inMatchmaking &&
      !preparingChallenge &&
      !challengeReady &&
      preparationProgress === 0 &&
      !storedOpponentData
    ) {
      console.log('[MM_BUTTON] Closing all modals - no active states')
      setSearchModalOpen(false)
      setPreparationModalOpen(false)
      // Reset dismissal states when everything is clear
      setUserDismissedSearch(false)
      setUserDismissedPreparation(false)
      setLastPreparationId(null)
      // Reset ref flags
      userJustClosedSearchModal.current = false
      userJustClosedPreparationModal.current = false
      return
    }
  }, [
    inMatchmaking,
    preparingChallenge,
    challengeReady,
    preparationProgress,
    storedOpponentData,
    // Removed userDismissedSearch and userDismissedPreparation from dependencies
    // to prevent state conflicts
  ])

  // Handle errors
  useEffect(() => {
    if (matchmakingError) {
      console.error('[MM_BUTTON] Matchmaking error:', matchmakingError)
      setIsRequestPending(false)

      // Reset timer on error
      setMatchmakingStartTime(null)
      setMatchmakingTime(0)

      toast({
        title: t('Matchmaking Error'),
        description: matchmakingError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })

      // Clear the error after showing it
      setTimeout(() => {
        clearMatchmakingError()
      }, 100)
    }
  }, [matchmakingError, toast, t, clearMatchmakingError])

  // Separate enforcement for user dismissal (but don't override explicit user actions)
  useEffect(() => {
    // Only enforce dismissal if user isn't actively interacting
    if (
      userJustClosedSearchModal.current ||
      userJustClosedPreparationModal.current
    ) {
      return // Don't enforce during user actions
    }

    // Enforce search modal dismissal after a delay
    if (userDismissedSearch && searchModalOpen) {
      const timeoutId = setTimeout(() => {
        console.log('[MM_BUTTON] Enforcing search modal dismissal (delayed)')
        setSearchModalOpen(false)
      }, 200)
      return () => clearTimeout(timeoutId)
    }

    // Enforce preparation modal dismissal after a delay
    if (userDismissedPreparation && preparationModalOpen) {
      const timeoutId = setTimeout(() => {
        console.log(
          '[MM_BUTTON] Enforcing preparation modal dismissal (delayed)',
        )
        setPreparationModalOpen(false)
      }, 200)
      return () => clearTimeout(timeoutId)
    }
  }, [
    userDismissedSearch,
    searchModalOpen,
    userDismissedPreparation,
    preparationModalOpen,
  ])

  // Join matchmaking handler with timeout protection
  const handleJoinMatchmaking = useCallback(async () => {
    if (isRequestPending) {
      console.warn('[MM_BUTTON] Request already pending, ignoring')
      return
    }

    try {
      if (!isSocketReady) {
        console.warn('[MM_BUTTON] Socket not ready for matchmaking')
        toast({
          title: t('Connection Error'),
          description: t('Please wait for connection to be established'),
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      console.log('[MM_BUTTON] Starting matchmaking process')
      setIsRequestPending(true)

      // Force reset timer state before starting
      setMatchmakingStartTime(null)
      setMatchmakingTime(0)

      // Reset dismissal states when starting new matchmaking
      setUserDismissedSearch(false)
      setUserDismissedPreparation(false)

      // Reset ref flags
      userJustClosedSearchModal.current = false
      userJustClosedPreparationModal.current = false

      // Clear any previous preparation session
      setLastPreparationId(null)
      setStoredOpponentData(null)
      setStoredChallengeId(null)

      await joinMatchmaking()

      if (!componentMounted.current) return

      console.log('[MM_BUTTON] Successfully joined matchmaking')
      setIsRequestPending(false)

      toast({
        title: t('Joined Matchmaking'),
        description: t('Searching for opponents...'),
        status: 'info',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      if (!componentMounted.current) return

      console.error('[MM_BUTTON] Failed to join matchmaking:', error)
      setIsRequestPending(false)
      // Force reset timer on error
      setMatchmakingStartTime(null)
      setMatchmakingTime(0)

      toast({
        title: t('Failed to Join'),
        description: error.message || t('Could not join matchmaking'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [joinMatchmaking, isSocketReady, toast, t, isRequestPending])

  // Leave matchmaking handler
  const handleLeaveMatchmaking = useCallback(async () => {
    try {
      console.log('[MM_BUTTON] Leaving matchmaking')

      // Clear timer states BEFORE leaving matchmaking
      setMatchmakingStartTime(null)
      setMatchmakingTime(0)

      await leaveMatchmaking()

      if (!componentMounted.current) return

      setSearchModalOpen(false)
      setPreparationModalOpen(false)
      setIsRequestPending(false)

      // Reset dismissal states when leaving
      setUserDismissedSearch(false)
      setUserDismissedPreparation(false)
      setLastPreparationId(null)

      // Clear stored data
      setStoredOpponentData(null)
      setStoredChallengeId(null)

      // Reset ref flags
      userJustClosedSearchModal.current = false
      userJustClosedPreparationModal.current = false

      console.log('[MM_BUTTON] Successfully left matchmaking')
      toast({
        title: t('Left Matchmaking'),
        description: t('You have left the queue'),
        status: 'info',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      if (!componentMounted.current) return

      console.error('[MM_BUTTON] Failed to leave matchmaking:', error)
      toast({
        title: t('Error'),
        description: error.message || t('Could not leave matchmaking'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [leaveMatchmaking, toast, t])

  // Handle explicit modal reopening by user action
  const handleOpenSearchModal = useCallback(() => {
    console.log('[MM_BUTTON] User explicitly opened search modal')
    // Reset dismissal flags when user explicitly reopens
    setUserDismissedSearch(false)
    userJustClosedSearchModal.current = false
    setSearchModalOpen(true)
  }, [])

  const handleOpenPreparationModal = useCallback(() => {
    console.log('[MM_BUTTON] User explicitly opened preparation modal')
    // Reset dismissal flags when user explicitly reopens
    setUserDismissedPreparation(false)
    userJustClosedPreparationModal.current = false
    setPreparationModalOpen(true)
  }, [])

  // Navigate to challenge
  const handlePlayNow = useCallback(() => {
    const challengeId = challengeReady?.challengeId || storedChallengeId
    if (challengeId) {
      console.log(`[MM_BUTTON] Navigating to challenge: ${challengeId}`)
      navigateToChallenge(challengeId)
      setPreparationModalOpen(false)

      // Reset all timer and dismissal states after navigation
      setMatchmakingStartTime(null)
      setMatchmakingTime(0)
      setUserDismissedPreparation(false)
      setLastPreparationId(null)

      // Clear stored data
      setStoredOpponentData(null)
      setStoredChallengeId(null)

      // Reset ref flags
      userJustClosedSearchModal.current = false
      userJustClosedPreparationModal.current = false
    }
  }, [challengeReady, storedChallengeId, navigateToChallenge])

  // UPDATED: Close handlers with user dismissal tracking
  const handleCloseSearchModal = useCallback(() => {
    console.log('[MM_BUTTON] User manually closed search modal - BEFORE:', {
      searchModalOpen,
      userDismissedSearch,
      inMatchmaking,
    })

    // Set flag to prevent immediate reopening
    userJustClosedSearchModal.current = true

    setUserDismissedSearch(true) // Mark as user dismissed FIRST
    setSearchModalOpen(false) // Then close the modal

    // Reset the flag after a brief delay
    setTimeout(() => {
      userJustClosedSearchModal.current = false
    }, 500)

    console.log(
      '[MM_BUTTON] User manually closed search modal - AFTER setting states',
    )
  }, [searchModalOpen, userDismissedSearch, inMatchmaking])

  const handleClosePreparationModal = useCallback(() => {
    console.log('[MM_BUTTON] User manually closed preparation modal', {
      challengeReady: !!challengeReady,
      preparingChallenge: !!preparingChallenge,
      preparationProgress,
    })

    // Set flag to prevent immediate reopening
    userJustClosedPreparationModal.current = true

    setUserDismissedPreparation(true) // Mark as user dismissed FIRST
    setPreparationModalOpen(false) // Then close the modal

    // Reset the flag after a brief delay
    setTimeout(() => {
      userJustClosedPreparationModal.current = false
    }, 500)
  }, [challengeReady, preparingChallenge, preparationProgress])

  // Separate useEffect to handle user dismissal actions with debounced enforcement
  useEffect(() => {
    // Debounce the enforcement to prevent immediate conflicts with state transitions
    const timeoutId = setTimeout(() => {
      // If user dismissed search modal, ensure it stays closed
      if (userDismissedSearch && searchModalOpen) {
        console.log('[MM_BUTTON] Enforcing search modal dismissal (debounced)')
        setSearchModalOpen(false)
      }

      // If user dismissed preparation modal, ensure it stays closed
      if (userDismissedPreparation && preparationModalOpen) {
        console.log(
          '[MM_BUTTON] Enforcing preparation modal dismissal (debounced)',
        )
        setPreparationModalOpen(false)
      }
    }, 100) // 100ms debounce

    return () => clearTimeout(timeoutId)
  }, [
    userDismissedSearch,
    searchModalOpen,
    userDismissedPreparation,
    preparationModalOpen,
  ])

  // Memoized format time function to prevent recreating on every render
  const formatTime = useCallback(seconds => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // FIXED: Determine current state for button rendering with better data handling
  const getCurrentState = () => {
    // FIXED: If challenge is ready but user dismissed the modal, return to idle state
    if ((challengeReady || storedChallengeId) && userDismissedPreparation) {
      console.log(
        '[MM_BUTTON] Challenge ready but user dismissed modal - returning to idle state',
      )
      return 'idle'
    }

    // If we're preparing a challenge (match found but not ready yet) OR have preparation progress
    if (
      (preparingChallenge || storedOpponentData || preparationProgress > 0) &&
      !challengeReady &&
      !storedChallengeId
    ) {
      return 'preparing'
    }

    // If challenge is ready and modal not dismissed, show preparing state
    if ((challengeReady || storedChallengeId) && !userDismissedPreparation) {
      return 'preparing'
    }

    // If actively searching for match
    if (inMatchmaking || isRequestPending) return 'searching'

    // Default idle state
    return 'idle'
  }

  const currentState = getCurrentState()
  const isLoading = matchmakingLoading || isRequestPending

  // Debug current state for troubleshooting
  useEffect(() => {
    console.log('[MM_BUTTON] Current button state:', {
      currentState,
      challengeReady: !!challengeReady,
      preparingChallenge: !!preparingChallenge,
      userDismissedPreparation,
      preparationProgress,
      inMatchmaking,
      isRequestPending,
      storedOpponentData: !!storedOpponentData,
      storedChallengeId: !!storedChallengeId,
    })
  }, [
    currentState,
    challengeReady,
    preparingChallenge,
    userDismissedPreparation,
    preparationProgress,
    inMatchmaking,
    isRequestPending,
    storedOpponentData,
    storedChallengeId,
  ])

  // FIXED: Create preparation data object with fallbacks
  const getPreparationData = useCallback(() => {
    // If we have preparingChallenge, use it
    if (preparingChallenge) {
      return preparingChallenge
    }

    // If we have stored opponent data, create a data object
    if (storedOpponentData) {
      return {
        opponent: storedOpponentData,
        tempChallengeId: null,
        isChallenger: true, // Default fallback
      }
    }

    // Return null if no data available
    return null
  }, [preparingChallenge, storedOpponentData])

  // Render button based on current state
  const renderButton = () => {
    if (compact) {
      // Compact version for floating menu
      switch (currentState) {
        case 'preparing':
          return (
            <Tooltip label={t('Match Found!')}>
              <MotionButton
                colorScheme="green"
                onClick={handleOpenPreparationModal}
                borderRadius="full"
                bgGradient="linear(to-r, green.500, teal.500)"
                boxShadow="0 4px 10px rgba(0,0,0,0.25)"
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(72, 187, 120, 0.4)',
                    '0 0 20px rgba(72, 187, 120, 0.7)',
                    '0 0 0px rgba(72, 187, 120, 0.4)',
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                p={2}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Icon as={Globe} boxSize={4} color="white" />
                </motion.div>
              </MotionButton>
            </Tooltip>
          )

        case 'searching':
          return (
            <Tooltip label={t('Searching for match...')}>
              <MotionButton
                colorScheme="blue"
                onClick={handleOpenSearchModal}
                borderRadius="full"
                bgGradient="linear(to-r, blue.500, purple.500)"
                boxShadow="0 4px 10px rgba(0,0,0,0.25)"
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(66, 153, 225, 0.4)',
                    '0 0 20px rgba(66, 153, 225, 0.7)',
                    '0 0 0px rgba(66, 153, 225, 0.4)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                p={2}
              >
                <Spinner size="sm" color="white" />
              </MotionButton>
            </Tooltip>
          )

        default: // idle
          return (
            <Tooltip label={t('Find Match')}>
              <MotionButton
                colorScheme="purple"
                onClick={handleJoinMatchmaking}
                isLoading={isLoading}
                borderRadius="full"
                bgGradient="linear(to-r, purple.600, blue.600)"
                boxShadow="0 4px 10px rgba(0,0,0,0.25)"
                _hover={{ transform: 'translateY(-2px)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                isDisabled={!isSocketReady || isRequestPending}
                p={2}
              >
                <Icon as={Zap} boxSize={5} />
              </MotionButton>
            </Tooltip>
          )
      }
    }

    // Full-size version
    switch (currentState) {
      case 'preparing':
        return (
          <MotionButton
            colorScheme="green"
            size="lg"
            leftIcon={<Icon as={Activity} />}
            onClick={handleOpenPreparationModal}
            borderRadius="full"
            px={8}
            py={6}
            mb={4}
            bgGradient="linear(to-r, green.500, teal.500)"
            boxShadow="0 4px 20px rgba(72, 187, 120, 0.5)"
            animate={{
              boxShadow: [
                '0 0 0px rgba(72, 187, 120, 0.4)',
                '0 0 25px rgba(72, 187, 120, 0.8)',
                '0 0 0px rgba(72, 187, 120, 0.4)',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('Match Found')}
          </MotionButton>
        )

      case 'searching':
        return (
          <MotionButton
            colorScheme="blue"
            size="lg"
            leftIcon={<Spinner size="sm" />}
            onClick={handleOpenSearchModal}
            borderRadius="full"
            px={8}
            py={6}
            mb={4}
            bgGradient="linear(to-r, blue.500, purple.500)"
            boxShadow="0 4px 20px rgba(66, 153, 225, 0.5)"
            animate={{
              boxShadow: [
                '0 0 0px rgba(66, 153, 225, 0.4)',
                '0 0 25px rgba(66, 153, 225, 0.8)',
                '0 0 0px rgba(66, 153, 225, 0.4)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {isRequestPending ? t('Joining...') : t('Searching...')}
          </MotionButton>
        )

      default: // idle
        return (
          <MotionButton
            colorScheme="purple"
            size="lg"
            leftIcon={<Icon as={Shield} />}
            onClick={handleJoinMatchmaking}
            isLoading={isLoading}
            loadingText={isRequestPending ? t('Joining...') : t('Loading...')}
            borderRadius="full"
            px={8}
            py={7}
            mb={4}
            bgGradient="linear(to-r, purple.600, blue.600)"
            boxShadow="0 4px 20px rgba(124, 58, 237, 0.5)"
            whileHover={{
              scale: 1.05,
              boxShadow: '0 8px 30px rgba(124, 58, 237, 0.7)',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
            _hover={{
              bgGradient: 'linear(to-r, purple.500, blue.500)',
            }}
            _active={{
              bgGradient: 'linear(to-r, purple.700, blue.700)',
            }}
            isDisabled={!isSocketReady || isRequestPending}
          >
            {t('SOLO')}
          </MotionButton>
        )
    }
  }

  return (
    <>
      {renderButton()}

      {/* Searching Modal - Rendered directly */}
      {searchModalOpen && (
        <Modal
          key="searching-modal"
          isOpen={searchModalOpen}
          onClose={handleCloseSearchModal}
          isCentered
          size="lg"
          closeOnOverlayClick={false}
        >
          <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(10px)" />
          <ModalContent
            bg="rgba(26, 21, 39, 0.95)"
            borderWidth="1px"
            borderColor="blue.400"
            borderRadius="xl"
            boxShadow="0 0 20px rgba(66, 153, 225, 0.4)"
          >
            <ModalHeader
              color="white"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Icon as={Users} color="blue.400" />
              {t('Finding Opponents')}
              {socketConnected && (
                <Badge colorScheme="green" size="sm" ml={2}>
                  {t('Connected')}
                </Badge>
              )}
              {!socketConnected && (
                <Badge colorScheme="orange" size="sm" ml={2}>
                  <Icon as={AlertTriangle} boxSize={3} mr={1} />
                  {t('Reconnecting')}
                </Badge>
              )}
            </ModalHeader>
            <ModalCloseButton color="white" />

            <ModalBody py={6}>
              <VStack spacing={6} align="center">
                {/* Animated Spinner */}
                <MotionFlex
                  justify="center"
                  align="center"
                  w="120px"
                  h="120px"
                  borderRadius="full"
                  bg="rgba(66, 153, 225, 0.1)"
                  border="2px solid"
                  borderColor="blue.400"
                  position="relative"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                >
                  <Spinner
                    size="xl"
                    thickness="4px"
                    speed="0.8s"
                    color="blue.400"
                  />
                  <MotionFlex
                    position="absolute"
                    justify="center"
                    align="center"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 30,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Box
                        key={i}
                        position="absolute"
                        w="6px"
                        h="6px"
                        borderRadius="full"
                        bg="blue.400"
                        transform={`rotate(${i * 45}deg) translateY(-50px)`}
                        opacity={0.6 + (i % 2) * 0.4}
                      />
                    ))}
                  </MotionFlex>
                </MotionFlex>

                {/* Status Text */}
                <VStack spacing={2} align="center">
                  <Text color="white" fontSize="xl" fontWeight="bold">
                    {isRequestPending
                      ? t('Joining Queue...')
                      : t('Searching for Opponents')}
                  </Text>
                  <Text color="whiteAlpha.700" fontSize="md" textAlign="center">
                    {isRequestPending
                      ? t('Please wait while we add you to the queue...')
                      : t('Finding the perfect match for your skill level...')}
                  </Text>
                </VStack>

                <Divider borderColor="whiteAlpha.300" />

                {/* Stats */}
                <HStack spacing={8} justify="center">
                  <VStack spacing={1}>
                    <Text color="whiteAlpha.600" fontSize="sm">
                      {t('Time in Queue')}
                    </Text>
                    <HStack
                      p={2}
                      borderRadius="md"
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                    >
                      <Icon as={Clock} color="blue.300" boxSize={4} />
                      <Text color="white" fontWeight="bold" fontFamily="mono">
                        {formatTime(matchmakingTime)}
                      </Text>
                    </HStack>
                    {/* Debug info - remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                      <Text color="whiteAlpha.500" fontSize="xs">
                        Start:{' '}
                        {matchmakingStartTime
                          ? new Date(matchmakingStartTime).toLocaleTimeString()
                          : 'Not set'}
                      </Text>
                    )}
                  </VStack>

                  <VStack spacing={1}>
                    <Text color="whiteAlpha.600" fontSize="sm">
                      {t('Status')}
                    </Text>
                    <MotionBadge
                      colorScheme={isRequestPending ? 'orange' : 'blue'}
                      px={3}
                      py={1}
                      animate={{
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                    >
                      {isRequestPending ? t('Joining...') : t('Searching')}
                    </MotionBadge>
                  </VStack>
                </HStack>

                {/* Connection Status */}
                <Box w="100%" pt={2}>
                  <HStack justify="center" spacing={2}>
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg={socketConnected ? 'green.400' : 'orange.400'}
                    />
                    <Text color="whiteAlpha.600" fontSize="xs">
                      {socketConnected ? t('Connected') : t('Reconnecting...')}
                    </Text>
                    {deviceFingerprint && (
                      <>
                        <Text color="whiteAlpha.400" fontSize="xs">
                          •
                        </Text>
                        <Text color="whiteAlpha.400" fontSize="xs">
                          {deviceFingerprint}
                        </Text>
                      </>
                    )}
                  </HStack>
                </Box>

                {/* Info Text */}
                <Box w="100%" pt={2}>
                  <Text color="whiteAlpha.600" fontSize="sm" textAlign="center">
                    {t(
                      "You can close this modal and continue browsing. We'll notify you when a match is found.",
                    )}
                  </Text>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleLeaveMatchmaking}
                leftIcon={<Icon as={X} />}
                _hover={{ bg: 'red.900' }}
                isLoading={isLoading}
                isDisabled={isRequestPending}
              >
                {isRequestPending ? t('Please Wait') : t('Leave Queue')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* FIXED: Match Preparation Modal with proper data handling */}
      <MatchPreparationModal
        isOpen={preparationModalOpen}
        onClose={handleClosePreparationModal}
        preparingData={getPreparationData()}
        challengeId={challengeReady?.challengeId || storedChallengeId}
        onPlayNow={handlePlayNow}
        progress={preparationProgress}
        step={preparationStep}
      />
    </>
  )
})

MatchmakingButton.displayName = 'MatchmakingButton'

export default MatchmakingButton
