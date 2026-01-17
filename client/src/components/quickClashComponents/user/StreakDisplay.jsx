// components/quickClashComponents/user/StreakDisplay.jsx
// Compact streak indicator for the Quick Clash header
// Shows current streak count with fire emoji

import React, { memo } from 'react'
import { motion } from 'framer-motion'
import usePlayer from '../../../hooks/usePlayer'

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
  const dayStreak = player?.streak?.dayStreak || 0
  const colors = getStreakColor(dayStreak)

  return (
    <motion.div
      className={`flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 py-1 xs:py-1.5 rounded-full bg-gradient-to-r ${colors.bg} border ${colors.border}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Fire emoji with subtle animation when streak is active */}
      <motion.span
        className="text-xs xs:text-sm"
        animate={dayStreak > 0 ? {
          scale: [1, 1.15, 1],
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        🔥
      </motion.span>

      {/* Streak count */}
      <span className={`text-xs xs:text-sm font-bold ${colors.text}`}>
        {dayStreak}
      </span>
    </motion.div>
  )
})

StreakDisplay.displayName = 'StreakDisplay'
export default StreakDisplay
