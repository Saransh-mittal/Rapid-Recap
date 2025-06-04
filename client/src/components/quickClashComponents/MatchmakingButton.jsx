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

  // Refs for cleanup
  const joinTimeoutRef = useRef(null)
  const componentMounted = useRef(true)

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
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current)
      }
    }
  }, [])

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

  // Handle matchmaking timer
  useEffect(() => {
    let interval
    if (inMatchmaking && matchmakingStartTime) {
      interval = setInterval(() => {
        if (!componentMounted.current) return
        const elapsed = Math.floor((Date.now() - matchmakingStartTime) / 1000)
        setMatchmakingTime(elapsed)
      }, 1000)
    } else if (!inMatchmaking) {
      setMatchmakingTime(0)
      setMatchmakingStartTime(null)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [inMatchmaking, matchmakingStartTime])

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

  // FIXED: Better state transition logic
  useEffect(() => {
    console.log('[MM_BUTTON] Evaluating state transitions...')

    // Rule 1: If in matchmaking (searching) and no match found yet
    if (inMatchmaking && !preparingChallenge && !challengeReady) {
      console.log('[MM_BUTTON] Opening search modal')
      setSearchModalOpen(true)
      setPreparationModalOpen(false)
      return
    }

    // Rule 2: If match found (preparing challenge) or challenge ready
    if (preparingChallenge || challengeReady || preparationProgress > 0) {
      console.log('[MM_BUTTON] Opening preparation modal')
      setSearchModalOpen(false)
      setPreparationModalOpen(true)
      return
    }

    // Rule 3: If not in matchmaking and no preparation
    if (
      !inMatchmaking &&
      !preparingChallenge &&
      !challengeReady &&
      preparationProgress === 0
    ) {
      console.log('[MM_BUTTON] Closing all modals')
      setSearchModalOpen(false)
      setPreparationModalOpen(false)
      return
    }
  }, [inMatchmaking, preparingChallenge, challengeReady, preparationProgress])

  // Handle errors
  useEffect(() => {
    if (matchmakingError) {
      console.error('[MM_BUTTON] Matchmaking error:', matchmakingError)
      setIsRequestPending(false)

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
      setMatchmakingStartTime(Date.now())

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
      await leaveMatchmaking()

      if (!componentMounted.current) return

      setSearchModalOpen(false)
      setPreparationModalOpen(false)
      setMatchmakingStartTime(null)
      setIsRequestPending(false)

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

  // Navigate to challenge
  const handlePlayNow = useCallback(() => {
    if (challengeReady?.challengeId) {
      console.log(
        `[MM_BUTTON] Navigating to challenge: ${challengeReady.challengeId}`,
      )
      navigateToChallenge(challengeReady.challengeId)
      setPreparationModalOpen(false)
    }
  }, [challengeReady, navigateToChallenge])

  // Close modals without affecting state
  const handleCloseSearchModal = useCallback(() => {
    setSearchModalOpen(false)
    // Don't leave matchmaking, just close modal
  }, [])

  const handleClosePreparationModal = useCallback(() => {
    setPreparationModalOpen(false)
    // Don't clear state, just close modal
  }, [])

  // Format time display
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Determine current state for button rendering
  const getCurrentState = () => {
    if (challengeReady) return 'ready'
    if (preparingChallenge || preparationProgress > 0) return 'preparing'
    if (inMatchmaking || isRequestPending) return 'searching'
    return 'idle'
  }

  const currentState = getCurrentState()
  const isLoading = matchmakingLoading || isRequestPending

  // Searching Modal Component
  const SearchingModal = () => (
    <Modal
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
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
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
  )

  // Render button based on current state
  const renderButton = () => {
    if (compact) {
      // Compact version for floating menu
      switch (currentState) {
        case 'ready':
          return (
            <Tooltip label={t('Challenge Ready!')}>
              <MotionButton
                colorScheme="green"
                onClick={handlePlayNow}
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
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                >
                  <Icon as={CheckCircle} boxSize={4} color="white" />
                </motion.div>
              </MotionButton>
            </Tooltip>
          )

        case 'preparing':
          return (
            <Tooltip label={t('Match Found!')}>
              <MotionButton
                colorScheme="green"
                onClick={() => setPreparationModalOpen(true)}
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
                onClick={() => setSearchModalOpen(true)}
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
      case 'ready':
        return (
          <MotionButton
            colorScheme="green"
            size="lg"
            leftIcon={<Icon as={CheckCircle} />}
            onClick={handlePlayNow}
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
            {t('Play Now!')}
          </MotionButton>
        )

      case 'preparing':
        return (
          <MotionButton
            colorScheme="green"
            size="lg"
            leftIcon={<Icon as={Activity} />}
            onClick={() => setPreparationModalOpen(true)}
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
            onClick={() => setSearchModalOpen(true)}
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

      {/* Searching Modal */}
      <SearchingModal />

      {/* Match Preparation Modal */}
      <MatchPreparationModal
        isOpen={preparationModalOpen}
        onClose={handleClosePreparationModal}
        preparingData={preparingChallenge}
        challengeId={challengeReady?.challengeId}
        onPlayNow={handlePlayNow}
        progress={preparationProgress}
        step={preparationStep}
      />
    </>
  )
})

MatchmakingButton.displayName = 'MatchmakingButton'

export default MatchmakingButton
