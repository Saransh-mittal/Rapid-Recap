import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import {
  Box,
  VStack,
  Text,
  Button,
  useToast,
  Flex,
  HStack,
  Center,
  Spinner,
  Badge,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Pause,
  Play,
  Trophy,
  X,
} from 'lucide-react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import soloDrillService from '../../services/soloDrillService'

// Components
import GamifiedOptionButton from './GamifiedOptionButton'
import SubmittedQuizInterface from './SubmittedQuizInterface'

// Haptic feedback for gaming interactions
import { haptics } from '../../utils/haptics'

// Audio feedback for game sounds
import { quizAudioService } from '../../services/quizAudioService'

const MotionBox = motion(Box)

const GamifiedQuiz = ({
  sessionId,
  onComplete,
  setStopTimerOnQuizSubmit = () => {},
  quizTimeLeft = 50,
  setQuizTimeLeft = () => {},
  setLoadingQuiz = () => {},
  activePowerups = [],
  isSessionPlayer = false,
  isSoloDrill = false,
  timeWarpApplied = false,
  onPowerupUsed, // Callback to parent
  isPaused = false,
  onTogglePause = null,
  onClose = null,
}) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()

  // Helper to get correct API base URL
  const apiBase = isSoloDrill
    ? '/api/solo-drill'
    : (isSessionPlayer ? '/api/play' : '/api/quickClash')

  const uiTheme = isSoloDrill
    ? {
        spinner: 'cyan.400',
        headerIconBg: 'cyan.500',
        headerIconShadow: '0 0 15px rgba(6, 182, 212, 0.45)',
        progressGradient: 'linear-gradient(90deg, #14B8A6 0%, #06B6D4 100%)',
        nextGradient: 'linear(to-r, teal.400, cyan.500)',
        nextGradientHover: 'linear(to-r, teal.300, cyan.400)',
      }
    : {
        spinner: 'purple.500',
        headerIconBg: 'purple.500',
        headerIconShadow: '0 0 15px rgba(128, 90, 213, 0.4)',
        progressGradient: 'linear-gradient(90deg, #805AD5 0%, #4299E1 100%)',
        nextGradient: 'linear(to-r, purple.500, blue.500)',
        nextGradientHover: 'linear(to-r, purple.400, blue.400)',
      }

  // State
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [timeSpent, setTimeSpent] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [quizReady, setQuizReady] = useState(false)
  const [timeWarningPlayed, setTimeWarningPlayed] = useState(false)

  // Powerup State
  const [disabledOptions, setDisabledOptions] = useState({}) // { questionIndex: ['a', 'c'] }
  const [oracleUsedThisQuestion, setOracleUsedThisQuestion] = useState(false)
  // We rely on activePowerups prop (filtered by parent) for counts
  // But we still track per-question limits or loading states locally if needed
  const [powerupLoading, setPowerupLoading] = useState(false)

  // Filter available powerups for Quiz
  // Active Powerups (Clickable)
  const quizPowerups = activePowerups.filter(p =>
    (p.phase?.toLowerCase() === 'quiz' || p.phase?.toLowerCase() === 'both') &&
    !p.used &&
    p.type !== 'PASSIVE' && // Exclude passives from clickable list
    ['ORACLES_EYE'].includes(p.powerupId) // Whitelist supported active powerups
  )

  // Deduplicate for display: showing 3 separate buttons for 3 Oracle Eyes might be clutter
  // But user wanted "if I had 3, I used one... it disappeared".
  // Let's show unique buttons with counts? OR show all?
  // User request: "If the powerup is applicable in the quiz phase also and if left then should be able to use it there also."
  // And "I had three... used one... it disappeared".
  // So they expect to see the remaining ones.
  // We will GROUP them by ID and show a count badge.
  const uniqueQuizPowerups = useMemo(() => {
    const grouped = {}
    quizPowerups.forEach(p => {
      if (!grouped[p.powerupId]) {
        grouped[p.powerupId] = { ...p, count: 0 }
      }
      grouped[p.powerupId].count++
    })
    return Object.values(grouped)
  }, [quizPowerups])

  // Passive Powerups (Visual Only) - Show as active buffs
  // These apply automatically during Quiz phase
  // Note: TIME_WARP shows even when "used" because being used = bonus is active
  const passivePowerups = activePowerups.filter(p => {
    const isQuizPowerup =
      p.phase?.toLowerCase() === 'quiz' || p.phase?.toLowerCase() === 'both'
    if (!isQuizPowerup) return false

    const isPassiveType =
      p.type === 'PASSIVE' ||
      p.powerupId === 'PRECISION_PROTOCOL' ||
      p.powerupId === 'TIME_WARP' ||
      p.powerupId === 'SCORE_SURGE'
    if (!isPassiveType) return false

    if (p.powerupId === 'TIME_WARP' && isSoloDrill) {
      // In Solo Drill, show Time Warp buff only when it is actually active in quiz.
      return timeWarpApplied || !p.used
    }

    return p.powerupId === 'TIME_WARP' || !p.used
  })

  // Refs
  const switchingQuestionRef = useRef(false)
  // --- Initialization ---

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        setLoadingQuiz(true)

        let questionsData = []

        if (isSoloDrill) {
          const quizResponse = await soloDrillService.getQuizQuestions(sessionId)
          const quizPayload = quizResponse?.data || quizResponse
          const normalizedQuestions =
            quizPayload?.questions || quizPayload?.data?.questions || []

          if (Array.isArray(normalizedQuestions) && normalizedQuestions.length > 0) {
            questionsData = normalizedQuestions
          } else {
            // Backward compatibility fallback for frontend-backend version skew.
            const sessionResponse = await soloDrillService.getSession(sessionId)
            questionsData =
              sessionResponse?.data?.forgeArticle?.quickClashQuiz?.questions || []
          }
        } else {
          const response = await axios.get(
            `${apiBase}/session/${sessionId}/quiz`,
          )
          questionsData = response.data?.questions || []
        }

        setQuestions(questionsData)
        setUserAnswers({})
        setTimeSpent({})

        // Initialize timing for first question
        setTimeSpent({
            0: { startTime: Date.now(), timeSpent: 0 }
        })

        setQuizReady(true)
        // Note: Timer is already set by parent QuickClashSession (with Time Warp bonus if applicable)
        // Do NOT reset the timer here - parent handles the correct initial value
      } catch (error) {
        console.error('Error fetching questions:', error)
        toast({
          title: t('Error'),
          description:
            error.response?.data?.message || t('Failed to fetch quiz questions'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
        setLoadingQuiz(false)
      }
    }

    fetchQuestions()
  }, [sessionId, toast, t, setLoadingQuiz, isSoloDrill, apiBase])

  // --- Logic ---

  // Timer Logic
  useEffect(() => {
    if (!quizReady || submitted || submitLoading || isPaused) return

    const timer = setInterval(() => {
      setQuizTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizReady, submitted, submitLoading, setQuizTimeLeft, isPaused])

  // Time Warning Sound (plays once at 15 seconds)
  useEffect(() => {
    if (quizTimeLeft === 15 && !timeWarningPlayed && quizReady && !submitted && !isPaused) {
      quizAudioService.playTimeWarning()
      haptics.timeWarning()
      setTimeWarningPlayed(true)
    }
  }, [quizTimeLeft, timeWarningPlayed, quizReady, submitted, isPaused])




  const handleAnswer = useCallback(
    (answer) => {
      if (switchingQuestionRef.current || submitted || isPaused) return

      haptics.selection() // Haptic on answer selection
      quizAudioService.playOptionClick() // Audio on answer selection

      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: answer,
      }))
    },
    [currentQuestionIndex, submitted, isPaused]
  )

  const handleNext = useCallback(() => {
    if (isPaused) return
    if (currentQuestionIndex < questions.length - 1) {
      haptics.light() // Haptic on next question
      quizAudioService.playNewQuestion() // Audio for next question
      switchingQuestionRef.current = true

      // Record time
      const now = Date.now()
      setTimeSpent((prev) => {
        const currentStart = prev[currentQuestionIndex]?.startTime || now
        return {
          ...prev,
          [currentQuestionIndex]: {
            startTime: currentStart,
            timeSpent: Math.floor((now - currentStart) / 1000),
          },
          [currentQuestionIndex + 1]: {
            startTime: now,
            timeSpent: 0,
          },
        }
      })

      setCurrentQuestionIndex((prev) => prev + 1)

      setTimeout(() => {
        switchingQuestionRef.current = false
      }, 300) // Match animation duration
    }
  }, [currentQuestionIndex, questions.length, isPaused])

  const handleSubmit = useCallback(async () => {
    if (submitLoading || submitted || isPaused) return

    try {
      setSubmitLoading(true)
      setStopTimerOnQuizSubmit(true)
      haptics.success() // Haptic on quiz submit
      quizAudioService.playQuizComplete() // Audio for quiz completion

      // Finalize time for current question
      const now = Date.now()
      const finalTimeSpent = { ...timeSpent }
      const currentStart = finalTimeSpent[currentQuestionIndex]?.startTime || now
      finalTimeSpent[currentQuestionIndex] = {
          startTime: currentStart,
          timeSpent: Math.floor((now - currentStart) / 1000)
      }

      const formattedResponses = questions.map((question, index) => {
        const selectedAnswer = userAnswers[index] || ''
        return {
          questionId: question._id,
          answer: selectedAnswer,
          userAnswer: selectedAnswer, // Solo Drill backend expects userAnswer
          timeSpent: finalTimeSpent[index]?.timeSpent || 0,
        }
      })

      const submitEndpoint = `${apiBase}/session/${sessionId}/quiz/submit`

      const response = await axios.post(
        submitEndpoint,
        { responses: formattedResponses }
      )

      setResult(response.data)
      setSubmitted(true)

      if (onComplete) {
        onComplete(response.data)
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast({
        title: t('Error'),
        description: error.response?.data?.message || t('Failed to submit quiz'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setSubmitLoading(false)
    }
  }, [
    questions,
    userAnswers,
    timeSpent,
    sessionId,
    submitLoading,
    submitted,
    toast,
    t,
    currentQuestionIndex,
    onComplete,
    setStopTimerOnQuizSubmit,
    apiBase,
    isPaused,
  ])

  // Watch for time up
  useEffect(() => {
      if (quizTimeLeft === 0 && !submitted && !submitLoading && quizReady && !isPaused) {
          handleSubmit()
      }
  }, [quizTimeLeft, submitted, submitLoading, quizReady, handleSubmit, isPaused])

  // Oracle's Eye can only be used once per quiz question
  useEffect(() => {
    setOracleUsedThisQuestion(false)
  }, [currentQuestionIndex])

  // Powerup Handler
  const handleUsePowerup = async (powerup) => {
    if (powerupLoading || isPaused) return
    if (powerup.powerupId === 'ORACLES_EYE' && oracleUsedThisQuestion) return

    try {
      setPowerupLoading(true)
      const currentQuestion = questions[currentQuestionIndex]

      // Optimistic update handled by parent via refetch or local state,
      // but we need to wait for API success first.


      const response = await axios.post(`${apiBase}/session/${sessionId}/powerup/use`, {
        powerupId: powerup.powerupId,
        questionId: currentQuestion._id
      })

      if (response.data.success) {
        if (response.data.alreadyUsed || !response.data.effect) {
          if (powerup.powerupId === 'ORACLES_EYE') {
            setOracleUsedThisQuestion(true)
          }
          return
        }

        haptics.success() // Haptic on powerup activation
        const effect = response.data.effect

        if (effect.type === 'REMOVE_OPTIONS') {
          quizAudioService.playOraclesEye() // Play Oracle's Eye sound
          setDisabledOptions(prev => ({
            ...prev,
            [currentQuestionIndex]: [
              ...(prev[currentQuestionIndex] || []),
              ...effect.optionsToRemove
            ]
          }))
          setOracleUsedThisQuestion(true)
        }

        // Notify parent to update the global count
        if (onPowerupUsed) {
          onPowerupUsed(powerup.powerupId)
        }
      }
    } catch (error) {
      console.error('Error using powerup:', error)
      toast({
        title: "Powerup Failed",
        description: error.response?.data?.message || "Could not use powerup",
        status: "error",
      })
    } finally {
      setPowerupLoading(false)
    }
  }

  // --- Render Helpers ---

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  if (loading) {
    return (
      <Center h="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color={uiTheme.spinner} thickness="4px" />
          <Text color="whiteAlpha.800">{t('Loading Challenge...')}</Text>
        </VStack>
      </Center>
    )
  }

  if (submitted) {
    return (
      <SubmittedQuizInterface
        submitLoad={submitLoading}
        result={result}
        onViewReport={() => onComplete && onComplete(result)}
      />
    )
  }

  return (
    <Box
      w="100%"
      maxW="800px"
      mx="auto"
      position="relative"
      h="100%"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      {/* Header Section (Fixed) */}
      <Box flexShrink={0} px={1}>
        {/* Header Stats */}
        <Flex
          justify="space-between"
          align="center"
          mb={6}
          bg="whiteAlpha.100"
          p={4}
          borderRadius="2xl"
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <HStack spacing={4}>
            <Box
              p={2}
              bg={uiTheme.headerIconBg}
              borderRadius="lg"
              boxShadow={uiTheme.headerIconShadow}
            >
              <Trophy size={20} color="white" />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="whiteAlpha.600" fontWeight="bold" textTransform="uppercase">
                {t('Question')}
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="white">
                {currentQuestionIndex + 1} <span style={{ opacity: 0.4 }}>/ {questions.length}</span>
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={2.5}>
              {/* Timer Display - Visual only, logic is in parent/hooks */}
             <Box
              p={2}
              bg={quizTimeLeft <= 10 ? 'red.500' : 'blue.500'}
              borderRadius="lg"
              transition="background 0.3s"
              animation={quizTimeLeft <= 10 ? 'pulse 1s infinite' : 'none'}
            >
              <Clock size={20} color="white" />
            </Box>
            <VStack align="end" spacing={0}>
               <Text fontSize="xs" color="whiteAlpha.600" fontWeight="bold" textTransform="uppercase">
                {t('Time Left')}
              </Text>
              <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color={quizTimeLeft <= 10 ? 'red.300' : 'white'}
                  fontFamily="monospace"
              >
                00:{quizTimeLeft.toString().padStart(2, '0')}
              </Text>
            </VStack>
          </HStack>

            {/* Pause / Close buttons (Solo Drill) */}
            {(onTogglePause || onClose) && (
              <HStack spacing={1} pl={1}>
                {onTogglePause && (
                  <button
                    type="button"
                    onClick={onTogglePause}
                    className={`
                      h-8 w-8 rounded-full transition-all duration-200 flex items-center justify-center
                      ${isPaused
                        ? 'bg-cyan-500/20 text-cyan-50 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                        : 'text-white/50 hover:bg-white/10 hover:text-white'
                      }
                    `}
                    style={{ backgroundColor: isPaused ? undefined : 'rgba(255,255,255,0.04)' }}
                    aria-label={isPaused ? 'Resume drill' : 'Pause drill'}
                  >
                    {isPaused ? <Play size={14} /> : <Pause size={14} />}
                  </button>
                )}
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-8 w-8 rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                    aria-label="Close drill"
                  >
                    <X size={14} />
                  </button>
                )}
              </HStack>
            )}
        </Flex>

        {/* Active Buffs (Passive Powerups) */}
        {passivePowerups.length > 0 && (
          <HStack spacing={2} mb={4} px={1} flexWrap="wrap" justify="center">
            {passivePowerups.map((p, i) => {
              // Color and icon for each powerup type
              const buffStyles = {
                PRECISION_PROTOCOL: { color: 'pink', icon: '🎯', label: 'Precision Active' },
                TIME_WARP: { color: 'cyan', icon: '⏳', label: '+15s Active' },
                SCORE_SURGE: { color: 'yellow', icon: '⚡', label: '1.1x RQM Active' },
              }
              const style = buffStyles[p.powerupId] || { color: 'purple', icon: '✨', label: p.powerupId.replace('_', ' ') }

              return (
                <Badge
                  key={i}
                  as={motion.div}
                  initial={{ scale: 0, y: -10 }}
                  animate={{ scale: 1, y: 0 }}
                  colorScheme={style.color}
                  variant="solid"
                  borderRadius="full"
                  px={3}
                  py={1.5}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  boxShadow={`0 0 15px ${style.color === 'yellow' ? 'rgba(236, 201, 75, 0.4)' :
                             style.color === 'cyan' ? 'rgba(6, 182, 212, 0.4)' :
                             style.color === 'pink' ? 'rgba(236, 72, 153, 0.4)' :
                             'rgba(128, 90, 213, 0.4)'}`}
                  fontSize="xs"
                  fontWeight="bold"
                >
                  <Text fontSize="sm">{style.icon}</Text>
                  <Text>{style.label}</Text>
                </Badge>
              )
            })}
          </HStack>
        )}


        {/* Progress Bar */}
        <Box mb={4} position="relative">
          <Box h="4px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
              <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{
                      height: '100%',
                      background: uiTheme.progressGradient,
                      borderRadius: '4px'
                  }}
              />
          </Box>
        </Box>
      </Box>

      {/* Powerups moved to footer dock - removed floating bar */}

      {/* Scrollable Content Area */}
      <Box
        flex="1"
        overflowY="auto"
        px={2}
        pb={4}
        css={{
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-track': { width: '6px' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.2)', borderRadius: '24px' },
        }}
      >
        <AnimatePresence mode="wait">
          <MotionBox
            key={currentQuestionIndex}
            initial={{ x: 50, opacity: 0, rotateY: -10 }}
            animate={{ x: 0, opacity: 1, rotateY: 0 }}
            exit={{ x: -50, opacity: 0, rotateY: 10 }}
            transition={{ duration: 0.4, ease: "backOut" }}
            display="flex"
            flexDirection="column"
          >
            {/* Question Text */}
            <Box mb={6} position="relative">
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                lineHeight="1.4"
                color="white"
                textShadow="0 2px 10px rgba(0,0,0,0.3)"
              >
                {currentQuestion?.question}
              </Text>
            </Box>

            {/* Options */}
            <VStack spacing={3} align="stretch" mb={4}>
              {currentQuestion && Object.entries(currentQuestion.options || {}).map(([key, value]) => (
                <GamifiedOptionButton
                  key={key}
                  optionKey={key}
                  optionText={typeof value === 'object' ? value.text : value}
                  isSelected={userAnswers[currentQuestionIndex] === key}
                  onSelect={handleAnswer}
                  isDisabled={submitted || isPaused}
                  isEliminated={disabledOptions[currentQuestionIndex]?.includes(key)}
                />
              ))}
            </VStack>
          </MotionBox>
        </AnimatePresence>
      </Box>

      {/* Footer Controls (Fixed) + Powerups Dock */}
      <Box flexShrink={0} pt={4} pb={2} borderTop="1px solid" borderColor="whiteAlpha.100">
        {/* Premium Powerup Dock - shown when not submitted */}
        {!submitted && quizPowerups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="mb-4"
          >
            <Flex justify="center" gap={3} wrap="wrap" align="center">
              {uniqueQuizPowerups.map((p, i) => {
                // Determine if this specific cluster is usable
                // (Always true since we filtered unused ones, unless loading)
                const isDisabledForQuestion =
                  p.powerupId === 'ORACLES_EYE' && oracleUsedThisQuestion
                const isUsed = powerupLoading || isDisabledForQuestion || isPaused
                const colorSchemes = {
                  TIME_WARP: { bg: 'from-cyan-500/90 to-cyan-600/90', border: 'border-cyan-400/50', text: 'Time Warp', icon: '⏳' },
                  SCORE_SURGE: { bg: 'from-amber-500/90 to-amber-600/90', border: 'border-amber-400/50', text: 'Score 1.1x', icon: '⚡' },
                  ORACLES_EYE: { bg: 'from-fuchsia-500/90 to-fuchsia-600/90', border: 'border-fuchsia-400/50', text: "Oracle's Eye", icon: '🔮' },
                  PRECISION_PROTOCOL: { bg: 'from-rose-500/90 to-rose-600/90', border: 'border-rose-400/50', text: 'Precision', icon: '🎯' },
                }
                const scheme = colorSchemes[p.powerupId] || colorSchemes.ORACLES_EYE

                return (
                  <motion.button
                    key={i}
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: i * 0.08, type: 'spring', stiffness: 400 }}
                    whileHover={!isUsed ? { scale: 1.1, y: -3 } : {}}
                    whileTap={!isUsed ? { scale: 0.9 } : {}}
                    onClick={() => handleUsePowerup(p)}
                    disabled={isUsed}
                    className={`
                      relative flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all duration-200
                      shadow-lg backdrop-blur-sm
                      ${isUsed
                        ? 'bg-slate-700/40 border-slate-500/30 opacity-50'
                        : `bg-gradient-to-br ${scheme.bg} ${scheme.border} hover:shadow-xl`}
                    `}
                  >
                    <span className="text-2xl drop-shadow-md">{scheme.icon}</span>
                    <span className={`text-sm font-bold ${isUsed ? 'text-slate-400' : 'text-white drop-shadow-md'}`}>
                      {scheme.text}
                    </span>

                    {p.count > 1 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md border border-white/20"
                      >
                        x{p.count}
                      </motion.span>
                    )}
                  </motion.button>
                )
              })}
            </Flex>
          </motion.div>
        )}

        <Flex justify="flex-end" mt={2}>
          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              size="lg"
              height="56px"
              px={8}
              rightIcon={<ArrowRight />}
              colorScheme={isSoloDrill ? 'teal' : 'purple'}
              variant="solid"
              bgGradient={uiTheme.nextGradient}
              _hover={{
                  bgGradient: uiTheme.nextGradientHover,
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
              }}
              _active={{ transform: "translateY(0)" }}
              onClick={handleNext}
              isDisabled={!userAnswers[currentQuestionIndex] || isPaused}
              borderRadius="xl"
            >
              {t('Next Question')}
            </Button>
          ) : (
            <Button
              size="lg"
              height="56px"
              px={8}
              rightIcon={<CheckCircle />}
              colorScheme="green"
              bgGradient="linear(to-r, green.400, teal.500)"
               _hover={{
                  bgGradient: "linear(to-r, green.300, teal.400)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
              }}
              onClick={handleSubmit}
              isLoading={submitLoading}
              isDisabled={!userAnswers[currentQuestionIndex] || isPaused}
              borderRadius="xl"
            >
              {t('Submit Quiz')}
            </Button>
          )}
        </Flex>
      </Box>


      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(229, 62, 62, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
        }
      `}</style>
    </Box>
  )
}

export default GamifiedQuiz
