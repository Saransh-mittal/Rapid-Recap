// components/quickClashComponents/AnalysisSummaryCard.jsx
import React from 'react'
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
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Brain,
  TrendingUp,
  Clock,
  Award,
  Lightbulb,
  Zap,
  Eye,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const AnalysisSummaryCard = ({ challenge, analysis, userId, onViewFull }) => {
  const { t } = useTranslation('QuickClash')
  const isChallenger = challenge.challenger._id === userId
  const userScore = isChallenger
    ? challenge.challengerScore
    : challenge.opponentScore
  const opponentScore = isChallenger
    ? challenge.opponentScore
    : challenge.challengerScore
  const opponent = isChallenger ? challenge.opponent : challenge.challenger

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

  if (!analysis) {
    return (
      <Box p={4} borderRadius="lg" bg={cardBg} mb={4}>
        <HStack justify="space-between">
          <Text>{t('Analysis not available')}</Text>
          <Button
            size="sm"
            colorScheme="purple"
            variant="outline"
            onClick={onViewFull}
          >
            {t('Generate Analysis')}
          </Button>
        </HStack>
      </Box>
    )
  }

  // Get the user's analysis data
  const userAnalysis = analysis.userAnalysis || {}
  const metrics = analysis.battleMetrics || {}
  const engagement = analysis.engagement || {}

  // Some recommendations to display
  const recommendations = userAnalysis?.analysis?.recommendations || []

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
              You
            </Text>
          </HStack>

          <Badge
            px={3}
            py={1}
            borderRadius="full"
            colorScheme={userIsWinner ? 'green' : isTie ? 'blue' : 'gray'}
          >
            {userIsWinner ? 'Victory' : isTie ? 'Draw' : 'Defeat'}
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
                ? `Top ${Math.round(
                    userAnalysis.performance.readingSpeedPercentile,
                  )}% Speed`
                : 'Speed Data'}
            </TagLabel>
          </Tag>

          <Tag size="md" variant="subtle" colorScheme="blue">
            <TagLeftIcon as={Award} />
            <TagLabel>
              {userAnalysis?.statistics?.bestCategory || 'Category Expert'}
            </TagLabel>
          </Tag>

          <Tag size="md" variant="subtle" colorScheme="yellow">
            <TagLeftIcon as={Lightbulb} />
            <TagLabel>
              {userAnalysis?.learningPath?.focusAreas?.[0] || 'Learning Focus'}
            </TagLabel>
          </Tag>
        </Flex>

        {/* Witty Analysis Quote */}
        {engagement.wittyAnalysis && (
          <MotionFlex
            p={3}
            borderRadius="md"
            bg="blackAlpha.300"
            borderLeft="3px solid"
            borderColor={highlightColor}
            fontSize="sm"
            fontStyle="italic"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Text>{engagement.wittyAnalysis}</Text>
          </MotionFlex>
        )}

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
