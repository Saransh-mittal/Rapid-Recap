// components/quickClashComponents/dailyTasks/TaskProgressIndicator.jsx - FAITHFUL CONVERSION to Tailwind with Blue-Cyan Color Scheme
import { motion } from 'framer-motion'
import { Gift } from 'lucide-react'
import { useSelector } from 'react-redux'
import { DAILY_TASKS_ENABLED } from '../../../utils/featureFlags'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'

const MotionDiv = motion.div

// Custom Circular Progress Component
const CircularProgress = ({ value, size, thickness, children, className }) => {
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
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
        style={{ filter: 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.3))' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={thickness}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={value === 100 ? '#F59E0B' : '#06B6D4'}
          strokeWidth={thickness}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

/**
 * A gamified task progress indicator that matches the Quick Clash UI with cyan/blue theme
 * @param {Object} props - Component props
 * @param {Function} props.onViewTasks - Optional callback for when the indicator is clicked
 * @param {string} props.size - Size of the indicator ('sm', 'md', 'lg')
 */
const TaskProgressIndicator = ({ onViewTasks, size = 'md' }) => {
  const { tasks } = useSelector(state => state.quickClashDailyTasks)

  if (!DAILY_TASKS_ENABLED) {
    return null
  }

  // Calculate progress - EXACTLY as original
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length || 1 // Prevent division by zero
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100)
  const isComplete = progressPercentage === 100

  // Get count of unclaimed rewards - EXACTLY as original
  const unclaimedRewards = tasks.filter(
    task => task.completed && !task.rewardClaimed,
  ).length

  // Size mappings - Optimized for header uniformity
  const sizeMap = {
    sm: {
      container: 36,
      outerContainer: 40,
      thickness: 3,
      icon: 16,
      badge: 16,
      badgeFont: 9,
      badgeOffset: -4,
    },
    md: {
      container: 40,
      outerContainer: 46,
      thickness: 4,
      icon: 18,
      badge: 18,
      badgeFont: 10,
      badgeOffset: -6,
    },
    lg: {
      container: 48,
      outerContainer: 56,
      thickness: 5,
      icon: 22,
      badge: 20,
      badgeFont: 12,
      badgeOffset: -7,
    },
  }

  const currentSize = sizeMap[size] || sizeMap.md

  // If there are no tasks, return empty box with same dimensions - EXACTLY as original
  if (totalTasks === 0) {
    return (
      <div
        style={{
          width: currentSize.outerContainer,
          height: currentSize.outerContainer,
        }}
      />
    )
  }

  return (
    <MotionDiv
      onClick={() => { quizAudioService.playButtonClick(); onViewTasks && onViewTasks() }}
      className={`
        relative ${onViewTasks ? 'cursor-pointer' : 'cursor-default'}
        rounded-full flex items-center justify-center transition-all duration-200
        ${QUICK_CLASH_CLASSES.glassMedium} backdrop-blur-[12px]
        shadow-lg shadow-black/40 hover:shadow-xl hover:shadow-black/50
      `}
      style={{
        height: currentSize.outerContainer,
        width: currentSize.outerContainer,
        background: 'rgba(30, 24, 50, 0.8)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={
        onViewTasks
          ? {
              scale: 1.08,
              transition: { duration: 0.2 },
            }
          : {}
      }
      whileTap={onViewTasks ? { scale: 0.95 } : {}}
    >
      {/* Inner container with subtle gradient background */}
      <div
        className="relative rounded-full flex items-center justify-center border-2"
        style={{
          height: currentSize.container,
          width: currentSize.container,
          background:
            'linear-gradient(to bottom, rgba(6, 182, 212, 0.2), rgba(14, 165, 233, 0.2))',
          borderColor: 'rgba(6, 182, 212, 0.3)',
        }}
      >
        {/* Progress Circle */}
        <CircularProgress
          value={progressPercentage}
          size={currentSize.container}
          thickness={currentSize.thickness}
        >
          <div className="relative">
            <Gift
              className={`${isComplete ? 'text-orange-400' : 'text-cyan-400'}`}
              style={{ width: currentSize.icon, height: currentSize.icon }}
            />

            {/* Badge for unclaimed rewards */}
            {unclaimedRewards > 0 && (
              <MotionDiv
                className="absolute flex items-center justify-center rounded-full text-white font-bold border-2 border-white/70"
                style={{
                  bottom: currentSize.badgeOffset,
                  right: currentSize.badgeOffset,
                  width: currentSize.badge,
                  height: currentSize.badge,
                  fontSize: currentSize.badgeFont,
                  background:
                    'linear-gradient(to bottom right, #EF4444, #DC2626)',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.6)',
                }}
                initial={{ scale: 0 }}
                animate={{
                  scale: [1, 1.15, 1],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  },
                }}
              >
                {unclaimedRewards}
              </MotionDiv>
            )}
          </div>
        </CircularProgress>
      </div>
    </MotionDiv>
  )
}

export default TaskProgressIndicator
