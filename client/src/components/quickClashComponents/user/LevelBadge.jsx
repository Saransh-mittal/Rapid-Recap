// components/quickClashComponents/user/LevelBadge.jsx - FAITHFUL CONVERSION to Tailwind with Blue-Cyan Color Scheme
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'

const MotionDiv = motion.div

// Custom Popover Component
const CustomPopover = ({ isOpen, onClose, children, trigger }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const popoverRef = useRef(null)

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const popoverWidth = 340
      const popoverHeight = 200 // Approximate height

      let left = triggerRect.left + triggerRect.width / 2 - popoverWidth / 2
      let top = triggerRect.bottom + 10

      // Ensure popover stays within viewport
      if (left < 10) left = 10
      if (left + popoverWidth > window.innerWidth - 10) {
        left = window.innerWidth - popoverWidth - 10
      }

      if (top + popoverHeight > window.innerHeight - 10) {
        top = triggerRect.top - popoverHeight - 10
      }

      setPosition({ top, left })
    }
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = event => {
      if (
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen, onClose])

  return (
    <>
      <div ref={triggerRef}>{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            {/* Popover */}
            <MotionDiv
              ref={popoverRef}
              className={`
                fixed z-50 w-[340px] ${QUICK_CLASH_CLASSES.glassMedium}
                backdrop-blur-[16px] border border-cyan-400/40 rounded-xl overflow-hidden
                shadow-2xl shadow-black/40
              `}
              style={{
                top: position.top,
                left: position.left,
                background: 'rgba(15, 23, 42, 0.95)',
                boxShadow:
                  '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(6, 182, 212, 0.3)',
              }}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Arrow */}
              <div
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45"
                style={{ background: 'rgba(15, 23, 42, 0.95)' }}
              />

              {/* Close button */}
              <button
                onClick={() => { quizAudioService.playDismiss(); onClose() }}
                className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                ×
              </button>

              {children}
            </MotionDiv>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * A premium, sleek level badge showing the user's current level with cyan/blue theme
 * Features a minimal, horizontal popover with important level information
 */
const LevelBadge = () => {
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  // Calculate level and XP metrics - EXACTLY as original
  const level = user?.level || 0
  const xp = user?.xp || 0
  const xpBaseAtCurrLevel = (level * (level + 1) * 10) / 2
  const xpForNextLevel = (level + 1) * 10
  const xpProgress = xp - xpBaseAtCurrLevel
  const progressPercentage = Math.min(
    100,
    Math.round((xpProgress / xpForNextLevel) * 100),
  )

  const handleClick = () => {
    quizAudioService.playButtonClick() // Sound for opening popover
    setIsPopoverOpen(!isPopoverOpen)
  }

  const triggerComponent = (
    <MotionDiv
      className={`
        flex items-center justify-center py-1.5 px-3 rounded-full cursor-pointer
        ${QUICK_CLASH_CLASSES.glassMedium} backdrop-blur-[8px] border border-cyan-500/30
        shadow-lg shadow-black/20 relative overflow-hidden transition-all duration-200
        hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/20
      `}
      onClick={handleClick}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
      }}
      whileTap={{ scale: 0.95 }}
      style={{
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Premium gradient background */}
      <div
        className="absolute inset-0 opacity-70 z-0"
        style={{
          background:
            'linear-gradient(to bottom right, rgba(6, 182, 212, 0.2), rgba(14, 165, 233, 0.1))',
        }}
      />

      {/* Animated star icon */}
      <MotionDiv
        className="relative z-10 mr-1"
        animate={{
          rotate: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 4,
        }}
        style={{
          filter: 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.8))',
        }}
      >
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
      </MotionDiv>

      {/* Level text */}
      <span className="text-white font-bold text-base z-10">{level}</span>
    </MotionDiv>
  )

  const popoverContent = (
    <div className="p-0">
      {/* Top section with current level */}
      <div
        className="p-4 border-b border-cyan-400/20 relative overflow-hidden"
        style={{
          background: 'rgba(30, 30, 45, 1)',
        }}
      >
        {/* Background glow effect */}
        <div
          className="absolute -top-5 -left-5 w-20 h-20 rounded-full blur-[10px] opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(6, 182, 212, 0.3), transparent 70%)',
          }}
        />

        {/* Level info */}
        <div className="flex items-center w-full">
          <div
            className={`
              w-14 h-14 rounded-full flex items-center justify-center mr-4 shadow-lg
              ${QUICK_CLASH_CLASSES.gradientPrimary}
            `}
            style={{
              background: 'linear-gradient(to bottom right, #06B6D4, #0891B2)',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
            }}
          >
            <span className="text-2xl font-bold text-white">{level}</span>
          </div>

          <div className="flex flex-col flex-1">
            <span className="text-white font-bold text-base mb-1">
              {t('Current Level')}
            </span>
            <div className="flex gap-3 mt-1">
              <div className="flex items-center gap-1">
                <span className={`${QUICK_CLASH_CLASSES.textMuted} text-sm`}>
                  {t('Total XP')}:
                </span>
                <span className="text-cyan-400 font-bold text-sm">{xp} XP</span>
              </div>

              <div className="flex items-center gap-1">
                <span className={`${QUICK_CLASH_CLASSES.textMuted} text-sm`}>
                  {t('Next')}:
                </span>
                <span className="text-green-400 font-bold text-sm">
                  {xpProgress}/{xpForNextLevel} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress section */}
      <div
        className="px-4 py-3"
        style={{ background: 'rgba(20, 25, 40, 0.9)' }}
      >
        <div className="flex justify-between mb-1 items-center">
          <span className={`${QUICK_CLASH_CLASSES.textMuted} text-xs`}>
            {progressPercentage}%
          </span>
          <span className={`${QUICK_CLASH_CLASSES.textMuted} text-xs`}>
            {t('Level')} {level} → {level + 1}
          </span>
        </div>

        <div className="w-full h-[5px] bg-slate-800/60 rounded-full overflow-hidden relative">
          {/* Progress fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
            style={{ width: `${progressPercentage}%` }}
          />

          {/* Shimmering effect */}
          <MotionDiv
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['200% 0', '0% 0'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      </div>

      {/* Tip section */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-t border-cyan-400/15"
        style={{
          background: 'rgba(30, 30, 45, 1)',
        }}
      >
        <MotionDiv
          animate={{
            rotate: [0, 10, 0, -10, 0],
            scale: [1, 1.1, 1, 1.1, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
          }}
          style={{
            filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))',
          }}
        >
          <Star className="w-5 h-5 text-yellow-400 fill-current" />
        </MotionDiv>
        <div className="flex flex-col">
          <span className="text-white font-bold text-xs">
            {t('Keep Earning XP')}
          </span>
          <span className={`${QUICK_CLASH_CLASSES.textMuted} text-[10px]`}>
            {t('Complete challenges and daily tasks to level up!')}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <CustomPopover
      isOpen={isPopoverOpen}
      onClose={() => setIsPopoverOpen(false)}
      trigger={triggerComponent}
    >
      {popoverContent}
    </CustomPopover>
  )
}

export default LevelBadge
