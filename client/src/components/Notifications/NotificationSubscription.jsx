// src/components/NotificationSubscription.js
import React from 'react'
import { Button, ChakraProvider, Spinner, Text, VStack } from '@chakra-ui/react'
import useNotification from '../../customHooks/useNotification'

const NotificationSubscription = () => {
  const { supported, isSubscribed, loading, error, handleEnableNotifications } =
    useNotification()

  return (
    <ChakraProvider>
      <VStack spacing={3}>
        {loading && <Spinner />}
        {supported ? (
          <>
            <Text mt={24}>
              Notifications are{' '}
              {isSubscribed ? ' Subscribed ' : 'Not Subscribed'}.
            </Text>

            <Button
              onClick={handleEnableNotifications}
              isLoading={loading}
              loadingText="Enabling..."
              colorScheme="blue"
              mt={24}
            >
              Enable Notifications
            </Button>
          </>
        ) : (
          <Text>Your browser does not support notifications.</Text>
        )}
        {error && <Text color="red.500">{error}</Text>}
      </VStack>
    </ChakraProvider>
  )
}

export default NotificationSubscription
