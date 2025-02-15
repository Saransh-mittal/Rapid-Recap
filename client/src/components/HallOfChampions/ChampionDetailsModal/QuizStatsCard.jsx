import React from 'react'
import { Box, Text, VStack, Grid } from '@chakra-ui/react'
import { CheckSquare, Trophy, Award } from 'lucide-react'
import { fadeIn } from './animations'
import StatCard from './StatCard'

const QuizStatsCard = ({ stats, t }) => (
  <Box
    w="full"
    p={6}
    bg="rgba(255, 255, 255, 0.03)"
    borderRadius="xl"
    backdropFilter="blur(10px)"
    border="1px solid"
    borderColor="whiteAlpha.100"
    style={{
      animation: `${fadeIn} 0.6s ease-out 0.4s forwards`,
    }}
  >
    <VStack spacing={4} align="start">
      <Text color="white" fontSize="lg" fontWeight="semibold">
        {t('Quiz Performance')}
      </Text>
      <Grid
        templateColumns={{
          base: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
        gap={4}
        w="full"
      >
        <StatCard
          icon={CheckSquare}
          label={t('Total Quizzes')}
          value={stats.total}
          delay={0.5}
        />
        <StatCard
          icon={Trophy}
          label={t('Perfect Scores')}
          value={stats.perfectScores}
          delay={0.6}
        />
        <StatCard
          icon={Award}
          label={t('Success Rate')}
          value={`${((stats.perfectScores / stats.total) * 100).toFixed(1)}%`}
          delay={0.7}
        />
      </Grid>
    </VStack>
  </Box>
)
export default QuizStatsCard
