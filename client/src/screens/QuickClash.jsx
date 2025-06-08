// Updated screens/QuickClash.jsx
import React, { useCallback, useState, useEffect } from 'react'
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

// Import custom hook for global matchmaking
import useQuickClashGlobalMatchmaking from '../customHooks/useQuickClashGlobalMatchmaking'
import BattleCreationNotifications from '../components/quickClashComponents/BattleCreationNotifications.jsx'
import { ModalLoader } from '../components/Header-Footer/modernNavbarComponents/NavbarModalManager.jsx'

// Loading fallback
const LoadingFallback = () => (
  <Box
    height="100px"
    width="100%"
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    {/* You can add a spinner here if needed */}
  </Box>
)

const MotionBox = motion(Box)

/**
 * Main QuickClash component
 * Supports URL hash-based navigation for tabs
 */
const QuickClash = () => {
  const dispatch = useDispatch()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [showEntrance, setShowEntrance] = useState(true)
  const [showTaskPopup, setShowTaskPopup] = useState(false)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const { isAuthenticated, loginCheckStatus } = useSelector(state => state.auth)
  const { updatesLoading, isNotifModalOpen } = useSelector(state => state.app)

  const { justCompletedTaskId } = useSelector(
    state => state.quickClashDailyTasks,
  )
  const { isNotifDrawerOpen } = useSelector(state => state.app)
  const taskJustCompleted = !!justCompletedTaskId

  // Show floating action menu only on mobile
  const showFloatingMenu = useBreakpointValue({ base: true, md: false })

  // Show find match button in center and task popup only on desktop
  const showCenterMatchButton = useBreakpointValue({ base: false, md: true })
  const showDesktopTaskPopup = useBreakpointValue({ base: false, md: true })

  // Get global matchmaking state
  const { checkMatchmakingStatus } = useQuickClashGlobalMatchmaking()

  // Initial setup - check URL hash, localStorage, etc.
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
    checkMatchmakingStatus()
  }, [showDesktopTaskPopup, checkMatchmakingStatus])

  // Show popup when a task is completed (desktop only)
  useEffect(() => {
    if (taskJustCompleted && showDesktopTaskPopup) {
      setShowTaskPopup(true)
    }
  }, [taskJustCompleted, showDesktopTaskPopup])

  const checkStreakAndFetchUpdates = useCallback(() => {
    if (!updatesLoading && loginCheckStatus === 'fulfilled') {
      dispatch(fetchAppUpdates())
    }
  }, [loginCheckStatus, isAuthenticated, dispatch])
  useEffect(() => {
    checkStreakAndFetchUpdates()
  }, [loginCheckStatus, dispatch])

  // Use useCallback for event handlers
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

  // Notification drawer handlers
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
        style={{
          visibility: showEntrance ? 'hidden' : 'visible',
          opacity: showEntrance ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
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
              onClose={() => setShowTaskPopup(false)}
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

export default QuickClash
