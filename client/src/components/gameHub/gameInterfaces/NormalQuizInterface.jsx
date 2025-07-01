// components/gameHub/gameInterfaces/NormalQuizInterface.jsx - Optimized Minimalistic Version
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
  const { t } = useTranslation()

  const handleOptionSelect = optionKey => {
    onAnswer(optionKey)
  }

  const getDifficultyColor = difficulty => {
    if (difficulty < 0.3) return '#10B981'
    if (difficulty < 0.6) return '#F59E0B'
    return '#EF4444'
  }

  const getDifficultyLabel = difficulty => {
    if (difficulty < 0.3) return 'Easy'
    if (difficulty < 0.6) return 'Medium'
    return 'Hard'
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
            bg="rgba(59, 130, 246, 0.1)"
            color="blue.400"
            px={2}
            py={1}
            borderRadius="full"
            fontSize="xs"
          >
            Question {questionIndex + 1}/{totalQuestions}
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
          >
            {question.question}
          </Text>
        </Box>

        {/* Answer Options */}
        <VStack spacing={2}>
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
                      minH="50px"
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
                      _hover={{
                        borderColor: isSelected
                          ? '#2563EB'
                          : 'rgba(255, 255, 255, 0.3)',
                        bg: isSelected
                          ? 'rgba(59, 130, 246, 0.3)'
                          : 'rgba(255, 255, 255, 0.08)',
                      }}
                      transition="all 0.2s"
                    >
                      <HStack align="flex-start" w="100%" spacing={3}>
                        {/* Option Letter */}
                        <Box
                          w="30px"
                          h="30px"
                          borderRadius="lg"
                          bg={
                            isSelected ? '#3B82F6' : 'rgba(255, 255, 255, 0.1)'
                          }
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          flexShrink={0}
                        >
                          {isSelected ? (
                            <CheckCircle size={16} color="white" />
                          ) : (
                            <Text fontWeight="bold" fontSize="sm" color="white">
                              {key.toUpperCase()}
                            </Text>
                          )}
                        </Box>

                        {/* Option Text */}
                        <Text
                          fontSize="sm"
                          lineHeight="1.5"
                          textAlign="left"
                          fontWeight={isSelected ? '600' : '500'}
                          color={isSelected ? 'white' : 'gray.200'}
                          flex={1}
                        >
                          {value}
                        </Text>
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
                Option {selectedAnswer.toUpperCase()} selected
              </Text>
            </HStack>
          ) : (
            <HStack justify="center" spacing={2}>
              <Target size={16} color="#6B7280" />
              <Text color="gray.400" fontSize="sm">
                Select your answer
              </Text>
            </HStack>
          )}
        </Box>
      </VStack>
    </MotionBox>
  )
}

export default NormalQuizInterface
