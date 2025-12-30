// components/quickClashComponents/powerups/ClaimRewardsModal.jsx
// Modal for displaying and claiming powerup rewards from completed battles

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Gift,
  Trophy,
  Sparkles,
  X,
  Check,
  Clock,
  Zap,
  Eye,
  Shield,
  Target,
  Loader2
} from 'lucide-react'

// Haptic and audio feedback
import { haptics } from '../../../utils/haptics'
import { quizAudioService } from '../../../services/quizAudioService'

// Powerup constants for display
const POWERUP_DISPLAY = {
  TIME_WARP: {
    icon: Clock,
    name: 'Time Warp',
    gradient: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-400',
  },
  SCORE_SURGE: {
    icon: Zap,
    name: 'Score Surge',
    gradient: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-500/15',
    text: 'text-yellow-400',
  },
  ORACLES_EYE: {
    icon: Eye,
    name: "Oracle's Eye",
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500/15',
    text: 'text-purple-400',
  },
  STREAK_SHIELD: {
    icon: Shield,
    name: 'Streak Shield',
    gradient: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
  },
  PRECISION_PROTOCOL: {
    icon: Target,
    name: 'Precision Protocol',
    gradient: 'from-rose-500 to-red-500',
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
  },
}

/**
 * ClaimRewardsModal - Modal for claiming powerup rewards from battles
 *
 * @param {boolean} isOpen - Whether modal is open
 * @param {Function} onClose - Close handler
 * @param {Object} battleResult - Battle result data
 * @param {Function} onClaim - Claim handler (async)
 */
const ClaimRewardsModal = ({
  isOpen,
  onClose,
  battleResult,
  onClaim,
}) => {
  const { t } = useTranslation('QuickClash')
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)

  // Check if already claimed (from server data)
  const alreadyClaimed = battleResult?.powerupReward?.claimed || false

  const handleClose = useCallback(() => {
    haptics.light()
    quizAudioService.playButtonClick()
    onClose()
  }, [onClose])

  const handleClaim = useCallback(async () => {
    if (isClaiming || claimSuccess || alreadyClaimed) return

    haptics.medium()
    setIsClaiming(true)

    try {
      await onClaim(battleResult._id)
      quizAudioService.playHighScore() // Victory sound
      haptics.success()
      setClaimSuccess(true)

      // Auto-close after success animation
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Failed to claim rewards:', error)
      haptics.error()
    } finally {
      setIsClaiming(false)
    }
  }, [battleResult, isClaiming, claimSuccess, alreadyClaimed, onClaim, onClose])

  if (!battleResult) return null

  const {
    teamWon,
    trophyChange,
    powerupReward,
    userTeamKey
  } = battleResult

  const powerupsAwarded = powerupReward?.powerupsAwarded || []
  const housingSpaceEarned = powerupReward?.housingSpaceEarned || 0
  const individualWins = powerupReward?.individualWins || 0

  // Determine outcome text
  let outcomeText = ''
  let outcomeColor = ''
  if (teamWon && individualWins > 0) {
    outcomeText = 'Team Win + Individual Victory!'
    outcomeColor = 'text-emerald-400'
  } else if (teamWon && individualWins === 0) {
    outcomeText = 'Team Win'
    outcomeColor = 'text-cyan-400'
  } else if (!teamWon && individualWins > 0) {
    outcomeText = 'Individual Victory!'
    outcomeColor = 'text-yellow-400'
  } else {
    outcomeText = 'Battle Complete'
    outcomeColor = 'text-white/60'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>

            {/* Header glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative p-6">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="flex justify-center mb-4"
              >
                <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/25">
                  {claimSuccess ? (
                    <Check className="w-8 h-8 text-white" />
                  ) : (
                    <Gift className="w-8 h-8 text-white" />
                  )}
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-white text-center mb-1"
              >
                {claimSuccess || alreadyClaimed ? '🎉 Claimed!' : '🎁 Battle Rewards'}
              </motion.h2>

              {/* Outcome */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`text-sm font-semibold ${outcomeColor} text-center mb-4`}
              >
                {outcomeText}
              </motion.p>

              {/* Trophy change */}
              {trophyChange !== 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center mb-4"
                >
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    trophyChange > 0
                      ? 'bg-emerald-500/15 border border-emerald-500/30'
                      : 'bg-red-500/15 border border-red-500/30'
                  }`}>
                    <Trophy className={`w-5 h-5 ${
                      trophyChange > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`} />
                    <span className={`text-lg font-bold ${
                      trophyChange > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {trophyChange > 0 ? '+' : ''}{trophyChange}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Powerup rewards section */}
              {powerupsAwarded.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-6"
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-semibold text-white/70">
                      Powerup Rewards ({housingSpaceEarned} space)
                    </span>
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </div>

                  <div className="space-y-2">
                    {powerupsAwarded.map((powerup, index) => {
                      const config = POWERUP_DISPLAY[powerup.powerupId] || {}
                      const IconComponent = config.icon || Gift

                      return (
                        <motion.div
                          key={`${powerup.powerupId}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          className={`flex items-center gap-3 p-3 rounded-xl ${config.bg} border ${config.bg?.replace('bg-', 'border-').replace('/15', '/30')}`}
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient}`}>
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-semibold text-white">
                              {config.name || powerup.powerupId}
                            </span>
                          </div>
                          <span className={`text-xs font-bold ${config.text}`}>
                            {powerup.cost} ⚡
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center text-white/50 text-sm mb-6"
                >
                  No powerup rewards this time
                </motion.div>
              )}

              {/* Claim button */}
              {!claimSuccess && !alreadyClaimed && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  onClick={handleClaim}
                  disabled={isClaiming}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      Claim Rewards
                    </>
                  )}
                </motion.button>
              )}

              {/* Success state */}
              {(claimSuccess || alreadyClaimed) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: alreadyClaimed ? 0 : 2, duration: 0.3 }}
                    className="text-4xl mb-2"
                  >
                    ✨
                  </motion.div>
                  <span className="text-emerald-400 font-bold">
                    {claimSuccess ? 'Added to Inventory!' : 'Already in Inventory!'}
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ClaimRewardsModal
