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
        setTimeout(() => setShowCelebration(false), 3000)
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

    // Fetch user's teams
    const fetchMyTeams = useCallback(async () => {
      if (!user?._id) return
      try {
        setLoadingTeams(true)
        const response = await axios.get('/api/quickClash/teams')
        setMyTeams(response.data?.teams || [])
      } catch (error) {
        console.error('Error fetching teams:', error)
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

    // Poll for matchmaking status
    useEffect(() => {
      if (inMatchmaking && isOpen) {
        pollingIntervalRef.current = setInterval(async () => {
          try {
            const statusData = await pollMatchmakingStatus()
            if (statusData?.status === 'battleReady') {
              dispatch(
                setBattleReady({
                  battleId: statusData?.battleId,
                  teamId: statusData?.teamId,
                  teamA: statusData?.teamA,
                  teamB: statusData?.teamB,
                  winProbability: statusData?.winProbability,
                }),
              )

              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
                pollingIntervalRef.current = null
              }

              const timeElapsed = Math.floor(
                (Date.now() - mountTimeRef.current) / 1000,
              )
              dispatch(
                addStatusUpdate({
                  message: t('Battle is ready! You can now enter the battle.'),
                  time: timeElapsed,
                }),
              )
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
    }, [inMatchmaking, isOpen, pollMatchmakingStatus, t, dispatch])

    const handleJoinMatchmaking = useCallback(async () => {
      try {
        mountTimeRef.current = Date.now()
        dispatch(
          addStatusUpdate({
            message: t('Joining matchmaking...'),
            time: 0,
          }),
        )

        if (selectedTeamId) {
          await joinWithTeam(selectedTeamId)
        } else {
          await joinSoloMatchmaking()
        }

        dispatch(
          addStatusUpdate({
            message: t('Successfully joined matchmaking'),
            time: Math.floor((Date.now() - mountTimeRef.current) / 1000),
          }),
        )
      } catch (error) {
        console.error('Error joining matchmaking:', error)
      }
    }, [selectedTeamId, joinWithTeam, joinSoloMatchmaking, t, dispatch])

    const handleLeaveMatchmaking = useCallback(async () => {
      const canLeave = await checkCanLeaveMatchmaking()
      if (!canLeave) return

      try {
        await leaveMatchmaking()
        dispatch(clearStatusUpdates())
        onClose()
      } catch (error) {
        console.error('Error leaving matchmaking:', error)
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
                      ? {
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0],
                        }
                      : modalState === MODAL_STATES.searching
                      ? { rotate: 360 }
                      : {}
                  }
                  transition={{
                    duration: modalState === MODAL_STATES.ready ? 1 : 2,
                    repeat:
                      modalState === MODAL_STATES.searching
                        ? Infinity
                        : modalState === MODAL_STATES.ready
                        ? 2
                        : 0,
                    ease: 'easeInOut',
                  }}
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

            {/* Progress bar for matchmaking */}
            {inMatchmaking && !battleReady && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Progress
                  value={Math.min((matchmakingTime / 60) * 100, 100)}
                  className="h-2 bg-white/10"
                />
                <p
                  className={`${QUICK_CLASH_CLASSES.textMuted} text-xs mt-2 text-center`}
                >
                  {t('Searching')} • {formatMatchmakingTime(matchmakingTime)}
                </p>
              </motion.div>
            )}
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
          style={{
            // Ensure smooth scrolling
            WebkitOverflowScrolling: 'touch',
          }}
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

            {/* Win Probability Display */}
            {battleReady && winProbability && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className={`
                  ${QUICK_CLASH_CLASSES.glassLight}
                  rounded-2xl p-5
                  border-2 ${modalState.borderColor}
                  shadow-xl
                  relative overflow-hidden
                `}
              >
                {/* Animated background glow */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${modalState.gradientFrom} to-transparent`}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`${QUICK_CLASH_CLASSES.textPrimary} text-base font-bold flex items-center gap-2`}
                    >
                      <Target className="w-5 h-5 text-cyan-400" />
                      {t('Initial Win Probability')}
                    </h3>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                      {t('Pre-Battle')}
                    </Badge>
                  </div>

                  <TeamWinProbabilityDisplay
                    currentProbability={winProbability.currentProbability}
                    initialProbability={winProbability.initialProbability}
                    certaintyScore={winProbability.certaintyScore}
                    completedChallenges={winProbability.completedChallenges}
                    totalChallenges={winProbability.totalChallenges}
                    size="lg"
                    showTrend={false}
                    showCertainty={false}
                  />

                  <div
                    className={`
                      ${QUICK_CLASH_CLASSES.glassLight}
                      rounded-lg p-3
                      border border-cyan-400/20
                    `}
                  >
                    <p
                      className={`${QUICK_CLASH_CLASSES.textMuted} text-xs text-center leading-relaxed`}
                    >
                      <Sparkles className="w-3 h-3 inline mr-1 text-cyan-400" />
                      {t(
                        'This probability will update dynamically as your team completes challenges',
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

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
                onClick={enterBattle}
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

        {/* Celebration confetti effect */}
        <AnimatePresence>
          {showCelebration && battleReady && (
            <>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    y: 0,
                    x: `${Math.random() * 100}%`,
                    scale: Math.random() * 0.5 + 0.5,
                  }}
                  animate={{
                    opacity: 0,
                    y: window.innerHeight,
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: Math.random() * 2 + 2,
                    ease: 'easeIn',
                  }}
                  className="absolute top-0 z-50 pointer-events-none"
                  style={{
                    left: `${Math.random() * 100}%`,
                  }}
                >
                  <Sparkles
                    className={`w-4 h-4 ${
                      i % 3 === 0
                        ? 'text-cyan-400'
                        : i % 3 === 1
                        ? 'text-yellow-400'
                        : 'text-purple-400'
                    }`}
                  />
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
            ${QUICK_CLASH_CLASSES.glassMedium}
            border-2 ${modalState.borderColor}
            shadow-2xl
            ${
              modalState === MODAL_STATES.ready
                ? 'shadow-cyan-500/40'
                : modalState === MODAL_STATES.searching
                ? 'shadow-emerald-500/30'
                : modalState === MODAL_STATES.failed
                ? 'shadow-red-500/40'
                : 'shadow-teal-500/30'
            }
            rounded-2xl
            max-w-2xl
            w-[95vw]
            sm:w-[90vw]
            md:w-full
            max-h-[90vh]
            p-0
            overflow-hidden
            backdrop-brightness-110
            flex
            flex-col
          `}
          style={{
            // FIXED: Higher z-index than FloatingActionMenu (9999)
            zIndex: 10000,
          }}
        >
          {/* Animated background gradient */}
          <div
            className={`
              absolute inset-0
              bg-gradient-to-br
              ${modalState.gradientFrom}
              to-transparent
              opacity-70
              pointer-events-none
            `}
          />

          {/* Subtle animated grid pattern */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(${QUICK_CLASH_COLORS.primary[500]} 1px, transparent 1px),
                linear-gradient(90deg, ${QUICK_CLASH_COLORS.primary[500]} 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />

          {content}
        </DialogContent>
      </Dialog>
    )
  },
)

GlobalMatchmakingModal.displayName = 'GlobalMatchmakingModal'

export default GlobalMatchmakingModal
