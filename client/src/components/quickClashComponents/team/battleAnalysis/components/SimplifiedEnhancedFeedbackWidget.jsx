// components/quickClashComponents/team/battleAnalysis/components/SimplifiedEnhancedFeedbackWidget.jsx
import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Textarea,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Icon,
  Flex,
  Badge,
  Progress,
  Tooltip,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Stack,
  Divider,
  useBreakpointValue,
  Circle,
  useToast,
  Spinner,
  SimpleGrid,
  Collapse,
  Switch,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Star,
  Brain,
  Send,
  Sparkles,
  X,
  CheckCircle,
  AlertCircle,
  Heart,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Target,
  Zap,
  Users,
  TrendingUp,
} from 'lucide-react'
import useQuickClashAnalysis from '../../../../../customHooks/useQuickClashAnalysis'
import { useFeedbackContext } from '../../../../../contextAPI/FeedbackContext'
import { useMemo } from 'react'

const MotionBox = motion(Box)

// UPDATED: Enhanced feedback types with smart categorization
const FEEDBACK_TYPES = {
  helpful: {
    icon: ThumbsUp,
    color: 'green',
    label: 'Helpful',
    smartWeight: 1.0,
  },
  not_helpful: {
    icon: ThumbsDown,
    color: 'red',
    label: 'Not Helpful',
    smartWeight: 1.2,
  },
  excellent: {
    icon: Sparkles,
    color: 'yellow',
    label: 'Excellent',
    smartWeight: 0.8,
  },
}

// UPDATED: Enhanced aspects for smart feedback
const ASPECT_LABELS = {
  accuracy: 'How accurate was this insight?',
  relevance: 'How relevant was this to your battle?',
  mobile_experience: 'How was the mobile experience?',
  smart_timing: 'Was the timing of this feedback request appropriate?', // NEW
}

/**
 * UPDATED: Simplified Enhanced Feedback Widget with Smart Features
 */
const SimplifiedEnhancedFeedbackWidget = ({
  insightData,
  compact = false,
  showDetailedForm = false,
  onFeedbackSubmitted,
  userStats = {},
  autoShow = true,
  battleId,
  priorityFeedback = false,
  mobileOptimized = false,
  preventAutoScroll = false,
  // NEW: Smart feedback props
  showSmartPrompt = false,
  visibilityReason = 'general',
  smartFeedback = {},
}) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    submitInsightFeedbackToServer,
    engagementData,
    trackInteraction,
    analysisId,
  } = useQuickClashAnalysis()

  const { checkFeedbackExists, markFeedbackProvided, isFeedbackLoading } =
    useFeedbackContext()

  const isMobile = useBreakpointValue({ base: true, md: false })
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false })

  const config = useMemo(
    () => ({
      modalSize: isMobile ? 'full' : isTablet ? 'xl' : '2xl',
      buttonSize: isMobile ? 'sm' : 'md',
      quickFeedbackButtonSize: isMobile ? 'sm' : 'sm',
      textSizes: {
        title: isMobile ? 'md' : 'lg',
        subtitle: isMobile ? 'sm' : 'md',
        body: isMobile ? 'xs' : 'sm',
        button: isMobile ? 'xs' : 'sm',
      },
      spacing: isMobile ? 3 : 4,
      padding: isMobile ? 3 : 4,
      iconSize: isMobile ? 4 : 5,
      quickFeedbackIconSize: 14,
      showAllFeatures: true,
      touchOptimized: isMobile,
      widgetBg: 'blackAlpha.300',
      widgetBorderColor: 'whiteAlpha.200',
    }),
    [isMobile, isTablet],
  )

  const [feedbackState, setFeedbackState] = useState({
    type: '',
    rating: 3,
    comment: '',
    specificAspects: {
      accuracy: 3,
      relevance: 3,
      mobile_experience: isMobile ? 3 : undefined,
      smart_timing: showSmartPrompt ? 3 : undefined, // NEW
    },
    improvementSuggestions: '',
    isSubmitting: false,
    submitted: false,
    alreadyProvided: false,
    initialCheckDone: false,
    showAdvanced: false,
  })

  const [showQuickFeedback, setShowQuickFeedback] = useState(false)

  const generateSafeInsightTitle = useCallback(baseTitle => {
    if (!baseTitle || baseTitle.trim() === '') {
      return `Insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    const cleanTitle = baseTitle.trim()
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substr(2, 6)
    return `${cleanTitle}-${timestamp}-${randomSuffix}`
  }, [])

  const safeInsightTitle = useMemo(() => {
    return generateSafeInsightTitle(insightData?.title)
  }, [insightData?.title, generateSafeInsightTitle])

  const hasValidInsightData = Boolean(
    analysisId && insightData && safeInsightTitle,
  )

  // NEW: Get smart prompt message based on visibility reason
  const getSmartPromptMessage = useCallback(() => {
    switch (visibilityReason) {
      case 'high_engagement':
        return {
          title: t('High Engagement Detected'),
          message: isMobile
            ? t('You seem very engaged! Your mobile feedback is valuable.')
            : t(
                'You seem very engaged with this analysis! Your thoughts would be valuable.',
              ),
          icon: Zap,
          color: 'green',
        }
      case 'priority_analysis':
        return {
          title: t('Important Battle Analysis'),
          message: isMobile
            ? t('This was an important battle - mobile feedback helps!')
            : t(
                "This was an important battle - we'd love your detailed thoughts!",
              ),
          icon: Target,
          color: 'yellow',
        }
      case 'new_user_boost':
        return {
          title: t('New User Perspective'),
          message: isMobile
            ? t('Your fresh mobile perspective is highly valued!')
            : t('Your fresh perspective as a new user is incredibly valuable!'),
          icon: Users,
          color: 'blue',
        }
      default:
        return {
          title: t('Feedback Request'),
          message: isMobile
            ? t('Quick mobile feedback helps improve our AI!')
            : t('Your feedback helps us provide better analysis!'),
          icon: Brain,
          color: 'purple',
        }
    }
  }, [visibilityReason, isMobile, t])

  useEffect(() => {
    if (!hasValidInsightData) {
      setFeedbackState(prev => ({
        ...prev,
        initialCheckDone: true,
        alreadyProvided: false,
      }))
      setShowQuickFeedback(false)
      return
    }

    if (!feedbackState.initialCheckDone) {
      const checkInitialFeedback = async () => {
        try {
          const checkTitle = insightData?.title || safeInsightTitle
          const exists = await checkFeedbackExists(analysisId, checkTitle)

          setFeedbackState(prev => ({
            ...prev,
            alreadyProvided: exists,
            submitted: exists,
            initialCheckDone: true,
          }))

          setShowQuickFeedback(!exists)

          if (exists) {
            trackInteraction('feedback_already_provided', {
              insightTitle: checkTitle,
              deviceType: isMobile ? 'mobile' : 'desktop',
              smartReason: visibilityReason,
            })
          }
        } catch (error) {
          console.error('Error checking initial feedback:', error)
          setFeedbackState(prev => ({
            ...prev,
            initialCheckDone: true,
            alreadyProvided: false,
          }))
          setShowQuickFeedback(true)
        }
      }
      checkInitialFeedback()
    }
  }, [
    analysisId,
    safeInsightTitle,
    hasValidInsightData,
    checkFeedbackExists,
    trackInteraction,
    feedbackState.initialCheckDone,
    insightData?.title,
    isMobile,
    visibilityReason,
  ])

  const handleQuickFeedback = async type => {
    if (!hasValidInsightData) {
      toast({
        title: t('Invalid Data'),
        description: t('Cannot submit feedback without valid insight data.'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setFeedbackState(prev => ({ ...prev, type, isSubmitting: true }))
    trackInteraction('smart_quick_feedback_start', {
      type,
      insightTitle: safeInsightTitle,
      deviceType: isMobile ? 'mobile' : 'desktop',
      isPriorityFeedback: priorityFeedback,
      smartReason: visibilityReason,
      smartConfidence: smartFeedback.confidence || 0,
    })

    try {
      const result = await submitInsightFeedbackToServer(
        { ...insightData, title: safeInsightTitle },
        type,
        type === 'helpful' ? 4 : type === 'excellent' ? 5 : 2,
        {
          comment: `Smart quick feedback - ${visibilityReason}`,
          userScore: userStats.score || 0,
          trophyChange: userStats.trophyChange || 0,
          teamRole: userStats.teamRole || 'average',
          deviceType: isMobile ? 'mobile' : 'desktop',
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          touchSupport: 'ontouchstart' in window,
          priorityFeedback,
          mobileOptimized,
          preventAutoScroll,
          // NEW: Smart feedback metadata
          smartFeedback: {
            reason: visibilityReason,
            confidence: smartFeedback.confidence || 0,
            engagementScore: smartFeedback.engagementScore || 0,
            isSmartTriggered: showSmartPrompt,
          },
        },
      )

      if (result && result.success) {
        setFeedbackState(prev => ({
          ...prev,
          submitted: true,
          alreadyProvided: true,
        }))
        setShowQuickFeedback(false)
        markFeedbackProvided(analysisId, safeInsightTitle)
        trackInteraction('smart_quick_feedback_success', {
          type,
          deviceType: isMobile ? 'mobile' : 'desktop',
          smartReason: visibilityReason,
        })

        onFeedbackSubmitted?.(type, 'smart_quick', {
          preventAutoScroll,
          smartReason: visibilityReason,
          confidence: smartFeedback.confidence,
        })

        // NEW: Smart success message
        const smartPrompt = getSmartPromptMessage()
        toast({
          title: t('Smart Feedback Received!'),
          description: isMobile
            ? t('Your mobile feedback helps improve our AI!')
            : t('Your feedback helps improve our smart analysis system.'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        handleFeedbackError(result)
      }
    } catch (error) {
      console.error('Smart quick feedback error:', error)
      handleFeedbackError(error)
    } finally {
      setFeedbackState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleDetailedFeedback = async () => {
    if (!feedbackState.type) {
      toast({
        title: t('Feedback Type Required'),
        description: t('Please select helpful or not helpful.'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (!hasValidInsightData) {
      toast({
        title: t('Invalid Data'),
        description: t('Cannot submit feedback without valid insight data.'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setFeedbackState(prev => ({ ...prev, isSubmitting: true }))
    trackInteraction('smart_detailed_feedback_start', {
      type: feedbackState.type,
      rating: feedbackState.rating,
      insightTitle: safeInsightTitle,
      deviceType: isMobile ? 'mobile' : 'desktop',
      hasAdvancedFeedback: feedbackState.showAdvanced,
      isPriorityFeedback: priorityFeedback,
      smartReason: visibilityReason,
      smartConfidence: smartFeedback.confidence || 0,
    })

    try {
      const cleanAspects = Object.fromEntries(
        Object.entries(feedbackState.specificAspects).filter(
          ([_, value]) => value !== undefined,
        ),
      )

      const result = await submitInsightFeedbackToServer(
        { ...insightData, title: safeInsightTitle },
        feedbackState.type,
        feedbackState.rating,
        {
          comment: feedbackState.comment,
          specificAspects: cleanAspects,
          improvementSuggestions: feedbackState.improvementSuggestions,
          userScore: userStats.score || 0,
          trophyChange: userStats.trophyChange || 0,
          teamRole: userStats.teamRole || 'average',
          deviceType: isMobile ? 'mobile' : 'desktop',
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          touchSupport: 'ontouchstart' in window,
          priorityFeedback,
          mobileOptimized,
          preventAutoScroll,
          // NEW: Enhanced smart feedback metadata
          smartFeedback: {
            reason: visibilityReason,
            confidence: smartFeedback.confidence || 0,
            engagementScore: smartFeedback.engagementScore || 0,
            isSmartTriggered: showSmartPrompt,
            timingRating: cleanAspects.smart_timing || 3,
            detailedForm: true,
          },
        },
      )

      if (result && result.success) {
        setFeedbackState(prev => ({
          ...prev,
          submitted: true,
          alreadyProvided: true,
        }))
        markFeedbackProvided(analysisId, safeInsightTitle)
        trackInteraction('smart_detailed_feedback_success', {
          type: feedbackState.type,
          deviceType: isMobile ? 'mobile' : 'desktop',
          smartReason: visibilityReason,
        })

        onFeedbackSubmitted?.(feedbackState.type, 'smart_detailed', {
          preventAutoScroll,
          smartReason: visibilityReason,
          confidence: smartFeedback.confidence,
          rating: feedbackState.rating,
        })

        toast({
          title: t('Smart Feedback Submitted!'),
          description: isMobile
            ? t('Thank you for your detailed mobile feedback!')
            : t('Thank you for your detailed smart feedback input.'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        setTimeout(() => {
          onClose()
          setShowQuickFeedback(false)
        }, 1000)
      } else {
        handleFeedbackError(result)
      }
    } catch (error) {
      console.error('Smart detailed feedback error:', error)
      handleFeedbackError(error)
    } finally {
      setFeedbackState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleFeedbackError = error => {
    const errorMessage =
      error?.message || error?.toString?.() || 'Unknown error'
    if (
      errorMessage.includes('duplicate') ||
      errorMessage.includes('E11000') ||
      errorMessage.includes('already exists')
    ) {
      setFeedbackState(prev => ({
        ...prev,
        alreadyProvided: true,
        submitted: true,
      }))
      setShowQuickFeedback(false)
      markFeedbackProvided(analysisId, safeInsightTitle)
      toast({
        title: t('Feedback Already Provided'),
        description: t('You have already provided feedback for this insight.'),
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
    } else {
      toast({
        title: t('Submission Failed'),
        description:
          error?.message ||
          t('Could not submit your feedback. Please try again.'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const resetFeedback = () => {
    setFeedbackState(prev => ({
      ...prev,
      type: '',
      rating: 3,
      comment: '',
      specificAspects: {
        accuracy: 3,
        relevance: 3,
        mobile_experience: isMobile ? 3 : undefined,
        smart_timing: showSmartPrompt ? 3 : undefined,
      },
      improvementSuggestions: '',
      isSubmitting: false,
      submitted: prev.alreadyProvided,
      showAdvanced: false,
    }))
    trackInteraction('smart_feedback_reset', {
      deviceType: isMobile ? 'mobile' : 'desktop',
      smartReason: visibilityReason,
    })
  }

  const isLoadingFeedbackStatus =
    isFeedbackLoading(analysisId, safeInsightTitle) ||
    !feedbackState.initialCheckDone

  if (isLoadingFeedbackStatus) {
    return (
      <Box p={config.padding} textAlign="center">
        <VStack spacing={2}>
          <Spinner size="sm" color="purple.400" />
          <Text color="whiteAlpha.600" fontSize={config.textSizes.body}>
            {t('Checking smart feedback status...')}
          </Text>
        </VStack>
      </Box>
    )
  }

  if (feedbackState.alreadyProvided && !isOpen) {
    return (
      <MotionBox
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        p={config.padding}
        bg="rgba(34, 197, 94, 0.1)"
        borderRadius="lg"
        border="1px solid"
        borderColor="green.500"
        textAlign="center"
      >
        <VStack spacing={2}>
          <Icon as={CheckCircle} color="green.400" boxSize={config.iconSize} />
          <Text
            color="green.300"
            fontSize={config.textSizes.subtitle}
            fontWeight="medium"
          >
            {t('Smart Feedback Provided')}
          </Text>
          <Text color="green.200" fontSize={config.textSizes.body}>
            {isMobile
              ? t('Thanks for your mobile feedback!')
              : t('Thank you for helping improve our AI!')}
          </Text>
          {isMobile && (
            <HStack spacing={1}>
              <Icon as={Smartphone} color="green.300" boxSize={3} />
              <Text color="green.200" fontSize="xs">
                {t('Mobile smart feedback')}
              </Text>
            </HStack>
          )}
        </VStack>
      </MotionBox>
    )
  }

  if (compact) {
    const smartPrompt = getSmartPromptMessage()

    return (
      <Box>
        {showQuickFeedback &&
          !feedbackState.submitted &&
          !feedbackState.alreadyProvided && (
            <MotionBox
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: autoShow ? 0.3 : 0 }}
            >
              <Box
                p={config.padding}
                bg={config.widgetBg}
                borderRadius="xl"
                border="1px solid"
                borderColor={config.widgetBorderColor}
                mt={config.spacing}
                position="relative"
              >
                {/* NEW: Smart feedback indicator */}
                {showSmartPrompt && (
                  <Badge
                    position="absolute"
                    top="-8px"
                    left="12px"
                    colorScheme={smartPrompt.color}
                    variant="solid"
                    fontSize="xs"
                  >
                    {smartPrompt.title}
                  </Badge>
                )}

                <VStack spacing={config.spacing}>
                  <HStack justify="space-between" w="100%">
                    <VStack spacing={1} align="start" flex={1}>
                      <HStack>
                        <Icon
                          as={smartPrompt.icon}
                          color={`${smartPrompt.color}.400`}
                          boxSize={4}
                        />
                        <Text
                          fontSize={config.textSizes.subtitle}
                          color="whiteAlpha.900"
                          fontWeight="semibold"
                        >
                          {showSmartPrompt
                            ? smartPrompt.title
                            : t('Was this insight helpful?')}
                        </Text>
                      </HStack>

                      {showSmartPrompt && (
                        <Text
                          color={`${smartPrompt.color}.300`}
                          fontSize={config.textSizes.body}
                        >
                          {smartPrompt.message}
                        </Text>
                      )}

                      {isMobile && (
                        <HStack spacing={1}>
                          <Icon
                            as={Smartphone}
                            color="purple.400"
                            boxSize={3}
                          />
                          <Text color="purple.300" fontSize="xs">
                            {t('Mobile feedback valued')}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                    <Button
                      size="xs"
                      variant="ghost"
                      color="purple.400"
                      onClick={() => setShowQuickFeedback(false)}
                      minW="auto"
                      h="auto"
                      p={1}
                      _hover={{ bg: 'whiteAlpha.100' }}
                    >
                      <X size={12} />
                    </Button>
                  </HStack>

                  {/* NEW: Show smart confidence if available */}
                  {showSmartPrompt && smartFeedback.confidence && (
                    <Box
                      w="100%"
                      p={2}
                      bg={`${smartPrompt.color}.900_with_alpha_0.2`}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={`${smartPrompt.color}.600`}
                    >
                      <HStack justify="space-between">
                        <Text color={`${smartPrompt.color}.300`} fontSize="xs">
                          {t('Smart Confidence')}
                        </Text>
                        <HStack spacing={1}>
                          <Progress
                            value={smartFeedback.confidence}
                            size="sm"
                            colorScheme={smartPrompt.color}
                            w="60px"
                            borderRadius="full"
                          />
                          <Text
                            color={`${smartPrompt.color}.200`}
                            fontSize="xs"
                          >
                            {smartFeedback.confidence}%
                          </Text>
                        </HStack>
                      </HStack>
                    </Box>
                  )}

                  {/* UPDATED: Enhanced quick feedback buttons */}
                  <SimpleGrid columns={2} spacing={2} w="100%">
                    <Button
                      size={config.quickFeedbackButtonSize}
                      leftIcon={
                        <ThumbsUp size={config.quickFeedbackIconSize} />
                      }
                      colorScheme="green"
                      variant="ghost"
                      onClick={() => handleQuickFeedback('helpful')}
                      isLoading={
                        feedbackState.isSubmitting &&
                        feedbackState.type === 'helpful'
                      }
                      loadingText={t('Sending...')}
                      fontSize={config.textSizes.button}
                      _hover={{
                        bg: 'green.500_with_alpha_0.1',
                        transform: 'translateY(-1px)',
                        color: 'green.200',
                      }}
                      _active={{ bg: 'green.500_with_alpha_0.2' }}
                      h="auto"
                      py={2}
                      px={3}
                    >
                      {t('Helpful')}
                    </Button>
                    <Button
                      size={config.quickFeedbackButtonSize}
                      leftIcon={
                        <ThumbsDown size={config.quickFeedbackIconSize} />
                      }
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleQuickFeedback('not_helpful')}
                      isLoading={
                        feedbackState.isSubmitting &&
                        feedbackState.type === 'not_helpful'
                      }
                      loadingText={t('Sending...')}
                      fontSize={config.textSizes.button}
                      _hover={{
                        bg: 'red.500_with_alpha_0.1',
                        transform: 'translateY(-1px)',
                        color: 'red.200',
                      }}
                      _active={{ bg: 'red.500_with_alpha_0.2' }}
                      h="auto"
                      py={2}
                      px={3}
                    >
                      {t('Not Helpful')}
                    </Button>
                  </SimpleGrid>

                  {/* Enhanced "More Details" button */}
                  <Button
                    size={config.buttonSize}
                    leftIcon={<MessageSquare size={14} />}
                    variant="outline"
                    borderColor="purple.600"
                    color="purple.300"
                    onClick={onOpen}
                    w="100%"
                    fontSize={config.textSizes.button}
                    fontWeight="medium"
                    _hover={{
                      bg: 'purple.500_with_alpha_0.1',
                      transform: 'translateY(-1px)',
                      color: 'purple.200',
                    }}
                    _active={{ bg: 'purple.500_with_alpha_0.2' }}
                    h="auto"
                    py={isMobile ? 2.5 : 2}
                  >
                    {showSmartPrompt ? t('Smart Details') : t('Add Details')}
                  </Button>
                </VStack>
              </Box>
            </MotionBox>
          )}

        <SmartDetailedFeedbackModal
          isOpen={isOpen}
          onClose={() => {
            onClose()
            if (!feedbackState.alreadyProvided) {
              resetFeedback()
            }
          }}
          feedbackState={feedbackState}
          setFeedbackState={setFeedbackState}
          handleDetailedFeedback={handleDetailedFeedback}
          resetFeedback={resetFeedback}
          config={config}
          insightData={{ ...insightData, title: safeInsightTitle }}
          isMobile={isMobile}
          priorityFeedback={priorityFeedback}
          showSmartPrompt={showSmartPrompt}
          visibilityReason={visibilityReason}
          smartFeedback={smartFeedback}
          getSmartPromptMessage={getSmartPromptMessage}
        />
      </Box>
    )
  }

  if (feedbackState.alreadyProvided) return null

  // UPDATED: Full widget with smart features
  const smartPrompt = getSmartPromptMessage()

  return (
    <Box
      p={config.padding}
      bg={config.widgetBg}
      borderRadius="xl"
      border="1px solid"
      borderColor={config.widgetBorderColor}
      backdropFilter={isMobile ? 'none' : 'blur(8px)'}
      position="relative"
    >
      {/* NEW: Smart feedback indicator */}
      {showSmartPrompt && (
        <Badge
          position="absolute"
          top="-8px"
          left="16px"
          colorScheme={smartPrompt.color}
          variant="solid"
          fontSize="xs"
        >
          {smartPrompt.title}
        </Badge>
      )}

      <VStack spacing={config.spacing} align="stretch">
        <Flex justify="space-between" align="center">
          <HStack>
            <Icon
              as={smartPrompt.icon}
              color={`${smartPrompt.color}.400`}
              boxSize={config.iconSize}
            />
            <VStack spacing={0} align="start">
              <Text
                color="white"
                fontWeight="semibold"
                fontSize={config.textSizes.title}
              >
                {showSmartPrompt ? smartPrompt.title : t('Rate This Insight')}
              </Text>
              {isMobile && (
                <HStack spacing={1}>
                  <Icon as={Smartphone} color="purple.300" boxSize={3} />
                  <Text color="purple.300" fontSize="xs">
                    {t('Mobile feedback prioritized')}
                  </Text>
                </HStack>
              )}
            </VStack>
          </HStack>
          <Badge colorScheme={smartPrompt.color} variant="subtle" fontSize="xs">
            {showSmartPrompt ? t('Smart AI') : t('AI Learning')}
          </Badge>
        </Flex>

        {!feedbackState.submitted ? (
          <VStack spacing={config.spacing}>
            {/* NEW: Smart context message */}
            {showSmartPrompt && (
              <Box
                p={3}
                bg={`${smartPrompt.color}.900_with_alpha_0.2`}
                borderRadius="md"
                border="1px solid"
                borderColor={`${smartPrompt.color}.600`}
              >
                <Text
                  color={`${smartPrompt.color}.200`}
                  fontSize={config.textSizes.subtitle}
                  textAlign="center"
                >
                  {smartPrompt.message}
                </Text>
                {smartFeedback.confidence && (
                  <HStack justify="center" mt={2}>
                    <Text
                      color={`${smartPrompt.color}.300`}
                      fontSize={config.textSizes.body}
                    >
                      {t('Confidence:')}
                    </Text>
                    <Progress
                      value={smartFeedback.confidence}
                      size="sm"
                      colorScheme={smartPrompt.color}
                      w="80px"
                      borderRadius="full"
                    />
                    <Text
                      color={`${smartPrompt.color}.200`}
                      fontSize={config.textSizes.body}
                    >
                      {smartFeedback.confidence}%
                    </Text>
                  </HStack>
                )}
              </Box>
            )}

            <Text
              color="whiteAlpha.800"
              fontSize={config.textSizes.subtitle}
              textAlign="center"
            >
              {isMobile
                ? t('Your mobile feedback drives our AI improvements!')
                : t('Your feedback helps us provide better analysis')}
            </Text>

            {/* Enhanced feedback type selection */}
            <SimpleGrid columns={2} spacing={3} w="100%">
              {Object.entries(FEEDBACK_TYPES)
                .filter(([type]) => type !== 'excellent' || priorityFeedback)
                .map(([type, typeConfig]) => (
                  <Button
                    key={type}
                    size={config.buttonSize}
                    leftIcon={<Icon as={typeConfig.icon} />}
                    variant={feedbackState.type === type ? 'solid' : 'outline'}
                    colorScheme={typeConfig.color}
                    onClick={() =>
                      setFeedbackState(prev => ({ ...prev, type }))
                    }
                    _hover={
                      feedbackState.type !== type
                        ? {
                            bg: `${typeConfig.color}.500_with_alpha_0.1`,
                            color: `${typeConfig.color}.200`,
                          }
                        : { bg: `${typeConfig.color}.700` }
                    }
                    transition="all 0.2s"
                    fontSize={config.textSizes.button}
                    py={isMobile ? 2.5 : 2}
                    h="auto"
                    flexDirection={isMobile ? 'column' : 'row'}
                    position="relative"
                  >
                    <Text mt={isMobile ? 1 : 0}>{t(typeConfig.label)}</Text>
                    {showSmartPrompt && (
                      <Badge
                        position="absolute"
                        top="-6px"
                        right="-6px"
                        colorScheme={smartPrompt.color}
                        variant="solid"
                        fontSize="xx-small"
                        borderRadius="full"
                      >
                        AI
                      </Badge>
                    )}
                  </Button>
                ))}
            </SimpleGrid>

            {feedbackState.type && (
              <MotionBox
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                w="100%"
              >
                <VStack spacing={config.spacing} mt={config.spacing}>
                  <FormControl>
                    <FormLabel
                      color="whiteAlpha.900"
                      fontSize={config.textSizes.subtitle}
                    >
                      {t('Overall Rating')}
                    </FormLabel>
                    <HStack>
                      <Text
                        color="whiteAlpha.700"
                        fontSize={config.textSizes.body}
                      >
                        1
                      </Text>
                      <Slider
                        value={feedbackState.rating}
                        onChange={value =>
                          setFeedbackState(prev => ({ ...prev, rating: value }))
                        }
                        min={1}
                        max={5}
                        step={1}
                        colorScheme={smartPrompt.color}
                        flex={1}
                      >
                        <SliderTrack bg="blackAlpha.400">
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb boxSize={isMobile ? 4 : 5}>
                          <Icon
                            as={Star}
                            color={`${smartPrompt.color}.500`}
                            boxSize={isMobile ? 3 : 4}
                          />
                        </SliderThumb>
                      </Slider>
                      <Text
                        color="whiteAlpha.700"
                        fontSize={config.textSizes.body}
                      >
                        5
                      </Text>
                      <Text
                        color={`${smartPrompt.color}.300`}
                        fontSize={config.textSizes.subtitle}
                        fontWeight="bold"
                        minW="20px"
                        textAlign="center"
                      >
                        {feedbackState.rating}
                      </Text>
                    </HStack>
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      color="whiteAlpha.900"
                      fontSize={config.textSizes.subtitle}
                    >
                      {t('Comments')} ({t('Optional')})
                    </FormLabel>
                    <Textarea
                      value={feedbackState.comment}
                      onChange={e =>
                        setFeedbackState(prev => ({
                          ...prev,
                          comment: e.target.value,
                        }))
                      }
                      placeholder={
                        showSmartPrompt
                          ? t(
                              'Tell us about your experience with smart feedback...',
                            )
                          : isMobile
                          ? t('How was your mobile experience?')
                          : t('What could be improved?')
                      }
                      size="md"
                      bg="blackAlpha.300"
                      border="1px solid"
                      borderColor="whiteAlpha.300"
                      color="white"
                      _placeholder={{ color: 'whiteAlpha.500' }}
                      _focus={{
                        borderColor: `${smartPrompt.color}.400`,
                        boxShadow: `0 0 0 1px var(--chakra-colors-${smartPrompt.color}-400)`,
                      }}
                      rows={isMobile ? 3 : 4}
                      fontSize={config.textSizes.body}
                    />
                  </FormControl>

                  <HStack spacing={config.spacing} w="100%">
                    <Button
                      size={config.buttonSize}
                      variant="ghost"
                      onClick={resetFeedback}
                      color="whiteAlpha.700"
                      _hover={{ bg: 'whiteAlpha.100', color: 'whiteAlpha.900' }}
                      fontSize={config.textSizes.button}
                      h="auto"
                      py={isMobile ? 2.5 : 2}
                    >
                      {t('Reset')}
                    </Button>
                    <Button
                      size={config.buttonSize}
                      colorScheme={smartPrompt.color}
                      leftIcon={<Send size={16} />}
                      onClick={handleDetailedFeedback}
                      isLoading={feedbackState.isSubmitting}
                      loadingText={t('Submitting...')}
                      flex={1}
                      isDisabled={!feedbackState.type}
                      fontSize={config.textSizes.button}
                      _hover={{
                        bg: `${smartPrompt.color}.700`,
                        transform: 'translateY(-1px)',
                        boxShadow: 'md',
                      }}
                      bg={`${smartPrompt.color}.600`}
                      h="auto"
                      py={isMobile ? 2.5 : 2}
                    >
                      {showSmartPrompt
                        ? t('Submit Smart Feedback')
                        : t('Submit Feedback')}
                    </Button>
                  </HStack>
                </VStack>
              </MotionBox>
            )}
          </VStack>
        ) : (
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            textAlign="center"
          >
            <VStack spacing={config.spacing}>
              <Icon as={Sparkles} color="green.400" boxSize={8} />
              <Text
                color="green.300"
                fontSize={config.textSizes.title}
                fontWeight="bold"
              >
                {showSmartPrompt
                  ? t('Smart Feedback Received!')
                  : t('Feedback Received!')}
              </Text>
              <Text color="whiteAlpha.700" fontSize={config.textSizes.subtitle}>
                {isMobile
                  ? t('Thank you for your mobile feedback!')
                  : t('Thank you for helping improve our AI analysis.')}
              </Text>
              {isMobile && (
                <HStack spacing={2}>
                  <Icon as={Smartphone} color="green.300" boxSize={4} />
                  <Text color="green.200" fontSize={config.textSizes.body}>
                    {t('Mobile feedback is valuable!')}
                  </Text>
                </HStack>
              )}
              <Progress
                value={100}
                size="md"
                colorScheme="green"
                w="100%"
                borderRadius="full"
                isAnimated
              />
            </VStack>
          </MotionBox>
        )}
      </VStack>
    </Box>
  )
}

// UPDATED: Smart detailed feedback modal
const SmartDetailedFeedbackModal = ({
  isOpen,
  onClose,
  feedbackState,
  setFeedbackState,
  handleDetailedFeedback,
  resetFeedback,
  config,
  insightData,
  isMobile,
  priorityFeedback,
  showSmartPrompt,
  visibilityReason,
  smartFeedback,
  getSmartPromptMessage,
}) => {
  const { t } = useTranslation('QuickClash')
  const smartPrompt = getSmartPromptMessage()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={config.modalSize}
      scrollBehavior="inside"
      closeOnOverlayClick={!isMobile}
    >
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(6px)" />
      <ModalContent
        bg="gray.800"
        backdropFilter={isMobile ? 'none' : 'blur(15px)'}
        borderRadius={isMobile ? 'none' : 'xl'}
        borderWidth="1px"
        borderColor={`${smartPrompt.color}.700`}
        boxShadow="0 8px 30px rgba(0,0,0,0.3)"
        color="white"
        h={isMobile ? '100vh' : 'auto'}
        maxH={isMobile ? '100vh' : '90vh'}
      >
        <ModalHeader color="whiteAlpha.900" pb={isMobile ? 2 : 4}>
          <VStack spacing={1} align="start">
            <HStack>
              <Icon
                as={smartPrompt.icon}
                color={`${smartPrompt.color}.400`}
                boxSize={5}
              />
              <Text fontWeight="semibold" fontSize={config.textSizes.title}>
                {showSmartPrompt
                  ? t('Smart Detailed Feedback')
                  : t('Detailed Feedback')}
              </Text>
              {priorityFeedback && (
                <Badge colorScheme="yellow" variant="solid" fontSize="xs">
                  {t('Priority')}
                </Badge>
              )}
              {showSmartPrompt && (
                <Badge
                  colorScheme={smartPrompt.color}
                  variant="solid"
                  fontSize="xs"
                >
                  {t('Smart')}
                </Badge>
              )}
            </HStack>
            {showSmartPrompt && (
              <Text color={`${smartPrompt.color}.300`} fontSize="sm">
                {smartPrompt.message}
              </Text>
            )}
            {isMobile && (
              <HStack spacing={1}>
                <Icon as={Smartphone} color="purple.300" boxSize={3} />
                <Text color="purple.300" fontSize="xs">
                  {t('Mobile feedback is highly valued')}
                </Text>
              </HStack>
            )}
          </VStack>
        </ModalHeader>
        <ModalCloseButton
          color="whiteAlpha.700"
          _hover={{ bg: 'whiteAlpha.200' }}
          size={isMobile ? 'md' : 'lg'}
        />
        <ModalBody pb={6} px={isMobile ? 4 : 6}>
          {!feedbackState.submitted || !feedbackState.alreadyProvided ? (
            <VStack spacing={config.spacing} align="stretch">
              {insightData && (
                <Box
                  p={config.padding - 1}
                  bg="blackAlpha.400"
                  borderRadius="md"
                  border="1px solid"
                  borderColor={`${smartPrompt.color}.700`}
                >
                  <Text
                    color="whiteAlpha.900"
                    fontSize={config.textSizes.subtitle}
                    fontWeight="medium"
                  >
                    {t('Insight:')} {insightData.title}
                  </Text>
                  {insightData.description && (
                    <Text
                      color="whiteAlpha.700"
                      fontSize={config.textSizes.body}
                      mt={1}
                      noOfLines={2}
                    >
                      {insightData.description}
                    </Text>
                  )}
                </Box>
              )}

              {/* NEW: Show smart confidence if available */}
              {showSmartPrompt && smartFeedback.confidence && (
                <Box
                  p={3}
                  bg={`${smartPrompt.color}.900_with_alpha_0.2`}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={`${smartPrompt.color}.600`}
                >
                  <VStack spacing={2}>
                    <HStack justify="space-between" w="100%">
                      <Text
                        color={`${smartPrompt.color}.300`}
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        {t('Smart Feedback System')}
                      </Text>
                      <Badge
                        colorScheme={smartPrompt.color}
                        variant="solid"
                        fontSize="xs"
                      >
                        {t('AI Powered')}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between" w="100%">
                      <Text color={`${smartPrompt.color}.200`} fontSize="sm">
                        {t('Confidence Level:')}
                      </Text>
                      <HStack>
                        <Progress
                          value={smartFeedback.confidence}
                          size="sm"
                          colorScheme={smartPrompt.color}
                          w="100px"
                          borderRadius="full"
                        />
                        <Text
                          color={`${smartPrompt.color}.200`}
                          fontSize="sm"
                          fontWeight="bold"
                        >
                          {smartFeedback.confidence}%
                        </Text>
                      </HStack>
                    </HStack>
                  </VStack>
                </Box>
              )}

              <FormControl isRequired>
                <FormLabel
                  color="whiteAlpha.900"
                  fontSize={config.textSizes.subtitle}
                >
                  {showSmartPrompt
                    ? t('Was this smart insight helpful?')
                    : t('Was this insight helpful?')}
                </FormLabel>
                <RadioGroup
                  value={feedbackState.type}
                  onChange={value =>
                    setFeedbackState(prev => ({ ...prev, type: value }))
                  }
                >
                  <Stack direction={isMobile ? 'column' : 'row'} spacing={4}>
                    <Radio
                      value="helpful"
                      colorScheme="green"
                      size={isMobile ? 'md' : 'lg'}
                    >
                      <HStack spacing={2}>
                        <Icon as={ThumbsUp} color="green.400" boxSize={4} />
                        <Text fontSize={config.textSizes.subtitle}>
                          {t('Helpful')}
                        </Text>
                      </HStack>
                    </Radio>
                    <Radio
                      value="not_helpful"
                      colorScheme="red"
                      size={isMobile ? 'md' : 'lg'}
                    >
                      <HStack spacing={2}>
                        <Icon as={ThumbsDown} color="red.400" boxSize={4} />
                        <Text fontSize={config.textSizes.subtitle}>
                          {t('Not Helpful')}
                        </Text>
                      </HStack>
                    </Radio>
                    {priorityFeedback && (
                      <Radio
                        value="excellent"
                        colorScheme="yellow"
                        size={isMobile ? 'md' : 'lg'}
                      >
                        <HStack spacing={2}>
                          <Icon as={Sparkles} color="yellow.400" boxSize={4} />
                          <Text fontSize={config.textSizes.subtitle}>
                            {t('Excellent')}
                          </Text>
                        </HStack>
                      </Radio>
                    )}
                  </Stack>
                </RadioGroup>
              </FormControl>

              <Divider borderColor="whiteAlpha.200" />

              <FormControl>
                <FormLabel
                  color="whiteAlpha.900"
                  fontSize={config.textSizes.subtitle}
                >
                  {t('Overall Rating')}
                </FormLabel>
                <HStack>
                  <Text color="whiteAlpha.700" fontSize={config.textSizes.body}>
                    1
                  </Text>
                  <Slider
                    value={feedbackState.rating}
                    onChange={value =>
                      setFeedbackState(prev => ({ ...prev, rating: value }))
                    }
                    min={1}
                    max={5}
                    step={1}
                    colorScheme={smartPrompt.color}
                    flex={1}
                  >
                    <SliderTrack bg="blackAlpha.400">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={isMobile ? 4 : 5}>
                      <Icon
                        as={Star}
                        color={`${smartPrompt.color}.500`}
                        boxSize={isMobile ? 3 : 4}
                      />
                    </SliderThumb>
                  </Slider>
                  <Text color="whiteAlpha.700" fontSize={config.textSizes.body}>
                    5
                  </Text>
                  <Text
                    color={`${smartPrompt.color}.300`}
                    fontSize={config.textSizes.subtitle}
                    fontWeight="bold"
                    minW="20px"
                    textAlign="center"
                  >
                    {feedbackState.rating}
                  </Text>
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel
                  color="whiteAlpha.900"
                  fontSize={config.textSizes.subtitle}
                >
                  {t('Comments')} ({t('Optional')})
                </FormLabel>
                <Textarea
                  value={feedbackState.comment}
                  onChange={e =>
                    setFeedbackState(prev => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  placeholder={
                    showSmartPrompt
                      ? t('How was your smart feedback experience?')
                      : isMobile
                      ? t('How was your mobile experience?')
                      : t('What could be improved?')
                  }
                  bg="blackAlpha.300"
                  borderColor="whiteAlpha.300"
                  color="white"
                  _placeholder={{ color: 'whiteAlpha.500' }}
                  _focus={{
                    borderColor: `${smartPrompt.color}.400`,
                    boxShadow: `0 0 0 1px var(--chakra-colors-${smartPrompt.color}-400)`,
                  }}
                  rows={isMobile ? 3 : 4}
                  fontSize={config.textSizes.body}
                />
              </FormControl>

              {/* UPDATED: Enhanced specific aspects with smart timing */}
              <Box w="100%">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() =>
                    setFeedbackState(prev => ({
                      ...prev,
                      showAdvanced: !prev.showAdvanced,
                    }))
                  }
                  color={`${smartPrompt.color}.300`}
                  fontSize={config.textSizes.body}
                  rightIcon={
                    feedbackState.showAdvanced ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )
                  }
                >
                  {showSmartPrompt
                    ? t('Rate Smart Features')
                    : t('Rate Specific Aspects')}
                </Button>
                <Collapse in={feedbackState.showAdvanced}>
                  <VStack
                    spacing={config.spacing}
                    mt={config.spacing}
                    align="stretch"
                  >
                    {Object.entries(ASPECT_LABELS).map(([aspect, label]) => {
                      if (aspect === 'mobile_experience' && !isMobile)
                        return null
                      if (aspect === 'smart_timing' && !showSmartPrompt)
                        return null

                      return (
                        <FormControl key={aspect} size="sm">
                          <FormLabel
                            color="whiteAlpha.800"
                            fontSize={config.textSizes.body}
                          >
                            {t(label)}
                          </FormLabel>
                          <HStack>
                            <Text
                              color="whiteAlpha.600"
                              fontSize={config.textSizes.body}
                            >
                              1
                            </Text>
                            <Slider
                              value={feedbackState.specificAspects[aspect] || 3}
                              onChange={value =>
                                setFeedbackState(prev => ({
                                  ...prev,
                                  specificAspects: {
                                    ...prev.specificAspects,
                                    [aspect]: value,
                                  },
                                }))
                              }
                              min={1}
                              max={5}
                              step={1}
                              colorScheme={smartPrompt.color}
                              flex={1}
                              size="sm"
                            >
                              <SliderTrack bg="blackAlpha.400">
                                <SliderFilledTrack />
                              </SliderTrack>
                              <SliderThumb boxSize={3} />
                            </Slider>
                            <Text
                              color="whiteAlpha.600"
                              fontSize={config.textSizes.body}
                            >
                              5
                            </Text>
                            <Text
                              color={`${smartPrompt.color}.300`}
                              fontSize={config.textSizes.subtitle}
                              fontWeight="bold"
                              minW="15px"
                              textAlign="center"
                            >
                              {feedbackState.specificAspects[aspect] || 3}
                            </Text>
                          </HStack>
                        </FormControl>
                      )
                    })}
                  </VStack>
                </Collapse>
              </Box>
            </VStack>
          ) : (
            <VStack spacing={4} textAlign="center" py={6}>
              <MotionBox
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Icon
                  as={Sparkles}
                  color={`${smartPrompt.color}.400`}
                  boxSize={12}
                />
              </MotionBox>
              <Text
                color={`${smartPrompt.color}.300`}
                fontSize={config.textSizes.title}
                fontWeight="bold"
              >
                {t('Thank You!')}
              </Text>
              <Text color="whiteAlpha.800" fontSize={config.textSizes.subtitle}>
                {showSmartPrompt
                  ? isMobile
                    ? t(
                        'Your mobile smart feedback helps improve our mobile experience!',
                      )
                    : t(
                        'Your smart feedback helps improve our AI analysis system!',
                      )
                  : isMobile
                  ? t(
                      'Your mobile feedback helps improve our mobile experience!',
                    )
                  : t('Your feedback helps improve our AI analysis.')}
              </Text>
            </VStack>
          )}
        </ModalBody>
        {(!feedbackState.submitted || !feedbackState.alreadyProvided) && (
          <ModalFooter
            borderTop="1px solid"
            borderColor="whiteAlpha.200"
            flexDirection={isMobile ? 'column' : 'row'}
            gap={isMobile ? 2 : 0}
          >
            <HStack spacing={3} w="100%">
              <Button
                variant="ghost"
                onClick={resetFeedback}
                size={config.buttonSize}
                color="whiteAlpha.700"
                _hover={{ bg: 'whiteAlpha.100' }}
                fontSize={config.textSizes.button}
                py={isMobile ? 2.5 : 2}
                h="auto"
              >
                {t('Reset')}
              </Button>
              <Button
                variant="ghost"
                colorScheme={smartPrompt.color}
                onClick={onClose}
                fontSize={config.textSizes.button}
                size={config.buttonSize}
                _hover={{ bg: `${smartPrompt.color}.500_with_alpha_0.1` }}
                py={isMobile ? 2.5 : 2}
                h="auto"
              >
                {t('Cancel')}
              </Button>
              <Button
                colorScheme={smartPrompt.color}
                bg={`${smartPrompt.color}.600`}
                _hover={{ bg: `${smartPrompt.color}.700` }}
                onClick={handleDetailedFeedback}
                isLoading={feedbackState.isSubmitting}
                loadingText={t('Submitting...')}
                leftIcon={<Send size={16} />}
                isDisabled={!feedbackState.type || feedbackState.isSubmitting}
                flex={1}
                size={config.buttonSize}
                fontSize={config.textSizes.button}
                py={isMobile ? 2.5 : 2}
                h="auto"
              >
                {showSmartPrompt
                  ? t('Submit Smart Feedback')
                  : t('Submit Feedback')}
              </Button>
            </HStack>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  )
}

export default SimplifiedEnhancedFeedbackWidget
