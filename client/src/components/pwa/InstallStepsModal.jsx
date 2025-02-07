// src/components/pwa/InstallStepsModal.jsx

import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Box,
  OrderedList,
  ListItem,
  Button,
  useBreakpointValue,
} from '@chakra-ui/react'
import {
  detectEnvironment,
  getInstallSteps,
} from '../../utils/browserDetection'

const InstallStepsModal = ({ isOpen, onClose }) => {
  const { os, browser } = detectEnvironment()
  const steps = getInstallSteps()
  const modalSize = useBreakpointValue({ base: 'full', md: 'lg' })

  const getBrowserName = () => {
    const browserNames = {
      chrome: 'Chrome',
      safari: 'Safari',
      firefox: 'Firefox',
      edge: 'Edge',
      samsung: 'Samsung Browser',
      other: 'your browser',
    }
    return browserNames[browser] || 'your browser'
  }

  const getOSName = () => {
    const osNames = {
      ios: 'iOS',
      android: 'Android',
      windows: 'Windows',
      macos: 'macOS',
      other: 'your device',
    }
    return osNames[os] || 'your device'
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize} isCentered>
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent bg="gray.900" color="white">
        <ModalHeader borderBottom="1px solid" borderColor="whiteAlpha.200">
          Install Rapid Recap on {getOSName()}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            <Text>
              Follow these steps to install Rapid Recap using {getBrowserName()}
              :
            </Text>

            <Box bg="whiteAlpha.100" p={4} borderRadius="md">
              <OrderedList spacing={3}>
                {steps.map((step, index) => (
                  <ListItem key={index}>{step}</ListItem>
                ))}
              </OrderedList>
            </Box>

            {(browser === 'other' || steps.length <= 2) && (
              <Box bg="purple.900" p={4} borderRadius="md">
                <Text fontWeight="bold" mb={2}>
                  Recommended Browsers:
                </Text>
                {os === 'ios' ? (
                  <Text>
                    For iOS devices, please use Safari to install Rapid Recap.
                  </Text>
                ) : os === 'android' ? (
                  <Text>
                    For Android devices, please use Chrome or Samsung Browser to
                    install Rapid Recap.
                  </Text>
                ) : (
                  <Text>
                    Please use Chrome, Edge, or Safari to install Rapid Recap on
                    your device.
                  </Text>
                )}
              </Box>
            )}

            <Button colorScheme="purple" onClick={onClose}>
              Got it
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default InstallStepsModal
