// components/quickClashComponents/v2/BattleCardV2.jsx
// V2 Battle Card - Premium with hover effects, glowing avatars, animated VS

import React, { memo, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import {
  Clock,
  ChevronRight,
  Trophy,
  Swords,
  Shield,
  Zap,
  Gift,
} from 'lucide-react'

// Haptic feedback
import { haptics } from '../../../utils/haptics'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'

const MotionDiv = motion.div

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

// Default avatar SVG as data URI - reliable fallback
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%231e293b' width='40' height='40'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%2394a3b8'/%3E%3Cpath d='M8 36c0-8 5-12 12-12s12 4 12 12' fill='%2394a3b8'/%3E%3C/svg%3E"

// Team Avatar Stack - Enhanced with glow rings
const TeamAvatars = memo(({ members = [], limit = 3, side = 'user' }) => {
  if (!members || members.length === 0) return null

  const displayMembers = members.slice(0, limit)
  const overflow = members.length > limit ? members.length - limit : 0

  // Different styling for user vs opponent team
  const ringConfig = side === 'user'
    ? {
        border: 'border-cyan-400',
        ring: 'ring-cyan-400/30',
        glow: 'shadow-[0_0_8px_rgba(6,182,212,0.5)]',
        overflowBg: 'bg-cyan-900/80',
      }
    : {
        border: 'border-red-400',
        ring: 'ring-red-400/30',
        glow: 'shadow-[0_0_8px_rgba(248,113,113,0.5)]',
        overflowBg: 'bg-red-900/80',
      }

  return (
    <div className="flex items-center -space-x-2">
      {displayMembers.map((member, index) => {
        const userData = member.user || member
        const avatarUrl = userData.pic || userData.picture || userData.avatar || DEFAULT_AVATAR
        const name = userData.name || userData.inGameName || 'Player'

        return (
          <motion.div
            key={userData._id || index}
            className={`relative w-8 h-8 rounded-full overflow-hidden border-2 bg-slate-800 ${ringConfig.border} ring-2 ${ringConfig.ring} ${ringConfig.glow}`}
            style={{ zIndex: limit - index }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = DEFAULT_AVATAR }}
            />
          </motion.div>
        )
      })}
      {overflow > 0 && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ringConfig.overflowBg} border-2 ${ringConfig.border} ring-2 ${ringConfig.ring}`}>
          <span className="text-white text-[10px] font-bold">+{overflow}</span>
        </div>
      )}
    </div>
  )
})
TeamAvatars.displayName = 'TeamAvatars'

// Animated Progress Bar
const ProgressBar = memo(({ completed, total }) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="text-white/50 text-xs font-semibold whitespace-nowrap tabular-nums">
        {completed}/{total}
      </span>
    </div>
  )
})
ProgressBar.displayName = 'ProgressBar'

// Status Badge - Enhanced with subtle animation
const StatusBadge = memo(({ status, outcome }) => {
  const configs = {
    active: {
      label: 'Active',
      icon: Zap,
      color: 'bg-green-500/20 text-green-400 border-green-500/40',
      glow: 'shadow-[0_0_10px_rgba(34,197,94,0.3)]',
    },
    victory: {
      label: 'Victory',
      icon: Trophy,
      color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      glow: 'shadow-[0_0_10px_rgba(6,182,212,0.4)]',
    },
    defeat: {
      label: 'Defeat',
      icon: Swords,
      color: 'bg-red-500/20 text-red-400 border-red-500/40',
      glow: 'shadow-[0_0_10px_rgba(248,113,113,0.3)]',
    },
    draw: {
      label: 'Draw',
      icon: Shield,
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      glow: 'shadow-[0_0_10px_rgba(234,179,8,0.3)]',
    },
  }

  const config = configs[outcome] || configs[status] || configs.active
  const Icon = config.icon

  return (
    <motion.div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.color} ${config.glow}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </motion.div>
  )
})
StatusBadge.displayName = 'StatusBadge'

// VS Divider with glow
const VSDivider = memo(() => (
  <div className="px-3 flex flex-col items-center relative">
    {/* Glow effect */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-8 h-8 bg-white/5 rounded-full blur-lg" />
    </div>
    <motion.span
      className="relative text-white/40 text-xs font-black tracking-wider"
      animate={{
        textShadow: ['0 0 5px rgba(255,255,255,0.2)', '0 0 10px rgba(255,255,255,0.4)', '0 0 5px rgba(255,255,255,0.2)']
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      VS
    </motion.span>
  </div>
))
VSDivider.displayName = 'VSDivider'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BattleCardV2 = ({ battle, onClick, onClaimReward }) => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  // Determine which team the user is on and battle data
  const battleData = useMemo(() => {
    if (!battle || !user) return null

    // Determine user's team
    const isInTeamA = battle.teamAMembers?.some(
      member => (member.user?._id || member._id) === user._id
    )
    const userTeamKey = isInTeamA ? 'teamA' : 'teamB'
    const opponentTeamKey = isInTeamA ? 'teamB' : 'teamA'

    const userTeam = {
      name: battle[userTeamKey]?.name || `Team ${isInTeamA ? 'A' : 'B'}`,
      members: battle[`${userTeamKey}Members`] || [],
      wins: battle[`${userTeamKey}Wins`] || 0,
    }

    const opponentTeam = {
      name: battle[opponentTeamKey]?.name || `Team ${isInTeamA ? 'B' : 'A'}`,
      members: battle[`${opponentTeamKey}Members`] || [],
      wins: battle[`${opponentTeamKey}Wins`] || 0,
    }

    // Calculate completion
    const totalChallenges = battle.challenges?.length || 4
    const completedChallenges = battle.challenges?.filter(
      c => c.teamACompleted && c.teamBCompleted
    ).length || 0

    // Determine outcome for completed battles
    let outcome = 'active'
    if (battle.status === 'completed') {
      if (battle.winner === 'tie') {
        outcome = 'draw'
      } else if (battle.winner === userTeamKey) {
        outcome = 'victory'
      } else {
        outcome = 'defeat'
      }
    }

    // Time info
    let timeText = null
    if (battle.status === 'active' && battle.expiresAt) {
      try {
        timeText = formatDistanceToNow(new Date(battle.expiresAt), { addSuffix: false })
      } catch (e) {
        timeText = null
      }
    }

    // Get trophy change for the user
    let trophyChange = 0
    let hasUnclaimedReward = false
    let powerupRewardSpace = 0
    const userMembership = isInTeamA
      ? battle.teamAMembers?.find(m => (m.user?._id || m.user) === user._id)
      : battle.teamBMembers?.find(m => (m.user?._id || m.user) === user._id)
    if (userMembership) {
      trophyChange = userMembership.trophyChange || 0
      // Check for unclaimed powerup rewards
      if (userMembership.powerupReward) {
        hasUnclaimedReward = !userMembership.powerupReward.claimed &&
          (userMembership.powerupReward.housingSpaceEarned || 0) > 0
        powerupRewardSpace = userMembership.powerupReward.housingSpaceEarned || 0
      }
    }

    // Battle end time for completed battles
    let endedTime = null
    if (battle.status === 'completed' && battle.updatedAt) {
      try {
        endedTime = formatDistanceToNow(new Date(battle.updatedAt), { addSuffix: true })
      } catch (e) {
        endedTime = null
      }
    }

    return {
      id: battle._id,
      status: battle.status || 'active',
      outcome,
      userTeam,
      opponentTeam,
      completedChallenges,
      totalChallenges,
      timeText,
      category: battle.category || null,
      trophyChange,
      endedTime,
      hasUnclaimedReward,
      powerupRewardSpace,
    }
  }, [battle, user])

  // Handle click
  const handleClick = useCallback(() => {
    haptics.light() // Tactile feedback on tap
    quizAudioService.playButtonClick() // Audio feedback on tap
    if (onClick) {
      onClick(battle)
    } else if (battleData?.id) {
      navigate(`/quickclash/teamBattle/${battleData.id}`)
    }
  }, [battle, battleData, navigate, onClick])

  // Handle claim reward click
  const handleClaimReward = useCallback((e) => {
    e.stopPropagation() // Prevent card click
    haptics.medium()
    quizAudioService.playButtonClick()
    if (onClaimReward && battle) {
      onClaimReward(battle)
    }
  }, [battle, onClaimReward])

  if (!battleData) return null

  const isActive = battleData.status === 'active'

  // Border color based on outcome
  const borderConfig = {
    victory: 'border-cyan-500/40 hover:border-cyan-400/60',
    defeat: 'border-red-500/40 hover:border-red-400/60',
    draw: 'border-yellow-500/40 hover:border-yellow-400/60',
    active: 'border-white/10 hover:border-cyan-500/30',
  }

  return (
    <motion.button
      onClick={handleClick}
      className={`
        w-full text-left
        bg-gradient-to-b from-white/[0.06] to-white/[0.02]
        backdrop-blur-sm
        border rounded-2xl
        transition-all duration-300
        ${borderConfig[battleData.outcome]}
        overflow-hidden
        group
      `}
      whileHover={{
        y: -2,
        boxShadow: battleData.outcome === 'victory'
          ? '0 8px 30px rgba(6,182,212,0.15)'
          : battleData.outcome === 'defeat'
            ? '0 8px 30px rgba(248,113,113,0.1)'
            : '0 8px 30px rgba(0,0,0,0.2)'
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Card Content */}
      <div className="p-4">
        {/* Top Row: Status + Trophy/Time Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <StatusBadge status={battleData.status} outcome={battleData.outcome} />
            {/* Trophy Change for completed battles */}
            {battleData.status === 'completed' && battleData.trophyChange !== 0 && (
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                battleData.trophyChange > 0
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <Trophy className="w-3 h-3" />
                <span>{battleData.trophyChange > 0 ? '+' : ''}{battleData.trophyChange}</span>
              </div>
            )}
          </div>
          {/* Time info - remaining for active, ended for completed */}
          {battleData.timeText && (
            <div className="flex items-center gap-1.5 text-white/50 text-xs">
              <Clock className="w-3 h-3" />
              <span className="font-medium">{battleData.timeText}</span>
            </div>
          )}
          {battleData.endedTime && (
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              <Clock className="w-3 h-3" />
              <span className="font-medium">Ended {battleData.endedTime.replace(' ago', '')}</span>
            </div>
          )}
        </div>

        {/* Teams Row */}
        <div className="flex items-center justify-between">
          {/* User Team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <span className="text-white/70 text-[11px] font-medium truncate max-w-[90px]">
              {battleData.userTeam.name}
            </span>
            <TeamAvatars
              members={battleData.userTeam.members}
              side="user"
            />
            <span className="text-cyan-400 font-black text-xl tabular-nums">
              {battleData.userTeam.wins}
            </span>
          </div>

          {/* VS Divider */}
          <VSDivider />

          {/* Opponent Team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <span className="text-white/70 text-[11px] font-medium truncate max-w-[90px]">
              {battleData.opponentTeam.name}
            </span>
            <TeamAvatars
              members={battleData.opponentTeam.members}
              side="opponent"
            />
            <span className="text-red-400 font-black text-xl tabular-nums">
              {battleData.opponentTeam.wins}
            </span>
          </div>
        </div>

        {/* Progress (Active only) */}
        {isActive && (
          <div className="mt-4">
            <ProgressBar
              completed={battleData.completedChallenges}
              total={battleData.totalChallenges}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/5 bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors">
        <span className="text-white/40 text-xs font-medium">4v4</span>

        {/* Unclaimed reward indicator for completed battles */}
        {!isActive && battleData.hasUnclaimedReward && (
          <motion.button
            onClick={handleClaimReward}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 hover:bg-yellow-500/25 active:scale-95 transition-all"
            animate={{ opacity: [1, 0.8, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Gift className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-400 text-[11px] font-bold">
              Claim Reward
            </span>
          </motion.button>
        )}

        <motion.div
          className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold"
          whileHover={{ x: 3 }}
        >
          <span>{isActive ? t('Enter') : t('Details')}</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </motion.div>
      </div>
    </motion.button>
  )
}

BattleCardV2.displayName = 'BattleCardV2'

export default memo(BattleCardV2)
