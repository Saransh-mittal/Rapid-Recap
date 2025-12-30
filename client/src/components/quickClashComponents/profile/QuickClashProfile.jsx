// components/quickClashComponents/profile/QuickClashProfile.jsx
// Enhanced QuickClash profile with AI insights integration
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Image,
  Badge,
  Progress,
  Grid,
  GridItem,
  Icon,
  Tooltip,
  Avatar,
  Circle,
  Divider,
  useBreakpointValue,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Wrap,
  WrapItem,
  Button,
  IconButton,
  Center,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Zap,
  Target,
  Flame,
  Shield,
  Star,
  TrendingUp,
  Calendar,
  Award,
  Swords,
  Users,
  Crown,
  Medal,
  Activity,
  ChevronUp,
  ChevronDown,
  BarChart3,
  Clock,
  Sparkles,
  Gem,
  Rocket,
  Brain,
  Eye,
  ChevronRight,
  Bolt,
  ArrowUp,
  ArrowDown,
  Lightbulb,
  BookOpen,
  Wand2,
} from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import moment from 'moment'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionGrid = motion(SimpleGrid)

// Sleek animation variants with reduced motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.08,
      ease: 'easeOut',
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

const subtleGlowVariants = {
  animate: {
    boxShadow: [
      '0 0 15px rgba(147, 51, 234, 0.2)',
      '0 0 20px rgba(147, 51, 234, 0.3)',
      '0 0 15px rgba(147, 51, 234, 0.2)',
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

const QuickClashProfile = ({ userId: propUserId }) => {
  const { inGameName } = useParams()
  const { user } = useSelector(state => state.auth)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    achievements: true,
    activity: true,
    categories: true,
    aiInsights: true, // New section for AI insights
  })

  const isDesktop = useBreakpointValue({ base: false, lg: true })
  const containerMaxW = useBreakpointValue({ base: 'full', lg: 'container.xl' })

  // Determine if this is the current user's profile
  const isOwnProfile = propUserId
    ? propUserId === user?._id
    : inGameName === user?.inGameName

  const targetUserId = propUserId || user?._id

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const endpoint = propUserId
          ? `/api/quickClash/profile/${propUserId}`
          : '/api/quickClash/profile'

        const response = await axios.get(endpoint)
        setProfile(response.data.profile)
      } catch (err) {
        console.error('Error fetching Quick Clash profile:', err)
        setError(err.response?.data?.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (targetUserId) {
      fetchProfile()
    }
  }, [targetUserId, propUserId])

  // Enhanced utility functions
  const getRankColor = useCallback(rank => {
    if (rank <= 1) return '#FFD700'
    if (rank <= 3) return '#E5E7EB'
    if (rank <= 10) return '#CD7F32'
    if (rank <= 50) return '#9333EA'
    if (rank <= 100) return '#3B82F6'
    if (rank <= 500) return '#10B981'
    return '#6B7280'
  }, [])

  const getRankGradient = useCallback(rank => {
    if (rank <= 1) return 'linear(135deg, #FFD700, #FFA500)'
    if (rank <= 3) return 'linear(135deg, #E5E7EB, #9CA3AF)'
    if (rank <= 10) return 'linear(135deg, #CD7F32, #8B4513)'
    if (rank <= 50) return 'linear(135deg, #9333EA, #7C3AED)'
    if (rank <= 100) return 'linear(135deg, #3B82F6, #1D4ED8)'
    if (rank <= 500) return 'linear(135deg, #10B981, #047857)'
    return 'linear(135deg, #6B7280, #374151)'
  }, [])

  const getRankIcon = useCallback(rank => {
    if (rank === 1) return Crown
    if (rank <= 3) return Trophy
    if (rank <= 10) return Medal
    if (rank <= 50) return Star
    if (rank <= 100) return Gem
    return Target
  }, [])

  const getLevelProgress = useCallback(
    xp => {
      if (!profile?.user?.level) return 0
      const currentLevelXP = profile.user.level * 1000
      const nextLevelXP = (profile.user.level + 1) * 1000
      const progress =
        ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
      return Math.min(Math.max(progress, 0), 100)
    },
    [profile],
  )

  const getXPToNextLevel = useCallback(
    xp => {
      if (!profile?.user?.level) return 1000
      const nextLevelXP = (profile.user.level + 1) * 1000
      return Math.max(nextLevelXP - xp, 0)
    },
    [profile],
  )

  const toggleSection = useCallback(section => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }, [])

  // Memoized calculations
  const userLevel = useMemo(() => profile?.user?.level || 0, [profile])
  const userXP = useMemo(() => profile?.user?.xp || 0, [profile])
  const levelProgress = useMemo(
    () => getLevelProgress(userXP),
    [getLevelProgress, userXP],
  )
  const xpToNext = useMemo(
    () => getXPToNextLevel(userXP),
    [getXPToNextLevel, userXP],
  )

  if (loading) {
    return (
      <Box
        minH="100vh"
        py={{ base: 3, md: 4 }}
        px={{ base: 4, md: 6 }}
        overflowY="auto"
        position="relative"
      >
        <Container maxW={containerMaxW}>
          <VStack spacing={3}>
            {[...Array(8)].map((_, i) => (
              <MotionBox
                key={i}
                h={{ base: '80px', md: '90px' }}
                w="100%"
                bg="rgba(255, 255, 255, 0.02)"
                backdropFilter="blur(20px)"
                rounded="xl"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.05)"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </VStack>
        </Container>
      </Box>
    )
  }

  if (error || !profile) {
    return (
      <Box
        minH="100vh"
        py={8}
        px={4}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <MotionBox
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          textAlign="center"
          py={8}
          px={6}
          bg="rgba(239, 68, 68, 0.05)"
          backdropFilter="blur(20px)"
          rounded="2xl"
          border="1px solid"
          borderColor="rgba(239, 68, 68, 0.15)"
          maxW="400px"
        >
          <Icon as={Target} boxSize={12} color="red.400" mb={4} />
          <Text fontSize="xl" fontWeight="bold" color="white" mb={2}>
            Profile Not Found
          </Text>
          <Text color="whiteAlpha.600" fontSize="sm">
            {error || "Couldn't load Quick Clash profile data."}
          </Text>
        </MotionBox>
      </Box>
    )
  }

  return (
    <Box
      minH="100vh"
      py={{ base: 4, md: 6 }}
      overflowY="auto"
      position="relative"
      css={{
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(to bottom, #9333EA, #3B82F6)',
          borderRadius: '3px',
        },
      }}
    >
      <Container maxW={containerMaxW} position="relative" zIndex={1}>
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <VStack spacing={2} align="stretch">
            {/* Ultra-Sleek Thin Hero Section */}
            <MotionBox variants={itemVariants}>
              <Box
                bg="rgba(255, 255, 255, 0.04)"
                backdropFilter="blur(20px)"
                rounded="2xl"
                p={{ base: 4, md: 4 }}
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.08)"
                position="relative"
                overflow="hidden"
                boxShadow="0 8px 25px rgba(0, 0, 0, 0.15)"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    'linear-gradient(135deg, rgba(147, 51, 234, 0.02), rgba(59, 130, 246, 0.02))',
                  borderRadius: '16px',
                }}
              >
                <Box position="relative" zIndex={2}>
                  {/* Compact Layout */}
                  <Flex
                    direction={{ base: 'column', lg: 'row' }}
                    align="center"
                    gap={{ base: 3, lg: 4 }}
                  >
                    {/* Compact Avatar Section */}
                    <Box position="relative" flexShrink={0}>
                      <MotionBox
                        variants={subtleGlowVariants}
                        animate="animate"
                        whileHover={{ scale: 1.03 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <Avatar
                          size={{ base: 'xl', md: '2xl' }}
                          src={profile.user.picture}
                          name={profile.user.name}
                          border="2px solid"
                          borderColor="rgba(147, 51, 234, 0.4)"
                          boxShadow="0 0 20px rgba(147, 51, 234, 0.25)"
                        />

                        {/* Compact Level Badge */}
                        <MotionBox
                          position="absolute"
                          bottom="-2"
                          right="-2"
                          whileHover={{ scale: 1.08 }}
                        >
                          <Box position="relative">
                            <svg
                              width="40"
                              height="40"
                              style={{ transform: 'rotate(-90deg)' }}
                            >
                              <circle
                                cx="20"
                                cy="20"
                                r="17"
                                stroke="rgba(255, 255, 255, 0.1)"
                                strokeWidth="1.5"
                                fill="none"
                              />
                              <motion.circle
                                cx="20"
                                cy="20"
                                r="17"
                                stroke="url(#levelGradient)"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 17}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 17 }}
                                animate={{
                                  strokeDashoffset:
                                    2 *
                                    Math.PI *
                                    17 *
                                    (1 - levelProgress / 100),
                                }}
                                transition={{ duration: 2, ease: 'easeOut' }}
                              />
                              <defs>
                                <linearGradient id="levelGradient">
                                  <stop offset="0%" stopColor="#9333EA" />
                                  <stop offset="100%" stopColor="#3B82F6" />
                                </linearGradient>
                              </defs>
                            </svg>

                            <Circle
                              size="36px"
                              bgGradient="linear(135deg, #9333EA, #3B82F6)"
                              position="absolute"
                              top="2px"
                              left="2px"
                              boxShadow="0 4px 12px rgba(147, 51, 234, 0.3)"
                            >
                              <Text
                                fontSize="md"
                                fontWeight="black"
                                color="white"
                              >
                                {userLevel}
                              </Text>
                            </Circle>
                          </Box>
                        </MotionBox>

                        {/* Compact Rank Badge */}
                        <Circle
                          size="32px"
                          bgGradient={getRankGradient(profile.trophies.rank)}
                          position="absolute"
                          top="-1"
                          left="-1"
                          border="2px solid"
                          borderColor="rgba(255, 255, 255, 0.15)"
                          boxShadow={`0 4px 12px ${getRankColor(
                            profile.trophies.rank,
                          )}30`}
                        >
                          <Icon
                            as={getRankIcon(profile.trophies.rank)}
                            boxSize={4}
                            color="white"
                          />
                        </Circle>
                      </MotionBox>
                    </Box>

                    {/* Compact Info & Stats */}
                    <Flex direction="column" flex={1} w="100%">
                      {/* Compact Name Section */}
                      <VStack
                        spacing={1}
                        align={{ base: 'center', lg: 'flex-start' }}
                        mb={3}
                      >
                        <Text
                          fontSize={{ base: '2xl', md: '3xl' }}
                          fontWeight="black"
                          color="white"
                          textAlign={{ base: 'center', lg: 'left' }}
                          lineHeight={1.1}
                        >
                          {profile.user.name}
                        </Text>
                        <Text
                          fontSize={{ base: 'sm', md: 'md' }}
                          color="whiteAlpha.700"
                          fontWeight="medium"
                          textAlign={{ base: 'center', lg: 'left' }}
                        >
                          @{profile.user.inGameName}
                        </Text>
                      </VStack>

                      {/* Ultra-Compact Stats Line */}
                      <MotionBox
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                      >
                        <Box
                          bg="linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))"
                          rounded="2xl"
                          p={3}
                          border="2px solid"
                          borderColor="rgba(6, 182, 212, 0.4)"
                          boxShadow="0 0 25px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                        >
                          <SimpleGrid columns={3} spacing={2}>
                            {/* Current Trophies */}
                            <Box
                              bg="rgba(255, 215, 0, 0.08)"
                              rounded="xl"
                              p={3}
                              textAlign="center"
                              border="1px solid"
                              borderColor="rgba(255, 215, 0, 0.25)"
                            >
                              <VStack spacing={1}>
                                <Circle size="36px" bg="rgba(255, 215, 0, 0.2)">
                                  <Icon as={Trophy} color="#FFD700" boxSize={5} />
                                </Circle>
                                <Text fontSize="xl" fontWeight="black" color="#FFD700">
                                  {profile.trophies.current.toLocaleString()}
                                </Text>
                                <Text fontSize="2xs" color="whiteAlpha.700" fontWeight="semibold" textTransform="uppercase">
                                  Trophies
                                </Text>
                              </VStack>
                            </Box>

                            {/* Global Rank */}
                            <Box
                              bg="rgba(139, 92, 246, 0.08)"
                              rounded="xl"
                              p={3}
                              textAlign="center"
                              border="1px solid"
                              borderColor="rgba(139, 92, 246, 0.25)"
                            >
                              <VStack spacing={1}>
                                <Circle size="36px" bg="rgba(139, 92, 246, 0.2)">
                                  <Icon as={getRankIcon(profile.trophies.rank)} color="#A78BFA" boxSize={5} />
                                </Circle>
                                <Text fontSize="xl" fontWeight="black" color="#A78BFA">
                                  #{profile.trophies.rank}
                                </Text>
                                <Text fontSize="2xs" color="whiteAlpha.700" fontWeight="semibold" textTransform="uppercase">
                                  Rank
                                </Text>
                              </VStack>
                            </Box>

                            {/* Peak Trophies */}
                            <Box
                              bg="rgba(16, 185, 129, 0.08)"
                              rounded="xl"
                              p={3}
                              textAlign="center"
                              border="1px solid"
                              borderColor="rgba(16, 185, 129, 0.25)"
                            >
                              <VStack spacing={1}>
                                <Circle size="36px" bg="rgba(16, 185, 129, 0.2)">
                                  <Icon as={TrendingUp} color="#10B981" boxSize={5} />
                                </Circle>
                                <Text fontSize="xl" fontWeight="black" color="#10B981">
                                  {profile.trophies.peak.toLocaleString()}
                                </Text>
                                <Text fontSize="2xs" color="whiteAlpha.700" fontWeight="semibold" textTransform="uppercase">
                                  Peak
                                </Text>
                              </VStack>
                            </Box>
                          </SimpleGrid>

                          {/* Badges Row - Separate for symmetry */}
                          <SimpleGrid columns={3} spacing={2} mt={2}>
                            <Center>
                              <Badge
                                bg="rgba(255, 215, 0, 0.2)"
                                color="#FFD700"
                                px={2}
                                py={0.5}
                                rounded="full"
                                fontSize="2xs"
                                fontWeight="bold"
                              >
                                ⭐ ELITE
                              </Badge>
                            </Center>
                            <Center>
                              <Badge
                                bg="rgba(139, 92, 246, 0.2)"
                                color="#A78BFA"
                                px={2}
                                py={0.5}
                                rounded="full"
                                fontSize="2xs"
                                fontWeight="bold"
                              >
                                TOP {((profile.trophies.rank / profile.trophies.totalPlayers) * 100).toFixed(1)}%
                              </Badge>
                            </Center>
                            <Center>
                              <Badge
                                bg="rgba(16, 185, 129, 0.2)"
                                color="#10B981"
                                px={2}
                                py={0.5}
                                rounded="full"
                                fontSize="2xs"
                                fontWeight="bold"
                              >
                                🏆 BEST
                              </Badge>
                            </Center>
                          </SimpleGrid>
                        </Box>
                      </MotionBox>

                      {/* Compact Join Date */}
                      <HStack
                        spacing={2}
                        color="whiteAlpha.500"
                        fontSize="xs"
                        mt={2}
                        justify={{ base: 'center', lg: 'flex-start' }}
                      >
                        <Icon as={Calendar} boxSize={3} />
                        <Text fontWeight="medium">
                          Champion since{' '}
                          {moment(profile.user.joinedAt).format('MMM YYYY')}
                        </Text>
                      </HStack>
                    </Flex>
                  </Flex>
                </Box>
              </Box>
            </MotionBox>

            {/* Quick Stats - Vibrant Gaming Style */}
            {/* Sleek Quick Stats */}
            <MotionBox variants={itemVariants}>
              <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                <SlimQuickStatCard
                  icon={Target}
                  iconColor="#3B82F6"
                  label="Total Battles"
                  value={profile.statistics.overall.totalMatches}
                />
                <SlimQuickStatCard
                  icon={TrendingUp}
                  iconColor="#10B981"
                  label="Win Rate"
                  value={`${profile.statistics.overall.winRate}%`}
                />
                <SlimQuickStatCard
                  icon={Flame}
                  iconColor="#F97316"
                  label="Current Streak"
                  value={profile.streaks.current}
                />
                {/* <SlimQuickStatCard
                  icon={Award}
                  iconColor="#9333EA"
                  label="Achievements"
                  value={profile.achievements.length}
                /> */}
              </SimpleGrid>
            </MotionBox>

            {/* Ultra-Thin Battle Performance */}
            <MotionBox variants={itemVariants}>
              <Box
                bg="rgba(15, 23, 42, 0.6)"
                backdropFilter="blur(16px)"
                rounded="xl"
                p={{ base: 3, md: 3 }}
                border="1px solid"
                borderColor="rgba(59, 130, 246, 0.2)"
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.25)"
              >
                <HStack mb={2} spacing={2} justify="space-between">
                  <HStack spacing={2}>
                    <Icon as={BarChart3} color="#3B82F6" boxSize={4} />
                    <Text fontSize="md" fontWeight="bold" color="white">
                      Battle Performance
                    </Text>
                  </HStack>
                  <Badge
                    bg="rgba(59, 130, 246, 0.15)"
                    color="#3B82F6"
                    px={2}
                    py={1}
                    rounded="md"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    Stats
                  </Badge>
                </HStack>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={2}>
                  {/* 1v1 Performance */}
                  <Box
                    bg="rgba(239, 68, 68, 0.08)"
                    backdropFilter="blur(12px)"
                    rounded="lg"
                    p={2.5}
                    border="1px solid"
                    borderColor="rgba(239, 68, 68, 0.25)"
                  >
                    <HStack mb={2} spacing={2} justify="space-between">
                      <HStack spacing={1.5}>
                        <Icon as={Swords} color="#EF4444" boxSize={4} />
                        <Text fontSize="sm" fontWeight="bold" color="white">
                          1v1 Duels
                        </Text>
                      </HStack>
                      <Badge
                        bg="rgba(239, 68, 68, 0.15)"
                        color="#EF4444"
                        px={1.5}
                        py={0.5}
                        rounded="md"
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        Solo
                      </Badge>
                    </HStack>

                    <SimpleGrid columns={2} spacing={2}>
                      <Box
                        p={2}
                        bg="rgba(15, 23, 42, 0.5)"
                        rounded="md"
                        textAlign="center"
                      >
                        <Text fontSize="md" fontWeight="bold" color="white">
                          {profile.statistics.oneVsOne.totalMatches}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.600">
                          Matches
                        </Text>
                      </Box>
                      <Box
                        p={2}
                        bg="rgba(15, 23, 42, 0.5)"
                        rounded="md"
                        textAlign="center"
                      >
                        <Text fontSize="md" fontWeight="bold" color="#10B981">
                          {profile.statistics.oneVsOne.winRate}%
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.600">
                          Win Rate
                        </Text>
                      </Box>
                      <Box
                        p={2}
                        bg="rgba(15, 23, 42, 0.5)"
                        rounded="md"
                        textAlign="center"
                      >
                        <Text fontSize="sm" fontWeight="bold" color="#10B981">
                          +{profile.statistics.oneVsOne.totalTrophiesGained}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.600">
                          Gained
                        </Text>
                      </Box>
                      <Box
                        p={2}
                        bg="rgba(15, 23, 42, 0.5)"
                        rounded="md"
                        textAlign="center"
                      >
                        <Text fontSize="sm" fontWeight="bold" color="#EF4444">
                          -{profile.statistics.oneVsOne.totalTrophiesLost}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.600">
                          Lost
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  {/* Team Battle Performance */}
                  <Box
                    bg="rgba(59, 130, 246, 0.08)"
                    backdropFilter="blur(12px)"
                    rounded="lg"
                    p={2.5}
                    border="1px solid"
                    borderColor="rgba(59, 130, 246, 0.25)"
                  >
                    <HStack mb={2} spacing={2} justify="space-between">
                      <HStack spacing={1.5}>
                        <Icon as={Users} color="#3B82F6" boxSize={4} />
                        <Text fontSize="sm" fontWeight="bold" color="white">
                          Team Battles
                        </Text>
                      </HStack>
                      <Badge
                        bg="rgba(59, 130, 246, 0.15)"
                        color="#3B82F6"
                        px={1.5}
                        py={0.5}
                        rounded="md"
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        Squad
                      </Badge>
                    </HStack>

                    <SimpleGrid columns={2} spacing={2}>
                      <Box
                        p={2}
                        bg="rgba(15, 23, 42, 0.5)"
                        rounded="md"
                        textAlign="center"
                      >
                        <Text fontSize="md" fontWeight="bold" color="white">
                          {profile.statistics.teamBattle.totalMatches}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.600">
                          Matches
                        </Text>
                      </Box>
                      <Box
                        p={2}
                        bg="rgba(15, 23, 42, 0.5)"
                        rounded="md"
                        textAlign="center"
                      >
                        <Text fontSize="md" fontWeight="bold" color="#10B981">
                          {profile.statistics.teamBattle.winRate}%
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.600">
                          Win Rate
                        </Text>
                      </Box>
                      <Box
                        p={2}
                        bg="rgba(15, 23, 42, 0.5)"
                        rounded="md"
                        textAlign="center"
                      >
                        <Text fontSize="sm" fontWeight="bold" color="#10B981">
                          +{profile.statistics.teamBattle.totalTrophiesGained}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.600">
                          Gained
                        </Text>
                      </Box>
                      <Box
                        p={2}
                        bg="rgba(15, 23, 42, 0.5)"
                        rounded="md"
                        textAlign="center"
                      >
                        <Text fontSize="sm" fontWeight="bold" color="#EF4444">
                          -{profile.statistics.teamBattle.totalTrophiesLost}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.600">
                          Lost
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                </SimpleGrid>
              </Box>
            </MotionBox>

            {/* Compact Two-Column Layout */}
            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={2}>
              {/* Achievements */}
              {/* <MotionBox variants={itemVariants}>
                <CompactSection
                  icon={Award}
                  iconColor="#FFD700"
                  title="Achievements"
                  badge={`${profile.achievements.length} Unlocked`}
                  badgeColor="#FFD700"
                  isExpanded={expandedSections.achievements}
                  onToggle={() => toggleSection('achievements')}
                >
                  <VStack spacing={1.5} maxH="200px" overflowY="auto">
                    {profile.achievements.map((achievement, index) => (
                      <CompactAchievementCard
                        key={achievement.id}
                        achievement={achievement}
                      />
                    ))}
                    {profile.achievements.length === 0 && (
                      <EmptyState
                        emoji="🎯"
                        title="No achievements yet"
                        subtitle="Keep battling to unlock achievements!"
                      />
                    )}
                  </VStack>
                </CompactSection>
              </MotionBox> */}
              {/* Compact Favorite Categories */}
              {profile.favoriteCategories.length > 0 && (
                <MotionBox variants={itemVariants}>
                  <CompactSection
                    icon={Star}
                    iconColor="#FFD700"
                    title="Favorite Categories"
                    badge="Knowledge Domains"
                    badgeColor="#FFD700"
                    isExpanded={expandedSections.categories}
                    onToggle={() => toggleSection('categories')}
                  >
                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                      {profile.favoriteCategories.map((cat, index) => (
                        <CompactCategoryCard key={cat.category} category={cat} />
                      ))}
                    </SimpleGrid>
                  </CompactSection>
                </MotionBox>
              )}
              {/* Streaks & Activity Column */}
              <VStack spacing={2}>
                {/* Compact Streaks */}
                <MotionBox variants={itemVariants} w="100%">
                  <CompactSection
                    icon={Flame}
                    iconColor="#F97316"
                    title="Streaks"
                    badge="Fire Power"
                    badgeColor="#F97316"
                    isExpanded={true}
                    showToggle={false}
                  >
                    <SimpleGrid columns={2} spacing={2}>
                      <CompactStreakCard
                        icon={Bolt}
                        iconColor="#F97316"
                        value={profile.streaks.current}
                        label="Current"
                        subtitle="Win Streak"
                      />
                      <CompactStreakCard
                        icon={Rocket}
                        iconColor="#EF4444"
                        value={profile.streaks.longest}
                        label="Best Ever"
                        subtitle="Record Streak"
                      />
                    </SimpleGrid>

                    {profile.streaks.protectionAvailable && (
                      <Box
                        mt={2}
                        p={2}
                        bg="rgba(16, 185, 129, 0.06)"
                        rounded="lg"
                        border="1px solid"
                        borderColor="rgba(16, 185, 129, 0.15)"
                      >
                        <HStack spacing={1.5}>
                          <Icon as={Shield} color="#10B981" boxSize={3.5} />
                          <VStack spacing={0} align="flex-start">
                            <Text
                              color="#10B981"
                              fontSize="sm"
                              fontWeight="bold"
                            >
                              Streak Protection Active
                            </Text>
                            <Text color="whiteAlpha.600" fontSize="xs">
                              Next loss won't break your streak
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    )}
                  </CompactSection>
                </MotionBox>
              </VStack>
            </SimpleGrid>
            {/* Compact Recent Activity */}
            <MotionBox variants={itemVariants} w="100%">
              <CompactSection
                icon={Activity}
                iconColor="#6366F1"
                title="Recent Activity"
                badge="Battle Log"
                badgeColor="#6366F1"
                isExpanded={expandedSections.activity}
                onToggle={() => toggleSection('activity')}
              >
                <VStack spacing={1.5} maxH="160px" overflowY="auto">
                  {profile.recentActivity.slice(0, 5).map((activity, index) => (
                    <CompactActivityCard
                      key={activity.id}
                      activity={activity}
                    />
                  ))}
                  {profile.recentActivity.length === 0 && (
                    <EmptyState
                      emoji="📊"
                      title="No recent activity"
                      subtitle="Start battling to see activity!"
                    />
                  )}
                </VStack>
              </CompactSection>
            </MotionBox>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  )
}

// NEW: AI Insight Components
const AIInsightCard = ({ insight }) => {
  const getInsightTypeColor = type => {
    switch (type) {
      case 'strength':
        return '#10B981'
      case 'improvement':
        return '#3B82F6'
      case 'achievement':
        return '#FFD700'
      default:
        return '#6366F1'
    }
  }

  const getInsightTypeIcon = type => {
    switch (type) {
      case 'strength':
        return Trophy
      case 'improvement':
        return TrendingUp
      case 'achievement':
        return Star
      default:
        return Lightbulb
    }
  }

  return (
    <Box
      p={3}
      bg="rgba(249, 115, 22, 0.06)"
      rounded="lg"
      border="1px solid"
      borderColor="rgba(249, 115, 22, 0.15)"
    >
      <HStack spacing={2} mb={2}>
        <Icon
          as={getInsightTypeIcon(insight.type)}
          color={getInsightTypeColor(insight.type)}
          boxSize={4}
        />
        <Text fontSize="sm" fontWeight="bold" color="white">
          {insight.title}
        </Text>
        <Badge
          bg={`${getInsightTypeColor(insight.type)}20`}
          color={getInsightTypeColor(insight.type)}
          px={1.5}
          py={0.5}
          rounded="md"
          fontSize="xs"
        >
          {insight.rating}/5 ⭐
        </Badge>
      </HStack>
      <Text fontSize="xs" color="whiteAlpha.700" mb={2}>
        {insight.description}
      </Text>
      <Text fontSize="xs" color="whiteAlpha.500">
        {moment(insight.createdAt).fromNow()}
      </Text>
    </Box>
  )
}

const AIRecommendationCard = ({ recommendation, performanceTrend }) => {
  return (
    <Box
      p={3}
      bg="rgba(59, 130, 246, 0.06)"
      rounded="lg"
      border="1px solid"
      borderColor="rgba(59, 130, 246, 0.15)"
    >
      <HStack spacing={2} mb={2}>
        <Icon as={Wand2} color="#3B82F6" boxSize={4} />
        <Text fontSize="sm" fontWeight="bold" color="white">
          AI Recommendation
        </Text>
        {performanceTrend && (
          <Badge
            bg="rgba(59, 130, 246, 0.15)"
            color="#3B82F6"
            px={1.5}
            py={0.5}
            rounded="md"
            fontSize="xs"
          >
            {performanceTrend.trophyTrend}
          </Badge>
        )}
      </HStack>
      <Text fontSize="xs" color="whiteAlpha.700">
        {recommendation}
      </Text>
    </Box>
  )
}

const AILearningFocusCard = ({ focusAreas }) => {
  return (
    <Box
      p={3}
      bg="rgba(16, 185, 129, 0.06)"
      rounded="lg"
      border="1px solid"
      borderColor="rgba(16, 185, 129, 0.15)"
    >
      <HStack spacing={2} mb={2}>
        <Icon as={BookOpen} color="#10B981" boxSize={4} />
        <Text fontSize="sm" fontWeight="bold" color="white">
          Learning Focus
        </Text>
        <Badge
          bg="rgba(16, 185, 129, 0.15)"
          color="#10B981"
          px={1.5}
          py={0.5}
          rounded="md"
          fontSize="xs"
        >
          AI Suggested
        </Badge>
      </HStack>
      <Wrap spacing={1}>
        {focusAreas.map((area, index) => (
          <WrapItem key={index}>
            <Text
              bg="rgba(16, 185, 129, 0.1)"
              color="#10B981"
              px={2}
              py={1}
              rounded="md"
              fontSize="xs"
              fontWeight="medium"
            >
              {area}
            </Text>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  )
}

// Enhanced Quick Stat Card Component with Premium Styling
const EnhancedQuickStatCard = ({
  icon: IconComponent,
  iconColor,
  label,
  value,
  gradient,
}) => {
  return (
    <MotionBox
      bg="rgba(255, 255, 255, 0.06)"
      backdropFilter="blur(25px)"
      rounded="2xl"
      p={{ base: 4, md: 5 }}
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.15)"
      textAlign="center"
      whileHover={{
        scale: 1.05,
        y: -8,
        boxShadow: `0 20px 40px ${iconColor}30, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
      }}
      transition={{ type: 'spring', stiffness: 300 }}
      boxShadow="0 12px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
      position="relative"
      overflow="hidden"
      cursor="pointer"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: gradient,
        borderRadius: '16px',
        opacity: 0.7,
      }}
    >
      <Box position="relative" zIndex={1}>
        <VStack spacing={3}>
          <MotionBox
            whileHover={{
              rotate: [0, -10, 10, 0],
              scale: [1, 1.1, 1.1, 1],
            }}
            transition={{ duration: 0.6 }}
          >
            <Icon
              as={IconComponent}
              color={iconColor}
              boxSize={{ base: 8, md: 10 }}
              filter={`drop-shadow(0 0 10px ${iconColor}40)`}
            />
          </MotionBox>
          <Text
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="black"
            color="white"
            textShadow={`0 0 15px ${iconColor}60, 0 2px 4px rgba(0,0,0,0.3)`}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Text>
          <Text
            fontSize="sm"
            color="whiteAlpha.900"
            fontWeight="bold"
            textShadow="0 1px 2px rgba(0,0,0,0.2)"
          >
            {label}
          </Text>
        </VStack>
      </Box>
    </MotionBox>
  )
}

// Compact Section Component
const CompactSection = ({
  icon,
  iconColor,
  title,
  badge,
  badgeColor,
  isExpanded,
  onToggle,
  showToggle = true,
  children,
}) => {
  return (
    <Box
      bg="rgba(15, 23, 42, 0.6)"
      backdropFilter="blur(16px)"
      rounded="xl"
      p={2.5}
      border="1px solid"
      borderColor="rgba(6, 182, 212, 0.2)"
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
    >
      <HStack mb={2} spacing={2} justify="space-between">
        <HStack spacing={1.5}>
          <Icon as={icon} color={iconColor} boxSize={4} />
          <Text fontSize="sm" fontWeight="bold" color="white">
            {title}
          </Text>
        </HStack>
        <HStack spacing={1.5}>
          <Badge
            bg={`${badgeColor}15`}
            color={badgeColor}
            px={1.5}
            py={0.5}
            rounded="md"
            fontSize="xs"
            fontWeight="bold"
          >
            {badge}
          </Badge>
          {showToggle && (
            <IconButton
              icon={<Icon as={isExpanded ? ChevronUp : ChevronDown} />}
              size="xs"
              variant="ghost"
              color="whiteAlpha.600"
              onClick={onToggle}
            />
          )}
        </HStack>
      </HStack>

      <AnimatePresence>
        {isExpanded && (
          <MotionBox
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  )
}

// Sleek Quick Stat Card Component
const SlimQuickStatCard = ({
  icon: IconComponent,
  iconColor,
  label,
  value,
}) => {
  return (
    <MotionBox
      bg="linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))"
      rounded="xl"
      p={4}
      border="2px solid"
      borderColor={`${iconColor}40`}
      textAlign="center"
      whileHover={{
        scale: 1.05,
        y: -3,
        boxShadow: `0 0 35px ${iconColor}50`,
        borderColor: `${iconColor}70`,
      }}
      transition={{ type: 'spring', stiffness: 400 }}
      boxShadow={`0 0 20px ${iconColor}20, inset 0 1px 0 rgba(255, 255, 255, 0.1)`}
      cursor="pointer"
    >
      <VStack spacing={2}>
        <Box
          p={2}
          bg={`${iconColor}20`}
          rounded="lg"
          boxShadow={`0 0 15px ${iconColor}30`}
        >
          <Icon as={IconComponent} color={iconColor} boxSize={7} />
        </Box>
        <Text fontSize="2xl" fontWeight="black" color="white" letterSpacing="-0.5px">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
        <Text fontSize="xs" color="whiteAlpha.800" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.5px">
          {label}
        </Text>
      </VStack>
    </MotionBox>
  )
}

// Compact Achievement Card
const CompactAchievementCard = ({ achievement }) => {
  return (
    <HStack
      w="100%"
      p={2.5}
      bg="rgba(255, 255, 255, 0.04)"
      rounded="lg"
      spacing={2.5}
      border="1px solid"
      borderColor="rgba(255, 215, 0, 0.1)"
    >
      <Text fontSize="md">{achievement.icon}</Text>
      <VStack spacing={0} align="flex-start" flex={1}>
        <Text fontSize="sm" fontWeight="bold" color="white">
          {achievement.name}
        </Text>
        <Text fontSize="xs" color="whiteAlpha.600">
          {achievement.description}
        </Text>
      </VStack>
      <Icon as={ChevronRight} color="whiteAlpha.400" boxSize={3} />
    </HStack>
  )
}

// Compact Streak Card
const CompactStreakCard = ({ icon, iconColor, value, label, subtitle }) => {
  return (
    <Box
      p={2.5}
      bg="rgba(15, 23, 42, 0.7)"
      rounded="lg"
      textAlign="center"
      border="1px solid"
      borderColor={`${iconColor}25`}
      boxShadow={`0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 ${iconColor}10`}
    >
      <Icon as={icon} color={iconColor} boxSize={4} mb={2} />
      <Text fontSize="xl" fontWeight="black" color={iconColor}>
        {value}
      </Text>
      <Text fontSize="sm" color="whiteAlpha.800" fontWeight="bold">
        {label}
      </Text>
      <Text fontSize="xs" color="whiteAlpha.600">
        {subtitle}
      </Text>
    </Box>
  )
}

// Compact Activity Card
const CompactActivityCard = ({ activity }) => {
  return (
    <HStack
      w="100%"
      p={2.5}
      bg="rgba(15, 23, 42, 0.6)"
      rounded="lg"
      justify="space-between"
      border="1px solid"
      borderColor="rgba(6, 182, 212, 0.15)"
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.2)"
    >
      <HStack spacing={2.5}>
        <Circle
          size="28px"
          bg={
            activity.type === '1v1'
              ? 'rgba(239, 68, 68, 0.12)'
              : 'rgba(59, 130, 246, 0.12)'
          }
        >
          <Icon
            as={activity.type === '1v1' ? Swords : Users}
            color={activity.type === '1v1' ? '#EF4444' : '#3B82F6'}
            boxSize={3.5}
          />
        </Circle>
        <VStack spacing={0} align="flex-start">
          <Text fontSize="sm" fontWeight="bold" color="white">
            {activity.type === '1v1' ? '1v1 Duel' : 'Team Battle'}
          </Text>
          <Text fontSize="xs" color="whiteAlpha.500">
            {moment(activity.date).fromNow()}
          </Text>
        </VStack>
      </HStack>

      <VStack spacing={0.5} align="flex-end">
        <Badge
          bg={
            activity.result === 'win'
              ? 'rgba(16, 185, 129, 0.12)'
              : activity.result === 'loss'
              ? 'rgba(239, 68, 68, 0.12)'
              : 'rgba(107, 114, 128, 0.12)'
          }
          color={
            activity.result === 'win'
              ? '#10B981'
              : activity.result === 'loss'
              ? '#EF4444'
              : '#6B7280'
          }
          fontSize="xs"
          fontWeight="bold"
          px={2}
          py={0.5}
          rounded="md"
        >
          {activity.result.toUpperCase()}
        </Badge>
        <HStack spacing={1}>
          <Icon as={Trophy} boxSize={3} color="whiteAlpha.500" />
          <Text
            fontSize="xs"
            color={
              activity.trophyChange > 0
                ? '#10B981'
                : activity.trophyChange < 0
                ? '#EF4444'
                : '#6B7280'
            }
            fontWeight="bold"
          >
            {activity.trophyChange > 0 ? '+' : ''}
            {activity.trophyChange}
          </Text>
        </HStack>
      </VStack>
    </HStack>
  )
}

// Compact Category Card - Vibrant Gamer Style
const CompactCategoryCard = ({ category }) => {
  // Dynamic color based on win rate
  const winRateColor = category.winRate >= 70 ? '#22D3EE' : category.winRate >= 50 ? '#10B981' : '#F59E0B'

  return (
    <Box
      p={3}
      bg="linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.85))"
      rounded="xl"
      w="100%"
      textAlign="center"
      border="2px solid"
      borderColor="rgba(255, 215, 0, 0.35)"
      boxShadow="0 0 20px rgba(255, 215, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      _hover={{
        borderColor: 'rgba(255, 215, 0, 0.6)',
        boxShadow: '0 0 30px rgba(255, 215, 0, 0.25)',
        transform: 'translateY(-2px)',
      }}
      transition="all 0.2s"
    >
      <VStack spacing={1.5}>
        <Icon as={Brain} color="#FFD700" boxSize={5} />
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="white"
          textTransform="capitalize"
          noOfLines={1}
        >
          {category.category}
        </Text>
        <VStack spacing={0}>
          <Text fontSize="xs" color="whiteAlpha.700">
            {category.matches} battles
          </Text>
          <Text fontSize="sm" color={winRateColor} fontWeight="black">
            {category.winRate}% win rate
          </Text>
        </VStack>
      </VStack>
    </Box>
  )
}

// Empty State Component
const EmptyState = ({ emoji, title, subtitle }) => {
  return (
    <VStack spacing={2} py={4}>
      <Text fontSize="2xl">{emoji}</Text>
      <VStack spacing={0.5}>
        <Text color="whiteAlpha.600" fontSize="sm" fontWeight="medium">
          {title}
        </Text>
        <Text color="whiteAlpha.500" fontSize="xs" textAlign="center">
          {subtitle}
        </Text>
      </VStack>
    </VStack>
  )
}

export default QuickClashProfile
