import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import {
  Box,
  VStack,
  Text,
  Button,
  useToast,
  Flex,
  HStack,
  Progress,
  Center,
  Spinner,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Trophy,
  Zap,
  AlertCircle,
} from 'lucide-react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

// Components
import GamifiedOptionButton from './GamifiedOptionButton'
import SubmittedQuizInterface from './SubmittedQuizInterface'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const GamifiedQuiz = ({
  sessionId,
  onComplete,
  setStopTimerOnQuizSubmit,
  quizTimeLeft,
  setQuizTimeLeft,
  setLoadingQuiz,
}) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()

  // State
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [timeSpent, setTimeSpent] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [quizReady, setQuizReady] = useState(false)

  // Refs
  const switchingQuestionRef = useRef(false)
  const startTimeRef = useRef(Date.now())

  // --- Initialization ---

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        setLoadingQuiz(true)

        const response = await axios.get(
          `/api/quickClash/session/${sessionId}/quiz`,
        )
        setQuestions(response.data.questions || [])
        setUserAnswers({})
        setTimeSpent({})

        // Initialize timing for first question
        setTimeSpent({
            0: { startTime: Date.now(), timeSpent: 0 }
        })

        setQuizReady(true)
        // Reset timer in parent
        setQuizTimeLeft(50)
      } catch (error) {
        console.error('Error fetching questions:', error)
        toast({
          title: t('Error'),
          description:
            error.response?.data?.message || t('Failed to fetch quiz questions'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
        setLoadingQuiz(false)
      }
    }

    fetchQuestions()
  }, [sessionId, toast, t, setLoadingQuiz, setQuizTimeLeft])

  // --- Logic ---

  // Timer Logic
  useEffect(() => {
    if (!quizReady || submitted || submitLoading) return

    const timer = setInterval(() => {
      setQuizTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizReady, submitted, submitLoading, setQuizTimeLeft])




  const handleAnswer = useCallback(
    (answer) => {
      if (switchingQuestionRef.current || submitted) return

      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: answer,
      }))
    },
    [currentQuestionIndex, submitted]
  )

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      switchingQuestionRef.current = true

      // Record time
      const now = Date.now()
      setTimeSpent((prev) => {
        const currentStart = prev[currentQuestionIndex]?.startTime || now
        return {
          ...prev,
          [currentQuestionIndex]: {
            startTime: currentStart,
            timeSpent: Math.floor((now - currentStart) / 1000),
          },
          [currentQuestionIndex + 1]: {
            startTime: now,
            timeSpent: 0,
          },
        }
      })

      setCurrentQuestionIndex((prev) => prev + 1)

      setTimeout(() => {
        switchingQuestionRef.current = false
      }, 300) // Match animation duration
    }
  }, [currentQuestionIndex, questions.length])

  const handleSubmit = useCallback(async () => {
    if (submitLoading || submitted) return

    try {
      setSubmitLoading(true)
      setStopTimerOnQuizSubmit(true)

      // Finalize time for current question
      const now = Date.now()
      const finalTimeSpent = { ...timeSpent }
      const currentStart = finalTimeSpent[currentQuestionIndex]?.startTime || now
      finalTimeSpent[currentQuestionIndex] = {
          startTime: currentStart,
          timeSpent: Math.floor((now - currentStart) / 1000)
      }

      const formattedResponses = questions.map((question, index) => ({
        questionId: question._id,
        answer: userAnswers[index] || '',
        timeSpent: finalTimeSpent[index]?.timeSpent || 0,
      }))

      const response = await axios.post(
        `/api/quickClash/session/${sessionId}/quiz/submit`,
        { responses: formattedResponses }
      )

      setResult(response.data)
      setSubmitted(true)

      if (onComplete) {
        onComplete(response.data)
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast({
        title: t('Error'),
        description: error.response?.data?.message || t('Failed to submit quiz'),
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
    onComplete,
    setStopTimerOnQuizSubmit,
  ])

  // Watch for time up
  useEffect(() => {
      if (quizTimeLeft === 0 && !submitted && !submitLoading && quizReady) {
          handleSubmit()
      }
  }, [quizTimeLeft, submitted, submitLoading, quizReady, handleSubmit])

  // --- Render Helpers ---

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  if (loading) {
    return (
      <Center h="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="whiteAlpha.800">{t('Loading Challenge...')}</Text>
        </VStack>
      </Center>
    )
  }

  if (submitted) {
    return (
      <SubmittedQuizInterface
        submitLoad={submitLoading}
        result={result}
        onViewReport={() => onComplete && onComplete(result)}
      />
    )
  }

  return (
    <Box
      w="100%"
      maxW="800px"
      mx="auto"
      position="relative"
      h="100%"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      {/* Header Section (Fixed) */}
      <Box flexShrink={0} px={1}>
        {/* Header Stats */}
        <Flex
          justify="space-between"
          align="center"
          mb={6}
          bg="whiteAlpha.100"
          p={4}
          borderRadius="2xl"
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <HStack spacing={4}>
            <Box
              p={2}
              bg="purple.500"
              borderRadius="lg"
              boxShadow="0 0 15px rgba(128, 90, 213, 0.4)"
            >
              <Trophy size={20} color="white" />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="whiteAlpha.600" fontWeight="bold" textTransform="uppercase">
                {t('Question')}
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="white">
                {currentQuestionIndex + 1} <span style={{ opacity: 0.4 }}>/ {questions.length}</span>
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={4}>
              {/* Timer Display - Visual only, logic is in parent/hooks */}
             <Box
              p={2}
              bg={quizTimeLeft <= 10 ? 'red.500' : 'blue.500'}
              borderRadius="lg"
              transition="background 0.3s"
              animation={quizTimeLeft <= 10 ? 'pulse 1s infinite' : 'none'}
            >
              <Clock size={20} color="white" />
            </Box>
            <VStack align="end" spacing={0}>
               <Text fontSize="xs" color="whiteAlpha.600" fontWeight="bold" textTransform="uppercase">
                {t('Time Left')}
              </Text>
              <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color={quizTimeLeft <= 10 ? 'red.300' : 'white'}
                  fontFamily="monospace"
              >
                00:{quizTimeLeft.toString().padStart(2, '0')}
              </Text>
            </VStack>
          </HStack>
        </Flex>

        {/* Progress Bar */}
        <Box mb={4} position="relative">
          <Box h="4px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
              <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #805AD5 0%, #4299E1 100%)',
                      borderRadius: '4px'
                  }}
              />
          </Box>
        </Box>
      </Box>

      {/* Scrollable Content Area */}
      <Box
        flex="1"
        overflowY="auto"
        px={2}
        pb={4}
        css={{
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-track': { width: '6px' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.2)', borderRadius: '24px' },
        }}
      >
        <AnimatePresence mode="wait">
          <MotionBox
            key={currentQuestionIndex}
            initial={{ x: 50, opacity: 0, rotateY: -10 }}
            animate={{ x: 0, opacity: 1, rotateY: 0 }}
            exit={{ x: -50, opacity: 0, rotateY: 10 }}
            transition={{ duration: 0.4, ease: "backOut" }}
            display="flex"
            flexDirection="column"
          >
            {/* Question Text */}
            <Box mb={6} position="relative">
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                lineHeight="1.4"
                color="white"
                textShadow="0 2px 10px rgba(0,0,0,0.3)"
              >
                {currentQuestion?.question}
              </Text>
            </Box>

            {/* Options */}
            <VStack spacing={3} align="stretch" mb={4}>
              {currentQuestion && Object.entries(currentQuestion.options || {}).map(([key, value]) => (
                <GamifiedOptionButton
                  key={key}
                  optionKey={key}
                  optionText={typeof value === 'object' ? value.text : value}
                  isSelected={userAnswers[currentQuestionIndex] === key}
                  onSelect={handleAnswer}
                  isDisabled={submitted}
                />
              ))}
            </VStack>
          </MotionBox>
        </AnimatePresence>
      </Box>

      {/* Footer Controls (Fixed) */}
      <Flex justify="flex-end" mt={2} pt={4} pb={2} flexShrink={0} borderTop="1px solid" borderColor="whiteAlpha.100">
        {currentQuestionIndex < questions.length - 1 ? (
          <Button
            size="lg"
            height="56px"
            px={8}
            rightIcon={<ArrowRight />}
            colorScheme="purple"
            variant="solid"
            bgGradient="linear(to-r, purple.500, blue.500)"
            _hover={{
                bgGradient: "linear(to-r, purple.400, blue.400)",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
            }}
            _active={{ transform: "translateY(0)" }}
            onClick={handleNext}
            isDisabled={!userAnswers[currentQuestionIndex]}
            borderRadius="xl"
          >
            {t('Next Question')}
          </Button>
        ) : (
          <Button
            size="lg"
            height="56px"
            px={8}
            rightIcon={<CheckCircle />}
            colorScheme="green"
            bgGradient="linear(to-r, green.400, teal.500)"
             _hover={{
                bgGradient: "linear(to-r, green.300, teal.400)",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
            }}
            onClick={handleSubmit}
            isLoading={submitLoading}
            isDisabled={!userAnswers[currentQuestionIndex]}
            borderRadius="xl"
          >
            {t('Submit Quiz')}
          </Button>
        )}
      </Flex>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(229, 62, 62, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
        }
      `}</style>
    </Box>
  )
}

export default GamifiedQuiz
