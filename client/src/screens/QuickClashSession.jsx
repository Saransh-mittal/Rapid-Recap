import React, {
  useState,
  useEffect,
  useRef,
  lazy,
  Suspense,
  useCallback,
  useMemo,
  memo,
} from 'react'
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
  HStack,
  Progress,
} from '@chakra-ui/react'
import { useParams, useNavigate, useBeforeUnload } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import axios from 'axios'

// Component imports
import QuickClashError from '../components/quickClashComponents/QuickClashError'
import ResultsModal from '../components/quickClashComponents/ResultsModal'
import ConfirmationDialog from '../components/quickClashComponents/ConfirmationDialog'
import { useDispatch, useSelector } from 'react-redux'
import useQuickClash from '../customHooks/useQuickClash'
import useDailyTasks from '../customHooks/useDailyTasks'

// Category Icon and Utils
import { getCategoryInfo } from '../components/quickClashComponents/team/teamBattlePageComponents/categoriesSection/categoryUtils'
import CategoryIcon from '../components/quickClashComponents/team/teamBattlePageComponents/categoriesSection/CategoryIcon'
import { fetchActiveChallenges } from '../redux/quickClashSlice'

// Lazy-loaded components with loading fallbacks
const ReadingPhase = lazy(() =>
  import('../components/quickClashComponents/ReadingPhase'),
)

const QuickClashQuiz = lazy(() =>
  import('../components/quickClashComponents/QuickClashQuiz'),
)

// Memoized loading fallback component
const LoadingFallback = memo(() => (
  <Center py={10}>
    <Spinner size="xl" color="purple.500" />
  </Center>
))
LoadingFallback.displayName = 'LoadingFallback'

// Memoized TimerHeader component for better performance
const TimerHeader = memo(
  ({ phase, challenge, timeLeft, quizTimeLeft, phaseProgress, t }) => {
    // Memoize phase info calculation
    const phaseInfo = useMemo(() => {
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
    }, [phase, timeLeft, quizTimeLeft, t])

    const categoryInfo = useMemo(() => {
      return challenge?.category ? getCategoryInfo(challenge.category) : null
    }, [challenge?.category])

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
                p={categoryInfo ? 1.5 : 2}
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
  },
)
TimerHeader.displayName = 'TimerHeader'

// Main component with optimization but preserved logic
const QuickClashSession = () => {
  const { t } = useTranslation('QuickClash')
  const { t: catTranslate } = useTranslation('categories')
  const { challengeId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const dispatch = useDispatch()

  // Memoize selectors
  const { user } = useSelector(state => state.auth)

  // Custom hooks
  const {
    startSession,
    setActiveChallenge,
    endSession,
    currentSession: session,
    sessionError: reduxSessionError,
  } = useQuickClash()

  const { trackChallengeCompletion } = useDailyTasks()
  const params = useParams()

  // ORIGINAL STATE STRUCTURE - PRESERVED
  const [phase, setPhase] = useState('loading') //  loading, reading, quiz, completed
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [challenge, setChallenge] = useState(null)
  const [article, setArticle] = useState(null)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes for reading
  const [quizTimeLeft, setQuizTimeLeft] = useState(50) // 50 seconds for quiz
  const [score, setScore] = useState(0)
  const [phaseProgress, setPhaseProgress] = useState(0)
  const [completeReadingLoading, setCompleteReadingLoading] = useState(false)

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

  const readingStartTimeRef = useRef(null)

  // ORIGINAL INITIALIZATION LOGIC - PRESERVED
  const initSession = useCallback(async () => {
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
  }, [
    challengeId,
    user?.userLanguage,
    setActiveChallenge,
    startSession,
    reduxSessionError,
  ])

  // ORIGINAL READING COMPLETION LOGIC - PRESERVED
  const handleReadingComplete = useCallback(async () => {
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
  }, [session?._id, toast, t])

  // ORIGINAL QUIZ COMPLETION LOGIC - PRESERVED
  const handleQuizComplete = useCallback(
    result => {
      setScore(result.RQM_score)
      setPhase('completed')
      openResults()
      dispatch(fetchActiveChallenges())

      trackChallengeCompletion({
        score: result.RQM_score,
        fromMatchmaking: challenge?.fromMatchmaking || false,
        readingTime: 120 - timeLeft, // Convert remaining time to spent time
        category: challenge?.category,
        challengeId: challenge?._id,
      })
    },
    [openResults, dispatch, trackChallengeCompletion, challenge, timeLeft],
  )

  // ORIGINAL NAVIGATION LOGIC - PRESERVED
  const confirmNavigation = useCallback(() => {
    // Mark QuickClash for refresh when we return to it
    if (typeof window.markQuickClashForRefresh === 'function') {
      window.markQuickClashForRefresh()
    }

    // Navigate to appropriate screen
    if (challenge?.fromTeamBattle) {
      navigate(`/quickclash/teamBattle/${challenge.teamBattle.toString()}`)
    } else {
      navigate('/quickclash')

      // Additional fallback: trigger immediate refresh if function is available
      setTimeout(() => {
        if (typeof window.refreshQuickClashChallenges === 'function') {
          window.refreshQuickClashChallenges()
        }
      }, 100)
    }
  }, [challenge, navigate])

  // Effect for redux error handling
  useEffect(() => {
    if (reduxSessionError) {
      setError(reduxSessionError)
    }
  }, [reduxSessionError])

  // Effect for session initialization
  useEffect(() => {
    initSession()
    return () => {
      endSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Effect for authorization check
  useEffect(() => {
    const challengeId = params.challengeId
    const storedAssignment = localStorage.getItem(`challenge_${challengeId}`)

    if (storedAssignment) {
      const assignment = JSON.parse(storedAssignment)

      if (
        assignment.userId !== user._id ||
        Date.now() - assignment.timestamp > 30 * 60 * 1000
      ) {
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

  // ORIGINAL READING TIMER LOGIC - PRESERVED
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

  // ORIGINAL BROWSER NAVIGATION PREVENTION - PRESERVED
  useBeforeUnload(
    useCallback(
      event => {
        // Only show native browser warning if in an active phase
        if (phase === 'reading' || phase === 'loading' || phase === 'quiz') {
          event.preventDefault()
          // Browser standard requires us to set returnValue
          event.returnValue = ''
          return ''
        }
      },
      [phase],
    ),
  )

  // ORIGINAL BROWSER BACK BUTTON HANDLING - PRESERVED
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

  // Memoized loading screen
  const loadingScreen = useMemo(
    () => (
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
    ),
    [t],
  )

  // Early return for error state
  if (error) {
    return <QuickClashError error={error} onBackClick={confirmNavigation} />
  }

  return (
    <Box minH="100vh" bg="rgba(13, 10, 20, 0.98)">
      <TimerHeader
        phase={phase}
        challenge={challenge}
        timeLeft={timeLeft}
        quizTimeLeft={quizTimeLeft}
        phaseProgress={phaseProgress}
        t={t}
      />

      <Container maxW="container.lg" py={4} px={{ base: 2, md: 4 }}>
        <VStack spacing={6} align="stretch">
          {phase === 'loading' && loadingScreen}

          {phase === 'reading' && article && (
            <Suspense fallback={<LoadingFallback />}>
              <ReadingPhase
                category={catTranslate(challenge?.category)}
                article={article}
                timeLeft={timeLeft}
                onComplete={handleReadingComplete}
                completeReadingLoading={completeReadingLoading}
              />
            </Suspense>
          )}

          {phase === 'quiz' && session && (
            <Suspense fallback={<LoadingFallback />}>
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

export default memo(QuickClashSession)
