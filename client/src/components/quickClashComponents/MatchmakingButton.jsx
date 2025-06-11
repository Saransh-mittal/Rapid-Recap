// components/quickClashComponents/MatchmakingButton.jsx - REDESIGNED WITH CONSISTENT SIZING
import React, {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
  useMemo,
  memo,
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
  Sword,
} from 'lucide-react'
import useQuickClashMatchmaking from '../../customHooks/useQuickClashMatchmaking'
import MatchPreparationModal from './modals/MatchPreparationModal'

const MotionButton = motion(Button)
const MotionFlex = motion(Flex)
const MotionBadge = motion(Badge)

// Enhanced button states with better visual design
const BUTTON_STATES = {
  idle: {
    text: 'SOLO',
    icon: Sword,
    colorScheme: 'purple',
    gradient: 'linear(135deg, #667eea 0%, #764ba2 100%)',
    shadowColor: 'rgba(102, 126, 234, 0.4)',
    hoverShadowColor: 'rgba(102, 126, 234, 0.6)',
  },
  searching: {
    text: 'Searching...',
    icon: Users,
    colorScheme: 'blue',
    gradient: 'linear(135deg, #667eea 0%, #764ba2 100%)',
    shadowColor: 'rgba(66, 153, 225, 0.4)',
    hoverShadowColor: 'rgba(66, 153, 225, 0.6)',
  },
  preparing: {
    text: 'Preparing...',
    icon: Globe,
    colorScheme: 'orange',
    gradient: 'linear(135deg, #f093fb 0%, #f5576c 100%)',
    shadowColor: 'rgba(245, 87, 108, 0.4)',
    hoverShadowColor: 'rgba(245, 87, 108, 0.6)',
  },
  ready: {
    text: 'Challenge Ready!',
    icon: PlayCircle,
    colorScheme: 'green',
    gradient: 'linear(135deg, #4facfe 0%, #00f2fe 100%)',
    shadowColor: 'rgba(72, 187, 120, 0.4)',
    hoverShadowColor: 'rgba(72, 187, 120, 0.6)',
  },
}

// Memoized Timer Component
const Timer = memo(({ seconds }) => {
  const formatTime = useCallback(secs => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`
  }, [])

  return (
    <HStack
      p={2}
      borderRadius="md"
      bg="whiteAlpha.100"
      border="1px solid"
      borderColor="whiteAlpha.200"
    >
      <Icon as={Clock} color="blue.300" boxSize={4} />
      <Text color="white" fontWeight="bold" fontFamily="mono">
        {formatTime(seconds)}
      </Text>
    </HStack>
  )
})

const MatchmakingButton = forwardRef((props, ref) => {
  const {
    // NEW: Fixed sizing props for consistency
    buttonSize = { base: 'md', md: 'lg' },
    buttonWidth = { base: '100%', md: '240px' }, // Fixed width on desktop
    buttonHeight = { base: '48px', md: '56px' }, // Fixed height
    buttonMinWidth = { base: '140px', md: '240px' },
    // Text and icon override props
    buttonTextOverride,
    iconOverride,
    bgGradientOverride,
    shadowColorOverride,
    // Compact mode for header
    compact = false,
    ...otherProps
  } = props

  const { t } = useTranslation('QuickClash')
  const toast = useToast()

  // Unified state management
  const [state, setState] = useState({
    searchModalOpen: false,
    preparationModalOpen: false,
    isPreparationMinimized: false,
    isSearchMinimized: false,
    userDismissedSearch: false,
    matchmakingTime: 0,
    matchmakingStartTime: null,
    isRequestPending: false,
  })

  // Refs
  const componentMounted = useRef(true)
  const timerIntervalRef = useRef(null)
  const lastPrepModalCloseReason = useRef(null)

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
    isSocketReady,
    joinMatchmaking,
    leaveMatchmaking,
    checkMatchmakingStatus,
    clearMatchmakingError,
    navigateToChallenge,
  } = useQuickClashMatchmaking()

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      componentMounted.current = false
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [])

  // Expose method to parent components
  useImperativeHandle(ref, () => ({ handleJoinMatchmaking }), [])

  // Determine current button state
  const currentState = useMemo(() => {
    if (challengeReady && state.isPreparationMinimized) return 'ready'
    if (
      (preparingChallenge || challengeReady || preparationProgress > 0) &&
      !state.isPreparationMinimized
    )
      return 'preparing'
    if (
      (preparingChallenge || challengeReady || preparationProgress > 0) &&
      state.isPreparationMinimized
    )
      return 'ready'
    if ((inMatchmaking || state.isRequestPending) && !state.isSearchMinimized)
      return 'searching'
    if ((inMatchmaking || state.isRequestPending) && state.isSearchMinimized)
      return 'searching'
    return 'idle'
  }, [
    challengeReady,
    preparingChallenge,
    preparationProgress,
    inMatchmaking,
    state.isPreparationMinimized,
    state.isSearchMinimized,
    state.isRequestPending,
  ])

  // Batch state updates
  const updateState = useCallback(updates => {
    if (componentMounted.current) {
      setState(prev => ({ ...prev, ...updates }))
    }
  }, [])

  // Timer management
  useEffect(() => {
    const shouldRunTimer =
      (inMatchmaking ||
        preparingChallenge ||
        challengeReady ||
        preparationProgress > 0) &&
      state.matchmakingStartTime

    if (shouldRunTimer && !timerIntervalRef.current) {
      const initialElapsed = Math.floor(
        (Date.now() - state.matchmakingStartTime) / 1000,
      )
      updateState({ matchmakingTime: initialElapsed })

      timerIntervalRef.current = setInterval(() => {
        if (!componentMounted.current) return
        const elapsed = Math.floor(
          (Date.now() - state.matchmakingStartTime) / 1000,
        )
        updateState({ matchmakingTime: elapsed })
      }, 1000)
    } else if (!shouldRunTimer && timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null

      if (
        !inMatchmaking &&
        !preparingChallenge &&
        !challengeReady &&
        preparationProgress === 0
      ) {
        updateState({ matchmakingTime: 0, matchmakingStartTime: null })
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [
    inMatchmaking,
    preparingChallenge,
    challengeReady,
    preparationProgress,
    state.matchmakingStartTime,
    updateState,
  ])

  // Initialize start time when matchmaking begins
  useEffect(() => {
    if (inMatchmaking && !state.matchmakingStartTime) {
      const now = Date.now()
      updateState({ matchmakingStartTime: now, matchmakingTime: 0 })
    }
  }, [inMatchmaking, state.matchmakingStartTime, updateState])

  // Modal state management
  useEffect(() => {
    // Rule 1: Handle search modal for active matchmaking
    if (
      inMatchmaking &&
      !preparingChallenge &&
      !challengeReady &&
      preparationProgress === 0
    ) {
      if (!state.userDismissedSearch && !state.isSearchMinimized) {
        updateState({ searchModalOpen: true, preparationModalOpen: false })
      } else if (state.isSearchMinimized) {
        updateState({ searchModalOpen: false })
      }
      return
    }

    // Rule 2: Handle preparation modal for match found or in progress
    if (preparingChallenge || challengeReady || preparationProgress > 0) {
      updateState({
        searchModalOpen: false,
        isSearchMinimized: false,
        userDismissedSearch: false,
        preparationModalOpen: !state.isPreparationMinimized,
      })
      return
    }

    // Rule 3: No active matchmaking - reset states
    if (
      !inMatchmaking &&
      !preparingChallenge &&
      !challengeReady &&
      preparationProgress === 0
    ) {
      updateState({
        searchModalOpen: false,
        preparationModalOpen: false,
        isSearchMinimized: false,
        isPreparationMinimized: false,
        userDismissedSearch: false,
      })
      lastPrepModalCloseReason.current = null
    }
  }, [
    inMatchmaking,
    preparingChallenge,
    challengeReady,
    preparationProgress,
    state.isPreparationMinimized,
    state.isSearchMinimized,
    state.userDismissedSearch,
    updateState,
  ])

  // Handle errors
  useEffect(() => {
    if (matchmakingError) {
      updateState({
        isRequestPending: false,
        matchmakingStartTime: null,
        matchmakingTime: 0,
      })

      toast({
        title: t('Matchmaking Error'),
        description: matchmakingError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })

      setTimeout(clearMatchmakingError, 100)
    }
  }, [matchmakingError, toast, t, clearMatchmakingError, updateState])

  // Action handlers
  const handleJoinMatchmaking = useCallback(async () => {
    if (state.isRequestPending) return

    try {
      if (!isSocketReady) {
        toast({
          title: t('Connection Error'),
          description: t('Please wait for connection to be established'),
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      updateState({
        isRequestPending: true,
        matchmakingStartTime: null,
        matchmakingTime: 0,
        userDismissedSearch: false,
        isSearchMinimized: false,
        isPreparationMinimized: false,
      })
      lastPrepModalCloseReason.current = null

      await joinMatchmaking()

      if (componentMounted.current) {
        updateState({ isRequestPending: false })
      }
    } catch (error) {
      if (componentMounted.current) {
        updateState({
          isRequestPending: false,
          matchmakingStartTime: null,
          matchmakingTime: 0,
        })

        toast({
          title: t('Failed to Join'),
          description: error.message || t('Could not join matchmaking'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }
  }, [
    state.isRequestPending,
    isSocketReady,
    joinMatchmaking,
    toast,
    t,
    updateState,
  ])

  const handleLeaveMatchmaking = useCallback(async () => {
    try {
      updateState({ matchmakingStartTime: null, matchmakingTime: 0 })
      await leaveMatchmaking()

      if (componentMounted.current) {
        updateState({
          searchModalOpen: false,
          preparationModalOpen: false,
          userDismissedSearch: false,
          isSearchMinimized: false,
          isPreparationMinimized: false,
          isRequestPending: false,
        })
        lastPrepModalCloseReason.current = null

        toast({
          title: t('Left Matchmaking'),
          description: t('You have left the queue'),
          status: 'info',
          duration: 2000,
          isClosable: true,
        })
      }
    } catch (error) {
      if (componentMounted.current) {
        toast({
          title: t('Error'),
          description: error.message || t('Could not leave matchmaking'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }
  }, [leaveMatchmaking, toast, t, updateState])

  // Modal handlers
  const modalHandlers = useMemo(
    () => ({
      openSearchModal: () => {
        updateState({
          userDismissedSearch: false,
          isSearchMinimized: false,
          searchModalOpen: true,
        })
      },
      openPreparationModal: () => {
        updateState({
          isPreparationMinimized: false,
          preparationModalOpen: true,
        })
      },
      closeSearchModal: () => {
        updateState({
          isSearchMinimized: true,
          searchModalOpen: false,
          userDismissedSearch: !inMatchmaking,
        })
      },
      handlePreparationModalClose: (reason = 'minimize') => {
        lastPrepModalCloseReason.current = reason
        updateState({
          preparationModalOpen: false,
          isPreparationMinimized: reason === 'minimize',
        })
      },
      handlePlayNow: () => {
        const challengeId = challengeReady?.challengeId
        if (challengeId) {
          updateState({
            preparationModalOpen: false,
            isPreparationMinimized: false,
            matchmakingStartTime: null,
            matchmakingTime: 0,
          })
          lastPrepModalCloseReason.current = 'navigate'
          navigateToChallenge(challengeId)
        }
      },
    }),
    [updateState, inMatchmaking, challengeReady, navigateToChallenge],
  )

  // Button click handler
  const handleButtonClick = useCallback(() => {
    switch (currentState) {
      case 'ready':
        modalHandlers.openPreparationModal()
        break
      case 'searching':
        if (state.isSearchMinimized) {
          modalHandlers.openSearchModal()
        }
        break
      case 'preparing':
        break
      case 'idle':
      default:
        handleJoinMatchmaking()
        break
    }
  }, [
    currentState,
    modalHandlers,
    handleJoinMatchmaking,
    state.isSearchMinimized,
  ])

  // Button configuration
  const buttonConfig = useMemo(() => {
    const config = BUTTON_STATES[currentState]
    const isLoading = matchmakingLoading || state.isRequestPending

    let buttonText = config.text
    if (buttonTextOverride && currentState === 'idle') {
      buttonText = buttonTextOverride
    } else if (currentState === 'ready') {
      buttonText = challengeReady ? t('Challenge Ready!') : t('Match Found!')
    } else if (currentState === 'searching') {
      buttonText = state.isRequestPending ? t('Joining...') : t('Searching...')
    } else {
      buttonText = t(config.text)
    }

    return {
      text: buttonText,
      icon: iconOverride || config.icon,
      gradient: bgGradientOverride || config.gradient,
      shadowColor: shadowColorOverride || config.shadowColor,
      hoverShadowColor: shadowColorOverride || config.hoverShadowColor,
      colorScheme: config.colorScheme,
      isLoading,
      isDisabled:
        !isSocketReady || (state.isRequestPending && currentState === 'idle'),
    }
  }, [
    currentState,
    challengeReady,
    state.isRequestPending,
    matchmakingLoading,
    isSocketReady,
    buttonTextOverride,
    iconOverride,
    bgGradientOverride,
    shadowColorOverride,
    t,
  ])

  // Enhanced button animations
  const buttonAnimation = useMemo(() => {
    const baseAnimation = {
      scale: 1,
      rotate: 0,
    }

    if (currentState === 'ready') {
      return {
        ...baseAnimation,
        boxShadow: [
          `0 8px 32px ${buttonConfig.shadowColor}`,
          `0 12px 48px ${buttonConfig.hoverShadowColor}`,
          `0 8px 32px ${buttonConfig.shadowColor}`,
        ],
        scale: [1, 1.02, 1],
      }
    }
    if (currentState === 'searching') {
      return {
        ...baseAnimation,
        boxShadow: [
          `0 8px 32px ${buttonConfig.shadowColor}`,
          `0 12px 48px ${buttonConfig.hoverShadowColor}`,
          `0 8px 32px ${buttonConfig.shadowColor}`,
        ],
      }
    }
    return baseAnimation
  }, [currentState, buttonConfig.shadowColor, buttonConfig.hoverShadowColor])

  // Initialize on mount
  useEffect(() => {
    if (isSocketReady) {
      checkMatchmakingStatus()
    }
  }, [checkMatchmakingStatus, isSocketReady])

  return (
    <>
      {/* Enhanced Button with Fixed Sizing */}
      <MotionButton
        size={buttonSize}
        leftIcon={
          currentState === 'searching' && !state.isSearchMinimized ? (
            <Spinner size="sm" />
          ) : (
            <Icon as={buttonConfig.icon} boxSize={5} />
          )
        }
        rightIcon={
          currentState === 'searching' &&
          state.matchmakingTime > 0 &&
          !compact ? (
            <Text fontSize="xs" fontFamily="mono">
              {Math.floor(state.matchmakingTime / 60)}:
              {(state.matchmakingTime % 60).toString().padStart(2, '0')}
            </Text>
          ) : null
        }
        onClick={handleButtonClick}
        isLoading={buttonConfig.isLoading && currentState === 'idle'}
        loadingText={state.isRequestPending ? t('Joining...') : t('Loading...')}
        borderRadius="full"
        mb={compact ? 0 : 4}
        bgGradient={buttonConfig.gradient}
        boxShadow={`0 8px 32px ${buttonConfig.shadowColor}`}
        border="2px solid"
        borderColor="whiteAlpha.200"
        color="white"
        fontWeight="bold"
        fontSize={{ base: 'sm', md: 'md' }}
        textShadow="0 2px 4px rgba(0,0,0,0.3)"
        position="relative"
        overflow="hidden"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: `0 12px 48px ${buttonConfig.hoverShadowColor}`,
          borderColor: 'whiteAlpha.400',
        }}
        _active={{
          transform: 'translateY(0px)',
          boxShadow: `0 6px 24px ${buttonConfig.shadowColor}`,
        }}
        _disabled={{
          opacity: 0.6,
          cursor: 'not-allowed',
          transform: 'none',
        }}
        // Fixed sizing props
        w={buttonWidth}
        h={buttonHeight}
        minW={buttonMinWidth}
        // Enhanced animations
        animate={buttonAnimation}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
          boxShadow: {
            duration: 2,
            repeat:
              currentState === 'ready' || currentState === 'searching'
                ? Infinity
                : 0,
            repeatType: 'reverse',
          },
          scale: {
            duration: 1.5,
            repeat: currentState === 'ready' ? Infinity : 0,
            repeatType: 'reverse',
          },
        }}
        whileHover={{
          scale: buttonConfig.isDisabled ? 1 : 1.05,
          transition: { duration: 0.2 },
        }}
        whileTap={{
          scale: buttonConfig.isDisabled ? 1 : 0.98,
          transition: { duration: 0.1 },
        }}
        isDisabled={buttonConfig.isDisabled}
        {...otherProps}
        // Glassmorphism effect
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          borderRadius: 'full',
          pointerEvents: 'none',
        }}
      >
        {buttonConfig.text}
      </MotionButton>

      {/* Search Modal */}
      <Modal
        isOpen={state.searchModalOpen}
        onClose={modalHandlers.closeSearchModal}
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
          <ModalHeader color="white" display="flex" alignItems="center" gap={2}>
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

              <VStack spacing={2} align="center">
                <Text color="white" fontSize="xl" fontWeight="bold">
                  {state.isRequestPending
                    ? t('Joining Queue...')
                    : t('Searching for Opponents')}
                </Text>
                <Text color="whiteAlpha.700" fontSize="md" textAlign="center">
                  {state.isRequestPending
                    ? t('Please wait while we add you to the queue...')
                    : t('Finding the perfect match for your skill level...')}
                </Text>
              </VStack>

              <Divider borderColor="whiteAlpha.300" />

              <HStack spacing={8} justify="center">
                <VStack spacing={1}>
                  <Text color="whiteAlpha.600" fontSize="sm">
                    {t('Time in Queue')}
                  </Text>
                  <Timer seconds={state.matchmakingTime} />
                </VStack>

                <VStack spacing={1}>
                  <Text color="whiteAlpha.600" fontSize="sm">
                    {t('Status')}
                  </Text>
                  <MotionBadge
                    colorScheme={state.isRequestPending ? 'orange' : 'blue'}
                    px={3}
                    py={1}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  >
                    {state.isRequestPending ? t('Joining...') : t('Searching')}
                  </MotionBadge>
                </VStack>
              </HStack>

              <Box w="100%" pt={2}>
                <Text color="whiteAlpha.600" fontSize="sm" textAlign="center">
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
              isLoading={buttonConfig.isLoading}
              isDisabled={state.isRequestPending}
            >
              {state.isRequestPending ? t('Please Wait') : t('Leave Queue')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Match Preparation Modal */}
      <MatchPreparationModal
        isOpen={state.preparationModalOpen}
        onClose={modalHandlers.handlePreparationModalClose}
        preparingData={preparingChallenge}
        challengeId={challengeReady?.challengeId}
        onPlayNow={modalHandlers.handlePlayNow}
        progress={preparationProgress}
        step={preparationStep}
      />
    </>
  )
})

Timer.displayName = 'Timer'
MatchmakingButton.displayName = 'MatchmakingButton'

export default MatchmakingButton
