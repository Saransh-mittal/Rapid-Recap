// screens/Profile.jsx - Updated with back and home navigation buttons
import React, { Suspense, useEffect, useState, useCallback } from 'react'
import {
  Box,
  Flex,
  Skeleton,
  Button,
  HStack,
  Text,
  useBreakpointValue,
  Icon,
  VStack,
  Container,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import {
  ChevronLeft,
  ChevronRight,
  User,
  Target,
  Home,
  ArrowLeft,
} from 'lucide-react'
import { useProfile } from '../customHooks/useProfile'
import { ProfileMetadata } from '../components/profileComponents/ProfileMetadata'
import { LeftProfileSection } from '../components/profileComponents/LeftProfileSection'
import { RightProfileSection } from '../components/profileComponents/RightProfileSection'
import { findSocietyAndCircle } from '../utils/helper.utils'
import LeftProfileSectionSkeleton from '../components/profileComponents/LeftProfileSectionSkeleton'
import RightProfileSectionSkeleton from '../components/profileComponents/RightProfileSectionSkeleton'
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'

// Lazy load the Quick Clash profile
const QuickClashProfile = React.lazy(() =>
  import('../components/quickClashComponents/profile/QuickClashProfile'),
)

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)
const MotionIconButton = motion(IconButton)

// Profile view types
const PROFILE_VIEWS = {
  NORMAL: 'normal',
  QUICKCLASH: 'quickclash',
}

// Animation variants
const slideVariants = {
  enter: direction => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0.8,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: direction => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0.8,
  }),
}

const tabVariants = {
  inactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.7)',
    scale: 0.95,
    backdropFilter: 'blur(10px)',
  },
  active: {
    backgroundColor: 'rgba(128, 90, 213, 0.2)',
    color: 'white',
    scale: 1,
    boxShadow: '0 0 20px rgba(128, 90, 213, 0.4)',
    backdropFilter: 'blur(15px)',
  },
}

// Navigation button animation variants
const navButtonVariants = {
  hover: {
    scale: 1.1,
    boxShadow: '0 0 12px rgba(168, 130, 255, 0.6)',
    transition: { duration: 0.3, type: 'spring', stiffness: 200 },
  },
  tap: { scale: 0.9 },
}

export default function Profile() {
  const {
    profile,
    isLoading,
    user,
    inGameName,
    privacyProfileData,
    loginedUserProfile,
  } = useProfile()

  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentView, setCurrentView] = useState(PROFILE_VIEWS.NORMAL)
  const [direction, setDirection] = useState(0)

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false })
  const showSwipeIndicator = useBreakpointValue({ base: true, md: false })

  // Navigation handlers
  const handleBack = useCallback(() => {
    navigate(-1) // Go back to previous page
  }, [navigate])

  const handleHome = useCallback(() => {
    navigate('/home')
  }, [navigate])

  // Check if we should show Quick Clash profile by default
  useEffect(() => {
    // Check URL params first
    const view = searchParams.get('view')
    if (view === 'quickclash') {
      setCurrentView(PROFILE_VIEWS.QUICKCLASH)
    } else if (location.state?.showQuickClash) {
      // Check if we came from Quick Clash page
      setCurrentView(PROFILE_VIEWS.QUICKCLASH)
      // Update URL without triggering navigation
      setSearchParams({ view: 'quickclash' }, { replace: true })
    }
  }, [searchParams, location.state, setSearchParams])

  // Update page title based on current view
  useEffect(() => {
    const baseTitle = `${inGameName}'s ${
      profile ? `| IQ Score: ${profile.USER_IQ}` : ''
    }`
    const viewTitle =
      currentView === PROFILE_VIEWS.QUICKCLASH
        ? `Quick Clash Profile - ${baseTitle}`
        : `Rapid Recap Profile - ${baseTitle}`
    document.title = viewTitle
  }, [inGameName, profile, currentView])

  // Handle view changes
  const changeView = useCallback(
    (newView, swipeDirection = 0) => {
      if (newView !== currentView) {
        setDirection(swipeDirection)
        setCurrentView(newView)

        // Update URL
        if (newView === PROFILE_VIEWS.QUICKCLASH) {
          setSearchParams({ view: 'quickclash' }, { replace: true })
        } else {
          setSearchParams({}, { replace: true })
        }
      }
    },
    [currentView, setSearchParams],
  )

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentView === PROFILE_VIEWS.NORMAL) {
        changeView(PROFILE_VIEWS.QUICKCLASH, 1)
      }
    },
    onSwipedRight: () => {
      if (currentView === PROFILE_VIEWS.QUICKCLASH) {
        changeView(PROFILE_VIEWS.NORMAL, -1)
      }
    },
    trackMouse: false, // Only track touch on mobile
    preventScrollOnSwipe: false, // Allow vertical scrolling
    delta: 60, // Minimum swipe distance
    swipeDuration: 500, // Maximum swipe duration
    touchEventOptions: { passive: false },
  })

  // Loading state
  if (isLoading) {
    return (
      <Box
        minH="100vh"
        pt="4.5rem"
        pb={{ base: '80px', md: '20px' }}
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
          },
        }}
      >
        <ProfileMetadata
          profile={profile}
          userSocietyAndCircle={findSocietyAndCircle(user?.IQ_score)}
        />

        {/* Navigation Buttons - Loading State */}
        <MotionFlex
          position="fixed"
          top="16px"
          left="16px"
          zIndex={1000}
          gap={2}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Skeleton height="40px" width="40px" borderRadius="full" />
          <Skeleton height="40px" width="40px" borderRadius="full" />
        </MotionFlex>

        <Container maxW="container.xl" py={8}>
          <VStack spacing={6}>
            <Skeleton height="60px" width="300px" />
            <Flex
              flexDirection={{ base: 'column', md: 'row' }}
              gap={'3rem'}
              w="100%"
            >
              <LeftProfileSectionSkeleton />
              <RightProfileSectionSkeleton />
            </Flex>
          </VStack>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      minH="100vh"
      pb={{ md: '20px' }}
      position="relative"
      {...(isMobile ? swipeHandlers : {})}
    >
      <ProfileMetadata
        profile={profile}
        userSocietyAndCircle={findSocietyAndCircle(user?.IQ_score)}
      />

      {/* Navigation Buttons - Top Left */}
      <MotionFlex
        position="fixed"
        top="8px"
        left="8%"
        zIndex={1000}
        gap={2}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tooltip label="Go Back" hasArrow>
          <MotionIconButton
            as={motion.button}
            icon={<ArrowLeft size={18} />}
            onClick={handleBack}
            colorScheme="purple"
            bg="rgba(128, 90, 213, 0.2)"
            color="white"
            size="md"
            borderRadius="full"
            boxShadow="0 0 10px rgba(0,0,0,0.3)"
            _hover={{
              bg: 'rgba(128, 90, 213, 0.4)',
              color: 'white',
            }}
            aria-label="Go Back"
            variants={navButtonVariants}
            whileHover="hover"
            whileTap="tap"
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
          />
        </Tooltip>

        <Tooltip label="Home" hasArrow>
          <MotionIconButton
            as={motion.button}
            icon={<Home size={18} />}
            onClick={handleHome}
            colorScheme="purple"
            bg="rgba(128, 90, 213, 0.2)"
            color="white"
            size="md"
            borderRadius="full"
            boxShadow="0 0 10px rgba(0,0,0,0.3)"
            _hover={{
              bg: 'rgba(128, 90, 213, 0.4)',
              color: 'white',
            }}
            aria-label="Home"
            variants={navButtonVariants}
            whileHover="hover"
            whileTap="tap"
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
          />
        </Tooltip>
      </MotionFlex>

      {/* Top Navigation Dots - Mobile */}
      {isMobile && (
        <MotionBox
          position="fixed"
          top="8px"
          left="40%"
          transform="translateX(-50%)"
          zIndex={1000}
          bg="whiteAlpha.200"
          backdropFilter="blur(15px)"
          px={4}
          py={2}
          borderRadius="full"
          border="1px solid"
          borderColor="whiteAlpha.300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          boxShadow="0 4px 15px rgba(0, 0, 0, 0.1)"
        >
          <HStack spacing={3}>
            <Box
              w={currentView === PROFILE_VIEWS.NORMAL ? '24px' : '8px'}
              h="8px"
              bg={
                currentView === PROFILE_VIEWS.NORMAL
                  ? 'purple.400'
                  : 'whiteAlpha.500'
              }
              borderRadius="full"
              transition="all 0.3s"
              cursor="pointer"
              onClick={() => changeView(PROFILE_VIEWS.NORMAL)}
            />
            <Box
              w={currentView === PROFILE_VIEWS.QUICKCLASH ? '24px' : '8px'}
              h="8px"
              bg={
                currentView === PROFILE_VIEWS.QUICKCLASH
                  ? 'purple.400'
                  : 'whiteAlpha.500'
              }
              borderRadius="full"
              transition="all 0.3s"
              cursor="pointer"
              onClick={() => changeView(PROFILE_VIEWS.QUICKCLASH)}
            />
          </HStack>
        </MotionBox>
      )}

      {/* Profile Type Switcher - Desktop */}
      {!isMobile && (
        <MotionFlex
          position="fixed"
          top="8px"
          right="40%"
          zIndex={1000}
          gap={2}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <MotionButton
            leftIcon={<Icon as={User} boxSize={4} />}
            variants={tabVariants}
            animate={
              currentView === PROFILE_VIEWS.NORMAL ? 'active' : 'inactive'
            }
            onClick={() => changeView(PROFILE_VIEWS.NORMAL)}
            size="sm"
            borderRadius="full"
            border="1px solid"
            borderColor="whiteAlpha.300"
            transition="all 0.3s"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            fontSize="sm"
            fontWeight="medium"
          >
            Main Profile
          </MotionButton>

          <MotionButton
            leftIcon={<Icon as={Target} boxSize={4} />}
            variants={tabVariants}
            animate={
              currentView === PROFILE_VIEWS.QUICKCLASH ? 'active' : 'inactive'
            }
            onClick={() => changeView(PROFILE_VIEWS.QUICKCLASH)}
            size="sm"
            borderRadius="full"
            border="1px solid"
            borderColor="whiteAlpha.300"
            transition="all 0.3s"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            fontSize="sm"
            fontWeight="medium"
          >
            Quick Clash
          </MotionButton>
        </MotionFlex>
      )}

      {/* Profile Content Container */}
      <Box position="relative" w="100%" minH="100vh" overflowX="hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {currentView === PROFILE_VIEWS.NORMAL ? (
            <MotionBox
              key="normal-profile"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              position="absolute"
              width="100%"
              top={0}
              left={0}
              overflowY="auto"
              css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '2px',
                },
              }}
            >
              <Flex
                flexDirection={{ base: 'column', md: 'row' }}
                marginTop="35px" // Increased to accommodate navigation buttons
                marginInline={{ base: '2%', xl: '6.5%' }}
                alignItems={{ base: 'center', md: 'normal' }}
                justifyContent={{ base: 'center', md: 'center', lg: 'normal' }}
                className="profile-info"
                gap={'3rem'}
                pb={{ base: '40px', md: '20px' }}
              >
                <LeftProfileSection
                  key={`left-${inGameName}`}
                  profile={profile}
                  user={user}
                  inGameName={inGameName}
                  privacyProfileData={privacyProfileData}
                  loginedUserProfile={loginedUserProfile}
                />

                <RightProfileSection
                  key={`right-${inGameName}`}
                  profile={profile}
                  user={user}
                  inGameName={inGameName}
                  privacyProfileData={privacyProfileData}
                  loginedUserProfile={loginedUserProfile}
                />
              </Flex>
            </MotionBox>
          ) : (
            <MotionBox
              mt={'40px'} // Increased to accommodate navigation buttons
              key="quickclash-profile"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              position="absolute"
              width="100%"
              top={0}
              left={0}
              overflowY="auto"
              css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '2px',
                },
              }}
            >
              <Suspense
                fallback={
                  <Box py={8} px={4}>
                    <Container maxW="container.lg">
                      <VStack spacing={4}>
                        {[...Array(6)].map((_, i) => (
                          <Skeleton
                            key={i}
                            height="80px"
                            borderRadius="xl"
                            w="100%"
                          />
                        ))}
                      </VStack>
                    </Container>
                  </Box>
                }
              >
                <QuickClashProfile
                  userId={loginedUserProfile ? user?._id : profile?.userId}
                />
              </Suspense>
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  )
}
