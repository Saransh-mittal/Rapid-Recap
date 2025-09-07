// components/quickClashComponents/ui/ScoreDisplay.jsx - FAITHFUL CONVERSION with Consistent Color Scheme
import React from 'react'
import { motion } from 'framer-motion'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

const MotionDiv = motion.div

/**
 * Enhanced ScoreDisplay - Displays score in a circular badge with blue-cyan theme
 *
 * Key improvements:
 * - Updated to blue-cyan harmony color scheme
 * - Enhanced gradient styling with better visual depth
 * - Added subtle animations and hover effects
 * - Better responsive design with size variants
 * - Maintained circular badge design with improved shadows
 * - Removed dependency on Chakra UI's useColorModeValue
 *
 * @param {Number} score - Score value to display
 * @param {String} size - Size variant (sm, md, lg)
 */
const ScoreDisplay = ({ score, size = 'md' }) => {
  // Size configuration with responsive values
  const sizeConfig = {
    sm: {
      width: 'w-8 h-8', // 32px
      fontSize: 'text-xs',
      padding: 'p-1',
    },
    md: {
      width: 'w-10 h-10', // 40px
      fontSize: 'text-sm',
      padding: 'p-2',
    },
    lg: {
      width: 'w-12 h-12', // 48px
      fontSize: 'text-base',
      padding: 'p-2.5',
    },
  }

  const config = sizeConfig[size] || sizeConfig.md

  return (
    <MotionDiv
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 20,
        },
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 },
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1 },
      }}
      className={`
        ${config.width}
        rounded-full
        ${QUICK_CLASH_CLASSES.gradientPrimary}
        hover:from-cyan-600 hover:to-purple-600
        ${QUICK_CLASH_CLASSES.textPrimary}
        font-bold
        ${config.fontSize}
        flex items-center justify-center
        ${QUICK_CLASH_CLASSES.shadowCyan}
        hover:shadow-cyan-500/60
        border border-cyan-400/30
        hover:border-cyan-400/50
        transition-all duration-200
        cursor-default
        select-none
        backdrop-blur-sm
      `}
    >
      {score}
    </MotionDiv>
  )
}

export default ScoreDisplay
