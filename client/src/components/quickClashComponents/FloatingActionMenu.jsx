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
import { useNavigate } from 'react-router-dom'

// Import existing components to reuse
import QuickClashLeaderboardModal from './leaderboard/QuickClashLeaderboardModal'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

// Optimized animation variants - balanced for all devices
const menuItemVariants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    x: 20,
  },
  visible: i => ({
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      delay: i * 0.04,
      type: 'tween',
      duration: 0.2,
      ease: 'easeOut',
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.96,
    x: 20,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
}

// Simplified backdrop variants
const backdropVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
}

// Optimized label variants
const labelVariants = {
  hidden: {
    opacity: 0,
    x: -10,
  },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: 'tween',
      duration: 0.15,
      delay: delay * 0.03,
    },
  }),
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.1 },
  },
}

// Simplified arrow variants
const arrowVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 0.6,
    transition: {
      type: 'tween',
      duration: 0.15,
    },
  },
  hover: {
    opacity: 1,
    x: -2,
    transition: {
      type: 'tween',
      duration: 0.1,
    },
  },
}

// Simplified main button variants
const mainButtonVariants = {
  closed: {
    rotate: 0,
    background: 'linear-gradient(135deg, #805AD5 0%, #6B46C1 100%)',
  },
  open: {
    rotate: 45,
    background: 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)',
  },
}

// Memoized individual components for better performance
const NotificationIndicator = React.memo(({ count }) => {
  if (count <= 0) return null

  return (
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
          type: 'tween',
          duration: 0.2,
        },
        boxShadow: {
          repeat: Infinity,
          duration: 2,
          ease: 'easeInOut',
        },
      }}
    />
  )
})

const FloatingParticles = React.memo(() => {
  const particleData = useMemo(
    () => [
      {
        style: { top: '15%', left: '15%' },
        size: '6px',
        delay: 0.2,
        duration: 2,
      },
      {
        style: { bottom: '25%', right: '20%' },
        size: '4px',
        delay: 0.5,
        duration: 1.5,
      },
    ],
    [],
  )

  return (
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
      {particleData.map((particle, idx) => (
        <MotionBox
          key={idx}
          position="absolute"
          width={particle.size}
          height={particle.size}
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.8)"
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.3, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: particle.duration,
            delay: particle.delay,
          }}
          style={particle.style}
        />
      ))}
    </Box>
  )
})

const MenuItemBadge = React.memo(({ badge }) => {
  if (!badge) return null

  return (
    <MotionBox
      position="absolute"
      top="-8px"
      right="-4px"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'tween',
        duration: 0.2,
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
        {badge > 99 ? '99+' : badge}
      </Badge>
    </MotionBox>
  )
})

// Main component
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

  // Memoized selectors for better performance
  const notificationData = useSelector(
    state => ({
      updates: state.app.updates,
      unreadFriendRequests: state.app.unreadFriendRequests,
      notification: state.app.notification,
    }),
    (prev, next) =>
      prev.updates?.length === next.updates?.length &&
      prev.unreadFriendRequests === next.unreadFriendRequests &&
      prev.notification?.length === next.notification?.length,
  )

  // Memoized calculations
  const { unreadUpdatesCount, notificationCount } = useMemo(() => {
    const unreadUpdates =
      notificationData.updates?.filter(u => !u.read).length || 0
    const friendRequests = notificationData.unreadFriendRequests || 0
    const notificationItems = Array.isArray(notificationData.notification)
      ? notificationData.notification.length
      : 0

    return {
      unreadUpdatesCount: unreadUpdates,
      notificationCount: unreadUpdates + friendRequests + notificationItems,
    }
  }, [notificationData])

  // Load saved position on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('floatingMenuPosition')
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition)
        setPosition(parsed)
      } catch {
        setPosition({ x: window.innerWidth - 70, y: window.innerHeight - 160 })
      }
    } else {
      setPosition({ x: window.innerWidth - 70, y: window.innerHeight - 160 })
    }
  }, [])

  // Debounced position save
  const savePositionTimeoutRef = useRef()
  useEffect(() => {
    if (!isDragging) {
      clearTimeout(savePositionTimeoutRef.current)
      savePositionTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('floatingMenuPosition', JSON.stringify(position))
      }, 100)
    }
  }, [position, isDragging])

  // Optimized event handlers
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

  // Memoized click handlers
  const clickHandlers = useMemo(
    () => ({
      newChallenge: () => {
        onNewChallenge()
        onClose()
      },
      profile: () => {
        navigate(`/profile/${user?.inGameName}`, {
          state: { showQuickClash: true },
        })
        onClose()
      },
      inbox: () => {
        dispatch(setIsNotifDrawerOpen(true))
        onClose()
      },
      leaderboard: () => {
        setIsLeaderboardOpen(true)
        onClose()
      },
    }),
    [onNewChallenge, onClose, navigate, user, dispatch],
  )

  const handleLeaderboardClose = useCallback(() => {
    setIsLeaderboardOpen(false)
  }, [])

  // Memoized menu items
  const menuItems = useMemo(
    () => [
      {
        id: 'challenge',
        label: t('New Challenge'),
        icon: Sword,
        onClick: clickHandlers.newChallenge,
        gradient: 'linear(135deg, #FF6B6B 0%, #FF8E53 50%, #FF6B35 100%)',
        accentColor: '#FF6B6B',
        shadowColor: 'rgba(255, 107, 107, 0.4)',
      },
      {
        id: 'profile',
        label: t('Quick Profile'),
        icon: User,
        onClick: clickHandlers.profile,
        gradient: 'linear(135deg, #667eea 0%, #764ba2 50%, #8B5CF6 100%)',
        accentColor: '#667eea',
        shadowColor: 'rgba(139, 92, 246, 0.4)',
      },
      {
        id: 'inbox',
        label: t('Notifications'),
        icon: Bell,
        onClick: clickHandlers.inbox,
        gradient: 'linear(135deg, #4FC3F7 0%, #29B6F6 50%, #039BE5 100%)',
        accentColor: '#4FC3F7',
        shadowColor: 'rgba(79, 195, 247, 0.4)',
        badge: notificationCount > 0 ? notificationCount : null,
      },
      {
        id: 'leaderboard',
        label: t('Leaderboard'),
        icon: Trophy,
        onClick: clickHandlers.leaderboard,
        gradient: 'linear(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
        accentColor: '#FFD700',
        shadowColor: 'rgba(255, 215, 0, 0.4)',
      },
    ],
    [t, clickHandlers, notificationCount],
  )

  // Optimized container styles
  const containerStyles = useMemo(
    () => ({
      bg: 'rgba(255, 255, 255, 0.04)',
      backdropFilter: 'blur(20px)',
      borderRadius: '12px',
      border: '1px solid',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      boxShadow:
        '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      px: 3,
      py: 2.5,
      width: '220px',
      position: 'relative',
      overflow: 'visible',
      height: '44px',
      pointerEvents: 'auto',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    }),
    [],
  )

  return (
    <Portal>
      {/* Optimized Backdrop Overlay */}
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
        transition={{ type: 'tween', duration: 0.2 }}
        userSelect="none"
      >
        {/* Optimized Main Button */}
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
            type: 'tween',
            duration: 0.2,
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onDoubleClick={handleResetPosition}
        >
          {/* Notification Indicator */}
          <NotificationIndicator count={unreadUpdatesCount} />

          {/* Floating Particles */}
          {!isOpen && <FloatingParticles />}

          <Center>
            <Icon as={isOpen ? X : MenuIcon} boxSize={6} zIndex={2} />
          </Center>
        </MotionButton>

        {/* Optimized Action Menu Items */}
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
                    transition: { type: 'tween', duration: 0.1 },
                  }}
                >
                  <Box
                    {...containerStyles}
                    onClick={item.onClick}
                    cursor="pointer"
                    _hover={{
                      bg: 'rgba(255, 255, 255, 0.08)',
                      borderColor: item.accentColor,
                      boxShadow: `0 6px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px ${item.accentColor}30`,
                      transform: 'translateY(-0.5px)',
                    }}
                  >
                    <HStack
                      spacing={2}
                      align="center"
                      w="100%"
                      h="100%"
                      justify="space-between"
                    >
                      {/* Label */}
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

                      {/* Arrow */}
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
                          <Box
                            width="12px"
                            height="1.5px"
                            bg={`linear-gradient(to left, ${item.accentColor}, ${item.accentColor}60)`}
                            borderRadius="full"
                            boxShadow={`0 0 4px ${item.accentColor}40`}
                          />
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

                      {/* Button */}
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
                          <Icon as={item.icon} boxSize={4} color="white" />
                        </Button>

                        <MenuItemBadge badge={item.badge} />
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
