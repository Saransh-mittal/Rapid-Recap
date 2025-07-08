// components/gameHub/gameInterfaces/NormalQuizInterface.jsx - Fixed text overflow issues
import React, { memo, useMemo, useCallback } from 'react'
import { VStack, HStack, Text, Button, Box, Badge } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const getDifficultyStyle = difficulty => {
  if (difficulty < 0.3) return { color: '#10B981', label: 'EASY' }
  if (difficulty < 0.6) return { color: '#F59E0B', label: 'MEDIUM' }
  return { color: '#EF4444', label: 'HARD' }
}

const NormalQuizInterface = memo(
  ({ question, questionIndex, totalQuestions, onAnswer, selectedAnswer }) => {
    const { t } = useTranslation('GameHub')

    const handleOptionSelect = useCallback(
      optionKey => {
        onAnswer(optionKey)
      },
      [onAnswer],
    )

    const difficultyStyle = useMemo(
      () =>
        question.difficulty ? getDifficultyStyle(question.difficulty) : null,
      [question.difficulty],
    )

    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        w="100%"
      >
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between" wrap="wrap" spacing={2}>
            <Badge
              bg="rgba(59, 130, 246, 0.1)"
              color="blue.400"
              px={2}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              {t('gameInterface.question')} {questionIndex + 1}/{totalQuestions}
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
            border="1px solid rgba(255, 255, 255, 0.1)"
            borderRadius="xl"
            p={4}
          >
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="white"
              lineHeight="1.6"
              fontWeight="500"
              whiteSpace="normal"
              wordBreak="break-word"
            >
              {question.question}
            </Text>
          </Box>

          <VStack spacing={3}>
            <AnimatePresence>
              {Object.entries(question.options || {}).map(
                ([key, value], index) => {
                  const isSelected = selectedAnswer === key
                  return (
                    <MotionBox
                      key={key}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      w="100%"
                      whileHover={{ scale: isSelected ? 1.01 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => handleOptionSelect(key)}
                        size="md"
                        width="100%"
                        minH={{ base: '60px', md: '65px' }}
                        height="auto"
                        justifyContent="flex-start"
                        bg={
                          isSelected
                            ? 'rgba(59, 130, 246, 0.2)'
                            : 'rgba(255, 255, 255, 0.05)'
                        }
                        color="white"
                        border="1px solid"
                        borderColor={
                          isSelected ? '#3B82F6' : 'rgba(255, 255, 255, 0.1)'
                        }
                        borderRadius="lg"
                        py={3}
                        px={3}
                        _hover={{
                          borderColor: isSelected
                            ? '#2563EB'
                            : 'rgba(255, 255, 255, 0.3)',
                          bg: isSelected
                            ? 'rgba(59, 130, 246, 0.3)'
                            : 'rgba(255, 255, 255, 0.08)',
                        }}
                        transition="all 0.2s"
                        whiteSpace="normal"
                        textAlign="left"
                      >
                        <HStack align="flex-start" w="100%" spacing={3}>
                          <Box
                            w={{ base: '28px', md: '32px' }}
                            h={{ base: '28px', md: '32px' }}
                            minW={{ base: '28px', md: '32px' }}
                            borderRadius="lg"
                            bg={
                              isSelected
                                ? '#3B82F6'
                                : 'rgba(255, 255, 255, 0.1)'
                            }
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                            mt={1}
                          >
                            {isSelected ? (
                              <CheckCircle size={16} color="white" />
                            ) : (
                              <Text fontWeight="bold" fontSize="sm">
                                {key.toUpperCase()}
                              </Text>
                            )}
                          </Box>
                          <Box flex={1} minW={0}>
                            <Text
                              fontSize={{ base: 'sm', md: 'md' }}
                              lineHeight="1.5"
                              textAlign="left"
                              fontWeight={isSelected ? '600' : '500'}
                              color={isSelected ? 'white' : 'gray.200'}
                            >
                              {value}
                            </Text>
                          </Box>
                        </HStack>
                      </Button>
                    </MotionBox>
                  )
                },
              )}
            </AnimatePresence>
          </VStack>

          <Box
            bg="rgba(255, 255, 255, 0.05)"
            border="1px solid rgba(255, 255, 255, 0.1)"
            borderRadius="lg"
            p={3}
            textAlign="center"
          >
            {selectedAnswer ? (
              <HStack justify="center" spacing={2}>
                <CheckCircle size={16} color="#10B981" />
                <Text color="emerald.400" fontWeight="600" fontSize="sm">
                  {t('gameInterface.optionSelected', {
                    option: selectedAnswer.toUpperCase(),
                  })}
                </Text>
              </HStack>
            ) : (
              <HStack justify="center" spacing={2}>
                <Target size={16} color="#6B7280" />
                <Text color="gray.400" fontSize="sm">
                  {t('gameInterface.selectAnswer')}
                </Text>
              </HStack>
            )}
          </Box>
        </VStack>
      </MotionBox>
    )
  },
)

NormalQuizInterface.displayName = 'NormalQuizInterface'
export default NormalQuizInterface
