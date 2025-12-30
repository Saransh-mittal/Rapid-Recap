// screens/BattleHistoryV2.jsx
// V2 Battle History - Uses Redux state, no loading if data exists

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
} from 'lucide-react'

// V2 Components
import BattleCardV2 from '../components/quickClashComponents/v2/BattleCardV2'
import { EmptyCompletedV2 } from '../components/quickClashComponents/v2/EmptyStateV2'
import { BattleListSkeletonV2 } from '../components/quickClashComponents/v2/LoadingSkeletonV2'
import ClaimRewardsModal from '../components/quickClashComponents/powerups/ClaimRewardsModal'

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

  // Only load if no data exists yet
  useEffect(() => {
    if (user?._id && !initialLoadDone.current && completedBattles.length === 0) {
      loadTeamBattles('completed')
      initialLoadDone.current = true
    }
  }, [user, loadTeamBattles, completedBattles.length])

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
    if (!battle || !user) return

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
  }, [user])

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

    const groups = {}

    completedBattles.forEach(battle => {
      const date = battle.updatedAt ? new Date(battle.updatedAt) : new Date(battle.createdAt)
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

