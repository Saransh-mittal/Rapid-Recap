// components/gameHub/gameInterfaces/NormalQuizInterface.jsx - Updated with manual navigation
import React from 'react'
import {
  VStack,
  HStack,
  Text,
  Button,
  Progress,
  Box,
  Badge,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

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
    if (difficulty < 0.3) return 'green'
    if (difficulty < 0.6) return 'yellow'
    return 'red'
  }

  const getDifficultyLabel = difficulty => {
    if (difficulty < 0.3) return 'Easy'
    if (difficulty < 0.6) return 'Medium'
    return 'Hard'
  }

  return (
    <MotionBox
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      w="100%"
    >
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <HStack justify="center" spacing={4} mb={4}>
            <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
              Question {questionIndex + 1}
            </Badge>
            {question.difficulty && (
              <Badge
                colorScheme={getDifficultyColor(question.difficulty)}
                fontSize="sm"
                px={2}
                py={1}
              >
                {getDifficultyLabel(question.difficulty)} (
                {Math.round(question.difficulty * 100)}%)
              </Badge>
            )}
          </HStack>
        </Box>

        {/* Question Text */}
        <Box
          bg="gray.800"
          p={6}
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.700"
        >
          <Text fontSize="lg" color="white" textAlign="center" lineHeight="1.6">
            {question.question}
          </Text>
        </Box>

        {/* Answer Options */}
        <VStack spacing={3}>
          {Object.entries(question.options || {}).map(([key, value]) => {
            const isSelected = selectedAnswer === key

            return (
              <MotionButton
                key={key}
                onClick={() => handleOptionSelect(key)}
                size="lg"
                width="100%"
                justifyContent="flex-start"
                bg={isSelected ? 'purple.600' : 'whiteAlpha.200'}
                color="white"
                border={isSelected ? '2px solid' : '1px solid'}
                borderColor={isSelected ? 'purple.400' : 'gray.600'}
                _hover={{
                  bg: isSelected ? 'purple.700' : 'whiteAlpha.300',
                  borderColor: isSelected ? 'purple.300' : 'gray.500',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                p={4}
                height="auto"
                whiteSpace="normal"
                textAlign="left"
                borderRadius="lg"
                transition="all 0.2s"
                position="relative"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <HStack align="flex-start" w="100%" spacing={3}>
                  <Box
                    w="8"
                    h="8"
                    borderRadius="full"
                    bg={isSelected ? 'purple.400' : 'gray.600'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                    border="2px solid"
                    borderColor={isSelected ? 'purple.200' : 'gray.500'}
                  >
                    {isSelected ? (
                      <CheckCircle size={16} color="white" />
                    ) : (
                      <Text fontWeight="bold" fontSize="sm" color="white">
                        {key.toUpperCase()}
                      </Text>
                    )}
                  </Box>
                  <Text flex="1" fontSize="md" lineHeight="1.5">
                    {value}
                  </Text>
                </HStack>
              </MotionButton>
            )
          })}
        </VStack>

        {/* Answer Status */}
        <Box textAlign="center">
          {selectedAnswer ? (
            <HStack justify="center" spacing={2}>
              <CheckCircle size={20} color="#A855F7" />
              <Text color="purple.400" fontWeight="semibold">
                Answer selected: Option {selectedAnswer.toUpperCase()}
              </Text>
            </HStack>
          ) : (
            <Text color="gray.500" fontSize="sm">
              Please select an answer to continue
            </Text>
          )}
        </Box>

        {/* Helpful Instructions */}
        <Box
          bg="blue.900"
          p={3}
          borderRadius="lg"
          border="1px solid"
          borderColor="blue.700"
        >
          <Text fontSize="xs" color="blue.200" textAlign="center">
            💡 Choose the best answer based on the article content. You can
            change your selection before moving to the next question.
          </Text>
        </Box>
      </VStack>
    </MotionBox>
  )
}

export default NormalQuizInterface
