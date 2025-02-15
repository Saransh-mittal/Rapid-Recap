import React from 'react'
import { Box, Text, VStack, HStack, Stack, Badge } from '@chakra-ui/react'
import { Crown, Brain, Target, Trophy, Sparkles } from 'lucide-react'
import { fadeIn } from './animations'

const AchievementsCard = ({ champion, t }) => {
  const achievements = [
    {
      condition: champion.finalRank <= 3,
      icon: Crown,
      text: t('Top 3 Champion'),
      color: 'yellow',
    },
    {
      condition: champion.iqScore.final > 150,
      icon: Brain,
      text: t('IQ Elite'),
      color: 'purple',
    },
    {
      condition: champion.submissions > 500,
      icon: Target,
      text: t('Dedicated Solver'),
      color: 'blue',
    },
    {
      condition: champion.quizStats.perfectScores >= 10,
      icon: Trophy,
      text: t('Quiz Master'),
      color: 'green',
    },
    {
      condition: champion.rqmScore.highest >= 65,
      icon: Sparkles,
      text: t('High RQM Achiever'),
      color: 'pink',
    },
  ].filter(a => a.condition)

  if (achievements.length === 0 || !achievements) return null

  return (
    <Box
      w="full"
      p={6}
      bg="rgba(255, 255, 255, 0.03)"
      borderRadius="xl"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="whiteAlpha.100"
      style={{
        animation: `${fadeIn} 0.6s ease-out 0.6s forwards`,
      }}
    >
      <VStack align="start" spacing={4}>
        <Text color="white" fontSize="lg" fontWeight="semibold">
          {t('Achievements')}
        </Text>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={{ base: 2, md: 4 }}
          w="full"
          flexWrap="wrap"
        >
          {achievements.map((achievement, index) => (
            <Badge
              key={index}
              colorScheme={achievement.color}
              variant="subtle"
              px={3}
              py={1.5}
              borderRadius="full"
              transition="all 0.3s"
              _hover={{
                transform: 'scale(1.05)',
                boxShadow: `0 0 20px ${achievement.color}33`,
              }}
              style={{
                animation: `${fadeIn} 0.6s ease-out ${
                  0.7 + index * 0.1
                }s forwards`,
              }}
            >
              <HStack spacing={2}>
                <achievement.icon size={14} />
                <Text>{achievement.text}</Text>
              </HStack>
            </Badge>
          ))}
        </Stack>
      </VStack>
    </Box>
  )
}
export default AchievementsCard
