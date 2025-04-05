// components/quickClashComponents/team/TeamBattleHeader.jsx
import React from 'react'
import {
  HStack,
  Button,
  Heading,
  Icon,
  Flex,
  Badge,
  Text,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Users, ArrowLeft, Clock } from 'lucide-react'

const MotionFlex = motion(Flex)

/**
 * Header component for the Team Battle page
 */
const TeamBattleHeader = ({
  battle,
  battleStatus,
  userTeam,
  onGoBack,
  variants,
}) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionFlex
      variants={variants}
      justify="space-between"
      align="center"
      mb={6}
    >
      <HStack spacing={3}>
        <Button
          leftIcon={<ArrowLeft size={18} />}
          variant="ghost"
          colorScheme="purple"
          onClick={onGoBack}
          _hover={{ bg: 'rgba(128, 90, 213, 0.2)' }}
        >
          {t('Back')}
        </Button>

        <Heading size="md" color="white">
          <HStack>
            <Icon as={Users} boxSize={6} color="purple.400" />
            <Text>{t('4v4 Team Battle')}</Text>
          </HStack>
        </Heading>

        <Badge
          colorScheme={battleStatus.statusColor}
          variant="solid"
          p={2}
          borderRadius="md"
        >
          {battleStatus.status === 'completed'
            ? battle.winner === userTeam
              ? t('Victory')
              : battle.winner === 'tie'
              ? t('Tie')
              : t('Defeat')
            : t(
                battleStatus.status.charAt(0).toUpperCase() +
                  battleStatus.status.slice(1),
              )}
        </Badge>
      </HStack>

      {/* Time info */}
      {battle.expiresAt && (
        <HStack spacing={1} color="whiteAlpha.700">
          <Icon as={Clock} boxSize={4} />
          <Text fontSize="sm">
            {new Date(battle.expiresAt) > new Date()
              ? t('Expires {{time}}', {
                  time: format(new Date(battle.expiresAt), 'MMM dd, HH:mm'),
                })
              : t('Expired {{time}}', {
                  time: format(new Date(battle.expiresAt), 'MMM dd, HH:mm'),
                })}
          </Text>
        </HStack>
      )}
    </MotionFlex>
  )
}

export default TeamBattleHeader
