// components/quickClashComponents/dailyTasks/DailyTasksDashboard.jsx
import React, { useEffect, useCallback } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Flex,
  Spinner,
  Icon,
  useToast,
  HStack,
  Progress,
  Divider,
  Badge,
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
  Target,
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  fetchDailyTasks,
  refreshDailyTasks,
  fetchTaskStatistics,
  clearJustCompletedTask,
} from '../../../redux/quickClashDailyTasksSlice'
import TaskCard from './TaskCard'

const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionButton = motion(Button)
const MotionFlex = motion(Flex)

const DailyTasksDashboard = () => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const toast = useToast()

  // Select state from Redux
  const {
    tasks,
    tasksLoading,
    tasksError,
    justCompletedTaskId,
    statistics,
    statisticsLoading,
  } = useSelector(state => state.quickClashDailyTasks)

  // Handle task refresh
  const handleRefreshTasks = useCallback(async () => {
    try {
      await dispatch(refreshDailyTasks()).unwrap()
      toast({
        title: t('Tasks Refreshed'),
        description: t('Your daily tasks have been updated'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: t('Error'),
        description: error || t('Failed to refresh tasks'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [dispatch, toast, t])

  // Fetch tasks on component mount
  useEffect(() => {
    dispatch(fetchDailyTasks())
    dispatch(fetchTaskStatistics())

    // Clear the "just completed" task after 2 seconds
    if (justCompletedTaskId) {
      const timer = setTimeout(() => {
        dispatch(clearJustCompletedTask())
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [dispatch, justCompletedTaskId])

  // Calculate overall progress
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Group tasks by completion status
  const pendingTasks = tasks.filter(task => !task.completed)
  const completedTasksList = tasks.filter(task => task.completed)

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <MotionFlex
        bg="rgba(26, 32, 44, 0.7)"
        backdropFilter="blur(8px)"
        borderRadius="xl"
        p={4}
        mb={5}
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Box mb={{ base: 4, md: 0 }}>
          <HStack spacing={3} mb={1}>
            <Icon as={CalendarClock} color="purple.400" boxSize={6} />
            <MotionHeading
              size="md"
              color="white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {t('Daily Tasks')}
            </MotionHeading>

            {tasksLoading && <Spinner size="sm" color="purple.400" />}
          </HStack>

          <Text fontSize="sm" color="gray.400">
            {t('Complete tasks to earn XP')}
          </Text>
        </Box>

        <HStack spacing={3}>
          <MotionButton
            leftIcon={<RefreshCw size={16} />}
            colorScheme="blue"
            size="sm"
            onClick={handleRefreshTasks}
            isLoading={tasksLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={tasksLoading}
          >
            {t('Refresh')}
          </MotionButton>
        </HStack>
      </MotionFlex>

      {/* Daily Progress */}
      <MotionBox
        bg="rgba(26, 32, 44, 0.7)"
        borderRadius="lg"
        p={4}
        mb={5}
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
          <HStack>
            <Icon as={Target} color="green.400" boxSize={5} />
            <Heading size="sm" color="white">
              {t('Daily Progress')}
            </Heading>
          </HStack>

          <Badge
            colorScheme={overallProgress === 100 ? 'green' : 'blue'}
            fontSize="sm"
            py={1}
            px={2}
          >
            <HStack spacing={1}>
              {overallProgress === 100 ? (
                <Check size={14} />
              ) : (
                <Clock size={14} />
              )}
              <Text>
                {completedTasks}/{totalTasks} {t('Completed')}
              </Text>
            </HStack>
          </Badge>
        </Flex>

        <Progress
          value={overallProgress}
          size="md"
          colorScheme={overallProgress === 100 ? 'green' : 'blue'}
          borderRadius="full"
          bg="whiteAlpha.200"
          mb={2}
          isAnimated
        />

        {/* Stats summary */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4}>
          <StatCard
            icon={Award}
            title={t('Total XP Earned')}
            value={statisticsLoading ? '-' : statistics.rewards.xp}
            color="yellow.400"
          />

          <StatCard
            icon={Trophy}
            title={t('Completion Rate')}
            value={
              statisticsLoading
                ? '-'
                : `${Math.round(statistics.completionRate)}%`
            }
            color="green.400"
          />

          <StatCard
            icon={Target}
            title={t('Tasks')}
            value={
              statisticsLoading
                ? '-'
                : `${statistics.completedTasks}/${statistics.totalTasks}`
            }
            color="blue.400"
          />
        </SimpleGrid>
      </MotionBox>

      {/* Tasks Lists */}
      <Box>
        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <Box mb={6}>
            <HStack mb={3}>
              <Icon as={Clock} color="blue.400" boxSize={5} />
              <Heading size="sm" color="white">
                {t('In Progress')} ({pendingTasks.length})
              </Heading>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              <AnimatePresence>
                {pendingTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    isJustCompleted={task._id === justCompletedTaskId}
                  />
                ))}
              </AnimatePresence>
            </SimpleGrid>
          </Box>
        )}

        {/* Completed Tasks */}
        {completedTasksList.length > 0 && (
          <Box>
            <HStack mb={3}>
              <Icon as={Check} color="green.400" boxSize={5} />
              <Heading size="sm" color="white">
                {t('Completed')} ({completedTasksList.length})
              </Heading>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              <AnimatePresence>
                {completedTasksList.map(task => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </AnimatePresence>
            </SimpleGrid>
          </Box>
        )}

        {/* Error State */}
        {tasksError && (
          <MotionBox
            p={4}
            bg="red.900"
            color="white"
            borderRadius="md"
            borderWidth="1px"
            borderColor="red.300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            mb={4}
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

        {/* Empty State */}
        {!tasksLoading && tasks.length === 0 && !tasksError && (
          <MotionBox
            p={6}
            bg="rgba(26, 32, 44, 0.7)"
            borderRadius="lg"
            textAlign="center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <VStack spacing={3}>
              <Icon as={Target} boxSize={10} color="gray.400" />
              <Heading size="md" color="white">
                {t('No tasks available')}
              </Heading>
              <Text color="gray.400">
                {t('Check back later or refresh to get new tasks')}
              </Text>
              <Button
                mt={2}
                colorScheme="purple"
                leftIcon={<RefreshCw />}
                onClick={handleRefreshTasks}
              >
                {t('Refresh Tasks')}
              </Button>
            </VStack>
          </MotionBox>
        )}
      </Box>
    </MotionBox>
  )
}

// Stat Card Component
const StatCard = ({ icon, title, value, color }) => {
  const Icon = icon

  return (
    <MotionBox
      p={3}
      bg="rgba(26, 32, 44, 0.8)"
      borderRadius="md"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      _hover={{ bg: 'rgba(45, 55, 72, 0.8)' }}
    >
      <HStack spacing={3}>
        <Box
          p={2}
          borderRadius="full"
          bg={color}
          boxSize={10}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={20} color="white" />
        </Box>
        <Box>
          <Text fontSize="xs" color="gray.400">
            {title}
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="white">
            {value}
          </Text>
        </Box>
      </HStack>
    </MotionBox>
  )
}

export default DailyTasksDashboard
