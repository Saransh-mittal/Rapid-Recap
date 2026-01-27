// screens/BattleHistoryV2.jsx
// V2 Battle History - Uses Redux state, no loading if data exists
// Now supports both authenticated users AND session players

import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useInView } from 'react-intersection-observer'
import { isToday, isYesterday, format, parseISO } from 'date-fns'
import {
  Trophy,
  RefreshCw,
  Loader2,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

// V2 Components
import BattleCardV2 from '../components/quickClashComponents/v2/BattleCardV2'
import { EmptyCompletedV2 } from '../components/quickClashComponents/v2/EmptyStateV2'
import { BattleListSkeletonV2 } from '../components/quickClashComponents/v2/LoadingSkeletonV2'
import ClaimRewardsModal from '../components/quickClashComponents/powerups/ClaimRewardsModal'

// Player hook (works for both auth and session players)
import usePlayer from '../hooks/usePlayer'

// Custom hooks
import useQuickClashTeamBattle from '../customHooks/useQuickClashTeamBattle'

// Redux
import { claimPowerupReward } from '../redux/quickClashTeamBattleSlice'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BattleHistoryV2 = () => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Get player info (works for both auth users and session players)
  const { isSession, isAuthenticated, player, playerId } = usePlayer()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedBattle, setSelectedBattle] = useState(null)
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const initialLoadDone = useRef(false)

  // Redux - get data directly
  const { user } = useSelector((state) => state.auth)
  const teamBattleState = useSelector((state) => state.quickClashTeamBattle)

  // Hook for actions
  const {
    completedBattles,
    completedBattlesLoading,
    completedBattlesHasMore,
    loadTeamBattles,
    loadMoreTeamBattles,
  } = useQuickClashTeamBattle()

  // Infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  // Only load if no data exists yet (works for both auth users and session players)
  useEffect(() => {
    // Session players can also load battles now
    if ((user?._id || isSession) && !initialLoadDone.current && completedBattles.length === 0) {
      loadTeamBattles('completed')
      initialLoadDone.current = true
    }
  }, [user, isSession, loadTeamBattles, completedBattles.length])

  // Load more on scroll
  useEffect(() => {
    if (inView && completedBattlesHasMore && !completedBattlesLoading && !isRefreshing) {
      loadMoreTeamBattles('completed')
    }
  }, [inView, completedBattlesHasMore, completedBattlesLoading, isRefreshing, loadMoreTeamBattles])

  // Handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await loadTeamBattles('completed')
    } finally {
      setIsRefreshing(false)
    }
  }, [loadTeamBattles])

  const handleBattleClick = useCallback((battle) => {
    if (battle?._id) {
      navigate(`/quickclash/analysis/${battle._id}`)
    }
  }, [navigate])

  const handleClaimReward = useCallback((battle) => {
    if (!battle) return

    // Session players need to sign up to claim rewards
    if (isSession) {
      // Navigate to conversion/signup with context about why they need to sign up
      navigate('/play', {
        state: {
          intent: 'createAccount',
          reason: 'claimReward',
          message: 'Create an account to claim your powerup rewards and keep them forever!'
        }
      })
      return
    }

    if (!user) return

    // Find user's membership in the battle to get their powerupReward
    const userMemberA = battle.teamAMembers?.find(
      m => (m.user?._id || m.user) === user._id
    )
    const userMemberB = battle.teamBMembers?.find(
      m => (m.user?._id || m.user) === user._id
    )
    const userMember = userMemberA || userMemberB
    const isTeamA = !!userMemberA
    const teamWon = battle.winner === (isTeamA ? 'teamA' : 'teamB')

    // Build the battleResult object with user-specific data
    const battleResult = {
      _id: battle._id,
      teamWon,
      trophyChange: userMember?.trophyChange || 0,
      powerupReward: userMember?.powerupReward || null,
      userTeamKey: isTeamA ? 'teamA' : 'teamB',
    }

    setSelectedBattle(battleResult)
    setClaimModalOpen(true)
  }, [user, isSession, navigate])

  const handleConfirmClaim = useCallback(async (battleId) => {
    try {
      await dispatch(claimPowerupReward(battleId)).unwrap()
      // Don't close modal here - let it show success animation and auto-close
      // The modal's onClose will be triggered after success animation
    } catch (error) {
      console.error('Failed to claim reward:', error)
      throw error // Re-throw for modal to handle
    }
  }, [dispatch])

  // Derived - only show loading on FIRST load when no data
  const loadedCount = completedBattles?.length || 0
  const totalCount = teamBattleState.completedBattlesTotal || loadedCount
  const showSkeleton = completedBattlesLoading && loadedCount === 0 && !initialLoadDone.current

  // Group battles by date
  const groupedBattles = useMemo(() => {
    if (!completedBattles || completedBattles.length === 0) return []

    // Helper to get stable date
    const getStableDate = (b) => {
      // Prioritize endedAt > expiresAt > createdAt to keep completed battles stable
      // Avoid updatedAt as it changes when claiming rewards
      const d = b.endedAt || b.expiresAt || b.createdAt || b.updatedAt
      return d ? new Date(d) : new Date()
    }

    // Sort battles by stable date descending first
    // This ensures consistent order regardless of server return order (which might be by updatedAt)
    const sortedBattles = [...completedBattles].sort((a, b) => {
      return getStableDate(b) - getStableDate(a)
    })

    const groups = {}

    sortedBattles.forEach(battle => {
      const date = getStableDate(battle)
      let groupKey
      let groupLabel

      if (isToday(date)) {
        groupKey = 'today'
        groupLabel = 'Today'
      } else if (isYesterday(date)) {
        groupKey = 'yesterday'
        groupLabel = 'Yesterday'
      } else {
        groupKey = format(date, 'yyyy-MM-dd')
        groupLabel = format(date, 'MMMM d, yyyy')
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          key: groupKey,
          label: groupLabel,
          date: date,
          battles: []
        }
      }
      groups[groupKey].battles.push(battle)
    })

    // Sort groups by date (most recent first)
    return Object.values(groups).sort((a, b) => b.date - a.date)
  }, [completedBattles])

  return (
    <>
      <div className="relative z-10 w-full max-w-lg mx-auto px-3 pt-2 pb-20 md:pb-8 md:max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-yellow-500/15">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <h1 className="text-white font-bold text-lg">{t('Battle History')}</h1>
            {totalCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                {totalCount}
              </span>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-white/60 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Session Player Notice */}
        {isSession && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-300">
                History only saved for this session.
                <button
                  onClick={() => navigate('/play', { state: { intent: 'createAccount' } })}
                  className="ml-1 underline hover:text-amber-200 transition-colors"
                >
                  Create an account
                </button> to keep it permanently.
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {showSkeleton ? (
          <BattleListSkeletonV2 count={3} />
        ) : loadedCount === 0 ? (
          <EmptyCompletedV2 />
        ) : (
          <div className="space-y-4">
            {groupedBattles.map((group) => (
              <div key={group.key}>
                {/* Date Header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Calendar className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                {/* Battles in this group */}
                <div className="space-y-3">
                  {group.battles.map((battle) => (
                    <div key={battle._id}>
                      <BattleCardV2
                        battle={battle}
                        onClick={() => handleBattleClick(battle)}
                        onClaimReward={handleClaimReward}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Load More */}
            {completedBattlesHasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Claim Rewards Modal */}
      <ClaimRewardsModal
        isOpen={claimModalOpen}
        onClose={() => {
          setClaimModalOpen(false)
          setSelectedBattle(null)
          // Refresh the list to update card state
          loadTeamBattles('completed')
        }}
        battleResult={selectedBattle}
        onClaim={handleConfirmClaim}
      />
    </>
  )
}

BattleHistoryV2.displayName = 'BattleHistoryV2'

export default memo(BattleHistoryV2)

