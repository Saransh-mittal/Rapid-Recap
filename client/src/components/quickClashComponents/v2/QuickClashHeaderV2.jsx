// components/quickClashComponents/v2/QuickClashHeaderV2.jsx
// V2 Header - Mobile-First, Reuses existing V1 components for data consistency

import React, { memo, useState, useCallback, lazy, Suspense, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, Home, ChevronRight, Target, Trophy } from 'lucide-react'

// REUSE existing V1 components for data consistency
import TrophyDisplay from '../user/TrophyDisplay'
import LevelBadge from '../user/LevelBadge'
import TaskProgressIndicator from '../dailyTasks/TaskProgressIndicator'
import QuickClashLeaderboardButton from '../leaderboard/QuickClashLeaderboardButton'
import QuickClashLeaderboardModal from '../leaderboard/QuickClashLeaderboardModal'

import { setIsNotifDrawerOpen } from '../../../redux/appSlice'
import { fetchUserTrophies } from '../../../redux/quickClashSlice'
import useFriends from '../../../customHooks/useFriends'

// Lazy load
const WiseWeb = lazy(() => import('../../WiseWeb/WiseWeb'))
const TaskPopup = lazy(() => import('../dailyTasks/TaskPopup'))

const MotionDiv = motion.div
const MotionButton = motion.button

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Notification Bell
const NotificationBell = memo(({ count = 0, onClick }) => (
  <button
    onClick={onClick}
    className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
  >
    <Bell className="w-4 h-4 text-white/70" />
    {count > 0 && (
      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 border border-slate-900">
        {count > 99 ? '99+' : count}
      </span>
    )}
  </button>
))
NotificationBell.displayName = 'NotificationBell'

// Friends Button (WiseWeb trigger)
const FriendsButton = memo(({ onClick, totalRequests = 0, onlineCount = 0, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
  >
    <span className="text-sm">👥</span>
    {totalRequests > 0 && (
      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-cyan-500 text-white text-[10px] font-bold rounded-full px-1 border border-slate-900">
        {totalRequests > 9 ? '9+' : totalRequests}
      </span>
    )}
    {totalRequests === 0 && onlineCount > 0 && (
      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-green-500 text-white text-[10px] font-bold rounded-full px-1 border border-slate-900">
        {onlineCount > 9 ? '9+' : onlineCount}
      </span>
    )}
  </button>
))
FriendsButton.displayName = 'FriendsButton'

const HomeButton = memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
  >
    <Home className="w-4 h-4 text-white/70" />
  </button>
))
HomeButton.displayName = 'HomeButton'

// Leaderboard Button (compact for mobile header)
const LeaderboardButton = memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 transition-colors"
  >
    <Trophy className="w-4 h-4 text-amber-400" />
  </button>
))
LeaderboardButton.displayName = 'LeaderboardButton'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const QuickClashHeaderV2 = () => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Local state
  const [showTaskPopup, setShowTaskPopup] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  // Redux selectors
  const { user } = useSelector((state) => state.auth)
  const { updates, unreadFriendRequests, notification } = useSelector((state) => state.app)

  // Friends hook (same as V1)
  const {
    totalRequests,
    onlineCount,
    openWiseWeb,
    closeWiseWeb,
    isWiseWebOpen,
    loading,
  } = useFriends({
    autoFetch: true,
    enableOptimisticUpdates: true,
    enableAutoRetry: true,
  })

  // Calculate notification count (same as V1)
  const notificationCount = React.useMemo(() => {
    const unreadUpdates = updates?.filter(u => !u.read).length || 0
    const friendRequests = unreadFriendRequests || 0
    const notificationItems = Array.isArray(notification) ? notification.length : 0
    return unreadUpdates + friendRequests + notificationItems
  }, [updates, unreadFriendRequests, notification])

  // Effects (same as V1)
  useEffect(() => {
    dispatch(fetchUserTrophies())
  }, [dispatch])

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Handlers
  const handleNotificationClick = useCallback(() => {
    dispatch(setIsNotifDrawerOpen(true))
  }, [dispatch])

  const handleBackToHome = useCallback(() => navigate('/home'), [navigate])

  const handleViewTasksClick = useCallback(() => setShowTaskPopup(true), [])
  const handleCloseTaskPopup = useCallback(() => setShowTaskPopup(false), [])

  const handleNavigateToTasksSection = useCallback(() => {
    window.location.hash = 'tasks'
  }, [])

  const handleLeaderboardClick = useCallback(() => setShowLeaderboard(true), [])
  const handleLeaderboardClose = useCallback(() => setShowLeaderboard(false), [])

  return (
    <>
      {/* ====== MOBILE HEADER (Fixed Top) ====== */}
      <MotionDiv
        className="fixed top-3 left-3 right-3 z-[1000] flex md:hidden justify-between items-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Left: Stats */}
        <div className="flex items-center gap-2">
          <TrophyDisplay />
          <LevelBadge />
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          <FriendsButton
            onClick={openWiseWeb}
            totalRequests={totalRequests}
            onlineCount={onlineCount}
            loading={loading.friends && loading.requests}
          />
          <NotificationBell
            count={notificationCount}
            onClick={handleNotificationClick}
          />
          <LeaderboardButton onClick={handleLeaderboardClick} />
          <TaskProgressIndicator onViewTasks={handleViewTasksClick} size="sm" />
        </div>
      </MotionDiv>

      {/* ====== DESKTOP HEADER ====== */}
      <MotionDiv
        className="hidden md:block mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Top Row: Navigation + Stats */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 px-3 py-1.5 text-white/70 hover:text-cyan-400 text-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>{t('Home')}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <TrophyDisplay />
            <LevelBadge />
            <FriendsButton
              onClick={openWiseWeb}
              totalRequests={totalRequests}
              onlineCount={onlineCount}
              loading={loading.friends && loading.requests}
            />
            <NotificationBell
              count={notificationCount}
              onClick={handleNotificationClick}
            />
            <TaskProgressIndicator onViewTasks={handleViewTasksClick} size="sm" />
          </div>
        </div>

        {/* Title + Actions Row */}
        <div className="flex justify-between items-center">
          <div>
            <h1
              className="text-2xl font-bold text-cyan-300 mb-1 flex items-center"
            >
              <Target className="mr-2 w-6 h-6 text-cyan-300" />
              {t('Quick Clash')}
            </h1>
            <p className="text-white/60 text-sm max-w-lg">
              {t('Challenge other players to rapid-fire reading and quiz battles!')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <QuickClashLeaderboardButton showMobileVersion={isDesktop} />
          </div>
        </div>
      </MotionDiv>

      {/* ====== MOBILE TITLE (Below fixed header) ====== */}
      <div className="md:hidden mt-16 mb-4 text-center">
        <h1
          className="text-lg font-bold text-cyan-300 flex items-center justify-center"
        >
          <Target className="mr-2 w-5 h-5 text-cyan-300" />
          {t('Quick Clash')}
        </h1>
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

      {/* WiseWeb */}
      <Suspense fallback={null}>
        <WiseWeb isOpen={isWiseWebOpen} onClose={closeWiseWeb} />
      </Suspense>

      {/* Leaderboard Modal (for mobile header button) */}
      <QuickClashLeaderboardModal
        isOpen={showLeaderboard}
        onClose={handleLeaderboardClose}
      />
    </>
  )
}

QuickClashHeaderV2.displayName = 'QuickClashHeaderV2'

export default memo(QuickClashHeaderV2)
