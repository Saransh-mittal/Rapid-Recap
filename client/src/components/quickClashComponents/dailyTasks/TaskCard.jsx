// components/quickClashComponents/dailyTasks/TaskCard.jsx
import React, { useState, useCallback, useMemo } from 'react'
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  IconButton,
  HStack,
  Tooltip,
  useToast,
  VStack,
  Icon,
  Portal,
} from '@chakra-ui/react'
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

const MotionBox = motion(Box)
const MotionIconButton = motion(IconButton)
const MotionBadge = motion(Badge)
const MotionText = motion(Text)
const MotionHeading = motion(Heading)

// Task type to icon mapping with more dynamic options
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

// Difficulty to color mapping - enhanced with gradient options
const difficultyColors = {
  1: { color: 'green', gradient: 'linear(to-r, green.400, teal.300)' },
  2: { color: 'blue', gradient: 'linear(to-r, blue.400, cyan.300)' },
  3: { color: 'purple', gradient: 'linear(to-r, purple.400, pink.300)' },
  4: { color: 'orange', gradient: 'linear(to-r, orange.400, yellow.300)' },
  5: { color: 'red', gradient: 'linear(to-r, red.400, orange.300)' },
}

const TaskCard = ({ task, isJustCompleted = false, onClick }) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const toast = useToast()
  const [claimLoading, setClaimLoading] = useState(false)
  const [showRewardAnimation, setShowRewardAnimation] = useState(false)
  const [rewardAmount, setRewardAmount] = useState({ xp: 0 })
  const [isHovered, setIsHovered] = useState(false)

  // Calculate progress percentage
  const progressPercentage = Math.min(
    100,
    Math.round((task.progress / task.target) * 100),
  )

  // Determine task status
  const isCompleted = task.completed
  const isRewardClaimed = task.rewardClaimed
  const canClaimReward = isCompleted && !isRewardClaimed

  // Format time remaining with enhanced presentation
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

  // Handle reward claim
  const handleClaimReward = useCallback(
    async e => {
      e.stopPropagation()
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
    },
    [task, canClaimReward, claimLoading, dispatch, toast, t],
  )

  // Handle animation completion
  const handleRewardAnimationComplete = useCallback(() => {
    setShowRewardAnimation(false)
  }, [])

  // Get the icon for this task type
  const TaskIcon = taskTypeIcons[task.taskType] || Target

  // Get difficulty styling
  const difficultyStyle =
    difficultyColors[task.difficulty] || difficultyColors[3]

  // Card animations
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

  // Progress bar animation
  const progressVariants = {
    initial: { width: '0%' },
    animate: {
      width: `${progressPercentage}%`,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  return (
    <MotionBox
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      borderWidth="1px"
      borderColor={
        isCompleted ? `${difficultyStyle.color}.500` : 'whiteAlpha.200'
      }
      borderRadius="xl"
      bg={isCompleted ? `rgba(128, 90, 213, 0.1)` : 'rgba(26, 32, 44, 0.5)'}
      position="relative"
      overflow="hidden"
      boxShadow={
        isJustCompleted
          ? '0 0 20px rgba(128, 90, 213, 0.7)'
          : isHovered
          ? '0 8px 16px rgba(0, 0, 0, 0.2)'
          : '0 4px 8px rgba(0, 0, 0, 0.1)'
      }
      transitionProperty="box-shadow, transform"
      transitionDuration="0.2s"
      onClick={() => onClick && onClick(task)}
      cursor={onClick ? 'pointer' : 'default'}
    >
      {/* Background gradient effect */}
      {isCompleted && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient={`linear(to-br, ${difficultyStyle.color}.500, ${difficultyStyle.color}.700)`}
          opacity="0.05"
          zIndex="0"
        />
      )}

      {/* Difficulty badge using TaskLevelBadge component */}
      <Box
        position="absolute"
        top={0}
        right={0}
        zIndex={1}
        initial={{ x: 40 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        as={motion.div}
      >
        <TaskLevelBadge
          level={task.difficulty}
          variant="gradient"
          size="sm"
          animated={isHovered || isJustCompleted}
        />
      </Box>

      <Box px={4} pt={6} pb={3} position="relative" zIndex={1}>
        {/* Task icon & title */}
        <HStack spacing={3} mb={3} align="flex-start">
          {/* Icon with glowing effect for completed tasks */}
          <MotionBox
            p={2}
            borderRadius="full"
            bg={isCompleted ? `${difficultyStyle.color}.600` : 'whiteAlpha.200'}
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
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
            boxShadow={
              isCompleted ? `0 0 10px ${difficultyStyle.color}.500` : 'none'
            }
          >
            <TaskIcon size={20} />
          </MotionBox>

          <VStack spacing={0} align="flex-start" flex={1}>
            <MotionHeading
              size="sm"
              color="white"
              noOfLines={1}
              fontWeight="semibold"
            >
              {task.title}
            </MotionHeading>

            <MotionText
              color="whiteAlpha.700"
              fontSize="xs"
              noOfLines={2}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: isHovered ? 1 : 0.8 }}
            >
              {task.description}
            </MotionText>
          </VStack>
        </HStack>

        {/* Progress section with enhanced visuals */}
        <Box mb={3}>
          <Flex justify="space-between" mb={1}>
            <HStack spacing={1}>
              <Icon
                as={isCompleted ? Check : Target}
                boxSize={3}
                color={isCompleted ? 'green.400' : 'blue.400'}
              />
              <Text
                fontSize="xs"
                color={isCompleted ? 'green.300' : 'whiteAlpha.700'}
                fontWeight="medium"
              >
                {isCompleted
                  ? t('Completed')
                  : `${progressPercentage}% ${t('Complete')}`}
              </Text>
            </HStack>

            <HStack spacing={1}>
              <Text fontSize="xs" color="whiteAlpha.700" fontWeight="medium">
                {task.progress}/{task.target}
              </Text>
            </HStack>
          </Flex>

          {/* Stylized progress bar with animation */}
          <Box
            position="relative"
            h="6px"
            bg="whiteAlpha.200"
            borderRadius="full"
            overflow="hidden"
          >
            <MotionBox
              position="absolute"
              h="100%"
              bg={isCompleted ? `${difficultyStyle.color}.500` : 'blue.400'}
              borderRadius="full"
              variants={progressVariants}
              initial="initial"
              animate="animate"
              backgroundSize="200% 100%"
              backgroundImage={
                isCompleted
                  ? difficultyStyle.gradient
                  : 'linear-gradient(90deg, #4299E1, #63B3ED, #4299E1)'
              }
              animation={
                !isCompleted &&
                progressPercentage > 0 &&
                progressPercentage < 100
                  ? 'shimmer 2s infinite linear'
                  : 'none'
              }
              sx={{
                '@keyframes shimmer': {
                  '0%': { backgroundPosition: '200% 0' },
                  '100%': { backgroundPosition: '0% 0' },
                },
              }}
            />
          </Box>
        </Box>

        {/* Rewards & Time section */}
        <Flex justify="space-between" align="center">
          {/* Time remaining */}
          <Tooltip label={t('Time remaining until reset')}>
            <HStack spacing={1}>
              <Clock size={14} color={isHovered ? '#CBD5E0' : '#A0AEC0'} />
              <Text
                fontSize="xs"
                color="whiteAlpha.600"
                transition="color 0.2s"
                _groupHover={{ color: 'whiteAlpha.800' }}
              >
                {timeRemaining}
              </Text>
            </HStack>
          </Tooltip>

          {/* Reward badge */}
          {!isRewardClaimed && (
            <MotionBadge
              colorScheme="yellow"
              variant="subtle"
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
              <HStack spacing={1}>
                <Award size={12} />
                <Text fontSize="xs">{task.reward.xp} XP</Text>
              </HStack>
            </MotionBadge>
          )}
        </Flex>

        {/* Action button - only show if reward can be claimed */}
        {canClaimReward && (
          <Flex justify="center" mt={3}>
            <MotionIconButton
              icon={<Gift size={18} />}
              colorScheme="purple"
              size="sm"
              isRound
              aria-label={t('Claim Reward')}
              onClick={handleClaimReward}
              isLoading={claimLoading}
              whileHover={{
                scale: 1.1,
                boxShadow: '0 0 15px rgba(128, 90, 213, 0.7)',
              }}
              whileTap={{ scale: 0.9 }}
              bgGradient="linear(to-r, purple.500, pink.500)"
              _hover={{
                bgGradient: 'linear(to-r, purple.600, pink.600)',
              }}
              _active={{
                bgGradient: 'linear(to-r, purple.700, pink.700)',
              }}
            />
          </Flex>
        )}
      </Box>

      {/* Claimed badge - only show if reward is claimed */}
      {isCompleted && isRewardClaimed && (
        <Box position="absolute" bottom={2} right={2} zIndex={2}>
          <MotionBadge
            colorScheme="green"
            variant="solid"
            borderRadius="full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10, stiffness: 100 }}
          >
            <HStack spacing={1}>
              <Check size={10} />
              <Text fontSize="xs">{t('Claimed')}</Text>
            </HStack>
          </MotionBadge>
        </Box>
      )}

      {/* Completion animation overlay */}
      <AnimatePresence>
        {isJustCompleted && (
          <MotionBox
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(128, 90, 213, 0.15)"
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

      {/* Reward animation - Using Portal with a simplified implementation */}
      {showRewardAnimation && (
        <Portal>
          <RewardAnimation
            xp={rewardAmount.xp}
            onComplete={handleRewardAnimationComplete}
          />
        </Portal>
      )}
    </MotionBox>
  )
}

export default TaskCard
