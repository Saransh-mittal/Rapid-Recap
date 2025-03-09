import React, { useCallback } from 'react'
import { Container, Box, useDisclosure, TabPanel } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { lazy, Suspense } from 'react'

// Regular imports
import QuickClashHeader from '../components/quickClashComponents/QuickClashHeader'
import CustomTabs from '../components/quickClashComponents/ui/CustomTabs'
import NewChallengeModal from '../components/quickClashComponents/modals/NewChallengeModal'

// Lazy loaded components for better performance
const StatsCard = lazy(() =>
  import('../components/quickClashComponents/stats/StatsCard'),
)
const ActiveChallenges = lazy(() =>
  import('../components/quickClashComponents/ActiveChallenges'),
)
const CompletedChallenges = lazy(() =>
  import('../components/quickClashComponents/CompletedChallenges'),
)
const MatchmakingTab = lazy(() =>
  import('../components/quickClashComponents/MatchmakingTab'),
)

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

const QuickClash = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Use useCallback for event handlers
  const handleNewChallenge = useCallback(() => {
    onOpen()
  }, [onOpen])

  return (
    <Container maxW="container.xl" py={8}>
      {/* Header Section */}
      <QuickClashHeader onNewChallenge={handleNewChallenge} />

      {/* Stats Section - Lazy loaded */}
      <Suspense fallback={<LoadingFallback />}>
        <StatsCard />
      </Suspense>

      {/* Tabs Section */}
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          borderRadius="lg"
          bg="#1a1527"
          borderWidth="1px"
          borderColor="whiteAlpha.100"
          mb={4}
        >
          <Box p={4}>
            <CustomTabs initialTabIndex={0}>
              <TabPanel px={0}>
                <Suspense fallback={<LoadingFallback />}>
                  <ActiveChallenges />
                </Suspense>
              </TabPanel>
              <TabPanel px={0}>
                <Suspense fallback={<LoadingFallback />}>
                  <CompletedChallenges />
                </Suspense>
              </TabPanel>
              <TabPanel px={0}>
                <Suspense fallback={<LoadingFallback />}>
                  <MatchmakingTab />
                </Suspense>
              </TabPanel>
            </CustomTabs>
          </Box>
        </Box>
      </MotionBox>

      {/* Challenge Modal */}
      <NewChallengeModal isOpen={isOpen} onClose={onClose} />
    </Container>
  )
}

export default QuickClash
