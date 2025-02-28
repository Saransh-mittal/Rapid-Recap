import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Badge,
  HStack,
  Button,
  Flex,
  Divider,
  Spinner,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Stack,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import {
  Trophy,
  Calendar,
  User,
  Timer,
  BarChart,
  ExternalLink,
  Medal,
  UserCheck,
  UserX,
  Brain,
  Zap,
  Settings,
} from 'lucide-react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { useSelector } from 'react-redux'
import AnalysisSummaryCard from './AnalysisSummaryCard'

// Lazy-loaded component
const ChallengeAnalysisModal = lazy(() => import('./ChallengeAnalysisModal'))

// Challenge Details Modal Component
const ChallengeDetailsModal = ({ isOpen, onClose, challenge, userId }) => {
  const { t } = useTranslation('QuickClash')

  if (!challenge) return null

  const isChallenger = challenge.challenger._id === userId
  const won = challenge.winner && challenge.winner === userId
  const tied =
    challenge.challengerScore > 0 &&
    challenge.opponentScore > 0 &&
    challenge.challengerScore === challenge.opponentScore

  const getDetailRows = () => [
    {
      label: t('Category'),
      value: challenge.category,
      icon: <Icon as={BarChart} />,
    },
    {
      label: t('Created'),
      value: format(new Date(challenge.createdAt), 'PPP'),
      icon: <Icon as={Calendar} />,
    },
    {
      label: t('Challenger'),
      value: `${challenge.challenger.name} (@${challenge.challenger.inGameName})`,
      icon: <Icon as={isChallenger ? UserCheck : User} />,
    },
    {
      label: t('Opponent'),
      value: `${challenge.opponent.name} (@${challenge.opponent.inGameName})`,
      icon: <Icon as={!isChallenger ? UserCheck : User} />,
    },
    {
      label: `${challenge.challenger.inGameName}'s Score`,
      value: challenge.challengerScore || t('Did not complete'),
      icon: <Icon as={Trophy} />,
    },
    {
      label: `${challenge.opponent.inGameName}'s Score`,
      value: challenge.opponentScore || t('Did not complete'),
      icon: <Icon as={Trophy} />,
    },
    {
      label: t('Winner'),
      value: challenge.winner
        ? won
          ? t('You')
          : isChallenger
          ? challenge.opponent.inGameName
          : challenge.challenger.inGameName
        : tied
        ? t('Tie')
        : t('Incomplete'),
      icon: <Icon as={Medal} />,
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <ModalContent
        bg="linear-gradient(135deg, #1a1527, #0f0d15)"
        borderRadius="xl"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
      >
        <ModalHeader color="white">
          {t('Challenge Details')}
          {won && (
            <Badge ml={2} colorScheme="green">
              {t('Victory')}
            </Badge>
          )}
          {tied && (
            <Badge ml={2} colorScheme="yellow">
              {t('Tie')}
            </Badge>
          )}
          {challenge.winner && !won && !tied && (
            <Badge ml={2} colorScheme="red">
              {t('Defeat')}
            </Badge>
          )}
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {getDetailRows().map((row, index) => (
              <HStack key={index} spacing={4}>
                <Flex
                  w="40px"
                  h="40px"
                  bg="whiteAlpha.100"
                  borderRadius="md"
                  justify="center"
                  align="center"
                >
                  <Box color="purple.300">{row.icon}</Box>
                </Flex>
                <Box>
                  <Text fontSize="sm" color="whiteAlpha.600">
                    {row.label}
                  </Text>
                  <Text fontWeight="bold" color="white">
                    {row.value}
                  </Text>
                </Box>
              </HStack>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

// Main CompletedChallenges Component
const CompletedChallenges = () => {
  const { t } = useTranslation('QuickClash')
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { user } = useSelector(state => state.auth)
  const userId = user?._id
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [challengeAnalyses, setChallengeAnalyses] = useState({})
  const [analysisLoading, setAnalysisLoading] = useState({})
  const [showCardView, setShowCardView] = useState(true)
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null)

  // Modal disclosures
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure()

  const {
    isOpen: isAnalysisOpen,
    onOpen: onAnalysisOpen,
    onClose: onAnalysisClose,
  } = useDisclosure()

  // Determine colors for the table
  const headerBg = useColorModeValue(
    'rgba(26, 21, 39, 0.9)',
    'rgba(26, 21, 39, 0.9)',
  )
  const rowBg = useColorModeValue(
    'rgba(26, 21, 39, 0.7)',
    'rgba(26, 21, 39, 0.7)',
  )
  const rowHoverBg = useColorModeValue(
    'rgba(26, 21, 39, 0.8)',
    'rgba(26, 21, 39, 0.8)',
  )

  // Fetch completed challenges
  useEffect(() => {
    if (!userId) return

    const fetchChallenges = async () => {
      try {
        setLoading(true)
        const response = await axios.get(
          '/api/quickClash/challenges/completed',
          {
            params: { page, limit: 10 },
          },
        )

        if (page === 1) {
          setChallenges(response.data.challenges)
        } else {
          setChallenges(prev => [...prev, ...response.data.challenges])
        }

        setHasMore(response.data.hasMore)
        setError(null)
      } catch (err) {
        setError('Failed to load completed challenges')
        console.error('Error fetching completed challenges:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [page, userId])

  // Fetch analyses for visible challenges
  useEffect(() => {
    if (!challenges.length || !userId) return

    // Only fetch for the first few challenges to avoid too many requests
    const challengesToFetch = challenges.slice(0, 5)

    challengesToFetch.forEach(challenge => {
      fetchChallengeAnalysis(challenge._id)
    })
  }, [challenges, userId])

  // Fetch a single challenge analysis
  const fetchChallengeAnalysis = async challengeId => {
    if (challengeAnalyses[challengeId] || analysisLoading[challengeId]) {
      return
    }

    setAnalysisLoading(prev => ({ ...prev, [challengeId]: true }))

    try {
      const response = await axios.get(
        `/api/quickClash/analysis/${challengeId}`,
      )
      if (response.data.success && response.data.analysis) {
        setChallengeAnalyses(prev => ({
          ...prev,
          [challengeId]: response.data.analysis,
        }))
      }
    } catch (error) {
      console.log(`Analysis not yet available for challenge ${challengeId}`)
      // We don't set an error here since it's expected that some challenges won't have analyses yet
    } finally {
      setAnalysisLoading(prev => ({ ...prev, [challengeId]: false }))
    }
  }

  // Generate analysis for a challenge
  const generateAnalysis = async challengeId => {
    setAnalysisLoading(prev => ({ ...prev, [challengeId]: true }))

    try {
      const response = await axios.post(
        `/api/quickClash/analysis/${challengeId}/generate`,
      )
      if (response.data.success && response.data.analysis) {
        setChallengeAnalyses(prev => ({
          ...prev,
          [challengeId]: response.data.analysis,
        }))
      }
    } catch (error) {
      console.error('Error generating analysis:', error)
    } finally {
      setAnalysisLoading(prev => ({ ...prev, [challengeId]: false }))
    }
  }

  // Handle viewing full analysis
  const handleViewAnalysis = challengeId => {
    setSelectedAnalysisId(challengeId)
    onAnalysisOpen()
  }

  // Handle opening challenge details modal
  const handleViewDetails = challenge => {
    setSelectedChallenge(challenge)
    onDetailOpen()
  }

  // Load more challenges
  const loadMore = () => {
    setPage(prev => prev + 1)
  }

  // Format the result of a challenge
  const getChallengeResult = challenge => {
    if (!userId) return { text: t('Unknown'), color: 'gray' }

    const isChallenger = challenge.challenger._id === userId

    // If the challenge is incomplete
    if (challenge.challengerScore === 0 || challenge.opponentScore === 0) {
      return { text: t('Incomplete'), color: 'gray' }
    }

    // If there's a tie
    if (challenge.challengerScore === challenge.opponentScore) {
      return { text: t('Tie'), color: 'yellow' }
    }

    // If the user won
    if (
      (isChallenger && challenge.challengerScore > challenge.opponentScore) ||
      (!isChallenger && challenge.opponentScore > challenge.challengerScore)
    ) {
      return { text: t('Victory'), color: 'green' }
    }

    // If the user lost
    return { text: t('Defeat'), color: 'red' }
  }

  if (loading && !challenges.length) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="whiteAlpha.700">
            {t('Loading completed challenges...')}
          </Text>
        </VStack>
      </Center>
    )
  }

  if (error && !challenges.length) {
    return (
      <Center py={10}>
        <Text color="whiteAlpha.700">{error}</Text>
      </Center>
    )
  }

  if (!loading && !challenges.length) {
    return (
      <Center py={10}>
        <Text color="whiteAlpha.700">{t('No completed challenges found')}</Text>
      </Center>
    )
  }

  return (
    <Box>
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" wrap="wrap">
          <Heading size="lg" color="whiteAlpha.900">
            {t('Completed Challenges')}
          </Heading>

          <HStack spacing={4}>
            <FormControl display="flex" alignItems="center" width="auto">
              <FormLabel
                htmlFor="view-switch"
                mb="0"
                color="whiteAlpha.900"
                fontSize="sm"
              >
                {t('AI Analysis View')}
              </FormLabel>
              <Switch
                id="view-switch"
                colorScheme="purple"
                isChecked={showCardView}
                onChange={() => setShowCardView(!showCardView)}
              />
            </FormControl>
          </HStack>
        </HStack>

        {showCardView ? (
          <VStack align="stretch" spacing={4} mt={2}>
            {challenges.map(challenge => {
              const analysis = challengeAnalyses[challenge._id]
              const isLoading = analysisLoading[challenge._id]

              return (
                <Box key={challenge._id}>
                  <HStack
                    mb={2}
                    justify="space-between"
                    bgColor="whiteAlpha.100"
                    p={2}
                    borderRadius="md"
                  >
                    <HStack>
                      <Text color="whiteAlpha.900" fontWeight="semibold">
                        {challenge.category} Challenge
                      </Text>
                      <Text color="whiteAlpha.600" fontSize="sm">
                        {format(new Date(challenge.createdAt), 'dd MMM yyyy')}
                      </Text>
                    </HStack>

                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="purple"
                      onClick={() => handleViewDetails(challenge)}
                    >
                      {t('Details')}
                    </Button>
                  </HStack>

                  {isLoading ? (
                    <Center p={4} bg={rowBg} borderRadius="lg">
                      <Spinner size="sm" color="purple.500" mr={2} />
                      <Text color="whiteAlpha.700">
                        {t('Loading analysis...')}
                      </Text>
                    </Center>
                  ) : (
                    <AnalysisSummaryCard
                      challenge={challenge}
                      analysis={analysis}
                      userId={userId}
                      onViewFull={() => {
                        if (analysis) {
                          handleViewAnalysis(challenge._id)
                        } else {
                          generateAnalysis(challenge._id)
                          handleViewAnalysis(challenge._id)
                        }
                      }}
                    />
                  )}
                </Box>
              )
            })}

            {hasMore && (
              <Center py={4}>
                <Button
                  onClick={loadMore}
                  isLoading={loading}
                  colorScheme="purple"
                  variant="outline"
                >
                  {t('Load More')}
                </Button>
              </Center>
            )}
          </VStack>
        ) : (
          <TableContainer>
            <Table variant="simple" size="md">
              <Thead>
                <Tr>
                  <Th bg={headerBg} color="white">
                    {t('Date')}
                  </Th>
                  <Th bg={headerBg} color="white">
                    {t('Opponent')}
                  </Th>
                  <Th bg={headerBg} color="white">
                    {t('Category')}
                  </Th>
                  <Th bg={headerBg} color="white">
                    {t('Score')}
                  </Th>
                  <Th bg={headerBg} color="white">
                    {t('Result')}
                  </Th>
                  <Th bg={headerBg} color="white">
                    {t('Actions')}
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {challenges.map(challenge => {
                  const isChallenger = challenge.challenger._id === userId
                  const opponent = isChallenger
                    ? challenge.opponent
                    : challenge.challenger
                  const myScore = isChallenger
                    ? challenge.challengerScore
                    : challenge.opponentScore
                  const opponentScore = isChallenger
                    ? challenge.opponentScore
                    : challenge.challengerScore
                  const result = getChallengeResult(challenge)

                  return (
                    <Tr
                      key={challenge._id}
                      bg={rowBg}
                      _hover={{ bg: rowHoverBg }}
                      transition="background-color 0.2s"
                    >
                      <Td color="white">
                        {format(new Date(challenge.createdAt), 'dd MMM yyyy')}
                      </Td>
                      <Td color="white">
                        <HStack>
                          <Text>{opponent.name}</Text>
                          <Text color="whiteAlpha.600" fontSize="sm">
                            @{opponent.inGameName}
                          </Text>
                        </HStack>
                      </Td>
                      <Td color="white">
                        <Badge colorScheme="purple">{challenge.category}</Badge>
                      </Td>
                      <Td color="white">
                        <HStack spacing={1}>
                          <Text fontWeight="bold">{myScore || 0}</Text>
                          <Text color="whiteAlpha.600">:</Text>
                          <Text fontWeight="bold">{opponentScore || 0}</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={result.color}>{result.text}</Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="purple"
                            leftIcon={<ExternalLink size={14} />}
                            onClick={() => handleViewDetails(challenge)}
                          >
                            {t('Details')}
                          </Button>

                          <Button
                            size="sm"
                            variant="solid"
                            colorScheme="purple"
                            leftIcon={<Brain size={14} />}
                            isLoading={analysisLoading[challenge._id]}
                            onClick={() => {
                              if (challengeAnalyses[challenge._id]) {
                                handleViewAnalysis(challenge._id)
                              } else {
                                generateAnalysis(challenge._id)
                                handleViewAnalysis(challenge._id)
                              }
                            }}
                          >
                            {t('AI Analysis')}
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {hasMore && !showCardView && (
          <Center py={4}>
            <Button
              onClick={loadMore}
              isLoading={loading}
              colorScheme="purple"
              variant="outline"
            >
              {t('Load More')}
            </Button>
          </Center>
        )}
      </VStack>

      <ChallengeDetailsModal
        isOpen={isDetailOpen}
        onClose={onDetailClose}
        challenge={selectedChallenge}
        userId={userId}
      />

      {selectedAnalysisId && (
        <Suspense
          fallback={
            <Modal isOpen={isAnalysisOpen} onClose={onAnalysisClose}>
              <ModalOverlay backdropFilter="blur(5px)" />
              <ModalContent bg="rgba(26, 21, 39, 0.95)">
                <Center p={10}>
                  <Spinner size="xl" color="purple.500" thickness="4px" />
                </Center>
              </ModalContent>
            </Modal>
          }
        >
          <ChallengeAnalysisModal
            isOpen={isAnalysisOpen}
            onClose={onAnalysisClose}
            challengeId={selectedAnalysisId}
          />
        </Suspense>
      )}
    </Box>
  )
}

export default CompletedChallenges
