// components/gameHub/gameInterfaces/TrueFalseInterface.jsx - Optimized Minimalistic Version
import React, { memo, useMemo, useCallback } from 'react'
import { VStack, HStack, Text, Button, Box, Badge } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const getDifficultyStyle = difficulty => {
  if (difficulty < 0.3) return { color: '#10B981', label: 'EASY' }
  if (difficulty < 0.6) return { color: '#F59E0B', label: 'MEDIUM' }
  return { color: '#EF4444', label: 'HARD' }
}

const TrueFalseInterface = memo(
  ({ question, questionIndex, totalQuestions, onAnswer, selectedAnswer }) => {
    const { t } = useTranslation('GameHub')

    const statement = useMemo(
      () => question.text || question.statement || question.question,
      [question],
    )
    const difficultyStyle = useMemo(
      () =>
        question.difficulty ? getDifficultyStyle(question.difficulty) : null,
      [question.difficulty],
    )

    const handleAnswerSelect = useCallback(
      answer => {
        onAnswer(answer)
      },
      [onAnswer],
    )

    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        w="100%"
      >
        <VStack spacing={4} align="center">
          <HStack justify="space-between" w="100%" wrap="wrap">
            <Badge
              bg="rgba(139, 92, 246, 0.1)"
              color="purple.400"
              px={2}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              {t('gameInterface.statement')} {questionIndex + 1}/
              {totalQuestions}
            </Badge>
            {difficultyStyle && (
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
            )}
          </HStack>

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

          <Text
            fontSize="md"
            color="gray.300"
            fontWeight="600"
            textAlign="center"
          >
            {t('gameInterface.isStatementTrue')}
          </Text>

          <HStack spacing={6} justify="center">
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
                  selectedAnswer === false
                    ? '#EF4444'
                    : 'rgba(239, 68, 68, 0.3)'
                }
                borderRadius="xl"
                _hover={{ borderColor: '#DC2626' }}
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
                    <Badge bg="#EF4444" color="white" fontSize="2xs">
                      {t('status.selected')}
                    </Badge>
                  )}
                </VStack>
              </Button>
            </MotionBox>

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
                  selectedAnswer === true
                    ? '#10B981'
                    : 'rgba(16, 185, 129, 0.3)'
                }
                borderRadius="xl"
                _hover={{ borderColor: '#059669' }}
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
                    <Badge bg="#10B981" color="white" fontSize="2xs">
                      {t('status.selected')}
                    </Badge>
                  )}
                </VStack>
              </Button>
            </MotionBox>
          </HStack>

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
  },
)

TrueFalseInterface.displayName = 'TrueFalseInterface'
export default TrueFalseInterface
