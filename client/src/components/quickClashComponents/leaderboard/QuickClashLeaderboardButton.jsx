// components/quickClashComponents/leaderboard/QuickClashLeaderboardButton.jsx - FAITHFUL CONVERSION to Tailwind with Blue-Cyan Color Scheme
import React, { memo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// Import the modal (assuming it exists)
import QuickClashLeaderboardModal from './QuickClashLeaderboardModal'

const MotionButton = motion.button
const MotionDiv = motion.div

const QuickClashLeaderboardButton = ({ showMobileVersion = true }) => {
  const { t } = useTranslation('QuickClash')
  const [isOpen, setIsOpen] = useState(false)

  // Responsive state management
  const [isMobile, setIsMobile] = useState(false)
  const [isSmall, setIsSmall] = useState(false)

  useEffect(() => {
    const updateSize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsSmall(window.innerWidth < 640)
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)

  // Animation variants with blue-cyan colors
  const buttonVariants = {
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15,
        delay: 0.3,
      },
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 0 15px rgba(6, 182, 212, 0.6)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
    tap: { scale: 0.98 },
  }

  // For floating badge (mobile)
  const floatingVariants = {
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15,
        delay: 0.5,
      },
    },
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 2,
        },
      },
    },
  }

  // Custom pulse animation using Tailwind classes
  const pulseStyles = {
    animation: 'pulse 2s infinite',
  }

  if (isMobile && showMobileVersion) {
    return (
      <>
        <MotionDiv
          className="fixed bottom-[90px] right-[10px] z-10"
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={onOpen}
        >
          <div
            className={`
              ${QUICK_CLASH_CLASSES.gradientSecondary} rounded-full p-3
              shadow-xl shadow-black/30 relative overflow-hidden
            `}
            style={pulseStyles}
          >
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-700 opacity-80" />

            {/* Trophy Icon */}
            <Trophy
              className="w-7 h-7 text-yellow-400 relative z-10"
              style={{ filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))' }}
            />
          </div>
        </MotionDiv>

        <QuickClashLeaderboardModal isOpen={isOpen} onClose={onClose} />
      </>
    )
  }

  if (isMobile && !showMobileVersion) {
    return null
  }

  // Desktop version - designed to match with the New Challenge button
  return (
    <>
      <MotionButton
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        onClick={onOpen}
        className={`
          relative h-[52px] ${
            isSmall ? 'px-3' : 'px-6'
          } overflow-hidden rounded-xl
          ${
            QUICK_CLASH_CLASSES.btnWarning
          } hover:shadow-xl hover:shadow-orange-500/30
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400/50
        `}
        style={{
          background: 'linear-gradient(to right, #F59E0B, #EA580C)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          ...pulseStyles,
        }}
      >
        {/* Background elements */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(circle at top right, #FCD34D, transparent 70%)',
          }}
        />

        <div className="absolute -top-5 -right-5 w-[60px] h-[60px] rounded-full bg-white/10" />

        {/* Content */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-black/20 p-1.5 rounded-full flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-100" />
          </div>

          {!isSmall && (
            <span className="text-white font-bold">{t('Leaderboard')}</span>
          )}
        </div>
      </MotionButton>

      <QuickClashLeaderboardModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}

export default memo(QuickClashLeaderboardButton)
