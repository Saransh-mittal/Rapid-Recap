import React from 'react'
import { Flex, Badge, Icon, Text, Tooltip } from '@chakra-ui/react'
import { Clock, Zap, PlayCircle, Check, X, HourglassIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useTranslation } from 'react-i18next'

/**
 * Badge showing the status of a Quick Clash challenge
 */
const StatusBadge = ({ status, isChallenger, expiresAt }) => {
  const { t } = useTranslation('QuickClash')

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          color: 'yellow',
          text: isChallenger ? t('Awaiting') : t('New'),
          icon: <Clock size={14} />,
        }
      case 'active':
        return {
          color: 'green',
          text: t('Ready'),
          icon: <Zap size={14} />,
        }
      case 'in_progress':
        return {
          color: 'blue',
          text: t('Progress'),
          icon: <PlayCircle size={14} />,
        }
      case 'completed':
        return {
          color: 'purple',
          text: t('Done'),
          icon: <Check size={14} />,
        }
      case 'rejected':
        return {
          color: 'red',
          text: t('Rejected'),
          icon: <X size={14} />,
        }
      default:
        return {
          color: 'gray',
          text: status,
          icon: null,
        }
    }
  }

  const config = getStatusConfig()
  const isExpired = new Date(expiresAt) < new Date()

  // Don't show status badge for expired or completed challenges
  if ((isExpired && status !== 'rejected') || status === 'completed') {
    return null
  }

  return (
    <Flex w="100%" justify="space-between" align="center">
      <Badge
        colorScheme={config.color}
        display="flex"
        alignItems="center"
        gap={1}
        px={2}
        py={1}
        borderRadius="full"
        fontSize="xs"
        boxShadow={
          status === 'active' || status === 'pending'
            ? `0 0 10px var(--chakra-colors-${config.color}-500)`
            : 'none'
        }
      >
        {config.icon}
        {config.text}
      </Badge>

      {/* Show expiry time only for active and pending challenges */}
      {(status === 'active' || status === 'pending') && expiresAt && (
        <Tooltip label={t('Time left until expiry')}>
          <Badge
            colorScheme="gray"
            variant="subtle"
            fontSize="2xs"
            display="flex"
            alignItems="center"
            gap={1}
            borderRadius="full"
            px={2}
            ml="auto"
          >
            <Icon as={HourglassIcon} boxSize={3} />
            {formatDistanceToNow(new Date(expiresAt), { addSuffix: true })}
          </Badge>
        </Tooltip>
      )}
    </Flex>
  )
}

export default StatusBadge
