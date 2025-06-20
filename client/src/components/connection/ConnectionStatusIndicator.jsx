// components/connection/ConnectionStatusIndicator.jsx
import React, { useEffect, useState } from 'react'
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
import {
  FiWifi,
  FiWifiOff,
  FiRefreshCw,
  FiX,
  FiAlertTriangle,
} from 'react-icons/fi'
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

  // Set up socket connection listener
  useEffect(() => {
    const removeConnectionListener = socketManager.addConnectionListener(
      connected => {
        setIsConnected(connected)

        if (connected && connectionLost) {
          // Connection restored
          setConnectionLost(false)
          setShowAlert(false)
        } else if (!connected && isAuthenticated) {
          // Connection lost
          setConnectionLost(true)
          setShowAlert(true)
        }
      },
    )

    return () => {
      removeConnectionListener()
    }
  }, [t, connectionLost, isAuthenticated])

  // Auto-show alert when connection is lost
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      const timer = setTimeout(() => {
        setShowAlert(true)
        setConnectionLost(true)
      }, 3000) // Wait 3 seconds before showing alert

      return () => clearTimeout(timer)
    }
  }, [isConnected, isAuthenticated])

  // Handle refresh page
  const handleRefreshPage = () => {
    window.location.reload()
  }

  // Handle dismiss alert
  const handleDismiss = () => {
    setShowAlert(false)
  }

  // Don't show if user is not authenticated or connection is fine
  if (!isAuthenticated || !showAlert || isConnected) {
    return null
  }

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
                  {t('Connection Lost')}
                </Text>
                <Text fontSize="xs" color="rgba(255, 255, 255, 0.7)">
                  {t('Unable to connect to server')}
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
                {t('Network Connection Issue')}
              </AlertTitle>
              <AlertDescription fontSize="xs" color="rgba(255, 255, 255, 0.7)">
                {t(
                  'Please check your internet connection and refresh the page to reconnect.',
                )}
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
                {t('Offline')}
              </Text>
            </HStack>
          </Flex>
        </Box>
      </motion.div>
    </AnimatePresence>
  )
}

export default ConnectionStatusIndicator
