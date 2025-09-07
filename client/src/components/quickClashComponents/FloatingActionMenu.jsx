// components/quickClashComponents/FloatingActionMenu.jsx - FAITHFUL CONVERSION to Tailwind with Blue-Cyan Color Scheme
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Menu as MenuIcon, X, Sword, Bell, User, Trophy } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { setIsNotifDrawerOpen } from '../../redux/appSlice'
import { useNavigate } from 'react-router-dom'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from './utils/quickClashColors'

// Import existing components to reuse
import QuickClashLeaderboardModal from './leaderboard/QuickClashLeaderboardModal'

const MotionDiv = motion.div
const MotionButton = motion.button

// Custom Toast Hook (matching previous implementations)
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

      // Auto remove after duration
      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.remove()
        }
      }, duration)

      // Close button functionality
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

// Custom disclosure hook (replacing Chakra's useDisclosure)
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

// Animation variants - EXACTLY as original
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

const mainButtonVariants = {
  closed: {
    rotate: 0,
  },
  open: {
    rotate: 45,
  },
}

// Memoized components - EXACTLY as original logic with Tailwind styling
const NotificationIndicator = React.memo(({ count }) => {
  if (count <= 0) return null

  return (
    <MotionDiv
      className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full shadow-lg z-30"
      initial={{ scale: 0 }}
      animate={{
        scale: 1,
      }}
      transition={{
        scale: {
          type: 'tween',
          duration: 0.2,
        },
      }}
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
      transition={{
        type: 'tween',
        duration: 0.2,
      }}
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

// Main component - FAITHFUL CONVERSION with blue-cyan theme
const FloatingActionMenu = ({ onNewChallenge }) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const { isOpen, onToggle, onClose } = useDisclosure()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
  const { toast } = useToast()
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)

  // Memoized selectors - EXACTLY as original
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

  // Memoized calculations - EXACTLY as original
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

  // ALL ORIGINAL EFFECTS AND HANDLERS PRESERVED EXACTLY

  // Load saved position on mount - EXACTLY as original
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

  // Debounced position save - EXACTLY as original
  const savePositionTimeoutRef = useRef()
  useEffect(() => {
    if (!isDragging) {
      clearTimeout(savePositionTimeoutRef.current)
      savePositionTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('floatingMenuPosition', JSON.stringify(position))
      }, 100)
    }
  }, [position, isDragging])

  // Event handlers - EXACTLY as original
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

  // Click handlers - EXACTLY as original
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

  // Menu items with updated blue-cyan harmonious colors
  const menuItems = useMemo(
    () => [
      {
        id: 'challenge',
        label: t('New Challenge'),
        icon: Sword,
        onClick: clickHandlers.newChallenge,
        gradient:
          'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)', // Red for challenge action
        accentColor: '#EF4444',
        shadowColor: 'rgba(239, 68, 68, 0.4)',
      },
      {
        id: 'profile',
        label: t('Quick Profile'),
        icon: User,
        onClick: clickHandlers.profile,
        gradient:
          'linear-gradient(135deg, #06B6D4 0%, #0891B2 50%, #0E7490 100%)', // Blue-cyan theme
        accentColor: '#06B6D4',
        shadowColor: 'rgba(6, 182, 212, 0.4)',
      },
      {
        id: 'inbox',
        label: t('Notifications'),
        icon: Bell,
        onClick: clickHandlers.inbox,
        gradient:
          'linear-gradient(135deg, #0EA5E9 0%, #0284C7 50%, #0369A1 100%)', // Blue theme
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
          'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)', // Gold for trophy (semantic)
        accentColor: '#F59E0B',
        shadowColor: 'rgba(245, 158, 11, 0.4)',
      },
    ],
    [t, clickHandlers, notificationCount],
  )

  return (
    <Portal>
      {/* Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            className="fixed inset-0 z-[99] cursor-pointer"
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

      {/* Main Floating Menu Container */}
      <MotionDiv
        ref={menuRef}
        className="fixed top-[60px] z-[100] select-none matchmaking-floating-menu"
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        initial={{ x: position.x, y: position.y }}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: 'tween', duration: 0.2 }}
      >
        {/* Main Button */}
        <MotionButton
          className={`
            w-[60px] h-[60px] rounded-full text-white relative overflow-hidden
            shadow-xl hover:scale-[1.03] active:scale-95 transition-transform
            select-none focus:outline-none focus:ring-2 focus:ring-cyan-400/50
          `}
          style={{
            background: isOpen
              ? 'linear-gradient(to bottom right, #EF4444, #DC2626)'
              : 'linear-gradient(to bottom right, #06B6D4, #0891B2)',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
          }}
          onClick={onToggle}
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

          <div className="flex items-center justify-center w-full h-full z-20">
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </div>
        </MotionButton>

        {/* Action Menu Items */}
        <AnimatePresence mode="wait">
          {isOpen && (
            <div className="absolute bottom-[70px] right-[5px] flex flex-col gap-2.5 items-end select-none">
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
                    whileHover={{
                      scale: 1.01,
                      y: -1,
                      transition: { type: 'tween', duration: 0.1 },
                    }}
                  >
                    <div
                      className={`
                        ${QUICK_CLASH_CLASSES.glassLight} backdrop-blur-[20px]
                        rounded-xl border border-white/10 px-3 py-2.5 w-[220px] h-[44px]
                        cursor-pointer transition-all duration-200 relative overflow-visible
                        hover:bg-white/8 hover:-translate-y-0.5
                      `}
                      onClick={item.onClick}
                      style={{
                        boxShadow:
                          '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                      }}
                      onMouseEnter={() => {
                        const el = document.querySelector(
                          `[data-menu-item="${item.id}"]`,
                        )
                        if (el) {
                          el.style.borderColor = item.accentColor
                          el.style.boxShadow = `0 6px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px ${item.accentColor}30`
                        }
                      }}
                      onMouseLeave={() => {
                        const el = document.querySelector(
                          `[data-menu-item="${item.id}"]`,
                        )
                        if (el) {
                          el.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                          el.style.boxShadow =
                            '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                        }
                      }}
                      data-menu-item={item.id}
                    >
                      <div className="flex items-center justify-between w-full h-full gap-2">
                        {/* Label */}
                        <MotionDiv
                          variants={labelVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          custom={index}
                          className="flex-1 min-w-0"
                        >
                          <span
                            className="text-sm font-semibold text-white whitespace-nowrap tracking-wide"
                            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                          >
                            {item.label}
                          </span>
                        </MotionDiv>

                        {/* Arrow */}
                        <MotionDiv
                          variants={arrowVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={
                            hoveredItem === item.id ? 'hover' : 'visible'
                          }
                          custom={index}
                          className="flex-shrink-0 mx-1"
                        >
                          <div className="relative w-5 h-1.5 flex items-center">
                            <div
                              className="w-6 h-1.5 rounded-full"
                              style={{
                                background: `linear-gradient(to left, ${item.accentColor}, ${item.accentColor}60)`,
                                boxShadow: `0 0 4px ${item.accentColor}40`,
                              }}
                            />
                            <div
                              className="absolute left-0 w-0 h-0 border-t-[3px] border-b-[3px] border-r-[5px]"
                              style={{
                                borderTopColor: 'transparent',
                                borderBottomColor: 'transparent',
                                borderRightColor: item.accentColor,
                                filter: `drop-shadow(0 0 2px ${item.accentColor}40)`,
                              }}
                            />
                          </div>
                        </MotionDiv>

                        {/* Button */}
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={item.onClick}
                            className={`
                              w-9 h-9 rounded-[10px] border border-white/15 relative z-10
                              flex items-center justify-center
                              hover:-translate-y-0.5 active:scale-95 transition-all duration-200
                              cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-cyan-400/50
                            `}
                            style={{
                              background: item.gradient,
                              boxShadow: `0 2px 12px ${item.shadowColor}`,
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.boxShadow = `0 4px 16px ${item.shadowColor}`
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.boxShadow = `0 2px 12px ${item.shadowColor}`
                            }}
                          >
                            {/* Glassmorphism overlay */}
                            <div
                              className="absolute inset-0 rounded-[10px] pointer-events-none"
                              style={{
                                background:
                                  'linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent)',
                              }}
                            />
                            <IconComponent className="w-4 h-4 text-white relative z-10" />
                          </button>

                          <MenuItemBadge badge={item.badge} />
                        </div>
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
