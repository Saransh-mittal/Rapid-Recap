// components/quickClashComponents/v2/PostSessionRewardScreen.jsx
// First-time session player reward screen - KEY CONVERSION MOMENT
// Shown only once after first quiz completion to drive engagement and next match

import React, { memo, useEffect, useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Trophy,
  Coins,
  Flame,
  Clock,
  Share2,
  Zap,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Swords,
  Gift,
  Hammer,
  HelpCircle,
} from 'lucide-react'
import confetti from 'canvas-confetti'

// Audio and haptics
import { quizAudioService } from '../../../services/quizAudioService'
import { haptics } from '../../../utils/haptics'

// Lazy load share modal
const ShareQuizResultModal = lazy(() => import('./ShareQuizResultModal'))

// Animated counter component for coins
const AnimatedNumber = ({ value, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime = null
    const startValue = 0

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      // Easing function for smoother animation
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(startValue + (value - startValue) * easeOut))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return <span>{displayValue}</span>
}

// Coin breakdown row
const CoinRow = ({ label, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="flex items-center justify-between py-1.5"
  >
    <div className="flex items-center gap-2">
      {Icon && <Icon className={`w-3.5 h-3.5 ${color}`} />}
      <span className="text-xs text-white/70">{label}</span>
    </div>
    <span className={`text-xs font-bold ${color}`}>+{value}</span>
  </motion.div>
)

// Floating particle effect for premium feel
const FloatingParticle = ({ delay, x, size = 4 }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
    style={{ width: size, height: size, left: `${x}%` }}
    initial={{ opacity: 0, y: 100, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      y: [100, -50],
      scale: [0, 1, 0.5],
    }}
    transition={{
      delay,
      duration: 3,
      repeat: Infinity,
      repeatDelay: Math.random() * 2,
    }}
  />
)

// ═══════════════════════════════════════════════════════════════
// ACCURACY RING - Animated circular progress for Forge/Quiz phases
// ═══════════════════════════════════════════════════════════════
const AccuracyRing = memo(({ label, correct, total, percentage, color, icon: Icon, size = 64 }) => {
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg className="absolute inset-0 -rotate-90" style={{ width: size, height: size }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="4"
          />
          {/* Progress ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-3 h-3" style={{ color }} />
          <span className="text-sm font-bold text-white">{correct}/{total}</span>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">{label}</span>
    </div>
  )
})
AccuracyRing.displayName = 'AccuracyRing'

const PostSessionRewardScreen = memo(({
  isOpen,
  onClose,
  onPlayAgain,
  onShare,
  rewardData,
  isSessionPlayer = false,
  battleExpiresAt,
  userTeams = [],
}) => {
  const [showContent, setShowContent] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  // Destructure reward data with defaults
  const {
    score = 0,
    // Dual-phase accuracy breakdown
    forgeAccuracy = { correct: 0, total: 5, percentage: 0 },
    quizAccuracy = { correct: 0, total: 5, percentage: 0 },
    forgeScore = 0,
    quizScore = 0,
    percentileRank = 25,
    baseCoins = 15,
    accuracyBonus = 0,
    streakMultiplier = 1.0,
    totalCoins = 15,
    streakDay = 1,
    nextMilestoneDay = 4,
    nextMilestoneMultiplier = '1.5x',
    battleResultETA = 25,
    category = 'Quiz',
    isFirstSession = false, // Flag to distinguish first-time vs returning users
  } = rewardData || {}

  const [timeRemaining, setTimeRemaining] = useState('')

  // Real-time countdown timer
  useEffect(() => {
    if (!battleExpiresAt) {
      if (battleResultETA > 0) setTimeRemaining(`~${battleResultETA} min`)
      return
    }

    const updateTimer = () => {
      const now = new Date().getTime()
      const expiry = new Date(battleExpiresAt).getTime()
      const diff = expiry - now

      if (diff <= 0) {
        setTimeRemaining('Ending soon...')
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)

      if (minutes > 60) {
        const hours = Math.floor(minutes / 60)
         setTimeRemaining(`${hours}h ${minutes % 60}m`)
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      }
    }

    updateTimer() // Initial call
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [battleExpiresAt, battleResultETA])

  // Determine if high score for extra celebration
  const isHighScore = score >= 80 || (quizAccuracy.correct >= 4 && forgeAccuracy.correct >= 4)

  // Trigger confetti and animations on open
  useEffect(() => {
    if (isOpen) {
      haptics.success()
      quizAudioService.playSubmit?.()

      // Show content with slight delay for dramatic effect
      setTimeout(() => setShowContent(true), 200)

      // Always trigger confetti for first-time players (celebration moment!)
      setTimeout(() => {
        // First burst - center
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.4, x: 0.5 },
          colors: ['#fbbf24', '#f97316', '#22c55e', '#3b82f6', '#a855f7'],
        })

        // Side bursts for extra impact
        setTimeout(() => {
          confetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.5 },
            colors: ['#fbbf24', '#f97316', '#22c55e'],
          })
          confetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.5 },
            colors: ['#3b82f6', '#a855f7', '#ec4899'],
          })
        }, 250)
      }, 500)
    } else {
      setShowContent(false)
    }
  }, [isOpen])

  const handleClose = () => {
    haptics.light()
    quizAudioService.playButtonClick()
    onClose()
  }

  const handlePlayAgain = () => {
    haptics.impact()
    quizAudioService.playGoButton?.()
    onPlayAgain?.()
  }

  const handleShare = () => {
    haptics.impact()
    quizAudioService.playButtonClick()
    setShowShareModal(true)
  }

  const handleCloseShareModal = () => {
    setShowShareModal(false)
  }

  if (!rewardData) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
          onClick={handleClose}
        >
          {/* Floating particles background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <FloatingParticle
                key={i}
                delay={i * 0.3}
                x={10 + i * 12}
                size={3 + Math.random() * 4}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 22, stiffness: 350 }}
            className="relative w-full max-w-sm rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(165deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 27, 75, 0.98) 50%, rgba(20, 20, 50, 0.98) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.7), 0 0 120px rgba(251, 191, 36, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated glow border */}
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.3) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '200% 0%'],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-20"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>

            {showContent && (
              <>
                {/* Header - First Win Celebration */}
                <div className="pt-8 pb-3 px-6 text-center relative">
                  {/* Background glow effect */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, 0.25) 0%, transparent 60%)',
                    }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  {/* Welcome Title */}
                  <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring' }}
                    className="mb-4"
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <motion.span
                        className="text-3xl"
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                      >
                        {isFirstSession ? '🎉' : '⚡'}
                      </motion.span>
                      <h2 className="text-2xl font-black text-white tracking-tight">
                        {isFirstSession ? 'FIRST WIN!' : 'GREAT MATCH!'}
                      </h2>
                      <motion.span
                        className="text-3xl"
                        animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        {isFirstSession ? '🎉' : '⚡'}
                      </motion.span>
                    </div>
                    <p className="text-sm text-white/60">
                      {isFirstSession ? "You're crushing it!" : 'Keep the momentum!'}
                    </p>
                  </motion.div>

                  {/* Score Display */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                    className="relative"
                  >
                    <div className="text-7xl font-black bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">
                      {score}
                    </div>
                    <p className="text-sm text-white/40 mt-0.5">points scored</p>

                    {/* Percentile Badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
                    >
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-bold text-amber-400">
                        TOP {percentileRank}% 🔥
                      </span>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Dual-Phase Accuracy Rings */}
                <div className="px-6 pb-3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center gap-8"
                  >
                    <AccuracyRing
                      label="Forge"
                      correct={forgeAccuracy.correct}
                      total={forgeAccuracy.total}
                      percentage={forgeAccuracy.percentage}
                      color="#f59e0b"
                      icon={Hammer}
                      size={64}
                    />
                    <AccuracyRing
                      label="Quiz"
                      correct={quizAccuracy.correct}
                      total={quizAccuracy.total}
                      percentage={quizAccuracy.percentage}
                      color="#06b6d4"
                      icon={HelpCircle}
                      size={64}
                    />
                  </motion.div>
                </div>

                {/* Coins Earned - Compact */}
                <div className="px-6 pb-3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-3 rounded-xl flex items-center justify-between"
                    style={{
                      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)',
                      border: '1px solid rgba(251, 191, 36, 0.2)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-amber-400" />
                      <span className="text-sm font-semibold text-amber-400 uppercase tracking-wide">Coins Earned</span>
                      {streakMultiplier > 1 && (
                        <span className="text-xs font-bold text-orange-400 px-1.5 py-0.5 rounded bg-orange-500/20">×{streakMultiplier}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-black text-amber-400">
                        <AnimatedNumber value={totalCoins} duration={1000} />
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Streak Teaser */}
                <div className="px-6 pb-3">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="p-3 rounded-xl flex items-center gap-3"
                    style={{
                      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(234, 88, 12, 0.08) 100%)',
                      border: '1px solid rgba(249, 115, 22, 0.2)',
                    }}
                  >
                    <motion.div
                      className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <span className="text-xl">🔥</span>
                    </motion.div>
                    <div className="flex-1">
                      <span className="text-sm font-bold text-orange-400">Day {streakDay} Streak Started!</span>
                      <p className="text-xs text-white/50">
                        Play tomorrow for {nextMilestoneMultiplier} coin bonus
                      </p>
                    </div>
                    <Gift className="w-5 h-5 text-orange-400/50" />
                  </motion.div>
                </div>

                {/* Battle ETA - Updated Design */}
                {timeRemaining && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="px-6 pb-2"
                  >
                     <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="relative flex items-center justify-center w-2 h-2">
                           <div className="absolute w-full h-full bg-red-500 rounded-full animate-ping opacity-75"></div>
                           <div className="relative w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        </div>
                        <span className="text-xs text-white/80 font-medium">
                          Battle ending in <span className="text-white font-bold">{timeRemaining}</span>
                        </span>
                     </div>
                  </motion.div>
                )}

                {/* CTA Buttons - Play Again is PRIMARY */}
                <div className="px-6 pb-6 pt-2 space-y-2.5">
                  {/* Play Next Match - PRIMARY CTA (Conversion Focus) */}
                  <motion.button
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, type: 'spring', damping: 15 }}
                    onClick={handlePlayAgain}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-3 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                      boxShadow: '0 8px 30px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {/* Animated shine effect */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                        backgroundSize: '200% 100%',
                      }}
                      animate={{
                        backgroundPosition: ['200% 0%', '-200% 0%'],
                      }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                    <Swords className="w-6 h-6" />
                    <span>Play Next Match!</span>
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>

                  {/* Share Result - Secondary CTA */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    onClick={handleShare}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-semibold text-white/70 hover:text-white flex items-center justify-center gap-2 transition-colors"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share with Friends</span>
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>

          {/* Share Modal */}
          <Suspense fallback={null}>
            <ShareQuizResultModal
              isOpen={showShareModal}
              onClose={handleCloseShareModal}
              rewardData={rewardData}
              userTeams={userTeams}
            />
          </Suspense>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

PostSessionRewardScreen.displayName = 'PostSessionRewardScreen'
export default PostSessionRewardScreen
