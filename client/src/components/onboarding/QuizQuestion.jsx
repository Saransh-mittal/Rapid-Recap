import React, { useState } from 'react'
import {
  VStack,
  Text,
  Box,
  Button,
  Progress,
  Flex,
  Spinner,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const OptionButton = React.memo(
  ({ optionKey, optionText, isSelected, onSelect, isTournament = false }) => {
    const getColor = (defaultColor, tournamentColor) =>
      isTournament ? tournamentColor : defaultColor

    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={() => onSelect(optionKey)}
          variant="solid"
          size="lg"
          width="100%"
          justifyContent="flex-start"
          bg={
            isSelected
              ? getColor('rgba(138, 43, 226, 0.4)', 'rgba(255, 215, 0, 0.5)')
              : getColor('rgba(255, 255, 255, 0.1)', 'rgba(255, 223, 0, 0.1)')
          }
          _hover={{
            bg: getColor('rgba(138, 43, 226, 0.3)', 'rgba(255, 215, 0, 0.3)'),
          }}
          mb={4}
          color={'white'}
          whiteSpace="normal"
          height="auto"
          py={2}
        >
          <Text display="flex" alignItems="flex-start" width="100%">
            <Text
              as="span"
              fontSize="md"
              textAlign="left"
              wordBreak="break-word"
            >
              {optionText}
            </Text>
          </Text>
        </Button>
      </motion.div>
    )
  },
)

const QuizQuestion = ({ onComplete, isArticleFetching, quizQuestion }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation('OnboardingProcess')

  const handleSubmit = () => {
    setIsLoading(true)
    setTimeout(() => {
      onComplete(selectedAnswer === quizQuestion?.answer, quizQuestion)
      setIsLoading(false)
    }, 1000)
  }

  const handleSelect = optionKey => {
    setSelectedAnswer(optionKey)
  }

  if (isArticleFetching) {
    return (
      <Box
        maxH="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        w="100%"
        h="100vh"
      >
        <Spinner size="xl" color="purple.500" />
      </Box>
    )
  }

  return (
    <Flex h={'100vh'} alignItems={'center'} className="Quiz-Question">
      <Box
        maxWidth="600px"
        width="100%"
        margin="0 auto"
        padding={{ base: '20px', md: '40px' }}
        paddingTop="0"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        borderRadius="xl"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)"
        bg="gray.800"
        height={{ base: '100%', md: 'auto' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key="quiz-question"
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
              {t('quiz.title')}
            </Text>

            <Progress
              value={100}
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
              {quizQuestion?.question}
            </Text>

            <VStack spacing={2} align="stretch">
              {quizQuestion &&
                Object.entries(quizQuestion?.options)?.map(([key, value]) => (
                  <OptionButton
                    key={key}
                    optionKey={key}
                    optionText={value}
                    isSelected={selectedAnswer === key}
                    onSelect={handleSelect}
                  />
                ))}
            </VStack>

            <Button
              onClick={handleSubmit}
              bg="purple.600"
              color="white"
              size="lg"
              width="100%"
              mt={6}
              _hover={{
                bg: 'purple.700',
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
              isLoading={isLoading}
              loadingText={t('quiz.submitting')}
              spinner={<Spinner color="white" />}
            >
              {t('quiz.submitButton')}
            </Button>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Flex>
  )
}

export default QuizQuestion
