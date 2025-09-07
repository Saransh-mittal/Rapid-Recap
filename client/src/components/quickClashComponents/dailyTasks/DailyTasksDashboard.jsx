// components/quickClashComponents/dailyTasks/DailyTasksDashboard.jsx - FAITHFUL CONVERSION to Tailwind CSS
import React, { useEffect, useCallback, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarClock,
  RefreshCw,
  Clock,
  Award,
  Trophy,
  AlertCircle,
  Check,
  CheckCircle,
  Star,
  Zap,
  Gift,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  fetchDailyTasks,
  refreshDailyTasks,
  fetchTaskStatistics,
  clearJustCompletedTask,
} from '../../../redux/quickClashDailyTasksSlice'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// Import components
import TaskCard from './TaskCard'
import TaskDetailsModal from './TaskDetailsModal'

// You'll need to install these components:
// npx shadcn-ui@latest add tabs
// npx shadcn-ui@latest add button
// npx shadcn-ui@latest add badge
// npx shadcn-ui@latest add separator
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const MotionDiv = motion.div

/**
 * Enhanced Daily Tasks Dashboard - Converted to Tailwind CSS with blue-cyan theme
 *
 * Key improvements in this conversion:
 * - Migrated from Chakra UI to Tailwind CSS + Shadcn/ui
 * - Implemented blue-cyan harmony color scheme
 * - Enhanced glassmorphic effects and animations
 * - Maintained all Redux integration and state management
 * - Improved responsive design with Tailwind utilities
 * - Enhanced accessibility and performance optimizations
 */
const DailyTasksDashboard = () => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()

  // Local state - EXACTLY as original
  const [tabValue, setTabValue] = useState('in-progress')
  const [selectedTask, setSelectedTask] = useState(null)
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false)
  const [showParticles, setShowParticles] = useState(false)

  // Redux state - EXACTLY as original
  const { tasks, tasksLoading, tasksError, justCompletedTaskId, statistics } =
    useSelector(state => state.quickClashDailyTasks)

  // Calculate task statistics - EXACTLY as original
  const taskStats = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.completed).length
    const unclaimedRewards = tasks.filter(
      task => task.completed && !task.rewardClaimed,
    ).length
    const overallProgress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      totalTasks,
      completedTasks,
      unclaimedRewards,
      overallProgress,
      allCompleted: completedTasks === totalTasks && totalTasks > 0,
    }
  }, [tasks])

  // Generate particles for animation effects - EXACTLY as original
  const particles = React.useMemo(() => {
    return Array.from({ length: 15 }, () => ({
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      scale: Math.random() * 0.5 + 0.5,
      duration: Math.random() * 1 + 1,
      delay: Math.random() * 0.5,
    }))
  }, [])

  // ALL ORIGINAL useEffect HOOKS PRESERVED EXACTLY

  // Clear the "just completed" task after a delay
  useEffect(() => {
    if (justCompletedTaskId) {
      const timer = setTimeout(() => {
        dispatch(clearJustCompletedTask())
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [justCompletedTaskId, dispatch])

  // Fetch tasks on component mount
  useEffect(() => {
    if (tasks.length === 0 && !tasksLoading) {
      dispatch(fetchDailyTasks())
      dispatch(fetchTaskStatistics())
    }
  }, [dispatch, tasks.length, tasksLoading])

  // ALL ORIGINAL EVENT HANDLERS PRESERVED EXACTLY

  // Handle task refresh
  const handleRefreshTasks = useCallback(async () => {
    try {
      await dispatch(refreshDailyTasks()).unwrap()
      // Note: Toast functionality would need to be implemented with a toast library
      console.log(t('Tasks Refreshed'))
      // Show particles effect after refresh
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 2000)
    } catch (error) {
      console.error(error || t('Failed to refresh tasks'))
    }
  }, [dispatch, t])

  // Handle task click to show details
  const handleTaskClick = useCallback(task => {
    setSelectedTask(task)
    setIsTaskDetailsOpen(true)
  }, [])

  // Filter tasks based on tab value
  const filteredTasks = useMemo(() => {
    return tabValue === 'in-progress'
      ? tasks.filter(task => !task.completed)
      : tasks.filter(task => task.completed)
  }, [tasks, tabValue])

  // Custom circular progress component
  const CircularProgress = ({
    value,
    size = 120,
    strokeWidth = 8,
    className = '',
  }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (value / 100) * circumference

    return (
      <div
        className={`relative ${className}`}
        style={{ width: size, height: size }}
      >
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
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={taskStats.allCompleted ? '#10B981' : '#06B6D4'}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{value}%</span>
        </div>
      </div>
    )
  }

  // Render loading state
  if (tasksLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
          <p className={`${QUICK_CLASH_CLASSES.textPrimary} font-medium`}>
            {t('Loading your daily tasks...')}
          </p>
        </div>
      </div>
    )
  }

  // Render error state
  if (tasksError && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center space-y-4 max-w-[90%] text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <h3
            className={`text-lg font-bold ${QUICK_CLASH_CLASSES.textPrimary}`}
          >
            {t('Failed to load tasks')}
          </h3>
          <p className="text-red-200">{tasksError}</p>
          <Button
            onClick={() => dispatch(fetchDailyTasks())}
            className={`${QUICK_CLASH_CLASSES.btnDanger} ${QUICK_CLASH_CLASSES.focusRing}`}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('Try Again')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="pt-2 relative"
    >
      {/* Particle effects */}
      <AnimatePresence>
        {showParticles &&
          particles.map((particle, i) => (
            <MotionDiv
              key={i}
              className="fixed top-1/2 left-1/2 z-10 pointer-events-none"
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                x: particle.x + 'vw',
                y: particle.y + 'vh',
                scale: particle.scale,
                opacity: [0, 0.8, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
              }}
            >
              {i % 3 === 0 ? (
                <Sparkles
                  className={`w-${3 + (i % 3)} h-${3 + (i % 3)} ${
                    i % 4 === 0
                      ? 'text-cyan-400'
                      : i % 4 === 1
                      ? 'text-blue-400'
                      : i % 4 === 2
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                />
              ) : i % 3 === 1 ? (
                <Star
                  className={`w-${3 + (i % 3)} h-${3 + (i % 3)} ${
                    i % 4 === 0
                      ? 'text-cyan-400'
                      : i % 4 === 1
                      ? 'text-blue-400'
                      : i % 4 === 2
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                />
              ) : (
                <Zap
                  className={`w-${3 + (i % 3)} h-${3 + (i % 3)} ${
                    i % 4 === 0
                      ? 'text-cyan-400'
                      : i % 4 === 1
                      ? 'text-blue-400'
                      : i % 4 === 2
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                />
              )}
            </MotionDiv>
          ))}
      </AnimatePresence>

      {/* Progress Circle Header */}
      <MotionDiv
        className="flex flex-col items-center justify-center pb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <MotionDiv
          animate={
            justCompletedTaskId
              ? {
                  scale: [1, 1.1, 1],
                  transition: { duration: 0.5 },
                }
              : {}
          }
        >
          <CircularProgress
            value={taskStats.overallProgress}
            className="mb-2"
          />
        </MotionDiv>

        <MotionDiv
          className="flex items-center gap-2 mt-2"
          animate={
            taskStats.allCompleted
              ? {
                  scale: [1, 1.05, 1],
                  transition: { repeat: Infinity, duration: 2 },
                }
              : {}
          }
        >
          {taskStats.allCompleted ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <Clock className="w-4 h-4 text-cyan-400" />
          )}
          <span className={`${QUICK_CLASH_CLASSES.textPrimary} font-semibold`}>
            {taskStats.completedTasks}/{taskStats.totalTasks} {t('Tasks')}
          </span>
        </MotionDiv>
      </MotionDiv>

      {/* Stats Cards */}
      <div className="flex justify-between px-1 mb-6 gap-2">
        {/* XP Earned */}
        <MotionDiv
          className={`
            ${QUICK_CLASH_CLASSES.glassMedium} p-3 rounded-xl
            border border-yellow-700 flex-1
            ${QUICK_CLASH_CLASSES.shadowSoft}
            backdrop-brightness-110
          `}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center mb-1">
            <Award className="w-5 h-5 text-yellow-400 mr-2" />
            <span
              className={`text-sm font-medium ${QUICK_CLASH_CLASSES.textPrimary}`}
            >
              {t('XP Earned')}
            </span>
          </div>
          <div className="text-2xl font-bold text-yellow-300 text-center">
            {statistics?.rewards?.xp || 0}
          </div>
        </MotionDiv>

        {/* Tasks with rewards to claim */}
        {taskStats.unclaimedRewards > 0 ? (
          <MotionDiv
            className={`
              ${QUICK_CLASH_CLASSES.glassMedium} p-3 rounded-xl
              border border-cyan-700 flex-1
              ${QUICK_CLASH_CLASSES.shadowCyan}
              backdrop-brightness-110
            `}
            initial={{ opacity: 0, x: 10 }}
            animate={{
              opacity: 1,
              x: 0,
              boxShadow: [
                '0 0 0px rgba(6, 182, 212, 0)',
                '0 0 10px rgba(6, 182, 212, 0.5)',
                '0 0 0px rgba(6, 182, 212, 0)',
              ],
            }}
            transition={{
              duration: 0.4,
              delay: 0.2,
              boxShadow: {
                repeat: Infinity,
                duration: 2,
              },
            }}
          >
            <div className="flex items-center mb-1">
              <Gift className="w-5 h-5 text-cyan-400 mr-2" />
              <span
                className={`text-sm font-medium ${QUICK_CLASH_CLASSES.textPrimary}`}
              >
                {t('Unclaimed')}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MotionDiv
                animate={{
                  scale: [1, 1.1, 1],
                  transition: { repeat: Infinity, duration: 1.5 },
                }}
              >
                <Badge
                  className={`
                    ${QUICK_CLASH_CLASSES.badgeCyan}
                    text-lg font-bold px-2 py-1
                  `}
                >
                  {taskStats.unclaimedRewards}
                </Badge>
              </MotionDiv>
              <span className="text-cyan-200 text-base">{t('Rewards')}</span>
            </div>
          </MotionDiv>
        ) : (
          <MotionDiv
            className={`
              ${QUICK_CLASH_CLASSES.glassMedium} p-3 rounded-xl
              border border-blue-700 flex-1
              ${QUICK_CLASH_CLASSES.shadowBlue}
              backdrop-brightness-110
            `}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center mb-1">
              <Zap className="w-5 h-5 text-blue-400 mr-2" />
              <span
                className={`text-sm font-medium ${QUICK_CLASH_CLASSES.textPrimary}`}
              >
                {t('Streak')}
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-300 text-center">
              {statistics?.streak || 0}
            </div>
          </MotionDiv>
        )}
      </div>

      {/* Refresh Button */}
      <div className="mb-4 text-center">
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Button
            onClick={handleRefreshTasks}
            disabled={tasksLoading}
            variant="outline"
            size="sm"
            className={`
              ${QUICK_CLASH_CLASSES.glassMedium}
              border-cyan-500/40 text-cyan-300
              hover:bg-cyan-500/10 hover:border-cyan-400/60
              ${QUICK_CLASH_CLASSES.focusRing}
              ${QUICK_CLASH_CLASSES.transformHover}
              transition-all duration-200
            `}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${tasksLoading ? 'animate-spin' : ''}`}
            />
            {t('Refresh Tasks')}
          </Button>
        </MotionDiv>
      </div>

      {/* Enhanced Tasks Section */}
      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList
            className={`
              inline-flex items-center justify-center rounded-full p-1 h-12
              ${QUICK_CLASH_CLASSES.glassMedium}
              border border-white/15 shadow-xl
              backdrop-brightness-110
              w-full max-w-md
            `}
          >
            <TabsTrigger
              value="in-progress"
              className={`
                flex items-center justify-center gap-2 px-6 py-2 rounded-full
                text-sm font-medium whitespace-nowrap min-w-0 flex-1
                data-[state=active]:bg-cyan-500 data-[state=active]:text-white
                data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25
                data-[state=inactive]:text-white/70 data-[state=inactive]:hover:text-white
                data-[state=inactive]:hover:bg-white/5
                transition-all duration-300 ease-out
                border-0 h-10
              `}
            >
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t('In Progress')}</span>
              <span className="sm:hidden">{t('Active')}</span>
              {tasks.filter(task => !task.completed).length > 0 && (
                <Badge className="bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold ml-1 px-1.5">
                  {tasks.filter(task => !task.completed).length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="done"
              className={`
                flex items-center justify-center gap-2 px-6 py-2 rounded-full
                text-sm font-medium whitespace-nowrap min-w-0 flex-1
                data-[state=active]:bg-green-500 data-[state=active]:text-white
                data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/25
                data-[state=inactive]:text-white/70 data-[state=inactive]:hover:text-white
                data-[state=inactive]:hover:bg-white/5
                transition-all duration-300 ease-out
                border-0 h-10
              `}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{t('Done')}</span>
              {tasks.filter(task => task.completed).length > 0 && (
                <Badge className="bg-green-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold ml-1 px-1.5">
                  {tasks.filter(task => task.completed).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* In Progress Tasks */}
        <TabsContent value="in-progress" className="px-0">
          <AnimatePresence>
            {filteredTasks.length > 0 ? (
              <div className="flex flex-col space-y-3">
                {filteredTasks.map((task, index) => (
                  <MotionDiv
                    key={task._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <TaskCard
                      task={task}
                      isJustCompleted={task._id === justCompletedTaskId}
                      onClick={() => handleTaskClick(task)}
                    />
                  </MotionDiv>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Clock}
                title={t('No Tasks In Progress')}
                description={t(
                  "Looks like you've completed all your tasks! Check the completed tab or refresh to get new tasks.",
                )}
                buttonText={t('Refresh Tasks')}
                buttonIcon={RefreshCw}
                onButtonClick={handleRefreshTasks}
                isLoading={tasksLoading}
                variant="blue"
              />
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Completed Tasks */}
        <TabsContent value="done" className="px-0">
          <AnimatePresence>
            {filteredTasks.length > 0 ? (
              <div className="flex flex-col space-y-3">
                {filteredTasks.map((task, index) => (
                  <MotionDiv
                    key={task._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <TaskCard
                      task={task}
                      isJustCompleted={task._id === justCompletedTaskId}
                      onClick={() => handleTaskClick(task)}
                    />
                  </MotionDiv>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle}
                title={t('No Completed Tasks')}
                description={t(
                  "You haven't completed any tasks yet. Start completing tasks to see them here!",
                )}
                variant="green"
              />
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={isTaskDetailsOpen}
        onClose={() => setIsTaskDetailsOpen(false)}
        task={selectedTask}
      />

      {/* Error State */}
      {tasksError && tasks.length > 0 && (
        <MotionDiv
          className={`
            p-4 mt-4 rounded-lg border
            ${QUICK_CLASH_CLASSES.glassMedium}
            border-red-300 text-white
          `}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span>{tasksError}</span>
          </div>
          <Button
            className={`mt-2 ${QUICK_CLASH_CLASSES.btnDanger} text-sm`}
            onClick={() => dispatch(fetchDailyTasks())}
          >
            {t('Try Again')}
          </Button>
        </MotionDiv>
      )}
    </MotionDiv>
  )
}

// Enhanced Empty state component with blue-cyan theme
const EmptyState = ({
  icon: IconComponent,
  title,
  description,
  buttonText,
  buttonIcon: ButtonIcon,
  onButtonClick,
  isLoading,
  variant = 'blue',
}) => {
  const colorMap = {
    blue: {
      iconBg: 'bg-blue-900',
      iconColor: 'text-blue-300',
      button: QUICK_CLASH_CLASSES.btnSecondary,
    },
    green: {
      iconBg: 'bg-green-900',
      iconColor: 'text-green-300',
      button: QUICK_CLASH_CLASSES.btnSuccess,
    },
    cyan: {
      iconBg: 'bg-cyan-900',
      iconColor: 'text-cyan-300',
      button: QUICK_CLASH_CLASSES.btnPrimary,
    },
  }

  const colors = colorMap[variant] || colorMap.blue

  return (
    <div className="flex justify-center py-8">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`
          p-6 max-w-md text-center
          ${QUICK_CLASH_CLASSES.glassMedium}
          rounded-2xl border border-white/20
          ${QUICK_CLASH_CLASSES.shadowSoft}
          backdrop-brightness-110
        `}
      >
        <div className="flex flex-col items-center space-y-4">
          <MotionDiv
            className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${colors.iconBg} ${colors.iconColor}
            `}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [-5, 0, 5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <IconComponent className="w-6 h-6" />
          </MotionDiv>

          <h3
            className={`text-lg font-bold ${QUICK_CLASH_CLASSES.textPrimary}`}
          >
            {title}
          </h3>

          <p className={`${QUICK_CLASH_CLASSES.textMuted} text-sm`}>
            {description}
          </p>

          {buttonText && onButtonClick && (
            <Button
              onClick={onButtonClick}
              disabled={isLoading}
              className={`
                ${colors.button} mt-2
                ${QUICK_CLASH_CLASSES.focusRing}
                ${QUICK_CLASH_CLASSES.transformHover}
              `}
            >
              {ButtonIcon && <ButtonIcon className="w-4 h-4 mr-2" />}
              {buttonText}
            </Button>
          )}
        </div>
      </MotionDiv>
    </div>
  )
}

export default DailyTasksDashboard
