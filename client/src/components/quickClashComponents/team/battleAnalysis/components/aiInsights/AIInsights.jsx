// components/quickClashComponents/team/battleAnalysis/components/aiInsights/AIInsights.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from 'react'
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
  Spinner,
  Center,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Brain,
  ChevronDown,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Target,
  Zap,
  CheckCircle,
} from 'lucide-react'

// Lazy loaded sub-components for better performance
const BattleRecap = lazy(() => import('./BattleRecap'))
const FollowUpQuestions = lazy(() => import('./FollowUpQuestions'))

import useQuickClashAnalysis from '../../../../../../customHooks/useQuickClashAnalysis'

const MotionBox = motion(Box)

/**
 * Optimized Progress Ring Component
 */
const ProgressRing = React.memo(
  ({ progress, size = '60px', color = 'purple' }) => {
    const radius = 48
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference * (1 - progress / 100)

    return (
      <Box
        as="svg"
        viewBox="0 0 100 100"
        position="absolute"
        inset="-2px"
        transform="rotate(-90deg)"
        w={size}
        h={size}
      >
        <Box
          as="circle"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          strokeWidth="4"
          stroke="rgba(251, 191, 36, 0.2)"
        />
        <MotionBox
          as="circle"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          strokeWidth="4"
          stroke={`${color}.400`}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      </Box>
    )
  },
)

ProgressRing.displayName = 'ProgressRing'

/**
 * Optimized Progress Steps Component
 */
const ProgressSteps = React.memo(
  ({ currentStep, totalSteps = 3, answeredCount = 0 }) => {
    const { t } = useTranslation('QuickClash')

    return (
      <HStack spacing={{ base: 3, md: 5 }} w="100%" justify="center">
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1
          const isAnswered = step <= answeredCount
          const isActive = step === currentStep && !isAnswered
          const isPending = step > currentStep

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
          } else if (isPending) {
            circleBg = 'gray.600'
            circleBorderColor = 'gray.500'
          }

          return (
            <VStack key={step} spacing={1.5}>
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
                  size="35px"
                  bg={circleBg}
                  border="2px solid"
                  borderColor={circleBorderColor}
                  color="white"
                  boxShadow={
                    isActive ? `0 0 10px ${circleBorderColor}` : 'none'
                  }
                >
                  <Text fontSize="sm" fontWeight="bold">
                    {isAnswered ? <CheckCircle size={16} /> : step}
                  </Text>
                </Circle>
              </MotionBox>
              <Text
                fontSize="xs"
                color={
                  isAnswered
                    ? 'green.300'
                    : isActive
                    ? 'purple.300'
                    : 'whiteAlpha.600'
                }
                textAlign="center"
                fontWeight={isActive || isAnswered ? 'medium' : 'normal'}
              >
                {isAnswered
                  ? t('Explored')
                  : isActive
                  ? t('Analyzing')
                  : t('Next Up')}
              </Text>
            </VStack>
          )
        })}
      </HStack>
    )
  },
)

ProgressSteps.displayName = 'ProgressSteps'

/**
 * Component Loading Placeholder
 */
const ComponentLoader = React.memo(({ height = '200px', message }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Center h={height} bg="rgba(255,255,255,0.02)" borderRadius="lg">
      <VStack spacing={3}>
        <Spinner color="purple.400" size="lg" />
        <Text color="whiteAlpha.700" fontSize="sm">
          {message || t('Loading...')}
        </Text>
      </VStack>
    </Center>
  )
})

ComponentLoader.displayName = 'ComponentLoader'

/**
 * No Content Available Component
 */
const NoContentAvailable = React.memo(() => {
  const { t } = useTranslation('QuickClash')

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
        p={6}
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
            <Icon as={HelpCircle} color="purple.400" boxSize={10} />
          </MotionBox>
          <Text color="white" fontSize="lg" fontWeight="medium">
            {t('No AI insights available for this battle yet.')}
          </Text>
          <Text color="whiteAlpha.600" fontSize="sm">
            {t('Check back later or try another battle analysis.')}
          </Text>
        </VStack>
      </Box>
    </MotionBox>
  )
})

NoContentAvailable.displayName = 'NoContentAvailable'

/**
 * Main AI Insights Component - Optimized for Performance
 */
const AIInsights = React.memo(
  ({
    battleRecap,
    followUpQuestions,
    userStats,
    battleId,
    isExpanded,
    onToggle,
  }) => {
    const { t } = useTranslation('QuickClash')
    const { questionProgression, allQuestions } = useQuickClashAnalysis()

    // Memoized calculations for performance
    const { totalAnswered, insightProgress, progressStatus } = useMemo(() => {
      const answered = allQuestions?.filter(q => q.answered).length || 0
      const recapProgress = battleRecap ? 20 : 0
      const totalQuestionsForProgress = Math.max(allQuestions?.length || 0, 3)
      const questionProgressValue =
        totalQuestionsForProgress > 0
          ? (answered / totalQuestionsForProgress) * 80
          : 0
      const progress = Math.min(recapProgress + questionProgressValue, 100)

      let status = { text: t('Getting Started'), color: 'orange' }
      if (progress === 100) status = { text: t('Complete'), color: 'green' }
      else if (progress >= 80)
        status = { text: t('Nearly Done'), color: 'purple' }
      else if (progress >= 40)
        status = { text: t('In Progress'), color: 'blue' }

      return {
        totalAnswered: answered,
        insightProgress: progress,
        progressStatus: status,
      }
    }, [allQuestions, battleRecap, t])

    // Responsive values - memoized
    const responsiveValues = useMemo(
      () => ({
        padding: { base: 4, md: 6 },
        headerIconSize: { base: 6, md: 7 },
        headingSize: { base: 'lg', md: 'xl' },
        circleSize: { base: '50px', md: '60px' },
        brainInCircleSize: { base: 5, md: 6 },
      }),
      [],
    )

    // Check if content is available
    const hasContent = useMemo(() => {
      return (
        battleRecap ||
        (followUpQuestions && followUpQuestions.length > 0) ||
        (allQuestions && allQuestions.length > 0)
      )
    }, [battleRecap, followUpQuestions, allQuestions])

    // Early return for no content
    if (!hasContent) {
      return <NoContentAvailable />
    }

    return (
      <MotionBox
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        position="relative"
        overflow="hidden"
        borderRadius="2xl"
        bg="rgba(20, 15, 35, 0.88)"
        backdropFilter="blur(25px)"
        border="1px solid"
        borderColor="purple.500"
        boxShadow="0 20px 50px rgba(139, 92, 246, 0.3)"
      >
        {/* Enhanced Header with Progress */}
        <Flex
          px={responsiveValues.padding}
          py={4}
          justify="space-between"
          alignItems="center"
          borderBottom="1px solid"
          borderColor="rgba(139, 92, 246, 0.25)"
          cursor="pointer"
          onClick={onToggle}
          _hover={{ bg: 'rgba(139, 92, 246, 0.1)' }}
          transition="background-color 0.2s ease-in-out"
        >
          <HStack spacing={{ base: 3, md: 4 }}>
            <Circle
              size={responsiveValues.circleSize}
              bgGradient="linear(to-br, purple.600, purple.800)"
              border="2px solid"
              borderColor="purple.400"
              boxShadow="0 0 25px rgba(139, 92, 246, 0.5)"
              position="relative"
            >
              <Icon
                as={Brain}
                color="white"
                boxSize={responsiveValues.brainInCircleSize}
              />
              <ProgressRing
                progress={insightProgress}
                size={responsiveValues.circleSize}
                color={progressStatus.color}
              />
            </Circle>
            <VStack align="flex-start" spacing={0.5}>
              <Heading
                size={responsiveValues.headingSize}
                color="white"
                fontWeight="bold"
                letterSpacing="tight"
              >
                {t('BattleSage AI')}
              </Heading>
              <HStack spacing={2} flexWrap="wrap">
                <Badge
                  variant="subtle"
                  bg={`${progressStatus.color}.700`}
                  colorScheme={progressStatus.color}
                  color="white"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="bold"
                  textTransform="uppercase"
                  boxShadow="0 3px 8px rgba(0,0,0,0.2)"
                >
                  <HStack spacing={1.5}>
                    <Icon as={Target} boxSize="10px" />
                    <span>{progressStatus.text}</span>
                  </HStack>
                </Badge>
                <Badge
                  variant="subtle"
                  bg="purple.700"
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
              <Icon as={ChevronDown} color="purple.300" boxSize={6} />
            </MotionBox>
            <Text color="purple.200" fontSize="sm" fontWeight="medium">
              {Math.round(insightProgress)}%
            </Text>
          </VStack>
        </Flex>

        <Collapse in={isExpanded} animateOpacity>
          <Box p={responsiveValues.padding} position="relative">
            {/* Optimized floating background elements */}
            <MotionBox
              position="absolute"
              top="5%"
              right="2%"
              w={{ base: '100px', md: '200px' }}
              h={{ base: '100px', md: '200px' }}
              bg="purple.600"
              borderRadius="full"
              filter="blur(100px)"
              opacity={0.25}
              animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />

            <VStack spacing={{ base: 6, md: 8 }} align="stretch">
              {/* Battle Recap Section */}
              {battleRecap && (
                <AnimatePresence>
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'circOut' }}
                  >
                    <Suspense
                      fallback={
                        <ComponentLoader
                          height="300px"
                          message={t('Loading battle recap...')}
                        />
                      }
                    >
                      <BattleRecap recap={battleRecap} userStats={userStats} />
                    </Suspense>
                  </MotionBox>
                </AnimatePresence>
              )}

              {/* Divider between sections */}
              {battleRecap && allQuestions && allQuestions.length > 0 && (
                <Divider borderColor="rgba(255,255,255,0.15)" my={2} />
              )}

              {/* Follow-up Questions Section */}
              {allQuestions && allQuestions.length > 0 && (
                <AnimatePresence>
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: 'circOut' }}
                  >
                    <Suspense
                      fallback={
                        <ComponentLoader
                          height="400px"
                          message={t('Loading questions...')}
                        />
                      }
                    >
                      <FollowUpQuestions
                        questions={followUpQuestions}
                        battleId={battleId}
                        onQuestionAnswered={() => {}} // Handle in parent if needed
                      />
                    </Suspense>
                  </MotionBox>
                </AnimatePresence>
              )}

              {/* Progress Journey Section */}
              {allQuestions && allQuestions.length > 0 && (
                <Box
                  mt={8}
                  p={{ base: 4, md: 5 }}
                  bg="rgba(139, 92, 246, 0.1)"
                  borderRadius="xl"
                  border="1px solid rgba(139, 92, 246, 0.25)"
                >
                  <VStack spacing={4}>
                    <HStack spacing={2.5}>
                      <Icon as={Zap} color="purple.300" boxSize={5} />
                      <Text color="white" fontSize="md" fontWeight="semibold">
                        {t('Your Insight Journey')}
                      </Text>
                    </HStack>

                    <ProgressSteps
                      currentStep={
                        questionProgression?.currentQuestionIndex || 1
                      }
                      totalSteps={3}
                      answeredCount={totalAnswered}
                    />
                  </VStack>
                </Box>
              )}
            </VStack>

            {/* Footer Section */}
            <Box mt={8} pt={6} borderTop="1px solid rgba(255,255,255,0.1)">
              <Flex
                justify="space-between"
                align={{ base: 'flex-start', sm: 'center' }}
                direction={{ base: 'column', sm: 'row' }}
                gap={3}
              >
                <VStack align="flex-start" spacing={1}>
                  <HStack spacing={2.5}>
                    <Icon as={Sparkles} color="purple.300" boxSize={5} />
                    <Text
                      color="whiteAlpha.900"
                      fontSize="md"
                      fontWeight="semibold"
                    >
                      {t('AI-Powered Progressive Analysis')}
                    </Text>
                  </HStack>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    {t('Questions adapt based on your previous answers')}
                  </Text>
                </VStack>
                <Badge
                  bg="rgba(255,255,255,0.05)"
                  color="purple.300"
                  px={3}
                  py={1}
                  borderRadius="lg"
                  fontSize="xs"
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
  },
)

AIInsights.displayName = 'AIInsights'

export default AIInsights
