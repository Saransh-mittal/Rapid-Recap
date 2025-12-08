import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '../../../ui/button'
import { FaGift, FaBolt } from 'react-icons/fa'
import { Sparkles, Package } from 'lucide-react'
import PowerupCard, { POWERUP_INFO, POWERUP_COLORS } from '../../powerups/PowerupCard'
import { cn } from '@/lib/utils'
import { QUICK_CLASH_CLASSES } from '../../utils/quickClashColors'

const MAX_LOADOUT_HOUSING = 30

/**
 * Circular Progress Ring for housing capacity
 */
const HousingRing = ({ used, max }) => {
  const percentage = (used / max) * 100
  const circumference = 2 * Math.PI * 18 // radius = 18
  const offset = circumference - (percentage / 100) * circumference

  // Color based on usage
  const getColor = () => {
    if (percentage >= 80) return { stroke: '#ef4444', text: 'text-red-400' } // red
    if (percentage >= 50) return { stroke: '#eab308', text: 'text-yellow-400' } // yellow
    return { stroke: '#06b6d4', text: 'text-cyan-400' } // cyan
  }

  const colors = getColor()

  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-white/10"
        />
        {/* Progress circle */}
        <motion.circle
          cx="24"
          cy="24"
          r="18"
          stroke={colors.stroke}
          strokeWidth="4"
          fill="transparent"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-xs font-bold", colors.text)}>
          {used}
        </span>
      </div>
    </div>
  )
}

/**
 * Compact powerup chip for horizontal scroll
 */
const PowerupChip = ({ powerup }) => {
  const info = POWERUP_INFO[powerup.powerupId] || {}
  const colors = POWERUP_COLORS[powerup.powerupId] || {}

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-full border backdrop-blur-sm",
        "bg-white/5",
        colors.border || 'border-white/20'
      )}
    >
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center",
        `bg-gradient-to-br ${colors.gradient || 'from-slate-500 to-slate-600'}`
      )}>
        <span className="text-xs">
          {powerup.powerupId === 'TIME_WARP' && '⏳'}
          {powerup.powerupId === 'SCORE_SURGE' && '⚡'}
          {powerup.powerupId === 'ORACLES_EYE' && '🔮'}
          {powerup.powerupId === 'STREAK_SHIELD' && '🛡️'}
          {powerup.powerupId === 'PRECISION_PROTOCOL' && '🎯'}
        </span>
      </div>
      <span className="text-xs font-semibold text-white/90 whitespace-nowrap">
        {info.name || powerup.powerupId?.replace('_', ' ')}
      </span>
    </motion.div>
  )
}

/**
 * Empty state when no powerups equipped
 */
const EmptyLoadout = ({ onEquip }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-6 px-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02]"
  >
    <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-3">
      <Package className="w-6 h-6 text-cyan-400/60" />
    </div>
    <p className="text-sm text-white/50 text-center mb-3">
      No powerups equipped yet
    </p>
    <Button
      size="sm"
      onClick={onEquip}
      className="bg-cyan-600/80 hover:bg-cyan-600 text-white text-xs"
    >
      <Sparkles className="w-3 h-3 mr-1" />
      Equip Now
    </Button>
  </motion.div>
)

const PowerupsSection = ({
  currentBattle,
  userTeam,
  userId,
  onOpenDonation,
  onOpenSelection
}) => {
  if (!currentBattle || !userTeam) return null

  const members = userTeam === 'teamA' ? currentBattle.teamAMembers : currentBattle.teamBMembers
  const pool = userTeam === 'teamA' ? currentBattle.teamAPool : currentBattle.teamBPool
  const member = members.find(m => m.user._id === userId || m.user === userId)
  const loadout = member?.loadout || { items: [], housingUsed: 0 }

  const poolItemCount = pool?.items?.length || 0
  const hasItemsInPool = poolItemCount > 0
  const hasLoadout = loadout.items.length > 0

  return (
    <div className="w-full px-4 md:px-6 py-4">
      <div className={cn(
        QUICK_CLASH_CLASSES.glassTeamBattle,
        "p-4 rounded-xl flex flex-col gap-4"
      )}>
        {/* Header Row */}
        <div className="flex justify-between items-start gap-3">
          {/* Left: Title + Housing Ring */}
          <div className="flex items-center gap-3">
            <HousingRing used={loadout.housingUsed} max={MAX_LOADOUT_HOUSING} />
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-white">
                Powerups
              </h2>
              <p className="text-xs text-white/50">
                {loadout.housingUsed}/{MAX_LOADOUT_HOUSING} capacity used
              </p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenDonation}
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200"
            >
              <FaGift className="mr-1.5 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Donate</span>
            </Button>
            <Button
              size="sm"
              onClick={onOpenSelection}
              className={cn(
                "text-white border-none relative overflow-hidden",
                hasItemsInPool && !hasLoadout
                  ? "bg-cyan-500 animate-pulse" // Pulsing when pool has items but loadout empty
                  : "bg-cyan-600 hover:bg-cyan-700"
              )}
            >
              <FaBolt className="mr-1.5 h-3.5 w-3.5" />
              Equip
              {hasItemsInPool && !hasLoadout && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
              )}
            </Button>
          </div>
        </div>

        {/* Pool Indicator */}
        {hasItemsInPool && (
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Package className="w-3.5 h-3.5" />
            <span>{poolItemCount} powerup{poolItemCount > 1 ? 's' : ''} available in team pool</span>
          </div>
        )}

        {/* Loadout Display */}
        {hasLoadout ? (
          <div>
            <p className="text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">
              Your Loadout
            </p>
            {/* Horizontal scrollable chips on mobile, grid on desktop */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap">
              {loadout.items.map((item, index) => (
                <PowerupChip key={`${item.powerupId}-${index}`} powerup={item} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyLoadout onEquip={onOpenSelection} />
        )}
      </div>
    </div>
  )
}

export default PowerupsSection

