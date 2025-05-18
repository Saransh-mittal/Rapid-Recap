// Updated screens/QuickClash.jsx to incorporate global matchmaking components
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
import { useSelector } from 'react-redux'

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
const StatsCard = lazy(() =>
  import('../components/quickClashComponents/stats/StatsCard'),
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
const TeamBattlePage = lazy(() =>
  import('../components/quickClashComponents/team/TeamBattlePage'),
)

// New Global Matchmaking components
const GlobalMatchmakingButton = lazy(() =>
  import('../components/quickClashComponents/GlobalMatchmakingButton'),
)

// Import custom hook for global matchmaking
import useQuickClashGlobalMatchmaking from '../customHooks/useQuickClashGlobalMatchmaking'
import BattleCreationNotifications from '../components/quickClashComponents/BattleCreationNotifications.jsx'

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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [showEntrance, setShowEntrance] = useState(true)
  const [showTaskPopup, setShowTaskPopup] = useState(false)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const { justCompletedTaskId } = useSelector(
    state => state.quickClashDailyTasks,
  )
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
        'team-battles': 3,
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
        py={8}
        style={{
          visibility: showEntrance ? 'hidden' : 'visible',
          opacity: showEntrance ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
        pb={{ base: '100px', md: '20px' }} // Add padding at bottom on mobile for floating action menu
      >
        {/* Header Section */}
        <QuickClashHeader onNewChallenge={handleNewChallenge} />

        {/* Stats Section - Lazy loaded */}
        <Suspense fallback={<LoadingFallback />}>
          <StatsCard />
        </Suspense>

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
                tabNames={['Active', 'Daily Tasks', 'Teams', 'Team Battles']}
                tabIcons={['Swords', 'Calendar', 'Users', 'Trophy']}
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

                {/* Team Battles Tab */}
                <TabPanel px={0}>
                  <Suspense fallback={<LoadingFallback />}>
                    <TeamBattlePage />
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
      <BattleCreationNotifications />
    </>
  )
}

export default QuickClash
