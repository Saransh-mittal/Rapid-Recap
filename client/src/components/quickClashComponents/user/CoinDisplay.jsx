// components/quickClashComponents/user/CoinDisplay.jsx
// Compact coin display for header - shows user's Quick Clash coin balance

import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { Coins } from 'lucide-react'
import { useSelector } from 'react-redux'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'

const MotionDiv = motion.div
const MotionSpan = motion.span

/**
 * Premium responsive coin display component showing user's current coin count
 * Compact pill design matching other header stats
 */
const CoinDisplay = memo(() => {
  const { userCoins, userTrophiesLoading } = useSelector(state => state.quickClash)

  // Show loading shimmer if still loading
  if (userTrophiesLoading && userCoins === 0) {
    return (
      <div className="flex items-center justify-center py-1.5 px-3 rounded-full bg-amber-500/10 border border-amber-400/20">
        <div className="w-3 h-3 rounded-full bg-amber-400/30 animate-pulse mr-1.5" />
        <div className="w-8 h-4 rounded bg-amber-400/20 animate-pulse" />
      </div>
    )
  }

  return (
    <MotionDiv
      className="flex items-center justify-center py-1.5 px-3 rounded-full cursor-default relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 0 12px rgba(251, 191, 36, 0.3)',
      }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Subtle gradient background */}
      <div
        className="absolute inset-0 opacity-50 z-0"
        style={{
          background: 'linear-gradient(to bottom right, rgba(251, 191, 36, 0.1), rgba(217, 119, 6, 0.05))',
        }}
      />

      {/* Coin icon */}
      <MotionDiv
        className="mr-1.5 relative z-10"
        animate={{
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 4,
        }}
        style={{ filter: 'drop-shadow(0 0 2px rgba(251, 191, 36, 0.6))' }}
      >
        <Coins className="w-3.5 h-3.5 text-amber-400" />
      </MotionDiv>

      {/* Coin count */}
      <MotionSpan className="text-amber-300 font-bold text-sm z-10">
        {userCoins}
      </MotionSpan>
    </MotionDiv>
  )
})

CoinDisplay.displayName = 'CoinDisplay'

export default CoinDisplay
