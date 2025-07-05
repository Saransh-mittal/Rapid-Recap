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
  const [selectedUnits, setSelectedUnits] = useState([])
  const [availableUnits, setAvailableUnits] = useState([])
  const [initialized, setInitialized] = useState(false)

  // Refs to prevent unnecessary re-renders and dependency issues
  const lastQuestionIndexRef = useRef(null)
  const isUpdatingAnswerRef = useRef(false)
  const { t } = useTranslation('GameHub')
  const toast = useToast()

  // Extract question data with fallbacks - UPDATED: Add Hindi detection
  const blank = question?.blank || ''
  const difficulty = question?.difficulty || 0.5
  const shuffledUnits =
    question?.shuffledUnits || question?.shuffledLetters || []
  const wordLength = question?.wordLength || 6
  const isHindiWord = question?.isHindiWord || false

  // UPDATED: Detect if this is a Hindi word based on the content
  const detectHindiContent = () => {
    // Check if units contain Hindi characters
    if (shuffledUnits.some(unit => /[\u0900-\u097F]/.test(unit))) {
      return true
    }
    // Check if blank text contains Hindi characters
    if (/[\u0900-\u097F]/.test(blank)) {
      return true
    }
    // Use the backend flag
    return isHindiWord
  }

  const isActuallyHindi = detectHindiContent()

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

  // UPDATED: Fallback generation for both Hindi and English
  const generateFallbackUnits = useCallback((length, isHindi) => {
    if (isHindi) {
      // Hindi fallback units (common Hindi characters and combinations)
      const hindiUnits = [
        'क',
        'ख',
        'ग',
        'घ',
        'च',
        'छ',
        'ज',
        'झ',
        'ट',
        'ठ',
        'ड',
        'ढ',
        'त',
        'थ',
        'द',
        'ध',
        'न',
        'प',
        'फ',
        'ब',
        'भ',
        'म',
        'य',
        'र',
        'ल',
        'व',
        'श',
        'ष',
        'स',
        'ह',
        'का',
        'की',
        'के',
        'को',
        'कु',
        'रा',
        'री',
        'रे',
        'रो',
        'ना',
        'नी',
        'ने',
        'नो',
        'मा',
        'मी',
        'मे',
        'मो',
        'सा',
        'सी',
        'से',
        'सो',
      ]

      const needed = Math.max(6, length + 2)
      const result = []

      for (let i = 0; i < needed && i < hindiUnits.length; i++) {
        result.push(hindiUnits[i])
      }

      return result.sort(() => Math.random() - 0.5)
    } else {
      // English fallback letters
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
    }
  }, [])

  // Initialize question units
  const initializeQuestion = useCallback(() => {
    const baseUnits =
      shuffledUnits.length > 0
        ? [...shuffledUnits]
        : generateFallbackUnits(wordLength, isActuallyHindi)

    setAvailableUnits(baseUnits)
    setSelectedUnits([])
    setInitialized(true)
  }, [
    shuffledUnits,
    wordLength,
    questionIndex,
    generateFallbackUnits,
    isActuallyHindi,
  ])

  // UPDATED: Restore previous answer for both Hindi and English
  const restorePreviousAnswer = useCallback(() => {
    if (!currentSelectedAnswer || typeof currentSelectedAnswer !== 'string') {
      initializeQuestion()
      return
    }

    let answerUnits = []

    if (isActuallyHindi) {
      // For Hindi, we need to properly segment the answer
      // This is a simplified approach - in production, you'd use the Hindi segmentation utility
      answerUnits = currentSelectedAnswer.split('')

      // Try to match the segmentation from shuffledUnits if available
      if (shuffledUnits.length > 0) {
        // Attempt to reconstruct units based on available shuffled units
        const tempAnswer = currentSelectedAnswer
        const tempUnits = []
        let i = 0

        while (i < tempAnswer.length) {
          let foundUnit = false

          // Try to match longer units first (up to 3 characters)
          for (let len = Math.min(3, tempAnswer.length - i); len > 0; len--) {
            const unit = tempAnswer.substr(i, len)
            if (shuffledUnits.includes(unit)) {
              tempUnits.push(unit)
              i += len
              foundUnit = true
              break
            }
          }

          if (!foundUnit) {
            // Fallback to single character
            tempUnits.push(tempAnswer[i])
            i++
          }
        }

        answerUnits = tempUnits
      }
    } else {
      // For English, split into individual letters
      answerUnits = currentSelectedAnswer.toUpperCase().split('')
    }

    const baseUnits =
      shuffledUnits.length > 0
        ? [...shuffledUnits]
        : generateFallbackUnits(wordLength, isActuallyHindi)

    const remainingUnits = [...baseUnits]
    answerUnits.forEach(unit => {
      const index = remainingUnits.indexOf(unit)
      if (index !== -1) {
        remainingUnits.splice(index, 1)
      }
    })

    setSelectedUnits(answerUnits)
    setAvailableUnits(remainingUnits)
    setInitialized(true)
  }, [
    currentSelectedAnswer,
    shuffledUnits,
    wordLength,
    questionIndex,
    initializeQuestion,
    generateFallbackUnits,
    isActuallyHindi,
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

  // Update answer when selected units change
  useEffect(() => {
    if (!initialized || isUpdatingAnswerRef.current) {
      return
    }

    const currentAnswer = selectedUnits.join('')

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
  }, [selectedUnits, initialized, onAnswer, questionIndex])

  // UPDATED: Unit interaction handlers
  const handleUnitClick = useCallback(
    (unit, index) => {
      if (!initialized || selectedUnits.length >= wordLength) {
        if (selectedUnits.length >= wordLength) {
          toast({
            title: isActuallyHindi ? 'शब्द पूरा हो गया' : 'Word Complete',
            description: isActuallyHindi
              ? `इस शब्द में केवल ${wordLength} यूनिट हैं!`
              : `This word only has ${wordLength} units!`,
            status: 'info',
            duration: 2000,
            isClosable: true,
          })
        }
        return
      }

      setSelectedUnits(prev => [...prev, unit])
      setAvailableUnits(prev => prev.filter((_, i) => i !== index))
    },
    [
      initialized,
      selectedUnits.length,
      wordLength,
      questionIndex,
      toast,
      isActuallyHindi,
    ],
  )

  const handleUnitRemove = useCallback(
    removeIndex => {
      if (!initialized) return

      const removedUnit = selectedUnits[removeIndex]
      setSelectedUnits(prev => prev.filter((_, i) => i !== removeIndex))
      setAvailableUnits(prev => [...prev, removedUnit])
    },
    [initialized, selectedUnits, questionIndex],
  )

  const handleClearWord = useCallback(() => {
    if (!initialized || selectedUnits.length === 0) return

    setAvailableUnits(prev => [...prev, ...selectedUnits])
    setSelectedUnits([])
  }, [initialized, selectedUnits, questionIndex])

  const handleShuffleUnits = useCallback(() => {
    if (!initialized) return

    setAvailableUnits(prev => [...prev].sort(() => Math.random() - 0.5))
  }, [initialized, questionIndex])

  const currentAnswer = selectedUnits.join('')

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
          {isActuallyHindi
            ? 'शब्द निर्माता तैयार कर रहे हैं...'
            : t('loading.preparingWordArchitect')}
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
            {isActuallyHindi ? 'शब्द पहेली' : t('gameInterface.wordPuzzle')}{' '}
            {questionIndex + 1}/{totalQuestions}
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
            {selectedUnits.length}/{wordLength}{' '}
            {isActuallyHindi ? 'यूनिट' : t('stats.letters')}
          </Badge>

          {/* Language Indicator */}
          {isActuallyHindi && (
            <Badge
              bg="rgba(245, 158, 11, 0.1)"
              color="yellow.400"
              px={2}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              हिंदी
            </Badge>
          )}
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
              {isActuallyHindi ? 'आपका शब्द:' : t('gameInterface.yourWord')}:
            </Text>
            <Text fontSize="lg" color="emerald.400" fontWeight="bold">
              {currentAnswer ||
                (isActuallyHindi
                  ? 'बना रहे हैं...'
                  : t('gameInterface.building'))}
            </Text>
          </HStack>

          {/* Selected Units Display */}
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
            {selectedUnits.length === 0 ? (
              <Text color="gray.500" fontSize="sm" textAlign="center">
                {isActuallyHindi
                  ? 'यूनिट्स पर क्लिक करके शब्द बनाएं'
                  : t('gameInterface.clickLettersInstruction')}
              </Text>
            ) : (
              <Flex gap={2} flexWrap="wrap" justify="center">
                <AnimatePresence>
                  {selectedUnits.map((unit, index) => (
                    <MotionBox
                      key={`selected-${index}-${unit}-${questionIndex}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        onClick={() => handleUnitRemove(index)}
                        w={isActuallyHindi ? '50px' : '40px'}
                        h={isActuallyHindi ? '50px' : '40px'}
                        borderRadius="lg"
                        bg="linear-gradient(45deg, #10B981, #059669)"
                        color="white"
                        border="1px solid rgba(16, 185, 129, 0.6)"
                        fontSize={isActuallyHindi ? 'xl' : 'lg'}
                        fontWeight="bold"
                        minW={isActuallyHindi ? '50px' : '40px'}
                      >
                        {unit}
                      </Button>
                    </MotionBox>
                  ))}
                </AnimatePresence>
              </Flex>
            )}
          </Box>
        </VStack>

        {/* Available Units */}
        <VStack spacing={3}>
          <HStack justify="space-between" w="100%">
            <Text fontSize="sm" color="gray.300" fontWeight="600">
              {isActuallyHindi ? 'उपलब्ध यूनिट्स:' : 'Available Units:'}
            </Text>
            <Button
              onClick={handleShuffleUnits}
              size="xs"
              variant="ghost"
              leftIcon={<Shuffle size={12} />}
              color="gray.400"
              fontSize="xs"
            >
              {isActuallyHindi ? 'फेरबदल' : t('actions.shuffle')}
            </Button>
          </HStack>

          <Flex gap={2} flexWrap="wrap" justify="center">
            {availableUnits.map((unit, index) => (
              <MotionButton
                key={`available-${index}-${unit}-${questionIndex}`}
                onClick={() => handleUnitClick(unit, index)}
                w={isActuallyHindi ? '50px' : '35px'}
                h={isActuallyHindi ? '50px' : '35px'}
                borderRadius="lg"
                fontWeight="bold"
                fontSize={isActuallyHindi ? 'lg' : 'md'}
                bg="rgba(255, 255, 255, 0.05)"
                color="white"
                border="1px solid rgba(255, 255, 255, 0.2)"
                minW={isActuallyHindi ? '50px' : '35px'}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                _hover={{
                  bg: 'rgba(16, 185, 129, 0.2)',
                  borderColor: 'rgba(16, 185, 129, 0.6)',
                }}
                transition="all 0.2s"
              >
                {unit}
              </MotionButton>
            ))}
          </Flex>

          {/* Action Buttons */}
          <HStack spacing={3} justify="center">
            <Button
              onClick={handleClearWord}
              size="sm"
              variant="outline"
              color={'white'}
              leftIcon={<RotateCcw size={14} />}
              isDisabled={selectedUnits.length === 0}
              borderRadius="full"
              borderColor="rgba(255, 255, 255, 0.2)"
              fontSize="xs"
            >
              {isActuallyHindi ? 'साफ़ करें' : t('actions.clear')}
            </Button>

            {selectedUnits.length === wordLength && (
              <Badge
                bg="rgba(16, 185, 129, 0.9)"
                color="white"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
              >
                ✨ {isActuallyHindi ? 'पूरा!' : t('status.complete')}!
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
          {selectedUnits.length === wordLength ? (
            <HStack justify="center" spacing={2}>
              <Target size={16} color="#10B981" />
              <Text color="emerald.400" fontWeight="600" fontSize="sm">
                {isActuallyHindi
                  ? 'शब्द पूरा हो गया!'
                  : t('gameInterface.wordCompleted')}
              </Text>
            </HStack>
          ) : (
            <VStack spacing={2}>
              <HStack justify="center" spacing={2}>
                <Target size={16} color="#6B7280" />
                <Text color="gray.400" fontSize="sm">
                  {isActuallyHindi
                    ? 'वाक्य पूरा करने के लिए शब्द बनाएं'
                    : t('gameInterface.completeSentenceInstruction')}
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.500">
                {isActuallyHindi
                  ? 'यूनिट्स पर क्लिक करके शब्द बनाएं'
                  : t('gameInterface.clickLettersInstruction')}
              </Text>
            </VStack>
          )}
        </Box>
      </VStack>
    </MotionBox>
  )
}

export default WordWeaverInterface
