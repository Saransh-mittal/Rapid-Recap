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

const PWAPromptStrip = ({ onClose }) => {
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const toast = useToast()

  useEffect(() => {
    const handleInstallPrompt = e => {
      console.log('beforeinstallprompt event fired', new Date().toISOString())
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    // Add user interaction listener to help trigger install prompt
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
    }
  }, [])

  useEffect(() => {
    const handleInstallPrompt = e => {
      console.log('beforeinstallprompt fired')
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Store the event for later use
      setDeferredPrompt(e)
      setIsInstallable(true)
      console.log('beforeinstallprompt captured:', e)
    }

    // Check if the app is already installed
    const handleAppInstalled = () => {
      setIsInstallable(false)
      setDeferredPrompt(null)
      console.log('App installed')
      onClose()
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false)
      console.log('Running in standalone mode')
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [onClose])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log('No installation prompt available')
      toast({
        title: 'Installation not available',
        description:
          'Please try using a supported browser or check if the app is already installed.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    try {
      console.log('Triggering install prompt...')
      // Show the install prompt
      deferredPrompt.prompt()

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      console.log('Installation outcome:', outcome)

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setDeferredPrompt(null)
        setIsInstallable(false)
        onClose()
      } else {
        console.log('User declined the install prompt')
        toast({
          title: 'Installation declined',
          description:
            'You can install the app later from the prompt or browser menu.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
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

  // Mobile version of the strip
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
            onClick={onClose}
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

  // Desktop version of the strip
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
          onClick={onClose}
        />
      </Flex>
    </Flex>
  )

  if (!isInstallable) return null

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
      </motion.div>
    </AnimatePresence>
  )
}

export default PWAPromptStrip
