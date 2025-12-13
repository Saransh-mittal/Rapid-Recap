// components/quickClashComponents/v2/ActiveChallengesV2.jsx
// V2 Active Battles - Premium styling with glow effects and animations

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  memo,
} from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import {
  Swords,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

// V2 Components
import BattleCardV2 from './BattleCardV2'
import { EmptyBattlesV2 } from './EmptyStateV2'
import { BattleListSkeletonV2 } from './LoadingSkeletonV2'

// Custom hooks
import useQuickClashTeamBattle from '../../../customHooks/useQuickClashTeamBattle'

// Haptic feedback
import { haptics } from '../../../utils/haptics'

const MotionDiv = motion.div

// ============================================================================
// SECTION HEADER - Premium with glow effects
// ============================================================================

const SectionHeader = memo(({
  title,
  icon: Icon,
  count = 0,
  onRefresh,
  isRefreshing = false,
}) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2.5">
      {/* Icon with glow */}
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500/30 blur-lg rounded-lg" />
        <div className="relative p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Icon className="w-4 h-4 text-cyan-400" />
        </div>
      </div>

      {/* Title */}
      <span className="text-white font-bold text-sm bg-gradient-to-r from-white to-white/80 bg-clip-text">
        {title}
      </span>

      {/* Count badge with pulse animation */}
      {count > 0 && (
        <MotionDiv
          className="relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="absolute inset-0 bg-cyan-500/40 blur-md rounded-full" />
          <div className="relative px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/30 to-cyan-600/30 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            <span className="text-cyan-300 text-xs font-bold tabular-nums">{count}</span>
          </div>
        </MotionDiv>
      )}
    </div>

    {/* Refresh button */}
    {onRefresh && (
      <motion.button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all duration-200 disabled:opacity-50 group"
        whileTap={{ scale: 0.9 }}
      >
        <RefreshCw className={`w-4 h-4 text-white/60 group-hover:text-cyan-400 transition-colors ${isRefreshing ? 'animate-spin' : ''}`} />
      </motion.button>
    )}
  </div>
))
SectionHeader.displayName = 'SectionHeader'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ActiveChallengesV2 = () => {
  const { t } = useTranslation('QuickClash')

  const [isRefreshing, setIsRefreshing] = useState(false)
  const initialLoadDone = useRef(false)

  // Redux
  const { user } = useSelector((state) => state.auth)
  const userId = useMemo(() => user?._id, [user])

  // Subscribe to battleReady from global matchmaking to auto-refresh when match found
  const { battleReady } = useSelector((state) => state.quickClashTeamBattle)
  const { battleReady: globalBattleReady } = useSelector((state) => state.quickClashGlobalMatchmaking)

  // Team battle hook
  const {
    activeBattles,
    activeBattlesLoading,
    activeBattlesError,
    loadTeamBattles,
    goToBattle,
  } = useQuickClashTeamBattle()

  // Only load if no data exists
  useEffect(() => {
    if (userId && !initialLoadDone.current && activeBattles.length === 0) {
      loadTeamBattles('active')
      initialLoadDone.current = true
    }
  }, [userId, loadTeamBattles, activeBattles.length])

  // Auto-refresh when a new battle becomes ready (match found)
  const prevBattleReadyRef = useRef(null)
  useEffect(() => {
    const currentBattleId = battleReady?.battleId || globalBattleReady?.battleId
    const prevBattleId = prevBattleReadyRef.current

    // If a new battle is ready that wasn't before, refresh the list
    if (currentBattleId && currentBattleId !== prevBattleId) {
      console.log('[ActiveChallengesV2] New battle ready, auto-refreshing active battles')
      loadTeamBattles('active')
    }

    prevBattleReadyRef.current = currentBattleId
  }, [battleReady, globalBattleReady, loadTeamBattles])

  // Handlers
  const handleRefresh = useCallback(async () => {
    haptics.light() // Tactile feedback on refresh
    setIsRefreshing(true)
    try {
      await loadTeamBattles('active')
    } finally {
      setIsRefreshing(false)
    }
  }, [loadTeamBattles])

  const handleBattleClick = useCallback((battle) => {
    if (battle?._id) {
      goToBattle(battle._id)
    }
  }, [goToBattle])

  // Derived - only show skeleton if loading AND no data
  const activeCount = activeBattles?.length || 0
  const showSkeleton = activeBattlesLoading && activeCount === 0 && !initialLoadDone.current

  if (showSkeleton) {
    return <BattleListSkeletonV2 count={2} />
  }

  return (
    <MotionDiv
      className="relative bg-gradient-to-b from-white/[0.07] to-cyan-500/[0.03] border border-cyan-500/20 rounded-2xl p-4 overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Subtle corner accents */}
      <Sparkles className="absolute top-3 right-3 w-4 h-4 text-cyan-500/20" />

      {/* Gradient border glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 pointer-events-none" />

      <SectionHeader
        title={t('Active Battles')}
        icon={Swords}
        count={activeCount}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="relative z-10">
        {activeBattlesError ? (
          <div className="text-center py-8">
            <p className="text-red-400 text-sm mb-3">{t('Failed to load')}</p>
            <motion.button
              onClick={handleRefresh}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-white text-xs font-medium border border-white/10 transition-all"
              whileTap={{ scale: 0.95 }}
            >
              {t('Retry')}
            </motion.button>
          </div>
        ) : activeCount === 0 ? (
          <EmptyBattlesV2 />
        ) : (
          <div className="space-y-3">
            {activeBattles.map((battle, index) => (
              <MotionDiv
                key={battle._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <BattleCardV2
                  battle={battle}
                  onClick={() => handleBattleClick(battle)}
                />
              </MotionDiv>
            ))}
          </div>
        )}
      </div>
    </MotionDiv>
  )
}

ActiveChallengesV2.displayName = 'ActiveChallengesV2'

export default memo(ActiveChallengesV2)
