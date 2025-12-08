import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Target, Flame, Sparkles, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const ScoreHero = ({ totalScore, quizScore, forgeScore, precisionBonus, scoreSurgeBonus }) => {
  const maxScore = 500 // Approximate max score for visualization
  const percentage = Math.min((totalScore / maxScore) * 100, 100)
  const radius = 100
  const circumference = 2 * Math.PI * radius

  // Animated stroke offset
  const animatedOffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center w-full py-6 space-y-8">
      {/* Main Score Circle */}
      <div className="relative flex items-center justify-center w-[260px] h-[260px]">
        {/* Outer Glow Ring - Cyan theme */}
        <motion.div
          animate={{
            opacity: [0.4, 0.6, 0.4],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-[-25px] rounded-full bg-cyan-500/20 blur-2xl"
        />

        {/* Secondary glow layer */}
        <motion.div
          animate={{
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute inset-[-15px] rounded-full bg-blue-500/15 blur-xl"
        />

        {/* Progress Circle SVG */}
        <div className="relative w-[220px] h-[220px]">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-white/5"
            />
            {/* Subtle secondary track */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-cyan-500/10"
              strokeDasharray="4 8"
            />
            {/* Progress Arc */}
            <motion.circle
              cx="110"
              cy="110"
              r={radius}
              stroke="url(#cyanGradient)"
              strokeWidth="8"
              fill="transparent"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: animatedOffset }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              strokeDasharray={circumference}
              style={{ filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))' }}
            />
            <defs>
              <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="50%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#22D3EE" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Score Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
              className="flex flex-col items-center"
            >
              <span className="text-[10px] font-bold tracking-[0.3em] text-cyan-400/70 uppercase">
                Total RQM
              </span>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="text-6xl font-black bg-gradient-to-b from-white via-white to-cyan-200 bg-clip-text text-transparent tracking-tight leading-none"
              >
                {totalScore}
              </motion.span>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                transition={{ delay: 1, duration: 0.5 }}
                className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-2"
              />
            </motion.div>
          </div>
        </div>

        {/* Floating sparkle decorations */}
        <motion.div
          animate={{ y: [-5, 5, -5], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-4 right-8"
        >
          <Sparkles className="w-4 h-4 text-cyan-300/60" />
        </motion.div>
        <motion.div
          animate={{ y: [5, -5, 5], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute bottom-8 left-4"
        >
          <Star className="w-3 h-3 text-blue-300/50" />
        </motion.div>
      </div>

      {/* Breakdown Cards */}
      <div className="flex justify-center w-full gap-4">
        {/* Quiz Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex-1 p-4 text-center bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-300"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 via-cyan-500 to-transparent" />
          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative flex flex-col gap-1.5">
            <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Quiz Base
            </span>
            <span className="text-3xl font-black bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              {quizScore}
            </span>
          </div>
        </motion.div>

        {/* Forge Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex-1 p-4 text-center bg-slate-900/50 backdrop-blur-xl border border-orange-500/20 rounded-2xl relative overflow-hidden group hover:border-orange-500/40 transition-all duration-300"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-400 via-orange-500 to-transparent" />
          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative flex flex-col gap-1.5 items-center">
            <div className="flex items-center gap-1.5">
              <Flame size={12} className="text-orange-400" />
              <span className="text-xs font-bold tracking-wider text-orange-400 uppercase">
                Forge
              </span>
            </div>
            <span className="text-3xl font-black bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
              {forgeScore}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bonuses Section */}
      {(precisionBonus > 0 || scoreSurgeBonus > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex gap-3 flex-wrap justify-center"
        >
          {precisionBonus > 0 && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all duration-300"
            >
              <Target size={14} className="text-cyan-300" />
              <span className="text-xs font-bold text-cyan-200">Precision +{precisionBonus}</span>
            </motion.div>
          )}
          {scoreSurgeBonus > 0 && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/30 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:shadow-[0_0_25px_rgba(234,179,8,0.25)] transition-all duration-300"
            >
              <Zap size={14} className="text-yellow-300" />
              <span className="text-xs font-bold text-yellow-200">Surge +{scoreSurgeBonus}</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default ScoreHero

