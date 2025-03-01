// components/quickClashComponents/analysisComponents/PerformanceTab.jsx
import React, { useState } from 'react'
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
  Progress,
  useBreakpointValue,
  Tooltip,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart,
  CheckCircle,
  Star,
  Target,
  Flame,
  Trophy,
  Award,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Motion components
const MotionBox = motion(Box)
const MotionProgress = motion(Progress)

// Performance Metrics Component
const PerformanceMetrics = ({ performance, opponent }) => {
  const { t } = useTranslation('QuickClash')

  // Animation durations for performance optimization
  const animationDuration = useBreakpointValue({ base: 0.3, md: 0.5 })
  const animationDelay = useBreakpointValue({ base: 0.1, md: 0.2 })

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
    <Box>
      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
        <MotionBox
          p={3}
          borderRadius="md"
          bg="whiteAlpha.100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: animationDuration }}
          boxShadow="0 2px 10px rgba(0, 0, 0, 0.1)"
        >
          <HStack mb={2}>
            <Icon as={Clock} color="blue.300" />
            <Text fontWeight="bold" fontSize="sm">
              {t('Reading Speed')}
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm">
              {performance.readingTime} {t('seconds')}
            </Text>
            <Tooltip label={t('Top percentile compared to other players')}>
              <Badge colorScheme="blue">
                {t('Top')} {Math.round(performance.readingSpeedPercentile)}%
              </Badge>
            </Tooltip>
          </HStack>
        </MotionBox>

        <MotionBox
          p={3}
          borderRadius="md"
          bg="whiteAlpha.100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: animationDuration, delay: animationDelay }}
          boxShadow="0 2px 10px rgba(0, 0, 0, 0.1)"
        >
          <HStack mb={2}>
            <Icon
              as={getSpeedTrendIcon(performance.quizSpeedTrend)}
              color={getSpeedTrendColor(performance.quizSpeedTrend)}
            />
            <Text fontWeight="bold" fontSize="sm">
              {t('Quiz Speed')}
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm">
              {performance.quizSpeed.toFixed(1)} {t('sec/question')}
            </Text>
            <Badge
              colorScheme={
                performance.quizSpeedTrend === 'improving'
                  ? 'green'
                  : performance.quizSpeedTrend === 'declining'
                  ? 'red'
                  : 'blue'
              }
            >
              {t(
                performance.quizSpeedTrend.charAt(0).toUpperCase() +
                  performance.quizSpeedTrend.slice(1),
              )}
            </Badge>
          </HStack>
        </MotionBox>
      </SimpleGrid>

      <MotionBox
        mt={3}
        p={4}
        borderRadius="md"
        bg="whiteAlpha.100"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: animationDuration, delay: animationDelay * 2 }}
        boxShadow="0 2px 10px rgba(0, 0, 0, 0.1)"
      >
        <HStack mb={3}>
          <Icon as={BarChart} color="purple.300" />
          <Text fontWeight="bold" fontSize="sm">
            {t('Score Comparison')}
          </Text>
        </HStack>

        {/* Score comparison with progress bar */}
        <VStack spacing={1} align="stretch">
          <HStack justify="space-between" fontSize="xs">
            <Text color="purple.300" fontWeight="medium">
              {t('You')}
            </Text>
            <Text>{performance.finalScore}</Text>
          </HStack>

          <MotionProgress
            value={performance.finalScore}
            max={Math.max(performance.finalScore, opponent.finalScore) * 1.1}
            colorScheme="purple"
            size="sm"
            borderRadius="full"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.7, delay: animationDelay * 3 }}
          />

          <HStack justify="space-between" fontSize="xs" mt={2}>
            <Text color="blue.300" fontWeight="medium">
              {t('Opponent')}
            </Text>
            <Text>{opponent.finalScore}</Text>
          </HStack>

          <MotionProgress
            value={opponent.finalScore}
            max={Math.max(performance.finalScore, opponent.finalScore) * 1.1}
            colorScheme="blue"
            size="sm"
            borderRadius="full"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.7, delay: animationDelay * 4 }}
          />
        </VStack>
      </MotionBox>
    </Box>
  )
}

// Strengths and Weaknesses Component
const StrengthsWeaknesses = ({ strengths, weaknesses }) => {
  const { t } = useTranslation('QuickClash')

  // Show fewer items on mobile for performance and space efficiency
  const strengthsToShow = useBreakpointValue({
    base: 2,
    sm: 3,
    md: strengths.length,
  })
  const weaknessesToShow = useBreakpointValue({
    base: 2,
    sm: 3,
    md: weaknesses.length,
  })

  const [displayStrengths, setDisplayedStrengths] = useState(
    strengths.slice(0, strengthsToShow),
  )
  const [displayWeaknesses, setDisplayedWeaknesses] = useState(
    weaknesses.slice(0, weaknessesToShow),
  )

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
      <MotionBox
        p={3}
        borderRadius="md"
        bg="rgba(45, 55, 72, 0.3)"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        boxShadow="0 2px 10px rgba(0, 0, 0, 0.1)"
      >
        <HStack mb={2}>
          <Icon as={CheckCircle} color="green.400" />
          <Text fontWeight="bold" fontSize="sm">
            {t('Strengths')}
          </Text>
        </HStack>
        <VStack align="start" spacing={2}>
          {displayStrengths.map((strength, index) => (
            <HStack key={index} spacing={2} align="flex-start">
              <Icon as={Star} color="green.400" boxSize="14px" mt="3px" />
              <Text fontSize="sm">{strength}</Text>
            </HStack>
          ))}
          {strengthsToShow < strengths.length &&
            displayStrengths.length < strengths.length && (
              <Text
                fontSize="xs"
                color="whiteAlpha.600"
                alignSelf="center"
                mt={1}
                onClick={() => {
                  // increase displayStrengths to full length
                  setDisplayedStrengths(strengths)
                }}
              >
                {t('And')} {strengths.length - strengthsToShow} {t('more')}
              </Text>
            )}
        </VStack>
      </MotionBox>

      {weaknesses.length > 0 && (
        <MotionBox
          p={3}
          borderRadius="md"
          bg="rgba(45, 55, 72, 0.3)"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          boxShadow="0 2px 10px rgba(0, 0, 0, 0.1)"
        >
          <HStack mb={2}>
            <Icon as={Target} color="orange.400" />
            <Text fontWeight="bold" fontSize="sm">
              {t('Areas for Growth')}
            </Text>
          </HStack>
          <VStack align="start" spacing={2}>
            {displayWeaknesses.map((weakness, index) => (
              <HStack key={index} spacing={2} align="flex-start">
                <Icon
                  as={TrendingUp}
                  color="orange.400"
                  boxSize="14px"
                  mt="3px"
                />
                <Text fontSize="sm">{weakness}</Text>
              </HStack>
            ))}
            {weaknessesToShow < weaknesses.length &&
              displayWeaknesses.length < weaknesses.length && (
                <Text
                  fontSize="xs"
                  color="whiteAlpha.600"
                  alignSelf="center"
                  mt={1}
                  onClick={() => {
                    // increase displayWeaknesses to full length
                    setDisplayedWeaknesses(weaknesses)
                  }}
                >
                  {t('And')} {weaknesses.length - weaknessesToShow} {t('more')}
                </Text>
              )}
          </VStack>
        </MotionBox>
      )}
    </SimpleGrid>
  )
}

// User Statistics Component
const Statistics = ({ statistics }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mt={4}>
      <MotionBox
        p={3}
        borderRadius="md"
        bg="whiteAlpha.100"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Text fontSize="xs" color="whiteAlpha.700">
          {t('Current Streak')}
        </Text>
        <HStack mt={1}>
          <Icon as={Flame} color="orange.400" />
          <Text fontWeight="bold">{statistics.currentStreak}</Text>
        </HStack>
      </MotionBox>

      <MotionBox
        p={3}
        borderRadius="md"
        bg="whiteAlpha.100"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Text fontSize="xs" color="whiteAlpha.700">
          {t('Win Rate')}
        </Text>
        <HStack mt={1}>
          <Icon as={Trophy} color="yellow.400" />
          <Text fontWeight="bold">{Math.round(statistics.winRate)}%</Text>
        </HStack>
      </MotionBox>

      <MotionBox
        p={3}
        borderRadius="md"
        bg="whiteAlpha.100"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Text fontSize="xs" color="whiteAlpha.700">
          {t('Best Category')}
        </Text>
        <HStack mt={1}>
          <Icon as={Award} color="purple.400" />
          <Text
            fontWeight="bold"
            fontSize={{ base: 'xs', md: 'sm' }}
            isTruncated
          >
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
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Text fontSize="xs" color="whiteAlpha.700">
          {t('Peak Time')}
        </Text>
        <HStack mt={1}>
          <Icon as={Clock} color="blue.400" />
          <Text fontWeight="bold" fontSize={{ base: 'xs', md: 'sm' }}>
            {statistics.peakPerformanceTime}
          </Text>
        </HStack>
      </MotionBox>
    </SimpleGrid>
  )
}

// Main Performance Tab Component
const PerformanceTab = ({ analysis }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <VStack spacing={5} align="stretch">
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          {t('Your Battle Performance')}
        </Text>
        <PerformanceMetrics
          performance={analysis.userAnalysis.performance}
          opponent={analysis.opponentAnalysis.performance}
        />
      </Box>

      <Divider borderColor="whiteAlpha.300" />

      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          {t('Strengths & Areas for Growth')}
        </Text>
        <StrengthsWeaknesses
          strengths={analysis.userAnalysis.analysis.strengths}
          weaknesses={analysis.userAnalysis.analysis.weaknesses}
        />
      </Box>

      <Divider borderColor="whiteAlpha.300" />

      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          {t('Your Statistics')}
        </Text>
        <Statistics statistics={analysis.userAnalysis.statistics} />
      </Box>
    </VStack>
  )
}

export default PerformanceTab
