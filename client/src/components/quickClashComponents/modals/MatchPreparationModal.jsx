// components/quickClashComponents/modals/MatchPreparationModal.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react'
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
  Center,
  useColorModeValue,
  useToast,
  Container,
  AvatarBadge,
  useBreakpointValue,
  chakra,
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
  Flame,
  Trophy,
  Award,
  Crown,
  Star,
  Zap,
  PlayCircle,
  Loader,
} from 'lucide-react'
import { useSelector } from 'react-redux'

const MotionBox = motion(Box)
const MotionAvatar = motion(Avatar)
const MotionIcon = motion(Icon)
const MotionProgress = motion(Progress)
const MotionBadge = motion(Badge)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)

// Enhanced keyframes for animations
const shineAnimation = keyframes`
  0% { left: -100%; }
  25% { left: 100%; }
  100% { left: 100%; }
`

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5), 0 0 10px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5); }
  100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5), 0 0 10px rgba(255, 215, 0, 0.3); }
`

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0px); }
`

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 5px rgba(72, 187, 120, 0.5); }
  50% { box-shadow: 0 0 20px rgba(72, 187, 120, 0.8), 0 0 30px rgba(72, 187, 120, 0.4); }
  100% { box-shadow: 0 0 5px rgba(72, 187, 120, 0.5); }
`

// Premium Trophy Component
const PremiumTrophyBadge = ({
  trophyCount,
  size = 'md',
  isHighlighted = false,
}) => {
  const shine = `${shineAnimation} 5s ease-in-out infinite`
  const glow = `${glowAnimation} 3s infinite`
  const float = `${floatAnimation} 2s ease-in-out infinite`

  const sizes = {
    sm: { height: '26px', fontSize: 'xs', iconSize: 4, px: 2.5 },
    md: { height: '32px', fontSize: 'sm', iconSize: 5, px: 3 },
    lg: { height: '38px', fontSize: 'md', iconSize: 6, px: 3.5 },
  }
  const sizeProps = sizes[size]

  return (
    <Flex position="relative" justifyContent="center" animation={float}>
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        borderRadius="full"
        filter="blur(6px)"
        bg={isHighlighted ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 215, 0, 0.2)'}
        zIndex={0}
        transform="scale(1.2)"
      />

      <Flex
        alignItems="center"
        height={sizeProps.height}
        px={sizeProps.px}
        py={1}
        borderRadius="full"
        position="relative"
        overflow="hidden"
        zIndex={1}
        animation={glow}
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient={
            isHighlighted
              ? 'linear(to-r, #FFD700, #FFA500)'
              : 'linear(to-r, #F0C85A, #E8A95C)'
          }
          opacity={0.95}
          borderRadius="full"
          border="1px solid"
          borderColor={isHighlighted ? 'yellow.200' : 'yellow.300'}
          zIndex={-1}
        />

        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="50%"
          bgGradient="linear(to-b, rgba(255,255,255,0.4), rgba(255,255,255,0))"
          borderTopRadius="full"
          zIndex={0}
        />

        <Box
          position="absolute"
          top="0"
          left="-100%"
          width="50%"
          height="100%"
          bgGradient="linear(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)"
          transform="skewX(-25deg)"
          animation={shine}
          zIndex={1}
        />

        <Box position="relative" mr={2} zIndex={2}>
          <Icon
            as={isHighlighted ? Crown : Trophy}
            boxSize={sizeProps.iconSize}
            mb={-0.5}
            color="white"
            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
          />

          {isHighlighted && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              width="140%"
              height="140%"
              borderRadius="full"
              bg="rgba(255, 255, 255, 0.3)"
              filter="blur(3px)"
              zIndex={-1}
            />
          )}
        </Box>

        <Text
          color="white"
          fontWeight="bold"
          fontSize={sizeProps.fontSize}
          textShadow="0 1px 2px rgba(0,0,0,0.2)"
          letterSpacing="0.5px"
          zIndex={2}
        >
          {trophyCount}
        </Text>
      </Flex>
    </Flex>
  )
}

// Enhanced VS Badge Component
const PremiumVSBadge = ({ size = 'md', isActive = false }) => {
  const glow = `${glowAnimation} 3s infinite`
  const float = `${floatAnimation} 2s ease-in-out infinite`

  const sizeProps = {
    sm: { size: '30px', fontSize: 'xs' },
    md: { size: '40px', fontSize: 'sm' },
    lg: { size: '50px', fontSize: 'md' },
  }

  return (
    <Box position="relative" animation={float}>
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="120%"
        height="120%"
        borderRadius="full"
        bg={isActive ? 'rgba(72, 187, 120, 0.3)' : 'rgba(255, 215, 0, 0.2)'}
        filter="blur(8px)"
        zIndex={1}
      />

      <Flex
        width={sizeProps[size].size}
        height={sizeProps[size].size}
        borderRadius="full"
        bgGradient={
          isActive
            ? 'linear(to-br, #059669, #10B981)'
            : 'linear(to-br, #111111, #2A2A2A)'
        }
        border="2px solid"
        borderColor={isActive ? 'green.400' : 'yellow.400'}
        alignItems="center"
        justifyContent="center"
        position="relative"
        zIndex={2}
        animation={isActive ? `${pulseGlow} 2s infinite` : glow}
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="40%"
          bgGradient="linear(to-b, rgba(255,255,255,0.2), rgba(255,255,255,0))"
          borderTopRadius="full"
          zIndex={0}
        />

        <Text
          color={isActive ? 'white' : 'yellow.400'}
          fontWeight="bold"
          fontSize={sizeProps[size].fontSize}
          textShadow={
            isActive
              ? '0 0 5px rgba(72, 187, 120, 0.7)'
              : '0 0 5px rgba(255, 215, 0, 0.7)'
          }
          zIndex={1}
        >
          VS
        </Text>
      </Flex>
    </Box>
  )
}

/**
 * Enhanced modal that displays match preparation progress with better UX
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
      }, 1000)
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

  // Enhanced step configuration
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

  // FIXED: Enhanced opponent info extraction with better fallbacks
  const getOpponentInfo = useCallback(() => {
    console.log('[MODAL] Getting opponent info:', {
      preparingData,
      hasOpponent: !!preparingData?.opponent,
      opponentName: preparingData?.opponent?.name,
      isChallenger: preparingData?.isChallenger,
    })

    // If we have direct opponent data from preparingData, use it
    if (preparingData?.opponent) {
      return preparingData.opponent
    }

    // FIXED: Check if we have any user data in preparingData that we can use
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

    // ENHANCEMENT: Try to get opponent info from Redux state if available
    // This could be extended to check for recent matchmaking data

    // Final fallback to default opponent
    console.log('[MODAL] Using fallback opponent data')
    return {
      name: 'Opponent',
      inGameName: 'Player',
      pic: '',
      quickClashTrophies: 1000,
    }
  }, [preparingData, user])

  const opponent = getOpponentInfo()

  // Debug logging for opponent resolution
  useEffect(() => {
    console.log('[MODAL] Opponent resolution:', {
      preparingData,
      resolvedOpponent: opponent,
      isUsingFallback: opponent?.name === 'Opponent',
    })
  }, [preparingData, opponent])

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
      <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(15px)" />

      <ModalContent
        bg="#0D1117"
        borderWidth="2px"
        borderColor={isComplete ? 'green.400' : 'purple.400'}
        borderRadius="xl"
        boxShadow={
          isComplete
            ? '0 0 40px rgba(72, 187, 120, 0.6)'
            : '0 0 30px rgba(128, 90, 213, 0.4)'
        }
        overflow="hidden"
        position="relative"
        mx={{ base: 3, md: 'auto' }}
      >
        {/* Enhanced background gradients */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient={
            isComplete
              ? 'radial(circle at top left, rgba(72, 187, 120, 0.1), transparent 70%)'
              : 'radial(circle at top left, rgba(128, 90, 213, 0.08), transparent 60%)'
          }
          zIndex={0}
          pointerEvents="none"
        />

        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient={
            isComplete
              ? 'radial(circle at bottom right, rgba(16, 185, 129, 0.1), transparent 70%)'
              : 'radial(circle at bottom right, rgba(66, 153, 225, 0.08), transparent 60%)'
          }
          zIndex={0}
          pointerEvents="none"
        />

        {/* Animated particles */}
        {Array.from({ length: 20 }).map((_, index) => (
          <MotionBox
            key={`particle-${index}`}
            position="absolute"
            width={index % 3 === 0 ? '8px' : '6px'}
            height={index % 3 === 0 ? '8px' : '6px'}
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
            filter="blur(1px)"
            initial={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0,
            }}
            animate={{
              top: [
                `${Math.random() * 100}%`,
                `${Math.random() * 100}%`,
                `${Math.random() * 100}%`,
              ],
              left: [
                `${Math.random() * 100}%`,
                `${Math.random() * 100}%`,
                `${Math.random() * 100}%`,
              ],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 8,
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
          py={5}
          position="relative"
          overflow="hidden"
          zIndex={2}
        >
          <Flex justify="center" mb={3} align="center">
            <MotionIcon
              as={isComplete ? CheckCircle : Sword}
              boxSize={iconSize}
              color={isComplete ? 'green.400' : 'purple.400'}
              animate={
                isComplete
                  ? { scale: [1, 1.2, 1], rotate: [0, 360, 360] }
                  : { rotate: [-10, 10, -10] }
              }
              transition={
                isComplete
                  ? { duration: 2, repeat: Infinity }
                  : { duration: 2, repeat: Infinity, repeatType: 'reverse' }
              }
              mx={2}
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
              letterSpacing="wider"
            >
              {isComplete ? t('Challenge Ready!') : t('Preparing Challenge')}
            </Text>
            <MotionIcon
              as={isComplete ? Zap : Shield}
              boxSize={iconSize}
              color={isComplete ? 'teal.400' : 'blue.400'}
              animate={
                isComplete
                  ? { scale: [1, 1.2, 1], rotate: [0, -360, -360] }
                  : { rotate: [10, -10, 10] }
              }
              transition={
                isComplete
                  ? { duration: 2, repeat: Infinity }
                  : { duration: 2, repeat: Infinity, repeatType: 'reverse' }
              }
              mx={2}
            />
          </Flex>
        </ModalHeader>

        <ModalCloseButton color="white" zIndex={10} />

        <ModalBody
          py={contentPadding}
          px={{ base: 4, md: 6 }}
          position="relative"
          zIndex={2}
        >
          <VStack spacing={{ base: 5, md: 6 }}>
            {/* Players section */}
            <Box
              w="100%"
              bg="rgba(0, 0, 0, 0.4)"
              borderRadius="xl"
              position="relative"
              p={{ base: 4, md: 5 }}
              boxShadow="inset 0 0 20px rgba(0, 0, 0, 0.5)"
              backdropFilter="blur(10px)"
              overflow="hidden"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                height="40%"
                bgGradient="linear(to-b, rgba(255,255,255,0.1), rgba(255,255,255,0))"
                zIndex={0}
              />

              <Flex
                justify="space-between"
                align="center"
                direction="row"
                pos="relative"
                zIndex={1}
              >
                {/* Current User */}
                <VStack spacing={3}>
                  <Text
                    color="whiteAlpha.700"
                    fontSize="xs"
                    fontWeight="medium"
                  >
                    {user?.inGameName}
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
                      boxShadow: '0 0 20px rgba(128, 90, 213, 0.6)',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 15,
                      delay: 0.2,
                    }}
                  >
                    <AvatarBadge
                      boxSize="1.25em"
                      bg="green.500"
                      border="2px solid white"
                    />
                  </MotionAvatar>
                  <Text color="white" fontWeight="bold" fontSize="sm">
                    {user?.name}
                  </Text>
                  <PremiumTrophyBadge
                    trophyCount={user?.quickClashTrophies || 1000}
                    isHighlighted={true}
                    size={trophySize}
                  />
                </VStack>

                {/* Enhanced VS Badge */}
                <PremiumVSBadge size={vsBadgeSize} isActive={isComplete} />

                {/* Opponent */}
                <VStack spacing={3}>
                  <Text
                    color="whiteAlpha.700"
                    fontSize="xs"
                    fontWeight="medium"
                  >
                    {opponent?.inGameName}
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
                      boxShadow: '0 0 20px rgba(66, 153, 225, 0.6)',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 15,
                      delay: 0.4,
                    }}
                  >
                    <AvatarBadge
                      boxSize="1.25em"
                      bg="green.500"
                      border="2px solid white"
                    />
                  </MotionAvatar>
                  <Text color="white" fontWeight="bold" fontSize="sm">
                    {opponent?.name}
                  </Text>
                  <PremiumTrophyBadge
                    trophyCount={opponent?.quickClashTrophies || 1000}
                    size={trophySize}
                  />
                </VStack>
              </Flex>
            </Box>

            <Divider borderColor="whiteAlpha.300" />

            {/* Enhanced Progress Section */}
            <VStack spacing={4} w="100%">
              <Flex justify="space-between" w="100%" px={2} align="center">
                <VStack align="start" spacing={1}>
                  <Text color="white" fontWeight="bold" fontSize="lg">
                    {currentStepConfig.title}
                  </Text>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    {currentStepConfig.description}
                  </Text>
                </VStack>
                <MotionBadge
                  bgGradient={
                    isComplete
                      ? 'linear(to-r, green.500, teal.500)'
                      : 'linear(to-r, purple.500, blue.500)'
                  }
                  color="white"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontWeight="bold"
                  fontSize="md"
                  animate={isComplete ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{
                    duration: 0.6,
                    repeat: isComplete ? Infinity : 0,
                    repeatType: 'reverse',
                  }}
                >
                  {Math.round(currentProgress)}%
                </MotionBadge>
              </Flex>

              {/* Enhanced Progress Bar */}
              <Box
                position="relative"
                w="100%"
                h="12px"
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
                  bgGradient={
                    isComplete
                      ? 'linear(to-r, green.400, teal.400)'
                      : 'linear(to-r, purple.500, blue.500)'
                  }
                  borderRadius="full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${currentProgress}%` }}
                  transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                  boxShadow={
                    isComplete
                      ? '0 0 15px rgba(72, 187, 120, 0.6)'
                      : '0 0 10px rgba(128, 90, 213, 0.4)'
                  }
                >
                  {/* Enhanced shine effect */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    height="100%"
                    width="100%"
                    bgGradient="linear(90deg, transparent, rgba(255,255,255,0.4), transparent)"
                    animation={`${shineAnimation} 2s infinite`}
                  />
                </MotionBox>
              </Box>

              {/* Current Step Indicator */}
              <HStack justify="center" spacing={4} w="100%" pt={2}>
                <Icon
                  as={currentStepConfig.icon}
                  color={currentStepConfig.color}
                  boxSize={6}
                />
                {!isComplete && (
                  <MotionIcon
                    as={Loader}
                    color={currentStepConfig.color}
                    boxSize={5}
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
                transition={{ type: 'spring', stiffness: 300 }}
                bgGradient="linear(to-r, green.500, teal.500)"
                _hover={{
                  bgGradient: 'linear(to-r, green.400, teal.400)',
                  transform: 'translateY(-2px)',
                }}
                boxShadow="0 8px 25px rgba(72, 187, 120, 0.4)"
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

export default MatchPreparationModal
