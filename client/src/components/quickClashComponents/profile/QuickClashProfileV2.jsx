// components/quickClashComponents/profile/QuickClashProfileV2.jsx
// Enterprise-level minimal profile - high density, good contrast
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Avatar,
  Icon,
  Button,
  Spinner,
  Grid,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Flame,
  Target,
  TrendingUp,
  Zap,
  LogOut,
  Crown,
  BarChart2,
  Clock,
  Award,
  Bell,
  ChevronRight,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logoutAuth } from '../../../redux/authSlice'
import { logoutApp, resetLoadingFlags, resetAllState, setIsNotifDrawerOpen } from '../../../redux/appSlice'
import i18n from 'i18next'
import axios from 'axios'
import moment from 'moment'

const MotionBox = motion(Box)

// ═══════════════════════════════════════════════════════════════
// STAT BLOCK - Compact grid item
// ═══════════════════════════════════════════════════════════════
const StatBlock = ({ label, value, subValue, color = 'white' }) => (
  <Box
    bg="rgba(255,255,255,0.03)"
    borderRadius="12px"
    p={3}
    border="1px solid"
    borderColor="rgba(255,255,255,0.06)"
  >
    <Text fontSize="xs" color="rgba(255,255,255,0.4)" fontWeight="medium" mb={1}>
      {label}
    </Text>
    <Text fontSize="lg" fontWeight="bold" color={color} lineHeight={1}>
      {value}
    </Text>
    {subValue && (
      <Text fontSize="xs" color="rgba(255,255,255,0.35)" mt={0.5}>
        {subValue}
      </Text>
    )}
  </Box>
)

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const QuickClashProfileV2 = ({ userId: propUserId }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [logoutLoading, setLogoutLoading] = useState(false)

  // Get notification count from Redux
  const { updates, unreadFriendRequests, notification } = useSelector(state => state.app)
  const notificationCount = useMemo(() => {
    const unreadUpdates = updates?.filter(u => !u.read).length || 0
    const friendRequests = unreadFriendRequests || 0
    const notificationItems = Array.isArray(notification) ? notification.length : 0
    return unreadUpdates + friendRequests + notificationItems
  }, [updates, unreadFriendRequests, notification])

  // Determine if we are viewing another user via URL
  const urlUserId = useMemo(() => {
    // Handle specific route formats: /quickclash/profile/:id
    if (location.pathname.includes('/profile/')) {
      const parts = location.pathname.split('/profile/')
      if (parts[1]) {
        return parts[1].split('/')[0] // Get ID before any other segments
      }
    }
    return null
  }, [location.pathname])

  const effectiveUserId = propUserId || urlUserId
  const isOwnProfile = !effectiveUserId || effectiveUserId === user?._id
  const targetUserId = effectiveUserId || user?._id

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const endpoint = effectiveUserId
          ? `/api/quickClash/profile/${effectiveUserId}`
          : '/api/quickClash/profile'
        const response = await axios.get(endpoint)
        setProfile(response.data.profile)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    if (targetUserId) fetchProfile()
  }, [targetUserId, effectiveUserId])

  const handleLogout = useCallback(async () => {
    setLogoutLoading(true)
    try {
      const response = await axios.post('/api/user/logout')
      if (response.status === 200 || response.status === 201) {
        await i18n.changeLanguage('en')
        // Save user info for "Continue as" feature on login page
        if (profile?.user?.inGameName || profile?.user?.name) {
          localStorage.setItem('lastLoggedInPlayerName', profile.user.inGameName || profile.user.name)
        }
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        dispatch(logoutAuth())
        dispatch(logoutApp())
        dispatch(resetLoadingFlags())
        dispatch(resetAllState())
        navigate('/')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setLogoutLoading(false)
    }
  }, [dispatch, navigate, profile])

  // Open notification drawer
  const handleOpenNotifications = useCallback(() => {
    dispatch(setIsNotifDrawerOpen(true))
  }, [dispatch])

  if (loading) {
    return (
      <Flex h="50vh" align="center" justify="center">
        <Spinner size="sm" color="rgba(255,255,255,0.3)" />
      </Flex>
    )
  }

  if (error || !profile) {
    return (
      <Flex h="50vh" align="center" justify="center">
        <Text color="rgba(255,255,255,0.4)" fontSize="sm">{error || 'Profile not found'}</Text>
      </Flex>
    )
  }

  const { trophies, statistics, streaks, recentActivity } = profile
  const teamStats = statistics.teamBattle
  const teamActivity = recentActivity.filter(a => a.type === 'team').slice(0, 5)
  const percentile = ((trophies.rank / trophies.totalPlayers) * 100).toFixed(1)

  return (
    <Box pb={28} px={4} pt={2}>
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* HEADER - Avatar + Info + Trophy (Horizontal, Compact) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Flex
        bg="rgba(255,255,255,0.03)"
        borderRadius="16px"
        border="1px solid"
        borderColor="rgba(255,255,255,0.06)"
        p={4}
        mb={3}
        align="center"
        gap={4}
      >
        {/* Avatar */}
        <Box position="relative" flexShrink={0}>
          <Avatar
            size="lg"
            src={profile.user.picture}
            name={profile.user.name}
            border="2px solid"
            borderColor="rgba(255,255,255,0.1)"
          />
          <Flex
            position="absolute"
            bottom="-2px"
            right="-2px"
            w="22px"
            h="22px"
            bg="linear-gradient(135deg, #9333EA, #6B21A8)"
            borderRadius="full"
            align="center"
            justify="center"
            border="2px solid"
            borderColor="#0f172a"
          >
            <Text fontSize="9px" fontWeight="extrabold" color="white">
              {profile.user.level || 1}
            </Text>
          </Flex>
        </Box>

        {/* Name + Rank */}
        <Box flex={1} minW={0}>
          <Text fontSize="md" fontWeight="bold" color="white" noOfLines={1}>
            {profile.user.name}
          </Text>
          <Text fontSize="xs" color="rgba(255,255,255,0.4)" noOfLines={1}>
            @{profile.user.inGameName}
          </Text>
          <Text fontSize="xs" color="rgba(255,255,255,0.5)" mt={1} noOfLines={1}>
            #{trophies.rank} · Top {percentile}%
          </Text>
        </Box>


        {/* Trophy */}
        <VStack spacing={0} align="flex-end" flexShrink={0}>
          <HStack spacing={1.5}>
            <Icon as={Trophy} boxSize={4} color="#FBBF24" />
            <Text fontSize="xl" fontWeight="black" color="white">
              {trophies.current.toLocaleString()}
            </Text>
          </HStack>
          <Text fontSize="xs" color="rgba(255,255,255,0.35)">
            Peak {trophies.peak.toLocaleString()}
          </Text>
        </VStack>
      </Flex>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* NOTIFICATIONS CARD - TEMPORARILY HIDDEN */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* {isOwnProfile && (
        <Box
          as="button"
          onClick={handleOpenNotifications}
          bg="rgba(255,255,255,0.03)"
          borderRadius="12px"
          p={3}
          mb={3}
          border="1px solid"
          borderColor={notificationCount > 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.06)'}
          w="100%"
          textAlign="left"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ bg: 'rgba(255,255,255,0.05)', borderColor: notificationCount > 0 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255,255,255,0.1)' }}
          _active={{ transform: 'scale(0.98)' }}
        >
          <Flex align="center" justify="space-between">
            <HStack spacing={3}>
              <Flex
                w="36px"
                h="36px"
                borderRadius="10px"
                bg={notificationCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)'}
                align="center"
                justify="center"
              >
                <Icon as={Bell} boxSize={4} color={notificationCount > 0 ? '#ef4444' : 'rgba(255,255,255,0.5)'} />
              </Flex>
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="white">
                  Notifications
                </Text>
                <Text fontSize="xs" color="rgba(255,255,255,0.4)">
                  {notificationCount > 0 ? `${notificationCount} unread` : 'All caught up'}
                </Text>
              </Box>
            </HStack>
            <HStack spacing={2}>
              {notificationCount > 0 && (
                <Flex
                  minW="20px"
                  h="20px"
                  px={1.5}
                  borderRadius="full"
                  bg="#ef4444"
                  align="center"
                  justify="center"
                >
                  <Text fontSize="xs" fontWeight="bold" color="white">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </Flex>
              )}
              <Icon as={ChevronRight} boxSize={4} color="rgba(255,255,255,0.3)" />
            </HStack>
          </Flex>
        </Box>
      )} */}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* STATS GRID - 2x2 essential stats */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={3}>
        <StatBlock
          label="Battles"
          value={teamStats.totalMatches}
          subValue={`${teamStats.wins}W · ${teamStats.losses}L`}
        />
        <StatBlock
          label="Win Rate"
          value={`${teamStats.winRate}%`}
          color={teamStats.winRate >= 50 ? '#34D399' : 'white'}
        />
        <StatBlock
          label="Win Streak"
          value={streaks.current}
          subValue={`Best: ${streaks.longest}`}
          color={streaks.current > 0 ? '#FB923C' : 'white'}
        />
        <StatBlock
          label="Avg Score"
          value={teamStats.avgScoreLast10 || '—'}
          subValue={teamStats.matchesForAvg ? `Last ${teamStats.matchesForAvg}` : null}
        />
      </Grid>


      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* RECENT ACTIVITY */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Box
        bg="rgba(255,255,255,0.03)"
        borderRadius="16px"
        border="1px solid"
        borderColor="rgba(255,255,255,0.06)"
        overflow="hidden"
        mb={3}
      >
        <Flex px={4} py={2.5} borderBottom="1px solid" borderColor="rgba(255,255,255,0.04)">
          <Text fontSize="xs" fontWeight="semibold" color="rgba(255,255,255,0.5)" textTransform="uppercase" letterSpacing="0.5px">
            Recent Battles
          </Text>
        </Flex>

        {teamActivity.length > 0 ? (
          teamActivity.map((activity, i) => {
            const isWin = activity.result === 'win'
            const isTie = activity.result === 'tie'
            return (
              <Flex
                key={activity.id || i}
                px={4}
                py={2.5}
                align="center"
                justify="space-between"
                borderBottom={i < teamActivity.length - 1 ? '1px solid' : 'none'}
                borderColor="rgba(255,255,255,0.04)"
              >
                <HStack spacing={3}>
                  <Box
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg={isWin ? '#34D399' : isTie ? '#FBBF24' : '#F87171'}
                  />
                  <Text fontSize="sm" color="rgba(255,255,255,0.8)" fontWeight="medium">
                    {isWin ? 'Victory' : isTie ? 'Draw' : 'Defeat'}
                  </Text>
                </HStack>
                <HStack spacing={4}>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={activity.trophyChange >= 0 ? '#34D399' : '#F87171'}
                  >
                    {activity.trophyChange >= 0 ? '+' : ''}{activity.trophyChange}
                  </Text>
                  <Text fontSize="xs" color="rgba(255,255,255,0.3)" minW="70px" textAlign="right">
                    {moment(activity.date).fromNow()}
                  </Text>
                </HStack>
              </Flex>
            )
          })
        ) : (
          <Box px={4} py={6} textAlign="center">
            <Text fontSize="sm" color="rgba(255,255,255,0.3)">No battles yet</Text>
          </Box>
        )}
      </Box>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FOOTER - Member since + Logout */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Flex align="center" justify="space-between" px={1}>
        <HStack spacing={2}>
          <Icon as={Clock} boxSize={3} color="rgba(255,255,255,0.25)" />
          <Text fontSize="xs" color="rgba(255,255,255,0.3)">
            Since {moment(profile.user.joinedAt).format('MMM YYYY')}
          </Text>
        </HStack>

        {isOwnProfile && (
          <Button
            onClick={handleLogout}
            isLoading={logoutLoading}
            size="sm"
            variant="ghost"
            color="rgba(255,255,255,0.4)"
            fontWeight="medium"
            fontSize="xs"
            px={3}
            h="32px"
            _hover={{ color: '#F87171', bg: 'rgba(248,113,113,0.1)' }}
            leftIcon={<Icon as={LogOut} boxSize={3.5} />}
          >
            Logout
          </Button>
        )}
      </Flex>
    </Box>
  )
}

export default QuickClashProfileV2
