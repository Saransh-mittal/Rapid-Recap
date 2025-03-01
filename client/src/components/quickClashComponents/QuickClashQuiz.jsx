import React, {
  useState,
  useEffect,
  useCallback,
  lazy,
  Suspense,
  useRef,
} from 'react'
import {
  Box,
  VStack,
  Text,
  Progress,
  Button,
  useToast,
  Badge,
  Spinner,
  Center,
  Flex,
  HStack,
  Icon,
  useColorModeValue,
  Tag,
  TagLabel,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Clock,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import axios from 'axios'
import QuickClashBackground from './QuickClashBackground'

// Lazy loaded components
const QuizInterface = lazy(() => import('../quizComponents/QuizInterface'))
const SubmittedQuizInterface = lazy(() =>
  import('../quizComponents/SubmittedQuizInterface'),
)
const ConfirmationModal = lazy(() =>
  import('../quizComponents/customQuizModal/ConfirmationModal'),
)

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const QuickClashQuiz = ({ sessionId, onComplete, quizDuration = 50 }) => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [timeSpent, setTimeSpent] = useState({})
  const [startTime, setStartTime] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(quizDuration) // Use the specified duration
  const [warningShown, setWarningShown] = useState(false)

  // New ref to track if a question switch is in progress
  const switchingQuestionRef = useRef(false)
  const progressBarRef = useRef(null)

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const response = await axios.get(
          `/api/quickClash/session/${sessionId}/quiz`,
        )
        setQuestions(response.data.questions || [])
        setUserAnswers({})
        setTimeSpent({})
        setStartTime(Date.now())
      } catch (error) {
        console.error('Error fetching questions:', error)
        toast({
          title: t('Error'),
          description:
            error.response?.data?.message ||
            t('Failed to fetch quiz questions'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        navigate('/quickclash')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [sessionId, toast, navigate, t])

  // Initialize empty answers and start timer for first question
  useEffect(() => {
    if (questions.length > 0) {
      const initialAnswers = {}
      questions.forEach((_, index) => {
        initialAnswers[index] = ''
      })
      setUserAnswers(initialAnswers)

      // Initialize first question timing immediately
      setTimeSpent(prev => ({
        ...prev,
        [0]: { startTime: Date.now(), timeSpent: 0 },
      }))
    }
  }, [questions])

  // Submit quiz
  const handleSubmit = useCallback(async () => {
    if (submitLoading || submitted) return // Prevent double submissions

    try {
      setSubmitLoading(true)

      // Calculate final time spent on current question
      const finalTimeSpent = { ...timeSpent }
      const currentQuestionData = finalTimeSpent[currentQuestionIndex]

      if (currentQuestionData && currentQuestionData.startTime) {
        const now = Date.now()
        finalTimeSpent[currentQuestionIndex] = {
          ...currentQuestionData,
          timeSpent: Math.floor((now - currentQuestionData.startTime) / 1000),
        }
      }

      // Format the responses for the API, ensuring we send time spent for each question
      const formattedResponses = questions.map((question, index) => {
        const answer =
          userAnswers[index] !== undefined ? userAnswers[index] : ''
        return {
          questionId: question._id,
          answer: answer,
          timeSpent: finalTimeSpent[index]?.timeSpent || 0,
        }
      })

      const response = await axios.post(
        `/api/quickClash/session/${sessionId}/quiz/submit`,
        {
          responses: formattedResponses,
        },
      )

      setResult(response.data)
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast({
        title: t('Error'),
        description:
          error.response?.data?.message || t('Failed to submit quiz'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setSubmitLoading(false)
    }
  }, [
    questions,
    userAnswers,
    timeSpent,
    sessionId,
    submitLoading,
    submitted,
    toast,
    t,
    currentQuestionIndex,
  ])

  // Timer effect
  useEffect(() => {
    if (!startTime || submitted) return

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = Math.max(0, quizDuration - elapsed)

      setTimeRemaining(remaining)

      // Show warning when time is running low
      if (remaining <= 15 && !warningShown) {
        setWarningShown(true)
        toast({
          title: t('Time is running out!'),
          description: t(
            'Only 15 seconds remaining. Complete your answers quickly!',
          ),
          status: 'warning',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      }

      if (remaining === 0) {
        clearInterval(timer)
        handleSubmit()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime, submitted, quizDuration, handleSubmit, warningShown, toast, t])

  // Navigation between questions - only forward navigation allowed
  const handleNext = useCallback(() => {
    if (
      currentQuestionIndex < questions.length - 1 &&
      !switchingQuestionRef.current
    ) {
      switchingQuestionRef.current = true

      // First, save the time spent on the current question
      setTimeSpent(prev => {
        const now = Date.now()
        const questionData = prev[currentQuestionIndex] || {}
        const startTimeForQuestion = questionData.startTime || now
        const timeSpentMs = now - startTimeForQuestion

        return {
          ...prev,
          [currentQuestionIndex]: {
            startTime: startTimeForQuestion,
            timeSpent: Math.floor(timeSpentMs / 1000), // Convert to seconds
          },
        }
      })

      // Then, set the start time for the next question
      setTimeSpent(prev => ({
        ...prev,
        [currentQuestionIndex + 1]: {
          startTime: Date.now(),
          timeSpent: 0, // Initialize with 0 time spent
        },
      }))

      // Finally, navigate to the next question
      setCurrentQuestionIndex(prev => prev + 1)

      // Reset the switching flag after a short delay
      setTimeout(() => {
        switchingQuestionRef.current = false
      }, 50) // Small delay
    }
  }, [currentQuestionIndex, questions.length])

  // Handle answer selection - REMOVED AUTO-NAVIGATION
  const handleAnswer = useCallback(
    answer => {
      if (switchingQuestionRef.current) return

      // Record current answer without timing changes
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: answer,
      }))
    },
    [currentQuestionIndex],
  )

  // Format time display
  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const confirmSubmit = () => {
    setShowConfirmModal(false)
    handleSubmit()
  }

  // Calculate progress percentage
  const progressPercentage = (timeRemaining / quizDuration) * 100

  // Animation variants for timer and progress bar
  const timerVariants = {
    normal: { scale: 1 },
    urgent: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
  }

  if (loading) {
    return (
      <Center height="60vh">
        <VStack spacing={4}>
          <Spinner
            size="xl"
            thickness="4px"
            color="purple.500"
            emptyColor="whiteAlpha.200"
            speed="0.8s"
          />
          <Text color="whiteAlpha.800">{t('Loading questions...')}</Text>
        </VStack>
      </Center>
    )
  }

  if (submitted) {
    return (
      <Suspense fallback={<Spinner size="xl" color="purple.500" />}>
        <SubmittedQuizInterface
          submitLoad={submitLoading}
          result={result}
          onViewReport={() => {
            // Go back to challenges after viewing results
            onComplete && onComplete(result)
          }}
        />
      </Suspense>
    )
  }

  return (
    <Box maxW="800px" mx="auto" color="white">
      <QuickClashBackground>
        <Box p={6}>
          <Flex justifyContent="space-between" alignItems="center" mb={6}>
            <Button
              leftIcon={<ArrowLeft size={16} />}
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmModal(true)}
              color="whiteAlpha.800"
              _hover={{ bg: 'whiteAlpha.100' }}
            >
              {t('Exit Quiz')}
            </Button>

            <MotionBox
              variants={timerVariants}
              animate={timeRemaining <= 15 ? 'urgent' : 'normal'}
            >
              <Badge
                colorScheme={
                  timeRemaining < 15
                    ? 'red'
                    : timeRemaining < 30
                    ? 'yellow'
                    : 'green'
                }
                p={2}
                borderRadius="md"
                display="flex"
                alignItems="center"
                fontSize="md"
                boxShadow={
                  timeRemaining <= 15
                    ? '0 0 10px rgba(229, 62, 62, 0.5)'
                    : 'none'
                }
                bgGradient={
                  timeRemaining < 15
                    ? 'linear(to-r, red.500, red.600)'
                    : timeRemaining < 30
                    ? 'linear(to-r, yellow.500, yellow.600)'
                    : 'linear(to-r, green.500, green.600)'
                }
              >
                <Clock size={16} style={{ marginRight: '8px' }} />
                {formatTime(timeRemaining)}
              </Badge>
            </MotionBox>
          </Flex>

          <VStack spacing={4} align="stretch">
            {/* Progress bar for time */}
            <Box position="relative" h="6px" mb={2}>
              <Progress
                ref={progressBarRef}
                value={progressPercentage}
                size="sm"
                colorScheme={
                  timeRemaining < 15
                    ? 'red'
                    : timeRemaining < 30
                    ? 'yellow'
                    : 'green'
                }
                borderRadius="full"
                bg="whiteAlpha.200"
                hasStripe={timeRemaining <= 15}
                isAnimated={timeRemaining <= 15}
                transition="all 0.2s"
              />
            </Box>

            {/* Question counter */}
            <HStack mb={1} justify="space-between">
              <Tag size="md" variant="subtle" colorScheme="purple">
                <TagLabel>
                  {t('Question')} {currentQuestionIndex + 1} /{' '}
                  {questions.length}
                </TagLabel>
              </Tag>
              <Tag
                size="sm"
                colorScheme={
                  userAnswers[currentQuestionIndex] ? 'green' : 'gray'
                }
              >
                <TagLabel>
                  {userAnswers[currentQuestionIndex]
                    ? t('Answered')
                    : t('Unanswered')}
                </TagLabel>
              </Tag>
            </HStack>

            <Suspense fallback={<Spinner size="xl" color="purple.500" />}>
              <QuizInterface
                load={loading}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                handleAnswer={handleAnswer}
                userAnswers={userAnswers}
                quizSession={{ questions }}
              />
            </Suspense>

            <MotionFlex
              justify="flex-end"
              mt={6}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={() =>
                  currentQuestionIndex < questions.length - 1
                    ? handleNext()
                    : handleSubmit()
                }
                rightIcon={<ChevronRight />}
                bgGradient="linear(to-r, blue.500, blue.700)"
                _hover={{ bgGradient: 'linear(to-r, blue.600, blue.800)' }}
                isDisabled={!userAnswers[currentQuestionIndex]}
                boxShadow="0 4px 10px rgba(72, 187, 120, 0.3)"
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentQuestionIndex < questions.length - 1
                  ? t('Next')
                  : t('Submit Answers')}
              </Button>
            </MotionFlex>

            {/* Question navigation dots */}
            <MotionFlex
              justify="center"
              wrap="wrap"
              gap={2}
              mt={4}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {questions.map((_, index) => (
                <MotionBox
                  key={index}
                  w="36px"
                  h="36px"
                  borderRadius="md"
                  bg={
                    userAnswers[index]
                      ? currentQuestionIndex === index
                        ? 'purple.500'
                        : 'purple.700'
                      : 'whiteAlpha.200'
                  }
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor={
                    currentQuestionIndex === index ? 'default' : 'not-allowed'
                  }
                  border={
                    currentQuestionIndex === index ? '2px solid white' : 'none'
                  }
                  boxShadow={
                    userAnswers[index]
                      ? '0 2px 6px rgba(138, 43, 226, 0.3)'
                      : 'none'
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    {index + 1}
                  </Text>
                </MotionBox>
              ))}
            </MotionFlex>
          </VStack>
        </Box>
      </QuickClashBackground>

      {showConfirmModal && (
        <Suspense fallback={null}>
          <ConfirmationModal
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={confirmSubmit}
            message={t(
              'Are you sure you want to submit your answers? This action cannot be undone.',
            )}
            title={t('Submit Quiz?')}
            confirmText={t('Submit')}
            cancelText={t('Continue Quiz')}
          />
        </Suspense>
      )}
    </Box>
  )
}

export default QuickClashQuiz
