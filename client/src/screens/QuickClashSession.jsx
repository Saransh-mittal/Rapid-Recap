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
  import('../components/quickClashComponents/legacy/ReadingPhase'),
)

// NEW: Forge Mode Component
const ForgeReadingPhase = lazy(() =>
  import('../components/quickClashComponents/forge/ForgeReadingPhase'),
)

const QuickClashQuiz = lazy(() =>
  import('../components/quickClashComponents/QuickClashQuiz'),
)

const GamifiedQuiz = lazy(() =>
  import('../components/quizComponents/GamifiedQuiz'),
)

const BettingScreen = lazy(() =>
  import('../components/quickClashComponents/BettingScreen'),
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
    // Check if this is forge mode (don't show reading timer for forge)
    const isForgeMode = challenge?.forgeArticle
    const showReadingTimer = phase === 'reading' && !isForgeMode

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
            label: isForgeMode ? t('Forge Mode') : t('Reading Phase'),
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
    }, [phase, timeLeft, quizTimeLeft, t, isForgeMode])

    const categoryInfo = useMemo(() => {
      return challenge?.category ? getCategoryInfo(challenge.category) : null
    }, [challenge?.category])

    return (
      <Box
        top={0}
        zIndex={100}
        w="100%"
        bg={isForgeMode ? 'transparent' : 'rgba(13, 10, 20, 0.9)'}
        backdropFilter={isForgeMode ? 'none' : 'blur(8px)'}
        borderBottom={isForgeMode ? 'none' : '1px solid'}
        borderColor="whiteAlpha.100"
        py={3}
        px={4}
        position={isForgeMode ? 'absolute' : 'sticky'}
      >
        <VStack spacing={2} w="100%">
          <Flex w="100%" justifyContent="space-between" align="center">
            <HStack spacing={2}>
              {categoryInfo && challenge?.category && (
                <CategoryIcon categoryInfo={categoryInfo} />
              )}
              <Badge
                colorScheme={isForgeMode ? 'whiteAlpha' : 'purple'}
                variant={isForgeMode ? 'solid' : 'subtle'}
                bg={isForgeMode ? 'whiteAlpha.200' : undefined}
                color={isForgeMode ? 'white' : undefined}
                p={categoryInfo ? 1.5 : 2}
                borderRadius="md"
                fontSize="sm"
                backdropFilter={isForgeMode ? 'blur(10px)' : undefined}
                border={isForgeMode ? '1px solid rgba(255,255,255,0.1)' : undefined}
              >
                {challenge?.category || t('Quick Clash')}
                {isForgeMode && ' - Forge Mode'}
              </Badge>
            </HStack>

            <HStack>
              {/* Only show reading timer for traditional mode */}
              {showReadingTimer && phaseInfo.currentTime !== null && (
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

              {/* Quiz timer */}
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

          {/* Progress bar - skip for forge mode in reading phase */}
          {((phase === 'reading' && !isForgeMode) || phase === 'quiz') && (
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

// Module-level cache for active session initialization promises
// This prevents double-initialization in React Strict Mode where the component remounts
// but we want the network request to happen exactly once per challengeId
const activeSessionPromises = {}

// Stable no-op function to prevent re-renders
const NO_OP = () => {}

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
  const [phase, setPhase] = useState('loading') //  loading, reading, betting, quiz, completed
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

  // MODIFIED INITIALIZATION LOGIC - WITH FORGE MODE DETECTION AND DEDUPLICATION
  const initSession = useCallback(async () => {
    // If we already have a session for this challenge, don't re-initialize
    if (session && session?.challengeId === challengeId) {
      return
    }

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

      // Handle session creation with deduplication
      let currentSession

      // Check if we already have a promise for this challenge
      if (activeSessionPromises[challengeId]) {
        console.log('Using existing session promise for', challengeId)
        currentSession = await activeSessionPromises[challengeId]
      } else {
        // Create a new promise and cache it
        console.log('Creating new session promise for', challengeId)
        const sessionPromise = startSession(
          challengeId,
          user?.userLanguage || 'en',
        )

        activeSessionPromises[challengeId] = sessionPromise

        try {
          currentSession = await sessionPromise
        } catch (err) {
          // If it fails, remove from cache so we can try again
          delete activeSessionPromises[challengeId]
          throw err
        }
      }

      // NEW: Check if this is a forge mode challenge
      if (fetchedChallenge.forgeArticle) {
        // This is Forge Mode - skip article initialization
        console.log('🔨 Forge Mode detected - using interactive reading')
        setPhase('reading') // Will use ForgeReadingPhase component
      } else {
        // Traditional mode - initialize article as before
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

        // Start reading phase on the server (traditional mode only)
        await axios.post(
          `/api/quickClash/session/${currentSession._id}/reading/start`,
        )
      }

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
    session,
  ])

  // MODIFIED READING COMPLETION LOGIC - HANDLES BOTH MODES
  const handleReadingComplete = useCallback(async () => {
    setCompleteReadingLoading(true)
    try {
      // Call the API to mark reading as complete and switch phase to 'betting'
      // This works for both Traditional and Forge modes
      await axios.post(
        `/api/quickClash/session/${session?._id}/reading/complete`,
      )

      // Check if betting is enabled for this challenge
      if (challenge?.betting?.enabled !== false) {
        setPhase('betting')
      } else {
        setPhase('quiz')
      }
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
  }, [session?._id, toast, t, challenge?.betting?.enabled])

  // NEW: Betting Completion Logic
  const handleBettingComplete = useCallback(() => {
    setPhase('quiz')
    setPhaseProgress(0)
  }, [])

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
    console.log('Running init session')
    initSession()
    return () => {
      // Only clear session on unmount, but keep the promise in cache for a bit
      // in case of immediate remount (Strict Mode)
      // We don't delete from activeSessionPromises here to handle the remount
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
        assignment.userId !== user?._id ||
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
  }, [params.challengeId, user?._id, navigate, toast])

  // MODIFIED READING TIMER LOGIC - SKIP FOR FORGE MODE
  useEffect(() => {
    // Skip timer for Forge Mode - it has its own internal timers
    if (challenge?.forgeArticle) return

    // Traditional reading timer
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
  }, [phase, session, challenge])

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
    <Flex
      direction="column"
      h="100dvh"
      bg="slate.900"
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgGradient: 'linear(to-br, blue.900, slate.900, purple.900)',
        opacity: 0.6,
        zIndex: 0,
      }}
    >
      {/* Animated Background Elements */}
      <Box
        position="absolute"
        top="-20%"
        left="-10%"
        w="60%"
        h="60%"
        bgGradient="radial(circle, cyan.500 0%, transparent 70%)"
        filter="blur(120px)"
        opacity={0.2}
        zIndex={0}
        as={motion.div}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <Box
        position="absolute"
        bottom="-20%"
        right="-10%"
        w="60%"
        h="60%"
        bgGradient="radial(circle, purple.500 0%, transparent 70%)"
        filter="blur(120px)"
        opacity={0.2}
        zIndex={0}
        as={motion.div}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Hide TimerHeader in Forge Mode - it has its own integrated header */}
      {!challenge?.forgeArticle && (
        <Box flex="none" zIndex={10}>
          <TimerHeader
            phase={phase}
            challenge={challenge}
            timeLeft={timeLeft}
            quizTimeLeft={quizTimeLeft}
            phaseProgress={phaseProgress}
            t={t}
          />
        </Box>
      )}

      <Container
        maxW="container.lg"
        flex="1"
        h="auto"
        py={phase === 'reading' && challenge?.forgeArticle ? 0 : 4}
        px={{ base: 2, md: 4 }}
        position="relative"
        zIndex={1}
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        <VStack spacing={6} align="stretch" h="full" overflow="hidden">
          {phase === 'loading' && loadingScreen}

          {/* MODIFIED: Conditional rendering for reading phase */}
          {phase === 'reading' && (
            <Suspense fallback={<LoadingFallback />}>
              {challenge?.forgeArticle ? (
                // NEW: Forge Mode - Interactive Reading
                <ForgeReadingPhase
                  sessionId={session?._id}
                  category={challenge?.category}
                  onComplete={handleReadingComplete}
                  onError={error => {
                    setError(error)
                    toast({
                      title: t('Error'),
                      description: error,
                      status: 'error',
                      duration: 5000,
                      isClosable: true,
                    })
                  }}
                />
              ) : (
                // EXISTING: Traditional Reading Phase
                article && (
                  <ReadingPhase
                    category={catTranslate(challenge?.category)}
                    article={article}
                    timeLeft={timeLeft}
                    onComplete={handleReadingComplete}
                    completeReadingLoading={completeReadingLoading}
                  />
                )
              )}
            </Suspense>
          )}

          {phase === 'betting' && (
            <Suspense fallback={<LoadingFallback />}>
              <BettingScreen
                challengeId={challenge?._id}
                currentTrophies={user?.quickClashTrophies || 0}
                onComplete={handleBettingComplete}
                user={user}
              />
            </Suspense>
          )}

          {phase === 'quiz' && session && (
            <Suspense fallback={<LoadingFallback />}>
              <GamifiedQuiz
                sessionId={session?._id}
                onComplete={handleQuizComplete}
                setStopTimerOnQuizSubmit={NO_OP}
                quizTimeLeft={quizTimeLeft}
                setQuizTimeLeft={setQuizTimeLeft}
                setLoadingQuiz={NO_OP}
              />
            </Suspense>
          )}

          <ResultsModal
            isOpen={isResultsOpen}
            onClose={closeResults}
            score={score}
            navigateToList={confirmNavigation}
            challenge={challenge}
            user={user}
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
    </Flex>
  )
}

export default memo(QuickClashSession)
