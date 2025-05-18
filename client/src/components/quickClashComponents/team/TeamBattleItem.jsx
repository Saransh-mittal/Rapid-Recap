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
  Tooltip,
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
  Users,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

/**
 * Enhanced visual representation of a 4v4 team battle
 */
const TeamBattleItem = memo(({ battle, index, onEnter, onViewAnalysis }) => {
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)
  const avatarSize = useBreakpointValue({
    base: '2xs',
    sm: '2xs',
    md: 'xs',
    lg: 'sm',
  })
  const fontSize = useBreakpointValue({
    base: '2xs',
    sm: '2xs',
    md: 'xs',
    lg: 'sm',
  })
  const scoreFontSize = useBreakpointValue({
    base: 'lg',
    sm: 'lg',
    md: 'xl',
    lg: '2xl',
  })
  const padding = useBreakpointValue({ base: 2, sm: 2, md: 3, lg: 4 })

  // Determine if the current user is in team A or B
  const userTeam = useMemo(() => {
    if (!battle || !user) return null

    const isInTeamA = battle.teamAMembers?.some(
      member => member.user._id === user._id,
    )

    const isInTeamB = battle.teamBMembers?.some(
      member => member.user._id === user._id,
    )

    return isInTeamA ? 'teamA' : isInTeamB ? 'teamB' : null
  }, [battle, user])

  // Get battle outcome details
  const battleOutcome = useMemo(() => {
    if (!battle) return { label: 'UNKNOWN', color: 'gray', icon: Swords }

    if (battle.status === 'completed') {
      if (battle.winner === 'tie') {
        return { label: 'TIE!', color: 'yellow', icon: Shield }
      } else if (battle.winner === userTeam) {
        return { label: 'VICTORY!', color: 'green', icon: Trophy }
      } else {
        return { label: 'DEFEAT!', color: 'red', icon: Swords }
      }
    } else if (battle.status === 'active') {
      return { label: 'ACTIVE', color: 'blue', icon: Users }
    } else {
      return { label: 'EXPIRED', color: 'gray', icon: Clock }
    }
  }, [battle, userTeam])

  // Get category styles

  // Calculate battle completion
  const completionPercentage = useMemo(() => {
    if (!battle?.challenges) return 0

    const totalChallenges = battle.challenges.length
    if (totalChallenges === 0) return 0

    const completedChallenges = battle.challenges.filter(
      challenge => challenge.teamACompleted && challenge.teamBCompleted,
    ).length

    return Math.round((completedChallenges / totalChallenges) * 100)
  }, [battle])

  // Get time info
  const getTimeInfo = () => {
    if (!battle?.expiresAt) return { label: '', timeText: '' }

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

  if (!battle) return null

  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      width="100%"
      maxWidth="100%"
      minWidth="0"
      borderRadius="xl"
      overflow="hidden"
      borderWidth="1px"
      borderColor={
        battleOutcome.color === 'green'
          ? 'green.500'
          : battleOutcome.color === 'red'
          ? 'red.500'
          : battleOutcome.color === 'yellow'
          ? 'yellow.500'
          : 'whiteAlpha.200'
      }
      bg="rgba(26, 21, 39, 0.8)"
      backdropFilter="blur(10px)"
      position="relative"
      height={'300px'}
      whileHover={{
        y: -4,
        boxShadow:
          '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
      }}
      // transition={{ duration: 0.2 }}
    >
      {/* Battle header with status */}
      <Box bg={`${battleOutcome.color}.600`} px={padding} py={2}>
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <Icon as={battleOutcome.icon} color="white" boxSize={4} />
            <Text color="white" fontWeight="bold" fontSize={fontSize}>
              {battleOutcome.label}
            </Text>
          </HStack>
          {/* <Badge
            bg={'purple.500'}
            color="white"
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="full"
            textTransform="uppercase"
          >
            {'MIXED'}
          </Badge> */}
        </Flex>
      </Box>

      {/* Battle progress bar */}
      <Box px={padding} pt={3}>
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontSize="xs" color="whiteAlpha.700">
            {t('Battle Progress')}
          </Text>
          <Text fontSize="xs" color="whiteAlpha.700">
            {completionPercentage}%
          </Text>
        </Flex>
        <Progress
          value={completionPercentage}
          size="sm"
          colorScheme={battleOutcome.color}
          borderRadius="full"
        />
      </Box>

      {/* Team A vs Team B Section */}
      <Flex px={padding} py={3} justify="space-between" align="center" flex="1">
        {/* Team A */}
        <VStack spacing={2} align="center" flex="1" minWidth="0">
          <Text
            fontSize={fontSize}
            fontWeight="bold"
            color="white"
            noOfLines={1}
            maxWidth="100%"
            textAlign="center"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {battle.teamA?.name || t('Team A')}
          </Text>
          <AvatarGroup
            size={avatarSize}
            max={4}
            spacing={{
              base: '0.1rem',
              sm: '0.1rem',
              md: '0.2rem',
              lg: '0.3rem',
            }}
            flexWrap="wrap"
            justifyContent="center"
          >
            {battle.teamAMembers?.map(member => (
              <Tooltip
                key={member.user._id}
                label={member.user.name || member.user.inGameName}
                placement="top"
              >
                <Avatar
                  name={member.user.name || member.user.inGameName}
                  src={member.user.pic}
                  borderWidth={member.user._id === user?._id ? '2px' : '1px'}
                  borderColor={
                    member.user._id === user?._id
                      ? 'purple.500'
                      : 'whiteAlpha.300'
                  }
                />
              </Tooltip>
            ))}
          </AvatarGroup>
          <Text fontSize={scoreFontSize} fontWeight="black" color="blue.400">
            {battle.teamAWins || 0}
          </Text>
        </VStack>

        {/* VS with action buttons */}
        <VStack
          spacing={2}
          px={{ base: 1, sm: 1, md: 2, lg: 4 }}
          flex="0 0 auto"
          minWidth="0"
        >
          <Text
            fontSize={{ base: 'sm', sm: 'sm', md: 'md', lg: 'lg' }}
            fontWeight="bold"
            color="whiteAlpha.700"
          >
            VS
          </Text>
          <VStack spacing={2}>
            {battle.status === 'completed' && (
              <MotionButton
                size={{ base: '2xs', sm: '2xs', md: 'xs', lg: 'sm' }}
                colorScheme="purple"
                leftIcon={<Icon as={BarChart2} size={10} />}
                onClick={() => onViewAnalysis?.(battle._id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                fontSize={{ base: '2xs', sm: 'xs', md: 'xs', lg: 'sm' }}
                px={{ base: 1, sm: 2, md: 3, lg: 4 }}
                minWidth="0"
                flexShrink={1}
              >
                {t('Analysis')}
              </MotionButton>
            )}
            <MotionButton
              size={{ base: 'xs', lg: 'sm' }}
              colorScheme={battle.status === 'active' ? 'green' : 'gray'}
              rightIcon={<Icon as={ArrowRight} size={10} />}
              onClick={() => onEnter?.(battle._id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              fontSize={{ base: '2xs', sm: 'xs', md: 'xs', lg: 'sm' }}
              px={{ base: 1, sm: 2, md: 3, lg: 4 }}
              isDisabled={battle.status !== 'active'}
              minWidth="0"
              flexShrink={1}
            >
              {battle.status === 'active' ? t('Enter') : t('View')}
            </MotionButton>
          </VStack>
        </VStack>

        {/* Team B */}
        <VStack spacing={2} align="center" flex="1" minWidth="0">
          <Text
            fontSize={fontSize}
            fontWeight="bold"
            color="white"
            noOfLines={1}
            maxWidth="100%"
            textAlign="center"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {battle.teamB?.name || t('Team B')}
          </Text>
          <AvatarGroup
            size={avatarSize}
            max={4}
            spacing={{
              base: '0.1rem',
              sm: '0.1rem',
              md: '0.2rem',
              lg: '0.3rem',
            }}
            flexWrap="wrap"
            justifyContent="center"
          >
            {battle.teamBMembers?.map(member => (
              <Tooltip
                key={member.user._id}
                label={member.user.name || member.user.inGameName}
                placement="top"
              >
                <Avatar
                  name={member.user.name || member.user.inGameName}
                  src={member.user.pic}
                  borderWidth={member.user._id === user?._id ? '2px' : '1px'}
                  borderColor={
                    member.user._id === user?._id
                      ? 'purple.500'
                      : 'whiteAlpha.300'
                  }
                />
              </Tooltip>
            ))}
          </AvatarGroup>
          <Text fontSize={scoreFontSize} fontWeight="black" color="red.400">
            {battle.teamBWins || 0}
          </Text>
        </VStack>
      </Flex>

      {/* Footer with time info */}
      {timeInfo.timeText && (
        <Box px={padding} pb={3}>
          <HStack spacing={1} color={timeInfo.color} fontSize="xs">
            <Icon as={Clock} boxSize={3} />
            <Text>
              {timeInfo.label}: {timeInfo.timeText}
            </Text>
          </HStack>
        </Box>
      )}

      {/* Special hover effect */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0}
        transition="opacity 0.3s ease"
        bg="linear-gradient(135deg, rgba(128, 90, 213, 0.1) 0%, rgba(128, 90, 213, 0) 100%)"
        _hover={{ opacity: 1 }}
        zIndex={1}
        pointerEvents="none"
      />
    </MotionBox>
  )
})

TeamBattleItem.displayName = 'TeamBattleItem'

export default TeamBattleItem
