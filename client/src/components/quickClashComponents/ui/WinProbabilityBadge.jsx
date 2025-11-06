// components/quickClashComponents/ui/WinProbabilityBadge.jsx - FIXED VERSION (Character Encoding Fixed)
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown, Minus, Check } from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// You'll need: npx shadcn-ui@latest add badge tooltip
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const MotionDiv = motion.div

/**
 * WinProbabilityBadge - Compact inline probability display
 *
 * FIXED: Removed motion(Badge) to prevent ref forwarding errors
 * FIXED: Replaced garbled special characters with proper Unicode checkmarks
 * Now uses motion.div wrapper instead
 *
 * Features:
 * - Shows percentage probability (e.g., "65%")
 * - Data quality indicators (✓ ✓✓ ✓✓✓)
 * - Color-coded based on probability ranges
 * - Responsive sizing (xs, sm, md)
 * - Tooltip with detailed info
 * - Smooth animations
 *
 * @param {Number} probability - Win probability (0.0 to 1.0)
 * @param {String} dataQuality - "low", "medium", or "high"
 * @param {Number} sampleSize - Number of matches analyzed
 * @param {String} size - Badge size variant
 * @param {Boolean} showIcon - Show trend icon
 * @param {String} variant - "user" or "opponent"
 */
const WinProbabilityBadge = ({
  probability = 0.5,
  dataQuality = 'medium',
  sampleSize = 0,
  size = 'sm',
  showIcon = true,
  variant = 'user',
}) => {
  const { t } = useTranslation('QuickClash')

  // Convert probability to percentage
  const percentage = Math.round(probability * 100)

  // Size configurations - COMPACT SIZES
  const sizeConfig = {
    xs: {
      fontSize: 'text-xs',
      iconSize: 'w-2.5 h-2.5',
      padding: 'px-2 py-0.5',
      gap: 'gap-0.5',
    },
    sm: {
      fontSize: 'text-xs',
      iconSize: 'w-3 h-3',
      padding: 'px-2.5 py-1',
      gap: 'gap-1',
    },
    md: {
      fontSize: 'text-sm',
      iconSize: 'w-3.5 h-3.5',
      padding: 'px-3 py-1.5',
      gap: 'gap-1.5',
    },
  }

  const config = sizeConfig[size] || sizeConfig.sm

  // Color coding based on probability ranges
  const getColorClasses = useMemo(() => {
    if (percentage < 30) {
      return {
        bg: 'bg-red-500/20',
        border: 'border-red-400/40',
        text: 'text-red-300',
        shadow: 'shadow-red-500/20',
        gradient: 'from-red-500/10 to-red-600/5',
      }
    } else if (percentage < 45) {
      return {
        bg: 'bg-orange-500/20',
        border: 'border-orange-400/40',
        text: 'text-orange-300',
        shadow: 'shadow-orange-500/20',
        gradient: 'from-orange-500/10 to-orange-600/5',
      }
    } else if (percentage < 55) {
      return {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-400/40',
        text: 'text-yellow-300',
        shadow: 'shadow-yellow-500/20',
        gradient: 'from-yellow-500/10 to-yellow-600/5',
      }
    } else if (percentage < 70) {
      return {
        bg: 'bg-green-500/20',
        border: 'border-green-400/40',
        text: 'text-green-300',
        shadow: 'shadow-green-500/20',
        gradient: 'from-green-500/10 to-green-600/5',
      }
    } else {
      return {
        bg: 'bg-cyan-500/20',
        border: 'border-cyan-400/40',
        text: 'text-cyan-300',
        shadow: 'shadow-cyan-500/20',
        gradient: 'from-cyan-500/10 to-cyan-600/5',
      }
    }
  }, [percentage])

  // Data quality indicator - FIXED: Proper Unicode checkmarks
  const getDataQualityIcon = useMemo(() => {
    switch (dataQuality) {
      case 'low':
        return {
          icon: '✓',
          label: t('Low Confidence'),
          color: 'text-gray-400',
        }
      case 'medium':
        return {
          icon: '✓✓',
          label: t('Medium Confidence'),
          color: 'text-yellow-400',
        }
      case 'high':
        return {
          icon: '✓✓✓',
          label: t('High Confidence'),
          color: 'text-green-400',
        }
      default:
        return {
          icon: '✓',
          label: t('Unknown'),
          color: 'text-gray-400',
        }
    }
  }, [dataQuality, t])

  // Trend icon based on probability
  const TrendIcon =
    percentage >= 55 ? TrendingUp : percentage <= 45 ? TrendingDown : Minus

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {/* FIXED: Use motion.div wrapper instead of motion(Badge) */}
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="inline-block"
          >
            <Badge
              className={`
                ${config.padding}
                ${config.gap}
                ${getColorClasses.bg}
                ${getColorClasses.text}
                border ${getColorClasses.border}
                shadow-lg ${getColorClasses.shadow}
                rounded-full
                flex items-center
                font-bold
                cursor-help
                relative
                overflow-hidden
                ${QUICK_CLASH_CLASSES.focusRing}
                transition-all duration-200
              `}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${getColorClasses.gradient} opacity-50`}
              />

              {/* Content */}
              <div className="relative z-10 flex items-center gap-1">
                {/* Trend icon (optional) */}
                {showIcon && <TrendIcon className={config.iconSize} />}

                {/* Percentage */}
                <span className={config.fontSize}>{percentage}%</span>

                {/* Data quality indicator */}
                <span
                  className={`${config.fontSize} ${getDataQualityIcon.color} ml-0.5 font-semibold tracking-tight`}
                >
                  {getDataQualityIcon.icon}
                </span>
              </div>
            </Badge>
          </MotionDiv>
        </TooltipTrigger>

        <TooltipContent
          className={`
            ${QUICK_CLASH_CLASSES.glassMedium}
            border border-white/20
            ${QUICK_CLASH_CLASSES.shadowSoft}
            rounded-xl
            p-3
          `}
        >
          <div className="flex flex-col space-y-1">
            <p
              className={`${QUICK_CLASH_CLASSES.textPrimary} text-sm font-bold`}
            >
              {percentage}% {t('chance to win')}
            </p>
            <p className={`${QUICK_CLASH_CLASSES.textSecondary} text-xs`}>
              {getDataQualityIcon.label}
            </p>
            {sampleSize > 0 && (
              <p className={`${QUICK_CLASH_CLASSES.textMuted} text-xs`}>
                {t('Based on {{count}} recent matches', { count: sampleSize })}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default WinProbabilityBadge
