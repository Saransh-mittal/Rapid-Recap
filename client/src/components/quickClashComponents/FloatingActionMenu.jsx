// components/quickClashComponents/FloatingActionMenu.jsx - FIXED STYLING VERSION
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Menu as MenuIcon, X, Sword, Bell, User, Trophy } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { setIsNotifDrawerOpen } from '../../redux/appSlice'
import { useNavigate } from 'react-router-dom'

// Audio feedback
import { quizAudioService } from '../../services/quizAudioService'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from './utils/quickClashColors'

// Import existing components to reuse
import QuickClashLeaderboardModal from './leaderboard/QuickClashLeaderboardModal'

const MotionDiv = motion.div
const MotionButton = motion.button

// Constants
const MENU_SIZE = 60
const BOUNDARY_MARGIN = 10

// Custom Toast Hook
const useToast = () => {
  const showToast = useCallback(
    ({ title, description, status, duration = 2000, isClosable = true }) => {
      const toastEl = document.createElement('div')
      toastEl.className = `
      fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-xl max-w-sm
      ${
        status === 'error'
          ? 'bg-red-500/90 text-white'
          : status === 'success'
          ? 'bg-green-500/90 text-white'
          : status === 'warning'
          ? 'bg-orange-500/90 text-white'
          : 'bg-cyan-500/90 text-white'
      }
      backdrop-blur-md border border-white/20 transition-all duration-300
    `
      toastEl.innerHTML = `
      <div class="font-bold text-sm">${title}</div>
      <div class="text-xs mt-1 opacity-90">${description}</div>
      ${
        isClosable
          ? '<button class="absolute top-2 right-2 text-white/70 hover:text-white text-lg leading-none">×</button>'
          : ''
      }
    `

      document.body.appendChild(toastEl)

      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.remove()
        }
      }, duration)

      if (isClosable) {
        const closeBtn = toastEl.querySelector('button')
        if (closeBtn) {
          closeBtn.onclick = () => toastEl.remove()
        }
      }
    },
    [],
  )

  return { toast: showToast }
}

// Custom disclosure hook
const useDisclosure = (defaultIsOpen = false) => {
  const [isOpen, setIsOpen] = useState(defaultIsOpen)

  const onOpen = useCallback(() => setIsOpen(true), [])
  const onClose = useCallback(() => setIsOpen(false), [])
  const onToggle = useCallback(() => setIsOpen(prev => !prev), [])

  return { isOpen, onOpen, onClose, onToggle }
}

// Custom Portal Component
const Portal = ({ children }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null
  return document.body ? createPortal(children, document.body) : null
}

// Animation variants
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
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.96,
    x: 20,
    transition: {
      duration: 0.15,
    },
  },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

const labelVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.15,
      delay: delay * 0.03,
    },
  }),
  exit: { opacity: 0, x: -10, transition: { duration: 0.1 } },
}

const mainButtonVariants = {
  closed: { rotate: 0 },
  open: { rotate: 45 },
}

// Memoized components
const NotificationIndicator = React.memo(({ count }) => {
  if (count <= 0) return null

  return (
    <MotionDiv
      className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full shadow-lg z-30"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
        animation: 'pulse 2s infinite',
      }}
    />
  )
})

NotificationIndicator.displayName = 'NotificationIndicator'

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
    <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
      {particleData.map((particle, idx) => (
        <MotionDiv
          key={idx}
          className="absolute rounded-full bg-white/80"
          style={{
            width: particle.size,
            height: particle.size,
            ...particle.style,
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.3, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: particle.duration,
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  )
})

FloatingParticles.displayName = 'FloatingParticles'

const MenuItemBadge = React.memo(({ badge }) => {
  if (!badge) return null

  return (
    <MotionDiv
      className="absolute -top-2 -right-1 z-[100]"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="min-w-[16px] h-4 flex items-center justify-center rounded-full border-2 border-white text-white font-bold text-[10px] shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #FF416C, #FF4B2B)',
          boxShadow: '0 2px 8px rgba(255, 65, 108, 0.4)',
        }}
      >
        {badge > 99 ? '99+' : badge}
      </div>
    </MotionDiv>
  )
})

MenuItemBadge.displayName = 'MenuItemBadge'

// Main component with FIXED STYLING
const FloatingActionMenu = ({ onNewChallenge }) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const { isOpen, onToggle, onClose } = useDisclosure()
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const [menuAlignment, setMenuAlignment] = useState({
    openLeft: true,
    openTop: true,
  })

  // Use motion values for smooth dragging
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Get boundary constraints
  const getBoundaries = useCallback(() => {
    const width = window.innerWidth
    const height = window.innerHeight

    return {
      left: BOUNDARY_MARGIN,
      right: width - MENU_SIZE - BOUNDARY_MARGIN,
      top: BOUNDARY_MARGIN,
      bottom: height - MENU_SIZE - BOUNDARY_MARGIN,
    }
  }, [])

  // Initialize position
  useEffect(() => {
    const boundaries = getBoundaries()
    const initialX = boundaries.right
    const initialY = boundaries.bottom - 50

    x.set(initialX)
    y.set(initialY)
  }, [getBoundaries, x, y])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const boundaries = getBoundaries()
      const currentX = x.get()
      const currentY = y.get()

      const newX = Math.max(
        boundaries.left,
        Math.min(boundaries.right, currentX),
      )
      const newY = Math.max(
        boundaries.top,
        Math.min(boundaries.bottom, currentY),
      )

      x.set(newX)
      y.set(newY)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [getBoundaries, x, y])

  // Check menu alignment based on button position using motion values
  useEffect(() => {
    const updateAlignment = () => {
      const currentX = x.get()
      const currentY = y.get()

      // If button is in RIGHT half of screen → open menu LEFT
      const shouldOpenLeft = currentX > window.innerWidth / 2

      // If button is in BOTTOM half of screen → open menu UP (top)
      const shouldOpenTop = currentY > window.innerHeight / 2

      setMenuAlignment({
        openLeft: shouldOpenLeft,
        openTop: shouldOpenTop,
      })
    }

    // Update when menu opens or when dragging
    const unsubscribeX = x.onChange(updateAlignment)
    const unsubscribeY = y.onChange(updateAlignment)

    if (isOpen) {
      updateAlignment()
    }

    return () => {
      unsubscribeX()
      unsubscribeY()
    }
  }, [isOpen, x, y])

  // Memoized selectors
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

  // Calculate drag constraints
  const dragConstraints = useMemo(() => {
    const boundaries = getBoundaries()
    return {
      left: boundaries.left,
      right: boundaries.right,
      top: boundaries.top,
      bottom: boundaries.bottom,
    }
  }, [getBoundaries])

  // Drag handlers
  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    onClose()
  }, [onClose])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleResetPosition = useCallback(() => {
    const boundaries = getBoundaries()
    const defaultX = boundaries.right
    const defaultY = boundaries.bottom - 100

    x.set(defaultX)
    y.set(defaultY)

    toast({
      title: t('Position Reset'),
      description: t('Menu position has been reset to default'),
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }, [toast, t, getBoundaries, x, y])

  // Click handlers with sounds
  const clickHandlers = useMemo(
    () => ({
      newChallenge: () => {
        quizAudioService.playButtonClick()
        onNewChallenge()
        onClose()
      },
      profile: () => {
        quizAudioService.playButtonClick()
        navigate(`/profile/${user?.inGameName}`, {
          state: { showQuickClash: true },
        })
        onClose()
      },
      inbox: () => {
        quizAudioService.playButtonClick()
        dispatch(setIsNotifDrawerOpen(true))
        onClose()
      },
      leaderboard: () => {
        quizAudioService.playButtonClick()
        setIsLeaderboardOpen(true)
        onClose()
      },
    }),
    [onNewChallenge, onClose, navigate, user, dispatch],
  )

  const handleLeaderboardClose = useCallback(() => {
    setIsLeaderboardOpen(false)
  }, [])

  // Menu items
  const menuItems = useMemo(
    () => [
      {
        id: 'profile',
        label: t('Quick Profile'),
        icon: User,
        onClick: clickHandlers.profile,
        gradient:
          'linear-gradient(135deg, #06B6D4 0%, #0891B2 50%, #0E7490 100%)',
        accentColor: '#06B6D4',
        shadowColor: 'rgba(6, 182, 212, 0.4)',
      },
      {
        id: 'inbox',
        label: t('Notifications'),
        icon: Bell,
        onClick: clickHandlers.inbox,
        gradient:
          'linear-gradient(135deg, #0EA5E9 0%, #0284C7 50%, #0369A1 100%)',
        accentColor: '#0EA5E9',
        shadowColor: 'rgba(14, 165, 233, 0.4)',
        badge: notificationCount > 0 ? notificationCount : null,
      },
      {
        id: 'leaderboard',
        label: t('Leaderboard'),
        icon: Trophy,
        onClick: clickHandlers.leaderboard,
        gradient:
          'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
        accentColor: '#F59E0B',
        shadowColor: 'rgba(245, 158, 11, 0.4)',
      },
    ],
    [t, clickHandlers, notificationCount],
  )

  return (
    <Portal>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            className="fixed inset-0 z-[9998] cursor-pointer"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(15px)',
            }}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Draggable Menu using Motion Values */}
      <MotionDiv
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={dragConstraints}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="fixed z-[9999] matchmaking-floating-menu"
        style={{
          left: 0,
          top: 0,
          x,
          y,
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      >
        {/* Main Button */}
        <MotionButton
          className="w-[60px] h-[60px] rounded-full text-white relative overflow-hidden shadow-xl select-none focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          style={{
            background: isOpen
              ? 'linear-gradient(135deg, #EF4444, #DC2626)'
              : 'linear-gradient(135deg, #06B6D4, #0891B2)',
            boxShadow: isDragging
              ? '0 12px 30px rgba(0,0,0,0.5)'
              : '0 5px 15px rgba(0,0,0,0.3)',
          }}
          onClick={() => { isOpen ? quizAudioService.playDismiss() : quizAudioService.playButtonClick(); onToggle() }}
          variants={mainButtonVariants}
          animate={isOpen ? 'open' : 'closed'}
          whileHover={!isDragging ? { scale: 1.05 } : {}}
          whileTap={!isDragging ? { scale: 0.95 } : {}}
          onDoubleClick={handleResetPosition}
        >
          <NotificationIndicator count={unreadUpdatesCount} />
          {!isOpen && <FloatingParticles />}

          <div className="flex items-center justify-center w-full h-full z-20">
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </div>
        </MotionButton>

        {/* Menu Items - Simple Positioning */}
        <AnimatePresence mode="wait">
          {isOpen && (
            <div
              className={`
                absolute flex flex-col gap-3 pointer-events-auto w-max
                ${menuAlignment.openTop ? 'bottom-[70px]' : 'top-[70px]'}
                ${
                  menuAlignment.openLeft
                    ? '-translate-x-[calc(100%+50px)]'
                    : 'translate-x-0'
                }
              `}
            >
              {menuItems.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <MotionDiv
                    key={item.id}
                    custom={index}
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onHoverStart={() => setHoveredItem(item.id)}
                    onHoverEnd={() => setHoveredItem(null)}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div
                      className={`
                        ${QUICK_CLASH_CLASSES.glassLight} backdrop-blur-xl
                        rounded-lg border border-white/10 px-4 py-3
                        cursor-pointer transition-all duration-200 relative
                        hover:bg-white/10 hover:border-white/20
                        flex items-center justify-between gap-3 min-w-max
                      `}
                      onClick={item.onClick}
                      style={{
                        boxShadow:
                          '0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = item.accentColor
                        e.currentTarget.style.boxShadow = `0 6px 24px rgba(0, 0, 0, 0.2), 0 0 0 1px ${item.accentColor}40`
                        e.currentTarget.style.backgroundColor =
                          'rgba(255, 255, 255, 0.12)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor =
                          'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.boxShadow =
                          '0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                        e.currentTarget.style.backgroundColor =
                          'rgba(15, 23, 42, 0.2)'
                      }}
                    >
                      {/* Text Label */}
                      <MotionDiv
                        variants={labelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        custom={index}
                        className="flex-1"
                      >
                        <span
                          className="text-sm font-semibold text-white tracking-wide whitespace-nowrap"
                          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                        >
                          {item.label}
                        </span>
                      </MotionDiv>

                      {/* Icon Button */}
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={item.onClick}
                          className="w-8 h-8 rounded-lg border border-white/15 relative z-10 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900/50"
                          style={{
                            background: item.gradient,
                            boxShadow: `0 3px 12px ${item.shadowColor}`,
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.boxShadow = `0 5px 16px ${item.shadowColor}`
                            e.currentTarget.style.transform = 'translateY(-2px)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.boxShadow = `0 3px 12px ${item.shadowColor}`
                            e.currentTarget.style.transform = 'translateY(0)'
                          }}
                        >
                          <div
                            className="absolute inset-0 rounded-lg pointer-events-none"
                            style={{
                              background:
                                'linear-gradient(135deg, rgba(255, 255, 255, 0.15), transparent)',
                            }}
                          />
                          <IconComponent className="w-4 h-4 text-white relative z-10" />
                        </button>

                        <MenuItemBadge badge={item.badge} />
                      </div>
                    </div>
                  </MotionDiv>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </MotionDiv>

      {/* Leaderboard Modal */}
      <QuickClashLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={handleLeaderboardClose}
      />
    </Portal>
  )
}

export default React.memo(FloatingActionMenu)
