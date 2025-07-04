// components/gameHub/gameInterfaces/NormalQuizInterface.jsx - Fixed text overflow issues
import React from 'react'
import { VStack, HStack, Text, Button, Box, Badge } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const NormalQuizInterface = ({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  selectedAnswer,
}) => {
  const { t } = useTranslation('GameHub')

  const handleOptionSelect = optionKey => {
    onAnswer(optionKey)
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
      <VStack spacing={4} align="stretch">
        {/* Compact Header */}
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

          {question.difficulty && (
            <Badge
              bg={`${getDifficultyColor(question.difficulty)}20`}
              color={getDifficultyColor(question.difficulty)}
              px={2}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              {getDifficultyLabel(question.difficulty)}
            </Badge>
          )}
        </HStack>

        {/* Question Display */}
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

        {/* Answer Options - FIXED: Better text handling */}
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
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                    }}
                    w="100%"
                    whileHover={{ scale: isSelected ? 1.01 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => handleOptionSelect(key)}
                      size="md"
                      width="100%"
                      minH={{ base: '60px', md: '65px' }} // Increased min height
                      height="auto" // Allow dynamic height
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
                      py={3} // Increased vertical padding
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
                      whiteSpace="normal" // Allow text wrapping
                      textAlign="left"
                    >
                      <HStack align="flex-start" w="100%" spacing={3} flex={1}>
                        {/* Option Letter - Fixed size */}
                        <Box
                          w={{ base: '28px', md: '32px' }}
                          h={{ base: '28px', md: '32px' }}
                          minW={{ base: '28px', md: '32px' }} // Prevent shrinking
                          borderRadius="lg"
                          bg={
                            isSelected ? '#3B82F6' : 'rgba(255, 255, 255, 0.1)'
                          }
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          flexShrink={0}
                          mt={1} // Slight top margin for better alignment
                        >
                          {isSelected ? (
                            <CheckCircle size={16} color="white" />
                          ) : (
                            <Text
                              fontWeight="bold"
                              fontSize={{ base: 'xs', md: 'sm' }}
                              color="white"
                            >
                              {key.toUpperCase()}
                            </Text>
                          )}
                        </Box>

                        {/* Option Text - FIXED: Better text wrapping */}
                        <Box flex={1} minW={0}>
                          {' '}
                          {/* minW={0} allows flex item to shrink */}
                          <Text
                            fontSize={{ base: 'sm', md: 'md' }}
                            lineHeight="1.5"
                            textAlign="left"
                            fontWeight={isSelected ? '600' : '500'}
                            color={isSelected ? 'white' : 'gray.200'}
                            whiteSpace="normal" // Allow wrapping
                            wordBreak="break-word" // Break long words
                            overflowWrap="break-word" // Additional word breaking
                            hyphens="auto" // Add hyphens where appropriate
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

        {/* Answer Status */}
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
}

export default NormalQuizInterface
