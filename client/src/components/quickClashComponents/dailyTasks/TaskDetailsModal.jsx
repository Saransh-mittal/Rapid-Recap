// components/quickClashComponents/dailyTasks/TaskDetailsModal.jsx - FAITHFUL CONVERSION to Tailwind CSS
import React, { useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  Target,
  Clock,
  Star,
  Gift,
  Info,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Trophy,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { claimTaskReward } from '../../../redux/quickClashDailyTasksSlice'
import { format, formatDistanceToNow } from 'date-fns'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// You'll need to install these components:
// npx shadcn-ui@latest add dialog
// npx shadcn-ui@latest add button
// npx shadcn-ui@latest add badge
// npx shadcn-ui@latest add separator
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const MotionDiv = motion.div

/**
 * Enhanced Task Details Modal - Converted to Tailwind CSS with blue-cyan theme
 *
 * Key improvements in this conversion:
 * - Migrated from Chakra UI to Tailwind CSS + Shadcn/ui Dialog
 * - Implemented blue-cyan harmony color scheme
 * - Enhanced glassmorphic effects and animations
 * - Maintained all Redux integration and reward claiming functionality
 * - Improved responsive design and accessibility
 * - Enhanced visual hierarchy and information presentation
 */
const TaskDetailsModal = ({ isOpen, onClose, task }) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()

  // Task type to details mapping - EXACTLY as original with memoization
  const TASK_TYPE_DETAILS = useMemo(
    () => ({
      COMPLETE_CHALLENGES: {
        icon: Target,
        color: 'blue',
        description: t(
          'taskType.COMPLETE_CHALLENGES.description',
          'Complete Quick Clash challenges against opponents',
        ),
        benefit: t(
          'taskType.COMPLETE_CHALLENGES.benefit',
          'Improves your knowledge and game skills',
        ),
      },
      ACHIEVE_RQM_SCORE: {
        icon: Target,
        color: 'cyan',
        description: t(
          'taskType.ACHIEVE_RQM_SCORE.description',
          'Reach certain Reading Quality Metric scores in challenges',
        ),
        benefit: t(
          'taskType.ACHIEVE_RQM_SCORE.benefit',
          'Enhances your reading comprehension abilities',
        ),
      },
      WIN_CHALLENGES: {
        icon: Trophy,
        color: 'yellow',
        description: t(
          'taskType.WIN_CHALLENGES.description',
          'Win Quick Clash challenges against opponents',
        ),
        benefit: t(
          'taskType.WIN_CHALLENGES.benefit',
          'Boosts your ranking and confidence',
        ),
      },
      PLAY_CONSECUTIVE_DAYS: {
        icon: Clock,
        color: 'green',
        description: t(
          'taskType.PLAY_CONSECUTIVE_DAYS.description',
          'Play Quick Clash on consecutive days',
        ),
        benefit: t(
          'taskType.PLAY_CONSECUTIVE_DAYS.benefit',
          'Develops a consistent learning habit',
        ),
      },
      CHALLENGE_FRIEND: {
        icon: Target,
        color: 'pink',
        description: t(
          'taskType.CHALLENGE_FRIEND.description',
          'Invite friends to compete in Quick Clash',
        ),
        benefit: t(
          'taskType.CHALLENGE_FRIEND.benefit',
          'Expands your knowledge network',
        ),
      },
      DEFAULT: {
        icon: Info,
        color: 'gray',
        description: t(
          'taskType.DEFAULT.description',
          'Complete this task to earn rewards',
        ),
        benefit: t(
          'taskType.DEFAULT.benefit',
          'Improves your Quick Clash experience',
        ),
      },
    }),
    [t],
  )

  // Handle reward claim - EXACTLY as original
  const handleClaimReward = useCallback(() => {
    if (!task) return

    dispatch(claimTaskReward(task._id))
      .unwrap()
      .then(result => {
        console.log(t('You received {xp} XP', { xp: result.reward.xp }))
        onClose()
      })
      .catch(error => {
        console.error(error || t('Failed to claim reward'))
      })
  }, [dispatch, task, t, onClose])

  // Calculate progress percentage - EXACTLY as original
  const progressPercentage = useMemo(() => {
    if (!task) return 0
    return Math.min(100, Math.round((task.progress / task.target) * 100))
  }, [task])

  // Get task type details - EXACTLY as original
  const taskTypeDetails = useMemo(() => {
    if (!task) return TASK_TYPE_DETAILS.DEFAULT
    return TASK_TYPE_DETAILS[task.taskType] || TASK_TYPE_DETAILS.DEFAULT
  }, [task, TASK_TYPE_DETAILS])

  // Determine difficulty stars - EXACTLY as original
  const difficultyStars = useMemo(() => {
    if (!task) return []
    return [...Array(task.difficulty || 0)].map((_, i) => (
      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
    ))
  }, [task])

  // Time remaining - EXACTLY as original
  const timeLeft = useMemo(() => {
    if (!task) return ''
    const expiryDate = new Date(task.expiresAt)
    return formatDistanceToNow(expiryDate, { addSuffix: true })
  }, [task])

  // Custom circular progress component
  const CircularProgressIndicator = ({
    value,
    size = 120,
    strokeWidth = 8,
  }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (value / 100) * circumference

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="3"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={task.completed ? '#10B981' : '#06B6D4'}
            strokeWidth="4"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-white leading-none">
            {value}%
          </span>
        </div>
      </div>
    )
  }

  // Color mapping for task types
  const colorMap = {
    blue: {
      bg: 'bg-blue-900',
      text: 'text-blue-400',
      border: 'border-blue-800',
      glow: 'shadow-blue-500/30',
    },
    cyan: {
      bg: 'bg-cyan-900',
      text: 'text-cyan-400',
      border: 'border-cyan-800',
      glow: 'shadow-cyan-500/30',
    },
    green: {
      bg: 'bg-green-900',
      text: 'text-green-400',
      border: 'border-green-800',
      glow: 'shadow-green-500/30',
    },
    yellow: {
      bg: 'bg-yellow-900',
      text: 'text-yellow-400',
      border: 'border-yellow-800',
      glow: 'shadow-yellow-500/30',
    },
    purple: {
      bg: 'bg-purple-900',
      text: 'text-purple-400',
      border: 'border-purple-800',
      glow: 'shadow-purple-500/30',
    },
    gray: {
      bg: 'bg-gray-900',
      text: 'text-gray-400',
      border: 'border-gray-800',
      glow: 'shadow-gray-500/30',
    },
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  }

  // Return null if no task
  if (!task) return null

  // Format date strings
  const createdDate = new Date(task.assignedAt)
  const expiryDate = new Date(task.expiresAt)

  const taskColors = colorMap[taskTypeDetails.color] || colorMap.cyan

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`
          max-w-full md:max-w-2xl max-h-[95vh] overflow-y-auto
          ${QUICK_CLASH_CLASSES.glassDark}
          border-2 border-cyan-600/60
          ${QUICK_CLASH_CLASSES.shadowCyan}
          backdrop-brightness-115
        `}
        asChild
      >
        <MotionDiv
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Enhanced Header */}
          <div
            className={`
            relative mb-6 pb-4 border-b border-white/10
            bg-gradient-to-b from-slate-800/50 to-slate-900/30
            -m-6 px-6 pt-6
          `}
          >
            {/* Golden accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400" />

            <DialogHeader className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  bg-cyan-500/20 border border-cyan-400
                  ${QUICK_CLASH_CLASSES.shadowCyan}
                `}
                >
                  <taskTypeDetails.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <DialogTitle
                  className={`
                  text-xl font-semibold
                  bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent
                `}
                >
                  {t('Task Details')}
                </DialogTitle>
              </div>

              <h2
                className={`
                text-2xl font-bold pr-8 leading-tight
                ${QUICK_CLASH_CLASSES.textPrimary}
              `}
              >
                {task.title}
              </h2>
            </DialogHeader>
          </div>

          {/* Task description */}
          <div className="mb-5">
            <p className={`${QUICK_CLASH_CLASSES.textSecondary} text-base`}>
              {task.description}
            </p>
          </div>

          {/* Progress circular indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex flex-col items-center">
              <CircularProgressIndicator value={progressPercentage} />

              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={`
                  ${
                    task.completed
                      ? QUICK_CLASH_CLASSES.badgeSuccess
                      : QUICK_CLASH_CLASSES.badgeCyan
                  }
                  flex items-center gap-1 px-2 py-1
                `}
                >
                  {task.completed ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Target className="w-3 h-3" />
                  )}
                  <span>
                    {task.progress} / {task.target}
                  </span>
                </Badge>

                {task.completed && (
                  <Badge
                    className={`
                    ${
                      task.rewardClaimed
                        ? QUICK_CLASH_CLASSES.badgeInfo
                        : QUICK_CLASH_CLASSES.badgeWarning
                    }
                    flex items-center gap-1 px-2 py-1
                  `}
                  >
                    <Gift className="w-3 h-3" />
                    <span>
                      {task.rewardClaimed ? t('Claimed') : t('Unclaimed')}
                    </span>
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator className="mb-5 bg-white/10" />

          {/* Task stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* Difficulty */}
            <div
              className={`
              ${QUICK_CLASH_CLASSES.glassMedium} rounded-lg p-3
              border ${colorMap.yellow.border}
            `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${colorMap.yellow.bg} ${colorMap.yellow.text}
                `}
                >
                  <Star className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className={`${QUICK_CLASH_CLASSES.textMuted} text-sm`}>
                    {t('Difficulty')}
                  </p>
                  <div className="flex mt-1">{difficultyStars}</div>
                </div>
              </div>
            </div>

            {/* Reward */}
            <div
              className={`
              ${QUICK_CLASH_CLASSES.glassMedium} rounded-lg p-3
              border ${colorMap.purple.border}
            `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${colorMap.purple.bg} ${colorMap.purple.text}
                `}
                >
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className={`${QUICK_CLASH_CLASSES.textMuted} text-sm`}>
                    {t('Reward')}
                  </p>
                  <p
                    className={`${QUICK_CLASH_CLASSES.textPrimary} text-lg font-bold`}
                  >
                    {task.reward.xp} XP
                  </p>
                </div>
              </div>
            </div>

            {/* Time */}
            <div
              className={`
              ${QUICK_CLASH_CLASSES.glassMedium} rounded-lg p-3
              border ${taskColors.border}
            `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${taskColors.bg} ${taskColors.text}
                `}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className={`${QUICK_CLASH_CLASSES.textMuted} text-sm`}>
                    {t('Time Remaining')}
                  </p>
                  <p
                    className={`${QUICK_CLASH_CLASSES.textPrimary} font-medium`}
                  >
                    {timeLeft}
                  </p>
                </div>
              </div>
            </div>

            {/* Type */}
            <div
              className={`
              ${QUICK_CLASH_CLASSES.glassMedium} rounded-lg p-3
              border ${taskColors.border}
            `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${taskColors.bg} ${taskColors.text}
                `}
                >
                  <taskTypeDetails.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className={`${QUICK_CLASH_CLASSES.textMuted} text-sm`}>
                    {t('Task Type')}
                  </p>
                  <p
                    className={`${QUICK_CLASH_CLASSES.textPrimary} font-medium`}
                  >
                    {task.taskType
                      .split('_')
                      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
                      .join(' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Task explanation */}
          <div
            className={`
            ${QUICK_CLASH_CLASSES.glassMedium} p-4 rounded-lg mb-5
            border border-white/20
          `}
          >
            <h4
              className={`${QUICK_CLASH_CLASSES.textPrimary} font-medium mb-2`}
            >
              {t('About This Task')}
            </h4>
            <p className={`${QUICK_CLASH_CLASSES.textMuted} text-sm mb-3`}>
              {taskTypeDetails.description}
            </p>

            <div className="flex items-start gap-2 mt-2">
              <Sparkles
                className={`w-4 h-4 ${taskColors.text} mt-0.5 flex-shrink-0`}
              />
              <p className={`${taskColors.text} text-sm font-medium`}>
                {t('Benefit')}: {taskTypeDetails.benefit}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className={`${QUICK_CLASH_CLASSES.textMuted} text-xs`}>
                {t('Created')}
              </p>
              <p className={`${QUICK_CLASH_CLASSES.textBright} text-sm`}>
                {format(createdDate, 'PP')}
              </p>
            </div>

            <div>
              <p className={`${QUICK_CLASH_CLASSES.textMuted} text-xs`}>
                {t('Expires')}
              </p>
              <p className={`${QUICK_CLASH_CLASSES.textBright} text-sm`}>
                {format(expiryDate, 'PP')}
              </p>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter
            className={`
            -mx-6 -mb-6 mt-6 p-6
            ${QUICK_CLASH_CLASSES.glassDark}
            border-t border-white/10
          `}
          >
            {task.completed && !task.rewardClaimed ? (
              <Button
                onClick={handleClaimReward}
                className={`
                  ${QUICK_CLASH_CLASSES.btnWarning}
                  ${QUICK_CLASH_CLASSES.focusRing}
                  ${QUICK_CLASH_CLASSES.transformHover}
                  text-lg px-8 font-medium
                `}
              >
                <Gift className="w-4 h-4 mr-2" />
                {t('Claim {xp} XP', { xp: task.reward.xp })}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={onClose}
                variant="outline"
                className={`
                  ${QUICK_CLASH_CLASSES.glassMedium}
                  border-gray-600 text-gray-300
                  hover:bg-gray-600/20 hover:border-gray-500
                  ${QUICK_CLASH_CLASSES.focusRing}
                  px-6
                `}
              >
                {t('Close')}
              </Button>
            )}
          </DialogFooter>
        </MotionDiv>
      </DialogContent>
    </Dialog>
  )
}

export default React.memo(TaskDetailsModal)
