// components/gameHub/GameSummaryInterface.jsx - Premium Redesigned Version
import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Divider,
  Grid,
  GridItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Progress,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Flex,
  Circle,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  Brain,
  Zap,
  BookOpen,
  Link2,
  FileText,
  Trophy,
  Gem,
  Sparkles,
} from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

// Game type configurations with enhanced colors
const gameTypeConfigs = {
  normal_quiz: {
    title: 'Knowledge Quest',
    color: '#6366F1',
    gradient: 'linear(135deg, #6366f1 0%, #8b5cf6 100%)',
    lightColor: '#A5B4FC',
    emoji: '🧠',
    icon: Brain,
  },
  true_false: {
    title: 'Truth Detector',
    color: '#8B5CF6',
    gradient: 'linear(135deg, #8b5cf6 0%, #a855f7 100%)',
    lightColor: '#C4B5FD',
    emoji: '⚡',
    icon: Zap,
  },
  word_weaver: {
    title: 'Word Architect',
    color: '#10B981',
    gradient: 'linear(135deg, #10b981 0%, #06b6d4 100%)',
    lightColor: '#6EE7B7',
    emoji: '🔤',
    icon: BookOpen,
  },
  connections: {
    title: 'Mind Mapper',
    color: '#F59E0B',
    gradient: 'linear(135deg, #f59e0b 0%, #ef4444 100%)',
    lightColor: '#FCD34D',
    emoji: '🔗',
    icon: Link2,
  },
}

// Premium Background Component
const PremiumBackground = () => (
  <Box
    position="absolute"
    top={0}
    left={0}
    right={0}
    bottom={0}
    overflow="hidden"
    zIndex={0}
  >
    {/* Animated gradient orbs */}
    <MotionBox
      position="absolute"
      width="400px"
      height="400px"
      borderRadius="50%"
      bg="radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)"
      top="-200px"
      left="-200px"
      animate={{
        x: [0, 50, 0],
        y: [0, 30, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <MotionBox
      position="absolute"
      width="300px"
      height="300px"
      borderRadius="50%"
      bg="radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)"
      bottom="-150px"
      right="-150px"
      animate={{
        x: [0, -30, 0],
        y: [0, -50, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </Box>
)

// Enhanced Question Result Card
const PremiumQuestionCard = ({ question, index, gameType }) => {
  const config = gameTypeConfigs[gameType]
  const isCorrect = question.isCorrect
  const isMobile = useBreakpointValue({ base: true, md: false })

  const renderQuestionContent = () => {
    switch (gameType) {
      case 'normal_quiz':
        return (
          <VStack align="stretch" spacing={3}>
            <Box
              bg="rgba(255, 255, 255, 0.03)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              borderRadius="lg"
              p={3}
            >
              <Text
                fontSize={{ base: 'sm', md: 'md' }}
                fontWeight="500"
                color="gray.100"
                lineHeight="1.5"
              >
                {question.questionText}
              </Text>
            </Box>

            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
              gap={2}
            >
              {Object.entries(question.options).map(([key, value]) => {
                const isUserChoice = key === question.userAnswer
                const isCorrectChoice = key === question.correctAnswer

                return (
                  <MotionBox
                    key={key}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Box
                      p={3}
                      borderRadius="lg"
                      border="2px solid"
                      borderColor={
                        isCorrectChoice
                          ? '#10B981'
                          : isUserChoice && !isCorrect
                          ? '#EF4444'
                          : 'rgba(255, 255, 255, 0.1)'
                      }
                      bg={
                        isCorrectChoice
                          ? 'rgba(16, 185, 129, 0.1)'
                          : isUserChoice && !isCorrect
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'rgba(255, 255, 255, 0.03)'
                      }
                      position="relative"
                      overflow="hidden"
                    >
                      {(isCorrectChoice || (isUserChoice && !isCorrect)) && (
                        <Box
                          position="absolute"
                          top={1}
                          right={1}
                          bg={isCorrectChoice ? '#10B981' : '#EF4444'}
                          borderRadius="full"
                          p={1}
                        >
                          {isCorrectChoice ? (
                            <CheckCircle size={12} color="white" />
                          ) : (
                            <XCircle size={12} color="white" />
                          )}
                        </Box>
                      )}

                      <HStack spacing={2}>
                        <Circle
                          size="24px"
                          bg={
                            isCorrectChoice
                              ? '#10B981'
                              : isUserChoice && !isCorrect
                              ? '#EF4444'
                              : 'rgba(255, 255, 255, 0.1)'
                          }
                          color="white"
                          fontSize="xs"
                          fontWeight="bold"
                        >
                          {key.toUpperCase()}
                        </Circle>
                        <Text
                          fontSize="sm"
                          color="gray.200"
                          flex={1}
                          lineHeight="1.3"
                        >
                          {value}
                        </Text>
                      </HStack>
                    </Box>
                  </MotionBox>
                )
              })}
            </Grid>

            <Box
              bg="rgba(139, 92, 246, 0.05)"
              border="1px solid rgba(139, 92, 246, 0.2)"
              borderRadius="lg"
              p={3}
            >
              <HStack spacing={2} mb={2}>
                <Sparkles size={14} color="#8B5CF6" />
                <Text fontSize="sm" color="purple.300" fontWeight="bold">
                  Explanation
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.300" lineHeight="1.4">
                {question.explanation}
              </Text>
            </Box>
          </VStack>
        )

      case 'true_false':
        return (
          <VStack align="stretch" spacing={3}>
            <Box
              bg="rgba(255, 255, 255, 0.03)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              borderRadius="lg"
              p={3}
            >
              <Text
                fontSize={{ base: 'sm', md: 'md' }}
                fontWeight="500"
                color="gray.100"
                lineHeight="1.5"
              >
                {question.questionText}
              </Text>
            </Box>

            <HStack spacing={3} justify="center">
              {[
                { value: true, label: 'TRUE', color: '#10B981' },
                { value: false, label: 'FALSE', color: '#EF4444' },
              ].map(option => {
                const isCorrectChoice = question.correctAnswer === option.value
                const isUserChoice = question.userAnswer === option.value

                return (
                  <MotionBox
                    key={option.label}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Box
                      p={{ base: 4, md: 5 }}
                      borderRadius="lg"
                      border="2px solid"
                      borderColor={
                        isCorrectChoice
                          ? option.color
                          : isUserChoice && !isCorrect
                          ? '#EF4444'
                          : 'rgba(255, 255, 255, 0.1)'
                      }
                      bg={
                        isCorrectChoice
                          ? `${option.color}15`
                          : isUserChoice && !isCorrect
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'rgba(255, 255, 255, 0.03)'
                      }
                      textAlign="center"
                      minW={{ base: '80px', md: '100px' }}
                      position="relative"
                    >
                      <VStack spacing={2}>
                        <Text
                          fontSize={{ base: 'md', md: 'lg' }}
                          fontWeight="bold"
                          color="white"
                        >
                          {option.label}
                        </Text>
                        {isCorrectChoice && (
                          <CheckCircle size={16} color={option.color} />
                        )}
                        {isUserChoice && !isCorrect && (
                          <XCircle size={16} color="#EF4444" />
                        )}
                      </VStack>
                    </Box>
                  </MotionBox>
                )
              })}
            </HStack>

            <Box
              bg="rgba(139, 92, 246, 0.05)"
              border="1px solid rgba(139, 92, 246, 0.2)"
              borderRadius="lg"
              p={3}
            >
              <HStack spacing={2} mb={2}>
                <Sparkles size={14} color="#8B5CF6" />
                <Text fontSize="sm" color="purple.300" fontWeight="bold">
                  Explanation
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.300" lineHeight="1.4">
                {question.explanation}
              </Text>
            </Box>
          </VStack>
        )

      case 'word_weaver':
        return (
          <VStack align="stretch" spacing={3}>
            <Box>
              <Text fontSize="sm" color="gray.400" mb={2} fontWeight="600">
                Complete the sentence:
              </Text>
              <Box
                bg="rgba(255, 255, 255, 0.03)"
                border="1px solid rgba(255, 255, 255, 0.1)"
                borderRadius="lg"
                p={3}
              >
                <Text
                  fontSize={{ base: 'sm', md: 'md' }}
                  fontWeight="500"
                  color="gray.100"
                  lineHeight="1.5"
                >
                  {question.questionText}
                </Text>
              </Box>
            </Box>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={3}>
              <Box
                p={4}
                bg={
                  isCorrect
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)'
                }
                borderRadius="lg"
                border="2px solid"
                borderColor={isCorrect ? '#10B981' : '#EF4444'}
                position="relative"
              >
                <VStack spacing={2}>
                  <HStack spacing={2}>
                    {isCorrect ? (
                      <CheckCircle size={16} color="#10B981" />
                    ) : (
                      <XCircle size={16} color="#EF4444" />
                    )}
                    <Text fontSize="sm" color="gray.400" fontWeight="600">
                      Your Answer
                    </Text>
                  </HStack>
                  <Text
                    fontSize={{ base: 'lg', md: 'xl' }}
                    fontWeight="bold"
                    color="white"
                    textAlign="center"
                  >
                    {question.userAnswerText || 'No Answer'}
                  </Text>
                </VStack>
              </Box>

              <Box
                p={4}
                bg="rgba(16, 185, 129, 0.1)"
                borderRadius="lg"
                border="2px solid #10B981"
              >
                <VStack spacing={2}>
                  <HStack spacing={2}>
                    <CheckCircle size={16} color="#10B981" />
                    <Text fontSize="sm" color="gray.400" fontWeight="600">
                      Correct Answer
                    </Text>
                  </HStack>
                  <Text
                    fontSize={{ base: 'lg', md: 'xl' }}
                    fontWeight="bold"
                    color="white"
                    textAlign="center"
                  >
                    {question.correctAnswerText}
                  </Text>
                </VStack>
              </Box>
            </Grid>

            <Box
              bg="rgba(139, 92, 246, 0.05)"
              border="1px solid rgba(139, 92, 246, 0.2)"
              borderRadius="lg"
              p={3}
            >
              <HStack spacing={2} mb={2}>
                <Sparkles size={14} color="#8B5CF6" />
                <Text fontSize="sm" color="purple.300" fontWeight="bold">
                  Explanation
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.300" lineHeight="1.4">
                {question.explanation}
              </Text>
            </Box>
          </VStack>
        )

      case 'connections':
        return (
          <VStack align="stretch" spacing={3}>
            <Box
              bg="rgba(255, 255, 255, 0.03)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              borderRadius="lg"
              p={3}
            >
              <Text
                fontSize={{ base: 'sm', md: 'md' }}
                fontWeight="500"
                color="gray.100"
                mb={2}
              >
                Connect related concepts from the given list
              </Text>

              <Box>
                <Text fontSize="sm" color="gray.400" mb={2} fontWeight="600">
                  Available Concepts:
                </Text>
                <Grid
                  templateColumns="repeat(auto-fit, minmax(100px, 1fr))"
                  gap={2}
                >
                  {question.concepts.map((concept, idx) => (
                    <Box
                      key={idx}
                      p={2}
                      bg="rgba(255, 255, 255, 0.05)"
                      borderRadius="md"
                      textAlign="center"
                      border="1px solid rgba(255, 255, 255, 0.1)"
                    >
                      <Text fontSize="xs" color="gray.300" fontWeight="500">
                        {concept}
                      </Text>
                    </Box>
                  ))}
                </Grid>
              </Box>
            </Box>

            <VStack align="stretch" spacing={2}>
              <Text fontSize="sm" color="gray.400" fontWeight="600">
                Your Connections vs Valid Connections:
              </Text>

              {question.userConnections.map((userConn, idx) => (
                <MotionBox
                  key={idx}
                  whileHover={{ scale: 1.005 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box
                    p={3}
                    bg={
                      userConn.isValid
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(239, 68, 68, 0.1)'
                    }
                    borderRadius="lg"
                    border="2px solid"
                    borderColor={userConn.isValid ? '#10B981' : '#EF4444'}
                  >
                    <HStack justify="space-between" align="center">
                      <HStack spacing={2}>
                        {userConn.isValid ? (
                          <CheckCircle size={16} color="#10B981" />
                        ) : (
                          <XCircle size={16} color="#EF4444" />
                        )}
                        <HStack spacing={1} flexWrap="wrap">
                          <Text fontSize="sm" color="white" fontWeight="500">
                            {userConn.from}
                          </Text>
                          <Link2 size={12} color="#8B5CF6" />
                          <Text fontSize="sm" color="white" fontWeight="500">
                            {userConn.to}
                          </Text>
                        </HStack>
                      </HStack>
                      <Badge
                        colorScheme={userConn.isValid ? 'green' : 'red'}
                        variant="solid"
                        borderRadius="full"
                        px={2}
                        py={1}
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {userConn.isValid ? 'VALID' : 'INVALID'}
                      </Badge>
                    </HStack>
                  </Box>
                </MotionBox>
              ))}

              <Divider borderColor="rgba(255, 255, 255, 0.1)" />

              <Box>
                <HStack spacing={2} mb={2}>
                  <Sparkles size={14} color="#8B5CF6" />
                  <Text fontSize="sm" color="purple.300" fontWeight="bold">
                    All Valid Connections
                  </Text>
                </HStack>
                <VStack align="stretch" spacing={2}>
                  {question.validConnections.map((validConn, idx) => (
                    <Box
                      key={idx}
                      p={3}
                      bg="rgba(139, 92, 246, 0.05)"
                      borderRadius="lg"
                      border="1px solid rgba(139, 92, 246, 0.2)"
                    >
                      <VStack align="stretch" spacing={1}>
                        <HStack spacing={2} flexWrap="wrap">
                          <Link2 size={14} color="#8B5CF6" />
                          <HStack spacing={1}>
                            <Text fontSize="sm" fontWeight="600" color="white">
                              {validConn.from}
                            </Text>
                            <Text fontSize="sm" color="purple.300">
                              ↔
                            </Text>
                            <Text fontSize="sm" fontWeight="600" color="white">
                              {validConn.to}
                            </Text>
                          </HStack>
                          <Badge
                            colorScheme="purple"
                            variant="outline"
                            size="sm"
                            borderRadius="full"
                            fontSize="xs"
                          >
                            {validConn.connectionType}
                          </Badge>
                        </HStack>
                        <Text
                          fontSize="xs"
                          color="gray.400"
                          pl={6}
                          lineHeight="1.3"
                        >
                          {validConn.reasoning}
                        </Text>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </VStack>

            <Box
              bg="rgba(139, 92, 246, 0.05)"
              border="1px solid rgba(139, 92, 246, 0.2)"
              borderRadius="lg"
              p={3}
            >
              <HStack spacing={2} mb={2}>
                <Sparkles size={14} color="#8B5CF6" />
                <Text fontSize="sm" color="purple.300" fontWeight="bold">
                  Overall Performance
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.300" lineHeight="1.4">
                {question.explanation}
              </Text>
            </Box>
          </VStack>
        )

      default:
        return <Text>Unsupported question type</Text>
    }
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <AccordionItem
        border="none"
        bg="rgba(255, 255, 255, 0.02)"
        borderRadius="xl"
        mb={3}
        overflow="hidden"
      >
        <AccordionButton
          p={{ base: 4, md: 5 }}
          borderRadius="xl"
          _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}
          _expanded={{
            bg: 'rgba(255, 255, 255, 0.05)',
            borderBottomRadius: 'none',
          }}
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
        >
          <HStack flex={1} justify="space-between" align="center" w="full">
            <HStack spacing={{ base: 3, md: 4 }}>
              <Circle
                size={{ base: '40px', md: '50px' }}
                bg={config.gradient}
                color="white"
                border="2px solid"
                borderColor="rgba(255, 255, 255, 0.2)"
              >
                <config.icon size={isMobile ? 16 : 20} />
              </Circle>

              <VStack align="start" spacing={1}>
                <HStack spacing={2} flexWrap="wrap">
                  <Text
                    fontWeight="bold"
                    color="white"
                    fontSize={{ base: 'sm', md: 'md' }}
                  >
                    Question {question.questionNumber}
                  </Text>
                  <Badge
                    bg={config.color + '20'}
                    color={config.lightColor}
                    px={2}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {config.title}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.400" fontWeight="500">
                  {gameType.replace('_', ' ').toUpperCase()}
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={2}>
              <MotionBox
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Badge
                  colorScheme={isCorrect ? 'green' : 'red'}
                  variant="solid"
                  px={{ base: 2, md: 3 }}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="bold"
                  boxShadow={
                    isCorrect ? '0 0 15px #10B98120' : '0 0 15px #EF444420'
                  }
                >
                  {isCorrect ? (
                    <HStack spacing={1}>
                      <CheckCircle size={12} />
                      <Text>{isMobile ? 'OK' : 'CORRECT'}</Text>
                    </HStack>
                  ) : (
                    <HStack spacing={1}>
                      <XCircle size={12} />
                      <Text>{isMobile ? 'NO' : 'INCORRECT'}</Text>
                    </HStack>
                  )}
                </Badge>
              </MotionBox>
            </HStack>
          </HStack>
          <AccordionIcon color="gray.400" ml={2} />
        </AccordionButton>

        <AccordionPanel
          p={{ base: 4, md: 5 }}
          bg="rgba(0, 0, 0, 0.2)"
          borderTop="1px solid rgba(255, 255, 255, 0.05)"
        >
          {renderQuestionContent()}
        </AccordionPanel>
      </AccordionItem>
    </MotionBox>
  )
}

// Main Premium Game Summary Interface
const GameSummaryInterface = () => {
  const { articleId, sessionId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useTranslation('GameHub')
  const isMobile = useBreakpointValue({ base: true, md: false })

  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const handleBackToResults = () => {
    navigate(-1)
  }

  const handleBackToArticle = () => {
    navigate(-2)
  }

  useEffect(() => {
    fetchGameSummary()
  }, [sessionId])

  const fetchGameSummary = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`/api/gamehub/summary/${sessionId}`)
      setSummary(response.data.summary)
    } catch (err) {
      console.error('Error fetching game summary:', err)
      setError(err.response?.data?.error || 'Failed to load game summary')
      toast({
        title: 'Error',
        description: 'Failed to load game summary',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.900" color="white" position="relative">
        <PremiumBackground />
        <Flex
          align="center"
          justify="center"
          minH="100vh"
          position="relative"
          zIndex={1}
        >
          <VStack spacing={6}>
            <MotionBox
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Circle
                size="80px"
                bg="rgba(99, 102, 241, 0.1)"
                border="2px solid #6366F1"
              >
                <Spinner size="xl" color="#6366F1" thickness="3px" />
              </Circle>
            </MotionBox>
            <VStack spacing={2}>
              <Text fontSize="xl" fontWeight="bold" color="white">
                {t('loading.loadingGameSummary')}
              </Text>
              <Text fontSize="md" color="gray.400">
                {t('loading.analyzingPerformance')}
              </Text>
            </VStack>
          </VStack>
        </Flex>
      </Box>
    )
  }

  // Error state return:
  if (error) {
    return (
      <Box minH="100vh" bg="gray.900" color="white" position="relative">
        <PremiumBackground />
        <Container maxW="4xl" py={8} position="relative" zIndex={1}>
          <VStack spacing={6} align="center" justify="center" minH="60vh">
            <Circle
              size="100px"
              bg="rgba(239, 68, 68, 0.1)"
              border="2px solid #EF4444"
            >
              <XCircle size={40} color="#EF4444" />
            </Circle>
            <VStack spacing={4} textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="white">
                {t('errors.somethingWentWrong')}
              </Text>
              <Alert
                status="error"
                bg="rgba(239, 68, 68, 0.1)"
                borderRadius="xl"
                border="1px solid #EF4444"
              >
                <AlertIcon />
                <AlertDescription color="white">{error}</AlertDescription>
              </Alert>
              <HStack spacing={4}>
                <MotionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchGameSummary}
                  colorScheme="blue"
                  size="lg"
                  borderRadius="full"
                  px={8}
                >
                  {t('errors.tryAgain')}
                </MotionButton>
                <MotionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBackToResults}
                  variant="outline"
                  size="lg"
                  borderRadius="full"
                  px={8}
                  borderColor="gray.400"
                  color="gray.300"
                >
                  {t('errors.goBack')}
                </MotionButton>
              </HStack>
            </VStack>
          </VStack>
        </Container>
      </Box>
    )
  }

  // No summary state return:
  if (!summary) {
    return (
      <Box minH="100vh" bg="gray.900" color="white" position="relative">
        <PremiumBackground />
        <Container maxW="4xl" py={8} position="relative" zIndex={1}>
          <VStack spacing={6} align="center" justify="center" minH="60vh">
            <Circle
              size="100px"
              bg="rgba(156, 163, 175, 0.1)"
              border="2px solid #9CA3AF"
            >
              <FileText size={40} color="#9CA3AF" />
            </Circle>
            <VStack spacing={4}>
              <Text fontSize="xl" fontWeight="bold" color="white">
                {t('errors.noSummaryAvailable')}
              </Text>
              <Text color="gray.400" textAlign="center">
                {t('errors.noSummaryData')}
              </Text>
              <MotionButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToResults}
                colorScheme="blue"
                size="lg"
                borderRadius="full"
                px={8}
              >
                {t('errors.goBack')}
              </MotionButton>
            </VStack>
          </VStack>
        </Container>
      </Box>
    )
  }

  const config = gameTypeConfigs[summary.gameType]

  return (
    <Box minH="100vh" bg="gray.900" color="white" position="relative">
      <PremiumBackground />

      {/* Premium Header */}
      <Box
        bg="rgba(0, 0, 0, 0.8)"
        backdropFilter="blur(20px)"
        borderBottom="1px solid rgba(255, 255, 255, 0.1)"
        position="sticky"
        top={0}
        zIndex={100}
      >
        <Container maxW="4xl">
          <HStack
            justify="space-between"
            align="center"
            py={{ base: 3, md: 4 }}
            px={{ base: 4, md: 0 }}
          >
            <MotionButton
              leftIcon={<ChevronLeft size={16} />}
              onClick={handleBackToResults}
              variant="ghost"
              color="gray.300"
              size={{ base: 'sm', md: 'md' }}
              borderRadius="full"
              px={{ base: 2, md: 4 }}
              fontSize={{ base: 'sm', md: 'md' }}
              whileHover={{ scale: 1.02, x: -2 }}
              whileTap={{ scale: 0.98 }}
              _hover={{
                color: 'white',
                bg: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              {isMobile ? t('navigation.back') : t('navigation.backToResults')}
            </MotionButton>

            <VStack spacing={0}>
              <HStack spacing={2}>
                <Circle
                  size={{ base: '32px', md: '40px' }}
                  bg={config.gradient}
                >
                  <Text fontSize={{ base: 'md', md: 'lg' }}>
                    {config.emoji}
                  </Text>
                </Circle>
                <VStack spacing={0} align="center">
                  <Text
                    fontSize={{ base: 'md', md: 'lg' }}
                    fontWeight="bold"
                    color={config.lightColor}
                  >
                    {t(`gameTypes.${summary.gameType}`)}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </HStack>
        </Container>
      </Box>

      {/* Content */}
      <Container
        maxW="4xl"
        py={{ base: 4, md: 6 }}
        px={{ base: 4, md: 6 }}
        position="relative"
        zIndex={1}
      >
        <VStack spacing={{ base: 4, md: 6 }}>
          {/* Premium Article Header */}
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            w="100%"
          >
            <Box
              bg="rgba(255, 255, 255, 0.03)"
              backdropFilter="blur(20px)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              borderRadius="2xl"
              p={{ base: 4, md: 6 }}
              textAlign="center"
              position="relative"
              overflow="hidden"
            >
              {/* Gradient overlay */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bgGradient={config.gradient}
                opacity={0.05}
                borderRadius="2xl"
              />

              <VStack
                spacing={{ base: 3, md: 4 }}
                position="relative"
                zIndex={1}
              >
                <HStack spacing={2} justify="center">
                  <Trophy size={16} color="#FFD700" />
                  <Text
                    fontSize="xs"
                    color="#FFD700"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    {t('headers.performanceReport')}
                  </Text>
                </HStack>

                <Text
                  fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
                  fontWeight="900"
                  color="white"
                  lineHeight="1.2"
                  maxW="600px"
                >
                  {summary.articleTitle}
                </Text>

                <HStack spacing={3} justify="center" flexWrap="wrap">
                  <Badge
                    bg="rgba(139, 92, 246, 0.2)"
                    color="#C4B5FD"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {summary.articleCategory}
                  </Badge>
                  <Badge
                    bg="rgba(245, 158, 11, 0.2)"
                    color="#FCD34D"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {t(`gameTypes.${summary.gameType}`)}
                  </Badge>
                </HStack>
              </VStack>
            </Box>
          </MotionBox>

          {/* Premium Questions Analysis */}
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            w="100%"
          >
            <VStack spacing={{ base: 4, md: 5 }} align="stretch">
              <HStack spacing={3} justify="center">
                <Circle
                  size={{ base: '40px', md: '50px' }}
                  bg="rgba(139, 92, 246, 0.1)"
                  border="2px solid #8B5CF6"
                >
                  <Gem size={isMobile ? 20 : 24} color="#8B5CF6" />
                </Circle>
                <VStack spacing={0} align="start">
                  <Text
                    fontSize={{ base: 'xl', md: '2xl' }}
                    fontWeight="900"
                    color="white"
                  >
                    {t('headers.questionAnalysis')}
                  </Text>
                  <Text
                    fontSize={{ base: 'sm', md: 'md' }}
                    color="gray.400"
                    fontWeight="500"
                  >
                    {t('descriptions.detailedBreakdown')}
                  </Text>
                </VStack>
              </HStack>

              <Accordion allowMultiple>
                {summary.questions.map((question, index) => (
                  <PremiumQuestionCard
                    key={question.questionId}
                    question={question}
                    index={index}
                    gameType={summary.gameType}
                  />
                ))}
              </Accordion>
            </VStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  )
}

export default GameSummaryInterface
