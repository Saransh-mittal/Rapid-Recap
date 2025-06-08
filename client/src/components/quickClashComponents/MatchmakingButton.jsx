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
  PlayCircle,
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

const MatchmakingButton = forwardRef(
  (
    { compact = false, buttonTextOverride, iconOverride, bgGradientOverride },
    ref,
  ) => {
    const { t } = useTranslation('QuickClash')
    const toast = useToast()
    const navigate = useNavigate()

    // Local state for UI control
    const [searchModalOpen, setSearchModalOpen] = useState(false)
    const [preparationModalOpen, setPreparationModalOpen] = useState(false)
    const [matchmakingTime, setMatchmakingTime] = useState(0)
    const [matchmakingStartTime, setMatchmakingStartTime] = useState(null)
    const [isRequestPending, setIsRequestPending] = useState(false)

    // ENHANCED: State to track modal minimization vs complete closure
    const [isPreparationMinimized, setIsPreparationMinimized] = useState(false)
    const [isSearchMinimized, setIsSearchMinimized] = useState(false)

    // User dismissal tracking - simplified and aligned with modal
    const [userDismissedSearch, setUserDismissedSearch] = useState(false)

    // Refs for cleanup and component lifecycle
    const joinTimeoutRef = useRef(null)
    const componentMounted = useRef(true)
    const lastPrepModalCloseReason = useRef(null) // 'minimize' | 'close' | null

    // Get matchmaking state from hook with enhanced cleanup functions
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

      // ENHANCED: Use cleanup functions (close option available when ready)
      clearMatchmakingAfterModal,
      clearAllMatchmakingStates,
    } = useQuickClashMatchmaking()

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        componentMounted.current = false
        if (joinTimeoutRef.current) {
          clearTimeout(joinTimeoutRef.current)
        }
      }
    }, [])

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

    // ENHANCED: Matchmaking timer with better persistence across the entire flow
    useEffect(() => {
      let interval

      // Keep timer running through entire flow: matchmaking → preparing → ready
      if (
        (inMatchmaking ||
          preparingChallenge ||
          challengeReady ||
          preparationProgress > 0) &&
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
          '[MM_BUTTON] Timer running, elapsed:',
          initialElapsed,
          'seconds',
        )
      } else if (
        !inMatchmaking &&
        !preparingChallenge &&
        !challengeReady &&
        preparationProgress === 0
      ) {
        // Only reset timer when completely out of matchmaking flow
        setMatchmakingTime(0)
        setMatchmakingStartTime(null)
        console.log('[MM_BUTTON] Timer reset - matchmaking flow ended')
      }

      return () => {
        if (interval) {
          clearInterval(interval)
        }
      }
    }, [
      inMatchmaking,
      preparingChallenge,
      challengeReady,
      preparationProgress,
      matchmakingStartTime,
    ])

    // Initialize start time when matchmaking begins
    useEffect(() => {
      if (inMatchmaking && !matchmakingStartTime) {
        const now = Date.now()
        setMatchmakingStartTime(now)
        setMatchmakingTime(0)
        console.log('[MM_BUTTON] Matchmaking start time set:', new Date(now))
      }
    }, [inMatchmaking, matchmakingStartTime])

    // Handle request timeout
    useEffect(() => {
      if (isRequestPending && !joinTimeoutRef.current) {
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
        }, 15000)
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

    // ENHANCED: Smart modal state management aligned with MatchPreparationModal
    useEffect(() => {
      console.log('[MM_BUTTON] Evaluating modal states...', {
        inMatchmaking,
        preparingChallenge: !!preparingChallenge,
        challengeReady: !!challengeReady,
        preparationProgress,
        isPreparationMinimized,
        isSearchMinimized,
        userDismissedSearch,
        lastCloseReason: lastPrepModalCloseReason.current,
      })

      // Rule 1: Handle search modal for active matchmaking
      if (
        inMatchmaking &&
        !preparingChallenge &&
        !challengeReady &&
        preparationProgress === 0
      ) {
        if (!userDismissedSearch && !isSearchMinimized) {
          setSearchModalOpen(true)
          setPreparationModalOpen(false)
        } else if (isSearchMinimized) {
          setSearchModalOpen(false)
        }
        return
      }

      // Rule 2: Handle preparation modal for match found or in progress
      if (preparingChallenge || challengeReady || preparationProgress > 0) {
        // Close search modal
        setSearchModalOpen(false)
        setIsSearchMinimized(false)
        setUserDismissedSearch(false)

        // Only open preparation modal if not minimized (close available when ready)
        if (!isPreparationMinimized) {
          setPreparationModalOpen(true)
        }
        return
      }

      // Rule 3: No active matchmaking - close all modals and reset states
      // Note: Preparation modal can be closed when ready, minimized otherwise
      if (
        !inMatchmaking &&
        !preparingChallenge &&
        !challengeReady &&
        preparationProgress === 0
      ) {
        console.log('[MM_BUTTON] No active states - resetting all modal states')
        setSearchModalOpen(false)
        setPreparationModalOpen(false)
        setIsSearchMinimized(false)
        setIsPreparationMinimized(false)
        setUserDismissedSearch(false)
        lastPrepModalCloseReason.current = null
      }
    }, [
      inMatchmaking,
      preparingChallenge,
      challengeReady,
      preparationProgress,
      isPreparationMinimized,
      isSearchMinimized,
      userDismissedSearch,
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

    // ENHANCED: Join matchmaking handler with proper state reset
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

        console.log('[MM_BUTTON] Starting new matchmaking process')
        setIsRequestPending(true)

        // ENHANCED: Complete state reset before starting
        setMatchmakingStartTime(null)
        setMatchmakingTime(0)
        setUserDismissedSearch(false)
        setIsSearchMinimized(false)
        setIsPreparationMinimized(false)
        lastPrepModalCloseReason.current = null

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

    // ENHANCED: Leave matchmaking handler with comprehensive cleanup
    const handleLeaveMatchmaking = useCallback(async () => {
      try {
        console.log('[MM_BUTTON] Leaving matchmaking')

        // Clear timer states BEFORE leaving matchmaking
        setMatchmakingStartTime(null)
        setMatchmakingTime(0)

        await leaveMatchmaking()

        if (!componentMounted.current) return

        // Reset all local states
        setSearchModalOpen(false)
        setPreparationModalOpen(false)
        setIsRequestPending(false)
        setUserDismissedSearch(false)
        setIsSearchMinimized(false)
        setIsPreparationMinimized(false)
        lastPrepModalCloseReason.current = null

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

    // ENHANCED: Modal handlers with minimize vs close distinction
    const handleOpenSearchModal = useCallback(() => {
      console.log('[MM_BUTTON] User explicitly opened search modal')
      setUserDismissedSearch(false)
      setIsSearchMinimized(false)
      setSearchModalOpen(true)
    }, [])

    const handleOpenPreparationModal = useCallback(() => {
      console.log('[MM_BUTTON] User explicitly opened preparation modal')
      setIsPreparationMinimized(false)
      setPreparationModalOpen(true)
    }, [])

    // ENHANCED: Handle search modal close (always treat as minimize for active matchmaking)
    const handleCloseSearchModal = useCallback(() => {
      console.log('[MM_BUTTON] Search modal closed - minimizing')
      setIsSearchMinimized(true)
      setSearchModalOpen(false)

      // Only mark as dismissed if not actively matchmaking
      if (!inMatchmaking) {
        setUserDismissedSearch(true)
      }
    }, [inMatchmaking])

    // ENHANCED: Handle preparation modal close/minimize (close only available when ready)
    const handlePreparationModalClose = useCallback((reason = 'minimize') => {
      console.log('[MM_BUTTON] Preparation modal action:', reason)

      lastPrepModalCloseReason.current = reason
      setPreparationModalOpen(false)

      if (reason === 'minimize') {
        // User minimized - keep state for reopening
        setIsPreparationMinimized(true)
        console.log(
          '[MM_BUTTON] Modal minimized - preserving state for reopening',
        )
      } else if (reason === 'close') {
        // User closed completely (only available when ready) - clear state
        setIsPreparationMinimized(false)
        console.log(
          '[MM_BUTTON] Modal closed completely - state cleared by modal',
        )
      }
    }, [])

    // ENHANCED: Navigate to challenge with proper cleanup (close available when ready)
    const handlePlayNow = useCallback(() => {
      const challengeId = challengeReady?.challengeId
      if (challengeId) {
        console.log(`[MM_BUTTON] Navigating to challenge: ${challengeId}`)

        // Clear modal state and navigate (modal will handle its own cleanup)
        setPreparationModalOpen(false)
        setIsPreparationMinimized(false)
        setMatchmakingStartTime(null)
        setMatchmakingTime(0)
        lastPrepModalCloseReason.current = 'navigate'

        navigateToChallenge(challengeId)
      }
    }, [challengeReady, navigateToChallenge])

    // ENHANCED: Determine current button state (close available when ready)
    const getCurrentState = () => {
      // If challenge is ready and modal is just minimized, show as ready
      if (challengeReady && isPreparationMinimized) {
        return 'ready'
      }

      // If preparing or challenge ready and modal not minimized, show as preparing
      if (
        (preparingChallenge || challengeReady || preparationProgress > 0) &&
        !isPreparationMinimized
      ) {
        return 'preparing' // Modal should be open
      }

      // If preparing or challenge ready and modal is minimized, show as ready to reopen
      if (
        (preparingChallenge || challengeReady || preparationProgress > 0) &&
        isPreparationMinimized
      ) {
        return 'ready'
      }

      // If actively searching for match and modal not minimized
      if ((inMatchmaking || isRequestPending) && !isSearchMinimized) {
        return 'searching' // Modal should be open
      }

      // If searching and modal is minimized, show as ready to reopen
      if ((inMatchmaking || isRequestPending) && isSearchMinimized) {
        return 'searching_minimized'
      }

      // Default idle state
      return 'idle'
    }

    const currentState = getCurrentState()
    const isLoading = matchmakingLoading || isRequestPending

    // Format time helper
    const formatTime = useCallback(seconds => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }, [])

    // ENHANCED: Button click handler based on current state
    const handleButtonClick = useCallback(() => {
      switch (currentState) {
        case 'ready':
          // Reopen preparation modal at current progress
          handleOpenPreparationModal()
          break
        case 'searching_minimized':
          // Reopen search modal
          handleOpenSearchModal()
          break
        case 'preparing':
          // Already handled by modal state
          break
        case 'searching':
          // Already handled by modal state
          break
        case 'idle':
        default:
          // Start new matchmaking
          handleJoinMatchmaking()
          break
      }
    }, [
      currentState,
      handleOpenPreparationModal,
      handleOpenSearchModal,
      handleJoinMatchmaking,
    ])

    // Render button based on current state
    const renderButton = () => {
      // Use overrides if provided (for customization like in header)
      const buttonText =
        buttonTextOverride ||
        (() => {
          switch (currentState) {
            case 'ready':
              return challengeReady ? t('Challenge Ready!') : t('Match Found!')
            case 'searching_minimized':
              return t('Searching...')
            case 'preparing':
              return t('Preparing...')
            case 'searching':
              return isRequestPending ? t('Joining...') : t('Searching...')
            case 'idle':
            default:
              return t('SOLO')
          }
        })()

      const buttonIcon =
        iconOverride ||
        (() => {
          switch (currentState) {
            case 'ready':
              return challengeReady ? PlayCircle : Activity
            case 'searching_minimized':
            case 'searching':
              return Users
            case 'preparing':
              return Globe
            case 'idle':
            default:
              return Shield
          }
        })()

      const buttonGradient =
        bgGradientOverride ||
        (() => {
          switch (currentState) {
            case 'ready':
              return 'linear(to-r, green.500, teal.500)'
            case 'searching_minimized':
            case 'searching':
              return 'linear(to-r, blue.500, purple.500)'
            case 'preparing':
              return 'linear(to-r, orange.500, yellow.500)'
            case 'idle':
            default:
              return 'linear(to-r, purple.600, blue.600)'
          }
        })()

      const buttonColorScheme = (() => {
        switch (currentState) {
          case 'ready':
            return 'green'
          case 'searching_minimized':
          case 'searching':
            return 'blue'
          case 'preparing':
            return 'orange'
          case 'idle':
          default:
            return 'purple'
        }
      })()

      if (compact) {
        // Compact version for floating menu
        return (
          <Tooltip
            label={typeof buttonText === 'function' ? buttonText() : buttonText}
          >
            <MotionButton
              colorScheme={buttonColorScheme}
              onClick={handleButtonClick}
              borderRadius="full"
              bgGradient={
                typeof buttonGradient === 'function'
                  ? buttonGradient()
                  : buttonGradient
              }
              boxShadow="0 4px 10px rgba(0,0,0,0.25)"
              animate={{
                boxShadow:
                  currentState === 'ready'
                    ? [
                        '0 0 0px rgba(72, 187, 120, 0.4)',
                        '0 0 20px rgba(72, 187, 120, 0.7)',
                        '0 0 0px rgba(72, 187, 120, 0.4)',
                      ]
                    : currentState.includes('searching')
                    ? [
                        '0 0 0px rgba(66, 153, 225, 0.4)',
                        '0 0 20px rgba(66, 153, 225, 0.7)',
                        '0 0 0px rgba(66, 153, 225, 0.4)',
                      ]
                    : undefined,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              p={2}
              isDisabled={!isSocketReady || isRequestPending}
            >
              {currentState.includes('searching') &&
              !currentState.includes('minimized') ? (
                <Spinner size="sm" color="white" />
              ) : (
                <Icon
                  as={
                    typeof buttonIcon === 'function' ? buttonIcon() : buttonIcon
                  }
                  boxSize={4}
                  color="white"
                />
              )}
            </MotionButton>
          </Tooltip>
        )
      }

      // Full-size version
      return (
        <MotionButton
          colorScheme={buttonColorScheme}
          size="lg"
          leftIcon={
            currentState.includes('searching') &&
            !currentState.includes('minimized') ? (
              <Spinner size="sm" />
            ) : (
              <Icon
                as={
                  typeof buttonIcon === 'function' ? buttonIcon() : buttonIcon
                }
              />
            )
          }
          onClick={handleButtonClick}
          isLoading={isLoading && currentState === 'idle'}
          loadingText={isRequestPending ? t('Joining...') : t('Loading...')}
          borderRadius="full"
          px={8}
          py={currentState === 'idle' ? 7 : 6}
          mb={4}
          bgGradient={
            typeof buttonGradient === 'function'
              ? buttonGradient()
              : buttonGradient
          }
          boxShadow={`0 4px 20px rgba(124, 58, 237, 0.5)`}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 8px 30px rgba(124, 58, 237, 0.7)',
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3 }}
          animate={{
            boxShadow:
              currentState === 'ready'
                ? [
                    '0 4px 20px rgba(72, 187, 120, 0.5)',
                    '0 8px 30px rgba(72, 187, 120, 0.8)',
                    '0 4px 20px rgba(72, 187, 120, 0.5)',
                  ]
                : currentState.includes('searching')
                ? [
                    '0 4px 20px rgba(66, 153, 225, 0.5)',
                    '0 8px 30px rgba(66, 153, 225, 0.8)',
                    '0 4px 20px rgba(66, 153, 225, 0.5)',
                  ]
                : undefined,
          }}
          isDisabled={
            !isSocketReady || (isRequestPending && currentState === 'idle')
          }
        >
          {typeof buttonText === 'function' ? buttonText() : buttonText}
        </MotionButton>
      )
    }

    return (
      <>
        {renderButton()}

        {/* Searching Modal */}
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
                    animate={{ scale: [1, 1.05, 1] }}
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
                  </MotionFlex>

                  {/* Status Text */}
                  <VStack spacing={2} align="center">
                    <Text color="white" fontSize="xl" fontWeight="bold">
                      {isRequestPending
                        ? t('Joining Queue...')
                        : t('Searching for Opponents')}
                    </Text>
                    <Text
                      color="whiteAlpha.700"
                      fontSize="md"
                      textAlign="center"
                    >
                      {isRequestPending
                        ? t('Please wait while we add you to the queue...')
                        : t(
                            'Finding the perfect match for your skill level...',
                          )}
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
                    </VStack>

                    <VStack spacing={1}>
                      <Text color="whiteAlpha.600" fontSize="sm">
                        {t('Status')}
                      </Text>
                      <MotionBadge
                        colorScheme={isRequestPending ? 'orange' : 'blue'}
                        px={3}
                        py={1}
                        animate={{ opacity: [0.7, 1, 0.7] }}
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

                  {/* Info Text */}
                  <Box w="100%" pt={2}>
                    <Text
                      color="whiteAlpha.600"
                      fontSize="sm"
                      textAlign="center"
                    >
                      {t(
                        "You can minimize this and continue browsing. We'll notify you when a match is found.",
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

        {/* ENHANCED: Match Preparation Modal with minimize/close distinction */}
        <MatchPreparationModal
          isOpen={preparationModalOpen}
          onClose={handlePreparationModalClose}
          preparingData={preparingChallenge}
          challengeId={challengeReady?.challengeId}
          onPlayNow={handlePlayNow}
          progress={preparationProgress}
          step={preparationStep}
        />
      </>
    )
  },
)

MatchmakingButton.displayName = 'MatchmakingButton'

export default MatchmakingButton
