import React, { useState, useEffect } from 'react'
import { Box, Container, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import PageTitle from './submittedQuizInterface/PageTitle'
import ProgressBar from './submittedQuizInterface/ProgressBar'
import ProgressChart from './submittedQuizInterface/ProgressChart'
import ActionButtons from './submittedQuizInterface/ActionButtons'
import ScoreCards from './submittedQuizInterface/ScoreCard'
import RQMScoreCard from './submittedQuizInterface/RQMScoreCard'
import IQScoreCard from './submittedQuizInterface/IQScoreCard'

const MotionBox = motion(Box)

const SubmittedQuizInterface = ({
  submitLoad = false,
  result,
  onViewReport,
  isTournament = false,
}) => {
  const { t } = useTranslation('SubmittedQuizInterface')
  const [step, setStep] = useState(0)

  // Progress animation
  useEffect(() => {
    if (!submitLoad) {
      const timer = setInterval(() => {
        setStep(prev => (prev < 4 ? prev + 1 : prev))
      }, 600)
      return () => clearInterval(timer)
    }
  }, [submitLoad])

  // Early loading state
  if (submitLoad) {
    return (
      <Box
        minH="100vh"
        bgGradient="linear(to-br, blue.900, purple.900, violet.900)"
        p={4}
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="white"
      >
        <Text fontSize="xl" color="gray.100">
          {t('calculating')}
        </Text>
      </Box>
    )
  }

  // Parse score from "x/y" format
  const [correct, total] = result?.score?.split('/').map(Number) || [0, 0]

  // Quiz data object
  const quizData = {
    score: {
      correct,
      total,
      percentage: (correct / total) * 100,
    },
    timeTaken: result?.timeTaken,
    difficulty: result?.quizDifficulty,
    // baseRQM: result?.baseRQM_score,
    // finalRQM: result?.RQM_score,
    // performanceBonus: result?.performanceBonus,
    // boost: result?.boost,
    // isBoost: result?.isBoosted,
    baseRQM: 25,
    finalRQM: 50,
    performanceBonus: 1.2,
    // boost: 1.5,
    // isBoost: true,
    iqData: {
      prevScore: result?.prevIQScore,
      newScore: result?.newIQScore,
      hasChange: result?.hasSocietyOrCircleChanged,
      changeDetails: result?.changedSocietyOrCircle,
      isUpgrade: result?.isUpgrade,
      pauseRealTimeIQ: result?.pauseRealTimeIQ,
    },
  }

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, blue.900, purple.900, violet.900)"
      display="flex"
      justifyContent="center"
      color="white"
      py={2}
    >
      <Container maxW="2xl" height={'100%'}>
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          display="flex"
          flexDirection="column"
          gap={4}
        >
          <PageTitle />

          <ScoreCards
            step={step}
            quizData={quizData}
            isTournament={isTournament}
          />
          <Flex
            w={'100%'}
            height={'fit-content'}
            flexDirection={{ base: 'column', md: 'row' }}
            gap={3}
          >
            <RQMScoreCard
              step={step}
              quizData={quizData}
              isTournament={isTournament}
            />

            <IQScoreCard
              step={step}
              quizData={quizData}
              isTournament={isTournament}
            />
          </Flex>
          <ProgressBar
            step={step}
            rqmScore={quizData.finalRQM}
            isTournament={isTournament}
          />

          <ProgressChart
            step={step}
            pastRQMs={result?.pastRQMs || []}
            isTournament={isTournament}
          />

          <ActionButtons
            step={step}
            onViewReport={onViewReport}
            isTournament={isTournament}
          />
        </MotionBox>
      </Container>
    </Box>
  )
}

export default SubmittedQuizInterface
