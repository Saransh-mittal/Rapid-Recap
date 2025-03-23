// components/quickClashComponents/dailyTasks/TaskDetailsModal.jsx
import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  Button,
  Icon,
  Flex,
  Divider,
  SimpleGrid,
  useToast,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Award,
  Target,
  Clock,
  Star,
  Gift,
  Info,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Trophy,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { claimTaskReward } from '../../../redux/quickClashDailyTasksSlice'
import { format, formatDistanceToNow } from 'date-fns'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)

// Task type to details mapping for UI display - moved outside component to avoid re-creation
const TASK_TYPE_DETAILS = {
  COMPLETE_CHALLENGES: {
    icon: Target,
    color: 'blue',
    description: 'Complete Quick Clash challenges against opponents',
    benefit: 'Improves your knowledge and game skills',
  },
  ACHIEVE_RQM_SCORE: {
    icon: Target,
    color: 'purple',
    description: 'Reach certain Reading Quality Metric scores in challenges',
    benefit: 'Enhances your reading comprehension abilities',
  },
  WIN_CHALLENGES: {
    icon: Trophy,
    color: 'yellow',
    description: 'Win Quick Clash challenges against opponents',
    benefit: 'Boosts your ranking and confidence',
  },
  PLAY_CONSECUTIVE_DAYS: {
    icon: Clock,
    color: 'green',
    description: 'Play Quick Clash on consecutive days',
    benefit: 'Develops a consistent learning habit',
  },
  CHALLENGE_FRIEND: {
    icon: Target,
    color: 'pink',
    description: 'Invite friends to compete in Quick Clash',
    benefit: 'Expands your knowledge network',
  },
  DEFAULT: {
    icon: Info,
    color: 'gray',
    description: 'Complete this task to earn rewards',
    benefit: 'Improves your Quick Clash experience',
  },
}

/**
 * Detailed modal for displaying comprehensive task information
 * Shows statistics, progress, and allows reward claiming
 */
const TaskDetailsModal = ({ isOpen, onClose, task }) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const toast = useToast()

  // ⚠️ IMPORTANT: All hooks must be called unconditionally at the top level
  // Handle reward claim
  const handleClaimReward = React.useCallback(() => {
    if (!task) return

    dispatch(claimTaskReward(task._id))
      .unwrap()
      .then(result => {
        toast({
          title: t('Reward Claimed!'),
          description: t('You received {xp} XP', { xp: result.reward.xp }),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onClose()
      })
      .catch(error => {
        toast({
          title: t('Error'),
          description: error || t('Failed to claim reward'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      })
  }, [dispatch, task, toast, t, onClose])

  // Calculate progress percentage - always computed, even if task is null
  const progressPercentage = React.useMemo(() => {
    if (!task) return 0
    return Math.min(100, Math.round((task.progress / task.target) * 100))
  }, [task])

  // Get task type details - always computed, even if task is null
  const taskTypeDetails = React.useMemo(() => {
    if (!task) return TASK_TYPE_DETAILS.DEFAULT
    return TASK_TYPE_DETAILS[task.taskType] || TASK_TYPE_DETAILS.DEFAULT
  }, [task])

  // Determine difficulty stars - always computed, even if task is null
  const difficultyStars = React.useMemo(() => {
    if (!task) return []
    return [...Array(task.difficulty || 0)].map((_, i) => (
      <Icon key={i} as={Star} color="yellow.400" boxSize={4} />
    ))
  }, [task])

  // Time remaining - always computed even if task is null
  const timeLeft = React.useMemo(() => {
    if (!task) return ''
    const expiryDate = new Date(task.expiresAt)
    return formatDistanceToNow(expiryDate, { addSuffix: true })
  }, [task])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  }

  // Return null after all hooks have been called
  if (!task || !isOpen) return null

  // Format date strings
  const createdDate = new Date(task.assignedAt)
  const expiryDate = new Date(task.expiresAt)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'lg' }}
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(8px)" bg="rgba(0, 0, 0, 0.7)" />
      <ModalContent
        as={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        bg="rgba(17, 25, 40, 0.95)"
        backdropFilter="blur(10px)"
        borderRadius="xl"
        borderWidth="1px"
        borderColor={`${taskTypeDetails.color}.600`}
        overflow="hidden"
        boxShadow={`0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(var(--chakra-colors-${taskTypeDetails.color}-500-raw), 0.5)`}
      >
        {/* Enhanced modal header with dark gradient background */}
        <Box
          position="relative"
          bg="#1a1527"
          pt={3}
          pb={4}
          borderBottom="1px solid rgba(255,255,255,0.1)"
        >
          {/* Background gradient */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgGradient={`linear(to-b, rgba(40,30,50,0.8), #1a1527)`}
            opacity={0.9}
            zIndex={0}
          />

          {/* Golden accent line */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            height="2px"
            bgGradient="linear(to-r, #FFC759, #5D4037, #FFC759)"
            zIndex={1}
          />

          <ModalHeader
            position="relative"
            zIndex={2}
            color="white"
            p={0}
            px={5}
            pb={1}
            display="flex"
            flexDirection="column"
          >
            {/* Task Details title with Icon */}
            <HStack mb={3} spacing={3} align="center">
              <Flex
                w="42px"
                h="42px"
                borderRadius="full"
                bg="rgba(255,199,89,0.2)"
                border="1px solid"
                borderColor="yellow.400"
                justify="center"
                align="center"
                boxShadow="0 0 10px rgba(255,199,89,0.3)"
              >
                <Icon
                  as={taskTypeDetails.icon}
                  color="yellow.400"
                  boxSize={5}
                />
              </Flex>
              <Text
                fontSize="xl"
                fontWeight="semibold"
                bgGradient="linear(to-r, yellow.300, white)"
                bgClip="text"
                letterSpacing="tight"
              >
                {t('Task Details')}
              </Text>
            </HStack>

            {/* Task title */}
            <Text
              fontSize="2xl"
              fontWeight="bold"
              noOfLines={2}
              pr={8}
              color="white"
              letterSpacing="tight"
              lineHeight="1.2"
            >
              {task.title}
            </Text>
          </ModalHeader>

          <ModalCloseButton
            color="whiteAlpha.800"
            size="lg"
            top={4}
            right={4}
            _hover={{
              bg: 'rgba(255,255,255,0.1)',
              color: 'white',
            }}
            zIndex={999}
          />
        </Box>

        <ModalBody pb={6}>
          {/* Task description */}
          <Box mb={5}>
            <Text color="whiteAlpha.800" fontSize="md">
              {task.description}
            </Text>
          </Box>

          {/* Progress circular indicator */}
          <Flex justify="center" mb={6}>
            <VStack>
              <Box position="relative" width="120px" height="120px">
                {/* Background circle */}
                <Box
                  as="svg"
                  viewBox="0 0 100 100"
                  width="100%"
                  height="100%"
                  position="absolute"
                  top="0"
                  left="0"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="3"
                  />
                </Box>

                {/* Progress arc */}
                <Box
                  as="svg"
                  viewBox="0 0 100 100"
                  width="100%"
                  height="100%"
                  position="absolute"
                  top="0"
                  left="0"
                  style={{ transform: 'rotate(-90deg)' }}
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={
                      task.completed
                        ? 'rgba(72, 187, 120, 1)'
                        : `rgba(var(--chakra-colors-${taskTypeDetails.color}-400-raw), 1)`
                    }
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * progressPercentage) / 100}
                    style={{
                      transition: 'stroke-dashoffset 0.8s ease-out',
                    }}
                  />
                </Box>

                {/* Percentage text */}
                <Flex
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  align="center"
                  justify="center"
                  direction="column"
                >
                  <Text
                    fontSize="4xl"
                    fontWeight="bold"
                    color="white"
                    lineHeight="1"
                  >
                    {progressPercentage}%
                  </Text>
                </Flex>
              </Box>

              <HStack mt={2}>
                <Badge
                  colorScheme={task.completed ? 'green' : taskTypeDetails.color}
                  py={1}
                  px={2}
                  borderRadius="md"
                >
                  <HStack spacing={1}>
                    <Icon
                      as={task.completed ? CheckCircle : Target}
                      boxSize="3"
                    />
                    <Text>
                      {task.progress} / {task.target}
                    </Text>
                  </HStack>
                </Badge>

                {task.completed && (
                  <Badge
                    colorScheme={task.rewardClaimed ? 'gray' : 'yellow'}
                    py={1}
                    px={2}
                    borderRadius="md"
                  >
                    <HStack spacing={1}>
                      <Icon as={Gift} boxSize="3" />
                      <Text>
                        {task.rewardClaimed ? t('Claimed') : t('Unclaimed')}
                      </Text>
                    </HStack>
                  </Badge>
                )}
              </HStack>
            </VStack>
          </Flex>

          <Divider mb={5} borderColor="whiteAlpha.200" />

          {/* Task stats */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={5}>
            {/* Difficulty */}
            <HStack
              bg="rgba(26, 32, 44, 0.5)"
              borderRadius="md"
              p={3}
              borderWidth="1px"
              borderColor="yellow.800"
            >
              <Box
                borderRadius="md"
                bg="yellow.900"
                p={2}
                color="yellow.400"
                boxSize="40px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={Star} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0} flex={1}>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {t('Difficulty')}
                </Text>
                <Flex mt={1}>{difficultyStars}</Flex>
              </VStack>
            </HStack>

            {/* Reward */}
            <HStack
              bg="rgba(26, 32, 44, 0.5)"
              borderRadius="md"
              p={3}
              borderWidth="1px"
              borderColor="purple.800"
            >
              <Box
                borderRadius="md"
                bg="purple.900"
                p={2}
                color="purple.400"
                boxSize="40px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={Award} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0} flex={1}>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {t('Reward')}
                </Text>
                <Text color="white" fontWeight="bold" fontSize="lg">
                  {task.reward.xp} XP
                </Text>
              </VStack>
            </HStack>

            {/* Time */}
            <HStack
              bg="rgba(26, 32, 44, 0.5)"
              borderRadius="md"
              p={3}
              borderWidth="1px"
              borderColor="blue.800"
            >
              <Box
                borderRadius="md"
                bg="blue.900"
                p={2}
                color="blue.400"
                boxSize="40px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={Clock} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0} flex={1}>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {t('Time Remaining')}
                </Text>
                <Text color="white" fontWeight="medium">
                  {timeLeft}
                </Text>
              </VStack>
            </HStack>

            {/* Type */}
            <HStack
              bg="rgba(26, 32, 44, 0.5)"
              borderRadius="md"
              p={3}
              borderWidth="1px"
              borderColor={`${taskTypeDetails.color}.800`}
            >
              <Box
                borderRadius="md"
                bg={`${taskTypeDetails.color}.900`}
                p={2}
                color={`${taskTypeDetails.color}.400`}
                boxSize="40px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={taskTypeDetails.icon} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0} flex={1}>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {t('Task Type')}
                </Text>
                <Text color="white" fontWeight="medium">
                  {task.taskType
                    .split('_')
                    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
                    .join(' ')}
                </Text>
              </VStack>
            </HStack>
          </SimpleGrid>

          {/* Task explanation */}
          <Box
            bg="rgba(26, 32, 44, 0.5)"
            p={4}
            borderRadius="md"
            mb={5}
            borderWidth="1px"
            borderColor="whiteAlpha.200"
          >
            <Text color="white" fontWeight="medium" mb={2}>
              {t('About This Task')}
            </Text>
            <Text color="whiteAlpha.700" fontSize="sm" mb={3}>
              {taskTypeDetails.description}
            </Text>

            <HStack spacing={2} mt={2}>
              <Icon
                as={Sparkles}
                color={`${taskTypeDetails.color}.400`}
                boxSize={4}
              />
              <Text
                color={`${taskTypeDetails.color}.300`}
                fontSize="sm"
                fontWeight="medium"
              >
                {t('Benefit')}: {taskTypeDetails.benefit}
              </Text>
            </HStack>
          </Box>

          {/* Dates */}
          <SimpleGrid columns={2} spacing={4}>
            <VStack align="start" spacing={0}>
              <Text color="whiteAlpha.600" fontSize="xs">
                {t('Created')}
              </Text>
              <Text color="whiteAlpha.900" fontSize="sm">
                {format(createdDate, 'PP')}
              </Text>
            </VStack>

            <VStack align="start" spacing={0}>
              <Text color="whiteAlpha.600" fontSize="xs">
                {t('Expires')}
              </Text>
              <Text color="whiteAlpha.900" fontSize="sm">
                {format(expiryDate, 'PP')}
              </Text>
            </VStack>
          </SimpleGrid>
        </ModalBody>

        <ModalFooter
          bg="rgba(20, 25, 35, 0.7)"
          borderTop="1px solid"
          borderColor="whiteAlpha.100"
        >
          {task.completed && !task.rewardClaimed ? (
            <MotionButton
              leftIcon={<Gift />}
              rightIcon={<ArrowRight size={16} />}
              colorScheme="yellow"
              onClick={handleClaimReward}
              size="lg"
              fontSize="md"
              px={8}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {t('Claim {xp} XP', { xp: task.reward.xp })}
            </MotionButton>
          ) : (
            <Button colorScheme="gray" onClick={onClose} px={6}>
              {t('Close')}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default React.memo(TaskDetailsModal)
