import React from 'react'
import { Box, VStack, Text, Button } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { CheckIcon, CloseIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const QuizResult = ({ isCorrect, onNext, quizQuestion, isLoadingNext }) => {
  const { t } = useTranslation('OnboardingProcess')
  if (!quizQuestion) {
    onNext()
    return null
  }
  return (
    <Box h="100vh" display="flex" alignItems="center" justifyContent="center">
      <MotionBox
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        bg="rgba(255,255,255,0.05)"
        p={12}
        borderRadius="xl"
        boxShadow="xl"
        backdropFilter="blur(10px)"
        maxWidth="600px"
        width="90%"
      >
        <VStack spacing={8} align="stretch">
          <Text
            fontSize="4xl"
            fontWeight="bold"
            color="white"
            textShadow="2px 2px 4px rgba(0,0,0,0.4)"
            textAlign="center"
          >
            {t(
              isCorrect ? 'quizResult.successTitle' : 'quizResult.failureTitle',
            )}
          </Text>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="white"
            textShadow="2px 2px 4px rgba(0,0,0,0.4)"
            textAlign="center"
          >
            {isCorrect ? (
              <>
                <CheckIcon color={'green'} />
                <Text as="span" ml={3}>
                  {t('quizResult.correctLabel')}
                </Text>
              </>
            ) : (
              <>
                <CloseIcon color={'red'} />
                <Text as="span" ml={3}>
                  {t('quizResult.wrongLabel')}
                </Text>
              </>
            )}
          </Text>
          <Text fontSize="xl" color="white" textAlign="center">
            {quizQuestion?.explanation}
          </Text>
          <Text fontSize="lg" color="white" textAlign="center">
            {t('quizResult.nextStepDescription')}
          </Text>
          <Button
            onClick={onNext}
            bg="purple.600"
            color="white"
            size="lg"
            _hover={{
              bg: 'purple.700',
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            isLoading={isLoadingNext}
            transition="all 0.2s"
          >
            {t('quizResult.continueButton')}
          </Button>
        </VStack>
      </MotionBox>
    </Box>
  )
}

export default QuizResult
