// components/quickClashComponents/AnalysisSummaryCard.jsx - Fixed version
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Flex,
  Icon,
  Avatar,
  Tag,
  TagLabel,
  TagLeftIcon,
  useColorModeValue,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Brain,
  TrendingUp,
  Clock,
  Award,
  Lightbulb,
  Zap,
  Eye,
  Quote,
  MessageCircle,
  Star,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

// Lazy load the loading state component
const AnalysisLoadingState = lazy(() => import('./AnalysisLoadingState'))

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionText = motion(Text)

const AnalysisSummaryCard = ({ challenge, analysis, userId, onViewFull }) => {
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)
  const isChallenger = challenge.challenger._id === userId
  const userScore = isChallenger
    ? challenge.challengerScore
    : challenge.opponentScore
  const opponentScore = isChallenger
    ? challenge.opponentScore
    : challenge.challengerScore
  const opponent = isChallenger ? challenge.opponent : challenge.challenger

  // State for quote rotation
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [quoteKey, setQuoteKey] = useState(0) // For animation key

  // Pre-calculate some values
  const userIsWinner = userScore > opponentScore
  const isTie = userScore === opponentScore && userScore > 0
  const cardBg = useColorModeValue(
    'rgba(26, 21, 39, 0.85)',
    'rgba(26, 21, 39, 0.85)',
  )
  const highlightColor = userIsWinner
    ? 'purple.400'
    : isTie
    ? 'blue.400'
    : 'gray.400'

  // Check if user prefers Hindi
  const prefersHindi = user?.userLanguage === 'hi'

  // Get the user's analysis data, checking for Hindi translations when needed
  const userAnalysis = analysis?.userAnalysis || {}
  const metrics = analysis?.battleMetrics || {}
  const engagement = analysis?.engagement || {}

  // Get rotation quotes from engagement data
  const quotes = [
    // For Hindi users, use Hindi translations if available
    {
      text:
        prefersHindi && engagement.wittyAnalysis
          ? engagement.wittyAnalysis
          : engagement.wittyAnalysis,
      icon: Quote,
    },
    {
      text:
        prefersHindi && engagement.competitiveTaunt
          ? engagement.competitiveTaunt
          : engagement.competitiveTaunt,
      icon: MessageCircle,
    },
    {
      text:
        prefersHindi && engagement.victoryMeme
          ? engagement.victoryMeme
          : engagement.victoryMeme,
      icon: Star,
    },
  ].filter(quote => quote.text) // Only include quotes that exist

  // Handle rotation of quotes - always including the hook regardless of quotes length
  useEffect(() => {
    // Only set up rotation if we have more than one quote
    if (quotes.length > 1) {
      const rotationInterval = setInterval(() => {
        setQuoteIndex(prevIndex => (prevIndex + 1) % quotes.length)
        setQuoteKey(prev => prev + 1) // Change key to trigger animation
      }, 8000) // Rotate every 8 seconds

      // Clean up interval
      return () => clearInterval(rotationInterval)
    }
    // Empty cleanup function when no quotes to rotate
    return () => {}
  }, [quotes.length])

  // Get current quote to display
  const currentQuote =
    quotes.length > 0 ? quotes[quoteIndex % quotes.length] : null

  // Get recommendations based on language preference
  const recommendations =
    prefersHindi && userAnalysis?.analysis?.recommendations
      ? userAnalysis.analysis?.recommendations
      : userAnalysis?.analysis?.recommendations || []

  // Get focus areas based on language preference
  const focusAreas =
    prefersHindi && userAnalysis?.learningPath?.focusAreas
      ? userAnalysis.learningPath.focusAreas
      : userAnalysis?.learningPath?.focusAreas || []

  // If no analysis, show loading state
  if (!analysis) {
    return (
      <Suspense
        fallback={
          <Box p={4} borderRadius="lg" bg={cardBg} mb={4}>
            <Center py={4}>
              <Spinner size="xl" color="purple.500" />
            </Center>
          </Box>
        }
      >
        <AnalysisLoadingState challenge={challenge} onGenerate={onViewFull} />
      </Suspense>
    )
  }
  return (
    <MotionBox
      p={4}
      borderRadius="lg"
      bg={cardBg}
      border="1px solid"
      borderColor={highlightColor}
      mb={4}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <VStack spacing={4} align="stretch">
        {/* Header with score comparison */}
        <HStack justify="space-between" align="center">
          <HStack>
            <Icon as={Brain} color={highlightColor} boxSize={5} />
            <Text fontWeight="bold">{t('AI Analysis')}</Text>
          </HStack>

          <HStack spacing={4}>
            <Badge px={2} py={1} colorScheme="purple">
              {metrics.category}
            </Badge>
            <Badge
              px={2}
              py={1}
              colorScheme={
                metrics.difficulty === 'easy'
                  ? 'green'
                  : metrics.difficulty === 'medium'
                  ? 'blue'
                  : 'red'
              }
            >
              {metrics.difficulty}
            </Badge>
          </HStack>
        </HStack>

        {/* Result Banner */}
        <Flex
          justify="space-between"
          p={3}
          bg="rgba(0,0,0,0.2)"
          borderRadius="md"
          align="center"
        >
          <HStack>
            <Text fontWeight="bold" fontSize="lg">
              {userScore}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.700">
              {t('You')}
            </Text>
          </HStack>

          <Badge
            px={3}
            py={1}
            borderRadius="full"
            colorScheme={userIsWinner ? 'green' : isTie ? 'blue' : 'gray'}
          >
            {userIsWinner ? t('Victory') : isTie ? t('Draw') : t('Defeat')}
          </Badge>

          <HStack>
            <Text fontSize="sm" color="whiteAlpha.700">
              {opponent.inGameName}
            </Text>
            <Text fontWeight="bold" fontSize="lg">
              {opponentScore}
            </Text>
          </HStack>
        </Flex>

        {/* Quick Insights */}
        <Flex justify="space-between" wrap="wrap" gap={2}>
          <Tag size="md" variant="subtle" colorScheme="purple">
            <TagLeftIcon as={TrendingUp} />
            <TagLabel>
              {userAnalysis?.performance?.readingSpeedPercentile
                ? `${t('Top')} ${Math.round(
                    userAnalysis.performance.readingSpeedPercentile,
                  )}% ${t('Speed')}`
                : t('Speed Data')}
            </TagLabel>
          </Tag>

          <Tag size="md" variant="subtle" colorScheme="blue">
            <TagLeftIcon as={Award} />
            <TagLabel>
              {userAnalysis?.statistics?.bestCategory || t('Category Expert')}
            </TagLabel>
          </Tag>

          <Tag size="md" variant="subtle" colorScheme="yellow">
            <TagLeftIcon as={Lightbulb} />
            <TagLabel>{focusAreas?.[0] || t('Learning Focus')}</TagLabel>
          </Tag>
        </Flex>

        {/* Rotating Quotes Section - render conditionally but keep hooks consistent */}
        {currentQuote ? (
          <AnimatePresence mode="wait">
            <MotionFlex
              key={`quote-${quoteKey}`}
              p={3}
              borderRadius="md"
              bg="blackAlpha.300"
              borderLeft="3px solid"
              borderColor={highlightColor}
              fontSize="sm"
              fontStyle="italic"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.5 }}
              align="flex-start"
            >
              <Icon
                as={currentQuote.icon}
                color={highlightColor}
                boxSize={4}
                mr={2}
                mt="2px"
              />
              <MotionText>{currentQuote.text}</MotionText>
            </MotionFlex>
          </AnimatePresence>
        ) : null}

        {/* View Full Button */}
        <Button
          onClick={onViewFull}
          colorScheme="purple"
          leftIcon={<Eye size={16} />}
          size="sm"
          mt={2}
        >
          {t('View Full Analysis')}
        </Button>
      </VStack>
    </MotionBox>
  )
}

export default AnalysisSummaryCard
