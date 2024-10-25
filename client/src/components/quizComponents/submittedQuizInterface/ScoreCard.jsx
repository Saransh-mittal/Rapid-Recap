// src/components/quizComponents/ScoreCards.jsx
import React from 'react'
import { Grid, Icon, Text, Box, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Award, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  ARTICLE_DIFFICULTY,
  ICONS_ARTICLE_DIFFICULTY,
  DIFF_COLOR,
} from '../../../models/articleDifficulty'

const MotionBox = motion(Box)

const ScoreCard = React.memo(
  ({
    icon: IconComponent,
    value,
    label,
    color,
    delay,
    isDifficultyCard = false,
  }) => (
    <MotionBox
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      bg="whiteAlpha.50"
      rounded="xl"
      p={3}
      borderWidth={1}
      borderColor="whiteAlpha.100"
      zIndex={2}
    >
      {isDifficultyCard ? (
        <Flex mb={5} color={color}>
          <IconComponent />
        </Flex>
      ) : (
        <Icon as={IconComponent} boxSize={6} color={color} mb={2} />
      )}
      <Text
        fontSize={{ base: 'lg', md: '2xl' }}
        fontWeight="bold"
        color={isDifficultyCard ? color : 'white'}
      >
        {value}
      </Text>
      <Text fontSize="xs" color="purple.200">
        {label}
      </Text>
    </MotionBox>
  ),
)

const ScoreCards = React.memo(
  ({ step, quizData, isTournament, animationDelay }) => {
    const { t } = useTranslation('SubmittedQuizInterface')

    if (step < 1) return null

    const difficulty = quizData?.difficulty?.toLowerCase()
    const DifficultyIcon = ICONS_ARTICLE_DIFFICULTY[difficulty]
    const diffColor = DIFF_COLOR[difficulty]

    const cards = [
      {
        icon: Award,
        value: `${quizData.score.correct}/${quizData.score.total}`,
        label: t('score'),
        color: isTournament ? 'yellow.400' : 'purple.400',
        delay: animationDelay,
      },
      {
        icon: Clock,
        value: `${quizData.timeTaken}${t('seconds')}`,
        label: t('timeTaken'),
        color: isTournament ? 'yellow.400' : 'blue.400',
        delay: animationDelay + 0.1,
      },
      {
        icon: DifficultyIcon,
        value: t(difficulty),
        label: t('level'),
        color: diffColor,
        delay: animationDelay + 0.2,
        isDifficultyCard: true,
      },
    ]

    return (
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: animationDelay }}
        w={'100%'}
      >
        <Grid templateColumns="repeat(3, 1fr)" gap={3} w={'100%'}>
          {cards.map((card, i) => (
            <ScoreCard key={i} {...card} isDifficultyCard={i === 2} />
          ))}
        </Grid>
      </MotionBox>
    )
  },
)

export default ScoreCards
