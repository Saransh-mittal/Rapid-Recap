// components/quickClashComponents/user/StreakDisplay.jsx
// Compact streak indicator for the Quick Clash header
// Shows current streak count with fire emoji + shield if protected

import React, { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import usePlayer from '../../../hooks/usePlayer'
import { Shield, Flame, Trophy } from 'lucide-react'

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
  const [isHovered, setIsHovered] = useState(false)

  // Use dayStreak from player.streak object (populated for both auth users and session players)
  const dayStreak = player?.streak?.dayStreak || 0
  const longestStreak = player?.streak?.longestStreak || 0

  // Check protection availability from the same source
  const isProtected = player?.streak?.streakProtectionAvailable && dayStreak >= 3
  const colors = getStreakColor(dayStreak)

  return (
    <div
      className="relative z-50 w-fit flex flex-col items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(!isHovered)}
    >
      <motion.div
        className={`items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${colors.bg} border ${colors.border} flex relative cursor-help backdrop-blur-sm`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Protected Shield Indicator */}
        {isProtected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mr-0.5 relative"
          >
             <div className="absolute inset-0 bg-cyan-400/40 blur-[4px] rounded-full" />
             <Shield className="w-3.5 h-3.5 text-cyan-200 fill-cyan-400/20 relative z-10" />
          </motion.div>
        )}

        {/* Fire emoji with subtle animation when streak is active */}
        <motion.div
           className="relative flex items-center justify-center"
           animate={dayStreak > 0 ? {
             scale: [1, 1.1, 1],
           } : {}}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {dayStreak > 0 && (
             <div className="absolute inset-0 bg-orange-500/30 blur-[6px] rounded-full animate-pulse" />
          )}
          <span className="text-sm relative z-10 filter drop-shadow-sm">🔥</span>
        </motion.div>

        {/* Streak count */}
        <span className={`text-sm font-extrabold tracking-tight ${colors.text} drop-shadow-sm`}>
          {dayStreak}
        </span>
      </motion.div>

      {/* Rich Popover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[180px] max-w-[90vw] z-[100]"
          >
             <div className="bg-slate-900/95 backdrop-blur-xl rounded-xl p-3 border border-white/10 shadow-2xl relative overflow-hidden ring-1 ring-black/20">

                {/* Subtle top shimmer */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="flex flex-col gap-2.5">

                   {/* Stats Row */}
                   <div className="flex items-center justify-between px-1">
                      {/* Current */}
                      <div className="flex flex-col items-center flex-1">
                          <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider mb-0.5">Current</span>
                          <div className="flex items-center gap-1.5">
                              <Flame className={`w-3.5 h-3.5 ${colors.text} fill-current/20`} />
                              <span className={`text-lg font-bold text-white`}>{dayStreak}</span>
                          </div>
                      </div>

                      {/* Divider */}
                      <div className="w-px h-8 bg-white/10 mx-1" />

                      {/* Longest */}
                      <div className="flex flex-col items-center flex-1">
                          <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider mb-0.5">Best</span>
                          <div className="flex items-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500/20" />
                              <span className="text-lg font-bold text-white">{longestStreak}</span>
                          </div>
                      </div>
                   </div>

                   {/* Protection Status (if active) */}
                   {isProtected && (
                      <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-lg py-1.5 px-2 flex items-center justify-center gap-1.5">
                          <Shield className="w-3 h-3 text-cyan-400" />
                          <span className="text-[10px] font-medium text-cyan-200">Streak Protected</span>
                      </div>
                   )}

                   {/* Mini Footer */}
                   {!isProtected && (
                      <div className="text-center border-t border-white/5 pt-2">
                        <p className="text-[10px] text-slate-500 font-medium">
                          {dayStreak > 0 ? "Keep it up!" : "Start today!"}
                        </p>
                      </div>
                   )}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

StreakDisplay.displayName = 'StreakDisplay'
export default StreakDisplay
