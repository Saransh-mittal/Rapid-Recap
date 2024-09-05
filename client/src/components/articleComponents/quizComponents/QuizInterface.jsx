import React, { useMemo, useCallback, lazy, Suspense } from 'react'
import {
  Button,
  Text,
  Box,
  Progress,
  VStack,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// Lazy load OptionButton for code splitting
const OptionButton = lazy(() => import('./OptionButton'))

const QuizInterface = ({
  load,
  currentQuestionIndex,
  totalQuestions,
  quizData,
  handleAnswer,
  userAnswers,
}) => {
  const { t } = useTranslation('QuizInterface')
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
            textAlign={'center'}
          >
            {t('question')}
            {currentQuestionIndex + 1} {t('of')}
            {totalQuestions}
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
          <VStack spacing={2} align="stretch">
            {Object.entries(currentQuestion.options).map(([key, value]) => (
              <Suspense
                fallback={
                  <Button isLoading width="100%" height="auto" py={2} mb={4} />
                }
                key={key}
              >
                <OptionButton
                  optionKey={key}
                  optionText={value}
                  isSelected={userAnswers[currentQuestionIndex] === key}
                  onSelect={handleOptionSelect}
                />
              </Suspense>
            ))}
          </VStack>
        </motion.div>
      </AnimatePresence>
    </Box>
  )
}

export default React.memo(QuizInterface)
