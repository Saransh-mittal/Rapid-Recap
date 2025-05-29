// components/quickClashComponents/team/battleAnalysis/components/EnhancedFeedbackWidget.jsx
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
  FormHelperText,
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
  TrendingUp,
  Brain,
  Target,
  Lightbulb,
  Send,
  Sparkles,
  BarChart3,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Heart,
  ChevronDown,
  ChevronUp,
  Smartphone,
} from 'lucide-react'
import useQuickClashAnalysis from '../../../../../customHooks/useQuickClashAnalysis'
import { useFeedbackContext } from '../../../../../contextAPI/FeedbackContext'
import { useMemo } from 'react'

const MotionBox = motion(Box)

const FEEDBACK_TYPES = {
  helpful: { icon: ThumbsUp, color: 'green', label: 'Helpful' },
  not_helpful: { icon: ThumbsDown, color: 'red', label: 'Not Helpful' },
  more_info_requested: {
    icon: MessageSquare,
    color: 'blue',
    label: 'Need More Info',
  },
  irrelevant: { icon: Target, color: 'orange', label: 'Not Relevant' },
  confusing: { icon: Brain, color: 'purple', label: 'Confusing' },
  excellent: { icon: Sparkles, color: 'yellow', label: 'Excellent' },
}

const ASPECT_LABELS = {
  accuracy: 'How accurate was this insight?',
  relevance: 'How relevant was this to your battle?',
  actionability: 'How actionable was the advice?',
  clarity: 'How clear was the explanation?',
  mobile_experience: 'How was the mobile experience?',
}

/**
 * Enhanced Feedback Widget - Mobile-First with Same Experience Everywhere
 */
const EnhancedFeedbackWidget = ({
  insightData,
  compact = false,
  showDetailedForm = false,
  onFeedbackSubmitted,
  userStats = {},
  autoShow = true, // Default to true, parent can override for animation delay
  battleId,
  priorityFeedback = false,
  mobileOptimized = false, // Retained for backend payload
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
      buttonSize: isMobile ? 'sm' : 'md', // General button size
      quickFeedbackButtonSize: isMobile ? 'sm' : 'sm', // Smaller for compact quick feedback
      textSizes: {
        title: isMobile ? 'md' : 'lg',
        subtitle: isMobile ? 'sm' : 'md',
        body: isMobile ? 'xs' : 'sm',
        button: isMobile ? 'xs' : 'sm', // Smaller button text
      },
      spacing: isMobile ? 3 : 4,
      padding: isMobile ? 3 : 4,
      iconSize: isMobile ? 4 : 5,
      quickFeedbackIconSize: 14,
      showAllFeatures: true,
      touchOptimized: isMobile,
      widgetBg: 'blackAlpha.300', // Darker, subtle background
      widgetBorderColor: 'whiteAlpha.200', // Subtle border
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
      actionability: 3,
      clarity: 3,
      mobile_experience: isMobile ? 3 : undefined,
    },
    improvementSuggestions: '',
    isSubmitting: false,
    submitted: false,
    alreadyProvided: false,
    initialCheckDone: false,
    showAdvanced: false,
  })

  // ShowQuickFeedback will be determined by useEffect after checking if feedback exists
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

  useEffect(() => {
    if (!hasValidInsightData) {
      setFeedbackState(prev => ({
        ...prev,
        initialCheckDone: true,
        alreadyProvided: false,
      }))
      // Ensure quick feedback is not shown if data is invalid
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

          // CRITICAL FIX: Show quick feedback if it doesn't exist.
          // autoShow prop will control animation delay, not primary visibility here.
          setShowQuickFeedback(!exists)

          if (exists) {
            trackInteraction('feedback_already_provided', {
              insightTitle: checkTitle,
              deviceType: isMobile ? 'mobile' : 'desktop',
            })
          }
        } catch (error) {
          console.error('Error checking initial feedback:', error)
          setFeedbackState(prev => ({
            ...prev,
            initialCheckDone: true,
            alreadyProvided: false, // Assume not provided on error
          }))
          setShowQuickFeedback(true) // Attempt to show on error, assuming not provided
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
    isMobile, // Removed autoShow from deps for this specific visibility logic
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
    trackInteraction('quick_feedback_start', {
      type,
      insightTitle: safeInsightTitle,
      deviceType: isMobile ? 'mobile' : 'desktop',
      isPriorityFeedback: priorityFeedback,
    })
    try {
      const result = await submitInsightFeedbackToServer(
        { ...insightData, title: safeInsightTitle },
        type,
        type === 'helpful'
          ? 4
          : type === 'not_helpful'
          ? 2
          : type === 'excellent'
          ? 5
          : 3,
        {
          comment: 'Quick feedback',
          userScore: userStats.score || 0,
          trophyChange: userStats.trophyChange || 0,
          teamRole: userStats.teamRole || 'average',
          deviceType: isMobile ? 'mobile' : 'desktop',
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          touchSupport: 'ontouchstart' in window,
          priorityFeedback,
          mobileOptimized,
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
        trackInteraction('quick_feedback_success', {
          type,
          deviceType: isMobile ? 'mobile' : 'desktop',
        })
        onFeedbackSubmitted?.(type, 'quick')
        toast({
          title: t('Thanks for your feedback!'),
          description: isMobile
            ? t('Your mobile feedback helps improve our AI!')
            : t('Your input helps improve our AI analysis.'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        handleFeedbackError(result)
      }
    } catch (error) {
      console.error('Quick feedback error:', error)
      handleFeedbackError(error)
    } finally {
      setFeedbackState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleDetailedFeedback = async () => {
    if (!feedbackState.type) {
      toast({
        title: t('Feedback Type Required'),
        description: t('Please select a feedback category before submitting.'),
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
    trackInteraction('detailed_feedback_start', {
      type: feedbackState.type,
      rating: feedbackState.rating,
      insightTitle: safeInsightTitle,
      deviceType: isMobile ? 'mobile' : 'desktop',
      hasAdvancedFeedback: feedbackState.showAdvanced,
      isPriorityFeedback: priorityFeedback,
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
        },
      )
      if (result && result.success) {
        setFeedbackState(prev => ({
          ...prev,
          submitted: true,
          alreadyProvided: true,
        }))
        markFeedbackProvided(analysisId, safeInsightTitle)
        trackInteraction('detailed_feedback_success', {
          type: feedbackState.type,
          deviceType: isMobile ? 'mobile' : 'desktop',
        })
        onFeedbackSubmitted?.(feedbackState.type, 'detailed')
        toast({
          title: t('Feedback Submitted!'),
          description: isMobile
            ? t('Thank you for your detailed mobile feedback!')
            : t('Thank you for your detailed input.'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        setTimeout(() => {
          onClose()
          setShowQuickFeedback(false)
        }, 1500)
      } else {
        handleFeedbackError(result)
      }
    } catch (error) {
      console.error('Detailed feedback error:', error)
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
        actionability: 3,
        clarity: 3,
        mobile_experience: isMobile ? 3 : undefined,
      },
      improvementSuggestions: '',
      isSubmitting: false,
      submitted: prev.alreadyProvided,
      showAdvanced: false,
    }))
    trackInteraction('feedback_reset', {
      deviceType: isMobile ? 'mobile' : 'desktop',
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
            {t('Checking feedback status...')}
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
        bg="rgba(34, 197, 94, 0.1)" // Green tint for success, good
        borderRadius="lg"
        border="1px solid"
        borderColor="green.500" // Darker green border
        textAlign="center"
      >
        <VStack spacing={2}>
          <Icon as={CheckCircle} color="green.400" boxSize={config.iconSize} />
          <Text
            color="green.300"
            fontSize={config.textSizes.subtitle}
            fontWeight="medium"
          >
            {t('Feedback provided')}
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
                {t('Mobile user feedback')}
              </Text>
            </HStack>
          )}
        </VStack>
      </MotionBox>
    )
  }

  if (compact) {
    return (
      <Box>
        {showQuickFeedback && // This is the gatekeeper for the compact UI
          !feedbackState.submitted &&
          !feedbackState.alreadyProvided && (
            <MotionBox
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              // autoShow prop now controls animation delay for this appearing
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
                {priorityFeedback && (
                  <Badge
                    position="absolute"
                    top="-8px"
                    left="12px"
                    colorScheme="yellow"
                    variant="solid"
                    fontSize="xs"
                  >
                    {t('Priority Feedback')}
                  </Badge>
                )}
                <VStack spacing={config.spacing}>
                  <HStack justify="space-between" w="100%">
                    <VStack spacing={1} align="start" flex={1}>
                      <Text
                        fontSize={config.textSizes.subtitle}
                        color="whiteAlpha.900"
                        fontWeight="semibold"
                      >
                        {t('Was this insight helpful?')}
                      </Text>
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

                  <SimpleGrid
                    columns={isMobile ? 2 : priorityFeedback ? 3 : 2}
                    spacing={2}
                    w="100%"
                  >
                    <Button
                      size={config.quickFeedbackButtonSize}
                      leftIcon={
                        <ThumbsUp size={config.quickFeedbackIconSize} />
                      }
                      colorScheme="green"
                      variant="ghost" // More subtle
                      onClick={() => handleQuickFeedback('helpful')}
                      isLoading={
                        feedbackState.isSubmitting &&
                        feedbackState.type === 'helpful'
                      }
                      loadingText={t('Sending...')}
                      fontSize={config.textSizes.button}
                      _hover={{
                        bg: 'whiteAlpha.100',
                        transform: 'translateY(-1px)',
                      }}
                      _active={{ bg: 'whiteAlpha.200' }}
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
                      variant="ghost" // More subtle
                      onClick={() => handleQuickFeedback('not_helpful')}
                      isLoading={
                        feedbackState.isSubmitting &&
                        feedbackState.type === 'not_helpful'
                      }
                      loadingText={t('Sending...')}
                      fontSize={config.textSizes.button}
                      _hover={{
                        bg: 'whiteAlpha.100',
                        transform: 'translateY(-1px)',
                      }}
                      _active={{ bg: 'whiteAlpha.200' }}
                      h="auto"
                      py={2}
                      px={3}
                    >
                      {t('Not Helpful')}
                    </Button>
                    {priorityFeedback && (
                      <Button
                        size={config.quickFeedbackButtonSize}
                        leftIcon={
                          <Sparkles size={config.quickFeedbackIconSize} />
                        }
                        colorScheme="yellow"
                        variant="ghost" // More subtle
                        onClick={() => handleQuickFeedback('excellent')}
                        isLoading={
                          feedbackState.isSubmitting &&
                          feedbackState.type === 'excellent'
                        }
                        loadingText={t('Sending...')}
                        fontSize={config.textSizes.button}
                        gridColumn={
                          isMobile && !priorityFeedback ? 'span 2' : 'auto'
                        } // Span if it's the third button on mobile
                        _hover={{
                          bg: 'whiteAlpha.100',
                          transform: 'translateY(-1px)',
                        }}
                        _active={{ bg: 'whiteAlpha.200' }}
                        h="auto"
                        py={2}
                        px={3}
                      >
                        {t('Excellent')}
                      </Button>
                    )}
                  </SimpleGrid>

                  <Button
                    size={config.buttonSize} // Can be slightly larger than quick actions
                    leftIcon={<MessageSquare size={14} />}
                    variant="outline" // Keep outline for a bit more emphasis
                    borderColor="purple.600" // Darker purple border
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
                    {t('Detailed Feedback')}
                  </Button>
                </VStack>
              </Box>
            </MotionBox>
          )}
        <DetailedFeedbackModal
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
        />
      </Box>
    )
  }

  if (feedbackState.alreadyProvided) return null

  // Full feedback widget - Renders if not compact and feedback not already provided
  // This part remains largely the same as it's for the non-compact, detailed view.
  return (
    <Box
      p={config.padding}
      bg={config.widgetBg}
      borderRadius="xl"
      border="1px solid"
      borderColor={config.widgetBorderColor}
      backdropFilter={isMobile ? 'none' : 'blur(8px)'} // Keep blur for desktop if desired
      position="relative"
    >
      {priorityFeedback && (
        <Badge
          position="absolute"
          top="-8px"
          left="16px"
          colorScheme="yellow"
          variant="solid"
          fontSize="xs"
        >
          {t('Priority Feedback')}
        </Badge>
      )}
      <VStack spacing={config.spacing} align="stretch">
        <Flex justify="space-between" align="center">
          <HStack>
            <Icon as={BarChart3} color="purple.400" boxSize={config.iconSize} />
            <VStack spacing={0} align="start">
              <Text
                color="white"
                fontWeight="semibold"
                fontSize={config.textSizes.title}
              >
                {t('Rate This Insight')}
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
          <Badge colorScheme="purple" variant="subtle" fontSize="xs">
            {t('AI Learning')}
          </Badge>
        </Flex>

        {!feedbackState.submitted ? (
          <VStack spacing={config.spacing}>
            <Text
              color="whiteAlpha.800"
              fontSize={config.textSizes.subtitle}
              textAlign="center"
            >
              {isMobile
                ? t(
                    'Your mobile experience feedback drives our AI improvements!',
                  )
                : t(
                    'Your feedback helps us provide better personalized analysis',
                  )}
            </Text>

            <SimpleGrid columns={isMobile ? 2 : 3} spacing={2} w="100%">
              {Object.entries(FEEDBACK_TYPES).map(([type, typeConfig]) => (
                <Button
                  key={type}
                  size={config.buttonSize}
                  leftIcon={<Icon as={typeConfig.icon} />}
                  variant={
                    feedbackState.type === type ? 'solid_custom' : 'ghost'
                  } // Custom handling for solid
                  bg={
                    feedbackState.type === type
                      ? `${typeConfig.color}.600`
                      : 'transparent'
                  }
                  color={
                    feedbackState.type === type
                      ? 'white'
                      : `${typeConfig.color}.300`
                  }
                  borderColor={
                    feedbackState.type !== type
                      ? `${typeConfig.color}.700`
                      : 'transparent'
                  } // Subtle border for ghost
                  borderWidth={feedbackState.type !== type ? '1px' : '1px'}
                  onClick={() => setFeedbackState(prev => ({ ...prev, type }))}
                  _hover={
                    feedbackState.type !== type
                      ? {
                          bg: 'whiteAlpha.100',
                          color: `${typeConfig.color}.200`,
                        }
                      : { bg: `${typeConfig.color}.700` }
                  }
                  transition="all 0.2s"
                  fontSize={config.textSizes.button}
                  py={isMobile ? 2.5 : 2}
                  h="auto"
                  flexDirection={isMobile ? 'column' : 'row'}
                >
                  <Text mt={isMobile ? 1 : 0}>{t(typeConfig.label)}</Text>
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
                        colorScheme="purple"
                        flex={1}
                      >
                        <SliderTrack bg="blackAlpha.400">
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb boxSize={isMobile ? 4 : 5}>
                          <Icon
                            as={Star}
                            color="purple.500"
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
                        color="purple.300"
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
                        isMobile
                          ? t(
                              'How was your mobile experience with this insight?',
                            )
                          : t('What could be improved about this insight?')
                      }
                      size="md"
                      bg="blackAlpha.300" // Darker bg
                      border="1px solid"
                      borderColor="whiteAlpha.300" // More subtle border
                      color="white"
                      _placeholder={{ color: 'whiteAlpha.500' }}
                      _focus={{
                        borderColor: 'purple.400',
                        boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)',
                      }}
                      rows={isMobile ? 3 : 4}
                      fontSize={config.textSizes.body}
                    />
                  </FormControl>

                  <Box w="100%">
                    <Button
                      variant="link" // More subtle for collapsible trigger
                      size="sm"
                      onClick={() =>
                        setFeedbackState(prev => ({
                          ...prev,
                          showAdvanced: !prev.showAdvanced,
                        }))
                      }
                      color="purple.300"
                      fontSize={config.textSizes.body}
                      rightIcon={
                        feedbackState.showAdvanced ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )
                      }
                    >
                      {t('Advanced Options')}
                    </Button>
                    <Collapse in={feedbackState.showAdvanced}>
                      <VStack
                        spacing={config.spacing}
                        mt={config.spacing}
                        align="stretch"
                      >
                        <Text
                          color="whiteAlpha.900"
                          fontWeight="medium"
                          fontSize={config.textSizes.subtitle}
                        >
                          {t('Rate Specific Aspects')}
                        </Text>
                        {Object.entries(ASPECT_LABELS).map(
                          ([aspect, label]) => {
                            if (aspect === 'mobile_experience' && !isMobile)
                              return null
                            return (
                              <FormControl key={aspect}>
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
                                    value={
                                      feedbackState.specificAspects[aspect] || 3
                                    }
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
                                    colorScheme="purple"
                                    flex={1}
                                  >
                                    <SliderTrack bg="blackAlpha.400">
                                      <SliderFilledTrack />
                                    </SliderTrack>
                                    <SliderThumb boxSize={isMobile ? 3 : 4} />
                                  </Slider>
                                  <Text
                                    color="whiteAlpha.600"
                                    fontSize={config.textSizes.body}
                                  >
                                    5
                                  </Text>
                                  <Text
                                    color="purple.300"
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
                          },
                        )}
                        <FormControl>
                          <FormLabel
                            color="whiteAlpha.900"
                            fontSize={config.textSizes.subtitle}
                          >
                            {t('Suggestions for Improvement')} ({t('Optional')})
                          </FormLabel>
                          <Textarea
                            value={feedbackState.improvementSuggestions}
                            onChange={e =>
                              setFeedbackState(prev => ({
                                ...prev,
                                improvementSuggestions: e.target.value,
                              }))
                            }
                            placeholder={
                              isMobile
                                ? t(
                                    'How could we improve the mobile experience?',
                                  )
                                : t(
                                    'How could we make this insight more useful?',
                                  )
                            }
                            size="md"
                            bg="blackAlpha.300"
                            borderColor="whiteAlpha.300"
                            color="white"
                            _placeholder={{ color: 'whiteAlpha.500' }}
                            _focus={{
                              borderColor: 'purple.400',
                              boxShadow:
                                '0 0 0 1px var(--chakra-colors-purple-400)',
                            }}
                            rows={2}
                            fontSize={config.textSizes.body}
                          />
                        </FormControl>
                      </VStack>
                    </Collapse>
                  </Box>

                  <HStack spacing={config.spacing} w="100%">
                    <Button
                      size={config.buttonSize}
                      variant="ghost" // Subtle reset
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
                      colorScheme="purple" // Primary action
                      leftIcon={<Send size={16} />}
                      onClick={handleDetailedFeedback}
                      isLoading={feedbackState.isSubmitting}
                      loadingText={t('Submitting...')}
                      flex={1}
                      isDisabled={!feedbackState.type}
                      fontSize={config.textSizes.button}
                      _hover={{
                        bg: 'purple.700',
                        transform: 'translateY(-1px)',
                        boxShadow: 'md',
                      }}
                      bg="purple.600"
                      h="auto"
                      py={isMobile ? 2.5 : 2}
                    >
                      {t('Submit Feedback')}
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
                {t('Feedback Received!')}
              </Text>
              <Text color="whiteAlpha.700" fontSize={config.textSizes.subtitle}>
                {isMobile
                  ? t(
                      'Thank you for your mobile feedback! It helps us improve the mobile experience.',
                    )
                  : t('Thank you for helping improve our AI analysis system.')}
              </Text>
              {isMobile && (
                <HStack spacing={2}>
                  <Icon as={Smartphone} color="green.300" boxSize={4} />
                  <Text color="green.200" fontSize={config.textSizes.body}>
                    {t('Mobile user feedback is especially valuable!')}
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

const DetailedFeedbackModal = ({
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
}) => {
  const { t } = useTranslation('QuickClash')
  // Modal content remains the same, as it's not directly affected by this specific issue
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
        bg="gray.800" // Darker modal bg
        backdropFilter={isMobile ? 'none' : 'blur(15px)'}
        borderRadius={isMobile ? 'none' : 'xl'} // Slightly less rounded
        borderWidth="1px"
        borderColor="purple.700" // Darker purple border
        boxShadow="0 8px 30px rgba(0,0,0,0.3)" // More subtle shadow
        color="white"
        h={isMobile ? '100vh' : 'auto'}
        maxH={isMobile ? '100vh' : '90vh'}
      >
        <ModalHeader color="whiteAlpha.900" pb={isMobile ? 2 : 4}>
          <VStack spacing={1} align="start">
            <HStack>
              <Icon as={Brain} color="purple.400" boxSize={5} />
              <Text fontWeight="semibold" fontSize={config.textSizes.title}>
                {t('Detailed Feedback')}
              </Text>
              {priorityFeedback && (
                <Badge colorScheme="yellow" variant="solid" fontSize="xs">
                  {t('Priority')}
                </Badge>
              )}
            </HStack>
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
                  borderColor="purple.700"
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
              {isMobile && (
                <Box
                  p={3}
                  bg="green.900_with_alpha_0.2"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="green.600"
                >
                  <VStack spacing={2}>
                    <HStack>
                      <Icon as={Smartphone} color="green.300" boxSize={4} />
                      <Text
                        color="green.200"
                        fontSize={config.textSizes.body}
                        fontWeight="medium"
                      >
                        {t('Mobile User Feedback')}
                      </Text>
                    </HStack>
                    <Text
                      color="green.200"
                      fontSize={config.textSizes.body}
                      textAlign="center"
                    >
                      {t(
                        'Your mobile experience feedback is crucial - most of our users are on mobile like you!',
                      )}
                    </Text>
                  </VStack>
                </Box>
              )}
              <FormControl isRequired>
                <FormLabel
                  color="whiteAlpha.900"
                  fontSize={config.textSizes.subtitle}
                >
                  {t('How would you categorize this feedback?')}
                </FormLabel>
                <RadioGroup
                  value={feedbackState.type}
                  onChange={value =>
                    setFeedbackState(prev => ({ ...prev, type: value }))
                  }
                >
                  <SimpleGrid columns={isMobile ? 1 : 2} spacing={2}>
                    {Object.entries(FEEDBACK_TYPES).map(
                      ([type, typeConfig]) => (
                        <Radio
                          key={type}
                          value={type}
                          colorScheme={typeConfig.color}
                          size={isMobile ? 'md' : 'lg'}
                          p={1.5}
                          sx={{
                            '.chakra-radio__control': {
                              bg: 'blackAlpha.400',
                              borderColor: 'whiteAlpha.400',
                            },
                          }}
                        >
                          <HStack spacing={2}>
                            <Icon
                              as={typeConfig.icon}
                              color={`${typeConfig.color}.400`}
                              boxSize={config.iconSize - 1}
                            />
                            <Text fontSize={config.textSizes.subtitle}>
                              {t(typeConfig.label)}
                            </Text>
                          </HStack>
                        </Radio>
                      ),
                    )}
                  </SimpleGrid>
                </RadioGroup>
              </FormControl>
              <Divider borderColor="whiteAlpha.200" />
              {/* Overall Rating, Comments, Advanced Options from Full Widget, adapted for modal */}
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
                    colorScheme="purple"
                    flex={1}
                  >
                    <SliderTrack bg="blackAlpha.400">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={isMobile ? 4 : 5}>
                      <Icon
                        as={Star}
                        color="purple.500"
                        boxSize={isMobile ? 3 : 4}
                      />
                    </SliderThumb>
                  </Slider>
                  <Text color="whiteAlpha.700" fontSize={config.textSizes.body}>
                    5
                  </Text>
                  <Text
                    color="purple.300"
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
                    isMobile
                      ? t('How was your mobile experience with this insight?')
                      : t('What could be improved about this insight?')
                  }
                  bg="blackAlpha.300"
                  borderColor="whiteAlpha.300"
                  color="white"
                  _placeholder={{ color: 'whiteAlpha.500' }}
                  _focus={{
                    borderColor: 'purple.400',
                    boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)',
                  }}
                  rows={isMobile ? 3 : 4}
                  fontSize={config.textSizes.body}
                />
              </FormControl>
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
                  color="purple.300"
                  fontSize={config.textSizes.body}
                  rightIcon={
                    feedbackState.showAdvanced ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )
                  }
                >
                  {t('Advanced Options')}
                </Button>
                <Collapse in={feedbackState.showAdvanced}>
                  <VStack
                    spacing={config.spacing}
                    mt={config.spacing}
                    align="stretch"
                  >
                    <Text
                      color="whiteAlpha.900"
                      fontWeight="medium"
                      fontSize={config.textSizes.subtitle}
                    >
                      {t('Rate Specific Aspects')}
                    </Text>
                    {Object.entries(ASPECT_LABELS).map(([aspect, label]) => {
                      if (aspect === 'mobile_experience' && !isMobile)
                        return null
                      return (
                        <FormControl key={aspect}>
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
                              colorScheme="purple"
                              flex={1}
                            >
                              <SliderTrack bg="blackAlpha.400">
                                <SliderFilledTrack />
                              </SliderTrack>
                              <SliderThumb boxSize={isMobile ? 3 : 4} />
                            </Slider>
                            <Text
                              color="whiteAlpha.600"
                              fontSize={config.textSizes.body}
                            >
                              5
                            </Text>
                            <Text
                              color="purple.300"
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
                    <FormControl>
                      <FormLabel
                        color="whiteAlpha.900"
                        fontSize={config.textSizes.subtitle}
                      >
                        {t('Suggestions for Improvement')} ({t('Optional')})
                      </FormLabel>
                      <Textarea
                        value={feedbackState.improvementSuggestions}
                        onChange={e =>
                          setFeedbackState(prev => ({
                            ...prev,
                            improvementSuggestions: e.target.value,
                          }))
                        }
                        placeholder={
                          isMobile
                            ? t('How could we improve the mobile experience?')
                            : t('How could we make this insight more useful?')
                        }
                        bg="blackAlpha.300"
                        borderColor="whiteAlpha.300"
                        color="white"
                        _placeholder={{ color: 'whiteAlpha.500' }}
                        _focus={{
                          borderColor: 'purple.400',
                          boxShadow:
                            '0 0 0 1px var(--chakra-colors-purple-400)',
                        }}
                        rows={2}
                        fontSize={config.textSizes.body}
                      />
                    </FormControl>
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
                <Icon as={Sparkles} color="green.400" boxSize={12} />
              </MotionBox>
              <Text
                color="green.300"
                fontSize={config.textSizes.title}
                fontWeight="bold"
              >
                {t('Thank You!')}
              </Text>
              <Text color="whiteAlpha.800" fontSize={config.textSizes.subtitle}>
                {isMobile
                  ? t(
                      'Your mobile feedback has been recorded and will help improve the mobile experience for all users!',
                    )
                  : t(
                      'Your detailed feedback has been recorded and will help improve our AI analysis.',
                    )}
              </Text>
              {isMobile && (
                <Box
                  p={3}
                  bg="green.900_with_alpha_0.2"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="green.600"
                  w="100%"
                >
                  <HStack justify="center">
                    <Icon as={Smartphone} color="green.300" boxSize={5} />
                    <Text
                      color="green.200"
                      fontSize={config.textSizes.subtitle}
                    >
                      {t('Mobile feedback is our priority!')}
                    </Text>
                  </HStack>
                </Box>
              )}
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
                colorScheme="purple"
                onClick={onClose}
                fontSize={config.textSizes.button}
                size={config.buttonSize}
                _hover={{ bg: 'purple.500_with_alpha_0.1' }}
                py={isMobile ? 2.5 : 2}
                h="auto"
              >
                {t('Cancel')}
              </Button>
              <Button
                colorScheme="purple"
                bg="purple.600"
                _hover={{ bg: 'purple.700' }}
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
                {t('Submit Feedback')}
              </Button>
            </HStack>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  )
}

// SmartFeedbackTrigger, useFeedbackIntegration, FeedbackSummary, FloatingFeedbackButton, FeedbackAnalytics remain the same
// as they were not the source of this specific visibility issue. Ensure their `autoShow` props passed to
// EnhancedFeedbackWidget are set to `false` if they manage their own visibility, or `true` if they want
// the widget to animate in on its own. For SmartFeedbackTrigger, autoShow={false} for its internal widget is correct.

export const SmartFeedbackTrigger = ({
  insightData,
  engagementData,
  onFeedbackPrompt,
}) => {
  const { t } = useTranslation('QuickClash')
  const [hasShownPrompt, setHasShownPrompt] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const { analysisId, trackInteraction } = useQuickClashAnalysis()
  const { checkFeedbackExists } = useFeedbackContext()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const safeInsightTitle = insightData?.title || 'General Analysis View'

  useEffect(() => {
    const checkAndShowPrompt = async () => {
      if (!engagementData || hasShownPrompt) return
      const alreadyProvided = await checkFeedbackExists(
        analysisId,
        safeInsightTitle,
      )
      if (alreadyProvided) return
      const shouldShowPrompt = isMobile
        ? engagementData.scrollDepth > 40 && engagementData.readingTime > 10000
        : engagementData.scrollDepth > 60 && engagementData.readingTime > 15000
      if (shouldShowPrompt) {
        setTimeout(
          () => {
            setShowPrompt(true)
            setHasShownPrompt(true)
            onFeedbackPrompt?.()
            trackInteraction('smart_feedback_trigger', {
              insightTitle: safeInsightTitle,
              deviceType: isMobile ? 'mobile' : 'desktop',
            })
          },
          isMobile ? 1500 : 2000,
        )
      }
    }
    checkAndShowPrompt()
  }, [
    engagementData,
    hasShownPrompt,
    onFeedbackPrompt,
    analysisId,
    safeInsightTitle,
    checkFeedbackExists,
    trackInteraction,
    isMobile,
  ])

  if (!showPrompt) return null

  return (
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
        bg="gray.800" // Darker background for the popup
        backdropFilter={isMobile ? 'none' : 'blur(10px)'} // Subtle blur
        borderRadius="lg" // Less rounded
        p={isMobile ? 3 : 4} // Adjusted padding
        border="1px solid"
        borderColor="purple.700" // Darker border
        boxShadow="0 6px 20px rgba(0, 0, 0, 0.3)" // More subtle shadow
        color="white"
      >
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <HStack>
              <Icon as={Sparkles} color="white" boxSize={5} />
              <VStack spacing={0} align="start">
                <Text
                  color="white"
                  fontWeight="bold"
                  fontSize={isMobile ? 'sm' : 'md'}
                >
                  {t('Quick Feedback')}
                </Text>
                {isMobile && (
                  <HStack spacing={1}>
                    <Icon as={Smartphone} color="whiteAlpha.800" boxSize={3} />
                    <Text color="whiteAlpha.800" fontSize="xs">
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
              ✕
            </Button>
          </HStack>
          <Text color="whiteAlpha.900" fontSize={isMobile ? 'sm' : 'md'}>
            {isMobile
              ? t('How was your mobile experience with this insight?')
              : t('Was this insight helpful for your battle analysis?')}
          </Text>
          <EnhancedFeedbackWidget
            insightData={{ ...insightData, title: safeInsightTitle }}
            compact={true}
            priorityFeedback={isMobile}
            onFeedbackSubmitted={() => setShowPrompt(false)}
            userStats={engagementData?.userStats || {}}
            mobileOptimized={isMobile}
            autoShow={false} // Correct for SmartFeedbackTrigger: animation delay = 0, widget decides visibility
          />
        </VStack>
      </Box>
    </MotionBox>
  )
}

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
    bg: 'blackAlpha.300', // Subtle background
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'whiteAlpha.200', // Subtle border
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
            {t('Start Providing Feedback')}
          </Text>
          <Text color="whiteAlpha.700" fontSize={isMobile ? 'xs' : 'sm'}>
            {isMobile
              ? t('Your mobile experience feedback is especially valuable!')
              : t('Your feedback helps improve AI analysis for everyone!')}
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
            {t('AI Learning')}
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
              {t('Total Feedback')}
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

export const FloatingFeedbackButton = ({
  onOpen,
  hasUnseenInsights = false,
  isDisabled = false,
}) => {
  const { t } = useTranslation('QuickClash')
  const isMobile = useBreakpointValue({ base: true, md: false })
  return (
    <MotionBox
      position="fixed"
      bottom={isMobile ? 4 : 6}
      right={isMobile ? 4 : 6}
      zIndex="tooltip"
      whileHover={{ scale: isDisabled ? 1 : 1.05 }}
      whileTap={{ scale: isDisabled ? 1 : 0.95 }}
    >
      <Tooltip
        label={isMobile ? t('Give Feedback') : t('Provide Feedback')}
        placement="left"
        bg="purple.600"
        color="white"
        isDisabled={isMobile || isDisabled}
      >
        <Button
          onClick={onOpen}
          bg="purple.600" // Solid, slightly darker purple
          backdropFilter="none" // Remove blur if solid
          border="1px solid"
          borderColor="purple.500" // Matching border
          color="white"
          size={isMobile ? 'md' : 'lg'}
          borderRadius="full"
          boxShadow="0 4px 15px rgba(139, 92, 246, 0.25)" // More subtle shadow
          leftIcon={<MessageSquare size={isMobile ? 16 : 20} />}
          _hover={{
            bg: isDisabled ? 'purple.600' : 'purple.700',
            transform: isDisabled ? 'none' : 'translateY(-2px)',
            boxShadow: isDisabled
              ? '0 4px 15px rgba(139, 92, 246, 0.25)'
              : '0 6px 20px rgba(139, 92, 246, 0.35)',
          }}
          _active={{
            bg: isDisabled ? 'purple.600' : 'purple.800',
            transform: isDisabled ? 'none' : 'translateY(0)',
          }}
          transition="all 0.2s ease-in-out"
          aria-label={t('Open feedback form')}
          fontSize={isMobile ? 'sm' : 'md'}
          px={isMobile ? 4 : 6}
          isDisabled={isDisabled}
          opacity={isDisabled ? 0.6 : 1}
        >
          {isMobile ? t('Feedback') : t('Feedback')}
          {hasUnseenInsights && !isDisabled && (
            <Circle
              size="10px"
              bg="red.500"
              position="absolute"
              top="-3px"
              right="-3px"
              border="2px solid var(--chakra-colors-purple-600)"
            />
          )}
          {/* Removed smartphone icon for cleaner look */}
        </Button>
      </Tooltip>
    </MotionBox>
  )
}

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
          `/api/quickClash/analysis/feedback-analytics?timeframe=${timeframe}&detailed=true`,
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
    bg: 'gray.800', // Consistent dark bg
    borderRadius: 'lg', // Less rounded
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
          {t('Loading feedback analytics...')}
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
          {t('No analytics data available for the selected timeframe.')}
        </Text>
      </Box>
    )

  return (
    <VStack spacing={isMobile ? 4 : 6} align="stretch" {...analyticsBoxProps}>
      <HStack justify="space-between" align="center">
        <Text color="white" fontSize={isMobile ? 'lg' : 'xl'} fontWeight="bold">
          {t('Feedback Analytics')}
        </Text>
        <Badge colorScheme="blue" variant="outline" fontSize="xs">
          {t('Last {{count}} days', {
            count: analytics.timeframeDays || timeframe,
          })}
        </Badge>
      </HStack>
      <SimpleGrid columns={isMobile ? 1 : 3} spacing={4}>
        {[
          {
            label: t('Total Feedback'),
            value: analytics.metrics.totalFeedback || 0,
            color: 'green',
          },
          {
            label: t('Avg Rating'),
            value: (analytics.metrics.avgRating || 0).toFixed(1),
            color: 'yellow',
          },
          {
            label: t('Helpful Rate'),
            value: `${((analytics.metrics.helpfulRate || 0) * 100).toFixed(
              0,
            )}%`,
            color: 'purple',
          },
        ].map(metric => (
          <Box
            key={metric.label}
            p={isMobile ? 3 : 4}
            bg={`rgba(var(--chakra-colors-${metric.color}-rgb), 0.1)`}
            borderRadius="md"
            border="1px solid"
            borderColor={`${metric.color}.600`}
            textAlign="center"
          >
            <VStack>
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
      {analytics.patterns && analytics.patterns.length > 0 && (
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
            {t('Key Insights & Patterns')}
          </Text>
          <VStack spacing={3} align="stretch">
            {analytics.patterns.slice(0, 3).map((pattern, index) => (
              <Box
                key={index}
                p={3}
                bg="purple.900_with_alpha_0.2"
                borderRadius="md"
                borderLeft="3px solid"
                borderColor="purple.500"
              >
                <Text
                  color="purple.300"
                  fontSize={isMobile ? 'sm' : 'md'}
                  fontWeight="medium"
                  mb={1}
                >
                  {pattern.finding || t('Unnamed Finding')}
                </Text>
                {pattern.recommendation && (
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
                    {pattern.recommendation}
                  </Text>
                )}
                {pattern.count && (
                  <Text color="whiteAlpha.500" fontSize="xs" mt={1}>
                    {t('Observed {{count}} times', { count: pattern.count })}
                  </Text>
                )}
              </Box>
            ))}
            {analytics.patterns.length > 3 && (
              <Text
                color="whiteAlpha.600"
                fontSize="sm"
                textAlign="center"
                mt={2}
              >
                {t('And {{count}} more patterns...', {
                  count: analytics.patterns.length - 3,
                })}
              </Text>
            )}
          </VStack>
        </Box>
      )}
      {(!analytics.patterns || analytics.patterns.length === 0) && (
        <Text
          color="whiteAlpha.600"
          fontSize="sm"
          textAlign="center"
          p={3}
          bg="blackAlpha.200"
          borderRadius="md"
        >
          {t('No specific patterns identified in this period.')}
        </Text>
      )}
    </VStack>
  )
}

export default EnhancedFeedbackWidget
