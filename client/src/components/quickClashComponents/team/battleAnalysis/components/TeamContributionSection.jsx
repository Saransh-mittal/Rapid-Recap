// components/quickClashComponents/team/battleAnalysis/components/TeamContributionSection.jsx
import React, { useEffect, useState } from 'react'
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
  Button,
  // Tooltip, // Tooltip was not used, removed for cleanliness
} from '@chakra-ui/react'
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Users,
  ChevronDown,
  ChevronUp,
  Shield,
  Check,
  X,
  Trophy,
  Star,
  TrendingUp,
  TrendingDown,
  Crown,
  Flame,
  Target,
  Award,
  Activity,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
  BarChart2,
} from 'lucide-react'

const MotionBox = motion(Box)

const TeamContributionSection = ({
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

  // Ensure columns are responsive, especially for member cards
  const memberCardColumns = useBreakpointValue({ base: 1, md: 1, lg: 1 }) // Changed to 1 for md as well for safety, can be 2 if design allows
  const teamSectionColumns = useBreakpointValue({ base: 1, lg: 2 }) // For 'Your Team' vs 'Opponent Team' sections

  const padding = useBreakpointValue({ base: 3, sm: 4, md: 6 }) // Adjusted base padding
  const headerIconSize = useBreakpointValue({ base: 5, md: 6, lg: 7 }) // Adjusted base size
  const memberAvatarSize = useBreakpointValue({ base: 'md', md: 'lg' })
  const headingSize = useBreakpointValue({ base: 'md', md: 'lg', lg: 'xl' }) // Adjusted base size

  const userTeamMembers =
    userTeam === 'teamA' ? battle.teamAMembers : battle.teamBMembers
  const opponentTeamMembers =
    userTeam === 'teamA' ? battle.teamBMembers : battle.teamAMembers
  const userTeamData = userTeam === 'teamA' ? battle.teamA : battle.teamB
  const opponentTeamData = userTeam === 'teamA' ? battle.teamB : battle.teamA
  const userTeamName =
    userTeamData?.name || (userTeam === 'teamA' ? t('Team A') : t('Team B'))
  const opponentTeamName =
    opponentTeamData?.name || (userTeam === 'teamA' ? t('Team B') : t('Team A'))

  const getEnhancedTeamStats = () => {
    const calcStats = (members, totalScoreParam) => {
      if (!members || members.length === 0)
        return {
          avgScore: 0,
          completionCount: 0,
          rating: 0,
          teamwork: 0,
          consistency: 0,
        }
      const sumScore = members.reduce((sum, m) => sum + (m.score || 0), 0) // Ensure score is a number
      const avgScore = members.length > 0 ? sumScore / members.length : 0
      const completionCount = members.filter(m => m.completed).length
      const scores = members.map(m => m.score || 0)
      const maxScore = Math.max(...scores, 0)
      const minScore = Math.min(...scores, scores.length > 0 ? scores[0] : 0) // Ensure minScore has a sensible default
      const consistency =
        maxScore > 0 ? 100 - ((maxScore - minScore) / maxScore) * 100 : 0
      return {
        avgScore,
        completionCount,
        rating:
          totalScoreParam > 0
            ? Math.min(100, (sumScore / totalScoreParam) * 50 + 50)
            : 50,
        teamwork:
          members.length > 0 ? (completionCount / members.length) * 100 : 0,
        consistency: Math.max(0, consistency),
      }
    }
    const userTeamTotalScore =
      userTeam === 'teamA' ? battle.teamATotalScore : battle.teamBTotalScore
    const opponentTeamTotalScore =
      userTeam === 'teamA' ? battle.teamBTotalScore : battle.teamATotalScore

    const userTeamStats = calcStats(userTeamMembers, userTeamTotalScore)
    const opponentTeamStats = calcStats(
      opponentTeamMembers,
      opponentTeamTotalScore,
    )

    return {
      userTeamTotalScore,
      opponentTeamTotalScore,
      userTeamWins: userTeam === 'teamA' ? battle.teamAWins : battle.teamBWins,
      opponentTeamWins:
        userTeam === 'teamA' ? battle.teamBWins : battle.teamAWins,
      userTeamStats,
      opponentTeamStats,
    }
  }
  const stats = getEnhancedTeamStats()

  const getMemberPerformanceLevel = (member, teamAvg) => {
    // Use enhanced performance data if available
    if (enhancedMemberPerformance && member.enhancedPerformance) {
      return member.enhancedPerformance
    }

    // Fallback to original calculation
    const score = member.score || 0

    if (score >= 100) {
      return {
        levelKey: 'Legendary',
        color: 'purple',
        icon: Crown,
        gradient: 'linear(135deg, #A855F7, #8B5CF6)',
        threshold: 100,
        tier: 'S+',
      }
    }
    if (score >= 75) {
      return {
        levelKey: 'Excellent',
        color: 'green',
        icon: Trophy,
        gradient: 'linear(135deg, #22C55E, #10B981)',
        threshold: 75,
        tier: 'S',
      }
    }
    if (score >= 50) {
      return {
        levelKey: 'Good',
        color: 'blue',
        icon: Star,
        gradient: 'linear(135deg, #3B82F6, #2563EB)',
        threshold: 50,
        tier: 'A',
      }
    }
    if (score >= 40) {
      return {
        levelKey: 'Average',
        color: 'yellow',
        icon: Target,
        gradient: 'linear(135deg, #F59E0B, #D97706)',
        threshold: 40,
        tier: 'B',
      }
    }
    return {
      levelKey: 'Needs Improvement',
      color: 'red',
      icon: TrendingDown,
      gradient: 'linear(135deg, #EF4444, #DC2626)',
      threshold: 0,
      tier: 'C',
    }
  }

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

  const renderEnhancedMemberCard = (member, isUserTeam, index) => {
    const isSelf = member.user._id === userId
    const performance = getMemberPerformanceLevel(
      member,
      isUserTeam
        ? stats.userTeamStats.avgScore
        : stats.opponentTeamStats.avgScore,
    )
    const isSelected = selectedMember === member.user._id

    // NEW: Check MVP status
    const isMVP =
      member.isMatchMVP || member.isTeamMVP || member.isPivotalPlayer
    let mvpType = null
    let mvpConfig = null

    if (member.isMatchMVP) {
      mvpType = 'Match MVP'
      mvpConfig = { color: 'purple', icon: Crown, label: 'MATCH MVP' }
    } else if (member.isTeamMVP) {
      mvpType = 'Team MVP'
      mvpConfig = { color: 'green', icon: Trophy, label: 'TEAM MVP' }
    } else if (member.isPivotalPlayer) {
      mvpType = 'Pivotal Player'
      mvpConfig = { color: 'orange', icon: Zap, label: 'PIVOTAL' }
    }

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
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        cursor={isUserTeam ? 'pointer' : 'default'}
        onClick={
          isUserTeam
            ? () => setSelectedMember(isSelected ? null : member.user._id)
            : undefined
        }
      >
        <Box
          bg={
            isSelf
              ? 'rgba(139, 92, 246, 0.15)'
              : isMVP
              ? `rgba(${
                  mvpConfig.color === 'purple'
                    ? '139,92,246'
                    : mvpConfig.color === 'green'
                    ? '16,185,129'
                    : '249,115,22'
                },0.1)`
              : 'rgba(255, 255, 255, 0.04)'
          }
          backdropFilter="blur(12px)"
          borderRadius="xl"
          border="2px solid"
          borderColor={
            isSelf
              ? 'purple.500'
              : isMVP
              ? `${mvpConfig.color}.500`
              : isSelected && isUserTeam
              ? `${performance.color}.400`
              : 'rgba(255, 255, 255, 0.1)'
          }
          p={padding - 1 < 3 ? 3 : padding - 1}
          position="relative"
          overflow="hidden"
          transition="all 0.25s ease-out"
          boxShadow={
            isMVP
              ? `0 0 20px rgba(${
                  mvpConfig.color === 'purple'
                    ? '139,92,246'
                    : mvpConfig.color === 'green'
                    ? '16,185,129'
                    : '249,115,22'
                },0.4)`
              : isSelected && isUserTeam
              ? `0 0 15px rgba(${
                  performance.color === 'purple'
                    ? '139,92,246'
                    : performance.color === 'green'
                    ? '16,185,129'
                    : '59,130,246'
                },0.3)`
              : 'sm'
          }
        >
          {/* MVP Badge */}
          {isMVP && (
            <Badge
              position="absolute"
              top={1.5}
              left={1.5}
              bgGradient={`linear(to-r, ${mvpConfig.color}.600, ${mvpConfig.color}.700)`}
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
                <Icon as={mvpConfig.icon} boxSize={2.5} />
                <span>{mvpConfig.label}</span>
              </HStack>
            </Badge>
          )}

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
              <span>{performance.tier || t(performance.levelKey)}</span>
            </HStack>
          </Badge>

          <VStack spacing={3.5} align="stretch">
            <HStack spacing={3}>
              <Box position="relative">
                <Avatar
                  size={memberAvatarSize}
                  name={member.user.name || member.user.inGameName}
                  src={member.user.pic}
                  border="2px solid"
                  borderColor={
                    isMVP
                      ? `${mvpConfig.color}.500`
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
                  fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
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
                      colorScheme={mvpConfig.color}
                      variant="solid"
                      fontSize="3xs"
                      px={1.5}
                    >
                      {mvpType}
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="whiteAlpha.600" noOfLines={1}>
                  {t('Category')}: {member.category || t('N/A')}
                </Text>
              </VStack>
            </HStack>

            {/* Rest of the card content - score, contribution, trophies remain the same */}
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
                      ((member.score || 0) /
                        Math.max(
                          isUserTeam
                            ? stats.userTeamTotalScore
                            : stats.opponentTeamTotalScore,
                          1,
                        )) *
                        100,
                    )}
                    %
                  </Text>
                </HStack>
                <Progress
                  value={
                    ((member.score || 0) /
                      Math.max(
                        isUserTeam
                          ? stats.userTeamTotalScore
                          : stats.opponentTeamTotalScore,
                        1,
                      )) *
                    100
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

            <AnimatePresence>
              {isSelected && isUserTeam && (
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
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme={performance.color}
                      leftIcon={<BarChart2 size={12} />}
                      w="full"
                      onClick={e => {
                        e.stopPropagation()
                        // Logic for detailed stats modal
                      }}
                    >
                      {t('View Full Breakdown')}
                    </Button>
                  </VStack>
                </MotionBox>
              )}
            </AnimatePresence>
          </VStack>
        </Box>
      </MotionBox>
    )
  }

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
      <Flex
        px={padding}
        py={4}
        justifyContent="space-between"
        alignItems="center"
        cursor="pointer"
        onClick={onToggle}
        borderBottom="1px solid rgba(255,255,255,0.08)"
        _hover={{ bg: 'rgba(255, 255, 255, 0.03)' }}
      >
        <HStack spacing={3.5}>
          <Icon as={Users} color="purple.300" boxSize={headerIconSize} />
          <VStack align="flex-start" spacing={0}>
            <Heading size={headingSize} color="white" fontWeight="semibold">
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

      <Box
        p={padding}
        bg="rgba(255,255,255,0.02)"
        borderBottom={isExpanded ? '1px solid rgba(255,255,255,0.08)' : '0'}
      >
        <Grid
          templateColumns={{ base: '1fr', md: '1fr 1fr' }}
          gap={padding - 1 < 3 ? 3 : padding - 1}
        >
          {[
            {
              name: userTeamName,
              totalScore: stats.userTeamTotalScore,
              wins: stats.userTeamWins,
              active: stats.userTeamStats.completionCount,
              membersCount: userTeamMembers.length,
              icon: Shield,
              colorScheme: 'blue',
            },
            {
              name: opponentTeamName,
              totalScore: stats.opponentTeamTotalScore,
              wins: stats.opponentTeamWins,
              active: stats.opponentTeamStats.completionCount,
              membersCount: opponentTeamMembers.length,
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
                <HStack
                  spacing={{ base: 2, sm: 4 }}
                  justify="space-around"
                  w="full"
                >
                  <VStack spacing={0}>
                    <Text
                      fontSize={{ base: 'md', sm: 'lg' }}
                      fontWeight="bold"
                      color="white"
                    >
                      {team.totalScore || 0}
                    </Text>
                    <Text fontSize="2xs" color="whiteAlpha.600">
                      {t('Points')}
                    </Text>
                  </VStack>
                  <VStack spacing={0}>
                    <Text
                      fontSize={{ base: 'md', sm: 'lg' }}
                      fontWeight="bold"
                      color="white"
                    >
                      {team.wins || 0}
                    </Text>
                    <Text fontSize="2xs" color="whiteAlpha.600">
                      {t('Wins')}
                    </Text>
                  </VStack>
                  <VStack spacing={0}>
                    <Text
                      fontSize={{ base: 'md', sm: 'lg' }}
                      fontWeight="bold"
                      color="white"
                    >
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

      <Collapse in={isExpanded} animateOpacity>
        <Box p={padding}>
          {/* This Grid wraps the two team sections (Your Team and Opponent Team) */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={padding}>
            {[
              {
                titleKey: 'Your Team',
                members: userTeamMembers,
                teamColor: 'blue',
                isUser: true,
              },
              {
                titleKey: 'Opponent Team',
                members: opponentTeamMembers,
                teamColor: 'red',
                isUser: false,
              },
            ].map(section => (
              <GridItem key={section.titleKey} w="full">
                {' '}
                {/* Ensure GridItem takes full width */}
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
                  {/* This Grid is for the member cards within each team section */}
                  <Grid templateColumns={{ base: '1fr', sm: '1fr' }} gap={4}>
                    {' '}
                    {/* Force 1 column for member cards on sm and base */}
                    {section.members.map((member, index) => (
                      <GridItem key={member.user._id || index} w="full">
                        {' '}
                        {/* Ensure card GridItem takes full width */}
                        {renderEnhancedMemberCard(
                          member,
                          section.isUser,
                          index,
                        )}
                      </GridItem>
                    ))}
                  </Grid>
                </VStack>
              </GridItem>
            ))}
          </Grid>

          {battle.status === 'completed' && (
            <Box
              mt={8}
              p={padding - 2 < 3 ? 3 : padding - 2}
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
                  gap={padding - 2 < 3 ? 2 : padding - 2}
                  w="full"
                >
                  {[
                    {
                      labelKey: 'Team Rating',
                      value: `${Math.round(stats.userTeamStats.rating)}%`,
                      color: 'purple.300',
                    },
                    {
                      labelKey: 'Teamwork',
                      value: `${Math.round(stats.userTeamStats.teamwork)}%`,
                      color: 'green.300',
                    },
                    {
                      labelKey: 'Consistency',
                      value: `${Math.round(stats.userTeamStats.consistency)}%`,
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
}

export default TeamContributionSection
