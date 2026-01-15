// SparkMatchmaking.jsx
// Matchmaking screen for Spark Engine session players
// REDESIGNED - Now uses the same UI/UX as GlobalMatchmakingModal for consistency
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useSparkSocket from '../../../customHooks/useSparkSocket'
import { useTranslation } from 'react-i18next'
import { Sparkles, Loader2, Swords } from 'lucide-react'
import axios from 'axios'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'

// Reuse the same sub-components from GlobalMatchmakingModal for consistency
import MatchmakingSearchDisplay from '../globalmatchmaking/components/MatchmakingSearchDisplay'
import BattleReadyDisplay from '../globalmatchmaking/components/BattleReadyDisplay'

// Shadcn components (same as GlobalMatchmakingModal)
import { Badge } from '@/components/ui/badge'

// Matchmaking states
const STATES = {
  SEARCHING: 'searching',
  CREATING: 'creating',  // New state for when battle is being created
  FOUND: 'found',
  ENTERING: 'entering',
  ERROR: 'error',
}

// Modal state configurations (same as GlobalMatchmakingModal)
const MODAL_STATES = {
  searching: {
    borderColor: 'border-emerald-500/60',
    gradientFrom: 'from-emerald-500/10',
    badgeColor: 'bg-emerald-500',
    shadow: 'shadow-emerald-500/20',
  },
  creating: {
    borderColor: 'border-purple-500/60',
    gradientFrom: 'from-purple-500/10',
    badgeColor: 'bg-purple-500',
    shadow: 'shadow-purple-500/30',
  },
  ready: {
    borderColor: 'border-cyan-500/60',
    gradientFrom: 'from-cyan-500/10',
    badgeColor: 'bg-cyan-500',
    shadow: 'shadow-cyan-500/30',
  },
  entering: {
    borderColor: 'border-purple-500/60',
    gradientFrom: 'from-purple-500/10',
    badgeColor: 'bg-purple-500',
    shadow: 'shadow-purple-500/30',
  },
  error: {
    borderColor: 'border-red-500/60',
    gradientFrom: 'from-red-500/10',
    badgeColor: 'bg-red-500',
    shadow: 'shadow-red-500/30',
  },
}

// Confetti configuration (same as GlobalMatchmakingModal)
const CONFETTI_COLORS = ['text-cyan-400', 'text-yellow-400', 'text-purple-400']
const CONFETTI_COUNT = 10

// Countdown duration (5 seconds)
const COUNTDOWN_SECONDS = 5



const SparkMatchmaking = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation('QuickClash')
  const { team, matchmakingId } = location.state || {}

  const [state, setState] = useState(STATES.SEARCHING)
  const [matchmakingTime, setMatchmakingTime] = useState(0)
  const [battleReady, setBattleReady] = useState(null)
  const [error, setError] = useState('')
  const [statusUpdates, setStatusUpdates] = useState([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)

  const matchFoundSoundPlayedRef = useRef(false)
  const hasLeftMatchmakingRef = useRef(false)
  const stateRef = useRef(state)
  const mountTimeRef = useRef(Date.now())

  // === DEBUG: Log navigation state on mount/unmount ===
  useEffect(() => {
    console.log('[SparkMatchmaking] MOUNT - history:', window.history.length, 'team:', team?._id)
    return () => {
      console.log('[SparkMatchmaking] UNMOUNT - URL:', window.location.href, 'history:', window.history.length)
    }
  }, [])

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Format matchmaking time (same as GlobalMatchmakingModal)
  const formatMatchmakingTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Use shared socket from SparkLayout
  const { addEventListener, isConnected, emit } = useSparkSocket()

  // Initialize socket event listeners
  useEffect(() => {
    // Check matchmaking status on mount - handles page refresh
    // NOTE: Must ALWAYS check, because browser preserves location.state on refresh
    // but team may no longer be in matchmaking on backend
    const checkMatchmakingStatus = async () => {
      try {
        const sessionId = localStorage.getItem('playSessionId')
        const response = await axios.get('/api/play/matchmaking/status', {
          headers: { 'X-Session-Id': sessionId }
        })

        if (!response.data.success || !response.data.inMatchmaking) {
          // Not in matchmaking - redirect to lobby
          console.log('[SparkMatchmaking] Not in matchmaking, redirecting to lobby')
          navigate('/play/lobby', {
            state: {
              session: { sessionId },
              teamCode: localStorage.getItem('sparkTeamCode'),
            },
            replace: true,
          })
          return false
        }

        // If battle is ready, redirect to battle
        if (response.data.status === 'battleReady' && response.data.battleId) {
          navigate(`/play/battle/${response.data.battleId}`, {
            state: { battleId: response.data.battleId },
            replace: true,
          })
          return false
        }

        return true // Still in matchmaking
      } catch (error) {
        console.error('Matchmaking status check failed:', error)
        return true // Continue if check fails
      }
    }

    // Always check matchmaking status on mount
    // This handles refresh where browser preserves state but backend state changed
    checkMatchmakingStatus().then(inMatchmaking => {
      if (!inMatchmaking) return

      // If no team/matchmakingId from state (shouldn't happen normally), redirect to lobby
      if (!team || !matchmakingId) {
        navigate('/play/lobby', { replace: true })
      }
    })

    // Register with server for disconnect cleanup
    // This sets socket.sparkTeamId on server so it can clean up matchmaking if we disconnect
    emit('spark:joinMatchmaking', { teamId: team._id, matchmakingId })

    // Listen for matchmaking locked (creating battle)
    const cleanupLocked = addEventListener('quickClash:matchmakingLocked', (data) => {
      if (data.status === 'creating_battle') {
        setState(STATES.CREATING)
      }
    })

    // Listen for match found
    const cleanupMatchFound = addEventListener('quickClash:matchFound', (data) => {
      setState(STATES.FOUND)

      // Store battleId for non-upgraded session players so they can return to battle
      // if they close/reopen the app before completing the quiz
      if (localStorage.getItem('sparkUpgraded') !== 'true') {
        localStorage.setItem('sparkActiveBattleId', data.battleId)
      }

      setBattleReady({
        battleId: data.battleId,
        teamId: team._id,
        teamA: data.teamA,
        teamB: data.teamB,
        teamAMembers: data.teamAMembers || [],
        teamBMembers: data.teamBMembers || [],
        winProbability: data.winProbability,
        opponent: data.opponent,
      })

      // Play sound and show celebration
      if (!matchFoundSoundPlayedRef.current) {
        quizAudioService.playMatchFound()
        matchFoundSoundPlayedRef.current = true
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)
      }
    })

    // Note: quickClash:teamLeftMatchmaking is now handled centrally in useQuickClashSocket.js
    // which navigates session players on /play/* routes to /play/lobby automatically

    // Listen for errors
    const cleanupError = addEventListener('quickClash:matchmakingError', (data) => {
      setState(STATES.ERROR)
      setError(data.error)
    })

    return () => {
      cleanupLocked()
      cleanupMatchFound()
      cleanupError()

      // Leave matchmaking on unmount if user navigates away (intentional leave)
      const mountDuration = Date.now() - mountTimeRef.current
      const MIN_MOUNT_DURATION_MS = 2000

      if (mountDuration < MIN_MOUNT_DURATION_MS) return

      if (!hasLeftMatchmakingRef.current && stateRef.current !== STATES.ENTERING && stateRef.current !== STATES.FOUND) {
        const sessionId = localStorage.getItem('playSessionId')
        if (sessionId && team?._id) {
          // Set flag so SparkLobby doesn't redirect back (race condition prevention)
          sessionStorage.setItem('sparkLeftMatchmaking', 'true')

          axios.post(
            `/api/quickClash/team/${team._id}/matchmaking/leave`,
            {},
            { headers: { 'X-Session-Id': sessionId } }
          ).catch(() => {/* ignore */})
        }
        hasLeftMatchmakingRef.current = true
      }
    }
  }, [team, matchmakingId, navigate, addEventListener])

  // Handle browser close/refresh - leave matchmaking
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use stateRef to get latest state
      if (!hasLeftMatchmakingRef.current && stateRef.current !== STATES.ENTERING && stateRef.current !== STATES.FOUND) {
        console.log('[SparkMatchmaking] Leaving matchmaking on page unload via API')

        // Use sendBeacon for reliable delivery on page unload
        const sessionId = localStorage.getItem('playSessionId')
        if (sessionId && team?._id) {
          // sendBeacon is more reliable for unload events
          const data = JSON.stringify({ sessionId })
          navigator.sendBeacon(
            `/api/quickClash/team/${team._id}/matchmaking/leave`,
            new Blob([data], { type: 'application/json' })
          )
        }

        hasLeftMatchmakingRef.current = true
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [team, matchmakingId])

  // Search timer (only during SEARCHING state)
  useEffect(() => {
    if (state !== STATES.SEARCHING && state !== STATES.CREATING) return

    const interval = setInterval(() => {
      setMatchmakingTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [state])

  // Countdown timer when match is found
  useEffect(() => {
    if (state !== STATES.FOUND || !battleReady?.battleId) return

    // Reset countdown
    setCountdown(COUNTDOWN_SECONDS)

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [state, battleReady?.battleId])

  // Auto-progress to battle when countdown reaches 0
  useEffect(() => {
    if (state === STATES.FOUND && countdown === 0 && battleReady?.battleId) {
      // Mark as "left" since we're entering the battle (don't try to leave on unmount)
      hasLeftMatchmakingRef.current = true

      quizAudioService.playGoButton()
      setState(STATES.ENTERING)

      // Navigate to battle arena after brief entering animation
      setTimeout(() => {
        navigate(`/play/battle/${battleReady.battleId}`, {
          state: {
            battleId: battleReady.battleId,
            team: team,
            opponent: battleReady.opponent,
          }
        })
      }, 1000)
    }
  }, [state, countdown, battleReady, navigate, team])

  // Add periodic status updates (same pattern as GlobalMatchmakingModal)
  useEffect(() => {
    if (state !== STATES.SEARCHING && state !== STATES.CREATING) return

    // Add initial status
    setStatusUpdates([{ message: t('Joining matchmaking...'), time: 0 }])

    const updateInterval = setInterval(() => {
      const timeElapsed = Math.floor((Date.now() - mountTimeRef.current) / 1000)
      const updatesPool = state === STATES.CREATING
        ? [
            t('Creating your battle arena...'),
            t('Setting up the match...'),
            t('Almost ready...'),
          ]
        : [
            t('Searching for players with similar skill level...'),
            t('Finding an opponent team to battle against...'),
            t('Matching you with players of similar skill'),
          ]
      const randomMessage = updatesPool[Math.floor(Math.random() * updatesPool.length)]
      setStatusUpdates(prev => [...prev.slice(-2), { message: randomMessage, time: timeElapsed }])
    }, 15000)

    return () => clearInterval(updateInterval)
  }, [state, t])

  // Go back to lobby after error
  const handleBackToLobby = useCallback(() => {
    navigate('/play/lobby', { state: { session: { sessionId: localStorage.getItem('playSessionId') } } })
  }, [navigate])

  // Determine current modal state for styling
  const getModalState = () => {
    switch (state) {
      case STATES.ERROR: return MODAL_STATES.error
      case STATES.FOUND: return MODAL_STATES.ready
      case STATES.ENTERING: return MODAL_STATES.entering
      case STATES.CREATING: return MODAL_STATES.creating
      default: return MODAL_STATES.searching
    }
  }

  const modalState = getModalState()

  // Get header title based on state
  const getHeaderTitle = () => {
    switch (state) {
      case STATES.FOUND: return t('Battle Ready!')
      case STATES.ENTERING: return t('Entering Arena...')
      case STATES.ERROR: return t('Matchmaking Failed')
      case STATES.CREATING: return t('Creating Battle...')
      default: return t('4v4 Matchmaking')
    }
  }

  // Get badge text based on state
  const getBadgeText = () => {
    switch (state) {
      case STATES.FOUND: return t('Ready')
      case STATES.ENTERING: return t('Loading')
      case STATES.ERROR: return t('Error')
      case STATES.CREATING: return t('Creating')
      default: return t('Active')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-5">
      {/* Card Container (same style as GlobalMatchmakingModal DialogContent) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`
          relative
          bg-gradient-to-b from-slate-900/95 to-slate-950/98
          backdrop-blur-2xl
          border ${modalState.borderColor}
          shadow-2xl ${modalState.shadow}
          rounded-2xl
          max-w-md
          w-full
          overflow-hidden
          flex flex-col
        `}
      >
        {/* Subtle gradient overlay */}
        <div
          className={`
            absolute inset-0
            bg-gradient-to-br
            ${modalState.gradientFrom}
            to-transparent
            opacity-50
            pointer-events-none
          `}
        />

        {/* Header - No close button */}
        <div className="relative z-10 pt-6 px-6 pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-center gap-3">
            <span className="text-xl font-bold text-white">
              {getHeaderTitle()}
            </span>

            {/* Status badge */}
            <Badge
              className={`
                ${modalState.badgeColor} text-white
                rounded-full px-3 py-1 text-xs font-bold
                shadow-lg
              `}
            >
              {getBadgeText()}
            </Badge>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative z-10 overflow-y-auto px-6 py-6" style={{ WebkitOverflowScrolling: 'touch' }}>
          <AnimatePresence mode="wait">
            {/* Searching State - Uses MatchmakingSearchDisplay */}
            {state === STATES.SEARCHING && (
              <motion.div
                key="searching"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MatchmakingSearchDisplay
                  matchmakingTime={matchmakingTime}
                  statusUpdates={statusUpdates}
                  formatMatchmakingTime={formatMatchmakingTime}
                />
              </motion.div>
            )}

            {/* Creating Battle State */}
            {state === STATES.CREATING && (
              <motion.div
                key="creating"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-6 py-8"
              >
                {/* Animated spinner with glow */}
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-purple-500/20"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.2, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{ width: 80, height: 80 }}
                  />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-10 h-10 text-purple-400" />
                    </motion.div>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-white text-xl font-bold mb-1">
                    {t('Creating Battle')}
                  </h3>
                  <p className="text-white/50 text-sm">
                    {t('Setting up your 4v4 arena')}
                  </p>
                </div>

                {/* Time in queue */}
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <span>{t('Time in queue:')}</span>
                  <span className="text-purple-400 font-bold tabular-nums">
                    {formatMatchmakingTime(matchmakingTime)}
                  </span>
                </div>

                {/* Warning */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <Swords className="w-4 h-4 text-orange-400" />
                  <p className="text-orange-300 text-xs font-medium">
                    {t('Please wait, battle will be ready shortly')}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Match Found State - Uses BattleReadyDisplay + Countdown */}
            {state === STATES.FOUND && battleReady && (
              <motion.div
                key="found"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <BattleReadyDisplay
                  battleReady={battleReady}
                  matchmakingTime={matchmakingTime}
                  formatMatchmakingTime={formatMatchmakingTime}
                />
              </motion.div>
            )}

            {/* Entering Battle State */}
            {state === STATES.ENTERING && (
              <motion.div
                key="entering"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-3 border-white/10 border-t-cyan-400 rounded-full"
                />
                <h2 className="text-xl font-bold text-white">{t('Entering Battle Arena...')}</h2>
                <p className="text-white/50 text-sm">{t('Prepare for battle!')}</p>
              </motion.div>
            )}

            {/* Error State */}
            {state === STATES.ERROR && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-6"
              >
                <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400/60 flex items-center justify-center">
                  <span className="text-3xl">❌</span>
                </div>
                <h2 className="text-xl font-bold text-red-400">{t('Matchmaking Failed')}</h2>
                <p className="text-white/60 text-center text-sm">{error}</p>
                <button
                  onClick={handleBackToLobby}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all"
                >
                  {t('Back to Lobby')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer - Countdown Timer (only when match found) */}
        <div className="relative z-10 border-t border-white/10 p-6 flex-shrink-0">
          {state === STATES.ENTERING ? (
            <div className="flex items-center justify-center gap-3 w-full">
              <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/70 text-sm">{t('Entering battle arena...')}</p>
            </div>
          ) : state === STATES.FOUND && battleReady ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              {/* Countdown Timer Display */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-white/60 text-sm">
                  {t('Entering arena in')}
                </p>
                <motion.div
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-600/10 border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                >
                  <span className="text-3xl font-bold text-cyan-300">{countdown}</span>
                </motion.div>
                <p className="text-white/40 text-xs">
                  {t('Get ready for battle!')}
                </p>
              </div>
            </motion.div>
          ) : state === STATES.CREATING ? (
            <div className="flex items-center justify-center gap-3 w-full">
              <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/70 text-sm">{t('Creating battle arena...')}</p>
            </div>
          ) : state === STATES.ERROR ? null : (
            <div className="flex items-center justify-center gap-3 w-full">
              <p className="text-white/50 text-sm">{t('Looking for opponents...')}</p>
            </div>
          )}
        </div>

        {/* Celebration confetti effect (same as GlobalMatchmakingModal) */}
        <AnimatePresence>
          {showCelebration && state === STATES.FOUND && (
            <>
              {[...Array(CONFETTI_COUNT)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    y: 0,
                    x: `${(i * 10) % 100}%`,
                    scale: 0.5 + (i % 3) * 0.25,
                  }}
                  animate={{
                    opacity: 0,
                    y: 400,
                    rotate: 180 + i * 36,
                  }}
                  transition={{
                    duration: 2 + (i % 3),
                    ease: 'easeIn',
                  }}
                  className="absolute top-0 z-50 pointer-events-none"
                  style={{ left: `${(i * 10) % 100}%` }}
                >
                  <Sparkles className={`w-4 h-4 ${CONFETTI_COLORS[i % 3]}`} />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default SparkMatchmaking
