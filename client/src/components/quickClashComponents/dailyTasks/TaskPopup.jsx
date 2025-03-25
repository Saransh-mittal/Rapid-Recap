// components/quickClashComponents/dailyTasks/TaskPopup.jsx
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Progress,
  Badge,
  Icon,
  Button,
  HStack,
  Flex,
  Collapse,
  Divider,
  CloseButton,
  Tooltip,
  useTheme,
  useToast,
  IconButton,
  Portal,
} from '@chakra-ui/react'
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
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  fetchDailyTasks,
  claimTaskReward,
} from '../../../redux/quickClashDailyTasksSlice'
import RewardAnimation from './RewardAnimation'

const MotionBox = motion(Box)
const MotionBadge = motion(Badge)
const MotionButton = motion(Button)
const MotionFlex = motion(Flex)
const MotionProgress = motion(Progress)
const MotionText = motion(Text)
const MotionDivider = motion(Divider)
const MotionIconButton = motion(IconButton)

// Task item component for completed tasks
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
      <MotionBox
        key={task._id}
        p={2}
        borderRadius="md"
        bgGradient="linear(to-r, rgba(72, 187, 120, 0.1), rgba(56, 161, 105, 0.05))"
        borderWidth="1px"
        borderColor="green.700"
        justify="space-between"
        opacity={task._id === justCompletedTaskId ? 1 : 0.8}
        boxShadow={
          task._id === justCompletedTaskId
            ? '0 0 12px rgba(72, 187, 120, 0.5)'
            : 'none'
        }
        initial={{ opacity: 0, x: 20 }}
        animate={{
          opacity: task._id === justCompletedTaskId ? 1 : 0.8,
          x: 0,
        }}
        transition={{ delay: 0.1 * index, duration: 0.3 }}
        onClick={() => onToggleExpand(task._id)}
        cursor="pointer"
      >
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <MotionBox
              animate={
                task._id === justCompletedTaskId
                  ? {
                      rotate: [0, 10, 0, -10, 0],
                      transition: { repeat: 2, duration: 0.5 },
                    }
                  : {}
              }
            >
              <Icon as={CheckCircle} color="green.400" boxSize={4} />
            </MotionBox>
            <Text color="whiteAlpha.900" fontSize="sm" noOfLines={1}>
              {task.title}
            </Text>
          </HStack>

          {!task.rewardClaimed && (
            <Flex>
              <MotionIconButton
                icon={<Gift size={16} />}
                colorScheme="yellow"
                size="xs"
                isRound
                aria-label={t('Claim Reward')}
                onClick={e => {
                  e.stopPropagation()
                  onClaimReward(task._id, e)
                }}
                isLoading={claimLoading && claimingTaskId === task._id}
                whileHover={{
                  scale: 1.1,
                  boxShadow: '0 0 10px rgba(236, 201, 75, 0.7)',
                }}
                whileTap={{ scale: 0.9 }}
                bgGradient="linear(to-r, yellow.500, orange.500)"
                _hover={{
                  bgGradient: 'linear(to-r, yellow.600, orange.600)',
                }}
                _active={{
                  bgGradient: 'linear(to-r, yellow.700, orange.700)',
                }}
                boxShadow="0 0 5px rgba(236, 201, 75, 0.5)"
                ml={2}
              />
            </Flex>
          )}
        </Flex>

        {/* Task description - expandable */}
        <Collapse in={expandedTask === task._id} animateOpacity>
          <Text color="whiteAlpha.700" fontSize="xs" mt={1}>
            {task.description}
          </Text>
          {!task.rewardClaimed && (
            <HStack spacing={1} mt={2}>
              <Award size={12} color="#F6E05E" />
              <Text color="yellow.300" fontSize="xs" fontWeight="medium">
                {task.reward.xp} XP {t('reward available')}
              </Text>
            </HStack>
          )}
        </Collapse>
      </MotionBox>
    )
  },
)

// Task item component for incomplete tasks
const IncompleteTaskItem = memo(
  ({ task, index, expandedTask, onToggleExpand }) => {
    return (
      <MotionBox
        key={task._id}
        p={2}
        borderRadius="md"
        bg="whiteAlpha.50"
        borderWidth="1px"
        borderColor="whiteAlpha.100"
        cursor="pointer"
        onClick={() => onToggleExpand(task._id)}
        _hover={{
          borderColor: 'whiteAlpha.300',
          bg: 'whiteAlpha.100',
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 * index, duration: 0.3 }}
      >
        <HStack justify="space-between" mb={1}>
          <Text color="whiteAlpha.900" fontSize="sm" noOfLines={1}>
            {task.title}
          </Text>

          <Badge colorScheme="blue" fontSize="xs">
            {task.progress}/{task.target}
          </Badge>
        </HStack>

        {/* Task description - expandable */}
        <Collapse in={expandedTask === task._id} animateOpacity>
          <Text color="whiteAlpha.700" fontSize="xs" mb={2}>
            {task.description}
          </Text>
        </Collapse>

        <Progress
          value={(task.progress / task.target) * 100}
          size="xs"
          colorScheme="blue"
          mt={1}
          background="whiteAlpha.200"
        />
      </MotionBox>
    )
  },
)

// Next task component
const NextTaskItem = memo(({ task, expandedTask, onToggleExpand }) => {
  return (
    <MotionBox
      p={3}
      borderRadius="md"
      bgGradient="linear(to-b, rgba(66, 153, 225, 0.1), rgba(26, 32, 44, 0.2))"
      borderWidth="1px"
      borderColor="blue.800"
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.2)"
      _hover={{
        borderColor: 'blue.700',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
      cursor="pointer"
      onClick={() => onToggleExpand(task._id)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <HStack justify="space-between" mb={1}>
        <Text color="white" fontSize="sm" fontWeight="medium" noOfLines={1}>
          {task.title}
        </Text>

        <MotionBadge
          colorScheme="blue"
          fontSize="xs"
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
        </MotionBadge>
      </HStack>

      {/* Task description - expandable */}
      <Collapse in={expandedTask === task._id} animateOpacity>
        <Text color="whiteAlpha.700" fontSize="xs" mb={2}>
          {task.description}
        </Text>
      </Collapse>

      <MotionProgress
        value={(task.progress / task.target) * 100}
        size="xs"
        colorScheme="blue"
        borderRadius="full"
        mt={2}
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.5 }}
        background="whiteAlpha.200"
        isAnimated
      />
    </MotionBox>
  )
})

// Main component
const TaskPopup = ({ onViewAllTasks, isOpen, onClose }) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const theme = useTheme()
  const toast = useToast()

  const [isExpanded, setIsExpanded] = useState(false)
  const [showPopup, setShowPopup] = useState(true)
  const [expandedTask, setExpandedTask] = useState(null)
  const [claimLoading, setClaimLoading] = useState(false)
  const [showRewardAnimation, setShowRewardAnimation] = useState(false)
  const [rewardAmount, setRewardAmount] = useState({ xp: 0 })
  const [claimingTaskId, setClaimingTaskId] = useState(null)

  // Select tasks from Redux store
  const { tasks, tasksLoading, justCompletedTaskId } = useSelector(
    state => state.quickClashDailyTasks,
  )

  // Memoized computed values
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

  // Fetch tasks on component mount
  useEffect(() => {
    if (tasks.length === 0 && !tasksLoading) {
      dispatch(fetchDailyTasks())
    }
  }, [dispatch, tasks.length, tasksLoading])

  // Handle view all tasks click
  const handleViewAllTasks = useCallback(() => {
    if (onViewAllTasks) {
      onViewAllTasks()
    }
    setShowPopup(false)
  }, [onViewAllTasks])

  // Toggle task expansion
  const toggleTaskExpansion = useCallback(taskId => {
    setExpandedTask(prev => (prev === taskId ? null : taskId))
  }, [])

  // Handle reward claim
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
    [claimLoading, dispatch, toast, t],
  )

  // Handle animation completion
  const handleRewardAnimationComplete = useCallback(() => {
    setShowRewardAnimation(false)
    setClaimingTaskId(null)
  }, [])

  // Toggle popup visibility
  const handleTogglePopup = useCallback(() => {
    setShowPopup(true)
  }, [])

  // If there are no tasks, don't render the popup
  if (tasks.length === 0) {
    return null
  }

  // Display minimized button if popup is hidden or all tasks completed
  if (!isOpen || (shouldShowCompleted && !isExpanded)) {
    return null
  }

  return (
    <Portal>
      <AnimatePresence>
        <MotionBox
          position="fixed"
          bottom="20px"
          right="20px"
          width={{ base: 'calc(100% - 40px)', md: '350px' }}
          borderRadius="xl"
          bg="rgba(26, 32, 44, 0.9)"
          backdropFilter="blur(10px)"
          boxShadow="0 8px 30px rgba(0, 0, 0, 0.4)"
          overflow="hidden"
          borderWidth="1px"
          borderColor="purple.500"
          zIndex={101}
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
          <Box
            position="absolute"
            top="-20%"
            right="-10%"
            width="40%"
            height="40%"
            borderRadius="full"
            bg="purple.900"
            opacity="0.1"
            filter="blur(40px)"
            zIndex={0}
          />

          <Box
            position="absolute"
            bottom="-10%"
            left="-10%"
            width="30%"
            height="30%"
            borderRadius="full"
            bg="blue.900"
            opacity="0.1"
            filter="blur(30px)"
            zIndex={0}
          />

          {/* Header with progress */}
          <MotionFlex
            px={4}
            pt={3}
            pb={2}
            justify="space-between"
            align="center"
            bgGradient="linear(to-r, rgba(128, 90, 213, 0.2), rgba(76, 81, 191, 0.2))"
            borderBottom="1px solid"
            borderColor="whiteAlpha.200"
            position="relative"
            zIndex={1}
          >
            <HStack spacing={2}>
              <MotionBox
                animate={{
                  rotate: [-5, 5],
                  transition: {
                    repeat: Infinity,
                    repeatType: 'reverse',
                    duration: 1.5,
                  },
                }}
              >
                <Icon as={Target} color="purple.400" boxSize={5} />
              </MotionBox>
              <Heading size="sm" color="white">
                {t('Daily Tasks')}
              </Heading>

              {/* Progress badge */}
              <MotionBadge
                colorScheme={progressPercentage === 100 ? 'green' : 'blue'}
                ml={2}
                animate={
                  justCompletedTaskId
                    ? { scale: [1, 1.3, 1], rotate: [0, 5, 0] }
                    : progressPercentage === 100
                    ? {
                        boxShadow: [
                          '0 0 0px rgba(72, 187, 120, 0)',
                          '0 0 10px rgba(72, 187, 120, 0.7)',
                          '0 0 0px rgba(72, 187, 120, 0)',
                        ],
                        transition: { repeat: Infinity, duration: 2 },
                      }
                    : {}
                }
                transition={{ duration: 0.5 }}
                bgGradient={
                  progressPercentage === 100
                    ? 'linear(to-r, green.500, teal.500)'
                    : 'linear(to-r, blue.500, cyan.500)'
                }
              >
                {progressPercentage}%
              </MotionBadge>
            </HStack>

            <HStack>
              <MotionButton
                size="xs"
                variant="ghost"
                colorScheme="purple"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? t('Collapse') : t('Expand')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MotionBox
                  animate={
                    isExpanded
                      ? { rotate: 180, transition: { duration: 0.3 } }
                      : { rotate: 0, transition: { duration: 0.3 } }
                  }
                >
                  <Icon as={ChevronUp} boxSize={4} />
                </MotionBox>
              </MotionButton>

              <CloseButton
                size="sm"
                onClick={onClose}
                color="whiteAlpha.700"
                _hover={{ color: 'white' }}
              />
            </HStack>
          </MotionFlex>

          {/* Progress bar */}
          <MotionProgress
            value={progressPercentage}
            size="xs"
            bgGradient={
              progressPercentage === 100
                ? 'linear(to-r, green.500, teal.500)'
                : 'linear(to-r, purple.500, pink.500)'
            }
            isAnimated
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.7 }}
            sx={{
              '& > div:first-of-type': {
                transition: 'width 0.5s ease-out',
              },
            }}
          />

          {/* Summary section - always visible */}
          <Box p={3} position="relative" zIndex={1}>
            <HStack justify="space-between" mb={2}>
              <MotionText
                color="whiteAlpha.800"
                fontSize="sm"
                fontWeight="medium"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {incompleteTasks.length > 0
                  ? `${incompleteTasks.length} ` + t('tasks remaining')
                  : t('All tasks completed!')}
              </MotionText>

              <MotionBadge
                colorScheme="green"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {completedCount}/{totalTasks}
              </MotionBadge>
            </HStack>

            {/* Next task to complete (if any) */}
            {incompleteTasks.length > 0 && (
              <>
                <HStack spacing={1} mb={1}>
                  <Icon as={Zap} color="blue.400" boxSize={3} />
                  <Text color="blue.300" fontSize="xs" fontWeight="medium">
                    {t('Next task')}:
                  </Text>
                </HStack>
                <NextTaskItem
                  task={incompleteTasks[0]}
                  expandedTask={expandedTask}
                  onToggleExpand={toggleTaskExpansion}
                />
              </>
            )}
          </Box>

          {/* Expandable section with all in-progress tasks */}
          <Collapse in={isExpanded} animateOpacity>
            <Box
              p={3}
              maxHeight="300px"
              overflowY="auto"
              position="relative"
              zIndex={1}
              css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '6px',
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '24px',
                },
              }}
            >
              {incompleteTasks.length > 1 && (
                <VStack spacing={2} align="stretch" mb={3}>
                  <HStack spacing={1}>
                    <Icon as={Clock} color="purple.400" boxSize={3} />
                    <Text color="purple.300" fontSize="xs" fontWeight="medium">
                      {t('In progress')}:
                    </Text>
                  </HStack>

                  {incompleteTasks.slice(1).map((task, index) => (
                    <IncompleteTaskItem
                      key={task._id}
                      task={task}
                      index={index}
                      expandedTask={expandedTask}
                      onToggleExpand={toggleTaskExpansion}
                    />
                  ))}
                </VStack>
              )}

              {/* Recently completed tasks */}
              {completedTasks.length > 0 && (
                <VStack spacing={2} align="stretch">
                  <HStack spacing={1}>
                    <Icon as={CheckCircle} color="green.400" boxSize={3} />
                    <Text color="green.300" fontSize="xs" fontWeight="medium">
                      {t('Completed')}:
                    </Text>
                  </HStack>

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
                    <Text
                      color="whiteAlpha.600"
                      fontSize="xs"
                      textAlign="center"
                    >
                      {t('And {count} more completed tasks', {
                        count: completedTasks.length - 3,
                      })}
                    </Text>
                  )}
                </VStack>
              )}
            </Box>

            <MotionDivider
              borderColor="whiteAlpha.200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            />

            {/* Footer with view all button */}
            <Flex justify="center" p={3} position="relative" zIndex={1}>
              <MotionButton
                colorScheme="purple"
                size="sm"
                href="#tasks"
                onClick={handleViewAllTasks}
                leftIcon={<Layout size={16} />}
                rightIcon={<Trophy size={16} />}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 15px rgba(128, 90, 213, 0.5)',
                }}
                whileTap={{ scale: 0.95 }}
                bgGradient="linear(to-r, purple.500, pink.500)"
                _hover={{
                  bgGradient: 'linear(to-r, purple.600, pink.600)',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                {t('View All Tasks')}
              </MotionButton>
            </Flex>
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
        </MotionBox>
      </AnimatePresence>
    </Portal>
  )
}

export default memo(TaskPopup)
