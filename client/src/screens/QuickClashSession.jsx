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
  Tag,
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
  Sparkles,
  Target,
  LightbulbIcon,
} from 'lucide-react'
import MainArticleContent from '../components/articleComponents/MainArticleContent'
import QuickClashBackground from '../components/quickClashComponents/QuickClashBackground'

const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)
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

  // Countdown animation variants
  const timerVariants = {
    attention: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1,
        repeat: timeLeft <= 30 ? Infinity : 0,
        repeatType: 'reverse',
      },
    },
  }

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      w="100%"
    >
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" wrap="wrap" gap={3} align="center">
          <Badge
            bgGradient="linear(to-r, purple.500, purple.700)"
            color="white"
            p={2}
            borderRadius="md"
            display="flex"
            alignItems="center"
            fontSize="md"
          >
            <Icon as={BookOpen} mr={2} />
            {t('Reading Phase')}
          </Badge>

          <MotionBox
            variants={timerVariants}
            animate={timeLeft <= 30 ? 'attention' : ''}
          >
            <Badge
              colorScheme={
                timeLeft <= 30 ? 'red' : timeLeft <= 60 ? 'yellow' : 'green'
              }
              p={2}
              borderRadius="md"
              display="flex"
              alignItems="center"
              fontSize="md"
              boxShadow={
                timeLeft <= 30 ? '0 0 10px rgba(229, 62, 62, 0.5)' : 'none'
              }
            >
              <Icon as={AlarmClock} mr={2} />
              {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, '0')}
            </Badge>
          </MotionBox>
        </Flex>

        <QuickClashBackground>
          <Box
            ref={contentRef}
            maxH="65vh"
            overflowY="auto"
            p={6}
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
              <Box mb={5}>
                <Heading size="lg" color="white" mb={3}>
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
        </QuickClashBackground>

        <VStack spacing={3} align="center">
          <Progress
            value={scrollPercentage}
            size="sm"
            colorScheme="purple"
            borderRadius="full"
            width="100%"
            bg="whiteAlpha.200"
          />

          <Text
            fontSize="sm"
            color={hasScrolledToBottom ? 'green.300' : 'whiteAlpha.600'}
          >
            {hasScrolledToBottom
              ? t('Article fully read!')
              : `${Math.round(scrollPercentage)}% ${t('read')}`}
          </Text>

          <Button
            as={motion.button}
            colorScheme="green"
            size="lg"
            leftIcon={<CheckCircle2 />}
            onClick={onComplete}
            isDisabled={!hasScrolledToBottom && timeLeft > 5}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            w="100%"
            maxW="400px"
            bgGradient={
              hasScrolledToBottom
                ? 'linear(to-r, green.400, green.600)'
                : 'linear(to-r, gray.500, gray.600)'
            }
            _hover={{
              bgGradient: hasScrolledToBottom
                ? 'linear(to-r, green.500, green.700)'
                : 'linear(to-r, gray.600, gray.700)',
            }}
            boxShadow={
              hasScrolledToBottom
                ? '0 4px 12px rgba(72, 187, 120, 0.3)'
                : 'none'
            }
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
      motionPreset="scale"
    >
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent
        bg="rgba(26, 21, 39, 0.95)"
        borderWidth="1px"
        borderColor="purple.500"
        borderRadius="xl"
        boxShadow="0 4px 20px rgba(138, 43, 226, 0.3)"
      >
        <ModalHeader color="white">
          <HStack>
            <Icon as={Trophy} color="yellow.400" />
            <Text>{t('Challenge Complete!')}</Text>
          </HStack>
        </ModalHeader>

        <ModalBody>
          <VStack spacing={6}>
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
            >
              <Icon as={Trophy} boxSize="80px" color="yellow.400" />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <VStack spacing={2} mt={4}>
                  <Text fontSize="lg" color="whiteAlpha.900">
                    {t('Your Score')}
                  </Text>
                  <Text
                    fontSize="5xl"
                    fontWeight="bold"
                    color="white"
                    bgGradient="linear(to-r, yellow.300, orange.400)"
                    bgClip="text"
                  >
                    {score}
                  </Text>
                </VStack>
              </motion.div>
            </MotionBox>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Alert
                status="info"
                variant="subtle"
                borderRadius="md"
                bg="rgba(66, 153, 225, 0.15)"
                borderLeftWidth="4px"
                borderLeftColor="blue.400"
              >
                <AlertIcon color="blue.400" />
                <Box>
                  <AlertTitle color="blue.200">
                    {t('Score Recorded!')}
                  </AlertTitle>
                  <AlertDescription color="whiteAlpha.900">
                    {t(
                      'Check back later to see the final results once your opponent completes the challenge.',
                    )}
                  </AlertDescription>
                </Box>
              </Alert>
            </motion.div>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            as={motion.button}
            onClick={navigateToList}
            bgGradient="linear(to-r, purple.500, purple.700)"
            _hover={{ bgGradient: 'linear(to-r, purple.600, purple.800)' }}
            rightIcon={<ArrowLeft />}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
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
        <Center h="60vh">
          <VStack spacing={6}>
            <Spinner
              size="xl"
              thickness="4px"
              color="purple.500"
              emptyColor="whiteAlpha.200"
              speed="0.8s"
            />
            <MotionText
              color="whiteAlpha.800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {t('Preparing your challenge...')}
            </MotionText>
          </VStack>
        </Center>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxW="container.lg" py={10}>
        <Center h="60vh">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            maxW="600px"
          >
            <VStack
              spacing={6}
              p={8}
              borderRadius="xl"
              bg="rgba(26, 32, 44, 0.5)"
              borderWidth="1px"
              borderColor="red.500"
            >
              <Icon as={XCircle} boxSize={12} color="red.400" />
              <Heading size="md" color="white">
                {t('Error')}
              </Heading>
              <Text color="whiteAlpha.800" textAlign="center">
                {error}
              </Text>
              <Button
                leftIcon={<ArrowLeft />}
                onClick={navigateToList}
                bgGradient="linear(to-r, purple.500, purple.700)"
                _hover={{ bgGradient: 'linear(to-r, purple.600, purple.800)' }}
              >
                {t('Back to Challenges')}
              </Button>
            </VStack>
          </MotionBox>
        </Center>
      </Container>
    )
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" wrap="wrap" gap={4} align="center">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft size={16} />}
            onClick={navigateToList}
            size="sm"
            color="whiteAlpha.800"
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            {t('Back to Challenges')}
          </Button>

          <HStack spacing={3}>
            <Badge
              colorScheme="purple"
              p={2}
              borderRadius="md"
              bgGradient="linear(to-r, purple.500, purple.700)"
              fontSize="sm"
            >
              {challenge?.category}
            </Badge>

            {phase === 'reading' && timeLeft > 0 && (
              <MotionBox
                animate={{
                  scale: timeLeft <= 30 ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  duration: 1,
                  repeat: timeLeft <= 30 ? Infinity : 0,
                  repeatType: 'reverse',
                }}
              >
                <Badge
                  colorScheme={timeLeft <= 30 ? 'red' : 'yellow'}
                  p={2}
                  borderRadius="md"
                  boxShadow={
                    timeLeft <= 30 ? '0 0 10px rgba(229, 62, 62, 0.5)' : 'none'
                  }
                >
                  <HStack spacing={1}>
                    <Icon as={Clock} />
                    <Text>
                      {Math.floor(timeLeft / 60)}:
                      {String(timeLeft % 60).padStart(2, '0')}
                    </Text>
                  </HStack>
                </Badge>
              </MotionBox>
            )}
          </HStack>
        </Flex>

        {phase === 'reading' && article && (
          <ReadingPhase
            article={article}
            timeLeft={timeLeft}
            onComplete={handleReadingComplete}
          />
        )}

        {phase === 'instruction' && (
          <Suspense
            fallback={
              <Center py={10}>
                <Spinner size="xl" color="purple.500" />
              </Center>
            }
          >
            <QuizInstructions onStart={handleStartQuiz} />
          </Suspense>
        )}

        {phase === 'quiz' && session && (
          <Suspense
            fallback={
              <Center py={10}>
                <Spinner size="xl" color="purple.500" />
              </Center>
            }
          >
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
