// components/quickClashComponents/ui/WinProbabilityBar.jsx - SIMPLIFIED & CLEAN
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Flame, Shield, Zap } from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

const MotionDiv = motion.div

/**
 * SIMPLIFIED WinProbabilityBar - Clean & Minimal Design
 *
 * KEY FEATURES:
 * 1. Simple, readable percentage display
 * 2. Clean gradient bar without animations
 * 3. Responsive across all screen sizes
 * 4. Consistent typography scale
 * 5. Dynamic icon messaging
 * 6. No overflow issues on mobile
 *
 * DESIGN PHILOSOPHY:
 * - Simplicity attracts users
 * - Fast rendering (no complex animations)
 * - Clear information hierarchy
 * - Mobile-first responsive approach
 * - Minimal but premium feel
 *
 * @param {Number} userProbability - User's win probability (0.0 to 1.0)
 * @param {Number} opponentProbability - Opponent's win probability (0.0 to 1.0)
 * @param {String} userName - User's display name
 * @param {String} opponentName - Opponent's display name
 * @param {String} size - Bar size variant (sm, md, lg)
 * @param {Boolean} showLabels - Show player name labels
 */
const WinProbabilityBar = ({
  userProbability = 0.5,
  opponentProbability = 0.5,
  userName = 'You',
  opponentName = 'Opponent',
  size = 'md',
  showLabels = true,
}) => {
  const { t } = useTranslation('QuickClash')

  // Convert to percentages
  const userPercentage = Math.round(userProbability * 100)
  const opponentPercentage = Math.round(opponentProbability * 100)

  // Size configurations - SIMPLIFIED
  const sizeConfig = {
    sm: {
      height: 'h-6',
      barHeight: 'h-5',
      labelSize: 'text-xs',
      percentSize: 'text-sm font-bold',
      messageSize: 'text-xs',
      padding: 'p-3',
      gap: 'gap-2',
    },
    md: {
      height: 'h-7',
      barHeight: 'h-6',
      labelSize: 'text-sm',
      percentSize: 'text-base font-bold',
      messageSize: 'text-sm',
      padding: 'p-4',
      gap: 'gap-2.5',
    },
    lg: {
      height: 'h-8',
      barHeight: 'h-7',
      labelSize: 'text-base',
      percentSize: 'text-lg font-bold',
      messageSize: 'text-base',
      padding: 'p-5',
      gap: 'gap-3',
    },
  }

  const config = sizeConfig[size] || sizeConfig.md

  // Simple color scheme
  const getColorScheme = useMemo(() => {
    if (userPercentage > opponentPercentage + 15) {
      return {
        userGradient: 'from-cyan-500 to-cyan-600',
        userBg: 'bg-cyan-500/20',
        userBorder: 'border-cyan-400/40',
        message: t("You're ahead! Keep pushing! 🚀"),
        messageColor: 'text-cyan-300',
        icon: Zap,
      }
    } else if (opponentPercentage > userPercentage + 15) {
      return {
        userGradient: 'from-orange-500 to-orange-600',
        userBg: 'bg-orange-500/20',
        userBorder: 'border-orange-400/40',
        message: t('Underdog mode! Prove them wrong! 💪'),
        messageColor: 'text-orange-300',
        icon: Flame,
      }
    } else {
      return {
        userGradient: 'from-yellow-500 to-yellow-600',
        userBg: 'bg-yellow-500/20',
        userBorder: 'border-yellow-400/40',
        message: t("It's evenly matched! 🎯"),
        messageColor: 'text-yellow-300',
        icon: Shield,
      }
    }
  }, [userPercentage, opponentPercentage, t])

  const MessageIcon = getColorScheme.icon

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className={`w-full ${config.gap} flex flex-col`}>
        {/* Labels row - Only show on md+ */}
        {showLabels && (
          <div className="hidden sm:flex justify-between items-end px-0.5">
            {/* User side */}
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span
                className={`${config.labelSize} ${QUICK_CLASH_CLASSES.textPrimary} font-semibold truncate`}
                title={userName}
              >
                {userName.length > 16
                  ? userName.substring(0, 14) + '..'
                  : userName}
              </span>
              <span
                className={`text-xs ${QUICK_CLASH_CLASSES.textMuted} mt-0.5`}
              >
                {userPercentage}% to win
              </span>
            </div>

            {/* Opponent side */}
            <div className="flex flex-col items-end flex-1 min-w-0">
              <span
                className={`${config.labelSize} ${QUICK_CLASH_CLASSES.textSecondary} font-semibold truncate`}
                title={opponentName}
              >
                {opponentName.length > 16
                  ? opponentName.substring(0, 14) + '..'
                  : opponentName}
              </span>
              <span
                className={`text-xs ${QUICK_CLASH_CLASSES.textMuted} mt-0.5`}
              >
                {opponentPercentage}% to win
              </span>
            </div>
          </div>
        )}

        {/* Progress bar container - Simplified */}
        <div
          className={`
            relative ${config.padding}
            ${QUICK_CLASH_CLASSES.glassLight}
            rounded-xl
            border border-white/15
            overflow-hidden
          `}
        >
          {/* Bar section */}
          <div
            className={`relative w-full ${config.barHeight} ${QUICK_CLASH_CLASSES.glassMedium} rounded-full overflow-hidden border border-white/20`}
          >
            {/* User's side */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${userPercentage}%` }}
              transition={{
                type: 'spring',
                stiffness: 60,
                damping: 20,
                duration: 0.8,
              }}
              className={`
                absolute left-0 top-0 h-full
                bg-gradient-to-r ${getColorScheme.userGradient}
                shadow-lg shadow-slate-700/40
                flex items-center justify-start
                rounded-full
                overflow-hidden
              `}
            />

            {/* Opponent's side */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${opponentPercentage}%` }}
              transition={{
                type: 'spring',
                stiffness: 60,
                damping: 20,
                duration: 0.8,
                delay: 0.05,
              }}
              className={`
                absolute right-0 top-0 h-full
                bg-gradient-to-l from-red-500 to-red-600
                shadow-lg shadow-slate-700/40
                flex items-center justify-end
                rounded-full
              `}
            />

            {/* Center divider */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 transform -translate-x-1/2 z-20" />
          </div>

          {/* Percentage badges - Below bar */}
          <div className="flex justify-between items-center mt-2">
            <span
              className={`
                ${config.percentSize}
                text-white
                bg-gradient-to-r ${getColorScheme.userGradient}
                px-3 py-1
                rounded-full
                shadow-lg shadow-slate-700/30
              `}
            >
              {userPercentage}%
            </span>

            <span
              className={`text-xs ${QUICK_CLASH_CLASSES.textMuted} font-medium`}
            >
              vs
            </span>

            <span className="text-base font-bold text-white bg-gradient-to-r from-red-500 to-red-600 px-3 py-1 rounded-full shadow-lg shadow-slate-700/30">
              {opponentPercentage}%
            </span>
          </div>

          {/* Message section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className={`flex items-center justify-center gap-2 mt-3 ${getColorScheme.userBg} ${getColorScheme.userBorder} border rounded-lg px-2.5 py-2`}
          >
            <MessageIcon className="w-4 h-4 flex-shrink-0" />
            <p
              className={`${config.messageSize} font-medium ${getColorScheme.messageColor} text-center leading-snug`}
            >
              {getColorScheme.message}
            </p>
          </motion.div>
        </div>
      </div>
    </MotionDiv>
  )
}

export default WinProbabilityBar
