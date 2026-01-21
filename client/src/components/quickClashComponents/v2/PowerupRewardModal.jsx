// components/quickClashComponents/v2/PowerupRewardModal.jsx
// Premium reward modal for session → Google conversion powerup grants
// Shows TIME_WARP + ORACLES_EYE rewards with professional animations

import React, { memo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Clock,
  Eye,
  Swords,
  Gift,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import confetti from 'canvas-confetti'

// Audio and haptics
import { quizAudioService } from '../../../services/quizAudioService'
import { haptics } from '../../../utils/haptics'

// Powerup display data
const POWERUP_DATA = {
  TIME_WARP: {
    id: 'TIME_WARP',
    name: 'Time Warp',
    description: '+15 seconds in Forge & Quiz phases',
    icon: Clock,
    gradient: 'from-blue-500 to-cyan-400',
    bgGradient: 'from-blue-500/20 to-cyan-400/10',
    borderColor: 'border-blue-400/30',
    iconColor: 'text-cyan-400',
  },
  ORACLES_EYE: {
    id: 'ORACLES_EYE',
    name: "Oracle's Eye",
    description: 'Remove 2 wrong answer options',
    icon: Eye,
    gradient: 'from-purple-500 to-violet-400',
    bgGradient: 'from-purple-500/20 to-violet-400/10',
    borderColor: 'border-purple-400/30',
    iconColor: 'text-purple-400',
  },
}

// Floating particle effect
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

// Individual powerup card with stagger animation
const PowerupCard = memo(({ powerupKey, index }) => {
  const powerup = POWERUP_DATA[powerupKey]
  if (!powerup) return null

  const Icon = powerup.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.6 + index * 0.15,
        type: 'spring',
        damping: 15,
        stiffness: 200,
      }}
      whileHover={{ scale: 1.03, y: -3 }}
      className={`relative p-4 rounded-2xl bg-gradient-to-br ${powerup.bgGradient} border ${powerup.borderColor} backdrop-blur-sm overflow-hidden`}
    >
      {/* Animated glow */}
      <motion.div
        className="absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${powerup.iconColor.replace('text-', 'rgb(var(--')}, transparent 60%)`,
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative flex items-start gap-3">
        {/* Icon container */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${powerup.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white text-base truncate">{powerup.name}</h3>
            <span className="px-1.5 py-0.5 text-[10px] font-bold text-amber-400 bg-amber-500/20 rounded-full">×1</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">{powerup.description}</p>
        </div>
      </div>
    </motion.div>
  )
})
PowerupCard.displayName = 'PowerupCard'

const PowerupRewardModal = memo(({ isOpen, onClose, powerups = ['TIME_WARP', 'ORACLES_EYE'] }) => {
  const navigate = useNavigate()
  const [showContent, setShowContent] = useState(false)

  // Trigger animations on open
  useEffect(() => {
    if (isOpen) {
      haptics.success()
      quizAudioService.playSubmit?.()

      setTimeout(() => setShowContent(true), 150)

      // Confetti burst
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.4, x: 0.5 },
          colors: ['#fbbf24', '#a855f7', '#3b82f6', '#22c55e', '#f97316'],
        })

        // Side bursts
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.5 },
            colors: ['#fbbf24', '#f97316', '#22c55e'],
          })
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.5 },
            colors: ['#3b82f6', '#a855f7', '#ec4899'],
          })
        }, 200)
      }, 400)
    } else {
      setShowContent(false)
    }
  }, [isOpen])

  const handleClose = () => {
    haptics.light()
    quizAudioService.playButtonClick?.()
    onClose()
  }

  const handleUseInBattle = () => {
    haptics.impact()
    quizAudioService.playGoButton?.()
    onClose()
    // Navigate to quickclash or stay on current page
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
        >
          {/* Floating particles background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <FloatingParticle
                key={i}
                delay={i * 0.25}
                x={5 + i * 10}
                size={3 + Math.random() * 5}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 80 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 80 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-sm rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(165deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 27, 75, 0.98) 50%, rgba(20, 20, 50, 0.98) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.7), 0 0 120px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated shimmer border */}
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.4) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '200% 0%'],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-20"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>

            {showContent && (
              <div className="p-6 space-y-5">
                {/* Header */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-center"
                >
                  {/* Gift icon with glow */}
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/20 mb-3"
                    animate={{
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        '0 0 20px rgba(251, 191, 36, 0.3)',
                        '0 0 40px rgba(251, 191, 36, 0.5)',
                        '0 0 20px rgba(251, 191, 36, 0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Gift className="w-8 h-8 text-amber-400" />
                  </motion.div>

                  <h2 className="text-xl font-black text-white tracking-tight mb-1">
                    ACCOUNT UPGRADED!
                  </h2>
                  <p className="text-sm text-white/60">
                    You've unlocked starter powerups!
                  </p>
                </motion.div>

                {/* Powerup cards */}
                <div className="space-y-3">
                  {powerups.map((powerupKey, index) => (
                    <PowerupCard key={powerupKey} powerupKey={powerupKey} index={index} />
                  ))}
                </div>

                {/* Info note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-white/5 border border-white/5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs text-white/50">Find powerups in the Coin Shop</span>
                </motion.div>

                {/* CTA Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, type: 'spring', damping: 15 }}
                  onClick={handleUseInBattle}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-3 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                    boxShadow: '0 8px 30px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {/* Shine effect */}
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
                  <Swords className="w-5 h-5" />
                  <span>Use in Battle!</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

PowerupRewardModal.displayName = 'PowerupRewardModal'
export default PowerupRewardModal
