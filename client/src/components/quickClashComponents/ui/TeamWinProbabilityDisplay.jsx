// components/quickClashComponents/ui/TeamWinProbabilityDisplay.jsx - FIXED VERSION
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'

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
 * TeamWinProbabilityDisplay - Team battle probability with live updates
 *
 * FIXED: Removed motion wrapper from Badge to prevent ref errors
 *
 * Features:
 * - Shows current probability vs initial probability
 * - Trend indicators (↑ ↓ →) showing how probability changed
 * - Certainty score display
 * - Color-coded based on advantage
 * - Compact design for battle cards
 * - Responsive sizing
 *
 * @param {Number} currentProbability - Current win probability (0.0 to 1.0)
 * @param {Number} initialProbability - Initial probability at battle start (0.0 to 1.0)
 * @param {Number} certaintyScore - Certainty level (0.0 to 1.0)
 * @param {Number} completedChallenges - Number of completed challenges
 * @param {Number} totalChallenges - Total number of challenges in battle
 * @param {String} size - Display size variant
 * @param {Boolean} showTrend - Show trend indicator
 * @param {Boolean} showCertainty - Show certainty score
 */
const TeamWinProbabilityDisplay = ({
  currentProbability = 0.5,
  initialProbability = 0.5,
  certaintyScore = 0,
  completedChallenges = 0,
  totalChallenges = 4,
  size = 'md',
  showTrend = true,
  showCertainty = true,
}) => {
  const { t } = useTranslation('QuickClash')

  // Convert to percentages
  const currentPercentage = Math.round(currentProbability * 100)
  const initialPercentage = Math.round(initialProbability * 100)
  const certaintyPercentage = Math.round(certaintyScore * 100)

  // Calculate change
  const change = currentPercentage - initialPercentage

  // Determine trend
  const trend = useMemo(() => {
    if (change > 5)
      return {
        direction: 'up',
        icon: TrendingUp,
        text: '↑',
        color: 'text-green-400',
      }
    if (change < -5)
      return {
        direction: 'down',
        icon: TrendingDown,
        text: '↓',
        color: 'text-red-400',
      }
    return {
      direction: 'stable',
      icon: Minus,
      text: '→',
      color: 'text-gray-400',
    }
  }, [change])

  // Size configurations
  const sizeConfig = {
    sm: {
      fontSize: 'text-xs',
      iconSize: 'w-3 h-3',
      padding: 'px-2 py-1',
      gap: 'gap-1',
    },
    md: {
      fontSize: 'text-sm',
      iconSize: 'w-3.5 h-3.5',
      padding: 'px-2.5 py-1',
      gap: 'gap-1.5',
    },
    lg: {
      fontSize: 'text-base',
      iconSize: 'w-4 h-4',
      padding: 'px-3 py-1.5',
      gap: 'gap-2',
    },
  }

  const config = sizeConfig[size] || sizeConfig.md

  // Color scheme based on probability
  const colorScheme = useMemo(() => {
    if (currentPercentage < 30) {
      return {
        bg: 'bg-red-500/20',
        border: 'border-red-400/40',
        text: 'text-red-300',
        gradient: 'from-red-500/10 to-red-600/5',
      }
    } else if (currentPercentage < 45) {
      return {
        bg: 'bg-orange-500/20',
        border: 'border-orange-400/40',
        text: 'text-orange-300',
        gradient: 'from-orange-500/10 to-orange-600/5',
      }
    } else if (currentPercentage < 55) {
      return {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-400/40',
        text: 'text-yellow-300',
        gradient: 'from-yellow-500/10 to-yellow-600/5',
      }
    } else if (currentPercentage < 70) {
      return {
        bg: 'bg-green-500/20',
        border: 'border-green-400/40',
        text: 'text-green-300',
        gradient: 'from-green-500/10 to-green-600/5',
      }
    } else {
      return {
        bg: 'bg-cyan-500/20',
        border: 'border-cyan-400/40',
        text: 'text-cyan-300',
        gradient: 'from-cyan-500/10 to-cyan-600/5',
      }
    }
  }, [currentPercentage])

  // Certainty label
  const certaintyLabel = useMemo(() => {
    if (certaintyPercentage < 25)
      return { text: t('Low certainty'), color: 'text-gray-400' }
    if (certaintyPercentage < 50)
      return { text: t('Some certainty'), color: 'text-yellow-400' }
    if (certaintyPercentage < 75)
      return { text: t('Moderate certainty'), color: 'text-blue-400' }
    return { text: t('High certainty'), color: 'text-green-400' }
  }, [certaintyPercentage, t])

  const TrendIcon = trend.icon

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {/* FIXED: Use motion.div wrapper */}
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-full"
          >
            <div
              className={`
                ${config.padding}
                ${colorScheme.bg}
                ${colorScheme.text}
                border ${colorScheme.border}
                rounded-xl
                flex items-center justify-between
                ${QUICK_CLASH_CLASSES.focusRing}
                cursor-help
                relative
                overflow-hidden
                transition-all duration-200
              `}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${colorScheme.gradient} opacity-50`}
              />

              {/* Content */}
              <div className="relative z-10 flex items-center justify-between w-full">
                {/* Left: Probability with trend */}
                <div className={`flex items-center ${config.gap}`}>
                  <span className={`${config.fontSize} font-bold`}>
                    {currentPercentage}%
                  </span>

                  {showTrend && (
                    <div className={`flex items-center ${config.gap}`}>
                      <TrendIcon
                        className={`${config.iconSize} ${trend.color}`}
                      />
                      {Math.abs(change) > 0 && (
                        <span
                          className={`${config.fontSize} ${trend.color} font-medium`}
                        >
                          {change > 0 ? '+' : ''}
                          {change}%
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Progress indicator */}
                <div className="flex items-center gap-2">
                  {showCertainty && certaintyScore > 0 && (
                    <Badge
                      variant="outline"
                      className={`
                        ${config.fontSize}
                        ${certaintyLabel.color}
                        bg-black/30
                        border-white/20
                        font-medium
                        px-2 py-0.5
                      `}
                    >
                      {certaintyPercentage}%
                    </Badge>
                  )}

                  {/* Challenges progress */}
                  <span
                    className={`${config.fontSize} ${QUICK_CLASH_CLASSES.textMuted} font-medium`}
                  >
                    {completedChallenges}/{totalChallenges}
                  </span>
                </div>
              </div>
            </div>
          </MotionDiv>
        </TooltipTrigger>

        <TooltipContent
          className={`
            ${QUICK_CLASH_CLASSES.glassMedium}
            border border-white/20
            ${QUICK_CLASH_CLASSES.shadowSoft}
            rounded-xl
            p-4
            max-w-xs
          `}
        >
          <div className="flex flex-col space-y-2">
            {/* Title */}
            <p
              className={`${QUICK_CLASH_CLASSES.textPrimary} text-sm font-bold`}
            >
              {t('Win Probability')}
            </p>

            {/* Current vs Initial */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span
                  className={`${QUICK_CLASH_CLASSES.textSecondary} text-xs`}
                >
                  {t('Current')}:
                </span>
                <span
                  className={`${QUICK_CLASH_CLASSES.textPrimary} text-xs font-bold`}
                >
                  {currentPercentage}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`${QUICK_CLASH_CLASSES.textSecondary} text-xs`}
                >
                  {t('Initial')}:
                </span>
                <span className={`${QUICK_CLASH_CLASSES.textMuted} text-xs`}>
                  {initialPercentage}%
                </span>
              </div>
              {Math.abs(change) > 0 && (
                <div className="flex justify-between items-center">
                  <span
                    className={`${QUICK_CLASH_CLASSES.textSecondary} text-xs`}
                  >
                    {t('Change')}:
                  </span>
                  <span className={`${trend.color} text-xs font-bold`}>
                    {trend.text} {change > 0 ? '+' : ''}
                    {change}%
                  </span>
                </div>
              )}
            </div>

            {/* Certainty info */}
            {showCertainty && certaintyScore > 0 && (
              <>
                <div className="border-t border-white/10 my-1" />
                <div className="flex justify-between items-center">
                  <span
                    className={`${QUICK_CLASH_CLASSES.textSecondary} text-xs`}
                  >
                    {t('Certainty')}:
                  </span>
                  <span className={`${certaintyLabel.color} text-xs font-bold`}>
                    {certaintyPercentage}% - {certaintyLabel.text}
                  </span>
                </div>
              </>
            )}

            {/* Progress info */}
            <div className="border-t border-white/10 my-1" />
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-blue-400" />
              <span className={`${QUICK_CLASH_CLASSES.textMuted} text-xs`}>
                {t('{{completed}} of {{total}} challenges completed', {
                  completed: completedChallenges,
                  total: totalChallenges,
                })}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default TeamWinProbabilityDisplay
