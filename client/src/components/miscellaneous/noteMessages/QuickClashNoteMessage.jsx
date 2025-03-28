// QuickClashNoteMessage.jsx
import React, { useCallback } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Icon,
  Flex,
  Avatar,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Swords,
  Shield,
  Target,
  Trophy,
  User,
  X,
  CheckCircle,
  Brain,
  Zap,
  Flame,
  Timer,
} from 'lucide-react'
import NoteMessage from '../NoteMessage'
import { useTranslation } from 'react-i18next'

// Motion components
const MotionBox = motion(Box)
const MotionBadge = motion(Badge)
const MotionFlex = motion(Flex)
const MotionText = motion(Text)
const MotionIcon = motion(Icon)

// Animation variants
const iconAnimation = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 15,
    },
  },
}

const pulseAnimation = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
}

/**
 * Enhanced QuickClash notification component for in-app messages
 */
const QuickClashNoteMessage = ({
  messageId,
  eventType,
  data,
  duration = 7000,
  width = '350px',
  onClose,
}) => {
  const { t } = useTranslation('QuickClash')

  // Determine icon and colors based on event type
  const getEventConfig = useCallback(() => {
    switch (eventType) {
      case 'newChallenge':
        return {
          icon: Target,
          color: 'blue.400',
          badgeColor: 'blue',
          title: t('New Challenge!'),
          badgeText: t('New'),
          bgGradient: 'linear(to-r, blue.600, blue.400)',
        }
      case 'challengeAccepted':
        return {
          icon: CheckCircle,
          color: 'green.400',
          badgeColor: 'green',
          title: t('Challenge Accepted!'),
          badgeText: t('Accepted'),
          bgGradient: 'linear(to-r, green.600, green.400)',
        }
      case 'challengeRejected':
        return {
          icon: X,
          color: 'red.400',
          badgeColor: 'red',
          title: t('Challenge Rejected'),
          badgeText: t('Rejected'),
          bgGradient: 'linear(to-r, red.600, red.400)',
        }
      case 'challengeCompleted':
        return {
          icon: Trophy,
          color: 'orange.400',
          badgeColor: 'orange',
          title: t('Challenge Completed'),
          badgeText: t('Completed'),
          bgGradient: 'linear(to-r, orange.600, orange.400)',
        }
      case 'challengeCompletedByBothPlayers':
        return {
          icon: Trophy,
          color: 'purple.400',
          badgeColor: 'purple',
          title: t('Challenge Completed'),
          badgeText: t('Results'),
          bgGradient: 'linear(to-r, purple.600, purple.400)',
        }
      case 'analysisReady':
        return {
          icon: Brain,
          color: 'cyan.400',
          badgeColor: 'cyan',
          title: t('Analysis Ready'),
          badgeText: t('Analysis'),
          bgGradient: 'linear(to-r, cyan.600, cyan.400)',
        }
      default:
        return {
          icon: Swords,
          color: 'purple.400',
          badgeColor: 'purple',
          title: t('Quick Clash'),
          badgeText: t('Quick Clash'),
          bgGradient: 'linear(to-r, purple.600, purple.400)',
        }
    }
  }, [eventType, t])

  const config = getEventConfig()

  // Determine actions based on event type
  const getActions = useCallback(() => {
    switch (eventType) {
      case 'newChallenge':
        return [
          {
            text: t('Accept Challenge'),
            actionType: 'NAVIGATE',
            path: '/quickclash',
            payload: { challengeId: data?.challenge?.id || data?.challengeId },
          },
          { text: t('Later'), actionType: 'DISMISS' },
        ]
      case 'challengeAccepted':
        return [
          {
            text: t('Play Now'),
            actionType: 'NAVIGATE',
            path: '/quickclash',
            payload: { challengeId: data?.challenge?.id || data?.challengeId },
          },
          { text: t('Later'), actionType: 'DISMISS' },
        ]
      case 'challengeRejected':
        return [
          {
            text: t('Find Players'),
            actionType: 'NAVIGATE',
            path: '/quickclash',
          },
          { text: t('Dismiss'), actionType: 'DISMISS' },
        ]
      case 'challengeCompleted':
        return [
          {
            text: t('Play Now'),
            actionType: 'NAVIGATE',
            path: '/quickclash',
            payload: { challengeId: data?.challenge?.id || data?.challengeId },
          },
          { text: t('Later'), actionType: 'DISMISS' },
        ]
      case 'challengeCompletedByBothPlayers':
        return [
          {
            text: t('View Results'),
            actionType: 'NAVIGATE',
            path: '/quickclash',
            payload: { challengeId: data?.challenge?.id || data?.challengeId },
          },
          { text: t('Later'), actionType: 'DISMISS' },
        ]
      case 'analysisReady':
        return [
          {
            text: t('View Analysis'),
            actionType: 'NAVIGATE',
            path: '/quickclash',
            payload: { analysisId: data?.analysisId },
          },
          { text: t('Later'), actionType: 'DISMISS' },
        ]
      default:
        return [
          { text: t('View'), actionType: 'NAVIGATE', path: '/quickclash' },
          { text: t('Dismiss'), actionType: 'DISMISS' },
        ]
    }
  }, [eventType, data, t])

  // Generate content based on event type and data
  const renderContent = useCallback(() => {
    if (!data) return null

    switch (eventType) {
      case 'newChallenge':
        return (
          <VStack align="start" spacing={3} w="100%">
            <Flex
              w="100%"
              p={3}
              borderRadius="md"
              bg="rgba(255,255,255,0.05)"
              alignItems="center"
              justifyContent="space-between"
            >
              <HStack>
                <Avatar
                  size="sm"
                  name={
                    data.challenger?.inGameName ||
                    data.challenger?.name ||
                    t('Unknown')
                  }
                  src={data.challenger?.pic}
                  bg="blue.500"
                />
                <Box>
                  <Text fontWeight="bold" fontSize="md" color="whiteAlpha.900">
                    {data.challenger?.inGameName ||
                      data.challenger?.name ||
                      t('Someone')}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.700">
                    {t('hasChallengedYou')}
                  </Text>
                </Box>
              </HStack>
              <MotionIcon
                as={Swords}
                color="blue.300"
                boxSize={5}
                animate={{
                  rotate: [0, 15, 0, -15, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
            </Flex>

            <Flex justifyContent="space-between" w="100%" alignItems="center">
              <Text fontSize="sm" fontWeight="medium" color="whiteAlpha.800">
                {t('category')}:
              </Text>
              <MotionBadge
                colorScheme="purple"
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
                {...pulseAnimation}
              >
                {data.challenge?.category || t('Quick Clash')}
              </MotionBadge>
            </Flex>

            {data.challenge?.timeLimit && (
              <Flex justifyContent="space-between" w="100%" alignItems="center">
                <HStack>
                  <Icon as={Timer} boxSize={4} color="blue.300" />
                  <Text fontSize="sm" color="whiteAlpha.800">
                    {t('timeLimit')}:
                  </Text>
                </HStack>
                <Text fontWeight="bold" color="yellow.300">
                  {data.challenge.timeLimit} {t('sec')}
                </Text>
              </Flex>
            )}

            {data.challenge?.description && (
              <Box w="100%" mt={1}>
                <Text fontSize="xs" color="whiteAlpha.700" fontStyle="italic">
                  "{data.challenge.description}"
                </Text>
              </Box>
            )}
          </VStack>
        )
      case 'challengeAccepted':
        return (
          <VStack align="start" spacing={3} w="100%">
            <Flex
              w="100%"
              p={3}
              borderRadius="md"
              bg="rgba(255,255,255,0.05)"
              alignItems="center"
              justifyContent="space-between"
            >
              <HStack>
                <Avatar
                  size="sm"
                  name={
                    data.opponent?.inGameName ||
                    data.opponent?.name ||
                    t('Unknown')
                  }
                  src={data.opponent?.pic}
                  bg="green.500"
                />
                <Box>
                  <Text fontWeight="bold" fontSize="md" color="whiteAlpha.900">
                    {data.opponent?.inGameName ||
                      data.opponent?.name ||
                      t('Opponent')}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.700">
                    {t('acceptedYourChallenge')}
                  </Text>
                </Box>
              </HStack>
              <MotionIcon
                as={CheckCircle}
                color="green.300"
                boxSize={5}
                {...pulseAnimation}
              />
            </Flex>

            <Flex justifyContent="space-between" w="100%" alignItems="center">
              <Text fontSize="sm" fontWeight="medium" color="whiteAlpha.800">
                {t('category')}:
              </Text>
              <Badge
                colorScheme="purple"
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
              >
                {data.category || t('Quick Clash')}
              </Badge>
            </Flex>

            <Flex
              w="100%"
              bg="rgba(72, 187, 120, 0.1)"
              borderRadius="md"
              p={2}
              align="center"
              justify="center"
            >
              <MotionText
                fontSize="sm"
                fontWeight="bold"
                color="green.300"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                {t('readyToPlay')}
              </MotionText>
            </Flex>
          </VStack>
        )
      case 'challengeRejected':
        return (
          <VStack align="start" spacing={3} w="100%">
            <Flex
              w="100%"
              p={3}
              borderRadius="md"
              bg="rgba(255,255,255,0.05)"
              alignItems="center"
              justifyContent="space-between"
            >
              <HStack>
                <Avatar
                  size="sm"
                  name={
                    data.opponent?.inGameName ||
                    data.opponent?.name ||
                    t('Unknown')
                  }
                  src={data.opponent?.pic}
                  bg="red.500"
                />
                <Box>
                  <Text fontWeight="bold" fontSize="md" color="whiteAlpha.900">
                    {data.opponent?.inGameName ||
                      data.opponent?.name ||
                      t('Opponent')}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.700">
                    {t('declinedYourChallenge')}
                  </Text>
                </Box>
              </HStack>
              <Icon as={X} color="red.300" boxSize={5} />
            </Flex>

            <Flex justifyContent="space-between" w="100%" alignItems="center">
              <Text fontSize="sm" fontWeight="medium" color="whiteAlpha.800">
                {t('category')}:
              </Text>
              <Badge
                colorScheme="purple"
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
              >
                {data.category || t('Quick Clash')}
              </Badge>
            </Flex>

            <Box w="100%">
              <Text fontSize="sm" color="whiteAlpha.700">
                {t('tryOtherPlayers')}
              </Text>
            </Box>
          </VStack>
        )
      case 'challengeCompleted':
        return (
          <VStack align="start" spacing={3} w="100%">
            <Flex
              w="100%"
              p={3}
              borderRadius="md"
              bg="rgba(255,255,255,0.05)"
              alignItems="center"
              justifyContent="space-between"
            >
              <HStack>
                <Avatar
                  size="sm"
                  name={
                    data.opponent?.inGameName ||
                    data.opponent?.name ||
                    t('Unknown')
                  }
                  src={data.opponent?.pic}
                  bg="orange.500"
                />
                <Box>
                  <Text fontWeight="bold" fontSize="md" color="whiteAlpha.900">
                    {data.opponent?.inGameName ||
                      data.opponent?.name ||
                      t('Opponent')}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.700">
                    {t('completedTheChallenge')}
                  </Text>
                </Box>
              </HStack>
              <MotionIcon
                as={Trophy}
                color="orange.300"
                boxSize={5}
                {...pulseAnimation}
              />
            </Flex>

            <Flex
              w="100%"
              bg="rgba(237, 137, 54, 0.1)"
              borderRadius="md"
              p={2}
              align="center"
              justify="center"
            >
              <HStack>
                <Icon as={Zap} color="yellow.400" />
                <MotionText
                  fontSize="md"
                  fontWeight="bold"
                  color="yellow.400"
                  textShadow="0 0 5px rgba(255, 218, 0, 0.5)"
                  {...pulseAnimation}
                >
                  {t('yourTurn')}
                </MotionText>
              </HStack>
            </Flex>
          </VStack>
        )
      case 'challengeCompletedByBothPlayers':
        return (
          <VStack align="start" spacing={3} w="100%">
            <Flex
              w="100%"
              p={3}
              borderRadius="md"
              bg="rgba(255,255,255,0.05)"
              direction="column"
              gap={2}
            >
              <Flex alignItems="center" justifyContent="space-between">
                <HStack>
                  <MotionIcon
                    as={Trophy}
                    color="purple.300"
                    boxSize={5}
                    {...pulseAnimation}
                  />
                  <Text fontWeight="bold" fontSize="md" color="whiteAlpha.900">
                    {t('challengeComplete')}
                  </Text>
                </HStack>
                <Badge colorScheme="purple">
                  {data.category || t('Quick Clash')}
                </Badge>
              </Flex>

              <Divider borderColor="whiteAlpha.200" />

              <HStack justify="space-between" w="100%">
                <Avatar
                  size="sm"
                  name={data.user?.inGameName || data.user?.name || t('You')}
                  src={data.user?.pic}
                />
                <Text fontWeight="bold" color="green.300">
                  {data.userScore || '?'} {t('pts')}
                </Text>
              </HStack>

              <HStack justify="space-between" w="100%">
                <Avatar
                  size="sm"
                  name={
                    data.opponent?.inGameName ||
                    data.opponent?.name ||
                    t('Opponent')
                  }
                  src={data.opponent?.pic}
                />
                <Text fontWeight="bold" color="red.300">
                  {data.opponentScore || '?'} {t('pts')}
                </Text>
              </HStack>
            </Flex>

            <Flex
              w="100%"
              bg="rgba(128, 90, 213, 0.1)"
              borderRadius="md"
              p={2}
              align="center"
              justify="center"
            >
              <MotionText
                fontSize="sm"
                fontWeight="bold"
                color="purple.300"
                {...pulseAnimation}
              >
                {t('resultsReady')}
              </MotionText>
            </Flex>
          </VStack>
        )
      case 'analysisReady':
        return (
          <VStack align="start" spacing={3} w="100%">
            <Flex
              w="100%"
              p={3}
              borderRadius="md"
              bg="rgba(255,255,255,0.05)"
              alignItems="center"
              justifyContent="space-between"
            >
              <HStack spacing={3}>
                <MotionBox
                  initial={{ scale: 0.9, opacity: 0.5 }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                >
                  <Icon as={Brain} color="cyan.300" boxSize={8} />
                </MotionBox>
                <Box>
                  <Text fontWeight="bold" fontSize="md" color="whiteAlpha.900">
                    {t('aiInsightsReady')}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.700">
                    {t('checkYourPerformance')}
                  </Text>
                </Box>
              </HStack>
            </Flex>

            <Flex justifyContent="space-between" w="100%" alignItems="center">
              <Text fontSize="sm" fontWeight="medium" color="whiteAlpha.800">
                {t('category')}:
              </Text>
              <Badge
                colorScheme="cyan"
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
              >
                {data.category || t('Quick Clash')}
              </Badge>
            </Flex>

            <Box w="100%">
              <Text fontSize="sm" color="whiteAlpha.700">
                {t('aiAnalysisDescription')}
              </Text>
            </Box>
          </VStack>
        )
      default:
        return (
          <Text fontSize="sm" color="whiteAlpha.800">
            {t('quickClashUpdate')}
          </Text>
        )
    }
  }, [eventType, data, t])

  const headerBadge = (
    <MotionBadge
      colorScheme={config.badgeColor}
      variant="solid"
      fontSize="xs"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          type: 'spring',
          stiffness: 200,
          damping: 15,
        },
      }}
    >
      {config.badgeText}
    </MotionBadge>
  )

  // Custom header component
  const customHeader = (
    <Flex
      align="center"
      justify="space-between"
      w="100%"
      bgGradient={config.bgGradient}
      px={4}
      py={2}
      borderTopLeftRadius="lg"
      borderTopRightRadius="lg"
      borderBottom="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
    >
      <HStack>
        <MotionIcon
          as={config.icon}
          color="white"
          boxSize={5}
          {...iconAnimation}
        />
        <Text fontWeight="bold" color="white" fontSize="sm">
          {config.title}
        </Text>
      </HStack>
      {headerBadge}
    </Flex>
  )

  return (
    <NoteMessage
      messageId={messageId}
      title={config.title}
      customContent={renderContent()}
      actions={getActions()}
      duration={duration}
      width={width}
      onClose={onClose}
      customHeader={customHeader}
    />
  )
}

export default QuickClashNoteMessage
