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
import ConfirmationDialog from '../components/quickClashComponents/ConfirmationDialog'

// Lazy-loaded QuizReportModal for full battle report after quiz completion
const QuizReportModal = lazy(() => import('../components/quickClashComponents/QuizReportModal'))
import { useDispatch, useSelector } from 'react-redux'
import useQuickClash from '../customHooks/useQuickClash'
import useDailyTasks from '../customHooks/useDailyTasks'

// Category Icon and Utils
import { getCategoryInfo } from '../components/quickClashComponents/team/teamBattlePageComponents/categoriesSection/categoryUtils'
import CategoryIcon from '../components/quickClashComponents/team/teamBattlePageComponents/categoriesSection/CategoryIcon'
import { fetchActiveChallenges } from '../redux/quickClashSlice'

// Haptic feedback for gaming interactions
import { haptics } from '../utils/haptics'

// Audio feedback for game sounds
import { quizAudioService } from '../services/quizAudioService'

// Session player support
import usePlayer from '../hooks/usePlayer'

// Streak celebration popup
const StreakIncreasedPopup = lazy(() =>
  import('../components/quickClashComponents/v2/StreakIncreasedPopup'),
)

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

// Module-level session cache for session players
// This is used to store the session synchronously and bypass React's state batching issues
// Key: challengeId, Value: session object
const sessionCacheForSessionPlayers = {}

// Stable no-op function to prevent re-renders
const NO_OP = () => {}

// Main component with optimization but preserved logic
const QuickClashSession = ({ isSessionPlayer = false }) => {
  const { t } = useTranslation('QuickClash')
  const { t: catTranslate } = useTranslation('categories')
  const { challengeId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const dispatch = useDispatch()

  // Use unified player context for session player support
  const { playerId, isAuthenticated, sessionPlayer } = usePlayer()

  // For authenticated users, use Redux auth; for session players, use session data
  const { user } = useSelector(state => state.auth)
  const effectiveUser = isSessionPlayer ? null : user

  // Custom hooks
  const {
    startSession,
    setActiveChallenge,
    endSession,
    currentSession: reduxSession,
    sessionError: reduxSessionError,
  } = useQuickClash()

  // Local session state for session players (Redux not available for them)
  const [localSession, setLocalSession] = useState(null)

  // Ref for synchronous session access (avoids React state batching issues)
  const sessionRef = useRef(null)

  // Force update counter to ensure re-render when session changes
  const [, forceUpdate] = useState(0)

  // Use Redux session for authenticated users, local session for session players
  const session = isSessionPlayer ? localSession : reduxSession

  // Helper to get session ID from either state or ref (ref is updated synchronously)
  const getSessionId = () => session?._id || sessionRef.current?._id

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
  const [scoreDetails, setScoreDetails] = useState(null)
  const [phaseProgress, setPhaseProgress] = useState(0)
  const [completeReadingLoading, setCompleteReadingLoading] = useState(false)

  // Track powerups used during session (forge/quiz) to filter them out
  // Changed from Set to Map for counting: { powerupId: count }
  const [usedPowerupCounts, setUsedPowerupCounts] = useState({})

  // Streak popup state
  const [showStreakPopup, setShowStreakPopup] = useState(false)
  const [streakResult, setStreakResult] = useState(null)

  // Callback to track when a powerup is used
  // skipApiCall: true when called from ForgeReadingPhase/GamifiedQuiz (they already called API)
  //              false (default) for passive powerups auto-applied at phase transitions
  const handlePowerupUsed = useCallback(async (powerupId, { skipApiCall = false } = {}) => {
    const incrementLocalUsage = () => {
      setUsedPowerupCounts(prev => ({
        ...prev,
        [powerupId]: (prev[powerupId] || 0) + 1
      }))
    }

    // Component already called API (active powerups). Just update local usage count.
    if (skipApiCall) {
      incrementLocalUsage()
      console.log(`[POWERUP] Local state updated for ${powerupId} (API already called)`)
      return true
    }

    // Passive path: persist first, then increment local usage.
    try {
      const sessionId = getSessionId()
      if (sessionId) {
        const endpoint = isSessionPlayer
          ? `/api/play/session/${sessionId}/powerup/use`
          : `/api/quickClash/session/${sessionId}/powerup/use`

        const response = await axios.post(endpoint, { powerupId })
        if (response?.data?.alreadyUsed) {
          console.log(`[POWERUP] ${powerupId} already used on backend`)
          return false
        }

        incrementLocalUsage()
        console.log(`[POWERUP] Passive powerup ${powerupId} usage persisted`)
        return true
      }
    } catch (err) {
      console.error('[POWERUP] Failed to persist passive powerup:', err)
      return false
    }

    return false
  }, [getSessionId, isSessionPlayer])

  // Wrapper for component callbacks - they already called API
  const handleComponentPowerupUsed = useCallback((powerupId) => {
    handlePowerupUsed(powerupId, { skipApiCall: true })
  }, [handlePowerupUsed])




  // Compute active powerups with used ones filtered out based on count
  const filteredActivePowerups = useMemo(() => {
    const powerups = session?.activePowerups || []

    // Track how many of each type we've seen so far in this iteration
    const seenCounts = {}

    return powerups.map(p => {
      const pId = p.powerupId
      const currentSeen = seenCounts[pId] || 0
      const usedCount = usedPowerupCounts[pId] || 0

      // Mark as used if we have already used this many instances
      // e.g. if we used 1 Time Warp, the first Time Warp in list is used, second is active
      const isUsed = p.used || currentSeen < usedCount

      // Increment seen count for next iteration
      seenCounts[pId] = currentSeen + 1

      return {
        ...p,
        used: isUsed
      }
    })
  }, [session?.activePowerups, usedPowerupCounts])

  const applyQuizTimeWarpStack = useCallback(async () => {
    const availableTimeWarps = filteredActivePowerups.filter(p =>
      p.powerupId === 'TIME_WARP' &&
      (p.phase?.toLowerCase() === 'quiz' || p.phase?.toLowerCase() === 'both') &&
      !p.used
    )

    const timeWarpCount = availableTimeWarps.length
    if (!timeWarpCount) return 0

    let appliedCount = 0
    for (let i = 0; i < timeWarpCount; i++) {
      // Best-effort persistence for each stacked Time Warp.
      const applied = await handlePowerupUsed('TIME_WARP')
      if (applied) appliedCount += 1
    }

    if (appliedCount > 0) {
      quizAudioService.playTimeWarp()
      setQuizTimeLeft(50 + appliedCount * 15)
    }

    return appliedCount
  }, [filteredActivePowerups, handlePowerupUsed])

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

      // Use session-aware endpoint for session players
      const challengeEndpoint = isSessionPlayer
        ? `/api/play/challenge/${challengeId}`
        : `/api/quickClash/challenge/${challengeId}`

      // First get the challenge details
      const challengeResponse = await axios.get(challengeEndpoint)
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

        // For session players, use session-aware session creation
        const sessionPromise = isSessionPlayer
          ? axios.post('/api/play/session/start', { challengeId }).then(r => r.data.session)
          : startSession(challengeId, effectiveUser?.userLanguage || 'en')

        activeSessionPromises[challengeId] = sessionPromise

        try {
          currentSession = await sessionPromise
          // For session players, save to multiple places to ensure availability
          if (isSessionPlayer && currentSession) {
            console.log('[SESSION] Setting local session for session player:', currentSession._id)
            // 1. Update MODULE-LEVEL CACHE (always accessible, no React lifecycle issues)
            sessionCacheForSessionPlayers[challengeId] = currentSession
            // 2. Update ref (should be synchronous but has StrictMode issues)
            sessionRef.current = currentSession
            // 3. Update state for React re-render
            setLocalSession(currentSession)
            // 4. Force a re-render to pick up the new session
            forceUpdate(n => n + 1)
            console.log('[SESSION] Session stored in all locations, cache:', sessionCacheForSessionPlayers[challengeId]?._id)
          }
        } catch (err) {
          // If it fails, remove from cache so we can try again
          delete activeSessionPromises[challengeId]
          throw err
        }
      }

      // Verify we have a valid session before proceeding
      const sessionId = currentSession?._id
      if (!sessionId) {
        console.error('[SESSION] Session ID is undefined after session creation!')
        throw new Error('Failed to create session - session ID is undefined')
      }
      console.log('[SESSION] Valid session ID:', sessionId)

      // NEW: Check if this is a forge mode challenge
      if (fetchedChallenge.forgeArticle) {
        // This is Forge Mode - skip article initialization
        console.log('🔨 Forge Mode detected - using interactive reading')
        quizAudioService.playQuizStart() // Audio for session start
        haptics.quizStart() // Haptic for session start
        setPhase('reading') // Will use ForgeReadingPhase component
      } else {
        // Traditional mode - initialize article as before
        // Session players default to English
        const userLang = effectiveUser?.userLanguage || 'en'
        setArticle(
          userLang === 'en'
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
        quizAudioService.playQuizStart() // Audio for session start
        haptics.quizStart() // Haptic for session start
        setPhase('reading')
        readingStartTimeRef.current = Date.now()

        // Start reading phase on the server (traditional mode only)
        const readingStartEndpoint = isSessionPlayer
          ? `/api/play/session/${currentSession._id}/reading/start`
          : `/api/quickClash/session/${currentSession._id}/reading/start`
        await axios.post(readingStartEndpoint)
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
    effectiveUser?.userLanguage,
    setActiveChallenge,
    startSession,
    reduxSessionError,
    session,
    isSessionPlayer,
  ])

  // MODIFIED READING COMPLETION LOGIC - HANDLES BOTH MODES
  const handleReadingComplete = useCallback(async () => {
    setCompleteReadingLoading(true)
    try {
      // Call the API to mark reading as complete and switch phase to 'betting'
      // This works for both Traditional and Forge modes
      // For session players, use module-level cache to get session ID
      const sessionId = isSessionPlayer
        ? (sessionCacheForSessionPlayers[challengeId]?._id || session?._id)
        : session?._id

      if (!sessionId) {
        console.error('[handleReadingComplete] Session ID is undefined! Cache:', sessionCacheForSessionPlayers[challengeId])
        throw new Error('Session ID is undefined')
      }

      // Use session-aware endpoint for session players
      const readingCompleteEndpoint = isSessionPlayer
        ? `/api/play/session/${sessionId}/reading/complete`
        : `/api/quickClash/session/${sessionId}/reading/complete`
      await axios.post(readingCompleteEndpoint)

      // Check if betting is enabled for this challenge
      if (challenge?.betting?.enabled !== false) {
        haptics.notification() // Haptic for phase transition
        setPhase('betting')
      } else {
        await applyQuizTimeWarpStack()
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
  }, [session?._id, toast, t, challenge?.betting?.enabled, isSessionPlayer, applyQuizTimeWarpStack])

  // NEW: Betting Completion Logic
  const handleBettingComplete = useCallback(async () => {
    await applyQuizTimeWarpStack()
    haptics.notification() // Haptic for phase transition
    setPhase('quiz')
    setPhaseProgress(0)
  }, [applyQuizTimeWarpStack])

  // ORIGINAL QUIZ COMPLETION LOGIC - WITH REWARD SCREEN
  const handleQuizComplete = useCallback(
    result => {
      haptics.success() // Haptic for quiz completion
      setScore(result.RQM_score)
      setScoreDetails(result)
      setPhase('completed')
      openResults()

      // Only fetch challenges for authenticated users (session players don't have challenges)
      if (!isSessionPlayer) {
        dispatch(fetchActiveChallenges())
      }

      // Get coin and streak data from backend response (single source of truth)
      const coinRewardData = result.coinReward || {}
      const streakData = result.streakResult || {}
      const streakDays = streakData.newStreak || 0

      // Use backend-calculated coin values (no frontend duplication)
      const baseCoins = coinRewardData.baseCoins || 15
      const accuracyBonus = (coinRewardData.forgeAccuracyBonus || 0) + (coinRewardData.quizAccuracyBonus || 0)
      const streakMultiplier = coinRewardData.streakMultiplier || 1.0
      const totalCoins = coinRewardData.totalCoins || baseCoins

      // Get two-phase accuracy data for display
      const forgeAccuracyData = result.forgeAccuracy || { correct: 0, total: 5 }
      const quizAccuracyData = result.quizAccuracy || { correct: result.correctAnswers || 0, total: 5 }
      const quizCorrect = quizAccuracyData.correct || result.correctAnswers || 0
      const totalQuestions = 5

      // Mock percentile based on score (encouraging ranks)
      const score = result.RQM_score || 0
      let percentileRank = 35
      if (score >= 95) percentileRank = Math.floor(Math.random() * 5) + 1
      else if (score >= 85) percentileRank = Math.floor(Math.random() * 10) + 5
      else if (score >= 70) percentileRank = Math.floor(Math.random() * 15) + 15
      else if (score >= 50) percentileRank = Math.floor(Math.random() * 20) + 25

      // Calculate battle result ETA (battles usually last 45 minutes from creation)
      const battleResultETA = challenge?.teamBattle ? 25 : 0 // Rough estimate

      // Next milestone calculation
      let nextMilestoneDay = 4
      let nextMilestoneMultiplier = '1.5x'
      if (streakDays >= 30) {
        nextMilestoneDay = streakDays + 1
        nextMilestoneMultiplier = '3.0x (max!)'
      } else if (streakDays >= 15) {
        nextMilestoneDay = 30
        nextMilestoneMultiplier = '3.0x'
      } else if (streakDays >= 8) {
        nextMilestoneDay = 15
        nextMilestoneMultiplier = '2.5x'
      } else if (streakDays >= 4) {
        nextMilestoneDay = 8
        nextMilestoneMultiplier = '2.0x'
      }

      // Store reward screen data in localStorage for TeamBattlePage to display
      const rewardScreenData = {
        score: result.RQM_score,
        // Dual-phase accuracy breakdown
        forgeAccuracy: result.forgeAccuracy || {
          correct: 0,
          total: 5,
          percentage: 0
        },
        quizAccuracy: result.quizAccuracy || {
          correct: quizCorrect,
          total: totalQuestions,
          percentage: Math.round((quizCorrect / totalQuestions) * 100)
        },
        // Score breakdown
        forgeScore: result.forgeScore || 0,
        quizScore: result.quizScore || result.RQM_score,
        percentileRank,
        // Use backend coin values (single source of truth)
        baseCoins,
        accuracyBonus,
        streakMultiplier,
        totalCoins,
        streakDay: streakDays,
        nextMilestoneDay,
        nextMilestoneMultiplier,
        battleResultETA,
        category: challenge?.category || 'Quiz',
        isFirstSession: true, // Flag to enhance CTA for conversion
        // XP reward data (only for authenticated users)
        xpReward: result.xpReward || null,
      }

      // Show PostSessionRewardScreen for ALL quiz completions (both session players and auth users)
      // Use isFirstSession flag to differentiate first-time (conversion focus) vs returning (retention)
      const hasSeenFirstReward = localStorage.getItem('qc_first_reward_shown')

      // Determine if this is the first session for enhanced UI
      const isFirstSession = isSessionPlayer && !hasSeenFirstReward

      // Update rewardScreenData with correct isFirstSession value
      rewardScreenData.isFirstSession = isFirstSession

      // Always store reward screen data for all players
      localStorage.setItem('pendingRewardScreen', JSON.stringify(rewardScreenData))

      // Mark first reward as shown for session players (for future reference)
      if (isSessionPlayer && !hasSeenFirstReward) {
        localStorage.setItem('qc_first_reward_shown', 'true')
      }

      // Store streak data separately - will be shown AFTER reward screen closes
      // Only show streak popup on FIRST play of the day (when streak increments)
      if (result.streakResult && result.streakResult.newStreak > 0 && result.streakResult.isFirstPlayToday) {
        localStorage.setItem('pendingStreakPopup', JSON.stringify(result.streakResult))
      }

      trackChallengeCompletion({
        score: result.RQM_score,
        fromMatchmaking: challenge?.fromMatchmaking || false,
        readingTime: 120 - timeLeft, // Convert remaining time to spent time
        category: challenge?.category,
        challengeId: challenge?._id,
      })
    },
    [openResults, dispatch, trackChallengeCompletion, challenge, timeLeft, isSessionPlayer],
  )

  // ORIGINAL NAVIGATION LOGIC - UPDATED FOR SESSION PLAYERS
  // Session players are now redirected to /quickclash (upgraded experience) after battle completion
  const confirmNavigation = useCallback(() => {
    // Mark QuickClash for refresh when we return to it
    if (typeof window.markQuickClashForRefresh === 'function') {
      window.markQuickClashForRefresh()
    }

    // For session players, set the sparkUpgraded flag
    // This ensures they go directly to /quickclash on future visits
    if (isSessionPlayer) {
      localStorage.setItem('sparkUpgraded', 'true')
    }

    // Navigate to appropriate screen
    if (challenge?.fromTeamBattle) {
      // For battles from team matchmaking, go to the battle page
      // Session players can now access /quickclash/* routes
      const battleRoute = `/quickclash/teamBattle/${challenge.teamBattle.toString()}`
      navigate(battleRoute)
    } else {
      // Return to main Quick Clash UI (both session players and auth users)
      // Check if this is session player's first time seeing the upgraded UI
      const hasSeenUpgrade = localStorage.getItem('qc_session_welcome_shown')

      if (isSessionPlayer && !hasSeenUpgrade) {
        // First completion - show welcome modal
        navigate('/quickclash', { state: { showWelcome: true } })
      } else {
        navigate('/quickclash')
      }

      // Additional fallback: trigger immediate refresh if function is available
      setTimeout(() => {
        if (typeof window.refreshQuickClashChallenges === 'function') {
          window.refreshQuickClashChallenges()
        }
      }, 100)
    }
  }, [challenge, navigate, isSessionPlayer])

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

  // Effect for authorization check (skip for session players - they use different auth)
  useEffect(() => {
    // Session players don't use localStorage authorization - they use X-Session-Id
    if (isSessionPlayer) return

    // Wait for user to be loaded before checking authorization
    // This prevents false "Unauthorized Access" errors when auth state hasn't hydrated yet
    if (!user?._id) return

    const challengeId = params.challengeId
    const storedAssignment = localStorage.getItem(`challenge_${challengeId}`)

    if (storedAssignment) {
      const assignment = JSON.parse(storedAssignment)

      // Check for both 'playerId' (new format from useQuickClashTeamBattle) and 'userId' (legacy format)
      const storedPlayerId = assignment.playerId || assignment.userId

      if (
        storedPlayerId !== user?._id ||
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
  }, [params.challengeId, user?._id, navigate, toast, isSessionPlayer])

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
                // Use module-level cache for session players (bypasses all React lifecycle issues)
                (() => {
                  // For session players, use the module-level cache which is always accessible
                  // For authenticated users, use Redux session
                  const sessionId = isSessionPlayer
                    ? (sessionCacheForSessionPlayers[challengeId]?._id || sessionRef.current?._id || session?._id)
                    : session?._id
                  console.log('[RENDER] ForgeReadingPhase check - sessionId:', sessionId, 'isSessionPlayer:', isSessionPlayer, 'cache:', sessionCacheForSessionPlayers[challengeId]?._id)
                  return sessionId ? (
                    <ForgeReadingPhase
                      sessionId={sessionId}
                      category={challenge?.category}
                      activePowerups={filteredActivePowerups}
                      isSessionPlayer={isSessionPlayer}
                      onComplete={handleReadingComplete}
                      onPowerupUsed={handleComponentPowerupUsed}
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
                    <LoadingFallback />
                  )
                })()
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
                isSessionPlayer={isSessionPlayer}
              />
            </Suspense>
          )}

          {phase === 'quiz' && (() => {
            // For session players, use module-level cache to get session ID
            const quizSessionId = isSessionPlayer
              ? (sessionCacheForSessionPlayers[challengeId]?._id || session?._id)
              : session?._id

            if (!quizSessionId) {
              console.log('[QUIZ] Waiting for session ID...')
              return <LoadingFallback />
            }

            return (
              <Suspense fallback={<LoadingFallback />}>
                <GamifiedQuiz
                  sessionId={quizSessionId}
                  activePowerups={filteredActivePowerups}
                  isSessionPlayer={isSessionPlayer}
                  onComplete={handleQuizComplete}
                  onPowerupUsed={handleComponentPowerupUsed}
                  setStopTimerOnQuizSubmit={NO_OP}
                  quizTimeLeft={quizTimeLeft}
                  setQuizTimeLeft={setQuizTimeLeft}
                  setLoadingQuiz={NO_OP}
                />
              </Suspense>
            )
          })()}

          {/* Full Battle Report Modal - replaces simple score modal */}
          <Suspense fallback={<LoadingFallback />}>
            <QuizReportModal
              isOpen={isResultsOpen}
              onClose={confirmNavigation}
              sessionId={getSessionId()}
            />
          </Suspense>

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

          {/* Streak Increased Popup */}
          <Suspense fallback={null}>
            <StreakIncreasedPopup
              isOpen={showStreakPopup}
              onClose={() => setShowStreakPopup(false)}
              streakResult={streakResult}
              isSessionPlayer={isSessionPlayer}
              onCreateAccount={() => {
                // Navigate to signup (for session players)
                navigate('/quickclash', { state: { showSignup: true } })
              }}
            />
          </Suspense>
        </VStack>
      </Container>
    </Flex>
  )
}

export default memo(QuickClashSession)
