import React, { useCallback } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Icon,
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
} from 'lucide-react'
import NoteMessage from '../NoteMessage'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

/**
 * QuickClash notification component for in-app messages
 *
 * @param {Object} props
 * @param {string} props.messageId - Unique ID for the message
 * @param {string} props.eventType - Type of QuickClash event ('newChallenge', 'challengeAccepted', etc.)
 * @param {Object} props.data - Event data (challenger, opponent, challenge info, etc.)
 * @param {number} props.duration - How long to show the notification (null for indefinite)
 * @param {string} props.width - Width of the notification
 * @param {Function} props.onClose - Handler for closing the notification
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
  }, [eventType, t])

  const config = getEventConfig()

  // Determine actions based on event type
  const getActions = useCallback(() => {
    switch (eventType) {
      case 'newChallenge':
        return [
          { text: t('View'), actionType: 'NAVIGATE', path: '/quickclash' },
          { text: t('Dismiss'), actionType: 'DISMISS' },
        ]
      case 'challengeAccepted':
        return [
          { text: t('Play Now'), actionType: 'NAVIGATE', path: '/quickclash' },
          { text: t('Later'), actionType: 'DISMISS' },
        ]
      case 'challengeRejected':
        return [
          { text: t('View'), actionType: 'NAVIGATE', path: '/quickclash' },
          { text: t('Dismiss'), actionType: 'DISMISS' },
        ]
      case 'challengeCompleted':
        return [
          {
            text: t('Play Now'),
            actionType: 'NAVIGATE',
            path: '/quickclash',
          },
          { text: t('Later'), actionType: 'DISMISS' },
        ]
      case 'challengeCompletedByBothPlayers':
        return [
          {
            text: t('View Result'),
            actionType: 'NAVIGATE',
            path: '/quickclash',
          },
          { text: t('Later'), actionType: 'DISMISS' },
        ]
      case 'analysisReady':
        return [
          {
            text: t('View Analysis'),
            actionType: 'NAVIGATE',
            path: '/quickclash',
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
          <VStack align="start" spacing={2}>
            <HStack>
              <Icon as={User} color="blue.300" size={16} />
              <Text fontWeight="medium">
                {data.challenger?.inGameName ||
                  data.challenger?.name ||
                  t('Someone')}
              </Text>
            </HStack>
            <HStack>
              <Badge colorScheme="purple">
                {data.challenge?.category || t('Quick Clash')}
              </Badge>
            </HStack>
            <Text fontSize="sm">{t('challengeYouTo')}</Text>
          </VStack>
        )
      case 'challengeAccepted':
        return (
          <VStack align="start" spacing={2}>
            <HStack>
              <Icon as={User} color="green.300" size={16} />
              <Text fontWeight="medium">
                {data.opponent?.inGameName ||
                  data.opponent?.name ||
                  t('Opponent')}
              </Text>
            </HStack>
            <HStack>
              <Badge colorScheme="purple">
                {data.category || t('Quick Clash')}
              </Badge>
            </HStack>
            <Text fontSize="sm">{t('acceptedYourChallenge')}</Text>
          </VStack>
        )
      case 'challengeRejected':
        return (
          <VStack align="start" spacing={2}>
            <HStack>
              <Icon as={User} color="red.300" size={16} />
              <Text fontWeight="medium">
                {data.opponent?.inGameName ||
                  data.opponent?.name ||
                  t('Opponent')}
              </Text>
            </HStack>
            <HStack>
              <Badge colorScheme="purple">
                {data.category || t('Quick Clash')}
              </Badge>
            </HStack>
            <Text fontSize="sm">{t('declinedYourChallenge')}</Text>
          </VStack>
        )
      case 'challengeCompleted':
        return (
          <VStack align="start" spacing={2}>
            <Text fontSize="sm">{t('opponentCompletedChallenge')}</Text>
            <Text fontSize="sm" fontWeight="medium">
              {t('yourTurn')}
            </Text>
          </VStack>
        )
      case 'challengeCompletedByBothPlayers':
        return (
          <VStack align="start" spacing={2}>
            <Text fontSize="sm">{t('opponentCompletedChallenge')}</Text>
            <Text fontSize="sm" fontWeight="medium">
              {t('viewResult')}
            </Text>
          </VStack>
        )
      case 'analysisReady':
        return (
          <VStack align="start" spacing={2}>
            <Text fontSize="sm">{t('analysisPrepared')}</Text>
            <Text fontSize="sm" fontWeight="medium">
              {t('viewInsights')}
            </Text>
          </VStack>
        )
      default:
        return <Text fontSize="sm">{t('quickClashUpdate')}</Text>
    }
  }, [eventType, data, t])

  // Generate the notification content
  const content = (
    <HStack spacing={3} width="100%">
      <MotionBox
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Icon as={config.icon} boxSize={7} color={config.color} />
      </MotionBox>

      <VStack align="start" spacing={1} flex={1}>
        <HStack>
          <Badge colorScheme={config.badgeColor} variant="solid" fontSize="xs">
            {config.badgeText}
          </Badge>
        </HStack>
        {renderContent()}
      </VStack>
    </HStack>
  )

  return (
    <NoteMessage
      messageId={messageId}
      title={config.title}
      content={content}
      actions={getActions()}
      duration={duration}
      width={width}
      onClose={onClose}
    />
  )
}

export default QuickClashNoteMessage
