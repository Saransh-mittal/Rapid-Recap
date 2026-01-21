import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Button,
  Text,
  Flex,
  useDisclosure,
  Icon,
  Box,
  CloseButton,
  Heading,
  Collapse,
  VStack,
  Divider,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react'
import { BellIcon, InfoIcon } from '@chakra-ui/icons'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

/**
 * A notification reminder modal that appears when notifications are blocked
 * Shows different instructions for PWA vs browser environments
 */
const NotificationReminderModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation('Settings')
  const { isAuthenticated } = useSelector(state => state.auth)
  const [showInstructions, setShowInstructions] = useState(true)

  // Detect if the app is running as a PWA
  const isPWA = () => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://')
    )
  }

  // Check if notifications are blocked
  useEffect(() => {
    if (!isAuthenticated) return

    // Only show reminder if notifications are explicitly blocked
    const checkIfBlocked = () => {
      // NEW USER SUPPRESSION:
      // 1. Check query param (immediate first load)
      // 2. Check session storage (after URL cleanup)
      const searchParams = new URLSearchParams(window.location.search)
      if (searchParams.get('newUser') === 'true' || sessionStorage.getItem('isNewUserSession') === 'true') {
         return
      }

      if (
        typeof Notification !== 'undefined' &&
        Notification.permission === 'denied'
      ) {
        const lastReminder = localStorage.getItem('notificationReminderTime')
        const now = Date.now()

        // Show reminder once per hour
        if (!lastReminder || now - parseInt(lastReminder) > 60 * 60 * 1000) {
          onOpen()
          localStorage.setItem('notificationReminderTime', now.toString())
        }
      }
    }

    // Check initially after a delay (allows login processes to complete)
    const initialTimer = setTimeout(checkIfBlocked, 3000)

    // Check again whenever the tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkIfBlocked()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearTimeout(initialTimer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, onOpen])

  // Get platform-specific instructions
  const getInstructions = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    const isAndroid = /android/i.test(userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream
    const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)
    const isRunningAsPWA = isPWA()

    if (isRunningAsPWA) {
      if (isAndroid) {
        return [
          'Open your device Settings',
          'Go to Apps or Applications',
          'Find and tap on Rapid Recap',
          'Select Notifications',
          'Toggle to allow notifications',
        ]
      } else if (isIOS) {
        return [
          'Open your device Settings',
          'Scroll down and find Rapid Recap',
          'Tap on Notifications',
          'Toggle to allow notifications',
        ]
      } else {
        return [
          'Open your device Settings',
          'Find the Applications or Apps section',
          'Locate Rapid Recap',
          'Enable notifications in app settings',
        ]
      }
    } else {
      if (isAndroid) {
        return [
          'Tap the ⋮ (three dots) in Chrome',
          'Go to Settings > Site settings',
          'Tap Notifications',
          'Find this site and allow notifications',
          'Also check: Settings > Apps > Chrome > Notifications',
        ]
      } else if (isIOS) {
        return [
          'Open Settings app',
          'Scroll down to Safari',
          'Tap Notifications',
          'Toggle to allow notifications for this site',
        ]
      } else if (isMac) {
        return [
          'Click the lock/site info icon in address bar',
          "Select 'Site Settings'",
          "Find Notifications and select 'Allow'",
          'Also check: System Preferences > Notifications',
        ]
      } else {
        return [
          'Click the lock/site info icon in address bar',
          "Select 'Site Settings' or 'Permissions'",
          "Find Notifications and change to 'Allow'",
        ]
      }
    }
  }

  // No need to show if not authenticated
  if (!isAuthenticated) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xs"
      motionPreset="slideInBottom"
      isCentered
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent
        bg="rgba(30, 26, 42, 0.95)"
        borderRadius="xl"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        border="1px solid rgba(255, 255, 255, 0.18)"
        position="relative"
        maxW="90vw"
        width="330px"
      >
        <CloseButton
          position="absolute"
          top="8px"
          right="8px"
          color="gray.400"
          onClick={onClose}
          zIndex="1"
        />

        <ModalBody p={4}>
          <Flex direction="column" gap={3}>
            <Flex align="center" mb={1}>
              <Icon as={BellIcon} boxSize={5} color="teal.300" mr={2} />
              <Heading size="sm" color="white">
                {t('blockedTitle')}
              </Heading>
            </Flex>

            <Text color="gray.300" fontSize="sm">
              {t('description')}
            </Text>

            <Button
              size="sm"
              variant="outline"
              colorScheme="teal"
              leftIcon={<InfoIcon />}
              onClick={() => setShowInstructions(!showInstructions)}
              mb={1}
            >
              {showInstructions
                ? t('buttons.hideInstructions')
                : t('buttons.showInstructions')}
            </Button>

            <Collapse in={showInstructions} animateOpacity>
              <Box
                p={4}
                bg="whiteAlpha.100"
                borderRadius="md"
                fontSize="sm"
                color="gray.200"
                mb={2}
              >
                {isPWA() && (
                  <Text fontWeight="medium" mb={3} color="teal.300">
                    You're using the installed app version. App notification
                    permissions are managed through your device settings.
                  </Text>
                )}

                <UnorderedList spacing={2} pl={2}>
                  {getInstructions().map((step, index) => (
                    <ListItem key={index}>
                      <Text>{step}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              </Box>
            </Collapse>

            <Flex justify="flex-end" mt={2}>
              <Button size="sm" colorScheme="teal" onClick={onClose}>
                {t('buttons.gotIt')}
              </Button>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default NotificationReminderModal
