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
} from '@chakra-ui/react'
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
} from 'lucide-react'
import { useSelector } from 'react-redux'

const MotionBox = motion(Box)
const MotionAvatar = motion(Avatar)
const MotionIcon = motion(Icon)
const MotionProgress = motion(Progress)

/**
 * Modal that displays when a match is found and a challenge is being prepared
 */
const MatchPreparationModal = ({ isOpen, onClose, preparingData }) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()

  // Track if completion message has been shown
  const hasShownCompletionToast = useRef(false)

  // Get real-time progress from Redux
  const { preparationProgress, preparationStep } = useSelector(
    state => state.quickClashMatchmaking,
  )

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      isCentered
      size="lg"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(10px)" />

      <ModalContent
        bg="#1a1527"
        borderWidth="1px"
        borderColor="purple.500"
        borderRadius="xl"
        boxShadow="0 0 30px rgba(128, 90, 213, 0.4)"
        overflow="hidden"
        position="relative"
      >
        {/* Background effects */}
        <MotionBox
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient={bgGradient}
          opacity={0.05}
          animate={{
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          zIndex={0}
          pointerEvents="none"
        />

        {/* Header with particles effect */}
        <ModalHeader
          color="white"
          textAlign="center"
          py={5}
          position="relative"
          overflow="hidden"
        >
          <Flex justify="center" mb={2}>
            <MotionIcon
              as={Sword}
              boxSize={6}
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
              fontSize="2xl"
              fontWeight="bold"
              textShadow="0 0 10px rgba(128, 90, 213, 0.4)"
            >
              {t('Quick Clash Match')}
            </Text>
            <MotionIcon
              as={Shield}
              boxSize={6}
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

          {/* Particle effects */}
          {Array.from({ length: 10 }).map((_, index) => (
            <MotionBox
              key={index}
              position="absolute"
              width="8px"
              height="8px"
              borderRadius="full"
              bg={index % 2 ? 'purple.400' : 'blue.400'}
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
            />
          ))}
        </ModalHeader>

        <ModalCloseButton color="white" />

        <ModalBody py={6} position="relative" zIndex={1}>
          <VStack spacing={6}>
            {/* Players section */}
            <HStack
              spacing={8}
              w="100%"
              justify="space-around"
              px={4}
              py={3}
              bg="rgba(0, 0, 0, 0.2)"
              borderRadius="lg"
              position="relative"
            >
              {/* Challenger */}
              <VStack>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {isChallenger ? t('You') : t('Challenger')}
                </Text>
                <MotionAvatar
                  size="lg"
                  name={isChallenger ? t('You') : opponent.name}
                  src={isChallenger ? null : opponent.pic}
                  bg="purple.500"
                  borderWidth={2}
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
                  {isChallenger
                    ? t('You')
                    : opponent.inGameName || opponent.name}
                </Text>
              </VStack>

              {/* VS Badge */}
              <MotionBox
                bg="rgba(0, 0, 0, 0.6)"
                borderRadius="full"
                borderWidth={2}
                borderColor="yellow.400"
                px={3}
                py={1}
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 0 rgba(255, 214, 0, 0.4)',
                    '0 0 20px rgba(255, 214, 0, 0.7)',
                    '0 0 0 rgba(255, 214, 0, 0.4)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                <Text color="yellow.400" fontWeight="bold">
                  VS
                </Text>
              </MotionBox>

              {/* Opponent */}
              <VStack>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {!isChallenger ? t('You') : t('Opponent')}
                </Text>
                <MotionAvatar
                  size="lg"
                  name={!isChallenger ? t('You') : opponent.name}
                  src={!isChallenger ? null : opponent.pic}
                  bg="blue.500"
                  borderWidth={2}
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
                  {!isChallenger
                    ? t('You')
                    : opponent.inGameName || opponent.name}
                </Text>
              </VStack>
            </HStack>

            <Divider borderColor="whiteAlpha.300" />

            {/* Progress indicator */}
            <VStack spacing={3} w="100%">
              <Flex justify="space-between" w="100%" px={2}>
                <Text color="white" fontWeight="medium" fontSize="sm">
                  {t('Preparing Challenge')}
                </Text>
                <Badge colorScheme="purple" borderRadius="full">
                  {preparationProgress || 0}%
                </Badge>
              </Flex>

              <MotionProgress
                value={preparationProgress || 0}
                size="sm"
                colorScheme="purple"
                w="100%"
                borderRadius="full"
                hasStripe
                isAnimated
                sx={{
                  '& > div:first-of-type': {
                    transition: 'width 0.3s ease-in-out',
                  },
                }}
                initial={{ opacity: 0.6 }}
                animate={{
                  opacity: 1,
                  boxShadow: '0 0 10px rgba(128, 90, 213, 0.4)',
                }}
              />
            </VStack>

            {/* Steps */}
            <VStack
              spacing={4}
              align="stretch"
              w="100%"
              bg="rgba(0, 0, 0, 0.2)"
              p={4}
              borderRadius="md"
            >
              <AnimatePresence>
                {stepsConfig.map((stepConfig, index) => (
                  <HStack
                    key={stepConfig.id}
                    spacing={4}
                    opacity={index + 1 <= step ? 1 : 0.5}
                    transform={`scale(${index + 1 === step ? 1.05 : 1})`}
                    transformOrigin="left"
                    transition="all 0.3s ease"
                  >
                    <Center
                      bg={
                        index + 1 <= step ? stepConfig.color : 'whiteAlpha.200'
                      }
                      color="white"
                      borderRadius="full"
                      boxSize="36px"
                      flexShrink={0}
                      boxShadow={
                        index + 1 <= step
                          ? `0 0 10px ${stepConfig.color}`
                          : 'none'
                      }
                    >
                      <MotionIcon
                        as={stepConfig.icon}
                        boxSize={5}
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
                      />
                    </Center>

                    <VStack align="start" spacing={0}>
                      <Text color="white" fontWeight="bold" fontSize="md">
                        {stepConfig.title}
                      </Text>
                      <Text color="whiteAlpha.700" fontSize="sm">
                        {stepConfig.description}
                      </Text>
                    </VStack>

                    {index + 1 < step && (
                      <MotionIcon
                        as={CheckCircle}
                        color="green.400"
                        boxSize={5}
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
                        boxSize={5}
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

        <ModalFooter>
          <Button
            variant="ghost"
            color="whiteAlpha.700"
            onClick={onClose}
            disabled={!preparingData}
          >
            {t('Minimize')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default MatchPreparationModal
