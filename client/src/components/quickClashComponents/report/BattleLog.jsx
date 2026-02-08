import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Target, Zap, Eye, Shield, Sparkles, CheckCircle2, XCircle, Timer, Activity, Battery } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * BattleLog (Redesigned)
 * Shows equipped powerups with a premium cyber-tech aesthetic
 */
const BattleLog = ({ activePowerups = [], scoreBreakdown = null }) => {
  // Stats calculation
  const totalPowerups = activePowerups.length
  const activatedPowerups = activePowerups.filter(p => p.used || p.effectApplied).length
  const efficiency = totalPowerups > 0 ? Math.round((activatedPowerups / totalPowerups) * 100) : 0

  if (!activePowerups || activePowerups.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/40 backdrop-blur-xl border border-dashed border-cyan-500/20 rounded-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <Sparkles className="w-6 h-6 text-cyan-400" />
          </div>
          <p className="text-sm text-cyan-200/60 font-medium">No abilities equipped for this session.</p>
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
    if (p.used || p.effectApplied) {
      switch (p.powerupId) {
        case 'TIME_WARP': return '+15s Extended'
        case 'PRECISION_PROTOCOL': return '+50 RQM Bonus'
        case 'SCORE_SURGE': return '1.5x Multiplier'
        case 'ORACLES_EYE': return '2 Options Removed'
        case 'STREAK_SHIELD': return 'Streak Saved'
        default: return 'Effect Applied'
      }
    } else {
      switch (p.powerupId) {
        case 'TIME_WARP': return 'Standby'
        case 'PRECISION_PROTOCOL': return 'Missed Target'
        case 'SCORE_SURGE': return 'Ready'
        case 'ORACLES_EYE': return 'Ready'
        case 'STREAK_SHIELD': return 'Safeguard Ready'
        default: return 'No Trigger'
      }
    }
  }

  const getTheme = (id) => {
    switch (id) {
      case 'TIME_WARP': return 'cyan'
      case 'PRECISION_PROTOCOL': return 'rose'
      case 'SCORE_SURGE': return 'yellow'
      case 'ORACLES_EYE': return 'purple'
      case 'STREAK_SHIELD': return 'emerald'
      default: return 'slate'
    }
  }

  const getStatusDetails = (p) => {
    if (p.used || p.effectApplied) {
      return { label: 'ENGAGED', icon: Activity, style: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
    }
    const isPassive = p.type === 'passive' || ['STREAK_SHIELD', 'PRECISION_PROTOCOL'].includes(p.powerupId)
    if (isPassive) {
      return { label: 'PASSIVE', icon: Battery, style: 'text-slate-400 bg-slate-500/10 border-slate-500/20' }
    }
    return { label: 'READY', icon: Timer, style: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' }
  }

  return (
    <div className="flex flex-col w-full space-y-5">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Activation</span>
            <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{activatedPowerups}</span>
                <span className="text-xs text-white/40">/ {totalPowerups}</span>
            </div>
        </div>
        <div className="p-3 bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Efficiency</span>
            <div className="flex items-baseline gap-1">
                <span className={cn("text-xl font-black", efficiency === 100 ? "text-emerald-400" : "text-white")}>
                    {efficiency}%
                </span>
            </div>
        </div>
      </div>

      <div className="space-y-3">
        {activePowerups.map((p, i) => {
          const Icon = getIcon(p.powerupId)
          const themeName = getTheme(p.powerupId)
          const status = getStatusDetails(p)
          const StatusIcon = status.icon
          const isActivated = p.used || p.effectApplied

          const styles = {
            cyan: {
              container: 'group-hover:border-cyan-500/40 bg-cyan-500/5 shadow-cyan-500/5',
              glow: 'bg-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.5)]',
              iconBg: 'bg-cyan-500/20 text-cyan-300',
              text: 'text-cyan-300',
              dot: 'bg-cyan-400'
            },
            rose: {
              container: 'group-hover:border-rose-500/40 bg-rose-500/5 shadow-rose-500/5',
              glow: 'bg-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.5)]',
              iconBg: 'bg-rose-500/20 text-rose-300',
              text: 'text-rose-300',
              dot: 'bg-rose-400'
            },
            yellow: {
              container: 'group-hover:border-yellow-500/40 bg-yellow-500/5 shadow-yellow-500/5',
              glow: 'bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]',
              iconBg: 'bg-yellow-500/20 text-yellow-300',
              text: 'text-yellow-300',
              dot: 'bg-yellow-400'
            },
            purple: {
              container: 'group-hover:border-purple-500/40 bg-purple-500/5 shadow-purple-500/5',
              glow: 'bg-purple-500/80 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
              iconBg: 'bg-purple-500/20 text-purple-300',
              text: 'text-purple-300',
              dot: 'bg-purple-400'
            },
            emerald: {
              container: 'group-hover:border-emerald-500/40 bg-emerald-500/5 shadow-emerald-500/5',
              glow: 'bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
              iconBg: 'bg-emerald-500/20 text-emerald-300',
              text: 'text-emerald-300',
              dot: 'bg-emerald-400'
            },
            slate: {
              container: 'group-hover:border-slate-500/40 bg-slate-500/5 shadow-slate-500/5',
              glow: 'bg-slate-500/80 shadow-[0_0_10px_rgba(100,116,139,0.5)]',
              iconBg: 'bg-slate-500/20 text-slate-300',
              text: 'text-slate-300',
              dot: 'bg-slate-400'
            }
          }

          const currentStyle = styles[themeName] || styles.slate

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              className={cn(
                "group relative overflow-hidden rounded-xl border transition-all duration-300",
                isActivated
                    ? cn("border-white/20 bg-slate-900/60 shadow-lg", currentStyle.container)
                    : "border-white/5 bg-slate-900/30"
              )}
            >
              {/* Active Glow Line */}
              {isActivated && (
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1",
                    currentStyle.glow
                )} />
              )}

              <div className="p-3.5 pl-5 flex items-center justify-between gap-4">
                {/* Left: Icon & Info */}
                <div className="flex items-center gap-3.5">
                    <div className={cn("p-2 rounded-lg", currentStyle.iconBg)}>
                        <Icon size={18} />
                    </div>
                    <div>
                        <h4 className={cn(
                            "text-sm font-bold tracking-wide",
                            isActivated ? "text-white" : "text-white/60"
                        )}>
                            {getName(p.powerupId)}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn(
                                "text-xs font-mono",
                                isActivated ? currentStyle.text : "text-white/30"
                            )}>
                                {getBenefit(p)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Status Badge */}
                <div className={cn(
                    "px-2.5 py-1 rounded-md border text-[10px] font-bold tracking-wider flex items-center gap-1.5 uppercase",
                    status.style
                )}>
                    {isActivated && <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={cn("w-1.5 h-1.5 rounded-full", currentStyle.dot)}
                    />}
                    {!isActivated && <StatusIcon size={10} />}
                    {status.label}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default BattleLog
