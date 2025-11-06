// components/quickClashComponents/VSLine.jsx - CLEAN VERSION (No Divider Lines)
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
 * - Clean design without divider lines
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
      flex items-center gap-1.5
      px-3 py-1.5
      rounded-full
      text-xs font-semibold
      border
      transition-all duration-300
      hover:scale-105
      ${QUICK_CLASH_CLASSES.focusRing}
      whitespace-nowrap
      backdrop-blur-md
    `

    switch (categoryColorScheme) {
      case 'cyan':
        return `${baseClasses} ${QUICK_CLASH_CLASSES.tabCyan} bg-cyan-500/20 border-cyan-400/50 hover:bg-cyan-500/30 shadow-lg`
      case 'blue':
        return `${baseClasses} ${QUICK_CLASH_CLASSES.tabBlue} bg-blue-500/20 border-blue-400/50 hover:bg-blue-500/30 shadow-lg`
      case 'green':
        return `${baseClasses} ${QUICK_CLASH_CLASSES.tabGreen} bg-green-500/20 border-green-400/50 hover:bg-green-500/30 shadow-lg`
      case 'orange':
        return `${baseClasses} ${QUICK_CLASH_CLASSES.tabOrange} bg-orange-500/20 border-orange-400/50 hover:bg-orange-500/30 shadow-lg`
      case 'red':
        return `${baseClasses} ${QUICK_CLASH_CLASSES.tabRed} bg-red-500/20 border-red-400/50 hover:bg-red-500/30 shadow-lg`
      case 'purple':
        return `${baseClasses} text-purple-400 hover:text-purple-300 bg-purple-500/20 border-purple-400/50 hover:bg-purple-500/30 shadow-lg`
      case 'teal':
        return `${baseClasses} text-teal-400 hover:text-teal-300 bg-teal-500/20 border-teal-400/50 hover:bg-teal-500/30 shadow-lg`
      default:
        return `${baseClasses} ${QUICK_CLASH_CLASSES.tabCyan} bg-cyan-500/20 border-cyan-400/50 hover:bg-cyan-500/30 shadow-lg`
    }
  }

  return (
    <div className="flex justify-center items-center py-3 px-4 relative w-full">
      {/* Center container with VS */}
      <div className="flex items-center justify-center relative w-full">
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
            className="absolute right-0"
          >
            <Badge
              className={`
                ${getCategoryBadgeClasses()}
                ${
                  isActiveChallenge && !myAttempted
                    ? 'animate-pulse shadow-xl'
                    : ''
                }
              `}
              style={{
                animationDuration:
                  isActiveChallenge && !myAttempted ? '2s' : undefined,
              }}
            >
              <Target className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{category}</span>
            </Badge>
          </MotionDiv>
        )}
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(VSLine)
