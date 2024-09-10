import React, { useEffect, useState, useMemo } from 'react'
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
import { useTranslation } from 'react-i18next'

const OptionButton = React.memo(
  ({ optionKey, optionText, isCorrect, isUserAnswer, isDisabled }) => (
    <motion.div>
      <Button
        isDisabled={isDisabled}
        variant="solid"
        size="lg"
        width="100%"
        justifyContent="flex-start"
        bg={
          isCorrect
            ? 'green.300'
            : isUserAnswer && !isCorrect
            ? 'red.300'
            : 'rgba(255, 255, 255, 0.1)'
        }
        _hover={isDisabled}
        mb={4}
        color="white"
        cursor={'default !important'}
        onClick={e => {
          e.preventDefault()
        }}
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

const GivenQuizInterface = ({ currentQuestionIndex, quizGivenSummary }) => {
  const { t } = useTranslation('GivenQuizInterface')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (quizGivenSummary.length > 0) {
      setLoading(false)
    }
  }, [currentQuestionIndex, quizGivenSummary])

  const currentQuestion = useMemo(
    () => quizGivenSummary[currentQuestionIndex] || null,
    [quizGivenSummary, currentQuestionIndex],
  )

  if (loading) {
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
          {t('noQuizData')}
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
            textAlign="center"
          >
            {t('questionLabel', {
              currentQuestionIndex: currentQuestionIndex + 1,
              totalQuestions: quizGivenSummary.length,
            })}
          </Text>

          <Flex width="100%" justifyContent="center" alignItems="center" mb={8}>
            <Progress
              value={
                ((currentQuestionIndex + 1) / quizGivenSummary.length) * 100
              }
              size="sm"
              width="100%"
              borderRadius="full"
              colorScheme="purple"
            />
            <Text ml={4} color="white" flexShrink={0}>
              {currentQuestionIndex + 1} / {quizGivenSummary.length}
            </Text>
          </Flex>

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
                isCorrect={
                  currentQuestion.answer.toUpperCase() === key.toUpperCase()
                }
                isUserAnswer={
                  currentQuestion.userAnswer.toUpperCase() === key.toUpperCase()
                }
                isDisabled={
                  currentQuestion.answer.toUpperCase() !== key.toUpperCase() &&
                  currentQuestion.userAnswer.toUpperCase() !== key.toUpperCase()
                }
              />
            ))}
          </VStack>
        </motion.div>
      </AnimatePresence>
    </Box>
  )
}

export default React.memo(GivenQuizInterface)
