// components/gameHub/gameInterfaces/TrueFalseInterface.jsx - Optimized Minimalistic Version
import React from 'react'
import { VStack, HStack, Text, Button, Box, Badge } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const TrueFalseInterface = ({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  selectedAnswer,
}) => {
  const { t } = useTranslation('GameHub')

  // Handle both statement object and direct question object
  const statement = question.text || question.statement || question.question
  const difficulty = question.difficulty

  const handleAnswerSelect = answer => {
    onAnswer(answer)
  }

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

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      w="100%"
    >
      <VStack spacing={4} align="center">
        {/* Compact Header */}
        <HStack justify="space-between" w="100%" wrap="wrap">
          <Badge
            bg="rgba(139, 92, 246, 0.1)"
            color="purple.400"
            px={2}
            py={1}
            borderRadius="full"
            fontSize="xs"
          >
            {t('gameInterface.statement')} {questionIndex + 1}/{totalQuestions}
          </Badge>

          {difficulty && (
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
          )}
        </HStack>

        {/* Statement Display */}
        <Box
          bg="rgba(255, 255, 255, 0.05)"
          border="1px solid rgba(139, 92, 246, 0.3)"
          borderRadius="xl"
          p={4}
          w="100%"
          maxW="600px"
        >
          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            color="white"
            textAlign="center"
            lineHeight="1.6"
            fontWeight="500"
          >
            {statement}
          </Text>
        </Box>

        {/* Question Prompt */}
        <Text
          fontSize="md"
          color="gray.300"
          fontWeight="600"
          textAlign="center"
        >
          {t('gameInterface.isStatementTrue')}
        </Text>

        {/* Answer Buttons */}
        <HStack spacing={6} justify="center">
          {/* FALSE Button */}
          <MotionBox whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => handleAnswerSelect(false)}
              w="120px"
              h="80px"
              bg={
                selectedAnswer === false
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(255, 255, 255, 0.05)'
              }
              border="2px solid"
              borderColor={
                selectedAnswer === false ? '#EF4444' : 'rgba(239, 68, 68, 0.3)'
              }
              borderRadius="xl"
              _hover={{
                borderColor: '#DC2626',
              }}
              transition="all 0.2s"
            >
              <VStack spacing={2}>
                <Box
                  bg="linear-gradient(45deg, #EF4444, #DC2626)"
                  borderRadius="lg"
                  p={2}
                >
                  <XCircle size={20} color="white" />
                </Box>
                <Text fontSize="md" fontWeight="bold" color="white">
                  FALSE
                </Text>
                {selectedAnswer === false && (
                  <Badge
                    bg="rgba(239, 68, 68, 0.9)"
                    color="white"
                    fontSize="2xs"
                  >
                    {t('status.selected')}
                  </Badge>
                )}
              </VStack>
            </Button>
          </MotionBox>

          {/* TRUE Button */}
          <MotionBox whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => handleAnswerSelect(true)}
              w="120px"
              h="80px"
              bg={
                selectedAnswer === true
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'rgba(255, 255, 255, 0.05)'
              }
              border="2px solid"
              borderColor={
                selectedAnswer === true ? '#10B981' : 'rgba(16, 185, 129, 0.3)'
              }
              borderRadius="xl"
              _hover={{
                borderColor: '#059669',
              }}
              transition="all 0.2s"
            >
              <VStack spacing={2}>
                <Box
                  bg="linear-gradient(45deg, #10B981, #059669)"
                  borderRadius="lg"
                  p={2}
                >
                  <CheckCircle size={20} color="white" />
                </Box>
                <Text fontSize="md" fontWeight="bold" color="white">
                  TRUE
                </Text>
                {selectedAnswer === true && (
                  <Badge
                    bg="rgba(16, 185, 129, 0.9)"
                    color="white"
                    fontSize="2xs"
                  >
                    {t('status.selected')}
                  </Badge>
                )}
              </VStack>
            </Button>
          </MotionBox>
        </HStack>

        {/* Selection Status */}
        <Box
          bg="rgba(255, 255, 255, 0.05)"
          border="1px solid rgba(255, 255, 255, 0.1)"
          borderRadius="lg"
          p={3}
          w="100%"
          maxW="400px"
          textAlign="center"
        >
          {selectedAnswer !== undefined && selectedAnswer !== null ? (
            <HStack justify="center" spacing={2}>
              {selectedAnswer ? (
                <CheckCircle size={16} color="#10B981" />
              ) : (
                <XCircle size={16} color="#EF4444" />
              )}
              <Text
                fontWeight="600"
                fontSize="sm"
                color={selectedAnswer ? '#10B981' : '#EF4444'}
              >
                {selectedAnswer ? 'TRUE' : 'FALSE'}{' '}
                {t('gameInterface.optionSelected')}
              </Text>
            </HStack>
          ) : (
            <HStack justify="center" spacing={2}>
              <Target size={16} color="#6B7280" />
              <Text color="gray.400" fontSize="sm">
                {t('gameInterface.makeChoice')}
              </Text>
            </HStack>
          )}
        </Box>
      </VStack>
    </MotionBox>
  )
}

export default TrueFalseInterface
