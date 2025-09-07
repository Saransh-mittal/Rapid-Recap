// components/quickClashComponents/VSLine.jsx - FAITHFUL CONVERSION with Consistent Color Scheme
import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from './utils/quickClashColors'

// You'll need to install this component: npx shadcn-ui@latest add badge
import { Badge } from '@/components/ui/badge'

const MotionBadge = motion(Badge)
const MotionDiv = motion.div

/**
 * Enhanced VSLine component - Displays VS indicator and category for active challenges
 *
 * Key improvements:
 * - Updated to blue-cyan harmony color scheme
 * - Enhanced badge styling with better visual hierarchy
 * - Improved animations for active challenges
 * - Better responsive design and accessibility
 * - Maintained all original conditional logic and positioning
 *
 * @param {String} category - Challenge category name
 * @param {String} categoryColorScheme - Color scheme for category badge
 * @param {Boolean} isActiveChallenge - Whether challenge is currently active
 * @param {Boolean} myAttempted - Whether current user has attempted
 */
const VSLine = ({
  category = null,
  categoryColorScheme = 'cyan',
  isActiveChallenge = false,
  myAttempted = false,
}) => {
  const { t } = useTranslation('QuickClash')

  // Get category styling based on color scheme
  const getCategoryBadgeClasses = () => {
    const baseClasses = `
      absolute right-0
      flex items-center gap-1.5
      px-3 py-1
      rounded-full
      text-xs font-medium
      border
      transition-all duration-300
      hover:scale-105
      ${QUICK_CLASH_CLASSES.focusRing}
    `

    switch (categoryColorScheme) {
      case 'cyan':
        return `${baseClasses} ${QUICK_CLASH_CLASSES.tabCyan} bg-cyan-500/10 border-cyan-400/40 hover:bg-cyan-500/20`
      case 'blue':
        return `${baseClasses} ${QUICK_CLASH_CLASSES.tabBlue} bg-blue-500/10 border-blue-400/40 hover:bg-blue-500/20`
      case 'green':
        return `${baseClasses} ${QUICK_CLASH_CLASSES.tabGreen} bg-green-500/10 border-green-400/40 hover:bg-green-500/20`
      case 'orange':
        return `${baseClasses} ${QUICK_CLASH_CLASSES.tabOrange} bg-orange-500/10 border-orange-400/40 hover:bg-orange-500/20`
      case 'red':
        return `${baseClasses} ${QUICK_CLASH_CLASSES.tabRed} bg-red-500/10 border-red-400/40 hover:bg-red-500/20`
      case 'purple':
        return `${baseClasses} text-purple-400 hover:text-purple-300 bg-purple-500/10 border-purple-400/40 hover:bg-purple-500/20`
      case 'teal':
        return `${baseClasses} text-teal-400 hover:text-teal-300 bg-teal-500/10 border-teal-400/40 hover:bg-teal-500/20`
      default:
        return `${baseClasses} ${QUICK_CLASH_CLASSES.tabCyan} bg-cyan-500/10 border-cyan-400/40 hover:bg-cyan-500/20`
    }
  }

  return (
    <div className="flex justify-center items-center py-2 relative w-full">
      {/* Center container with VS */}
      <div className="flex items-center justify-center relative w-full z-10">
        {/* VS Badge - centered */}
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
          whileHover={{ scale: 1.05 }}
        >
          <Badge
            className={`
              ${QUICK_CLASH_CLASSES.glassMedium}
              ${QUICK_CLASH_CLASSES.textSecondary}
              hover:text-white
              border border-white/20
              hover:border-white/30
              rounded-full
              px-4 py-1.5
              text-sm font-bold
              z-20
              transition-all duration-200
              hover:bg-white/5
              ${QUICK_CLASH_CLASSES.focusRing}
            `}
          >
            {t('vs')}
          </Badge>
        </MotionDiv>

        {/* Category Badge for Active Challenges - positioned to the right */}
        {isActiveChallenge && category && (
          <MotionDiv
            initial={{ x: 20, opacity: 0 }}
            animate={{
              x: 0,
              opacity: 1,
              transition: { delay: 0.2 },
            }}
            className="absolute right-0 z-10"
          >
            <Badge
              className={`
                ${getCategoryBadgeClasses()}
                ${
                  isActiveChallenge && !myAttempted
                    ? 'animate-pulse shadow-lg'
                    : ''
                }
              `}
              style={{
                animationDuration:
                  isActiveChallenge && !myAttempted ? '2s' : undefined,
              }}
            >
              <Target className="w-3 h-3" />
              <span className="font-semibold">{category}</span>
            </Badge>
          </MotionDiv>
        )}
      </div>

      {/* Subtle divider lines extending from VS badge */}
      <div className="absolute inset-0 flex items-center z-0">
        <div className="w-full flex items-center">
          {/* Left line */}
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10"></div>

          {/* Spacer for VS badge */}
          <div className="w-16"></div>

          {/* Right line */}
          <div
            className={`
            flex-1 h-px
            ${
              isActiveChallenge && category
                ? 'bg-gradient-to-l from-transparent via-white/5 to-white/10'
                : 'bg-gradient-to-l from-transparent to-white/10'
            }
          `}
          ></div>
        </div>
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(VSLine)
