// components/gameHub/gameInterfaces/WordWeaverInterface.jsx - UPDATED: Remove context display
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
import { Shuffle, RotateCcw, Target } from 'lucide-react'
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
  const { t } = useTranslation('GameHub')
  const toast = useToast()

  // Extract question data with fallbacks - UPDATED: Remove context
  const blank = question?.blank || ''
  const difficulty = question?.difficulty || 0.5
  const shuffledLetters = question?.shuffledLetters || []
  const wordLength = question?.wordLength || 6

  // Safely extract current answer with multiple fallback checks
  const getCurrentSelectedAnswer = () => {
    if (!selectedAnswer) return ''

    if (typeof selectedAnswer === 'string') {
      return selectedAnswer
    }

    if (typeof selectedAnswer === 'object') {
      if (selectedAnswer.answer && typeof selectedAnswer.answer === 'string') {
        return selectedAnswer.answer
      }

      if (
        selectedAnswer.answer &&
        typeof selectedAnswer.answer === 'object' &&
        selectedAnswer.answer.answer
      ) {
        return String(selectedAnswer.answer.answer)
      }

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

  const getDifficultyColor = difficulty => {
    if (difficulty < 0.3) return '#10B981'
    if (difficulty < 0.6) return '#F59E0B'
    return '#EF4444'
  }

  const getDifficultyLabel = difficulty => {
    if (difficulty < 0.3) return t('difficulty.easy')
    if (difficulty < 0.6) return t('difficulty.medium')
    return t('difficulty.hard')
  }

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

    const timeoutId = setTimeout(() => {
      isUpdatingAnswerRef.current = true

      onAnswer({
        answer: currentAnswer,
        isCorrect: null,
      })

      setTimeout(() => {
        isUpdatingAnswerRef.current = false
      }, 100)
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
    },
    [initialized, selectedLetters.length, wordLength, questionIndex, toast],
  )

  const handleLetterRemove = useCallback(
    removeIndex => {
      if (!initialized) return

      const removedLetter = selectedLetters[removeIndex]
      setSelectedLetters(prev => prev.filter((_, i) => i !== removeIndex))
      setAvailableLetters(prev => [...prev, removedLetter])
    },
    [initialized, selectedLetters, questionIndex],
  )

  const handleClearWord = useCallback(() => {
    if (!initialized || selectedLetters.length === 0) return

    setAvailableLetters(prev => [...prev, ...selectedLetters])
    setSelectedLetters([])
  }, [initialized, selectedLetters, questionIndex])

  const handleShuffleLetters = useCallback(() => {
    if (!initialized) return

    setAvailableLetters(prev => [...prev].sort(() => Math.random() - 0.5))
  }, [initialized, questionIndex])

  const currentAnswer = selectedLetters.join('')

  // Don't render until initialized
  if (!initialized) {
    return (
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        w="100%"
        minH="300px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="gray.400" fontSize="md">
          {t('loading.preparingWordArchitect')}
        </Text>
      </MotionBox>
    )
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      w="100%"
    >
      <VStack spacing={4} align="stretch">
        {/* Compact Header */}
        <HStack justify="space-between" wrap="wrap">
          <Badge
            bg="rgba(16, 185, 129, 0.1)"
            color="emerald.400"
            px={2}
            py={1}
            borderRadius="full"
            fontSize="xs"
          >
            {t('gameInterface.wordPuzzle')} {questionIndex + 1}/{totalQuestions}
          </Badge>

          <Badge
            bg={`${getDifficultyColor(difficulty)}20`}
            color={getDifficultyColor(difficulty)}
            px={2}
            py={1}
            borderRadius="full"
            fontSize="xs"
          >
            {getDifficultyLabel(difficulty)}
          </Badge>

          <Badge
            bg="rgba(139, 92, 246, 0.1)"
            color="purple.400"
            px={2}
            py={1}
            borderRadius="full"
            fontSize="xs"
          >
            {selectedLetters.length}/{wordLength} {t('stats.letters')}
          </Badge>
        </HStack>

        {/* Fill-in-the-blank Question */}
        <Box
          bg="rgba(255, 255, 255, 0.05)"
          border="1px solid rgba(16, 185, 129, 0.3)"
          borderRadius="lg"
          p={4}
        >
          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            color="emerald.200"
            fontWeight="600"
            textAlign="center"
            lineHeight="1.5"
          >
            {blank}
          </Text>
        </Box>

        {/* Current Answer */}
        <VStack spacing={3}>
          <HStack spacing={2} justify="center">
            <Text fontSize="sm" color="gray.400">
              {t('gameInterface.yourWord')}:
            </Text>
            <Text fontSize="lg" color="emerald.400" fontWeight="bold">
              {currentAnswer || t('gameInterface.building')}
            </Text>
          </HStack>

          {/* Selected Letters Display */}
          <Box
            minH="60px"
            w="100%"
            bg="rgba(255, 255, 255, 0.05)"
            border="1px solid rgba(16, 185, 129, 0.3)"
            borderRadius="lg"
            p={3}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {selectedLetters.length === 0 ? (
              <Text color="gray.500" fontSize="sm" textAlign="center">
                {t('gameInterface.clickLettersInstruction')}
              </Text>
            ) : (
              <Flex gap={2} flexWrap="wrap" justify="center">
                <AnimatePresence>
                  {selectedLetters.map((letter, index) => (
                    <MotionBox
                      key={`selected-${index}-${letter}-${questionIndex}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        onClick={() => handleLetterRemove(index)}
                        w="40px"
                        h="40px"
                        borderRadius="lg"
                        bg="linear-gradient(45deg, #10B981, #059669)"
                        color="white"
                        border="1px solid rgba(16, 185, 129, 0.6)"
                        fontSize="lg"
                        fontWeight="bold"
                        minW="40px"
                      >
                        {letter}
                      </Button>
                    </MotionBox>
                  ))}
                </AnimatePresence>
              </Flex>
            )}
          </Box>
        </VStack>

        {/* Available Letters */}
        <VStack spacing={3}>
          <HStack justify="space-between" w="100%">
            <Text fontSize="sm" color="gray.300" fontWeight="600">
              Available Letters:
            </Text>
            <Button
              onClick={handleShuffleLetters}
              size="xs"
              variant="ghost"
              leftIcon={<Shuffle size={12} />}
              color="gray.400"
              fontSize="xs"
            >
              {t('actions.shuffle')}
            </Button>
          </HStack>

          <Flex gap={2} flexWrap="wrap" justify="center">
            {availableLetters.map((letter, index) => (
              <MotionButton
                key={`available-${index}-${letter}-${questionIndex}`}
                onClick={() => handleLetterClick(letter, index)}
                w="35px"
                h="35px"
                borderRadius="lg"
                fontWeight="bold"
                fontSize="md"
                bg="rgba(255, 255, 255, 0.05)"
                color="white"
                border="1px solid rgba(255, 255, 255, 0.2)"
                minW="35px"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                _hover={{
                  bg: 'rgba(16, 185, 129, 0.2)',
                  borderColor: 'rgba(16, 185, 129, 0.6)',
                }}
                transition="all 0.2s"
              >
                {letter}
              </MotionButton>
            ))}
          </Flex>

          {/* Action Buttons */}
          <HStack spacing={3} justify="center">
            <Button
              onClick={handleClearWord}
              size="sm"
              variant="outline"
              leftIcon={<RotateCcw size={14} />}
              isDisabled={selectedLetters.length === 0}
              borderRadius="full"
              borderColor="rgba(255, 255, 255, 0.2)"
              fontSize="xs"
            >
              {t('actions.clear')}
            </Button>

            {selectedLetters.length === wordLength && (
              <Badge
                bg="rgba(16, 185, 129, 0.9)"
                color="white"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
              >
                ✨ {t('status.complete')}!
              </Badge>
            )}
          </HStack>
        </VStack>

        {/* Status Information */}
        <Box
          bg="rgba(255, 255, 255, 0.05)"
          border="1px solid rgba(255, 255, 255, 0.1)"
          borderRadius="lg"
          p={3}
          textAlign="center"
        >
          {selectedLetters.length === wordLength ? (
            <HStack justify="center" spacing={2}>
              <Target size={16} color="#10B981" />
              <Text color="emerald.400" fontWeight="600" fontSize="sm">
                {t('gameInterface.wordCompleted')}
              </Text>
            </HStack>
          ) : (
            <VStack spacing={2}>
              <HStack justify="center" spacing={2}>
                <Target size={16} color="#6B7280" />
                <Text color="gray.400" fontSize="sm">
                  {t('gameInterface.completeSentenceInstruction')}
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.500">
                {t('gameInterface.clickLettersInstruction')}
              </Text>
            </VStack>
          )}
        </Box>
      </VStack>
    </MotionBox>
  )
}

export default WordWeaverInterface
