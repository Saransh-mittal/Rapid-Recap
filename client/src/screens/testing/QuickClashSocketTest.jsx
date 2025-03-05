// screens/testing/QuickClashSocketTest.jsx
import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Code,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  useClipboard,
  Switch,
  FormHelperText,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Socket } from 'socket.io-client'

// Import our custom socket hooks
import { useSocket } from '../../customHooks/useSocket'
import useQuickClashSocket from '../../customHooks/useQuickClashSocket'

// Animation components
const MotionBox = motion(Box)
const MotionHeading = motion(Heading)

/**
 * Test page for debugging Quick Clash socket functionality
 * Only available in development mode
 */
const QuickClashSocketTest = () => {
  const toast = useToast()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const { socket, socketConnected, getSocket } = useSocket()
  const {
    isListening: quickClashListening,
    lastEvent: lastQuickClashEvent,
    initializeQuickClashSocket,
  } = useQuickClashSocket()

  // Reference to log container for auto-scroll
  const logContainerRef = useRef(null)

  // Event logs state
  const [eventLogs, setEventLogs] = useState([])
  const [isAutoScroll, setIsAutoScroll] = useState(true)

  // Selected Test Event
  const [selectedEventType, setSelectedEventType] = useState('connection')
  const [testPayload, setTestPayload] = useState('')

  // Test data forms
  const [testUserId, setTestUserId] = useState('')
  const [testChallengeId, setTestChallengeId] = useState('')
  const [testCategory, setTestCategory] = useState('Current Affairs')
  const [testScore, setTestScore] = useState(120)

  // Local logs for connection events
  const [socketHistory, setSocketHistory] = useState([])

  // Function to format event for display
  const formatEvent = (type, data, status = 'info', timestamp = new Date()) => {
    return {
      type,
      data,
      status,
      timestamp,
    }
  }

  // Log socket connection status changes
  useEffect(() => {
    if (socket && !socketHistory.some(item => item.event === 'connected')) {
      // Initial connection status
      setSocketHistory(prev => [
        ...prev,
        {
          event: socketConnected ? 'connected' : 'disconnected',
          timestamp: new Date(),
        },
      ])
    }
  }, [socket, socketConnected, socketHistory])

  // Listen for Quick Clash events
  useEffect(() => {
    if (lastQuickClashEvent) {
      setEventLogs(prev => [
        formatEvent(
          `quickClash:${lastQuickClashEvent.type}`,
          lastQuickClashEvent.data,
          'success',
        ),
        ...prev,
      ])
    }
  }, [lastQuickClashEvent])

  // Auto-scroll log container when new events are added
  useEffect(() => {
    if (isAutoScroll && logContainerRef.current && eventLogs.length > 0) {
      logContainerRef.current.scrollTop = 0
    }
  }, [eventLogs, isAutoScroll])

  // Initialize socket connection
  const handleInitConnection = () => {
    const currentSocket = getSocket()

    if (currentSocket) {
      setSocketHistory(prev => [
        ...prev,
        { event: 'initialized', timestamp: new Date() },
      ])

      toast({
        title: 'Socket Initialized',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } else {
      toast({
        title: 'Socket Initialization Failed',
        description: 'Unable to get socket connection',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Initialize Quick Clash socket
  const handleInitQuickClashSocket = () => {
    initializeQuickClashSocket()

    toast({
      title: 'Quick Clash Socket Initialized',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    setEventLogs(prev => [
      formatEvent('quickClash:initialized', { status: 'Initialized' }, 'info'),
      ...prev,
    ])
  }

  // Send manual socket event for testing
  const handleSendEvent = () => {
    if (!socket || !socketConnected) {
      toast({
        title: 'Socket Not Connected',
        description: 'Please initialize the socket first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      let payload = {}

      // Try to parse JSON payload
      if (testPayload.trim()) {
        try {
          payload = JSON.parse(testPayload)
        } catch (e) {
          // If not valid JSON, use as string
          payload = testPayload
        }
      }

      // Emit the event
      socket.emit(selectedEventType, payload)

      // Log the emission
      setEventLogs(prev => [
        formatEvent(`emit:${selectedEventType}`, payload, 'warning'),
        ...prev,
      ])

      toast({
        title: 'Event Sent',
        description: `Emitted ${selectedEventType} event`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error Sending Event',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Clear logs
  const handleClearLogs = () => {
    setEventLogs([])
    toast({
      title: 'Logs Cleared',
      status: 'info',
      duration: 1000,
      isClosable: true,
    })
  }

  // Get formatted timestamp
  const formatTime = date => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    }).format(date)
  }

  // Generate test event
  const generateTestEvent = () => {
    let payload = {}

    switch (selectedEventType) {
      case 'quickClash:join':
        payload = {}
        break
      case 'quickClash:createChallenge':
        payload = {
          opponentId: testUserId,
          categories: ['Current Affairs', 'Science'],
          challenge: {
            _id: testChallengeId || `test-${Date.now()}`,
            category: testCategory,
          },
        }
        break
      case 'quickClash:acceptChallenge':
        payload = {
          challengerId: testUserId,
          challengeId: testChallengeId || `test-${Date.now()}`,
          category: testCategory,
        }
        break
      case 'quickClash:rejectChallenge':
        payload = {
          challengerId: testUserId,
          challengeId: testChallengeId || `test-${Date.now()}`,
          category: testCategory,
        }
        break
      case 'quickClash:completeChallenge':
        payload = {
          opponentId: testUserId,
          challengeId: testChallengeId || `test-${Date.now()}`,
          score: parseInt(testScore),
        }
        break
      case 'quickClash:analysisReady':
        payload = {
          recipientId: testUserId,
          challengeId: testChallengeId || `test-${Date.now()}`,
        }
        break
      default:
        payload = { message: 'Test payload' }
    }

    setTestPayload(JSON.stringify(payload, null, 2))
  }

  // Copy user ID to clipboard
  const { onCopy: copyUserId, hasCopied: hasCopiedUserId } = useClipboard(
    user?._id || '',
  )

  return (
    <Container maxW="container.xl" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        p={6}
        borderRadius="lg"
        bg="rgba(0, 0, 0, 0.7)"
        backdropFilter="blur(10px)"
        borderWidth="1px"
        borderColor="purple.500"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
        color="white"
      >
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center">
            <MotionHeading
              size="lg"
              bgGradient="linear(to-r, purple.400, blue.400)"
              bgClip="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Quick Clash Socket Testing
            </MotionHeading>

            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={() => navigate('/quickclash')}
            >
              Back to Quick Clash
            </Button>
          </HStack>

          <Divider />

          <Tabs variant="soft-rounded" colorScheme="purple">
            <TabList>
              <Tab>Connection</Tab>
              <Tab>Event Tester</Tab>
              <Tab>Event Log</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Box p={4} bg="blackAlpha.400" borderRadius="md">
                    <Heading size="sm" mb={4}>
                      Connection Status
                    </Heading>

                    <HStack spacing={4}>
                      <Badge
                        colorScheme={socketConnected ? 'green' : 'red'}
                        p={2}
                        borderRadius="md"
                      >
                        Socket: {socketConnected ? 'Connected' : 'Disconnected'}
                      </Badge>

                      <Badge
                        colorScheme={quickClashListening ? 'green' : 'red'}
                        p={2}
                        borderRadius="md"
                      >
                        Quick Clash:{' '}
                        {quickClashListening ? 'Listening' : 'Not Listening'}
                      </Badge>
                    </HStack>

                    {user ? (
                      <HStack mt={4}>
                        <Text>Your User ID:</Text>
                        <Code p={2} borderRadius="md" bg="blackAlpha.500">
                          {user._id}
                        </Code>
                        <Button size="xs" onClick={copyUserId}>
                          {hasCopiedUserId ? 'Copied!' : 'Copy'}
                        </Button>
                      </HStack>
                    ) : (
                      <Text color="red.300" mt={4}>
                        Not logged in
                      </Text>
                    )}
                  </Box>

                  <HStack spacing={4}>
                    <Button
                      colorScheme="blue"
                      onClick={handleInitConnection}
                      isDisabled={!user || socketConnected}
                    >
                      Initialize Socket
                    </Button>

                    <Button
                      colorScheme="purple"
                      onClick={handleInitQuickClashSocket}
                      isDisabled={!socketConnected || quickClashListening}
                    >
                      Initialize Quick Clash Socket
                    </Button>
                  </HStack>

                  <Box
                    p={4}
                    bg="blackAlpha.400"
                    borderRadius="md"
                    maxH="200px"
                    overflowY="auto"
                  >
                    <Heading size="sm" mb={3}>
                      Connection History
                    </Heading>
                    {socketHistory.length === 0 ? (
                      <Text color="gray.400">No connection history yet</Text>
                    ) : (
                      <VStack align="stretch" spacing={2}>
                        {socketHistory.map((item, index) => (
                          <HStack key={index} fontSize="sm">
                            <Text color="gray.400" w="100px">
                              {formatTime(item.timestamp)}
                            </Text>
                            <Badge
                              colorScheme={
                                item.event === 'connected'
                                  ? 'green'
                                  : item.event === 'disconnected'
                                  ? 'red'
                                  : 'blue'
                              }
                            >
                              {item.event}
                            </Badge>
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </Box>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={5} align="stretch">
                  <Box p={4} bg="whiteAlpha.100" borderRadius="md">
                    <Heading size="sm" mb={4}>
                      Test Event Parameters
                    </Heading>

                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Event Type</FormLabel>
                        <HStack>
                          <select
                            value={selectedEventType}
                            onChange={e => {
                              setSelectedEventType(e.target.value)
                              // Auto-generate a test payload based on event type
                              setTimeout(generateTestEvent, 100)
                            }}
                            style={{
                              padding: '8px',
                              borderRadius: '4px',
                              background: 'rgba(255,255,255,0.1)',
                              color: 'white',
                              width: '100%',
                            }}
                          >
                            <option value="quickClash:join">
                              quickClash:join
                            </option>
                            <option value="quickClash:createChallenge">
                              quickClash:createChallenge
                            </option>
                            <option value="quickClash:acceptChallenge">
                              quickClash:acceptChallenge
                            </option>
                            <option value="quickClash:rejectChallenge">
                              quickClash:rejectChallenge
                            </option>
                            <option value="quickClash:completeChallenge">
                              quickClash:completeChallenge
                            </option>
                            <option value="quickClash:analysisReady">
                              quickClash:analysisReady
                            </option>
                            <option value="custom">Custom Event</option>
                          </select>

                          {selectedEventType === 'custom' && (
                            <Input
                              placeholder="Enter custom event name"
                              value={
                                selectedEventType === 'custom'
                                  ? ''
                                  : selectedEventType
                              }
                              onChange={e =>
                                setSelectedEventType(e.target.value)
                              }
                              bg="whiteAlpha.100"
                            />
                          )}
                        </HStack>
                      </FormControl>

                      {selectedEventType !== 'quickClash:join' && (
                        <>
                          <FormControl>
                            <FormLabel>
                              Test User ID (Recipient/Opponent)
                            </FormLabel>
                            <Input
                              placeholder="Enter user ID"
                              value={testUserId}
                              onChange={e => setTestUserId(e.target.value)}
                              bg="whiteAlpha.100"
                            />
                          </FormControl>

                          {(selectedEventType ===
                            'quickClash:createChallenge' ||
                            selectedEventType ===
                              'quickClash:acceptChallenge' ||
                            selectedEventType ===
                              'quickClash:rejectChallenge' ||
                            selectedEventType ===
                              'quickClash:completeChallenge' ||
                            selectedEventType ===
                              'quickClash:analysisReady') && (
                            <FormControl>
                              <FormLabel>
                                Test Challenge ID (optional)
                              </FormLabel>
                              <Input
                                placeholder="Leave empty to generate a test ID"
                                value={testChallengeId}
                                onChange={e =>
                                  setTestChallengeId(e.target.value)
                                }
                                bg="whiteAlpha.100"
                              />
                            </FormControl>
                          )}

                          {(selectedEventType ===
                            'quickClash:createChallenge' ||
                            selectedEventType ===
                              'quickClash:acceptChallenge' ||
                            selectedEventType ===
                              'quickClash:rejectChallenge') && (
                            <FormControl>
                              <FormLabel>Category</FormLabel>
                              <Input
                                placeholder="Category name"
                                value={testCategory}
                                onChange={e => setTestCategory(e.target.value)}
                                bg="whiteAlpha.100"
                              />
                            </FormControl>
                          )}

                          {selectedEventType ===
                            'quickClash:completeChallenge' && (
                            <FormControl>
                              <FormLabel>Score</FormLabel>
                              <Input
                                type="number"
                                value={testScore}
                                onChange={e => setTestScore(e.target.value)}
                                bg="whiteAlpha.100"
                              />
                            </FormControl>
                          )}
                        </>
                      )}

                      <Divider />

                      <FormControl>
                        <FormLabel>Payload (JSON)</FormLabel>
                        <Textarea
                          placeholder="Enter payload as JSON"
                          value={testPayload}
                          onChange={e => setTestPayload(e.target.value)}
                          height="150px"
                          bg="blackAlpha.400"
                          fontFamily="monospace"
                        />
                        <FormHelperText color="whiteAlpha.700">
                          Edit directly or use the form fields above to generate
                        </FormHelperText>
                      </FormControl>
                    </VStack>
                  </Box>

                  <HStack spacing={4}>
                    <Button
                      colorScheme="green"
                      onClick={handleSendEvent}
                      isDisabled={!socketConnected}
                    >
                      Send Event
                    </Button>

                    <Button colorScheme="blue" onClick={generateTestEvent}>
                      Generate Test Payload
                    </Button>
                  </HStack>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="sm">Event Log ({eventLogs.length})</Heading>

                    <HStack>
                      <FormControl
                        display="flex"
                        alignItems="center"
                        width="auto"
                      >
                        <FormLabel htmlFor="auto-scroll" mb="0" fontSize="sm">
                          Auto-scroll
                        </FormLabel>
                        <Switch
                          id="auto-scroll"
                          colorScheme="purple"
                          isChecked={isAutoScroll}
                          onChange={() => setIsAutoScroll(!isAutoScroll)}
                        />
                      </FormControl>

                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={handleClearLogs}
                      >
                        Clear Logs
                      </Button>
                    </HStack>
                  </HStack>

                  <Box
                    ref={logContainerRef}
                    p={3}
                    bg="blackAlpha.400"
                    borderRadius="md"
                    maxH="400px"
                    overflowY="auto"
                    css={{
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(0,0,0,0.1)',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(138, 75, 175, 0.5)',
                        borderRadius: '4px',
                      },
                    }}
                  >
                    {eventLogs.length === 0 ? (
                      <Text color="gray.400" textAlign="center" py={8}>
                        No events logged yet
                      </Text>
                    ) : (
                      <VStack spacing={3} align="stretch">
                        {eventLogs.map((log, index) => (
                          <Box
                            key={index}
                            p={3}
                            bg="blackAlpha.500"
                            borderRadius="md"
                            borderLeftWidth="4px"
                            borderLeftColor={
                              log.status === 'success'
                                ? 'green.500'
                                : log.status === 'warning'
                                ? 'orange.500'
                                : log.status === 'error'
                                ? 'red.500'
                                : 'blue.500'
                            }
                          >
                            <HStack mb={2} justify="space-between">
                              <HStack>
                                <Badge>{log.type}</Badge>
                                <Text fontSize="xs" color="gray.400">
                                  {formatTime(log.timestamp)}
                                </Text>
                              </HStack>
                            </HStack>

                            <Box
                              bg="blackAlpha.500"
                              p={2}
                              borderRadius="md"
                              fontSize="sm"
                              fontFamily="monospace"
                              whiteSpace="pre-wrap"
                              overflowX="auto"
                            >
                              {JSON.stringify(log.data, null, 2)}
                            </Box>
                          </Box>
                        ))}
                      </VStack>
                    )}
                  </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <Text fontSize="sm" color="whiteAlpha.600" textAlign="center" mt={4}>
            This testing page is only available in development mode.
          </Text>
        </VStack>
      </MotionBox>
    </Container>
  )
}

export default QuickClashSocketTest
