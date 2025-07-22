// components/gameHub/EnhancedGameInterface.jsx - Updated with exit warning integration
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from 'react'
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
import { useAbandonedGame } from '../../customHooks/useAbandonedGame'
import { useGameExitWarning } from '../../customHooks/useGameExitWarning'

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
import AbandonedGameScreen from './AbandonedGameScreen'
import GameExitWarningDialog from './GameExitWarningDialog'
import { useSocket } from '../../customHooks/useSocket'

const MotionBox = motion(Box)

// Game type configurations (static data)
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

// Compact Timer Component - Memoized for performance
const CompactTimer = memo(({ timeLeft, totalTime, gameType, onTimeUp }) => {
  const { t } = useTranslation('GameHub')
  const toast = useToast()

  const configWarningState = useMemo(() => {
    const gameTimerConfig = getGameTypeTimerConfig(gameType)
    if (timeLeft <= gameTimerConfig.criticalAt) return 'critical'
    if (timeLeft <= gameTimerConfig.warningAt) return 'warning'
    return 'normal'
  }, [timeLeft, gameType])

  const timerColor = useMemo(
    () => getTimerColor(timeLeft, totalTime),
    [timeLeft, totalTime],
  )

  const warningShownRef = useRef(false)
  const criticalShownRef = useRef(false)
  const previousTimeRef = useRef(timeLeft)

  useEffect(() => {
    if (timeLeft >= totalTime * 0.9) {
      warningShownRef.current = false
      criticalShownRef.current = false
    }
  }, [timeLeft, totalTime])

  useEffect(() => {
    const gameTimerConfig = getGameTypeTimerConfig(gameType)
    const previousTime = previousTimeRef.current
    previousTimeRef.current = timeLeft

    if (timeLeft >= previousTime) return

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
    } else if (
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
  }, [timeLeft, gameType, toast, t])

  return (
    <MotionBox
      animate={configWarningState === 'critical' ? { scale: [1, 1.08, 1] } : {}}
      transition={{
        duration: 0.6,
        repeat: configWarningState === 'critical' ? Infinity : 0,
      }}
    >
      <HStack spacing={3}>
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
})
CompactTimer.displayName = 'CompactTimer'

// Compact Navigation Controls - Memoized for performance
const CompactNavigationControls = memo(
  ({
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

          <VStack spacing={3} w="100%">
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
  },
)
CompactNavigationControls.displayName = 'CompactNavigationControls'

// Main Enhanced Game Interface
const EnhancedGameInterface = () => {
  const { articleId, gameType } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const toast = useToast()
  const { t } = useTranslation('GameHub')
  const timerRef = useRef(null)
  const { getSocket } = useSocket()

  const config = useMemo(
    () => gameTypeConfigs[gameType] || gameTypeConfigs.normal_quiz,
    [gameType],
  )

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
  const { submitGame, submitting } = useSubmitGame()
  const { sessionId, gameSession, sessionStatus, initializeGame } =
    useGameSession({
      articleId,
      gameType,
      language: i18n.language,
    })
  const {
    submittingAbandoned,
    abandonedInfo,
    handleAutoAbandon,
    checkSessionStatus,
    resetAbandonedState,
  } = useAbandonedGame()

  // Local state
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [currentAnswers, setCurrentAnswers] = useState([])
  const [gameStarted, setGameStarted] = useState(false)
  const [isAbandoned, setIsAbandoned] = useState(false)

  // Handle submit and exit for exit warning
  const handleSubmitAndExit = useCallback(
    async (answers, reason) => {
      navigate(-1)
      try {
        if (timerRef.current) clearInterval(timerRef.current)
        const timeTaken = totalTime - timeLeft
        await submitGame({
          sessionId,
          userResponses: answers,
          timeTaken: Math.max(timeTaken, 0),
        })
        navigate(`/gamehub/${articleId}/report`, { replace: true })
      } catch (error) {
        try {
          await handleAutoAbandon(sessionId, reason)
          navigate(`/gamehub/${articleId}/report`, { replace: true })
        } catch (abandonError) {
          navigate(`/gamehub/${articleId}`, { replace: true })
          throw new Error('Failed to save game progress')
        }
      }
    },
    [
      sessionId,
      totalTime,
      timeLeft,
      submitGame,
      navigate,
      articleId,
      handleAutoAbandon,
    ],
  )

  // Exit warning hook
  const {
    showExitWarning,
    exitReason,
    isSubmittingExit,
    currentProgress,
    handleStayInGame,
    handleConfirmExit,
    disableWarnings,
    resetWarningState,
    createNavigationWrapper,
  } = useGameExitWarning({
    isGameActive: gameStarted && sessionStatus === 'playing' && !isAbandoned,
    currentAnswers,
    gameSession,
    gameType,
    timeLeft,
    totalTime,
    onSubmitAndExit: handleSubmitAndExit,
    enableWarnings: true,
  })

  // Get timer configuration for current game type
  const timerConfig = useMemo(
    () => getGameTypeTimerConfig(gameType),
    [gameType],
  )

  // Check for abandoned session
  useEffect(() => {
    const checkForAbandonedSession = async () => {
      if (sessionId && sessionStatus === 'error') {
        try {
          const statusCheck = await checkSessionStatus(sessionId)
          if (statusCheck.shouldAbandon) {
            const abandonResult = await handleAutoAbandon(
              sessionId,
              statusCheck.abandonmentReason || 'session_expired',
            )
            setIsAbandoned(abandonResult.success || true)
          }
        } catch (error) {
          setIsAbandoned(true)
        }
      }
    }
    if (sessionStatus === 'error' && sessionId) {
      checkForAbandonedSession()
    }
  }, [sessionStatus, sessionId, checkSessionStatus, handleAutoAbandon])

  // Initialize game on mount
  useEffect(() => {
    if (articleId && gameType && !sessionId && !isAbandoned) {
      dispatch(resetGameSession())
      resetWarningState()
      dispatch(setCurrentGameType(gameType))
      dispatch(setGameState('loading'))
      initializeGame()
    }
  }, [
    articleId,
    gameType,
    sessionId,
    isAbandoned,
    dispatch,
    initializeGame,
    resetWarningState,
  ])

  // Set up timer
  useEffect(() => {
    if (gameSession && sessionStatus === 'playing') {
      const timer = gameSession.timer || timerConfig.timeLimit
      setTotalTime(timer)
      setTimeLeft(timer)
      setGameStarted(true)
    }
  }, [gameSession, sessionStatus, timerConfig])

  // Initialize answers array
  useEffect(() => {
    if (gameSession && currentAnswers.length === 0) {
      const initialAnswers =
        gameType === 'connections'
          ? []
          : new Array(gameSession.questions.length).fill(null)
      setCurrentAnswers(initialAnswers)
    }
  }, [gameSession, gameType, currentAnswers.length])

  // Submit game attempt
  const submitGameAttempt = useCallback(
    async (answers = currentAnswers) => {
      try {
        navigate(-1)
        if (timerRef.current) clearInterval(timerRef.current)
        disableWarnings()
        dispatch(setGameState('submitting'))
        setGameStarted(false)
        const timeTaken = totalTime - timeLeft
        await submitGame({
          sessionId,
          userResponses: answers,
          timeTaken: Math.max(timeTaken, 0),
        })
        dispatch(setGameState('completed'))
        navigate(`/gamehub/${articleId}/report`, { replace: true })
      } catch (error) {
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
      disableWarnings,
    ],
  )

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    disableWarnings()
    toast({
      title: "Time's Up!",
      description: 'Your answers have been automatically submitted.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
    submitGameAttempt()
  }, [disableWarnings, toast, submitGameAttempt])

  // Timer countdown effect
  useEffect(() => {
    if (!gameStarted || sessionStatus !== 'playing' || timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          handleTimeUp()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [gameStarted, sessionStatus, timeLeft, handleTimeUp])

  // Handle answer selection
  const handleAnswer = useCallback(
    (answer, isCorrect = null) => {
      setCurrentAnswers(prevAnswers => {
        const newAnswers = [...prevAnswers]
        if (gameType === 'connections') {
          dispatch(setSelectedAnswers(answer))
          return answer
        } else if (gameType === 'word_weaver') {
          newAnswers[currentQuestionIndex] = { answer, isCorrect }
        } else {
          newAnswers[currentQuestionIndex] = answer
        }
        dispatch(setSelectedAnswers(newAnswers))
        return newAnswers
      })
    },
    [currentQuestionIndex, gameType, dispatch],
  )

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    if (gameType === 'word_weaver' && currentQuestionIndex > 0) {
      dispatch(setCurrentQuestionIndex(currentQuestionIndex - 1))
    }
  }, [currentQuestionIndex, gameType, dispatch])

  const handleNext = useCallback(() => {
    if (
      gameSession &&
      currentQuestionIndex < gameSession.questions.length - 1
    ) {
      dispatch(setCurrentQuestionIndex(currentQuestionIndex + 1))
    }
  }, [currentQuestionIndex, gameSession, dispatch])

  // Handle back to menu (wrapped with exit warning)
  const handleBackToMenu = useCallback(
    createNavigationWrapper(() => {
      if (timerRef.current) clearInterval(timerRef.current)
      dispatch(resetGameSession())
      navigate(`/gamehub/${articleId}`)
    }),
    [createNavigationWrapper, dispatch, navigate, articleId],
  )

  // Handle retry from abandoned screen
  const handleRetryGame = useCallback(() => {
    resetAbandonedState()
    setIsAbandoned(false)
    dispatch(resetGameSession())
    resetWarningState()
    navigate(`/gamehub/${articleId}/${gameType}`, { replace: true })
  }, [
    resetAbandonedState,
    dispatch,
    navigate,
    articleId,
    gameType,
    resetWarningState,
  ])

  // Get current question for rendering
  const getCurrentQuestion = useCallback(() => {
    if (!gameSession?.questions) return null
    const currentQ =
      gameType === 'connections'
        ? gameSession.questions[0]
        : gameSession.questions[currentQuestionIndex]
    if (!currentQ) return null
    if (gameType === 'normal_quiz' && currentQ.options) {
      const safeOptions = {}
      Object.entries(currentQ.options).forEach(([key, value]) => {
        safeOptions[key] =
          typeof value === 'object' && value?.text ? value.text : String(value)
      })
      return { ...currentQ, options: safeOptions }
    }
    return currentQ
  }, [gameSession, gameType, currentQuestionIndex])

  // Derived states
  const hasCurrentAnswer = useMemo(() => {
    if (gameType === 'connections') return currentAnswers?.length > 0
    const current = currentAnswers[currentQuestionIndex]
    return current !== null && current !== undefined && current !== ''
  }, [currentAnswers, currentQuestionIndex, gameType])

  const canNavigateNext = useMemo(
    () =>
      hasCurrentAnswer &&
      gameSession &&
      currentQuestionIndex < gameSession.questions.length - 1,
    [hasCurrentAnswer, currentQuestionIndex, gameSession],
  )

  const canSubmit = useMemo(
    () =>
      gameType === 'connections'
        ? currentAnswers?.length > 0
        : hasCurrentAnswer,
    [gameType, currentAnswers, hasCurrentAnswer],
  )

  // Render game interface
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

  // Show abandoned game screen
  if (isAbandoned || (sessionStatus === 'error' && abandonedInfo)) {
    return (
      <AbandonedGameScreen
        abandonmentInfo={abandonedInfo}
        articleId={articleId}
        onRetryGame={handleRetryGame}
        showRetry={true}
        isSubmitting={submittingAbandoned}
      />
    )
  }

  // Loading states
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
  if (sessionStatus === 'error' && submittingAbandoned) {
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
          <Text fontSize="4xl">⏳</Text>
          <Text fontSize="lg" fontWeight="bold">
            Processing abandoned game...
          </Text>
          <Text fontSize="md" color="gray.400">
            Please wait while we save your attempt
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <GameExitWarningDialog
        isOpen={showExitWarning}
        onClose={handleStayInGame}
        onConfirmExit={handleConfirmExit}
        onStayInGame={handleStayInGame}
        gameType={gameType}
        currentProgress={currentProgress}
        timeLeft={timeLeft}
        totalTime={totalTime}
        isSubmitting={isSubmittingExit}
        exitReason={exitReason}
      />
      <GameSubmissionLoadingScreen
        socket={getSocket()}
        gameType={gameType}
        isVisible={submitting || isSubmittingExit}
      />

      {!submitting && !isSubmittingExit && (
        <>
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
                    <Box flex={1} w="100%">
                      {renderGameInterface()}
                    </Box>
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
