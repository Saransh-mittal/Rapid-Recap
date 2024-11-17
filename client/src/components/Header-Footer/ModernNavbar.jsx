// ModernNavbar.js
import React, { useCallback, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Flex,
  HStack,
  Image,
  Text,
  useMediaQuery,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Brain,
  Flame,
  Star,
  Search,
  MessageCircle,
  Bell,
  Menu,
} from 'lucide-react'
import StatItem from './modernNavbarComponents/StatItem'
import { IconButton } from './modernNavbarComponents/IconButton'
import { findSocietyAndCircle } from '../../utils/helper.utils'
import { useNavbar } from '../../contextAPI/NavbarContext'
import {
  fetchDailyStreak,
  setIsNotifDrawerOpen,
  setIsSigninOpen,
  setShowDailyStreakModal,
  setShowIQScoreModal,
  setShowXpLevelModal,
} from '../../redux/appSlice'
import Logo from './modernNavbarComponents/Logo'
import Navigation from './modernNavbarComponents/Navigation'
import ProfileMenu from './modernNavbarComponents/ProfileMenu'
import StreakIcon, { getStreakColor } from './modernNavbarComponents/StreakIcon'
import NavbarModalManager from './modernNavbarComponents/NavbarModalManager'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const ModernNavbar = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobile] = useMediaQuery('(max-width: 992px)')
  const { isMenuOpen, setIsMenuOpen } = useNavbar()

  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { level } = user ? user : {}
  const {
    updates,
    unreadFriendRequests,
    notification,
    isBoosted,
    streak,
    streakLoading,
  } = useSelector(state => state.app)

  const streakColor = streak ? getStreakColor(streak) : '#FF5733'
  const societyData = useMemo(
    () => findSocietyAndCircle(user?.IQ_score || 0),
    [user?.IQ_score],
  )

  const navItems = useMemo(
    () => [
      { label: 'Home', path: '/home/all' },
      { label: 'Tournament', path: '/tournament' },
      { label: 'Leaderboard', path: '/leaderboard' },
    ],
    [],
  )

  const handleNavigation = useCallback(
    path => {
      navigate(path)
      setIsMenuOpen(false)
    },
    [navigate, setIsMenuOpen],
  )

  const handleNotificationClick = useCallback(() => {
    dispatch(setIsNotifDrawerOpen(true))
  }, [dispatch])

  const checkStreak = useCallback(() => {
    if (!streakLoading) {
      dispatch(fetchDailyStreak())
    }
  }, [streakLoading, user, dispatch])

  useEffect(() => {
    checkStreak()
  }, [user, dispatch])

  const renderNavContent = () => {
    if (!isAuthenticated) {
      return (
        <Button
          onClick={() => dispatch(setIsSigninOpen(true))}
          colorScheme="purple"
        >
          Get Started
        </Button>
      )
    }

    return (
      <Flex align="center" gap={8}>
        <HStack spacing={6}>
          <Box onClick={() => dispatch(setShowIQScoreModal(true))}>
            <StatItem
              icon={societyData?.image || <Brain size={21} />}
              value={user?.IQ_score.toFixed(1)}
              color={societyData?.textColor || '#ED64A6'}
            />
          </Box>
          <Box onClick={() => dispatch(setShowDailyStreakModal(true))}>
            <StatItem
              icon={<StreakIcon streak={streak} isBoosted={isBoosted} />}
              value={streak}
              color={streakColor}
            />
          </Box>
          <Box onClick={() => dispatch(setShowXpLevelModal(true))}>
            <StatItem icon={<Star size={21} />} value={level} color="#4299E1" />
          </Box>
        </HStack>

        <HStack spacing={5} display={isMobile ? 'none' : 'flex'}>
          <IconButton
            icon={<Search size={20} />}
            onClick={() => navigate('/search')}
          />
          <IconButton
            icon={<MessageCircle size={20} />}
            hasNotification={notification?.length > 0}
            notificationCount={notification?.length}
            onClick={() => navigate('/chats')}
          />
          <IconButton
            icon={<Bell size={20} />}
            hasNotification={unreadFriendRequests > 0}
            notificationCount={updates?.filter(u => !u.read).length}
            onClick={handleNotificationClick}
          />
        </HStack>

        <Box display={isMobile ? 'none' : 'flex'}>
          <ProfileMenu user={user} />
        </Box>
      </Flex>
    )
  }

  return (
    <MotionBox
      position="fixed"
      top={2}
      left="50%"
      transform="translateX(-50%) !important"
      width="95%"
      maxW="1400px"
      zIndex={1000}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Flex
        bg="rgba(14, 12, 22, 0.97)"
        backdropFilter="blur(8px)"
        borderRadius={isMobile ? '2xl' : 'full'}
        py={2.5}
        px={5}
        w="100%"
        align="center"
        justify={'space-between'}
        gap={4}
      >
        <Logo onNavigate={() => handleNavigation('/')} />

        {!isMobile && (
          <Navigation
            items={navItems}
            currentPath={location.pathname}
            onNavigate={handleNavigation}
          />
        )}

        {renderNavContent()}
        {isMobile && (
          <IconButton
            icon={<Menu size={24} />}
            onClick={() => setIsMenuOpen(true)}
            _hover={{ color: 'white' }}
          />
        )}
      </Flex>
      <NavbarModalManager
        isHamburgerOpen={isMenuOpen}
        setIsHamburgerOpen={setIsMenuOpen}
      />
    </MotionBox>
  )
}

export default ModernNavbar
