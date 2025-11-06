// screens/QuickClash.jsx - FAITHFUL CONVERSION with Consistent Color Scheme
import React, { useCallback, useState, useEffect, useMemo, memo } from 'react'
import { useToast } from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../components/quickClashComponents/utils/quickClashColors.js'

// Regular imports - EXACTLY as original
import QuickClashHeader from '../components/quickClashComponents/QuickClashHeader'
import CustomTabs from '../components/quickClashComponents/ui/CustomTabs'
import NewChallengeModal from '../components/quickClashComponents/modals/NewChallengeModal'
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchAppUpdates,
  setIsNotifDrawerOpen,
  setIsNotifModalOpen,
  setSelectedNotificationId,
} from '../redux/appSlice'

// Lazy loaded components - EXACTLY as original
const TaskCompletionHandler = React.lazy(() =>
  import(
    '../components/quickClashComponents/dailyTasks/TaskCompletionHandler.jsx'
  ),
)
const QuickClashComingSoon = lazy(() =>
  import('../components/quickClashComponents/QuickClashComingSoon'),
)
const ActiveChallenges = lazy(() =>
  import('../components/quickClashComponents/ActiveChallenges'),
)
const DailyTasksDashboard = lazy(() =>
  import('../components/quickClashComponents/dailyTasks/DailyTasksDashboard'),
)
const TaskPopup = lazy(() =>
  import('../components/quickClashComponents/dailyTasks/TaskPopup'),
)
const MatchmakingModalManager = lazy(() =>
  import(
    '../components/quickClashComponents/matchmaking/MatchmakingModalManager'
  ),
)
const FloatingActionMenu = lazy(() =>
  import('../components/quickClashComponents/FloatingActionMenu'),
)
const TeamDashboard = lazy(() =>
  import('../components/quickClashComponents/team/TeamDashboard'),
)
const GlobalMatchmakingButton = lazy(() =>
  import(
    '../components/quickClashComponents/globalmatchmaking/GlobalMatchmakingButton'
  ),
)
const NotificationDrawer = lazy(() =>
  import(
    '../components/Header-Footer/modernNavbarComponents/drawers/NotificationDrawer.jsx'
  ),
)
const NotificationModal = lazy(() =>
  import(
    '../components/Header-Footer/modernNavbarComponents/modals/NotificationModal.jsx'
  ),
)

import useQuickClashGlobalMatchmaking from '../customHooks/useQuickClashGlobalMatchmaking'
import BattleCreationNotifications from '../components/quickClashComponents/BattleCreationNotifications.jsx'
import { ModalLoader } from '../components/Header-Footer/modernNavbarComponents/NavbarModalManager.jsx'

// Optimized loading fallback component with consistent colors
const LoadingFallback = memo(() => (
  <div className="h-24 w-full flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
  </div>
))

const MotionBox = motion.div

// Cached responsive configuration - EXACTLY as original
const RESPONSIVE_CONFIG = {
  showFloatingMenu: { base: true, md: false },
  showCenterMatchButton: { base: false, md: true },
  showDesktopTaskPopup: { base: false, md: true },
}

/**
 * QuickClash component - FAITHFUL CONVERSION with consistent color scheme
 */
const QuickClash = () => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [showTaskPopup, setShowTaskPopup] = useState(false)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [selectedNotification, setSelectedNotification] = useState(null)

  // Authorization state - EXACTLY as original
  const [isAuthorized, setIsAuthorized] = useState(null)
  const [comingSoonData, setComingSoonData] = useState(null)

  // Redux selectors - EXACTLY as original
  const { loginCheckStatus, user } = useSelector(state => state.auth)
  const { updatesLoading, isNotifModalOpen, isNotifDrawerOpen } = useSelector(
    state => state.app,
  )
  const { justCompletedTaskId } = useSelector(
    state => state.quickClashDailyTasks,
  )

  // Cache responsive values - EXACTLY as original
  const showFloatingMenu =
    typeof window !== 'undefined' && window.innerWidth < 768
  const showDesktopTaskPopup =
    typeof window !== 'undefined' && window.innerWidth >= 768

  // Memoized computed values - EXACTLY as original
  const taskJustCompleted = useMemo(
    () => !!justCompletedTaskId,
    [justCompletedTaskId],
  )

  // Get global matchmaking state - EXACTLY as original
  const { checkMatchmakingStatus } = useQuickClashGlobalMatchmaking()

  // ALL ORIGINAL EFFECTS AND HANDLERS PRESERVED EXACTLY

  // Check authorization - EXACTLY as original
  const checkAuthorization = useCallback(async () => {
    try {
      const response = await axios.get('/api/quickClash/stats')
      setIsAuthorized(true)
    } catch (error) {
      if (
        error.response?.status === 403 &&
        error.response?.data?.isComingSoon
      ) {
        setIsAuthorized(false)
        setComingSoonData(error.response.data.comingSoonData)
      } else {
        toast({
          title: t('Connection Error'),
          description: t('Unable to verify access. Please try again.'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        setIsAuthorized(true)
      }
    }
  }, [toast, t])

  // All useEffect hooks - EXACTLY as original
  useEffect(() => {
    if (user && loginCheckStatus === 'fulfilled') {
      checkAuthorization()
    }
  }, [user, loginCheckStatus, checkAuthorization])

  const checkStreakAndFetchUpdates = useCallback(() => {
    if (!updatesLoading && loginCheckStatus === 'fulfilled' && isAuthorized) {
      dispatch(fetchAppUpdates())
    }
  }, [loginCheckStatus, updatesLoading, dispatch, isAuthorized])

  useEffect(() => {
    if (isAuthorized !== true) return

    const lastVisit = localStorage.getItem('quickClashLastVisit')
    const now = Date.now()

    const hash = window.location.hash.substring(1)
    if (hash) {
      const hashToIndex = {
        active: 0,
        tasks: 1,
        teams: 2,
      }
      if (hashToIndex[hash] !== undefined) {
        setActiveTabIndex(hashToIndex[hash])
      }
    }

    if (!lastVisit || now - parseInt(lastVisit) > 60 * 60 * 1000) {
      localStorage.setItem('quickClashLastVisit', now.toString())
    }

    if (showDesktopTaskPopup) {
      const timer = setTimeout(() => {
        setShowTaskPopup(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showDesktopTaskPopup, isAuthorized])

  useEffect(() => {
    if (isAuthorized) {
      checkMatchmakingStatus()
    }
  }, [loginCheckStatus, updatesLoading, isAuthorized])

  useEffect(() => {
    if (taskJustCompleted && showDesktopTaskPopup && isAuthorized) {
      setShowTaskPopup(true)
    }
  }, [taskJustCompleted, showDesktopTaskPopup, isAuthorized])

  useEffect(() => {
    if (isAuthorized) {
      checkStreakAndFetchUpdates()
    }
  }, [isAuthorized])

  // Event handlers - EXACTLY as original
  const handleNewChallenge = useCallback(() => {
    onOpen()
  }, [onOpen])

  const handleViewAllTasks = useCallback(() => {
    window.location.hash = 'tasks'
  }, [])

  const handleTabChange = useCallback(index => {
    setActiveTabIndex(index)
  }, [])

  const handleTaskPopupClose = useCallback(() => {
    setShowTaskPopup(false)
  }, [])

  // Container style - EXACTLY as original
  const containerStyle = useMemo(
    () => ({
      visibility: 'visible',
      opacity: 1,
      transition: 'opacity 0.3s ease-in-out',
    }),
    [],
  )

  // Loading and coming soon states - EXACTLY as original
  if (isAuthorized === null) {
    return <LoadingFallback />
  }

  if (isAuthorized === false) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <QuickClashComingSoon comingSoonData={comingSoonData} />
      </Suspense>
    )
  }

  return (
    <>
      {/* Container with consistent colors */}
      <div
        className="quick-clash-container max-w-7xl mx-auto px-2 py-4 pb-5"
        style={containerStyle}
      >
        {/* Header Section - EXACTLY as original */}
        <QuickClashHeader onNewChallenge={handleNewChallenge} />

        {/* Horizontal Matchmaking Buttons with consistent colors */}
        <div className="flex justify-center my-5">
          <Suspense fallback={<LoadingFallback />}>
            <div className="flex flex-row space-x-4 w-full max-w-2xl justify-center">
              <MatchmakingModalManager
                buttonTextOverride={t('SOLO')}
                buttonWidth={{ base: '100%', md: '240px' }}
                buttonHeight={{ base: '48px', md: '56px' }}
                buttonMinWidth={{ base: '140px', md: '240px' }}
              />
              <GlobalMatchmakingButton />
            </div>
          </Suspense>
        </div>

        {/* Tabs Section with consistent glassmorphic styling */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={'quick-clash-tabs'}
        >
          <div
            className={`${QUICK_CLASH_CLASSES.glassMedium} rounded-2xl mb-4 shadow-2xl backdrop-brightness-110`}
          >
            <div className="p-1 md:p-4">
              <CustomTabs
                initialTabIndex={activeTabIndex}
                onChange={handleTabChange}
                tabNames={[t('Active'), t('Daily Tasks'), t('Teams')]}
                tabIcons={['Swords', 'Calendar', 'Users']}
              >
                <div className="px-0">
                  <Suspense fallback={<LoadingFallback />}>
                    <ActiveChallenges />
                  </Suspense>
                </div>

                <div className="px-0">
                  <Suspense fallback={<LoadingFallback />}>
                    <DailyTasksDashboard />
                  </Suspense>
                </div>

                <div className="px-0">
                  <Suspense fallback={<LoadingFallback />}>
                    <TeamDashboard />
                  </Suspense>
                </div>
              </CustomTabs>
            </div>
          </div>
        </MotionBox>

        {/* Mobile Floating Action Menu - EXACTLY as original */}
        {showFloatingMenu && (
          <Suspense fallback={null}>
            <FloatingActionMenu onNewChallenge={handleNewChallenge} />
          </Suspense>
        )}

        {/* Task Popup - Desktop Only - EXACTLY as original */}
        {showDesktopTaskPopup && showTaskPopup && (
          <Suspense fallback={null}>
            <TaskPopup
              onViewAllTasks={handleViewAllTasks}
              isOpen={showTaskPopup}
              onClose={handleTaskPopupClose}
            />
          </Suspense>
        )}

        {/* Challenge Modal - EXACTLY as original */}
        <NewChallengeModal isOpen={isOpen} onClose={onClose} />

        {/* Task Completion Handler - EXACTLY as original */}
        <Suspense fallback={null}>
          <TaskCompletionHandler />
        </Suspense>
      </div>

      {/* Notification Components - EXACTLY as original */}
      {isNotifDrawerOpen && (
        <Suspense fallback={null}>
          <NotificationDrawer
            setIsDrawerOpen={val => dispatch(setIsNotifDrawerOpen(val))}
            setIsModalOpen={val => dispatch(setIsNotifModalOpen(val))}
            setSelectedNotification={setSelectedNotification}
            setIsHamburgerOpen={() => {}}
          />
        </Suspense>
      )}

      {isNotifModalOpen && (
        <Suspense fallback={<ModalLoader />}>
          <NotificationModal
            selectedNotification={selectedNotification}
            setIsModalOpen={val => dispatch(setIsNotifModalOpen(val))}
            setIsDrawerOpen={val => dispatch(setIsNotifDrawerOpen(val))}
          />
        </Suspense>
      )}

      <BattleCreationNotifications />
    </>
  )
}

LoadingFallback.displayName = 'LoadingFallback'

export default QuickClash
