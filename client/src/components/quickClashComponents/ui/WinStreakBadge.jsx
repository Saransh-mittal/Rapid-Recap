// components/quickClashComponents/ui/WinStreakBadge.jsx
// Win streak visual flair with flame animation

import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Flame, TrendingUp } from 'lucide-react'

const MotionDiv = motion.div

/**
 * Win streak badge with flame animation
 * Shows fire effect for 3+ win streaks
 *
 * @param {number} streak - Current win streak count
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const WinStreakBadge = memo(({ streak = 0, size = 'md' }) => {
  // Don't show badge for streaks less than 2
  if (streak < 2) return null

  const isHot = streak >= 3 // Fire animation threshold
  const isOnFire = streak >= 5 // Extra intense animation

  const sizeConfig = useMemo(() => ({
    sm: {
      container: 'px-1.5 py-0.5 gap-1',
      icon: 'w-3 h-3',
      text: 'text-[10px]',
    },
    md: {
      container: 'px-2 py-1 gap-1.5',
      icon: 'w-4 h-4',
      text: 'text-xs',
    },
    lg: {
      container: 'px-3 py-1.5 gap-2',
      icon: 'w-5 h-5',
      text: 'text-sm',
    },
  }), [])

  const config = sizeConfig[size] || sizeConfig.md

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center
        ${config.container}
        rounded-full
        ${isHot
          ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/40'
          : 'bg-yellow-500/20 border border-yellow-400/30'
        }
        ${isOnFire ? 'shadow-[0_0_12px_rgba(251,146,60,0.4)]' : ''}
      `}
    >
      {/* Fire icon with animation */}
      {isHot ? (
        <motion.div
          animate={{
            scale: isOnFire ? [1, 1.15, 1] : [1, 1.1, 1],
            filter: isOnFire
              ? ['brightness(1)', 'brightness(1.3)', 'brightness(1)']
              : undefined,
          }}
          transition={{
            duration: isOnFire ? 0.4 : 0.6,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        >
          <Flame
            className={`${config.icon} ${isOnFire ? 'text-orange-400' : 'text-orange-500'}`}
            style={{
              filter: isOnFire
                ? 'drop-shadow(0 0 4px rgba(251,146,60,0.8))'
                : 'drop-shadow(0 0 2px rgba(251,146,60,0.5))',
            }}
          />
        </motion.div>
      ) : (
        <TrendingUp
          className={`${config.icon} text-yellow-400`}
        />
      )}

      {/* Streak count */}
      <span
        className={`
          ${config.text}
          font-bold
          ${isHot ? 'text-orange-300' : 'text-yellow-300'}
        `}
      >
        {streak}
      </span>

      {/* "Win streak" text for larger sizes */}
      {size !== 'sm' && (
        <span
          className={`
            ${config.text}
            font-medium
            ${isHot ? 'text-orange-200/70' : 'text-yellow-200/70'}
          `}
        >
          streak
        </span>
      )}
    </MotionDiv>
  )
})

WinStreakBadge.displayName = 'WinStreakBadge'

export default WinStreakBadge
