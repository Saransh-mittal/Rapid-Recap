// components/quickClashComponents/globalmatchmaking/components/BattleReadyDisplay.jsx
// REDESIGNED - Premium celebration display with enhanced visual effects
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Zap,
  Users,
  User,
  UserPlus,
  Trophy,
  Swords,
  Target,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

import { QUICK_CLASH_CLASSES } from '../../utils/quickClashColors'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const MotionDiv = motion.div

/**
 * BattleReadyDisplay - REDESIGNED Premium Celebration
 *
 * Key Features:
 * - Triumphant visual design with celebration effects
 * - Clear battle information display
 * - Animated elements to create excitement
 * - Visual hierarchy guides user to next action
 */
const BattleReadyDisplay = React.memo(
  ({ battleReady, matchmakingTime, badgeInfo, formatMatchmakingTime }) => {
    const { t } = useTranslation('QuickClash')

    // Get icon component based on badge info
    const BadgeIconComponent = useMemo(() => {
      const iconMap = { User, UserPlus, Users }
      return iconMap[badgeInfo.icon] || Users
    }, [badgeInfo.icon])

    return (
      <div className="space-y-6">
        {/* Main celebration icon */}
        <MotionDiv
          className="flex justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
        >
          <div className="relative">
            {/* Main icon container */}
            <MotionDiv
              className={`
                w-32 h-32 rounded-full
                ${QUICK_CLASH_CLASSES.glassMedium}
                border-2 border-cyan-400/60
                flex items-center justify-center
                shadow-2xl shadow-cyan-500/40
              `}
              animate={{
                boxShadow: [
                  '0 0 40px rgba(6, 182, 212, 0.4)',
                  '0 0 80px rgba(6, 182, 212, 0.6)',
                  '0 0 40px rgba(6, 182, 212, 0.4)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Zap className="w-16 h-16 text-cyan-300" />
            </MotionDiv>

            {/* Orbiting sparkles */}
            {[0, 1, 2, 3].map(i => (
              <MotionDiv
                key={i}
                className="absolute w-3 h-3"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  rotate: 360,
                  x: Math.cos((i * Math.PI) / 2) * 70,
                  y: Math.sin((i * Math.PI) / 2) * 70,
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 0.2,
                }}
              >
                <Sparkles className="w-3 h-3 text-yellow-400" />
              </MotionDiv>
            ))}
          </div>
        </MotionDiv>

        {/* Title and subtitle */}
        <MotionDiv
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2
            className={`
              text-4xl font-extrabold
              bg-gradient-to-r from-cyan-300 via-cyan-200 to-blue-300
              bg-clip-text text-transparent
              tracking-tight
            `}
          >
            {t('Battle Ready!')}
          </h2>
          <p className={`${QUICK_CLASH_CLASSES.textSecondary} text-lg px-4`}>
            {t('Your 4v4 team battle arena is prepared')}
          </p>
        </MotionDiv>

        {/* Player status badge */}
        <MotionDiv
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Badge
            className={`
              ${badgeInfo.bgClass}
              ${badgeInfo.borderClass}
              ${badgeInfo.textClass}
              border
              px-4 py-2
              rounded-full
              font-bold
              text-sm
              flex items-center gap-2
              shadow-lg
            `}
          >
            <BadgeIconComponent className="w-4 h-4" />
            {badgeInfo.text}
          </Badge>
        </MotionDiv>

        {/* Battle stats card */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`
            ${QUICK_CLASH_CLASSES.glassLight}
            rounded-2xl p-5
            border border-cyan-400/30
            shadow-xl shadow-cyan-500/10
          `}
        >
          <div className="space-y-4">
            {/* Queue time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className={`${QUICK_CLASH_CLASSES.textMuted} text-xs`}>
                    {t('Time in Queue')}
                  </p>
                  <p
                    className={`${QUICK_CLASH_CLASSES.textPrimary} font-bold font-mono text-lg`}
                  >
                    {formatMatchmakingTime(matchmakingTime)}
                  </p>
                </div>
              </div>
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>

            <Separator className="bg-white/10" />

            {/* Match details */}
            {battleReady.teamA && battleReady.teamB && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <p
                    className={`${QUICK_CLASH_CLASSES.textPrimary} font-bold text-sm`}
                  >
                    {t('Match Details')}
                  </p>
                </div>

                <div className="flex items-center justify-between px-2">
                  {/* Your Team */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-400/50 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-300" />
                    </div>
                    <p
                      className={`${QUICK_CLASH_CLASSES.textSecondary} text-xs font-medium`}
                    >
                      {t('Your Team')}
                    </p>
                  </div>

                  {/* VS indicator */}
                  <div className="flex flex-col items-center">
                    <MotionDiv
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <Swords className="w-8 h-8 text-yellow-400" />
                    </MotionDiv>
                    <p
                      className={`${QUICK_CLASH_CLASSES.textMuted} text-xs font-bold mt-1`}
                    >
                      VS
                    </p>
                  </div>

                  {/* Opponent Team */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-400/50 flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-300" />
                    </div>
                    <p
                      className={`${QUICK_CLASH_CLASSES.textSecondary} text-xs font-medium`}
                    >
                      {t('Opponents')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </MotionDiv>

        {/* Call to action hint */}
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`
            ${QUICK_CLASH_CLASSES.glassLight}
            rounded-xl p-4
            border border-yellow-400/30
            bg-gradient-to-r from-yellow-500/5 to-orange-500/5
          `}
        >
          <div className="flex items-start gap-3">
            <Trophy className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p
                className={`${QUICK_CLASH_CLASSES.textPrimary} text-sm font-bold mb-1`}
              >
                {t('Ready to Compete?')}
              </p>
              <p
                className={`${QUICK_CLASH_CLASSES.textMuted} text-xs leading-relaxed`}
              >
                {t(
                  'Click "Enter Battle Arena" to join your team, select your category, and start earning trophies!',
                )}
              </p>
            </div>
          </div>
        </MotionDiv>
      </div>
    )
  },
)

BattleReadyDisplay.displayName = 'BattleReadyDisplay'
export default BattleReadyDisplay
