import React, { memo, useMemo } from 'react'
import {
  Box,
  Flex,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  Avatar,
  AvatarGroup,
  Icon,
  useBreakpointValue,
  Progress,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import {
  BarChart2,
  Trophy,
  Swords,
  Shield,
  Clock,
  ArrowRight,
  Target,
  Zap,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const MotionBox = motion(Box)

/**
 * Simple and minimalistic TeamBattleItem with high design standards
 */
const TeamBattleItem = memo(({ battle, index, onEnter, onViewAnalysis }) => {
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)

  // Responsive values with granular breakpoints
  const avatarSize = useBreakpointValue({ base: 'sm', md: 'md', lg: 'md' })
  const fontSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const padding = useBreakpointValue({ base: 3, md: 4 })
  const buttonSize = useBreakpointValue({ base: 'xs', md: 'sm' })
  // Progressive avatar display: +3 (xs) -> +2 (sm) -> +1 (md) -> all (lg+)
  const avatarMax = useBreakpointValue({
    base: 2, // Shows 1 + "+3" on very small screens
    md: 1,
    lg: 4, // Shows all 4 on large screens
  })

  // Memoized calculations
  const { userTeam, battleOutcome, completionPercentage, timeInfo } =
    useMemo(() => {
      if (!battle || !user)
        return {
          userTeam: null,
          battleOutcome: { label: 'ACTIVE', color: 'green', icon: Zap },
          completionPercentage: 0,
          timeInfo: { label: '', timeText: '', color: 'gray.500' },
        }

      // User team calculation
      const isInTeamA = battle.teamAMembers?.some(
        member => member.user._id === user._id,
      )
      const isInTeamB = battle.teamBMembers?.some(
        member => member.user._id === user._id,
      )
      const userTeam = isInTeamA ? 'teamA' : isInTeamB ? 'teamB' : null

      // Battle outcome - using green for active instead of blue
      let battleOutcome = { label: 'ACTIVE', color: 'green', icon: Zap }

      if (battle.status === 'completed') {
        if (battle.winner === 'tie') {
          battleOutcome = { label: 'DRAW', color: 'yellow', icon: Shield }
        } else if (battle.winner === userTeam) {
          battleOutcome = { label: 'VICTORY', color: 'purple', icon: Trophy }
        } else {
          battleOutcome = { label: 'DEFEAT', color: 'red', icon: Swords }
        }
      } else if (battle.status === 'expired') {
        battleOutcome = { label: 'EXPIRED', color: 'gray', icon: Clock }
      }

      // Completion calculation
      const totalChallenges = battle.challenges?.length || 0
      const completedChallenges =
        battle.challenges?.filter(
          challenge => challenge.teamACompleted && challenge.teamBCompleted,
        ).length || 0
      const completionPercentage =
        totalChallenges > 0
          ? Math.round((completedChallenges / totalChallenges) * 100)
          : 0

      // Time info
      let timeInfo = { label: '', timeText: '', color: 'gray.500' }
      if (battle.expiresAt) {
        const now = new Date()
        const expiresAt = new Date(battle.expiresAt)
        const isExpired = now > expiresAt

        timeInfo = {
          label: isExpired ? t('Ended') : t('Expires'),
          timeText: formatDistanceToNow(expiresAt, { addSuffix: true }),
          color: isExpired ? 'gray.500' : 'blue.400',
        }
      }

      return { userTeam, battleOutcome, completionPercentage, timeInfo }
    }, [battle, user, t])

  // Simple entrance animation
  const cardVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: index * 0.05,
        ease: 'easeOut',
      },
    },
  }

  if (!battle) return null

  return (
    <MotionBox
      variants={cardVariants}
      initial="initial"
      animate="animate"
      width="100%"
      maxWidth="100%"
      minWidth="0"
    >
      <Box
        bg="rgba(26, 32, 44, 0.8)"
        borderRadius="xl"
        borderWidth="1px"
        borderColor={
          battleOutcome.color === 'purple'
            ? 'purple.500'
            : battleOutcome.color === 'red'
            ? 'red.500'
            : battleOutcome.color === 'yellow'
            ? 'yellow.500'
            : battleOutcome.color === 'green'
            ? 'green.500'
            : 'whiteAlpha.200'
        }
        overflow="hidden"
        position="relative"
      >
        {/* Header */}
        <Flex
          bg={`${battleOutcome.color}.600`}
          px={padding}
          py={2}
          justify="space-between"
          align="center"
        >
          <Badge
            display="flex"
            alignItems="center"
            gap={2}
            bg="rgba(255, 255, 255, 0.2)"
            color="white"
            px={2}
            py={1}
            borderRadius="md"
            fontSize="xs"
            fontWeight="bold"
          >
            <Icon as={battleOutcome.icon} boxSize={3} />
            {battleOutcome.label}
          </Badge>

          <Badge
            bg="rgba(0, 0, 0, 0.3)"
            color="white"
            px={2}
            py={1}
            borderRadius="md"
            fontSize="xs"
          >
            4v4
          </Badge>
        </Flex>

        {/* Progress Bar */}
        <Box px={padding} pt={3}>
          <Flex justify="space-between" align="center" mb={2}>
            <HStack spacing={1}>
              <Icon as={Target} color="purple.400" boxSize={3} />
              <Text fontSize="xs" color="whiteAlpha.700">
                {t('Progress')}
              </Text>
            </HStack>
            <Text fontSize="xs" color="whiteAlpha.700">
              {completionPercentage}%
            </Text>
          </Flex>
          <Progress
            value={completionPercentage}
            size="sm"
            colorScheme={battleOutcome.color}
            borderRadius="full"
            bg="rgba(255, 255, 255, 0.1)"
          />
        </Box>

        {/* Teams Section */}
        <Flex px={padding} py={4} justify="space-between" align="center">
          {/* Team A */}
          <VStack spacing={2} align="center" flex="1" minWidth="0">
            <Text
              fontSize={fontSize}
              fontWeight="bold"
              color="white"
              noOfLines={1}
              textAlign="center"
              maxWidth="100%"
            >
              {battle.teamA?.name || t('Team A')}
            </Text>
            <AvatarGroup
              size={avatarSize}
              max={avatarMax}
              spacing="-1"
              // Custom styling for the excess avatar (+X indicator)
              css={{
                '& > .chakra-avatar__excess': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: '2px',
                  color: 'white',
                  fontSize: 'xs',
                  fontWeight: 'bold',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                },
              }}
            >
              {battle.teamAMembers?.map(member => (
                <Avatar
                  key={member.user._id}
                  name={member.user.name || member.user.inGameName}
                  src={member.user.pic}
                  borderWidth="2px"
                  borderColor={
                    member.user._id === user?._id ? 'purple.400' : 'blue.400'
                  }
                />
              ))}
            </AvatarGroup>
            <Text
              fontSize="xl"
              fontWeight="black"
              color="blue.400"
              lineHeight="1"
            >
              {battle.teamAWins || 0}
            </Text>
          </VStack>

          {/* VS Section */}
          <VStack spacing={2} px={3} minWidth="0">
            <Text
              fontSize="lg"
              fontWeight="bold"
              color="whiteAlpha.600"
              letterSpacing="wider"
            >
              VS
            </Text>

            <VStack spacing={1}>
              {battle.status === 'completed' && (
                <Button
                  size={buttonSize}
                  colorScheme="purple"
                  leftIcon={<BarChart2 size={12} />}
                  onClick={e => {
                    e.stopPropagation()
                    onViewAnalysis?.(battle._id)
                  }}
                  fontSize="xs"
                  minWidth="80px"
                  borderRadius="md"
                >
                  {t('Analysis')}
                </Button>
              )}

              <Button
                size={buttonSize}
                colorScheme={battle.status === 'active' ? 'green' : 'gray'}
                rightIcon={<ArrowRight size={12} />}
                onClick={e => {
                  e.stopPropagation()
                  onEnter?.(battle._id)
                }}
                isDisabled={battle.status !== 'active'}
                fontSize="xs"
                minWidth="80px"
                borderRadius="md"
              >
                {battle.status === 'active' ? t('Enter') : t('View')}
              </Button>
            </VStack>
          </VStack>

          {/* Team B */}
          <VStack spacing={2} align="center" flex="1" minWidth="0">
            <Text
              fontSize={fontSize}
              fontWeight="bold"
              color="white"
              noOfLines={1}
              textAlign="center"
              maxWidth="100%"
            >
              {battle.teamB?.name || t('Team B')}
            </Text>
            <AvatarGroup
              size={avatarSize}
              max={avatarMax}
              spacing="-1"
              // Custom styling for the excess avatar (+X indicator)
              css={{
                '& > .chakra-avatar__excess': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: '2px',
                  color: 'white',
                  fontSize: 'xs',
                  fontWeight: 'bold',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                },
              }}
            >
              {battle.teamBMembers?.map(member => (
                <Avatar
                  key={member.user._id}
                  name={member.user.name || member.user.inGameName}
                  src={member.user.pic}
                  borderWidth="2px"
                  borderColor={
                    member.user._id === user?._id ? 'purple.400' : 'red.400'
                  }
                />
              ))}
            </AvatarGroup>
            <Text
              fontSize="xl"
              fontWeight="black"
              color="red.400"
              lineHeight="1"
            >
              {battle.teamBWins || 0}
            </Text>
          </VStack>
        </Flex>

        {/* Footer - Time Info */}
        {timeInfo.timeText && (
          <Box
            px={padding}
            py={2}
            borderTop="1px"
            borderColor="whiteAlpha.100"
            bg="rgba(0, 0, 0, 0.2)"
          >
            <HStack
              spacing={1}
              justify="center"
              fontSize="xs"
              color={timeInfo.color}
            >
              <Icon as={Clock} boxSize={3} />
              <Text>
                {timeInfo.label}: {timeInfo.timeText}
              </Text>
            </HStack>
          </Box>
        )}
      </Box>
    </MotionBox>
  )
})

TeamBattleItem.displayName = 'TeamBattleItem'

export default TeamBattleItem
