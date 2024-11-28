import React, { useMemo } from 'react'
import { Box, Container, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import PageTitle from './submittedQuizInterface/PageTitle'
import ActionButtons from './submittedQuizInterface/ActionButtons'
import ScoreCards from './submittedQuizInterface/ScoreCard'
import { useQuizProgress } from '../../customHooks/useQuizProgress'
import { parseQuizData } from '../../utils/quiz.utils'
import ScoreSection from './submittedQuizInterface/ScoreSection'
import ProgressSection from './submittedQuizInterface/ProgressSection'
import { ANIMATION_DELAYS } from '../../models/submittedQuizInterfaceConstants'

const MotionBox = motion(Box)

const LoadingState = ({ children }) => (
  <Box
    minH="100vh"
    bgGradient="linear(to-br, blue.900, purple.900, violet.900)"
    p={4}
    display="flex"
    alignItems="center"
    justifyContent="center"
    color="white"
  >
    {children}
  </Box>
)

const QuizContainer = ({ children }) => (
  <Box
    minH="100vh"
    bgGradient="linear(to-br, blue.900, purple.900, violet.900)"
    display="flex"
    justifyContent="center"
    color="white"
    py={2}
    w={'100%'}
  >
    {children}
  </Box>
)

const SubmittedQuizInterface = React.memo(
  ({ submitLoad = false, result, onViewReport, isTournament = false }) => {
    const { t } = useTranslation('SubmittedQuizInterface')
    const { step } = useQuizProgress(submitLoad)
    const quizData = useMemo(() => parseQuizData(result), [result])

    if (submitLoad) {
      return (
        <LoadingState>
          <Text fontSize="xl" color="gray.100">
            {t('calculating')}
          </Text>
        </LoadingState>
      )
    }

    return (
      <QuizContainer>
        <Container maxW="2xl" height="100%" w={'100%'}>
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            display="flex"
            flexDirection="column"
            gap={4}
            w={'100%'}
          >
            <PageTitle isTournament={isTournament} />

            <VStack spacing={4}>
              <ScoreCards
                step={step}
                quizData={quizData}
                isTournament={isTournament}
                animationDelay={ANIMATION_DELAYS.SCORE_CARDS}
              />

              <ScoreSection
                step={step}
                quizData={quizData}
                isTournament={isTournament}
                rqmDelay={ANIMATION_DELAYS.RQM_SCORE}
                iqDelay={ANIMATION_DELAYS.IQ_SCORE}
              />

              <ProgressSection
                step={step}
                rqmScore={quizData.finalRQM}
                pastRQMs={result?.pastRQMs}
                isTournament={isTournament}
                progressBarDelay={ANIMATION_DELAYS.PROGRESS_BAR}
                progressChartDelay={ANIMATION_DELAYS.PROGRESS_CHART}
              />

              <ActionButtons
                step={step}
                onViewReport={onViewReport}
                isTournament={isTournament}
                animationDelay={ANIMATION_DELAYS.ACTION_BUTTONS}
              />
            </VStack>
          </MotionBox>
        </Container>
      </QuizContainer>
    )
  },
)

export default SubmittedQuizInterface
