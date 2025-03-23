// components/quickClashComponents/dailyTasks/TaskProgressIndicator.jsx
import React from 'react'
import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
  Icon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Gift } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

/**
 * A compact task progress indicator that matches the Quick Clash UI
 */
const TaskProgressIndicator = ({ onViewTasks }) => {
  const { t } = useTranslation('QuickClash')

  const { tasks } = useSelector(state => state.quickClashDailyTasks)

  // Calculate progress
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length || 1 // Prevent division by zero
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100)

  // Get count of unclaimed rewards
  const unclaimedRewards = tasks.filter(
    task => task.completed && !task.rewardClaimed,
  ).length

  // If there are no tasks, return empty box
  if (totalTasks === 0) {
    return null
  }

  // Determine tooltip content
  const getTooltipContent = () => {
    if (unclaimedRewards > 0) {
      return `${unclaimedRewards} ${t(
        'rewards to claim',
      )} - ${completedTasks}/${totalTasks} ${t('tasks')}`
    } else {
      return `${completedTasks}/${totalTasks} ${t('daily tasks completed')}`
    }
  }

  return (
    <Tooltip
      label={getTooltipContent()}
      placement="bottom"
      hasArrow
      bg="gray.800"
      color="white"
      borderRadius="md"
    >
      <MotionBox
        onClick={onViewTasks}
        cursor="pointer"
        position="relative"
        h="44px"
        w="44px"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Progress Circle */}
        <CircularProgress
          value={progressPercentage}
          size="44px"
          thickness="2.5px"
          color="#F7D147" // Gold color to match UI
          trackColor="rgba(255, 255, 255, 0.1)"
          capIsRound
        >
          <CircularProgressLabel>
            <Box position="relative">
              <Icon as={Gift} color="#F7D147" boxSize="18px" />
              {unclaimedRewards > 0 && (
                <Box
                  position="absolute"
                  bottom="-4px"
                  right="-4px"
                  fontSize="11px"
                  fontWeight="bold"
                  color="#F7D147"
                >
                  {unclaimedRewards}
                </Box>
              )}
            </Box>
          </CircularProgressLabel>
        </CircularProgress>
      </MotionBox>
    </Tooltip>
  )
}

export default TaskProgressIndicator
