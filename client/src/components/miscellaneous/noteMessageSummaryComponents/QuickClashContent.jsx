import React from 'react'
import {
  Box,
  Text,
  HStack,
  VStack,
  Icon,
  Badge,
  Flex,
  Avatar,
} from '@chakra-ui/react'
import {
  Swords,
  Shield,
  Target,
  Trophy,
  User,
  X,
  CheckCircle,
  Brain,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Component for displaying QuickClash notification content in the summary view
 */
const QuickClashContent = ({ message }) => {
  const { t } = useTranslation('QuickClash')
  const { eventType, data } = message

  // Get event configuration based on type
  const getEventConfig = () => {
    switch (eventType) {
      case 'newChallenge':
        return {
          icon: Target,
          color: 'blue.400',
          badgeColor: 'blue',
          title: t('New Challenge!'),
          badgeText: t('New'),
        }
      case 'challengeAccepted':
        return {
          icon: CheckCircle,
          color: 'green.400',
          badgeColor: 'green',
          title: t('Challenge Accepted!'),
          badgeText: t('Accepted'),
        }
      case 'challengeRejected':
        return {
          icon: X,
          color: 'red.400',
          badgeColor: 'red',
          title: t('Challenge Rejected'),
          badgeText: t('Rejected'),
        }
      case 'challengeCompleted':
        return {
          icon: Trophy,
          color: 'orange.400',
          badgeColor: 'orange',
          title: t('Challenge Completed'),
          badgeText: t('Completed'),
        }
      case 'challengeCompletedByBothPlayers':
        return {
          icon: Trophy,
          color: 'orange.400',
          badgeColor: 'orange',
          title: t('Challenge Completed'),
          badgeText: t('Completed'),
        }
      case 'analysisReady':
        return {
          icon: Brain,
          color: 'purple.400',
          badgeColor: 'purple',
          title: t('Analysis Ready'),
          badgeText: t('Analysis'),
        }
      default:
        return {
          icon: Swords,
          color: 'purple.400',
          badgeColor: 'purple',
          title: t('Quick Clash'),
          badgeText: t('Quick Clash'),
        }
    }
  }

  const config = getEventConfig()

  // Render event-specific content
  const renderEventContent = () => {
    if (!data) return null

    switch (eventType) {
      case 'newChallenge':
        return (
          <VStack align="start" spacing={1}>
            <Flex align="center" gap={2}>
              <Avatar
                size="xs"
                name={data.challenger?.inGameName || data.challenger?.name}
                src={data.challenger?.pic}
              />
              <Text fontWeight="medium" fontSize="sm">
                {data.challenger?.inGameName ||
                  data.challenger?.name ||
                  t('Someone')}
              </Text>
            </Flex>
            <Text fontSize="xs" color="whiteAlpha.800">
              {t('challengeYouTo')}{' '}
              {data.challenge?.category && (
                <Badge size="sm" colorScheme="purple" ml={1}>
                  {data.challenge.category}
                </Badge>
              )}
            </Text>
          </VStack>
        )
      case 'challengeAccepted':
        return (
          <VStack align="start" spacing={1}>
            <Flex align="center" gap={2}>
              <Avatar
                size="xs"
                name={data.opponent?.inGameName || data.opponent?.name}
                src={data.opponent?.pic}
              />
              <Text fontWeight="medium" fontSize="sm">
                {data.opponent?.inGameName ||
                  data.opponent?.name ||
                  t('Opponent')}
              </Text>
            </Flex>
            <Text fontSize="xs" color="whiteAlpha.800">
              {t('acceptedYourChallenge')}{' '}
              {data.category && (
                <Badge size="sm" colorScheme="purple" ml={1}>
                  {data.category}
                </Badge>
              )}
            </Text>
          </VStack>
        )
      case 'challengeRejected':
        return (
          <VStack align="start" spacing={1}>
            <Flex align="center" gap={2}>
              <Avatar
                size="xs"
                name={data.opponent?.inGameName || data.opponent?.name}
                src={data.opponent?.pic}
              />
              <Text fontWeight="medium" fontSize="sm">
                {data.opponent?.inGameName ||
                  data.opponent?.name ||
                  t('Opponent')}
              </Text>
            </Flex>
            <Text fontSize="xs" color="whiteAlpha.800">
              {t('declinedYourChallenge')}{' '}
              {data.category && (
                <Badge size="sm" colorScheme="purple" ml={1}>
                  {data.category}
                </Badge>
              )}
            </Text>
          </VStack>
        )
      case 'challengeCompleted':
        return (
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" fontWeight="medium">
              {t('yourTurn')}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.800">
              {t('opponentCompletedChallenge')}
            </Text>
          </VStack>
        )
      case 'challengeCompletedByBothPlayers':
        return (
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" fontWeight="medium">
              {t('viewResults')}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.800">
              {t('opponentCompletedChallenge')}
            </Text>
          </VStack>
        )
      case 'analysisReady':
        return (
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" fontWeight="medium">
              {t('aiInsightsReady')}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.800">
              {t('checkYourPerformance')}
            </Text>
          </VStack>
        )
      default:
        return <Text fontSize="sm">{t('quickClashUpdate')}</Text>
    }
  }

  return (
    <Box>
      <HStack mb={2} spacing={2} align="center">
        <Icon as={config.icon} boxSize={5} color={config.color} />
        <Text fontWeight="bold" fontSize="sm">
          {config.title}
        </Text>
        <Badge colorScheme={config.badgeColor} size="sm" ml="auto">
          {config.badgeText}
        </Badge>
      </HStack>

      {renderEventContent()}
    </Box>
  )
}

export default QuickClashContent
