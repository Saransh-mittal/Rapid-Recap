// components/quickClashComponents/user/StreakDisplay.jsx
// Compact streak indicator for the Quick Clash header
// Shows current streak count with fire emoji + shield if protected

import React, { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import usePlayer from '../../../hooks/usePlayer'
import { Shield } from 'lucide-react'

// Streak tier colors based on streak count
const getStreakColor = (dayStreak) => {
  if (dayStreak >= 30) return { bg: 'from-yellow-500/20 to-amber-600/20', text: 'text-yellow-400', border: 'border-yellow-400/30' }
  if (dayStreak >= 15) return { bg: 'from-purple-500/20 to-pink-500/20', text: 'text-purple-400', border: 'border-purple-400/30' }
  if (dayStreak >= 8) return { bg: 'from-blue-500/20 to-cyan-500/20', text: 'text-blue-400', border: 'border-blue-400/30' }
  if (dayStreak >= 4) return { bg: 'from-orange-500/20 to-red-500/20', text: 'text-orange-400', border: 'border-orange-400/30' }
  if (dayStreak >= 1) return { bg: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-400', border: 'border-emerald-400/30' }
  return { bg: 'from-slate-500/20 to-slate-600/20', text: 'text-slate-400', border: 'border-slate-400/30' }
}

const StreakDisplay = memo(() => {
  const { player } = usePlayer()
  const dayStreak = player?.quickClashStats?.currentWinStreak || 0
  const isProtected = player?.quickClashStats?.streakProtectionAvailable && dayStreak >= 3
  const colors = getStreakColor(dayStreak)

  return (
    <motion.div
      className={`items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r ${colors.bg} border ${colors.border} flex relative group cursor-help`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Protected Shield Indicator */}
      {isProtected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mr-0.5"
        >
          <Shield className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
        </motion.div>
      )}

      {/* Fire emoji with subtle animation when streak is active */}
      <motion.span
        className="text-sm"
        animate={dayStreak > 0 ? {
          scale: [1, 1.15, 1],
          filter: [
            'drop-shadow(0 0 0px rgba(234,179,8,0))',
            'drop-shadow(0 0 4px rgba(234,179,8,0.5))',
            'drop-shadow(0 0 0px rgba(234,179,8,0))'
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🔥
      </motion.span>

      {/* Streak count */}
      <span className={`text-sm font-bold ${colors.text}`}>
        {dayStreak}
      </span>

      {/* Protection Tooltip */}
      {isProtected && (
        <div className="absolute top-full mb-2 left-1/2 -translate-x-1/2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 w-max">
          <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 text-cyan-100 text-[10px] px-2 py-1 rounded-lg shadow-xl">
            Streak Protected
          </div>
        </div>
      )}
    </motion.div>
  )
})

StreakDisplay.displayName = 'StreakDisplay'
export default StreakDisplay
