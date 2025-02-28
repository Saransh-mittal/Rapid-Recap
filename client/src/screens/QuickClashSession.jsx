import React, { useState, useEffect, useRef, lazy, Suspense } from 'react'
import {
  Container,
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Progress,
  Badge,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Divider,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import {
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
  Trophy,
  AlarmClock,
  Library,
  ArrowLeft,
  Brain,
} from 'lucide-react'
import MainArticleContent from '../components/articleComponents/MainArticleContent'

const MotionBox = motion(Box)
const QuickClashQuiz = lazy(() =>
  import('../components/quickClashComponents/QuickClashQuiz'),
)
const QuizInstructions = lazy(() =>
  import('../components/quickClashComponents/QuizInstructions'),
)

// Reading Phase Component
const ReadingPhase = ({ article, timeLeft, onComplete }) => {
  const { t } = useTranslation('QuickClash')
  const contentRef = useRef(null)
  const articleRef = useRef(null)
  const [scrollPercentage, setScrollPercentage] = useState(0)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const padding = useBreakpointValue({ base: 4, md: 8 })
  const maxWidth = useBreakpointValue({ base: '100%', md: '800px' })

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = contentRef.current
      const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100
      setScrollPercentage(Math.min(scrolled, 100))

      // Check if scrolled to bottom (or close to it)
      if (scrollHeight - scrollTop - clientHeight < 50) {
        setHasScrolledToBottom(true)
      }
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll)
      return () => contentElement.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      w="100%"
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" wrap="wrap" gap={2}>
          <Badge
            colorScheme="purple"
            p={2}
            borderRadius="md"
            display="flex"
            alignItems="center"
            fontSize="md"
          >
            <Icon as={BookOpen} mr={2} />
            {t('Reading Phase')}
          </Badge>

          <Badge
            colorScheme={timeLeft <= 30 ? 'red' : 'yellow'}
            p={2}
            borderRadius="md"
            display="flex"
            alignItems="center"
            fontSize="md"
          >
            <Icon as={AlarmClock} mr={2} />
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </Badge>
        </HStack>

        <Box
          ref={contentRef}
          maxH="60vh"
          overflowY="auto"
          p={0}
          borderRadius="lg"
          css={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(138, 43, 226, 0.5)',
              borderRadius: '10px',
            },
          }}
        >
          <Box w="100%" maxW={maxWidth} mx="auto">
            {/* Article Header */}
            <Box mb={3}>
              <Heading size="lg" color="white" mb={2}>
                {article.title}
              </Heading>
              <HStack spacing={4} color="gray.300" fontSize="sm">
                <Text>{t('Challenge Article')}</Text>
                <Text>•</Text>
                <Text>
                  {t('Reading Time')}: 2 {t('minutes')}
                </Text>
              </HStack>
            </Box>

            {/* Article Content */}
            <MainArticleContent
              imgURL={null} // No image in challenge articles
              mainText={article?.content} // Format for MainArticleContent
              articleRef={articleRef}
              articleLoading={false}
              themedContent={''}
              dictionary={article?.dictionary}
              importantSentences={article?.importantSentences}
            />
          </Box>
        </Box>

        <Progress
          value={scrollPercentage}
          size="sm"
          colorScheme="purple"
          mt={2}
          borderRadius="full"
        />

        <Button
          colorScheme="green"
          size="lg"
          leftIcon={<CheckCircle2 />}
          onClick={onComplete}
          isDisabled={!hasScrolledToBottom && timeLeft > 5}
          w="100%"
          maxW="400px"
          mx="auto"
          mt={2}
        >
          {hasScrolledToBottom
            ? t('Complete Reading')
            : t('Scroll to continue')}
        </Button>

        {!hasScrolledToBottom && (
          <Text fontSize="sm" color="whiteAlpha.600" textAlign="center">
            {t('Scroll through the article to enable the continue button')}
          </Text>
        )}
      </VStack>
    </MotionBox>
  )
}

// Results Modal Component
const ResultsModal = ({ isOpen, onClose, score, navigateToList }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        bg="rgba(26, 21, 39, 0.95)"
        borderWidth="1px"
        borderColor="purple.500"
      >
        <ModalHeader color="white">{t('Challenge Complete!')}</ModalHeader>

        <ModalBody>
          <VStack spacing={6}>
            <Icon as={Trophy} boxSize="80px" color="yellow.400" />

            <VStack>
              <Text fontSize="lg" color="white">
                {t('Your Score')}
              </Text>
              <Text fontSize="4xl" fontWeight="bold" color="white">
                {score}
              </Text>
            </VStack>

            <Alert status="info" variant="solid" borderRadius="md">
              <AlertIcon />
              <AlertDescription>
                {t(
                  'Your score has been recorded! Check back later to see the final results once your opponent completes the challenge.',
                )}
              </AlertDescription>
            </Alert>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="purple" onClick={navigateToList}>
            {t('Return to Challenges')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// Main QuickClashSession Component
const QuickClashSession = () => {
  const { t } = useTranslation('QuickClash')
  const { challengeId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [session, setSession] = useState(null)
  const [phase, setPhase] = useState('loading') // loading, reading, instruction, quiz, completed
  const [challenge, setChallenge] = useState(null)
  const [article, setArticle] = useState(null)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes for reading
  const [language, setLanguage] = useState('en')
  const {
    isOpen: isResultsOpen,
    onOpen: openResults,
    onClose: closeResults,
  } = useDisclosure()
  const [score, setScore] = useState(0)
  const quizStartTimeRef = useRef(null) // Ref to store the time when quiz phase starts

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true)
        // First get the challenge details
        const challengeResponse = await axios.get(
          `/api/quickClash/challenge/${challengeId}`,
        )
        setChallenge(challengeResponse.data.challenge)

        // Start the session
        const sessionResponse = await axios.post(
          `/api/quickClash/session/${challengeId}`,
          {
            language,
          },
        )

        setSession(sessionResponse.data.session)

        // Initialize article data
        setArticle(
          language === 'en'
            ? {
                title: challengeResponse.data.challenge.article.title.english,
                content:
                  challengeResponse.data.challenge.article.content.english,
                importantSentences:
                  challengeResponse.data.challenge.article
                    .englishImportantSentences,
                dictionary:
                  challengeResponse.data.challenge.article.englishDictionary,
              }
            : {
                title: challengeResponse.data.challenge.article.title.hindi,
                content: challengeResponse.data.challenge.article.content.hindi,
                importantSentences:
                  challengeResponse.data.challenge.article
                    .hindiImportantSentences,
                dictionary:
                  challengeResponse.data.challenge.article.hindiDictionary,
              },
        )

        // Start the reading phase
        await axios.post(
          `/api/quickClash/session/${sessionResponse.data.session._id}/reading/start`,
        )

        setPhase('reading')
        setError(null)
      } catch (err) {
        console.error('Error initializing session:', err)
        setError(
          err.response?.data?.message ||
            'Failed to initialize challenge session',
        )
      } finally {
        setLoading(false)
      }
    }

    initSession()
  }, [challengeId, language])

  // Reading timer
  useEffect(() => {
    if (phase !== 'reading' || !session) return

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer)
          handleReadingComplete()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [phase, session])

  // Handle reading phase completion
  const handleReadingComplete = async () => {
    try {
      await axios.post(
        `/api/quickClash/session/${session._id}/reading/complete`,
      )
      // Change phase to instruction instead of automatically proceeding to quiz
      setPhase('instruction')

      // We do NOT auto-start the quiz phase here anymore
      // No more setTimeout to automatically transition to quiz
    } catch (error) {
      console.error('Error completing reading phase:', error)
      toast({
        title: t('Error'),
        description:
          error.response?.data?.message ||
          t('Failed to complete reading phase'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Start the quiz phase after instructions
  const handleStartQuiz = () => {
    // Set current time as quiz start time
    quizStartTimeRef.current = Date.now()
    setPhase('quiz')
  }

  // Handle quiz completion
  const handleQuizComplete = result => {
    setScore(result.score.total)
    setPhase('completed')
    openResults()
  }

  // Navigate back to challenges list
  const navigateToList = () => {
    navigate('/quickclash')
  }

  if (loading) {
    return (
      <Container maxW="container.lg" py={10}>
        <Center h="50vh">
          <VStack spacing={6}>
            <Spinner size="xl" thickness="4px" color="purple.500" />
            <Text color="whiteAlpha.700">
              {t('Preparing your challenge...')}
            </Text>
          </VStack>
        </Center>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxW="container.lg" py={10}>
        <Center h="50vh">
          <VStack spacing={6} maxW="600px">
            <Alert status="error" variant="solid" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>{t('Error')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
            <Button onClick={navigateToList} leftIcon={<ArrowLeft />}>
              {t('Back to Challenges')}
            </Button>
          </VStack>
        </Center>
      </Container>
    )
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between" wrap="wrap" gap={4}>
          <Button
            variant="outline"
            leftIcon={<ArrowLeft />}
            onClick={navigateToList}
            size="sm"
          >
            {t('Back to Challenges')}
          </Button>

          <HStack>
            <Badge colorScheme="purple" p={2} borderRadius="md">
              {t('Category')}: {challenge?.category}
            </Badge>

            {phase === 'reading' && (
              <Badge colorScheme="yellow" p={2} borderRadius="md">
                {t('Reading Time')}: {Math.floor(timeLeft / 60)}:
                {String(timeLeft % 60).padStart(2, '0')}
              </Badge>
            )}
          </HStack>
        </HStack>

        {phase === 'reading' && article && (
          <ReadingPhase
            article={article}
            timeLeft={timeLeft}
            onComplete={handleReadingComplete}
          />
        )}

        {phase === 'instruction' && (
          <Suspense fallback={<Spinner size="xl" color="purple.500" />}>
            <QuizInstructions onStart={handleStartQuiz} />
          </Suspense>
        )}

        {phase === 'quiz' && session && (
          <Suspense fallback={<Spinner size="xl" color="purple.500" />}>
            <QuickClashQuiz
              sessionId={session._id}
              onComplete={handleQuizComplete}
              quizDuration={50} // Set quiz duration to 50 seconds
            />
          </Suspense>
        )}

        <ResultsModal
          isOpen={isResultsOpen}
          onClose={closeResults}
          score={score}
          navigateToList={navigateToList}
        />
      </VStack>
    </Container>
  )
}

export default QuickClashSession
