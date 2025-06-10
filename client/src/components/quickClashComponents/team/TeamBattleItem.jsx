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
  ArrowRight,
  Target,
  Zap,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const MotionBox = motion(Box)

/**
 * Simple and minimalistic TeamBattleItem with high design standards
 * For completed battles, it now only displays "Ended".
 */
const TeamBattleItem = memo(({ battle, index, onEnter, onViewAnalysis }) => {
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)

  // Responsive values
  const avatarSize = useBreakpointValue({ base: 'sm', md: 'md', lg: 'md' })
  const fontSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const padding = useBreakpointValue({ base: 3, md: 4 })
  const buttonSize = useBreakpointValue({ base: 'xs', md: 'sm' })
  const avatarMax = useBreakpointValue({ base: 2, md: 1, lg: 4 })

  // Memoized calculations with final time logic
  const { battleOutcome, completionPercentage, timeInfo, leftTeam, rightTeam } =
    useMemo(() => {
      if (!battle || !user) {
        return {
          battleOutcome: { label: 'ACTIVE', color: 'green', icon: Zap },
          completionPercentage: 0,
          timeInfo: { label: '', timeText: null },
          leftTeam: null,
          rightTeam: null,
        }
      }

      // User team calculation
      const isInTeamA = battle.teamAMembers?.some(
        member => member.user._id === user._id,
      )
      const userTeam = isInTeamA ? 'teamA' : 'teamB'

      // Team arrangement
      const teams = {
        teamA: {
          data: battle.teamA,
          members: battle.teamAMembers,
          wins: battle.teamAWins,
          type: 'teamA',
        },
        teamB: {
          data: battle.teamB,
          members: battle.teamBMembers,
          wins: battle.teamBWins,
          type: 'teamB',
        },
      }
      const leftTeam = teams[userTeam]
      const rightTeam = teams[userTeam === 'teamA' ? 'teamB' : 'teamA']

      // Battle outcome
      let battleOutcome
      if (battle.status === 'completed') {
        if (battle.winner === 'tie') {
          battleOutcome = { label: 'DRAW', color: 'yellow', icon: Shield }
        } else if (battle.winner === userTeam) {
          battleOutcome = { label: 'VICTORY', color: 'purple', icon: Trophy }
        } else {
          battleOutcome = { label: 'DEFEAT', color: 'red', icon: Swords }
        }
      } else {
        battleOutcome = { label: 'ACTIVE', color: 'green', icon: Zap }
      }

      // Completion percentage
      const totalChallenges = battle.challenges?.length || 0
      const completedChallenges =
        battle.challenges?.filter(
          challenge => challenge.teamACompleted && challenge.teamBCompleted,
        ).length || 0
      const completionPercentage =
        totalChallenges > 0
          ? Math.round((completedChallenges / totalChallenges) * 100)
          : 0

      // *** UPDATED TIME INFO LOGIC ***
      let timeInfo = { label: '', timeText: null, color: 'gray.500' }
      const isBattleOver = battle.status !== 'active'

      if (isBattleOver) {
        // If the battle is over, just show the "Ended" label.
        timeInfo = {
          label: t('Ended'),
          timeText: null, // Set timeText to null so it's not displayed
          color: 'gray.500',
        }
      } else if (battle.expiresAt) {
        // If the battle is still active, show the expiry time.
        timeInfo = {
          label: t('Expires'),
          timeText: formatDistanceToNow(new Date(battle.expiresAt), {
            addSuffix: true,
          }),
          color: 'blue.400',
        }
      }

      return {
        battleOutcome,
        completionPercentage,
        timeInfo,
        leftTeam,
        rightTeam,
      }
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

  if (!battle || !leftTeam || !rightTeam) return null

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
            {t(battleOutcome.label)}
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
          {/* Left Team (User's team) */}
          <VStack spacing={2} align="center" flex="1" minWidth="0">
            <Text
              fontSize={fontSize}
              fontWeight="bold"
              color="white"
              noOfLines={1}
              textAlign="center"
              maxWidth="100%"
            >
              {leftTeam.data?.name ||
                `Team ${leftTeam.type === 'teamA' ? 'A' : 'B'}`}
            </Text>
            <AvatarGroup
              size={avatarSize}
              max={avatarMax}
              spacing="-1"
              css={{
                '& > .chakra-avatar__excess': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: '2px',
                  color: 'white',
                  fontSize: 'xs',
                  fontWeight: 'bold',
                },
              }}
            >
              {leftTeam.members?.map(member => (
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
              {leftTeam.wins || 0}
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
                  colorScheme="teal"
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
              {battle.status === 'active' && (
                <Button
                  size={buttonSize}
                  colorScheme="green"
                  rightIcon={<ArrowRight size={12} />}
                  onClick={e => {
                    e.stopPropagation()
                    onEnter?.(battle._id)
                  }}
                  fontSize="xs"
                  minWidth="80px"
                  borderRadius="md"
                >
                  {t('Enter')}
                </Button>
              )}
            </VStack>
          </VStack>

          {/* Right Team (Opponent team) */}
          <VStack spacing={2} align="center" flex="1" minWidth="0">
            <Text
              fontSize={fontSize}
              fontWeight="bold"
              color="white"
              noOfLines={1}
              textAlign="center"
              maxWidth="100%"
            >
              {rightTeam.data?.name ||
                `Team ${rightTeam.type === 'teamA' ? 'A' : 'B'}`}
            </Text>
            <AvatarGroup
              size={avatarSize}
              max={avatarMax}
              spacing="-1"
              css={{
                '& > .chakra-avatar__excess': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: '2px',
                  color: 'white',
                  fontSize: 'xs',
                  fontWeight: 'bold',
                },
              }}
            >
              {rightTeam.members?.map(member => (
                <Avatar
                  key={member.user._id}
                  name={member.user.name || member.user.inGameName}
                  src={member.user.pic}
                  borderWidth="2px"
                  borderColor="red.400"
                />
              ))}
            </AvatarGroup>
            <Text
              fontSize="xl"
              fontWeight="black"
              color="red.400"
              lineHeight="1"
            >
              {rightTeam.wins || 0}
            </Text>
          </VStack>
        </Flex>

        {/* Footer - Time Info */}
        {timeInfo.label && (
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
              {/* *** UPDATED TEXT RENDERING LOGIC *** */}
              <Text>
                {timeInfo.timeText
                  ? `${timeInfo.label}: ${timeInfo.timeText}`
                  : timeInfo.label}
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
