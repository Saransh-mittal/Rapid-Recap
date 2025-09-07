// components/quickClashComponents/team/TeamBattlesSkeleton.jsx - FAITHFUL CONVERSION with Consistent Color Scheme
import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users, Target, Clock, Swords } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

const MotionDiv = motion.div

/**
 * Enhanced skeleton for team battle header stats with Tailwind CSS
 */
const HeaderStatsSkeleton = memo(() => {
  return (
    <div className="flex justify-center mb-6 gap-3 md:gap-6 flex-wrap">
      {/* Home Button Skeleton */}
      <div className="h-10 w-28 bg-white/5 rounded-full animate-pulse" />

      {/* Trophy Count Skeleton */}
      <div
        className={`
        bg-yellow-400/10
        rounded-full
        px-4 py-2
        border border-yellow-400/30
      `}
      >
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <div className="h-5 w-10 bg-yellow-400/40 rounded animate-pulse" />
        </div>
      </div>

      {/* Star Count Skeleton */}
      <div className="h-10 w-20 bg-gradient-to-r from-yellow-400/10 to-yellow-500/20 rounded-full animate-pulse" />

      {/* Notification Skeleton */}
      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/10 to-cyan-600/20 rounded-full animate-pulse" />
    </div>
  )
})

/**
 * Enhanced skeleton for individual battle card with Tailwind CSS
 * Maintains all original responsive behavior and animations
 */
const BattleCardSkeleton = memo(({ isActive = true, index = 0 }) => {
  const { t } = useTranslation('QuickClash')

  // Responsive avatar size calculation
  const avatarSize = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'sm' : 'md'
    }
    return 'md'
  }, [])

  // Color scheme based on battle state
  const colorScheme = useMemo(
    () => ({
      border: isActive ? 'border-green-500' : 'border-cyan-500',
      header: isActive
        ? 'from-green-600 to-green-700'
        : 'from-cyan-600 to-cyan-700',
      progress: isActive ? 'green' : 'cyan',
      leftTeam: 'from-blue-500/20 to-blue-600/40',
      rightTeam: 'from-red-500/20 to-red-600/40',
    }),
    [isActive],
  )

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`
        ${QUICK_CLASH_CLASSES.glassMedium}
        rounded-2xl
        border-2
        ${colorScheme.border}
        overflow-hidden
        relative
        shadow-xl
        backdrop-brightness-110
      `}
    >
      {/* Header with Status Badge */}
      <div
        className={`
        bg-gradient-to-r ${colorScheme.header}
        px-3 md:px-4
        py-2
        flex justify-between items-center
      `}
      >
        {/* Status Badge Skeleton */}
        <div className="flex items-center bg-white/20 rounded-lg px-3 py-1 space-x-2">
          {isActive ? (
            <Swords className="w-3 h-3 text-white" />
          ) : (
            <Trophy className="w-3 h-3 text-white" />
          )}
          <div className="h-4 w-15 bg-white/30 rounded animate-pulse" />
        </div>

        {/* 4v4 Badge */}
        <div className="bg-black/30 text-white px-2 py-1 rounded-lg text-xs font-bold">
          4V4
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-3 md:px-4 pt-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-1">
            <Target className={`w-3 h-3 ${QUICK_CLASH_CLASSES.tabCyan}`} />
            <span className={`${QUICK_CLASH_CLASSES.textMuted} text-xs`}>
              {t('Progress')}
            </span>
          </div>
          <div className="h-3.5 w-8 bg-white/20 rounded animate-pulse" />
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2">
          <MotionDiv
            className={`h-2 rounded-full ${
              isActive
                ? 'bg-gradient-to-r from-green-400 to-green-500'
                : 'bg-gradient-to-r from-cyan-400 to-cyan-500'
            }`}
            initial={{ width: '0%' }}
            animate={{ width: isActive ? '25%' : '100%' }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>

      {/* Teams Section */}
      <div className="flex px-3 md:px-4 py-4 justify-between items-center">
        {/* Left Team */}
        <div className="flex flex-col items-center space-y-2 flex-1">
          {/* Team Name Skeleton */}
          <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />

          {/* Avatar Group Skeleton */}
          <div className="flex items-center space-x-[-4px]">
            <div
              className={`
              ${avatarSize === 'sm' ? 'w-8 h-8' : 'w-10 h-10'}
              bg-gradient-to-br ${colorScheme.leftTeam}
              rounded-full animate-pulse
            `}
            />
            <div
              className={`
              ${avatarSize === 'sm' ? 'w-8 h-8' : 'w-10 h-10'}
              bg-gradient-to-br ${colorScheme.leftTeam}
              rounded-full animate-pulse
            `}
            />
            {/* +2 indicator */}
            <div
              className={`
              ${avatarSize === 'sm' ? 'w-8 h-8' : 'w-10 h-10'}
              bg-white/10
              rounded-full
              border-2 border-white/30
              flex items-center justify-center
              text-xs font-bold text-white
            `}
            >
              +2
            </div>
          </div>

          {/* Score Skeleton */}
          <div className="h-6 w-5 bg-gradient-to-br from-blue-400/30 to-blue-500/40 rounded animate-pulse" />
        </div>

        {/* VS Section */}
        <div className="flex flex-col items-center space-y-2 px-3">
          <span
            className={`
            ${QUICK_CLASH_CLASSES.textMuted}
            text-lg font-bold
            tracking-wider
          `}
          >
            VS
          </span>

          {/* Action Button Skeleton */}
          <div
            className={`
            h-8 w-20
            ${
              isActive
                ? 'bg-gradient-to-r from-green-500/30 to-green-600/40'
                : 'bg-gradient-to-r from-teal-500/30 to-teal-600/40'
            }
            rounded-lg animate-pulse
          `}
          />
        </div>

        {/* Right Team */}
        <div className="flex flex-col items-center space-y-2 flex-1">
          {/* Team Name Skeleton */}
          <div className="h-4 w-20 bg-white/20 rounded animate-pulse" />

          {/* Avatar Group Skeleton */}
          <div className="flex items-center space-x-[-4px]">
            <div
              className={`
              ${avatarSize === 'sm' ? 'w-8 h-8' : 'w-10 h-10'}
              bg-gradient-to-br ${colorScheme.rightTeam}
              rounded-full animate-pulse
            `}
            />
            <div
              className={`
              ${avatarSize === 'sm' ? 'w-8 h-8' : 'w-10 h-10'}
              bg-gradient-to-br ${colorScheme.rightTeam}
              rounded-full animate-pulse
            `}
            />
            {/* +2 indicator */}
            <div
              className={`
              ${avatarSize === 'sm' ? 'w-8 h-8' : 'w-10 h-10'}
              bg-white/10
              rounded-full
              border-2 border-white/30
              flex items-center justify-center
              text-xs font-bold text-white
            `}
            >
              +2
            </div>
          </div>

          {/* Score Skeleton */}
          <div className="h-6 w-5 bg-gradient-to-br from-red-400/30 to-red-500/40 rounded animate-pulse" />
        </div>
      </div>

      {/* Footer - Time Info */}
      <div
        className={`
        px-3 md:px-4
        py-2
        border-t border-white/10
        ${QUICK_CLASH_CLASSES.glassSoft}
      `}
      >
        <div className="flex items-center justify-center space-x-1 text-xs text-blue-400">
          <Clock className="w-3 h-3" />
          <div className="h-3.5 w-30 bg-blue-400/40 rounded animate-pulse" />
        </div>
      </div>
    </MotionDiv>
  )
})

/**
 * Battle Section Header Skeleton with Tailwind CSS
 */
const SectionHeaderSkeleton = memo(({ title, icon: Icon, isActive = true }) => {
  return (
    <div
      className={`
      ${QUICK_CLASH_CLASSES.glassMedium}
      rounded-2xl
      border border-white/20
      p-2 md:p-4
      flex justify-between items-center
      mb-4
      backdrop-brightness-110
    `}
    >
      <div className="flex items-center space-x-3">
        <Icon
          className={`
            w-4 h-4 md:w-5 md:h-5
            ${isActive ? 'text-green-400' : QUICK_CLASH_CLASSES.tabCyan}
          `}
        />
        <div className="h-5 w-30 bg-white/20 rounded animate-pulse" />
        <div
          className={`
          w-6 h-6
          ${
            isActive
              ? 'bg-green-500/20 border-green-500/40'
              : 'bg-cyan-500/20 border-cyan-500/40'
          }
          rounded-full animate-pulse
        `}
        />
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-cyan-500/10 border-cyan-500/20 rounded-full animate-pulse" />
        <div className="w-8 h-8 bg-cyan-500/10 border-cyan-500/20 rounded-full animate-pulse" />
      </div>
    </div>
  )
})

/**
 * Main TeamBattlesSkeleton Component with Tailwind CSS
 *
 * Key features maintained:
 * - Multiple skeleton variations for different UI sections
 * - Sophisticated animation using Framer Motion
 * - Responsive design with proper breakpoints
 * - Color variations for different battle states
 * - Progressive loading animations
 * - Accessibility considerations
 */
const TeamBattlesSkeleton = memo(() => {
  const { t } = useTranslation('QuickClash')

  // Responsive configuration
  const isDesktop = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768
    }
    return false
  }, [])

  return (
    <div
      className={`
      w-full max-w-full overflow-hidden
      px-1 md:px-4
      team-battles-skeleton
    `}
    >
      {/* Header Stats Skeleton */}
      <HeaderStatsSkeleton />

      {/* Page Title Skeleton */}
      <MotionDiv
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-4 md:mb-6"
      >
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Users className={`w-6 h-6 ${QUICK_CLASH_CLASSES.tabCyan}`} />
          <div className="h-7 w-40 bg-white/20 rounded animate-pulse" />
        </div>
        <div className="h-4 w-70 mx-auto bg-white/10 rounded animate-pulse" />
      </MotionDiv>

      <div className="flex flex-col space-y-4 md:space-y-6">
        {/* Active Battles Section */}
        <div>
          <SectionHeaderSkeleton
            title="Active Battles"
            icon={Swords}
            isActive={true}
          />

          {/* Active Battle Card */}
          <BattleCardSkeleton isActive={true} index={0} />
        </div>

        {/* Completed Battles Section */}
        <div>
          <SectionHeaderSkeleton
            title="Completed Battles"
            icon={Trophy}
            isActive={false}
          />

          {/* Date Header Skeleton */}
          <MotionDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-3"
          >
            <div
              className={`
              flex items-center space-x-2
              ${QUICK_CLASH_CLASSES.glassLight}
              rounded-full
              px-4 py-2
              border border-cyan-500/30
              max-w-[200px]
              bg-gradient-to-r from-cyan-500/5 to-transparent
            `}
            >
              <Clock className={`w-4 h-4 ${QUICK_CLASH_CLASSES.tabCyan}`} />
              <div className="h-4 w-24 bg-cyan-400/40 rounded animate-pulse" />
            </div>
          </MotionDiv>

          {/* Completed Battle Cards */}
          {isDesktop ? (
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <BattleCardSkeleton isActive={false} index={0} />
              </div>
              <div className="flex-1 min-w-[300px]">
                <BattleCardSkeleton isActive={false} index={1} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <BattleCardSkeleton isActive={false} index={0} />
            </div>
          )}
        </div>
      </div>

      {/* Loading indicator at bottom */}
      <div className="flex justify-center py-6 mt-4">
        <MotionDiv
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <div className="flex items-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <MotionDiv
                key={i}
                className="w-2 h-2 bg-cyan-500/60 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </MotionDiv>
      </div>
    </div>
  )
})

// Set display names for debugging
HeaderStatsSkeleton.displayName = 'HeaderStatsSkeleton'
BattleCardSkeleton.displayName = 'BattleCardSkeleton'
SectionHeaderSkeleton.displayName = 'SectionHeaderSkeleton'
TeamBattlesSkeleton.displayName = 'TeamBattlesSkeleton'

export default TeamBattlesSkeleton
