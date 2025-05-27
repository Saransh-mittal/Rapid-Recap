// components/quickClashComponents/team/battleAnalysis/components/TeamContributionSection.jsx
import React, { useMemo, useState, useCallback, lazy, Suspense } from 'react'
import {
  Box,
  Flex,
  Text,
  Heading,
  Icon,
  Badge,
  HStack,
  VStack,
  Avatar,
  Progress,
  Grid,
  GridItem,
  useBreakpointValue,
  Collapse,
  Circle,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Users,
  ChevronDown,
  Shield,
  Check,
  X,
  Trophy,
  Star,
  Crown,
  Flame,
  Target,
  Award,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  BarChart2,
} from 'lucide-react'
import { useEffect } from 'react'

const MotionBox = motion(Box)

// Performance levels configuration - memoized outside component
const PERFORMANCE_LEVELS = {
  legendary: {
    levelKey: 'Legendary',
    color: 'purple',
    icon: Crown,
    gradient: 'linear(135deg, #A855F7, #8B5CF6)',
    threshold: 100,
    tier: 'S+',
  },
  excellent: {
    levelKey: 'Excellent',
    color: 'green',
    icon: Trophy,
    gradient: 'linear(135deg, #22C55E, #10B981)',
    threshold: 75,
    tier: 'S',
  },
  good: {
    levelKey: 'Good',
    color: 'blue',
    icon: Star,
    gradient: 'linear(135deg, #3B82F6, #2563EB)',
    threshold: 50,
    tier: 'A',
  },
  average: {
    levelKey: 'Average',
    color: 'yellow',
    icon: Target,
    gradient: 'linear(135deg, #F59E0B, #D97706)',
    threshold: 40,
    tier: 'B',
  },
  needs_improvement: {
    levelKey: 'Needs Improvement',
    color: 'red',
    icon: ArrowDown,
    gradient: 'linear(135deg, #EF4444, #DC2626)',
    threshold: 0,
    tier: 'C',
  },
}

/**
 * Loading placeholder for member cards
 */
const MemberCardLoader = React.memo(() => (
  <Box
    h="200px"
    bg="rgba(255,255,255,0.04)"
    borderRadius="xl"
    p={4}
    border="1px solid rgba(255,255,255,0.1)"
  >
    <VStack spacing={3}>
      <Circle size="60px" bg="whiteAlpha.200" />
      <Box h="20px" w="80%" bg="whiteAlpha.200" borderRadius="md" />
      <Box h="15px" w="60%" bg="whiteAlpha.100" borderRadius="md" />
      <Box h="10px" w="40%" bg="whiteAlpha.100" borderRadius="md" />
    </VStack>
  </Box>
))

MemberCardLoader.displayName = 'MemberCardLoader'

/**
 * Performance level calculator - memoized
 */
const getMemberPerformanceLevel = (member, teamAvg, enhancedData) => {
  // Use enhanced performance data if available
  if (enhancedData && member.enhancedPerformance) {
    return member.enhancedPerformance
  }

  const score = member.score || 0

  if (score >= 100) return PERFORMANCE_LEVELS.legendary
  if (score >= 75) return PERFORMANCE_LEVELS.excellent
  if (score >= 50) return PERFORMANCE_LEVELS.good
  if (score >= 40) return PERFORMANCE_LEVELS.average
  return PERFORMANCE_LEVELS.needs_improvement
}

/**
 * Enhanced team stats calculator - memoized
 */
const calculateTeamStats = (members, totalScore) => {
  if (!members || members.length === 0) {
    return {
      avgScore: 0,
      completionCount: 0,
      rating: 0,
      teamwork: 0,
      consistency: 0,
    }
  }

  const sumScore = members.reduce((sum, m) => sum + (m.score || 0), 0)
  const avgScore = sumScore / members.length
  const completionCount = members.filter(m => m.completed).length
  const scores = members.map(m => m.score || 0)
  const maxScore = Math.max(...scores, 0)
  const minScore = Math.min(...scores, scores.length > 0 ? scores[0] : 0)
  const consistency =
    maxScore > 0 ? 100 - ((maxScore - minScore) / maxScore) * 100 : 0

  return {
    avgScore,
    completionCount,
    rating:
      totalScore > 0 ? Math.min(100, (sumScore / totalScore) * 50 + 50) : 50,
    teamwork: (completionCount / members.length) * 100,
    consistency: Math.max(0, consistency),
  }
}

/**
 * Individual Member Card Component - Optimized
 */
const OptimizedMemberCard = React.memo(
  ({
    member,
    isUserTeam,
    index,
    userId,
    performance,
    teamTotalScore,
    mvpAwards,
    onMemberClick,
    isSelected,
    animationPhase,
  }) => {
    const { t } = useTranslation('QuickClash')
    const controls = useAnimationControls()

    const isSelf = member.user._id === userId
    const canClick = isUserTeam

    // MVP status calculation
    const mvpStatus = useMemo(() => {
      if (member.isMatchMVP) {
        return {
          type: 'Match MVP',
          config: { color: 'purple', icon: Crown, label: 'MATCH MVP' },
        }
      } else if (member.isTeamMVP) {
        return {
          type: 'Team MVP',
          config: { color: 'green', icon: Trophy, label: 'TEAM MVP' },
        }
      } else if (member.isPivotalPlayer) {
        return {
          type: 'Pivotal Player',
          config: { color: 'orange', icon: Star, label: 'PIVOTAL' },
        }
      }
      return null
    }, [member])

    const isMVP = !!mvpStatus

    // Memoized responsive values
    const responsiveValues = useMemo(
      () => ({
        padding: { base: 3, md: 4 },
        avatarSize: { base: 'md', md: 'lg' },
        fontSize: { base: 'sm', md: 'md' },
      }),
      [],
    )

    return (
      <MotionBox
        key={member.user._id}
        w="full"
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{
          opacity: animationPhase >= 1 ? 1 : 0,
          y: animationPhase >= 1 ? 0 : 15,
          scale: animationPhase >= 1 ? 1 : 0.95,
        }}
        transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
        whileHover={canClick ? { y: -4, transition: { duration: 0.2 } } : {}}
        cursor={canClick ? 'pointer' : 'default'}
        onClick={canClick ? () => onMemberClick(member.user._id) : undefined}
      >
        <Box
          bg={
            isSelf
              ? 'rgba(139, 92, 246, 0.15)'
              : isMVP
              ? `rgba(${getMVPBgColor(mvpStatus.config.color)},0.1)`
              : 'rgba(255, 255, 255, 0.04)'
          }
          backdropFilter="blur(12px)"
          borderRadius="xl"
          border="2px solid"
          borderColor={
            isSelf
              ? 'purple.500'
              : isMVP
              ? `${mvpStatus.config.color}.500`
              : isSelected && canClick
              ? `${performance.color}.400`
              : 'rgba(255, 255, 255, 0.1)'
          }
          p={responsiveValues.padding}
          position="relative"
          overflow="hidden"
          transition="all 0.25s ease-out"
          boxShadow={
            isMVP
              ? `0 0 20px rgba(${getMVPBgColor(mvpStatus.config.color)},0.4)`
              : isSelected && canClick
              ? `0 0 15px rgba(${getPerformanceBgColor(performance.color)},0.3)`
              : 'sm'
          }
        >
          {/* MVP Badge */}
          {isMVP && (
            <Badge
              position="absolute"
              top={1.5}
              left={1.5}
              bgGradient={`linear(to-r, ${mvpStatus.config.color}.600, ${mvpStatus.config.color}.700)`}
              color="white"
              px={2}
              py={0.5}
              borderRadius="full"
              fontSize="2xs"
              fontWeight="bold"
              textTransform="uppercase"
              zIndex={2}
              boxShadow="0 2px 4px rgba(0,0,0,0.3)"
            >
              <HStack spacing={1}>
                <Icon as={mvpStatus.config.icon} boxSize={2.5} />
                <span>{mvpStatus.config.label}</span>
              </HStack>
            </Badge>
          )}

          {/* Performance Tier Badge */}
          <Badge
            position="absolute"
            top={isMVP ? 8 : 2.5}
            right={2.5}
            bgGradient={performance.gradient}
            color="white"
            px={2}
            py={0.5}
            borderRadius="full"
            fontSize="2xs"
            fontWeight="bold"
            textTransform="uppercase"
          >
            <HStack spacing={1}>
              <Icon as={performance.icon} boxSize={2.5} />
              <span>{performance.tier}</span>
            </HStack>
          </Badge>

          <VStack spacing={3.5} align="stretch">
            {/* Header Section */}
            <HStack spacing={3}>
              <Box position="relative">
                <Avatar
                  size={responsiveValues.avatarSize}
                  name={member.user.name || member.user.inGameName}
                  src={member.user.pic}
                  border="2px solid"
                  borderColor={
                    isMVP
                      ? `${mvpStatus.config.color}.500`
                      : `${performance.color}.500`
                  }
                />
                <Circle
                  size="18px"
                  bg={
                    member.completed
                      ? 'green.400'
                      : member.participated
                      ? 'yellow.400'
                      : 'gray.500'
                  }
                  position="absolute"
                  bottom="-2px"
                  right="-2px"
                  border="2px solid"
                  borderColor={isSelf ? 'purple.600' : 'gray.800'}
                >
                  <Icon
                    as={
                      member.completed
                        ? Check
                        : member.participated
                        ? Activity
                        : X
                    }
                    boxSize={2.5}
                    color="white"
                  />
                </Circle>
                {isSelf && (
                  <Circle
                    size="20px"
                    bg="purple.500"
                    position="absolute"
                    top="-5px"
                    right="-5px"
                    border="2px solid white"
                  >
                    <Icon as={Crown} boxSize={2.5} color="white" />
                  </Circle>
                )}
              </Box>
              <VStack align="flex-start" spacing={0.5} flex={1} minW={0}>
                <Text
                  fontWeight="bold"
                  color="white"
                  fontSize={responsiveValues.fontSize}
                  noOfLines={1}
                  title={member.user.name || member.user.inGameName}
                >
                  {member.user.name || member.user.inGameName}
                </Text>
                <HStack spacing={1} wrap="wrap">
                  {isSelf && (
                    <Badge
                      colorScheme="purple"
                      variant="subtle"
                      fontSize="3xs"
                      px={1.5}
                    >
                      {t('YOU')}
                    </Badge>
                  )}
                  {isMVP && (
                    <Badge
                      colorScheme={mvpStatus.config.color}
                      variant="solid"
                      fontSize="3xs"
                      px={1.5}
                    >
                      {mvpStatus.type}
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="whiteAlpha.600" noOfLines={1}>
                  {t('Category')}: {member.category || t('N/A')}
                </Text>
              </VStack>
            </HStack>

            {/* Stats Section */}
            <VStack spacing={2.5} align="stretch">
              <HStack justify="space-between">
                <HStack spacing={1.5}>
                  <Icon
                    as={Trophy}
                    color={`${performance.color}.400`}
                    boxSize={4}
                  />
                  <Text color="whiteAlpha.800" fontSize="sm">
                    {t('Score')}
                  </Text>
                </HStack>
                <HStack spacing={1}>
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    color={`${performance.color}.300`}
                  >
                    {member.score || 0}
                  </Text>
                  {performance.tier && (
                    <Badge
                      colorScheme={performance.color}
                      variant="outline"
                      fontSize="xs"
                      px={1}
                    >
                      {performance.tier}
                    </Badge>
                  )}
                </HStack>
              </HStack>

              <Box>
                <HStack justify="space-between" mb={1.5}>
                  <Text fontSize="xs" color="whiteAlpha.700">
                    {t('Team Contribution')}
                  </Text>
                  <Text
                    fontSize="xs"
                    color={`${performance.color}.400`}
                    fontWeight="semibold"
                  >
                    {Math.round(
                      ((member.score || 0) / Math.max(teamTotalScore, 1)) * 100,
                    )}
                    %
                  </Text>
                </HStack>
                <Progress
                  value={
                    ((member.score || 0) / Math.max(teamTotalScore, 1)) * 100
                  }
                  size="sm"
                  borderRadius="full"
                  bg="whiteAlpha.100"
                  sx={{ '& > div': { background: performance.gradient } }}
                />
              </Box>

              {member.trophyChange !== undefined && (
                <HStack justify="space-between">
                  <HStack spacing={1.5}>
                    <Icon
                      as={
                        member.trophyChange > 0
                          ? ArrowUp
                          : member.trophyChange < 0
                          ? ArrowDown
                          : Minus
                      }
                      color={
                        member.trophyChange > 0
                          ? 'green.400'
                          : member.trophyChange < 0
                          ? 'red.400'
                          : 'yellow.400'
                      }
                      boxSize={3.5}
                    />
                    <Text color="whiteAlpha.800" fontSize="sm">
                      {t('Trophies')}
                    </Text>
                  </HStack>
                  <Text
                    fontSize="md"
                    fontWeight="bold"
                    color={
                      member.trophyChange > 0
                        ? 'green.300'
                        : member.trophyChange < 0
                        ? 'red.300'
                        : 'yellow.300'
                    }
                  >
                    {member.trophyChange > 0 ? '+' : ''}
                    {member.trophyChange}
                  </Text>
                </HStack>
              )}
            </VStack>

            {/* Expandable Details */}
            <AnimatePresence>
              {isSelected && canClick && (
                <MotionBox
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <VStack
                    spacing={2.5}
                    pt={3}
                    borderTop="1px dashed"
                    borderColor="whiteAlpha.200"
                  >
                    <Text
                      fontSize="xs"
                      color="whiteAlpha.600"
                      textAlign="center"
                    >
                      {t('Detailed stats coming soon...')}
                    </Text>
                  </VStack>
                </MotionBox>
              )}
            </AnimatePresence>
          </VStack>
        </Box>
      </MotionBox>
    )
  },
)

OptimizedMemberCard.displayName = 'OptimizedMemberCard'

/**
 * Main Team Contribution Section Component - Optimized
 */
const TeamContributionSection = React.memo(
  ({
    battle,
    userTeam,
    userId,
    isExpanded,
    onToggle,
    enhancedMemberPerformance = false,
    mvpAwards = {},
  }) => {
    const { t } = useTranslation('QuickClash')
    const controls = useAnimationControls()
    const [selectedMember, setSelectedMember] = useState(null)
    const [animationPhase, setAnimationPhase] = useState(0)

    // Responsive values - memoized
    const responsiveValues = useMemo(
      () => ({
        padding: { base: 4, md: 6 },
        headerIconSize: { base: 5, md: 6 },
        headingSize: { base: 'md', md: 'lg' },
      }),
      [],
    )

    // Memoized team data calculations
    const teamData = useMemo(() => {
      const userTeamMembers =
        userTeam === 'teamA' ? battle.teamAMembers : battle.teamBMembers
      const opponentTeamMembers =
        userTeam === 'teamA' ? battle.teamBMembers : battle.teamAMembers
      const userTeamTotalScore =
        userTeam === 'teamA' ? battle.teamATotalScore : battle.teamBTotalScore
      const opponentTeamTotalScore =
        userTeam === 'teamA' ? battle.teamBTotalScore : battle.teamATotalScore

      const userTeamStats = calculateTeamStats(
        userTeamMembers,
        userTeamTotalScore,
      )
      const opponentTeamStats = calculateTeamStats(
        opponentTeamMembers,
        opponentTeamTotalScore,
      )

      return {
        userTeamMembers,
        opponentTeamMembers,
        userTeamTotalScore,
        opponentTeamTotalScore,
        userTeamWins:
          userTeam === 'teamA' ? battle.teamAWins : battle.teamBWins,
        opponentTeamWins:
          userTeam === 'teamA' ? battle.teamBWins : battle.teamAWins,
        userTeamStats,
        opponentTeamStats,
        userTeamName:
          battle[userTeam]?.name ||
          (userTeam === 'teamA' ? t('Team A') : t('Team B')),
        opponentTeamName:
          battle[userTeam === 'teamA' ? 'teamB' : 'teamA']?.name ||
          (userTeam === 'teamA' ? t('Team B') : t('Team A')),
      }
    }, [battle, userTeam, t])

    // Animation effect
    useEffect(() => {
      controls
        .start({
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.6, ease: 'easeOut' },
        })
        .then(() => {
          setAnimationPhase(1)
        })
    }, [controls, isExpanded])

    // Member click handler
    const handleMemberClick = useCallback(memberId => {
      setSelectedMember(prev => (prev === memberId ? null : memberId))
    }, [])

    return (
      <Box
        position="relative"
        overflow="hidden"
        borderRadius="2xl"
        bg="rgba(20, 15, 35, 0.7)"
        backdropFilter="blur(15px)"
        border="1px solid rgba(255, 255, 255, 0.1)"
        boxShadow="0 8px 30px rgba(0, 0, 0, 0.25)"
      >
        {/* Header */}
        <Flex
          px={responsiveValues.padding}
          py={4}
          justifyContent="space-between"
          alignItems="center"
          cursor="pointer"
          onClick={onToggle}
          borderBottom="1px solid rgba(255,255,255,0.08)"
          _hover={{ bg: 'rgba(255, 255, 255, 0.03)' }}
        >
          <HStack spacing={3.5}>
            <Icon
              as={Users}
              color="purple.300"
              boxSize={responsiveValues.headerIconSize}
            />
            <VStack align="flex-start" spacing={0}>
              <Heading
                size={responsiveValues.headingSize}
                color="white"
                fontWeight="semibold"
              >
                {t('Team Performance')}
              </Heading>
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="whiteAlpha.600">
                {t('Contribution and stats per player')}
              </Text>
            </VStack>
          </HStack>
          <MotionBox
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Icon as={ChevronDown} color="whiteAlpha.700" boxSize={5} />
          </MotionBox>
        </Flex>

        {/* Team Overview Stats */}
        <Box
          p={responsiveValues.padding}
          bg="rgba(255,255,255,0.02)"
          borderBottom={isExpanded ? '1px solid rgba(255,255,255,0.08)' : '0'}
        >
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
            {[
              {
                name: teamData.userTeamName,
                totalScore: teamData.userTeamTotalScore,
                wins: teamData.userTeamWins,
                active: teamData.userTeamStats.completionCount,
                membersCount: teamData.userTeamMembers.length,
                icon: Shield,
                colorScheme: 'blue',
              },
              {
                name: teamData.opponentTeamName,
                totalScore: teamData.opponentTeamTotalScore,
                wins: teamData.opponentTeamWins,
                active: teamData.opponentTeamStats.completionCount,
                membersCount: teamData.opponentTeamMembers.length,
                icon: Flame,
                colorScheme: 'red',
              },
            ].map(team => (
              <Box
                key={team.name}
                bg={`rgba(${
                  team.colorScheme === 'blue' ? '59,130,246' : '239,68,68'
                }, 0.1)`}
                borderRadius="lg"
                p={3}
                border="1px solid"
                borderColor={`rgba(${
                  team.colorScheme === 'blue' ? '59,130,246' : '239,68,68'
                }, 0.2)`}
              >
                <VStack spacing={2}>
                  <HStack>
                    <Icon
                      as={team.icon}
                      color={`${team.colorScheme}.400`}
                      boxSize={5}
                    />
                    <Text
                      color={`${team.colorScheme}.300`}
                      fontWeight="bold"
                      fontSize="md"
                      noOfLines={1}
                    >
                      {team.name}
                    </Text>
                  </HStack>
                  <HStack spacing={4} justify="space-around" w="full">
                    <VStack spacing={0}>
                      <Text fontSize="lg" fontWeight="bold" color="white">
                        {team.totalScore || 0}
                      </Text>
                      <Text fontSize="2xs" color="whiteAlpha.600">
                        {t('Points')}
                      </Text>
                    </VStack>
                    <VStack spacing={0}>
                      <Text fontSize="lg" fontWeight="bold" color="white">
                        {team.wins || 0}
                      </Text>
                      <Text fontSize="2xs" color="whiteAlpha.600">
                        {t('Wins')}
                      </Text>
                    </VStack>
                    <VStack spacing={0}>
                      <Text fontSize="lg" fontWeight="bold" color="white">
                        {team.active || 0}/{team.membersCount || 0}
                      </Text>
                      <Text fontSize="2xs" color="whiteAlpha.600">
                        {t('Active')}
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </Grid>
        </Box>

        {/* Expanded Content */}
        <Collapse in={isExpanded} animateOpacity>
          <Box p={responsiveValues.padding}>
            <Grid
              templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
              gap={responsiveValues.padding}
            >
              {[
                {
                  titleKey: 'Your Team',
                  members: teamData.userTeamMembers,
                  teamColor: 'blue',
                  isUser: true,
                  totalScore: teamData.userTeamTotalScore,
                },
                {
                  titleKey: 'Opponent Team',
                  members: teamData.opponentTeamMembers,
                  teamColor: 'red',
                  isUser: false,
                  totalScore: teamData.opponentTeamTotalScore,
                },
              ].map(section => (
                <GridItem key={section.titleKey} w="full">
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Heading
                        size={{ base: 'sm', md: 'md' }}
                        color={`${section.teamColor}.300`}
                      >
                        {t(section.titleKey)}
                      </Heading>
                      <Badge
                        colorScheme={section.teamColor}
                        variant="outline"
                        fontSize="xs"
                        px={2}
                        py={0.5}
                      >
                        {section.members.length} {t('Members')}
                      </Badge>
                    </HStack>

                    <Grid templateColumns="1fr" gap={4}>
                      {section.members.map((member, index) => (
                        <GridItem key={member.user._id || index} w="full">
                          <Suspense fallback={<MemberCardLoader />}>
                            <OptimizedMemberCard
                              member={member}
                              isUserTeam={section.isUser}
                              index={index}
                              userId={userId}
                              performance={getMemberPerformanceLevel(
                                member,
                                0,
                                enhancedMemberPerformance,
                              )}
                              teamTotalScore={section.totalScore}
                              mvpAwards={mvpAwards}
                              onMemberClick={handleMemberClick}
                              isSelected={selectedMember === member.user._id}
                              animationPhase={animationPhase}
                            />
                          </Suspense>
                        </GridItem>
                      ))}
                    </Grid>
                  </VStack>
                </GridItem>
              ))}
            </Grid>

            {/* Battle Summary */}
            {battle.status === 'completed' && (
              <Box
                mt={8}
                p={4}
                bg="rgba(139, 92, 246, 0.08)"
                borderRadius="xl"
                border="1px solid rgba(139, 92, 246, 0.2)"
              >
                <VStack spacing={3}>
                  <HStack spacing={2}>
                    <Icon as={Award} color="purple.300" boxSize={5} />
                    <Heading
                      size={{ base: 'xs', md: 'sm' }}
                      color="whiteAlpha.900"
                    >
                      {t('Team Battle Summary')}
                    </Heading>
                  </HStack>
                  <Grid
                    templateColumns={{ base: '1fr', sm: 'repeat(3, 1fr)' }}
                    gap={3}
                    w="full"
                  >
                    {[
                      {
                        labelKey: 'Team Rating',
                        value: `${Math.round(teamData.userTeamStats.rating)}%`,
                        color: 'purple.300',
                      },
                      {
                        labelKey: 'Teamwork',
                        value: `${Math.round(
                          teamData.userTeamStats.teamwork,
                        )}%`,
                        color: 'green.300',
                      },
                      {
                        labelKey: 'Consistency',
                        value: `${Math.round(
                          teamData.userTeamStats.consistency,
                        )}%`,
                        color: 'blue.300',
                      },
                    ].map(item => (
                      <VStack
                        key={item.labelKey}
                        bg="whiteAlpha.50"
                        p={2.5}
                        borderRadius="md"
                        minH="70px"
                        justifyContent="center"
                      >
                        <Text
                          fontSize={{ base: '2xs', sm: 'xs' }}
                          color="whiteAlpha.700"
                        >
                          {t(item.labelKey)}
                        </Text>
                        <Text
                          fontSize={{ base: 'sm', sm: 'lg' }}
                          fontWeight="bold"
                          color={item.color}
                        >
                          {item.value}
                        </Text>
                      </VStack>
                    ))}
                  </Grid>
                </VStack>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>
    )
  },
)

// Helper functions for colors
const getMVPBgColor = color => {
  switch (color) {
    case 'purple':
      return '139,92,246'
    case 'green':
      return '16,185,129'
    case 'orange':
      return '249,115,22'
    default:
      return '107,114,128'
  }
}

const getPerformanceBgColor = color => {
  switch (color) {
    case 'purple':
      return '139,92,246'
    case 'green':
      return '16,185,129'
    case 'blue':
      return '59,130,246'
    case 'yellow':
      return '245,158,11'
    case 'red':
      return '239,68,68'
    default:
      return '107,114,128'
  }
}

TeamContributionSection.displayName = 'TeamContributionSection'

export default TeamContributionSection
