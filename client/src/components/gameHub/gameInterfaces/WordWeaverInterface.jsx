// components/gameHub/gameInterfaces/WordWeaverInterface.jsx - Fixed Object Rendering Error
import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Flex,
  Badge,
  useToast,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, RotateCcw, Target, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const WordWeaverInterface = ({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  selectedAnswer,
}) => {
  // Core state
  const [selectedLetters, setSelectedLetters] = useState([])
  const [availableLetters, setAvailableLetters] = useState([])
  const [initialized, setInitialized] = useState(false)

  // Refs to prevent unnecessary re-renders and dependency issues
  const lastQuestionIndexRef = useRef(null)
  const isUpdatingAnswerRef = useRef(false)
  const { t } = useTranslation()
  const toast = useToast()

  // Extract question data with fallbacks
  const context = question?.context || ''
  const blank = question?.blank || ''
  const difficulty = question?.difficulty || 0.5
  const shuffledLetters = question?.shuffledLetters || []
  const wordLength = question?.wordLength || 6

  // FIXED: Safely extract current answer with multiple fallback checks
  const getCurrentSelectedAnswer = () => {
    if (!selectedAnswer) return ''

    // Handle different possible structures
    if (typeof selectedAnswer === 'string') {
      return selectedAnswer
    }

    if (typeof selectedAnswer === 'object') {
      // Handle {answer: string, isCorrect: boolean} structure
      if (selectedAnswer.answer && typeof selectedAnswer.answer === 'string') {
        return selectedAnswer.answer
      }

      // Handle nested structure {answer: {answer: string, isCorrect: boolean}}
      if (
        selectedAnswer.answer &&
        typeof selectedAnswer.answer === 'object' &&
        selectedAnswer.answer.answer
      ) {
        return String(selectedAnswer.answer.answer)
      }

      // Handle userWord field as fallback
      if (
        selectedAnswer.userWord &&
        typeof selectedAnswer.userWord === 'string'
      ) {
        return selectedAnswer.userWord
      }
    }

    return ''
  }

  const currentSelectedAnswer = getCurrentSelectedAnswer()

  // Fallback letter generation
  const generateFallbackLetters = useCallback(length => {
    const letters = [
      'A',
      'E',
      'I',
      'O',
      'U',
      'R',
      'T',
      'N',
      'S',
      'L',
      'C',
      'D',
      'M',
      'P',
      'B',
      'G',
      'H',
      'F',
      'Y',
      'W',
      'K',
      'V',
      'X',
      'Z',
      'Q',
      'J',
    ]

    const needed = Math.max(8, length + 2)
    const result = []

    for (let i = 0; i < needed; i++) {
      result.push(letters[i % letters.length])
    }

    return result.sort(() => Math.random() - 0.5)
  }, [])

  // Initialize question letters
  const initializeQuestion = useCallback(() => {
    const baseLetters =
      shuffledLetters.length > 0
        ? [...shuffledLetters]
        : generateFallbackLetters(wordLength)

    setAvailableLetters(baseLetters)
    setSelectedLetters([])
    setInitialized(true)

    console.log('Question initialized:', {
      questionIndex,
      wordLength,
      baseLettersCount: baseLetters.length,
      shuffledLettersCount: shuffledLetters.length,
    })
  }, [shuffledLetters, wordLength, questionIndex, generateFallbackLetters])

  // Restore previous answer
  const restorePreviousAnswer = useCallback(() => {
    if (!currentSelectedAnswer || typeof currentSelectedAnswer !== 'string') {
      initializeQuestion()
      return
    }

    const answerLetters = currentSelectedAnswer.toUpperCase().split('')
    const baseLetters =
      shuffledLetters.length > 0
        ? [...shuffledLetters]
        : generateFallbackLetters(wordLength)

    // Calculate remaining letters after using answer letters
    const remainingLetters = [...baseLetters]
    answerLetters.forEach(letter => {
      const index = remainingLetters.indexOf(letter)
      if (index !== -1) {
        remainingLetters.splice(index, 1)
      }
    })

    setSelectedLetters(answerLetters)
    setAvailableLetters(remainingLetters)
    setInitialized(true)

    console.log('Answer restored:', {
      questionIndex,
      answer: currentSelectedAnswer,
      answerLetters,
      remainingCount: remainingLetters.length,
    })
  }, [
    currentSelectedAnswer,
    shuffledLetters,
    wordLength,
    questionIndex,
    initializeQuestion,
    generateFallbackLetters,
  ])

  // Handle question changes - main effect
  useEffect(() => {
    const isNewQuestion = lastQuestionIndexRef.current !== questionIndex

    if (isNewQuestion) {
      lastQuestionIndexRef.current = questionIndex
      setInitialized(false)

      // Small delay to ensure clean state transition
      const timeoutId = setTimeout(() => {
        if (currentSelectedAnswer) {
          restorePreviousAnswer()
        } else {
          initializeQuestion()
        }
      }, 50)

      return () => clearTimeout(timeoutId)
    }
  }, [
    questionIndex,
    currentSelectedAnswer,
    restorePreviousAnswer,
    initializeQuestion,
  ])

  // Update answer when selected letters change
  useEffect(() => {
    if (!initialized || isUpdatingAnswerRef.current) {
      return
    }

    const currentAnswer = selectedLetters.join('')

    // Debounce answer updates
    const timeoutId = setTimeout(() => {
      isUpdatingAnswerRef.current = true

      onAnswer({
        answer: currentAnswer,
        isCorrect: null,
      })

      // Reset flag after a short delay
      setTimeout(() => {
        isUpdatingAnswerRef.current = false
      }, 100)

      console.log('Answer updated:', {
        questionIndex,
        answer: currentAnswer,
        letterCount: selectedLetters.length,
      })
    }, 150)

    return () => clearTimeout(timeoutId)
  }, [selectedLetters, initialized, onAnswer, questionIndex])

  // Letter interaction handlers
  const handleLetterClick = useCallback(
    (letter, index) => {
      if (!initialized || selectedLetters.length >= wordLength) {
        if (selectedLetters.length >= wordLength) {
          toast({
            title: 'Word Complete',
            description: `This word only has ${wordLength} letters!`,
            status: 'info',
            duration: 2000,
            isClosable: true,
          })
        }
        return
      }

      setSelectedLetters(prev => [...prev, letter.toUpperCase()])
      setAvailableLetters(prev => prev.filter((_, i) => i !== index))

      console.log('Letter selected:', { letter, questionIndex })
    },
    [initialized, selectedLetters.length, wordLength, questionIndex, toast],
  )

  const handleLetterRemove = useCallback(
    removeIndex => {
      if (!initialized) return

      const removedLetter = selectedLetters[removeIndex]
      setSelectedLetters(prev => prev.filter((_, i) => i !== removeIndex))
      setAvailableLetters(prev => [...prev, removedLetter])

      console.log('Letter removed:', { letter: removedLetter, questionIndex })
    },
    [initialized, selectedLetters, questionIndex],
  )

  const handleClearWord = useCallback(() => {
    if (!initialized || selectedLetters.length === 0) return

    setAvailableLetters(prev => [...prev, ...selectedLetters])
    setSelectedLetters([])

    console.log('Word cleared:', { questionIndex })
  }, [initialized, selectedLetters, questionIndex])

  const handleShuffleLetters = useCallback(() => {
    if (!initialized) return

    setAvailableLetters(prev => [...prev].sort(() => Math.random() - 0.5))

    console.log('Letters shuffled:', { questionIndex })
  }, [initialized, questionIndex])

  // Utility functions
  const getDifficultyColor = difficulty => {
    if (difficulty < 0.3) return 'green'
    if (difficulty < 0.6) return 'yellow'
    return 'red'
  }

  const getDifficultyLabel = difficulty => {
    if (difficulty < 0.3) return 'Easy'
    if (difficulty < 0.6) return 'Medium'
    return 'Hard'
  }

  const currentAnswer = selectedLetters.join('')

  // Don't render until initialized to prevent flashing
  if (!initialized) {
    return (
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        w="100%"
        minH="400px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Sparkles size={32} color="#10B981" />
          <Text color="gray.400">Loading question...</Text>
        </VStack>
      </MotionBox>
    )
  }

  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      w="100%"
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <HStack justify="center" spacing={4} mb={4}>
            <Badge colorScheme="emerald" fontSize="md" px={3} py={1}>
              <HStack spacing={1}>
                <Sparkles size={16} />
                <Text>
                  WORD PUZZLE {questionIndex + 1} OF {totalQuestions}
                </Text>
              </HStack>
            </Badge>
            <Badge
              colorScheme={getDifficultyColor(difficulty)}
              fontSize="sm"
              px={2}
              py={1}
            >
              {getDifficultyLabel(difficulty).toUpperCase()} (
              {Math.round(difficulty * 100)}%)
            </Badge>
            <Badge colorScheme="gray" fontSize="sm" px={2} py={1}>
              LETTERS: {availableLetters.length + selectedLetters.length}
            </Badge>
          </HStack>
        </Box>

        {/* Context */}
        {context && (
          <Box
            bg="gray.800"
            p={4}
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.700"
            maxW="600px"
            mx="auto"
          >
            <Text fontSize="sm" color="gray.400" mb={2}>
              Context:
            </Text>
            <Text fontSize="md" color="gray.300" lineHeight="1.6">
              {context}
            </Text>
          </Box>
        )}

        {/* Question */}
        <VStack spacing={4}>
          <Text
            fontSize="lg"
            color="gray.300"
            fontWeight="medium"
            textAlign="center"
          >
            Fill in the blank:
          </Text>

          <Box
            bg="gray.800"
            p={6}
            borderRadius="xl"
            border="2px solid"
            borderColor="emerald.600"
            maxW="600px"
            mx="auto"
          >
            <Text
              fontSize="xl"
              color="emerald.200"
              fontWeight="bold"
              textAlign="center"
              lineHeight="1.6"
            >
              {blank}
            </Text>
          </Box>

          {/* Word Length Indicator */}
          <HStack spacing={2} align="center">
            <Target size={16} color="#10B981" />
            <Text fontSize="md" color="emerald.400" fontWeight="semibold">
              Word Length: {wordLength} letters
            </Text>
          </HStack>
        </VStack>

        {/* Current Answer Display */}
        <VStack spacing={4}>
          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.400">
              Your Word:
            </Text>
            <Text fontSize="lg" color="emerald.400" fontWeight="bold">
              {currentAnswer || '[EMPTY]'}
            </Text>
            <Text fontSize="sm" color="gray.500">
              ({selectedLetters.length}/{wordLength})
            </Text>
          </HStack>

          {/* Selected Letters Display */}
          <Flex
            minH="80px"
            align="center"
            justify="center"
            flexWrap="wrap"
            gap={2}
            p={6}
            bg="gray.900"
            borderRadius="xl"
            border="2px solid"
            borderColor="emerald.600"
            maxW="500px"
            mx="auto"
          >
            {selectedLetters.length === 0 ? (
              <VStack spacing={2}>
                <Sparkles size={24} color="#6B7280" />
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Select letters to build your word
                </Text>
              </VStack>
            ) : (
              <AnimatePresence>
                {selectedLetters.map((letter, index) => (
                  <MotionBox
                    key={`selected-${index}-${letter}-${questionIndex}`}
                    initial={{ opacity: 0, scale: 0.5, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <Button
                      onClick={() => handleLetterRemove(index)}
                      w="14"
                      h="14"
                      borderRadius="xl"
                      bg="emerald.600"
                      color="white"
                      border="2px solid"
                      borderColor="emerald.400"
                      fontSize="xl"
                      fontWeight="bold"
                      _hover={{
                        bg: 'emerald.700',
                        transform: 'scale(1.1)',
                        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
                      }}
                      _active={{ transform: 'scale(0.95)' }}
                      title="Click to remove this letter"
                    >
                      {letter}
                    </Button>
                  </MotionBox>
                ))}
              </AnimatePresence>
            )}
          </Flex>
        </VStack>

        {/* Available Letters */}
        <VStack spacing={4}>
          <HStack justify="space-between" w="100%" maxW="600px" mx="auto">
            <Text fontSize="md" color="gray.300" fontWeight="semibold">
              Available Letters:
            </Text>
            <Button
              onClick={handleShuffleLetters}
              size="sm"
              variant="ghost"
              leftIcon={<Shuffle size={16} />}
              color="gray.400"
              _hover={{ color: 'white', bg: 'gray.800' }}
            >
              Shuffle
            </Button>
          </HStack>

          <Flex gap={3} flexWrap="wrap" justify="center" maxW="600px" mx="auto">
            {availableLetters.map((letter, index) => (
              <MotionButton
                key={`available-${index}-${letter}-${questionIndex}`}
                onClick={() => handleLetterClick(letter, index)}
                w="12"
                h="12"
                borderRadius="xl"
                fontWeight="bold"
                fontSize="lg"
                bg="gray.700"
                color="white"
                border="2px solid"
                borderColor="gray.600"
                _hover={{
                  bg: 'emerald.600',
                  borderColor: 'emerald.400',
                  transform: 'scale(1.1)',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
                }}
                _active={{ transform: 'scale(0.95)' }}
                transition="all 0.2s"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {letter}
              </MotionButton>
            ))}
          </Flex>

          {/* Action Button */}
          <Box textAlign="center" pt={4}>
            <Button
              onClick={handleClearWord}
              colorScheme="gray"
              leftIcon={<RotateCcw size={16} />}
              isDisabled={selectedLetters.length === 0}
              _hover={{
                transform: selectedLetters.length > 0 ? 'scale(1.05)' : 'none',
              }}
            >
              Clear Word
            </Button>
          </Box>
        </VStack>

        {/* Debug Information - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <Box
            bg="gray.800"
            p={3}
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.600"
            maxW="600px"
            mx="auto"
            fontSize="xs"
            color="gray.400"
          >
            <Text fontWeight="bold" mb={2}>
              Debug Info:
            </Text>
            <Text>Question Index: {String(questionIndex)}</Text>
            <Text>
              Selected Letters: [{selectedLetters.join(', ')}] (
              {selectedLetters.length})
            </Text>
            <Text>
              Available Letters: [{availableLetters.join(', ')}] (
              {availableLetters.length})
            </Text>
            <Text>Word Length: {String(wordLength)}</Text>
            <Text>
              Shuffled Letters: [{shuffledLetters.join(', ')}] (
              {shuffledLetters.length})
            </Text>
            <Text>
              Selected Answer: {String(currentSelectedAnswer || 'none')}
            </Text>
            <Text>Initialized: {initialized ? 'Yes' : 'No'}</Text>
            <Text>Current Answer: {String(currentAnswer || 'empty')}</Text>
            <Text>Selected Answer Type: {typeof selectedAnswer}</Text>
            <Text>
              Selected Answer Keys:{' '}
              {selectedAnswer && typeof selectedAnswer === 'object'
                ? Object.keys(selectedAnswer).join(', ')
                : 'N/A'}
            </Text>
          </Box>
        )}
      </VStack>
    </MotionBox>
  )
}

export default WordWeaverInterface
