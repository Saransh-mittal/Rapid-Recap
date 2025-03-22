// components/quickClashComponents/dailyTasks/TaskProgressIndicator.jsx
import React, { useEffect } from 'react'
import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
  Badge,
  HStack,
  Text,
  Icon,
  useDisclosure,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, CheckCircle, Award, Calendar } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import TaskPopup from './TaskPopup'

const MotionBox = motion(Box)
const MotionCircularProgress = motion(CircularProgress)
const MotionCircularProgressLabel = motion(CircularProgressLabel)

/**
 * A circular progress indicator that shows daily task completion progress
 * Can be placed in header areas throughout the app
 */
const TaskProgressIndicator = ({ onViewTasks, size = 'md' }) => {
  const { t } = useTranslation('QuickClash')

  const { tasks, justCompletedTaskId } = useSelector(
    state => state.quickClashDailyTasks,
  )

  // Calculate progress
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length || 1 // Prevent division by zero
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100)

  // Determine if all tasks are completed
  const allCompleted = completedTasks === totalTasks && totalTasks > 0

  // Get count of unclaimed rewards
  const unclaimedRewards = tasks.filter(
    task => task.completed && !task.rewardClaimed,
  ).length

  // Check if a task was just completed
  const taskJustCompleted = !!justCompletedTaskId

  // Size mappings
  const sizeMap = {
    sm: {
      size: 45,
      thickness: 3,
      fontSize: 'md',
      iconSize: 5,
    },
    md: {
      size: 60,
      thickness: 4,
      fontSize: 'xl',
      iconSize: 7,
    },
    lg: {
      size: 80,
      thickness: 5,
      fontSize: '2xl',
      iconSize: 10,
    },
  }

  // Get settings based on size
  const settings = sizeMap[size] || sizeMap.md

  // If there are no tasks, return empty box
  if (totalTasks === 0) {
    return <Box w={settings.size} h={settings.size} />
  }

  return (
    <>
      <Tooltip
        label={
          allCompleted
            ? t('All tasks completed!')
            : `${completedTasks}/${totalTasks} ` + t('tasks completed')
        }
        placement="bottom"
        hasArrow
      >
        <MotionBox
          onClick={onViewTasks}
          cursor="pointer"
          position="relative"
          _hover={{ transform: 'scale(1.05)' }}
          transition="all 0.2s"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Main circular progress */}
          <MotionCircularProgress
            value={progressPercentage}
            size={settings.size}
            thickness={settings.thickness}
            color={allCompleted ? 'green.400' : 'purple.400'}
            trackColor="whiteAlpha.200"
            animate={
              taskJustCompleted
                ? {
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }
                : {}
            }
            transition={
              taskJustCompleted
                ? {
                    duration: 1.5,
                    ease: 'easeInOut',
                  }
                : {}
            }
          >
            <MotionCircularProgressLabel
              color="white"
              fontSize={settings.fontSize}
              fontWeight="bold"
              animate={taskJustCompleted ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {progressPercentage}%
            </MotionCircularProgressLabel>
          </MotionCircularProgress>

          {/* Completion icon */}
          {allCompleted && (
            <AnimatePresence>
              <MotionBox
                position="absolute"
                top={-2}
                right={-2}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 15,
                }}
              >
                <Icon
                  as={CheckCircle}
                  color="green.400"
                  boxSize={settings.iconSize}
                />
              </MotionBox>
            </AnimatePresence>
          )}

          {/* Unclaimed rewards badge */}
          {unclaimedRewards > 0 && (
            <AnimatePresence>
              <MotionBox
                position="absolute"
                bottom={-2}
                right={-2}
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  transition: {
                    type: 'spring',
                    stiffness: 500,
                    damping: 15,
                  },
                }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <Badge
                  colorScheme="yellow"
                  borderRadius="full"
                  px={2}
                  py={1}
                  boxShadow="0 0 10px rgba(236, 201, 75, 0.5)"
                >
                  <HStack spacing={1}>
                    <Icon as={Award} boxSize={3} />
                    <Text fontSize="xs">{unclaimedRewards}</Text>
                  </HStack>
                </Badge>
              </MotionBox>
            </AnimatePresence>
          )}
        </MotionBox>
      </Tooltip>
    </>
  )
}

export default TaskProgressIndicator
