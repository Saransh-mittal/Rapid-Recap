// src/components/pwa/PWAInfoModal.jsx
import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Box,
  SimpleGrid,
  Icon,
  Flex,
} from '@chakra-ui/react'
import { Zap, Lock, Smartphone, Clock, Rocket } from 'lucide-react'

const Feature = ({ icon, title, description }) => (
  <Box p={4} borderRadius="lg" bg="whiteAlpha.50">
    <Flex direction="column" align="center" textAlign="center">
      <Icon as={icon} boxSize={8} mb={2} color="purple.300" />
      <Text fontWeight="bold" mb={2}>
        {title}
      </Text>
      <Text fontSize="sm" color="whiteAlpha.800">
        {description}
      </Text>
    </Flex>
  </Box>
)

const PWAInfoModal = ({ isOpen, onClose, onInstall }) => {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Access content instantly with app-like performance',
    },
    {
      icon: Lock,
      title: 'Secure',
      description: 'Safe and secure like any other installed app',
    },
    {
      icon: Smartphone,
      title: 'App-Like Experience',
      description: 'Feels like a native app with full-screen mode',
    },
    {
      icon: Clock,
      title: 'Latest Updates',
      description: 'Always get the latest features automatically',
    },
    {
      icon: Rocket,
      title: 'Space Efficient',
      description: 'Uses minimal storage space on your device',
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent bg="gray.900" color="white">
        <ModalHeader borderBottom="1px solid" borderColor="whiteAlpha.200">
          Why Install Rapid Recap?
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack spacing={6}>
            <Text>
              Transform your Rapid Recap experience by installing it as a
              Progressive Web App (PWA). Get the best of both worlds - the
              convenience of a website with the power of a native app.
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
              {features.map((feature, index) => (
                <Feature key={index} {...feature} />
              ))}
            </SimpleGrid>

            <Box mt={4} p={4} bg="purple.900" borderRadius="lg" width="100%">
              <Text fontWeight="bold" mb={2}>
                How to Install:
              </Text>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm">1. Click the "Install Now" button</Text>
                <Text fontSize="sm">
                  2. Follow your browser's installation prompt
                </Text>
                <Text fontSize="sm">
                  3. Start enjoying the enhanced experience!
                </Text>
              </VStack>
            </Box>

            <Button
              colorScheme="purple"
              size="lg"
              width="100%"
              onClick={() => {
                onInstall()
                onClose()
              }}
            >
              Install Now
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default PWAInfoModal
