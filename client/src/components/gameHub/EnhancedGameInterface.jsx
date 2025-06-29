// components/gameHub/EnhancedGameInterface.jsx - Fixed dynamic timer warnings
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Progress,
  useToast,
  CircularProgress,
  CircularProgressLabel,
  Grid,
  Flex,
  Badge,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Timer,
  Send,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'

// Import timer utilities
import { getGameTypeTimerConfig } from '../../utils/timerUtils'

// Import custom hooks
import {
  useGameSession,
  useSubmitGame,
  useFetchGameData,
} from '../../customHooks/useGameHub'

// Import Redux actions
import {
  setCurrentGameType,
  setGameState,
  setCurrentQuestionIndex,
  setSelectedAnswers,
  resetGameSession,
} from '../../redux/gameHubSlice'

// Import game interface components
import NormalQuizInterface from './gameInterfaces/NormalQuizInterface'
import TrueFalseInterface from './gameInterfaces/TrueFalseInterface'
import WordWeaverInterface from './gameInterfaces/WordWeaverInterface'
import ConnectionsInterface from './gameInterfaces/ConnectionsInterface'
import GameResultsModal from './GameResultsModal'

const MotionBox = motion(Box)

// Enhanced Timer Component with better styling and warnings
const EnhancedTimer = ({ timeLeft, totalTime, gameType, onTimeUp }) => {
  const getColor = () => {
    const percentage = (timeLeft / totalTime) * 100
    if (percentage > 50) return 'green.400'
    if (percentage > 25) return 'yellow.400'
    return 'red.400'
  }

  const getWarningState = () => {
    const percentage = (timeLeft / totalTime) * 100
    if (percentage <= 10) return 'critical'
    if (percentage <= 25) return 'warning'
    return 'normal'
  }

  const warningState = getWarningState()

  return (
    <VStack spacing={2} align="center">
      <MotionBox
        animate={
          warningState === 'critical'
            ? { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }
            : {}
        }
        transition={{
          duration: 1,
          repeat: warningState === 'critical' ? Infinity : 0,
        }}
      >
        <CircularProgress
          value={(timeLeft / totalTime) * 100}
          color={getColor()}
          size="80px"
          thickness="8px"
          trackColor="gray.700"
        >
          <CircularProgressLabel fontSize="lg" fontWeight="bold" color="white">
            {timeLeft}s
          </CircularProgressLabel>
        </CircularProgress>
      </MotionBox>
      <Text fontSize="xs" color="gray.400" textAlign="center">
        {totalTime}s total
      </Text>
    </VStack>
  )
}

// Timer Warning Component - now uses dynamic warning times
const TimerWarning = ({ timeLeft, totalTime, gameType }) => {
  const timerConfig = getGameTypeTimerConfig(gameType)
  const percentage = (timeLeft / totalTime) * 100

  // Use game-specific warning thresholds
  if (timeLeft > timerConfig.warningAt) return null

  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Alert
        status={timeLeft <= timerConfig.criticalAt ? 'error' : 'warning'}
        borderRadius="lg"
        mb={4}
        bg={timeLeft <= timerConfig.criticalAt ? 'red.900' : 'yellow.900'}
        color="white"
      >
        <AlertIcon />
        {timeLeft <= timerConfig.criticalAt ? (
          <Text fontWeight="bold">⚠️ Only {timeLeft} seconds left!</Text>
        ) : (
          <Text>⏰ Time is running out - {timeLeft} seconds remaining</Text>
        )}
      </Alert>
    </MotionBox>
  )
}

// Navigation Controls Component
const NavigationControls = ({
  currentQuestionIndex,
  totalQuestions,
  gameType,
  hasAnswer,
  onPrevious,
  onNext,
  onSubmit,
  canNavigateNext,
  canSubmit,
  isSubmitting,
}) => {
  const { t } = useTranslation()

  const isFirstQuestion = currentQuestionIndex === 0
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const isSingleQuestion = gameType === 'connections' || totalQuestions === 1

  return (
    <HStack justify="space-between" w="100%" pt={6}>
      {/* Previous Button */}
      <Button
        leftIcon={<ArrowLeft size={16} />}
        onClick={onPrevious}
        isDisabled={isFirstQuestion || isSingleQuestion || isSubmitting}
        variant="outline"
        colorScheme="gray"
        size="md"
      >
        Previous
      </Button>

      {/* Question Indicator */}
      <VStack spacing={1}>
        <Text fontSize="sm" color="gray.400">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </Text>
        <Progress
          value={((currentQuestionIndex + 1) / totalQuestions) * 100}
          width="200px"
          size="sm"
          colorScheme="purple"
          borderRadius="full"
        />
      </VStack>

      {/* Next/Submit Button */}
      {isLastQuestion || isSingleQuestion ? (
        <Button
          rightIcon={<Send size={16} />}
          onClick={onSubmit}
          isDisabled={!canSubmit}
          isLoading={isSubmitting}
          loadingText="Submitting..."
          colorScheme="green"
          size="md"
          _hover={{
            transform: canSubmit ? 'scale(1.05)' : 'none',
            boxShadow: canSubmit ? '0 8px 25px rgba(34, 197, 94, 0.4)' : 'none',
          }}
        >
          Submit Game
        </Button>
      ) : (
        <Button
          rightIcon={<ArrowRight size={16} />}
          onClick={onNext}
          isDisabled={!canNavigateNext}
          colorScheme="purple"
          size="md"
          _hover={{
            transform: canNavigateNext ? 'scale(1.05)' : 'none',
            boxShadow: canNavigateNext
              ? '0 8px 25px rgba(139, 92, 246, 0.4)'
              : 'none',
          }}
        >
          Next Question
        </Button>
      )}
    </HStack>
  )
}

// Main Enhanced Game Interface
const EnhancedGameInterface = () => {
  const { articleId, gameType } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const toast = useToast()
  const { t } = useTranslation()
  const timerRef = useRef(null)

  // Redux state
  const { user } = useSelector(state => state.auth)
  const { currentQuestionIndex, selectedAnswers, gameState } = useSelector(
    state => state.gameHub,
  )

  // Custom hooks
  const { gameData, loading: gameDataLoading } = useFetchGameData({
    articleId,
    language: i18n.language,
  })

  const { sessionId, gameSession, sessionStatus, initializeGame } =
    useGameSession({
      articleId,
      gameType,
      language: i18n.language,
    })

  const { submitGame, submitting, submissionProgress } = useSubmitGame()

  // Local state for timer and game management
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [results, setResults] = useState(null)
  const [currentAnswers, setCurrentAnswers] = useState([])
  const [gameStarted, setGameStarted] = useState(false)
  const [warningShown, setWarningShown] = useState(false)
  const [criticalWarningShown, setCriticalWarningShown] = useState(false)

  // Get timer configuration for current game type
  const timerConfig = useMemo(
    () => getGameTypeTimerConfig(gameType),
    [gameType],
  )

  // Initialize game on component mount
  useEffect(() => {
    if (articleId && gameType && !sessionId) {
      dispatch(setCurrentGameType(gameType))
      dispatch(setGameState('loading'))
      initializeGame()
    }
  }, [articleId, gameType, sessionId, dispatch, initializeGame])

  // Set up timer when game session is ready
  useEffect(() => {
    if (gameSession && sessionStatus === 'playing') {
      const timer = gameSession.timer || timerConfig.timeLimit // Use config fallback
      setTotalTime(timer)
      setTimeLeft(timer)
      setGameStarted(true)
      // Reset warning states for new game
      setWarningShown(false)
      setCriticalWarningShown(false)

      console.log('Timer initialized:', {
        timer,
        gameType,
        sessionStatus,
        warningAt: timerConfig.warningAt,
        criticalAt: timerConfig.criticalAt,
      })
    }
  }, [gameSession, sessionStatus, gameType, timerConfig])

  // Initialize answers array based on game type
  useEffect(() => {
    if (gameSession && currentAnswers.length === 0) {
      if (gameType === 'connections') {
        setCurrentAnswers([]) // Connections will be handled specially
      } else {
        setCurrentAnswers(new Array(gameSession.questions.length).fill(null))
      }
    }
  }, [gameSession, gameType, currentAnswers.length])

  // Timer countdown effect with dynamic warnings
  useEffect(() => {
    if (!gameStarted || sessionStatus !== 'playing' || timeLeft <= 0) {
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1

        // FIXED: Use game-specific warning time instead of hardcoded 30
        if (newTime === timerConfig.warningAt && !warningShown) {
          setWarningShown(true)
          toast({
            title: '⏰ Time Warning',
            description: `${timerConfig.warningAt} seconds remaining!`,
            status: 'warning',
            duration: 3000,
            isClosable: true,
            position: 'top',
          })
        }

        // FIXED: Use game-specific critical time instead of hardcoded 10
        if (newTime === timerConfig.criticalAt && !criticalWarningShown) {
          setCriticalWarningShown(true)
          toast({
            title: '🚨 Critical Time Warning',
            description: `Only ${timerConfig.criticalAt} seconds left!`,
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top',
          })
        }

        // Auto-submit when time runs out
        if (newTime <= 0) {
          handleTimeUp()
          return 0
        }

        return newTime
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [
    gameStarted,
    sessionStatus,
    timeLeft,
    warningShown,
    criticalWarningShown,
    timerConfig,
  ])

  // Handle time up - auto submit current answers
  const handleTimeUp = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    console.log('Time up! Auto-submitting answers:', currentAnswers)

    toast({
      title: "⏰ Time's Up!",
      description: 'Your answers have been automatically submitted.',
      status: 'info',
      duration: 5000,
      isClosable: true,
      position: 'top',
    })

    // Auto-submit with current answers
    submitGameAttempt(currentAnswers)
  }, [currentAnswers])

  // Handle answer selection (NO AUTO-NAVIGATION)
  const handleAnswer = useCallback(
    (answer, isCorrect = null) => {
      const newAnswers = [...currentAnswers]

      if (gameType === 'connections') {
        // For connections, store the connections array
        setCurrentAnswers(answer)
        dispatch(setSelectedAnswers(answer))
      } else if (gameType === 'word_weaver') {
        newAnswers[currentQuestionIndex] = { answer, isCorrect }
        setCurrentAnswers(newAnswers)
        dispatch(setSelectedAnswers(newAnswers))
      } else {
        newAnswers[currentQuestionIndex] = answer
        setCurrentAnswers(newAnswers)
        dispatch(setSelectedAnswers(newAnswers))
      }
    },
    [currentAnswers, currentQuestionIndex, gameType, dispatch],
  )

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      dispatch(setCurrentQuestionIndex(currentQuestionIndex - 1))
    }
  }, [currentQuestionIndex, dispatch])

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < gameSession.questions.length - 1) {
      dispatch(setCurrentQuestionIndex(currentQuestionIndex + 1))
    }
  }, [currentQuestionIndex, gameSession, dispatch])

  // Submit game attempt
  const submitGameAttempt = useCallback(
    async (answers = currentAnswers) => {
      try {
        // Clear timer to prevent double submission
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }

        dispatch(setGameState('submitting'))
        setGameStarted(false)

        const timeTaken = totalTime - timeLeft

        console.log('Submitting game:', {
          sessionId,
          answers,
          timeTaken,
          totalTime,
          timeLeft,
        })

        const result = await submitGame({
          sessionId,
          userResponses: answers,
          timeTaken: Math.max(timeTaken, 0), // Ensure positive time
        })

        setResults(result)
        dispatch(setGameState('completed'))
      } catch (error) {
        console.error('Error submitting game:', error)
        dispatch(setGameState('error'))
        toast({
          title: 'Submission Error',
          description: 'Failed to submit your answers. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    },
    [
      currentAnswers,
      sessionId,
      totalTime,
      timeLeft,
      submitGame,
      dispatch,
      toast,
    ],
  )

  // Handle back to menu
  const handleBackToMenu = useCallback(() => {
    // Clear timer when leaving
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    dispatch(resetGameSession())
    navigate(`/gamehub/${articleId}`)
  }, [dispatch, navigate, articleId])

  // Get current question for rendering
  const getCurrentQuestion = useCallback(() => {
    if (!gameSession?.questions) return null

    let currentQuestion
    if (gameType === 'connections') {
      currentQuestion = gameSession.questions[0]
    } else {
      currentQuestion = gameSession.questions[currentQuestionIndex]
    }

    if (!currentQuestion) return null

    // Data safety transformation to ensure compatibility
    if (gameType === 'normal_quiz' && currentQuestion.options) {
      const safeOptions = {}
      Object.entries(currentQuestion.options).forEach(([key, value]) => {
        if (typeof value === 'object' && value?.text) {
          safeOptions[key] = value.text
        } else if (typeof value === 'string') {
          safeOptions[key] = value
        } else {
          safeOptions[key] = String(value)
        }
      })

      return {
        ...currentQuestion,
        options: safeOptions,
      }
    }

    return currentQuestion
  }, [gameSession, gameType, currentQuestionIndex])

  // Check if user has provided an answer for current question
  const hasCurrentAnswer = useMemo(() => {
    if (gameType === 'connections') {
      return (
        currentAnswers &&
        Array.isArray(currentAnswers) &&
        currentAnswers.length > 0
      )
    }

    const currentAnswer = currentAnswers[currentQuestionIndex]
    return (
      currentAnswer !== null &&
      currentAnswer !== undefined &&
      currentAnswer !== ''
    )
  }, [currentAnswers, currentQuestionIndex, gameType])

  // Check if can navigate to next question
  const canNavigateNext = useMemo(() => {
    return (
      hasCurrentAnswer &&
      currentQuestionIndex < gameSession?.questions?.length - 1
    )
  }, [hasCurrentAnswer, currentQuestionIndex, gameSession])

  // Check if can submit game
  const canSubmit = useMemo(() => {
    if (gameType === 'connections') {
      return (
        currentAnswers &&
        Array.isArray(currentAnswers) &&
        currentAnswers.length > 0
      )
    }

    // For other games, check if current question is answered
    return hasCurrentAnswer
  }, [gameType, currentAnswers, hasCurrentAnswer])

  // Render game interface based on type
  const renderGameInterface = () => {
    const currentQuestion = getCurrentQuestion()
    if (!currentQuestion) return null

    const sharedProps = {
      question: currentQuestion,
      questionIndex: currentQuestionIndex,
      totalQuestions: gameSession.questions.length,
      onAnswer: handleAnswer,
      selectedAnswer: currentAnswers[currentQuestionIndex],
      isSubmitted: false, // Since we're using manual navigation
    }

    switch (gameType) {
      case 'normal_quiz':
        return <NormalQuizInterface {...sharedProps} />

      case 'true_false':
        return <TrueFalseInterface {...sharedProps} />

      case 'word_weaver':
        return (
          <WordWeaverInterface
            {...sharedProps}
            allQuestions={gameSession.questions} // Pass all questions for context
          />
        )

      case 'connections':
        return (
          <ConnectionsInterface
            gameData={currentQuestion}
            onAnswer={handleAnswer}
            selectedConnections={currentAnswers}
          />
        )

      default:
        return <Text>Unknown game type</Text>
    }
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Loading state
  if (gameDataLoading || sessionStatus === 'creating') {
    return (
      <Box
        minH="100vh"
        bg="gray.900"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Box fontSize="6xl">🎮</Box>
          <Text fontSize="xl">Loading Game...</Text>
        </VStack>
      </Box>
    )
  }

  // Error state
  if (sessionStatus === 'error') {
    return (
      <Box
        minH="100vh"
        bg="gray.900"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Box fontSize="6xl">❌</Box>
          <Text fontSize="xl">Failed to load game</Text>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </VStack>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        p={6}
        borderBottom="1px solid"
        borderColor="gray.700"
        position="sticky"
        top={0}
        zIndex={10}
        bg="gray.900"
      >
        <Button
          leftIcon={<ChevronLeft />}
          onClick={handleBackToMenu}
          variant="ghost"
          color="gray.400"
          _hover={{ color: 'white', bg: 'gray.800' }}
        >
          Back to Menu
        </Button>

        <VStack spacing={1}>
          <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
            {gameType.replace('_', ' ').toUpperCase()}
          </Badge>
        </VStack>

        {/* Enhanced Timer Display with game-specific warnings */}
        {gameStarted && sessionStatus === 'playing' && totalTime > 0 && (
          <EnhancedTimer
            timeLeft={timeLeft}
            totalTime={totalTime}
            gameType={gameType}
            onTimeUp={handleTimeUp}
          />
        )}
      </Flex>

      {/* Game Content */}
      <Box p={8} maxW="800px" mx="auto">
        {/* Timer Warning - now uses dynamic warning times */}
        <AnimatePresence>
          {gameStarted && sessionStatus === 'playing' && (
            <TimerWarning
              timeLeft={timeLeft}
              totalTime={totalTime}
              gameType={gameType}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {sessionStatus === 'playing' && gameStarted && (
            <MotionBox
              key={`${currentQuestionIndex}-${gameType}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VStack spacing={6}>
                {renderGameInterface()}

                {/* Navigation Controls */}
                <NavigationControls
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={gameSession?.questions?.length || 1}
                  gameType={gameType}
                  hasAnswer={hasCurrentAnswer}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onSubmit={() => submitGameAttempt(currentAnswers)}
                  canNavigateNext={canNavigateNext}
                  canSubmit={canSubmit}
                  isSubmitting={submitting}
                />
              </VStack>
            </MotionBox>
          )}

          {submitting && (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <VStack spacing={4} py={20}>
                <Box fontSize="6xl">⏳</Box>
                <Text fontSize="xl">Calculating your score...</Text>
                <Text fontSize="sm" color="gray.400">
                  Time taken: {Math.max(totalTime - timeLeft, 0)} seconds
                </Text>
                <Progress
                  value={submissionProgress}
                  width="300px"
                  colorScheme="purple"
                  borderRadius="full"
                  size="lg"
                />
              </VStack>
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Debug Info (remove in production) */}
        {/* {process.env.NODE_ENV === 'development' && (
          <Box
            position="fixed"
            bottom={4}
            right={4}
            bg="gray.800"
            p={2}
            borderRadius="md"
            fontSize="xs"
            color="gray.400"
          >
            <Text>
              Debug: Timer {timeLeft}/{totalTime}
            </Text>
            <Text>Game: {gameType}</Text>
            <Text>Warning at: {timerConfig.warningAt}s</Text>
            <Text>Critical at: {timerConfig.criticalAt}s</Text>
            <Text>Warning shown: {warningShown ? 'Yes' : 'No'}</Text>
            <Text>Critical shown: {criticalWarningShown ? 'Yes' : 'No'}</Text>
            <Text>Status: {sessionStatus}</Text>
            <Text>Started: {gameStarted ? 'Yes' : 'No'}</Text>
            <Text>Has Answer: {hasCurrentAnswer ? 'Yes' : 'No'}</Text>
            <Text>Can Submit: {canSubmit ? 'Yes' : 'No'}</Text>
          </Box>
        )} */}
      </Box>

      {/* Results Modal */}
      <GameResultsModal
        isOpen={gameState === 'completed' && !!results}
        onClose={handleBackToMenu}
        results={results}
        gameType={gameType}
        onBackToMenu={handleBackToMenu}
      />
    </Box>
  )
}

export default EnhancedGameInterface
