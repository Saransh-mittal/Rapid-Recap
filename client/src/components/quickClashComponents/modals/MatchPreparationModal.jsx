// components/quickClashComponents/modals/MatchPreparationModal.jsx - OPTIMIZED VERSION
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  memo,
  useMemo,
} from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Icon,
  Flex,
  Badge,
  Divider,
  Button,
  useToast,
  useBreakpointValue,
  IconButton,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Sword,
  Shield,
  CheckCircle,
  Zap,
  PlayCircle,
  Loader,
  Minimize2,
  X,
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import {
  clearMatchmakingAfterChallengeReady,
  clearMatchmakingAfterModalClose,
} from '../../../redux/quickClashMatchmakingSlice'
import MatchTrophyPotentialDisplay from '../ui/MatchTrophyPotentialDisplay'

const MotionBox = motion(Box)
const MotionAvatar = motion(Avatar)
const MotionIcon = motion(Icon)
const MotionBadge = motion(Badge)
const MotionButton = motion(Button)
const MotionIconButton = motion(IconButton)

// OPTIMIZATION: Memoized constants to prevent recreation
const STEP_CONFIGS = [
  {
    id: 'matchFound',
    title: 'Match Found',
    description: 'Found your opponent!',
    color: 'green.500',
    progressMin: 0,
    progressMax: 20,
  },
  {
    id: 'contentLoading',
    title: 'Loading Content',
    description: 'Preparing quiz content...',
    color: 'blue.500',
    progressMin: 20,
    progressMax: 60,
  },
  {
    id: 'generatingQuiz',
    title: 'Generating Questions',
    description: 'Creating your challenge...',
    color: 'purple.500',
    progressMin: 60,
    progressMax: 95,
  },
  {
    id: 'challengeReady',
    title: 'Challenge Ready',
    description: 'Ready to play!',
    color: 'teal.500',
    progressMin: 95,
    progressMax: 100,
  },
]

// OPTIMIZATION: Pre-computed keyframes to prevent recreation
const subtleFloat = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
  100% { transform: translateY(0px); }
`

const shineAnimation = keyframes`
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
`

// OPTIMIZATION: Memoized helper function
const calculateTrophyPotential = (playerTrophies, opponentTrophies) => {
  const BASE_TROPHIES = 30
  const TROPHY_K_FACTOR = 0.8

  const potentialGain = Math.max(
    5,
    Math.round(
      BASE_TROPHIES *
        (1 + (TROPHY_K_FACTOR * (opponentTrophies - playerTrophies)) / 500),
    ),
  )

  const potentialLoss = Math.min(
    potentialGain,
    Math.max(0, playerTrophies - 100),
  )

  return { potentialGain, potentialLoss }
}

// OPTIMIZATION: Memoized VS Badge Component with minimal re-renders
const OptimizedVSBadge = memo(({ size = 'md', isActive = false }) => {
  // OPTIMIZATION: Memoize size properties
  const sizeProps = useMemo(() => {
    const configs = {
      sm: { size: '32px', fontSize: 'xs' },
      md: { size: '40px', fontSize: 'sm' },
      lg: { size: '48px', fontSize: 'md' },
    }
    return configs[size] || configs.md
  }, [size])

  // OPTIMIZATION: Memoize styles
  const badgeStyles = useMemo(
    () => ({
      width: sizeProps.size,
      height: sizeProps.size,
      borderRadius: 'full',
      bg: isActive ? 'green.500' : 'gray.700',
      border: '2px solid',
      borderColor: isActive ? 'green.400' : 'yellow.400',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      boxShadow: isActive
        ? '0 0 10px rgba(72, 187, 120, 0.5)'
        : '0 0 8px rgba(255, 215, 0, 0.3)',
      animation: isActive ? `${subtleFloat} 2s infinite` : 'none',
    }),
    [sizeProps.size, isActive],
  )

  const textStyles = useMemo(
    () => ({
      color: isActive ? 'white' : 'yellow.400',
      fontWeight: 'bold',
      fontSize: sizeProps.fontSize,
      textShadow: isActive
        ? '0 0 3px rgba(72, 187, 120, 0.5)'
        : '0 0 3px rgba(255, 215, 0, 0.5)',
    }),
    [isActive, sizeProps.fontSize],
  )

  return (
    <Flex {...badgeStyles}>
      <Text {...textStyles}>VS</Text>
    </Flex>
  )
})

// OPTIMIZATION: Memoized Progress Bar Component
const OptimizedProgressBar = memo(({ progress, isComplete }) => {
  const progressBarStyles = useMemo(
    () => ({
      position: 'relative',
      w: '100%',
      h: '10px',
      borderRadius: 'full',
      overflow: 'hidden',
      bg: 'rgba(0,0,0,0.3)',
      border: '1px solid',
      borderColor: 'whiteAlpha.200',
    }),
    [],
  )

  const progressFillStyles = useMemo(
    () => ({
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      bg: isComplete ? 'green.400' : 'purple.500',
      borderRadius: 'full',
      boxShadow: isComplete
        ? '0 0 8px rgba(72, 187, 120, 0.4)'
        : '0 0 6px rgba(128, 90, 213, 0.3)',
    }),
    [isComplete],
  )

  return (
    <Box {...progressBarStyles}>
      <MotionBox
        {...progressFillStyles}
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          height="100%"
          width="100%"
          bgGradient="linear(90deg, transparent, rgba(255,255,255,0.3), transparent)"
          animation={`${shineAnimation} 3s infinite`}
        />
      </MotionBox>
    </Box>
  )
})

// OPTIMIZATION: Memoized Player Card Component
const PlayerCard = memo(({ player, isUser = false, avatarSize = 'lg' }) => {
  const cardStyles = useMemo(
    () => ({
      spacing: 3,
      flex: 1,
      align: 'center',
    }),
    [],
  )

  const avatarProps = useMemo(
    () => ({
      size: avatarSize,
      name: player?.name,
      src: player?.pic,
      bg: isUser ? 'purple.500' : 'blue.500',
      border: '3px solid',
      borderColor: isUser ? 'purple.300' : 'blue.300',
    }),
    [player, isUser, avatarSize],
  )

  const motionProps = useMemo(
    () => ({
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: isUser ? 0.2 : 0.4,
      },
    }),
    [isUser],
  )

  return (
    <VStack {...cardStyles}>
      <Text
        color="whiteAlpha.700"
        fontSize="xs"
        fontWeight="medium"
        textAlign="center"
      >
        {player?.inGameName || (isUser ? 'You' : 'Opponent')}
      </Text>
      <MotionAvatar {...avatarProps} {...motionProps} />
      <Text
        color="white"
        fontWeight="bold"
        fontSize="sm"
        textAlign="center"
        noOfLines={1}
      >
        {player?.name}
      </Text>
    </VStack>
  )
})

/**
 * OPTIMIZED Match Preparation Modal with enhanced performance
 */
const MatchPreparationModal = ({
  isOpen,
  onClose,
  preparingData = null,
  challengeId = null,
  onPlayNow,
  progress = 0,
  step = null,
}) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const toast = useToast()
  const { user } = useSelector(state => state.auth)

  // OPTIMIZATION: Batch state updates
  const [modalState, setModalState] = useState({
    currentProgress: 0,
    isComplete: false,
    showPlayButton: false,
  })

  // Refs
  const hasShownCompletionToast = useRef(false)
  const progressAnimationRef = useRef(null)
  const componentMounted = useRef(true)

  // FIXED: Move responsive values to top level (cannot use hooks inside useMemo)
  const avatarSize = useBreakpointValue({ base: 'lg', md: 'xl' })
  const modalSize = useBreakpointValue({ base: 'full', md: 'xl' })
  const contentPadding = useBreakpointValue({ base: 4, md: 6 })
  const iconSize = useBreakpointValue({ base: 5, md: 6 })
  const vsBadgeSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const trophySize = useBreakpointValue({ base: 'sm', md: 'md' })

  // OPTIMIZATION: Cleanup on unmount
  useEffect(() => {
    componentMounted.current = true
    return () => {
      componentMounted.current = false
      if (progressAnimationRef.current) {
        clearTimeout(progressAnimationRef.current)
      }
    }
  }, [])

  // OPTIMIZATION: Batch state updates function
  const updateModalState = useCallback(updates => {
    if (componentMounted.current) {
      setModalState(prev => ({ ...prev, ...updates }))
    }
  }, [])

  // OPTIMIZATION: Memoized progress animation
  useEffect(() => {
    if (progress !== modalState.currentProgress) {
      if (progressAnimationRef.current) {
        clearTimeout(progressAnimationRef.current)
      }

      progressAnimationRef.current = setTimeout(() => {
        updateModalState({ currentProgress: progress })
      }, 100)
    }

    return () => {
      if (progressAnimationRef.current) {
        clearTimeout(progressAnimationRef.current)
      }
    }
  }, [progress, modalState.currentProgress, updateModalState])

  // OPTIMIZATION: Handle completion state efficiently
  useEffect(() => {
    if (
      modalState.currentProgress >= 100 &&
      challengeId &&
      !modalState.isComplete
    ) {
      updateModalState({ isComplete: true })

      if (!hasShownCompletionToast.current) {
        hasShownCompletionToast.current = true
      }

      setTimeout(() => {
        updateModalState({ showPlayButton: true })
      }, 800)
    }
  }, [
    modalState.currentProgress,
    challengeId,
    modalState.isComplete,
    updateModalState,
  ])

  // OPTIMIZATION: Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setModalState({
        currentProgress: 0,
        isComplete: false,
        showPlayButton: false,
      })
      hasShownCompletionToast.current = false
    }
  }, [isOpen])

  // OPTIMIZATION: Memoize action handlers
  const actionHandlers = useMemo(
    () => ({
      handleMinimize: () => {
        if (onClose) {
          onClose('minimize')
        }
      },
      handleCompleteClose: () => {
        dispatch(clearMatchmakingAfterModalClose())
        if (onClose) {
          onClose('close')
        }
      },
      handlePlayNow: () => {
        dispatch(clearMatchmakingAfterChallengeReady())
        setTimeout(() => {
          if (onPlayNow && challengeId) {
            onPlayNow()
          }
        }, 100)
      },
    }),
    [onClose, onPlayNow, challengeId, dispatch],
  )

  // OPTIMIZATION: Memoize opponent info extraction
  const opponent = useMemo(() => {
    if (preparingData?.opponent) {
      return preparingData.opponent
    }

    if (preparingData && typeof preparingData === 'object') {
      if (preparingData.name && preparingData.name !== user?.name) {
        return {
          name: preparingData.name,
          inGameName: preparingData.inGameName || preparingData.name,
          pic: preparingData.pic || '',
          quickClashTrophies: preparingData.quickClashTrophies || 1000,
        }
      }

      if (preparingData.userName && preparingData.userName !== user?.name) {
        return {
          name: preparingData.userName,
          inGameName: preparingData.userInGameName || preparingData.userName,
          pic: preparingData.userPic || '',
          quickClashTrophies: preparingData.userTrophies || 1000,
        }
      }
    }

    return {
      name: 'Opponent',
      inGameName: 'Player',
      pic: '',
      quickClashTrophies: 1000,
    }
  }, [preparingData, user])

  // OPTIMIZATION: Memoize trophy calculations
  const trophyCalculations = useMemo(() => {
    const userTrophies = user?.quickClashTrophies || 1000
    const opponentTrophies = opponent?.quickClashTrophies || 1000

    const userWinGain = calculateTrophyPotential(
      userTrophies,
      opponentTrophies,
    ).potentialGain
    const opponentWinGain = calculateTrophyPotential(
      opponentTrophies,
      userTrophies,
    ).potentialGain

    return {
      userTrophies,
      opponentTrophies,
      userTrophyPotential: {
        potentialGain: userWinGain,
        potentialLoss: Math.min(
          opponentWinGain,
          Math.max(0, userTrophies - 100),
        ),
      },
      opponentTrophyPotential: {
        potentialGain: opponentWinGain,
        potentialLoss: Math.min(
          userWinGain,
          Math.max(0, opponentTrophies - 100),
        ),
      },
    }
  }, [user?.quickClashTrophies, opponent?.quickClashTrophies])

  // OPTIMIZATION: Memoize current step calculation
  const currentStepData = useMemo(() => {
    let stepIndex = 0

    if (step) {
      const foundIndex = STEP_CONFIGS.findIndex(s => s.id === step)
      if (foundIndex >= 0) stepIndex = foundIndex
    } else {
      // Fallback to progress-based step detection
      for (let i = STEP_CONFIGS.length - 1; i >= 0; i--) {
        if (modalState.currentProgress >= STEP_CONFIGS[i].progressMin) {
          stepIndex = i
          break
        }
      }
    }

    return STEP_CONFIGS[stepIndex] || STEP_CONFIGS[0]
  }, [step, modalState.currentProgress])

  // OPTIMIZATION: Memoize modal styles
  const modalStyles = useMemo(
    () => ({
      bg: '#0D1117',
      borderWidth: '2px',
      borderColor: modalState.isComplete ? 'green.400' : 'purple.400',
      borderRadius: 'xl',
      boxShadow: modalState.isComplete
        ? '0 0 20px rgba(72, 187, 120, 0.4)'
        : '0 0 15px rgba(128, 90, 213, 0.3)',
      overflow: 'hidden',
      position: 'relative',
      mx: { base: 3, md: 'auto' },
    }),
    [modalState.isComplete],
  )

  // OPTIMIZATION: Memoize background gradient
  const backgroundGradient = useMemo(
    () => ({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      bgGradient: modalState.isComplete
        ? 'radial(circle at center, rgba(72, 187, 120, 0.05), transparent 60%)'
        : 'radial(circle at center, rgba(128, 90, 213, 0.05), transparent 60%)',
      zIndex: 0,
      pointerEvents: 'none',
    }),
    [modalState.isComplete],
  )

  // OPTIMIZATION: Memoize header content
  const headerContent = useMemo(
    () => (
      <VStack spacing={3} mt={5}>
        <HStack spacing={3} justify="center" align="center">
          <MotionIcon
            as={modalState.isComplete ? CheckCircle : Sword}
            boxSize={iconSize}
            color={modalState.isComplete ? 'green.400' : 'purple.400'}
            animate={
              modalState.isComplete
                ? { scale: [1, 1.1, 1] }
                : { rotate: [-5, 5, -5] }
            }
            transition={
              modalState.isComplete
                ? { duration: 1.5, repeat: Infinity }
                : { duration: 2, repeat: Infinity, repeatType: 'reverse' }
            }
          />
          <Text
            fontSize={{ base: 'xl', md: '2xl' }}
            fontWeight="bold"
            bgGradient={
              modalState.isComplete
                ? 'linear(to-r, green.300, teal.300)'
                : 'linear(to-r, purple.300, blue.300)'
            }
            bgClip="text"
            letterSpacing="wide"
          >
            {modalState.isComplete
              ? t('Challenge Ready!')
              : t('Preparing Challenge')}
          </Text>
          <MotionIcon
            as={modalState.isComplete ? Zap : Shield}
            boxSize={iconSize}
            color={modalState.isComplete ? 'teal.400' : 'blue.400'}
            animate={
              modalState.isComplete
                ? { scale: [1, 1.1, 1] }
                : { rotate: [5, -5, 5] }
            }
            transition={
              modalState.isComplete
                ? { duration: 1.5, repeat: Infinity }
                : { duration: 2, repeat: Infinity, repeatType: 'reverse' }
            }
          />
        </HStack>
      </VStack>
    ),
    [modalState.isComplete, iconSize, t],
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={
        modalState.showPlayButton
          ? actionHandlers.handleCompleteClose
          : actionHandlers.handleMinimize
      }
      closeOnOverlayClick={false}
      closeOnEsc={modalState.showPlayButton}
      size={modalSize}
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(10px)" />

      <ModalContent {...modalStyles}>
        <Box {...backgroundGradient} />

        <ModalHeader
          color="white"
          textAlign="center"
          py={6}
          position="relative"
          zIndex={2}
        >
          {headerContent}

          <HStack position="absolute" top={4} right={-4} spacing={2}>
            {modalState.showPlayButton ? (
              <MotionIconButton
                icon={<X size={16} />}
                aria-label={t('Close')}
                size="sm"
                variant="ghost"
                color="whiteAlpha.700"
                _hover={{
                  color: 'white',
                  bg: 'whiteAlpha.200',
                }}
                onClick={actionHandlers.handleCompleteClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              />
            ) : (
              <MotionIconButton
                icon={<Minimize2 size={16} />}
                aria-label={t('Minimize')}
                size="sm"
                variant="ghost"
                color="whiteAlpha.700"
                _hover={{
                  color: 'white',
                  bg: 'whiteAlpha.200',
                }}
                onClick={actionHandlers.handleMinimize}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
            )}
          </HStack>
        </ModalHeader>

        <ModalBody
          py={contentPadding}
          px={{ base: 4, md: 6 }}
          pt={{ base: 6, md: 8 }}
          position="relative"
          zIndex={2}
        >
          <VStack spacing={6} align="center">
            {/* Players section */}
            <Box
              w="100%"
              bg="rgba(0, 0, 0, 0.3)"
              borderRadius="xl"
              p={{ base: 4, md: 6 }}
              border="1px solid"
              borderColor="whiteAlpha.200"
              backdropFilter="blur(5px)"
            >
              <Flex
                justify="space-between"
                align="center"
                direction="row"
                w="100%"
              >
                <PlayerCard
                  player={user}
                  isUser={true}
                  avatarSize={avatarSize}
                />

                <Flex justify="center" align="center" px={4}>
                  <OptimizedVSBadge
                    size={vsBadgeSize}
                    isActive={modalState.isComplete}
                  />
                </Flex>

                <PlayerCard
                  player={opponent}
                  isUser={false}
                  avatarSize={avatarSize}
                />
              </Flex>
            </Box>

            {/* Trophy Potential Display */}
            <Box w="100%" px={2}>
              <MatchTrophyPotentialDisplay
                userTrophies={trophyCalculations.userTrophies}
                opponentTrophies={trophyCalculations.opponentTrophies}
                userWinGain={
                  trophyCalculations.userTrophyPotential.potentialGain
                }
                userLoss={trophyCalculations.userTrophyPotential.potentialLoss}
                opponentWinGain={
                  trophyCalculations.opponentTrophyPotential.potentialGain
                }
                opponentLoss={
                  trophyCalculations.opponentTrophyPotential.potentialLoss
                }
                size={trophySize}
              />
            </Box>

            <Divider borderColor="whiteAlpha.300" />

            {/* Progress Section */}
            <VStack spacing={4} w="100%" align="center">
              <Flex justify="space-between" w="100%" align="center" px={2}>
                <VStack align="start" spacing={1} flex={1}>
                  <Text color="white" fontWeight="bold" fontSize="lg">
                    {t(currentStepData.title)}
                  </Text>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    {t(currentStepData.description)}
                  </Text>
                </VStack>
                <MotionBadge
                  bg={modalState.isComplete ? 'green.500' : 'purple.500'}
                  color="white"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontWeight="bold"
                  fontSize="md"
                  animate={
                    modalState.isComplete
                      ? { scale: [1, 1.05, 1] }
                      : { scale: 1 }
                  }
                  transition={{
                    duration: 0.8,
                    repeat: modalState.isComplete ? Infinity : 0,
                    repeatType: 'reverse',
                  }}
                >
                  {Math.round(modalState.currentProgress)}%
                </MotionBadge>
              </Flex>

              <OptimizedProgressBar
                progress={modalState.currentProgress}
                isComplete={modalState.isComplete}
              />

              {!modalState.isComplete && (
                <HStack justify="center" spacing={3} w="100%" pt={2}>
                  <MotionIcon
                    as={Loader}
                    color={currentStepData.color}
                    boxSize={4}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </HStack>
              )}
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter
          borderTopWidth="1px"
          borderColor="whiteAlpha.200"
          justifyContent="center"
          py={6}
        >
          <AnimatePresence>
            {modalState.showPlayButton ? (
              <MotionButton
                key="play-button"
                colorScheme="green"
                size="lg"
                leftIcon={<Icon as={PlayCircle} />}
                onClick={actionHandlers.handlePlayNow}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 200 }}
                bg="green.500"
                _hover={{
                  bg: 'green.400',
                  transform: 'translateY(-1px)',
                }}
                boxShadow="0 4px 15px rgba(72, 187, 120, 0.3)"
                fontSize="lg"
                px={8}
                py={6}
                borderRadius="full"
              >
                {t('Play Now!')}
              </MotionButton>
            ) : (
              <MotionButton
                key="minimize-button"
                variant="ghost"
                onClick={actionHandlers.handleMinimize}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                color="whiteAlpha.800"
                _hover={{ bg: 'whiteAlpha.100' }}
                size="md"
                leftIcon={<Minimize2 size={16} />}
              >
                {t('Minimize')}
              </MotionButton>
            )}
          </AnimatePresence>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// Set display names for debugging
OptimizedVSBadge.displayName = 'OptimizedVSBadge'
OptimizedProgressBar.displayName = 'OptimizedProgressBar'
PlayerCard.displayName = 'PlayerCard'
MatchPreparationModal.displayName = 'MatchPreparationModal'

export default MatchPreparationModal
