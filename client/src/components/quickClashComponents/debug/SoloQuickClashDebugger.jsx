// components/quickClashComponents/debug/SoloQuickClashDebugger.jsx
import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Heading,
  Divider,
  Code,
  Textarea,
  Input,
  Select,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Switch,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  Tooltip,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Send,
  Activity,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  Download,
  Upload,
} from 'lucide-react'
import useSoloQuickClash from '../../../customHooks/useSoloQuickClash'
import useQuickClashSocket from '../../../customHooks/useQuickClashSocket'
import { useSocket } from '../../../customHooks/useSocket'
import { useSelector } from 'react-redux'

const MotionBox = motion(Box)

/**
 * Comprehensive debugger for testing useSoloQuickClash hook
 * This component provides real-time monitoring and testing capabilities
 */
const SoloQuickClashDebugger = ({ isOpen = true }) => {
  const toast = useToast()

  // Hook states
  const {
    deviceFingerprint,
    isSocketReady,
    soloRoomJoined,
    setupSoloSocketListeners,
    cleanupSocketListeners,
    joinSoloRoom,
  } = useSoloQuickClash()

  const {
    isListening,
    initializeQuickClashSocket,
    cleanupSocketListeners: cleanupBaseListeners,
  } = useQuickClashSocket()

  const {
    socket,
    emitWithDeviceContext,
    addEventListener,
    isSocketReady: baseSocketReady,
  } = useSocket()

  const { user } = useSelector(state => state.auth)
  const { activeChallenges } = useSelector(state => state.quickClash)

  // Debug state
  const [eventLog, setEventLog] = useState([])
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)
  const [maxLogEntries, setMaxLogEntries] = useState(100)
  const [showRawData, setShowRawData] = useState(false)
  const [filterEventType, setFilterEventType] = useState('all')

  // Test data state
  const [testChallengeId, setTestChallengeId] = useState('')
  const [testUserId, setTestUserId] = useState('')
  const [testScore, setTestScore] = useState(85)
  const [customEventData, setCustomEventData] = useState('{}')

  // Refs
  const logEndRef = useRef(null)
  const eventCleanupRef = useRef([])

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [eventLog, autoScroll])

  // Setup event monitoring
  useEffect(() => {
    if (!isMonitoring) return

    const events = [
      'quickClash:newChallenge',
      'quickClash:challengerNotified',
      'quickClash:challengeAccepted',
      'quickClash:challengeRejected',
      'quickClash:challengeCompleted',
      'quickClash:challengeCompletedByBothPlayers',
      'quickClash:analysisReady',
      'connect',
      'disconnect',
      'reconnect',
    ]

    const cleanupFunctions = events.map(eventName => {
      return addEventListener(eventName, data => {
        addLogEntry(eventName, data, 'received')
      })
    })

    eventCleanupRef.current = cleanupFunctions

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup())
    }
  }, [isMonitoring, addEventListener])

  // Add log entry
  const addLogEntry = (event, data, direction = 'received') => {
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      event,
      data,
      direction,
      userId: user?._id,
    }

    setEventLog(prev => {
      const newLog = [...prev, entry]
      return newLog.slice(-maxLogEntries) // Keep only recent entries
    })
  }

  // Filter events
  const filteredEvents = eventLog.filter(entry => {
    if (filterEventType === 'all') return true
    return entry.event.includes(filterEventType)
  })

  // Test functions
  const testFunctions = {
    initializeBase: () => {
      addLogEntry('DEBUG', 'Initializing base socket...', 'action')
      initializeQuickClashSocket()
    },

    setupSolo: () => {
      addLogEntry('DEBUG', 'Setting up solo listeners...', 'action')
      setupSoloSocketListeners()
    },

    joinRoom: () => {
      addLogEntry('DEBUG', 'Joining solo room...', 'action')
      joinSoloRoom()
    },

    cleanup: () => {
      addLogEntry('DEBUG', 'Cleaning up listeners...', 'action')
      cleanupSocketListeners()
    },

    simulateNewChallenge: () => {
      const mockData = {
        challenge: {
          _id: testChallengeId || 'test-challenge-123',
          category: 'technology',
        },
        challenger: {
          _id: testUserId || 'test-user-456',
          name: 'Test User',
          inGameName: 'TestPlayer',
        },
        opponent: {
          _id: user?._id,
          name: user?.name,
          inGameName: user?.inGameName,
        },
      }
      addLogEntry('quickClash:newChallenge', mockData, 'simulated')
      // Actually emit the event
      if (socket) {
        socket.emit('quickClash:newChallenge', mockData)
      }
    },

    simulateChallengeAccepted: () => {
      const mockData = {
        challengeId: testChallengeId || 'test-challenge-123',
        category: 'technology',
        challenger: {
          _id: user?._id,
          name: user?.name,
          inGameName: user?.inGameName,
        },
        opponent: {
          _id: testUserId || 'test-user-456',
          name: 'Test User',
          inGameName: 'TestPlayer',
        },
      }
      addLogEntry('quickClash:challengeAccepted', mockData, 'simulated')
      if (socket) {
        socket.emit('quickClash:challengeAccepted', mockData)
      }
    },

    simulateChallengeCompleted: () => {
      const mockData = {
        challengeId: testChallengeId || 'test-challenge-123',
        completedByUserId: testUserId || 'test-user-456',
        waitTime: 5000,
      }
      addLogEntry('quickClash:challengeCompleted', mockData, 'simulated')
      if (socket) {
        socket.emit('quickClash:challengeCompleted', mockData)
      }
    },

    simulateBothCompleted: () => {
      const mockData = {
        challengeId: testChallengeId || 'test-challenge-123',
        userScore: testScore,
        opponentScore: Math.floor(Math.random() * 100),
        opponent: {
          _id: testUserId || 'test-user-456',
          name: 'Test User',
          inGameName: 'TestPlayer',
        },
        completedByUserId: testUserId || 'test-user-456',
        trackWinnerOutcomeResult: {
          tasksDone: {
            task1: {
              taskId: 'daily_challenge',
              progress: 1,
              isCompleted: true,
            },
          },
        },
      }
      addLogEntry(
        'quickClash:challengeCompletedByBothPlayers',
        mockData,
        'simulated',
      )
      if (socket) {
        socket.emit('quickClash:challengeCompletedByBothPlayers', mockData)
      }
    },

    sendCustomEvent: () => {
      try {
        const data = JSON.parse(customEventData)
        const eventName = data.eventName || 'quickClash:test'
        addLogEntry(eventName, data, 'custom')
        if (socket) {
          socket.emit(eventName, data)
        }
      } catch (error) {
        toast({
          title: 'Invalid JSON',
          description: error.message,
          status: 'error',
          duration: 3000,
        })
      }
    },

    clearLog: () => {
      setEventLog([])
    },

    exportLog: () => {
      const logData = JSON.stringify(eventLog, null, 2)
      const blob = new Blob([logData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `solo-quickclash-debug-${Date.now()}.json`
      a.click()
    },
  }

  if (!isOpen) return null

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      position="fixed"
      top="80px"
      right="20px"
      width="500px"
      height="80vh"
      bg="rgba(26, 21, 39, 0.98)"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="purple.500"
      zIndex={9999}
      overflow="hidden"
      boxShadow="0 4px 20px rgba(138, 43, 226, 0.3)"
    >
      <VStack h="full" spacing={0}>
        {/* Header */}
        <Box w="full" p={4} bg="purple.600" color="white">
          <HStack justify="space-between">
            <Heading size="md">Solo QuickClash Debugger</Heading>
            <HStack>
              <Badge colorScheme={isSocketReady ? 'green' : 'red'}>
                {isSocketReady ? <Wifi size={12} /> : <WifiOff size={12} />}
                {isSocketReady ? 'Connected' : 'Disconnected'}
              </Badge>
              <Badge colorScheme={isListening ? 'green' : 'orange'}>
                {isListening ? 'Listening' : 'Not Listening'}
              </Badge>
            </HStack>
          </HStack>
        </Box>

        {/* Content */}
        <VStack flex={1} w="full" overflow="hidden">
          <Accordion allowMultiple w="full" flex={1} overflow="hidden">
            {/* Status Panel */}
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Activity size={16} />
                    <Text>Hook Status</Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                  <GridItem>
                    <Text fontSize="sm" color="gray.400">
                      Socket Ready:
                    </Text>
                    <Badge colorScheme={isSocketReady ? 'green' : 'red'}>
                      {isSocketReady ? 'Yes' : 'No'}
                    </Badge>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="sm" color="gray.400">
                      Base Listening:
                    </Text>
                    <Badge colorScheme={isListening ? 'green' : 'red'}>
                      {isListening ? 'Yes' : 'No'}
                    </Badge>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="sm" color="gray.400">
                      Solo Room:
                    </Text>
                    <Badge colorScheme={soloRoomJoined ? 'green' : 'red'}>
                      {soloRoomJoined ? 'Joined' : 'Not Joined'}
                    </Badge>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="sm" color="gray.400">
                      Device:
                    </Text>
                    <Code fontSize="xs">
                      {deviceFingerprint?.slice(0, 8)}...
                    </Code>
                  </GridItem>
                  <GridItem colSpan={2}>
                    <Text fontSize="sm" color="gray.400">
                      Active Challenges:
                    </Text>
                    <Badge colorScheme="blue">
                      {activeChallenges?.length || 0}
                    </Badge>
                  </GridItem>
                </Grid>
              </AccordionPanel>
            </AccordionItem>

            {/* Controls Panel */}
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Play size={16} />
                    <Text>Controls</Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <VStack spacing={3}>
                  <HStack w="full">
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={testFunctions.initializeBase}
                      leftIcon={<Play size={16} />}
                    >
                      Init Base
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={testFunctions.setupSolo}
                      leftIcon={<Activity size={16} />}
                    >
                      Setup Solo
                    </Button>
                  </HStack>
                  <HStack w="full">
                    <Button
                      size="sm"
                      colorScheme="purple"
                      onClick={testFunctions.joinRoom}
                      leftIcon={<Wifi size={16} />}
                    >
                      Join Room
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={testFunctions.cleanup}
                      leftIcon={<Trash2 size={16} />}
                    >
                      Cleanup
                    </Button>
                  </HStack>
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            {/* Test Data Panel */}
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Upload size={16} />
                    <Text>Test Data</Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <VStack spacing={3}>
                  <Input
                    placeholder="Test Challenge ID"
                    value={testChallengeId}
                    onChange={e => setTestChallengeId(e.target.value)}
                    size="sm"
                  />
                  <Input
                    placeholder="Test User ID"
                    value={testUserId}
                    onChange={e => setTestUserId(e.target.value)}
                    size="sm"
                  />
                  <Input
                    placeholder="Test Score"
                    type="number"
                    value={testScore}
                    onChange={e => setTestScore(Number(e.target.value))}
                    size="sm"
                  />
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            {/* Simulators Panel */}
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Send size={16} />
                    <Text>Event Simulators</Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <VStack spacing={2}>
                  <Button
                    w="full"
                    size="sm"
                    colorScheme="teal"
                    onClick={testFunctions.simulateNewChallenge}
                  >
                    Simulate New Challenge
                  </Button>
                  <Button
                    w="full"
                    size="sm"
                    colorScheme="green"
                    onClick={testFunctions.simulateChallengeAccepted}
                  >
                    Simulate Challenge Accepted
                  </Button>
                  <Button
                    w="full"
                    size="sm"
                    colorScheme="blue"
                    onClick={testFunctions.simulateChallengeCompleted}
                  >
                    Simulate Challenge Completed
                  </Button>
                  <Button
                    w="full"
                    size="sm"
                    colorScheme="purple"
                    onClick={testFunctions.simulateBothCompleted}
                  >
                    Simulate Both Completed
                  </Button>

                  <Divider />

                  <Textarea
                    placeholder='{"eventName": "quickClash:test", "data": {}}'
                    value={customEventData}
                    onChange={e => setCustomEventData(e.target.value)}
                    size="sm"
                    rows={3}
                  />
                  <Button
                    w="full"
                    size="sm"
                    colorScheme="orange"
                    onClick={testFunctions.sendCustomEvent}
                  >
                    Send Custom Event
                  </Button>
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            {/* Event Log Panel */}
            <AccordionItem flex={1}>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Eye size={16} />
                    <Text>Event Log ({filteredEvents.length})</Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} h="300px" overflow="hidden">
                <VStack h="full" spacing={2}>
                  {/* Log Controls */}
                  <HStack w="full" justify="space-between">
                    <HStack>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="monitoring" mb="0" fontSize="sm">
                          Monitor
                        </FormLabel>
                        <Switch
                          id="monitoring"
                          isChecked={isMonitoring}
                          onChange={e => setIsMonitoring(e.target.checked)}
                          size="sm"
                        />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="autoscroll" mb="0" fontSize="sm">
                          Auto-scroll
                        </FormLabel>
                        <Switch
                          id="autoscroll"
                          isChecked={autoScroll}
                          onChange={e => setAutoScroll(e.target.checked)}
                          size="sm"
                        />
                      </FormControl>
                    </HStack>
                    <HStack>
                      <Select
                        value={filterEventType}
                        onChange={e => setFilterEventType(e.target.value)}
                        size="sm"
                        width="120px"
                      >
                        <option value="all">All Events</option>
                        <option value="challenge">Challenges</option>
                        <option value="connect">Connection</option>
                        <option value="DEBUG">Debug</option>
                      </Select>
                      <IconButton
                        icon={<Download size={16} />}
                        size="sm"
                        onClick={testFunctions.exportLog}
                        title="Export Log"
                      />
                      <IconButton
                        icon={<Trash2 size={16} />}
                        size="sm"
                        colorScheme="red"
                        onClick={testFunctions.clearLog}
                        title="Clear Log"
                      />
                    </HStack>
                  </HStack>

                  {/* Log Display */}
                  <Box
                    w="full"
                    flex={1}
                    overflow="auto"
                    bg="black"
                    p={2}
                    borderRadius="md"
                    fontSize="xs"
                    fontFamily="mono"
                  >
                    {filteredEvents.map(entry => (
                      <Box key={entry.id} mb={1}>
                        <HStack spacing={2}>
                          <Text color="gray.500">
                            {entry.timestamp.toLocaleTimeString()}
                          </Text>
                          <Badge
                            size="sm"
                            colorScheme={
                              entry.direction === 'received'
                                ? 'green'
                                : entry.direction === 'simulated'
                                ? 'purple'
                                : entry.direction === 'custom'
                                ? 'orange'
                                : 'blue'
                            }
                          >
                            {entry.direction}
                          </Badge>
                          <Text color="cyan.300">{entry.event}</Text>
                        </HStack>
                        {showRawData && (
                          <Code display="block" whiteSpace="pre-wrap" mt={1}>
                            {JSON.stringify(entry.data, null, 2)}
                          </Code>
                        )}
                      </Box>
                    ))}
                    <div ref={logEndRef} />
                  </Box>

                  <HStack w="full">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="rawdata" mb="0" fontSize="sm">
                        Show Raw Data
                      </FormLabel>
                      <Switch
                        id="rawdata"
                        isChecked={showRawData}
                        onChange={e => setShowRawData(e.target.checked)}
                        size="sm"
                      />
                    </FormControl>
                  </HStack>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </VStack>
      </VStack>
    </MotionBox>
  )
}

export default SoloQuickClashDebugger
