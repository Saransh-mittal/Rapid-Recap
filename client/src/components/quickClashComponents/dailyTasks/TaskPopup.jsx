// components/quickClashComponents/dailyTasks/TaskPopup.jsx - FAITHFUL CONVERSION to Tailwind with Blue-Cyan Color Scheme
import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronUp,
  CheckCircle,
  Target,
  Clock,
  Trophy,
  Gift,
  Zap,
  Layout,
  Award,
  X,
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  fetchDailyTasks,
  claimTaskReward,
} from '../../../redux/quickClashDailyTasksSlice'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'

// Import RewardAnimation (assuming it exists)
import RewardAnimation from './RewardAnimation'

const MotionDiv = motion.div
const MotionButton = motion.button
const MotionSpan = motion.span

// Custom Portal Component
const Portal = ({ children }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return document.body ? createPortal(children, document.body) : null
}

// Custom Toast Hook (simplified)
const useToast = () => {
  const showToast = useCallback(
    ({ title, description, status, duration = 3000 }) => {
      // Simple console log implementation - in a real app you'd implement actual toast
      console.log(`Toast: ${title} - ${description} (${status})`)

      // You could implement a real toast system here
      // For now, this is just a placeholder
    },
    [],
  )

  return { toast: showToast }
}

// Collapse Component
const Collapse = ({ in: isOpen, children, className = '' }) => {
  return (
    <div
      className={`overflow-hidden transition-all duration-200 ease-out ${className}`}
      style={{
        maxHeight: isOpen ? '1000px' : '0px',
        opacity: isOpen ? 1 : 0,
      }}
    >
      {children}
    </div>
  )
}

// Progress Component
const Progress = ({ value, className = '', size = 'xs' }) => {
  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }

  return (
    <div
      className={`w-full bg-white/20 rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      <div
        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

// Task item component for completed tasks - EXACTLY as original logic
const CompletedTaskItem = memo(
  ({
    task,
    index,
    expandedTask,
    justCompletedTaskId,
    claimLoading,
    claimingTaskId,
    onToggleExpand,
    onClaimReward,
  }) => {
    const { t } = useTranslation('QuickClash')

    return (
      <MotionDiv
        key={task._id}
        className={`
          p-2 rounded-md border cursor-pointer transition-all duration-200
          ${task._id === justCompletedTaskId ? 'opacity-100' : 'opacity-80'}
          bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-green-700
          ${
            task._id === justCompletedTaskId
              ? 'shadow-lg shadow-green-500/20'
              : ''
          }
        `}
        initial={{ opacity: 0, x: 20 }}
        animate={{
          opacity: task._id === justCompletedTaskId ? 1 : 0.8,
          x: 0,
        }}
        transition={{ delay: 0.1 * index, duration: 0.3 }}
        onClick={() => onToggleExpand(task._id)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MotionDiv
              animate={
                task._id === justCompletedTaskId
                  ? {
                      rotate: [0, 10, 0, -10, 0],
                      transition: { repeat: 2, duration: 0.5 },
                    }
                  : {}
              }
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
            </MotionDiv>
            <span
              className={`${QUICK_CLASH_CLASSES.textPrimary} text-sm truncate`}
            >
              {task.title}
            </span>
          </div>

          {!task.rewardClaimed && (
            <div className="flex">
              <MotionButton
                onClick={e => {
                  e.stopPropagation()
                  onClaimReward(task._id, e)
                }}
                disabled={claimLoading && claimingTaskId === task._id}
                className={`
                  flex items-center justify-center w-7 h-7 rounded-full
                  ${QUICK_CLASH_CLASSES.btnWarning} hover:shadow-lg hover:shadow-orange-500/30
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 ml-2
                `}
                whileHover={{
                  scale: 1.1,
                  boxShadow: '0 0 10px rgba(236, 201, 75, 0.7)',
                }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'linear-gradient(to right, #F59E0B, #EA580C)',
                  boxShadow: '0 0 5px rgba(236, 201, 75, 0.5)',
                }}
              >
                {claimLoading && claimingTaskId === task._id ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Gift className="w-4 h-4" />
                )}
              </MotionButton>
            </div>
          )}
        </div>

        {/* Task description - expandable */}
        <Collapse in={expandedTask === task._id}>
          <p className={`${QUICK_CLASH_CLASSES.textMuted} text-xs mt-1`}>
            {task.description}
          </p>
          {!task.rewardClaimed && (
            <div className="flex items-center gap-1 mt-2">
              <Award className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-300 text-xs font-medium">
                {task.reward.xp} XP {t('reward available')}
              </span>
            </div>
          )}
        </Collapse>
      </MotionDiv>
    )
  },
)

CompletedTaskItem.displayName = 'CompletedTaskItem'

// Task item component for incomplete tasks - EXACTLY as original logic
const IncompleteTaskItem = memo(
  ({ task, index, expandedTask, onToggleExpand }) => {
    return (
      <MotionDiv
        key={task._id}
        className={`
          p-2 rounded-md cursor-pointer transition-all duration-200
          ${QUICK_CLASH_CLASSES.glassLight} border border-white/10
          hover:border-white/30 hover:bg-white/10
        `}
        onClick={() => onToggleExpand(task._id)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 * index, duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-1">
          <span
            className={`${QUICK_CLASH_CLASSES.textPrimary} text-sm truncate`}
          >
            {task.title}
          </span>

          <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-500/30">
            {task.progress}/{task.target}
          </span>
        </div>

        {/* Task description - expandable */}
        <Collapse in={expandedTask === task._id}>
          <p className={`${QUICK_CLASH_CLASSES.textMuted} text-xs mb-2`}>
            {task.description}
          </p>
        </Collapse>

        <Progress
          value={(task.progress / task.target) * 100}
          className="mt-1 bg-white/20"
        />
      </MotionDiv>
    )
  },
)

IncompleteTaskItem.displayName = 'IncompleteTaskItem'

// Next task component - EXACTLY as original logic
const NextTaskItem = memo(({ task, expandedTask, onToggleExpand }) => {
  return (
    <MotionDiv
      className={`
        p-3 rounded-md cursor-pointer transition-all duration-200
        ${QUICK_CLASH_CLASSES.glassMedium} border border-blue-800
        shadow-lg shadow-black/20 hover:border-blue-700 hover:shadow-xl hover:shadow-black/30
      `}
      style={{
        background:
          'linear-gradient(to bottom, rgba(59, 130, 246, 0.1), rgba(30, 41, 59, 0.2))',
      }}
      onClick={() => onToggleExpand(task._id)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-white text-sm font-medium truncate">
          {task.title}
        </span>

        <MotionSpan
          className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-500/30"
          animate={
            task.progress > 0 && task.progress < task.target
              ? {
                  scale: [1, 1.1, 1],
                  transition: {
                    repeat: Infinity,
                    repeatType: 'reverse',
                    duration: 2,
                  },
                }
              : {}
          }
        >
          {task.progress}/{task.target}
        </MotionSpan>
      </div>

      {/* Task description - expandable */}
      <Collapse in={expandedTask === task._id}>
        <p className={`${QUICK_CLASH_CLASSES.textMuted} text-xs mb-2`}>
          {task.description}
        </p>
      </Collapse>

      <MotionDiv
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.5 }}
        className="mt-2"
      >
        <Progress
          value={(task.progress / task.target) * 100}
          className="bg-white/20"
        />
      </MotionDiv>
    </MotionDiv>
  )
})

NextTaskItem.displayName = 'NextTaskItem'

// Main component - EXACTLY as original logic with Tailwind styling
const TaskPopup = ({ onViewAllTasks, isOpen, onClose }) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const { toast } = useToast()

  const [isExpanded, setIsExpanded] = useState(false)
  const [showPopup, setShowPopup] = useState(true)
  const [expandedTask, setExpandedTask] = useState(null)
  const [claimLoading, setClaimLoading] = useState(false)
  const [showRewardAnimation, setShowRewardAnimation] = useState(false)
  const [rewardAmount, setRewardAmount] = useState({ xp: 0 })
  const [claimingTaskId, setClaimingTaskId] = useState(null)

  // Select tasks from Redux store - EXACTLY as original
  const { tasks, tasksLoading, justCompletedTaskId } = useSelector(
    state => state.quickClashDailyTasks,
  )

  // Memoized computed values - EXACTLY as original
  const {
    incompleteTasks,
    completedTasks,
    progressPercentage,
    totalTasks,
    completedCount,
    shouldShowCompleted,
  } = useMemo(() => {
    // Filter incomplete and completed tasks
    const incompleteTasksList = tasks.filter(task => !task.completed)
    const completedTasksList = tasks.filter(task => task.completed)

    // Calculate overall progress
    const totalTasksCount = tasks.length
    const completedTasksCount = completedTasksList.length
    const progress =
      totalTasksCount > 0
        ? Math.round((completedTasksCount / totalTasksCount) * 100)
        : 0

    // Determine if all tasks are completed and no task was just completed
    const shouldHideCompleted =
      completedTasksCount === totalTasksCount && !justCompletedTaskId

    return {
      incompleteTasks: incompleteTasksList,
      completedTasks: completedTasksList,
      progressPercentage: progress,
      totalTasks: totalTasksCount,
      completedCount: completedTasksCount,
      shouldShowCompleted: shouldHideCompleted,
    }
  }, [tasks, justCompletedTaskId])

  // ALL ORIGINAL EFFECTS AND HANDLERS PRESERVED EXACTLY
  useEffect(() => {
    if (tasks.length === 0 && !tasksLoading) {
      dispatch(fetchDailyTasks())
    }
  }, [dispatch, tasks.length, tasksLoading])

  const handleViewAllTasks = useCallback(() => {
    if (onViewAllTasks) {
      onViewAllTasks()
    }
    setShowPopup(false)
  }, [onViewAllTasks])

  const toggleTaskExpansion = useCallback(taskId => {
    setExpandedTask(prev => (prev === taskId ? null : taskId))
  }, [])

  const handleClaimReward = useCallback(
    async (taskId, e) => {
      e.stopPropagation()
      if (claimLoading) return

      setClaimingTaskId(taskId)
      try {
        setClaimLoading(true)
        const result = await dispatch(claimTaskReward(taskId)).unwrap()

        // Show reward animation
        setRewardAmount(result.reward)
        setShowRewardAnimation(true)

        toast({
          title: t('Reward Claimed!'),
          description: t('You received {xp} XP', {
            xp: result.reward.xp,
          }),
          status: 'success',
          duration: 3000,
        })
      } catch (error) {
        toast({
          title: t('Error'),
          description: error || t('Failed to claim reward'),
          status: 'error',
          duration: 3000,
        })
      } finally {
        setClaimLoading(false)
      }
    },
    [claimLoading, dispatch, toast, t],
  )

  const handleRewardAnimationComplete = useCallback(() => {
    setShowRewardAnimation(false)
    setClaimingTaskId(null)
  }, [])

  // If there are no tasks, don't render the popup - EXACTLY as original
  if (tasks.length === 0) {
    return null
  }

  // Display minimized button if popup is hidden or all tasks completed - EXACTLY as original
  if (!isOpen || (shouldShowCompleted && !isExpanded)) {
    return null
  }

  return (
    <Portal>
      <AnimatePresence>
        <MotionDiv
          className={`
            fixed bottom-5 right-5 z-[1000] overflow-hidden rounded-xl border
            w-[calc(100%-40px)] md:w-[350px] ${QUICK_CLASH_CLASSES.glassMedium}
            backdrop-blur-[10px] shadow-2xl shadow-black/40 border-cyan-500/50
          `}
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
          }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300,
          }}
        >
          {/* Background decorative elements */}
          <div
            className="absolute -top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full opacity-10 blur-[40px] z-0"
            style={{ background: '#0891B2' }}
          />

          <div
            className="absolute -bottom-[10%] -left-[10%] w-[30%] h-[30%] rounded-full opacity-10 blur-[30px] z-0"
            style={{ background: '#0EA5E9' }}
          />

          {/* Header with progress */}
          <MotionDiv
            className="px-4 pt-3 pb-2 border-b relative z-10"
            style={{
              background:
                'linear-gradient(to right, rgba(6, 182, 212, 0.2), rgba(30, 58, 138, 0.2))',
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MotionDiv
                  animate={{
                    rotate: [-5, 5],
                    transition: {
                      repeat: Infinity,
                      repeatType: 'reverse',
                      duration: 1.5,
                    },
                  }}
                >
                  <Target className="w-5 h-5 text-cyan-400" />
                </MotionDiv>
                <h3 className="text-white font-bold text-sm">
                  {t('Daily Tasks')}
                </h3>

                {/* Progress badge */}
                <MotionSpan
                  className={`
                    ml-2 px-2 py-0.5 rounded text-xs font-medium
                    ${
                      progressPercentage === 100
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }
                  `}
                  animate={
                    justCompletedTaskId
                      ? { scale: [1, 1.3, 1], rotate: [0, 5, 0] }
                      : progressPercentage === 100
                      ? {
                          boxShadow: [
                            '0 0 0px rgba(34, 197, 94, 0)',
                            '0 0 10px rgba(34, 197, 94, 0.7)',
                            '0 0 0px rgba(34, 197, 94, 0)',
                          ],
                          transition: { repeat: Infinity, duration: 2 },
                        }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  {progressPercentage}%
                </MotionSpan>
              </div>

              <div className="flex items-center gap-1">
                <MotionButton
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 rounded hover:bg-white/10 text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MotionDiv
                    animate={
                      isExpanded
                        ? { rotate: 180, transition: { duration: 0.3 } }
                        : { rotate: 0, transition: { duration: 0.3 } }
                    }
                  >
                    <ChevronUp className="w-4 h-4" />
                  </MotionDiv>
                </MotionButton>

                <button
                  onClick={() => { quizAudioService.playDismiss(); onClose() }}
                  className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </MotionDiv>

          {/* Progress bar */}
          <Progress
            value={progressPercentage}
            className="h-1"
            style={{
              background:
                progressPercentage === 100
                  ? 'linear-gradient(to right, #10B981, #14B8A6)'
                  : 'linear-gradient(to right, #06B6D4, #EC4899)',
            }}
          />

          {/* Summary section - always visible */}
          <div className="p-3 relative z-10">
            <div className="flex justify-between items-center mb-2">
              <MotionSpan
                className={`${QUICK_CLASH_CLASSES.textSecondary} text-sm font-medium`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {incompleteTasks.length > 0
                  ? `${incompleteTasks.length} ` + t('tasks remaining')
                  : t('All tasks completed!')}
              </MotionSpan>

              <MotionSpan
                className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded border border-green-500/30"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {completedCount}/{totalTasks}
              </MotionSpan>
            </div>

            {/* Next task to complete (if any) */}
            {incompleteTasks.length > 0 && (
              <>
                <div className="flex items-center gap-1 mb-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-300 text-xs font-medium">
                    {t('Next task')}:
                  </span>
                </div>
                <NextTaskItem
                  task={incompleteTasks[0]}
                  expandedTask={expandedTask}
                  onToggleExpand={toggleTaskExpansion}
                />
              </>
            )}
          </div>

          {/* Expandable section with all in-progress tasks */}
          <Collapse
            in={isExpanded}
            className="max-h-[300px] overflow-y-auto relative z-10"
          >
            <div
              className="p-3"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
              }}
            >
              {incompleteTasks.length > 1 && (
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-300 text-xs font-medium">
                      {t('In progress')}:
                    </span>
                  </div>

                  {incompleteTasks.slice(1).map((task, index) => (
                    <IncompleteTaskItem
                      key={task._id}
                      task={task}
                      index={index}
                      expandedTask={expandedTask}
                      onToggleExpand={toggleTaskExpansion}
                    />
                  ))}
                </div>
              )}

              {/* Recently completed tasks */}
              {completedTasks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-green-300 text-xs font-medium">
                      {t('Completed')}:
                    </span>
                  </div>

                  {completedTasks.slice(0, 3).map((task, index) => (
                    <CompletedTaskItem
                      key={task._id}
                      task={task}
                      index={index}
                      expandedTask={expandedTask}
                      justCompletedTaskId={justCompletedTaskId}
                      claimLoading={claimLoading}
                      claimingTaskId={claimingTaskId}
                      onToggleExpand={toggleTaskExpansion}
                      onClaimReward={handleClaimReward}
                    />
                  ))}

                  {completedTasks.length > 3 && (
                    <p
                      className={`${QUICK_CLASH_CLASSES.textMuted} text-xs text-center`}
                    >
                      {t('And {count} more completed tasks', {
                        count: completedTasks.length - 3,
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="h-px bg-white/20" />

            {/* Footer with view all button */}
            <div className="flex justify-center p-3 relative z-10">
              <MotionButton
                onClick={handleViewAllTasks}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                  ${QUICK_CLASH_CLASSES.btnPrimary} hover:shadow-lg hover:shadow-cyan-500/30
                  transition-all duration-200
                `}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 15px rgba(6, 182, 212, 0.5)',
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                style={{
                  background: 'linear-gradient(to right, #06B6D4, #EC4899)',
                }}
              >
                <Layout className="w-4 h-4" />
                {t('View All Tasks')}
                <Trophy className="w-4 h-4" />
              </MotionButton>
            </div>
          </Collapse>

          {/* Reward animation */}
          {showRewardAnimation && (
            <Portal>
              <RewardAnimation
                xp={rewardAmount.xp}
                onComplete={handleRewardAnimationComplete}
              />
            </Portal>
          )}
        </MotionDiv>
      </AnimatePresence>
    </Portal>
  )
}

export default memo(TaskPopup)
