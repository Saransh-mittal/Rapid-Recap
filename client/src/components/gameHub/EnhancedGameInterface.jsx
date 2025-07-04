// components/gameHub/EnhancedGameInterface.jsx - Fixed version without setShowResults
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
  Badge,
  Container,
  Flex,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  Send,
  ArrowLeft,
  ArrowRight,
  Target,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'

// Import timer utilities
import { getGameTypeTimerConfig, getTimerColor } from '../../utils/timerUtils'

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
import GameSubmissionLoadingScreen from './GameSubmissionLoadingScreen'
import { useSocket } from '../../customHooks/useSocket'
// import { ensureArticleInHistory } from '../../utils/historyCleanup'

const MotionBox = motion(Box)

// Game type configurations
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

// Compact Timer Component - Config-synced visual and audio warnings
const CompactTimer = ({ timeLeft, totalTime, gameType, onTimeUp }) => {
  const { t } = useTranslation('GameHub')
  const config = gameTypeConfigs[gameType] || gameTypeConfigs.normal_quiz
  const toast = useToast()

  // Use timer utilities and game-specific config
  const timerColor = getTimerColor(timeLeft, totalTime)
  const gameTimerConfig = getGameTypeTimerConfig(gameType)

  // CONFIG-BASED warning states (not percentage-based)
  const getConfigWarningState = () => {
    if (timeLeft <= gameTimerConfig.criticalAt) return 'critical'
    if (timeLeft <= gameTimerConfig.warningAt) return 'warning'
    return 'normal'
  }

  const configWarningState = getConfigWarningState()

  // Refs to track if warnings have been shown
  const warningShownRef = useRef(false)
  const criticalShownRef = useRef(false)
  const previousTimeRef = useRef(timeLeft)

  // Reset warning states when timer resets or game starts
  useEffect(() => {
    if (timeLeft >= totalTime * 0.9) {
      warningShownRef.current = false
      criticalShownRef.current = false
    }
  }, [timeLeft, totalTime])

  // Show toast warnings using config values
  useEffect(() => {
    const previousTime = previousTimeRef.current
    previousTimeRef.current = timeLeft

    // Only show warnings when time is decreasing (not when timer resets)
    if (timeLeft >= previousTime) return

    // Critical warning based on config criticalAt value
    if (
      timeLeft <= gameTimerConfig.criticalAt &&
      !criticalShownRef.current &&
      timeLeft > 0
    ) {
      criticalShownRef.current = true
      toast({
        title: `🚨 ${t('timer.criticalTime')}`,
        description: t('timer.onlySecondsLeft', { count: timeLeft }),
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      })
    }
    // Warning based on config warningAt value (but not if critical already shown)
    else if (
      timeLeft <= gameTimerConfig.warningAt &&
      !warningShownRef.current &&
      !criticalShownRef.current &&
      timeLeft > 0
    ) {
      warningShownRef.current = true
      toast({
        title: `⏰ ${t('timer.timeRunningLow')}`,
        description: `${timeLeft} ${t('timer.secondsRemaining')} - ${t(
          'timer.speedUp',
        )}`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    }
  }, [timeLeft, totalTime, gameTimerConfig, toast, t])

  return (
    <MotionBox
      // SYNCED: Pulsing animation starts at criticalAt seconds
      animate={configWarningState === 'critical' ? { scale: [1, 1.08, 1] } : {}}
      transition={{
        duration: 0.6,
        repeat: configWarningState === 'critical' ? Infinity : 0,
      }}
    >
      <HStack spacing={3}>
        {/* SINGLE timer display - only in circular progress */}
        <CircularProgress
          value={(timeLeft / totalTime) * 100}
          color={timerColor}
          size="60px"
          thickness="6px"
          trackColor="rgba(255, 255, 255, 0.1)"
        >
          <CircularProgressLabel>
            <VStack spacing={0}>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="white"
                lineHeight="1"
              >
                {timeLeft}
              </Text>
              <Text fontSize="2xs" color="gray.400" lineHeight="1">
                {t('timer.sec')}
              </Text>
            </VStack>
          </CircularProgressLabel>
        </CircularProgress>

        {/* SYNCED: Badge appears at warningAt seconds */}
        <VStack spacing={1} align="start">
          {configWarningState !== 'normal' && (
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: configWarningState === 'critical' ? [1, 1.1, 1] : 1,
              }}
              transition={{
                opacity: { duration: 0.3 },
                scale: {
                  duration: 0.5,
                  repeat: configWarningState === 'critical' ? Infinity : 0,
                  ease: 'easeInOut',
                },
              }}
            >
              <Badge
                colorScheme={
                  configWarningState === 'critical' ? 'red' : 'yellow'
                }
                size="sm"
                fontSize="2xs"
                variant="solid"
              >
                {configWarningState === 'critical'
                  ? t('timer.urgent')
                  : t('timer.hurry')}
              </Badge>
            </MotionBox>
          )}
        </VStack>
      </HStack>
    </MotionBox>
  )
}

// Compact Navigation Controls - Updated to hide Previous for Quiz & T/F
const CompactNavigationControls = ({
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
  const { t } = useTranslation('GameHub')
  const config = gameTypeConfigs[gameType] || gameTypeConfigs.normal_quiz
  const isFirstQuestion = currentQuestionIndex === 0
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const isSingleQuestion = gameType === 'connections' || totalQuestions === 1

  // UPDATED: Hide previous navigation for quiz, true/false, and connections games
  const showPreviousButton = gameType === 'word_weaver'

  return (
    <Box
      bg="rgba(255, 255, 255, 0.05)"
      backdropFilter="blur(10px)"
      border="1px solid rgba(255, 255, 255, 0.1)"
      borderRadius="xl"
      p={4}
    >
      <VStack spacing={3}>
        {/* Progress */}
        <HStack justify="space-between" w="100%">
          <Text fontSize="xs" color="gray.400">
            {t('gameInterface.question')} {currentQuestionIndex + 1} of{' '}
            {totalQuestions}
          </Text>
          {hasAnswer && (
            <HStack spacing={1}>
              <CheckCircle size={12} color={config.color} />
              <Text fontSize="xs" color={config.color}>
                {t('gameInterface.answered')}
              </Text>
            </HStack>
          )}
        </HStack>

        <Progress
          value={((currentQuestionIndex + 1) / totalQuestions) * 100}
          size="sm"
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.1)"
          colorScheme="blue"
          w="100%"
        />

        {/* FIXED: Buttons - Updated layout to prevent overflow and ensure proper visibility */}
        <VStack spacing={3} w="100%">
          {/* Main Action Button */}
          {isLastQuestion || isSingleQuestion ? (
            <Button
              rightIcon={<Send size={14} />}
              onClick={onSubmit}
              isDisabled={!canSubmit}
              isLoading={isSubmitting}
              size="sm"
              bgGradient={`linear(45deg, ${config.color}, ${config.color}dd)`}
              color="white"
              borderRadius="full"
              fontSize="xs"
              w="100%"
              _hover={{
                bgGradient: `linear(45deg, ${config.color}dd, ${config.color}bb)`,
              }}
              _disabled={{
                opacity: 0.6,
                cursor: 'not-allowed',
              }}
            >
              {t('navigation.submit')}
            </Button>
          ) : (
            <Button
              rightIcon={<ArrowRight size={14} />}
              onClick={onNext}
              isDisabled={!canNavigateNext}
              size="sm"
              bgGradient={`linear(45deg, ${config.color}, ${config.color}dd)`}
              color="white"
              borderRadius="full"
              fontSize="xs"
              w="100%"
              _hover={{
                bgGradient: `linear(45deg, ${config.color}dd, ${config.color}bb)`,
              }}
              _disabled={{
                opacity: 0.6,
                cursor: 'not-allowed',
              }}
            >
              {t('navigation.next')}
            </Button>
          )}
          {/* Previous Button Row - Only for word_weaver */}
          {showPreviousButton && (
            <Button
              leftIcon={<ArrowLeft size={14} />}
              onClick={onPrevious}
              isDisabled={isFirstQuestion || isSingleQuestion || isSubmitting}
              color={'white'}
              variant="outline"
              size="sm"
              borderRadius="full"
              borderColor="rgba(255, 255, 255, 0.2)"
              fontSize="xs"
              w="100%"
              _hover={{
                borderColor: 'rgba(255, 255, 255, 0.4)',
                bg: 'rgba(255, 255, 255, 0.05)',
              }}
              _disabled={{
                opacity: 0.5,
                cursor: 'not-allowed',
              }}
            >
              {t('navigation.previous')}
            </Button>
          )}
        </VStack>

        {/* UPDATED: Add info text for no-previous-nav games */}
        {!showPreviousButton && !isSingleQuestion && (
          <Text
            fontSize="xs"
            color="gray.500"
            textAlign="center"
            fontStyle="italic"
          >
            {t('gameInterface.noGoingBack')}
          </Text>
        )}

        {/* UPDATED: Special message for connections */}
        {gameType === 'connections' && (
          <Text
            fontSize="xs"
            color="gray.500"
            textAlign="center"
            fontStyle="italic"
          >
            {t('gameInterface.buildNetwork')}
          </Text>
        )}
      </VStack>
    </Box>
  )
}

// Main Enhanced Game Interface
const EnhancedGameInterface = () => {
  const { articleId, gameType } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const toast = useToast()
  const { t } = useTranslation('GameHub')
  const timerRef = useRef(null)
  const { getSocket } = useSocket()

  const config = gameTypeConfigs[gameType] || gameTypeConfigs.normal_quiz

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
  const {
    submitGame,
    submitting,
    submissionProgress,
    stepProgress,
    completedSteps,
  } = useSubmitGame()
  const { sessionId, gameSession, sessionStatus, initializeGame } =
    useGameSession({
      articleId,
      gameType,
      language: i18n.language,
    })

  // Local state for timer and game management
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [results, setResults] = useState(null)
  const [currentAnswers, setCurrentAnswers] = useState([])
  const [gameStarted, setGameStarted] = useState(false)

  // Get timer configuration for current game type
  const timerConfig = useMemo(
    () => getGameTypeTimerConfig(gameType),
    [gameType],
  )

  // Initialize game on component mount
  useEffect(() => {
    // This effect runs when the component mounts or when articleId/gameType changes.
    if (articleId && gameType && !sessionId) {
      // FIX: Reset the game session state in Redux before starting a new one.
      // This ensures that state from a previous game (like question index) is cleared.
      dispatch(resetGameSession())

      dispatch(setCurrentGameType(gameType))
      dispatch(setGameState('loading'))
      initializeGame()
    }
  }, [articleId, gameType, sessionId, dispatch, initializeGame])

  // Set up timer when game session is ready
  useEffect(() => {
    if (gameSession && sessionStatus === 'playing') {
      const timer = gameSession.timer || timerConfig.timeLimit
      setTotalTime(timer)
      setTimeLeft(timer)
      setGameStarted(true)
    }
  }, [gameSession, sessionStatus, gameType, timerConfig])

  // Initialize answers array based on game type
  useEffect(() => {
    if (gameSession && currentAnswers.length === 0) {
      if (gameType === 'connections') {
        setCurrentAnswers([])
      } else {
        setCurrentAnswers(new Array(gameSession.questions.length).fill(null))
      }
    }
  }, [gameSession, gameType, currentAnswers.length])

  // Timer countdown effect - Simplified without warning logic
  useEffect(() => {
    if (!gameStarted || sessionStatus !== 'playing' || timeLeft <= 0) {
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1

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
  }, [gameStarted, sessionStatus, timeLeft])

  // Handle time up - auto submit current answers
  const handleTimeUp = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    toast({
      title: "Time's Up!",
      description: 'Your answers have been automatically submitted.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })

    submitGameAttempt(currentAnswers)
  }, [currentAnswers])

  // Handle answer selection
  const handleAnswer = useCallback(
    (answer, isCorrect = null) => {
      const newAnswers = [...currentAnswers]

      if (gameType === 'connections') {
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

  // UPDATED: Navigation handlers - restrict previous for quiz and true/false
  const handlePrevious = useCallback(() => {
    // UPDATED: Only allow previous navigation for word_weaver
    if (gameType === 'word_weaver' && currentQuestionIndex > 0) {
      dispatch(setCurrentQuestionIndex(currentQuestionIndex - 1))
    }
  }, [currentQuestionIndex, gameType, dispatch])

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < gameSession.questions.length - 1) {
      dispatch(setCurrentQuestionIndex(currentQuestionIndex + 1))
    }
  }, [currentQuestionIndex, gameSession, dispatch])

  // Submit game attempt - FIXED: Navigate to report route after submission
  const submitGameAttempt = useCallback(
    async (answers = currentAnswers) => {
      try {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }

        dispatch(setGameState('submitting'))
        setGameStarted(false)

        const timeTaken = totalTime - timeLeft

        const result = await submitGame({
          sessionId,
          userResponses: answers,
          timeTaken: Math.max(timeTaken, 0),
        })

        setResults(result)
        dispatch(setGameState('completed'))

        // FIXED: Simple history cleanup - remove game routes and go to report
        // ensureArticleInHistory(navigate, articleId)
        navigate(`/gamehub/${articleId}/report`, { replace: true })
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
      navigate,
      articleId,
    ],
  )

  // Handle back to menu
  const handleBackToMenu = useCallback(() => {
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
      isSubmitted: false,
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
            allQuestions={gameSession.questions}
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
          <Text fontSize="4xl">{config.emoji}</Text>
          <Text fontSize="lg" fontWeight="bold">
            Loading {config.title}...
          </Text>
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
          <Text fontSize="4xl">❌</Text>
          <Text fontSize="lg" fontWeight="bold">
            Failed to load game
          </Text>
          <Button onClick={() => window.location.reload()} colorScheme="red">
            Try Again
          </Button>
        </VStack>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      {/* Show GameSubmissionLoadingScreen when submitting */}
      <GameSubmissionLoadingScreen
        socket={getSocket()}
        gameType={gameType}
        isVisible={submitting}
      />

      {/* Only show the main interface when not submitting */}
      {!submitting && (
        <>
          {/* Compact Header */}
          <Box
            bg="rgba(0, 0, 0, 0.8)"
            backdropFilter="blur(10px)"
            borderBottom="1px solid rgba(255, 255, 255, 0.1)"
            position="sticky"
            top={0}
            zIndex={100}
          >
            <Container maxW="6xl">
              <Flex justify="space-between" align="center" py={3}>
                <Button
                  leftIcon={<ChevronLeft size={16} />}
                  onClick={handleBackToMenu}
                  variant="ghost"
                  size="sm"
                  color="gray.300"
                  fontSize="xs"
                >
                  {t('navigation.back')}
                </Button>

                <HStack spacing={2}>
                  <Text fontSize="sm">{config.emoji}</Text>
                  <Text fontSize="sm" fontWeight="bold" color={config.color}>
                    {t(`gameTypes.${gameType}`)}
                  </Text>
                </HStack>

                {gameStarted &&
                  sessionStatus === 'playing' &&
                  totalTime > 0 && (
                    <CompactTimer
                      timeLeft={timeLeft}
                      totalTime={totalTime}
                      gameType={gameType}
                      onTimeUp={handleTimeUp}
                    />
                  )}
              </Flex>
            </Container>
          </Box>

          {/* Game Content - Optimized for no scroll */}
          <Container maxW="4xl" py={4}>
            <AnimatePresence mode="wait">
              {sessionStatus === 'playing' && gameStarted && (
                <MotionBox
                  key={`${currentQuestionIndex}-${gameType}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <VStack spacing={4} minH="calc(100vh - 120px)">
                    {/* Game Interface */}
                    <Box flex={1} w="100%">
                      {renderGameInterface()}
                    </Box>

                    {/* Compact Navigation */}
                    <CompactNavigationControls
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
            </AnimatePresence>
          </Container>
        </>
      )}
    </Box>
  )
}

export default EnhancedGameInterface
