// components/quickClashComponents/analysisComponents/LearningTab.jsx
import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Flex,
  Icon,
  Divider,
  SimpleGrid,
  Badge,
  Tag,
  List,
  ListItem,
  ListIcon,
  Button,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Target,
  BookOpen,
  Lightbulb,
  CheckCircle,
  Star,
  Brain,
  Zap,
  TrendingUp,
  Bookmark,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Motion components
const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionTag = motion(Tag)

const FocusAreas = ({ focusAreas }) => {
  // Animation settings optimized for mobile
  const staggerDelay = useBreakpointValue({ base: 0.05, md: 0.1 })

  return (
    <Flex wrap="wrap" gap={2} mt={2}>
      {focusAreas.map((area, index) => (
        <MotionTag
          key={index}
          colorScheme="yellow"
          size="md"
          borderRadius="full"
          fontWeight="medium"
          px={3}
          py={1}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * staggerDelay }}
          boxShadow="0 2px 5px rgba(0,0,0,0.1)"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          }}
        >
          <HStack spacing={1}>
            <Icon as={Target} boxSize="12px" />
            <Text>{area}</Text>
          </HStack>
        </MotionTag>
      ))}
    </Flex>
  )
}

const SuggestedTopics = ({ topicSuggestions }) => {
  const { t } = useTranslation('QuickClash')

  // Show fewer topics on mobile
  const columns = useBreakpointValue({ base: 1, sm: 2 })
  const topicsToShow = useBreakpointValue({
    base: 4,
    sm: 6,
    md: topicSuggestions.length,
  })
  const displayTopics = topicSuggestions.slice(0, topicsToShow)

  // Animation settings
  const staggerDelay = useBreakpointValue({ base: 0.05, md: 0.1 })

  return (
    <SimpleGrid columns={columns} spacing={2} mt={3}>
      {displayTopics.map((topic, index) => (
        <MotionBox
          key={index}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * staggerDelay }}
        >
          <HStack spacing={2} align="flex-start">
            <Icon as={Star} color="purple.300" boxSize="14px" mt="3px" />
            <Text fontSize="sm">{topic}</Text>
          </HStack>
        </MotionBox>
      ))}
      {topicsToShow < topicSuggestions.length && (
        <Text fontSize="xs" color="whiteAlpha.600" mt={2}>
          {t('And')} {topicSuggestions.length - topicsToShow} {t('more topics')}
        </Text>
      )}
    </SimpleGrid>
  )
}

const NextSteps = ({ nextSteps }) => {
  // Show fewer steps on mobile
  const stepsToShow = useBreakpointValue({ base: 3, md: nextSteps.length })
  const displaySteps = nextSteps.slice(0, stepsToShow)

  return (
    <List spacing={3} mt={3}>
      {displaySteps.map((step, index) => (
        <MotionBox
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <ListItem>
            <ListIcon as={CheckCircle} color="blue.400" />
            <Text fontSize="sm" display="inline">
              {step}
            </Text>
          </ListItem>
        </MotionBox>
      ))}

      {stepsToShow < nextSteps.length && (
        <Text fontSize="xs" color="whiteAlpha.600" pl={6} mt={1}>
          And {nextSteps.length - stepsToShow} more steps
        </Text>
      )}
    </List>
  )
}

const CategoryExpertise = ({ category }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionBox
      p={4}
      borderRadius="lg"
      bg="linear-gradient(135deg, rgba(128, 90, 213, 0.2), rgba(128, 90, 213, 0.05))"
      boxShadow="0 4px 12px rgba(0,0,0,0.1)"
      borderWidth="1px"
      borderColor="purple.700"
      borderStyle="solid"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <HStack mb={3} spacing={3}>
        <Icon as={Brain} color="purple.400" boxSize={5} />
        <Text fontWeight="bold" fontSize="md">
          {t('Your Category Expertise')}
        </Text>
      </HStack>

      <Text fontSize="sm" mb={4}>
        {t(
          "Based on your performance, you're showing significant knowledge in",
        )}
        <Text as="span" fontWeight="bold" color="purple.300">
          {' '}
          {category}
        </Text>
        {t('. Keep building on this strength!')}
      </Text>
    </MotionBox>
  )
}

const SkillImprovement = ({ analysis }) => {
  const { t } = useTranslation('QuickClash')

  // Find lowest knowledge pattern to suggest improvement
  const patterns = analysis.userAnalysis.analysis.knowledgePatterns
  let lowestSkill = 'factualRecall'
  let lowestValue = patterns.factualRecall

  if (patterns.technicalTerms < lowestValue) {
    lowestSkill = 'technicalTerms'
    lowestValue = patterns.technicalTerms
  }

  if (patterns.strategicAnalysis < lowestValue) {
    lowestSkill = 'strategicAnalysis'
  }

  // Map skill to readable name and icon
  const skillMap = {
    factualRecall: {
      name: t('Factual Recall'),
      icon: Bookmark,
      color: 'green.400',
      tip: t(
        'Improve by reading articles multiple times and using flashcards for key facts.',
      ),
    },
    technicalTerms: {
      name: t('Technical Vocabulary'),
      icon: BookOpen,
      color: 'blue.400',
      tip: t(
        'Create a personal glossary of terms you encounter in each category.',
      ),
    },
    strategicAnalysis: {
      name: t('Strategic Analysis'),
      icon: Brain,
      color: 'purple.400',
      tip: t(
        'Practice connecting concepts and predicting implications of what you read.',
      ),
    },
  }

  const skill = skillMap[lowestSkill]

  return (
    <MotionBox
      p={4}
      borderRadius="md"
      bg="rgba(45, 55, 72, 0.3)"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <HStack mb={2}>
        <Icon as={TrendingUp} color="yellow.400" />
        <Text fontWeight="bold" fontSize="sm">
          {t('Skill to Improve')}
        </Text>
      </HStack>

      <HStack mt={1} mb={2}>
        <Icon as={skill.icon} color={skill.color} />
        <Text fontWeight="medium">{skill.name}</Text>
        <Badge>{Math.round(patterns[lowestSkill])}%</Badge>
      </HStack>

      <Text fontSize="xs" color="whiteAlpha.800">
        <Text as="span" color="yellow.300" fontWeight="bold">
          {t('Pro Tip:')}
        </Text>{' '}
        {skill.tip}
      </Text>
    </MotionBox>
  )
}

const LearningTab = ({ analysis, t }) => {
  return (
    <VStack spacing={5} align="stretch">
      <Box>
        <HStack justify="space-between" mb={3}>
          <Text fontSize="lg" fontWeight="bold">
            {t('Focus Areas')}
          </Text>
          <Badge colorScheme="yellow">{t('Personalized')}</Badge>
        </HStack>

        <MotionBox
          p={4}
          borderRadius="md"
          bg="whiteAlpha.100"
          boxShadow="0 2px 8px rgba(0,0,0,0.1)"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FocusAreas
            focusAreas={analysis.userAnalysis.learningPath.focusAreas}
          />

          <Divider my={4} borderColor="whiteAlpha.300" />

          <SkillImprovement analysis={analysis} />
        </MotionBox>
      </Box>

      <Divider borderColor="whiteAlpha.300" />

      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          {t('Suggested Topics')}
        </Text>

        <MotionBox
          p={4}
          borderRadius="md"
          bg="whiteAlpha.100"
          boxShadow="0 2px 8px rgba(0,0,0,0.1)"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <SuggestedTopics
            topicSuggestions={
              analysis.userAnalysis.learningPath.topicSuggestions
            }
          />
        </MotionBox>
      </Box>

      <Divider borderColor="whiteAlpha.300" />

      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          {t('Next Steps')}
        </Text>

        <MotionBox
          p={4}
          borderRadius="md"
          bg="whiteAlpha.100"
          boxShadow="0 2px 8px rgba(0,0,0,0.1)"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <NextSteps nextSteps={analysis.userAnalysis.learningPath.nextSteps} />
        </MotionBox>
      </Box>

      <CategoryExpertise category={analysis.battleMetrics.category} />
    </VStack>
  )
}

export default LearningTab
