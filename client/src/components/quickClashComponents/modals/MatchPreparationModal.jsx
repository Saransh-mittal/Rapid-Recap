// components/quickClashComponents/modals/MatchPreparationModal.jsx
import React, { useEffect, useRef } from 'react'
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
} from 'lucide-react'
import { useSelector } from 'react-redux'

const MotionBox = motion(Box)
const MotionAvatar = motion(Avatar)
const MotionIcon = motion(Icon)
const MotionProgress = motion(Progress)
const MotionBadge = motion(Badge)
const MotionFlex = motion(Flex)

// Keyframes for shine and glow animations
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

// Premium Trophy Component
const PremiumTrophyBadge = ({
  trophyCount,
  size = 'md',
  isHighlighted = false,
}) => {
  const shine = `${shineAnimation} 5s ease-in-out infinite`
  const glow = `${glowAnimation} 3s infinite`
  const float = `${floatAnimation} 2s ease-in-out infinite`

  // Size variants
  const sizes = {
    sm: { height: '26px', fontSize: 'xs', iconSize: 5, px: 2.5 },
    md: { height: '32px', fontSize: 'sm', iconSize: 5, px: 3 },
    lg: { height: '38px', fontSize: 'md', iconSize: 10, px: 3.5 },
  }
  const sizeProps = sizes[size]

  return (
    <Flex position="relative" justifyContent="center" animation={float}>
      {/* Background glow effect */}
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

      {/* Main Trophy Container */}
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
        {/* Gradient background with frosted glass effect */}
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

        {/* Glass reflection overlay */}
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

        {/* Shine effect */}
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

        {/* Trophy icon with light beam effect */}
        <Box position="relative" mr={2} zIndex={2}>
          <Icon
            as={isHighlighted ? Crown : Trophy}
            boxSize={sizeProps.iconSize}
            mb={-0.5}
            color="white"
            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
          />

          {/* Light beam effect behind trophy */}
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

        {/* Trophy count text */}
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

// Premium VS Badge Component
const PremiumVSBadge = ({ size = 'md' }) => {
  const glow = `${glowAnimation} 3s infinite`
  const float = `${floatAnimation} 2s ease-in-out infinite`

  const sizeProps = {
    sm: { size: '30px', fontSize: 'xs' },
    md: { size: '40px', fontSize: 'sm' },
    lg: { size: '50px', fontSize: 'md' },
  }

  return (
    <Box position="relative" animation={float}>
      {/* Outer glow */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="120%"
        height="120%"
        borderRadius="full"
        bg="rgba(255, 215, 0, 0.2)"
        filter="blur(8px)"
        zIndex={1}
      />

      {/* Orbital ring 1 */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%) rotate(30deg)"
        width="140%"
        height="140%"
        borderRadius="full"
        border="1px solid rgba(255, 215, 0, 0.5)"
        zIndex={1}
      />

      {/* Orbital ring 2 */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%) rotate(-30deg)"
        width="160%"
        height="160%"
        borderRadius="full"
        border="1px solid rgba(255, 215, 0, 0.3)"
        zIndex={1}
      />

      {/* VS Badge */}
      <Flex
        width={sizeProps[size].size}
        height={sizeProps[size].size}
        borderRadius="full"
        bgGradient="linear(to-br, #111111, #2A2A2A)"
        border="2px solid"
        borderColor="yellow.400"
        alignItems="center"
        justifyContent="center"
        position="relative"
        zIndex={2}
        animation={glow}
        boxShadow="0 0 15px rgba(255, 215, 0, 0.5)"
        overflow="hidden"
      >
        {/* Glass reflection */}
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
          color="yellow.400"
          fontWeight="bold"
          fontSize={sizeProps[size].fontSize}
          textShadow="0 0 5px rgba(255, 215, 0, 0.7)"
          zIndex={1}
        >
          VS
        </Text>
      </Flex>
    </Box>
  )
}

/**
 * Modal that displays when a match is found and a challenge is being prepared
 */
const MatchPreparationModal = ({
  isOpen,
  onClose,
  preparingData = {
    // Opponent information
    opponent: {
      id: 'user-123456',
      name: 'Alex Johnson',
      quickClashTrophies: 1150,
      inGameName: 'CodeWarrior',
      pic: 'https://randomuser?.me/api/portraits/men/32.jpg',
    },

    // Whether the current user is the challenger or not
    isChallenger: true,
  },
}) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const { user } = useSelector(state => state.auth)

  // Track if completion message has been shown
  const hasShownCompletionToast = useRef(false)

  // Get real-time progress from Redux
  const { preparationProgress, preparationStep } = useSelector(
    state => state.quickClashMatchmaking,
  )

  // Responsive sizing
  const avatarSize = useBreakpointValue({ base: 'md', md: 'lg' })
  const modalSize = useBreakpointValue({ base: 'full', md: 'xl' })
  const contentPadding = useBreakpointValue({ base: 3, md: 6 })
  const iconSize = useBreakpointValue({ base: 4, md: 6 })
  const vsBadgeSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const trophySize = useBreakpointValue({ base: 'sm', md: 'md' })

  // Auto-close modal when progress reaches 100%
  useEffect(() => {
    // Only proceed if the modal is open
    if (!isOpen) return

    // When progress is 100% and step is 'challengeReady'
    if (preparationProgress === 100 && preparationStep === 'challengeReady') {
      // Show success toast if we haven't already
      if (!hasShownCompletionToast.current) {
        toast({
          title: t('Challenge Ready!'),
          description: t(
            'Your challenge has been created and is ready to play!',
          ),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        hasShownCompletionToast.current = true
      }

      // Close the modal after a short delay so user can see 100%
      const timer = setTimeout(() => {
        onClose()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [preparationProgress, preparationStep, isOpen, onClose, toast, t])

  // Reset the completion toast flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasShownCompletionToast.current = false
    }
  }, [isOpen])

  // Animation colors
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.600, purple.700)',
    'linear(to-br, blue.800, purple.900)',
  )

  const stepsConfig = [
    {
      id: 'matchFound',
      title: t('Match Found'),
      icon: Users,
      description: t('Preparing your challenge...'),
      color: 'green.500',
    },
    {
      id: 'contentLoading',
      title: t('Content Loading'),
      icon: Book,
      description: t('Finding the perfect content...'),
      color: 'blue.500',
    },
    {
      id: 'generatingQuiz',
      title: t('Generating Quiz'),
      icon: Braces,
      description: t('Creating tailored questions...'),
      color: 'purple.500',
    },
    {
      id: 'challengeReady',
      title: t('Challenge Ready'),
      icon: CheckCircle,
      description: t('Your challenge is ready to play!'),
      color: 'teal.500',
    },
  ]

  // Get current step index
  const getCurrentStepIndex = () => {
    if (!preparationStep) return 0

    const index = stepsConfig.findIndex(step => step.id === preparationStep)
    return index >= 0 ? index + 1 : 0
  }

  // Current step index
  const step = getCurrentStepIndex()

  // Get opponent info
  const opponent = preparingData?.opponent || {}
  const isChallenger = preparingData?.isChallenger

  // Create local variables for trophy data
  const userTrophies = user?.quickClashTrophies
  const opponentTrophies = opponent?.quickClashTrophies

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      size={modalSize}
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(10px)" />

      <ModalContent
        bg="#171330"
        borderWidth="1px"
        borderColor="purple.500"
        borderRadius="xl"
        boxShadow="0 0 30px rgba(128, 90, 213, 0.4)"
        overflow="hidden"
        position="relative"
        mx={{ base: 3, md: 'auto' }}
      >
        {/* Background gradients */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="radial(circle at top left, rgba(128, 90, 213, 0.08), transparent 60%)"
          zIndex={0}
          pointerEvents="none"
        />

        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="radial(circle at bottom right, rgba(66, 153, 225, 0.08), transparent 60%)"
          zIndex={0}
          pointerEvents="none"
        />

        {/* Floating particles */}
        {Array.from({ length: 15 }).map((_, index) => (
          <MotionBox
            key={`particle-${index}`}
            position="absolute"
            width={index % 3 === 0 ? '6px' : '4px'}
            height={index % 3 === 0 ? '6px' : '4px'}
            borderRadius="full"
            bg={index % 2 ? 'purple.400' : 'blue.400'}
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
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              repeatType: 'loop',
            }}
            zIndex={1}
          />
        ))}

        {/* Header with animated icons */}
        <ModalHeader
          color="white"
          textAlign="center"
          py={5}
          position="relative"
          overflow="hidden"
          zIndex={2}
        >
          <Flex justify="center" mb={2} align="center">
            <MotionIcon
              as={Sword}
              boxSize={iconSize}
              color="purple.400"
              animate={{
                rotate: [-10, 10, -10],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              mx={2}
            />
            <Text
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="bold"
              bgGradient="linear(to-r, purple.300, blue.300)"
              bgClip="text"
              letterSpacing="wider"
            >
              {t('Quick Clash Match')}
            </Text>
            <MotionIcon
              as={Shield}
              boxSize={iconSize}
              color="blue.400"
              animate={{
                rotate: [10, -10, 10],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              mx={2}
            />
          </Flex>
        </ModalHeader>

        <ModalCloseButton color="white" zIndex={10} />

        <ModalBody
          py={contentPadding}
          px={{ base: 3, md: 6 }}
          position="relative"
          zIndex={2}
        >
          <VStack spacing={{ base: 4, md: 6 }}>
            {/* Players section */}
            <Box
              w="100%"
              bg="rgba(0, 0, 0, 0.3)"
              borderRadius="lg"
              position="relative"
              p={{ base: 3, md: 4 }}
              boxShadow="inset 0 0 10px rgba(0, 0, 0, 0.3)"
              backdropFilter="blur(8px)"
              overflow="hidden"
            >
              {/* Glass reflection effect */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                height="30%"
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
                {/* User */}
                <VStack spacing={2}>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    {user?.inGameName}
                  </Text>
                  <MotionAvatar
                    size={avatarSize}
                    name={user?.name}
                    src={user?.pic}
                    bg="purple.500"
                    border="2px solid"
                    borderColor="purple.300"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      boxShadow: '0 0 15px rgba(128, 90, 213, 0.6)',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 15,
                      delay: 0.3,
                    }}
                  />
                  <Text color="white" fontWeight="bold" fontSize="md">
                    {user?.name}
                  </Text>

                  {/* Premium Trophy Badge */}
                  <PremiumTrophyBadge
                    trophyCount={userTrophies}
                    isHighlighted={true}
                    size={trophySize}
                  />
                </VStack>

                {/* VS Badge */}
                <PremiumVSBadge size={vsBadgeSize} />

                {/* Opponent */}
                <VStack spacing={2}>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    {opponent.inGameName}
                  </Text>
                  <MotionAvatar
                    size={avatarSize}
                    name={opponent.inGameName}
                    src={opponent.pic}
                    bg="blue.500"
                    border="2px solid"
                    borderColor="blue.300"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      boxShadow: '0 0 15px rgba(66, 153, 225, 0.6)',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 15,
                      delay: 0.3,
                    }}
                  />
                  <Text color="white" fontWeight="bold" fontSize="md">
                    {opponent.name}
                  </Text>

                  {/* Premium Trophy Badge */}
                  <PremiumTrophyBadge
                    trophyCount={opponentTrophies}
                    size={trophySize}
                  />
                </VStack>
              </Flex>
            </Box>

            <Divider borderColor="whiteAlpha.200" />

            {/* Progress indicator */}
            <VStack spacing={3} w="100%">
              <Flex justify="space-between" w="100%" px={2} align="center">
                <Text color="white" fontWeight="medium" fontSize="sm">
                  {t('Preparing Challenge')}
                </Text>
                <MotionBadge
                  bgGradient="linear(to-r, purple.500, blue.500)"
                  color="white"
                  borderRadius="full"
                  px={2}
                  fontWeight="bold"
                  animate={{
                    scale: preparationProgress === 100 ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: preparationProgress === 100 ? 3 : 0,
                  }}
                >
                  {preparationProgress || 0}%
                </MotionBadge>
              </Flex>

              {/* Progress bar with premium styling */}
              <Box
                position="relative"
                w="100%"
                h="8px"
                borderRadius="full"
                overflow="hidden"
              >
                {/* Background */}
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg="rgba(0,0,0,0.3)"
                  borderRadius="full"
                />

                {/* Progress fill */}
                <MotionBox
                  position="absolute"
                  top={0}
                  left={0}
                  height="100%"
                  width={`${preparationProgress || 0}%`}
                  bgGradient="linear(to-r, purple.500, blue.500)"
                  borderRadius="full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${preparationProgress || 0}%` }}
                  transition={{ type: 'spring', stiffness: 50, damping: 10 }}
                >
                  {/* Shine effect */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    height="100%"
                    width="100%"
                    bgGradient="linear(90deg, transparent, rgba(255,255,255,0.3), transparent)"
                    animation={`${shineAnimation} 2s infinite`}
                  />
                </MotionBox>
              </Box>
            </VStack>

            {/* Steps */}
            <VStack
              spacing={{ base: 3, md: 4 }}
              align="stretch"
              w="100%"
              bg="rgba(0, 0, 0, 0.3)"
              p={{ base: 3, md: 4 }}
              borderRadius="md"
              boxShadow="inset 0 0 10px rgba(0, 0, 0, 0.3)"
              backdropFilter="blur(8px)"
              position="relative"
              overflow="hidden"
            >
              {/* Glass reflection effect */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                height="30%"
                bgGradient="linear(to-b, rgba(255,255,255,0.05), rgba(255,255,255,0))"
                zIndex={0}
              />

              <AnimatePresence>
                {stepsConfig.map((stepConfig, index) => (
                  <HStack
                    key={stepConfig.id}
                    spacing={{ base: 3, md: 4 }}
                    opacity={index + 1 <= step ? 1 : 0.5}
                    transform={`scale(${index + 1 === step ? 1.05 : 1})`}
                    transformOrigin="left"
                    transition="all 0.3s ease"
                    bg={
                      index + 1 === step ? 'rgba(0, 0, 0, 0.2)' : 'transparent'
                    }
                    p={index + 1 === step ? 2 : 0}
                    borderRadius={index + 1 === step ? 'md' : 'none'}
                    borderLeftWidth={index + 1 === step ? '3px' : '0'}
                    borderLeftColor={
                      index + 1 === step ? stepConfig.color : 'transparent'
                    }
                    position="relative"
                    zIndex={1}
                  >
                    <Center
                      bg={
                        index + 1 <= step ? stepConfig.color : 'whiteAlpha.200'
                      }
                      color="white"
                      borderRadius="full"
                      boxSize={{ base: '32px', md: '36px' }}
                      flexShrink={0}
                      boxShadow={
                        index + 1 <= step
                          ? `0 0 10px ${stepConfig.color}`
                          : 'none'
                      }
                      position="relative"
                      overflow="hidden"
                    >
                      {/* Reflection on icon */}
                      {index + 1 <= step && (
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          height="50%"
                          bgGradient="linear(to-b, rgba(255,255,255,0.3), rgba(255,255,255,0))"
                          zIndex={0}
                        />
                      )}

                      <MotionIcon
                        as={stepConfig.icon}
                        boxSize={{ base: 4, md: 5 }}
                        animate={
                          index + 1 === step
                            ? {
                                scale: [1, 1.2, 1],
                              }
                            : {}
                        }
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          repeatType: 'reverse',
                        }}
                        zIndex={1}
                      />
                    </Center>

                    <VStack align="start" spacing={0} flex="1">
                      <Text
                        color="white"
                        fontWeight="bold"
                        fontSize={{ base: 'sm', md: 'md' }}
                      >
                        {stepConfig.title}
                      </Text>
                      <Text
                        color="whiteAlpha.700"
                        fontSize={{ base: 'xs', md: 'sm' }}
                      >
                        {stepConfig.description}
                      </Text>
                    </VStack>

                    {index + 1 < step && (
                      <MotionIcon
                        as={CheckCircle}
                        color="green.400"
                        boxSize={{ base: 4, md: 5 }}
                        ml="auto"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 15,
                        }}
                      />
                    )}

                    {index + 1 === step && step < stepsConfig.length && (
                      <MotionIcon
                        as={Flame}
                        color="orange.400"
                        boxSize={{ base: 4, md: 5 }}
                        ml="auto"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: 'reverse',
                        }}
                      />
                    )}
                  </HStack>
                ))}
              </AnimatePresence>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter justifyContent="center">
          <Button
            variant="outline"
            size={{ base: 'sm', md: 'md' }}
            colorScheme="purple"
            onClick={onClose}
            disabled={!preparingData}
            leftIcon={
              <Icon as={preparationProgress === 100 ? CheckCircle : null} />
            }
            _hover={{ bg: 'whiteAlpha.200' }}
            bgGradient={
              preparationProgress === 100
                ? 'linear(to-r, purple.500, blue.500)'
                : 'none'
            }
            color="white"
            borderColor={
              preparationProgress === 100 ? 'transparent' : 'purple.500'
            }
            boxShadow={
              preparationProgress === 100
                ? '0 0 15px rgba(128, 90, 213, 0.4)'
                : 'none'
            }
            position="relative"
            overflow="hidden"
          >
            {preparationProgress === 100 && (
              <Box
                position="absolute"
                top={0}
                left={-100}
                width="50%"
                height="100%"
                bgGradient="linear(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)"
                transform="skewX(-25deg)"
                animation={`${shineAnimation} 3s infinite`}
              />
            )}
            {preparationProgress === 100 ? t('Start Challenge') : t('Minimize')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default MatchPreparationModal
