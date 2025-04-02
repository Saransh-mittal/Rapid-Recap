// components/quickClashComponents/analysisComponents/KnowledgeTab.jsx
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
  List,
  ListItem,
  ListIcon,
  useBreakpointValue,
  Button,
  Tooltip,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Brain,
  Lightbulb,
  TrendingUp,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Users,
  User,
  Repeat,
  Activity,
  ExternalLink,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Motion components
const MotionBox = motion(Box)
const MotionProgress = motion(Progress)
const MotionText = motion(Text)
const MotionButton = motion(Button)

// Knowledge Pattern Chart Component
const KnowledgePatternChart = ({
  patterns,
  opponentPatterns,
  showComparison,
}) => {
  const { t } = useTranslation('QuickClash')
  const { factualRecall, technicalTerms, strategicAnalysis } = patterns

  const animationDuration = useBreakpointValue({ base: 0.5, md: 0.8 })
  const animationDelay = useBreakpointValue({ base: 0.1, md: 0.2 })

  // For comparison mode, calculate the max value to ensure proper scaling
  const getMaxValue = (userValue, opponentValue) => {
    if (!showComparison || !opponentValue) return userValue
    return Math.max(userValue, opponentValue) * 1.1 // Add 10% for visual scale
  }

  return (
    <VStack spacing={4} w="100%" align="stretch" mt={2}>
      {/* Factual Recall */}
      <VStack align="start" spacing={1}>
        <HStack justify="space-between" w="100%">
          <Text fontSize="sm" fontWeight="medium">
            {t('Factual Recall')}
          </Text>
          <HStack>
            <Text fontWeight="bold" fontSize="sm">
              {Math.round(factualRecall)}%
            </Text>
            {showComparison && opponentPatterns && (
              <Text fontSize="xs" color="whiteAlpha.800">
                ({opponentPatterns.factualRecall > factualRecall ? '-' : '+'}
                {Math.abs(
                  Math.round(factualRecall - opponentPatterns.factualRecall),
                )}
                %)
              </Text>
            )}
          </HStack>
        </HStack>
        <MotionProgress
          value={Math.round(factualRecall)}
          max={100}
          colorScheme="green"
          borderRadius="full"
          size="sm"
          w="100%"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          transition={{ duration: animationDuration }}
        />
        {showComparison && opponentPatterns && (
          <MotionProgress
            value={Math.round(opponentPatterns.factualRecall)}
            max={100}
            colorScheme="blue"
            borderRadius="full"
            size="sm"
            w="100%"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '100%', opacity: 1 }}
            transition={{ duration: animationDuration, delay: 0.1 }}
            opacity={0.7}
            mt={1}
          />
        )}
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
          <HStack>
            <Text fontWeight="bold" fontSize="sm">
              {Math.round(technicalTerms)}%
            </Text>
            {showComparison && opponentPatterns && (
              <Text fontSize="xs" color="whiteAlpha.800">
                ({opponentPatterns.technicalTerms > technicalTerms ? '-' : '+'}
                {Math.abs(
                  Math.round(technicalTerms - opponentPatterns.technicalTerms),
                )}
                %)
              </Text>
            )}
          </HStack>
        </HStack>
        <MotionProgress
          value={technicalTerms}
          max={100}
          colorScheme="blue"
          borderRadius="full"
          size="sm"
          w="100%"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          transition={{ duration: animationDuration, delay: animationDelay }}
        />
        {showComparison && opponentPatterns && (
          <MotionProgress
            value={Math.round(opponentPatterns.technicalTerms)}
            max={100}
            colorScheme="purple"
            borderRadius="full"
            size="sm"
            w="100%"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '100%', opacity: 1 }}
            transition={{
              duration: animationDuration,
              delay: animationDelay + 0.1,
            }}
            opacity={0.7}
            mt={1}
          />
        )}
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
          <HStack>
            <Text fontWeight="bold" fontSize="sm">
              {Math.round(strategicAnalysis)}%
            </Text>
            {showComparison && opponentPatterns && (
              <Text fontSize="xs" color="whiteAlpha.800">
                (
                {opponentPatterns.strategicAnalysis > strategicAnalysis
                  ? '-'
                  : '+'}
                {Math.abs(
                  Math.round(
                    strategicAnalysis - opponentPatterns.strategicAnalysis,
                  ),
                )}
                %)
              </Text>
            )}
          </HStack>
        </HStack>
        <MotionProgress
          value={strategicAnalysis}
          max={100}
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
        {showComparison && opponentPatterns && (
          <MotionProgress
            value={Math.round(opponentPatterns.strategicAnalysis)}
            max={100}
            colorScheme="green"
            borderRadius="full"
            size="sm"
            w="100%"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '100%', opacity: 1 }}
            transition={{
              duration: animationDuration,
              delay: animationDelay * 2 + 0.1,
            }}
            opacity={0.7}
            mt={1}
          />
        )}
        <Text fontSize="xs" color="whiteAlpha.700">
          {t(
            'Your ability to understand complex relationships and implications',
          )}
        </Text>
      </VStack>

      {/* Legend for comparison mode */}
      {showComparison && opponentPatterns && (
        <HStack spacing={4} mt={1} fontSize="xs" color="whiteAlpha.800">
          <HStack>
            <Box w="3" h="3" bg="blue.500" borderRadius="sm" />
            <Text>{t('You')}</Text>
          </HStack>
          <HStack>
            <Box w="3" h="3" bg="purple.500" borderRadius="sm" />
            <Text>{t('Opponent')}</Text>
          </HStack>
        </HStack>
      )}
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

// Opponent Detail Component (New)
const OpponentDetail = ({ opponentAnalysis, opponentName }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <VStack spacing={4} align="stretch">
        <HStack>
          <Icon as={User} color="blue.400" />
          <Text fontWeight="bold">
            {opponentName}'s {t('Knowledge Patterns')}
          </Text>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
          <Box p={3} bg="rgba(45, 55, 72, 0.3)" borderRadius="md">
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              {t('Factual Recall')}
            </Text>
            <HStack>
              <Progress
                value={Math.round(
                  opponentAnalysis.knowledgePatterns.factualRecall,
                )}
                size="sm"
                colorScheme="blue"
                borderRadius="full"
                flex="1"
              />
              <Text
                fontSize="sm"
                fontWeight="bold"
                minW="40px"
                textAlign="right"
              >
                {Math.round(opponentAnalysis.knowledgePatterns.factualRecall)}%
              </Text>
            </HStack>
          </Box>

          <Box p={3} bg="rgba(45, 55, 72, 0.3)" borderRadius="md">
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              {t('Technical Terms')}
            </Text>
            <HStack>
              <Progress
                value={Math.round(
                  opponentAnalysis.knowledgePatterns.technicalTerms,
                )}
                size="sm"
                colorScheme="purple"
                borderRadius="full"
                flex="1"
              />
              <Text
                fontSize="sm"
                fontWeight="bold"
                minW="40px"
                textAlign="right"
              >
                {Math.round(opponentAnalysis.knowledgePatterns.technicalTerms)}%
              </Text>
            </HStack>
          </Box>

          <Box p={3} bg="rgba(45, 55, 72, 0.3)" borderRadius="md">
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              {t('Strategic Analysis')}
            </Text>
            <HStack>
              <Progress
                value={Math.round(
                  opponentAnalysis.knowledgePatterns.strategicAnalysis,
                )}
                size="sm"
                colorScheme="green"
                borderRadius="full"
                flex="1"
              />
              <Text
                fontSize="sm"
                fontWeight="bold"
                minW="40px"
                textAlign="right"
              >
                {Math.round(
                  opponentAnalysis.knowledgePatterns.strategicAnalysis,
                )}
                %
              </Text>
            </HStack>
          </Box>
        </SimpleGrid>

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            {t('Strengths')}
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
            {opponentAnalysis.strengths.slice(0, 2).map((strength, idx) => (
              <HStack key={idx} spacing={1} align="flex-start">
                <Icon
                  as={CheckCircle}
                  color="green.400"
                  boxSize="14px"
                  mt="3px"
                />
                <Text fontSize="sm">{strength}</Text>
              </HStack>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </MotionBox>
  )
}

// Main Knowledge Tab Component
const KnowledgeTab = ({ analysis, t }) => {
  const [showComparison, setShowComparison] = useState(false)
  const opponentName = analysis.opponentAnalysis.username || 'Opponent'

  // Toggle comparison view
  const toggleComparison = () => {
    setShowComparison(!showComparison)
  }

  return (
    <VStack spacing={5} align="stretch">
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <HStack justify="space-between" mb={3}>
          <Text fontSize="lg" fontWeight="bold">
            {t('Knowledge Patterns')}
          </Text>
          <MotionButton
            size="sm"
            leftIcon={
              <Icon as={showComparison ? User : Users} boxSize="14px" />
            }
            colorScheme="purple"
            variant="outline"
            onClick={toggleComparison}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {showComparison ? t('Hide Comparison') : t('Compare')}
          </MotionButton>
        </HStack>

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
            opponentPatterns={
              analysis.opponentAnalysis.analysis.knowledgePatterns
            }
            showComparison={showComparison}
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

        {/* Opponent Details Section */}
        {showComparison && (
          <Box mt={4}>
            <OpponentDetail
              opponentAnalysis={analysis.opponentAnalysis.analysis}
              opponentName={opponentName}
            />
          </Box>
        )}

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
