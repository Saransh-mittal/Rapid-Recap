// components/gameHub/GameDataGenerationLoader.jsx - Optimized Minimal Version
import React, { useState, useEffect } from 'react'
import { Box, VStack, HStack, Text, Progress, Grid } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Brain,
  FileText,
  FlipHorizontal2,
  Sparkles,
  Link2,
  CheckCircle,
  Loader,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const GameDataGenerationLoader = ({
  articleTitle = 'Article',
  duration = 8000,
  onComplete = () => {},
  autoStart = true,
}) => {
  const [displayedProgress, setDisplayedProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(autoStart)
  const [startTime, setStartTime] = useState(null)
  const { t } = useTranslation('GameHub')

  const gameTypes = [
    {
      icon: FileText,
      name: t('gameTypes.normal_quiz').split(' ')[0],
      color: '#3B82F6',
      emoji: '🧠',
    },
    {
      icon: FlipHorizontal2,
      name: t('gameTypes.true_false').split(' ')[0],
      color: '#8B5CF6',
      emoji: '⚡',
    },
    {
      icon: Sparkles,
      name: t('gameTypes.word_weaver').split(' ')[0],
      color: '#10B981',
      emoji: '🔤',
    },
    {
      icon: Link2,
      name: t('gameTypes.connections').split(' ')[0],
      color: '#F59E0B',
      emoji: '🔗',
    },
  ]

  const processingSteps = [
    {
      step: 25,
      message: t('generation.step.analyzing'),
      icon: Brain,
      color: '#3B82F6',
    },
    {
      step: 50,
      message: t('generation.step.crafting'),
      icon: FileText,
      color: '#8B5CF6',
    },
    {
      step: 75,
      message: t('generation.step.building'),
      icon: Sparkles,
      color: '#10B981',
    },
    {
      step: 100,
      message: t('generation.step.finalizing'),
      icon: CheckCircle,
      color: '#10B981',
    },
  ]

  // Initialize start time
  useEffect(() => {
    if (isGenerating && !startTime) {
      setStartTime(Date.now())
    }
  }, [isGenerating, startTime])

  // Auto-progress simulation
  useEffect(() => {
    if (!isGenerating || !startTime) return

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progressPercentage = Math.min((elapsed / duration) * 100, 100)

      setDisplayedProgress(progressPercentage)

      if (progressPercentage >= 100) {
        setIsGenerating(false)
        setDisplayedProgress(100)
        onComplete()
        clearInterval(progressTimer)
      }
    }, 100)

    return () => clearInterval(progressTimer)
  }, [isGenerating, startTime, duration, onComplete])

  // Update current step
  useEffect(() => {
    for (let i = processingSteps.length - 1; i >= 0; i--) {
      if (displayedProgress >= processingSteps[i].step - 10) {
        setCurrentStep(i)
        break
      }
    }
  }, [displayedProgress])

  const currentStepData = processingSteps[currentStep]
  const StepIcon = currentStepData.icon

  return (
    <Box
      minH="100vh"
      bg="gray.900"
      color="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      px={4}
    >
      {/* Background Effect */}
      <Box
        position="absolute"
        inset={0}
        bgGradient="radial(circle at 30% 20%, rgba(59, 130, 246, 0.1), transparent 50%),
                   radial(circle at 70% 80%, rgba(139, 92, 246, 0.08), transparent 50%)"
        opacity={0.6}
      />

      {/* Main Content */}
      <Box position="relative" zIndex={1} w="100%" maxW="500px">
        <VStack spacing={8}>
          {/* Hero Section */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <VStack spacing={4} textAlign="center">
              {/* Main Icon */}
              <MotionBox
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                }}
                fontSize="6xl"
              >
                🧠
              </MotionBox>

              {/* Title */}
              <VStack spacing={2}>
                <Text
                  fontSize={{ base: '2xl', md: '3xl' }}
                  fontWeight="bold"
                  bgGradient="linear(45deg, #667eea, #764ba2)"
                  bgClip="text"
                >
                  {t('generation.craftingYourGames')}
                </Text>
                <Text fontSize="sm" color="gray.400" maxW="300px">
                  {t('generation.aiAnalyzingContent')}
                </Text>
              </VStack>

              {/* Article Title */}
              <Box
                bg="rgba(255, 255, 255, 0.05)"
                border="1px solid rgba(255, 255, 255, 0.1)"
                borderRadius="xl"
                px={4}
                py={2}
                maxW="350px"
              >
                <HStack spacing={2} justify="center">
                  <FileText size={16} color="#8B5CF6" />
                  <Text fontSize="sm" color="gray.300" noOfLines={1}>
                    {articleTitle}
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </MotionBox>

          {/* Progress Section */}
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            w="100%"
          >
            <VStack spacing={6}>
              {/* Progress Display */}
              <VStack spacing={3} w="100%">
                <HStack justify="space-between" w="100%">
                  <Text fontSize="sm" color="gray.400">
                    Progress
                  </Text>
                  <Text fontSize="xl" color="purple.400" fontWeight="bold">
                    {Math.round(displayedProgress)}%
                  </Text>
                </HStack>

                <Box w="100%" position="relative">
                  <Progress
                    value={displayedProgress}
                    size="lg"
                    borderRadius="full"
                    bg="rgba(255, 255, 255, 0.1)"
                    colorScheme="purple"
                  />
                </Box>
              </VStack>

              {/* Current Step */}
              <Box
                bg="rgba(255, 255, 255, 0.05)"
                border="1px solid rgba(255, 255, 255, 0.1)"
                borderRadius="xl"
                p={4}
                w="100%"
                textAlign="center"
              >
                <HStack spacing={3} justify="center">
                  <MotionBox
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <Box bg={currentStepData.color} borderRadius="lg" p={2}>
                      <StepIcon size={20} color="white" />
                    </Box>
                  </MotionBox>
                  <VStack spacing={0} align="start">
                    <Text fontSize="md" color="white" fontWeight="bold">
                      {currentStepData.message}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      {t('loading.buildingExperience')}
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              {/* Games Grid */}
              <Grid templateColumns="repeat(2, 1fr)" gap={3} w="100%">
                {gameTypes.map((game, index) => {
                  const GameIcon = game.icon
                  const isCompleted = displayedProgress > (index + 1) * 25
                  const isActive =
                    displayedProgress > index * 25 &&
                    displayedProgress <= (index + 1) * 25

                  return (
                    <MotionBox
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <Box
                        bg={
                          isActive
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(255, 255, 255, 0.05)'
                        }
                        border="1px solid"
                        borderColor={
                          isActive
                            ? game.color
                            : isCompleted
                            ? 'rgba(16, 185, 129, 0.5)'
                            : 'rgba(255, 255, 255, 0.1)'
                        }
                        borderRadius="xl"
                        p={3}
                        textAlign="center"
                        opacity={isCompleted ? 1 : isActive ? 1 : 0.6}
                        transition="all 0.3s"
                      >
                        <VStack spacing={2}>
                          <Box bg={game.color} borderRadius="lg" p={2}>
                            <GameIcon size={20} color="white" />
                          </Box>
                          <VStack spacing={1}>
                            <HStack spacing={1}>
                              <Text fontSize="xs">{game.emoji}</Text>
                              <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color="white"
                              >
                                {game.name}
                              </Text>
                            </HStack>
                            <Box>
                              {isCompleted ? (
                                <HStack spacing={1} justify="center">
                                  <CheckCircle size={12} color="#10B981" />
                                  <Text
                                    fontSize="xs"
                                    color="emerald.400"
                                    fontWeight="bold"
                                  >
                                    {t('status.ready')}
                                  </Text>
                                </HStack>
                              ) : isActive ? (
                                <HStack spacing={1} justify="center">
                                  <MotionBox
                                    animate={{ rotate: 360 }}
                                    transition={{
                                      duration: 1,
                                      repeat: Infinity,
                                      ease: 'linear',
                                    }}
                                  >
                                    <Loader size={12} color={game.color} />
                                  </MotionBox>
                                  <Text
                                    fontSize="xs"
                                    color={game.color}
                                    fontWeight="bold"
                                  >
                                    {t('status.building')}
                                  </Text>
                                </HStack>
                              ) : (
                                <Text
                                  fontSize="xs"
                                  color="gray.500"
                                  fontWeight="bold"
                                >
                                  {t('status.pending')}
                                </Text>
                              )}
                            </Box>
                          </VStack>
                        </VStack>
                      </Box>
                    </MotionBox>
                  )
                })}
              </Grid>
            </VStack>
          </MotionBox>

          {/* Bottom Info */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            textAlign="center"
          >
            <VStack spacing={2}>
              <Box
                bg="rgba(255, 215, 0, 0.1)"
                border="1px solid rgba(255, 215, 0, 0.3)"
                borderRadius="full"
                px={4}
                py={2}
              >
                <HStack spacing={2}>
                  <Text fontSize="xs" color="yellow.300" fontWeight="bold">
                    {t('alerts.aiPoweredGeneration')}
                  </Text>
                </HStack>
              </Box>
              <Text fontSize="xs" color="gray.500">
                {displayedProgress < 100
                  ? t('alerts.timeRemaining', {
                      seconds: Math.ceil(
                        (duration - (Date.now() - (startTime || Date.now()))) /
                          1000,
                      ),
                    })
                  : t('success.complete')}
              </Text>
            </VStack>
          </MotionBox>
        </VStack>
      </Box>
    </Box>
  )
}

export default GameDataGenerationLoader
