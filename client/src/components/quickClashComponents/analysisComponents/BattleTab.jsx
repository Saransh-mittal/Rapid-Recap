// components/quickClashComponents/analysisComponents/BattleTab.jsx
import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Flex,
  Icon,
  Divider,
  SimpleGrid,
  Button,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Clock,
  BarChart,
  BookOpen,
  Share2,
  Bookmark,
  Zap,
  Star,
  ClipboardCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Motion components
const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionButton = motion(Button)

// Victory Meme Section Component
const VictorySection = ({ engagement, winner, userIsWinner, isTie }) => {
  const { t } = useTranslation('QuickClash')

  // Optimize animations for mobile
  const duration = useBreakpointValue({ base: 0.3, md: 0.5 })

  // Determine background and title based on result
  const bgGradient = userIsWinner
    ? 'linear-gradient(135deg, rgba(72, 33, 120, 0.2), rgba(45, 20, 75, 0.1))'
    : isTie
    ? 'linear-gradient(135deg, rgba(33, 66, 120, 0.2), rgba(20, 40, 75, 0.1))'
    : 'linear-gradient(135deg, rgba(33, 33, 45, 0.2), rgba(20, 20, 30, 0.1))'

  const borderColor = userIsWinner
    ? 'purple.500'
    : isTie
    ? 'blue.500'
    : 'gray.500'

  const title = userIsWinner
    ? '🏆 ' + t('Victory Analysis') + ' 🏆'
    : isTie
    ? '🤝 ' + t('Draw Analysis') + ' 🤝'
    : '⭐ ' + t('Challenge Results') + ' ⭐'

  return (
    <MotionBox
      p={4}
      borderRadius="xl"
      boxShadow="0 4px 12px rgba(0,0,0,0.15)"
      bg={bgGradient}
      borderWidth="1px"
      borderColor={borderColor}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration }}
    >
      <VStack spacing={4}>
        <Text
          fontSize={{ base: 'lg', md: 'xl' }}
          fontWeight="bold"
          textAlign="center"
        >
          {title}
        </Text>

        <MotionText
          fontSize={{ base: 'md', md: 'lg' }}
          textAlign="center"
          fontStyle="italic"
          color={userIsWinner ? 'yellow.200' : isTie ? 'blue.200' : 'gray.200'}
          maxW="100%"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, delay: 0.2 }}
        >
          {engagement.wittyAnalysis}
        </MotionText>

        {/* Social Sharing */}
        {/* <HStack justify="center" spacing={{ base: 2, md: 4 }} mt={2}>
          <MotionButton
            leftIcon={<Share2 size={16} />}
            colorScheme="purple"
            size="sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            {t('Share')}
          </MotionButton>

          <MotionButton
            leftIcon={<ClipboardCheck size={16} />}
            colorScheme="purple"
            variant="ghost"
            size="sm"
            display={{ base: 'none', md: 'flex' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            {t('Download')}
          </MotionButton>
        </HStack> */}
      </VStack>
    </MotionBox>
  )
}

// Topic Suggestions Component with improved visuals
const TopicSuggestions = ({ topicSuggestions }) => {
  const { t } = useTranslation('QuickClash')

  // Show fewer topics on mobile
  const columns = useBreakpointValue({ base: 1, sm: 2, md: 3 })
  const topicsToShow = useBreakpointValue({ base: 3, md: 6 })
  const displayTopics = topicSuggestions.slice(0, topicsToShow)

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Text fontSize="md" fontWeight="bold" mb={3}>
        {t('Ready for more? Try these topics:')}
      </Text>
      <SimpleGrid columns={columns} spacing={3}>
        {displayTopics.map((topic, index) => (
          <MotionButton
            key={index}
            leftIcon={<BookOpen size={14} />}
            colorScheme="purple"
            variant="outline"
            size="sm"
            height="auto"
            py={2}
            px={3}
            whiteSpace="normal"
            disabled={true}
            textAlign="left"
            justifyContent="flex-start"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            fontWeight="medium"
          >
            {topic}
          </MotionButton>
        ))}
      </SimpleGrid>
    </MotionBox>
  )
}

// Battle Insights Component
const BattleInsights = ({ analysis, userIsWinner, isTie }) => {
  const { t } = useTranslation('QuickClash')

  // Optimize animations for mobile
  const duration = useBreakpointValue({ base: 0.3, md: 0.5 })
  const delay = useBreakpointValue({ base: 0.1, md: 0.2 })

  // Prepare analysis text
  const userAnalysis = analysis.userAnalysis.performance
  const opponentAnalysis = analysis.opponentAnalysis.performance

  // Calculate the time difference
  const timeDiff = Math.abs(
    userAnalysis.readingTime - opponentAnalysis.readingTime,
  )

  // Speed analysis text
  const speedText = userIsWinner
    ? t(
        `You completed the challenge ${timeDiff} seconds faster than your opponent, giving you a significant advantage!`,
      )
    : userAnalysis.readingTime < opponentAnalysis.readingTime
    ? t(
        `While you were faster in the reading phase, your opponent performed better in the quiz section.`,
      )
    : t(
        `Your opponent's reading speed was ${timeDiff} seconds faster, which contributed to their advantage.`,
      )

  // Score analysis text
  const scoreDiff = Math.abs(
    userAnalysis.finalScore - opponentAnalysis.finalScore,
  )

  const scoreText = userIsWinner
    ? t(
        `Your score of ${userAnalysis.finalScore} was ${scoreDiff} points higher, showing your expertise in ${analysis.battleMetrics.category}!`,
      )
    : isTie
    ? t(
        `Both you and your opponent scored exactly ${userAnalysis.finalScore} points, showing evenly matched knowledge.`,
      )
    : t(
        `Your opponent scored ${scoreDiff} points higher, but you showed strength in ${analysis.userAnalysis.analysis.strengths[0]}.`,
      )

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="lg" fontWeight="bold">
        {t('Battle Insights')}
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <MotionBox
          p={4}
          borderRadius="md"
          bg="whiteAlpha.100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, delay }}
          boxShadow="0 2px 8px rgba(0,0,0,0.1)"
        >
          <HStack mb={2}>
            <Icon as={Clock} color="blue.400" />
            <Text fontWeight="bold" fontSize="sm">
              {t('Speed Analysis')}
            </Text>
          </HStack>
          <Text fontSize="sm">{speedText}</Text>
        </MotionBox>

        <MotionBox
          p={4}
          borderRadius="md"
          bg="whiteAlpha.100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, delay: delay * 2 }}
          boxShadow="0 2px 8px rgba(0,0,0,0.1)"
        >
          <HStack mb={2}>
            <Icon as={BarChart} color="purple.400" />
            <Text fontWeight="bold" fontSize="sm">
              {t('Score Analysis')}
            </Text>
          </HStack>
          <Text fontSize="sm">{scoreText}</Text>
        </MotionBox>
      </SimpleGrid>
    </VStack>
  )
}

// Performance Comparison Component
const PerformanceComparison = ({ analysis, userIsWinner }) => {
  const { t } = useTranslation('QuickClash')

  // Extract comparison data
  const userAnalysis = analysis.userAnalysis
  const opponentAnalysis = analysis.opponentAnalysis

  // Find areas where user outperformed opponent
  const userStrongerAreas = []

  // Compare knowledge patterns
  const userPatterns = userAnalysis.analysis.knowledgePatterns
  const opponentPatterns = opponentAnalysis.analysis.knowledgePatterns

  if (userPatterns.factualRecall > opponentPatterns.factualRecall) {
    userStrongerAreas.push(t('Factual Recall'))
  }

  if (userPatterns.technicalTerms > opponentPatterns.technicalTerms) {
    userStrongerAreas.push(t('Technical Terminology'))
  }

  if (userPatterns.strategicAnalysis > opponentPatterns.strategicAnalysis) {
    userStrongerAreas.push(t('Strategic Analysis'))
  }

  // Compare speed
  if (
    userAnalysis.performance.readingTime <
    opponentAnalysis.performance.readingTime
  ) {
    userStrongerAreas.push(t('Reading Speed'))
  }

  if (
    userAnalysis.performance.quizSpeed < opponentAnalysis.performance.quizSpeed
  ) {
    userStrongerAreas.push(t('Quiz Speed'))
  }

  // If no areas found, add a default
  if (userStrongerAreas.length === 0) {
    userStrongerAreas.push(t('Persistence'))
  }

  return (
    <MotionBox
      p={4}
      borderRadius="md"
      bg={userIsWinner ? 'rgba(72, 33, 120, 0.15)' : 'rgba(45, 55, 72, 0.3)'}
      boxShadow="0 2px 8px rgba(0,0,0,0.1)"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      borderWidth="1px"
      borderColor={userIsWinner ? 'purple.500' : 'transparent'}
      borderStyle={userIsWinner ? 'dashed' : 'solid'}
    >
      <HStack mb={3}>
        <Icon as={Star} color={userIsWinner ? 'yellow.400' : 'blue.400'} />
        <Text fontWeight="bold" fontSize="sm">
          {userIsWinner ? t('Your Winning Edge') : t('Your Strong Points')}
        </Text>
      </HStack>

      <Text fontSize="sm">
        {userIsWinner
          ? t('You outperformed your opponent in:')
          : t('Despite the outcome, you showed strength in:')}
      </Text>

      <Flex wrap="wrap" gap={2} mt={2}>
        {userStrongerAreas.map((area, index) => (
          <Badge
            key={index}
            colorScheme={userIsWinner ? 'green' : 'blue'}
            p={1}
            borderRadius="md"
          >
            {area}
          </Badge>
        ))}
      </Flex>
    </MotionBox>
  )
}

// Main Battle Tab Component
const BattleTab = ({ analysis, userIsWinner, isTie, t }) => {
  return (
    <VStack spacing={5} align="stretch">
      {/* Victory/Results Section */}
      <VictorySection
        engagement={analysis.engagement}
        winner={analysis.engagement.winner}
        userIsWinner={userIsWinner}
        isTie={isTie}
      />

      <Divider borderColor="whiteAlpha.300" />

      {/* Battle Insights Section */}
      <BattleInsights
        analysis={analysis}
        userIsWinner={userIsWinner}
        isTie={isTie}
      />

      <Divider borderColor="whiteAlpha.300" />

      {/* Performance Comparison */}
      <PerformanceComparison analysis={analysis} userIsWinner={userIsWinner} />

      <Divider borderColor="whiteAlpha.300" />

      {/* Topic Suggestions */}
      <TopicSuggestions
        topicSuggestions={analysis.engagement.topicSuggestions}
      />
    </VStack>
  )
}

export default BattleTab
