import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Target, Zap, Eye, Shield, Sparkles, CheckCircle2, XCircle, Timer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * AbilityBreakdown (renamed from BattleLog)
 * Shows ALL equipped powerups with their activation status and contribution
 *
 * Status types:
 * - activated: Used and had effect
 * - unused: Equipped but not triggered (active powerups)
 * - failed: Passive that didn't trigger (condition not met)
 */
const BattleLog = ({ activePowerups = [], scoreBreakdown = null }) => {
  // If no powerups were equipped, show empty state
  if (!activePowerups || activePowerups.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-900/40 backdrop-blur-xl border border-dashed border-cyan-500/20 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
        <div className="relative">
          <Sparkles className="w-8 h-8 text-cyan-400/40 mx-auto mb-3" />
          <p className="text-sm text-white/50 font-medium">No abilities equipped for this session.</p>
        </div>
      </div>
    )
  }

  const getIcon = (id) => {
    switch (id) {
      case 'TIME_WARP': return Clock
      case 'PRECISION_PROTOCOL': return Target
      case 'SCORE_SURGE': return Zap
      case 'ORACLES_EYE': return Eye
      case 'STREAK_SHIELD': return Shield
      default: return Zap
    }
  }

  const getName = (id) => {
    switch (id) {
      case 'TIME_WARP': return 'Time Warp'
      case 'PRECISION_PROTOCOL': return 'Precision Protocol'
      case 'SCORE_SURGE': return 'Score Surge'
      case 'ORACLES_EYE': return "Oracle's Eye"
      case 'STREAK_SHIELD': return 'Streak Shield'
      default: return id?.replace('_', ' ')
    }
  }

  const getBenefit = (p) => {
    // Check if powerup was used/applied
    if (p.used || p.effectApplied) {
      switch (p.powerupId) {
        case 'TIME_WARP': return '+15s timer extension applied'
        case 'PRECISION_PROTOCOL': return '+50 RQM bonus earned'
        case 'SCORE_SURGE': return 'Score multiplier applied'
        case 'ORACLES_EYE': return '2 options eliminated'
        case 'STREAK_SHIELD': return 'Streak protected once'
        default: return 'Effect applied'
      }
    } else {
      // Not used
      switch (p.powerupId) {
        case 'TIME_WARP': return 'Timer extension not needed'
        case 'PRECISION_PROTOCOL': return 'Required 100% accuracy'
        case 'SCORE_SURGE': return 'Not activated during session'
        case 'ORACLES_EYE': return 'Not used during session'
        case 'STREAK_SHIELD': return 'No streak break occurred'
        default: return 'Not triggered'
      }
    }
  }

  const getColorClasses = (id) => {
    switch (id) {
      case 'TIME_WARP': return { bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', text: 'text-cyan-300', iconBg: 'bg-cyan-500/20' }
      case 'PRECISION_PROTOCOL': return { bg: 'bg-rose-500/15', border: 'border-rose-500/30', text: 'text-rose-300', iconBg: 'bg-rose-500/20' }
      case 'SCORE_SURGE': return { bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-yellow-300', iconBg: 'bg-yellow-500/20' }
      case 'ORACLES_EYE': return { bg: 'bg-purple-500/15', border: 'border-purple-500/30', text: 'text-purple-300', iconBg: 'bg-purple-500/20' }
      case 'STREAK_SHIELD': return { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-300', iconBg: 'bg-emerald-500/20' }
      default: return { bg: 'bg-gray-500/15', border: 'border-gray-500/30', text: 'text-gray-300', iconBg: 'bg-gray-500/20' }
    }
  }

  const getStatus = (p) => {
    if (p.used || p.effectApplied) {
      return { label: '✓ Activated', color: 'bg-emerald-500', icon: CheckCircle2 }
    }
    // Check if it's a passive that failed condition
    const isPassive = p.type === 'passive' || ['STREAK_SHIELD', 'PRECISION_PROTOCOL'].includes(p.powerupId)
    if (isPassive) {
      return { label: 'No Effect', color: 'bg-slate-600', icon: XCircle }
    }
    return { label: 'Ready', color: 'bg-slate-500', icon: Timer }
  }

  const getPhaseLabel = (phase) => {
    switch (phase?.toLowerCase()) {
      case 'quiz': return 'Quiz'
      case 'forge': return 'Forge'
      case 'both': return 'Both'
      default: return phase || 'Both'
    }
  }

  const getPhaseBadgeColor = (phase) => {
    switch (phase?.toLowerCase()) {
      case 'forge': return 'text-orange-400 border-orange-400/40 bg-orange-500/10'
      case 'quiz': return 'text-cyan-400 border-cyan-400/40 bg-cyan-500/10'
      default: return 'text-purple-400 border-purple-400/40 bg-purple-500/10'
    }
  }

  // Separate powerups by status for visual grouping
  const usedPowerups = activePowerups.filter(p => p.used || p.effectApplied)
  const unusedPowerups = activePowerups.filter(p => !p.used && !p.effectApplied)

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full" />
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-[0.15em]">
            Ability Breakdown
          </h3>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] px-2 py-0.5 text-white/50 border-white/20"
        >
          {usedPowerups.length}/{activePowerups.length} activated
        </Badge>
      </div>

      {/* Score Contribution (if available) */}
      {scoreBreakdown && (scoreBreakdown.precisionBonus > 0 || scoreBreakdown.scoreSurgeBonus > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
        >
          <p className="text-xs font-bold text-emerald-400 mb-2">Ability Bonuses</p>
          <div className="flex flex-wrap gap-3 text-xs text-white/70">
            {scoreBreakdown.precisionBonus > 0 && (
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3 text-rose-400" />
                +{scoreBreakdown.precisionBonus} Precision
              </span>
            )}
            {scoreBreakdown.scoreSurgeBonus > 0 && (
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                +{scoreBreakdown.scoreSurgeBonus} Score Surge
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* All Powerups */}
      {activePowerups.map((p, i) => {
        const IconComponent = getIcon(p.powerupId)
        const colors = getColorClasses(p.powerupId)
        const status = getStatus(p)
        const StatusIcon = status.icon
        const phaseColor = getPhaseBadgeColor(p.phase)
        const isActivated = p.used || p.effectApplied

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.08 * i, duration: 0.3 }}
            className={cn(
              "relative p-4 overflow-hidden backdrop-blur-xl border rounded-2xl transition-all duration-300",
              isActivated
                ? "bg-slate-900/50 border-white/15"
                : "bg-slate-900/30 border-white/5 opacity-70"
            )}
          >
            {/* Top accent gradient */}
            {isActivated && (
              <div className={cn(
                "absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r to-transparent opacity-80",
                colors.text.replace('text-', 'from-')
              )} />
            )}

            <div className="relative flex justify-between items-start gap-3">
              <div className="flex gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={cn(
                    "p-2.5 rounded-xl border backdrop-blur-sm",
                    colors.iconBg,
                    colors.border
                  )}
                >
                  <IconComponent className={cn("w-5 h-5", colors.text)} />
                </motion.div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-white">
                    {getName(p.powerupId)}
                  </span>
                  <span className="text-xs text-white/50">
                    {getBenefit(p)}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge
                      variant="outline"
                      className={cn("text-[9px] px-1.5 py-0 h-4 font-semibold rounded-full", phaseColor)}
                    >
                      {getPhaseLabel(p.phase)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <Badge
                className={cn(
                  "text-[10px] px-2 py-1 uppercase tracking-wider border-0 font-bold rounded-full flex items-center gap-1",
                  status.color
                )}
              >
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </Badge>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default BattleLog
