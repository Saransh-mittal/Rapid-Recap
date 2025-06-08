// components/quickClashComponents/modals/MatchPreparationModal.jsx
import React, { useEffect, useRef, useState, useCallback, memo } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Avatar,
  Icon,
  Flex,
  Badge,
  Divider,
  Button,
  useToast,
  useBreakpointValue,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Sword,
  Shield,
  CheckCircle,
  Users,
  Book,
  Braces,
  Trophy,
  Crown,
  Zap,
  PlayCircle,
  Loader,
} from 'lucide-react'
import { useSelector } from 'react-redux'

const MotionBox = motion(Box)
const MotionAvatar = motion(Avatar)
const MotionIcon = motion(Icon)
const MotionBadge = motion(Badge)
const MotionButton = motion(Button)

// Optimized keyframes - reduced complexity for performance
const shineAnimation = keyframes`
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
`

const gentleGlow = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
  100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.3); }
`

const subtleFloat = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
  100% { transform: translateY(0px); }
`

// Optimized Trophy Badge Component
const OptimizedTrophyBadge = memo(
  ({ trophyCount, size = 'md', isHighlighted = false }) => {
    const sizes = {
      sm: { height: '28px', fontSize: 'xs', iconSize: 4, px: 2.5 },
      md: { height: '32px', fontSize: 'sm', iconSize: 5, px: 3 },
      lg: { height: '36px', fontSize: 'md', iconSize: 5, px: 3.5 },
    }
    const sizeProps = sizes[size]

    return (
      <Flex
        alignItems="center"
        height={sizeProps.height}
        px={sizeProps.px}
        py={1}
        borderRadius="full"
        position="relative"
        overflow="hidden"
        bg={isHighlighted ? 'yellow.500' : 'yellow.600'}
        border="1px solid"
        borderColor={isHighlighted ? 'yellow.300' : 'yellow.500'}
        boxShadow={
          isHighlighted
            ? '0 2px 8px rgba(255, 215, 0, 0.3)'
            : '0 2px 6px rgba(0, 0, 0, 0.2)'
        }
        animation={isHighlighted ? `${gentleGlow} 3s infinite` : 'none'}
      >
        {/* Simplified shine effect */}
        <Box
          position="absolute"
          top="0"
          left="-100%"
          width="30%"
          height="100%"
          bgGradient="linear(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)"
          animation={`${shineAnimation} 4s infinite`}
          zIndex={1}
        />

        <Icon
          as={isHighlighted ? Trophy : Trophy}
          boxSize={sizeProps.iconSize}
          color="white"
          mr={2}
          zIndex={2}
        />

        <Text
          color="white"
          fontWeight="bold"
          fontSize={sizeProps.fontSize}
          zIndex={2}
        >
          {trophyCount}
        </Text>
      </Flex>
    )
  },
)

// Optimized VS Badge Component
const OptimizedVSBadge = memo(({ size = 'md', isActive = false }) => {
  const sizeProps = {
    sm: { size: '32px', fontSize: 'xs' },
    md: { size: '40px', fontSize: 'sm' },
    lg: { size: '48px', fontSize: 'md' },
  }

  return (
    <Flex
      width={sizeProps[size].size}
      height={sizeProps[size].size}
      borderRadius="full"
      bg={isActive ? 'green.500' : 'gray.700'}
      border="2px solid"
      borderColor={isActive ? 'green.400' : 'yellow.400'}
      alignItems="center"
      justifyContent="center"
      position="relative"
      boxShadow={
        isActive
          ? '0 0 10px rgba(72, 187, 120, 0.5)'
          : '0 0 8px rgba(255, 215, 0, 0.3)'
      }
      animation={isActive ? `${subtleFloat} 2s infinite` : 'none'}
    >
      <Text
        color={isActive ? 'white' : 'yellow.400'}
        fontWeight="bold"
        fontSize={sizeProps[size].fontSize}
        textShadow={
          isActive
            ? '0 0 3px rgba(72, 187, 120, 0.5)'
            : '0 0 3px rgba(255, 215, 0, 0.5)'
        }
      >
        VS
      </Text>
    </Flex>
  )
})

/**
 * Optimized modal for match preparation with better performance and alignment
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
  const toast = useToast()
  const { user } = useSelector(state => state.auth)

  // Local state
  const [currentProgress, setCurrentProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showPlayButton, setShowPlayButton] = useState(false)

  // Refs
  const hasShownCompletionToast = useRef(false)
  const progressAnimationRef = useRef(null)

  // Responsive sizing
  const avatarSize = useBreakpointValue({ base: 'lg', md: 'xl' })
  const modalSize = useBreakpointValue({ base: 'full', md: 'xl' })
  const contentPadding = useBreakpointValue({ base: 4, md: 6 })
  const iconSize = useBreakpointValue({ base: 5, md: 6 })
  const vsBadgeSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const trophySize = useBreakpointValue({ base: 'sm', md: 'md' })

  // Smooth progress animation
  useEffect(() => {
    if (progress !== currentProgress) {
      if (progressAnimationRef.current) {
        clearTimeout(progressAnimationRef.current)
      }

      progressAnimationRef.current = setTimeout(() => {
        setCurrentProgress(progress)
      }, 100)
    }

    return () => {
      if (progressAnimationRef.current) {
        clearTimeout(progressAnimationRef.current)
      }
    }
  }, [progress, currentProgress])

  // Handle completion state
  useEffect(() => {
    if (currentProgress >= 100 && challengeId && !isComplete) {
      setIsComplete(true)

      if (!hasShownCompletionToast.current) {
        toast({
          title: t('Challenge Ready!'),
          description: t('Your quick clash challenge is ready to play!'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        hasShownCompletionToast.current = true
      }

      // Show play button after a brief delay
      setTimeout(() => {
        setShowPlayButton(true)
      }, 800)
    }
  }, [currentProgress, challengeId, isComplete, toast, t])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentProgress(0)
      setIsComplete(false)
      setShowPlayButton(false)
      hasShownCompletionToast.current = false
    }
  }, [isOpen])

  // Optimized step configuration
  const stepsConfig = [
    {
      id: 'matchFound',
      title: t('Match Found'),
      icon: Users,
      description: t('Found your opponent!'),
      color: 'green.500',
      progressMin: 0,
      progressMax: 20,
    },
    {
      id: 'contentLoading',
      title: t('Loading Content'),
      icon: Book,
      description: t('Preparing quiz content...'),
      color: 'blue.500',
      progressMin: 20,
      progressMax: 60,
    },
    {
      id: 'generatingQuiz',
      title: t('Generating Questions'),
      icon: Braces,
      description: t('Creating your challenge...'),
      color: 'purple.500',
      progressMin: 60,
      progressMax: 95,
    },
    {
      id: 'challengeReady',
      title: t('Challenge Ready'),
      icon: CheckCircle,
      description: t('Ready to play!'),
      color: 'teal.500',
      progressMin: 95,
      progressMax: 100,
    },
  ]

  // Get current step based on progress and step prop
  const getCurrentStep = () => {
    if (step) {
      const stepIndex = stepsConfig.findIndex(s => s.id === step)
      if (stepIndex >= 0) return stepIndex
    }

    // Fallback to progress-based step detection
    for (let i = stepsConfig.length - 1; i >= 0; i--) {
      if (currentProgress >= stepsConfig[i].progressMin) {
        return i
      }
    }
    return 0
  }

  const currentStepIndex = getCurrentStep()
  const currentStepConfig = stepsConfig[currentStepIndex]

  // Enhanced opponent info extraction with better fallbacks
  const getOpponentInfo = useCallback(() => {
    // If we have direct opponent data from preparingData, use it
    if (preparingData?.opponent) {
      return preparingData.opponent
    }

    // Check if we have any user data in preparingData that we can use
    if (preparingData && typeof preparingData === 'object') {
      // If preparingData has user info that's not the current user, use it as opponent
      if (preparingData.name && preparingData.name !== user?.name) {
        return {
          name: preparingData.name,
          inGameName: preparingData.inGameName || preparingData.name,
          pic: preparingData.pic || '',
          quickClashTrophies: preparingData.quickClashTrophies || 1000,
        }
      }

      // Check other possible fields
      if (preparingData.userName && preparingData.userName !== user?.name) {
        return {
          name: preparingData.userName,
          inGameName: preparingData.userInGameName || preparingData.userName,
          pic: preparingData.userPic || '',
          quickClashTrophies: preparingData.userTrophies || 1000,
        }
      }
    }

    // Final fallback to default opponent
    return {
      name: 'Opponent',
      inGameName: 'Player',
      pic: '',
      quickClashTrophies: 1000,
    }
  }, [preparingData, user])

  const opponent = getOpponentInfo()

  // Handle play now
  const handlePlayNow = useCallback(() => {
    if (onPlayNow && challengeId) {
      onPlayNow()
    }
  }, [onPlayNow, challengeId])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      size={modalSize}
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(10px)" />

      <ModalContent
        bg="#0D1117"
        borderWidth="2px"
        borderColor={isComplete ? 'green.400' : 'purple.400'}
        borderRadius="xl"
        boxShadow={
          isComplete
            ? '0 0 20px rgba(72, 187, 120, 0.4)'
            : '0 0 15px rgba(128, 90, 213, 0.3)'
        }
        overflow="hidden"
        position="relative"
        mx={{ base: 3, md: 'auto' }}
      >
        {/* Simplified background gradients */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient={
            isComplete
              ? 'radial(circle at center, rgba(72, 187, 120, 0.05), transparent 60%)'
              : 'radial(circle at center, rgba(128, 90, 213, 0.05), transparent 60%)'
          }
          zIndex={0}
          pointerEvents="none"
        />

        {/* Reduced particle count for performance */}
        {Array.from({ length: 8 }).map((_, index) => (
          <MotionBox
            key={`particle-${index}`}
            position="absolute"
            width="4px"
            height="4px"
            borderRadius="full"
            bg={
              isComplete
                ? index % 2
                  ? 'green.400'
                  : 'teal.400'
                : index % 2
                ? 'purple.400'
                : 'blue.400'
            }
            opacity={0.6}
            initial={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              top: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              left: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              repeatType: 'loop',
            }}
            zIndex={1}
          />
        ))}

        {/* Header */}
        <ModalHeader
          color="white"
          textAlign="center"
          py={6}
          position="relative"
          zIndex={2}
        >
          <VStack spacing={3}>
            <HStack spacing={3} justify="center" align="center">
              <MotionIcon
                as={isComplete ? CheckCircle : Sword}
                boxSize={iconSize}
                color={isComplete ? 'green.400' : 'purple.400'}
                animate={
                  isComplete ? { scale: [1, 1.1, 1] } : { rotate: [-5, 5, -5] }
                }
                transition={
                  isComplete
                    ? { duration: 1.5, repeat: Infinity }
                    : { duration: 2, repeat: Infinity, repeatType: 'reverse' }
                }
              />
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                bgGradient={
                  isComplete
                    ? 'linear(to-r, green.300, teal.300)'
                    : 'linear(to-r, purple.300, blue.300)'
                }
                bgClip="text"
                letterSpacing="wide"
              >
                {isComplete ? t('Challenge Ready!') : t('Preparing Challenge')}
              </Text>
              <MotionIcon
                as={isComplete ? Zap : Shield}
                boxSize={iconSize}
                color={isComplete ? 'teal.400' : 'blue.400'}
                animate={
                  isComplete ? { scale: [1, 1.1, 1] } : { rotate: [5, -5, 5] }
                }
                transition={
                  isComplete
                    ? { duration: 1.5, repeat: Infinity }
                    : { duration: 2, repeat: Infinity, repeatType: 'reverse' }
                }
              />
            </HStack>
          </VStack>
        </ModalHeader>

        <ModalCloseButton color="white" zIndex={10} />

        <ModalBody
          py={contentPadding}
          px={{ base: 4, md: 6 }}
          position="relative"
          zIndex={2}
        >
          <VStack spacing={6} align="center">
            {/* Players section - Better aligned */}
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
                {/* Current User - Properly centered */}
                <VStack spacing={3} flex={1} align="center">
                  <Text
                    color="whiteAlpha.700"
                    fontSize="xs"
                    fontWeight="medium"
                    textAlign="center"
                  >
                    {user?.inGameName || 'You'}
                  </Text>
                  <MotionAvatar
                    size={avatarSize}
                    name={user?.name}
                    src={user?.pic}
                    bg="purple.500"
                    border="3px solid"
                    borderColor="purple.300"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                      delay: 0.2,
                    }}
                  />
                  <Text
                    color="white"
                    fontWeight="bold"
                    fontSize="sm"
                    textAlign="center"
                    noOfLines={1}
                  >
                    {user?.name}
                  </Text>
                  <OptimizedTrophyBadge
                    trophyCount={user?.quickClashTrophies || 1000}
                    isHighlighted={true}
                    size={trophySize}
                  />
                </VStack>

                {/* VS Badge - Properly centered */}
                <Flex justify="center" align="center" px={4}>
                  <OptimizedVSBadge size={vsBadgeSize} isActive={isComplete} />
                </Flex>

                {/* Opponent - Properly centered */}
                <VStack spacing={3} flex={1} align="center">
                  <Text
                    color="whiteAlpha.700"
                    fontSize="xs"
                    fontWeight="medium"
                    textAlign="center"
                  >
                    {opponent?.inGameName || 'Opponent'}
                  </Text>
                  <MotionAvatar
                    size={avatarSize}
                    name={opponent?.name}
                    src={opponent?.pic}
                    bg="blue.500"
                    border="3px solid"
                    borderColor="blue.300"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                      delay: 0.4,
                    }}
                  />
                  <Text
                    color="white"
                    fontWeight="bold"
                    fontSize="sm"
                    textAlign="center"
                    noOfLines={1}
                  >
                    {opponent?.name}
                  </Text>
                  <OptimizedTrophyBadge
                    trophyCount={opponent?.quickClashTrophies || 1000}
                    size={trophySize}
                  />
                </VStack>
              </Flex>
            </Box>

            <Divider borderColor="whiteAlpha.300" />

            {/* Progress Section - Better aligned */}
            <VStack spacing={4} w="100%" align="center">
              <Flex justify="space-between" w="100%" align="center" px={2}>
                <VStack align="start" spacing={1} flex={1}>
                  <Text color="white" fontWeight="bold" fontSize="lg">
                    {currentStepConfig.title}
                  </Text>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    {currentStepConfig.description}
                  </Text>
                </VStack>
                <MotionBadge
                  bg={isComplete ? 'green.500' : 'purple.500'}
                  color="white"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontWeight="bold"
                  fontSize="md"
                  animate={isComplete ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  transition={{
                    duration: 0.8,
                    repeat: isComplete ? Infinity : 0,
                    repeatType: 'reverse',
                  }}
                >
                  {Math.round(currentProgress)}%
                </MotionBadge>
              </Flex>

              {/* Optimized Progress Bar */}
              <Box
                position="relative"
                w="100%"
                h="10px"
                borderRadius="full"
                overflow="hidden"
                bg="rgba(0,0,0,0.3)"
                border="1px solid"
                borderColor="whiteAlpha.200"
              >
                <MotionBox
                  position="absolute"
                  top={0}
                  left={0}
                  height="100%"
                  width={`${currentProgress}%`}
                  bg={isComplete ? 'green.400' : 'purple.500'}
                  borderRadius="full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${currentProgress}%` }}
                  transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                  boxShadow={
                    isComplete
                      ? '0 0 8px rgba(72, 187, 120, 0.4)'
                      : '0 0 6px rgba(128, 90, 213, 0.3)'
                  }
                >
                  {/* Simplified shine effect */}
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

              {/* Current Step Indicator - Centered */}
              <HStack justify="center" spacing={3} w="100%" pt={2}>
                <Icon
                  as={currentStepConfig.icon}
                  color={currentStepConfig.color}
                  boxSize={5}
                />
                {!isComplete && (
                  <MotionIcon
                    as={Loader}
                    color={currentStepConfig.color}
                    boxSize={4}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                )}
              </HStack>
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
            {showPlayButton ? (
              <MotionButton
                key="play-button"
                colorScheme="green"
                size="lg"
                leftIcon={<Icon as={PlayCircle} />}
                onClick={handlePlayNow}
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
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                color="whiteAlpha.800"
                _hover={{ bg: 'whiteAlpha.100' }}
                size="md"
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

// Add display names for debugging
OptimizedTrophyBadge.displayName = 'OptimizedTrophyBadge'
OptimizedVSBadge.displayName = 'OptimizedVSBadge'
MatchPreparationModal.displayName = 'MatchPreparationModal'

export default MatchPreparationModal
