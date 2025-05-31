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
  // Icon, // Icon from chakra-ui is not explicitly used for lucide-react icons in CategoryIcon
  HStack,
  Progress,
} from '@chakra-ui/react'
import { useParams, useNavigate, useBeforeUnload } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
// import { Clock, AlertTriangle } from 'lucide-react'; // Not directly used in this file after changes
import axios from 'axios'

// Component imports
import QuickClashError from '../components/quickClashComponents/QuickClashError'
import ResultsModal from '../components/quickClashComponents/ResultsModal'
import ConfirmationDialog from '../components/quickClashComponents/ConfirmationDialog'
import { useSelector } from 'react-redux'
import useQuickClash from '../customHooks/useQuickClash'
import useQuickClashSocket from '../customHooks/useQuickClashSocket'
import useDailyTasks from '../customHooks/useDailyTasks'

// Category Icon and Utils
import { getCategoryInfo } from '../components/quickClashComponents/team/teamBattlePageComponents/categoriesSection/categoryUtils'
import CategoryIcon from '../components/quickClashComponents/team/teamBattlePageComponents/categoriesSection/CategoryIcon'

// Lazy-loaded components
const ReadingPhase = lazy(() =>
  import('../components/quickClashComponents/ReadingPhase'),
)

const QuickClashQuiz = lazy(() =>
  import('../components/quickClashComponents/QuickClashQuiz'),
)

// const MotionBadge = motion(Badge) // Not used in the final code

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
    // sessionLoading, // Not directly used, loading state is managed locally
    sessionError: reduxSessionError,
  } = useQuickClash()
  const { emitChallengeCompleted } = useQuickClashSocket()
  const { trackChallengeCompletion } = useDailyTasks()
  const params = useParams()

  // State management
  const [phase, setPhase] = useState('loading') //  loading, reading, quiz, completed
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [challenge, setChallenge] = useState(null)
  const [article, setArticle] = useState(null)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes for reading
  const [quizTimeLeft, setQuizTimeLeft] = useState(50) // 50 seconds for quiz
  // const [stopTimerOnQuizSubmit, setStopTimerOnQuizSubmit] = useState(false); // Prop for QuickClashQuiz but not used in this file
  const [score, setScore] = useState(0)
  const [phaseProgress, setPhaseProgress] = useState(0)
  const [completeReadingLoading, setCompleteReadingLoading] = useState(false)

  // New state to track if quiz content is ready
  // const [quizContentReady, setQuizContentReady] = useState(false); // Prop for QuickClashQuiz but not used in this file

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
  // const quizStartTimeRef = useRef(null); // Not used
  const readingStartTimeRef = useRef(null)

  // Flag to skip confirmation when intentionally navigating away
  // const skipConfirmRef = useRef(false); // Not used

  const initSession = async () => {
    try {
      setLoading(true)
      setPhase('loading')

      // First get the challenge details
      const challengeResponse = await axios.get(
        `/api/quickClash/challenge/${challengeId}`,
      )
      const fetchedChallenge = challengeResponse.data.challenge
      setChallenge(fetchedChallenge)
      setActiveChallenge(fetchedChallenge)

      // Start the session using our Redux action
      const currentSession = await startSession(
        challengeId,
        user?.userLanguage || 'en',
      )

      // Initialize article data
      setArticle(
        user?.userLanguage === 'en' || !user?.userLanguage
          ? {
              title: fetchedChallenge.article.title.english,
              content: fetchedChallenge.article.content.english,
              importantSentences:
                fetchedChallenge.article.englishImportantSentences,
              dictionary: fetchedChallenge.article.englishDictionary,
            }
          : {
              title: fetchedChallenge.article.title.hindi,
              content: fetchedChallenge.article.content.hindi,
              importantSentences:
                fetchedChallenge.article.hindiImportantSentences,
              dictionary: fetchedChallenge.article.hindiDictionary,
            },
      )

      // Move to reading phase after loading
      setPhase('reading')
      readingStartTimeRef.current = Date.now()

      // Start reading phase on the server
      await axios.post(
        `/api/quickClash/session/${currentSession._id}/reading/start`,
      )

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

  useEffect(() => {
    if (reduxSessionError) {
      setError(reduxSessionError)
    }
  }, [reduxSessionError])

  useEffect(() => {
    initSession()
    return () => {
      endSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, session])

  // Add this useEffect early in the component
  useEffect(() => {
    const challengeId = params.challengeId // Get from useParams()
    const storedAssignment = localStorage.getItem(`challenge_${challengeId}`)

    if (storedAssignment) {
      const assignment = JSON.parse(storedAssignment)

      // Check if this is the same user and within reasonable timeframe (30 minutes)
      if (
        assignment.userId !== user._id ||
        Date.now() - assignment.timestamp > 30 * 60 * 1000
      ) {
        // Unauthorized access attempt
        navigate('/quickclash')
        toast({
          title: 'Unauthorized Access',
          description: 'You are not authorized to access this challenge',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return
      }
    }
  }, [params.challengeId, user._id, navigate, toast])

  // Handle reading phase completion
  const handleReadingComplete = async () => {
    setCompleteReadingLoading(true)
    try {
      await axios.post(
        `/api/quickClash/session/${session._id}/reading/complete`,
      )
      // Go directly to quiz phase after reading is complete
      setPhase('quiz')
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
    } finally {
      setCompleteReadingLoading(false)
    }
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

    trackChallengeCompletion({
      score: result.RQM_score,
      fromMatchmaking: challenge?.fromMatchmaking || false,
      readingTime: 120 - timeLeft, // Convert remaining time to spent time
      category: challenge?.category,
      challengeId: challenge?._id,
    })
  }

  // Handle browser's back button and page refresh attempts
  useBeforeUnload(event => {
    // Only show native browser warning if in an active phase
    if (phase === 'reading' || phase === 'loading' || phase === 'quiz') {
      event.preventDefault()
      // Browser standard requires us to set returnValue
      event.returnValue = ''
      return ''
    }
  })

  // Handle browser back button
  useEffect(() => {
    const handlePopState = e => {
      if (phase === 'reading' || phase === 'loading' || phase === 'quiz') {
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
    // skipConfirmRef.current = true; // Not strictly needed if we always navigate
    if (challenge?.fromTeamBattle)
      navigate(`/quickclash/teamBattle/${challenge.teamBattle.toString()}`)
    else navigate('/quickclash')
  }

  // Format time display
  // const formatTime = seconds => { // Not used in this file directly
  //   const minutes = Math.floor(seconds / 60)
  //   const remainingSeconds = seconds % 60
  //   return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  // }

  // Get phase-specific information
  const getPhaseInfo = () => {
    switch (phase) {
      case 'loading':
        return {
          label: t('Loading'),
          totalTime: null,
          currentTime: null,
          colorScheme: 'gray',
        }
      case 'reading':
        return {
          label: t('Reading Phase'),
          totalTime: 120,
          currentTime: timeLeft,
          colorScheme: timeLeft <= 30 ? 'red' : 'blue',
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
    const categoryInfo = challenge?.category
      ? getCategoryInfo(challenge.category)
      : null

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
          <Flex w="100%" justifyContent="space-between" align="center">
            <HStack spacing={2}>
              {categoryInfo && challenge?.category && (
                <CategoryIcon categoryInfo={categoryInfo} />
              )}
              <Badge
                colorScheme="purple"
                p={categoryInfo ? 1.5 : 2} // Adjust padding if icon is present
                borderRadius="md"
                fontSize="sm"
              >
                {challenge?.category || t('Quick Clash')}
              </Badge>
            </HStack>

            <HStack>
              {phase === 'quiz' && phaseInfo.currentTime !== null && (
                <Badge
                  colorScheme={phaseInfo.colorScheme}
                  p={2}
                  borderRadius="md"
                  fontSize="sm"
                >
                  {Math.floor(phaseInfo.currentTime / 60)}:
                  {(phaseInfo.currentTime % 60).toString().padStart(2, '0')}
                </Badge>
              )}
            </HStack>
          </Flex>

          {(phase === 'reading' || phase === 'quiz') && (
            <Progress
              value={
                phase === 'reading'
                  ? phaseProgress
                  : ((phaseInfo.totalTime - phaseInfo.currentTime) /
                      phaseInfo.totalTime) *
                    100
              }
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

  // Loading screen during session initialization
  const renderLoadingScreen = () => (
    <Center h="60vh">
      <VStack spacing={6}>
        <Spinner
          size="xl"
          thickness="4px"
          color="purple.500"
          emptyColor="whiteAlpha.200"
          speed="0.8s"
        />
        <Text color="whiteAlpha.800">
          {t('Preparing reading materials...')}
        </Text>
      </VStack>
    </Center>
  )

  // If there's an error at any point
  if (error) {
    return <QuickClashError error={error} onBackClick={confirmNavigation} />
  }

  return (
    <Box minH="100vh" bg="rgba(13, 10, 20, 0.98)">
      <TimerHeader />

      <Container maxW="container.lg" py={4} px={{ base: 2, md: 4 }}>
        <VStack spacing={6} align="stretch">
          {phase === 'loading' && renderLoadingScreen()}

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
                completeReadingLoading={completeReadingLoading}
              />
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
                setStopTimerOnQuizSubmit={() => {}} // Placeholder, original prop was setStopTimerOnQuizSubmit
                quizTimeLeft={quizTimeLeft}
                setQuizTimeLeft={setQuizTimeLeft}
                setLoadingQuiz={() => {}} // Placeholder, original prop was setQuizContentReady
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
