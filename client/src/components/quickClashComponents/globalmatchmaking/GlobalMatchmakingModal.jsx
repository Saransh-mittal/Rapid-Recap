// components/quickClashComponents/globalmatchmaking/GlobalMatchmakingModal.jsx
// FIXED: Added scrollable content area and proper z-index above FloatingActionMenu
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  Users,
  Activity,
  Zap,
  RefreshCw,
  X,
  Sparkles,
  Trophy,
  Shield,
  Target,
  Swords,
} from 'lucide-react'
import axios from 'axios'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'

import {
  QUICK_CLASH_CLASSES,
  QUICK_CLASH_COLORS,
} from '../utils/quickClashColors'
import TeamWinProbabilityDisplay from '../ui/TeamWinProbabilityDisplay'
import useQuickClashGlobalMatchmaking from '../../../customHooks/useQuickClashGlobalMatchmaking'
import {
  resetGlobalMatchmakingState,
  setBattleReady,
  handleBattleCreationCleanup as handleBattleCreationCleanupAction,
  clearBattleCreationState,
  addStatusUpdate,
  clearStatusUpdates,
  setShouldRefetchTeams,
  setToastNotification,
  clearToastNotification,
  setBattleCreationError,
} from '../../../redux/quickClashGlobalMatchmakingSlice'

// Sub-components
import MatchmakingStatusDisplay from './components/MatchmakingStatusDisplay'
import TeamSelectionPanel from './components/TeamSelectionPanel'

// Shadcn components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const MotionDiv = motion.div

/**
 * Modal state configurations for premium visual feedback
 */
const MODAL_STATES = {
  idle: {
    icon: Shield,
    iconColor: 'text-teal-400',
    borderColor: 'border-teal-500/60',
    gradientFrom: 'from-teal-500/10',
    badgeColor: 'bg-teal-500',
    title: 'Join 4v4 Matchmaking',
  },
  searching: {
    icon: Activity,
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/60',
    gradientFrom: 'from-emerald-500/10',
    badgeColor: 'bg-emerald-500',
    title: '4v4 Matchmaking Active',
  },
  ready: {
    icon: Zap,
    iconColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/60',
    gradientFrom: 'from-cyan-500/10',
    badgeColor: 'bg-cyan-500',
    title: 'Battle Ready!',
  },
  failed: {
    icon: X,
    iconColor: 'text-red-400',
    borderColor: 'border-red-500/60',
    gradientFrom: 'from-red-500/10',
    badgeColor: 'bg-red-500',
    title: 'Battle Creation Failed',
  },
}

// Performance: Extracted animation configs outside component
const ANIMATION_CONFIGS = {
  ready: {
    scale: [1, 1.2, 1],
    rotate: [0, 10, -10, 0],
  },
  searching: { rotate: 360 },
  idle: {},
}

const TRANSITION_CONFIGS = {
  ready: { duration: 1, repeat: 2, ease: 'easeInOut' },
  searching: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  idle: { duration: 0 },
}

// Performance: Static style objects extracted to prevent recreation
const SCROLL_CONTAINER_STYLE = { WebkitOverflowScrolling: 'touch' }
const DIALOG_Z_INDEX_STYLE = { zIndex: 10000 }

// Performance: Reduced confetti count and pre-calculated positions
const CONFETTI_COLORS = ['text-cyan-400', 'text-yellow-400', 'text-purple-400']
const CONFETTI_COUNT = 10 // Reduced from 20

/**
 * GlobalMatchmakingModal - FIXED VERSION
 *
 * Fixes Applied:
 * 1. Added scrollable content area with max-height
 * 2. Increased z-index to 10000 (above FloatingActionMenu at 9999)
 * 3. Proper overflow handling for mobile devices
 */
const GlobalMatchmakingModal = React.memo(
  ({ isOpen, onClose, isEmbedded = false }) => {
    const { t } = useTranslation('QuickClash')
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch()

    const [myTeams, setMyTeams] = useState([])
    const [loadingTeams, setLoadingTeams] = useState(false)
    const [toastShown, setToastShown] = useState(false)
    const [showCelebration, setShowCelebration] = useState(false)

    const pollingIntervalRef = useRef(null)
    const mountTimeRef = useRef(Date.now())
    const matchFoundSoundPlayedRef = useRef(false) // Track if sound was played

    const {
      inMatchmaking,
      matchmakingType,
      selectedTeamId,
      teamName,
      joinType,
      originalTeam,
      battleReady,
      loading,
      matchmakingTime,
      battleCreationStatus,
      battleCreationError,
      statusUpdates,
      shouldRefetchTeams,
      showToast,
      checkMatchmakingStatus,
      pollMatchmakingStatus,
      joinSoloMatchmaking,
      joinWithTeam,
      leaveMatchmaking,
      selectTeam,
      enterBattle,
      clearBattleReady,
      formatMatchmakingTime,
      checkCanLeaveMatchmaking,
      retryAfterFailure,
    } = useQuickClashGlobalMatchmaking()

    // Extract win probability data
    const winProbability = useMemo(() => {
      if (!battleReady || !user) return null

      const userTeamId = battleReady.teamId || selectedTeamId
      if (!userTeamId || !battleReady.winProbability) return null

      const isTeamA =
        battleReady.teamA?._id === userTeamId ||
        battleReady.teamA === userTeamId
      const myTeamProb = isTeamA
        ? battleReady.winProbability.teamA
        : battleReady.winProbability.teamB

      if (!myTeamProb) return null

      return {
        currentProbability: myTeamProb.initial || 0.5,
        initialProbability: myTeamProb.initial || 0.5,
        certaintyScore: 0,
        completedChallenges: 0,
        totalChallenges: 4,
      }
    }, [battleReady, user, selectedTeamId])

    // Show celebration effect when battle becomes ready
    useEffect(() => {
      if (battleReady && !showCelebration) {
        setShowCelebration(true)
        // Only play sound once per battleReady
        if (!matchFoundSoundPlayedRef.current) {
          quizAudioService.playMatchFound()
          matchFoundSoundPlayedRef.current = true
        }
        setTimeout(() => setShowCelebration(false), 3000)
      }
      // Reset sound played flag when battle is no longer ready
      if (!battleReady) {
        matchFoundSoundPlayedRef.current = false
      }
    }, [battleReady, showCelebration])

    // Handle toast notifications
    useEffect(() => {
      if (showToast && !toastShown) {
        setToastShown(true)
        setTimeout(() => {
          dispatch(clearToastNotification())
          setToastShown(false)
        }, 3000)
      }
    }, [showToast, toastShown, dispatch])

    // Handle team refetching
    useEffect(() => {
      if (shouldRefetchTeams) {
        fetchMyTeams()
        dispatch(setShouldRefetchTeams(false))
      }
    }, [shouldRefetchTeams, dispatch])

    // Fetch user's teams (supports both authenticated users and session players)
    const fetchMyTeams = useCallback(async () => {
      try {
        setLoadingTeams(true)

        // Check if session player
        const sessionId = localStorage.getItem('playSessionId')

        if (sessionId) {
          // Session player - fetch their team from play API
          const response = await axios.get('/api/play/my-team', {
            headers: { 'X-Session-Id': sessionId }
          })
          if (response.data?.success && response.data?.team) {
            // Transform to match the expected teams array format
            setMyTeams([{
              _id: response.data.team._id,
              name: response.data.team.name || 'Your Team',
              teamCode: response.data.team.teamCode,
              memberCount: response.data.team.memberCount || response.data.team.members?.length || 1,
              members: response.data.team.members || [],
              isSessionPlayerTeam: true,
            }])
          } else {
            setMyTeams([])
          }
        } else if (user?._id) {
          // Authenticated user - use standard teams endpoint
          const response = await axios.get('/api/quickClash/teams')
          setMyTeams(response.data?.teams || [])
        } else {
          setMyTeams([])
        }
      } catch (error) {
        console.error('Error fetching teams:', error)
        setMyTeams([])
      } finally {
        setLoadingTeams(false)
      }
    }, [user?._id])

    // Initialize on mount
    useEffect(() => {
      if (isOpen) {
        mountTimeRef.current = Date.now()
        dispatch(clearStatusUpdates())
        checkMatchmakingStatus()
        fetchMyTeams()
      }
    }, [isOpen, user, checkMatchmakingStatus, fetchMyTeams, dispatch])

    // Poll for matchmaking status updates only (battle ready comes from socket)
    useEffect(() => {
      // Don't poll if battle is already ready (socket delivered it)
      if (inMatchmaking && isOpen && !battleReady) {
        pollingIntervalRef.current = setInterval(async () => {
          try {
            const statusData = await pollMatchmakingStatus()

            // If battle is ready, socket will handle it - just stop polling
            if (statusData?.status === 'battleReady') {
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
                pollingIntervalRef.current = null
              }
              // Don't dispatch setBattleReady here - socket is authoritative
              return
            }

            // Add contextual status updates
            let updateMessage = t('Checking for updates...')
            if (statusData?.status === 'searching_players') {
              updateMessage = t(
                'Searching for players with similar skill level...',
              )
            } else if (statusData?.status === 'forming_team') {
              updateMessage = t('Found players! Forming your team...')
            } else if (statusData?.status === 'team_completed') {
              updateMessage = t(
                'Team formed successfully! Looking for opponents...',
              )
            } else if (statusData?.status === 'matching_teams') {
              updateMessage = t('Finding an opponent team to battle against...')
            } else if (statusData?.status === 'preparing_battle') {
              updateMessage = t('Match found! Setting up your battle arena...')
            } else if (statusData?.teamMembersCount) {
              updateMessage = t('Team has {{count}} of 4 players', {
                count: statusData?.teamMembersCount,
              })
            } else if (statusData?.soloPlayersInQueue) {
              updateMessage = t('{{count}} players searching globally', {
                count: statusData?.soloPlayersInQueue,
              })
            }

            const timeElapsed = Math.floor(
              (Date.now() - mountTimeRef.current) / 1000,
            )
            dispatch(
              addStatusUpdate({
                message: updateMessage,
                time: timeElapsed,
              }),
            )
          } catch (error) {
            console.error('Error polling matchmaking status:', error)
          }
        }, 15000)

        return () => {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
        }
      }
    }, [inMatchmaking, isOpen, battleReady, pollMatchmakingStatus, t, dispatch])

    // Fallback polling during battle creation phase (catches missed socket events)
    useEffect(() => {
      // Only poll when battle is being created - socket may have failed to deliver event
      if (battleCreationStatus === 'creating' && isOpen && !battleReady) {
        const creationPollingInterval = setInterval(async () => {
          try {
            const statusData = await pollMatchmakingStatus()

            // If battle is ready but socket missed it - update state
            if (statusData?.status === 'battleReady') {
              console.log(
                '[FALLBACK_POLL] Socket missed battleReady event - updating from poll',
              )
              dispatch(
                setBattleReady({
                  battleId: statusData.battleId,
                  teamId: statusData.teamId,
                  teamA: statusData.teamA,
                  teamB: statusData.teamB,
                  winProbability: statusData.winProbability,
                }),
              )
              clearInterval(creationPollingInterval)
              return
            }

            // Still creating - backend confirms battle is in progress
            if (statusData?.status === 'battleCreating') {
              console.log('[FALLBACK_POLL] Battle still being created...')
              return
            }

            // If user is no longer in matchmaking and no battle - creation may have failed silently
            if (statusData?.status === null && !statusData?.inMatchmaking) {
              console.log(
                '[FALLBACK_POLL] Detected possible silent failure - no battle, not in matchmaking',
              )
              dispatch(
                setBattleCreationError(
                  t(
                    'Battle creation may have failed. Please try joining matchmaking again.',
                  ),
                ),
              )
              clearInterval(creationPollingInterval)
              return
            }
          } catch (error) {
            console.error('[FALLBACK_POLL] Error during fallback poll:', error)
          }
        }, 15000) // Poll every 15 seconds

        return () => clearInterval(creationPollingInterval)
      }
    }, [
      battleCreationStatus,
      isOpen,
      battleReady,
      pollMatchmakingStatus,
      dispatch,
      t,
    ])

    const handleJoinMatchmaking = useCallback(async () => {
      quizAudioService.playGoButton() // Energetic sound for starting matchmaking
      try {
        mountTimeRef.current = Date.now()
        dispatch(
          addStatusUpdate({
            message: t('Joining matchmaking...'),
            time: 0,
          }),
        )

        let result
        if (selectedTeamId) {
          result = await joinWithTeam(selectedTeamId)
        } else {
          result = await joinSoloMatchmaking()
        }

        // If we were already in matchmaking, don't show success - the hook already updated state
        if (result?.alreadyInMatchmaking) {
          dispatch(
            addStatusUpdate({
              message: t('Resuming matchmaking search...'),
              time: Math.floor((Date.now() - mountTimeRef.current) / 1000),
            }),
          )
        } else {
          dispatch(
            addStatusUpdate({
              message: t('Successfully joined matchmaking'),
              time: Math.floor((Date.now() - mountTimeRef.current) / 1000),
            }),
          )
        }
      } catch (error) {
        console.error('Error joining matchmaking:', error)
      }
    }, [selectedTeamId, joinWithTeam, joinSoloMatchmaking, t, dispatch])

    const handleLeaveMatchmaking = useCallback(async () => {
      const canLeave = await checkCanLeaveMatchmaking()
      if (!canLeave) return

      quizAudioService.playDismiss() // Dismiss sound for leaving
      try {
        const result = await leaveMatchmaking()

        // Only close modal if leave was successful or user is already out
        if (result?.success || result?.reason === 'ALREADY_LEFT') {
          dispatch(clearStatusUpdates())
          onClose()
        }

        // If match was found, don't close - the battleReady state will update the UI
        // If system busy/network error, don't close - user can retry
      } catch (error) {
        console.error('Error leaving matchmaking:', error)
        // Error already handled by hook with notification
      }
    }, [checkCanLeaveMatchmaking, leaveMatchmaking, onClose, dispatch])

    const handleRetryAfterFailure = useCallback(async () => {
      try {
        if (retryAfterFailure) {
          await retryAfterFailure()
        } else {
          dispatch(clearBattleCreationState())
        }
        dispatch(clearStatusUpdates())
        mountTimeRef.current = Date.now()
      } catch (error) {
        console.error('Error during retry:', error)
      }
    }, [retryAfterFailure, dispatch])

    const handleClose = useCallback(() => {
      quizAudioService.playDismiss() // Dismiss sound for closing modal
      if (battleReady) clearBattleReady()
      if (battleCreationStatus === 'failed')
        dispatch(clearBattleCreationState())
      onClose()
    }, [battleReady, battleCreationStatus, clearBattleReady, dispatch, onClose])

    // Determine current modal state for styling
    const modalState = useMemo(() => {
      if (battleCreationStatus === 'failed') return MODAL_STATES.failed
      if (battleReady) return MODAL_STATES.ready
      if (inMatchmaking) return MODAL_STATES.searching
      return MODAL_STATES.idle
    }, [battleReady, inMatchmaking, battleCreationStatus])

    const HeaderIcon = modalState.icon

    const content = (
      <>
        {!isEmbedded && (
          <DialogHeader className="relative z-10 pt-6 px-6 pb-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Animated header icon */}
                <motion.div
                  animate={
                    modalState === MODAL_STATES.ready
                      ? ANIMATION_CONFIGS.ready
                      : modalState === MODAL_STATES.searching
                      ? ANIMATION_CONFIGS.searching
                      : ANIMATION_CONFIGS.idle
                  }
                  transition={
                    modalState === MODAL_STATES.ready
                      ? TRANSITION_CONFIGS.ready
                      : modalState === MODAL_STATES.searching
                      ? TRANSITION_CONFIGS.searching
                      : TRANSITION_CONFIGS.idle
                  }
                >
                  <HeaderIcon className={`w-6 h-6 ${modalState.iconColor}`} />
                </motion.div>

                <DialogTitle
                  className={`text-xl font-bold ${QUICK_CLASH_CLASSES.textPrimary}`}
                >
                  {t(modalState.title)}
                </DialogTitle>

                {/* Status badge */}
                {(inMatchmaking ||
                  battleReady ||
                  battleCreationStatus === 'failed') && (
                  <Badge
                    className={`
                      ${modalState.badgeColor} text-white
                      rounded-full px-3 py-1 text-xs font-bold
                      shadow-lg
                    `}
                  >
                    {battleReady
                      ? t('Ready')
                      : battleCreationStatus === 'failed'
                      ? t('Error')
                      : t('Active')}
                  </Badge>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
        )}

        {/* FIXED: Scrollable content area with proper max-height */}
        <div
          className="
            relative z-10
            overflow-y-auto
            max-h-[calc(90vh-180px)]
            md:max-h-[calc(85vh-180px)]
            px-6 py-6
          "
          style={SCROLL_CONTAINER_STYLE}
        >
          <div className="space-y-6">
            {/* Main status display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${battleReady}-${inMatchmaking}-${battleCreationStatus}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MatchmakingStatusDisplay
                  inMatchmaking={inMatchmaking}
                  battleReady={battleReady}
                  battleCreationStatus={battleCreationStatus}
                  battleCreationError={battleCreationError}
                  matchmakingTime={matchmakingTime}
                  teamName={teamName}
                  joinType={joinType}
                  originalTeam={originalTeam}
                  statusUpdates={statusUpdates}
                  formatMatchmakingTime={formatMatchmakingTime}
                />
              </motion.div>
            </AnimatePresence>

            {/* Team Selection Panel */}
            {!inMatchmaking &&
              !battleReady &&
              battleCreationStatus !== 'failed' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <TeamSelectionPanel
                    myTeams={myTeams}
                    loadingTeams={loadingTeams}
                    selectedTeamId={selectedTeamId}
                    onSelectTeam={selectTeam}
                  />
                </motion.div>
              )}
          </div>
        </div>

        <DialogFooter className="relative z-10 border-t border-white/10 p-6 flex-shrink-0">
          {battleCreationStatus === 'creating' ? (
            <div className="flex items-center justify-center gap-3 w-full">
              <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <p className={`${QUICK_CLASH_CLASSES.textSecondary} text-sm`}>
                {t('Creating your epic battle arena...')}
              </p>
            </div>
          ) : battleCreationStatus === 'failed' ? (
            <div className="flex gap-3 w-full justify-end">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                {t('Close')}
              </Button>
              <Button
                onClick={handleRetryAfterFailure}
                className={`
                  ${QUICK_CLASH_CLASSES.btnSecondary}
                  ${QUICK_CLASH_CLASSES.focusRing}
                  shadow-lg shadow-blue-500/30
                `}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('Try Again')}
              </Button>
            </div>
          ) : battleReady ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <Button
                size="lg"
                onClick={() => { quizAudioService.playGoButton(); enterBattle() }}
                className={`
                  w-full
                  bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600
                  hover:from-cyan-600 hover:via-cyan-700 hover:to-blue-700
                  text-white font-extrabold
                  rounded-2xl
                  py-7
                  text-lg
                  border-2 border-cyan-400/50
                  shadow-2xl shadow-cyan-500/40
                  hover:shadow-cyan-500/60
                  ${QUICK_CLASH_CLASSES.transformHover}
                  ${QUICK_CLASH_CLASSES.focusRing}
                  relative overflow-hidden
                  group
                `}
              >
                {/* Animated shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />

                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Swords className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  {t('Enter Battle Arena')}
                  <Trophy className="w-5 h-5 text-yellow-300 group-hover:scale-110 transition-transform" />
                </span>
              </Button>

              {/* Quick tip */}
              <p
                className={`${QUICK_CLASH_CLASSES.textMuted} text-xs text-center mt-3`}
              >
                {t('Choose your category and start earning trophies!')}
              </p>
            </motion.div>
          ) : inMatchmaking ? (
            <Button
              variant="outline"
              onClick={handleLeaveMatchmaking}
              disabled={loading}
              className={`
                border-red-400/40
                text-red-300
                hover:bg-red-500/10
                hover:border-red-400/60
                ${QUICK_CLASH_CLASSES.focusRing}
              `}
            >
              <X className="w-4 h-4 mr-2" />
              {loading ? t('Leaving...') : t('Leave Queue')}
            </Button>
          ) : (
            <div className="flex gap-3 w-full justify-end">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                {t('Cancel')}
              </Button>
              <Button
                onClick={handleJoinMatchmaking}
                disabled={loading}
                className={`
                  bg-gradient-to-r from-teal-500 to-teal-600
                  hover:from-teal-600 hover:to-teal-700
                  text-white font-bold
                  border border-teal-400/50
                  shadow-lg shadow-teal-500/30
                  ${QUICK_CLASH_CLASSES.focusRing}
                `}
              >
                <Users className="w-4 h-4 mr-2" />
                {loading
                  ? t('Joining...')
                  : selectedTeamId
                  ? t('Join with Team')
                  : t('Join Individually')}
              </Button>
            </div>
          )}
        </DialogFooter>

        {/* Celebration confetti effect - Performance: Reduced to 10 particles */}
        <AnimatePresence>
          {showCelebration && battleReady && (
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
      </>
    )

    if (isEmbedded) return content

    return (
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          if (
            !(inMatchmaking && !battleReady) &&
            battleCreationStatus !== 'creating'
          ) {
            handleClose()
          }
        }}
      >
        <DialogContent
          className={`
            bg-gradient-to-b from-slate-900/95 to-slate-950/98
            backdrop-blur-2xl
            border ${modalState.borderColor}
            shadow-2xl
            ${
              modalState === MODAL_STATES.ready
                ? 'shadow-cyan-500/30'
                : modalState === MODAL_STATES.searching
                ? 'shadow-emerald-500/20'
                : modalState === MODAL_STATES.failed
                ? 'shadow-red-500/30'
                : 'shadow-cyan-500/20'
            }
            rounded-2xl
            max-w-md
            w-[95vw]
            sm:w-[90vw]
            md:w-full
            max-h-[90vh]
            p-0
            overflow-hidden
            flex
            flex-col
          `}
          style={DIALOG_Z_INDEX_STYLE}
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

          {content}
        </DialogContent>
      </Dialog>
    )
  },
)

GlobalMatchmakingModal.displayName = 'GlobalMatchmakingModal'

export default GlobalMatchmakingModal
