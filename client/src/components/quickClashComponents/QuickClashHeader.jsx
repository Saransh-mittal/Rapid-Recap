// components/quickClashComponents/QuickClashHeader.jsx - Enhanced with immediate friend request fetching
import React, {
  memo,
  useEffect,
  useMemo,
  useState,
  useCallback,
  lazy,
  Suspense,
} from 'react'
import { motion } from 'framer-motion'
import { FiZap, FiHome } from 'react-icons/fi'
import { Target, Zap as ZapIconLucide, Bell, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from './utils/quickClashColors'

// Import components
import QuickClashLeaderboardButton from './leaderboard/QuickClashLeaderboardButton'
import LevelBadge from './user/LevelBadge'
import TaskProgressIndicator from './dailyTasks/TaskProgressIndicator'
import TrophyDisplay from './user/TrophyDisplay'
import { fetchUserTrophies } from '../../redux/quickClashSlice'
import { setIsNotifDrawerOpen } from '../../redux/appSlice'
import useFriends from '../../customHooks/useFriends'
import WiseWeb from '../WiseWeb/WiseWeb'

const TaskPopup = lazy(() => import('./dailyTasks/TaskPopup'))

const MotionDiv = motion.div
const MotionButton = motion.button

// Enhanced tooltip component with better positioning
const Tooltip = memo(({ children, label, placement = 'bottom' }) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const tooltipPositions = {
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    top: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  }

  const arrowPositions = {
    bottom:
      'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800',
    top: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-slate-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-slate-800',
    right:
      'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-slate-800',
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className={`absolute ${tooltipPositions[placement]} z-50`}>
          <div className="px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap shadow-lg">
            {label}
            <div
              className={`absolute w-0 h-0 ${arrowPositions[placement]}`}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
})

// Enhanced notification badge with pulsing animation
const NotificationBadge = memo(
  ({ count = 0, type = 'notification', pulseColor = 'cyan' }) => {
    if (count <= 0) return null

    const badgeColors = {
      notification: 'bg-red-500',
      friends: 'bg-cyan-500',
      online: 'bg-green-500',
    }

    const borderColors = {
      notification: 'border-slate-800',
      friends: 'border-blue-500',
      online: 'border-blue-500',
    }

    const pulseColors = {
      cyan: 'animate-pulse',
      green: 'animate-pulse',
      red: 'animate-pulse',
    }

    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`
        absolute -top-0.5 -right-0.5 text-white text-xs rounded-full
        min-w-[18px] h-[18px] flex items-center justify-center font-bold
        border-2 z-10 ${badgeColors[type]} ${borderColors[type]} ${pulseColors[pulseColor]}
      `}
      >
        {count > 99 ? '99+' : count}
      </motion.span>
    )
  },
)

const QuickClashHeader = ({ onNewChallenge }) => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Responsive state management
  const [isDesktop, setIsDesktop] = useState(false)
  const [showTaskPopup, setShowTaskPopup] = useState(false)

  // Enhanced friends hook with immediate fetching
  const {
    totalRequests,
    onlineCount,
    openWiseWeb,
    closeWiseWeb,
    isWiseWebOpen,
    loading,
    error,
    refreshData,
    networkStatus,
  } = useFriends({
    autoFetch: true, // Auto-fetch on mount
    enableOptimisticUpdates: true,
    enableAutoRetry: true,
  })

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const { user } = useSelector(state => state.auth)

  // Get notification data from Redux
  const { updates, unreadFriendRequests, notification } = useSelector(
    state => state.app,
  )

  // Enhanced notification count calculation with memoization
  const notificationCount = useMemo(() => {
    const unreadUpdates = updates?.filter(u => !u.read).length || 0
    const friendRequests = unreadFriendRequests || 0
    const notificationItems = Array.isArray(notification)
      ? notification.length
      : 0
    return unreadUpdates + friendRequests + notificationItems
  }, [updates, unreadFriendRequests, notification])

  // Effects and handlers - preserved exactly
  useEffect(() => {
    dispatch(fetchUserTrophies())
  }, [dispatch])

  const handleBackToHome = useCallback(() => navigate('/home'), [navigate])



  const handleViewTasksClick = useCallback(() => setShowTaskPopup(true), [])
  const handleCloseTaskPopup = useCallback(() => setShowTaskPopup(false), [])

  const handleNavigateToTasksSection = useCallback(() => {
    window.location.hash = 'tasks'
  }, [])

  const handleInboxClick = useCallback(() => {
    dispatch(setIsNotifDrawerOpen(true))
  }, [dispatch])

  // Enhanced WiseWeb handler with error handling
  const handleOpenWiseWeb = useCallback(() => {
    if (networkStatus === 'offline') {
      // Still allow opening in offline mode, but show limited functionality
      openWiseWeb()
      return
    }

    // Refresh data before opening if it's stale
    const shouldRefresh = error.friends || error.requests
    if (shouldRefresh) {
      refreshData()
        .then(() => {
          openWiseWeb()
        })
        .catch(() => {
          // Open anyway, but user will see error state
          openWiseWeb()
        })
    } else {
      openWiseWeb()
    }
  }, [openWiseWeb, networkStatus, error, refreshData])

  // Animation variants - preserved exactly
  const containerVariants = {
    initial: { opacity: 0, y: -10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, y: -5 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  const buttonVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 200, damping: 10, delay: 0.2 },
    },
    hover: {
      scale: 1.05,
      transition: { type: 'spring', stiffness: 300, damping: 10 },
    },
    tap: { scale: 0.98 },
  }

  const homeButtonVariants = {
    hover: {
      scale: 1.1,
      transition: { duration: 0.3, type: 'spring', stiffness: 200 },
    },
    tap: { scale: 0.9 },
    animate: {
      y: [0, -3, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  }

  const inboxButtonVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        type: 'spring',
        stiffness: 200,
      },
    },
    tap: { scale: 0.9 },
  }

  // Enhanced WiseWeb button with loading states
  const WiseWebButton = memo(({ isMobile = false }) => {
    const size = isMobile ? 'w-8 h-8' : 'w-10 h-10'
    const iconSize = isMobile ? 16 : 20

    return (
      <div className="relative">
        <Tooltip
          label={t('Friends')}
          placement={isMobile ? 'bottom' : 'bottom'}
        >
          <MotionButton
            onClick={handleOpenWiseWeb}
            disabled={loading.friends && loading.requests}
            className={`
              flex items-center justify-center ${size}
              ${QUICK_CLASH_CLASSES.hoverBlue} hover:bg-blue-500/10
              text-white/90 hover:text-blue-300 rounded-full
              transition-all duration-200 hover:-translate-y-0.5
              focus:outline-none focus:ring-2 focus:ring-blue-400/50
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                networkStatus === 'offline' ? 'border border-orange-400/30' : ''
              }
            `}
            variants={inboxButtonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label={t('Open WiseWeb')}
          >
            {loading.friends && loading.requests ? (
              <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
            ) : (
              <Users size={iconSize} />
            )}
          </MotionButton>
        </Tooltip>

        {/* Enhanced badge system */}
        {totalRequests > 0 && (
          <NotificationBadge
            count={totalRequests}
            type="friends"
            pulseColor="cyan"
          />
        )}
        {onlineCount > 0 && totalRequests === 0 && (
          <NotificationBadge
            count={onlineCount}
            type="online"
            pulseColor="green"
          />
        )}

        {/* Network status indicator */}
        {networkStatus === 'offline' && (
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-500 border border-slate-800 rounded-full" />
        )}
      </div>
    )
  })

  return (
    <MotionDiv
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="relative"
    >
      {/* Mobile Fixed Header */}
      <MotionDiv
        className="fixed top-4 left-4 right-4 z-[1000] flex md:hidden justify-between items-center"
        variants={itemVariants}
      >
        <Tooltip label={t('Back to Home')}>
          <MotionButton
            onClick={handleBackToHome}
            className={`
              flex items-center justify-center w-10 h-10
              ${QUICK_CLASH_CLASSES.glassMedium} hover:bg-cyan-500/20
              text-white rounded-full shadow-lg backdrop-blur-md
              border border-cyan-500/20 hover:border-cyan-400/40
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50
            `}
            variants={homeButtonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            aria-label={t('Back to Home')}
          >
            <FiHome size={18} />
          </MotionButton>
        </Tooltip>

        <div className="flex items-center gap-2">
          <TrophyDisplay />
          <LevelBadge />
          <WiseWebButton isMobile={true} />
          <TaskProgressIndicator onViewTasks={handleViewTasksClick} size="sm" />
        </div>
      </MotionDiv>

      {/* Desktop Header */}
      <MotionDiv
        className="hidden md:flex justify-between items-center mb-4"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3">
          <MotionButton
            onClick={handleBackToHome}
            className={`
              flex items-center gap-2 px-3 py-2
              ${QUICK_CLASH_CLASSES.hoverCyan} hover:bg-cyan-500/10
              text-white/90 hover:text-cyan-300 rounded-full
              transition-all duration-200 hover:-translate-y-0.5
              focus:outline-none focus:ring-2 focus:ring-cyan-400/50
            `}
            variants={homeButtonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label={t('Back to Home')}
          >
            <FiHome size={18} />
            {t('Home')}
          </MotionButton>

        </div>

        <div className="flex items-center gap-3">
          <TrophyDisplay />
          <LevelBadge />
          <WiseWebButton isMobile={false} />

          {/* Enhanced Inbox Button - Desktop */}
          <div className="relative">
            <Tooltip label={t('Notifications')}>
              <MotionButton
                onClick={handleInboxClick}
                className={`
                  flex items-center justify-center w-10 h-10
                  ${QUICK_CLASH_CLASSES.hoverBlue} hover:bg-blue-500/10
                  text-white/90 hover:text-blue-300 rounded-full
                  transition-all duration-200 hover:-translate-y-0.5
                  focus:outline-none focus:ring-2 focus:ring-blue-400/50
                `}
                variants={inboxButtonVariants}
                whileHover="hover"
                whileTap="tap"
                aria-label={t('Open Notifications')}
              >
                <Bell size={20} />
              </MotionButton>
            </Tooltip>
            {notificationCount > 0 && (
              <NotificationBadge
                count={notificationCount}
                type="notification"
                pulseColor="red"
              />
            )}
          </div>

          <TaskProgressIndicator onViewTasks={handleViewTasksClick} size="sm" />
        </div>
      </MotionDiv>

      {/* Main Header Content - preserved exactly */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-8 gap-3 md:gap-4 mt-20 md:mt-0">
        <MotionDiv
          className="flex-1 text-center md:text-left max-w-full md:max-w-[60%]"
          variants={itemVariants}
        >
          <h1
            className="text-xl md:text-3xl font-bold text-cyan-300 mb-2 flex items-center justify-center md:justify-start"
            style={{ textShadow: '0 0 15px rgba(6, 182, 212, 0.4)' }}
          >
            <Target className="mr-2 w-6 h-6 md:w-8 md:h-8 text-cyan-300" />
            {t('Quick Clash')}
          </h1>
          <p
            className={`${QUICK_CLASH_CLASSES.textSecondary} text-sm md:text-base`}
          >
            {t(
              'Challenge other players to rapid-fire reading and quiz battles, test your knowledge and rise up the ranks!',
            )}
          </p>
        </MotionDiv>

        {/* Desktop Action Buttons Group */}
        <div className="hidden md:flex items-center gap-3 w-auto">
          <MotionButton
            onClick={onNewChallenge}
            className={`
              flex items-center gap-2 px-6 py-3
              ${QUICK_CLASH_CLASSES.btnPrimary} hover:shadow-lg hover:shadow-cyan-500/30
              text-white font-bold rounded-lg
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50
            `}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            style={{
              background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            }}
          >
            <FiZap />
            {t('New Challenge')}
          </MotionButton>
          <QuickClashLeaderboardButton showMobileVersion={isDesktop} />
        </div>
      </div>

      {/* Task Popup */}
      {showTaskPopup && (
        <Suspense fallback={null}>
          <TaskPopup
            isOpen={showTaskPopup}
            onClose={handleCloseTaskPopup}
            onViewAllTasks={handleNavigateToTasksSection}
          />
        </Suspense>
      )}

      {/* Enhanced WiseWeb with error boundary */}
      <WiseWeb isOpen={isWiseWebOpen} onClose={closeWiseWeb} />
    </MotionDiv>
  )
}

// Set display names for debugging
Tooltip.displayName = 'Tooltip'
NotificationBadge.displayName = 'NotificationBadge'
QuickClashHeader.displayName = 'QuickClashHeader'

export default memo(QuickClashHeader)
