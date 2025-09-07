// components/quickClashComponents/DateGroupHeader.jsx - FAITHFUL CONVERSION with Consistent Color Scheme
import React from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from './utils/quickClashColors'

const MotionDiv = motion.div

/**
 * Enhanced DateGroupHeader - Displays stylized date header for grouped challenges
 *
 * Key improvements:
 * - Updated to use blue-cyan harmony color scheme
 * - Enhanced glassmorphic styling with Tailwind CSS
 * - Improved animations with staggered entrance effects
 * - Better accessibility with semantic structure
 * - Responsive design improvements
 *
 * @param {Object} props - Component properties
 * @param {String} props.date - Date string to display
 * @param {Number} props.index - Index for staggered animation (default: 0)
 */
const DateGroupHeader = ({ date, index = 0 }) => {
  // Animation variants for staggered entrance - enhanced with smoother easing
  const animations = {
    hidden: {
      opacity: 0,
      y: 15,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: index * 0.1,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smoother motion
      },
    },
  }

  return (
    <MotionDiv
      initial="hidden"
      animate="visible"
      variants={animations}
      className="flex items-center py-2 my-4"
    >
      {/* Enhanced Date Badge with blue-cyan styling */}
      <div
        className={`
        ${QUICK_CLASH_CLASSES.glassMedium}
        px-4 py-2
        rounded-full
        flex items-center
        ${QUICK_CLASH_CLASSES.shadowCyan}
        border border-cyan-500/30
        backdrop-brightness-110
        hover:bg-cyan-500/5
        transition-all duration-300
        group
      `}
      >
        <Calendar
          className={`
          ${QUICK_CLASH_CLASSES.tabCyan}
          w-4 h-4
          mr-2
          group-hover:text-cyan-300
          transition-colors duration-200
        `}
        />
        <span
          className={`
          ${QUICK_CLASH_CLASSES.textPrimary}
          text-sm font-medium
          group-hover:text-cyan-100
          transition-colors duration-200
        `}
        >
          {date}
        </span>
      </div>

      {/* Enhanced Divider with gradient effect */}
      <div className="flex-1 ml-3 relative">
        {/* Base divider line */}
        <div className="h-px bg-white/20 w-full" />

        {/* Gradient overlay for smooth fade */}
        <div className="absolute inset-0 h-px bg-gradient-to-r from-cyan-400/30 via-cyan-400/10 to-transparent" />

        {/* Subtle glow effect */}
        <div className="absolute inset-0 h-px bg-gradient-to-r from-cyan-400/20 to-transparent blur-sm" />
      </div>
    </MotionDiv>
  )
}

export default DateGroupHeader
