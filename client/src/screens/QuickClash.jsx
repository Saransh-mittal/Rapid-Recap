// screens/QuickClash.jsx - UPDATED WITH AUTHORIZATION CHECK
import React, { useCallback, useState, useEffect, useMemo, memo } from 'react'
import {
  Container,
  Box,
  useDisclosure,
  TabPanel,
  Center,
  useBreakpointValue,
  HStack,
  useToast,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next' // Added for translations

// Regular imports
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

// Entrance animation
const QuickClashEntrance = lazy(() =>
  import('../components/quickClashComponents/QuickClashEntrance'),
)
const TaskCompletionHandler = React.lazy(() =>
  import(
    '../components/quickClashComponents/dailyTasks/TaskCompletionHandler.jsx'
  ),
)

// Coming Soon Component
const QuickClashComingSoon = lazy(() =>
  import('../components/quickClashComponents/QuickClashComingSoon'),
)

// Lazy loaded components for better performance
const ActiveChallenges = lazy(() =>
  import('../components/quickClashComponents/ActiveChallenges'),
)
const DailyTasksDashboard = lazy(() =>
  import('../components/quickClashComponents/dailyTasks/DailyTasksDashboard'),
)
const TaskPopup = lazy(() =>
  import('../components/quickClashComponents/dailyTasks/TaskPopup'),
)

// FIXED: Only import the modal manager (which includes button)
const MatchmakingModalManager = lazy(() =>
  import(
    '../components/quickClashComponents/matchmaking/MatchmakingModalManager'
  ),
)
const FloatingActionMenu = lazy(() =>
  import('../components/quickClashComponents/FloatingActionMenu'),
)

// New Team components
const TeamDashboard = lazy(() =>
  import('../components/quickClashComponents/team/TeamDashboard'),
)

// New Global Matchmaking components
const GlobalMatchmakingButton = lazy(() =>
  import(
    '../components/quickClashComponents/globalmatchmaking/GlobalMatchmakingButton'
  ),
)

// Notification Drawer component
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

// Import custom hook for global matchmaking
import useQuickClashGlobalMatchmaking from '../customHooks/useQuickClashGlobalMatchmaking'
import BattleCreationNotifications from '../components/quickClashComponents/BattleCreationNotifications.jsx'
import { ModalLoader } from '../components/Header-Footer/modernNavbarComponents/NavbarModalManager.jsx'

// Optimized loading fallback component
const LoadingFallback = memo(() => (
  <Box
    height="100px"
    width="100%"
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    {/* You can add a spinner here if needed */}
  </Box>
))

const MotionBox = motion(Box)

// Cached responsive configuration for better performance
const RESPONSIVE_CONFIG = {
  showFloatingMenu: { base: true, md: false },
  showCenterMatchButton: { base: false, md: true },
  showDesktopTaskPopup: { base: false, md: true },
}

/**
 * UPDATED QuickClash component with authorization check
 * Shows coming soon screen for unauthorized users
 * Shows full QuickClash interface for authorized users
 */
const QuickClash = () => {
  const { t } = useTranslation('QuickClash') // Added for translations
  const dispatch = useDispatch()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [showEntrance, setShowEntrance] = useState(true)
  const [showTaskPopup, setShowTaskPopup] = useState(false)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [selectedNotification, setSelectedNotification] = useState(null)

  // NEW: Authorization state
  const [isAuthorized, setIsAuthorized] = useState(null) // null = checking, true = authorized, false = not authorized
  const [comingSoonData, setComingSoonData] = useState(null)

  // Memoize selectors to prevent unnecessary re-renders
  const { loginCheckStatus, user } = useSelector(state => state.auth)
  const { updatesLoading, isNotifModalOpen, isNotifDrawerOpen } = useSelector(
    state => state.app,
  )
  const { justCompletedTaskId } = useSelector(
    state => state.quickClashDailyTasks,
  )

  // Cache responsive values
  const showFloatingMenu = useBreakpointValue(
    RESPONSIVE_CONFIG.showFloatingMenu,
  )

  const showDesktopTaskPopup = useBreakpointValue(
    RESPONSIVE_CONFIG.showDesktopTaskPopup,
  )

  // Memoize computed values
  const taskJustCompleted = useMemo(
    () => !!justCompletedTaskId,
    [justCompletedTaskId],
  )

  // Get global matchmaking state
  const { checkMatchmakingStatus } = useQuickClashGlobalMatchmaking()

  // NEW: Check authorization status
  const checkAuthorization = useCallback(async () => {
    try {
      // Make a test API call to check authorization
      const response = await axios.get('/api/quickClash/stats')

      // If the call succeeds, user is authorized
      setIsAuthorized(true)
    } catch (error) {
      if (
        error.response?.status === 403 &&
        error.response?.data?.isComingSoon
      ) {
        // User is not authorized, show coming soon
        setIsAuthorized(false)
        setComingSoonData(error.response.data.comingSoonData)
      } else {
        // Other errors - show error toast but don't block access
        toast({
          title: t('Connection Error'),
          description: t('Unable to verify access. Please try again.'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        // Assume authorized to avoid blocking legitimate users
        setIsAuthorized(true)
      }
    }
  }, [toast, t])

  // Check authorization when component mounts and user is available
  useEffect(() => {
    if (user && loginCheckStatus === 'fulfilled') {
      checkAuthorization()
    }
  }, [user, loginCheckStatus, checkAuthorization])

  // Memoized function to check streak and fetch updates
  const checkStreakAndFetchUpdates = useCallback(() => {
    if (!updatesLoading && loginCheckStatus === 'fulfilled' && isAuthorized) {
      dispatch(fetchAppUpdates())
    }
  }, [loginCheckStatus, updatesLoading, dispatch, isAuthorized])

  // Initial setup effect - memoized for better performance
  useEffect(() => {
    // Only run setup if user is authorized
    if (isAuthorized !== true) return

    const lastVisit = localStorage.getItem('quickClashLastVisit')
    const now = Date.now()

    // Check URL hash for initial tab
    const hash = window.location.hash.substring(1)
    if (hash) {
      // Map hash to tab index
      const hashToIndex = {
        active: 0,
        tasks: 1,
        teams: 2,
      }

      if (hashToIndex[hash] !== undefined) {
        setActiveTabIndex(hashToIndex[hash])
      }
    }

    // Show entrance animation if it's been more than 1 hour since last visit
    if (!lastVisit || now - parseInt(lastVisit) > 60 * 60 * 1000) {
      setShowEntrance(true)
      localStorage.setItem('quickClashLastVisit', now.toString())
    } else {
      setShowEntrance(false)
    }

    // Show task popup after a short delay (desktop only)
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

  // Task popup effect - memoized
  useEffect(() => {
    if (taskJustCompleted && showDesktopTaskPopup && isAuthorized) {
      setShowTaskPopup(true)
    }
  }, [taskJustCompleted, showDesktopTaskPopup, isAuthorized])

  // Streak check effect - memoized
  useEffect(() => {
    if (isAuthorized) {
      checkStreakAndFetchUpdates()
    }
  }, [isAuthorized])

  // Optimized event handlers with useCallback
  const handleNewChallenge = useCallback(() => {
    onOpen()
  }, [onOpen])

  const handleEntranceComplete = useCallback(() => {
    setShowEntrance(false)
  }, [])

  // Handle viewing all tasks from the popup - now using URL hash navigation
  const handleViewAllTasks = useCallback(() => {
    // Update URL hash to navigate to tasks tab
    window.location.hash = 'tasks'
    // Don't hide the popup here - the TaskPopup handles this
  }, [])

  // Update local tab index when changed via hash
  const handleTabChange = useCallback(index => {
    setActiveTabIndex(index)
  }, [])

  // Task popup close handler - memoized
  const handleTaskPopupClose = useCallback(() => {
    setShowTaskPopup(false)
  }, [])

  // Memoized container style for visibility
  const containerStyle = useMemo(
    () => ({
      visibility: showEntrance ? 'hidden' : 'visible',
      opacity: showEntrance ? 0 : 1,
      transition: 'opacity 0.3s ease-in-out',
    }),
    [showEntrance],
  )

  // Show loading while checking authorization
  if (isAuthorized === null) {
    return <LoadingFallback />
  }

  // Show coming soon screen for unauthorized users
  if (isAuthorized === false) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <QuickClashComingSoon comingSoonData={comingSoonData} />
      </Suspense>
    )
  }

  // Show normal QuickClash interface for authorized users
  return (
    <>
      {showEntrance && (
        <Suspense fallback={<LoadingFallback />}>
          <QuickClashEntrance onComplete={handleEntranceComplete} />
        </Suspense>
      )}

      <Container
        className="quick-clash-container"
        maxW="container.xl"
        px={2}
        py={4}
        style={containerStyle}
        pb={'20px'} // Add padding at bottom on mobile for floating action menu
      >
        {/* Header Section - NO modal management, simple buttons only */}
        <QuickClashHeader onNewChallenge={handleNewChallenge} />

        {/* FIXED: Desktop Center Buttons - SINGLE MatchmakingModalManager only here */}

        <Center my={5}>
          <Suspense fallback={<LoadingFallback />}>
            <HStack
              spacing={4}
              w={{ base: '100%', md: 'auto' }}
              justifyContent="center"
            >
              {/* FIXED: Full MatchmakingModalManager - only one in the entire app */}
              <MatchmakingModalManager
                buttonTextOverride={t('SOLO')}
                buttonWidth={{ base: '100%', md: '240px' }}
                buttonHeight={{ base: '48px', md: '56px' }}
                buttonMinWidth={{ base: '140px', md: '240px' }}
              />
              <GlobalMatchmakingButton />
            </HStack>
          </Suspense>
        </Center>

        {/* Tabs Section */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={'quick-clash-tabs'}
        >
          <Box
            borderRadius="lg"
            bg="#1a1527"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
            mb={4}
          >
            <Box p={{ base: 1, md: 4 }}>
              <CustomTabs
                initialTabIndex={activeTabIndex}
                onChange={handleTabChange}
                tabNames={[t('Active'), t('Daily Tasks'), t('Teams')]}
                tabIcons={['Swords', 'Calendar', 'Users']}
              >
                <TabPanel px={0}>
                  <Suspense fallback={<LoadingFallback />}>
                    <ActiveChallenges />
                  </Suspense>
                </TabPanel>

                <TabPanel px={0}>
                  <Suspense fallback={<LoadingFallback />}>
                    <DailyTasksDashboard />
                  </Suspense>
                </TabPanel>

                {/* Team Tab */}
                <TabPanel px={0}>
                  <Suspense fallback={<LoadingFallback />}>
                    <TeamDashboard />
                  </Suspense>
                </TabPanel>
              </CustomTabs>
            </Box>
          </Box>
        </MotionBox>

        {/* Mobile Floating Action Menu */}
        {showFloatingMenu && (
          <Suspense fallback={null}>
            <FloatingActionMenu onNewChallenge={handleNewChallenge} />
          </Suspense>
        )}

        {/* Task Popup - Desktop Only */}
        {showDesktopTaskPopup && showTaskPopup && (
          <Suspense fallback={null}>
            <TaskPopup
              onViewAllTasks={handleViewAllTasks}
              isOpen={showTaskPopup}
              onClose={handleTaskPopupClose}
            />
          </Suspense>
        )}

        {/* Challenge Modal */}
        <NewChallengeModal isOpen={isOpen} onClose={onClose} />

        {/* Task Completion Handler */}
        <Suspense fallback={null}>
          <TaskCompletionHandler />
        </Suspense>
      </Container>

      {/* Notification Drawer */}
      {isNotifDrawerOpen && (
        <Suspense fallback={null}>
          <NotificationDrawer
            setIsDrawerOpen={val => dispatch(setIsNotifDrawerOpen(val))}
            setIsModalOpen={val => dispatch(setIsNotifModalOpen(val))}
            setSelectedNotification={setSelectedNotification}
            setIsHamburgerOpen={() => {}} // No hamburger menu in QuickClash
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

// Set display name for debugging
LoadingFallback.displayName = 'LoadingFallback'

export default QuickClash
