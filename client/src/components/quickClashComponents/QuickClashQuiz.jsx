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
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Clock } from 'lucide-react'
import axios from 'axios'

// Lazy loaded components
const QuizInterface = lazy(() => import('../quizComponents/QuizInterface'))
const SubmittedQuizInterface = lazy(() =>
  import('../quizComponents/SubmittedQuizInterface'),
)
const ConfirmationModal = lazy(() =>
  import('../quizComponents/customQuizModal/ConfirmationModal'),
)

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

  // New ref to track if a question switch is in progress
  const switchingQuestionRef = useRef(false)

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
    navigate,
  ])

  // Timer effect
  useEffect(() => {
    if (!startTime || submitted) return

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = Math.max(0, quizDuration - elapsed) // Use the specified quiz duration

      setTimeRemaining(remaining)

      if (remaining === 0) {
        clearInterval(timer)
        handleSubmit()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime, submitted, quizDuration, handleSubmit])

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

      // *** REMOVED AUTO-NAVIGATION CODE ***
      // Now users must explicitly click the Next button
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

  if (loading) {
    return (
      <Center height="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="white">{t('Loading questions...')}</Text>
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
    <Box p={4} maxW="800px" mx="auto" color="white">
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Button
          leftIcon={<ArrowLeft size={16} />}
          variant="ghost"
          size="sm"
          onClick={() => setShowConfirmModal(true)}
        >
          {t('Exit Quiz')}
        </Button>

        <Badge
          colorScheme={
            timeRemaining < 15 ? 'red' : timeRemaining < 30 ? 'yellow' : 'green'
          }
          p={2}
          borderRadius="md"
          display="flex"
          alignItems="center"
          fontSize="md"
        >
          <Clock size={16} style={{ marginRight: '8px' }} />
          {formatTime(timeRemaining)}
        </Badge>
      </Flex>

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

      <Flex justify="flex-end" mt={8}>
        {currentQuestionIndex < questions.length - 1 ? (
          <Button
            onClick={handleNext}
            colorScheme="blue"
            isDisabled={!userAnswers[currentQuestionIndex]}
          >
            {t('Next')}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            colorScheme="green"
            isDisabled={!userAnswers[currentQuestionIndex]}
          >
            {t('Submit Answers')}
          </Button>
        )}
      </Flex>

      <Flex justify="center" wrap="wrap" gap={2} mt={4}>
        {questions.map((_, index) => (
          <Box
            key={index}
            w="30px"
            h="30px"
            borderRadius="md"
            bg={userAnswers[index] ? 'purple.500' : 'whiteAlpha.200'}
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor={index === currentQuestionIndex ? 'default' : 'not-allowed'}
            border={currentQuestionIndex === index ? '2px solid white' : 'none'}
          >
            <Text fontSize="sm" color="white">
              {index + 1}
            </Text>
          </Box>
        ))}
      </Flex>

      {showConfirmModal && (
        <Suspense fallback={null}>
          <ConfirmationModal
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={confirmSubmit}
            message={t(
              'Are you sure you want to submit your answers? This action cannot be undone.',
            )}
          />
        </Suspense>
      )}
    </Box>
  )
}

export default QuickClashQuiz
