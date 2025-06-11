// Updated screens/QuickClash.jsx
import React, { useCallback, useState, useEffect, useMemo, memo } from 'react'
import {
  Container,
  Box,
  useDisclosure,
  TabPanel,
  Center,
  useBreakpointValue,
  HStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { lazy, Suspense } from 'react'

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
const MatchmakingButton = lazy(() =>
  import('../components/quickClashComponents/MatchmakingButton'),
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
// const QuickClashDebugPanel = React.lazy(() =>
//   import('../components/quickClashComponents/debug/QuickClashDebugPanel'),
// )

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
 * Optimized QuickClash component - maintains exact original design with performance improvements
 * - Memoized expensive operations and event handlers
 * - Cached responsive values to reduce re-renders
 * - Optimized state management
 * - Removed unused variables and imports
 * - Supports URL hash-based navigation for tabs
 */
const QuickClash = () => {
  const dispatch = useDispatch()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [showEntrance, setShowEntrance] = useState(true)
  const [showTaskPopup, setShowTaskPopup] = useState(false)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)

  // Memoize selectors to prevent unnecessary re-renders
  const { isAuthenticated, loginCheckStatus } = useSelector(state => state.auth)
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
  const showCenterMatchButton = useBreakpointValue(
    RESPONSIVE_CONFIG.showCenterMatchButton,
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

  // Memoized function to check streak and fetch updates
  const checkStreakAndFetchUpdates = useCallback(() => {
    if (!updatesLoading && loginCheckStatus === 'fulfilled') {
      dispatch(fetchAppUpdates())
    }
  }, [loginCheckStatus, updatesLoading, dispatch])

  // Initial setup effect - memoized for better performance
  useEffect(() => {
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

    // Check matchmaking status on mount
  }, [showDesktopTaskPopup])

  useEffect(() => {
    checkMatchmakingStatus()
  }, [loginCheckStatus, updatesLoading])

  // Task popup effect - memoized
  useEffect(() => {
    if (taskJustCompleted && showDesktopTaskPopup) {
      setShowTaskPopup(true)
    }
  }, [taskJustCompleted, showDesktopTaskPopup])

  // Streak check effect - memoized
  useEffect(() => {
    checkStreakAndFetchUpdates()
  }, [])

  // Optimized event handlers with useCallback
  const handleNewChallenge = useCallback(() => {
    onOpen()
  }, [onOpen])

  const handleFindMatch = useCallback(() => {
    // This would trigger the matchmaking flow
    // For now, just show the matchmaking modal like the MatchmakingButton does
    if (
      window.matchmakingButtonRef &&
      window.matchmakingButtonRef.handleJoinMatchmaking
    ) {
      window.matchmakingButtonRef.handleJoinMatchmaking()
    }
  }, [])

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

  // Notification drawer handlers - memoized
  const handleNotificationDrawerClose = useCallback(() => {
    dispatch(setIsNotifDrawerOpen(false))
  }, [dispatch])

  const handleNotificationModalOpen = useCallback(notification => {
    setSelectedNotification(notification)
    setIsNotificationModalOpen(true)
  }, [])

  const handleNotificationModalClose = useCallback(() => {
    setIsNotificationModalOpen(false)
    setSelectedNotification(null)
    dispatch(setSelectedNotificationId(null))
  }, [dispatch])

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

  return (
    <>
      {showEntrance && (
        <Suspense fallback={<LoadingFallback />}>
          <QuickClashEntrance onComplete={handleEntranceComplete} />
        </Suspense>
      )}
      {/* {QuickClashDebugPanel && (
        <React.Suspense fallback={null}>
          <QuickClashDebugPanel
            isEnabled={true}
            defaultPosition="floating" // or "drawer"
          />
        </React.Suspense>
      )} */}
      <Container
        className="quick-clash-container"
        maxW="container.xl"
        px={2}
        py={4}
        style={containerStyle}
        pb={'20px'} // Add padding at bottom on mobile for floating action menu
      >
        {/* Header Section */}
        <QuickClashHeader onNewChallenge={handleNewChallenge} />

        {/* Matchmaking Buttons at the top center - desktop only */}
        {showCenterMatchButton && (
          <Center my={5}>
            <Suspense fallback={<LoadingFallback />}>
              <HStack spacing={4}>
                <MatchmakingButton
                  ref={el => (window.matchmakingButtonRef = el)}
                />
                <GlobalMatchmakingButton />
              </HStack>
            </Suspense>
          </Center>
        )}

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
                tabNames={['Active', 'Daily Tasks', 'Teams']}
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

        {/* Floating Action Menu for mobile - Using the enhanced version with integrated task popup */}
        {showFloatingMenu && (
          <Suspense fallback={null}>
            <FloatingActionMenu
              onNewChallenge={handleNewChallenge}
              onFindMatch={handleFindMatch}
            />
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
