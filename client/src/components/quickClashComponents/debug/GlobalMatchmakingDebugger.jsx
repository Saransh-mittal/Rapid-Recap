// components/quickClashComponents/debug/GlobalMatchmakingDebugger.jsx
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
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
  Users,
  Zap,
  Clock,
  Settings,
  Globe,
  X,
} from 'lucide-react'
import useQuickClashGlobalMatchmaking from '../../../customHooks/useQuickClashGlobalMatchmaking'
import useQuickClashSocket from '../../../customHooks/useQuickClashSocket'
import { useSocket } from '../../../customHooks/useSocket'
import { useSelector } from 'react-redux'

const MotionBox = motion(Box)

/**
 * Comprehensive debugger for testing useQuickClashGlobalMatchmaking hook
 * This component provides real-time monitoring and testing capabilities for global matchmaking
 */
const GlobalMatchmakingDebugger = ({ isOpen = true }) => {
  const toast = useToast()

  // Hook states
  const {
    inMatchmaking,
    matchmakingType,
    selectedTeamId,
    matchmakingTime,
    teamName,
    joinType,
    originalTeam,
    battleReady,
    loading,
    error,
    socketConnected,
    battleCreationStatus,
    battleCreationError,
    step,
    statusUpdates,
    socketListenersSetup,
    joinedTeamsRoom,
    deviceFingerprint,
    isSocketReady,

    // Actions
    checkMatchmakingStatus,
    joinSoloMatchmaking,
    joinWithTeam,
    leaveMatchmaking,
    selectTeam,
    enterBattle,
    retryAfterFailure,
    clearBattleReady,
    setupSocketListeners,
    cleanupSocketListeners,
    addStatusUpdate,
    clearStatusUpdates,
    formatMatchmakingTime,
  } = useQuickClashGlobalMatchmaking()

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
  const globalMatchmakingState = useSelector(
    state => state.quickClashGlobalMatchmaking,
  )

  // Debug state
  const [eventLog, setEventLog] = useState([])
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)
  const [maxLogEntries, setMaxLogEntries] = useState(100)
  const [showRawData, setShowRawData] = useState(false)
  const [filterEventType, setFilterEventType] = useState('all')

  // Test data state
  const [testTeamId, setTestTeamId] = useState('')
  const [testTeamName, setTestTeamName] = useState('Test Team')
  const [testBattleId, setTestBattleId] = useState('')
  const [testUserId, setTestUserId] = useState('')
  const [testTrophies, setTestTrophies] = useState(1200)
  const [customEventData, setCustomEventData] = useState('{}')
  const [mockStatusMessage, setMockStatusMessage] =
    useState('Test status update')

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
      'quickClash:teamBattleReady',
      'quickClash:battleCreationStarted',
      'quickClash:battleCreationFailed',
      'quickClash:battleCreationCleanedUp',
      'quickClash:matchmakingLocked',
      'quickClash:matchmakingUnlocked',
      'quickClash:teamLeftMatchmaking',
      'quickClash:teamReturnedToMatchmaking',
      'quickClash:teamJoinedMatchmaking',
      'quickClash:teamInvitationReceived',
      'quickClash:teamInvitationAccepted',
      'quickClash:teamInvitationRejected',
      'quickClash:teamMemberJoined',
      'quickClash:teamMemberLeft',
      'quickClash:teamMemberRemoved',
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

    setupGlobal: () => {
      addLogEntry(
        'DEBUG',
        'Setting up global matchmaking listeners...',
        'action',
      )
      setupSocketListeners()
    },

    checkStatus: async () => {
      addLogEntry('DEBUG', 'Checking matchmaking status...', 'action')
      try {
        const status = await checkMatchmakingStatus()
        addLogEntry('DEBUG', { statusResult: status }, 'response')
      } catch (error) {
        addLogEntry('DEBUG', { error: error.message }, 'error')
      }
    },

    joinSolo: async () => {
      addLogEntry('DEBUG', 'Joining solo matchmaking...', 'action')
      try {
        const result = await joinSoloMatchmaking()
        addLogEntry('DEBUG', { joinResult: result }, 'response')
      } catch (error) {
        addLogEntry('DEBUG', { error: error.message }, 'error')
      }
    },

    joinTeam: async () => {
      addLogEntry(
        'DEBUG',
        `Joining team matchmaking with team ${testTeamId}...`,
        'action',
      )
      try {
        const result = await joinWithTeam(
          testTeamId || 'test-team-123',
          testTeamName,
        )
        addLogEntry('DEBUG', { joinResult: result }, 'response')
      } catch (error) {
        addLogEntry('DEBUG', { error: error.message }, 'error')
      }
    },

    leaveQueue: async () => {
      addLogEntry('DEBUG', 'Leaving matchmaking...', 'action')
      try {
        await leaveMatchmaking()
        addLogEntry('DEBUG', 'Successfully left matchmaking', 'response')
      } catch (error) {
        addLogEntry('DEBUG', { error: error.message }, 'error')
      }
    },

    selectTestTeam: () => {
      addLogEntry('DEBUG', `Selecting team ${testTeamId}...`, 'action')
      selectTeam(testTeamId || 'test-team-123')
    },

    enterTestBattle: () => {
      addLogEntry('DEBUG', 'Attempting to enter battle...', 'action')
      enterBattle()
    },

    retryFailure: async () => {
      addLogEntry('DEBUG', 'Retrying after failure...', 'action')
      try {
        await retryAfterFailure()
        addLogEntry('DEBUG', 'Retry completed', 'response')
      } catch (error) {
        addLogEntry('DEBUG', { error: error.message }, 'error')
      }
    },

    addMockStatus: () => {
      addLogEntry('DEBUG', `Adding mock status: ${mockStatusMessage}`, 'action')
      addStatusUpdate(mockStatusMessage)
    },

    clearStatuses: () => {
      addLogEntry('DEBUG', 'Clearing status updates...', 'action')
      clearStatusUpdates()
    },

    cleanup: () => {
      addLogEntry('DEBUG', 'Cleaning up listeners...', 'action')
      cleanupSocketListeners()
    },

    simulateBattleReady: () => {
      const mockData = {
        battleId: testBattleId || 'test-battle-456',
        teamId: testTeamId || 'test-team-123',
        teamA: testTeamId || 'test-team-123',
        teamB: 'opponent-team-789',
        teamAMembers: [
          {
            userId: user?._id,
            name: user?.name || 'Test User',
          },
        ],
        teamBMembers: [
          {
            userId: testUserId || 'test-user-456',
            name: 'Opponent User',
          },
        ],
        categories: ['technology', 'science', 'history', 'sports'],
      }
      addLogEntry('quickClash:teamBattleReady', mockData, 'simulated')
      if (socket) {
        socket.emit('quickClash:teamBattleReady', mockData)
      }
    },

    simulateBattleCreationStarted: () => {
      const mockData = {
        teamA: testTeamId || 'test-team-123',
        teamB: 'opponent-team-789',
        allMembers: [user?._id, testUserId || 'test-user-456'],
        teamAMembers: [user?._id],
        teamBMembers: [testUserId || 'test-user-456'],
      }
      addLogEntry('quickClash:battleCreationStarted', mockData, 'simulated')
      if (socket) {
        socket.emit('quickClash:battleCreationStarted', mockData)
      }
    },

    simulateBattleCreationFailed: () => {
      const mockData = {
        teamA: testTeamId || 'test-team-123',
        teamB: 'opponent-team-789',
        error: 'Failed to create battle due to timeout',
        allMembers: [user?._id, testUserId || 'test-user-456'],
      }
      addLogEntry('quickClash:battleCreationFailed', mockData, 'simulated')
      if (socket) {
        socket.emit('quickClash:battleCreationFailed', mockData)
      }
    },

    simulateTeamJoinedMatchmaking: () => {
      const mockData = {
        teamId: testTeamId || 'test-team-123',
        teamName: testTeamName,
        avgTrophies: testTrophies,
        memberCount: 3,
        teamMembers: [
          {
            userId: user?._id,
            name: user?.name || 'Test User',
          },
        ],
        timestamp: new Date(),
      }
      addLogEntry('quickClash:teamJoinedMatchmaking', mockData, 'simulated')
      if (socket) {
        socket.emit('quickClash:teamJoinedMatchmaking', mockData)
      }
    },

    simulateTeamLeftMatchmaking: () => {
      const mockData = {
        teamId: testTeamId || 'test-team-123',
        teamName: testTeamName,
        reason: 'user_initiated',
        initiator: user?._id,
        timestamp: new Date(),
      }
      addLogEntry('quickClash:teamLeftMatchmaking', mockData, 'simulated')
      if (socket) {
        socket.emit('quickClash:teamLeftMatchmaking', mockData)
      }
    },

    simulateTeamInvitation: () => {
      const mockData = {
        invitationId: 'test-invitation-123',
        teamName: testTeamName,
        inviterName: 'Test Inviter',
      }
      addLogEntry('quickClash:teamInvitationReceived', mockData, 'simulated')
      if (socket) {
        socket.emit('quickClash:teamInvitationReceived', mockData)
      }
    },

    simulateTeamMemberJoined: () => {
      const mockData = {
        teamId: testTeamId || 'test-team-123',
        userId: testUserId || 'test-user-456',
        userName: 'New Member',
        userInGameName: 'NewPlayer',
      }
      addLogEntry('quickClash:teamMemberJoined', mockData, 'simulated')
      if (socket) {
        socket.emit('quickClash:teamMemberJoined', mockData)
      }
    },

    simulateMatchmakingLocked: () => {
      const mockData = {
        status: 'locked',
        teamA: testTeamId || 'test-team-123',
        teamB: 'opponent-team-789',
        allMembers: [user?._id, testUserId || 'test-user-456'],
        teamAMembers: [user?._id],
        teamBMembers: [testUserId || 'test-user-456'],
        teamAName: testTeamName,
        teamBName: 'Opponent Team',
      }
      addLogEntry('quickClash:matchmakingLocked', mockData, 'simulated')
      if (socket) {
        socket.emit('quickClash:matchmakingLocked', mockData)
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
      a.download = `global-matchmaking-debug-${Date.now()}.json`
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
      left="20px"
      width="550px"
      height="85vh"
      bg="rgba(26, 21, 39, 0.98)"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="blue.500"
      zIndex={9999}
      overflow="hidden"
      boxShadow="0 4px 20px rgba(66, 153, 225, 0.3)"
    >
      <VStack h="full" spacing={0}>
        {/* Header */}
        <Box w="full" p={4} bg="blue.600" color="white">
          <HStack justify="space-between">
            <Heading size="md">Global Matchmaking Debugger</Heading>
            <HStack>
              <Badge colorScheme={isSocketReady ? 'green' : 'red'}>
                {isSocketReady ? <Wifi size={12} /> : <WifiOff size={12} />}
                {isSocketReady ? 'Connected' : 'Disconnected'}
              </Badge>
              <Badge colorScheme={socketListenersSetup ? 'green' : 'orange'}>
                {socketListenersSetup ? 'Setup' : 'Not Setup'}
              </Badge>
              <Badge colorScheme={inMatchmaking ? 'purple' : 'gray'}>
                {inMatchmaking ? 'In Queue' : 'Idle'}
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
                      In Matchmaking:
                    </Text>
                    <Badge colorScheme={inMatchmaking ? 'purple' : 'gray'}>
                      {inMatchmaking ? 'Yes' : 'No'}
                    </Badge>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="sm" color="gray.400">
                      Matchmaking Type:
                    </Text>
                    <Badge
                      colorScheme={
                        matchmakingType === 'solo' ? 'blue' : 'green'
                      }
                    >
                      {matchmakingType || 'None'}
                    </Badge>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="sm" color="gray.400">
                      Selected Team:
                    </Text>
                    <Code fontSize="xs">
                      {selectedTeamId?.slice(0, 8) || 'None'}...
                    </Code>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="sm" color="gray.400">
                      Team Name:
                    </Text>
                    <Text fontSize="xs">{teamName || 'N/A'}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="sm" color="gray.400">
                      Join Type:
                    </Text>
                    <Badge colorScheme="cyan">{joinType || 'N/A'}</Badge>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="sm" color="gray.400">
                      Battle Ready:
                    </Text>
                    <Badge colorScheme={battleReady ? 'green' : 'gray'}>
                      {battleReady ? 'Yes' : 'No'}
                    </Badge>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="sm" color="gray.400">
                      Battle Creation:
                    </Text>
                    <Badge
                      colorScheme={
                        battleCreationStatus === 'creating'
                          ? 'yellow'
                          : battleCreationStatus === 'failed'
                          ? 'red'
                          : 'gray'
                      }
                    >
                      {battleCreationStatus || 'None'}
                    </Badge>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="sm" color="gray.400">
                      Step:
                    </Text>
                    <Badge colorScheme="teal">{step || 'None'}</Badge>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="sm" color="gray.400">
                      Queue Time:
                    </Text>
                    <Text fontSize="sm" color="orange.300">
                      {formatMatchmakingTime(matchmakingTime)}
                    </Text>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="sm" color="gray.400">
                      Status Updates:
                    </Text>
                    <Badge colorScheme="purple">
                      {statusUpdates?.length || 0}
                    </Badge>
                  </GridItem>
                  <GridItem colSpan={2}>
                    <Text fontSize="sm" color="gray.400">
                      Device:
                    </Text>
                    <Code fontSize="xs">
                      {deviceFingerprint?.slice(0, 12)}...
                    </Code>
                  </GridItem>
                  {battleCreationError && (
                    <GridItem colSpan={2}>
                      <Text fontSize="sm" color="gray.400">
                        Error:
                      </Text>
                      <Text fontSize="xs" color="red.300">
                        {battleCreationError}
                      </Text>
                    </GridItem>
                  )}
                </Grid>
              </AccordionPanel>
            </AccordionItem>

            {/* Controls Panel */}
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Settings size={16} />
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
                      onClick={testFunctions.setupGlobal}
                      leftIcon={<Globe size={16} />}
                    >
                      Setup Global
                    </Button>
                  </HStack>
                  <HStack w="full">
                    <Button
                      size="sm"
                      colorScheme="purple"
                      onClick={testFunctions.checkStatus}
                      leftIcon={<Activity size={16} />}
                    >
                      Check Status
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
                  <Divider />
                  <HStack w="full">
                    <Button
                      size="sm"
                      colorScheme="teal"
                      onClick={testFunctions.joinSolo}
                      leftIcon={<Users size={16} />}
                      isDisabled={inMatchmaking}
                    >
                      Join Solo
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="cyan"
                      onClick={testFunctions.joinTeam}
                      leftIcon={<Users size={16} />}
                      isDisabled={inMatchmaking}
                    >
                      Join Team
                    </Button>
                  </HStack>
                  <HStack w="full">
                    <Button
                      size="sm"
                      colorScheme="orange"
                      onClick={testFunctions.leaveQueue}
                      leftIcon={<X size={16} />}
                      isDisabled={!inMatchmaking}
                    >
                      Leave Queue
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={testFunctions.enterTestBattle}
                      leftIcon={<Zap size={16} />}
                      isDisabled={!battleReady}
                    >
                      Enter Battle
                    </Button>
                  </HStack>
                  <HStack w="full">
                    <Button
                      size="sm"
                      colorScheme="yellow"
                      onClick={testFunctions.retryFailure}
                      leftIcon={<RotateCcw size={16} />}
                    >
                      Retry Failure
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="pink"
                      onClick={testFunctions.selectTestTeam}
                      leftIcon={<Users size={16} />}
                    >
                      Select Team
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
                    placeholder="Test Team ID"
                    value={testTeamId}
                    onChange={e => setTestTeamId(e.target.value)}
                    size="sm"
                  />
                  <Input
                    placeholder="Test Team Name"
                    value={testTeamName}
                    onChange={e => setTestTeamName(e.target.value)}
                    size="sm"
                  />
                  <Input
                    placeholder="Test Battle ID"
                    value={testBattleId}
                    onChange={e => setTestBattleId(e.target.value)}
                    size="sm"
                  />
                  <Input
                    placeholder="Test User ID"
                    value={testUserId}
                    onChange={e => setTestUserId(e.target.value)}
                    size="sm"
                  />
                  <NumberInput
                    value={testTrophies}
                    onChange={valueString =>
                      setTestTrophies(Number(valueString))
                    }
                    min={0}
                    max={5000}
                    size="sm"
                  >
                    <NumberInputField placeholder="Test Trophies" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Input
                    placeholder="Mock Status Message"
                    value={mockStatusMessage}
                    onChange={e => setMockStatusMessage(e.target.value)}
                    size="sm"
                  />
                  <HStack w="full">
                    <Button
                      size="sm"
                      colorScheme="purple"
                      onClick={testFunctions.addMockStatus}
                      flex={1}
                    >
                      Add Status
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={testFunctions.clearStatuses}
                      flex={1}
                    >
                      Clear Statuses
                    </Button>
                  </HStack>
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
                    colorScheme="green"
                    onClick={testFunctions.simulateBattleReady}
                  >
                    Simulate Battle Ready
                  </Button>
                  <Button
                    w="full"
                    size="sm"
                    colorScheme="blue"
                    onClick={testFunctions.simulateBattleCreationStarted}
                  >
                    Simulate Battle Creation Started
                  </Button>
                  <Button
                    w="full"
                    size="sm"
                    colorScheme="red"
                    onClick={testFunctions.simulateBattleCreationFailed}
                  >
                    Simulate Battle Creation Failed
                  </Button>
                  <Button
                    w="full"
                    size="sm"
                    colorScheme="purple"
                    onClick={testFunctions.simulateTeamJoinedMatchmaking}
                  >
                    Simulate Team Joined Matchmaking
                  </Button>
                  <Button
                    w="full"
                    size="sm"
                    colorScheme="orange"
                    onClick={testFunctions.simulateTeamLeftMatchmaking}
                  >
                    Simulate Team Left Matchmaking
                  </Button>
                  <Button
                    w="full"
                    size="sm"
                    colorScheme="cyan"
                    onClick={testFunctions.simulateTeamInvitation}
                  >
                    Simulate Team Invitation
                  </Button>
                  <Button
                    w="full"
                    size="sm"
                    colorScheme="teal"
                    onClick={testFunctions.simulateTeamMemberJoined}
                  >
                    Simulate Team Member Joined
                  </Button>
                  <Button
                    w="full"
                    size="sm"
                    colorScheme="yellow"
                    onClick={testFunctions.simulateMatchmakingLocked}
                  >
                    Simulate Matchmaking Locked
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
                    colorScheme="pink"
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
              <AccordionPanel pb={4} h="350px" overflow="hidden">
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
                        <option value="battle">Battle</option>
                        <option value="team">Team</option>
                        <option value="matchmaking">Matchmaking</option>
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
                                : entry.direction === 'error'
                                ? 'red'
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

export default GlobalMatchmakingDebugger
