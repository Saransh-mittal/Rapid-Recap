// components/quickClashComponents/dailyTasks/DailyTasksDashboard.jsx
import React, { useEffect, useCallback, useState, useMemo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Flex,
  Spinner,
  Icon,
  useToast,
  Badge,
  CircularProgress,
  CircularProgressLabel,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Heading,
  Center,
  Divider,
} from '@chakra-ui/react'
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
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  fetchDailyTasks,
  refreshDailyTasks,
  fetchTaskStatistics,
  clearJustCompletedTask,
} from '../../../redux/quickClashDailyTasksSlice'

// Import components
import TaskCard from './TaskCard'
import TaskDetailsModal from './TaskDetailsModal'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionText = motion(Text)
const MotionHStack = motion(HStack)
const MotionCircularProgress = motion(CircularProgress)
const MotionBadge = motion(Badge)
const MotionButton = motion(Button)

/**
 * A streamlined version of the Daily Tasks Dashboard optimized for mobile
 */
const DailyTasksDashboard = () => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const toast = useToast()

  // Local state
  const [tabIndex, setTabIndex] = useState(0)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false)
  const [showParticles, setShowParticles] = useState(false)

  // Redux state
  const { tasks, tasksLoading, tasksError, justCompletedTaskId, statistics } =
    useSelector(state => state.quickClashDailyTasks)

  // Calculate task statistics
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

  // Generate particles for animation effects
  const particles = React.useMemo(() => {
    return Array.from({ length: 15 }, () => ({
      x: Math.random() * 100 - 50, // Random x position
      y: Math.random() * 100 - 50, // Random y position
      scale: Math.random() * 0.5 + 0.5, // Random size
      duration: Math.random() * 1 + 1, // Random duration
      delay: Math.random() * 0.5, // Random delay
    }))
  }, [])

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

  // Handle task refresh
  const handleRefreshTasks = useCallback(async () => {
    try {
      await dispatch(refreshDailyTasks()).unwrap()
      toast({
        title: t('Tasks Refreshed'),
        description: t('Your daily tasks have been updated'),
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
      })
      // Show particles effect after refresh
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 2000)
    } catch (error) {
      toast({
        title: t('Error'),
        description: error || t('Failed to refresh tasks'),
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top',
      })
    }
  }, [dispatch, toast, t])

  // Handle task click to show details
  const handleTaskClick = useCallback(task => {
    setSelectedTask(task)
    setIsTaskDetailsOpen(true)
  }, [])

  // Filter tasks based on tab index
  const filteredTasks = useMemo(() => {
    return tabIndex === 0
      ? tasks.filter(task => !task.completed)
      : tasks.filter(task => task.completed)
  }, [tasks, tabIndex])

  // Render loading state
  if (tasksLoading && tasks.length === 0) {
    return (
      <Center h="70vh">
        <VStack spacing={4}>
          <Spinner size="xl" thickness="4px" color="purple.500" speed="0.8s" />
          <Text color="white" fontWeight="medium">
            {t('Loading your daily tasks...')}
          </Text>
        </VStack>
      </Center>
    )
  }

  // Render error state
  if (tasksError && tasks.length === 0) {
    return (
      <Center h="70vh">
        <VStack spacing={4} maxW="90%" textAlign="center">
          <Icon as={AlertCircle} color="red.400" boxSize={10} />
          <Heading size="md" color="white">
            {t('Failed to load tasks')}
          </Heading>
          <Text color="red.200">{tasksError}</Text>
          <Button
            leftIcon={<RefreshCw />}
            colorScheme="red"
            onClick={() => dispatch(fetchDailyTasks())}
          >
            {t('Try Again')}
          </Button>
        </VStack>
      </Center>
    )
  }

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      pt={2}
      position="relative"
    >
      {/* Particle effects */}
      <AnimatePresence>
        {showParticles &&
          particles.map((particle, i) => (
            <MotionBox
              key={i}
              position="fixed"
              top="50%"
              left="50%"
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
              zIndex={5}
            >
              <Icon
                as={i % 3 === 0 ? Sparkles : i % 3 === 1 ? Star : Zap}
                color={
                  i % 4 === 0
                    ? 'purple.400'
                    : i % 4 === 1
                    ? 'blue.400'
                    : i % 4 === 2
                    ? 'yellow.400'
                    : 'red.400'
                }
                boxSize={3 + (i % 3)}
              />
            </MotionBox>
          ))}
      </AnimatePresence>

      {/* Progress Circle Header */}
      <MotionFlex
        direction="column"
        align="center"
        justify="center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        pb={4}
      >
        <MotionCircularProgress
          value={taskStats.overallProgress}
          size="100px"
          thickness="8px"
          color={taskStats.allCompleted ? 'green.400' : 'purple.400'}
          trackColor="whiteAlpha.200"
          capIsRound
          animate={
            justCompletedTaskId
              ? {
                  scale: [1, 1.1, 1],
                  transition: { duration: 0.5 },
                }
              : {}
          }
        >
          <CircularProgressLabel fontSize="xl" fontWeight="bold" color="white">
            {taskStats.overallProgress}%
          </CircularProgressLabel>
        </MotionCircularProgress>

        <MotionHStack
          mt={2}
          spacing={2}
          animate={
            taskStats.allCompleted
              ? {
                  scale: [1, 1.05, 1],
                  transition: { repeat: Infinity, duration: 2 },
                }
              : {}
          }
        >
          <Icon
            as={taskStats.allCompleted ? CheckCircle : Clock}
            color={taskStats.allCompleted ? 'green.400' : 'purple.400'}
            boxSize={4}
          />
          <Text color="white" fontWeight="semibold">
            {taskStats.completedTasks}/{taskStats.totalTasks} {t('Tasks')}
          </Text>
        </MotionHStack>
      </MotionFlex>

      {/* Stats Cards */}
      <Flex justify="space-between" px={1} mb={6}>
        {/* XP Earned */}
        <MotionBox
          bg="rgba(26, 32, 44, 0.7)"
          p={3}
          borderRadius="xl"
          borderWidth="1px"
          borderColor="yellow.700"
          flex={1}
          mr={2}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Flex align="center" mb={1}>
            <Icon as={Award} color="yellow.400" boxSize={5} mr={2} />
            <Text color="white" fontSize="sm" fontWeight="medium">
              {t('XP Earned')}
            </Text>
          </Flex>
          <Text
            color="yellow.300"
            fontSize="2xl"
            fontWeight="bold"
            textAlign="center"
          >
            {statistics?.rewards?.xp || 0}
          </Text>
        </MotionBox>

        {/* Tasks with rewards to claim */}
        {taskStats.unclaimedRewards > 0 && (
          <MotionBox
            bg="rgba(26, 32, 44, 0.7)"
            p={3}
            borderRadius="xl"
            borderWidth="1px"
            borderColor="purple.700"
            flex={1}
            ml={2}
            initial={{ opacity: 0, x: 10 }}
            animate={{
              opacity: 1,
              x: 0,
              boxShadow: [
                '0 0 0px rgba(128, 90, 213, 0)',
                '0 0 10px rgba(128, 90, 213, 0.5)',
                '0 0 0px rgba(128, 90, 213, 0)',
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
            <Flex align="center" mb={1}>
              <Icon as={Gift} color="purple.400" boxSize={5} mr={2} />
              <Text color="white" fontSize="sm" fontWeight="medium">
                {t('Unclaimed')}
              </Text>
            </Flex>
            <HStack justify="center" align="center">
              <MotionBadge
                colorScheme="purple"
                fontSize="lg"
                fontWeight="bold"
                px={2}
                py={1}
                borderRadius="lg"
                animate={{
                  scale: [1, 1.1, 1],
                  transition: { repeat: Infinity, duration: 1.5 },
                }}
              >
                {taskStats.unclaimedRewards}
              </MotionBadge>
              <Text color="purple.200" fontSize="md">
                {t('Rewards')}
              </Text>
            </HStack>
          </MotionBox>
        )}

        {/* If no unclaimed rewards, show streak instead */}
        {taskStats.unclaimedRewards === 0 && (
          <MotionBox
            bg="rgba(26, 32, 44, 0.7)"
            p={3}
            borderRadius="xl"
            borderWidth="1px"
            borderColor="blue.700"
            flex={1}
            ml={2}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Flex align="center" mb={1}>
              <Icon as={Zap} color="blue.400" boxSize={5} mr={2} />
              <Text color="white" fontSize="sm" fontWeight="medium">
                {t('Streak')}
              </Text>
            </Flex>
            <Text
              color="blue.300"
              fontSize="2xl"
              fontWeight="bold"
              textAlign="center"
            >
              {statistics?.streak || 0}
            </Text>
          </MotionBox>
        )}
      </Flex>

      {/* Refresh Button */}
      <Box mb={4} textAlign="center">
        <MotionButton
          leftIcon={<RefreshCw size={16} />}
          colorScheme="purple"
          size="sm"
          onClick={handleRefreshTasks}
          isLoading={tasksLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          variant="outline"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {t('Refresh Tasks')}
        </MotionButton>
      </Box>

      {/* Tasks Section */}
      <Tabs
        variant="soft-rounded"
        colorScheme="purple"
        onChange={setTabIndex}
        isFitted
        size="sm"
      >
        <TabList mb={4} borderRadius="lg" bg="rgba(26, 32, 44, 0.5)" p={1}>
          <Tab
            _selected={{
              bg: 'purple.500',
              color: 'white',
            }}
          >
            <HStack>
              <Clock size={14} />
              <Text>{t('In Progress')}</Text>
              {tasks.filter(task => !task.completed).length > 0 && (
                <Badge colorScheme="blue" borderRadius="full" fontSize="xs">
                  {tasks.filter(task => !task.completed).length}
                </Badge>
              )}
            </HStack>
          </Tab>
          <Tab
            _selected={{
              bg: 'green.500',
              color: 'white',
            }}
          >
            <HStack>
              <CheckCircle size={14} />
              <Text>{t('Done')}</Text>
              {tasks.filter(task => task.completed).length > 0 && (
                <Badge colorScheme="green" borderRadius="full" fontSize="xs">
                  {tasks.filter(task => task.completed).length}
                </Badge>
              )}
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* In Progress Tasks */}
          <TabPanel px={0}>
            <AnimatePresence>
              {filteredTasks.length > 0 ? (
                <VStack spacing={3} align="stretch">
                  {filteredTasks.map((task, index) => (
                    <MotionBox
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
                    </MotionBox>
                  ))}
                </VStack>
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
                />
              )}
            </AnimatePresence>
          </TabPanel>

          {/* Completed Tasks */}
          <TabPanel px={0}>
            <AnimatePresence>
              {filteredTasks.length > 0 ? (
                <VStack spacing={3} align="stretch">
                  {filteredTasks.map((task, index) => (
                    <MotionBox
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
                    </MotionBox>
                  ))}
                </VStack>
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
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={isTaskDetailsOpen}
        onClose={() => setIsTaskDetailsOpen(false)}
        task={selectedTask}
      />

      {/* Error State */}
      {tasksError && tasks.length > 0 && (
        <MotionBox
          p={4}
          bg="red.900"
          color="white"
          borderRadius="md"
          borderWidth="1px"
          borderColor="red.300"
          mt={4}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <HStack>
            <AlertCircle />
            <Text>{tasksError}</Text>
          </HStack>
          <Button
            mt={2}
            colorScheme="red"
            size="sm"
            onClick={() => dispatch(fetchDailyTasks())}
          >
            {t('Try Again')}
          </Button>
        </MotionBox>
      )}
    </MotionBox>
  )
}

// Empty state component
const EmptyState = ({
  icon,
  title,
  description,
  buttonText,
  buttonIcon,
  onButtonClick,
  isLoading,
  variant = 'blue',
}) => {
  return (
    <Center py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        p={6}
        bg="rgba(26, 32, 44, 0.7)"
        borderRadius="xl"
        borderWidth="1px"
        borderColor={`${variant}.700`}
        textAlign="center"
        maxW="md"
        boxShadow={`0 0 20px rgba(0, 0, 0, 0.2)`}
      >
        <VStack spacing={4}>
          <MotionFlex
            boxSize="50px"
            borderRadius="full"
            bg={`${variant}.900`}
            color={`${variant}.300`}
            justify="center"
            align="center"
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
            <Icon as={icon} boxSize={6} />
          </MotionFlex>

          <Heading size="sm" color="white">
            {title}
          </Heading>

          <Text color="whiteAlpha.700" fontSize="sm">
            {description}
          </Text>

          {buttonText && onButtonClick && (
            <MotionButton
              mt={2}
              colorScheme={variant}
              leftIcon={buttonIcon && <Icon as={buttonIcon} />}
              onClick={onButtonClick}
              isLoading={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              size="sm"
            >
              {buttonText}
            </MotionButton>
          )}
        </VStack>
      </MotionBox>
    </Center>
  )
}

export default DailyTasksDashboard
