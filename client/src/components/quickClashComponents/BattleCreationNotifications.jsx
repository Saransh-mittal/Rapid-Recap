// components/quickClashComponents/BattleCreationNotifications.jsx
import React, { useEffect } from 'react'
import { notificationManager } from '../../utils/notifications'
import { useTranslation } from 'react-i18next'
import { useSocket } from '../../customHooks/useSocket'

/**
 * Component to handle battle creation failure notifications
 * Only shows toast when all retries fail and matchmaking is cleaned up
 */
const BattleCreationNotifications = () => {
  const { getSocket } = useSocket()
  const { t } = useTranslation('QuickClash')

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    // Handle cleanup after all retries fail
    socket.on('quickClash:battleCreationCleanedUp', data => {
      notificationManager.error(
        t('Battle Creation Failed'),
        data.message || t('All retry attempts failed. Please join matchmaking again.'),
        { duration: 8000 }
      )
    })

    return () => {
      socket.off('quickClash:battleCreationCleanedUp')
    }
  }, [getSocket, t])

  // This component doesn't render anything visible
  return null
}

export default BattleCreationNotifications
