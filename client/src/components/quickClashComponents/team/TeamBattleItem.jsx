// components/quickClashComponents/team/TeamBattleItem.jsx
import React, { useMemo } from 'react'
import {
  Box,
  HStack,
  VStack,
  Text,
  Button,
  Badge,
  Icon,
  Flex,
  Avatar,
  AvatarGroup,
  Progress,
  Tooltip,
  Divider,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Users,
  Trophy,
  ChevronUp,
  ChevronDown,
  Target,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

/**
 * Component to display a team battle item in the 4v4 tab
 */
const TeamBattleItem = ({ battle, index, onEnter }) => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)

  // Determine if the current user is in team A or B
  const userTeam = useMemo(() => {
    if (!battle || !user) return null

    const isInTeamA = battle.teamAMembers.some(
      member => member.user._id === user._id,
    )

    const isInTeamB = battle.teamBMembers.some(
      member => member.user._id === user._id,
    )

    return isInTeamA ? 'teamA' : isInTeamB ? 'teamB' : null
  }, [battle, user])

  // Get user's record in this battle
  const userRecord = useMemo(() => {
    if (!battle || !userTeam || !user) return null

    const teamMembers =
      userTeam === 'teamA' ? battle.teamAMembers : battle.teamBMembers
    return teamMembers.find(member => member.user._id === user._id)
  }, [battle, userTeam, user])

  // Calculate battle completion percentage
  const completionPercentage = useMemo(() => {
    if (!battle) return 0

    const totalChallenges = battle.challenges.length
    if (totalChallenges === 0) return 0

    const completedChallenges = battle.challenges.filter(
      challenge => challenge.teamACompleted && challenge.teamBCompleted,
    ).length

    return Math.round((completedChallenges / totalChallenges) * 100)
  }, [battle])

  // Calculate uncompleted categories for the user's team
  const uncompletedCategories = useMemo(() => {
    if (!battle || !userTeam) return []

    const teamField = userTeam === 'teamA' ? 'teamACompleted' : 'teamBCompleted'

    return battle.challenges
      .filter(challenge => !challenge[teamField])
      .map(challenge => challenge.category)
  }, [battle, userTeam])

  // Get battle status with more detail
  const battleStatus = useMemo(() => {
    if (!battle) return { status: 'unknown', color: 'gray' }

    if (battle.status === 'completed') {
      if (battle.winner === userTeam) {
        return { status: 'victory', color: 'green' }
      } else if (battle.winner === 'tie') {
        return { status: 'tie', color: 'yellow' }
      } else {
        return { status: 'defeat', color: 'red' }
      }
    } else if (battle.status === 'active') {
      if (uncompletedCategories.length > 0) {
        return { status: 'inProgress', color: 'blue' }
      } else {
        return { status: 'waitingForOpponent', color: 'orange' }
      }
    } else if (battle.status === 'expired') {
      return { status: 'expired', color: 'gray' }
    }

    return { status: battle.status, color: 'gray' }
  }, [battle, userTeam, uncompletedCategories])

  // Get teams
  const teamA = battle?.teamA || {}
  const teamB = battle?.teamB || {}

  // Get trophy display info
  const trophyInfo = useMemo(() => {
    if (!battle || !userRecord) return null

    const change = userRecord.trophyChange || 0

    if (change > 0) {
      return {
        value: `+${change}`,
        color: 'green.400',
        icon: ChevronUp,
      }
    } else if (change < 0) {
      return {
        value: change,
        color: 'red.400',
        icon: ChevronDown,
      }
    } else {
      return {
        value: '±0',
        color: 'gray.400',
        icon: null,
      }
    }
  }, [battle, userRecord])

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    }),
    hover: {
      y: -5,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
      transition: { duration: 0.3 },
    },
  }

  // If no battle data, don't render
  if (!battle) return null

  // Format time remaining/ago
  const getTimeInfo = () => {
    const now = new Date()
    const expiresAt = new Date(battle.expiresAt)
    const isExpired = now > expiresAt

    if (isExpired) {
      return {
        label: t('Ended'),
        timeText: formatDistanceToNow(expiresAt, { addSuffix: true }),
        color: 'gray.500',
      }
    } else {
      return {
        label: t('Expires'),
        timeText: formatDistanceToNow(expiresAt, { addSuffix: true }),
        color: 'blue.400',
      }
    }
  }

  const timeInfo = getTimeInfo()

  // Get battle status indicator
  const getStatusIndicator = () => {
    switch (battleStatus.status) {
      case 'victory':
        return (
          <Badge
            colorScheme="green"
            p={2}
            borderRadius="md"
            display="flex"
            alignItems="center"
          >
            <Icon as={Trophy} mr={1} boxSize={4} />
            {t('Victory')}
          </Badge>
        )
      case 'defeat':
        return (
          <Badge
            colorScheme="red"
            p={2}
            borderRadius="md"
            display="flex"
            alignItems="center"
          >
            <Icon as={XCircle} mr={1} boxSize={4} />
            {t('Defeat')}
          </Badge>
        )
      case 'tie':
        return (
          <Badge
            colorScheme="yellow"
            p={2}
            borderRadius="md"
            display="flex"
            alignItems="center"
          >
            <Icon as={AlertTriangle} mr={1} boxSize={4} />
            {t('Tie')}
          </Badge>
        )
      case 'inProgress':
        return (
          <Badge
            colorScheme="blue"
            p={2}
            borderRadius="md"
            display="flex"
            alignItems="center"
          >
            <Icon as={Target} mr={1} boxSize={4} />
            {uncompletedCategories.length > 0
              ? `${t('Your Turn')} (${uncompletedCategories.length})`
              : t('In Progress')}
          </Badge>
        )
      case 'waitingForOpponent':
        return (
          <Badge
            colorScheme="orange"
            p={2}
            borderRadius="md"
            display="flex"
            alignItems="center"
          >
            <Icon as={Clock} mr={1} boxSize={4} />
            {t('Waiting for Opponent')}
          </Badge>
        )
      case 'expired':
        return (
          <Badge
            colorScheme="gray"
            p={2}
            borderRadius="md"
            display="flex"
            alignItems="center"
          >
            <Icon as={Clock} mr={1} boxSize={4} />
            {t('Expired')}
          </Badge>
        )
      default:
        return (
          <Badge colorScheme="gray" p={2} borderRadius="md">
            {battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
          </Badge>
        )
    }
  }

  // Handle clicking Enter button
  const handleEnterBattle = () => {
    if (onEnter) {
      onEnter(battle._id)
    } else {
      navigate(`/quickclash/teamBattle/${battle._id}`)
    }
  }

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      custom={index}
      variants={itemVariants}
      whileHover="hover"
      bg="rgba(26, 32, 44, 0.8)"
      borderRadius="lg"
      borderWidth="1px"
      borderColor={`${battleStatus.color}.500`}
      overflow="hidden"
      transition="all 0.3s ease"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
      position="relative"
    >
      {/* Team Battle Header */}
      <Flex
        bg={`rgba(${
          battleStatus.color === 'green'
            ? '56, 161, 105'
            : battleStatus.color === 'red'
            ? '245, 101, 101'
            : battleStatus.color === 'yellow'
            ? '236, 201, 75'
            : battleStatus.color === 'blue'
            ? '66, 153, 225'
            : battleStatus.color === 'orange'
            ? '237, 137, 54'
            : '113, 128, 150'
        }, 0.2)`}
        p={4}
        justify="space-between"
        align="center"
        borderBottom="1px solid"
        borderColor={`${battleStatus.color}.400`}
      >
        <HStack spacing={3}>
          <Icon as={Users} color={`${battleStatus.color}.400`} boxSize={5} />
          <Text fontWeight="bold" fontSize="lg" color="white">
            {t('4v4 Team Battle')}
          </Text>
          {getStatusIndicator()}
        </HStack>

        {/* Trophy change */}
        {trophyInfo && battle.status === 'completed' && (
          <HStack
            spacing={1}
            bg="rgba(0, 0, 0, 0.2)"
            px={3}
            py={1}
            borderRadius="full"
          >
            <Icon as={Trophy} color="yellow.400" boxSize={4} />
            <HStack spacing={1}>
              <Text color={trophyInfo.color} fontWeight="bold">
                {trophyInfo.value}
              </Text>
              {trophyInfo.icon && (
                <Icon
                  as={trophyInfo.icon}
                  color={trophyInfo.color}
                  boxSize={3}
                />
              )}
            </HStack>
          </HStack>
        )}
      </Flex>

      {/* Battle Progress */}
      <Box px={4} pt={3}>
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontSize="sm" color="whiteAlpha.700">
            {t('Battle Progress')}
          </Text>
          <Text fontSize="sm" color="whiteAlpha.700">
            {completionPercentage}%
          </Text>
        </Flex>
        <Progress
          value={completionPercentage}
          size="sm"
          colorScheme={battleStatus.color}
          borderRadius="full"
          mb={3}
        />
      </Box>

      {/* Teams Section */}
      <Flex direction={{ base: 'column', md: 'row' }} p={4} gap={4}>
        {/* Team A */}
        <Box
          flex="1"
          borderWidth="1px"
          borderColor={userTeam === 'teamA' ? 'purple.500' : 'whiteAlpha.200'}
          borderRadius="md"
          p={3}
          bg={userTeam === 'teamA' ? 'rgba(128, 90, 213, 0.1)' : 'transparent'}
        >
          <Flex justify="space-between" align="center" mb={2}>
            <HStack>
              <Text fontWeight="bold" color="white">
                {teamA.name || t('Team A')}
              </Text>
              {userTeam === 'teamA' && (
                <Badge colorScheme="purple" fontSize="xs">
                  {t('Your Team')}
                </Badge>
              )}
            </HStack>
            <Text fontSize="sm" color="whiteAlpha.700">
              {battle.teamAWins || 0} {t('wins')}
            </Text>
          </Flex>

          <AvatarGroup size="sm" max={4} mb={2}>
            {battle.teamAMembers?.map(member => (
              <Tooltip
                key={member.user._id}
                label={member.user.name || member.user.inGameName}
              >
                <Avatar
                  name={member.user.name || member.user.inGameName}
                  src={member.user.pic}
                  borderWidth={member.user._id === user._id ? 2 : 0}
                  borderColor="purple.500"
                />
              </Tooltip>
            ))}
          </AvatarGroup>
        </Box>

        {/* VS */}
        <Flex
          align="center"
          justify="center"
          alignSelf="center"
          fontWeight="bold"
          color="whiteAlpha.700"
        >
          {t('VS')}
        </Flex>

        {/* Team B */}
        <Box
          flex="1"
          borderWidth="1px"
          borderColor={userTeam === 'teamB' ? 'purple.500' : 'whiteAlpha.200'}
          borderRadius="md"
          p={3}
          bg={userTeam === 'teamB' ? 'rgba(128, 90, 213, 0.1)' : 'transparent'}
        >
          <Flex justify="space-between" align="center" mb={2}>
            <HStack>
              <Text fontWeight="bold" color="white">
                {teamB.name || t('Team B')}
              </Text>
              {userTeam === 'teamB' && (
                <Badge colorScheme="purple" fontSize="xs">
                  {t('Your Team')}
                </Badge>
              )}
            </HStack>
            <Text fontSize="sm" color="whiteAlpha.700">
              {battle.teamBWins || 0} {t('wins')}
            </Text>
          </Flex>

          <AvatarGroup size="sm" max={4} mb={2}>
            {battle.teamBMembers?.map(member => (
              <Tooltip
                key={member.user._id}
                label={member.user.name || member.user.inGameName}
              >
                <Avatar
                  name={member.user.name || member.user.inGameName}
                  src={member.user.pic}
                  borderWidth={member.user._id === user._id ? 2 : 0}
                  borderColor="purple.500"
                />
              </Tooltip>
            ))}
          </AvatarGroup>
        </Box>
      </Flex>

      {/* Categories and Actions */}
      <Box p={4} borderTop="1px solid" borderColor="whiteAlpha.100">
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap={3}
        >
          {/* Categories */}
          <HStack spacing={2} flexWrap="wrap">
            {battle.categories?.map(category => (
              <Badge
                key={category}
                colorScheme={
                  uncompletedCategories.includes(category) ? 'green' : 'gray'
                }
                variant={
                  uncompletedCategories.includes(category) ? 'solid' : 'subtle'
                }
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="full"
              >
                {category}
              </Badge>
            ))}
          </HStack>

          {/* Time and Action Button */}
          <HStack spacing={4}>
            <Tooltip label={`${timeInfo.label}: ${timeInfo.timeText}`}>
              <HStack spacing={1} color={timeInfo.color} fontSize="sm">
                <Icon as={Clock} boxSize={4} />
                <Text>{timeInfo.timeText}</Text>
              </HStack>
            </Tooltip>

            <MotionButton
              leftIcon={<ArrowRight size={16} />}
              colorScheme={battle.status === 'active' ? 'purple' : 'gray'}
              size="sm"
              onClick={handleEnterBattle}
              isDisabled={battle.status !== 'active'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('Enter')}
            </MotionButton>
          </HStack>
        </Flex>
      </Box>
    </MotionBox>
  )
}

export default TeamBattleItem
