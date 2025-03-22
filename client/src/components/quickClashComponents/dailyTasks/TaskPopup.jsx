// components/quickClashComponents/dailyTasks/TaskPopup.jsx
import React, { useState, useEffect } from 'react'
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
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Target,
  Clock,
  Trophy,
  Gift,
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { fetchDailyTasks } from '../../../redux/quickClashDailyTasksSlice'

const MotionBox = motion(Box)
const MotionBadge = motion(Badge)
const MotionButton = motion(Button)

const TaskPopup = ({ onViewAllTasks }) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [isExpanded, setIsExpanded] = useState(false)
  const [showPopup, setShowPopup] = useState(true)

  // Select tasks from Redux store
  const { tasks, tasksLoading, justCompletedTaskId } = useSelector(
    state => state.quickClashDailyTasks,
  )

  // Filter incomplete tasks
  const incompleteTasks = tasks.filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)

  // Calculate overall progress
  const totalTasks = tasks.length
  const completedCount = completedTasks.length
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  // Fetch tasks on component mount
  useEffect(() => {
    if (tasks.length === 0 && !tasksLoading) {
      dispatch(fetchDailyTasks())
    }
  }, [dispatch, tasks.length, tasksLoading])

  // Handle view all tasks click
  const handleViewAllTasks = () => {
    if (onViewAllTasks) {
      onViewAllTasks()
    }
  }

  // If there are no tasks, don't render the popup
  if (tasks.length === 0) {
    return null
  }

  // If all tasks are completed and no task was just completed, don't show
  const shouldShowCompleted =
    completedCount === totalTasks && !justCompletedTaskId

  if (!showPopup || (shouldShowCompleted && !isExpanded)) {
    return (
      <MotionBox
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex={10}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
      >
        <Tooltip label={t('Show Tasks')}>
          <MotionButton
            colorScheme="purple"
            size="md"
            borderRadius="full"
            width="50px"
            height="50px"
            onClick={() => setShowPopup(true)}
            boxShadow="lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Icon as={Target} boxSize={5} />
          </MotionButton>
        </Tooltip>
      </MotionBox>
    )
  }

  return (
    <AnimatePresence>
      <MotionBox
        position="fixed"
        bottom="20px"
        right="20px"
        width={{ base: 'calc(100% - 40px)', md: '350px' }}
        borderRadius="xl"
        bg="rgba(26, 32, 44, 0.9)"
        backdropFilter="blur(8px)"
        boxShadow="0 4px 30px rgba(0, 0, 0, 0.3)"
        overflow="hidden"
        borderWidth="1px"
        borderColor="purple.500"
        zIndex={10}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header with progress */}
        <Flex
          px={4}
          pt={3}
          pb={2}
          justify="space-between"
          align="center"
          bg="rgba(128, 90, 213, 0.1)"
          borderBottom="1px solid"
          borderColor="whiteAlpha.200"
        >
          <HStack spacing={2}>
            <Icon as={Target} color="purple.400" boxSize={5} />
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
                  : {}
              }
              transition={{ duration: 0.5 }}
            >
              {progressPercentage}%
            </MotionBadge>
          </HStack>

          <HStack>
            <Button
              size="xs"
              variant="ghost"
              colorScheme="purple"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? t('Collapse') : t('Expand')}
            >
              <Icon as={isExpanded ? ChevronDown : ChevronUp} boxSize={4} />
            </Button>

            <CloseButton
              size="sm"
              onClick={() => setShowPopup(false)}
              color="whiteAlpha.700"
              _hover={{ color: 'white' }}
            />
          </HStack>
        </Flex>

        {/* Progress bar */}
        <Progress
          value={progressPercentage}
          size="xs"
          colorScheme={progressPercentage === 100 ? 'green' : 'purple'}
          isAnimated
        />

        {/* Summary section - always visible */}
        <Box p={3}>
          <HStack justify="space-between" mb={2}>
            <Text color="whiteAlpha.800" fontSize="sm">
              {incompleteTasks.length > 0
                ? `${incompleteTasks.length} ` + t('tasks remaining')
                : t('All tasks completed!')}
            </Text>

            <Badge colorScheme="green">
              {completedCount}/{totalTasks}
            </Badge>
          </HStack>

          {/* Next task to complete (if any) */}
          {incompleteTasks.length > 0 && (
            <Box>
              <Text color="gray.400" fontSize="xs" mb={1}>
                {t('Next task')}:
              </Text>

              <Box
                p={2}
                borderRadius="md"
                bg="whiteAlpha.100"
                borderWidth="1px"
                borderColor="whiteAlpha.200"
              >
                <HStack justify="space-between">
                  <Text
                    color="white"
                    fontSize="sm"
                    fontWeight="medium"
                    noOfLines={1}
                  >
                    {incompleteTasks[0].title}
                  </Text>

                  <Badge colorScheme="blue" fontSize="xs">
                    {incompleteTasks[0].progress}/{incompleteTasks[0].target}
                  </Badge>
                </HStack>

                <Progress
                  value={
                    (incompleteTasks[0].progress / incompleteTasks[0].target) *
                    100
                  }
                  size="xs"
                  colorScheme="blue"
                  mt={2}
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* Expandable section with all in-progress tasks */}
        <Collapse in={isExpanded} animateOpacity>
          <Box
            p={3}
            maxHeight="300px"
            overflowY="auto"
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
                <Text color="whiteAlpha.700" fontSize="xs" mb={1}>
                  {t('In progress')}:
                </Text>

                {incompleteTasks.slice(1).map(task => (
                  <Box
                    key={task._id}
                    p={2}
                    borderRadius="md"
                    bg="whiteAlpha.50"
                    borderWidth="1px"
                    borderColor="whiteAlpha.100"
                  >
                    <HStack justify="space-between">
                      <Text color="whiteAlpha.900" fontSize="sm" noOfLines={1}>
                        {task.title}
                      </Text>

                      <Badge colorScheme="blue" fontSize="xs">
                        {task.progress}/{task.target}
                      </Badge>
                    </HStack>

                    <Progress
                      value={(task.progress / task.target) * 100}
                      size="xs"
                      colorScheme="blue"
                      mt={2}
                    />
                  </Box>
                ))}
              </VStack>
            )}

            {/* Recently completed tasks */}
            {completedTasks.length > 0 && (
              <VStack spacing={2} align="stretch">
                <Text color="whiteAlpha.700" fontSize="xs" mb={1}>
                  {t('Completed')}:
                </Text>

                {completedTasks.slice(0, 3).map(task => (
                  <HStack
                    key={task._id}
                    p={2}
                    borderRadius="md"
                    bg="rgba(72, 187, 120, 0.1)"
                    borderWidth="1px"
                    borderColor="green.700"
                    justify="space-between"
                    opacity={task._id === justCompletedTaskId ? 1 : 0.8}
                    boxShadow={
                      task._id === justCompletedTaskId
                        ? '0 0 8px rgba(72, 187, 120, 0.5)'
                        : 'none'
                    }
                  >
                    <HStack spacing={2}>
                      <Icon as={CheckCircle} color="green.400" boxSize={4} />
                      <Text color="whiteAlpha.900" fontSize="sm" noOfLines={1}>
                        {task.title}
                      </Text>
                    </HStack>

                    {!task.rewardClaimed && (
                      <Badge colorScheme="yellow" variant="solid" fontSize="xs">
                        <HStack spacing={1}>
                          <Gift size={10} />
                          <Text>{t('Claim')}</Text>
                        </HStack>
                      </Badge>
                    )}
                  </HStack>
                ))}

                {completedTasks.length > 3 && (
                  <Text color="whiteAlpha.600" fontSize="xs" textAlign="center">
                    {t('And {count} more completed tasks', {
                      count: completedTasks.length - 3,
                    })}
                  </Text>
                )}
              </VStack>
            )}
          </Box>

          <Divider borderColor="whiteAlpha.200" />

          {/* Footer with view all button */}
          <Flex justify="center" p={3}>
            <MotionButton
              colorScheme="purple"
              size="sm"
              onClick={handleViewAllTasks}
              leftIcon={<Trophy size={16} />}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('View All Tasks')}
            </MotionButton>
          </Flex>
        </Collapse>
      </MotionBox>
    </AnimatePresence>
  )
}

export default TaskPopup
