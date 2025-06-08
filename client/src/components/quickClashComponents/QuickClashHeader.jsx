// components/quickClashComponents/QuickClashHeader.jsx
import React, {
  memo,
  useEffect,
  useMemo,
  useState,
  useCallback,
  lazy,
  Suspense,
} from 'react'
import {
  Box,
  Heading,
  Text,
  Button, // Keep for desktop new challenge
  Flex,
  Icon,
  HStack,
  useBreakpointValue,
  Tooltip,
  IconButton,
  Badge,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiZap, FiHome } from 'react-icons/fi' // FiZap for New Challenge & default 1v1
import { Target, Zap as ZapIconLucide, Bell, User } from 'lucide-react' // Target for header, Zap for 1v1 icon
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import QuickClashLeaderboardButton from './leaderboard/QuickClashLeaderboardButton'
import LevelBadge from './user/LevelBadge'
import TaskProgressIndicator from './dailyTasks/TaskProgressIndicator'
import TrophyDisplay from './user/TrophyDisplay'
import { fetchUserTrophies } from '../../redux/quickClashSlice'
import { setIsNotifDrawerOpen } from '../../redux/appSlice'

import MatchmakingButton from './MatchmakingButton' // For 1v1
import GlobalMatchmakingButton from './globalmatchmaking/GlobalMatchmakingButton' // For 4v4

const TaskPopup = lazy(() => import('./dailyTasks/TaskPopup'))

const MotionBox = motion(Box)
const MotionButton = motion(Button) // For desktop "New Challenge"
const MotionFlex = motion(Flex)
const MotionIconButton = motion(IconButton)

const QuickClashHeader = ({ onNewChallenge }) => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isDesktop = useBreakpointValue({ base: false, md: true })
  const { user } = useSelector(state => state.auth)

  // Get notification data from Redux
  const { updates, unreadFriendRequests, notification } = useSelector(
    state => state.app,
  )

  // Calculate notification count - memoized
  const notificationCount = useMemo(() => {
    const unreadUpdates = updates?.filter(u => !u.read).length || 0
    const friendRequests = unreadFriendRequests || 0
    const notificationItems = Array.isArray(notification)
      ? notification.length
      : 0
    return unreadUpdates + friendRequests + notificationItems
  }, [updates, unreadFriendRequests, notification])

  const [showTaskPopup, setShowTaskPopup] = useState(false)

  useEffect(() => {
    dispatch(fetchUserTrophies())
  }, [dispatch])

  const handleBackToHome = () => navigate('/home')
  const handleProfileClick = () => {
    navigate(`/profile/${user?.inGameName}`, {
      state: { showQuickClash: true },
    })
  }
  const handleViewTasksClick = useCallback(() => setShowTaskPopup(true), [])
  const handleCloseTaskPopup = useCallback(() => setShowTaskPopup(false), [])
  const handleNavigateToTasksSection = useCallback(() => {
    window.location.hash = 'tasks'
  }, [])

  const handleInboxClick = () => {
    dispatch(setIsNotifDrawerOpen(true))
  }

  // Animation variants (assuming these are defined elsewhere or are simple)
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
      boxShadow: '0 0 15px rgba(128, 90, 213, 0.6)',
      transition: { type: 'spring', stiffness: 300, damping: 10 },
    },
    tap: { scale: 0.98 },
  }
  const homeButtonVariants = {
    hover: {
      scale: 1.1,
      boxShadow: '0 0 12px rgba(168, 130, 255, 0.6)',
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
      boxShadow: '0 0 12px rgba(66, 153, 225, 0.6)',
      transition: {
        duration: 0.3,
        type: 'spring',
        stiffness: 200,
      },
    },
    tap: { scale: 0.9 },
  }

  return (
    <MotionBox
      variants={containerVariants}
      initial="initial"
      animate="animate"
      position="relative"
    >
      {/* Mobile Fixed Header */}
      <MotionFlex
        position="fixed"
        top="16px"
        left="16px"
        right="16px"
        zIndex={1000} // Ensure it's above other content
        display={{ base: 'flex', md: 'none' }}
        justifyContent="space-between"
        alignItems="center"
        variants={itemVariants}
      >
        <Tooltip label={t('Back to Home')}>
          <MotionIconButton
            as={motion.button}
            icon={<FiHome size={18} />}
            onClick={handleBackToHome}
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
            aria-label={t('Back to Home')}
            variants={homeButtonVariants} // Re-using homeButtonVariants for consistency
            initial="initial" // Needed if variants has initial
            animate="animate" // Needed if variants has animate
            whileHover="hover"
            whileTap="tap"
          />
        </Tooltip>

        <HStack spacing={2}>
          <TrophyDisplay />
          <LevelBadge />
          <TaskProgressIndicator onViewTasks={handleViewTasksClick} size="sm" />
        </HStack>
      </MotionFlex>

      {/* Desktop Header */}
      <MotionFlex
        justify="space-between"
        align="center"
        mb={4}
        variants={itemVariants}
        display={{ base: 'none', md: 'flex' }}
      >
        <MotionFlex gap={3} align="center">
          <MotionButton
            as={motion.button} // Ensure framer-motion integration
            leftIcon={<FiHome size={18} />}
            onClick={handleBackToHome}
            variant="ghost"
            colorScheme="purple"
            color="whiteAlpha.900"
            size="md"
            borderRadius="full"
            p={3}
            _hover={{
              bg: 'rgba(128, 90, 213, 0.2)',
              color: 'purple.300',
              transform: 'translateY(-2px)',
            }}
            aria-label={t('Back to Home')}
            variants={homeButtonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {t('Home')}
          </MotionButton>

          <MotionButton
            as={motion.button}
            leftIcon={<User size={20} />}
            onClick={handleProfileClick}
            variant="ghost"
            colorScheme="purple"
            color="whiteAlpha.900"
            size="md"
            borderRadius="full"
            p={3}
            _hover={{
              bg: 'rgba(128, 90, 213, 0.2)',
              color: 'purple.300',
              transform: 'translateY(-2px)',
            }}
            aria-label={t('Open Quick Clash Profile')}
            variants={homeButtonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {t('Profile')}
          </MotionButton>
        </MotionFlex>

        <HStack spacing={3}>
          <TrophyDisplay />
          <LevelBadge />

          {/* Inbox Button - Desktop */}
          <Box position="relative">
            <Tooltip label={t('Notifications')}>
              <MotionIconButton
                as={motion.button}
                icon={<Bell size={20} />}
                onClick={handleInboxClick}
                variant="ghost"
                colorScheme="blue"
                color="whiteAlpha.900"
                size="md"
                borderRadius="full"
                p={3}
                _hover={{
                  bg: 'rgba(66, 153, 225, 0.2)',
                  color: 'blue.300',
                  transform: 'translateY(-2px)',
                }}
                aria-label={t('Open Notifications')}
                variants={inboxButtonVariants}
                whileHover="hover"
                whileTap="tap"
              />
            </Tooltip>
            {notificationCount > 0 && (
              <Badge
                position="absolute"
                top="-2px"
                right="-2px"
                bg="red.500"
                color="white"
                borderRadius="full"
                fontSize="xs"
                minW="18px"
                h="18px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="2px solid"
                borderColor="blue.500"
                zIndex={1}
              >
                {notificationCount > 99 ? '99+' : notificationCount}
              </Badge>
            )}
          </Box>
          <TaskProgressIndicator onViewTasks={handleViewTasksClick} size="sm" />
        </HStack>
      </MotionFlex>

      {/* Main Header Content */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ base: 'center', md: 'center' }}
        mb={{ base: 4, md: 8 }} // Adjusted margin bottom for mobile
        gap={{ base: 3, md: 4 }} // Gap between title/desc and buttons on mobile
        mt={{ base: '80px', md: 0 }} // Increased top margin for mobile to clear fixed header
      >
        {/* Title and Description */}
        <MotionBox
          flex="1"
          variants={itemVariants}
          textAlign={{ base: 'center', md: 'left' }}
          maxW={{ base: '100%', md: '60%' }}
          // mb={{ base: 4, md: 0 }} // Margin bottom now handled by parent Flex gap
        >
          <Heading
            size={{ base: 'xl', md: '2xl' }}
            color="purple.300"
            mb={2}
            textShadow="0 0 15px rgba(128, 90, 213, 0.4)"
          >
            <Flex
              alignItems="center"
              justifyContent={{ base: 'center', md: 'flex-start' }}
            >
              <Icon
                as={Target}
                mr={2}
                boxSize={{ base: 6, md: 8 }}
                color="purple.300"
              />
              {t('Quick Clash')}
            </Flex>
          </Heading>
          <Text color="whiteAlpha.800" fontSize={{ base: 'sm', md: 'md' }}>
            {t(
              'Challenge other players to rapid-fire reading and quiz battles, test your knowledge and rise up the ranks!',
            )}
          </Text>
        </MotionBox>

        {/* START: Mobile Matchmaking Buttons */}
        <HStack
          display={{ base: 'flex', md: 'none' }}
          spacing={{ base: 2, sm: 3 }}
          // mt is handled by parent Flex gap
          justifyContent="center"
          w="100%"
          px={{ base: 2, sm: 0 }} // Padding for the HStack container on smallest screens
          variants={itemVariants}
        >
          {/* 1v1 Button - Uses MatchmakingButton with overrides */}
          <Box flex={1} minWidth={0} display="flex" justifyContent="center">
            <MatchmakingButton
              buttonTextOverride="SOLO"
              iconOverride={ZapIconLucide} // From lucide-react
              // bgGradientOverride will use the default purple-blue from MatchmakingButton
            />
          </Box>

          {/* 4v4 Button - Uses GlobalMatchmakingButton */}
          {/* We need to make GlobalMatchmakingButton adapt to a shorter text for mobile header */}
          {/* One way is to pass a prop to GlobalMatchmakingButton to shorten its text, */}
          {/* or style it to be more compact here. For now, let's assume it might be a bit long. */}
          <Box flex={1} minWidth={0} display="flex" justifyContent="center">
            {/*
              The GlobalMatchmakingButton uses its own text based on its state.
              To make it "4v4", we'd ideally modify GlobalMatchmakingButton to accept a text override
              similar to MatchmakingButton, or have a specific "header" mode.
              For now, we render it as is. Its `compact` prop is for icon-only.
              The non-compact version will be used here.
            */}
            <GlobalMatchmakingButton />
            {/* If GlobalMatchmakingButton needs to be styled as "4v4" specifically here,
                and it doesn't support text override like MatchmakingButton, you might need
                to wrap it or create a variant of it.
                The image shows "Join 4v4 Matchmaking". If you want just "4v4",
                GlobalMatchmakingButton needs a prop for that.

                Let's assume GlobalMatchmakingButton by default shows "Join 4v4 Matchmaking"
                when not in queue, which is fine for a full button.
            */}
          </Box>
        </HStack>
        {/* END: Mobile Matchmaking Buttons */}

        {/* Desktop Action Buttons Group (New Challenge, Leaderboard) */}
        <HStack
          spacing={3}
          align="center"
          justify={{ base: 'center', md: 'flex-end' }}
          // mt={{ base: 4, md: 0 }} // Removed as mobile buttons are in their own HStack
          w={{ base: '100%', md: 'auto' }}
          display={{ base: 'none', md: 'flex' }} // IMPORTANT: Hide on mobile
          variants={itemVariants}
        >
          <MotionButton
            as={motion.button} // Ensure framer-motion integration
            leftIcon={<FiZap />} // Original New Challenge icon
            bg="purple.600"
            _hover={{ bg: 'purple.700' }}
            onClick={onNewChallenge}
            size={{ base: 'md', md: 'lg' }} // Responsive size
            color="white"
            px={6}
            borderRadius="lg"
            boxShadow="0 4px 15px rgba(0,0,0,0.3)"
            fontWeight="bold"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {t('New Challenge')}
          </MotionButton>
          <QuickClashLeaderboardButton showMobileVersion={isDesktop} />
        </HStack>
      </Flex>

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
    </MotionBox>
  )
}

export default memo(QuickClashHeader)
