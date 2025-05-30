// components/quickClashComponents/team/battleAnalysis/components/BattleSummaryMetrics.jsx
import React from 'react'
import {
  Box,
  Text,
  Heading,
  Icon,
  HStack,
  VStack,
  Grid,
} from '@chakra-ui/react'
import { Award } from 'lucide-react'

const BattleSummaryMetrics = React.memo(({ userTeamStats, t }) => {
  const metrics = [
    {
      labelKey: 'Team Rating',
      value: `${Math.round(userTeamStats.rating)}%`,
      color: 'purple.300',
    },
    {
      labelKey: 'Teamwork',
      value: `${Math.round(userTeamStats.teamwork)}%`,
      color: 'green.300',
    },
    {
      labelKey: 'Consistency',
      value: `${Math.round(userTeamStats.consistency)}%`,
      color: 'blue.300',
    },
  ]

  return (
    <Box
      mt={6}
      p={3}
      bg="rgba(139, 92, 246, 0.08)"
      borderRadius="xl"
      border="1px solid rgba(139, 92, 246, 0.2)"
    >
      <VStack spacing={2.5}>
        <HStack spacing={2}>
          <Icon as={Award} color="purple.300" boxSize={4} />
          <Heading size={{ base: 'xs', md: 'sm' }} color="whiteAlpha.900">
            {t('Team Battle Summary')}
          </Heading>
        </HStack>
        <Grid
          templateColumns={{ base: '1fr', sm: 'repeat(3, 1fr)' }}
          gap={2}
          w="full"
        >
          {metrics.map(item => (
            <VStack
              key={item.labelKey}
              bg="whiteAlpha.50"
              p={2}
              borderRadius="md"
              minH="60px"
              justifyContent="center"
            >
              <Text fontSize={{ base: '2xs', sm: 'xs' }} color="whiteAlpha.700">
                {t(item.labelKey)}
              </Text>
              <Text
                fontSize={{ base: 'sm', sm: 'md' }}
                fontWeight="bold"
                color={item.color}
              >
                {item.value}
              </Text>
            </VStack>
          ))}
        </Grid>
      </VStack>
    </Box>
  )
})

BattleSummaryMetrics.displayName = 'BattleSummaryMetrics'
export default BattleSummaryMetrics
