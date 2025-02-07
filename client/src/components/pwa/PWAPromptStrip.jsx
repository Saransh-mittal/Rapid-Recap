import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Button,
  Text,
  Flex,
  Icon,
  useDisclosure,
  Show,
  useToast,
} from '@chakra-ui/react'
import { X, Download, Info } from 'lucide-react'
import PWAInfoModal from './PWAInfoModal'
import { setPWAPromptDismissal } from '../../utils/pwaInstallStore'
import InstallStepsModal from './InstallStepsModal'

const PWAPromptStrip = ({ onClose }) => {
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const toast = useToast()
  const [showInstallSteps, setShowInstallSteps] = useState(false)

  useEffect(() => {
    // Check if running in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://')

    if (isStandalone) {
      onClose()
      setPWAPromptDismissal()
      return
    }
    const handleInstallPrompt = e => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const handleAppInstalled = () => {
      console.log('App installed')
      setDeferredPrompt(null)
      onClose()
      setPWAPromptDismissal()
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [onClose])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowInstallSteps(true)
      return
    }

    try {
      const { outcome } = await deferredPrompt.prompt()

      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        onClose()
      }
    } catch (error) {
      console.error('Installation error:', error)
      toast({
        title: 'Installation failed',
        description:
          'There was an error during installation. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleClose = () => {
    setPWAPromptDismissal()
    onClose()
  }

  // Mobile strip component
  const MobileStrip = () => (
    <Box py={2} px={3}>
      <Flex direction="column" gap={2}>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            <Icon as={Download} color="purple.200" boxSize={4} mr={2} />
            <Text color="white" fontSize="xs" fontWeight="medium">
              Install App for Better Experience
            </Text>
          </Flex>
          <Icon
            as={X}
            color="whiteAlpha.700"
            cursor="pointer"
            boxSize={4}
            _hover={{ color: 'white' }}
            onClick={handleClose}
          />
        </Flex>
        <Flex gap={2}>
          <Button
            size="xs"
            variant="ghost"
            colorScheme="purple"
            flex={1}
            leftIcon={<Info size={12} />}
            onClick={onOpen}
            fontSize="xs"
          >
            Learn More
          </Button>
          <Button
            size="xs"
            colorScheme="purple"
            flex={1}
            leftIcon={<Download size={12} />}
            onClick={handleInstall}
            fontSize="xs"
          >
            Install Now
          </Button>
        </Flex>
      </Flex>
    </Box>
  )

  // Desktop strip component
  const DesktopStrip = () => (
    <Flex
      py={2}
      px={4}
      alignItems="center"
      justifyContent="space-between"
      maxW="container.xl"
      mx="auto"
    >
      <Flex alignItems="center" flex={1}>
        <Icon as={Download} color="purple.200" mr={2} />
        <Text color="white" fontSize="sm" fontWeight="medium">
          Install Rapid Recap for a better experience
        </Text>
      </Flex>

      <Flex alignItems="center" gap={2}>
        <Button
          size="sm"
          variant="ghost"
          colorScheme="purple"
          leftIcon={<Info size={16} />}
          onClick={onOpen}
        >
          Learn More
        </Button>

        <Button
          size="sm"
          colorScheme="purple"
          leftIcon={<Download size={16} />}
          onClick={handleInstall}
        >
          Install Now
        </Button>

        <Icon
          as={X}
          color="whiteAlpha.700"
          cursor="pointer"
          _hover={{ color: 'white' }}
          onClick={handleClose}
        />
      </Flex>
    </Flex>
  )

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
        transition={{ duration: 0.3 }}
        style={{
          zIndex: 1001,
        }}
      >
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bg="purple.900"
          zIndex={1001}
          boxShadow="lg"
          borderBottom="2px solid"
          borderColor="purple.500"
        >
          <Show below="md">
            <MobileStrip />
          </Show>
          <Show above="md">
            <DesktopStrip />
          </Show>
        </Box>

        <PWAInfoModal
          isOpen={isOpen}
          onClose={onModalClose}
          onInstall={handleInstall}
        />
        <InstallStepsModal
          isOpen={showInstallSteps}
          onClose={() => setShowInstallSteps(false)}
        />
      </motion.div>
    </AnimatePresence>
  )
}

export default PWAPromptStrip
