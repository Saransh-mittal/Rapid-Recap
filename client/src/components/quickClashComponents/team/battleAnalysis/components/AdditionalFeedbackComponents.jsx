// components/quickClashComponents/team/battleAnalysis/components/AdditionalFeedbackComponents.jsx
import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Icon,
  Badge,
  Progress,
  Circle,
  useBreakpointValue,
  SimpleGrid,
  Collapse,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  MessageSquare,
  Heart,
  TrendingUp,
  Sparkles,
  Smartphone,
  X,
  AlertCircle,
  Info,
  Lightbulb,
  BarChart3,
  Brain,
  Target,
  Users,
  Zap,
} from 'lucide-react'
import useQuickClashAnalysis from '../../../../../customHooks/useQuickClashAnalysis'
import { useFeedbackContext } from '../../../../../contextAPI/FeedbackContext'
import SimplifiedEnhancedFeedbackWidget from './SimplifiedEnhancedFeedbackWidget'

const MotionBox = motion(Box)

/**
 * UPDATED: Smart Feedback Trigger - Shows contextual feedback prompts only when appropriate
 */
export const SmartFeedbackTrigger = ({
  insightData,
  engagementData,
  onFeedbackPrompt,
  shouldShow = false, // NEW: Control visibility from parent
  visibilityReason = 'general', // NEW: Why feedback is being shown
  confidence = 0, // NEW: Confidence level
}) => {
  const { t } = useTranslation('QuickClash')
  const [showPrompt, setShowPrompt] = useState(false)
  const { analysisId, trackInteraction } = useQuickClashAnalysis()
  const { checkFeedbackExists } = useFeedbackContext()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const safeInsightTitle = insightData?.title || 'General Analysis View'

  // NEW: Only show if shouldShow is true
  useEffect(() => {
    if (!shouldShow || !engagementData) {
      setShowPrompt(false)
      return
    }

    const checkAndShowPrompt = async () => {
      const alreadyProvided = await checkFeedbackExists(
        analysisId,
        safeInsightTitle,
      )
      if (alreadyProvided) return

      // Show prompt with a slight delay for better UX
      setTimeout(
        () => {
          setShowPrompt(true)
          onFeedbackPrompt?.()
          trackInteraction('smart_feedback_trigger', {
            insightTitle: safeInsightTitle,
            deviceType: isMobile ? 'mobile' : 'desktop',
            visibilityReason,
            confidence,
          })
        },
        isMobile ? 1000 : 1500,
      )
    }
    checkAndShowPrompt()
  }, [
    shouldShow,
    engagementData,
    onFeedbackPrompt,
    analysisId,
    safeInsightTitle,
    checkFeedbackExists,
    trackInteraction,
    isMobile,
    visibilityReason,
    confidence,
  ])

  if (!showPrompt || !shouldShow) return null

  // NEW: Get smart prompt message based on visibility reason
  const getSmartPromptMessage = () => {
    switch (visibilityReason) {
      case 'high_engagement':
        return isMobile
          ? t('You seem engaged! Quick mobile feedback?')
          : t('You seem very engaged with this analysis!')
      case 'priority_analysis':
        return isMobile
          ? t('Important battle - your mobile thoughts?')
          : t("This was an important battle - we'd love your thoughts!")
      case 'new_user_boost':
        return isMobile
          ? t('New user mobile feedback is valuable!')
          : t('Your fresh perspective as a new user is valuable!')
      default:
        return isMobile
          ? t('Quick mobile feedback?')
          : t('Was this insight helpful?')
    }
  }

  return (
    <AnimatePresence>
      <MotionBox
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        position="fixed"
        bottom={isMobile ? 3 : 4}
        right={isMobile ? 3 : 4}
        left={isMobile ? 3 : 'auto'}
        zIndex={1000}
        maxW={isMobile ? 'calc(100vw - 24px)' : '340px'}
      >
        <Box
          bg="gray.800"
          backdropFilter={isMobile ? 'none' : 'blur(10px)'}
          borderRadius="lg"
          p={isMobile ? 3 : 4}
          border="1px solid"
          borderColor="purple.700"
          boxShadow="0 8px 25px rgba(139, 92, 246, 0.25)"
          color="white"
          position="relative"
        >
          {/* NEW: Smart feedback indicator */}
          <Badge
            position="absolute"
            top="-8px"
            left="12px"
            colorScheme="purple"
            variant="solid"
            fontSize="xs"
          >
            {t('Smart Feedback')} {confidence}%
          </Badge>

          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <HStack>
                <Icon as={Brain} color="purple.400" boxSize={5} />
                <VStack spacing={0} align="start">
                  <Text
                    color="white"
                    fontWeight="bold"
                    fontSize={isMobile ? 'sm' : 'md'}
                  >
                    {t('Smart Feedback')}
                  </Text>
                  {isMobile && (
                    <HStack spacing={1}>
                      <Icon as={Smartphone} color="purple.300" boxSize={3} />
                      <Text color="purple.300" fontSize="xs">
                        {t('Mobile priority')}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </HStack>
              <Button
                size="xs"
                variant="ghost"
                color="whiteAlpha.700"
                _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
                onClick={() => setShowPrompt(false)}
                aria-label={t('Close feedback prompt')}
                minW="auto"
                h="auto"
                p={1}
              >
                <X size={14} />
              </Button>
            </HStack>

            {/* NEW: Smart context message */}
            <Box
              p={2}
              bg="purple.900_with_alpha_0.3"
              borderRadius="md"
              border="1px solid"
              borderColor="purple.600"
            >
              <Text color="purple.200" fontSize={isMobile ? 'xs' : 'sm'}>
                {getSmartPromptMessage()}
              </Text>
            </Box>

            <SimplifiedEnhancedFeedbackWidget
              insightData={{ ...insightData, title: safeInsightTitle }}
              compact={true}
              priorityFeedback={isMobile}
              onFeedbackSubmitted={() => setShowPrompt(false)}
              userStats={engagementData?.userStats || {}}
              mobileOptimized={isMobile}
              autoShow={false}
              preventAutoScroll={true}
              showSmartPrompt={true}
              visibilityReason={visibilityReason}
              smartFeedback={{
                reason: visibilityReason,
                confidence,
              }}
            />
          </VStack>
        </Box>
      </MotionBox>
    </AnimatePresence>
  )
}

/**
 * Feedback Integration Hook - Manages feedback state
 */
export const useFeedbackIntegration = () => {
  const [feedbackPrompts, setFeedbackPrompts] = useState(new Set())
  const [feedbackData, setFeedbackData] = useState({})
  const [providedFeedback, setProvidedFeedback] = useState(new Set())

  const addFeedbackPrompt = useCallback(
    insightId => {
      if (providedFeedback.has(insightId)) return
      setFeedbackPrompts(prev => new Set(prev).add(insightId))
    },
    [providedFeedback],
  )

  const removeFeedbackPrompt = useCallback(insightId => {
    setFeedbackPrompts(prev => {
      const newSet = new Set(prev)
      newSet.delete(insightId)
      return newSet
    })
  }, [])

  const recordFeedback = useCallback(
    (insightId, feedback) => {
      setFeedbackData(prev => ({ ...prev, [insightId]: feedback }))
      setProvidedFeedback(prev => new Set(prev).add(insightId))
      removeFeedbackPrompt(insightId)
    },
    [removeFeedbackPrompt],
  )

  const hasFeedbackFor = useCallback(
    insightId => {
      return providedFeedback.has(insightId)
    },
    [providedFeedback],
  )

  return {
    feedbackPrompts,
    feedbackData,
    providedFeedback,
    addFeedbackPrompt,
    removeFeedbackPrompt,
    recordFeedback,
    hasFeedbackFor,
  }
}

/**
 * Simplified Feedback Summary - Shows user's feedback stats
 */
export const FeedbackSummary = ({ userId }) => {
  const { t } = useTranslation('QuickClash')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          '/api/quickClash/analysis/feedback-summary',
        )
        const data = await response.json()
        if (data.success) setSummary(data.summary)
        else setSummary(null)
      } catch (error) {
        console.error('Error fetching feedback summary:', error)
        setSummary(null)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [userId])

  const summaryBoxProps = {
    p: isMobile ? 3 : 4,
    bg: 'blackAlpha.300',
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'whiteAlpha.200',
    color: 'white',
  }

  if (loading)
    return (
      <Box {...summaryBoxProps} textAlign="center">
        <Progress
          size="sm"
          isIndeterminate
          colorScheme="purple"
          borderRadius="md"
        />
        <Text color="whiteAlpha.700" fontSize={isMobile ? 'xs' : 'sm'} mt={2}>
          {t('Loading feedback summary...')}
        </Text>
      </Box>
    )

  if (!summary || summary.totalFeedback === 0)
    return (
      <Box {...summaryBoxProps} textAlign="center">
        <VStack spacing={2}>
          <HStack>
            <Icon as={Heart} color="purple.400" boxSize={isMobile ? 5 : 6} />
            {isMobile && (
              <Icon as={Smartphone} color="purple.300" boxSize={4} />
            )}
          </HStack>
          <Text
            color="whiteAlpha.900"
            fontWeight="medium"
            fontSize={isMobile ? 'sm' : 'md'}
          >
            {t('Start Providing Smart Feedback')}
          </Text>
          <Text color="whiteAlpha.700" fontSize={isMobile ? 'xs' : 'sm'}>
            {isMobile
              ? t('Your mobile feedback is especially valuable!')
              : t('Your feedback helps improve AI analysis!')}
          </Text>
        </VStack>
      </Box>
    )

  return (
    <Box {...summaryBoxProps}>
      <VStack spacing={3} align="stretch">
        <HStack justify="space-between">
          <HStack>
            <Text
              color="whiteAlpha.900"
              fontWeight="bold"
              fontSize={isMobile ? 'sm' : 'md'}
            >
              {t('Your Feedback Impact')}
            </Text>
            {isMobile && (
              <Icon as={Smartphone} color="purple.300" boxSize={4} />
            )}
          </HStack>
          <Badge colorScheme="purple" variant="subtle" fontSize="xs">
            {t('Smart AI Learning')}
          </Badge>
        </HStack>
        <SimpleGrid columns={isMobile ? 2 : 3} spacing={4}>
          <VStack>
            <Text
              color="purple.300"
              fontSize={isMobile ? 'lg' : '2xl'}
              fontWeight="bold"
            >
              {summary.totalFeedback || 0}
            </Text>
            <Text color="whiteAlpha.700" fontSize="xs" textAlign="center">
              {t('Smart Feedback')}
            </Text>
          </VStack>
          <VStack>
            <Text
              color="yellow.300"
              fontSize={isMobile ? 'lg' : '2xl'}
              fontWeight="bold"
            >
              {summary.avgRating?.toFixed(1) || 'N/A'}
            </Text>
            <Text color="whiteAlpha.700" fontSize="xs" textAlign="center">
              {t('Avg Rating')}
            </Text>
          </VStack>
          {!isMobile && (
            <VStack>
              <Icon as={TrendingUp} color="green.400" boxSize={6} />
              <Text color="whiteAlpha.700" fontSize="xs" textAlign="center">
                {t('Improving AI')}
              </Text>
            </VStack>
          )}
        </SimpleGrid>
        {summary.lastFeedback && (
          <Text color="whiteAlpha.600" fontSize="xs" textAlign="center" mt={2}>
            {t('Last feedback:')}{' '}
            {new Date(summary.lastFeedback).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        )}
      </VStack>
    </Box>
  )
}

/**
 * UPDATED: Smart Floating Feedback Button - Only shows when intelligent system determines it's appropriate
 */
export const FloatingFeedbackButton = ({
  onOpen,
  hasUnseenInsights = false,
  isDisabled = false,
  smartFeedback = {}, // NEW: Smart feedback information
}) => {
  const { t } = useTranslation('QuickClash')
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { reason, confidence, engagementScore } = smartFeedback

  // NEW: Get smart button text based on reason
  const getButtonText = () => {
    switch (reason) {
      case 'high_engagement':
        return isMobile ? t('Quick Feedback') : t('Share Thoughts')
      case 'priority_analysis':
        return isMobile ? t('Rate Battle') : t('Rate Analysis')
      case 'new_user_boost':
        return isMobile ? t('Help Us Learn') : t('Share Experience')
      default:
        return isMobile ? t('Feedback') : t('Feedback')
    }
  }

  // NEW: Get smart button color based on reason
  const getButtonColor = () => {
    switch (reason) {
      case 'high_engagement':
        return 'green'
      case 'priority_analysis':
        return 'yellow'
      case 'new_user_boost':
        return 'blue'
      default:
        return 'purple'
    }
  }

  const buttonColor = getButtonColor()

  return (
    <MotionBox
      display={isDisabled ? 'none' : 'block'}
      position="fixed"
      bottom={isMobile ? 4 : 6}
      right={isMobile ? 4 : 6}
      zIndex="tooltip"
      whileHover={{ scale: isDisabled ? 1 : 1.05 }}
      whileTap={{ scale: isDisabled ? 1 : 0.95 }}
    >
      <Button
        onClick={onOpen}
        bg={`${buttonColor}.600`}
        backdropFilter="none"
        border="1px solid"
        borderColor={`${buttonColor}.500`}
        color="white"
        size={isMobile ? 'md' : 'lg'}
        borderRadius="full"
        boxShadow={`0 4px 15px rgba(var(--chakra-colors-${buttonColor}-500), 0.25)`}
        leftIcon={
          reason === 'high_engagement' ? (
            <Zap size={isMobile ? 16 : 20} />
          ) : reason === 'priority_analysis' ? (
            <Target size={isMobile ? 16 : 20} />
          ) : reason === 'new_user_boost' ? (
            <Users size={isMobile ? 16 : 20} />
          ) : (
            <MessageSquare size={isMobile ? 16 : 20} />
          )
        }
        _hover={{
          bg: isDisabled ? `${buttonColor}.600` : `${buttonColor}.700`,
          transform: isDisabled ? 'none' : 'translateY(-2px)',
          boxShadow: isDisabled
            ? `0 4px 15px rgba(var(--chakra-colors-${buttonColor}-500), 0.25)`
            : `0 6px 20px rgba(var(--chakra-colors-${buttonColor}-500), 0.35)`,
        }}
        _active={{
          bg: isDisabled ? `${buttonColor}.600` : `${buttonColor}.800`,
          transform: isDisabled ? 'none' : 'translateY(0)',
        }}
        transition="all 0.2s ease-in-out"
        aria-label={t('Open smart feedback form')}
        fontSize={isMobile ? 'sm' : 'md'}
        px={isMobile ? 4 : 6}
        isDisabled={isDisabled}
        opacity={isDisabled ? 0.6 : 1}
        position="relative"
      >
        {getButtonText()}

        {/* NEW: Smart feedback indicators */}
        {hasUnseenInsights && !isDisabled && (
          <Circle
            size="10px"
            bg="red.500"
            position="absolute"
            top="-3px"
            right="-3px"
            border={`2px solid var(--chakra-colors-${buttonColor}-600)`}
          />
        )}

        {confidence && confidence > 70 && (
          <Badge
            position="absolute"
            top="-12px"
            left="50%"
            transform="translateX(-50%)"
            colorScheme={buttonColor}
            variant="solid"
            fontSize="xs"
            px={1}
          >
            {confidence}%
          </Badge>
        )}
      </Button>
    </MotionBox>
  )
}

/**
 * UPDATED: Simplified Feedback Analytics with smart insights
 */
export const FeedbackAnalytics = ({ timeframe = 7 }) => {
  const { t } = useTranslation('QuickClash')
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `/api/quickClash/analysis/feedback-analytics?timeframe=${timeframe}&detailed=true&smart=true`,
        )
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`)
        const data = await response.json()
        if (data.success) setAnalytics(data)
        else throw new Error(data.message || 'Failed to fetch analytics data.')
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError(err.message)
        setAnalytics(null)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [timeframe])

  const analyticsBoxProps = {
    p: isMobile ? 4 : 5,
    bg: 'gray.800',
    borderRadius: 'lg',
    color: 'white',
  }

  if (loading)
    return (
      <Box {...analyticsBoxProps} textAlign="center">
        <Progress
          size="lg"
          isIndeterminate
          colorScheme="purple"
          borderRadius="md"
        />
        <Text color="whiteAlpha.700" mt={4} fontSize={isMobile ? 'sm' : 'md'}>
          {t('Loading smart feedback analytics...')}
        </Text>
      </Box>
    )

  if (error)
    return (
      <Box
        {...analyticsBoxProps}
        bg="red.900_with_alpha_0.3"
        borderColor="red.700"
        borderWidth="1px"
        textAlign="center"
      >
        <Icon as={AlertCircle} color="red.300" boxSize={8} />
        <Text color="red.200" mt={2} fontWeight="bold">
          {t('Failed to load analytics')}
        </Text>
        <Text color="red.300" fontSize="sm" mt={1}>
          {error}
        </Text>
      </Box>
    )

  if (!analytics || !analytics.metrics)
    return (
      <Box {...analyticsBoxProps} bg="gray.700" textAlign="center">
        <Icon as={Info} color="blue.300" boxSize={8} />
        <Text color="whiteAlpha.800" mt={2}>
          {t('No smart analytics data available for the selected timeframe.')}
        </Text>
      </Box>
    )

  return (
    <VStack spacing={isMobile ? 4 : 6} align="stretch" {...analyticsBoxProps}>
      <HStack justify="space-between" align="center">
        <HStack>
          <Icon as={Brain} color="purple.400" boxSize={6} />
          <Text
            color="white"
            fontSize={isMobile ? 'lg' : 'xl'}
            fontWeight="bold"
          >
            {t('Smart Feedback Analytics')}
          </Text>
        </HStack>
        <Badge colorScheme="blue" variant="outline" fontSize="xs">
          {t('Last {{count}} days', {
            count: analytics.timeframeDays || timeframe,
          })}
        </Badge>
      </HStack>

      {/* UPDATED: Enhanced metrics with smart feedback data */}
      <SimpleGrid columns={isMobile ? 1 : 4} spacing={4}>
        {[
          {
            label: t('Total Smart Feedback'),
            value: analytics.metrics.totalFeedback || 0,
            color: 'green',
            icon: MessageSquare,
          },
          {
            label: t('Avg Rating'),
            value: (analytics.metrics.avgRating || 0).toFixed(1),
            color: 'yellow',
            icon: Sparkles,
          },
          {
            label: t('Engagement Score'),
            value: `${Math.round(
              (analytics.metrics.avgEngagement || 0) * 100,
            )}%`,
            color: 'purple',
            icon: TrendingUp,
          },
          {
            label: t('Smart Accuracy'),
            value: `${Math.round(
              (analytics.metrics.smartAccuracy || 0) * 100,
            )}%`,
            color: 'blue',
            icon: Target,
          },
        ].map(metric => (
          <Box
            key={metric.label}
            p={isMobile ? 3 : 4}
            bg={`rgba(var(--chakra-colors-${metric.color}-500), 0.1)`}
            borderRadius="md"
            border="1px solid"
            borderColor={`${metric.color}.600`}
            textAlign="center"
          >
            <VStack spacing={2}>
              <Icon
                as={metric.icon}
                color={`${metric.color}.400`}
                boxSize={6}
              />
              <Text
                color={`${metric.color}.300`}
                fontSize={isMobile ? 'xl' : '2xl'}
                fontWeight="bold"
              >
                {metric.value}
              </Text>
              <Text color="whiteAlpha.700" fontSize="sm">
                {metric.label}
              </Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      {/* UPDATED: Smart insights section */}
      {analytics.smartInsights && analytics.smartInsights.length > 0 && (
        <Box
          p={isMobile ? 3 : 4}
          bg="blackAlpha.200"
          borderRadius="md"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Text
            color="white"
            fontWeight="bold"
            mb={3}
            fontSize={isMobile ? 'md' : 'lg'}
          >
            <Icon as={Brain} mr={2} color="purple.400" />
            {t('Smart AI Insights')}
          </Text>
          <VStack spacing={3} align="stretch">
            {analytics.smartInsights.slice(0, 3).map((insight, index) => (
              <Box
                key={index}
                p={3}
                bg="purple.900_with_alpha_0.2"
                borderRadius="md"
                borderLeft="3px solid"
                borderColor="purple.500"
              >
                <HStack mb={2}>
                  <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                    {insight.category || t('Smart Insight')}
                  </Badge>
                  {insight.confidence && (
                    <Badge colorScheme="green" variant="subtle" fontSize="xs">
                      {Math.round(insight.confidence * 100)}% {t('Confidence')}
                    </Badge>
                  )}
                </HStack>
                <Text
                  color="purple.300"
                  fontSize={isMobile ? 'sm' : 'md'}
                  fontWeight="medium"
                  mb={1}
                >
                  {insight.finding || t('Unnamed Finding')}
                </Text>
                {insight.recommendation && (
                  <Text
                    color="whiteAlpha.700"
                    fontSize={isMobile ? 'xs' : 'sm'}
                  >
                    <Icon
                      as={Lightbulb}
                      mr={2}
                      color="yellow.400"
                      verticalAlign="middle"
                    />
                    {insight.recommendation}
                  </Text>
                )}
              </Box>
            ))}
            {analytics.smartInsights.length > 3 && (
              <Text
                color="whiteAlpha.600"
                fontSize="sm"
                textAlign="center"
                mt={2}
              >
                {t('And {{count}} more smart insights...', {
                  count: analytics.smartInsights.length - 3,
                })}
              </Text>
            )}
          </VStack>
        </Box>
      )}

      {(!analytics.smartInsights || analytics.smartInsights.length === 0) && (
        <Text
          color="whiteAlpha.600"
          fontSize="sm"
          textAlign="center"
          p={3}
          bg="blackAlpha.200"
          borderRadius="md"
        >
          {t('No smart insights identified in this period.')}
        </Text>
      )}
    </VStack>
  )
}
