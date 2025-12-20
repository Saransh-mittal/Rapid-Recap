// components/quickClashComponents/globalmatchmaking/components/BattleReadyDisplay.jsx
// V2 REDESIGN - Premium team vs team display with win probability

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Zap, Trophy, Swords, ChevronRight } from 'lucide-react'

const MotionDiv = motion.div

// Default avatar
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%231e293b' width='40' height='40'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%2394a3b8'/%3E%3Cpath d='M8 36c0-8 5-12 12-12s12 4 12 12' fill='%2394a3b8'/%3E%3C/svg%3E"

// Team Avatar Stack Component
const TeamAvatars = React.memo(({ members = [], side = 'user' }) => {
  const displayMembers = members.slice(0, 3)
  const overflow = members.length > 3 ? members.length - 3 : 0

  const config = side === 'user'
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
            className={`relative w-9 h-9 rounded-full overflow-hidden border-2 bg-slate-800 ${config.border} ring-2 ${config.ring} ${config.glow}`}
            style={{ zIndex: 3 - index }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
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
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${config.overflowBg} border-2 ${config.border}`}>
          <span className="text-white text-[10px] font-bold">+{overflow}</span>
        </div>
      )}
    </div>
  )
})
TeamAvatars.displayName = 'TeamAvatars'

// VS Divider
const VSDivider = React.memo(() => (
  <div className="flex flex-col items-center relative px-4">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-10 h-10 bg-white/5 rounded-full blur-lg" />
    </div>
    <MotionDiv
      className="relative"
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Swords className="w-6 h-6 text-yellow-400" />
    </MotionDiv>
    <span className="text-white/30 text-[10px] font-black tracking-wider mt-1">VS</span>
  </div>
))
VSDivider.displayName = 'VSDivider'

// Win Probability Bar - Shows both teams' chances visually
const WinProbabilityBar = React.memo(({ userProbability = 50 }) => {
  const opponentProbability = 100 - userProbability

  return (
    <div className="w-full space-y-2">
      {/* Label row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-cyan-400 font-bold">{Math.round(userProbability)}%</span>
        <span className="text-white/40 text-[10px] uppercase tracking-wider">Win Chance</span>
        <span className="text-red-400 font-bold">{Math.round(opponentProbability)}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden flex bg-white/10">
        <MotionDiv
          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
          initial={{ width: 0 }}
          animate={{ width: `${userProbability}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        />
        <MotionDiv
          className="h-full bg-gradient-to-r from-red-400 to-red-500"
          initial={{ width: 0 }}
          animate={{ width: `${opponentProbability}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        />
      </div>

      {/* Team labels */}
      <div className="flex items-center justify-between text-[10px] text-white/40">
        <span>Your Team</span>
        <span>Opponents</span>
      </div>
    </div>
  )
})
WinProbabilityBar.displayName = 'WinProbabilityBar'

/**
 * BattleReadyDisplay - V2 Redesign
 *
 * Design: V2-style team vs team layout with win probability
 * - Glowing avatar stacks
 * - Animated VS divider
 * - Clean probability bar showing both teams
 */
const BattleReadyDisplay = React.memo(
  ({ battleReady, matchmakingTime, formatMatchmakingTime }) => {
    const { t } = useTranslation('QuickClash')

    // Determine which team the current user is on based on teamId
    const userTeamId = battleReady?.teamId
    const isUserTeamA = userTeamId === battleReady?.teamA

    // Extract team data based on which team the user is on
    const userTeamMembers = isUserTeamA
      ? battleReady?.teamAMembers || []
      : battleReady?.teamBMembers || []
    const opponentTeamMembers = isUserTeamA
      ? battleReady?.teamBMembers || []
      : battleReady?.teamAMembers || []

    // Get win probability for the user's team
    // The server sends probability as decimal (0.50 for 50%)
    const myTeamProb = isUserTeamA
      ? battleReady?.winProbability?.teamA
      : battleReady?.winProbability?.teamB

    const rawProbability = myTeamProb?.initial ?? myTeamProb?.current ?? 0.5

    // Convert to percentage (0-100)
    // Handle both formats: if value > 1, it's already a percentage
    const probabilityPercent = rawProbability > 1 ? rawProbability : rawProbability * 100


    return (
      <div className="flex flex-col items-center gap-5 py-4">
        {/* Success Icon */}
        <MotionDiv
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative"
        >
          <MotionDiv
            className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-600/10 border-2 border-cyan-400/60 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.4)]"
            animate={{
              boxShadow: [
                '0 0 30px rgba(6, 182, 212, 0.3)',
                '0 0 50px rgba(6, 182, 212, 0.5)',
                '0 0 30px rgba(6, 182, 212, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-8 h-8 text-cyan-300" />
          </MotionDiv>
        </MotionDiv>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
            {t('Battle Ready!')}
          </h2>
          <p className="text-white/50 text-sm mt-1">
            {t('Your arena is prepared')}
          </p>
        </div>

        {/* Teams Display Card */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            {/* Your Team */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-cyan-400 text-[11px] font-bold uppercase tracking-wider">
                {t('Your Team')}
              </span>
              <TeamAvatars members={userTeamMembers} side="user" />
              <span className="text-white font-bold text-sm">4 Players</span>
            </div>

            <VSDivider />

            {/* Opponent Team */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-red-400 text-[11px] font-bold uppercase tracking-wider">
                {t('Opponents')}
              </span>
              <TeamAvatars members={opponentTeamMembers} side="opponent" />
              <span className="text-white font-bold text-sm">4 Players</span>
            </div>
          </div>

          {/* Win Probability Bar */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <WinProbabilityBar userProbability={probabilityPercent} />
          </div>
        </MotionDiv>

        {/* Queue time + Trophy hint */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <span>{t('Found in')}</span>
            <span className="text-cyan-400 font-bold tabular-nums">
              {formatMatchmakingTime(matchmakingTime)}
            </span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-medium">
            <Trophy className="w-3.5 h-3.5" />
            <span>{t('Win trophies!')}</span>
          </div>
        </div>

        {/* CTA hint */}
        <div className="flex items-center gap-1 text-cyan-400 text-sm font-medium">
          <span>{t('Enter Battle Arena')}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    )
  },
)

BattleReadyDisplay.displayName = 'BattleReadyDisplay'
export default BattleReadyDisplay
