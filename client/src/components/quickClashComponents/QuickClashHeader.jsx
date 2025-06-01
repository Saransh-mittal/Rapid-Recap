// components/quickClashComponents/QuickClashHeader.jsx
import React, { memo, useEffect, useMemo } from 'react'
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Icon,
  HStack,
  useBreakpointValue,
  Tooltip,
  IconButton,
  Badge,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiZap, FiHome } from 'react-icons/fi'
import { Target, Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import QuickClashLeaderboardButton from './leaderboard/QuickClashLeaderboardButton'
import LevelBadge from './user/LevelBadge'
import TaskProgressIndicator from './dailyTasks/TaskProgressIndicator'
import TrophyDisplay from './user/TrophyDisplay'
import { fetchUserTrophies } from '../../redux/quickClashSlice'
import { setIsNotifDrawerOpen } from '../../redux/appSlice'

const MotionBox = motion(Box)
const MotionButton = motion(Button)
const MotionFlex = motion(Flex)
const MotionIconButton = motion(IconButton)

const QuickClashHeader = ({ onNewChallenge }) => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isDesktop = useBreakpointValue({ base: false, md: true })

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

  // Fetch trophy data when component mounts
  useEffect(() => {
    dispatch(fetchUserTrophies())
  }, [dispatch])

  const handleBackToHome = () => {
    navigate('/home')
  }

  const handleInboxClick = () => {
    dispatch(setIsNotifDrawerOpen(true))
  }

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, y: -10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, y: -5 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  const buttonVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 10,
        delay: 0.2,
      },
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 0 15px rgba(128, 90, 213, 0.6)',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 10,
      },
    },
    tap: { scale: 0.98 },
  }

  const homeButtonVariants = {
    hover: {
      scale: 1.1,
      boxShadow: '0 0 12px rgba(168, 130, 255, 0.6)',
      transition: {
        duration: 0.3,
        type: 'spring',
        stiffness: 200,
      },
    },
    tap: { scale: 0.9 },
    // Add floating animation that's always active
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
      {/* Mobile Header: Fixed Home Button + Level Badge */}
      <MotionFlex
        position="fixed"
        top="16px"
        left="16px"
        right="16px"
        zIndex={100}
        display={{ base: 'flex', md: 'none' }}
        justifyContent="space-between"
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
            variants={homeButtonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
          />
        </Tooltip>

        {/* Mobile Level Badge and Trophy Display */}
        <HStack spacing={2}>
          <TrophyDisplay />
          <LevelBadge />
        </HStack>
      </MotionFlex>

      {/* Desktop Header - includes Home Button, Level Badge, Trophy Display & Task Progress */}
      <MotionFlex
        justify="space-between"
        align="center"
        mb={4}
        variants={itemVariants}
        display={{ base: 'none', md: 'flex' }}
      >
        <MotionButton
          as={motion.button}
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

        <HStack spacing={3}>
          {/* Desktop Trophy Display */}
          <TrophyDisplay />

          {/* Desktop Level Badge */}
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

          {/* Daily Task Indicator */}
          <TaskProgressIndicator size="sm" />
        </HStack>
      </MotionFlex>

      {/* Main Header Content */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ base: 'center', md: 'center' }}
        mb={{ base: 6, md: 8 }}
        gap={{ base: 0, md: 4 }}
        mt={{ base: 10, md: 0 }} // Add top margin on mobile to account for fixed button
      >
        {/* Title and Description */}
        <MotionBox
          flex="1"
          variants={itemVariants}
          textAlign={{ base: 'center', md: 'left' }}
          maxW={{ base: '100%', md: '60%' }}
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

          <Text color="whiteAlpha.800" fontSize="md">
            {t(
              'Challenge other players to rapid-fire reading and quiz battles, test your knowledge and rise up the ranks!',
            )}
          </Text>
        </MotionBox>

        {/* Action Buttons Group */}
        <HStack
          spacing={3}
          align="center"
          justify={{ base: 'center', md: 'flex-end' }}
          mt={{ base: 4, md: 0 }}
          w={{ base: '100%', md: 'auto' }}
        >
          <MotionButton
            as={motion.button}
            leftIcon={<FiZap />}
            bg="purple.600"
            _hover={{ bg: 'purple.700' }}
            onClick={onNewChallenge}
            display={{ base: 'none', md: 'inline-flex' }}
            size={{ base: 'md', md: 'lg' }}
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

          {/* Leaderboard button */}
          <QuickClashLeaderboardButton showMobileVersion={isDesktop} />

          {/* Mobile Daily Task Progress */}
          <Box display={{ base: 'block', md: 'none' }}>
            <TaskProgressIndicator size="sm" />
          </Box>
        </HStack>
      </Flex>
    </MotionBox>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(QuickClashHeader)
