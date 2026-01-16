// src/utils/notifications.jsx - Complete mobile-responsive notifications with enhanced timer progress
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Swords, Trophy, Skull, Zap, Users, Flame } from 'lucide-react'

// Refined, subtle notification types with professional styling
// Includes gamified types for Quick Clash gaming UX
const NOTIFICATION_TYPES = {
  success: {
    icon: CheckCircle,
    gradient: 'from-slate-700/95 via-slate-800/95 to-slate-900/95',
    border: 'border-green-400/30',
    glow: 'shadow-green-400/20',
    iconColor: 'text-green-400',
    titleColor: 'text-slate-100',
    descColor: 'text-slate-300',
    progressBg: 'bg-green-400/15',
    progressBar: 'bg-green-400',
    accent: 'border-l-4 border-l-green-400',
  },
  error: {
    icon: AlertCircle,
    gradient: 'from-slate-700/95 via-slate-800/95 to-slate-900/95',
    border: 'border-red-400/30',
    glow: 'shadow-red-400/20',
    iconColor: 'text-red-400',
    titleColor: 'text-slate-100',
    descColor: 'text-slate-300',
    progressBg: 'bg-red-400/15',
    progressBar: 'bg-red-400',
    accent: 'border-l-4 border-l-red-400',
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'from-slate-700/95 via-slate-800/95 to-slate-900/95',
    border: 'border-amber-400/30',
    glow: 'shadow-amber-400/20',
    iconColor: 'text-amber-400',
    titleColor: 'text-slate-100',
    descColor: 'text-slate-300',
    progressBg: 'bg-amber-400/15',
    progressBar: 'bg-amber-400',
    accent: 'border-l-4 border-l-amber-400',
  },
  info: {
    icon: Info,
    gradient: 'from-slate-700/95 via-slate-800/95 to-slate-900/95',
    border: 'border-cyan-400/30',
    glow: 'shadow-cyan-400/20',
    iconColor: 'text-cyan-400',
    titleColor: 'text-slate-100',
    descColor: 'text-slate-300',
    progressBg: 'bg-cyan-400/15',
    progressBar: 'bg-cyan-400',
    accent: 'border-l-4 border-l-cyan-400',
  },
  // Gamified notification types for Quick Clash V2
  battle: {
    icon: Swords,
    gradient: 'from-slate-700/95 via-slate-800/95 to-slate-900/95',
    border: 'border-orange-400/30',
    glow: 'shadow-orange-400/20',
    iconColor: 'text-orange-400',
    titleColor: 'text-slate-100',
    descColor: 'text-slate-300',
    progressBg: 'bg-orange-400/15',
    progressBar: 'bg-orange-400',
    accent: 'border-l-4 border-l-orange-400',
  },
  victory: {
    icon: Trophy,
    gradient: 'from-slate-700/95 via-slate-800/95 to-slate-900/95',
    border: 'border-amber-400/30',
    glow: 'shadow-amber-400/30',
    iconColor: 'text-amber-400',
    titleColor: 'text-slate-100',
    descColor: 'text-slate-300',
    progressBg: 'bg-amber-400/15',
    progressBar: 'bg-gradient-to-r from-amber-400 to-yellow-300',
    accent: 'border-l-4 border-l-amber-400',
  },
  defeat: {
    icon: Skull,
    gradient: 'from-slate-700/95 via-slate-800/95 to-slate-900/95',
    border: 'border-slate-500/30',
    glow: 'shadow-slate-400/10',
    iconColor: 'text-slate-400',
    titleColor: 'text-slate-100',
    descColor: 'text-slate-300',
    progressBg: 'bg-slate-400/15',
    progressBar: 'bg-slate-400',
    accent: 'border-l-4 border-l-slate-400',
  },
  powerup: {
    icon: Zap,
    gradient: 'from-slate-700/95 via-purple-900/50 to-slate-900/95',
    border: 'border-purple-400/30',
    glow: 'shadow-purple-400/25',
    iconColor: 'text-purple-400',
    titleColor: 'text-slate-100',
    descColor: 'text-slate-300',
    progressBg: 'bg-purple-400/15',
    progressBar: 'bg-gradient-to-r from-purple-400 to-pink-400',
    accent: 'border-l-4 border-l-purple-400',
  },
  matchmaking: {
    icon: Users,
    gradient: 'from-slate-700/95 via-slate-800/95 to-slate-900/95',
    border: 'border-cyan-400/30',
    glow: 'shadow-cyan-400/20',
    iconColor: 'text-cyan-400',
    titleColor: 'text-slate-100',
    descColor: 'text-slate-300',
    progressBg: 'bg-cyan-400/15',
    progressBar: 'bg-gradient-to-r from-cyan-400 to-blue-400',
    accent: 'border-l-4 border-l-cyan-400',
  },
  combo: {
    icon: Flame,
    gradient: 'from-slate-700/95 via-orange-900/30 to-slate-900/95',
    border: 'border-orange-500/30',
    glow: 'shadow-orange-500/25',
    iconColor: 'text-orange-500',
    titleColor: 'text-slate-100',
    descColor: 'text-slate-300',
    progressBg: 'bg-orange-500/15',
    progressBar: 'bg-gradient-to-r from-orange-500 to-red-500',
    accent: 'border-l-4 border-l-orange-500',
  },
}

// Enhanced notification reducer with performance optimizations
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      // Limit to max 4 notifications for mobile
      const newState = [action.payload, ...state.slice(0, 3)]
      return newState
    case 'REMOVE_NOTIFICATION':
      return state.filter(notification => notification.id !== action.payload)
    case 'CLEAR_ALL':
      return []
    case 'UPDATE_NOTIFICATION':
      return state.map(notification =>
        notification.id === action.payload.id
          ? { ...notification, ...action.payload.updates }
          : notification,
      )
    default:
      return state
  }
}

// Create notification context
const NotificationContext = createContext(null)

// Enhanced notification item with visible timer progress
const NotificationItem = React.memo(React.forwardRef(({ notification, onRemove, index }, ref) => {
  const { id, type, title, description, duration, isClosable } = notification
  const typeConfig = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info
  const IconComponent = typeConfig.icon

  // Auto-remove timer with cleanup
  React.useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, onRemove])

  // Subtle animation variants
  const itemVariants = {
    initial: {
      opacity: 0,
      y: -30,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
        mass: 0.8,
        delay: index * 0.03, // Subtle staggered entrance
      },
    },
    exit: {
      opacity: 0,
      y: -15,
      scale: 0.98,
      transition: {
        duration: 0.15,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    hover: {
      scale: 1.01,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
  }

  // Enhanced progress bar animation
  const progressVariants = {
    initial: {
      scaleX: 1,
      opacity: 0.8,
    },
    animate: {
      scaleX: 0,
      opacity: 0.6,
      transition: {
        duration: duration ? duration / 1000 : 0,
        ease: 'linear',
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      layout
      variants={itemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      className={`
        group relative overflow-hidden
        backdrop-blur-lg bg-gradient-to-br ${typeConfig.gradient}
        border ${typeConfig.border} ${typeConfig.accent}
        shadow-lg ${typeConfig.glow}
        rounded-xl w-full
        pointer-events-auto cursor-default
      `}
      style={{
        backdropFilter: 'blur(12px) saturate(150%)',
        WebkitBackdropFilter: 'blur(12px) saturate(150%)',
      }}
    >
      {/* Main content container */}
      <div className="relative p-3 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Subtle icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 20,
              delay: 0.1,
            }}
            className={`flex-shrink-0 ${typeConfig.iconColor}`}
          >
            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
          </motion.div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <motion.h4
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.2 }}
              className={`text-sm font-medium ${typeConfig.titleColor} leading-tight`}
            >
              {title}
            </motion.h4>
            {description && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.2 }}
                className={`text-xs sm:text-sm ${typeConfig.descColor} mt-1 leading-relaxed`}
              >
                {description}
              </motion.p>
            )}
          </div>

          {/* Subtle close button */}
          {isClosable && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.2 }}
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onRemove(id)}
              className={`
                flex-shrink-0 p-1 sm:p-1.5 rounded-md transition-all duration-200
                hover:bg-white/10 active:bg-white/15
                focus:outline-none focus:ring-2 focus:ring-white/20
                text-slate-400 hover:text-slate-200
              `}
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Enhanced Timer Progress Bar */}
      {duration && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
          {/* Background track */}
          <div className={`absolute inset-0 ${typeConfig.progressBg}`} />

          {/* Animated progress bar */}
          <motion.div
            variants={progressVariants}
            initial="initial"
            animate="animate"
            className={`absolute inset-0 ${typeConfig.progressBar} origin-left`}
            style={{ transformOrigin: 'left center' }}
          />

          {/* Subtle glow effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`absolute inset-0 ${typeConfig.progressBar} opacity-30 blur-sm`}
          />
        </div>
      )}
    </motion.div>
  )
}))

// Mobile-responsive notifications container
const NotificationsContainer = React.memo(({ notifications, onRemove }) => {
  // Optimize portal mount point
  const portalTarget = useMemo(() => {
    let container = document.getElementById('notification-portal')
    if (!container) {
      container = document.createElement('div')
      container.id = 'notification-portal'
      container.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 10100;
      `
      document.body.appendChild(container)
    }
    return container
  }, [])

  return createPortal(
    <div className="fixed top-3 left-3 right-3 sm:top-4 sm:left-auto sm:right-4 z-[10100] flex flex-col gap-2 sm:gap-3 pointer-events-none sm:max-w-sm sm:w-full">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>,
    portalTarget,
  )
})

// Enhanced notification provider with performance optimizations
export const NotificationProvider = React.memo(({ children }) => {
  const [notifications, dispatch] = useReducer(notificationReducer, [])

  // Optimized notification addition with deduplication
  const addNotification = useCallback(
    notification => {
      const id = `notif_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 6)}`

      const newNotification = {
        id,
        type: 'info',
        duration: 4000,
        isClosable: true,
        ...notification,
        // Sanitize and optimize data
        title:
          typeof notification.title === 'string'
            ? notification.title.slice(0, 80)
            : 'Notification',
        description:
          typeof notification.description === 'string'
            ? notification.description.slice(0, 120)
            : undefined,
      }

      // Check for duplicate notifications (same title and type)
      const isDuplicate = notifications.some(
        n =>
          n.title === newNotification.title &&
          n.type === newNotification.type &&
          Date.now() - parseInt(n.id.split('_')[1]) < 2000, // Within 2 seconds
      )

      if (!isDuplicate) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification })
      }

      return id
    },
    [notifications],
  )

  // Subscribe to global notificationManager to display notifications from imperative calls
  React.useEffect(() => {
    const unsubscribe = notificationManager.subscribe((managerNotifications) => {
      // When the manager has new notifications, sync them to local state
      managerNotifications.forEach(notification => {
        // Check if this notification ID already exists in our state
        const alreadyExists = notifications.some(n => n.id === notification.id)
        if (!alreadyExists) {
          dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
        }
      })
    })
    return unsubscribe
  }, [notifications])

  const removeNotification = useCallback(id => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  }, [])

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' })
  }, [])

  const updateNotification = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id, updates } })
  }, [])

  // Optimized convenience methods with mobile-friendly durations
  const notify = useMemo(
    () => ({
      success: (title, description, options = {}) =>
        addNotification({
          type: 'success',
          title,
          description,
          duration: 3000, // Shorter for mobile
          ...options,
        }),
      error: (title, description, options = {}) =>
        addNotification({
          type: 'error',
          title,
          description,
          duration: 5000,
          ...options,
        }),
      warning: (title, description, options = {}) =>
        addNotification({
          type: 'warning',
          title,
          description,
          duration: 4000,
          ...options,
        }),
      info: (title, description, options = {}) =>
        addNotification({
          type: 'info',
          title,
          description,
          duration: 3500,
          ...options,
        }),
    }),
    [addNotification],
  )

  // Memoized context value for performance
  const contextValue = useMemo(
    () => ({
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications,
      updateNotification,
      notify,
    }),
    [
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications,
      updateNotification,
      notify,
    ],
  )

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationsContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  )
})

// Optimized custom hook
export const useNotifications = () => {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    )
  }

  return context
}

// Enhanced standalone notification utility with better mobile performance
class NotificationManager {
  constructor() {
    this.notifications = []
    this.listeners = new Set()
    this.maxNotifications = 4 // Reduced for mobile
  }

  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  notify(notification) {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

    const newNotification = {
      id,
      type: 'info',
      duration: 3500, // Mobile-optimized duration
      isClosable: true,
      ...notification,
      // Mobile-optimized text lengths
      title:
        typeof notification.title === 'string'
          ? notification.title.slice(0, 80)
          : 'Notification',
      description:
        typeof notification.description === 'string'
          ? notification.description.slice(0, 120)
          : undefined,
    }

    // Prevent duplicates with longer window for mobile
    const isDuplicate = this.notifications.some(
      n =>
        n.title === newNotification.title &&
        n.type === newNotification.type &&
        Date.now() - parseInt(n.id.split('_')[1]) < 2000,
    )

    if (!isDuplicate) {
      this.notifications = [
        newNotification,
        ...this.notifications.slice(0, this.maxNotifications - 1),
      ]

      this.listeners.forEach(listener => {
        try {
          listener(this.notifications)
        } catch (error) {
          console.error('Notification listener error:', error)
        }
      })

      if (newNotification.duration > 0) {
        setTimeout(() => this.remove(id), newNotification.duration)
      }
    }

    return id
  }

  remove(id) {
    const oldLength = this.notifications.length
    this.notifications = this.notifications.filter(n => n.id !== id)

    if (this.notifications.length !== oldLength) {
      this.listeners.forEach(listener => {
        try {
          listener(this.notifications)
        } catch (error) {
          console.error('Notification listener error:', error)
        }
      })
    }
  }

  clear() {
    if (this.notifications.length > 0) {
      this.notifications = []
      this.listeners.forEach(listener => {
        try {
          listener(this.notifications)
        } catch (error) {
          console.error('Notification listener error:', error)
        }
      })
    }
  }

  // Mobile-optimized convenience methods
  success(title, description, options = {}) {
    return this.notify({
      type: 'success',
      title,
      description,
      duration: 3000,
      ...options,
    })
  }

  error(title, description, options = {}) {
    return this.notify({
      type: 'error',
      title,
      description,
      duration: 5000,
      ...options,
    })
  }

  warning(title, description, options = {}) {
    return this.notify({
      type: 'warning',
      title,
      description,
      duration: 4000,
      ...options,
    })
  }

  info(title, description, options = {}) {
    return this.notify({
      type: 'info',
      title,
      description,
      duration: 3500,
      ...options,
    })
  }

  // Gamified convenience methods for Quick Clash V2
  battle(title, description, options = {}) {
    return this.notify({
      type: 'battle',
      title,
      description,
      duration: 3000,
      ...options,
    })
  }

  victory(title, description, options = {}) {
    return this.notify({
      type: 'victory',
      title,
      description,
      duration: 4000,
      ...options,
    })
  }

  defeat(title, description, options = {}) {
    return this.notify({
      type: 'defeat',
      title,
      description,
      duration: 3500,
      ...options,
    })
  }

  powerup(title, description, options = {}) {
    return this.notify({
      type: 'powerup',
      title,
      description,
      duration: 2500,
      ...options,
    })
  }

  matchmaking(title, description, options = {}) {
    return this.notify({
      type: 'matchmaking',
      title,
      description,
      duration: 3000,
      ...options,
    })
  }

  combo(title, description, options = {}) {
    return this.notify({
      type: 'combo',
      title,
      description,
      duration: 2000,
      ...options,
    })
  }
}

// Global notification manager instance
export const notificationManager = new NotificationManager()

// Performance-optimized global hook
export const useGlobalNotifications = () => {
  const [notifications, setNotifications] = React.useState([])

  React.useEffect(() => {
    const unsubscribe = notificationManager.subscribe(setNotifications)
    return unsubscribe
  }, [])

  return {
    notifications,
    notify: notificationManager,
  }
}

// Set display names for debugging
NotificationItem.displayName = 'NotificationItem'
NotificationsContainer.displayName = 'NotificationsContainer'
NotificationProvider.displayName = 'NotificationProvider'

export default NotificationProvider
