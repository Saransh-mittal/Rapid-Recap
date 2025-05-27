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
}

const ASPECT_LABELS = {
  accuracy: 'How accurate was this insight?',
  relevance: 'How relevant was this to your battle?',
  actionability: 'How actionable was the advice?',
  clarity: 'How clear was the explanation?',
}

/**
 * Enhanced Feedback Widget with performance optimizations and duplicate prevention
 */
const EnhancedFeedbackWidget = ({
  insightData,
  compact = false,
  showDetailedForm = false,
  onFeedbackSubmitted,
  userStats = {},
  autoShow = false,
  battleId,
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

  // Use feedback context for caching
  const { checkFeedbackExists, markFeedbackProvided, isFeedbackLoading } =
    useFeedbackContext()

  const [feedbackState, setFeedbackState] = useState({
    type: '',
    rating: 3,
    comment: '',
    specificAspects: {
      accuracy: 3,
      relevance: 3,
      actionability: 3,
      clarity: 3,
    },
    improvementSuggestions: '',
    isSubmitting: false,
    submitted: false,
    alreadyProvided: false,
    initialCheckDone: false,
  })

  const [showQuickFeedback, setShowQuickFeedback] = useState(false)

  const modalSize = useBreakpointValue({ base: 'full', sm: 'md', md: 'lg' })

  // Generate safe insight title that's never null and always unique
  const generateSafeInsightTitle = useCallback(baseTitle => {
    if (!baseTitle || baseTitle.trim() === '') {
      return `Insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    const cleanTitle = baseTitle.trim()
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substr(2, 6)

    // Ensure uniqueness by adding timestamp and random suffix
    return `${cleanTitle}-${timestamp}-${randomSuffix}`
  }, [])

  const safeInsightTitle = useMemo(() => {
    return generateSafeInsightTitle(insightData?.title)
  }, [insightData?.title, generateSafeInsightTitle])

  const hasValidInsightData = Boolean(
    analysisId && insightData && safeInsightTitle,
  )

  // Check existing feedback with retry mechanism
  useEffect(() => {
    if (!hasValidInsightData) {
      setFeedbackState(prev => ({
        ...prev,
        initialCheckDone: true,
        alreadyProvided: false,
      }))
      setShowQuickFeedback(true)
      return
    }

    if (!feedbackState.initialCheckDone) {
      const checkInitialFeedback = async () => {
        try {
          // Use the original title for checking, not the safe one
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
  ])

  // Enhanced quick feedback handler with better error handling
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
    })

    try {
      const result = await submitInsightFeedbackToServer(
        {
          ...insightData,
          title: safeInsightTitle, // Use the safe title for submission
        },
        type,
        type === 'helpful' ? 4 : type === 'not_helpful' ? 2 : 3,
        {
          comment: 'Quick feedback',
          userScore: userStats.score || 0,
          trophyChange: userStats.trophyChange || 0,
          teamRole: userStats.teamRole || 'average',
        },
      )

      if (result && result.success) {
        setFeedbackState(prev => ({
          ...prev,
          submitted: true,
          alreadyProvided: true,
        }))
        setShowQuickFeedback(false)

        // Update cache with the safe title
        markFeedbackProvided(analysisId, safeInsightTitle)

        trackInteraction('quick_feedback_success', { type })
        onFeedbackSubmitted?.(type, 'quick')

        toast({
          title: t('Thanks for your feedback!'),
          description: t('Your input helps improve our AI analysis.'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        // Handle cases where result is successful but feedback already exists
        if (
          result &&
          result.message &&
          result.message.includes('already exists')
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
            description: t(
              'You have already provided feedback for this insight.',
            ),
            status: 'info',
            duration: 3000,
            isClosable: true,
          })
        } else {
          toast({
            title: t('Submission Failed'),
            description:
              result?.message ||
              t('Could not submit your feedback. Please try again.'),
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
        }
      }
    } catch (error) {
      console.error('Quick feedback error:', error)
      trackInteraction('quick_feedback_error', { type, error: error.message })

      // Enhanced error handling
      const errorMessage = error.message || error.toString()

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
          description: t(
            'You have already provided feedback for this insight.',
          ),
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
      } else {
        toast({
          title: t('Error'),
          description: t('An unexpected error occurred. Please try again.'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } finally {
      setFeedbackState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  // Enhanced detailed feedback handler
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
    })

    try {
      const result = await submitInsightFeedbackToServer(
        {
          ...insightData,
          title: safeInsightTitle, // Use the safe title for submission
        },
        feedbackState.type,
        feedbackState.rating,
        {
          comment: feedbackState.comment,
          specificAspects: feedbackState.specificAspects,
          improvementSuggestions: feedbackState.improvementSuggestions,
          userScore: userStats.score || 0,
          trophyChange: userStats.trophyChange || 0,
          teamRole: userStats.teamRole || 'average',
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
        })
        onFeedbackSubmitted?.(feedbackState.type, 'detailed')

        toast({
          title: t('Feedback Submitted!'),
          description: t('Thank you for your detailed input.'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        setTimeout(() => {
          onClose()
          setShowQuickFeedback(false)
        }, 1500)
      } else {
        // Handle cases where result indicates feedback already exists
        if (
          result &&
          result.message &&
          result.message.includes('already exists')
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
            description: t(
              'You have already provided feedback for this insight.',
            ),
            status: 'info',
            duration: 3000,
            isClosable: true,
          })
          onClose()
        } else {
          toast({
            title: t('Submission Failed'),
            description:
              result?.message ||
              t('Could not submit your detailed feedback. Please try again.'),
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
        }
      }
    } catch (error) {
      console.error('Detailed feedback error:', error)
      trackInteraction('detailed_feedback_error', { error: error.message })

      const errorMessage = error.message || error.toString()

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
          description: t(
            'You have already provided feedback for this insight.',
          ),
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
        onClose()
      } else {
        toast({
          title: t('Error'),
          description: t(
            'An unexpected error occurred during detailed submission.',
          ),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } finally {
      setFeedbackState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  // Reset feedback function
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
      },
      improvementSuggestions: '',
      isSubmitting: false,
      submitted: prev.alreadyProvided,
    }))
    trackInteraction('feedback_reset')
  }

  // Show loading spinner while checking initial feedback
  const isLoadingFeedbackStatus =
    isFeedbackLoading(analysisId, safeInsightTitle) ||
    !feedbackState.initialCheckDone

  if (isLoadingFeedbackStatus) {
    return (
      <Box p={3} textAlign="center">
        <VStack spacing={2}>
          <Spinner size="sm" color="purple.400" />
          <Text color="whiteAlpha.600" fontSize="xs">
            {t('Checking feedback status...')}
          </Text>
        </VStack>
      </Box>
    )
  }

  // Show "already provided" state
  if (feedbackState.alreadyProvided && !isOpen) {
    return (
      <MotionBox
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        p={3}
        bg="rgba(34, 197, 94, 0.1)"
        borderRadius="lg"
        border="1px solid"
        borderColor="green.400"
        textAlign="center"
      >
        <VStack spacing={2}>
          <Icon as={CheckCircle} color="green.400" boxSize={5} />
          <Text color="green.300" fontSize="sm" fontWeight="medium">
            {t('Feedback already provided')}
          </Text>
          <Text color="green.200" fontSize="xs">
            {t('Thank you for helping improve our AI!')}
          </Text>
        </VStack>
      </MotionBox>
    )
  }

  if (compact) {
    return (
      <Box>
        {showQuickFeedback &&
          !feedbackState.submitted &&
          !feedbackState.alreadyProvided && (
            <MotionBox
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: autoShow ? 2 : 0 }}
            >
              <Box
                p={3}
                bg="rgba(139, 92, 246, 0.05)"
                borderRadius="lg"
                border="1px solid"
                borderColor="purple.200"
                mt={4}
              >
                <VStack spacing={3}>
                  <HStack justify="space-between" w="100%">
                    <Text
                      fontSize="sm"
                      color="whiteAlpha.900"
                      fontWeight="medium"
                    >
                      {t('Was this insight helpful?')}
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      color="purple.500"
                      onClick={() => setShowQuickFeedback(false)}
                    >
                      <X size={12} />
                    </Button>
                  </HStack>
                  <HStack spacing={2} wrap="wrap" justify="center">
                    <Button
                      size="sm"
                      leftIcon={<ThumbsUp size={14} />}
                      colorScheme="green"
                      variant="outline"
                      onClick={() => handleQuickFeedback('helpful')}
                      isLoading={
                        feedbackState.isSubmitting &&
                        feedbackState.type === 'helpful'
                      }
                      loadingText={t('Sending...')}
                    >
                      {t('Yes')}
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<ThumbsDown size={14} />}
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleQuickFeedback('not_helpful')}
                      isLoading={
                        feedbackState.isSubmitting &&
                        feedbackState.type === 'not_helpful'
                      }
                      loadingText={t('Sending...')}
                    >
                      {t('No')}
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<MessageSquare size={14} />}
                      colorScheme="purple"
                      variant="outline"
                      onClick={onOpen}
                    >
                      {t('Details')}
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </MotionBox>
          )}

        <DetailedFeedbackModal
          isOpen={isOpen}
          onClose={() => {
            onClose()
            if (!feedbackState.alreadyProvided) {
              setFeedbackState(prev => ({
                ...prev,
                type: '',
                submitted: false,
              }))
            }
          }}
          feedbackState={feedbackState}
          setFeedbackState={setFeedbackState}
          handleDetailedFeedback={handleDetailedFeedback}
          resetFeedback={resetFeedback}
          modalSize={modalSize}
          insightData={{ ...insightData, title: safeInsightTitle }}
        />
      </Box>
    )
  }

  // Don't show full widget if feedback already provided
  if (feedbackState.alreadyProvided) {
    return null
  }

  // Full feedback widget (non-compact)
  return (
    <Box
      p={4}
      bg="rgba(255, 255, 255, 0.02)"
      borderRadius="xl"
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
      backdropFilter="blur(10px)"
    >
      <VStack spacing={4} align="stretch">
        <Flex justify="space-between" align="center">
          <HStack>
            <Icon as={BarChart3} color="purple.400" boxSize={5} />
            <Text color="white" fontWeight="semibold" fontSize="md">
              {t('Rate This Insight')}
            </Text>
          </HStack>
          <Badge colorScheme="purple" variant="subtle">
            {t('AI Learning')}
          </Badge>
        </Flex>

        {!feedbackState.submitted ? (
          <VStack spacing={4}>
            <Text color="whiteAlpha.800" fontSize="sm" textAlign="center">
              {t('Your feedback helps us provide better personalized analysis')}
            </Text>

            <HStack spacing={2} wrap="wrap" justify="center">
              {Object.entries(FEEDBACK_TYPES).map(([type, config]) => (
                <Button
                  key={type}
                  size="sm"
                  leftIcon={<Icon as={config.icon} />}
                  colorScheme={config.color}
                  variant={feedbackState.type === type ? 'solid' : 'outline'}
                  onClick={() => setFeedbackState(prev => ({ ...prev, type }))}
                  _hover={{ transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                >
                  {t(config.label)}
                </Button>
              ))}
            </HStack>

            {feedbackState.type && (
              <MotionBox
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                w="100%"
              >
                <VStack spacing={3} mt={3}>
                  <FormControl>
                    <FormLabel color="whiteAlpha.900" fontSize="sm">
                      {t('Overall Rating')}
                    </FormLabel>
                    <HStack>
                      <Text color="whiteAlpha.700" fontSize="xs">
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
                        <SliderTrack bg="whiteAlpha.200">
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb boxSize={4}>
                          <Icon as={Star} color="purple.500" boxSize={3} />
                        </SliderThumb>
                      </Slider>
                      <Text color="whiteAlpha.700" fontSize="xs">
                        5
                      </Text>
                      <Text
                        color="purple.300"
                        fontSize="sm"
                        fontWeight="bold"
                        minW="20px"
                        textAlign="center"
                      >
                        {feedbackState.rating}
                      </Text>
                    </HStack>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="whiteAlpha.900" fontSize="sm">
                      {t('Additional Comments')} ({t('Optional')})
                    </FormLabel>
                    <Textarea
                      value={feedbackState.comment}
                      onChange={e =>
                        setFeedbackState(prev => ({
                          ...prev,
                          comment: e.target.value,
                        }))
                      }
                      placeholder={t(
                        'What could be improved about this insight?',
                      )}
                      size="sm"
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor="whiteAlpha.300"
                      color="white"
                      _placeholder={{ color: 'whiteAlpha.500' }}
                      _focus={{
                        borderColor: 'purple.400',
                        boxShadow: '0 0 0 1px purple.400',
                      }}
                      rows={3}
                    />
                  </FormControl>

                  <HStack spacing={3} w="100%">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={resetFeedback}
                      borderColor="whiteAlpha.400"
                      color="whiteAlpha.700"
                      _hover={{ bg: 'whiteAlpha.100' }}
                    >
                      {t('Clear')}
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="purple"
                      leftIcon={<Send size={14} />}
                      onClick={handleDetailedFeedback}
                      isLoading={feedbackState.isSubmitting}
                      loadingText={t('Sending...')}
                      flex={1}
                      isDisabled={!feedbackState.type}
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
            <VStack spacing={3}>
              <Icon as={Sparkles} color="green.400" boxSize={8} />
              <Text color="green.300" fontSize="lg" fontWeight="bold">
                {t('Feedback Received!')}
              </Text>
              <Text color="whiteAlpha.700" fontSize="sm">
                {t('Thank you for helping improve our AI analysis system.')}
              </Text>
              <Progress
                value={100}
                size="sm"
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

/**
 * Detailed Feedback Modal Component (same as before but using safeInsightTitle)
 */
const DetailedFeedbackModal = ({
  isOpen,
  onClose,
  feedbackState,
  setFeedbackState,
  handleDetailedFeedback,
  resetFeedback,
  modalSize,
  insightData,
}) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={modalSize}
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent
        bg="rgba(26, 32, 44, 0.95)"
        backdropFilter="blur(20px)"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="purple.600"
        boxShadow="0 10px 40px rgba(0,0,0,0.5)"
        color="white"
      >
        <ModalHeader color="whiteAlpha.900">
          <HStack>
            <Icon as={Brain} color="purple.400" boxSize={5} />
            <Text fontWeight="semibold">{t('Detailed Feedback')}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton
          color="whiteAlpha.700"
          _hover={{ bg: 'whiteAlpha.200' }}
        />

        <ModalBody pb={6}>
          {!feedbackState.submitted || !feedbackState.alreadyProvided ? (
            <VStack spacing={5} align="stretch">
              {insightData && (
                <Box
                  p={3}
                  bg="rgba(139, 92, 246, 0.1)"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="purple.500"
                >
                  <Text
                    color="whiteAlpha.900"
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    {t('Insight:')} {insightData.title}
                  </Text>
                  {insightData.description && (
                    <Text
                      color="whiteAlpha.700"
                      fontSize="xs"
                      mt={1}
                      noOfLines={2}
                    >
                      {insightData.description}
                    </Text>
                  )}
                </Box>
              )}

              <FormControl isRequired>
                <FormLabel color="whiteAlpha.900">
                  {t('How would you categorize this feedback?')}
                </FormLabel>
                <RadioGroup
                  value={feedbackState.type}
                  onChange={value =>
                    setFeedbackState(prev => ({ ...prev, type: value }))
                  }
                >
                  <Stack direction="column" spacing={2}>
                    {Object.entries(FEEDBACK_TYPES).map(([type, config]) => (
                      <Radio
                        key={type}
                        value={type}
                        colorScheme={config.color}
                        sx={{
                          '.chakra-radio__control': {
                            borderColor: `${config.color}.500`,
                          },
                        }}
                      >
                        <HStack spacing={2}>
                          <Icon
                            as={config.icon}
                            color={`${config.color}.400`}
                            boxSize={4}
                          />
                          <Text fontSize="sm">{t(config.label)}</Text>
                        </HStack>
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>

              <Divider borderColor="whiteAlpha.200" />

              <VStack spacing={4} align="stretch">
                <Text color="whiteAlpha.900" fontWeight="medium" fontSize="sm">
                  {t('Rate Specific Aspects')}
                </Text>
                {Object.entries(ASPECT_LABELS).map(([aspect, label]) => (
                  <FormControl key={aspect}>
                    <FormLabel color="whiteAlpha.800" fontSize="xs">
                      {t(label)}
                    </FormLabel>
                    <HStack>
                      <Text color="whiteAlpha.600" fontSize="xs">
                        1
                      </Text>
                      <Slider
                        value={feedbackState.specificAspects[aspect]}
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
                        <SliderTrack bg="whiteAlpha.200">
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb boxSize={3} />
                      </Slider>
                      <Text color="whiteAlpha.600" fontSize="xs">
                        5
                      </Text>
                      <Text
                        color="purple.300"
                        fontSize="sm"
                        fontWeight="bold"
                        minW="15px"
                        textAlign="center"
                      >
                        {feedbackState.specificAspects[aspect]}
                      </Text>
                    </HStack>
                  </FormControl>
                ))}
              </VStack>

              <FormControl>
                <FormLabel color="whiteAlpha.900" fontSize="sm">
                  {t('Overall Rating')} (1-5 Stars)
                </FormLabel>
                <HStack justify="center" spacing={1}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Tooltip
                      key={star}
                      label={`${star} ${t('stars')}`}
                      placement="top"
                      bg="purple.600"
                      color="white"
                    >
                      <Box
                        as="button"
                        type="button"
                        onClick={() =>
                          setFeedbackState(prev => ({ ...prev, rating: star }))
                        }
                        _hover={{ transform: 'scale(1.1)' }}
                        transition="all 0.2s"
                        p={1}
                      >
                        <Icon
                          as={Star}
                          boxSize={6}
                          color={
                            star <= feedbackState.rating
                              ? 'yellow.400'
                              : 'whiteAlpha.300'
                          }
                          fill={
                            star <= feedbackState.rating
                              ? 'yellow.400'
                              : 'transparent'
                          }
                        />
                      </Box>
                    </Tooltip>
                  ))}
                </HStack>
                <Text
                  textAlign="center"
                  color="whiteAlpha.700"
                  fontSize="xs"
                  mt={1}
                >
                  {feedbackState.rating} {t('out of 5 stars')}
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel color="whiteAlpha.900" fontSize="sm">
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
                  placeholder={t('Share your thoughts on this insight...')}
                  bg="whiteAlpha.100"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  color="white"
                  _placeholder={{ color: 'whiteAlpha.500' }}
                  _focus={{
                    borderColor: 'purple.400',
                    boxShadow: `0 0 0 1px var(--chakra-colors-purple-400)`,
                  }}
                  rows={3}
                />
                <FormHelperText color="whiteAlpha.600" fontSize="xs">
                  {t(
                    "Your comments help us understand what works and what doesn't.",
                  )}
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel color="whiteAlpha.900" fontSize="sm">
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
                  placeholder={t('How could we make this insight more useful?')}
                  bg="whiteAlpha.100"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  color="white"
                  _placeholder={{ color: 'whiteAlpha.500' }}
                  _focus={{
                    borderColor: 'purple.400',
                    boxShadow: `0 0 0 1px var(--chakra-colors-purple-400)`,
                  }}
                  rows={2}
                />
              </FormControl>
            </VStack>
          ) : (
            <VStack spacing={4} textAlign="center" py={6}>
              <MotionBox
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Icon as={Sparkles} color="green.400" boxSize={12} />
              </MotionBox>
              <Text color="green.300" fontSize="xl" fontWeight="bold">
                {t('Thank You!')}
              </Text>
              <Text color="whiteAlpha.800" fontSize="md">
                {t(
                  'Your detailed feedback has been recorded and will help improve our AI analysis.',
                )}
              </Text>
              <Box
                p={3}
                bg="rgba(34, 197, 94, 0.1)"
                borderRadius="lg"
                border="1px solid"
                borderColor="green.500"
                w="100%"
              >
                <Text color="green.200" fontSize="sm">
                  {t(
                    '✨ Your input contributes to making insights more personalized and accurate for everyone!',
                  )}
                </Text>
              </Box>
            </VStack>
          )}
        </ModalBody>

        {(!feedbackState.submitted || !feedbackState.alreadyProvided) && (
          <ModalFooter borderTop="1px solid" borderColor="whiteAlpha.200">
            <HStack spacing={3} w="100%">
              <Button
                variant="ghost"
                colorScheme="gray"
                onClick={() => {
                  resetFeedback()
                  setFeedbackState(prev => ({ ...prev, type: '' }))
                }}
                size="sm"
                color="whiteAlpha.700"
              >
                {t('Reset')}
              </Button>
              <Button
                variant="ghost"
                colorScheme="purple"
                mr={3}
                onClick={onClose}
                fontWeight="medium"
                size="sm"
              >
                {t('Cancel')}
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleDetailedFeedback}
                isLoading={feedbackState.isSubmitting}
                loadingText={t('Submitting...')}
                leftIcon={<Send size={16} />}
                isDisabled={!feedbackState.type || feedbackState.isSubmitting}
                flex={1}
                size="sm"
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

/**
 * Smart Feedback Trigger - with context integration
 */
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

  // Safe insight title
  const safeInsightTitle = insightData?.title || 'General Analysis View'

  useEffect(() => {
    // Smart trigger conditions with feedback check
    const checkAndShowPrompt = async () => {
      if (!engagementData || hasShownPrompt) return

      // Check if feedback already provided
      const alreadyProvided = await checkFeedbackExists(
        analysisId,
        safeInsightTitle,
      )
      if (alreadyProvided) return

      const shouldShowPrompt =
        engagementData.scrollDepth > 60 &&
        engagementData.readingTime > 15000 &&
        engagementData.interactions &&
        engagementData.interactions.length > 2

      if (shouldShowPrompt) {
        setTimeout(() => {
          setShowPrompt(true)
          setHasShownPrompt(true)
          onFeedbackPrompt?.()
          trackInteraction('smart_feedback_trigger', {
            insightTitle: safeInsightTitle,
          })
        }, 2000)
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
  ])

  if (!showPrompt) return null

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      position="fixed"
      bottom={4}
      right={4}
      zIndex={1000}
      maxW="320px"
    >
      <Box
        bg="rgba(139, 92, 246, 0.95)"
        backdropFilter="blur(20px)"
        borderRadius="xl"
        p={4}
        border="1px solid"
        borderColor="purple.400"
        boxShadow="0 10px 30px rgba(139, 92, 246, 0.4)"
        color="white"
      >
        <VStack spacing={3} align="stretch">
          <HStack>
            <Icon as={Sparkles} color="white" boxSize={5} />
            <Text color="white" fontWeight="bold" fontSize="sm">
              {t('Quick Feedback')}
            </Text>
            <Button
              size="xs"
              variant="ghost"
              color="whiteAlpha.700"
              _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
              onClick={() => setShowPrompt(false)}
              ml="auto"
              aria-label={t('Close feedback prompt')}
            >
              ✕
            </Button>
          </HStack>

          <Text color="whiteAlpha.900" fontSize="sm">
            {t('Was this insight helpful for your battle analysis?')}
          </Text>

          <EnhancedFeedbackWidget
            insightData={{ ...insightData, title: safeInsightTitle }}
            compact={true}
            onFeedbackSubmitted={() => {
              setShowPrompt(false)
            }}
            userStats={engagementData?.userStats || {}}
          />
        </VStack>
      </Box>
    </MotionBox>
  )
}

// ... rest of the exports remain the same as in the original file
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
      setFeedbackData(prev => ({
        ...prev,
        [insightId]: feedback,
      }))
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

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          '/api/quickClash/analysis/feedback-summary',
        )
        const data = await response.json()
        if (data.success) {
          setSummary(data.summary)
        } else {
          console.error('Failed to fetch feedback summary:', data.message)
          setSummary(null)
        }
      } catch (error) {
        console.error('Error fetching feedback summary:', error)
        setSummary(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [userId])

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <Progress
          size="sm"
          isIndeterminate
          colorScheme="purple"
          borderRadius="md"
        />
        <Text color="whiteAlpha.700" fontSize="sm" mt={2}>
          {t('Loading feedback summary...')}
        </Text>
      </Box>
    )
  }

  if (!summary || summary.totalFeedback === 0) {
    return (
      <Box
        p={4}
        bg="rgba(139, 92, 246, 0.1)"
        borderRadius="lg"
        border="1px solid"
        borderColor="purple.500"
        textAlign="center"
        color="white"
      >
        <VStack spacing={2}>
          <Icon as={Heart} color="purple.400" boxSize={6} />
          <Text color="whiteAlpha.900" fontWeight="medium">
            {t('Start Providing Feedback')}
          </Text>
          <Text color="whiteAlpha.700" fontSize="sm">
            {t('Your feedback helps improve AI analysis for everyone!')}
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box
      p={4}
      bg="rgba(139, 92, 246, 0.1)"
      borderRadius="lg"
      border="1px solid"
      borderColor="purple.500"
      color="white"
    >
      <VStack spacing={3} align="stretch">
        <HStack justify="space-between">
          <Text color="whiteAlpha.900" fontWeight="bold">
            {t('Your Feedback Impact')}
          </Text>
          <Badge colorScheme="purple" variant="subtle">
            {t('AI Learning')}
          </Badge>
        </HStack>

        <HStack spacing={4} justify="space-around" wrap="wrap">
          <VStack>
            <Text color="purple.300" fontSize="2xl" fontWeight="bold">
              {summary.totalFeedback || 0}
            </Text>
            <Text color="whiteAlpha.700" fontSize="xs" textAlign="center">
              {t('Total Feedback')}
            </Text>
          </VStack>

          <VStack>
            <Text color="yellow.300" fontSize="2xl" fontWeight="bold">
              {summary.avgRating?.toFixed(1) || 'N/A'}
            </Text>
            <Text color="whiteAlpha.700" fontSize="xs" textAlign="center">
              {t('Avg Rating')}
            </Text>
          </VStack>

          <VStack>
            <Icon as={TrendingUp} color="green.400" boxSize={6} />
            <Text color="whiteAlpha.700" fontSize="xs" textAlign="center">
              {t('Improving AI')}
            </Text>
          </VStack>
        </HStack>

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
}) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionBox
      position="fixed"
      bottom={{ base: 4, md: 6 }}
      right={{ base: 4, md: 6 }}
      zIndex="tooltip"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Tooltip
        label={t('Provide Feedback')}
        placement="left"
        bg="purple.600"
        color="white"
      >
        <Button
          onClick={onOpen}
          bg="rgba(139, 92, 246, 0.9)"
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor="purple.400"
          color="white"
          size="lg"
          borderRadius="full"
          boxShadow="0 8px 25px rgba(139, 92, 246, 0.4)"
          leftIcon={<MessageSquare size={20} />}
          _hover={{
            bg: 'rgba(139, 92, 246, 1)',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 30px rgba(139, 92, 246, 0.6)',
          }}
          _active={{
            bg: 'purple.600',
            transform: 'translateY(0)',
          }}
          transition="all 0.2s ease-in-out"
          aria-label={t('Open feedback form')}
        >
          {t('Feedback')}
          {hasUnseenInsights && (
            <Circle
              size="10px"
              bg="red.500"
              position="absolute"
              top="-3px"
              right="-3px"
              border="2px solid var(--chakra-colors-purple-500)"
            />
          )}
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

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `/api/quickClash/analysis/feedback-analytics?timeframe=${timeframe}&detailed=true`,
        )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (data.success) {
          setAnalytics(data)
        } else {
          throw new Error(data.message || 'Failed to fetch analytics data.')
        }
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

  if (loading) {
    return (
      <Box p={6} textAlign="center" color="white">
        <Progress
          size="lg"
          isIndeterminate
          colorScheme="purple"
          borderRadius="md"
        />
        <Text color="whiteAlpha.700" mt={4}>
          {t('Loading feedback analytics...')}
        </Text>
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        p={6}
        textAlign="center"
        color="white"
        bg="red.900"
        borderRadius="md"
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
  }

  if (!analytics || !analytics.metrics) {
    return (
      <Box
        p={6}
        textAlign="center"
        color="white"
        bg="gray.700"
        borderRadius="md"
      >
        <Icon as={Info} color="blue.300" boxSize={8} />
        <Text color="whiteAlpha.800" mt={2}>
          {t('No analytics data available for the selected timeframe.')}
        </Text>
      </Box>
    )
  }

  return (
    <VStack
      spacing={6}
      align="stretch"
      p={5}
      bg="gray.800"
      borderRadius="xl"
      color="white"
    >
      <HStack justify="space-between" align="center">
        <Text color="white" fontSize="xl" fontWeight="bold">
          {t('Feedback Analytics')}
        </Text>
        <Badge colorScheme="blue" variant="outline">
          {t('Last {{count}} days', {
            count: analytics.timeframeDays || timeframe,
          })}
        </Badge>
      </HStack>

      <HStack spacing={4} wrap="wrap" justify="center">
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
            p={4}
            bg={`rgba(var(--chakra-colors-${metric.color}-rgb), 0.1)`}
            borderRadius="lg"
            border="1px solid"
            borderColor={`${metric.color}.500`}
            minW="150px"
            flex={1}
            textAlign="center"
          >
            <VStack>
              <Text
                color={`${metric.color}.300`}
                fontSize="2xl"
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
      </HStack>

      {analytics.patterns && analytics.patterns.length > 0 && (
        <Box
          p={4}
          bg="rgba(255, 255, 255, 0.02)"
          borderRadius="lg"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <Text color="white" fontWeight="bold" mb={3} fontSize="lg">
            {t('Key Insights & Patterns')}
          </Text>
          <VStack spacing={3} align="stretch">
            {analytics.patterns.slice(0, 3).map((pattern, index) => (
              <Box
                key={index}
                p={3}
                bg="rgba(139, 92, 246, 0.1)"
                borderRadius="md"
                borderLeft="4px solid"
                borderColor="purple.500"
              >
                <Text
                  color="purple.300"
                  fontSize="md"
                  fontWeight="medium"
                  mb={1}
                >
                  {pattern.finding || t('Unnamed Finding')}
                </Text>
                {pattern.recommendation && (
                  <Text color="whiteAlpha.700" fontSize="sm">
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
          bg="whiteAlpha.100"
          borderRadius="md"
        >
          {t('No specific patterns identified in this period.')}
        </Text>
      )}
    </VStack>
  )
}

export default EnhancedFeedbackWidget
