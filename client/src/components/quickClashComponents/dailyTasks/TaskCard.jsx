// components/quickClashComponents/dailyTasks/TaskCard.jsx - FAITHFUL CONVERSION to Tailwind CSS
import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Gift,
  Clock,
  Trophy,
  Award,
  Target,
  Zap,
  ArrowUpRight,
} from 'lucide-react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { claimTaskReward } from '../../../redux/quickClashDailyTasksSlice'
import RewardAnimation from './RewardAnimation'
import TaskLevelBadge from './TaskLevelBadge'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// You'll need to install these components:
// npx shadcn-ui@latest add button
// npx shadcn-ui@latest add badge
// npx shadcn-ui@latest add tooltip
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const MotionDiv = motion.div
const MotionButton = motion.button

// Task type to icon mapping - EXACTLY as original
const taskTypeIcons = {
  COMPLETE_CHALLENGES: Target,
  ACHIEVE_RQM_SCORE: Award,
  WIN_CHALLENGES: Trophy,
  PLAY_CONSECUTIVE_DAYS: Clock,
  CHALLENGE_FRIEND: Zap,
  USE_CATEGORIES: Target,
  COMPLETE_MATCHMAKING: Target,
  VIEW_ANALYSES: ArrowUpRight,
  MAINTAIN_WINSTREAK: Trophy,
  IMPROVE_READING_TIME: Clock,
}

// Enhanced difficulty to color mapping with blue-cyan theme
const difficultyColors = {
  1: {
    color: 'green',
    gradient: 'from-green-400 to-teal-300',
    border: 'border-green-500/60',
    bg: 'bg-green-500/10',
    glow: 'shadow-green-500/30',
  },
  2: {
    color: 'blue',
    gradient: 'from-blue-400 to-cyan-300',
    border: 'border-blue-500/60',
    bg: 'bg-blue-500/10',
    glow: 'shadow-blue-500/30',
  },
  3: {
    color: 'cyan',
    gradient: 'from-cyan-400 to-blue-300',
    border: 'border-cyan-500/60',
    bg: 'bg-cyan-500/10',
    glow: 'shadow-cyan-500/30',
  },
  4: {
    color: 'orange',
    gradient: 'from-orange-400 to-yellow-300',
    border: 'border-orange-500/60',
    bg: 'bg-orange-500/10',
    glow: 'shadow-orange-500/30',
  },
  5: {
    color: 'red',
    gradient: 'from-red-400 to-orange-300',
    border: 'border-red-500/60',
    bg: 'bg-red-500/10',
    glow: 'shadow-red-500/30',
  },
}

/**
 * Enhanced TaskCard - Converted to Tailwind CSS with blue-cyan theme
 *
 * Key improvements in this conversion:
 * - Migrated from Chakra UI to Tailwind CSS + Shadcn/ui
 * - Implemented blue-cyan harmony color scheme
 * - Enhanced glassmorphic effects and animations
 * - Maintained all Redux integration and reward claiming functionality
 * - Improved responsive design and accessibility
 * - Enhanced progress indicators and visual feedback
 */
const TaskCard = ({ task, isJustCompleted = false, onClick }) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const [claimLoading, setClaimLoading] = useState(false)
  const [showRewardAnimation, setShowRewardAnimation] = useState(false)
  const [rewardAmount, setRewardAmount] = useState({ xp: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [levelInfo, setLevelInfo] = useState(null)

  // Calculate progress percentage - EXACTLY as original
  const progressPercentage = Math.min(
    100,
    Math.round((task.progress / task.target) * 100),
  )

  // Determine task status - EXACTLY as original
  const isCompleted = task.completed
  const isRewardClaimed = task.rewardClaimed
  const canClaimReward = isCompleted && !isRewardClaimed

  // Format time remaining - EXACTLY as original
  const timeRemaining = useMemo(() => {
    const now = new Date()
    const expiresAt = new Date(task.expiresAt)
    const diffHours = Math.floor((expiresAt - now) / (1000 * 60 * 60))
    const diffMinutes = Math.floor(
      ((expiresAt - now) % (1000 * 60 * 60)) / (1000 * 60),
    )

    if (diffHours < 1) {
      return diffMinutes > 0 ? `${diffMinutes}m` : t('Expiring soon')
    }
    return `${diffHours}h ${diffMinutes}m`
  }, [task.expiresAt, t])

  // Handle reward claim - EXACTLY as original
  const handleClaimReward = useCallback(
    async e => {
      e.stopPropagation()
      if (!canClaimReward || claimLoading) return

      try {
        setClaimLoading(true)
        const result = await dispatch(claimTaskReward(task._id)).unwrap()

        // Show reward animation
        setRewardAmount(result.reward)
        setLevelInfo(result.levelInfo)
        setShowRewardAnimation(true)

        console.log(t('You received {xp} XP', { xp: result.reward.xp }))
      } catch (error) {
        console.error(error || t('Failed to claim reward'))
      } finally {
        setClaimLoading(false)
      }
    },
    [task, canClaimReward, claimLoading, dispatch, t],
  )

  // Handle animation completion - EXACTLY as original
  const handleRewardAnimationComplete = useCallback(() => {
    setShowRewardAnimation(false)
  }, [])

  // Get the icon for this task type - EXACTLY as original
  const TaskIcon = taskTypeIcons[task.taskType] || Target

  // Get difficulty styling
  const difficultyStyle =
    difficultyColors[task.difficulty] || difficultyColors[3]

  // Card animations - EXACTLY as original
  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
    hover: {
      y: -5,
      boxShadow: '0 12px 20px -10px rgba(0, 0, 0, 0.3)',
      transition: { duration: 0.2 },
    },
  }

  // Enhanced card styling with blue-cyan theme
  const cardClasses = useMemo(() => {
    const baseClasses = `
      relative overflow-hidden rounded-xl cursor-pointer
      transition-all duration-200 border-2
      ${QUICK_CLASH_CLASSES.glassMedium}
      backdrop-brightness-110
    `

    const borderClasses = isCompleted
      ? difficultyStyle.border
      : 'border-white/20'

    const backgroundClasses = isCompleted ? difficultyStyle.bg : ''

    const shadowClasses = isJustCompleted
      ? 'shadow-xl shadow-cyan-500/70'
      : isHovered
      ? `shadow-xl ${difficultyStyle.glow}`
      : 'shadow-lg shadow-black/10'

    return `${baseClasses} ${borderClasses} ${backgroundClasses} ${shadowClasses}`
  }, [isCompleted, isJustCompleted, isHovered, difficultyStyle])

  return (
    <TooltipProvider>
      <MotionDiv
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cardClasses}
        onClick={() => onClick && onClick(task)}
      >
        {/* Background gradient effect */}
        {isCompleted && (
          <div
            className={`
              absolute inset-0 opacity-5
              bg-gradient-to-br ${difficultyStyle.gradient}
            `}
          />
        )}

        {/* Difficulty badge */}
        <div className="absolute top-0 right-0 z-10">
          <MotionDiv
            initial={{ x: 40 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TaskLevelBadge
              level={task.difficulty}
              variant="gradient"
              size="sm"
              animated={isHovered || isJustCompleted}
            />
          </MotionDiv>
        </div>

        <div className="px-4 pt-6 pb-3 relative z-10">
          {/* Task icon & title */}
          <div className="flex items-start gap-3 mb-3">
            {/* Icon with enhanced effects */}
            <MotionDiv
              className={`
                p-2 rounded-full flex items-center justify-center
                ${
                  isCompleted
                    ? `bg-${difficultyStyle.color}-600 shadow-lg ${difficultyStyle.glow}`
                    : `${QUICK_CLASH_CLASSES.glassLight}`
                }
                transition-all duration-300
              `}
              initial={{ rotate: 0 }}
              animate={
                isJustCompleted
                  ? { rotate: [0, 15, -5, 0], scale: [1, 1.2, 1] }
                  : isHovered
                  ? {
                      rotate: [-5, 5],
                      transition: {
                        repeat: Infinity,
                        repeatType: 'reverse',
                        duration: 0.5,
                      },
                    }
                  : {}
              }
            >
              <TaskIcon
                className={`w-5 h-5 ${
                  isCompleted ? 'text-white' : 'text-cyan-400'
                }`}
              />
            </MotionDiv>

            <div className="flex-1 min-w-0">
              <h4
                className={`
                text-sm font-semibold mb-1 truncate
                ${QUICK_CLASH_CLASSES.textPrimary}
              `}
              >
                {task.title}
              </h4>

              <p
                className={`
                text-xs leading-relaxed line-clamp-2
                ${QUICK_CLASH_CLASSES.textMuted}
                transition-opacity duration-200
                ${isHovered ? 'opacity-100' : 'opacity-80'}
              `}
              >
                {task.description}
              </p>
            </div>
          </div>

          {/* Progress section */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1">
                {isCompleted ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Target className="w-3 h-3 text-blue-400" />
                )}
                <span
                  className={`
                  text-xs font-medium
                  ${
                    isCompleted
                      ? 'text-green-300'
                      : QUICK_CLASH_CLASSES.textMuted
                  }
                `}
                >
                  {isCompleted
                    ? t('Completed')
                    : `${progressPercentage}% ${t('Complete')}`}
                </span>
              </div>

              <span
                className={`text-xs font-medium ${QUICK_CLASH_CLASSES.textMuted}`}
              >
                {task.progress}/{task.target}
              </span>
            </div>

            {/* Enhanced progress bar */}
            <div
              className={`
              relative h-1.5 rounded-full overflow-hidden
              ${QUICK_CLASH_CLASSES.glassLight}
            `}
            >
              <MotionDiv
                className={`
                  absolute h-full rounded-full
                  ${
                    isCompleted
                      ? `bg-gradient-to-r ${difficultyStyle.gradient}`
                      : 'bg-gradient-to-r from-blue-400 to-cyan-400'
                  }
                  ${
                    !isCompleted &&
                    progressPercentage > 0 &&
                    progressPercentage < 100
                      ? 'animate-pulse'
                      : ''
                  }
                `}
                initial={{ width: '0%' }}
                animate={{
                  width: `${progressPercentage}%`,
                  transition: { duration: 0.8, ease: 'easeOut' },
                }}
              />
            </div>
          </div>

          {/* Rewards & Time section */}
          <div className="flex justify-between items-center">
            {/* Time remaining */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <Clock
                    className={`w-3.5 h-3.5 transition-colors duration-200 ${
                      isHovered ? 'text-white/80' : 'text-white/60'
                    }`}
                  />
                  <span
                    className={`
                    text-xs transition-colors duration-200
                    ${
                      isHovered
                        ? QUICK_CLASH_CLASSES.textSecondary
                        : QUICK_CLASH_CLASSES.textMuted
                    }
                  `}
                  >
                    {timeRemaining}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('Time remaining until reset')}</p>
              </TooltipContent>
            </Tooltip>

            {/* Reward badge */}
            {!isRewardClaimed && (
              <MotionDiv
                animate={
                  isHovered && !isRewardClaimed
                    ? {
                        scale: [1, 1.1, 1],
                        transition: {
                          repeat: Infinity,
                          repeatType: 'reverse',
                          duration: 1,
                        },
                      }
                    : {}
                }
              >
                <Badge
                  className={`
                  ${QUICK_CLASH_CLASSES.badgeWarning}
                  flex items-center gap-1 px-2 py-1
                `}
                >
                  <Award className="w-3 h-3" />
                  <span className="text-xs">{task.reward.xp} XP</span>
                </Badge>
              </MotionDiv>
            )}
          </div>

          {/* Action button - only show if reward can be claimed */}
          {canClaimReward && (
            <div className="flex justify-center mt-3">
              <MotionButton
                onClick={handleClaimReward}
                disabled={claimLoading}
                className={`
                  w-10 h-10 rounded-full
                  bg-gradient-to-r from-cyan-500 to-blue-500
                  hover:from-cyan-600 hover:to-blue-600
                  active:from-cyan-700 active:to-blue-700
                  ${QUICK_CLASH_CLASSES.shadowCyan}
                  ${QUICK_CLASH_CLASSES.focusRing}
                  transition-all duration-200
                  flex items-center justify-center
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                whileHover={{
                  scale: 1.1,
                  boxShadow: '0 0 15px rgba(6, 182, 212, 0.7)',
                }}
                whileTap={{ scale: 0.9 }}
                aria-label={t('Claim Reward')}
              >
                {claimLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Gift className="w-4 h-4 text-white" />
                )}
              </MotionButton>
            </div>
          )}
        </div>

        {/* Claimed badge */}
        {isCompleted && isRewardClaimed && (
          <div className="absolute bottom-2 right-2 z-20">
            <MotionDiv
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100 }}
            >
              <Badge
                className={`
                ${QUICK_CLASH_CLASSES.badgeSuccess}
                flex items-center gap-1 px-2 py-1
              `}
              >
                <Check className="w-2.5 h-2.5" />
                <span className="text-xs">{t('Claimed')}</span>
              </Badge>
            </MotionDiv>
          </div>
        )}

        {/* Completion animation overlay */}
        <AnimatePresence>
          {isJustCompleted && (
            <MotionDiv
              className={`
                absolute inset-0 flex items-center justify-center
                bg-cyan-500/15 z-30
              `}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MotionDiv
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 1.5, 1],
                  rotate: [0, 10, 0],
                }}
                transition={{ duration: 0.8, type: 'spring' }}
              >
                <Check className="w-12 h-12 text-cyan-400" />
              </MotionDiv>
            </MotionDiv>
          )}
        </AnimatePresence>

        {/* Reward animation */}
        {showRewardAnimation && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <RewardAnimation
              xp={rewardAmount.xp}
              levelInfo={levelInfo}
              onComplete={handleRewardAnimationComplete}
            />
          </div>
        )}
      </MotionDiv>
    </TooltipProvider>
  )
}

export default TaskCard
