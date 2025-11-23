// src/components/quickClashComponents/forge/ForgeUtilityComponents.jsx
/**
 * Forge Mode Utility Components
 *
 * Reusable UI components that follow the Quick Clash design system:
 * - Glassmorphism effects with backdrop blur
 * - Transparent backgrounds working with fixed gradient
 * - Mobile-first responsive design
 * - Premium, clean aesthetics
 */

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  TrendingUp,
  Flame,
  CheckCircle,
  XCircle,
  Zap,
  Star,
  Target,
} from 'lucide-react'

/**
 * Reading Timer Component
 *
 * Design Pattern: Visual countdown with progress bar
 * UX Consideration: Color changes to red when time is running low (<5s)
 * Performance: Uses requestAnimationFrame for smooth countdown
 */
export const ReadingTimer = ({ seconds, onComplete, accentColor, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const progress = (timeLeft / seconds) * 100

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.()
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, onComplete])

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
        <div className="relative w-5 h-5 flex items-center justify-center">
          <Clock className="w-4 h-4 text-white/80" />
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/10" />
            <circle
              cx="10" cy="10" r="9"
              stroke={timeLeft <= 5 ? '#ef4444' : accentColor}
              strokeWidth="2" fill="transparent"
              strokeDasharray={56}
              strokeDashoffset={56 - (56 * progress) / 100}
              className="transition-all duration-1000 linear"
            />
          </svg>
        </div>
        <span className={`font-mono font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          {timeLeft}s
        </span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-md bg-white/5 rounded-xl border border-white/10 p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock
            className="w-5 h-5"
            style={{ color: timeLeft <= 5 ? '#ef4444' : accentColor }}
          />
          <span className="text-sm font-medium text-white/80">
            Reading Time
          </span>
        </div>
        <motion.div
          animate={timeLeft <= 5 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="text-2xl font-bold"
          style={{ color: timeLeft <= 5 ? '#ef4444' : accentColor }}
        >
          {timeLeft}s
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              timeLeft <= 5
                ? 'linear-gradient(to right, #ef4444, #dc2626)'
                : `linear-gradient(to right, ${accentColor}, ${accentColor}dd)`,
          }}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  )
}

/**
 * Section Progress Indicator
 *
 * Visual Design: Shows 5 dots representing sections
 * States: locked, active, completed, unlocked
 * Accessibility: Includes completion checkmarks
 */
export const SectionProgress = ({
  current,
  total,
  unlockedSections,
  accentColor,
}) => {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-3 py-2 md:py-4">
      {Array.from({ length: total }, (_, i) => {
        const isCompleted = i < current
        const isActive = i === current
        const isUnlocked = unlockedSections.includes(i)

        return (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="relative"
          >
            <div
              className={`
                w-2 h-2 md:w-10 md:h-10 rounded-full flex items-center justify-center
                transition-all duration-300
                ${
                  isCompleted
                    ? 'border-emerald-500 bg-emerald-500/20 md:border-2'
                    : isActive
                    ? 'bg-white scale-125 md:scale-110 md:border-2 md:border-white md:bg-white/10'
                    : 'bg-white/20 md:border-2 md:border-white/30 md:bg-white/5'
                }
              `}
            >
              <div className="hidden md:block">
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <span
                    className={`text-sm font-bold ${
                      isActive ? 'text-white' : 'text-white/50'
                    }`}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
            </div>

            {/* Active indicator pulse */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full hidden md:block"
                style={{
                  border: `2px solid ${accentColor}`,
                  boxShadow: `0 0 20px ${accentColor}80`,
                }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

/**
 * Score Display with Animation
 *
 * Features:
 * - Animated score increases
 * - Streak indicator with fire emoji
 * - Popup for score gains
 */
export const ScoreDisplay = ({ score, streak, lastScore, accentColor, compact = false }) => {
  const [showPopup, setShowPopup] = useState(false)
  const scoreDiff = lastScore ? score - lastScore : 0

  useEffect(() => {
    if (scoreDiff > 0) {
      setShowPopup(true)
      const timer = setTimeout(() => setShowPopup(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [score, scoreDiff])

  if (compact) {
    return (
      <div className="relative flex items-center gap-3">
        {/* Streak Badge */}
        <AnimatePresence>
          {streak > 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30"
            >
              <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
              <span className="text-xs font-bold text-orange-300">{streak}x</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score */}
        <div className="flex flex-col items-end">
          <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Score</div>
          <motion.div
            key={score}
            initial={{ scale: 1.5, color: accentColor }}
            animate={{ scale: 1, color: '#ffffff' }}
            className="text-xl font-bold tabular-nums leading-none"
          >
            {score}
          </motion.div>
        </div>

        {/* Score Popup */}
        <AnimatePresence>
          {showPopup && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, y: -30, scale: 1.2, rotate: 0 }}
              exit={{ opacity: 0, y: -40, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="absolute right-0 -bottom-10 font-black text-lg whitespace-nowrap z-50 italic"
              style={{
                color: accentColor,
                textShadow: `0 0 20px ${accentColor}, 0 0 10px white`
              }}
            >
              +{scoreDiff} Points!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="backdrop-blur-md bg-white/5 rounded-xl border border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5" style={{ color: accentColor }} />
            <div>
              <div className="text-xs text-white/60 font-medium">Score</div>
              <motion.div
                key={score}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-white"
              >
                {score}
              </motion.div>
            </div>
          </div>

          {streak > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500/20 border border-orange-500/30"
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-bold text-orange-300">
                {streak}x
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Score gain popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            className="absolute -top-8 right-0 px-3 py-1 rounded-lg font-bold text-sm"
            style={{
              background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}60)`,
              border: `1px solid ${accentColor}`,
              color: '#fff',
              boxShadow: `0 4px 20px ${accentColor}60`,
            }}
          >
            +{scoreDiff}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Answer Feedback Component
 *
 * Shows immediate visual feedback for correct/incorrect answers
 * Design: Uses motion for smooth entry animations
 * UX: Different styling for correct (green) vs incorrect (red)
 */
export const AnswerFeedback = ({
  isCorrect,
  correctAnswer,
  scoreGained,
  streakBonus,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`
        mt-4 p-4 rounded-xl backdrop-blur-md border-2
        ${
          isCorrect
            ? 'bg-emerald-500/10 border-emerald-500/50'
            : 'bg-red-500/10 border-red-500/50'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          ${isCorrect ? 'bg-emerald-500/20' : 'bg-red-500/20'}
        `}
        >
          {isCorrect ? (
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          ) : (
            <XCircle className="w-6 h-6 text-red-400" />
          )}
        </div>

        <div className="flex-1">
          <h4
            className={`font-bold mb-1 ${
              isCorrect ? 'text-emerald-300' : 'text-red-300'
            }`}
          >
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </h4>

          {isCorrect ? (
            <div className="space-y-1">
              <p className="text-sm text-white/80">
                Content unlocked! +{scoreGained} points
              </p>
              {streakBonus > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-orange-300">
                  <Zap className="w-3 h-3" />
                  <span>Streak bonus: +{streakBonus} points</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/80">
              The correct answer was option {correctAnswer + 1}. Content still
              unlocked - keep going!
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Context Nugget Component
 *
 * Small contextual hints that appear above questions
 * Design Pattern: Minimalist info cards with icons
 */
export const ContextNugget = ({ text, accentColor }) => {
  if (!text) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 px-4 py-2 rounded-lg backdrop-blur-sm border flex items-center gap-2 text-sm"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderColor: `${accentColor}40`,
        boxShadow: `0 0 15px ${accentColor}20`,
      }}
    >
      <Target
        className="w-4 h-4 flex-shrink-0"
        style={{ color: accentColor }}
      />
      <span className="text-white/90 font-medium">{text}</span>
    </motion.div>
  )
}

/**
 * Completion Stats Component
 *
 * Displays final statistics when forge mode completes
 * Shows: Total score, correct answers, max streak
 */
export const CompletionStats = ({
  totalScore,
  correctAnswers,
  maxStreak,
  accentColor,
}) => {
  const stats = [
    { label: 'Final Score', value: totalScore, icon: Star, color: accentColor },
    {
      label: 'Correct Answers',
      value: `${correctAnswers}/5`,
      icon: CheckCircle,
      color: '#10b981',
    },
    {
      label: 'Max Streak',
      value: `${maxStreak}x`,
      icon: Flame,
      color: '#f59e0b',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="backdrop-blur-md bg-white/5 rounded-xl border border-white/10 p-4 text-center flex flex-row md:flex-col items-center justify-between md:justify-center"
        >
          <div className="flex items-center gap-3 md:block">
            <stat.icon
              className="w-6 h-6 md:mx-auto md:mb-2"
              style={{ color: stat.color }}
            />
            <div className="text-xs text-white/60 md:hidden">{stat.label}</div>
          </div>
          <div className="text-right md:text-center">
            <div className="text-xl md:text-2xl font-bold text-white md:mb-1">{stat.value}</div>
            <div className="hidden md:block text-xs text-white/60">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )

}
