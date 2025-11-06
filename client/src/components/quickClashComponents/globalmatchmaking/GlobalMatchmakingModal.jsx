// components/quickClashComponents/globalmatchmaking/GlobalMatchmakingModal.jsx - CONVERTED TO TAILWIND WITH WIN PROBABILITY
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Users, Activity, Zap, RefreshCw, X } from 'lucide-react'
import axios from 'axios'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// Import win probability component
import TeamWinProbabilityDisplay from '../ui/TeamWinProbabilityDisplay' // NEW

// Import custom hook and actions
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

// Import sub-components
import MatchmakingStatusDisplay from './components/MatchmakingStatusDisplay'
import TeamSelectionPanel from './components/TeamSelectionPanel'

// You'll need: npx shadcn-ui@latest add dialog button badge
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const MotionDiv = motion.div

/**
 * GlobalMatchmakingModal - CONVERTED TO TAILWIND + WIN PROBABILITY
 *
 * NEW FEATURE: Shows initial team win probability when battle is ready
 * - Displays team probability with initial estimates
 * - Shows certainty score (starts at 0)
 * - Color-coded based on advantage
 * - All converted to Tailwind CSS from Chakra UI
 */
const GlobalMatchmakingModal = React.memo(
  ({ isOpen, onClose, isEmbedded = false }) => {
    const { t } = useTranslation('QuickClash')
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch()

    const [myTeams, setMyTeams] = useState([])
    const [loadingTeams, setLoadingTeams] = useState(false)
    const [toastShown, setToastShown] = useState(false)

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

      // Actions
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

    // NEW: Extract win probability data from battleReady
    const winProbability = useMemo(() => {
      if (!battleReady || !user) return null

      // Determine which team the user is on
      const userTeamId = battleReady.teamId || selectedTeamId
      if (!userTeamId) return null

      // Check if battle has winProbability data
      if (!battleReady.winProbability) return null

      // Determine if user is on teamA or teamB
      const isTeamA =
        battleReady.teamA?._id === userTeamId ||
        battleReady.teamA === userTeamId
      const myTeamProb = isTeamA
        ? battleReady.winProbability.teamA
        : battleReady.winProbability.teamB

      if (!myTeamProb) return null

      return {
        currentProbability: myTeamProb.initial || 0.5, // At battle start, current = initial
        initialProbability: myTeamProb.initial || 0.5,
        certaintyScore: 0, // At battle start, certainty is 0
        completedChallenges: 0,
        totalChallenges: 4,
      }
    }, [battleReady, user, selectedTeamId])

    // Handle toast notifications from Redux
    useEffect(() => {
      if (showToast && !toastShown) {
        setToastShown(true)
        // In a real implementation, you'd show a toast here
        // For now, we'll just clear it
        setTimeout(() => {
          dispatch(clearToastNotification())
          setToastShown(false)
        }, 3000)
      }
    }, [showToast, toastShown, dispatch])

    // Handle team refetching from Redux
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

    useEffect(() => {
      if (isOpen) {
        mountTimeRef.current = Date.now()
        dispatch(clearStatusUpdates())
        checkMatchmakingStatus()
        fetchMyTeams()
      }
    }, [isOpen, user, checkMatchmakingStatus, fetchMyTeams, dispatch])

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
                  winProbability: statusData?.winProbability, // NEW: Include probability data
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

            // Add status update based on current status
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
            } else if (statusData?.status === 'team_formation_in_progress') {
              updateMessage = t(
                'Your team is being merged with other players...',
              )
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
            const timeElapsed = Math.floor(
              (Date.now() - mountTimeRef.current) / 1000,
            )
            dispatch(
              addStatusUpdate({
                message: t('Connection issue, retrying...'),
                time: timeElapsed,
              }),
            )
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
        dispatch(
          addStatusUpdate({
            message: t('Failed to join matchmaking'),
            time: Math.floor((Date.now() - mountTimeRef.current) / 1000),
          }),
        )
      }
    }, [selectedTeamId, joinWithTeam, joinSoloMatchmaking, t, dispatch])

    const handleLeaveMatchmaking = useCallback(async () => {
      const canLeave = await checkCanLeaveMatchmaking()
      if (!canLeave) {
        return
      }
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

    // Modal styling based on state
    const modalStyles = useMemo(() => {
      let borderColor = 'border-purple-400/60'
      let shadowColor = 'shadow-purple-500/30'

      if (battleReady) {
        borderColor = 'border-green-400/60'
        shadowColor = 'shadow-green-500/40'
      } else if (inMatchmaking) {
        borderColor = 'border-blue-400/60'
        shadowColor = 'shadow-blue-500/30'
      } else if (battleCreationStatus === 'failed') {
        borderColor = 'border-red-400/60'
        shadowColor = 'shadow-red-500/40'
      }

      return { borderColor, shadowColor }
    }, [battleReady, inMatchmaking, battleCreationStatus])

    // Header icon
    const HeaderIcon = battleReady
      ? Zap
      : battleCreationStatus === 'failed'
      ? X
      : inMatchmaking
      ? Activity
      : Users

    const content = (
      <>
        {!isEmbedded && (
          <DialogHeader className="relative z-10 pt-6 px-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HeaderIcon
                  className={`w-5 h-5 ${
                    battleReady
                      ? 'text-green-400'
                      : battleCreationStatus === 'failed'
                      ? 'text-red-400'
                      : 'text-blue-400'
                  }`}
                />
                <DialogTitle
                  className={`text-xl font-bold ${QUICK_CLASH_CLASSES.textPrimary}`}
                >
                  {battleReady
                    ? t('Battle Ready!')
                    : battleCreationStatus === 'failed'
                    ? t('Battle Creation Failed')
                    : inMatchmaking
                    ? t('4v4 Matchmaking Active')
                    : t('Join 4v4 Matchmaking')}
                </DialogTitle>
                {inMatchmaking &&
                  !battleReady &&
                  battleCreationStatus !== 'failed' && (
                    <Badge className="bg-blue-500 text-white rounded-full px-2 py-1 text-xs">
                      {t('Finding Battle')}
                    </Badge>
                  )}
                {battleCreationStatus === 'failed' && (
                  <Badge className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                    {t('Error')}
                  </Badge>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
        )}

        <div className="relative z-10 p-6 space-y-6">
          {/* Status Display */}
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

          {/* NEW: Win Probability Display (only when battle is ready) */}
          {battleReady && winProbability && (
            <div
              className={`${QUICK_CLASH_CLASSES.glassLight} rounded-2xl p-4 border border-white/20`}
            >
              <div className="space-y-3">
                <h3
                  className={`${QUICK_CLASH_CLASSES.textPrimary} text-sm font-bold flex items-center gap-2`}
                >
                  <Activity className="w-4 h-4 text-cyan-400" />
                  {t('Initial Win Probability')}
                </h3>
                <TeamWinProbabilityDisplay
                  currentProbability={winProbability.currentProbability}
                  initialProbability={winProbability.initialProbability}
                  certaintyScore={winProbability.certaintyScore}
                  completedChallenges={winProbability.completedChallenges}
                  totalChallenges={winProbability.totalChallenges}
                  size="md"
                  showTrend={false} // No trend yet at battle start
                  showCertainty={false} // No certainty yet at battle start
                />
                <p
                  className={`${QUICK_CLASH_CLASSES.textMuted} text-xs text-center`}
                >
                  {t(
                    'This probability will update as challenges are completed',
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Team Selection Panel */}
          {!inMatchmaking &&
            !battleReady &&
            battleCreationStatus !== 'failed' && (
              <TeamSelectionPanel
                myTeams={myTeams}
                loadingTeams={loadingTeams}
                selectedTeamId={selectedTeamId}
                onSelectTeam={selectTeam}
              />
            )}
        </div>

        <DialogFooter className="relative z-10 border-t border-white/10 p-6">
          {battleCreationStatus === 'creating' ? (
            <p
              className={`${QUICK_CLASH_CLASSES.textMuted} text-sm text-center w-full`}
            >
              {t('Please wait while your battle is being created...')}
            </p>
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
                `}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('Try Again')}
              </Button>
            </div>
          ) : battleReady ? (
            <Button
              size="lg"
              onClick={enterBattle}
              className={`
                w-full
                ${QUICK_CLASH_CLASSES.btnSuccess}
                rounded-full
                py-6
                text-lg
                font-bold
                shadow-lg shadow-green-500/30
                hover:shadow-green-500/50
                ${QUICK_CLASH_CLASSES.transformHover}
                ${QUICK_CLASH_CLASSES.focusRing}
              `}
            >
              <Zap className="w-5 h-5 mr-2" />
              {t('Enter Battle')}
            </Button>
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
                  ${QUICK_CLASH_CLASSES.btnPrimary}
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
            border-2 ${modalStyles.borderColor}
            ${modalStyles.shadowColor}
            shadow-2xl
            rounded-2xl
            max-w-2xl
            p-0
            overflow-hidden
            backdrop-brightness-110
          `}
        >
          {/* Background gradient */}
          <div
            className={`
              absolute inset-0
              bg-gradient-to-br
              ${
                battleReady
                  ? 'from-green-500/5'
                  : battleCreationStatus === 'failed'
                  ? 'from-red-500/5'
                  : inMatchmaking
                  ? 'from-blue-500/5'
                  : 'from-purple-500/5'
              }
              to-transparent
              opacity-70
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
