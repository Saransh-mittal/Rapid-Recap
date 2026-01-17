// components/quickClashComponents/user/CoinDisplay.jsx
// Compact coin display for header - shows user's Quick Clash coin balance

import React, { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { Coins } from 'lucide-react'
import { useSelector } from 'react-redux'
import PowerupShop from '../shop/PowerupShop'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'

const MotionDiv = motion.div
const MotionSpan = motion.span

/**
 * Premium responsive coin display component showing user's current coin count
 * Compact pill design matching other header stats
 * Click to open PowerupShop
 */
const CoinDisplay = memo(() => {
  const { userCoins, userTrophiesLoading } = useSelector(state => state.quickClash)
  const [isShopOpen, setIsShopOpen] = useState(false)

  const handleClick = () => {
    setIsShopOpen(true)
  }

  // Show loading shimmer if still loading
  if (userTrophiesLoading && userCoins === 0) {
    return (
      <div className="flex items-center justify-center py-1 xs:py-1.5 px-2 xs:px-3 rounded-full bg-amber-500/10 border border-amber-400/20">
        <div className="w-2.5 xs:w-3 h-2.5 xs:h-3 rounded-full bg-amber-400/30 animate-pulse mr-1 xs:mr-1.5" />
        <div className="w-6 xs:w-8 h-3 xs:h-4 rounded bg-amber-400/20 animate-pulse" />
      </div>
    )
  }

  return (
    <>
      <MotionDiv
        className="flex items-center justify-center py-1 xs:py-1.5 px-2 xs:px-3 rounded-full cursor-pointer relative overflow-hidden"
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
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        title="Open Powerup Shop"
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
          className="mr-1 xs:mr-1.5 relative z-10"
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
          <Coins className="w-3 xs:w-3.5 h-3 xs:h-3.5 text-amber-400" />
        </MotionDiv>

        {/* Coin count */}
        <MotionSpan className="text-amber-300 font-bold text-xs xs:text-sm z-10">
          {userCoins}
        </MotionSpan>
      </MotionDiv>

      {/* PowerupShop Modal */}
      <PowerupShop
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        isSessionPlayer={false}
      />
    </>
  )
})

CoinDisplay.displayName = 'CoinDisplay'

export default CoinDisplay

