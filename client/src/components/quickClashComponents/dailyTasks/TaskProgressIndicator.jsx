// components/quickClashComponents/dailyTasks/TaskProgressIndicator.jsx
import React from 'react'
import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Icon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Gift } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

/**
 * A gamified task progress indicator that matches the Quick Clash UI
 * @param {Object} props - Component props
 * @param {Function} props.onViewTasks - Optional callback for when the indicator is clicked
 * @param {string} props.size - Size of the indicator ('sm', 'md', 'lg')
 */
const TaskProgressIndicator = ({ onViewTasks, size = 'md' }) => {
  const { t } = useTranslation('QuickClash')
  const { tasks } = useSelector(state => state.quickClashDailyTasks)

  // Calculate progress
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length || 1 // Prevent division by zero
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100)
  const isComplete = progressPercentage === 100

  // Get count of unclaimed rewards
  const unclaimedRewards = tasks.filter(
    task => task.completed && !task.rewardClaimed,
  ).length

  // Size mappings
  const sizeMap = {
    sm: {
      container: '42px',
      outerContainer: '46px',
      thickness: '4px',
      icon: '18px',
      badge: '18px',
      badgeFont: '10px',
      badgeOffset: '-5px',
    },
    md: {
      container: '48px',
      outerContainer: '56px',
      thickness: '5px',
      icon: '22px',
      badge: '22px',
      badgeFont: '12px',
      badgeOffset: '-8px',
    },
    lg: {
      container: '56px',
      outerContainer: '64px',
      thickness: '6px',
      icon: '26px',
      badge: '24px',
      badgeFont: '14px',
      badgeOffset: '-8px',
    },
  }

  const currentSize = sizeMap[size] || sizeMap.md

  // If there are no tasks, return empty box with same dimensions
  if (totalTasks === 0) {
    return (
      <Box
        width={currentSize.outerContainer}
        height={currentSize.outerContainer}
      />
    )
  }

  // Always use Gift icon regardless of completion status
  const ProgressIcon = Gift

  return (
    <MotionBox
      onClick={onViewTasks}
      cursor={onViewTasks ? 'pointer' : 'default'}
      position="relative"
      height={currentSize.outerContainer}
      width={currentSize.outerContainer}
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
      // Outer container - darker circular background
      borderRadius="full"
      bg="rgba(30, 24, 50, 0.8)"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.4)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      transition="all 0.2s"
      _hover={{
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Inner container with subtle gradient background */}
      <Box
        position="relative"
        height={currentSize.container}
        width={currentSize.container}
        borderRadius="full"
        bgGradient="linear(to-b, rgba(114, 94, 204, 0.2), rgba(70, 58, 126, 0.2))"
        display="flex"
        alignItems="center"
        justifyContent="center"
        border="2px solid rgba(138, 116, 219, 0.3)"
      >
        {/* Progress Circle */}
        <CircularProgress
          value={progressPercentage}
          size={currentSize.container}
          thickness={currentSize.thickness}
          color={isComplete ? '#F7D147' : '#9F7AFA'}
          trackColor="rgba(255, 255, 255, 0.08)"
          capIsRound
        >
          <CircularProgressLabel>
            <Box position="relative">
              <Icon
                as={ProgressIcon}
                color={isComplete ? '#F7D147' : '#9F7AFA'}
                boxSize={currentSize.icon}
              />

              {/* Badge for unclaimed rewards */}
              {unclaimedRewards > 0 && (
                <MotionBox
                  position="absolute"
                  bottom={currentSize.badgeOffset}
                  right={currentSize.badgeOffset}
                  width={currentSize.badge}
                  height={currentSize.badge}
                  borderRadius="full"
                  bgGradient="linear(to-br, #FF5757, #FF2E2E)"
                  color="white"
                  fontSize={currentSize.badgeFont}
                  fontWeight="bold"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 2px 8px rgba(255, 86, 86, 0.6)"
                  border="2px solid rgba(255, 255, 255, 0.7)"
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
                </MotionBox>
              )}
            </Box>
          </CircularProgressLabel>
        </CircularProgress>
      </Box>
    </MotionBox>
  )
}

export default TaskProgressIndicator
