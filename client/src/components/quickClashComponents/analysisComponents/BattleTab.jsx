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
  Tooltip,
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
  TrendingUp,
  TrendingDown,
  Award,
  Shield,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Motion components
const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionButton = motion(Button)

// Trophy Insights Component - New component to display trophy-related information
const TrophyInsights = ({ analysis, userIsWinner, isTie }) => {
  const { t } = useTranslation('QuickClash')
  const userTrophyData = analysis.userAnalysis.trophyData
  const trophyInsights = analysis.userAnalysis.trophyInsights

  // If no trophy data available, don't show the component
  if (!userTrophyData || isTie) return null

  // Get icon based on trend
  const getTrendIcon = () => {
    if (trophyInsights?.progressTrend === 'Rising') return TrendingUp
    if (trophyInsights?.progressTrend === 'Declining') return TrendingDown
    return Trophy
  }

  // Get color based on trend
  const getTrendColor = () => {
    if (trophyInsights?.progressTrend === 'Rising') return 'green.400'
    if (trophyInsights?.progressTrend === 'Declining') return 'red.400'
    return 'yellow.400'
  }

  // Protection component
  const ProtectionInfo = () => {
    if (!userTrophyData.protectionApplied) return null

    const protectionType = userTrophyData.protectionType
    const protectionText =
      protectionType === 'streak'
        ? t('Streak Protection')
        : protectionType === 'activity'
        ? t('Beginner Protection')
        : t('Protection')

    const protectionDescription =
      protectionType === 'streak'
        ? t('Your win streak prevented trophy loss')
        : protectionType === 'activity'
        ? t('As a newer player, your trophies were protected')
        : t('Your trophies were protected')

    return (
      <MotionBox
        p={3}
        borderRadius="md"
        bg="rgba(255, 215, 0, 0.1)"
        borderWidth="1px"
        borderColor="yellow.500"
        borderStyle="dashed"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <HStack spacing={2}>
          <Icon as={Shield} color="yellow.400" />
          <Text fontWeight="bold" fontSize="sm">
            {protectionText}
          </Text>
        </HStack>
        <Text fontSize="sm" mt={1}>
          {protectionDescription}
        </Text>
      </MotionBox>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="lg" fontWeight="bold">
        {t('Trophy Analysis')}
      </Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        {/* Current Level */}
        <MotionBox
          p={4}
          borderRadius="md"
          bg="whiteAlpha.100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          boxShadow="0 2px 8px rgba(0,0,0,0.1)"
        >
          <HStack mb={2}>
            <Icon as={Award} color="yellow.400" />
            <Text fontWeight="bold" fontSize="sm">
              {t('Trophy Level')}
            </Text>
          </HStack>
          <HStack>
            <Text fontSize="sm">{t('Current')}:</Text>
            <Badge
              colorScheme={
                trophyInsights?.currentLevel === 'Advanced'
                  ? 'purple'
                  : trophyInsights?.currentLevel === 'Intermediate'
                  ? 'blue'
                  : 'green'
              }
            >
              {trophyInsights?.currentLevel || t('Beginner')}
            </Badge>
          </HStack>
          <Text fontSize="xs" mt={1} color="whiteAlpha.700">
            {userTrophyData.newTrophies} {t('total trophies')}
          </Text>
        </MotionBox>

        {/* Progress Trend */}
        <MotionBox
          p={4}
          borderRadius="md"
          bg="whiteAlpha.100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          boxShadow="0 2px 8px rgba(0,0,0,0.1)"
        >
          <HStack mb={2}>
            <Icon as={getTrendIcon()} color={getTrendColor()} />
            <Text fontWeight="bold" fontSize="sm">
              {t('Progress Trend')}
            </Text>
          </HStack>
          <HStack>
            <Badge
              colorScheme={
                trophyInsights?.progressTrend === 'Rising'
                  ? 'green'
                  : trophyInsights?.progressTrend === 'Declining'
                  ? 'red'
                  : 'blue'
              }
            >
              {trophyInsights?.progressTrend || t('Stable')}
            </Badge>
            <Text fontSize="sm">
              {userTrophyData.change > 0
                ? `+${userTrophyData.change}`
                : userTrophyData.change}
            </Text>
          </HStack>
          <Text fontSize="xs" mt={1} color="whiteAlpha.700">
            {analysis.userAnalysis.performance?.trophyAnalysis ||
              t('Keep practicing to improve your ranking')}
          </Text>
        </MotionBox>

        {/* Next Milestone */}
        <MotionBox
          p={4}
          borderRadius="md"
          bg="whiteAlpha.100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          boxShadow="0 2px 8px rgba(0,0,0,0.1)"
        >
          <HStack mb={2}>
            <Icon as={Star} color="purple.400" />
            <Text fontWeight="bold" fontSize="sm">
              {t('Next Milestone')}
            </Text>
          </HStack>
          <Text fontSize="sm">
            {trophyInsights?.nextMilestone ||
              t('Reach your next trophy milestone')}
          </Text>
        </MotionBox>
      </SimpleGrid>

      {/* Protection Info */}
      <ProtectionInfo />
    </VStack>
  )
}

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

        {/* Trophy comment */}
        {engagement.trophyComment && (
          <MotionText
            fontSize={{ base: 'sm', md: 'md' }}
            textAlign="center"
            color={
              userIsWinner ? 'yellow.200' : isTie ? 'blue.200' : 'gray.200'
            }
            maxW="100%"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay: 0.3 }}
          >
            <Icon as={Trophy} display="inline-block" mr={1} mb={1} />
            {engagement.trophyComment}
          </MotionText>
        )}
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

      {/* Trophy Insights Section - New Section */}
      {analysis.userAnalysis.trophyData && !isTie && (
        <>
          <TrophyInsights
            analysis={analysis}
            userIsWinner={userIsWinner}
            isTie={isTie}
          />
          <Divider borderColor="whiteAlpha.300" />
        </>
      )}

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
