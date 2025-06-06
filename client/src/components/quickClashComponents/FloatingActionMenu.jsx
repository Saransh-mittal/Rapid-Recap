import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Box,
  Icon,
  VStack,
  HStack,
  useDisclosure,
  Button,
  useToast,
  Portal,
  Center,
  Badge,
  Text,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Menu as MenuIcon, X, Sword, Bell, User, Trophy } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { setIsNotifDrawerOpen } from '../../redux/appSlice'

// Import existing components to reuse
import QuickClashLeaderboardModal from './leaderboard/QuickClashLeaderboardModal'
import { useNavigate } from 'react-router-dom'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

// Enhanced animation variants with sleeker transitions
const menuItemVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    x: 30,
    y: 5,
  },
  visible: i => ({
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    transition: {
      delay: i * 0.06,
      type: 'spring',
      stiffness: 350,
      damping: 28,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.95,
    x: 30,
    y: 5,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
}

// Backdrop animation variants
const backdropVariants = {
  hidden: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
  },
  visible: {
    opacity: 1,
    backdropFilter: 'blur(15px)',
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: {
      duration: 0.25,
      ease: 'easeIn',
    },
  },
}

// Label animation variants
const labelVariants = {
  hidden: {
    opacity: 0,
    x: -15,
    scale: 0.9,
  },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
      delay: delay * 0.04,
    },
  }),
  exit: {
    opacity: 0,
    x: -15,
    scale: 0.9,
    transition: { duration: 0.15 },
  },
}

// Enhanced arrow animation variants - pointing from right to left
const arrowVariants = {
  hidden: {
    opacity: 0,
    x: 5,
    scaleX: 0.5,
  },
  visible: {
    opacity: 0.6,
    x: 0,
    scaleX: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
  hover: {
    opacity: 1,
    x: -3,
    scaleX: 1.2,
    transition: {
      type: 'spring',
      stiffness: 600,
      damping: 20,
    },
  },
}

// Original main button animation variants
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

// Sleek container for premium look
const BUTTON_CONTAINER_WIDTH = '220px'

// Sleek, premium button container styles
const buttonContainerStyle = {
  bg: 'rgba(255, 255, 255, 0.04)',
  backdropFilter: 'blur(20px)',
  borderRadius: '12px',
  border: '1px solid',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  boxShadow:
    '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  px: 3,
  py: 2.5,
  width: BUTTON_CONTAINER_WIDTH,
  position: 'relative',
  overflow: 'visible',
  height: '44px',
  pointerEvents: 'auto',
  _before: {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
    borderRadius: '12px',
    pointerEvents: 'none',
  },
}

const FloatingActionMenu = ({ onNewChallenge }) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const { isOpen, onToggle, onClose } = useDisclosure()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
  const toast = useToast()
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)

  // Get notification data from Redux
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
      return (
        prev.justCompletedTaskId === next.justCompletedTaskId &&
        prev.tasks.length === next.tasks.length &&
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

  // Calculate notification count
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

  // Save position when it changes
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
    console.log('New Challenge clicked') // Debug log
    onNewChallenge()
    onClose()
  }, [onNewChallenge, onClose])

  const handleProfileClick = useCallback(() => {
    console.log('Profile clicked') // Debug log
    navigate(`/profile/${user?.inGameName}`, {
      state: { showQuickClash: true },
    })
    onClose()
  }, [navigate, onClose, user])

  const handleInboxClick = useCallback(() => {
    console.log('Inbox clicked') // Debug log
    dispatch(setIsNotifDrawerOpen(true))
    onClose()
  }, [dispatch, onClose])

  const handleLeaderboardClick = useCallback(() => {
    console.log('Leaderboard clicked') // Debug log
    setIsLeaderboardOpen(true)
    onClose()
  }, [])

  const handleLeaderboardClose = useCallback(() => {
    setIsLeaderboardOpen(false)
  }, [])

  // Enhanced menu items with better design
  const menuItems = [
    {
      id: 'challenge',
      label: t('New Challenge'),
      icon: Sword,
      onClick: handleNewChallengeClick,
      gradient: 'linear(135deg, #FF6B6B 0%, #FF8E53 50%, #FF6B35 100%)',
      iconColor: 'white',
      accentColor: '#FF6B6B',
      shadowColor: 'rgba(255, 107, 107, 0.4)',
    },
    {
      id: 'profile',
      label: t('Quick Profile'),
      icon: User,
      onClick: handleProfileClick,
      gradient: 'linear(135deg, #667eea 0%, #764ba2 50%, #8B5CF6 100%)',
      iconColor: 'white',
      accentColor: '#667eea',
      shadowColor: 'rgba(139, 92, 246, 0.4)',
    },
    {
      id: 'inbox',
      label: t('Notifications'),
      icon: Bell,
      onClick: handleInboxClick,
      gradient: 'linear(135deg, #4FC3F7 0%, #29B6F6 50%, #039BE5 100%)',
      iconColor: 'white',
      accentColor: '#4FC3F7',
      shadowColor: 'rgba(79, 195, 247, 0.4)',
      badge: notificationCount > 0 ? notificationCount : null,
    },
    {
      id: 'leaderboard',
      label: t('Leaderboard'),
      icon: Trophy,
      onClick: handleLeaderboardClick,
      gradient: 'linear(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
      iconColor: 'white',
      accentColor: '#FFD700',
      shadowColor: 'rgba(255, 215, 0, 0.4)',
    },
  ]

  return (
    <Portal>
      {/* Enhanced Backdrop Overlay with subtle pattern */}
      <AnimatePresence>
        {isOpen && (
          <MotionBox
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(0, 0, 0, 0.5)"
            backdropFilter="blur(15px)"
            zIndex={99}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            cursor="pointer"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 25% 25%, rgba(128, 90, 213, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)
              `,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Floating Menu Container */}
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
        {/* Original Main Button Design */}
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
          {/* Original Notification Indicator */}
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

          {/* Original Floating Particles */}
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

        {/* Enhanced Action Menu Items */}
        <AnimatePresence mode="wait">
          {isOpen && (
            <VStack
              position="absolute"
              bottom="70px"
              right="5px"
              spacing={2.5}
              align="flex-end"
              userSelect="none"
            >
              {/* Enhanced Menu Items - Text → Arrow → Icon layout */}
              {menuItems.map((item, index) => (
                <MotionBox
                  key={item.id}
                  custom={index}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onHoverStart={() => setHoveredItem(item.id)}
                  onHoverEnd={() => setHoveredItem(null)}
                  whileHover={{
                    scale: 1.01,
                    y: -1,
                    transition: { type: 'spring', stiffness: 400, damping: 30 },
                  }}
                >
                  <Box
                    {...buttonContainerStyle}
                    onClick={item.onClick}
                    cursor="pointer"
                    _hover={{
                      bg: 'rgba(255, 255, 255, 0.08)',
                      borderColor: item.accentColor,
                      boxShadow: `0 6px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px ${item.accentColor}30`,
                      transform: 'translateY(-0.5px)',
                    }}
                    transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    <HStack
                      spacing={2}
                      align="center"
                      w="100%"
                      h="100%"
                      justify="space-between"
                    >
                      {/* Sleek Label on Left */}
                      <MotionBox
                        variants={labelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        custom={index}
                        flex={1}
                        minW="0"
                      >
                        <Text
                          fontSize="sm"
                          fontWeight="600"
                          color="white"
                          whiteSpace="nowrap"
                          textShadow="0 1px 4px rgba(0,0,0,0.4)"
                          letterSpacing="0.2px"
                        >
                          {item.label}
                        </Text>
                      </MotionBox>

                      {/* Sleek Arrow pointing from Icon to Text */}
                      <MotionBox
                        variants={arrowVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={
                          hoveredItem === item.id ? 'hover' : 'visible'
                        }
                        custom={index}
                        flexShrink={0}
                        mx={1}
                      >
                        <Box
                          position="relative"
                          width="16px"
                          height="1.5px"
                          display="flex"
                          alignItems="center"
                        >
                          {/* Arrow Line */}
                          <Box
                            width="12px"
                            height="1.5px"
                            bg={`linear-gradient(to left, ${item.accentColor}, ${item.accentColor}60)`}
                            borderRadius="full"
                            boxShadow={`0 0 4px ${item.accentColor}40`}
                          />
                          {/* Arrow Head */}
                          <Box
                            position="absolute"
                            left="0"
                            width="0"
                            height="0"
                            borderTop="3px solid transparent"
                            borderBottom="3px solid transparent"
                            borderRight={`5px solid ${item.accentColor}`}
                            filter={`drop-shadow(0 0 2px ${item.accentColor}40)`}
                          />
                        </Box>
                      </MotionBox>

                      {/* Sleek Button on Right */}
                      <Box position="relative" flexShrink={0}>
                        <Button
                          onClick={item.onClick}
                          size="sm"
                          borderRadius="10px"
                          width="36px"
                          height="36px"
                          bgGradient={item.gradient}
                          boxShadow={`0 2px 12px ${item.shadowColor}`}
                          _hover={{
                            transform: 'translateY(-1px)',
                            boxShadow: `0 4px 16px ${item.shadowColor}`,
                          }}
                          _active={{
                            transform: 'scale(0.95)',
                          }}
                          userSelect="none"
                          border="1px solid"
                          borderColor="rgba(255, 255, 255, 0.15)"
                          transition="all 0.2s ease"
                          cursor="pointer"
                          zIndex={10}
                          position="relative"
                          _before={{
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              'linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent)',
                            borderRadius: '10px',
                            pointerEvents: 'none',
                          }}
                        >
                          <Icon
                            as={item.icon}
                            boxSize={4}
                            color={item.iconColor}
                          />
                        </Button>

                        {/* Compact Badge */}
                        {item.badge && (
                          <MotionBox
                            position="absolute"
                            top="-8px"
                            right="-4px"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 25,
                            }}
                            zIndex={100}
                          >
                            <Badge
                              bg="linear-gradient(135deg, #FF416C, #FF4B2B)"
                              color="white"
                              borderRadius="full"
                              fontSize="2xs"
                              minW="16px"
                              h="16px"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              border="2px solid white"
                              boxShadow="0 2px 8px rgba(255, 65, 108, 0.4)"
                              fontWeight="bold"
                            >
                              {item.badge > 99 ? '99+' : item.badge}
                            </Badge>
                          </MotionBox>
                        )}
                      </Box>
                    </HStack>
                  </Box>
                </MotionBox>
              ))}
            </VStack>
          )}
        </AnimatePresence>
      </MotionBox>

      {/* Leaderboard Modal */}
      <QuickClashLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={handleLeaderboardClose}
      />
    </Portal>
  )
}

export default React.memo(FloatingActionMenu)
