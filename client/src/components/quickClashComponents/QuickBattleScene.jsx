// components/quickClashComponents/QuickBattleScene.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react'
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
  Icon,
  useColorModeValue,
  useDisclosure,
  Avatar,
  Fade,
  Progress,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Clock,
  Brain,
  Star,
  Zap,
  CheckCircle,
  XCircle,
  Share2,
  Bookmark,
  Home,
  ChevronRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'

// Lazy loaded components
const ChallengeAnalysisModal = lazy(() => import('./ChallengeAnalysisModal'))

const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)

// Battle Results Banner Component
const BattleResultsBanner = ({ challenge, userId, winner }) => {
  const { t } = useTranslation('QuickClash')
  const isChallenger = challenge.challenger._id === userId
  const userScore = isChallenger
    ? challenge.challengerScore
    : challenge.opponentScore
  const opponentScore = isChallenger
    ? challenge.opponentScore
    : challenge.challengerScore
  const opponent = isChallenger ? challenge.opponent : challenge.challenger

  // Calculate result
  const userIsWinner = userScore > opponentScore
  const isTie = userScore === opponentScore && userScore > 0

  // Design values
  const bgColor = userIsWinner ? 'purple.900' : isTie ? 'blue.900' : 'gray.800'
  const borderColor = userIsWinner
    ? 'yellow.400'
    : isTie
    ? 'blue.400'
    : 'whiteAlpha.300'
  const resultText = userIsWinner
    ? t('Victory!')
    : isTie
    ? t('Draw')
    : t('Defeat')
  const resultColor = userIsWinner ? 'green' : isTie ? 'blue' : 'gray'

  return (
    <MotionBox
      p={6}
      borderRadius="lg"
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <VStack spacing={4}>
        <MotionText
          fontSize="2xl"
          fontWeight="bold"
          color="white"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {userIsWinner ? '🏆 ' : isTie ? '🤝 ' : '⭐ '}
          {resultText}
          {userIsWinner ? ' 🏆' : isTie ? ' 🤝' : ' ⭐'}
        </MotionText>

        <HStack justify="space-between" width="100%" mt={4}>
          <VStack align="center">
            <Avatar
              name={winner?.user?.name}
              src={winner?.user?.pic}
              size="lg"
              mb={2}
            />
            <Text fontWeight="bold">
              {userId === winner?.user?._id
                ? t('You')
                : winner?.user?.inGameName}
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="white">
              {userScore}
            </Text>
          </VStack>

          <VStack>
            <Text fontSize="lg" color="whiteAlpha.600">
              {t('VS')}
            </Text>
            <Divider orientation="vertical" height="40px" />
          </VStack>

          <VStack align="center">
            <Avatar name={opponent?.name} size="lg" mb={2} />
            <Text fontWeight="bold">{opponent?.inGameName}</Text>
            <Text fontSize="3xl" fontWeight="bold" color="white">
              {opponentScore}
            </Text>
          </VStack>
        </HStack>

        <Badge
          px={4}
          py={2}
          borderRadius="full"
          fontSize="md"
          colorScheme={resultColor}
          mt={4}
        >
          {resultText}
        </Badge>
      </VStack>
    </MotionBox>
  )
}

// Quick Stats Card Component
const QuickStatsCard = ({ stats, opponent }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionBox
      p={4}
      borderRadius="md"
      bg="whiteAlpha.100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Heading size="sm" mb={4}>
        {t('Quick Battle Stats')}
      </Heading>

      <HStack spacing={4} justify="space-between" wrap="wrap">
        <VStack align="start" minW="140px">
          <Text color="whiteAlpha.600" fontSize="sm">
            {t('Reading Time')}
          </Text>
          <HStack>
            <Icon as={Clock} color="blue.400" />
            <Text fontWeight="bold">{stats.readingTime}s</Text>
            <Badge colorScheme="blue" variant="outline" fontSize="xs">
              {t('Top')} {Math.round(stats.readingSpeedPercentile)}%
            </Badge>
          </HStack>
        </VStack>

        <VStack align="start" minW="140px">
          <Text color="whiteAlpha.600" fontSize="sm">
            {t('Quiz Speed')}
          </Text>
          <HStack>
            <Icon as={Zap} color="yellow.400" />
            <Text fontWeight="bold">
              {stats.quizSpeed.toFixed(1)}s {t('per question')}
            </Text>
          </HStack>
        </VStack>

        <VStack align="start" minW="140px">
          <Text color="whiteAlpha.600" fontSize="sm">
            {t('Current Streak')}
          </Text>
          <HStack>
            <Icon as={Trophy} color="orange.400" />
            <Text fontWeight="bold">
              {stats.currentStreak} {t('wins')}
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </MotionBox>
  )
}

// Witty Analysis Banner Component
const WittyAnalysisBanner = ({ analysis }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionFlex
      p={5}
      borderRadius="lg"
      bg="blackAlpha.400"
      direction="column"
      align="center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Icon as={Brain} color="purple.400" boxSize={8} mb={3} />

      <Text
        fontSize="lg"
        fontStyle="italic"
        textAlign="center"
        color="yellow.200"
        mb={4}
      >
        {analysis.wittyAnalysis}
      </Text>

      <HStack spacing={4}>
        <Button
          leftIcon={<Bookmark size={16} />}
          variant="outline"
          colorScheme="purple"
          size="sm"
        >
          {t('Save')}
        </Button>

        <Button leftIcon={<Share2 size={16} />} colorScheme="purple" size="sm">
          {t('Share')}
        </Button>
      </HStack>
    </MotionFlex>
  )
}

// Strength Comparison Component
const StrengthComparison = ({ userAnalysis, opponentAnalysis }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionBox
      p={4}
      borderRadius="md"
      bg="whiteAlpha.100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Heading size="sm" mb={4}>
        {t('Knowledge Comparison')}
      </Heading>

      <VStack spacing={5} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="sm">
            {t('Factual Recall')}
          </Text>
          <Text fontWeight="bold" fontSize="sm">
            {userAnalysis.knowledgePatterns.factualRecall.toFixed(0)}% vs{' '}
            {opponentAnalysis.knowledgePatterns.factualRecall.toFixed(0)}%
          </Text>
        </HStack>
        <Progress
          value={
            (userAnalysis.knowledgePatterns.factualRecall /
              (userAnalysis.knowledgePatterns.factualRecall +
                opponentAnalysis.knowledgePatterns.factualRecall)) *
            100
          }
          colorScheme={
            userAnalysis.knowledgePatterns.factualRecall >=
            opponentAnalysis.knowledgePatterns.factualRecall
              ? 'green'
              : 'red'
          }
          borderRadius="full"
          height="8px"
        />

        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="sm">
            {t('Technical Terms')}
          </Text>
          <Text fontWeight="bold" fontSize="sm">
            {userAnalysis.knowledgePatterns.technicalTerms.toFixed(0)}% vs{' '}
            {opponentAnalysis.knowledgePatterns.technicalTerms.toFixed(0)}%
          </Text>
        </HStack>
        <Progress
          value={
            (userAnalysis.knowledgePatterns.technicalTerms /
              (userAnalysis.knowledgePatterns.technicalTerms +
                opponentAnalysis.knowledgePatterns.technicalTerms)) *
            100
          }
          colorScheme={
            userAnalysis.knowledgePatterns.technicalTerms >=
            opponentAnalysis.knowledgePatterns.technicalTerms
              ? 'green'
              : 'red'
          }
          borderRadius="full"
          height="8px"
        />

        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="sm">
            {t('Strategic Analysis')}
          </Text>
          <Text fontWeight="bold" fontSize="sm">
            {userAnalysis.knowledgePatterns.strategicAnalysis.toFixed(0)}% vs{' '}
            {opponentAnalysis.knowledgePatterns.strategicAnalysis.toFixed(0)}%
          </Text>
        </HStack>
        <Progress
          value={
            (userAnalysis.knowledgePatterns.strategicAnalysis /
              (userAnalysis.knowledgePatterns.strategicAnalysis +
                opponentAnalysis.knowledgePatterns.strategicAnalysis)) *
            100
          }
          colorScheme={
            userAnalysis.knowledgePatterns.strategicAnalysis >=
            opponentAnalysis.knowledgePatterns.strategicAnalysis
              ? 'green'
              : 'red'
          }
          borderRadius="full"
          height="8px"
        />
      </VStack>
    </MotionBox>
  )
}

// Topic Suggestions Component
const TopicSuggestions = ({ topicSuggestions, category }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionBox
      p={4}
      borderRadius="md"
      bg="whiteAlpha.100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
    >
      <Heading size="sm" mb={4}>
        {t('Recommended Topics in')} {category}
      </Heading>

      <Flex wrap="wrap" gap={3}>
        {topicSuggestions.map((topic, index) => (
          <Button
            key={index}
            leftIcon={<Star size={14} />}
            size="sm"
            variant="outline"
            colorScheme="purple"
          >
            {topic}
          </Button>
        ))}
      </Flex>
    </MotionBox>
  )
}

// Main QuickBattleScene Component
const QuickBattleScene = ({ challengeId }) => {
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)
  const userId = user?._id
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [challenge, setChallenge] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [showAnalysisProgress, setShowAnalysisProgress] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  const {
    isOpen: isAnalysisOpen,
    onOpen: onAnalysisOpen,
    onClose: onAnalysisClose,
  } = useDisclosure()

  // Fetch challenge data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get challenge data
        const challengeResponse = await axios.get(
          `/api/quickClash/challenge/${challengeId}`,
        )
        setChallenge(challengeResponse.data.challenge)

        // Check if both players have completed
        const isCompleted =
          challengeResponse.data.challenge.challengerScore > 0 &&
          challengeResponse.data.challenge.opponentScore > 0

        if (isCompleted) {
          // Try to get existing analysis
          try {
            const analysisResponse = await axios.get(
              `/api/quickClash/analysis/${challengeId}`,
            )
            if (
              analysisResponse.data.success &&
              analysisResponse.data.analysis
            ) {
              setAnalysis(analysisResponse.data.analysis)
            } else {
              // Generate analysis with progress simulation
              setShowAnalysisProgress(true)
              simulateAnalysisProgress()
              generateAnalysis(challengeId)
            }
          } catch (error) {
            // Generate analysis with progress simulation
            setShowAnalysisProgress(true)
            simulateAnalysisProgress()
            generateAnalysis(challengeId)
          }
        }
      } catch (error) {
        setError('Failed to load battle data')
        console.error('Error in QuickBattleScene:', error)
      } finally {
        setLoading(false)
      }
    }

    if (challengeId && userId) {
      fetchData()
    }
  }, [challengeId, userId])

  // Generate analysis
  const generateAnalysis = async challengeId => {
    try {
      const response = await axios.post(
        `/api/quickClash/analysis/${challengeId}/generate`,
      )
      if (response.data.success && response.data.analysis) {
        setAnalysis(response.data.analysis)
        setShowAnalysisProgress(false)
      }
    } catch (error) {
      console.error('Error generating analysis:', error)
      setShowAnalysisProgress(false)
    }
  }

  // Simulate analysis progress
  const simulateAnalysisProgress = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
      }
      setAnalysisProgress(Math.min(Math.round(progress), 100))
    }, 500)
  }

  // Handle "View Full Analysis" button click
  const handleViewFullAnalysis = () => {
    onAnalysisOpen()
  }

  // Loading state
  if (loading) {
    return (
      <Center height="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="whiteAlpha.700">{t('Loading battle results...')}</Text>
        </VStack>
      </Center>
    )
  }

  // Error state
  if (error) {
    return (
      <Center height="60vh">
        <VStack spacing={6}>
          <Icon as={XCircle} boxSize={12} color="red.400" />
          <Text color="whiteAlpha.800" fontSize="xl">
            {error}
          </Text>
          <Button
            leftIcon={<Home size={16} />}
            colorScheme="purple"
            onClick={() => navigate('/quickclash')}
          >
            {t('Return to Challenges')}
          </Button>
        </VStack>
      </Center>
    )
  }

  // Not completed state
  if (!challenge?.challengerScore || !challenge?.opponentScore) {
    return (
      <Center height="60vh">
        <VStack spacing={6}>
          <Icon as={Clock} boxSize={12} color="blue.400" />
          <Text color="whiteAlpha.800" fontSize="xl">
            {t('Waiting for your opponent to complete the challenge...')}
          </Text>
          <Button
            leftIcon={<Home size={16} />}
            colorScheme="purple"
            onClick={() => navigate('/quickclash')}
          >
            {t('Return to Challenges')}
          </Button>
        </VStack>
      </Center>
    )
  }

  // Analysis progress state
  if (showAnalysisProgress) {
    return (
      <Center height="60vh">
        <VStack spacing={6} maxW="600px" w="100%" textAlign="center">
          <Icon as={Brain} boxSize={12} color="purple.400" />
          <Heading size="lg" color="white">
            {t('Generating AI Battle Analysis')}
          </Heading>

          <Progress
            value={analysisProgress}
            colorScheme="purple"
            size="lg"
            width="100%"
            borderRadius="full"
            mb={2}
          />

          <Text color="whiteAlpha.800">
            {t(
              'Our AI is analyzing your performance and creating personalized insights...',
            )}
          </Text>

          <HStack spacing={4} mt={4}>
            <Icon as={Zap} color="yellow.400" />
            <Text color="yellow.400" fontStyle="italic">
              {analysisProgress <= 30
                ? t('Evaluating battle metrics...')
                : analysisProgress <= 60
                ? t('Identifying strengths and growth areas...')
                : t('Generating personalized recommendations...')}
            </Text>
          </HStack>
        </VStack>
      </Center>
    )
  }

  // When we have all the data and analysis
  if (challenge && analysis) {
    const { battleMetrics, userAnalysis, opponentAnalysis, engagement } =
      analysis

    const isChallenger = challenge.challenger._id === userId
    const winner = {
      userId:
        challenge.challengerScore > challenge.opponentScore
          ? challenge.challenger._id
          : challenge.opponentScore > challenge.challengerScore
          ? challenge.opponent._id
          : null,
      user: isChallenger
        ? challenge.challengerScore > challenge.opponentScore
          ? challenge.challenger
          : challenge.opponent
        : challenge.opponentScore > challenge.challengerScore
        ? challenge.opponent
        : challenge.challenger,
    }

    return (
      <Box maxW="1000px" mx="auto" pb={10}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" wrap="wrap">
            <Button
              leftIcon={<Home size={16} />}
              variant="ghost"
              size="sm"
              onClick={() => navigate('/quickclash')}
            >
              {t('Back to Challenges')}
            </Button>

            <HStack>
              <Badge colorScheme="purple" p={2} borderRadius="md">
                {battleMetrics.category}
              </Badge>
              <Badge
                colorScheme={
                  battleMetrics.difficulty === 'easy'
                    ? 'green'
                    : battleMetrics.difficulty === 'medium'
                    ? 'blue'
                    : 'red'
                }
                p={2}
                borderRadius="md"
              >
                {battleMetrics.difficulty}
              </Badge>
            </HStack>
          </HStack>

          {/* Main Battle Results */}
          <BattleResultsBanner
            challenge={challenge}
            userId={userId}
            winner={winner}
          />

          {/* Quick Stats Card */}
          <QuickStatsCard
            stats={userAnalysis.performance}
            opponent={opponentAnalysis.performance}
          />

          {/* Witty Analysis Banner */}
          <WittyAnalysisBanner analysis={engagement} />

          {/* Strength Comparison */}
          <StrengthComparison
            userAnalysis={userAnalysis.analysis.knowledgePatterns}
            opponentAnalysis={opponentAnalysis.analysis.knowledgePatterns}
          />

          {/* Topic Suggestions */}
          <TopicSuggestions
            topicSuggestions={engagement.topicSuggestions}
            category={battleMetrics.category}
          />

          {/* View Full Analysis Button */}
          <Flex justify="center" mt={4}>
            <Button
              leftIcon={<Brain size={16} />}
              rightIcon={<ChevronRight size={16} />}
              colorScheme="purple"
              size="lg"
              onClick={handleViewFullAnalysis}
            >
              {t('View Detailed Analysis')}
            </Button>
          </Flex>
        </VStack>

        {/* Full Analysis Modal */}
        {isAnalysisOpen && (
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
              challengeId={challengeId}
            />
          </Suspense>
        )}
      </Box>
    )
  }

  // Fallback
  return null
}

export default QuickBattleScene
