// src/components/quickClashComponents/forge/ForgeReadingPhase.jsx
/**
 * Forge Mode Reading Phase Component
 *
 * Main component for the interactive Forge Mode reading experience.
 *
 * Architecture Overview:
 * ┌─────────────────────────────────────────────────────────┐
 * │  PHASE FLOW:                                            │
 * │  1. question → User answers MCQ                         │
 * │  2. feedback → Show result + unlock content             │
 * │  3. reading → User reads unlocked content (24s timer)   │
 * │  4. transition → Move to next section                   │
 * │  5. complete → All 5 sections done, move to quiz        │
 * └─────────────────────────────────────────────────────────┘
 *
 * Key Features:
 * - Progressive content unlocking
 * - Server-side answer validation
 * - Streak bonuses for consecutive correct answers
 * - Timed reading windows
 * - Mobile-first responsive design
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useToast } from '@chakra-ui/react'
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'

// Services
import forgeService from '../../../services/forgeService'

// Utility Components
import {
  ReadingTimer,
  SectionProgress,
  ScoreDisplay,
  AnswerFeedback,
  ContextNugget,
  CompletionStats,
} from './ForgeUtilityComponents'

// Category utilities for theming
import { getCategoryInfo } from '../team/teamBattlePageComponents/categoriesSection/categoryUtils'

// Haptic and audio feedback
import { haptics } from '../../../utils/haptics'
import { quizAudioService } from '../../../services/quizAudioService'

/**
 * Main Forge Reading Phase Component
 *
 * Props:
 * @param {string} sessionId - Quick Clash session ID
 * @param {string} category - Article category for theming
 * @param {Array} activePowerups - List of active powerups for this session
 * @param {function} onComplete - Callback when forge mode completes
 * @param {function} onPowerupUsed - Callback when a powerup is used (receives powerupId)
 * @param {function} onError - Callback for error handling
 */
const ForgeReadingPhase = ({ sessionId, category, activePowerups = [], onComplete, onPowerupUsed, onError }) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()

  // Get category-based accent color for theming
  const categoryInfo = getCategoryInfo(category || 'Science')
  const accentColor = categoryInfo.primaryColor

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Phase control: 'loading' | 'question' | 'feedback' | 'reading' | 'complete'
  const [phase, setPhase] = useState('loading')

  // Question data
  const [currentQuestion, setCurrentQuestion] = useState(null)

  // Reading content (unlocked after correct answer)
  const [readingContent, setReadingContent] = useState(null)

  // User interaction
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answerResult, setAnswerResult] = useState(null)
  const [isTimeout, setIsTimeout] = useState(false) // Track if answer was auto-submitted

  // Progress tracking
  const [progress, setProgress] = useState({
    current: 0,
    total: 5,
    score: 0,
    lastScore: 0,
    streak: 0,
    correctAnswers: 0,
    unlockedSections: [],
  })

  // Phase complete state
  const [isPhaseComplete, setIsPhaseComplete] = useState(false)
  const [transitionTimer, setTransitionTimer] = useState(5) // 5 seconds auto-proceed

  // Timer for reading phase (seconds)
  const [readingTimer, setReadingTimer] = useState(24)

  // Timer for question phase (counting up) with dynamic auto-submit
  const [questionTimer, setQuestionTimer] = useState(0)
  const [maxQuestionTime, setMaxQuestionTime] = useState(10) // Default 10s
  const [maxReadingTime, setMaxReadingTime] = useState(12) // Default 12s
  const questionTimeoutRef = useRef(null)

  // Transition guard to prevent double moveToNextSection calls
  const isTransitioningRef = useRef(false)

  // Powerup State
  const [usedPowerups, setUsedPowerups] = useState({}) // { powerupId: true }
  const [activeEffects, setActiveEffects] = useState({
    scoreSurge: false,
  })
  const [disabledOptions, setDisabledOptions] = useState([]) // Array of indices
  const [highlightedAnswer, setHighlightedAnswer] = useState(null) // Index

  // Filter available powerups for Forge - only ACTIVE powerups (passive auto-apply)
  const forgePowerups = activePowerups.filter(p =>
    (p.phase === 'forge' || p.phase === 'both') &&
    !p.used &&
    p.type?.toLowerCase() !== 'passive' // Exclude passive powerups - they auto-activate on conditions
  )

  // Passive powerups for Forge - display only (auto-activate on conditions)
  const passiveForgePowerups = activePowerups.filter(p =>
    (p.phase === 'forge' || p.phase === 'both') &&
    !p.used &&
    p.type?.toLowerCase() === 'passive'
  )

  useEffect(() => {
    let interval
    if (phase === 'question') {
      // Don't reset timer here if it's already running (e.g. from previous render),
      // but we do want to reset it when *entering* the phase.
      // We can rely on the fact that we setQuestionTimer(0) in moveToNextSection or init.
      // But to be safe, let's leave the reset logic in the transition functions
      // and just handle the interval here.

      interval = setInterval(() => {
        setQuestionTimer(prev => prev + 1)
      }, 1000)
    }

    return () => {
      clearInterval(interval)
    }
  }, [phase])

  // New: State-based Timeout Check
  useEffect(() => {
    if (phase === 'question' && questionTimer >= maxQuestionTime) {
      if (!selectedAnswer && !isTimeout) {
        setIsTimeout(true)
        toast({
          title: 'Time Up!',
          description: 'Moving to content...',
          status: 'warning',
          duration: 2000,
        })
        setTimeout(() => {
          handleAnswerSubmit(null)
        }, 1500)
      }
    }
  }, [questionTimer, maxQuestionTime, phase, selectedAnswer, isTimeout])

  // Loading and error states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Reading timer countdown effect
  useEffect(() => {
    let interval
    if (phase === 'reading' && readingTimer > 0) {
      interval = setInterval(() => {
        setReadingTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            // Auto-advance when reading time is up
            moveToNextSection()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [phase, readingTimer])

  // Track when question was shown (for timeSpent calculation)
  const questionStartTime = useRef(null)

  // ============================================================================
  // LIFECYCLE - INITIALIZATION
  // ============================================================================

  /**
   * Initialize Forge Mode on component mount
   *
   * Flow:
   * 1. Call start endpoint
   * 2. Receive first question
   * 3. Display question to user
   */
  useEffect(() => {
    initializeForgeMode()
  }, [sessionId])

  const initializeForgeMode = async () => {
    try {
      setLoading(true)
      setPhase('loading')

      // Initialize session
      const response = await forgeService.start(sessionId)

      // response.data contains the actual question data
      const questionData = response.data || response

      setCurrentQuestion(questionData)
      setProgress(prev => ({
        ...prev,
        current: questionData.sectionNumber,
        total: questionData.totalSections,
      }))

      setPhase('question')
      setQuestionTimer(0) // Ensure timer starts at 0
      questionStartTime.current = Date.now()
    } catch (err) {
      console.error('Error initializing forge mode:', err)
      const errorMessage =
        err.response?.data?.message || 'Failed to start forge mode'
      setError(errorMessage)
      onError?.(errorMessage)

      toast({
        title: t('Error'),
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // USER INTERACTIONS
  // ============================================================================

  /**
   * Handle answer submission
   *
   * Flow:
   * 1. Calculate time spent on question
   * 2. Submit to server for validation
   * 3. If correct: Show reading content
   * 4. If incorrect: Show correct answer
   * 5. Update score and streak
   */
  const handleAnswerSubmit = async answerIndex => {
    // Prevent multiple submissions or submission while loading
    if (selectedAnswer !== null && answerIndex !== null || loading) return

    // If timeout (null index), we don't select any answer visually
    if (answerIndex !== null) {
      // Double check if we already timed out (race condition safety)
      if (isTimeout) return
      setSelectedAnswer(answerIndex)
    }

    try {
      setLoading(true)

      // Calculate time spent on this question
      const timeSpent = Date.now() - questionStartTime.current

      const response = await forgeService.submitAnswer(sessionId, {
        sectionNumber: currentQuestion.sectionNumber,
        // For timeout, send -1 or any invalid index to backend
        answerIndex: answerIndex !== null ? answerIndex : -1,
        timeSpent,
        powerups: {
          scoreSurge: activeEffects.scoreSurge
        }
      })

      if (response.success) {
        const result = response.data
        setAnswerResult(result)

        // Update progress
        const newScore = result.totalScore
        setProgress(prev => ({
          ...prev,
          lastScore: prev.score,
          score: newScore,
          streak: result.streak,
          correctAnswers: prev.correctAnswers + (result.isCorrect ? 1 : 0),
        }))

        // Show feedback phase
        setPhase('feedback')

        // Play audio feedback based on result
        if (result.isCorrect) {
          quizAudioService.playCorrectRevealed()
          haptics.correctAnswer()
        } else {
          quizAudioService.playWrongRevealed()
          haptics.wrongAnswer()
        }

        // ALWAYS show reading content after answer (correct OR incorrect OR timeout)
        setTimeout(() => {
          if (result.readingContent) {
            setReadingContent(result.readingContent)
            setReadingTimer(12) // 12 seconds reading time
            setPhase('reading')
          } else {
            // If no reading content, move to next question immediately
            moveToNextSection()
          }
        }, isTimeout ? 2500 : 1500) // Longer delay for timeout to show banner
      }
    } catch (err) {
      console.error('Error submitting answer:', err)
      const errorMessage =
        err.response?.data?.message || 'Failed to submit answer'

      toast({
        title: t('Error'),
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })

      // Reset for retry
      setSelectedAnswer(null)
      setLoading(false)
    }
  }

  // Handle phase completion
  const handlePhaseComplete = useCallback(() => {
    // Wrap in setTimeout to avoid "update while rendering" warning
    setTimeout(() => {
      onComplete && onComplete()
    }, 0)
  }, [onComplete])

  // Auto-proceed timer for transition screen
  useEffect(() => {
    let interval
    if (isPhaseComplete && transitionTimer > 0) {
      interval = setInterval(() => {
        setTransitionTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            handlePhaseComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPhaseComplete, transitionTimer, handlePhaseComplete])

  /**
   * Move to next section
   *
   * Called after:
   * - Reading timer completes (if correct answer)
   * - Delay after incorrect answer
   *
   * Flow:
   * 1. Call next endpoint
   * 2. Check if forge complete or more sections
   * 3. Load next question or show completion
   */
  const moveToNextSection = async () => {
    // Guard against double calls (race condition when timer expires + user clicks continue)
    if (isTransitioningRef.current) {
      console.log('moveToNextSection: Already transitioning, skipping duplicate call')
      return
    }
    isTransitioningRef.current = true

    try {
      setLoading(true)

      const response = await forgeService.moveNext(sessionId)
      const data = response.data || response

      if (data.completed) {
        // Instead of completing immediately, show transition screen
        quizAudioService.playQuizComplete() // Audio for forge completion
        haptics.success()
        setIsPhaseComplete(true)
        setPhase('complete')
      } else {
        // Load next question (sound already played by Continue button)
        haptics.selection()
        setCurrentQuestion(data)
        setProgress(prev => ({
          ...prev,
          current: data.sectionNumber,
          unlockedSections: data.progress?.unlockedSections || [],
        }))

        // Reset states for next question
        setSelectedAnswer(null)
        setAnswerResult(null)
        setReadingContent(null)
        setIsTimeout(false) // Reset timeout flag
        setContinueLoading(false) // Reset continue button loading state
        setPhase('question')
        setActiveEffects({ scoreSurge: false }) // Reset per-question effects
        setDisabledOptions([])
        setHighlightedAnswer(null)
        setMaxQuestionTime(10) // Reset max time
        setMaxReadingTime(12) // Reset max time
        setQuestionTimer(0) // Reset timer
        questionStartTime.current = Date.now()

        // Reset transition guard for next section
        isTransitioningRef.current = false
      }
    } catch (err) {
      console.error('Error moving to next section:', err)
      const errorMessage =
        err.response?.data?.message || 'Failed to load next section'

      toast({
        title: t('Error'),
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })

      // Reset transition guard on error so user can retry
      isTransitioningRef.current = false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle reading timer completion
   *
   * Called when 24-second reading timer reaches 0
   */
  const handleReadingComplete = useCallback(() => {
    moveToNextSection()
  }, [])

  // Continue button loading state for engaging animation
  const [continueLoading, setContinueLoading] = useState(false)

  /**
   * Handle manual continue (no minimum time required)
   * Plays quick sound and instantly transitions to next section
   */
  const handleManualContinue = () => {
    if (continueLoading) return // Prevent double clicks
    setContinueLoading(true)
    haptics.selection()
    // Play quick 200ms sound (no wait - instant transition)
    quizAudioService.playSubmitFull()
    moveToNextSection()
  }

  // Powerup Handlers
  const handlePowerupClick = async (powerup) => {
    if (usedPowerups[powerup.powerupId]) return

    try {
      // Mark locally as used immediately to prevent double clicks
      setUsedPowerups(prev => ({ ...prev, [powerup.powerupId]: true }))

      // Call API to mark as used on server
      // We do this for ALL powerups now to ensure consistency
      const response = await forgeService.usePowerup(sessionId, powerup.powerupId)

      if (!response.success) {
         throw new Error('Failed to activate powerup')
      }

      // Apply Client-Side Effects with appropriate sounds
      switch (powerup.powerupId) {
        case 'TIME_WARP':
          quizAudioService.playTimeWarp() // Time rewind swoosh
          if (phase === 'question') {
            // Update Max Time ONLY
            // We do NOT rewind the timer anymore. We just extend the finish line.
            setMaxQuestionTime(prev => prev + 15)
          } else if (phase === 'reading') {
            setMaxReadingTime(prev => prev + 15) // Increase max reading time
            // Reading timer counts DOWN. So we just add to it.
            setReadingTimer(prev => prev + 15)
          }
          toast({ title: 'Time Warp Activated!', status: 'info', duration: 2000 })
          break
        case 'SCORE_SURGE':
          quizAudioService.playScoreSurge() // Power boost whoosh
          setActiveEffects(prev => ({ ...prev, scoreSurge: true }))
          toast({ title: 'Score Surge Active!', description: '2x Points for this question', status: 'warning', duration: 2000 })
          break
        case 'ORACLES_EYE':
          quizAudioService.playOraclesEye() // Mystical reveal chime
          // Effects returned from server
          const effect = response.effect
          if (effect.type === 'REMOVE_OPTIONS') {
            setDisabledOptions(prev => [...prev, ...effect.optionsToRemove])
            toast({ title: "Oracle's Eye Activated", description: "Two incorrect options removed!", status: "success" })
          }
          break
        default:
          quizAudioService.playEquip() // Fallback for unknown powerups
          break
      }

      // Notify parent that powerup was used
      onPowerupUsed?.(powerup.powerupId)
    } catch (err) {
      console.error('Error using powerup:', err)
      toast({ title: 'Powerup Failed', description: 'Could not activate powerup', status: 'error' })
      // Revert used state if failed
      setUsedPowerups(prev => {
        const newState = { ...prev }
        delete newState[powerup.powerupId]
        return newState
      })
    }
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Render loading state
   */
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 text-center"
        >
          <Loader2
            className="w-12 h-12 mx-auto mb-4 animate-spin"
            style={{ color: accentColor }}
          />
          <p className="text-white/80 text-lg">
            {t('Preparing your challenge...')}
          </p>
        </motion.div>
      </div>
    )
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-xl bg-red-500/10 rounded-2xl border border-red-500/30 p-8 text-center max-w-md"
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-xl font-bold text-white mb-2">{t('Error')}</h3>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={initializeForgeMode}
            className="px-6 py-2 rounded-lg font-medium text-white backdrop-blur-sm border border-white/20 hover:bg-white/10 transition"
          >
            {t('Try Again')}
          </button>
        </motion.div>
      </div>
    )
  }

  /**
   * Render completion state
   */
  if (phase === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 max-w-2xl w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl text-center mb-6"
          >
            🎉
          </motion.div>

          <h2 className="text-3xl font-bold text-white text-center mb-2">
            {t('Forge Complete!')}
          </h2>
          <p className="text-center text-white/70 mb-8">
            {t("You've successfully unlocked all content. Moving to quiz...")}
          </p>

          <CompletionStats
            totalScore={progress.score}
            correctAnswers={progress.correctAnswers}
            maxStreak={progress.streak}
            accentColor={accentColor}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center text-sm text-white/60"
          >
            {t('Preparing quiz phase...')}
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER - QUESTION & READING PHASES
  // ============================================================================



  return (
    <div className="h-full flex flex-col overflow-hidden text-white bg-transparent">
      {/* Header - Progress & Score (Compact) */}
      <div
        className="flex-none px-4 py-3 border-b border-white/10 bg-black/20 backdrop-blur-md z-10 flex items-center justify-between"
      >
        {/* Left: Progress */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
              {t('forge.progress', 'Progress')}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-white">
                {progress.current + 1}
              </span>
              <span className="text-sm text-white/40">
                / {progress.total}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Timer (Contextual) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {phase === 'reading' ? (
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">
                {t('forge.reading', 'Reading')}
              </span>
              <span className="text-2xl font-black text-white tabular-nums tracking-tight leading-none">
                {readingTimer}s
              </span>
            </div>
          ) : phase === 'question' ? (
            <div className="flex flex-col items-center">
              <span className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${
                questionTimer > 7 ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {t('forge.time', 'Time')}
              </span>
              <span className={`text-2xl font-black tabular-nums tracking-tight leading-none ${
                questionTimer > (maxQuestionTime - 3) ? 'text-red-400' : 'text-white'
              }`}>
                {Math.max(0, maxQuestionTime - questionTimer)}s
              </span>
            </div>
          ) : null}
        </div>

        {/* Right: Score */}
        <ScoreDisplay
          score={progress.score}
          streak={progress.streak}
          lastScore={progress.lastScore}
          accentColor={accentColor}
          compact={true}
        />
      </div>

      {/* Powerups moved to footer dock - removed floating bar */}

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto px-3 md:px-0">
        <div className="max-w-4xl mx-auto py-4 md:py-6">
          {/* Countdown Progress Bar */}
          {(phase === 'question' || phase === 'reading') && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    phase === 'question'
                      ? questionTimer >= 8
                        ? 'bg-red-500'
                        : questionTimer >= 5
                        ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                      : readingTimer <= 3
                      ? 'bg-red-500'
                      : readingTimer <= 6
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}
                  initial={{ width: '100%' }}
                  animate={{
                    width:
                      phase === 'question'
                        ? `${Math.max(0, 100 - (questionTimer / maxQuestionTime) * 100)}%`
                        : `${(readingTimer / maxReadingTime) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: 'linear' }}
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-xs text-white/50">
                <span>
                  {phase === 'question'
                    ? `${Math.max(0, maxQuestionTime - questionTimer)}s remaining`
                    : `${readingTimer}s remaining`}
                </span>
                <span>
                  {phase === 'question'
                    ? 'Answer the question'
                    : 'Read carefully'}
                </span>
              </div>
            </motion.div>
          )}

          {/* Passive Powerup Indicators - shown during question phase */}
          {phase === 'question' && passiveForgePowerups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 flex-wrap mb-4"
            >
              {passiveForgePowerups.map((p, i) => {
                const buffStyles = {
                  STREAK_SHIELD: {
                    color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
                    icon: '🛡️',
                    label: 'Streak Shield Active',
                    description: 'Auto-protects streak'
                  },
                }
                const style = buffStyles[p.powerupId] || {
                  color: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
                  icon: '✨',
                  label: p.powerupId?.replace('_', ' ')
                }

                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, y: -10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${style.color}`}
                  >
                    <span className="text-sm">{style.icon}</span>
                    <span>{style.label}</span>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* QUESTION PHASE */}
            {(phase === 'question' || phase === 'feedback') && currentQuestion && (
              <motion.div
                key={`question-${currentQuestion.sectionNumber}`}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -30 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="w-full"
              >
                {/* Timeout Banner */}
                {phase === 'feedback' && isTimeout && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-amber-500/20 border-2 border-amber-500/50 rounded-xl flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-amber-200 font-bold text-base">
                        Time's Up!
                      </div>
                      <div className="text-amber-300/80 text-sm">
                        Question unanswered - showing correct answer
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Question Card */}
                <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/15 rounded-2xl p-5 md:p-7 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
                  {/* Background Gradient Mesh */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />

                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4 relative z-10">
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg shrink-0 border border-white/10"
                      style={{ background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)` }}
                    >
                      <span style={{ filter: `drop-shadow(0 0 10px ${accentColor})` }}>
                        {currentQuestion.icon}
                      </span>
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 text-white/60 border border-white/5">
                          {category}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-current bg-current/10" style={{ color: accentColor }}>
                          Section {currentQuestion.sectionNumber + 1}
                        </span>
                      </div>
                      <h2 className="text-lg md:text-xl font-bold text-white leading-tight">
                        {currentQuestion.title}
                      </h2>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-5 relative z-10">
                    <p className="text-lg md:text-xl font-normal text-white/95 leading-relaxed">
                      {currentQuestion.question}
                    </p>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = selectedAnswer === index
                      const isCorrectAnswer = answerResult?.correctAnswer === index
                      const showResult = phase === 'feedback'
                      const isTimeout = phase === 'feedback' && selectedAnswer === null && answerResult === null; // Assuming isTimeout is true if feedback phase and no answer was selected

                      // Determine button state
                      let buttonBg = 'bg-white/8'
                      let buttonBorder = 'border-white/15'



                      // Disabled Options (Oracle's Eye)
                      const isEliminated = disabledOptions.includes(index)
                      if (isEliminated) {
                        buttonBg = 'bg-white/5 opacity-50'
                        buttonBorder = 'border-white/5'
                      }

                      let buttonHover = !isEliminated ? 'hover:bg-white/12 hover:border-white/25 hover:shadow-lg hover:-translate-y-1' : ''
                      let buttonIcon = null
                      let buttonShadow = ''
                      let buttonOpacity = ''

                      if (showResult) {
                        if (isCorrectAnswer) {
                          // Correct answer - always green
                          buttonBg = 'bg-emerald-500/20'
                          buttonBorder = 'border-emerald-400/80'
                          buttonShadow = 'shadow-[0_0_40px_rgba(16,185,129,0.5)]'
                          buttonIcon = (
                            <CheckCircle className="w-5 h-5 text-white" />
                          )
                        } else if (isSelected && !isTimeout) {
                          // User selected wrong answer (not timeout)
                          buttonBg = 'bg-red-500/20'
                          buttonBorder = 'border-red-400/80'
                          buttonShadow = 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                          buttonIcon = (
                            <XCircle className="w-5 h-5 text-white" />
                          )
                        } else if (isTimeout) {
                          // Timeout - show neutral/amber state
                          buttonBg = 'bg-white/4'
                          buttonBorder = 'border-white/8'
                          buttonOpacity = 'opacity-40'
                        } else {
                          // Other incorrect answers
                          buttonBg = 'bg-white/4'
                          buttonBorder = 'border-white/8'
                          buttonOpacity = 'opacity-40'
                        }
                        buttonHover = '' // Disable hover effects in feedback phase
                      }

                      return (
                        <motion.button
                          key={index}
                          onClick={() => !isEliminated && handleAnswerSubmit(index)}
                          disabled={loading || phase === 'feedback' || isEliminated}
                          className={`
                            relative w-full text-left p-4 rounded-xl border transition-all duration-300 group flex items-center gap-5 cursor-pointer
                            ${buttonBg} ${buttonBorder} ${buttonHover} ${buttonShadow} ${buttonOpacity}
                            ${isEliminated ? 'cursor-not-allowed grayscale opacity-50' : ''}
                          `}
                          whileHover={!loading && phase !== 'feedback' && !isEliminated ? { scale: 1.01 } : {}}
                          whileTap={!loading && phase !== 'feedback' && !isEliminated ? { scale: 0.99 } : {}}
                          animate={showResult && isCorrectAnswer ? {
                            scale: [1, 1.08, 1],
                            rotate: [0, 2, -2, 0],
                          } : {}}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                          {/* Ripple effect on hover */}
                          {!showResult && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 pointer-events-none"
                              initial={{ x: '-100%' }}
                              whileHover={{ x: '100%' }}
                              transition={{ duration: 0.6, ease: "easeInOut" }}
                            />
                          )}

                          {/* Option Label */}
                          <div
                            className={`
                              w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold shrink-0 transition-all
                              ${showResult && isCorrectAnswer
                                ? 'bg-emerald-500 text-white text-xl'
                                : showResult && isSelected && !isTimeout
                                  ? 'bg-red-500 text-white text-xl'
                                  : 'bg-white/10 text-white/70 group-hover:bg-white/20'
                              }
                            `}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>

                          {/* Option Text */}
                          <div className="flex-1">
                            <span className="text-white font-medium text-base md:text-lg">
                              {option}
                            </span>
                          </div>

                          {/* Result Icon */}
                          {buttonIcon && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 200 }}
                            >
                              {buttonIcon}
                            </motion.div>
                          )}

                          {/* Confetti/Particles for Correct Answer */}
                          {showResult && isCorrectAnswer && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                              {[...Array(20)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
                                  animate={{
                                    opacity: [1, 0],
                                    x: [0, (Math.random() - 0.5) * 200],
                                    y: [0, -Math.random() * 150 - 50],
                                    scale: [0, 1, 0.8],
                                    rotate: [0, Math.random() * 360],
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    delay: i * 0.02,
                                    ease: 'easeOut',
                                  }}
                                  className="absolute top-1/2 left-1/2"
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: accentColor,
                                    boxShadow: `0 0 10px ${accentColor}`,
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* READING PHASE */}
            {phase === 'reading' && readingContent && (
              <motion.div
                key="reading"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="w-full pb-24 md:pb-0"
              >
                {/* Unlocked Header */}
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_40px_rgba(251,191,36,0.4)] mb-3 border-2 border-white/10"
                  >
                    {readingContent.icon}
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-white mb-2"
                  >
                    {readingContent.title}
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest"
                  >
                    <Sparkles className="w-3 h-3" />
                    Content Unlocked
                  </motion.div>
                </div>

                {/* Content Card */}
                <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/15 rounded-2xl p-6 md:p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

                  <div className="prose prose-invert max-w-none">
                    <p className="text-white/95 leading-relaxed whitespace-pre-line font-serif text-base md:text-lg">
                      {readingContent.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed Footer (Actions + Powerups) */}
      <div className="flex-none p-3 md:p-4 border-t border-white/15 bg-black/30 backdrop-blur-3xl z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.3)]">
        <div className="max-w-4xl mx-auto w-full">
          {/* Premium Powerup Dock - shown during question phase */}
          {phase === 'question' && forgePowerups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="mb-4"
            >
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {forgePowerups.map((p, i) => {
                  const isUsed = usedPowerups[p.powerupId]
                  // Color schemes matching the page theme better
                  const colorSchemes = {
                    TIME_WARP: { bg: 'from-cyan-500/90 to-cyan-600/90', border: 'border-cyan-400/50', text: 'Time Warp', icon: '⏳' },
                    SCORE_SURGE: { bg: 'from-amber-500/90 to-amber-600/90', border: 'border-amber-400/50', text: 'Score 2x', icon: '⚡' },
                    ORACLES_EYE: { bg: 'from-fuchsia-500/90 to-fuchsia-600/90', border: 'border-fuchsia-400/50', text: "Oracle's Eye", icon: '🔮' },
                    STREAK_SHIELD: { bg: 'from-emerald-500/90 to-emerald-600/90', border: 'border-emerald-400/50', text: 'Shield', icon: '🛡️' },
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
                      onClick={() => handlePowerupClick(p)}
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

                      {isUsed && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Reading phase actions */}
          {phase === 'reading' ? (
            <div className="w-full flex items-center gap-4">
              <div className="flex-1 hidden md:block">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 24, ease: "linear" }}
                  />
                </div>
              </div>
              <motion.button
                whileHover={readingTimer <= 14 && !continueLoading ? { scale: 1.05 } : {}}
                whileTap={readingTimer <= 14 && !continueLoading ? { scale: 0.95 } : {}}
                onClick={handleManualContinue}
                disabled={readingTimer > 14 || continueLoading}
                className={`
                  w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-white shadow-lg transition-all
                  flex items-center justify-center gap-3 text-lg relative overflow-hidden
                  ${readingTimer > 14
                    ? 'bg-white/10 cursor-not-allowed opacity-50'
                    : continueLoading
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 shadow-emerald-500/40 cursor-wait'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/30'
                  }
                `}
              >
                {/* Animated shimmer effect during loading */}
                {continueLoading && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                )}
                {readingTimer > 14 ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Reading... {readingTimer - 14}s</span>
                  </>
                ) : continueLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </motion.button>
            </div>
          ) : phase === 'question' && forgePowerups.length === 0 ? (
            <div className="w-full flex justify-center">
              <p className="text-xs text-white/30">Select an answer above</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ForgeReadingPhase
