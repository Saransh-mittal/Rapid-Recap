// ModernNavbar.js
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  useDisclosure,
  useMediaQuery,
  useToast,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { Brain, Star, Search, MessageCircle, Bell, Menu } from 'lucide-react'
import StatItem from './modernNavbarComponents/StatItem'
import { IconButton } from './modernNavbarComponents/IconButton'
import { findSocietyAndCircle } from '../../utils/helper.utils'
import { useNavbar } from '../../contextAPI/NavbarContext'
import {
  fetchAppUpdates,
  fetchDailyStreak,
  logoutApp,
  resetAllState,
  resetLoadingFlags,
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
import axios from 'axios'
import { logoutAuth } from '../../redux/authSlice'
import i18n from 'i18next'
import { useTranslation } from 'react-i18next'
import ExperienceLevelIcon from './modernNavbarComponents/ExperienceLevelIcon'
import { userCacheService } from '../../lib/cache'
import useQuickClash from '../../customHooks/useQuickClash'

const MotionBox = motion(Box)

const ModernNavbar = ({ onNavbarLoad }) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation('Navbar')
  const toast = useToast()
  const [isMobile] = useMediaQuery('(max-width: 992px)')
  const { isMenuOpen, setIsMenuOpen } = useNavbar()
  const { activeChallenges } = useQuickClash()
  const {
    isOpen: isOpenUserSearch,
    onOpen: onOpenUserSearch,
    onClose: onCloseUserSearch,
  } = useDisclosure()
  const isToken = useCallback(() => localStorage.getItem('token'), [])
  const [notifyCont, setNotifyCnt] = useState(0)
  const [scrollOpacity, setScrollOpacity] = useState(0.95)
  const { isAuthenticated, user, loginCheckStatus } = useSelector(
    state => state.auth,
  )
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { level } = user ? user : {}
  const {
    updates,
    unreadFriendRequests,
    notification,
    isBoosted,
    streak,
    streakLoading,
    updatesLoading,
    updatesFetched,
    streakFetched,
  } = useSelector(state => state.app)

  const showRedDotOnMenu =
    (activeChallenges &&
      activeChallenges.filter(
        challenge =>
          (challenge.challenger._id === user?._id &&
            !challenge.challengerAttempted) ||
          (challenge.opponent._id === user?._id &&
            !challenge.opponentAttempted),
      ).length > 0) ||
    unreadFriendRequests > 0 ||
    (Array.isArray(notification) && notification.length > 0) ||
    notifyCont !== 0

  const streakColor = streak ? getStreakColor(streak) : '#fff'
  const societyData = useMemo(
    () => findSocietyAndCircle(user?.IQ_score || 0),
    [user?.IQ_score],
  )

  const navItems = useMemo(
    () => [
      { label: t('home'), path: '/home' },
      { label: t('tournament'), path: '/tournament' },
      { label: t('leaderboard'), path: '/leaderboard' },
      { label: t('hallOfChampions'), path: '/hall-of-champions' },
    ],
    [t],
  )

  const handleNavigation = useCallback(
    path => {
      navigate(path)
      setIsMenuOpen(false)
    },
    [navigate, setIsMenuOpen],
  )

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true)
    try {
      const response = await axios.post('/api/user/logout')
      if (response.status === 201) {
        await i18n.changeLanguage('en')
        await userCacheService.deleteUser()
        dispatch(setIsNotifDrawerOpen(false))

        setIsMenuOpen(false)
        localStorage.removeItem('token')
        localStorage.removeItem('role')

        dispatch(logoutAuth())
        dispatch(logoutApp())
        dispatch(resetLoadingFlags())
        dispatch(resetAllState())
        toast({
          title: 'Logout Successful',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })

        navigate('/')
      } else {
        throw new Error('Logout Failed')
      }
    } catch (error) {
      if (isToken()) {
        toast({
          title: 'Logout Failed',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        console.error(error)
      }
    } finally {
      setIsLoggingOut(false)
    }
  }, [dispatch, navigate, toast, isToken])

  const checkStreakAndFetchUpdates = useCallback(() => {
    if (!updatesLoading && loginCheckStatus === 'fulfilled') {
      dispatch(fetchAppUpdates())
    }
    if (!streakLoading) {
      dispatch(fetchDailyStreak())
    }
  }, [streakLoading, loginCheckStatus, isAuthenticated, dispatch])
  useEffect(() => {
    if (!isToken()) {
      handleLogout()
    }
  }, [isToken])
  useEffect(() => {
    checkStreakAndFetchUpdates()
  }, [loginCheckStatus, dispatch])
  useEffect(() => {
    if (updates?.length === 0) return
    let count = 0

    updates?.forEach(update => {
      if (!update.read) {
        count++
      }
    })
    setNotifyCnt(count)
  }, [updates])
  useEffect(() => {
    if (updatesFetched) {
      onNavbarLoad()
    }
  }, [updatesFetched, onNavbarLoad])
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const newOpacity = Math.min(0.95, 0.85 + scrollPosition / 500)
      setScrollOpacity(newOpacity)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const renderNavContent = () => {
    if (!isAuthenticated) {
      return (
        <Button
          onClick={() => dispatch(setIsSigninOpen(true))}
          colorScheme="purple"
          display={isMobile ? 'none' : 'block'}
          size={'sm'}
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
            <StatItem
              icon={<ExperienceLevelIcon level={level} size={18} />}
              value={level}
              color={
                level >= 100
                  ? '#DC143C'
                  : level >= 61
                  ? '#9D5CFF'
                  : level >= 31
                  ? '#FF7F50'
                  : level >= 11
                  ? '#00FA9A'
                  : '#87CEFA'
              }
            />
          </Box>
        </HStack>

        <HStack spacing={5} display={isMobile ? 'none' : 'flex'}>
          <IconButton
            icon={<Search size={20} />}
            onClick={() => onOpenUserSearch()}
          />
          {/* <IconButton
            icon={<MessageCircle size={20} />}
            hasNotification={notification?.length > 0}
            notificationCount={notification?.length}
            onClick={() => navigate('/chats')}
          /> */}
          <Box position={'relative'}>
            {notifyCont > 0 && (
              <Badge
                borderRadius="50%"
                h={'15px'}
                w={'15px'}
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
                backgroundColor="red"
                color="white"
                fontSize="sm"
                position="absolute"
                top="-10px"
                right="-10px"
              >
                {notifyCont}
              </Badge>
            )}
            <IconButton
              icon={<Bell size={20} />}
              hasNotification={unreadFriendRequests > 0}
              notificationCount={updates?.filter(u => !u.read).length}
              onClick={() => dispatch(setIsNotifDrawerOpen(true))}
            />
          </Box>
        </HStack>

        <Box display={isMobile ? 'none' : 'flex'}>
          <ProfileMenu
            user={user}
            handleLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
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
      {/* Add fade overlay */}
      <Box
        position="absolute"
        top="-2rem"
        left="50%"
        transform="translateX(-50%)"
        width="100vw"
        height="120px"
        background={`linear-gradient(to bottom,
          rgba(28, 24, 50, ${scrollOpacity}) 0%,
          rgba(22, 19, 40, ${scrollOpacity * 0.8}) 40%,
          rgba(14, 12, 22, 0) 100%)`}
        pointerEvents="none"
        zIndex={-1}
        transition="background 0.2s ease-out"
        sx={{
          maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 20%, transparent 100%)',
        }}
      />
      <Flex
        bg="rgba(62, 59, 80, 0.65)"
        borderBottom="1px solid rgba(255, 255, 255, 0.08)"
        boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
        backdropFilter="blur(8px)"
        borderRadius={isMobile ? '2xl' : 'full'}
        py={2.5}
        px={5}
        w="100%"
        align="center"
        justify={'space-between'}
        gap={4}
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 'inherit',
          // Simplified pseudo-element background
          bg: 'rgba(22, 19, 40, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          zIndex: -1,
        }}
      >
        <Logo
          onNavigate={() => handleNavigation('/')}
          isAuthenticated={isAuthenticated}
        />

        {!isMobile && (
          <Navigation
            items={navItems}
            currentPath={location.pathname}
            onNavigate={handleNavigation}
          />
        )}

        {renderNavContent()}
        {isMobile && (
          <Box position="relative">
            {showRedDotOnMenu && (
              <Box
                h="8px"
                w="8px"
                bg={'red'}
                borderRadius={'50%'}
                position={'absolute'}
                right={'-0.3rem'}
                top={'-0.3rem'}
                zIndex={2}
              />
            )}
            <IconButton
              icon={<Menu size={24} />}
              onClick={() => setIsMenuOpen(true)}
              _hover={{ color: 'white' }}
            />
          </Box>
        )}
      </Flex>
      <NavbarModalManager
        isHamburgerOpen={isMenuOpen}
        setIsHamburgerOpen={setIsMenuOpen}
        isOpenUserSearch={isOpenUserSearch}
        onCloseUserSearch={onCloseUserSearch}
        handleLogout={handleLogout}
      />
    </MotionBox>
  )
}

export default ModernNavbar
