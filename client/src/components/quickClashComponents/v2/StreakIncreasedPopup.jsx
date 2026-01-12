// components/quickClashComponents/v2/StreakIncreasedPopup.jsx
// Celebratory popup shown when streak increases after completing a quiz

import React, { memo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Gift, TrendingUp, Sparkles, ChevronRight, UserPlus } from 'lucide-react'

// Audio and haptics
import { quizAudioService } from '../../../services/quizAudioService'
import { haptics } from '../../../utils/haptics'

// Streak tier configuration
const STREAK_TIERS = [
  { minDays: 30, multiplier: '3.0x', label: 'Legendary', emoji: '🏆', color: 'from-yellow-400 to-amber-600', bgGlow: 'rgba(251, 191, 36, 0.3)' },
  { minDays: 15, multiplier: '2.5x', label: 'Master', emoji: '⭐', color: 'from-purple-400 to-pink-500', bgGlow: 'rgba(168, 85, 247, 0.3)' },
  { minDays: 8, multiplier: '2.0x', label: 'Expert', emoji: '💪', color: 'from-blue-400 to-cyan-500', bgGlow: 'rgba(59, 130, 246, 0.3)' },
  { minDays: 4, multiplier: '1.5x', label: 'Rising', emoji: '🔥', color: 'from-orange-400 to-red-500', bgGlow: 'rgba(249, 115, 22, 0.3)' },
  { minDays: 1, multiplier: '1.0x', label: 'Started', emoji: '✨', color: 'from-emerald-400 to-teal-500', bgGlow: 'rgba(16, 185, 129, 0.3)' },
]

const getStreakTier = (dayStreak) => {
  return STREAK_TIERS.find(tier => dayStreak >= tier.minDays) || STREAK_TIERS[STREAK_TIERS.length - 1]
}

const getNextTier = (dayStreak) => {
  const currentTierIndex = STREAK_TIERS.findIndex(tier => dayStreak >= tier.minDays)
  if (currentTierIndex > 0) {
    const nextTier = STREAK_TIERS[currentTierIndex - 1]
    return { ...nextTier, daysUntil: nextTier.minDays - dayStreak }
  }
  return null
}

// Fire particle animation
const FireParticle = ({ delay }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full"
    style={{
      background: 'linear-gradient(135deg, #f97316, #dc2626)',
      left: `${45 + Math.random() * 10}%`,
    }}
    initial={{ y: 0, opacity: 1, scale: 1 }}
    animate={{
      y: -80,
      opacity: 0,
      scale: 0.3,
      x: (Math.random() - 0.5) * 40,
    }}
    transition={{
      duration: 1.2,
      delay,
      repeat: Infinity,
      repeatDelay: 0.3,
    }}
  />
)

const StreakIncreasedPopup = memo(({
  isOpen,
  onClose,
  streakResult,
  onCreateAccount,
  isSessionPlayer = false,
}) => {
  if (!streakResult) return null

  // API returns newStreak, previousStreak, longestStreak, etc.
  const { newStreak, longestStreak, previousStreak, tierLabel, tierEmoji, nextTier } = streakResult
  const dayStreak = newStreak // Alias for internal use
  const currentTier = getStreakTier(dayStreak)
  const computedNextTier = nextTier || getNextTier(dayStreak)
  const isNewStreak = previousStreak === 0 || !previousStreak
  const isMilestone = dayStreak === 4 || dayStreak === 8 || dayStreak === 15 || dayStreak === 30 || dayStreak === 50 || dayStreak === 100
  const tierUp = streakResult.milestoneReached && streakResult.milestoneReached.includes('tier')

  // Play celebration sound on open
  useEffect(() => {
    if (isOpen) {
      haptics.success()
      if (isMilestone || tierUp) {
        quizAudioService.playSubmit()
      } else {
        quizAudioService.playCorrect?.() || quizAudioService.playButtonClick()
      }
    }
  }, [isOpen, isMilestone, tierUp])

  const handleClose = () => {
    haptics.light()
    quizAudioService.playButtonClick()
    onClose()
  }

  const handleCreateAccount = () => {
    haptics.impact()
    quizAudioService.playSubmit()
    onClose()
    if (onCreateAccount) {
      onCreateAccount()
    }
  }

  const getHeadline = () => {
    if (isNewStreak) return '🔥 Streak Started!'
    if (tierUp) return `🎉 ${currentTier.label} Tier Unlocked!`
    if (isMilestone) return `🏆 ${dayStreak} Day Milestone!`
    return '🔥 Streak Continued!'
  }

  const getSubheadline = () => {
    if (isNewStreak) return "You're on fire! Come back tomorrow to keep it going."
    if (tierUp) return `Amazing! You've unlocked ${currentTier.multiplier} reward multiplier!`
    if (isMilestone) return "Incredible dedication! You're a true champion."
    return `Day ${dayStreak}! Keep the momentum going.`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 27, 75, 0.98) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: `0 25px 60px -12px rgba(0, 0, 0, 0.6), 0 0 100px ${currentTier.bgGlow}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-20"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>

            {/* Fire particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <FireParticle key={i} delay={i * 0.15} />
              ))}
            </div>

            {/* Header with flame animation */}
            <div className="pt-8 pb-4 px-6 text-center relative">
              {/* Background glow */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${currentTier.bgGlow} 0%, transparent 70%)`,
                }}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Streak number with fire effect */}
              <motion.div
                className="relative inline-flex flex-col items-center mb-4"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {/* Fire emoji - positioned above the number */}
                <motion.div
                  className="text-4xl mb-1"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  🔥
                </motion.div>

                {/* Streak number */}
                <motion.div
                  className={`text-7xl font-black bg-gradient-to-r ${currentTier.color} bg-clip-text text-transparent relative z-10`}
                  animate={{
                    filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {dayStreak}
                </motion.div>
              </motion.div>

              {/* Headlines */}
              <motion.h2
                className="text-2xl font-bold text-white mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {getHeadline()}
              </motion.h2>
              <motion.p
                className="text-sm text-white/70"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {getSubheadline()}
              </motion.p>
            </div>

            {/* Stats and rewards */}
            <div className="px-6 pb-4 space-y-3">
              {/* Current streak tier */}
              <motion.div
                className="p-3 rounded-xl flex items-center justify-between"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentTier.emoji}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{currentTier.label} Tier</div>
                    <div className="text-xs text-white/50">Current reward level</div>
                  </div>
                </div>
                <div className={`text-lg font-bold bg-gradient-to-r ${currentTier.color} bg-clip-text text-transparent`}>
                  {currentTier.multiplier}
                </div>
              </motion.div>

              {/* Next tier progress */}
              {computedNextTier && (
                <motion.div
                  className="p-3 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px dashed rgba(255, 255, 255, 0.1)',
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{computedNextTier.daysUntil} more {computedNextTier.daysUntil === 1 ? 'day' : 'days'} to unlock</span>
                    <span className={`font-bold bg-gradient-to-r ${computedNextTier.color || 'from-yellow-400 to-amber-600'} bg-clip-text text-transparent`}>
                      {computedNextTier.multiplier}x {computedNextTier.label}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Tomorrow reminder */}
              <motion.div
                className="p-3 rounded-xl flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%)',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Calendar className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <div className="text-sm text-white">
                  <span className="font-semibold text-orange-400">Come back tomorrow</span>
                  <span className="text-white/60"> to continue your streak!</span>
                </div>
              </motion.div>
            </div>

            {/* Action buttons */}
            <div className="px-6 pb-6 space-y-2">
              {/* Main CTA - Close/Continue */}
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${currentTier.bgGlow.replace('0.3', '1')}, ${currentTier.bgGlow.replace('0.3', '0.8').replace('rgba', 'rgba')})`,
                  background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
                  boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Sparkles className="w-5 h-5" />
                <span>Awesome!</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>

              {/* Session player CTA */}
              {isSessionPlayer && (
                <motion.button
                  onClick={handleCreateAccount}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl font-semibold text-white/80 hover:text-white flex items-center justify-center gap-2 transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                    border: '1px solid rgba(147, 51, 234, 0.3)',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Save Streak Forever</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

StreakIncreasedPopup.displayName = 'StreakIncreasedPopup'
export default StreakIncreasedPopup
