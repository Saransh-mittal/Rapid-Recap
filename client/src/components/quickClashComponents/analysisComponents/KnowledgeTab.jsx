// components/quickClashComponents/analysisComponents/KnowledgeTab.jsx
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
  Progress,
  List,
  ListItem,
  ListIcon,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Brain,
  Lightbulb,
  TrendingUp,
  BookOpen,
  CheckCircle,
  ChevronRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Motion components
const MotionBox = motion(Box)
const MotionProgress = motion(Progress)
const MotionText = motion(Text)

// Knowledge Pattern Chart Component
const KnowledgePatternChart = ({ patterns }) => {
  const { t } = useTranslation('QuickClash')
  const { factualRecall, technicalTerms, strategicAnalysis } = patterns

  const animationDuration = useBreakpointValue({ base: 0.5, md: 0.8 })
  const animationDelay = useBreakpointValue({ base: 0.1, md: 0.2 })

  return (
    <VStack spacing={4} w="100%" align="stretch" mt={2}>
      {/* Factual Recall */}
      <VStack align="start" spacing={1}>
        <HStack justify="space-between" w="100%">
          <Text fontSize="sm" fontWeight="medium">
            {t('Factual Recall')}
          </Text>
          <Text fontWeight="bold" fontSize="sm">
            {Math.round(factualRecall)}%
          </Text>
        </HStack>
        <MotionProgress
          value={Math.round(factualRecall)}
          colorScheme="green"
          borderRadius="full"
          size="sm"
          w="100%"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          transition={{ duration: animationDuration }}
        />
        <Text fontSize="xs" color="whiteAlpha.700">
          {t('Your ability to remember specific facts from the article')}
        </Text>
      </VStack>

      {/* Technical Terms */}
      <VStack align="start" spacing={1}>
        <HStack justify="space-between" w="100%">
          <Text fontSize="sm" fontWeight="medium">
            {t('Technical Terms')}
          </Text>
          <Text fontWeight="bold" fontSize="sm">
            {Math.round(technicalTerms)}%
          </Text>
        </HStack>
        <MotionProgress
          value={technicalTerms}
          colorScheme="blue"
          borderRadius="full"
          size="sm"
          w="100%"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          transition={{ duration: animationDuration, delay: animationDelay }}
        />
        <Text fontSize="xs" color="whiteAlpha.700">
          {t('Your grasp of specialized terminology in this topic')}
        </Text>
      </VStack>

      {/* Strategic Analysis */}
      <VStack align="start" spacing={1}>
        <HStack justify="space-between" w="100%">
          <Text fontSize="sm" fontWeight="medium">
            {t('Strategic Analysis')}
          </Text>
          <Text fontWeight="bold" fontSize="sm">
            {Math.round(strategicAnalysis)}%
          </Text>
        </HStack>
        <MotionProgress
          value={strategicAnalysis}
          colorScheme="purple"
          borderRadius="full"
          size="sm"
          w="100%"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          transition={{
            duration: animationDuration,
            delay: animationDelay * 2,
          }}
        />
        <Text fontSize="xs" color="whiteAlpha.700">
          {t(
            'Your ability to understand complex relationships and implications',
          )}
        </Text>
      </VStack>
    </VStack>
  )
}

// Recommendations Component
const Recommendations = ({ recommendations }) => {
  // Show fewer recommendations on mobile
  const itemsToShow = useBreakpointValue({
    base: 3,
    md: recommendations.length,
  })
  const displayItems = recommendations.slice(0, itemsToShow)

  return (
    <List spacing={3}>
      {displayItems.map((recommendation, index) => (
        <MotionBox
          key={index}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <ListItem display="flex">
            <ListIcon as={Lightbulb} color="yellow.400" mt="2px" />
            <Text fontSize="sm">{recommendation}</Text>
          </ListItem>
        </MotionBox>
      ))}
      {itemsToShow < recommendations.length && (
        <Text fontSize="xs" color="whiteAlpha.600" pl={6} mt={1}>
          And {recommendations.length - itemsToShow} more recommendations
        </Text>
      )}
    </List>
  )
}

// Comparison with Opponent Component
const OpponentComparison = ({ userAnalysis, opponentAnalysis }) => {
  const { t } = useTranslation('QuickClash')

  // Find strongest and weakest areas for both users
  const findStrongestArea = patterns => {
    const { factualRecall, technicalTerms, strategicAnalysis } = patterns
    if (factualRecall >= technicalTerms && factualRecall >= strategicAnalysis) {
      return { area: 'Factual Recall', value: factualRecall }
    } else if (
      technicalTerms >= factualRecall &&
      technicalTerms >= strategicAnalysis
    ) {
      return { area: 'Technical Terms', value: technicalTerms }
    } else {
      return { area: 'Strategic Analysis', value: strategicAnalysis }
    }
  }

  const userStrongest = findStrongestArea(userAnalysis.knowledgePatterns)
  const opponentStrongest = findStrongestArea(
    opponentAnalysis.knowledgePatterns,
  )

  // Calculate performance difference in percentage points
  const calculateDiff = (user, opponent) => {
    return Math.round(user.value - opponent.value)
  }

  const performanceDiff = calculateDiff(userStrongest, opponentStrongest)

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={3}>
      <MotionBox
        p={3}
        borderRadius="md"
        bg="rgba(45, 55, 72, 0.3)"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <HStack mb={2}>
          <Icon as={Brain} color="purple.400" />
          <Text fontWeight="bold" fontSize="sm">
            {t('Your Strong Area')}
          </Text>
        </HStack>
        <VStack align="start">
          <HStack>
            <Badge colorScheme="purple">{userStrongest.area}</Badge>
            <Text fontSize="sm" fontWeight="bold">
              {Math.round(userStrongest.value)}%
            </Text>
          </HStack>
          <Text fontSize="xs" color="whiteAlpha.800">
            {performanceDiff > 0
              ? t('You outperformed your opponent by') +
                ` ${Math.abs(performanceDiff)}%`
              : performanceDiff < 0
              ? t('Your opponent outperformed you by') +
                ` ${Math.abs(performanceDiff)}%`
              : t('You and your opponent performed equally')}
          </Text>
        </VStack>
      </MotionBox>

      <MotionBox
        p={3}
        borderRadius="md"
        bg="rgba(45, 55, 72, 0.3)"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <HStack mb={2}>
          <Icon as={BookOpen} color="blue.400" />
          <Text fontWeight="bold" fontSize="sm">
            {t('Opponent Strong Area')}
          </Text>
        </HStack>
        <VStack align="start">
          <HStack>
            <Badge colorScheme="blue">{opponentStrongest.area}</Badge>
            <Text fontSize="sm" fontWeight="bold">
              {Math.round(opponentStrongest.value)}%
            </Text>
          </HStack>
          <Text fontSize="xs" color="whiteAlpha.800">
            {opponentStrongest.area === userStrongest.area
              ? t('You both excel in the same area')
              : t('Consider improving in this area to match your opponent')}
          </Text>
        </VStack>
      </MotionBox>
    </SimpleGrid>
  )
}

// Main Knowledge Tab Component
const KnowledgeTab = ({ analysis, t }) => {
  return (
    <VStack spacing={5} align="stretch">
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          {t('Knowledge Patterns')}
        </Text>
        <Text fontSize="sm" color="whiteAlpha.800" mb={4}>
          {t(
            'This analysis shows how you process and recall different types of knowledge',
          )}
        </Text>
        <Box
          p={4}
          borderRadius="md"
          bg="whiteAlpha.100"
          boxShadow="0 2px 8px rgba(0,0,0,0.1)"
        >
          <KnowledgePatternChart
            patterns={analysis.userAnalysis.analysis.knowledgePatterns}
          />
        </Box>
      </MotionBox>

      <Divider borderColor="whiteAlpha.300" />

      <Box>
        <HStack justify="space-between" mb={3}>
          <Text fontSize="lg" fontWeight="bold">
            {t('Recommendations')}
          </Text>
          <Badge colorScheme="yellow">{t('Based on your patterns')}</Badge>
        </HStack>

        <MotionBox
          p={4}
          borderRadius="md"
          bg="whiteAlpha.100"
          boxShadow="0 2px 8px rgba(0,0,0,0.1)"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Recommendations
            recommendations={analysis.userAnalysis.analysis.recommendations}
          />
        </MotionBox>
      </Box>

      <Divider borderColor="whiteAlpha.300" />

      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          {t('Compare with Opponent')}
        </Text>

        <OpponentComparison
          userAnalysis={analysis.userAnalysis.analysis}
          opponentAnalysis={analysis.opponentAnalysis.analysis}
        />

        <MotionBox
          p={3}
          mt={4}
          borderRadius="md"
          bg="rgba(138, 43, 226, 0.15)"
          border="1px dashed"
          borderColor="purple.500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <HStack spacing={2}>
            <Icon as={Lightbulb} color="yellow.400" />
            <MotionText
              fontSize="sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Text as="span" fontWeight="medium" color="purple.300">
                {t('Pro Tip:')}
              </Text>{' '}
              {t(
                'Your unique knowledge patterns show how your brain processes information. Focus on leveraging your strengths while developing your weaker areas.',
              )}
            </MotionText>
          </HStack>
        </MotionBox>
      </Box>
    </VStack>
  )
}

export default KnowledgeTab
