// components/gameHub/gameInterfaces/TrueFalseInterface.jsx - Updated with manual navigation
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
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const TrueFalseInterface = ({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  selectedAnswer,
}) => {
  const { t } = useTranslation()

  // Handle both statement object and direct question object
  const statement = question.text || question.statement || question.question
  const difficulty = question.difficulty

  const handleAnswerSelect = answer => {
    onAnswer(answer)
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

  const getSelectedIcon = () => {
    if (selectedAnswer === true) return <CheckCircle size={20} />
    if (selectedAnswer === false) return <XCircle size={20} />
    return <HelpCircle size={20} />
  }

  const getSelectedText = () => {
    if (selectedAnswer === true) return 'Selected: TRUE'
    if (selectedAnswer === false) return 'Selected: FALSE'
    return 'No answer selected'
  }

  const getSelectedColor = () => {
    if (selectedAnswer === true) return 'green.400'
    if (selectedAnswer === false) return 'red.400'
    return 'gray.500'
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      w="100%"
    >
      <VStack spacing={8} align="center">
        <Box textAlign="center" w="100%">
          <HStack justify="center" spacing={4} mb={4}>
            <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
              Statement {questionIndex + 1}
            </Badge>
            {difficulty && (
              <Badge
                colorScheme={getDifficultyColor(difficulty)}
                fontSize="sm"
                px={2}
                py={1}
              >
                {getDifficultyLabel(difficulty)} ({Math.round(difficulty * 100)}
                %)
              </Badge>
            )}
          </HStack>
        </Box>

        {/* Statement Display */}
        <Box
          bg="gray.800"
          p={6}
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.700"
          maxW="600px"
          w="100%"
          position="relative"
        >
          <Text fontSize="xl" color="white" textAlign="center" lineHeight="1.6">
            {statement}
          </Text>

          {/* Statement indicator */}
          <Box
            position="absolute"
            top="-12px"
            left="50%"
            transform="translateX(-50%)"
            bg="purple.600"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
            color="white"
          >
            STATEMENT
          </Box>
        </Box>

        {/* Answer Selection */}
        <VStack spacing={4} w="100%">
          <Text
            fontSize="lg"
            color="white"
            fontWeight="semibold"
            textAlign="center"
          >
            Is this statement TRUE or FALSE?
          </Text>

          <HStack spacing={8} justify="center">
            <MotionButton
              onClick={() => handleAnswerSelect(false)}
              size="xl"
              colorScheme="red"
              variant={selectedAnswer === false ? 'solid' : 'outline'}
              leftIcon={<XCircle size={24} />}
              px={8}
              py={6}
              fontSize="lg"
              fontWeight="bold"
              borderRadius="xl"
              border="2px solid"
              borderColor={selectedAnswer === false ? 'red.400' : 'red.600'}
              bg={selectedAnswer === false ? 'red.600' : 'transparent'}
              _hover={{
                transform: 'scale(1.05)',
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)',
                bg: selectedAnswer === false ? 'red.700' : 'red.900',
              }}
              _active={{
                transform: 'scale(0.95)',
              }}
              transition="all 0.2s"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              FALSE
            </MotionButton>

            <MotionButton
              onClick={() => handleAnswerSelect(true)}
              size="xl"
              colorScheme="green"
              variant={selectedAnswer === true ? 'solid' : 'outline'}
              leftIcon={<CheckCircle size={24} />}
              px={8}
              py={6}
              fontSize="lg"
              fontWeight="bold"
              borderRadius="xl"
              border="2px solid"
              borderColor={selectedAnswer === true ? 'green.400' : 'green.600'}
              bg={selectedAnswer === true ? 'green.600' : 'transparent'}
              _hover={{
                transform: 'scale(1.05)',
                boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)',
                bg: selectedAnswer === true ? 'green.700' : 'green.900',
              }}
              _active={{
                transform: 'scale(0.95)',
              }}
              transition="all 0.2s"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              TRUE
            </MotionButton>
          </HStack>
        </VStack>

        {/* Selection Status */}
        <Box textAlign="center">
          <HStack justify="center" spacing={2} color={getSelectedColor()}>
            {getSelectedIcon()}
            <Text fontWeight="semibold" fontSize="md">
              {getSelectedText()}
            </Text>
          </HStack>
          {selectedAnswer !== undefined && selectedAnswer !== null && (
            <Text fontSize="sm" color="gray.400" mt={2}>
              You can change your answer before proceeding
            </Text>
          )}
        </Box>

        {/* Instructions */}
        <Box
          bg="blue.900"
          p={4}
          borderRadius="lg"
          border="1px solid"
          borderColor="blue.700"
          maxW="500px"
          textAlign="center"
        >
          <Text fontSize="sm" color="blue.200" lineHeight="1.5">
            📖 Read the statement carefully and determine if it's true or false
            based on the article content. Look out for absolute terms like
            "always" or "never" which often indicate false statements.
          </Text>
        </Box>
      </VStack>
    </MotionBox>
  )
}

export default TrueFalseInterface
