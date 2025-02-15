import React from 'react'
import { Box, Text, VStack, Grid, HStack } from '@chakra-ui/react'
import { TrendingUp, CheckSquare } from 'lucide-react'
import { fadeIn, scaleIn, slideIn } from './animations'

const PerformanceInsightsCard = ({ champion, t }) => {
  const metrics = [
    {
      icon: TrendingUp,
      label: t('IQ Growth Rate'),
      value: `${(
        ((champion.iqScore.final - champion.iqScore.start) /
          champion.iqScore.start) *
        100
      ).toFixed(1)}%`,
      subtext: `From ${champion.iqScore.start} to ${champion.iqScore.final}`,
    },
    {
      icon: CheckSquare,
      label: t('Quiz Success Rate'),
      value: `${(
        (champion.quizStats.perfectScores / champion.quizStats.total) *
        100
      ).toFixed(1)}%`,
      subtext: `${champion.quizStats.perfectScores} perfect scores out of ${champion.quizStats.total}`,
    },
  ]

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
        animation: `${fadeIn} 0.6s ease-out 0.7s forwards`,
      }}
    >
      <VStack align="start" spacing={4}>
        <Text color="white" fontSize="lg" fontWeight="semibold">
          {t('Performance Insights')}
        </Text>
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
          gap={4}
          w="full"
        >
          {metrics.map((metric, index) => (
            <Box
              key={index}
              p={4}
              bg="rgba(255, 255, 255, 0.05)"
              borderRadius="xl"
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-2px)',
                bg: 'rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              }}
              style={{
                animation: `${fadeIn} 0.6s ease-out ${
                  0.8 + index * 0.1
                }s forwards`,
              }}
            >
              <VStack align="start" spacing={2}>
                <HStack>
                  <metric.icon
                    size={16}
                    color="white"
                    style={{
                      animation: `${scaleIn} 0.4s ease-out ${
                        0.9 + index * 0.1
                      }s forwards`,
                    }}
                  />
                  <Text color="white" fontSize="sm" fontWeight="medium">
                    {metric.label}
                  </Text>
                </HStack>
                <Text
                  color="white"
                  fontSize="2xl"
                  fontWeight="bold"
                  style={{
                    animation: `${slideIn} 0.4s ease-out ${
                      1 + index * 0.1
                    }s forwards`,
                  }}
                >
                  {metric.value}
                </Text>
                <Text color="whiteAlpha.600" fontSize="sm">
                  {metric.subtext}
                </Text>
              </VStack>
            </Box>
          ))}
        </Grid>
      </VStack>
    </Box>
  )
}
export default PerformanceInsightsCard
