// src/components/quizComponents/ScoreSection.jsx
import React from 'react'
import { Flex } from '@chakra-ui/react'
import RQMScoreCard from './RQMScoreCard'
import IQScoreCard from './IQScoreCard'

const ScoreSection = React.memo(
  ({ step, quizData, isTournament, rqmDelay, iqDelay }) => {
    return (
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
          animationDelay={rqmDelay}
        />
        <IQScoreCard
          step={step}
          quizData={quizData}
          isTournament={isTournament}
          animationDelay={iqDelay}
        />
      </Flex>
    )
  },
)

export default ScoreSection
