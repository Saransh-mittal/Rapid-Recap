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
 * Optimized Progress Ring Component - simplified for mobile performance
 */
const ProgressRing = React.memo(
  ({ progress, size = '60px', color = 'purple' }) => {
    // Static calculation to avoid re-renders
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
          strokeWidth="3" // Reduced from 4
          stroke="rgba(251, 191, 36, 0.2)"
        />
        <MotionBox
          as="circle"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          strokeWidth="3" // Reduced from 4
          stroke={`${color}.400`}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transition={{ duration: 0.5, ease: 'easeInOut' }} // Reduced duration
        />
      </Box>
    )
  },
)

ProgressRing.displayName = 'ProgressRing'

/**
 * Optimized Progress Steps Component - simplified animations
 */
const ProgressSteps = React.memo(
  ({ currentStep, totalSteps = 3, answeredCount = 0 }) => {
    const { t } = useTranslation('QuickClash')

    return (
      <HStack spacing={{ base: 3, md: 4 }} w="100%" justify="center">
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1
          const isAnswered = step <= answeredCount
          const isActive = step === currentStep && !isAnswered
          const isPending = step > currentStep

          let circleBg = 'whiteAlpha.200'
          let circleBorderColor = 'transparent'
          let shouldPulse = false

          if (isAnswered) {
            circleBg = 'green.500'
            circleBorderColor = 'green.400'
          } else if (isActive) {
            circleBg = 'purple.500'
            circleBorderColor = 'purple.300'
            shouldPulse = true
          } else if (isPending) {
            circleBg = 'gray.600'
            circleBorderColor = 'gray.500'
          }

          return (
            <VStack key={step} spacing={1.5}>
              <MotionBox
                animate={
                  shouldPulse && window.innerWidth >= 768 // Only pulse on desktop
                    ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          '0 0 0px rgba(192, 132, 252,0)',
                          '0 0 12px rgba(192, 132, 252,0.6)', // Reduced glow
                          '0 0 0px rgba(192, 132, 252,0)',
                        ],
                      }
                    : {}
                }
                transition={
                  shouldPulse && window.innerWidth >= 768
                    ? {
                        duration: 2, // Slower
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }
                    : {}
                }
                borderRadius="full"
              >
                <Circle
                  size="32px" // Reduced from 35px
                  bg={circleBg}
                  border="2px solid"
                  borderColor={circleBorderColor}
                  color="white"
                  boxShadow={
                    isActive && window.innerWidth >= 768
                      ? `0 0 8px ${circleBorderColor}` // Reduced shadow
                      : 'none'
                  }
                >
                  <Text fontSize="sm" fontWeight="bold">
                    {isAnswered ? <CheckCircle size={14} /> : step}
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
      initial={{ opacity: 0, y: 8 }} // Reduced movement
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        bg="rgba(20, 15, 35, 0.7)"
        backdropFilter="blur(10px)" // Reduced blur
        borderRadius="2xl"
        p={6}
        textAlign="center"
        border="1px solid"
        borderColor="rgba(255,255,255,0.1)"
        boxShadow="0 6px 20px rgba(0, 0, 0, 0.2)" // Reduced shadow
      >
        <VStack spacing={4}>
          <MotionBox
            animate={{
              scale: window.innerWidth >= 768 ? [1, 1.05, 1] : [1], // No animation on mobile
              opacity: window.innerWidth >= 768 ? [0.7, 1, 0.7] : [0.8],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
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

    // Memoized responsive configuration - static values
    const config = useMemo(
      () => ({
        isMobile: window.innerWidth < 768,
        padding: { base: 4, md: 5 }, // Reduced padding
        headerIconSize: { base: 6, md: 7 },
        headingSize: { base: 'lg', md: 'xl' },
        circleSize: window.innerWidth < 768 ? '50px' : '60px',
        brainInCircleSize: window.innerWidth < 768 ? 5 : 6,
      }),
      [],
    )

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
        initial={{ opacity: 0, scale: 0.99 }} // Reduced animation
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }} // Reduced duration
        position="relative"
        overflow="hidden"
        borderRadius="2xl"
        bg="rgba(20, 15, 35, 0.88)"
        backdropFilter={config.isMobile ? 'none' : 'blur(15px)'} // No blur on mobile
        border="1px solid"
        borderColor="purple.500"
        boxShadow={
          config.isMobile
            ? '0 8px 25px rgba(0,0,0,0.3)'
            : '0 15px 40px rgba(139, 92, 246, 0.25)' // Reduced shadow
        }
      >
        {/* Enhanced Header with Progress */}
        <Flex
          px={config.padding}
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
              size={config.circleSize}
              bgGradient="linear(to-br, purple.600, purple.800)"
              border="2px solid"
              borderColor="purple.400"
              boxShadow={
                config.isMobile
                  ? '0 0 15px rgba(139, 92, 246, 0.3)'
                  : '0 0 20px rgba(139, 92, 246, 0.4)' // Reduced shadow
              }
              position="relative"
            >
              <Icon
                as={Brain}
                color="white"
                boxSize={config.brainInCircleSize}
              />
              <ProgressRing
                progress={insightProgress}
                size={config.circleSize}
                color={progressStatus.color}
              />
            </Circle>
            <VStack align="flex-start" spacing={0.5}>
              <Heading
                size={config.headingSize}
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
                  boxShadow="0 2px 6px rgba(0,0,0,0.2)" // Reduced shadow
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
                  boxShadow="0 2px 6px rgba(0,0,0,0.2)" // Reduced shadow
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
              transition={{ duration: 0.3, ease: 'easeInOut' }} // Simplified easing
            >
              <Icon as={ChevronDown} color="purple.300" boxSize={6} />
            </MotionBox>
            <Text color="purple.200" fontSize="sm" fontWeight="medium">
              {Math.round(insightProgress)}%
            </Text>
          </VStack>
        </Flex>

        <Collapse in={isExpanded} animateOpacity>
          <Box p={config.padding} position="relative">
            {/* Simplified floating background elements - only on desktop */}
            {!config.isMobile && (
              <MotionBox
                position="absolute"
                top="5%"
                right="2%"
                w="150px" // Reduced from 200px
                h="150px"
                bg="purple.600"
                borderRadius="full"
                filter="blur(80px)" // Reduced blur
                opacity={0.2} // Reduced opacity
                animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.3, 0.2] }} // Reduced animation
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }} // Slower
              />
            )}

            <VStack spacing={{ base: 5, md: 6 }} align="stretch">
              {' '}
              {/* Reduced spacing */}
              {/* Battle Recap Section */}
              {battleRecap && (
                <AnimatePresence>
                  <MotionBox
                    initial={{ opacity: 0, y: 15 }} // Reduced movement
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }} // Simplified
                  >
                    <Suspense
                      fallback={
                        <ComponentLoader
                          height="280px" // Reduced height
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
                <Divider borderColor="rgba(255,255,255,0.15)" my={1} />
              )}
              {/* Follow-up Questions Section */}
              {allQuestions && allQuestions.length > 0 && (
                <AnimatePresence>
                  <MotionBox
                    initial={{ opacity: 0, y: 15 }} // Reduced movement
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }} // Reduced delay
                  >
                    <Suspense
                      fallback={
                        <ComponentLoader
                          height="350px" // Reduced height
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
                  mt={6} // Reduced margin
                  p={{ base: 4, md: 4 }} // Reduced padding
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
            <Box mt={6} pt={4} borderTop="1px solid rgba(255,255,255,0.1)">
              {' '}
              {/* Reduced margins */}
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
