import React, {
  useState,
  useEffect,
  useRef,
  // lazy, // No longer needed for TaskPopup here
  // Suspense, // No longer needed for TaskPopup here
  useCallback,
  // useMemo, // No longer needed for pendingTasks badge
} from 'react'
import {
  Box,
  Icon,
  VStack,
  useDisclosure,
  Button,
  useToast,
  Portal,
  Center,
  Badge,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Menu as MenuIcon, X, Sword, Bell } from 'lucide-react' // Removed Users
import { useSelector, useDispatch } from 'react-redux' // Kept for potential future use, but not strictly needed now
import { setIsNotifDrawerOpen } from '../../redux/appSlice'

// Import existing components to reuse
import QuickClashLeaderboardButton from './leaderboard/QuickClashLeaderboardButton'
import { useMemo } from 'react'
// MatchmakingButton and GlobalMatchmakingButton are removed from here

// const TaskPopup = lazy(() => import('./dailyTasks/TaskPopup')) // TaskPopup is no longer triggered from here

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

// matchmakingButtonStyle is no longer needed here

const FloatingActionMenu = ({
  onNewChallenge /* onFindMatch prop is no longer used here */,
}) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const { isOpen, onToggle, onClose } = useDisclosure()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const toast = useToast()
  const menuRef = useRef(null)

  // Get task completion status and notification data from Redux
  const {
    justCompletedTaskId,
    tasks,
    updates,
    unreadFriendRequests,
    notification,
  } = useSelector(
    state => ({
      justCompletedTaskId: state.quickClashDailyTasks.justCompletedTaskId,
      tasks: state.quickClashDailyTasks.tasks,
      updates: state.app.updates,
      unreadFriendRequests: state.app.unreadFriendRequests,
      notification: state.app.notification,
    }),
    (prev, next) => {
      // Only re-render if these specific values changed
      return (
        prev.justCompletedTaskId === next.justCompletedTaskId &&
        prev.tasks.length === next.tasks.length &&
        prev.tasks.filter(t => !t.completed).length ===
          next.tasks.filter(t => !t.completed).length &&
        prev.updates?.length === next.updates?.length &&
        prev.unreadFriendRequests === next.unreadFriendRequests &&
        prev.notification?.length === next.notification?.length
      )
    },
  )
  const unreadUpdatesCount = useMemo(
    () => updates?.filter(u => !u.read).length || 0,
    [updates],
  )
  // Count pending tasks for the badge - memoize this calculation
  const pendingTasks = useMemo(
    () => tasks.filter(task => !task.completed).length,
    [tasks],
  )

  // Calculate notification count - memoize this calculation
  const notificationCount = useMemo(() => {
    const unreadUpdates = updates?.filter(u => !u.read).length || 0
    const friendRequests = unreadFriendRequests || 0
    const notificationItems = Array.isArray(notification)
      ? notification.length
      : 0
    return unreadUpdates + friendRequests + notificationItems
  }, [updates, unreadFriendRequests, notification])

  // Load saved position on mount
  useEffect(() => {
    setPosition({ x: window.innerWidth - 70, y: window.innerHeight - 160 })
  }, [])

  // Save position when it changes (but only when not dragging)
  useEffect(() => {
    if (!isDragging) {
      localStorage.setItem('floatingMenuPosition', JSON.stringify(position))
    }
  }, [position, isDragging])

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    onClose()
  }, [onClose])

  const handleDragEnd = useCallback((_, info) => {
    setIsDragging(false)
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

  const handleInboxClick = useCallback(() => {
    dispatch(setIsNotifDrawerOpen(true))
    onClose()
  }, [dispatch, onClose])

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
          {/* Red Dot Notification Indicator - NEW */}
          {unreadUpdatesCount > 0 && (
            <MotionBox
              position="absolute"
              top="8px"
              right="8px"
              width="12px"
              height="12px"
              borderRadius="full"
              bg="red.500"
              border="2px solid white"
              boxShadow="0 0 8px rgba(255, 0, 0, 0.6)"
              zIndex={3}
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                boxShadow: [
                  '0 0 8px rgba(255, 0, 0, 0.6)',
                  '0 0 12px rgba(255, 0, 0, 0.8)',
                  '0 0 8px rgba(255, 0, 0, 0.6)',
                ],
              }}
              transition={{
                scale: {
                  type: 'spring',
                  stiffness: 300,
                  damping: 15,
                },
                boxShadow: {
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                },
              }}
            />
          )}

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
          <Center>
            <Icon as={isOpen ? X : MenuIcon} boxSize={6} zIndex={2} />
          </Center>
        </MotionButton>

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
              <MotionBox
                custom={0} // First item
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
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
              </MotionBox>

              {/* Inbox Button - New addition for notifications */}
              <MotionBox
                custom={3}
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                position="relative"
              >
                <MotionButton
                  onClick={handleInboxClick}
                  size="md"
                  colorScheme="blue"
                  borderRadius="full"
                  width="48px"
                  height="48px"
                  bgGradient="linear(to-r, blue.500, cyan.500)"
                  boxShadow="0 4px 10px rgba(0,0,0,0.25)"
                  _hover={{ transform: 'translateY(-2px)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  userSelect="none"
                  position="relative"
                >
                  <Icon as={Bell} boxSize={5} />
                  {notificationCount > 0 && (
                    <Badge
                      position="absolute"
                      top="-2px"
                      right="-2px"
                      bg="red.500"
                      color="white"
                      borderRadius="full"
                      fontSize="xs"
                      minW="18px"
                      h="18px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      border="2px solid"
                      borderColor="blue.500"
                    >
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Badge>
                  )}
                </MotionButton>
              </MotionBox>

              <MotionBox
                custom={1} // Adjusted custom index
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                userSelect="none"
                exit="exit"
                sx={leaderboardButtonStyle}
              >
                <QuickClashLeaderboardButton />
              </MotionBox>
            </VStack>
          )}
        </AnimatePresence>
      </MotionBox>
    </Portal>
  )
}
export default React.memo(FloatingActionMenu)
