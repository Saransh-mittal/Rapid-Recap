// components/connection/ConnectionStatusIndicator.jsx
import React, { useEffect, useState, useRef } from 'react'
import {
  Box,
  Flex,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  HStack,
  IconButton,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiWifiOff, FiRefreshCw, FiX, FiAlertTriangle } from 'react-icons/fi'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import socketManager from '../../services/socketInitManager'

const ConnectionStatusIndicator = () => {
  const { t } = useTranslation('Connection')

  // Redux state
  const { user, isAuthenticated } = useSelector(state => state.auth)

  // Local state
  const [isConnected, setIsConnected] = useState(socketManager.isConnected())
  const [showAlert, setShowAlert] = useState(false)
  const [connectionLost, setConnectionLost] = useState(false)

  // Refs to track connection history
  const hasBeenConnectedRef = useRef(false)
  const connectionEstablishedRef = useRef(false)
  const appStartTimeRef = useRef(Date.now())
  const alertTimerRef = useRef(null)
  const graceTimerRef = useRef(null)

  // Constants
  const STARTUP_GRACE_PERIOD = 10000 // 10 seconds grace period on startup
  const CONNECTION_LOST_DELAY = 5000 // 5 seconds before showing connection lost alert

  // Set up socket connection listener
  useEffect(() => {
    const removeConnectionListener = socketManager.addConnectionListener(
      connected => {
        setIsConnected(connected)

        if (connected) {
          // Connection established/restored
          hasBeenConnectedRef.current = true
          connectionEstablishedRef.current = true

          // Clear any pending timers
          if (alertTimerRef.current) {
            clearTimeout(alertTimerRef.current)
            alertTimerRef.current = null
          }

          if (connectionLost) {
            // Connection was lost and now restored
            setConnectionLost(false)
            setShowAlert(false)
          }
        } else if (hasBeenConnectedRef.current && isAuthenticated) {
          // Connection lost (only if we were previously connected)
          setConnectionLost(true)

          // Show alert after delay
          alertTimerRef.current = setTimeout(() => {
            if (!socketManager.isConnected()) {
              setShowAlert(true)
            }
          }, CONNECTION_LOST_DELAY)
        }
      },
    )

    return () => {
      removeConnectionListener()
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current)
      }
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current)
      }
    }
  }, [connectionLost, isAuthenticated])

  // Handle startup grace period
  useEffect(() => {
    if (isAuthenticated) {
      // Set a grace period during app startup to avoid false connection alerts
      graceTimerRef.current = setTimeout(() => {
        // After grace period, if still not connected and we haven't been connected before,
        // check with socket manager's enhanced tracking
        const socketHasEverConnected = socketManager.hasEverConnected
          ? socketManager.hasEverConnected()
          : false
        const socketInitialAttempted =
          socketManager.isInitialConnectionAttempted
            ? socketManager.isInitialConnectionAttempted()
            : false

        if (
          !socketManager.isConnected() &&
          !hasBeenConnectedRef.current &&
          !socketHasEverConnected
        ) {
          console.log(
            '[ConnectionIndicator] Network issue detected during startup',
          )
          hasBeenConnectedRef.current = false
          setConnectionLost(true)
          setShowAlert(true)
        }
      }, STARTUP_GRACE_PERIOD)
    }

    return () => {
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current)
      }
    }
  }, [isAuthenticated])

  // Reset state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      hasBeenConnectedRef.current = false
      connectionEstablishedRef.current = false
      setConnectionLost(false)
      setShowAlert(false)

      // Clear timers
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current)
        alertTimerRef.current = null
      }
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current)
        graceTimerRef.current = null
      }
    }
  }, [isAuthenticated])

  // Handle refresh page
  const handleRefreshPage = () => {
    window.location.reload()
  }

  // Handle dismiss alert
  const handleDismiss = () => {
    setShowAlert(false)

    // Clear the alert timer if it's running
    if (alertTimerRef.current) {
      clearTimeout(alertTimerRef.current)
      alertTimerRef.current = null
    }
  }

  // Don't show if:
  // 1. User is not authenticated
  // 2. Alert is not supposed to be shown
  // 3. Connection is fine
  // 4. We're still in startup grace period and never been connected (either locally or via socket manager)
  const socketHasEverConnected = socketManager.hasEverConnected
    ? socketManager.hasEverConnected()
    : false
  const hasAnyConnectionHistory =
    hasBeenConnectedRef.current || socketHasEverConnected
  const isInStartupPeriod =
    Date.now() - appStartTimeRef.current <= STARTUP_GRACE_PERIOD

  const shouldShow =
    isAuthenticated &&
    showAlert &&
    !isConnected &&
    (hasAnyConnectionHistory || !isInStartupPeriod)

  if (!shouldShow) {
    return null
  }

  // Determine if this is initial connection failure or connection lost
  const isInitialConnectionFailure = !hasAnyConnectionHistory
  const alertTitle = isInitialConnectionFailure
    ? t('Unable to Connect')
    : t('Connection Lost')

  const alertDescription = isInitialConnectionFailure
    ? t(
        'Cannot establish connection to server. Please check your internet connection.',
      )
    : t(
        'Lost connection to server. Please check your internet connection and refresh the page.',
      )

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9998,
          maxWidth: '400px',
        }}
      >
        <Box
          bg="rgba(26, 32, 53, 0.95)"
          border="1px solid rgba(255, 255, 255, 0.1)"
          borderRadius="xl"
          boxShadow="0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)"
          backdropFilter="blur(20px)"
          p={4}
          color="white"
        >
          {/* Header */}
          <Flex align="center" justify="space-between" mb={3}>
            <HStack spacing={3}>
              <Box
                as={motion.div}
                animate={{
                  color: ['#F56565', '#ED8936', '#F56565'],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <FiWifiOff size="20px" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="semibold">
                  {alertTitle}
                </Text>
                <Text fontSize="xs" color="rgba(255, 255, 255, 0.7)">
                  {isInitialConnectionFailure
                    ? t('Network connection required')
                    : t('Please refresh to reconnect')}
                </Text>
              </VStack>
            </HStack>

            <IconButton
              icon={<FiX />}
              size="sm"
              variant="ghost"
              color="rgba(255, 255, 255, 0.7)"
              _hover={{
                color: 'white',
                bg: 'rgba(255, 255, 255, 0.1)',
              }}
              onClick={handleDismiss}
              aria-label="Dismiss"
            />
          </Flex>

          {/* Alert Message */}
          <Alert
            status="error"
            bg="rgba(245, 101, 101, 0.1)"
            border="1px solid rgba(245, 101, 101, 0.3)"
            borderRadius="md"
            mb={4}
          >
            <AlertIcon color="#F56565" />
            <Box>
              <AlertTitle fontSize="sm" color="white">
                {isInitialConnectionFailure
                  ? t('Network Connection Required')
                  : t('Network Connection Issue')}
              </AlertTitle>
              <AlertDescription fontSize="xs" color="rgba(255, 255, 255, 0.7)">
                {alertDescription}
              </AlertDescription>
            </Box>
          </Alert>

          {/* Action Buttons */}
          <VStack spacing={2}>
            <Button
              leftIcon={<FiRefreshCw />}
              colorScheme="blue"
              size="sm"
              width="full"
              onClick={handleRefreshPage}
              bg="rgba(66, 153, 225, 0.8)"
              _hover={{ bg: 'rgba(66, 153, 225, 1)' }}
            >
              {t('Refresh Page')}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              width="full"
              onClick={handleDismiss}
              color="rgba(255, 255, 255, 0.7)"
              _hover={{
                color: 'white',
                bg: 'rgba(255, 255, 255, 0.1)',
              }}
              fontSize="xs"
            >
              {t('Dismiss')}
            </Button>
          </VStack>

          {/* Connection Status Indicator */}
          <Flex
            align="center"
            justify="center"
            mt={3}
            pt={3}
            borderTop="1px solid rgba(255, 255, 255, 0.1)"
          >
            <HStack spacing={2}>
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg="#F56565"
                as={motion.div}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <Text fontSize="xs" color="rgba(255, 255, 255, 0.6)">
                {isInitialConnectionFailure ? t('Not Connected') : t('Offline')}
              </Text>
            </HStack>
          </Flex>
        </Box>
      </motion.div>
    </AnimatePresence>
  )
}

export default ConnectionStatusIndicator
