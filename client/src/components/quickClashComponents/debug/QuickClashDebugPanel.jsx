// components/quickClashComponents/debug/QuickClashDebugPanel.jsx
import React, { useState } from 'react'
import {
  Box,
  Button,
  HStack,
  VStack,
  IconButton,
  Badge,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Switch,
  FormControl,
  FormLabel,
  Text,
  Divider,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bug, Settings, Eye, EyeOff } from 'lucide-react'
import SoloQuickClashDebugger from './SoloQuickClashDebugger'
import GlobalMatchmakingDebugger from './GlobalMatchmakingDebugger'

const MotionBox = motion(Box)

/**
 * Combined debug panel for Quick Clash development
 * Provides easy access to both Solo and Global Matchmaking debuggers
 */
const QuickClashDebugPanel = ({
  isEnabled = process.env.NODE_ENV === 'development',
  defaultPosition = 'floating', // 'floating' or 'drawer'
}) => {
  const [showSolo, setShowSolo] = useState(true)
  const [showGlobal, setShowGlobal] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState(defaultPosition)

  const { isOpen, onOpen, onClose } = useDisclosure()

  // Don't render in production unless explicitly enabled
  if (!isEnabled) return null

  const renderFloatingMode = () => (
    <>
      {/* Toggle Button */}
      <MotionBox
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex={10000}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          colorScheme={isVisible ? 'red' : 'purple'}
          size="lg"
          borderRadius="full"
          leftIcon={<Bug size={20} />}
          onClick={() => setIsVisible(!isVisible)}
          boxShadow="0 4px 20px rgba(138, 43, 226, 0.4)"
          _hover={{
            boxShadow: '0 6px 25px rgba(138, 43, 226, 0.6)',
          }}
        >
          {isVisible ? 'Hide Debug' : 'Show Debug'}
        </Button>
      </MotionBox>

      {/* Debug Controls */}
      <AnimatePresence>
        {isVisible && (
          <MotionBox
            position="fixed"
            bottom="90px"
            right="20px"
            zIndex={9998}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <VStack
              bg="rgba(26, 21, 39, 0.95)"
              p={4}
              borderRadius="xl"
              borderWidth="1px"
              borderColor="purple.500"
              spacing={3}
              minW="200px"
              boxShadow="0 4px 20px rgba(138, 43, 226, 0.3)"
            >
              <Text color="white" fontWeight="bold" fontSize="sm">
                Quick Clash Debug
              </Text>

              <Divider />

              <FormControl display="flex" alignItems="center">
                <FormLabel
                  htmlFor="solo-debug"
                  mb="0"
                  fontSize="sm"
                  color="white"
                >
                  Solo Debugger
                </FormLabel>
                <Switch
                  id="solo-debug"
                  isChecked={showSolo}
                  onChange={e => setShowSolo(e.target.checked)}
                  colorScheme="purple"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel
                  htmlFor="global-debug"
                  mb="0"
                  fontSize="sm"
                  color="white"
                >
                  Global Debugger
                </FormLabel>
                <Switch
                  id="global-debug"
                  isChecked={showGlobal}
                  onChange={e => setShowGlobal(e.target.checked)}
                  colorScheme="blue"
                />
              </FormControl>

              <Divider />

              <Button
                size="sm"
                colorScheme="teal"
                onClick={() => setPosition('drawer')}
                leftIcon={<Settings size={16} />}
                w="full"
              >
                Switch to Drawer
              </Button>
            </VStack>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Debuggers */}
      <SoloQuickClashDebugger isOpen={isVisible && showSolo} />
      <GlobalMatchmakingDebugger isOpen={isVisible && showGlobal} />
    </>
  )

  const renderDrawerMode = () => (
    <>
      {/* Toggle Button */}
      <MotionBox
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex={10000}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          colorScheme="purple"
          size="lg"
          borderRadius="full"
          leftIcon={<Bug size={20} />}
          onClick={onOpen}
          boxShadow="0 4px 20px rgba(138, 43, 226, 0.4)"
          _hover={{
            boxShadow: '0 6px 25px rgba(138, 43, 226, 0.6)',
          }}
        >
          Debug Panel
        </Button>
      </MotionBox>

      {/* Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
        <DrawerOverlay />
        <DrawerContent bg="gray.900" color="white">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor="gray.700">
            <HStack>
              <Bug size={24} />
              <Text>Quick Clash Debug Panel</Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody p={0}>
            <VStack h="full" spacing={0}>
              {/* Controls */}
              <Box
                w="full"
                p={4}
                bg="gray.800"
                borderBottomWidth="1px"
                borderColor="gray.700"
              >
                <VStack spacing={3}>
                  <HStack w="full" justify="space-between">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel
                        htmlFor="solo-debug-drawer"
                        mb="0"
                        fontSize="sm"
                      >
                        Solo Debugger
                      </FormLabel>
                      <Switch
                        id="solo-debug-drawer"
                        isChecked={showSolo}
                        onChange={e => setShowSolo(e.target.checked)}
                        colorScheme="purple"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel
                        htmlFor="global-debug-drawer"
                        mb="0"
                        fontSize="sm"
                      >
                        Global Debugger
                      </FormLabel>
                      <Switch
                        id="global-debug-drawer"
                        isChecked={showGlobal}
                        onChange={e => setShowGlobal(e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>
                  </HStack>

                  <Button
                    size="sm"
                    colorScheme="teal"
                    onClick={() => {
                      setPosition('floating')
                      onClose()
                    }}
                    leftIcon={<Eye size={16} />}
                  >
                    Switch to Floating Mode
                  </Button>
                </VStack>
              </Box>

              {/* Debug Content */}
              <Box flex={1} w="full" overflow="auto" position="relative">
                {showSolo && (
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    w="50%"
                    h="full"
                    borderRightWidth="1px"
                    borderColor="gray.700"
                  >
                    <SoloQuickClashDebugger isOpen={true} />
                  </Box>
                )}

                {showGlobal && (
                  <Box
                    position="absolute"
                    top={0}
                    right={0}
                    w={showSolo ? '50%' : '100%'}
                    h="full"
                  >
                    <GlobalMatchmakingDebugger isOpen={true} />
                  </Box>
                )}

                {!showSolo && !showGlobal && (
                  <VStack justify="center" align="center" h="full" spacing={4}>
                    <Bug size={48} color="gray" />
                    <Text color="gray.400">
                      Enable a debugger to start monitoring
                    </Text>
                  </VStack>
                )}
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )

  return position === 'floating' ? renderFloatingMode() : renderDrawerMode()
}

export default QuickClashDebugPanel
