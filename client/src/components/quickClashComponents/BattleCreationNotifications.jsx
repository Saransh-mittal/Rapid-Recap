// components/quickClashComponents/BattleCreationNotifications.jsx
import React, { useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useSocket } from '../../customHooks/useSocket'

/**
 * Component to handle battle creation failure notifications
 * Only shows toast when all retries fail and matchmaking is cleaned up
 */
const BattleCreationNotifications = () => {
  const { getSocket } = useSocket()
  const toast = useToast()
  const { t } = useTranslation('QuickClash')

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    // Handle cleanup after all retries fail
    socket.on('quickClash:battleCreationCleanedUp', data => {
      toast({
        title: t('Battle Creation Failed'),
        description:
          data.message ||
          t('All retry attempts failed. Please join matchmaking again.'),
        status: 'error',
        duration: 8000,
        isClosable: true,
      })
    })

    return () => {
      socket.off('quickClash:battleCreationCleanedUp')
    }
  }, [getSocket, toast, t])

  // This component doesn't render anything visible
  return null
}

export default BattleCreationNotifications
