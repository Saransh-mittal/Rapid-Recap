import React, { useMemo, useCallback } from 'react'
import {
  Button,
  Text,
  Box,
  Progress,
  VStack,
  Spinner,
  Center,
  Flex,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'

const OptionButton = React.memo(
  ({ optionKey, optionText, isSelected, onSelect }) => (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        onClick={() => onSelect(optionKey)}
        variant="solid"
        size="lg"
        width="100%"
        justifyContent="flex-start"
        bg={isSelected ? 'rgba(138, 43, 226, 0.4)' : 'rgba(255, 255, 255, 0.1)'}
        _hover={{
          bg: 'rgba(138, 43, 226, 0.3)',
        }}
        mb={4}
        color={'white'}
        whiteSpace="normal"
        height="auto"
        py={2}
      >
        <Flex alignItems="flex-start" width="100%">
          <Text fontSize="md" fontWeight="bold" mr={2} mb={0} flexShrink={0}>
            {optionKey.toUpperCase()}.
          </Text>
          <Text fontSize="md" mb={0} textAlign="left" wordBreak="break-word">
            {optionText}
          </Text>
        </Flex>
      </Button>
    </motion.div>
  ),
)

const QuizInterface = ({
  load,
  currentQuestionIndex,
  totalQuestions,
  quizData,
  handleAnswer,
  userAnswers,
}) => {
  const currentQuestion = useMemo(
    () => quizData?.questions?.[currentQuestionIndex] || null,
    [quizData, currentQuestionIndex],
  )

  const handleOptionSelect = useCallback(
    optionKey => {
      handleAnswer(optionKey)
    },
    [handleAnswer],
  )

  if (load || !quizData || quizData.length === 0) {
    return (
      <Center height="100vh">
        <Spinner size="xl" color="purple.500" />
      </Center>
    )
  }

  if (!currentQuestion) {
    return (
      <Center height="100vh">
        <Text fontSize="xl" color="gray.100">
          No quiz data available.
        </Text>
      </Center>
    )
  }

  return (
    <Box
      maxWidth="600px"
      width="100%"
      margin="0 auto"
      padding={{ base: '20px', md: '40px' }}
      paddingTop="0"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      bg="rgba(26, 21, 39, 0.9)"
      borderRadius="xl"
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Text
            fontSize={{ base: 'xl', md: '2xl' }}
            fontWeight="bold"
            mb={6}
            color="purple.200"
            textAlign={'center'}
          >
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Text>

          <Progress
            value={((currentQuestionIndex + 1) / totalQuestions) * 100}
            size="sm"
            mb={8}
            borderRadius="full"
            colorScheme="purple"
          />
          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            mb={8}
            color="gray.100"
            wordBreak="break-word"
          >
            {currentQuestion.question}
          </Text>
          <VStack spacing={4} align="stretch">
            {Object.entries(currentQuestion.options).map(([key, value]) => (
              <OptionButton
                key={key}
                optionKey={key}
                optionText={value}
                isSelected={userAnswers[currentQuestionIndex] === key}
                onSelect={handleOptionSelect}
              />
            ))}
          </VStack>
        </motion.div>
      </AnimatePresence>
    </Box>
  )
}

export default React.memo(QuizInterface)
