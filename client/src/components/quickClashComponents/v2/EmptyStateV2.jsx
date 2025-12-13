// components/quickClashComponents/v2/EmptyStateV2.jsx
// V2 Empty States - Premium animated states with floating icons, gradients, and tips

import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Swords,
  Trophy,
  Users,
  Sparkles,
  Zap,
  Star,
} from 'lucide-react'

const MotionDiv = motion.div

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const floatVariants = {
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

const pulseGlowVariants = {
  animate: {
    opacity: [0.4, 0.8, 0.4],
    scale: [0.95, 1.05, 0.95],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

const shimmerVariants = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      repeatDelay: 3,
      ease: 'easeInOut',
    },
  },
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

// Floating background particles
const BackgroundParticles = memo(({ color = 'cyan' }) => {
  const particles = useMemo(() =>
    [...Array(4)].map((_, i) => ({
      id: i,
      size: 40 + Math.random() * 60,
      left: 10 + (i * 25) + Math.random() * 15,
      top: 20 + Math.random() * 60,
      duration: 15 + Math.random() * 10,
      delay: i * 0.5,
    })), [])

  const colorClasses = {
    cyan: 'from-cyan-500/20 to-blue-500/20',
    yellow: 'from-yellow-500/20 to-amber-500/20',
    purple: 'from-purple-500/20 to-pink-500/20',
    red: 'from-red-500/10 to-orange-500/10',
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <MotionDiv
          key={p.id}
          className={`absolute rounded-full bg-gradient-to-br ${colorClasses[color]} blur-2xl`}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
})
BackgroundParticles.displayName = 'BackgroundParticles'

// Glowing icon container
const GlowingIcon = memo(({ icon: Icon, color = 'cyan', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }

  const colorConfig = {
    cyan: {
      bg: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20',
      border: 'border-cyan-500/40',
      glow: 'shadow-[0_0_30px_rgba(6,182,212,0.4)]',
      icon: 'text-cyan-400',
      innerGlow: 'from-cyan-400/30',
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20',
      border: 'border-yellow-500/40',
      glow: 'shadow-[0_0_30px_rgba(234,179,8,0.4)]',
      icon: 'text-yellow-400',
      innerGlow: 'from-yellow-400/30',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/40',
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
      icon: 'text-purple-400',
      innerGlow: 'from-purple-400/30',
    },
  }

  const config = colorConfig[color]

  return (
    <div className="relative">
      {/* Outer glow */}
      <MotionDiv
        className={`absolute inset-0 ${sizeClasses[size]} rounded-2xl ${config.bg} blur-xl`}
        variants={pulseGlowVariants}
        animate="animate"
      />

      {/* Icon container */}
      <MotionDiv
        className={`relative ${sizeClasses[size]} rounded-2xl ${config.bg} border ${config.border} ${config.glow} flex items-center justify-center backdrop-blur-sm overflow-hidden`}
        variants={floatVariants}
        animate="animate"
      >
        {/* Inner shimmer */}
        <MotionDiv
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent`}
          variants={shimmerVariants}
          animate="animate"
        />

        <Icon className={`${iconSizes[size]} ${config.icon} relative z-10`} />
      </MotionDiv>
    </div>
  )
})
GlowingIcon.displayName = 'GlowingIcon'

// Floating decoration elements
const FloatingDecorations = memo(({ color = 'cyan' }) => {
  const colorConfig = {
    cyan: { primary: 'text-cyan-400/30', secondary: 'text-blue-400/20' },
    yellow: { primary: 'text-yellow-400/30', secondary: 'text-amber-400/20' },
    purple: { primary: 'text-purple-400/30', secondary: 'text-pink-400/20' },
  }

  const config = colorConfig[color]

  return (
    <>
      {/* Animated corner decorations */}
      <MotionDiv
        className="absolute top-4 right-4"
        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Sparkles className={`w-4 h-4 ${config.primary}`} />
      </MotionDiv>

      <MotionDiv
        className="absolute bottom-4 left-4"
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Zap className={`w-4 h-4 ${config.secondary}`} />
      </MotionDiv>

      <MotionDiv
        className="absolute top-1/2 right-3"
        animate={{ y: [-5, 5, -5], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Star className={`w-3 h-3 ${config.secondary}`} />
      </MotionDiv>
    </>
  )
})
FloatingDecorations.displayName = 'FloatingDecorations'

// ============================================================================
// EMPTY STATE VARIANTS
// ============================================================================

// No Active Battles - Premium animated version
export const EmptyBattlesV2 = memo(() => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionDiv
      className="relative flex flex-col items-center justify-center text-center py-12 px-6 bg-gradient-to-b from-white/5 to-cyan-500/5 border border-cyan-500/20 rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <BackgroundParticles color="cyan" />

      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-50"
        style={{
          animation: 'borderGlow 3s ease-in-out infinite',
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <GlowingIcon icon={Swords} color="cyan" size="md" />

        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5"
        >
          <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent mb-2">
            {t('No Active Battles')}
          </h3>

          <p className="text-white/50 text-sm max-w-[260px] leading-relaxed">
            {t('Use the matchmaking above to find a battle!')}
          </p>
        </MotionDiv>
      </div>

      {/* Floating decorations */}
      <FloatingDecorations color="cyan" />

      <style>{`
        @keyframes borderGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </MotionDiv>
  )
})
EmptyBattlesV2.displayName = 'EmptyBattlesV2'

// No Completed Battles - Premium version
export const EmptyCompletedV2 = memo(() => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionDiv
      className="relative flex flex-col items-center justify-center text-center py-10 px-6 bg-gradient-to-b from-white/5 to-yellow-500/5 border border-yellow-500/20 rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <BackgroundParticles color="yellow" />

      <div className="relative z-10 flex flex-col items-center">
        <GlowingIcon icon={Trophy} color="yellow" size="sm" />

        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <h3 className="text-base font-bold bg-gradient-to-r from-yellow-300 to-amber-200 bg-clip-text text-transparent mb-1.5">
            {t('No Battle History')}
          </h3>

          <p className="text-white/50 text-xs max-w-[220px] leading-relaxed">
            {t('Complete your first battle to see results here.')}
          </p>
        </MotionDiv>
      </div>
    </MotionDiv>
  )
})
EmptyCompletedV2.displayName = 'EmptyCompletedV2'

// No Team - Premium version with enhanced CTAs
export const EmptyTeamV2 = memo(({ onCreateTeam, onJoinTeam }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionDiv
      className="relative flex flex-col items-center justify-center text-center py-12 px-6 bg-gradient-to-b from-white/5 to-purple-500/5 border border-purple-500/20 rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <BackgroundParticles color="purple" />

      <div className="relative z-10 flex flex-col items-center">
        <GlowingIcon icon={Users} color="purple" size="md" />

        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5"
        >
          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-300 to-pink-200 bg-clip-text text-transparent mb-2">
            {t('Join a Team')}
          </h3>

          <p className="text-white/50 text-sm max-w-[260px] leading-relaxed mb-6">
            {t('Team up with friends for 4v4 battles!')}
          </p>
        </MotionDiv>

        <MotionDiv
          className="flex gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {onCreateTeam && (
            <motion.button
              onClick={onCreateTeam}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50 hover:-translate-y-0.5"
              whileTap={{ scale: 0.95 }}
            >
              {t('Create')}
            </motion.button>
          )}
          {onJoinTeam && (
            <motion.button
              onClick={onJoinTeam}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl border border-white/20 hover:border-white/30 transition-all hover:-translate-y-0.5"
              whileTap={{ scale: 0.95 }}
            >
              {t('Join')}
            </motion.button>
          )}
        </MotionDiv>
      </div>

      {/* Floating decorations */}
      <FloatingDecorations color="purple" />
    </MotionDiv>
  )
})
EmptyTeamV2.displayName = 'EmptyTeamV2'

// Error State - Enhanced with animation
export const ErrorStateV2 = memo(({ message, onRetry }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionDiv
      className="relative flex flex-col items-center justify-center text-center py-10 px-6 bg-gradient-to-b from-red-500/5 to-orange-500/5 border border-red-500/20 rounded-2xl overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <BackgroundParticles color="red" />

      <div className="relative z-10 flex flex-col items-center">
        <MotionDiv
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <span className="text-2xl">⚠️</span>
          </div>
        </MotionDiv>

        <h3 className="text-white font-semibold text-sm mt-4 mb-1.5">
          {t('Something went wrong')}
        </h3>
        <p className="text-white/50 text-xs mb-4 max-w-[200px]">
          {message || t('Failed to load data')}
        </p>

        {onRetry && (
          <motion.button
            onClick={onRetry}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-lg border border-white/10 transition-all"
            whileTap={{ scale: 0.95 }}
          >
            {t('Retry')}
          </motion.button>
        )}
      </div>
    </MotionDiv>
  )
})
ErrorStateV2.displayName = 'ErrorStateV2'

// Generic Empty State
const EmptyStateV2 = memo(({
  icon: Icon = Swords,
  title,
  description,
  action,
  actionLabel,
  color = 'cyan',
}) => {
  const bgGradients = {
    cyan: 'from-white/5 to-cyan-500/5',
    yellow: 'from-white/5 to-yellow-500/5',
    purple: 'from-white/5 to-purple-500/5',
  }

  const borderColors = {
    cyan: 'border-cyan-500/20',
    yellow: 'border-yellow-500/20',
    purple: 'border-purple-500/20',
  }

  return (
    <MotionDiv
      className={`relative flex flex-col items-center justify-center text-center py-12 px-6 bg-gradient-to-b ${bgGradients[color]} border ${borderColors[color]} rounded-2xl overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <BackgroundParticles color={color} />

      <div className="relative z-10 flex flex-col items-center">
        <GlowingIcon icon={Icon} color={color} size="md" />

        <h3 className="text-lg font-bold text-white mt-5 mb-2">{title}</h3>

        {description && (
          <p className="text-white/50 text-sm max-w-[260px] leading-relaxed mb-6">
            {description}
          </p>
        )}

        {action && (
          <motion.button
            onClick={action}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50 hover:-translate-y-0.5"
            whileTap={{ scale: 0.95 }}
          >
            {actionLabel}
          </motion.button>
        )}
      </div>
    </MotionDiv>
  )
})
EmptyStateV2.displayName = 'EmptyStateV2'

export default EmptyStateV2
