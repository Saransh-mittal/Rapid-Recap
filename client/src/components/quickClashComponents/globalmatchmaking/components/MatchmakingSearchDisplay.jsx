// components/quickClashComponents/globalmatchmaking/components/MatchmakingSearchDisplay.jsx
// REDESIGNED - Engaging search animation with real-time updates
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Globe,
  Clock,
  User,
  UserPlus,
  Users,
  Info,
  Activity,
  Zap,
  TrendingUp,
  Target,
} from 'lucide-react'

import { QUICK_CLASH_CLASSES } from '../../utils/quickClashColors'
import StatusUpdatesPanel from './StatusUpdatesPanel'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

const MotionDiv = motion.div

/**
 * MatchmakingSearchDisplay - REDESIGNED
 *
 * Key Features:
 * - Animated global search indicator
 * - Real-time status updates panel
 * - Visual progress indication
 * - Contextual badges based on join type
 * - Engaging micro-animations
 */
const MatchmakingSearchDisplay = React.memo(
  ({
    matchmakingTime,
    badgeInfo,
    joinType,
    originalTeam,
    statusUpdates,
    formatMatchmakingTime,
  }) => {
    const { t } = useTranslation('QuickClash')

    // Get badge icon component
    const BadgeIconComponent = useMemo(() => {
      const iconMap = { User, UserPlus, Users, Info }
      return iconMap[badgeInfo.icon] || Users
    }, [badgeInfo.icon])

    // Calculate progress based on time (caps at 90% to avoid implying completion)
    const searchProgress = useMemo(() => {
      return Math.min((matchmakingTime / 120) * 90, 90) // 2 minutes = 90%
    }, [matchmakingTime])

    return (
      <div className="space-y-6">
        {/* Main searching animation */}
        <div className="flex justify-center relative">
          <MotionDiv
            className={`
              w-32 h-32 rounded-full
              ${QUICK_CLASH_CLASSES.glassMedium}
              border-2 border-emerald-400/60
              flex items-center justify-center
              shadow-2xl shadow-emerald-500/40
              relative overflow-hidden
            `}
            animate={{
              boxShadow: [
                '0 0 40px rgba(16, 185, 129, 0.4)',
                '0 0 80px rgba(16, 185, 129, 0.6)',
                '0 0 40px rgba(16, 185, 129, 0.4)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Rotating globe */}
            <MotionDiv
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Globe className="w-16 h-16 text-emerald-400" />
            </MotionDiv>

            {/* Pulsing rings */}
            {[0, 1, 2].map(i => (
              <MotionDiv
                key={i}
                className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 0, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 1,
                }}
              />
            ))}

            {/* Scanning line effect */}
            <MotionDiv
              className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent"
              animate={{
                y: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </MotionDiv>

          {/* Floating activity indicators */}
          {[0, 1, 2, 3].map(i => (
            <MotionDiv
              key={i}
              className="absolute"
              style={{
                left: `${20 + i * 20}%`,
                top: `${10 + (i % 2) * 70}%`,
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              <Activity className="w-4 h-4 text-emerald-300" />
            </MotionDiv>
          ))}
        </div>

        {/* Status badge with tooltip */}
        <div className="flex justify-center">
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
            title={badgeInfo.tooltip}
          >
            <BadgeIconComponent className="w-4 h-4" />
            {badgeInfo.text}
            {joinType !== 'regular' && <Info className="w-3 h-3 opacity-70" />}
          </Badge>
        </div>

        {/* Contextual team formation info */}
        {joinType === 'sourceTeam' && originalTeam && (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              ${QUICK_CLASH_CLASSES.glassLight}
              rounded-xl p-4
              border border-purple-400/30
              bg-gradient-to-r from-purple-500/5 to-blue-500/5
            `}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p
                  className={`${QUICK_CLASH_CLASSES.textPrimary} font-bold text-sm mb-1`}
                >
                  {t('Auto-Team Formation')}
                </p>
                <p
                  className={`${QUICK_CLASH_CLASSES.textMuted} text-xs leading-relaxed`}
                >
                  {t(
                    'Your team "{{originalTeam}}" has been merged with other players to form a complete 4v4 battle team.',
                    { originalTeam: originalTeam.name || t('Original Team') },
                  )}
                </p>
              </div>
            </div>
          </MotionDiv>
        )}

        {joinType === 'solo' && (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              ${QUICK_CLASH_CLASSES.glassLight}
              rounded-xl p-4
              border border-teal-400/30
              bg-gradient-to-r from-teal-500/5 to-emerald-500/5
            `}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p
                  className={`${QUICK_CLASH_CLASSES.textPrimary} font-bold text-sm mb-1`}
                >
                  {t('Auto-Team Formation')}
                </p>
                <p
                  className={`${QUICK_CLASH_CLASSES.textMuted} text-xs leading-relaxed`}
                >
                  {t(
                    'You joined individually and will be assigned to a team with other players for an epic 4v4 battle.',
                  )}
                </p>
              </div>
            </div>
          </MotionDiv>
        )}

        {/* Main search status */}
        <div className="text-center space-y-3">
          <h3
            className={`${QUICK_CLASH_CLASSES.textPrimary} text-2xl font-bold`}
          >
            {t('Finding Your 4v4 Battle')}
          </h3>
          <p className={`${QUICK_CLASH_CLASSES.textSecondary} text-sm px-4`}>
            {t('Matching you with players of similar skill level')}
          </p>

          {/* Search progress bar */}
          <div className="pt-2 px-8">
            <Progress
              value={searchProgress}
              className="h-2 bg-emerald-500/20"
            />
            <p className={`${QUICK_CLASH_CLASSES.textMuted} text-xs mt-2`}>
              {searchProgress < 30
                ? t('Starting search...')
                : searchProgress < 60
                ? t('Expanding search range...')
                : t('Finding best match...')}
            </p>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Stats section */}
        <div
          className={`
          ${QUICK_CLASH_CLASSES.glassLight}
          rounded-2xl p-4
          border border-emerald-400/30
        `}
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Time in queue */}
            <div className="space-y-2">
              <p
                className={`${QUICK_CLASH_CLASSES.textMuted} text-xs flex items-center gap-2`}
              >
                <Clock className="w-3 h-3" />
                {t('Time in Queue')}
              </p>
              <div
                className={`
                ${QUICK_CLASH_CLASSES.glassLight}
                rounded-lg p-2.5
                border border-emerald-400/20
                text-center
              `}
              >
                <p
                  className={`${QUICK_CLASH_CLASSES.textPrimary} font-bold font-mono text-lg`}
                >
                  {formatMatchmakingTime(matchmakingTime)}
                </p>
              </div>
            </div>

            {/* Status indicator */}
            <div className="space-y-2">
              <p
                className={`${QUICK_CLASH_CLASSES.textMuted} text-xs flex items-center gap-2`}
              >
                <Target className="w-3 h-3" />
                {t('Status')}
              </p>
              <div
                className={`
                ${QUICK_CLASH_CLASSES.glassLight}
                rounded-lg p-2.5
                border border-emerald-400/20
                flex items-center justify-center
              `}
              >
                <MotionDiv
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Badge className="bg-emerald-500 text-white font-bold text-xs px-3 py-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {t('Searching')}
                  </Badge>
                </MotionDiv>
              </div>
            </div>
          </div>
        </div>

        {/* Status updates panel */}
        <StatusUpdatesPanel statusUpdates={statusUpdates} />

        {/* Info card */}
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`
            ${QUICK_CLASH_CLASSES.glassLight}
            rounded-xl p-4
            border border-cyan-400/30
            bg-gradient-to-r from-cyan-500/5 to-blue-500/5
          `}
        >
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <p
                className={`${QUICK_CLASH_CLASSES.textPrimary} text-sm font-bold mb-1`}
              >
                {t('Stay Flexible')}
              </p>
              <p
                className={`${QUICK_CLASH_CLASSES.textMuted} text-xs leading-relaxed`}
              >
                {t(
                  "You can close this modal and continue using the app. We'll notify you when your battle is ready!",
                )}
              </p>
            </div>
          </div>
        </MotionDiv>
      </div>
    )
  },
)

MatchmakingSearchDisplay.displayName = 'MatchmakingSearchDisplay'
export default MatchmakingSearchDisplay
