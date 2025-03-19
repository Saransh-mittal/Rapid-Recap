// components/dashboardComponents/InterBotQuickClashModal.jsx
import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Text,
  Flex,
  Heading,
  VStack,
  HStack,
  Badge,
  Divider,
  useToast,
  Spinner,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  Icon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FaRobot, FaTrophy, FaMedal, FaBolt, FaHistory } from 'react-icons/fa'
import { BiLoaderCircle } from 'react-icons/bi'

// Styled components with motion
const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionBadge = motion(Badge)

const categories = [
  'World',
  'Politics',
  'Business',
  'Technology',
  'Sports',
  'Health',
  'Science',
  'Environment',
]

const InterBotQuickClashModal = ({ isOpen, onClose }) => {
  const toast = useToast()

  // State for form data
  const [simCount, setSimCount] = useState(5)
  const [selectedCategories, setSelectedCategories] = useState([
    'Technology',
    'Science',
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingBots, setIsLoadingBots] = useState(false)
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const [bots, setBots] = useState([])
  const [results, setResults] = useState([])
  const [recentResults, setRecentResults] = useState([])

  // Fetch bots when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBots()
      fetchRecentResults()
    }
  }, [isOpen])

  // Fetch available bots
  const fetchBots = async () => {
    try {
      setIsLoadingBots(true)
      const response = await axios.get('/api/admin/quickclash/bots?count=20')
      if (response.data.success) {
        setBots(response.data.bots)
      }
    } catch (error) {
      toast({
        title: 'Error fetching bots',
        description:
          error.response?.data?.message || 'Failed to fetch bot users',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoadingBots(false)
    }
  }

  // Fetch recent inter-bot challenge results
  const fetchRecentResults = async () => {
    try {
      setIsLoadingResults(true)
      const response = await axios.get('/api/admin/quickclash/results')
      if (response.data.success) {
        setRecentResults(response.data.results)
      }
    } catch (error) {
      toast({
        title: 'Error fetching results',
        description:
          error.response?.data?.message || 'Failed to fetch recent results',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoadingResults(false)
    }
  }

  // Handle category selection
  const handleCategoryChange = (index, value) => {
    const newCategories = [...selectedCategories]
    newCategories[index] = value
    setSelectedCategories(newCategories)
  }

  // Handle simulation submission
  const handleSimulate = async () => {
    try {
      setIsLoading(true)
      setResults([]) // Clear previous results

      // Validate categories
      if (
        selectedCategories.length !== 2 ||
        selectedCategories[0] === selectedCategories[1]
      ) {
        toast({
          title: 'Invalid Categories',
          description: 'Please select two different categories',
          status: 'warning',
          duration: 4000,
          isClosable: true,
        })
        setIsLoading(false)
        return
      }

      const response = await axios.post(
        '/api/admin/quickclash/simulate-multiple',
        {
          count: simCount,
          categories: selectedCategories,
          options: {
            quickResponse: true, // Speed up the simulation
          },
        },
      )

      if (response.data.success) {
        setResults(response.data.results)
        toast({
          title: 'Simulation Completed',
          description: `Successfully simulated ${response.data.count} inter-bot challenges`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        // Refresh recent results
        fetchRecentResults()
      }
    } catch (error) {
      toast({
        title: 'Simulation Failed',
        description:
          error.response?.data?.message ||
          'Failed to simulate inter-bot challenges',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent
        as={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        bg="gray.800"
        color="white"
      >
        <ModalHeader>
          <Flex align="center">
            <Icon as={FaRobot} mr={2} color="purple.300" />
            <Text>Inter-Bot Quick Clash Simulator</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Tabs variant="soft-rounded" colorScheme="purple" isFitted>
            <TabList mb={4}>
              <Tab>
                <Icon as={FaBolt} mr={2} /> Simulate
              </Tab>
              <Tab>
                <Icon as={FaHistory} mr={2} /> Recent Results
              </Tab>
            </TabList>

            <TabPanels>
              {/* Simulation Panel */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Bot status */}
                  <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    p={4}
                    bg="gray.700"
                    borderRadius="md"
                  >
                    <Flex justify="space-between" align="center">
                      <HStack>
                        <Icon as={FaRobot} color="green.400" />
                        <Text fontWeight="medium">Available Bots:</Text>
                      </HStack>
                      {isLoadingBots ? (
                        <Spinner size="sm" color="purple.300" />
                      ) : (
                        <Badge
                          colorScheme={bots.length > 0 ? 'green' : 'red'}
                          fontSize="0.9em"
                        >
                          {bots.length} Bots
                        </Badge>
                      )}
                    </Flex>
                  </MotionBox>

                  {/* Simulation Form */}
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    p={4}
                    bg="gray.700"
                    borderRadius="md"
                  >
                    <VStack spacing={4} align="stretch">
                      <Heading size="sm" mb={2}>
                        Simulation Settings
                      </Heading>
                      <Box bg="green.800" p={2} borderRadius="md">
                        <Text fontSize="sm" color="green.100">
                          <Icon as={FaBolt} mr={2} color="green.300" />
                          Using simulated article data (no AI resources
                          consumed)
                        </Text>
                      </Box>

                      <Box bg="blue.800" p={2} borderRadius="md">
                        <Text fontSize="sm" color="blue.100">
                          <Icon as={BiLoaderCircle} mr={2} color="blue.300" />
                          Simulations run sequentially with delay between
                          attempts to prevent database conflicts
                        </Text>
                      </Box>

                      <FormControl>
                        <FormLabel>Number of Challenges</FormLabel>
                        <NumberInput
                          min={1}
                          max={20}
                          value={simCount}
                          onChange={value => setSimCount(parseInt(value))}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Categories</FormLabel>
                        <HStack>
                          <Select
                            value={selectedCategories[0]}
                            onChange={e =>
                              handleCategoryChange(0, e.target.value)
                            }
                          >
                            {categories.map(cat => (
                              <option key={`cat1-${cat}`} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </Select>
                          <Select
                            value={selectedCategories[1]}
                            onChange={e =>
                              handleCategoryChange(1, e.target.value)
                            }
                          >
                            {categories.map(cat => (
                              <option key={`cat2-${cat}`} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </Select>
                        </HStack>
                      </FormControl>

                      <Button
                        colorScheme="purple"
                        onClick={handleSimulate}
                        isLoading={isLoading}
                        loadingText={`Simulating... (this may take a few minutes)`}
                        leftIcon={<FaRobot />}
                        isDisabled={bots.length < simCount * 2}
                      >
                        Run Simulation
                      </Button>

                      {bots.length < simCount * 2 && (
                        <Text color="yellow.300" fontSize="sm">
                          Not enough bots available. Need {simCount * 2} bots,
                          found {bots.length}.
                        </Text>
                      )}
                    </VStack>
                  </MotionBox>

                  {/* Results Section */}
                  {results.length > 0 && (
                    <MotionBox
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      p={4}
                      bg="gray.700"
                      borderRadius="md"
                    >
                      <Heading size="sm" mb={4}>
                        Simulation Results
                      </Heading>

                      <VStack spacing={3} align="stretch">
                        {results.map((result, idx) => (
                          <MotionBox
                            key={`result-${idx}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            p={3}
                            bg="gray.600"
                            borderRadius="md"
                            borderLeftWidth="4px"
                            borderLeftColor={
                              result.challengerScore > result.opponentScore
                                ? 'blue.400'
                                : result.opponentScore > result.challengerScore
                                ? 'green.400'
                                : 'yellow.400'
                            }
                          >
                            <Flex justify="space-between" align="center">
                              <VStack align="start" spacing={0}>
                                <HStack>
                                  <Text fontWeight="bold">
                                    {result.challengerName}
                                  </Text>
                                  {result.challengerScore >
                                    result.opponentScore && (
                                    <Icon as={FaTrophy} color="yellow.400" />
                                  )}
                                </HStack>
                                <Badge colorScheme="blue">
                                  {result.challengerScore} pts
                                </Badge>
                              </VStack>

                              <Text fontWeight="bold" color="gray.400">
                                VS
                              </Text>

                              <VStack align="end" spacing={0}>
                                <HStack>
                                  {result.opponentScore >
                                    result.challengerScore && (
                                    <Icon as={FaTrophy} color="yellow.400" />
                                  )}
                                  <Text fontWeight="bold">
                                    {result.opponentName}
                                  </Text>
                                </HStack>
                                <Badge colorScheme="green">
                                  {result.opponentScore} pts
                                </Badge>
                              </VStack>
                            </Flex>

                            <Divider my={2} />

                            <Flex justify="space-between" align="center">
                              <Text fontSize="xs" color="gray.400">
                                Category: {result.categories.join(', ')}
                              </Text>

                              <Badge
                                colorScheme={
                                  result.challengerScore ===
                                  result.opponentScore
                                    ? 'yellow'
                                    : 'purple'
                                }
                                fontSize="xs"
                              >
                                {result.challengerScore === result.opponentScore
                                  ? 'Tie'
                                  : 'Completed'}
                              </Badge>
                            </Flex>
                          </MotionBox>
                        ))}
                      </VStack>
                    </MotionBox>
                  )}
                </VStack>
              </TabPanel>

              {/* Recent Results Panel */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Flex justify="space-between" align="center">
                    <Heading size="sm">Recent Inter-Bot Challenges</Heading>
                    <Button
                      size="xs"
                      onClick={fetchRecentResults}
                      isLoading={isLoadingResults}
                      leftIcon={<BiLoaderCircle />}
                      colorScheme="purple"
                      variant="outline"
                    >
                      Refresh
                    </Button>
                  </Flex>

                  {isLoadingResults ? (
                    <Flex justify="center" py={8}>
                      <Spinner color="purple.400" />
                    </Flex>
                  ) : recentResults.length === 0 ? (
                    <Box
                      p={6}
                      textAlign="center"
                      bg="gray.700"
                      borderRadius="md"
                    >
                      <Text color="gray.400">
                        No recent inter-bot challenges found
                      </Text>
                    </Box>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Challenger</Th>
                            <Th isNumeric>Score</Th>
                            <Th>Opponent</Th>
                            <Th isNumeric>Score</Th>
                            <Th>Category</Th>
                            <Th>Result</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {recentResults.map((result, idx) => (
                            <Tr key={`recent-${idx}`}>
                              <Td>
                                {result.challenger.inGameName ||
                                  result.challenger.name}
                              </Td>
                              <Td isNumeric fontWeight="bold">
                                {result.challengerScore}
                              </Td>
                              <Td>
                                {result.opponent.inGameName ||
                                  result.opponent.name}
                              </Td>
                              <Td isNumeric fontWeight="bold">
                                {result.opponentScore}
                              </Td>
                              <Td>{result.category}</Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    result.challengerScore >
                                    result.opponentScore
                                      ? 'blue'
                                      : result.opponentScore >
                                        result.challengerScore
                                      ? 'green'
                                      : 'yellow'
                                  }
                                >
                                  {result.challengerScore > result.opponentScore
                                    ? 'Challenger'
                                    : result.opponentScore >
                                      result.challengerScore
                                    ? 'Opponent'
                                    : 'Tie'}
                                </Badge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default InterBotQuickClashModal
