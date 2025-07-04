// components/gameHub/GameExitWarningDialog.jsx - Sleek mobile-responsive version
import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, X, Target, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const gameTypeConfigs = {
  normal_quiz: {
    title: 'Knowledge Quest',
    color: '#3B82F6',
    emoji: '🧠',
  },
  true_false: {
    title: 'Truth Detector',
    color: '#8B5CF6',
    emoji: '⚡',
  },
  word_weaver: {
    title: 'Word Architect',
    color: '#10B981',
    emoji: '🔤',
  },
  connections: {
    title: 'Mind Mapper',
    color: '#F59E0B',
    emoji: '🔗',
  },
}

const GameExitWarningDialog = ({
  isOpen,
  onClose,
  onConfirmExit,
  onStayInGame,
  gameType,
  currentProgress,
  timeLeft,
  totalTime,
  isSubmitting = false,
  exitReason = 'navigation_away',
}) => {
  const { t } = useTranslation('GameHub')
  const config = gameTypeConfigs[gameType] || gameTypeConfigs.normal_quiz

  const getExitReasonInfo = () => {
    const reasons = {
      navigation_away: {
        title: 'Leaving Game?',
        icon: ArrowLeft,
        color: 'orange',
      },
      page_refresh: {
        title: 'Refreshing Page?',
        icon: X,
        color: 'red',
      },
      back_button: {
        title: 'Going Back?',
        icon: ArrowLeft,
        color: 'purple',
      },
    }
    return reasons[exitReason] || reasons.navigation_away
  }

  const exitInfo = getExitReasonInfo()
  const IconComponent = exitInfo.icon

  const progressPercentage =
    currentProgress?.totalQuestions > 0
      ? Math.round(
          (currentProgress.answeredQuestions / currentProgress.totalQuestions) *
            100,
        )
      : 0

  const timeProgress =
    totalTime > 0 ? Math.round(((totalTime - timeLeft) / totalTime) * 100) : 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
      size={{ base: 'sm', md: 'md' }}
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="rgba(0, 0, 0, 0.85)" backdropFilter="blur(8px)" />

      <ModalContent
        bg="gray.800"
        border="1px solid"
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius={{ base: 'xl', md: '2xl' }}
        color="white"
        mx={{ base: 3, md: 4 }}
        my={{ base: 3, md: 4 }}
        maxH={{ base: '90vh', md: '85vh' }}
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.8)"
        overflow="hidden"
      >
        {/* Compact Header */}
        <ModalHeader pb={3} pt={4} px={{ base: 4, md: 6 }}>
          <VStack spacing={2} align="center">
            {/* Icon */}
            <MotionBox
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
            >
              <Box
                bg={`${exitInfo.color}.500`}
                borderRadius="full"
                p={2}
                boxShadow={`0 0 20px rgba(245, 158, 11, 0.3)`}
              >
                <IconComponent size={20} color="white" />
              </Box>
            </MotionBox>

            {/* Title */}
            <VStack spacing={1} textAlign="center">
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                fontWeight="900"
                bgGradient={`linear(45deg, ${exitInfo.color}.400, ${exitInfo.color}.600)`}
                bgClip="text"
                lineHeight="1.2"
              >
                {exitInfo.title}
              </Text>

              <HStack spacing={1} align="center">
                <Text fontSize="sm">{config.emoji}</Text>
                <Text fontSize="sm" color="gray.300" fontWeight="600">
                  {config.title}
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </ModalHeader>

        <ModalBody py={3} px={{ base: 4, md: 6 }}>
          <VStack spacing={4}>
            {/* Compact Warning */}
            <MotionBox
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              w="100%"
            >
              <Alert
                status="warning"
                borderRadius="lg"
                bg="rgba(245, 158, 11, 0.1)"
                border="1px solid"
                borderColor="yellow.500"
                color="white"
                p={3}
                fontSize="sm"
              >
                <AlertIcon color="yellow.400" boxSize={4} />
                <AlertDescription lineHeight="1.4">
                  You are about to leave your active game session. Your current
                  progress will be automatically saved.
                </AlertDescription>
              </Alert>
            </MotionBox>

            {/* Compact Progress */}
            <MotionBox
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              w="100%"
            >
              <Box
                bg="rgba(255, 255, 255, 0.04)"
                borderRadius="lg"
                p={3}
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.08)"
              >
                <VStack spacing={3}>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color="gray.200"
                    textAlign="center"
                  >
                    Current Game Progress
                  </Text>

                  {/* Compact Stats */}
                  <HStack spacing={4} justify="center" w="100%">
                    {/* Questions Progress */}
                    <VStack spacing={1} align="center" flex={1}>
                      <HStack spacing={1}>
                        <Target size={12} color={config.color} />
                        <Text fontSize="xs" color="gray.400">
                          Questions
                        </Text>
                      </HStack>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color={config.color}
                        lineHeight="1"
                      >
                        {currentProgress?.answeredQuestions || 0}
                      </Text>
                      <Text fontSize="2xs" color="gray.400" lineHeight="1">
                        of {currentProgress?.totalQuestions || 0}
                      </Text>
                      <Badge
                        colorScheme={
                          progressPercentage > 50 ? 'green' : 'yellow'
                        }
                        fontSize="2xs"
                        px={1}
                        py={0.5}
                        borderRadius="sm"
                      >
                        {progressPercentage}%
                      </Badge>
                    </VStack>

                    {/* Time Progress */}
                    <VStack spacing={1} align="center" flex={1}>
                      <HStack spacing={1}>
                        <Clock size={12} color="#F59E0B" />
                        <Text fontSize="xs" color="gray.400">
                          Time
                        </Text>
                      </HStack>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="yellow.400"
                        lineHeight="1"
                      >
                        {timeLeft}s
                      </Text>
                      <Text fontSize="2xs" color="gray.400" lineHeight="1">
                        remaining
                      </Text>
                      <Badge
                        colorScheme={
                          timeProgress > 70
                            ? 'red'
                            : timeProgress > 40
                            ? 'yellow'
                            : 'green'
                        }
                        fontSize="2xs"
                        px={1}
                        py={0.5}
                        borderRadius="sm"
                      >
                        {timeProgress}%
                      </Badge>
                    </VStack>
                  </HStack>

                  {/* Compact Info */}
                  <Box
                    bg="rgba(59, 130, 246, 0.08)"
                    border="1px solid rgba(59, 130, 246, 0.2)"
                    borderRadius="md"
                    p={2}
                    w="100%"
                  >
                    <Text
                      fontSize="xs"
                      color="blue.300"
                      textAlign="center"
                      lineHeight="1.3"
                    >
                      <Text as="span" fontWeight="bold">
                        If you leave:
                      </Text>{' '}
                      Your current answers will be submitted automatically.
                      You'll receive points for correct answers so far.
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </MotionBox>
          </VStack>
        </ModalBody>

        <ModalFooter pt={2} pb={4} px={{ base: 4, md: 6 }}>
          <VStack spacing={2} w="100%">
            {/* Compact Action Buttons */}
            <HStack spacing={2} w="100%">
              {/* Stay Button */}
              <Button
                onClick={onStayInGame}
                variant="outline"
                size="md"
                flex={1}
                height="44px"
                borderColor="rgba(255, 255, 255, 0.25)"
                color="white"
                borderRadius="full"
                fontSize="sm"
                fontWeight="medium"
                _hover={{
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  bg: 'rgba(255, 255, 255, 0.04)',
                  transform: 'translateY(-1px)',
                }}
                _active={{
                  transform: 'translateY(0px)',
                }}
                transition="all 0.2s"
                isDisabled={isSubmitting}
              >
                Stay & Continue
              </Button>

              {/* Submit Button */}
              <Button
                leftIcon={<Save size={16} />}
                onClick={onConfirmExit}
                isLoading={isSubmitting}
                loadingText="Saving..."
                size="md"
                flex={1}
                height="44px"
                bgGradient={`linear(45deg, ${exitInfo.color}.500, ${exitInfo.color}.600)`}
                color="white"
                borderRadius="full"
                fontSize="sm"
                fontWeight="bold"
                _hover={{
                  bgGradient: `linear(45deg, ${exitInfo.color}.600, ${exitInfo.color}.700)`,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 6px 20px rgba(245, 158, 11, 0.3)`,
                }}
                _active={{
                  transform: 'translateY(0px)',
                }}
                transition="all 0.2s"
                boxShadow={`0 3px 12px rgba(245, 158, 11, 0.25)`}
              >
                Submit & Exit
              </Button>
            </HStack>

            {/* Compact Help Text */}
            <Text
              fontSize="2xs"
              color="gray.500"
              textAlign="center"
              fontStyle="italic"
              px={2}
            >
              {isSubmitting
                ? 'Saving your progress...'
                : "Choose 'Stay & Continue' to keep playing, or 'Submit & Exit' to save and leave"}
            </Text>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default GameExitWarningDialog
