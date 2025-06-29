import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Brain,
  Sparkles,
  FileText,
  FlipHorizontal2,
  Link2,
  Zap,
  CheckCircle,
  Loader,
} from 'lucide-react'

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

  const gameTypes = [
    { icon: FileText, name: 'Quiz', color: '#3B82F6', delay: 0 },
    { icon: FlipHorizontal2, name: 'True/False', color: '#8B5CF6', delay: 0.2 },
    { icon: Sparkles, name: 'Word Weaver', color: '#10B981', delay: 0.4 },
    { icon: Link2, name: 'Connections', color: '#F59E0B', delay: 0.6 },
  ]

  const processingSteps = [
    { step: 15, message: 'Analyzing content', icon: Brain },
    { step: 35, message: 'Generating questions', icon: FileText },
    { step: 55, message: 'Creating puzzles', icon: Sparkles },
    { step: 75, message: 'Building connections', icon: Link2 },
    { step: 90, message: 'Processing difficulties', icon: Zap },
    { step: 100, message: 'Finalizing', icon: CheckCircle },
  ]

  // Initialize start time when component mounts or generation starts
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

      // Add some realistic variance to the progress
      const variance = Math.sin(elapsed / 1000) * 2
      const adjustedProgress = Math.min(progressPercentage + variance, 100)

      setDisplayedProgress(adjustedProgress)

      // Complete generation when progress reaches 100%
      if (progressPercentage >= 100) {
        setIsGenerating(false)
        setDisplayedProgress(100)
        onComplete()
        clearInterval(progressTimer)
      }
    }, 100)

    return () => clearInterval(progressTimer)
  }, [isGenerating, startTime, duration, onComplete])

  // Update current step based on progress
  useEffect(() => {
    for (let i = processingSteps.length - 1; i >= 0; i--) {
      if (displayedProgress >= processingSteps[i].step - 5) {
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
      position="relative"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Subtle background gradient */}
      <Box
        position="absolute"
        inset={0}
        bgGradient="radial(circle at 50% 30%, rgba(139, 92, 246, 0.15), transparent 50%)"
        opacity={0.6}
      />

      {/* Floating particles */}
      <Box position="absolute" inset={0} pointerEvents="none">
        {Array.from({ length: 8 }).map((_, i) => (
          <MotionBox
            key={i}
            position="absolute"
            width="2px"
            height="2px"
            bg="purple.400"
            borderRadius="full"
            left={`${20 + Math.random() * 60}%`}
            top={`${20 + Math.random() * 60}%`}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </Box>

      {/* Main content */}
      <VStack
        spacing={8}
        maxW="500px"
        w="100%"
        px={6}
        position="relative"
        zIndex={1}
      >
        {/* Header Section */}
        <VStack spacing={6} textAlign="center">
          {/* Brain icon with subtle pulse */}
          <MotionBox
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Text
              fontSize="6xl"
              filter="drop-shadow(0 0 15px rgba(139, 92, 246, 0.4))"
            >
              🧠
            </Text>
          </MotionBox>

          {/* Title */}
          <VStack spacing={3}>
            <Text
              fontSize={{ base: '2xl', md: '3xl' }}
              fontWeight="600"
              letterSpacing="tight"
              bgGradient="linear(to-r, blue.300, purple.300, pink.300)"
              bgClip="text"
            >
              Generating Game Data
            </Text>

            <Text
              fontSize="md"
              color="gray.400"
              fontWeight="400"
              maxW="350px"
              lineHeight="1.5"
            >
              Creating personalized learning experiences
            </Text>

            {/* Article title */}
            <Box
              px={4}
              py={2}
              bg="gray.800"
              border="1px solid"
              borderColor="gray.700"
              borderRadius="lg"
              maxW="300px"
            >
              <Text fontSize="sm" color="gray.300" noOfLines={1}>
                📄 {articleTitle}
              </Text>
            </Box>
          </VStack>
        </VStack>

        {/* Progress Section */}
        <VStack spacing={6} w="100%">
          {/* Main progress display */}
          <VStack spacing={4} w="100%">
            <HStack justify="space-between" w="100%">
              <Text fontSize="sm" color="gray.500" fontWeight="500">
                Progress
              </Text>
              <Text fontSize="sm" color="purple.300" fontWeight="600">
                {Math.round(displayedProgress)}%
              </Text>
            </HStack>

            {/* Sleek progress bar */}
            <Box w="100%" position="relative">
              <Progress
                value={displayedProgress}
                size="sm"
                borderRadius="full"
                bg="gray.800"
                colorScheme="purple"
                hasStripe={false}
                isAnimated={false}
              />
              {/* Subtle glow effect */}
              <MotionBox
                position="absolute"
                top={0}
                left={0}
                height="100%"
                width={`${displayedProgress}%`}
                borderRadius="full"
                boxShadow="0 0 10px rgba(139, 92, 246, 0.4)"
                bg="purple.400"
                transition={{ duration: 0.3 }}
              />
            </Box>
          </VStack>

          {/* Current step indicator */}
          <MotionBox
            key={currentStepData.message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HStack spacing={3} justify="center">
              <MotionBox
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <StepIcon size={18} color="#A855F7" />
              </MotionBox>
              <Text fontSize="md" color="gray.300" fontWeight="500">
                {currentStepData.message}
              </Text>
            </HStack>
          </MotionBox>

          {/* Game types grid */}
          <Grid templateColumns="repeat(2, 1fr)" gap={3} w="100%" maxW="280px">
            {gameTypes.map((game, index) => {
              const GameIcon = game.icon
              const isCompleted = displayedProgress > (index + 1) * 20
              const isActive =
                displayedProgress > index * 20 &&
                displayedProgress <= (index + 1) * 20

              return (
                <GridItem key={index}>
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      delay: game.delay,
                      duration: 0.5,
                      ease: 'easeOut',
                    }}
                  >
                    <Box
                      p={3}
                      bg={isActive ? 'gray.700' : 'gray.800'}
                      border="1px solid"
                      borderColor={
                        isActive
                          ? game.color
                          : isCompleted
                          ? 'gray.600'
                          : 'gray.700'
                      }
                      borderRadius="lg"
                      position="relative"
                      overflow="hidden"
                      opacity={isCompleted ? 0.8 : isActive ? 1 : 0.6}
                      transition="all 0.3s ease"
                    >
                      {/* Subtle background effect for active state */}
                      {isActive && (
                        <MotionBox
                          position="absolute"
                          inset={0}
                          bg={game.color}
                          opacity={0.05}
                          animate={{
                            opacity: [0.05, 0.1, 0.05],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}

                      <VStack spacing={2} position="relative">
                        <MotionBox
                          animate={
                            isActive
                              ? {
                                  scale: [1, 1.1, 1],
                                }
                              : {}
                          }
                          transition={
                            isActive
                              ? {
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }
                              : {}
                          }
                        >
                          <GameIcon size={20} color={game.color} />
                        </MotionBox>
                        <Text
                          fontSize="xs"
                          color="gray.300"
                          fontWeight="500"
                          textAlign="center"
                        >
                          {game.name}
                        </Text>

                        {/* Status indicator */}
                        <Box>
                          {isCompleted ? (
                            <CheckCircle size={12} color="#10B981" />
                          ) : isActive ? (
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
                          ) : (
                            <Box width="12px" height="12px" />
                          )}
                        </Box>
                      </VStack>
                    </Box>
                  </MotionBox>
                </GridItem>
              )
            })}
          </Grid>
        </VStack>

        {/* Bottom info */}
        <VStack spacing={3}>
          {/* AI badge */}
          <Box
            px={4}
            py={2}
            bg="gray.800"
            border="1px solid"
            borderColor="gray.700"
            borderRadius="full"
          >
            <HStack spacing={2}>
              <MotionBox
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles size={14} color="#F59E0B" />
              </MotionBox>
              <Text fontSize="xs" color="gray.400" fontWeight="500">
                AI-Powered Generation
              </Text>
            </HStack>
          </Box>

          {/* Time estimate */}
          <Text fontSize="xs" color="gray.500" textAlign="center">
            {displayedProgress < 100
              ? `Estimated time: ${Math.ceil(
                  (duration - (Date.now() - (startTime || Date.now()))) / 1000,
                )}s remaining`
              : 'Generation complete!'}
          </Text>
        </VStack>
      </VStack>
    </Box>
  )
}

export default GameDataGenerationLoader
