// components/screens/QuickClashSession.jsx
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react'
import {
  Container,
  VStack,
  Spinner,
  Center,
  useToast,
  useDisclosure,
  Box,
  Flex,
  Text,
  Badge,
  Icon,
  HStack,
  Progress,
} from '@chakra-ui/react'
import { useParams, useNavigate, useBeforeUnload } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Clock, AlertTriangle } from 'lucide-react'
import axios from 'axios'

// Component imports
import QuickClashError from '../components/quickClashComponents/QuickClashError'
import ResultsModal from '../components/quickClashComponents/ResultsModal'
import ConfirmationDialog from '../components/quickClashComponents/ConfirmationDialog'
import { useSelector } from 'react-redux'
import useQuickClash from '../customHooks/useQuickClash'
import useQuickClashSocket from '../customHooks/useQuickClashSocket'

// Lazy-loaded components
const ReadingPhase = lazy(() =>
  import('../components/quickClashComponents/ReadingPhase'),
)
const QuizInstructions = lazy(() =>
  import('../components/quickClashComponents/QuizInstructions'),
)
const QuickClashQuiz = lazy(() =>
  import('../components/quickClashComponents/QuickClashQuiz'),
)

const MotionBadge = motion(Badge)

const QuickClashSession = () => {
  const { t } = useTranslation('QuickClash')
  const { challengeId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useSelector(state => state.auth)
  const {
    startSession,
    setActiveChallenge,
    endSession,
    currentSession: session,
    sessionLoading,
    sessionError: reduxSessionError,
  } = useQuickClash()
  const { emitChallengeCompleted } = useQuickClashSocket()

  // State management
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [phase, setPhase] = useState('loading') // loading, reading, instruction, quiz, completed
  const [challenge, setChallenge] = useState(null)
  const [article, setArticle] = useState(null)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes for reading
  const [quizTimeLeft, setQuizTimeLeft] = useState(50) // 50 seconds for quiz
  const [stopTimerOnQuizSubmit, setStopTimerOnQuizSubmit] = useState(false)
  const [score, setScore] = useState(0)
  const [phaseProgress, setPhaseProgress] = useState(0)

  // Results modal control
  const {
    isOpen: isResultsOpen,
    onOpen: openResults,
    onClose: closeResults,
  } = useDisclosure()

  // Confirmation dialog for navigation
  const {
    isOpen: isConfirmDialogOpen,
    onOpen: openConfirmDialog,
    onClose: closeConfirmDialog,
  } = useDisclosure()

  // Quiz start time reference
  const quizStartTimeRef = useRef(null)
  const readingStartTimeRef = useRef(null)

  // Flag to skip confirmation when intentionally navigating away
  const skipConfirmRef = useRef(false)
  const initSession = async () => {
    try {
      setLoading(true)

      // First get the challenge details
      const challengeResponse = await axios.get(
        `/api/quickClash/challenge/${challengeId}`,
      )
      const challenge = challengeResponse.data.challenge
      setChallenge(challenge)
      setActiveChallenge(challenge)

      // Start the session using our Redux action
      const currentSession = await startSession(
        challengeId,
        user?.userLanguage || 'en',
      )

      // Initialize article data
      setArticle(
        user?.userLanguage === 'en' || !user?.userLanguage
          ? {
              title: challenge.article.title.english,
              content: challenge.article.content.english,
              importantSentences: challenge.article.englishImportantSentences,
              dictionary: challenge.article.englishDictionary,
            }
          : {
              title: challenge.article.title.hindi,
              content: challenge.article.content.hindi,
              importantSentences: challenge.article.hindiImportantSentences,
              dictionary: challenge.article.hindiDictionary,
            },
      )

      // Start reading phase
      await axios.post(
        `/api/quickClash/session/${currentSession._id}/reading/start`,
      )

      setPhase('reading')
      setTimeLeft(120) // 2 minutes
      readingStartTimeRef.current = Date.now()
      setError(null)
    } catch (err) {
      console.error('Error initializing session:', err)
      setError(
        err.response?.data?.message ||
          reduxSessionError ||
          'Failed to initialize challenge session',
      )
    } finally {
      setLoading(false)
    }
  }
  // Initialize session
  useEffect(() => {
    if (!loading && !sessionLoading && !session) {
      initSession()
    }

    // If session was loaded from Redux, we can update UI
    if (session && loading) {
      setLoading(false)
    }
  }, [challengeId, user?.userLanguage, session, sessionLoading])
  useEffect(() => {
    return () => {
      endSession()
    }
  }, [])

  useEffect(() => {
    if (reduxSessionError) {
      setError(reduxSessionError)
    }
  }, [reduxSessionError])

  // Reading timer
  useEffect(() => {
    if (phase !== 'reading' || !session) return

    const timer = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - readingStartTimeRef.current) / 1000,
      )
      const remaining = Math.max(0, 120 - elapsed)
      setTimeLeft(remaining)

      // Calculate progress percentage (inverted - 0% at start, 100% at end)
      setPhaseProgress(Math.min(100, (elapsed / 120) * 100))

      if (remaining <= 0) {
        clearInterval(timer)
        handleReadingComplete()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [phase, session])

  // Quiz timer
  useEffect(() => {
    if (phase !== 'quiz' || !quizStartTimeRef.current) return

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - quizStartTimeRef.current) / 1000)
      const remaining = Math.max(0, 50 - elapsed)
      setQuizTimeLeft(remaining)

      // Calculate progress percentage (inverted - 0% at start, 100% at end)
      setPhaseProgress(Math.min(100, (elapsed / 50) * 100))

      if (remaining <= 0 || stopTimerOnQuizSubmit) {
        clearInterval(timer)
        // The QuickClashQuiz component will handle auto-submission
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [phase, quizStartTimeRef.current, stopTimerOnQuizSubmit])

  // Handle reading phase completion
  const handleReadingComplete = async () => {
    try {
      await axios.post(
        `/api/quickClash/session/${session._id}/reading/complete`,
      )
      setPhase('instruction')
      setPhaseProgress(0)
    } catch (error) {
      console.error('Error completing reading phase:', error)
      toast({
        title: t('Error'),
        description:
          error.response?.data?.message ||
          t('Failed to complete reading phase'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Start the quiz phase after instructions
  const handleStartQuiz = () => {
    quizStartTimeRef.current = Date.now()
    setPhase('quiz')
    setPhaseProgress(0)
  }

  // Handle quiz completion
  const handleQuizComplete = result => {
    setScore(result.RQM_score)
    setPhase('completed')
    openResults()

    // If challenge exists, emit completion event
    if (challenge && challenge.opponent) {
      emitChallengeCompleted({
        opponentId: challenge.opponent._id,
        challengeId: challenge._id,
        score: result.RQM_score,
      })
    }
  }

  // Handle browser's back button and page refresh attempts
  useBeforeUnload(event => {
    // Only show native browser warning if in an active phase
    if (phase === 'reading' || phase === 'instruction' || phase === 'quiz') {
      event.preventDefault()
      // Browser standard requires us to set returnValue
      event.returnValue = ''
      return ''
    }
  })

  // Handle browser back button
  useEffect(() => {
    const handlePopState = e => {
      if (phase === 'reading' || phase === 'instruction' || phase === 'quiz') {
        // Prevent the default action
        e.preventDefault()
        // Show our custom dialog
        openConfirmDialog()
        // Push a new state so the user stays on the page
        window.history.pushState(null, document.title, window.location.href)
      }
    }

    // Listen for popstate events (back button)
    window.addEventListener('popstate', handlePopState)

    // Push a state on mount so we have something to go back to
    window.history.pushState(null, document.title, window.location.href)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [phase, openConfirmDialog])

  // Function for confirmed navigation
  const confirmNavigation = () => {
    skipConfirmRef.current = true
    navigate('/quickclash')
  }

  // Format time display
  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Get the current active timer
  const getCurrentTimer = () => {
    switch (phase) {
      case 'reading':
        return timeLeft
      case 'quiz':
        return quizTimeLeft
      default:
        return null
    }
  }

  // Get phase-specific information
  const getPhaseInfo = () => {
    switch (phase) {
      case 'reading':
        return {
          label: t('Reading Phase'),
          totalTime: 120,
          currentTime: timeLeft,
          colorScheme: timeLeft <= 30 ? 'red' : 'blue',
        }
      case 'instruction':
        return {
          label: t('Instructions'),
          totalTime: null,
          currentTime: null,
          colorScheme: 'purple',
        }
      case 'quiz':
        return {
          label: t('Quiz Phase'),
          totalTime: 50,
          currentTime: quizTimeLeft,
          colorScheme: quizTimeLeft <= 10 ? 'red' : 'green',
        }
      case 'completed':
        return {
          label: t('Completed'),
          totalTime: null,
          currentTime: null,
          colorScheme: 'purple',
        }
      default:
        return {
          label: t('Loading'),
          totalTime: null,
          currentTime: null,
          colorScheme: 'gray',
        }
    }
  }

  // Persistent timer header component
  const TimerHeader = () => {
    const phaseInfo = getPhaseInfo()
    const timer = getCurrentTimer()

    // Animation for time running out
    const isAttention =
      (phase === 'reading' && timeLeft <= 30) ||
      (phase === 'quiz' && quizTimeLeft <= 10)

    return (
      <Box
        position="sticky"
        top={0}
        zIndex={100}
        w="100%"
        bg="rgba(13, 10, 20, 0.9)"
        backdropFilter="blur(8px)"
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        py={3}
        px={4}
      >
        <VStack spacing={2} w="100%">
          <Flex w="100%" justify="space-between" align="center">
            <Badge colorScheme="purple" p={2} borderRadius="md" fontSize="sm">
              {challenge?.category || t('Quick Clash')}
            </Badge>

            <HStack>
              <Badge colorScheme="purple">{phaseInfo.label}</Badge>

              {timer !== null && (
                <MotionBadge
                  colorScheme={phaseInfo.colorScheme}
                  p={2}
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  gap={1}
                  fontSize="md"
                  animate={
                    isAttention
                      ? {
                          scale: [1, 1.1, 1],
                          transition: {
                            duration: 0.8,
                            repeat: Infinity,
                            repeatType: 'reverse',
                          },
                        }
                      : {}
                  }
                  boxShadow={
                    isAttention
                      ? `0 0 8px var(--chakra-colors-${phaseInfo.colorScheme}-500)`
                      : 'none'
                  }
                >
                  <Icon as={Clock} />
                  <Text>{formatTime(timer)}</Text>
                </MotionBadge>
              )}
            </HStack>
          </Flex>

          {(phase === 'reading' || phase === 'quiz') && (
            <Progress
              value={phaseProgress}
              size="xs"
              w="100%"
              colorScheme={phaseInfo.colorScheme}
              borderRadius="full"
            />
          )}
        </VStack>
      </Box>
    )
  }

  // Render based on current state
  if (loading) {
    return (
      <Center h="100vh" bg="rgba(13, 10, 20, 0.98)">
        <VStack spacing={6}>
          <Spinner
            size="xl"
            thickness="4px"
            color="purple.500"
            emptyColor="whiteAlpha.200"
            speed="0.8s"
          />
          <Text color="whiteAlpha.800">{t('Preparing your challenge...')}</Text>
        </VStack>
      </Center>
    )
  }

  if (error) {
    return <QuickClashError error={error} onBackClick={confirmNavigation} />
  }

  return (
    <Box minH="100vh" bg="rgba(13, 10, 20, 0.98)">
      <TimerHeader />

      <Container maxW="container.lg" py={4} px={{ base: 2, md: 4 }}>
        <VStack spacing={6} align="stretch">
          {phase === 'reading' && article && (
            <Suspense
              fallback={
                <Center py={10}>
                  <Spinner size="xl" color="purple.500" />
                </Center>
              }
            >
              <ReadingPhase
                category={challenge?.category}
                article={article}
                timeLeft={timeLeft}
                onComplete={handleReadingComplete}
              />
            </Suspense>
          )}

          {phase === 'instruction' && (
            <Suspense
              fallback={
                <Center py={10}>
                  <Spinner size="xl" color="purple.500" />
                </Center>
              }
            >
              <QuizInstructions onStart={handleStartQuiz} />
            </Suspense>
          )}

          {phase === 'quiz' && session && (
            <Suspense
              fallback={
                <Center py={10}>
                  <Spinner size="xl" color="purple.500" />
                </Center>
              }
            >
              <QuickClashQuiz
                sessionId={session._id}
                onComplete={handleQuizComplete}
                setStopTimerOnQuizSubmit={setStopTimerOnQuizSubmit}
                quizTimeLeft={quizTimeLeft}
                setQuizTimeLeft={setQuizTimeLeft}
              />
            </Suspense>
          )}

          <ResultsModal
            isOpen={isResultsOpen}
            onClose={closeResults}
            score={score}
            navigateToList={confirmNavigation}
          />

          {/* Navigation Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={isConfirmDialogOpen}
            onClose={closeConfirmDialog}
            onConfirm={confirmNavigation}
            title={t('Exit Challenge?')}
            message={t(
              'Your progress in this challenge will be lost. Are you sure you want to leave?',
            )}
            confirmText={t('Leave Challenge')}
            cancelText={t('Continue Challenge')}
            isDangerous={true}
          />
        </VStack>
      </Container>
    </Box>
  )
}

export default QuickClashSession
