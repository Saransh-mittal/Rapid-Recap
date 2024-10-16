// File: src/components/Settings/NotificationSettings.js
import React from 'react'
import { VStack } from '@chakra-ui/react'
import NotificationSubscription from './NotificationSubscription'

const NotificationSettings = () => {
  return (
    <VStack align="stretch" spacing={4}>
      <NotificationSubscription />
    </VStack>
  )
}

export default NotificationSettings
