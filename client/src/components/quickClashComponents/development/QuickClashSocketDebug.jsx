// components/quickClashComponents/development/QuickClashSocketDebug.jsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Text,
  Heading,
  Badge,
  Code,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  FormControl,
  FormLabel,
  Input,
  Select,
  HStack,
  Textarea,
  useToast,
} from '@chakra-ui/react'
import { InfoIcon, WarningIcon, CheckCircleIcon } from '@chakra-ui/icons'
import useQuickClashSocket from '../../../customHooks/useQuickClashSocket'
import { useSelector } from 'react-redux'
import { format } from 'date-fns'

/**
 * Debug component for Quick Clash socket functionality
 * Only for development use
 */
const QuickClashSocketDebug = () => {
  const toast = useToast()
  const { user } = useSelector(state => state.auth)
  const {
    isListening,
    lastEvent,
    initializeQuickClashSocket,
    emitChallengeCreated,
    emitChallengeAccepted,
    emitChallengeRejected,
    emitChallengeCompleted,
    emitAnalysisReady,
  } = useQuickClashSocket()

  // Log history
  const [eventLog, setEventLog] = useState([])

  // Test event form state
  const [testEvent, setTestEvent] = useState({
    type: 'quickClash:createChallenge',
    recipientId: '',
    challengeId: '',
    challengerId: user?._id || '',
    opponentId: '',
    categories: ['Current Affairs', 'Science'],
    category: 'Current Affairs',
    score: 120,
  })

  // Update event log when a new event is received
  useEffect(() => {
    if (lastEvent) {
      setEventLog(prev => [lastEvent, ...prev].slice(0, 10))
    }
  }, [lastEvent])

  // Handle changes to the test event form
  const handleInputChange = e => {
    const { name, value } = e.target
    setTestEvent(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  // Send a test event
  const sendTestEvent = () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to send test events',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    switch (testEvent.type) {
      case 'quickClash:createChallenge':
        emitChallengeCreated({
          opponentId: testEvent.recipientId,
          categories: testEvent.categories,
          challenge: {
            _id: testEvent.challengeId || `test-${Date.now()}`,
            category: testEvent.category,
          },
        })
        break
      case 'quickClash:acceptChallenge':
        emitChallengeAccepted({
          challengerId: testEvent.challengerId,
          challengeId: testEvent.challengeId || `test-${Date.now()}`,
          category: testEvent.category,
        })
        break
      case 'quickClash:rejectChallenge':
        emitChallengeRejected({
          challengerId: testEvent.challengerId,
          challengeId: testEvent.challengeId || `test-${Date.now()}`,
          category: testEvent.category,
        })
        break
      case 'quickClash:completeChallenge':
        emitChallengeCompleted({
          opponentId: testEvent.recipientId,
          challengeId: testEvent.challengeId || `test-${Date.now()}`,
          score: parseInt(testEvent.score),
        })
        break
      case 'quickClash:analysisReady':
        emitAnalysisReady({
          recipientId: testEvent.recipientId,
          challengeId: testEvent.challengeId || `test-${Date.now()}`,
        })
        break
      default:
        toast({
          title: 'Error',
          description: 'Unknown event type',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
    }

    toast({
      title: 'Event Sent',
      description: `Sent ${testEvent.type} event`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      bg="rgba(0, 0, 0, 0.7)"
      backdropFilter="blur(10px)"
      color="white"
      maxW="900px"
      mx="auto"
      my={4}
    >
      <VStack spacing={6} align="stretch">
        <Heading size="md" color="purple.300">
          Quick Clash Socket Debug Panel
        </Heading>

        <HStack>
          <Badge
            colorScheme={isListening ? 'green' : 'red'}
            p={2}
            borderRadius="md"
          >
            {isListening ? 'Connected' : 'Not Connected'}
          </Badge>
          {!isListening && (
            <Button
              size="sm"
              colorScheme="purple"
              onClick={initializeQuickClashSocket}
            >
              Connect
            </Button>
          )}
        </HStack>

        <Box>
          <Accordion allowToggle>
            <AccordionItem border="none">
              <h2>
                <AccordionButton
                  _expanded={{ bg: 'whiteAlpha.100', color: 'white' }}
                >
                  <Box flex="1" textAlign="left" fontWeight="semibold">
                    Send Test Event
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} bg="whiteAlpha.50" borderRadius="md">
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Event Type</FormLabel>
                    <Select
                      name="type"
                      value={testEvent.type}
                      onChange={handleInputChange}
                      bg="whiteAlpha.100"
                    >
                      <option value="quickClash:createChallenge">
                        Challenge Created
                      </option>
                      <option value="quickClash:acceptChallenge">
                        Challenge Accepted
                      </option>
                      <option value="quickClash:rejectChallenge">
                        Challenge Rejected
                      </option>
                      <option value="quickClash:completeChallenge">
                        Challenge Completed
                      </option>
                      <option value="quickClash:analysisReady">
                        Analysis Ready
                      </option>
                    </Select>
                  </FormControl>

                  {(testEvent.type === 'quickClash:createChallenge' ||
                    testEvent.type === 'quickClash:completeChallenge' ||
                    testEvent.type === 'quickClash:analysisReady') && (
                    <FormControl>
                      <FormLabel>Recipient User ID</FormLabel>
                      <Input
                        name="recipientId"
                        value={testEvent.recipientId}
                        onChange={handleInputChange}
                        placeholder="User ID of recipient"
                        bg="whiteAlpha.100"
                      />
                    </FormControl>
                  )}

                  {(testEvent.type === 'quickClash:acceptChallenge' ||
                    testEvent.type === 'quickClash:rejectChallenge') && (
                    <FormControl>
                      <FormLabel>Challenger User ID</FormLabel>
                      <Input
                        name="challengerId"
                        value={testEvent.challengerId}
                        onChange={handleInputChange}
                        placeholder="User ID of challenger"
                        bg="whiteAlpha.100"
                      />
                    </FormControl>
                  )}

                  <FormControl>
                    <FormLabel>Challenge ID (optional)</FormLabel>
                    <Input
                      name="challengeId"
                      value={testEvent.challengeId}
                      onChange={handleInputChange}
                      placeholder="Challenge ID (will generate if empty)"
                      bg="whiteAlpha.100"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Category</FormLabel>
                    <Input
                      name="category"
                      value={testEvent.category}
                      onChange={handleInputChange}
                      placeholder="Challenge category"
                      bg="whiteAlpha.100"
                    />
                  </FormControl>

                  {testEvent.type === 'quickClash:completeChallenge' && (
                    <FormControl>
                      <FormLabel>Score</FormLabel>
                      <Input
                        name="score"
                        value={testEvent.score}
                        onChange={handleInputChange}
                        type="number"
                        placeholder="Score value"
                        bg="whiteAlpha.100"
                      />
                    </FormControl>
                  )}

                  <Button colorScheme="purple" onClick={sendTestEvent}>
                    Send Test Event
                  </Button>
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem border="none">
              <h2>
                <AccordionButton
                  _expanded={{ bg: 'whiteAlpha.100', color: 'white' }}
                >
                  <Box flex="1" textAlign="left" fontWeight="semibold">
                    Event Log ({eventLog.length})
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} bg="whiteAlpha.50" borderRadius="md">
                {eventLog.length === 0 ? (
                  <Text color="whiteAlpha.600">No events received yet</Text>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {eventLog.map((event, index) => (
                      <Box
                        key={index}
                        p={3}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor="whiteAlpha.300"
                        bg="whiteAlpha.100"
                      >
                        <HStack mb={2}>
                          <Badge
                            colorScheme={
                              event.type === 'newChallenge'
                                ? 'blue'
                                : event.type === 'challengeAccepted'
                                ? 'green'
                                : event.type === 'challengeRejected'
                                ? 'red'
                                : event.type === 'challengeCompleted'
                                ? 'orange'
                                : 'purple'
                            }
                          >
                            {event.type}
                          </Badge>
                          <Text fontSize="xs" color="whiteAlpha.700">
                            {event.timestamp
                              ? format(event.timestamp, 'HH:mm:ss')
                              : 'No timestamp'}
                          </Text>
                        </HStack>
                        <Code
                          p={2}
                          bg="blackAlpha.500"
                          borderRadius="md"
                          width="100%"
                          display="block"
                          whiteSpace="pre"
                          overflowX="auto"
                        >
                          {JSON.stringify(event.data, null, 2)}
                        </Code>
                      </Box>
                    ))}
                  </VStack>
                )}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>

        <Box p={3} bg="blackAlpha.500" borderRadius="md">
          <HStack>
            <InfoIcon color="blue.300" />
            <Text fontSize="sm">
              This panel is for development purposes only. It will be removed in
              production.
            </Text>
          </HStack>
        </Box>
      </VStack>
    </Box>
  )
}

export default QuickClashSocketDebug
