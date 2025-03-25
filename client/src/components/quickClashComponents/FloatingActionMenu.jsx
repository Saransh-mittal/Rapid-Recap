// components/quickClashComponents/FloatingActionMenu.jsx
import React, {
  useState,
  useEffect,
  useRef,
  lazy,
  Suspense,
  useCallback,
  useMemo,
} from 'react'
import {
  Box,
  Icon,
  VStack,
  useDisclosure,
  Button,
  useToast,
  Tooltip,
  Portal,
  Center,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Menu as MenuIcon, X, Sword } from 'lucide-react'
import { useSelector } from 'react-redux'

// Import existing components to reuse
import QuickClashLeaderboardButton from './leaderboard/QuickClashLeaderboardButton'
import MatchmakingButton from './MatchmakingButton'
import TaskProgressIndicator from './dailyTasks/TaskProgressIndicator'

// Lazy load the TaskPopup component
const TaskPopup = lazy(() => import('./dailyTasks/TaskPopup'))

const MotionBox = motion(Box)
const MotionButton = motion(Button)

// Pre-define animation variants outside component to prevent recreation on each render
const menuItemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: i => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      type: 'spring',
      stiffness: 240,
      damping: 20,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2 },
  },
}

// Main button animation variants
const mainButtonVariants = {
  closed: {
    rotate: 0,
    background: 'linear-gradient(135deg, #805AD5 0%, #6B46C1 100%)',
  },
  open: {
    rotate: 90,
    background: 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)',
  },
}

// Pre-define styles for menu item wrappers
const leaderboardButtonStyle = {
  '> div, > button': {
    position: 'static !important',
    transform: 'none !important',
    top: 'auto !important',
    left: 'auto !important',
    right: 'auto !important',
    bottom: 'auto !important',
  },
  '.chakra-button': {
    width: '48px !important',
    height: '48px !important',
    borderRadius: 'full !important',
    p: '0 !important',
    minWidth: 'auto !important',
  },
  '.chakra-button > span, .chakra-button > div > span': {
    display: 'none !important',
  },
}

const matchmakingButtonStyle = {
  button: {
    width: '48px',
    height: '48px',
    borderRadius: 'full',
    p: 0,
    minWidth: 'auto',
  },
  'button > span': {
    display: 'none',
  },
}

const FloatingActionMenu = ({ onNewChallenge, onFindMatch }) => {
  const { t } = useTranslation('QuickClash')
  const { isOpen, onToggle, onClose } = useDisclosure()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [showTaskPopup, setShowTaskPopup] = useState(false)
  const toast = useToast()
  const menuRef = useRef(null)

  // Get task completion status from Redux - only extract what we need
  const { justCompletedTaskId, tasks } = useSelector(
    state => ({
      justCompletedTaskId: state.quickClashDailyTasks.justCompletedTaskId,
      tasks: state.quickClashDailyTasks.tasks,
    }),
    (prev, next) => {
      // Only re-render if these specific values changed
      return (
        prev.justCompletedTaskId === next.justCompletedTaskId &&
        prev.tasks.length === next.tasks.length &&
        prev.tasks.filter(t => !t.completed).length ===
          next.tasks.filter(t => !t.completed).length
      )
    },
  )

  // Count pending tasks for the badge - memoize this calculation
  const pendingTasks = useMemo(
    () => tasks.filter(task => !task.completed).length,
    [tasks],
  )

  // Load saved position on mount
  useEffect(() => {
    // Set initial position once on component mount
    setPosition({ x: window.innerWidth - 70, y: window.innerHeight - 160 })
  }, [])

  // Save position when it changes (but only when not dragging)
  useEffect(() => {
    if (!isDragging) {
      localStorage.setItem('floatingMenuPosition', JSON.stringify(position))
    }
  }, [position, isDragging])

  // Show task popup when tasks are completed
  useEffect(() => {
    if (justCompletedTaskId) {
      setShowTaskPopup(true)
    }
  }, [justCompletedTaskId])

  // Memoize handlers to prevent recreating on each render
  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    onClose()
  }, [onClose])

  const handleDragEnd = useCallback((_, info) => {
    setIsDragging(false)

    // Update position while ensuring it stays within screen boundaries
    setPosition(prevPosition => {
      const newX = Math.max(
        20,
        Math.min(window.innerWidth - 70, prevPosition.x + info.offset.x),
      )
      const newY = Math.max(
        20,
        Math.min(window.innerHeight - 70, prevPosition.y + info.offset.y),
      )
      return { x: newX, y: newY }
    })
  }, [])

  const handleResetPosition = useCallback(() => {
    // Reset to default position
    const defaultPosition = {
      x: window.innerWidth - 80,
      y: window.innerHeight - 100,
    }
    setPosition(defaultPosition)
    localStorage.setItem(
      'floatingMenuPosition',
      JSON.stringify(defaultPosition),
    )

    toast({
      title: t('Position Reset'),
      description: t('Menu position has been reset to default'),
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }, [toast, t])

  const handleNewChallengeClick = useCallback(() => {
    onNewChallenge()
    onClose()
  }, [onNewChallenge, onClose])

  const handleViewTasksClick = useCallback(() => {
    setShowTaskPopup(true)
    onClose()
  }, [onClose])

  const handleCloseTaskPopup = useCallback(() => {
    setShowTaskPopup(false)
  }, [])

  const handleViewAllTasks = useCallback(() => {
    window.location.hash = 'tasks'
    // Don't close the popup here, let the component handle it
  }, [])

  return (
    <Portal>
      <MotionBox
        ref={menuRef}
        position="fixed"
        top={'60px'}
        className={'matchmaking-floating-menu'}
        zIndex={100}
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        initial={{ x: position.x, y: position.y }}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: 'spring', damping: 20 }}
        userSelect="none"
      >
        {/* Main button - gamified yet sleek */}
        <MotionButton
          width="60px"
          height="60px"
          borderRadius="full"
          userSelect="none"
          bgGradient={
            isOpen
              ? 'linear(to-br, red.500, red.600)'
              : 'linear(to-br, purple.500, purple.600)'
          }
          color="white"
          onClick={onToggle}
          boxShadow="0 5px 15px rgba(0,0,0,0.3)"
          position="relative"
          overflow="hidden"
          variants={mainButtonVariants}
          animate={isOpen ? 'open' : 'closed'}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onDoubleClick={handleResetPosition}
          _active={{ transform: 'scale(0.95)' }}
        >
          {/* Decorative element - subtle particle effect */}
          {!isOpen && (
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              overflow="hidden"
              borderRadius="full"
              pointerEvents="none"
            >
              <MotionBox
                position="absolute"
                top="15%"
                left="15%"
                width="6px"
                height="6px"
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.8)"
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: 0.2,
                }}
              />
              <MotionBox
                position="absolute"
                bottom="25%"
                right="20%"
                width="4px"
                height="4px"
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.8)"
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  delay: 0.5,
                }}
              />
            </Box>
          )}

          {/* Icon */}
          <Center>
            <Icon as={isOpen ? X : MenuIcon} boxSize={6} zIndex={2} />
          </Center>
        </MotionButton>

        {/* Menu items */}
        <AnimatePresence mode="wait">
          {isOpen && (
            <VStack
              position="absolute"
              bottom="70px"
              right="5px"
              spacing={3}
              align="flex-end"
              userSelect="none"
            >
              {/* New Challenge Button - Gamified but sleek */}
              <MotionBox
                custom={0}
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Tooltip
                  label={t('Start a New Challenge')}
                  placement="left"
                  hasArrow
                  openDelay={500}
                >
                  <MotionButton
                    onClick={handleNewChallengeClick}
                    size="md"
                    colorScheme="purple"
                    borderRadius="full"
                    width="48px"
                    height="48px"
                    bgGradient="linear(to-r, purple.500, pink.500)"
                    boxShadow="0 4px 10px rgba(0,0,0,0.25)"
                    _hover={{ transform: 'translateY(-2px)' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    userSelect="none"
                  >
                    <Icon as={Sword} boxSize={5} />
                  </MotionButton>
                </Tooltip>
              </MotionBox>

              {/* Find Match - Using MatchmakingButton but with wrapper for animation */}
              <MotionBox
                custom={1}
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                sx={matchmakingButtonStyle}
              >
                <MatchmakingButton compact={true} />
              </MotionBox>

              {/* Leaderboard Button - Fix positioning issue */}
              <MotionBox
                custom={2}
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                userSelect="none"
                exit="exit"
                sx={leaderboardButtonStyle}
              >
                <QuickClashLeaderboardButton />
              </MotionBox>

              {/* View Tasks Button - With dynamic badge for pending tasks */}
              <MotionBox
                custom={3}
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                position="relative"
              >
                <TaskProgressIndicator
                  onViewTasks={handleViewTasksClick}
                  size="md"
                />
              </MotionBox>
            </VStack>
          )}
        </AnimatePresence>

        {/* Task Popup - only render when needed */}
        {showTaskPopup && (
          <Suspense fallback={null}>
            <TaskPopup
              onViewAllTasks={handleViewAllTasks}
              isOpen={showTaskPopup}
              onClose={handleCloseTaskPopup}
            />
          </Suspense>
        )}
      </MotionBox>
    </Portal>
  )
}

// Use React.memo to prevent unnecessary re-renders
export default React.memo(FloatingActionMenu)
