// components/quickClashComponents/team/battleAnalysis/components/aiInsights/AIInsights.jsx
import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Flex,
  Text,
  Heading,
  Icon,
  HStack,
  VStack,
  useBreakpointValue,
  Collapse,
  Badge,
  Circle,
  Divider,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Brain,
  ChevronDown,
  // ChevronUp, // Not used directly, ChevronDown rotates
  Sparkles,
  MessageSquare,
  HelpCircle,
  Target,
  Zap,
} from 'lucide-react'

import BattleRecap from './BattleRecap'
import FollowUpQuestions from './FollowUpQuestions'
import useQuickClashAnalysis from '../../../../../../customHooks/useQuickClashAnalysis'

const MotionBox = motion(Box)

const AIInsights = ({
  battleRecap,
  followUpQuestions,
  userStats,
  battleId,
  isExpanded,
  onToggle,
}) => {
  console.log(followUpQuestions, 'Follow Up Questions in AIInsights')
  const { t } = useTranslation('QuickClash')
  const { questionProgression, allQuestions } = useQuickClashAnalysis()
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [insightProgress, setInsightProgress] = useState(0)

  const padding = useBreakpointValue({ base: 4, md: 6 })
  const headerIconSize = useBreakpointValue({ base: 6, md: 7 })
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl' })
  const circleSize = useBreakpointValue({ base: '50px', md: '60px' }) // Slightly larger for progress ring
  const brainInCircleSize = useBreakpointValue({ base: 5, md: 6 })

  useEffect(() => {
    if (allQuestions && allQuestions.length > 0) {
      const answered = allQuestions.filter(q => q.answered).length
      setTotalAnswered(answered)
      const recapProgress = battleRecap ? 20 : 0
      // Ensure division by a non-zero number, default to 3 if no questions but expected
      const totalQuestionsForProgress =
        allQuestions.length > 0 ? Math.max(allQuestions.length, 3) : 3
      const questionProgressValue = (answered / totalQuestionsForProgress) * 80

      console.log(
        `Answered: ${answered}, Total: ${totalQuestionsForProgress}, Progress Value: ${questionProgressValue}`,
      )
      console.log(recapProgress, questionProgressValue, 'Progress Values')
      setInsightProgress(Math.min(recapProgress + questionProgressValue, 100))
    } else {
      setTotalAnswered(0)
      setInsightProgress(battleRecap ? 20 : 0)
    }
  }, [allQuestions, battleRecap])

  const handleQuestionAnswered = useCallback(() => {
    // This callback might be used in the future if direct state updates are needed here
    // For now, useEffect handles changes based on allQuestions
  }, [])

  const getProgressStatus = () => {
    if (insightProgress === 100) return { text: t('Complete'), color: 'green' }
    if (insightProgress >= 80)
      return { text: t('Nearly Done'), color: 'purple' }
    if (insightProgress >= 40) return { text: t('In Progress'), color: 'blue' }
    return { text: t('Getting Started'), color: 'orange' }
  }

  const progressStatus = getProgressStatus()

  const hasContent =
    battleRecap || (followUpQuestions && followUpQuestions.length > 0)

  if (!hasContent && (!allQuestions || allQuestions.length === 0)) {
    // Check allQuestions too
    return (
      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          bg="rgba(20, 15, 35, 0.7)"
          backdropFilter="blur(15px)"
          borderRadius="2xl"
          p={padding}
          textAlign="center"
          border="1px solid"
          borderColor="rgba(255,255,255,0.1)"
          boxShadow="0 8px 30px rgba(0, 0, 0, 0.25)"
        >
          <VStack spacing={4}>
            <MotionBox
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Icon
                as={HelpCircle}
                color="purple.400"
                boxSize={{ base: 8, md: 10 }}
              />
            </MotionBox>
            <Text
              color="white"
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight="medium"
            >
              {t('No AI insights available for this battle yet.')}
            </Text>
            <Text color="whiteAlpha.600" fontSize="sm">
              {t('Check back later or try another battle analysis.')}
            </Text>
          </VStack>
        </Box>
      </MotionBox>
    )
  }

  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      bg="rgba(20, 15, 35, 0.88)" // Slightly darker, more opaque
      backdropFilter="blur(25px)"
      border="1px solid"
      borderColor="purple.500" // More vibrant border
      boxShadow="0 20px 50px rgba(139, 92, 246, 0.3)" // Enhanced shadow
    >
      {/* Enhanced Header with Progress */}
      <Flex
        px={padding}
        py={4}
        justify="space-between"
        alignItems="center"
        borderBottom="1px solid"
        borderColor="rgba(139, 92, 246, 0.25)" // Slightly stronger separator
        cursor="pointer"
        onClick={onToggle}
        _hover={{ bg: 'rgba(139, 92, 246, 0.1)' }} // Brighter hover
        transition="background-color 0.2s ease-in-out"
      >
        <HStack spacing={{ base: 3, md: 4 }}>
          <Circle
            size={circleSize}
            bgGradient="linear(to-br, purple.600, purple.800)" // Gradient bg for circle
            border="2px solid"
            borderColor="purple.400"
            boxShadow="0 0 25px rgba(139, 92, 246, 0.5)" // Stronger shadow
            position="relative"
          >
            <Icon as={Brain} color="white" boxSize={brainInCircleSize} />
            {/* Progress Arc */}
            <Box
              as="svg"
              viewBox="0 0 100 100"
              position="absolute"
              inset="-2px" // Adjust to align with border
              transform="rotate(-90deg)" // Start from top
            >
              <Box
                as="circle"
                cx="50"
                cy="50"
                r="48" // Radius should be such that stroke is visible
                fill="transparent"
                strokeWidth="4" // Thicker progress line
                stroke="rgba(251, 191, 36, 0.2)" // yellow.400 with alpha for track
              />
              <MotionBox
                as="circle"
                cx="50"
                cy="50"
                r="48"
                fill="transparent"
                strokeWidth="4"
                stroke="url(#progressGradient)" // Use gradient for stroke
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 48}`} // Circumference
                strokeDashoffset={`${
                  2 * Math.PI * 48 * (1 - insightProgress / 100)
                }`}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
              <defs>
                <linearGradient
                  id="progressGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#FBBF24" /> {/* yellow.400 */}
                  <stop offset="100%" stopColor="#F59E0B" /> {/* yellow.500 */}
                </linearGradient>
              </defs>
            </Box>
          </Circle>
          <VStack align="flex-start" spacing={0.5}>
            <Heading
              size={headingSize}
              color="white"
              fontWeight="bold"
              letterSpacing="tight"
            >
              {t('BattleSage AI')}
            </Heading>
            <HStack spacing={2} flexWrap="wrap">
              <Badge
                variant="subtle" // Use subtle for better theme integration
                bg={`${progressStatus.color}.700`} // Darker bg for contrast
                colorScheme={progressStatus.color}
                color="white"
                px={3} // More padding
                py={1}
                borderRadius="full"
                fontSize="xs" // Standardized font size
                fontWeight="bold"
                textTransform="uppercase"
                boxShadow="0 3px 8px rgba(0,0,0,0.2)"
              >
                <HStack spacing={1.5}>
                  <Icon as={Target} boxSize="10px" /> {/* Adjusted size */}
                  <span>{progressStatus.text}</span>
                </HStack>
              </Badge>
              <Badge
                variant="subtle"
                bg="purple.700" // Darker bg
                colorScheme="purple"
                color="white"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight="bold"
                boxShadow="0 3px 8px rgba(0,0,0,0.2)"
              >
                <HStack spacing={1.5}>
                  <Icon as={MessageSquare} boxSize="10px" />
                  <span>
                    {totalAnswered}/3 {t('EXPLORED')}
                  </span>
                </HStack>
              </Badge>
            </HStack>
          </VStack>
        </HStack>

        <VStack spacing={0.5} align="flex-end">
          <MotionBox
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'backInOut' }}
          >
            <Icon as={ChevronDown} color="purple.300" boxSize={6} />{' '}
            {/* Brighter icon */}
          </MotionBox>
          <Text color="purple.200" fontSize="sm" fontWeight="medium">
            {' '}
            {/* Brighter text */}
            {Math.round(insightProgress)}%
          </Text>
        </VStack>
      </Flex>

      <Collapse in={isExpanded} animateOpacity>
        <Box p={padding} position="relative">
          {/* Floating background elements */}
          <MotionBox
            position="absolute"
            top="5%"
            right="2%"
            w={{ base: '100px', md: '200px' }} // Larger
            h={{ base: '100px', md: '200px' }}
            bg="purple.600" // More vibrant
            borderRadius="full"
            filter="blur(100px)" // More blur
            opacity={0.25} // Slightly more opaque
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }} // More dynamic animation
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <MotionBox // Additional blur element
            position="absolute"
            bottom="5%"
            left="2%"
            w={{ base: '80px', md: '150px' }}
            h={{ base: '80px', md: '150px' }}
            bg="pink.500"
            borderRadius="full"
            filter="blur(90px)"
            opacity={0.2}
            animate={{
              x: [-20, 20, -20],
              y: [10, -10, 10],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />

          <VStack spacing={{ base: 6, md: 8 }} align="stretch">
            {battleRecap && (
              <AnimatePresence>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'circOut' }}
                >
                  <BattleRecap recap={battleRecap} userStats={userStats} />
                </MotionBox>
              </AnimatePresence>
            )}

            {battleRecap && allQuestions && allQuestions.length > 0 && (
              <Divider borderColor="rgba(255,255,255,0.15)" my={2} /> // More subtle divider
            )}

            {allQuestions && allQuestions.length > 0 && (
              <AnimatePresence>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: 'circOut' }}
                >
                  <FollowUpQuestions
                    questions={followUpQuestions}
                    battleId={battleId}
                    onQuestionAnswered={handleQuestionAnswered}
                  />
                </MotionBox>
              </AnimatePresence>
            )}

            {allQuestions && allQuestions.length > 0 && (
              <Box
                mt={8} // More margin
                p={{ base: 4, md: 5 }} // More padding
                bg="rgba(139, 92, 246, 0.1)" // Darker, more purple bg
                borderRadius="xl"
                border="1px solid rgba(139, 92, 246, 0.25)"
              >
                <VStack spacing={4}>
                  {' '}
                  {/* Increased spacing */}
                  <HStack spacing={2.5}>
                    <Icon as={Zap} color="purple.300" boxSize={5} />
                    <Text color="white" fontSize="md" fontWeight="semibold">
                      {' '}
                      {/* Larger text */}
                      {t('Your Insight Journey')}
                    </Text>
                  </HStack>
                  <HStack
                    spacing={{ base: 3, md: 5 }}
                    w="100%"
                    justify="center"
                  >
                    {' '}
                    {/* Increased spacing */}
                    {[1, 2, 3].map(step => {
                      const questionForStep = allQuestions.find(
                        q => q.questionIndex === step,
                      )
                      const isAnswered = questionForStep?.answered || false
                      const currentActiveQuestion = followUpQuestions?.find(
                        q => q.isActive,
                      )
                      const isActive =
                        currentActiveQuestion?.questionIndex === step &&
                        !isAnswered

                      const isPast =
                        !isAnswered &&
                        !isActive &&
                        step < (questionProgression?.currentQuestionIndex || 1)

                      let circleBg = 'whiteAlpha.200'
                      let circleBorderColor = 'transparent'
                      let pulse = false

                      if (isAnswered) {
                        circleBg = 'green.500'
                        circleBorderColor = 'green.400'
                      } else if (isActive) {
                        circleBg = 'purple.500'
                        circleBorderColor = 'purple.300'
                        pulse = true
                      } else if (isPast) {
                        circleBg = 'gray.600' // Darker gray for past, unanswered
                        circleBorderColor = 'gray.500'
                      }

                      return (
                        <VStack key={step} spacing={1.5}>
                          {' '}
                          {/* Increased spacing */}
                          <MotionBox
                            animate={
                              pulse
                                ? {
                                    scale: [1, 1.15, 1],
                                    boxShadow: [
                                      '0 0 0px rgba(192, 132, 252,0)',
                                      '0 0 15px rgba(192, 132, 252,0.7)',
                                      '0 0 0px rgba(192, 132, 252,0)',
                                    ],
                                  }
                                : {}
                            }
                            transition={
                              pulse
                                ? {
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                  }
                                : {}
                            }
                            borderRadius="full"
                          >
                            <Circle
                              size="35px" // Larger circle
                              bg={circleBg}
                              border="2px solid"
                              borderColor={circleBorderColor}
                              color="white"
                              boxShadow={
                                isActive
                                  ? `0 0 10px ${circleBorderColor}`
                                  : 'none'
                              }
                            >
                              <Text fontSize="sm" fontWeight="bold">
                                {' '}
                                {/* Larger text */}
                                {isAnswered ? <Icon as={CheckIcon} /> : step}
                              </Text>
                            </Circle>
                          </MotionBox>
                          <Text
                            fontSize="xs" // Standardized
                            color={
                              isAnswered
                                ? 'green.300'
                                : isActive
                                ? 'purple.300'
                                : 'whiteAlpha.600' // More visible for pending
                            }
                            textAlign="center"
                            fontWeight={
                              isActive || isAnswered ? 'medium' : 'normal'
                            }
                          >
                            {isAnswered
                              ? t('Explored') // Changed from "Done"
                              : isActive
                              ? t('Analyzing') // Changed from "Active"
                              : t('Next Up')}
                          </Text>
                        </VStack>
                      )
                    })}
                  </HStack>
                </VStack>
              </Box>
            )}
          </VStack>

          <Box mt={8} pt={6} borderTop="1px solid rgba(255,255,255,0.1)">
            {' '}
            {/* Increased spacing & more subtle border */}
            <Flex
              justify="space-between"
              align={{ base: 'flex-start', sm: 'center' }}
              direction={{ base: 'column', sm: 'row' }}
              gap={3} // Increased gap
            >
              <VStack align="flex-start" spacing={1}>
                <HStack spacing={2.5}>
                  {' '}
                  {/* Increased spacing */}
                  <Icon as={Sparkles} color="purple.300" boxSize={5} />{' '}
                  {/* Larger icon */}
                  <Text
                    color="whiteAlpha.900" // Brighter text
                    fontSize="md" // Larger text
                    fontWeight="semibold" // Bolder
                  >
                    {t('AI-Powered Progressive Analysis')}
                  </Text>
                </HStack>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {' '}
                  {/* Brighter text */}
                  {t('Questions adapt based on your previous answers')}
                </Text>
              </VStack>
              <Badge
                bg="rgba(255,255,255,0.05)" // More subtle bg
                color="purple.300"
                px={3} // More padding
                py={1}
                borderRadius="lg" // Larger radius
                fontSize="xs" // Standardized
                border="1px solid rgba(255,255,255,0.1)"
              >
                v3.1 Enhanced
              </Badge>
            </Flex>
          </Box>
        </Box>
      </Collapse>
    </MotionBox>
  )
}
// Helper icon (if not already imported, e.g. from lucide-react or chakra)
const CheckIcon = props => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width="1em"
    height="1em"
    {...props}
  >
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
)

export default AIInsights
