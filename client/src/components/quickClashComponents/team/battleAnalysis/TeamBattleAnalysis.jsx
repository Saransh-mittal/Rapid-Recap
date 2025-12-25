// components/quickClashComponents/team/battleAnalysis/TeamBattleAnalysis.jsx
import React, { useEffect, useMemo, Suspense, lazy } from 'react'
import {
  Box,
  VStack,
  Button,
  Center,
  Text,
  Icon,
  useBreakpointValue,
  Container,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { useSelector } from 'react-redux'

// Custom hooks
import useQuickClashAnalysis from '../../../../customHooks/useQuickClashAnalysis'

// Error Boundary
import ErrorBoundary from '../../../common/ErrorBoundary'

// Optimized Components - Lazy loaded for better performance
const LoadingScreen = lazy(() => import('./components/LoadingScreen'))
const ErrorScreen = lazy(() => import('./components/ErrorScreen'))
const BattleResultBanner = lazy(() => import('./components/BattleResultBanner'))
const AnalysisContent = lazy(() => import('./components/AnalysisContent'))

// Import feedback context
import { FeedbackProvider } from '../../../../contextAPI/FeedbackContext'

const MotionContainer = motion(Container)
const MotionBox = motion(Box)

// Simplified container variants for better performance - removed staggerChildren
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3, // Reduced from 0.4
      ease: 'easeOut',
    },
  },
}

// Simplified floating animation - much less intensive
const floatVariants = {
  animate: {
    y: [0, -2, 0], // Reduced from -5
    transition: {
      duration: 4, // Increased from 3
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

/**
 * Optimized Inner component that uses the feedback context
 */
const TeamBattleAnalysisInner = React.memo(() => {
  const { t } = useTranslation('QuickClash')
  const { battleId } = useParams()
  const { user } = useSelector(state => state.auth)

  // Memoized responsive values - reduced breakpoint calculations
  const responsiveConfig = useMemo(
    () => ({
      containerMaxW: 'container.xl',
      containerPx: { base: 3, sm: 4, md: 6 }, // Reduced padding
      isMobile: window.innerWidth < 768, // Static check instead of useBreakpointValue
    }),
    [],
  )

  const {
    currentBattleAnalysis: battle,
    userTeam,
    battleAnalysisLoading,
    battleAnalysisError,
    getBattleAnalysis,
    goBack,
    clearAnalysis,
    trackInteraction,
  } = useQuickClashAnalysis()

  // Memoized user member data calculation
  const userMemberData = useMemo(() => {
    if (!battle || !user || !userTeam) return null
    const teamMembers =
      userTeam === 'teamA' ? battle.teamAMembers : battle.teamBMembers
    return teamMembers.find(
      member => member.user && member.user._id === user._id,
    )
  }, [battle, user, userTeam])

  // Enhanced loading sequence with better performance
  useEffect(() => {
    if (battleId && !battle) {
      getBattleAnalysis(battleId).catch(err => {
        // Error handled by the hook's toast system
      })
    }
  }, [battleId, getBattleAnalysis, battle])

  // Cleanup on unmount - optimized
  useEffect(() => {
    return () => {
      clearAnalysis()
    }
  }, [clearAnalysis])

  // Track page view with debouncing for performance
  useEffect(() => {
    if (battle && userTeam) {
      const timer = setTimeout(() => {
        trackInteraction('analysis_page_view', {
          battleId,
          userTeam,
          hasRecap: !!battle.battleRecap,
        })
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [battle, userTeam, trackInteraction, battleId])

  // Loading state with Suspense fallback
  if (battleAnalysisLoading && !battle) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <LoadingScreen />
      </Suspense>
    )
  }

  // Error state
  if (battleAnalysisError && !battle) {
    return (
      <Suspense fallback={<div>Error occurred</div>}>
        <ErrorScreen error={battleAnalysisError} onRetry={goBack} />
      </Suspense>
    )
  }

  // Battle not found state - optimized
  if (!battle || !userTeam) {
    return (
      <Box minH="100vh" position="relative" bg="transparent">
        <Center minH="100vh" p={4}>
          <VStack spacing={6} textAlign="center" maxW="md">
            <MotionBox variants={floatVariants} animate="animate">
              <Box
                p={4}
                borderRadius="full"
                bg="rgba(245, 158, 11, 0.1)"
                border="2px solid"
                borderColor="yellow.500"
              >
                <Icon as={AlertTriangle} color="yellow.400" boxSize={8} />
              </Box>
            </MotionBox>
            <VStack spacing={4}>
              <Text
                color="yellow.400"
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
              >
                {t('Battle Not Found')}
              </Text>
              <Text
                color="whiteAlpha.800"
                fontSize={{ base: 'md', md: 'lg' }}
                maxW="sm"
              >
                {t(
                  'This battle analysis is no longer available or could not be loaded.',
                )}
              </Text>
              <Button
                leftIcon={<ArrowLeft size={18} />}
                colorScheme="purple"
                size="lg"
                onClick={goBack}
                borderRadius="xl"
                px={6}
                py={5}
                mt={4}
                transition="all 0.2s ease"
              >
                {t('Back to Battles')}
              </Button>
            </VStack>
          </VStack>
        </Center>
      </Box>
    )
  }

  // Main Content Render with optimized structure
  return (
    <Box
      minH="100vh"
      position="relative"
      overflowX="hidden"
      bg="transparent"
      pb={2}
    >
      {/* Simplified background elements - only for desktop and fewer elements */}
      {!responsiveConfig.isMobile && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={0}
          overflow="hidden"
          pointerEvents="none"
        >
          <MotionBox
            position="absolute"
            top="15%"
            left="8%"
            w="100px" // Reduced from 120px
            h="100px"
            bg="cyan.700"
            borderRadius="full"
            opacity={0.06} // Reduced from 0.08
            filter="blur(30px)" // Reduced from 40px
            animate={{
              scale: [1, 1.01, 1], // Reduced animation
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} // Slower
          />
        </Box>
      )}

      <MotionContainer
        maxW={responsiveConfig.containerMaxW}
        px={responsiveConfig.containerPx}
        pt={{ base: 4, md: 6 }}
        position="relative"
        zIndex={1}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Back Button - simplified */}
        <MotionBox
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          mb={{ base: 4, md: 6 }}
        >
          <Button
            leftIcon={<ArrowLeft size={16} />}
            variant="outline"
            onClick={goBack}
            color="whiteAlpha.800"
            borderColor="whiteAlpha.300"
            borderRadius="lg"
            px={5}
            py={4}
            fontSize="sm"
            fontWeight="medium"
            _hover={{
              bg: 'rgba(255, 255, 255, 0.08)',
              borderColor: 'purple.400',
              color: 'white',
            }}
            transition="all 0.2s ease"
          >
            {t('Back to Battles')}
          </Button>
        </MotionBox>

        {/* Battle Result Banner - lazy loaded with error boundary */}
        {/* UPDATED: Removed onShare prop */}
        <ErrorBoundary
          title="Banner Error"
          fallbackText="Failed to load battle result banner"
        >
          <Suspense
            fallback={<Box h="280px" bg="whiteAlpha.50" borderRadius="xl" />}
          >
            <BattleResultBanner battle={battle} userTeam={userTeam} />
          </Suspense>
        </ErrorBoundary>

        {/* Main Analysis Content - lazy loaded with error boundary */}
        <ErrorBoundary
          title="Analysis Error"
          fallbackText="Failed to load battle analysis content"
        >
          <Suspense
            fallback={
              <Box h="200px" bg="whiteAlpha.50" borderRadius="xl" mt={4} />
            }
          >
            <AnalysisContent
              battle={battle}
              userTeam={userTeam}
              userMemberData={userMemberData}
              user={user}
              battleId={battleId}
            />
          </Suspense>
        </ErrorBoundary>
      </MotionContainer>
    </Box>
  )
})

// Display name for debugging
TeamBattleAnalysisInner.displayName = 'TeamBattleAnalysisInner'

/**
 * Main TeamBattleAnalysis Component wrapped with FeedbackProvider and ErrorBoundary
 * Optimized with React.memo and proper context isolation
 */
const TeamBattleAnalysis = React.memo(() => {
  return (
    <ErrorBoundary
      title="Battle Analysis Error"
      fallbackText="Failed to load the battle analysis system"
    >
      <FeedbackProvider>
        <TeamBattleAnalysisInner />
      </FeedbackProvider>
    </ErrorBoundary>
  )
})

TeamBattleAnalysis.displayName = 'TeamBattleAnalysis'

export default TeamBattleAnalysis
