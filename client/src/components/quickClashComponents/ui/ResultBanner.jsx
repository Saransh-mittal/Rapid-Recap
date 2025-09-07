// components/quickClashComponents/ui/ResultBanner.jsx - FIXED VERSION
import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy, Shield, Swords, AlertCircle } from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// You'll need to install these components: npx shadcn-ui@latest add badge button tooltip
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const MotionDiv = motion.div

/**
 * Enhanced ResultBanner - Shows challenge completion results with premium animations
 *
 * Key improvements:
 * - Updated to blue-cyan harmony color scheme
 * - Enhanced gradient backgrounds and shine effects
 * - Better responsive design and accessibility
 * - Improved revenge button styling and animations
 * - Maintained all original functionality and animations
 *
 * @param {Boolean} isWinner - Whether user won the challenge
 * @param {Boolean} isTie - Whether the challenge was a tie
 * @param {Boolean} isDefeat - Whether user was defeated
 * @param {String} expiresAt - Challenge expiry date
 * @param {String} category - Challenge category
 * @param {Function} onRevenge - Revenge callback function
 * @param {String} revengeStatus - Current revenge status
 * @param {Boolean} revengeLoading - Whether revenge is being processed
 */
const ResultBanner = ({
  isWinner,
  isTie,
  isDefeat,
  expiresAt,
  category,
  onRevenge,
  revengeStatus,
  revengeLoading,
}) => {
  const { t } = useTranslation('QuickClash')
  const isExpired = new Date(expiresAt) < new Date()

  // Don't show banner for expired challenges that aren't completed
  if (isExpired && !isWinner && !isTie && !isDefeat) return null

  const getCategoryStyle = category => {
    const categoryColors = {
      World: 'blue',
      Politics: 'red',
      Business: 'green',
      Technology: 'cyan',
      Sports: 'orange',
      Health: 'teal',
      Science: 'purple',
      Environment: 'green',
      LIFESTYLE: 'purple',
      FOOD: 'orange',
    }
    return categoryColors[category] || 'cyan'
  }

  // Enhanced premium gradients with blue-cyan theme
  const getBackgroundClasses = () => {
    if (isWinner) {
      return 'bg-gradient-to-r from-cyan-600/90 via-blue-600/90 to-cyan-700/90'
    } else if (isTie) {
      return 'bg-gradient-to-r from-yellow-600/90 via-orange-500/90 to-yellow-700/90'
    } else {
      return 'bg-gradient-to-r from-red-600/90 via-red-700/90 to-red-800/90'
    }
  }

  // Select appropriate icon and text for result
  const getResultConfig = () => {
    if (isWinner) {
      return {
        icon: Trophy,
        text: t('Victory!'),
        iconColor: 'text-yellow-300',
      }
    } else if (isTie) {
      return {
        icon: Shield,
        text: t('Tie!'),
        iconColor: 'text-yellow-100',
      }
    } else {
      return {
        icon: AlertCircle,
        text: t('Defeat!'),
        iconColor: 'text-red-100',
      }
    }
  }

  const resultConfig = getResultConfig()
  const ResultIcon = resultConfig.icon
  const categoryColorScheme = getCategoryStyle(category)

  return (
    <MotionDiv
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        ${getBackgroundClasses()}
        relative
        py-2 md:py-3
        px-3 md:px-4
        flex items-center justify-between
        text-white
        font-bold
        rounded-b-2xl
        overflow-hidden
        ${QUICK_CLASH_CLASSES.shadowStrong}
      `}
    >
      {/* Animated shine overlay */}
      <div
        className={`
        absolute inset-0
        bg-gradient-to-r from-transparent via-white/20 to-transparent
        transform -translate-x-full
        animate-[shine_3s_infinite_linear]
      `}
      />

      {/* Custom keyframes for shine animation */}
      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>

      {/* Left section: Result display */}
      <div className="flex items-center space-x-2 relative z-10">
        <ResultIcon
          className={`
          w-4 h-4 md:w-5 md:h-5
          ${resultConfig.iconColor}
        `}
        />
        <span className="text-sm md:text-base uppercase tracking-wide font-bold">
          {resultConfig.text}
        </span>
      </div>

      {/* Right section: Category and revenge button */}
      <div className="flex items-center space-x-2 relative z-10">
        {/* Category badge */}
        <Badge
          className={`
            text-xs md:text-sm
            px-2 md:px-3 py-1
            rounded-full
            font-medium
            ${
              categoryColorScheme === 'cyan'
                ? 'bg-cyan-500/80 hover:bg-cyan-500/90 text-white'
                : categoryColorScheme === 'blue'
                ? 'bg-blue-500/80 hover:bg-blue-500/90 text-white'
                : categoryColorScheme === 'green'
                ? 'bg-green-500/80 hover:bg-green-500/90 text-white'
                : categoryColorScheme === 'orange'
                ? 'bg-orange-500/80 hover:bg-orange-500/90 text-white'
                : categoryColorScheme === 'red'
                ? 'bg-red-500/80 hover:bg-red-500/90 text-white'
                : 'bg-purple-500/80 hover:bg-purple-500/90 text-white'
            }
            border-0
            shadow-lg
          `}
        >
          {category}
        </Badge>

        {/* Revenge button for defeats */}
        {isDefeat && onRevenge && !revengeStatus && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      '0 4px 12px rgba(239, 68, 68, 0.4)',
                      '0 6px 16px rgba(239, 68, 68, 0.7)',
                      '0 4px 12px rgba(239, 68, 68, 0.4)',
                    ],
                  }}
                  transition={{
                    boxShadow: {
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    },
                    scale: {
                      duration: 0.2,
                    },
                  }}
                >
                  <Button
                    size="sm"
                    onClick={onRevenge}
                    disabled={revengeLoading}
                    className={`
                      bg-red-500/90
                      hover:bg-red-600/90
                      text-white
                      border-0
                      rounded-full
                      px-3 md:px-4
                      py-1 md:py-2
                      h-7 md:h-8
                      text-xs md:text-sm
                      font-bold
                      shadow-lg shadow-red-500/40
                      hover:shadow-red-500/60
                      transition-all duration-200
                      ${QUICK_CLASH_CLASSES.focusRing}
                    `}
                  >
                    <div className="flex items-center space-x-1">
                      <Swords className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('Challenge them back!')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Revenge status indicator */}
        {isDefeat && revengeStatus && (
          <span
            className={`
            ${QUICK_CLASH_CLASSES.textSecondary}
            text-xs md:text-sm
            text-center
            px-2
          `}
          >
            {t('Revenge sent')}
          </span>
        )}
      </div>
    </MotionDiv>
  )
}

export default ResultBanner
