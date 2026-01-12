// components/quickClashComponents/v2/StreakPopup.jsx
// Daily streak popup shown on first app visit of the day
// Works for both session players and authenticated users

import React, { memo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Swords, Flame, Clock, UserPlus, ChevronRight, Zap } from 'lucide-react'

// Audio and haptics
import { quizAudioService } from '../../../services/quizAudioService'
import { haptics } from '../../../utils/haptics'

// Streak tier configuration
const STREAK_TIERS = [
  { minDays: 30, multiplier: '3.0x', label: 'Legendary', emoji: '🏆', color: 'from-yellow-400 to-amber-600' },
  { minDays: 15, multiplier: '2.5x', label: 'Master', emoji: '⭐', color: 'from-purple-400 to-pink-500' },
  { minDays: 8, multiplier: '2.0x', label: 'Expert', emoji: '💪', color: 'from-blue-400 to-cyan-500' },
  { minDays: 4, multiplier: '1.5x', label: 'Rising', emoji: '🔥', color: 'from-orange-400 to-red-500' },
  { minDays: 1, multiplier: '1.0x', label: 'Started', emoji: '✨', color: 'from-emerald-400 to-teal-500' },
  { minDays: 0, multiplier: '1.0x', label: 'None', emoji: '💤', color: 'from-slate-400 to-slate-600' },
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

const StreakPopup = memo(({
  isOpen,
  onClose,
  onPlayBattle,
  onCreateAccount,
  streak = { dayStreak: 0, longestStreak: 0, needsPlayToday: true },
  isSessionPlayer = false,
}) => {
  const dayStreak = streak?.dayStreak || 0
  const longestStreak = streak?.longestStreak || 0
  const needsPlayToday = streak?.needsPlayToday !== false
  const streakExpired = streak?.streakExpired || false

  const currentTier = getStreakTier(dayStreak)
  const nextTier = getNextTier(dayStreak)

  // Determine messaging based on streak state
  const getHeaderMessage = () => {
    if (dayStreak === 0) {
      return {
        title: 'Start Your Streak!',
        subtitle: 'Play a battle today to begin',
        urgency: 'start',
      }
    }
    if (streakExpired) {
      return {
        title: 'Streak Lost! 😢',
        subtitle: `Your ${dayStreak}-day streak expired`,
        urgency: 'lost',
      }
    }
    if (needsPlayToday) {
      return {
        title: `🔥 Day ${dayStreak} Streak!`,
        subtitle: 'Play today to keep it going',
        urgency: 'protect',
      }
    }
    return {
      title: `🔥 Day ${dayStreak} Streak!`,
      subtitle: "You're on fire!",
      urgency: 'safe',
    }
  }

  const headerMessage = getHeaderMessage()

  const handlePlayBattle = () => {
    haptics.impact()
    quizAudioService.playButtonClick()
    onClose()
    if (onPlayBattle) {
      onPlayBattle()
    }
  }

  const handleCreateAccount = () => {
    haptics.impact()
    quizAudioService.playSubmit()
    if (onCreateAccount) {
      onCreateAccount()
    }
  }

  const handleClose = () => {
    haptics.light()
    quizAudioService.playButtonClick()
    onClose()
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
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="relative w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 27, 75, 0.98) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>

            {/* Streak Fire Animation */}
            <div className="pt-8 pb-4 px-6 text-center relative overflow-hidden">
              {/* Background glow effect */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${dayStreak > 0 ? 'rgba(249, 115, 22, 0.4)' : 'rgba(100, 116, 139, 0.3)'} 0%, transparent 70%)`,
                }}
              />

              {/* Streak number with fire */}
              <motion.div
                className="relative mb-4"
                animate={dayStreak > 0 ? {
                  scale: [1, 1.05, 1],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* Fire emoji or sad emoji */}
                <div className="text-5xl mb-2">
                  {dayStreak > 0 ? (
                    streakExpired ? '😢' : '🔥'
                  ) : '💤'}
                </div>

                {/* Streak number */}
                <motion.div
                  className={`text-6xl font-black bg-gradient-to-r ${currentTier.color} bg-clip-text text-transparent`}
                  animate={dayStreak > 0 ? {
                    filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'],
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {dayStreak}
                </motion.div>
                <div className="text-sm text-white/60 uppercase tracking-wider mt-1">
                  {dayStreak === 1 ? 'Day' : 'Days'}
                </div>
              </motion.div>

              {/* Header message */}
              <h2 className="text-xl font-bold text-white mb-1">
                {headerMessage.title}
              </h2>
              <p className="text-sm text-white/60">
                {headerMessage.subtitle}
              </p>
            </div>

            {/* Tier Progress */}
            <div className="px-6 pb-4">
              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {/* Current tier */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{currentTier.emoji}</span>
                    <span className="text-sm text-white font-semibold">{currentTier.label}</span>
                  </div>
                  <div className="text-sm text-orange-400 font-bold">
                    {currentTier.multiplier} rewards
                  </div>
                </div>

                {/* Next tier info */}
                {nextTier && (
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span>
                      {nextTier.daysUntil} more {nextTier.daysUntil === 1 ? 'day' : 'days'} to {nextTier.label} ({nextTier.multiplier})
                    </span>
                  </div>
                )}

                {/* Longest streak */}
                {longestStreak > 0 && longestStreak > dayStreak && (
                  <div className="flex items-center gap-2 text-xs text-white/40 mt-2">
                    <span>🏅 Personal best: {longestStreak} days</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6 space-y-2">
              {/* Primary CTA - Play Battle */}
              <motion.button
                onClick={handlePlayBattle}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: dayStreak > 0 && !streakExpired
                    ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                    : 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
                  boxShadow: dayStreak > 0 && !streakExpired
                    ? '0 4px 20px rgba(249, 115, 22, 0.4)'
                    : '0 4px 20px rgba(34, 211, 238, 0.3)',
                }}
              >
                <Swords className="w-5 h-5" />
                {dayStreak > 0 && !streakExpired
                  ? 'Play to Keep Streak'
                  : 'Start Your Streak!'
                }
                <ChevronRight className="w-4 h-4" />
              </motion.button>

              {/* Session player CTA - Create Account */}
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
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Save Streak Forever</span>
                </motion.button>
              )}

              {/* Info text for session players */}
              {isSessionPlayer && dayStreak > 0 && (
                <p className="text-xs text-center text-white/40 pt-1">
                  Create an account to never lose your streak!
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

StreakPopup.displayName = 'StreakPopup'
export default StreakPopup
