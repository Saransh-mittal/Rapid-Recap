// components/gameHub/GameSubmissionLoadingScreen.jsx - No Overflow Version
import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Circle,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Badge,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

// Minimal floating orbs for ambient effect
const FloatingOrb = React.memo(({ size, delay, color, x, y }) => (
  <MotionBox
    position="absolute"
    width={`${size}px`}
    height={`${size}px`}
    borderRadius="50%"
    bg={color}
    top={`${y}%`}
    left={`${x}%`}
    opacity={0.3}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{
      scale: [0.8, 1.2, 0.8],
      opacity: [0.2, 0.5, 0.2],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
))

// Ultra compact step component
const CompactStep = React.memo(
  ({ step, isActive, isCompleted, progress = 0, index }) => {
    return (
      <MotionFlex
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        align="center"
        bg={
          isCompleted
            ? 'rgba(16, 185, 129, 0.1)'
            : isActive
            ? 'rgba(99, 102, 241, 0.1)'
            : 'rgba(255, 255, 255, 0.03)'
        }
        border="1px solid"
        borderColor={
          isCompleted
            ? 'rgba(16, 185, 129, 0.3)'
            : isActive
            ? 'rgba(99, 102, 241, 0.3)'
            : 'rgba(255, 255, 255, 0.08)'
        }
        borderRadius="md"
        p={2}
        position="relative"
        overflow="hidden"
        h="45px"
        w="100%"
      >
        {/* Progress fill */}
        {isActive && progress > 0 && (
          <MotionBox
            position="absolute"
            top={0}
            left={0}
            bottom={0}
            bg="linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%)"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        )}

        <HStack spacing={2} position="relative" zIndex={1} w="100%">
          {/* Ultra compact indicator */}
          <Circle
            size="24px"
            bg={
              isCompleted
                ? 'linear-gradient(45deg, #10b981, #059669)'
                : isActive
                ? 'linear-gradient(45deg, #6366f1, #4f46e5)'
                : 'rgba(255, 255, 255, 0.1)'
            }
            color="white"
            fontSize="xs"
            fontWeight="bold"
          >
            {isCompleted
              ? '✓'
              : isActive
              ? `${Math.round(progress)}`
              : index + 1}
          </Circle>

          {/* Compact step text */}
          <VStack align="start" spacing={0} flex={1} minW={0}>
            <Text
              fontSize="xs"
              fontWeight="bold"
              color={
                isCompleted ? 'green.200' : isActive ? 'blue.200' : 'gray.300'
              }
              lineHeight="1.1"
              noOfLines={1}
            >
              {step.label}
            </Text>
            <Text
              fontSize="2xs"
              color={
                isCompleted ? 'green.300' : isActive ? 'blue.300' : 'gray.500'
              }
              lineHeight="1"
              noOfLines={1}
            >
              {step.description}
            </Text>
          </VStack>

          {/* Ultra compact status */}
          <Badge
            size="sm"
            colorScheme={isCompleted ? 'green' : isActive ? 'blue' : 'gray'}
            variant="subtle"
            fontSize="2xs"
            px={1.5}
            py={0.5}
          >
            {isCompleted ? 'DONE' : isActive ? 'LIVE' : 'WAIT'}
          </Badge>
        </HStack>
      </MotionFlex>
    )
  },
)

const GameSubmissionLoadingScreen = React.memo(
  ({ socket, gameType = 'normal_quiz', isVisible = true }) => {
    const [progress, setProgress] = useState(0)
    const [stepProgress, setStepProgress] = useState({})
    const [currentTip, setCurrentTip] = useState('')
    const [completedSteps, setCompletedSteps] = useState(new Set())
    const [activeStep, setActiveStep] = useState(null)
    const shownTips = useRef(new Set())
    const { user } = useSelector(state => state.auth)

    // Compact game themes
    const gameThemes = useMemo(
      () => ({
        normal_quiz: {
          emoji: '🧠',
          title: 'Knowledge Quest Analysis',
          primaryColor: '#6366f1',
          accentColor: '#818cf8',
        },
        true_false: {
          emoji: '⚡',
          title: 'Truth Detector Evaluation',
          primaryColor: '#a855f7',
          accentColor: '#c084fc',
        },
        word_weaver: {
          emoji: '🔤',
          title: 'Word Architect Assessment',
          primaryColor: '#10b981',
          accentColor: '#34d399',
        },
        connections: {
          emoji: '🔗',
          title: 'Mind Mapper Analysis',
          primaryColor: '#f97316',
          accentColor: '#fb923c',
        },
      }),
      [],
    )

    const theme = gameThemes[gameType] || gameThemes.normal_quiz

    // Shorter tips for compact display
    const gameTips = useMemo(
      () => [
        'AI processes cognitive patterns for optimal scoring',
        'Advanced metrics unlock personalized insights',
        'Real-time analysis maximizes learning acceleration',
        'Performance data drives competitive ranking',
        'Intelligent algorithms enhance player growth',
      ],
      [],
    )

    // Compact submission steps
    const submissionSteps = useMemo(
      () => [
        {
          id: 'initializeCalculation',
          label: 'Initialize Engine',
          description: 'Launching systems',
          weight: 15,
        },
        {
          id: 'calculateRQM',
          label: 'Compute Score',
          description: 'Processing metrics',
          weight: 30,
        },
        {
          id: 'saveAttempt',
          label: 'Save Session',
          description: 'Archiving data',
          weight: 25,
        },
        {
          id: 'updateStats',
          label: 'Update Profile',
          description: 'Refreshing stats',
          weight: 20,
        },
        {
          id: 'finalizeAttempt',
          label: 'Complete',
          description: 'Finalizing',
          weight: 10,
        },
      ],
      [],
    )

    // Socket handling
    useEffect(() => {
      if (!socket || !user || !isVisible) return

      socket.emit('join game submission progress', user._id)

      const handleProgress = data => {
        setStepProgress(prev => {
          const newProgress = { ...prev, [data.stepId]: data.progress }
          if (data.progress === 100) {
            setCompletedSteps(prev => new Set([...prev, data.stepId]))
          }
          return newProgress
        })

        if (data.progress > 0 && data.progress < 100) {
          setActiveStep(data.stepId)
        }
      }

      socket.on('game_submission_progress', handleProgress)
      return () => socket.off('game_submission_progress', handleProgress)
    }, [socket, user, isVisible])

    // Progress calculation
    useEffect(() => {
      const totalWeight = submissionSteps.reduce(
        (sum, step) => sum + step.weight,
        0,
      )
      const weightedProgress = submissionSteps.reduce((sum, step) => {
        const stepProgressValue = stepProgress[step.id] || 0
        return sum + (stepProgressValue * step.weight) / 100
      }, 0)
      setProgress((weightedProgress / totalWeight) * 100)
    }, [stepProgress, submissionSteps])

    // Tip rotation
    useEffect(() => {
      const getRandomTip = () => {
        if (shownTips.current.size === gameTips.length) {
          shownTips.current.clear()
        }
        let newTip
        do {
          newTip = gameTips[Math.floor(Math.random() * gameTips.length)]
        } while (shownTips.current.has(newTip))
        return newTip
      }

      const showNewTip = () => {
        const newTip = getRandomTip()
        setCurrentTip(newTip)
        shownTips.current.add(newTip)
      }

      showNewTip()
      const tipInterval = setInterval(showNewTip, 4000)
      return () => clearInterval(tipInterval)
    }, [gameTips])

    // Minimal ambient orbs
    const orbs = useMemo(
      () => [
        {
          id: 1,
          size: 6,
          delay: 0,
          color: theme.primaryColor + '40',
          x: 15,
          y: 20,
        },
        {
          id: 2,
          size: 4,
          delay: 1,
          color: theme.accentColor + '30',
          x: 85,
          y: 15,
        },
        {
          id: 3,
          size: 8,
          delay: 2,
          color: theme.primaryColor + '20',
          x: 10,
          y: 80,
        },
        {
          id: 4,
          size: 5,
          delay: 1.5,
          color: theme.accentColor + '25',
          x: 90,
          y: 85,
        },
      ],
      [theme.primaryColor, theme.accentColor],
    )

    if (!isVisible) return null

    return (
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={1000}
        overflow="hidden"
        pointerEvents="auto"
      >
        {/* Minimal ambient orbs */}
        {orbs.map(orb => (
          <FloatingOrb key={orb.id} {...orb} />
        ))}

        {/* Glassmorphism overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.75)"
          backdropFilter="blur(12px)"
        />

        {/* Main content - constrained to viewport height */}
        <Box
          position="relative"
          zIndex={1}
          h="100vh"
          w="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={{ base: 4, md: 8 }}
          py={4}
        >
          <Grid
            templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
            gap={{ base: 4, lg: 6 }}
            w="100%"
            maxW="900px"
            alignItems="center"
            h="fit-content"
            maxH="calc(100vh - 32px)"
          >
            {/* Left side - Main display */}
            <GridItem>
              <MotionBox
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <VStack spacing={{ base: 3, md: 4 }} align="center">
                  {/* Hero section */}
                  <VStack spacing={2} textAlign="center">
                    {/* Animated emoji */}
                    <MotionBox
                      fontSize={{ base: '50px', md: '60px' }}
                      position="relative"
                      animate={{
                        y: [0, -6, 0],
                        rotate: [0, 1, -1, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        width="70px"
                        height="70px"
                        borderRadius="50%"
                        bg={theme.primaryColor}
                        opacity={0.2}
                        filter="blur(15px)"
                      />
                      <Text position="relative" zIndex={1}>
                        {theme.emoji}
                      </Text>
                    </MotionBox>

                    {/* Title */}
                    <VStack spacing={1}>
                      <Text
                        fontSize={{ base: 'lg', md: 'xl' }}
                        fontWeight="900"
                        color="white"
                        letterSpacing="tight"
                        lineHeight="1.2"
                      >
                        {theme.title}
                      </Text>
                      <Text
                        fontSize={{ base: 'sm', md: 'md' }}
                        color="gray.300"
                        fontWeight="500"
                      >
                        Processing your mastery metrics
                      </Text>
                    </VStack>
                  </VStack>

                  {/* Main progress */}
                  <VStack spacing={3}>
                    <Box position="relative">
                      <CircularProgress
                        value={progress}
                        size={{ base: '80px', md: '90px' }}
                        color={theme.primaryColor}
                        trackColor="rgba(255, 255, 255, 0.1)"
                        thickness="8px"
                      >
                        <CircularProgressLabel>
                          <VStack spacing={0}>
                            <Text
                              fontSize={{ base: 'lg', md: 'xl' }}
                              fontWeight="bold"
                              color="white"
                            >
                              {Math.round(progress)}%
                            </Text>
                            <Text
                              fontSize="2xs"
                              color="gray.400"
                              textTransform="uppercase"
                            >
                              Done
                            </Text>
                          </VStack>
                        </CircularProgressLabel>
                      </CircularProgress>

                      {/* Glow effect */}
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        width={{ base: '100px', md: '110px' }}
                        height={{ base: '100px', md: '110px' }}
                        borderRadius="50%"
                        bg={theme.primaryColor}
                        opacity={0.1}
                        filter="blur(12px)"
                        zIndex={-1}
                      />
                    </Box>

                    {/* Linear progress */}
                    <Box w={{ base: '200px', md: '220px' }}>
                      <Progress
                        value={progress}
                        size="sm"
                        bg="rgba(255, 255, 255, 0.1)"
                        borderRadius="full"
                        sx={{
                          '& > div': {
                            background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.accentColor})`,
                          },
                        }}
                      />
                    </Box>
                  </VStack>

                  {/* Tip display */}
                  <AnimatePresence mode="wait">
                    <MotionBox
                      key={currentTip}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      bg="rgba(255, 255, 255, 0.05)"
                      backdropFilter="blur(8px)"
                      border="1px solid rgba(255, 255, 255, 0.1)"
                      borderRadius="md"
                      p={3}
                      maxW="300px"
                      textAlign="center"
                    >
                      <HStack spacing={2} justify="center" mb={1}>
                        <Circle size="3px" bg={theme.primaryColor} />
                        <Text
                          fontSize="2xs"
                          color={theme.accentColor}
                          fontWeight="bold"
                          textTransform="uppercase"
                          letterSpacing="wide"
                        >
                          AI Insight
                        </Text>
                        <Circle size="3px" bg={theme.primaryColor} />
                      </HStack>
                      <Text fontSize="xs" color="gray.200" lineHeight="1.4">
                        {currentTip}
                      </Text>
                    </MotionBox>
                  </AnimatePresence>
                </VStack>
              </MotionBox>
            </GridItem>

            {/* Right side - Steps */}
            <GridItem>
              <MotionBox
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <VStack spacing={3} h="fit-content">
                  <Text
                    fontSize={{ base: 'md', md: 'lg' }}
                    fontWeight="bold"
                    color="white"
                    textAlign="center"
                    mb={1}
                  >
                    Processing Pipeline
                  </Text>

                  <VStack spacing={2} w="100%">
                    {submissionSteps.map((step, index) => (
                      <CompactStep
                        key={step.id}
                        step={step}
                        isActive={activeStep === step.id}
                        isCompleted={completedSteps.has(step.id)}
                        progress={stepProgress[step.id] || 0}
                        index={index}
                      />
                    ))}
                  </VStack>

                  {/* Completion indicator */}
                  {progress >= 100 && (
                    <MotionBox
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, type: 'spring' }}
                      bg="rgba(16, 185, 129, 0.15)"
                      backdropFilter="blur(8px)"
                      border="1px solid rgba(16, 185, 129, 0.3)"
                      borderRadius="md"
                      p={2}
                      textAlign="center"
                      w="100%"
                      mt={2}
                    >
                      <HStack spacing={2} justify="center">
                        <Text fontSize="md">🎉</Text>
                        <Text fontSize="sm" fontWeight="bold" color="green.300">
                          Analysis Complete!
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="green.200">
                        Preparing results...
                      </Text>
                    </MotionBox>
                  )}
                </VStack>
              </MotionBox>
            </GridItem>
          </Grid>
        </Box>
      </Box>
    )
  },
)

GameSubmissionLoadingScreen.displayName = 'GameSubmissionLoadingScreen'

export default GameSubmissionLoadingScreen
