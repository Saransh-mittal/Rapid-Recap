// src/components/quizComponents/ScoreSection.jsx
import React from 'react'
import { Flex } from '@chakra-ui/react'
import RQMScoreCard from './RQMScoreCard'
import IQScoreCard from './IQScoreCard'

const ScoreSection = React.memo(
  ({
    step,
    quizData,
    isTournament,
    rqmDelay,
    iqDelay,
    openedFromQuickClash,
  }) => {
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
        {!openedFromQuickClash && !isTournament && (
          <IQScoreCard
            step={step}
            quizData={quizData}
            isTournament={isTournament}
            animationDelay={iqDelay}
          />
        )}
      </Flex>
    )
  },
)

export default ScoreSection
