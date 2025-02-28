// components/quickClashComponents/ChallengeAnalysisModal.jsx
import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Flex,
  Heading,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  useBreakpointValue,
  Divider,
  SimpleGrid,
  List,
  ListItem,
  ListIcon,
  Button,
  Tag,
  Avatar,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Brain,
  CheckCircle,
  XCircle,
  BarChart,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Award,
  Star,
  Zap,
  Lightbulb,
  BookOpen,
  Share2,
  Flame,
  Bookmark,
  Download,
} from 'lucide-react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

// Motion components
const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionText = motion(Text)
const MotionProgress = motion(Progress)

// Knowledge pattern chart
const KnowledgePatternChart = ({ patterns }) => {
  const { factualRecall, technicalTerms, strategicAnalysis } = patterns

  return (
    <VStack spacing={4} w="100%" align="stretch" mt={2}>
      <HStack>
        <Text fontSize="sm" width="140px">
          Factual Recall:
        </Text>
        <MotionProgress
          value={factualRecall}
          colorScheme="green"
          borderRadius="full"
          size="sm"
          flex="1"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.8 }}
        />
        <Text fontWeight="bold" width="40px">
          {Math.round(factualRecall)}%
        </Text>
      </HStack>

      <HStack>
        <Text fontSize="sm" width="140px">
          Technical Terms:
        </Text>
        <MotionProgress
          value={technicalTerms}
          colorScheme="blue"
          borderRadius="full"
          size="sm"
          flex="1"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <Text fontWeight="bold" width="40px">
          {Math.round(technicalTerms)}%
        </Text>
      </HStack>

      <HStack>
        <Text fontSize="sm" width="140px">
          Strategic Analysis:
        </Text>
        <MotionProgress
          value={strategicAnalysis}
          colorScheme="purple"
          borderRadius="full"
          size="sm"
          flex="1"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        <Text fontWeight="bold" width="40px">
          {Math.round(strategicAnalysis)}%
        </Text>
      </HStack>
    </VStack>
  )
}

// Strengths and Weaknesses
const StrengthsWeaknesses = ({ strengths, weaknesses }) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={2}>
      <Box>
        <HStack mb={2}>
          <Icon as={CheckCircle} color="green.400" />
          <Text fontWeight="bold">Strengths</Text>
        </HStack>
        <List spacing={2}>
          {strengths.map((strength, index) => (
            <ListItem key={index} pl={1}>
              <ListIcon as={Star} color="green.400" />
              {strength}
            </ListItem>
          ))}
        </List>
      </Box>

      <Box>
        <HStack mb={2}>
          <Icon as={Target} color="red.400" />
          <Text fontWeight="bold">Areas for Growth</Text>
        </HStack>
        <List spacing={2}>
          {weaknesses.map((weakness, index) => (
            <ListItem key={index} pl={1}>
              <ListIcon as={TrendingUp} color="red.400" />
              {weakness}
            </ListItem>
          ))}
        </List>
      </Box>
    </SimpleGrid>
  )
}

// Performance Metrics
const PerformanceMetrics = ({ performance, opponent }) => {
  const getSpeedTrendIcon = trend => {
    switch (trend) {
      case 'improving':
        return TrendingUp
      case 'declining':
        return TrendingDown
      default:
        return Minus
    }
  }

  const getSpeedTrendColor = trend => {
    switch (trend) {
      case 'improving':
        return 'green.400'
      case 'declining':
        return 'red.400'
      default:
        return 'blue.400'
    }
  }

  return (
    <Box mt={3}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <MotionBox
          p={4}
          borderRadius="md"
          bg="whiteAlpha.100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <HStack mb={2}>
            <Icon as={Clock} color="blue.300" />
            <Text fontWeight="bold">Reading Speed</Text>
          </HStack>
          <HStack justify="space-between">
            <Text>{performance.readingTime} seconds</Text>
            <Badge colorScheme="blue">
              Top {Math.round(performance.readingSpeedPercentile)}%
            </Badge>
          </HStack>
        </MotionBox>

        <MotionBox
          p={4}
          borderRadius="md"
          bg="whiteAlpha.100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <HStack mb={2}>
            <Icon
              as={getSpeedTrendIcon(performance.quizSpeedTrend)}
              color={getSpeedTrendColor(performance.quizSpeedTrend)}
            />
            <Text fontWeight="bold">Quiz Speed</Text>
          </HStack>
          <HStack justify="space-between">
            <Text>{performance.quizSpeed.toFixed(1)} seconds/question</Text>
            <Badge
              colorScheme={
                performance.quizSpeedTrend === 'improving'
                  ? 'green'
                  : performance.quizSpeedTrend === 'declining'
                  ? 'red'
                  : 'blue'
              }
            >
              {performance.quizSpeedTrend.charAt(0).toUpperCase() +
                performance.quizSpeedTrend.slice(1)}
            </Badge>
          </HStack>
        </MotionBox>
      </SimpleGrid>

      <MotionBox
        mt={4}
        p={4}
        borderRadius="md"
        bg="whiteAlpha.100"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <HStack mb={2}>
          <Icon as={BarChart} color="purple.300" />
          <Text fontWeight="bold">Score Comparison</Text>
        </HStack>
        <HStack spacing={4} mt={2}>
          <VStack flex="1">
            <Text fontWeight="bold" fontSize="xl">
              {performance.finalScore}
            </Text>
            <Text fontSize="sm">Your Score</Text>
          </VStack>
          <Box w="1px" h="40px" bg="whiteAlpha.300" />
          <VStack flex="1">
            <Text fontWeight="bold" fontSize="xl">
              {opponent.finalScore}
            </Text>
            <Text fontSize="sm">Opponent's Score</Text>
          </VStack>
        </HStack>
      </MotionBox>
    </Box>
  )
}

// Learning Path
const LearningPath = ({ learningPath }) => {
  const { focusAreas, topicSuggestions, nextSteps } = learningPath

  return (
    <Box mt={4}>
      <Heading size="sm" mb={4}>
        Personal Learning Recommendations
      </Heading>

      <Box mb={6}>
        <HStack mb={2}>
          <Icon as={Target} color="yellow.400" />
          <Text fontWeight="bold">Focus Areas</Text>
        </HStack>
        <HStack mt={2} wrap="wrap" spacing={2}>
          {focusAreas.map((area, index) => (
            <Tag
              key={index}
              colorScheme="yellow"
              size="md"
              borderRadius="full"
              mb={2}
            >
              {area}
            </Tag>
          ))}
        </HStack>
      </Box>

      <Box mb={6}>
        <HStack mb={2}>
          <Icon as={BookOpen} color="purple.400" />
          <Text fontWeight="bold">Suggested Topics</Text>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} mt={2}>
          {topicSuggestions.map((topic, index) => (
            <HStack key={index}>
              <Icon as={Star} color="purple.300" boxSize="14px" />
              <Text fontSize="sm">{topic}</Text>
            </HStack>
          ))}
        </SimpleGrid>
      </Box>

      <Box>
        <HStack mb={2}>
          <Icon as={Lightbulb} color="blue.400" />
          <Text fontWeight="bold">Next Steps</Text>
        </HStack>
        <List spacing={2} mt={2}>
          {nextSteps.map((step, index) => (
            <ListItem key={index}>
              <ListIcon as={CheckCircle} color="blue.400" />
              {step}
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  )
}

// Statistics
const Statistics = ({ statistics }) => {
  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mt={4}>
      <MotionBox
        p={3}
        borderRadius="md"
        bg="whiteAlpha.100"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Text fontSize="sm" color="whiteAlpha.700">
          Current Streak
        </Text>
        <HStack mt={1}>
          <Icon as={Flame} color="orange.400" />
          <Text fontWeight="bold" fontSize="xl">
            {statistics.currentStreak}
          </Text>
        </HStack>
      </MotionBox>

      <MotionBox
        p={3}
        borderRadius="md"
        bg="whiteAlpha.100"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Text fontSize="sm" color="whiteAlpha.700">
          Win Rate
        </Text>
        <HStack mt={1}>
          <Icon as={Trophy} color="yellow.400" />
          <Text fontWeight="bold" fontSize="xl">
            {Math.round(statistics.winRate)}%
          </Text>
        </HStack>
      </MotionBox>

      <MotionBox
        p={3}
        borderRadius="md"
        bg="whiteAlpha.100"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Text fontSize="sm" color="whiteAlpha.700">
          Best Category
        </Text>
        <HStack mt={1}>
          <Icon as={Award} color="purple.400" />
          <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>
            {statistics.bestCategory}
          </Text>
        </HStack>
      </MotionBox>

      <MotionBox
        p={3}
        borderRadius="md"
        bg="whiteAlpha.100"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Text fontSize="sm" color="whiteAlpha.700">
          Peak Time
        </Text>
        <HStack mt={1}>
          <Icon as={Clock} color="blue.400" />
          <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>
            {statistics.peakPerformanceTime}
          </Text>
        </HStack>
      </MotionBox>
    </SimpleGrid>
  )
}

// Engagement Content
const EngagementSection = ({ engagement, winner, userIsWinner }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <VStack spacing={6} align="stretch" mt={4}>
      {/* Victory Meme Section */}
      <MotionBox
        p={5}
        borderRadius="xl"
        bg="gray.800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Heading size="md" mb={4} textAlign="center">
          {userIsWinner
            ? '🏆 Victory Analysis 🏆'
            : winner
            ? '⭐ Challenge Results ⭐'
            : '🤝 Draw Analysis 🤝'}
        </Heading>

        <Text
          fontSize="lg"
          textAlign="center"
          fontStyle="italic"
          color="yellow.200"
        >
          {engagement.wittyAnalysis}
        </Text>

        {/* Social Sharing */}
        <HStack justify="center" mt={6} spacing={4}>
          <Button
            leftIcon={<Bookmark />}
            colorScheme="purple"
            variant="outline"
            size="sm"
          >
            {t('Save Result')}
          </Button>

          <Button leftIcon={<Share2 />} colorScheme="purple" size="sm">
            {t('Share')}
          </Button>
        </HStack>
      </MotionBox>

      {/* Topic Suggestions */}
      <MotionBox
        mt={4}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Heading size="sm" mb={3}>
          {t('Ready for more? Try these topics:')}
        </Heading>
        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
          {engagement.topicSuggestions.slice(0, 3).map((topic, index) => (
            <Button
              key={index}
              leftIcon={<BookOpen size={14} />}
              colorScheme="purple"
              variant="outline"
              size="sm"
              height="auto"
              py={2}
              whiteSpace="normal"
              textAlign="left"
            >
              {topic}
            </Button>
          ))}
        </SimpleGrid>
      </MotionBox>
    </VStack>
  )
}

// Main Component
const ChallengeAnalysisModal = ({ isOpen, onClose, challengeId }) => {
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const variant = useBreakpointValue({ base: 'full', md: 'xl' })

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!isOpen || !challengeId) return

      try {
        setLoading(true)
        setError(null)

        // First try to get existing analysis
        let response = await axios.get(
          `/api/quickClash/analysis/${challengeId}`,
        )

        // If no analysis exists, generate one
        if (!response.data.analysis) {
          response = await axios.post(
            `/api/quickClash/analysis/${challengeId}/generate`,
          )
        }

        setAnalysis(response.data.analysis)
        console.log(response.data.analysis)
      } catch (err) {
        console.error('Error fetching analysis:', err)
        setError(err.response?.data?.message || 'Failed to load analysis')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [isOpen, challengeId])

  // Calculate some derived values for display
  const userIsWinner =
    analysis?.engagement?.winner &&
    user?._id === analysis.engagement.winner.toString()

  const isTie = !analysis?.engagement?.winner && analysis?.battleMetrics

  const winnerData = userIsWinner
    ? analysis?.userAnalysis
    : analysis?.engagement?.winner
    ? analysis?.opponentAnalysis
    : null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={variant}
      scrollBehavior="inside"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <ModalContent
        bg="linear-gradient(to bottom, #1a1527, #0f0d15)"
        borderRadius="xl"
        overflow="hidden"
        maxW={variant === 'full' ? '100%' : '1000px'}
        color={'white'}
      >
        {loading ? (
          <Center h="300px">
            <Spinner size="xl" thickness="4px" color="purple.500" />
          </Center>
        ) : error ? (
          <Center h="300px" flexDirection="column" p={8}>
            <Icon as={XCircle} boxSize={10} color="red.400" mb={4} />
            <Text fontSize="xl" mb={2}>
              {t('Error Loading Analysis')}
            </Text>
            <Text>{error}</Text>
            <Button mt={6} onClick={onClose}>
              {t('Close')}
            </Button>
          </Center>
        ) : (
          <>
            <ModalHeader color={'white'}>
              <HStack>
                <Icon as={Brain} color="purple.400" boxSize={6} />
                <Text>{t('Challenge AI Analysis')}</Text>
              </HStack>
              <HStack mt={2} spacing={3}>
                <Badge colorScheme="purple">
                  {analysis.battleMetrics.category}
                </Badge>
                <Badge
                  colorScheme={
                    analysis.battleMetrics.difficulty === 'easy'
                      ? 'green'
                      : analysis.battleMetrics.difficulty === 'medium'
                      ? 'blue'
                      : 'red'
                  }
                >
                  {analysis.battleMetrics.difficulty}
                </Badge>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody pb={6} color={'white'}>
              {/* Battle Results Banner */}
              <MotionBox
                mb={6}
                p={4}
                borderRadius="md"
                bg={
                  userIsWinner ? 'purple.900' : isTie ? 'blue.900' : 'gray.800'
                }
                borderWidth="1px"
                borderColor={
                  userIsWinner
                    ? 'yellow.400'
                    : isTie
                    ? 'blue.400'
                    : 'whiteAlpha.300'
                }
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <HStack justify="space-between">
                  <HStack>
                    <Avatar name={user?.name} src={user?.pic} size="sm" />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">
                        {user?.inGameName || user?.name}
                      </Text>
                      <Text fontSize="sm" color="whiteAlpha.700">
                        You
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack>
                    <Text fontWeight="bold" fontSize="xl" color="white">
                      {analysis.userAnalysis.performance.finalScore}
                    </Text>
                    <Text fontSize="xl" mx={2}>
                      vs
                    </Text>
                    <Text fontWeight="bold" fontSize="xl" color="white">
                      {analysis.opponentAnalysis.performance.finalScore}
                    </Text>
                  </HStack>

                  <HStack>
                    <VStack align="end" spacing={0}>
                      <Text fontWeight="bold">
                        {analysis?.opponentAnalysis?.userId ===
                        analysis?.challenger?.userId?.toString()
                          ? analysis?.challenger?.username
                          : analysis?.opponent?.username}
                      </Text>
                      <Text fontSize="sm" color="whiteAlpha.700">
                        Opponent
                      </Text>
                    </VStack>
                    <Avatar
                      name={
                        analysis?.opponentAnalysis?.userId ===
                        analysis?.challenger?.userId?.toString()
                          ? analysis?.challenger?.username
                          : analysis?.opponent?.username
                      }
                      size="sm"
                    />
                  </HStack>
                </HStack>

                <Center mt={4}>
                  <Badge
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="md"
                    colorScheme={
                      userIsWinner ? 'green' : isTie ? 'blue' : 'gray'
                    }
                  >
                    {userIsWinner ? 'Victory!' : isTie ? 'Draw' : 'Defeat'}
                  </Badge>
                </Center>
              </MotionBox>

              {/* Main Content Tabs */}
              <Tabs variant="soft-rounded" colorScheme="purple">
                <TabList mx="auto" maxW="90%" mb={4} overflowX="auto" py={2}>
                  <Tab whiteSpace="nowrap">{t('Your Performance')}</Tab>
                  <Tab whiteSpace="nowrap">{t('Knowledge Patterns')}</Tab>
                  <Tab whiteSpace="nowrap">{t('Learning Path')}</Tab>
                  <Tab whiteSpace="nowrap">{t('Battle Analysis')}</Tab>
                </TabList>

                <TabPanels>
                  {/* Your Performance Tab */}
                  <TabPanel>
                    <VStack align="stretch" spacing={6}>
                      <PerformanceMetrics
                        performance={analysis.userAnalysis.performance}
                        opponent={analysis.opponentAnalysis.performance}
                      />
                      <Divider />
                      <StrengthsWeaknesses
                        strengths={analysis.userAnalysis.analysis.strengths}
                        weaknesses={analysis.userAnalysis.analysis.weaknesses}
                      />
                      <Divider />
                      <Statistics
                        statistics={analysis.userAnalysis.statistics}
                      />
                    </VStack>
                  </TabPanel>

                  {/* Knowledge Patterns Tab */}
                  <TabPanel>
                    <VStack align="stretch" spacing={6}>
                      <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <Heading size="sm" mb={4}>
                          {t('Recommendations')}
                        </Heading>
                        <List spacing={3}>
                          {analysis.userAnalysis.analysis.recommendations.map(
                            (recommendation, index) => (
                              <ListItem key={index}>
                                <ListIcon as={Lightbulb} color="yellow.400" />
                                {recommendation}
                              </ListItem>
                            ),
                          )}
                        </List>
                      </MotionBox>

                      <Divider />

                      <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <HStack justify="space-between" mb={4}>
                          <Heading size="sm">
                            {t('Compare with Opponent')}
                          </Heading>
                          <Badge colorScheme="purple">{t('Insights')}</Badge>
                        </HStack>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Box p={4} borderRadius="md" bg="whiteAlpha.100">
                            <Text fontWeight="bold" mb={2}>
                              {t('Your Strong Areas')}
                            </Text>
                            <HStack>
                              <Box
                                h="40px"
                                w="5px"
                                borderRadius="full"
                                bg="green.400"
                              />
                              <Text>
                                {analysis.userAnalysis.analysis
                                  .knowledgePatterns.factualRecall >
                                  analysis.userAnalysis.analysis
                                    .knowledgePatterns.technicalTerms &&
                                analysis.userAnalysis.analysis.knowledgePatterns
                                  .factualRecall >
                                  analysis.userAnalysis.analysis
                                    .knowledgePatterns.strategicAnalysis
                                  ? 'Factual Recall'
                                  : analysis.userAnalysis.analysis
                                      .knowledgePatterns.technicalTerms >
                                    analysis.userAnalysis.analysis
                                      .knowledgePatterns.strategicAnalysis
                                  ? 'Technical Terms'
                                  : 'Strategic Analysis'}
                              </Text>
                            </HStack>
                          </Box>

                          <Box p={4} borderRadius="md" bg="whiteAlpha.100">
                            <Text fontWeight="bold" mb={2}>
                              {t('Opponent Strong Areas')}
                            </Text>
                            <HStack>
                              <Box
                                h="40px"
                                w="5px"
                                borderRadius="full"
                                bg="blue.400"
                              />
                              <Text>
                                {analysis.opponentAnalysis.analysis
                                  .knowledgePatterns.factualRecall >
                                  analysis.opponentAnalysis.analysis
                                    .knowledgePatterns.technicalTerms &&
                                analysis.opponentAnalysis.analysis
                                  .knowledgePatterns.factualRecall >
                                  analysis.opponentAnalysis.analysis
                                    .knowledgePatterns.strategicAnalysis
                                  ? 'Factual Recall'
                                  : analysis.opponentAnalysis.analysis
                                      .knowledgePatterns.technicalTerms >
                                    analysis.opponentAnalysis.analysis
                                      .knowledgePatterns.strategicAnalysis
                                  ? 'Technical Terms'
                                  : 'Strategic Analysis'}
                              </Text>
                            </HStack>
                          </Box>
                        </SimpleGrid>
                      </MotionBox>
                    </VStack>
                  </TabPanel>

                  {/* Learning Path Tab */}
                  <TabPanel>
                    <VStack align="stretch" spacing={6}>
                      <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <LearningPath
                          learningPath={analysis.userAnalysis.learningPath}
                        />
                      </MotionBox>

                      <Divider />

                      <MotionBox
                        p={5}
                        borderRadius="lg"
                        bg="whiteAlpha.100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <HStack mb={3}>
                          <Icon as={Brain} color="purple.400" />
                          <Heading size="sm">Your Category Expertise</Heading>
                        </HStack>

                        <Text fontSize="sm" mb={4}>
                          Based on your performance, you're showing significant
                          knowledge in
                          <Text as="span" fontWeight="bold" color="purple.300">
                            {' '}
                            {analysis.battleMetrics.category}
                          </Text>
                          . Keep building on this strength!
                        </Text>

                        <Button
                          leftIcon={<BookOpen size={16} />}
                          colorScheme="purple"
                          size="sm"
                          variant="outline"
                        >
                          {t('Explore More in')}{' '}
                          {analysis.battleMetrics.category}
                        </Button>
                      </MotionBox>
                    </VStack>
                  </TabPanel>

                  {/* Battle Analysis Tab */}
                  <TabPanel>
                    <VStack align="stretch" spacing={6}>
                      <EngagementSection
                        engagement={analysis.engagement}
                        winner={analysis.engagement.winner}
                        userIsWinner={userIsWinner}
                      />

                      <Divider />

                      <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <Heading size="sm" mb={4}>
                          {t('Battle Insights')}
                        </Heading>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Box p={4} borderRadius="md" bg="whiteAlpha.100">
                            <HStack mb={2}>
                              <Icon as={Clock} color="blue.400" />
                              <Text fontWeight="bold">
                                {t('Speed Analysis')}
                              </Text>
                            </HStack>
                            <Text fontSize="sm">
                              {userIsWinner
                                ? `You completed the challenge ${Math.abs(
                                    analysis.userAnalysis.performance
                                      .readingTime -
                                      analysis.opponentAnalysis.performance
                                        .readingTime,
                                  )} seconds faster than your opponent, giving you a significant advantage!`
                                : analysis.userAnalysis.performance
                                    .readingTime <
                                  analysis.opponentAnalysis.performance
                                    .readingTime
                                ? `While you were faster in the reading phase, your opponent performed better in the quiz section.`
                                : `Your opponent's reading speed was ${Math.abs(
                                    analysis.userAnalysis.performance
                                      .readingTime -
                                      analysis.opponentAnalysis.performance
                                        .readingTime,
                                  )} seconds faster, which contributed to their advantage.`}
                            </Text>
                          </Box>

                          <Box p={4} borderRadius="md" bg="whiteAlpha.100">
                            <HStack mb={2}>
                              <Icon as={BarChart} color="purple.400" />
                              <Text fontWeight="bold">
                                {t('Score Analysis')}
                              </Text>
                            </HStack>
                            <Text fontSize="sm">
                              {userIsWinner
                                ? `Your score of ${
                                    analysis.userAnalysis.performance.finalScore
                                  } was ${
                                    analysis.userAnalysis.performance
                                      .finalScore -
                                    analysis.opponentAnalysis.performance
                                      .finalScore
                                  } points higher, showing your expertise in ${
                                    analysis.battleMetrics.category
                                  }!`
                                : isTie
                                ? `Both you and your opponent scored exactly ${analysis.userAnalysis.performance.finalScore} points, showing evenly matched knowledge.`
                                : `Your opponent scored ${
                                    analysis.opponentAnalysis.performance
                                      .finalScore -
                                    analysis.userAnalysis.performance.finalScore
                                  } points higher, but you showed strength in ${
                                    analysis.userAnalysis.analysis.strengths[0]
                                  }.`}
                            </Text>
                          </Box>
                        </SimpleGrid>
                      </MotionBox>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>

              {/* Download Button */}
              <Flex justify="center" mt={6} mb={4}>
                <Button
                  leftIcon={<Download size={16} />}
                  colorScheme="purple"
                  variant="outline"
                  size="sm"
                >
                  {t('Download Full Analysis')}
                </Button>
              </Flex>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ChallengeAnalysisModal
