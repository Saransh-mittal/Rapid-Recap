import React, { useState, useEffect, useCallback, useRef, memo } from 'react'
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
import { useMemo } from 'react'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const WordWeaverInterface = memo(
  ({ question, questionIndex, totalQuestions, onAnswer, selectedAnswer }) => {
    const [selectedUnits, setSelectedUnits] = useState([])
    const [availableUnits, setAvailableUnits] = useState([])
    const [initialized, setInitialized] = useState(false)
    const lastQuestionIndexRef = useRef(null)
    const isUpdatingAnswerRef = useRef(false)
    const { t } = useTranslation('GameHub')
    const toast = useToast()

    const {
      blank = '',
      difficulty = 0.5,
      shuffledUnits = [],
      wordLength = 6,
      isHindiWord = false,
    } = question || {}

    const isActuallyHindi = useMemo(() => {
      if (shuffledUnits.some(unit => /[\u0900-\u097F]/.test(unit))) return true
      if (/[\u0900-\u097F]/.test(blank)) return true
      return isHindiWord
    }, [shuffledUnits, blank, isHindiWord])

    const currentSelectedAnswer = useMemo(() => {
      if (!selectedAnswer) return ''
      if (typeof selectedAnswer === 'string') return selectedAnswer
      if (typeof selectedAnswer.answer === 'string')
        return selectedAnswer.answer
      if (selectedAnswer.answer?.answer)
        return String(selectedAnswer.answer.answer)
      if (typeof selectedAnswer.userWord === 'string')
        return selectedAnswer.userWord
      return ''
    }, [selectedAnswer])

    const getDifficultyStyle = useCallback(
      difficulty => {
        if (difficulty < 0.3)
          return { color: '#10B981', label: t('difficulty.easy') }
        if (difficulty < 0.6)
          return { color: '#F59E0B', label: t('difficulty.medium') }
        return { color: '#EF4444', label: t('difficulty.hard') }
      },
      [t],
    )

    const generateFallbackUnits = useCallback((length, isHindi) => {
      const chars = isHindi
        ? [
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
          ]
        : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
      const needed = Math.max(isHindi ? 6 : 8, length + 2)
      return Array.from(
        { length: needed },
        (_, i) => chars[i % chars.length],
      ).sort(() => Math.random() - 0.5)
    }, [])

    const initializeQuestion = useCallback(
      (answerToRestore = '') => {
        const baseUnits =
          shuffledUnits.length > 0
            ? [...shuffledUnits]
            : generateFallbackUnits(wordLength, isActuallyHindi)

        if (answerToRestore) {
          let answerUnits = isActuallyHindi
            ? answerToRestore.split('')
            : answerToRestore.toUpperCase().split('')
          const remainingUnits = [...baseUnits]
          answerUnits.forEach(unit => {
            const index = remainingUnits.indexOf(unit)
            if (index !== -1) remainingUnits.splice(index, 1)
          })
          setSelectedUnits(answerUnits)
          setAvailableUnits(remainingUnits)
        } else {
          setSelectedUnits([])
          setAvailableUnits(baseUnits)
        }
        setInitialized(true)
      },
      [shuffledUnits, wordLength, isActuallyHindi, generateFallbackUnits],
    )

    useEffect(() => {
      if (lastQuestionIndexRef.current !== questionIndex) {
        lastQuestionIndexRef.current = questionIndex
        setInitialized(false)
        const timeoutId = setTimeout(
          () => initializeQuestion(currentSelectedAnswer),
          50,
        )
        return () => clearTimeout(timeoutId)
      }
    }, [questionIndex, currentSelectedAnswer, initializeQuestion])

    useEffect(() => {
      if (!initialized || isUpdatingAnswerRef.current) return
      const currentAnswer = selectedUnits.join('')
      const timeoutId = setTimeout(() => {
        isUpdatingAnswerRef.current = true
        onAnswer({ answer: currentAnswer, isCorrect: null })
        setTimeout(() => {
          isUpdatingAnswerRef.current = false
        }, 100)
      }, 150)
      return () => clearTimeout(timeoutId)
    }, [selectedUnits, initialized, onAnswer])

    const handleUnitClick = useCallback(
      (unit, index) => {
        if (!initialized || selectedUnits.length >= wordLength) {
          if (selectedUnits.length >= wordLength) {
            toast({
              title: isActuallyHindi ? 'शब्द पूरा हो गया' : 'Word Complete',
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
      [initialized, selectedUnits.length, wordLength, toast, isActuallyHindi],
    )

    const handleUnitRemove = useCallback(
      removeIndex => {
        if (!initialized) return
        const removedUnit = selectedUnits[removeIndex]
        setSelectedUnits(prev => prev.filter((_, i) => i !== removeIndex))
        setAvailableUnits(prev => [...prev, removedUnit])
      },
      [initialized, selectedUnits],
    )

    const handleClearWord = useCallback(() => {
      if (!initialized || selectedUnits.length === 0) return
      setAvailableUnits(prev => [...prev, ...selectedUnits])
      setSelectedUnits([])
    }, [initialized, selectedUnits])

    const handleShuffleUnits = useCallback(() => {
      if (!initialized) return
      setAvailableUnits(prev => [...prev].sort(() => Math.random() - 0.5))
    }, [initialized])

    const difficultyStyle = getDifficultyStyle(difficulty)

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
          <HStack justify="space-between" wrap="wrap">
            <Badge
              bg="rgba(16, 185, 129, 0.1)"
              color="emerald.400"
              px={2}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              {t('gameInterface.wordPuzzle')} {questionIndex + 1}/
              {totalQuestions}
            </Badge>
            <Badge
              bg={`${difficultyStyle.color}20`}
              color={difficultyStyle.color}
              px={2}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              {difficultyStyle.label}
            </Badge>
            <Badge
              bg="rgba(139, 92, 246, 0.1)"
              color="purple.400"
              px={2}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              {selectedUnits.length}/{wordLength} {t('stats.letters')}
            </Badge>
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

          <VStack spacing={3}>
            <Text fontSize="lg" color="emerald.400" fontWeight="bold">
              {selectedUnits.join('') ||
                (isActuallyHindi ? 'बना रहे हैं...' : 'Building...')}
            </Text>
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
                <Text color="gray.500" fontSize="sm">
                  {t('gameInterface.clickLettersInstruction')}
                </Text>
              ) : (
                <Flex gap={2} flexWrap="wrap" justify="center">
                  <AnimatePresence>
                    {selectedUnits.map((unit, index) => (
                      <MotionBox
                        key={`selected-${index}-${unit}`}
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
                          fontSize={isActuallyHindi ? 'xl' : 'lg'}
                          fontWeight="bold"
                          minW="auto"
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

          <VStack spacing={3}>
            <HStack justify="space-between" w="100%">
              <Text fontSize="sm" color="gray.300" fontWeight="600">
                Available Units:
              </Text>
              <Button
                onClick={handleShuffleUnits}
                size="xs"
                variant="ghost"
                leftIcon={<Shuffle size={12} />}
                color="gray.400"
              >
                {t('actions.shuffle')}
              </Button>
            </HStack>
            <Flex gap={2} flexWrap="wrap" justify="center">
              {availableUnits.map((unit, index) => (
                <MotionButton
                  key={`available-${index}-${unit}`}
                  onClick={() => handleUnitClick(unit, index)}
                  w={isActuallyHindi ? '50px' : '35px'}
                  h={isActuallyHindi ? '50px' : '35px'}
                  borderRadius="lg"
                  fontWeight="bold"
                  fontSize={isActuallyHindi ? 'lg' : 'md'}
                  bg="rgba(255, 255, 255, 0.05)"
                  color="white"
                  border="1px solid rgba(255, 255, 255, 0.2)"
                  minW="auto"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {unit}
                </MotionButton>
              ))}
            </Flex>
            <Button
              onClick={handleClearWord}
              size="sm"
              variant="outline"
              color="white"
              leftIcon={<RotateCcw size={14} />}
              isDisabled={selectedUnits.length === 0}
              borderRadius="full"
              borderColor="rgba(255, 255, 255, 0.2)"
            >
              {t('actions.clear')}
            </Button>
          </VStack>

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
                  {t('gameInterface.wordCompleted')}
                </Text>
              </HStack>
            ) : (
              <HStack justify="center" spacing={2}>
                <Target size={16} color="#6B7280" />
                <Text color="gray.400" fontSize="sm">
                  {t('gameInterface.completeSentenceInstruction')}
                </Text>
              </HStack>
            )}
          </Box>
        </VStack>
      </MotionBox>
    )
  },
)

WordWeaverInterface.displayName = 'WordWeaverInterface'
export default WordWeaverInterface
