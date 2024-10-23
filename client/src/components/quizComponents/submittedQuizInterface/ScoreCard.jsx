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

const ScoreCard = ({
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
    backdropFilter="blur(8px)"
    rounded="xl"
    p={3}
    borderWidth={1}
    borderColor="whiteAlpha.100"
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
)

const ScoreCards = ({ step, quizData, isTournament }) => {
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
      delay: 0,
    },
    {
      icon: Clock,
      value: `${quizData.timeTaken}${t('seconds')}`,
      label: t('timeTaken'),
      color: isTournament ? 'yellow.400' : 'blue.400',
      delay: 0.1,
    },
    {
      icon: DifficultyIcon,
      value: t(difficulty),
      label: t('level'),
      color: diffColor,
      delay: 0.2,
      isDifficultyCard: true,
    },
  ]

  return (
    <Grid templateColumns="repeat(3, 1fr)" gap={3}>
      {cards.map((card, i) => (
        <ScoreCard
          key={i}
          {...card}
          isDifficultyCard={i === 2} // Apply special styling to difficulty card
        />
      ))}
    </Grid>
  )
}

export default ScoreCards
