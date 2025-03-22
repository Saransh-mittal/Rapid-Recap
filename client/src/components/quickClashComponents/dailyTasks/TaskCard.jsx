// components/quickClashComponents/dailyTasks/TaskCard.jsx
import React, { useState, useCallback } from 'react'
import {
  Box,
  Flex,
  Heading,
  Text,
  Progress,
  Badge,
  IconButton,
  HStack,
  Tooltip,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Gift,
  AlertTriangle,
  Clock,
  Trophy,
  Award,
  Target,
} from 'lucide-react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { claimTaskReward } from '../../../redux/quickClashDailyTasksSlice'
import RewardAnimation from './RewardAnimation'

const MotionBox = motion(Box)
const MotionIconButton = motion(IconButton)
const MotionBadge = motion(Badge)

// Difficulty to color mapping
const difficultyColors = {
  1: 'green',
  2: 'blue',
  3: 'purple',
  4: 'orange',
  5: 'red',
}

// Task type to icon mapping
const taskTypeIcons = {
  COMPLETE_CHALLENGES: Target,
  ACHIEVE_RQM_SCORE: Award,
  WIN_CHALLENGES: Trophy,
  PLAY_CONSECUTIVE_DAYS: Clock,
  CHALLENGE_FRIEND: Target,
  USE_CATEGORIES: Target,
  COMPLETE_MATCHMAKING: Target,
  VIEW_ANALYSES: Target,
  MAINTAIN_WINSTREAK: Trophy,
  IMPROVE_READING_TIME: Clock,
}

const TaskCard = ({ task, isJustCompleted = false }) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const toast = useToast()
  const [claimLoading, setClaimLoading] = useState(false)
  const [showRewardAnimation, setShowRewardAnimation] = useState(false)
  const [rewardAmount, setRewardAmount] = useState({ xp: 0 })

  // Calculate progress percentage
  const progressPercentage = Math.min(
    100,
    Math.round((task.progress / task.target) * 100),
  )

  // Determine task status
  const isCompleted = task.completed
  const isRewardClaimed = task.rewardClaimed
  const canClaimReward = isCompleted && !isRewardClaimed

  // Format time remaining
  const getTimeRemaining = () => {
    const now = new Date()
    const expiresAt = new Date(task.expiresAt)
    const diffHours = Math.floor((expiresAt - now) / (1000 * 60 * 60))

    if (diffHours < 1) {
      return t('Less than 1 hour')
    }
    return `${diffHours} ` + t('hours')
  }

  // Handle reward claim
  const handleClaimReward = useCallback(async () => {
    if (!canClaimReward || claimLoading) return

    try {
      setClaimLoading(true)
      const result = await dispatch(claimTaskReward(task._id)).unwrap()

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
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: t('Error'),
        description: error || t('Failed to claim reward'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setClaimLoading(false)
    }
  }, [task, canClaimReward, claimLoading, dispatch, toast, t])

  // Get the icon for this task type
  const TaskIcon = taskTypeIcons[task.taskType] || Target

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      borderWidth="1px"
      borderColor={isCompleted ? 'purple.500' : 'whiteAlpha.200'}
      borderRadius="lg"
      bg={isCompleted ? 'rgba(128, 90, 213, 0.1)' : 'rgba(26, 32, 44, 0.5)'}
      p={4}
      position="relative"
      overflow="hidden"
      boxShadow={isJustCompleted ? '0 0 15px rgba(128, 90, 213, 0.7)' : 'none'}
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Difficulty badge */}
      <MotionBadge
        position="absolute"
        top={2}
        right={2}
        colorScheme={difficultyColors[task.difficulty] || 'gray'}
        variant="solid"
        fontSize="xs"
        animate={isJustCompleted ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        {t('Level')} {task.difficulty}
      </MotionBadge>

      {/* Task icon */}
      <Flex align="center" mb={3}>
        <Box
          p={2}
          borderRadius="full"
          bg={`${difficultyColors[task.difficulty]}.600`}
          color="white"
          mr={3}
        >
          <TaskIcon size={18} />
        </Box>
        <Heading size="sm" color="white" noOfLines={1}>
          {task.title}
        </Heading>
      </Flex>

      {/* Task description */}
      <Text color="gray.300" fontSize="sm" mb={3} noOfLines={2}>
        {task.description}
      </Text>

      {/* Progress bar */}
      <Box mb={2}>
        <HStack justify="space-between" mb={1}>
          <Text fontSize="xs" color="gray.400">
            {progressPercentage}% {t('Complete')}
          </Text>
          <Text fontSize="xs" color="gray.400">
            {task.progress}/{task.target}
          </Text>
        </HStack>
        <Progress
          value={progressPercentage}
          size="sm"
          colorScheme={isCompleted ? 'purple' : 'blue'}
          borderRadius="full"
          bg="whiteAlpha.200"
          hasStripe={progressPercentage > 0 && progressPercentage < 100}
        />
      </Box>

      {/* Task footer with time and claim button */}
      <Flex justify="space-between" align="center" mt={3}>
        <Tooltip label={t('Time remaining until reset')}>
          <HStack spacing={1}>
            <Clock size={14} color="#CBD5E0" />
            <Text fontSize="xs" color="gray.400">
              {getTimeRemaining()}
            </Text>
          </HStack>
        </Tooltip>

        {canClaimReward && (
          <MotionIconButton
            icon={<Gift size={18} />}
            colorScheme="purple"
            size="sm"
            aria-label={t('Claim Reward')}
            onClick={handleClaimReward}
            isLoading={claimLoading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        )}

        {isCompleted && isRewardClaimed && (
          <Tooltip label={t('Reward claimed')}>
            <Badge colorScheme="green" variant="solid" borderRadius="full">
              <HStack spacing={1}>
                <Check size={12} />
                <Text fontSize="xs">{t('Claimed')}</Text>
              </HStack>
            </Badge>
          </Tooltip>
        )}
      </Flex>

      {/* Reward info */}
      <HStack mt={2} spacing={3}>
        <Badge colorScheme="yellow" variant="subtle">
          <HStack spacing={1}>
            <Award size={12} />
            <Text fontSize="xs">{task.reward.xp} XP</Text>
          </HStack>
        </Badge>
      </HStack>

      {/* Completion animation overlay */}
      <AnimatePresence>
        {isJustCompleted && (
          <MotionBox
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(128, 90, 213, 0.2)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            zIndex={2}
          >
            <MotionBox
              initial={{ scale: 0 }}
              animate={{
                scale: [0, 1.5, 1],
                rotate: [0, 10, 0],
              }}
              transition={{ duration: 0.8, type: 'spring' }}
            >
              <Check size={50} color="#805AD5" />
            </MotionBox>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Reward animation */}
      {showRewardAnimation && (
        <RewardAnimation
          xp={rewardAmount.xp}
          onComplete={() => setShowRewardAnimation(false)}
        />
      )}
    </MotionBox>
  )
}

export default TaskCard
