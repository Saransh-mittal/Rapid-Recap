import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '../../ui/badge'
import { Clock, Zap, Eye, Shield, Target, Hammer, FileText, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const POWERUP_ICONS = {
  TIME_WARP: Clock,
  SCORE_SURGE: Zap,
  ORACLES_EYE: Eye,
  STREAK_SHIELD: Shield,
  PRECISION_PROTOCOL: Target,
}

const POWERUP_COLORS = {
  TIME_WARP: {
    gradient: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    glow: 'shadow-cyan-500/25'
  },
  SCORE_SURGE: {
    gradient: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-500/15',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-500/25'
  },
  ORACLES_EYE: {
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500/15',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/25'
  },
  STREAK_SHIELD: {
    gradient: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/25'
  },
  PRECISION_PROTOCOL: {
    gradient: 'from-rose-500 to-red-500',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    glow: 'shadow-rose-500/25'
  },
}

const POWERUP_INFO = {
  TIME_WARP: {
    name: 'Time Warp',
    description: '+15s extra time',
    type: 'active',
    phase: 'both',
  },
  SCORE_SURGE: {
    name: 'Score Surge',
    description: '2x Forge / 1.1x Quiz',
    type: 'active',
    phase: 'both',
  },
  ORACLES_EYE: {
    name: "Oracle's Eye",
    description: 'Remove 2 wrong options',
    type: 'active',
    phase: 'both',
  },
  STREAK_SHIELD: {
    name: 'Streak Shield',
    description: 'Protect streak once',
    type: 'passive',
    phase: 'forge',
  },
  PRECISION_PROTOCOL: {
    name: 'Precision Protocol',
    description: '+50 RQM if 100%',
    type: 'passive',
    phase: 'quiz',
  },
}

const DEFAULT_COLORS = {
  gradient: 'from-slate-500 to-slate-600',
  bg: 'bg-slate-500/15',
  border: 'border-slate-500/30',
  text: 'text-slate-400',
  glow: 'shadow-slate-500/25'
}

const PHASE_CONFIG = {
  forge: { icon: Hammer, label: 'Forge', color: 'text-orange-400 bg-orange-500/15 border-orange-500/30' },
  quiz: { icon: FileText, label: 'Quiz', color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' },
  both: { icon: RefreshCw, label: 'Both', color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
}

/**
 * PowerupCard - Displays a powerup with visual styling and interaction
 *
 * @param {Object} powerup - Powerup data { powerupId, name, description, cost, phase, type }
 * @param {Function} onClick - Click handler
 * @param {boolean} isSelected - Whether powerup is selected/equipped
 * @param {boolean} isDisabled - Whether powerup is disabled
 * @param {boolean} showCost - Show cost badge (default: true)
 * @param {boolean} showPhase - Show phase indicator badge (default: false)
 * @param {boolean} showType - Show active/passive type badge (default: false)
 * @param {boolean} compact - Compact mode for in-game use (default: false)
 * @param {string} status - Status for reports: 'activated' | 'unused' | 'failed' (default: null)
 */
const PowerupCard = ({
  powerup,
  onClick,
  isSelected,
  isDisabled,
  showCost = true,
  showPhase = false,
  showType = false,
  compact = false,
  status = null,
}) => {
  const powerupId = powerup.powerupId
  const IconComponent = POWERUP_ICONS[powerupId] || Zap
  const colors = POWERUP_COLORS[powerupId] || DEFAULT_COLORS
  const info = POWERUP_INFO[powerupId] || {}

  // Derive phase from powerup data or fallback to info
  const phase = powerup.phase?.toLowerCase() || info.phase || 'both'
  const phaseConfig = PHASE_CONFIG[phase] || PHASE_CONFIG.both
  const PhaseIcon = phaseConfig.icon

  // Derive type from powerup data or fallback to info
  const type = powerup.type?.toLowerCase() || info.type || 'active'
  const isPassive = type === 'passive'

  // Status styling for reports
  const statusConfig = {
    activated: { badge: 'bg-emerald-500', label: '✓ Used', opacity: '' },
    unused: { badge: 'bg-slate-500', label: '⏳ Ready', opacity: 'opacity-60' },
    failed: { badge: 'bg-red-500/50', label: '✗ No Effect', opacity: 'opacity-50' },
  }
  const statusStyle = status ? statusConfig[status] : null

  // Compact mode for in-game powerup dock
  if (compact) {
    return (
      <motion.button
        onClick={!isDisabled ? onClick : undefined}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.1 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        className={cn(
          "relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
          "backdrop-blur-xl border min-w-[60px]",
          isDisabled
            ? "opacity-40 cursor-not-allowed bg-slate-800/50 border-slate-700/50"
            : `${colors.bg} ${colors.border} hover:border-white/30`,
        )}
      >
        <div className={cn(
          "p-2 rounded-lg",
          isDisabled ? "bg-slate-700/50" : `bg-gradient-to-br ${colors.gradient}`
        )}>
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <span className={cn(
          "text-[10px] font-bold truncate max-w-full",
          isDisabled ? "text-white/40" : "text-white/80"
        )}>
          {info.name || powerupId?.replace('_', ' ')}
        </span>
        {isDisabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
            <span className="text-emerald-400 text-lg">✓</span>
          </div>
        )}
      </motion.button>
    )
  }

  return (
    <motion.button
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "w-full p-4 rounded-2xl text-left transition-all duration-300 relative overflow-hidden",
        "backdrop-blur-xl border",
        isSelected
          ? `bg-gradient-to-br ${colors.gradient} border-white/20 shadow-lg ${colors.glow}`
          : `bg-white/[0.04] ${colors.border} hover:bg-white/[0.08] hover:border-white/20`,
        isDisabled && "opacity-40 cursor-not-allowed",
        statusStyle?.opacity
      )}
    >
      {/* Gradient accent line */}
      <div className={cn(
        "absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r to-transparent",
        isSelected ? "from-white/50" : `from-${colors.gradient.split('-')[1]}-500`
      )} />

      {/* Hover glow effect */}
      {!isSelected && (
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl",
          `bg-gradient-to-br ${colors.bg}`
        )} />
      )}

      <div className="relative flex items-start gap-3">
        {/* Icon with gradient background */}
        <motion.div
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.3 }}
          className={cn(
            "p-2.5 rounded-xl flex-shrink-0",
            isSelected
              ? "bg-white/20"
              : `bg-gradient-to-br ${colors.gradient}`
          )}
        >
          <IconComponent className={cn(
            "w-5 h-5",
            isSelected ? "text-white" : "text-white"
          )} />
        </motion.div>

        <div className="flex-1 min-w-0">
          {/* Title row with type indicator */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              "font-bold text-sm truncate",
              isSelected ? "text-white" : "text-white/90"
            )}>
              {powerup.name || info.name || powerupId?.replace('_', ' ')}
            </h3>
            {showType && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] px-1.5 py-0 h-4 font-semibold rounded-full border",
                  isPassive
                    ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
                    : "text-blue-400 border-blue-500/40 bg-blue-500/10"
                )}
              >
                {isPassive ? '🛡️ Auto' : '⚡ Tap'}
              </Badge>
            )}
          </div>

          <p className={cn(
            "text-xs line-clamp-2",
            isSelected ? "text-white/70" : "text-white/50"
          )}>
            {powerup.description || info.description}
          </p>

          {/* Phase badge row */}
          {showPhase && (
            <div className="flex items-center gap-1.5 mt-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] px-1.5 py-0.5 h-auto font-semibold rounded-full border flex items-center gap-1",
                  phaseConfig.color
                )}
              >
                <PhaseIcon className="w-2.5 h-2.5" />
                {phaseConfig.label}
              </Badge>
            </div>
          )}
        </div>

        {/* Right side badges */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {showCost && (
            <Badge
              className={cn(
                "text-xs px-2 py-1 rounded-lg font-bold border",
                isSelected
                  ? "bg-white/20 text-white border-white/30"
                  : `${colors.bg} ${colors.text} ${colors.border}`
              )}
            >
              {powerup.cost || info.cost || 10} ⚡
            </Badge>
          )}

          {/* Status badge for reports */}
          {status && statusStyle && (
            <Badge
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-bold text-white border-0",
                statusStyle.badge
              )}
            >
              {statusStyle.label}
            </Badge>
          )}
        </div>
      </div>
    </motion.button>
  )
}

// Export constants for use in other components
export { POWERUP_ICONS, POWERUP_COLORS, POWERUP_INFO, PHASE_CONFIG }
export default PowerupCard

