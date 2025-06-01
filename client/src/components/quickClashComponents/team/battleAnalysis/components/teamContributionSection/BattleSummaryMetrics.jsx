// components/quickClashComponents/team/battleAnalysis/components/teamContributionSection/BattleSummaryMetrics.jsx
import React from 'react'
import {
  Box,
  Text,
  Heading,
  Icon,
  HStack,
  VStack,
  Grid,
  Badge,
} from '@chakra-ui/react'
import { Award, TrendingUp, Users, Target } from 'lucide-react'

const BattleSummaryMetrics = React.memo(({ userTeamStats, t }) => {
  // UPDATED: Calculate team grade based on overall performance
  const getTeamGrade = rating => {
    if (rating >= 90) return { grade: 'S+', color: 'purple' }
    if (rating >= 80) return { grade: 'S', color: 'green' }
    if (rating >= 70) return { grade: 'A', color: 'blue' }
    if (rating >= 60) return { grade: 'B', color: 'yellow' }
    return { grade: 'C', color: 'red' }
  }

  const teamGrade = getTeamGrade(userTeamStats.rating)

  const metrics = [
    {
      labelKey: 'Team Rating',
      value: `${Math.round(userTeamStats.rating)}%`,
      color: 'purple.300',
      icon: Award,
      grade: teamGrade.grade,
      gradeColor: teamGrade.color,
    },
    {
      labelKey: 'Teamwork',
      value: `${Math.round(userTeamStats.teamwork)}%`,
      color: 'green.300',
      icon: Users,
    },
    {
      labelKey: 'Consistency',
      value: `${Math.round(userTeamStats.consistency)}%`,
      color: 'blue.300',
      icon: Target,
    },
    {
      labelKey: 'Avg Score',
      value: `${Math.round(userTeamStats.avgScore)}`,
      color: 'yellow.300',
      icon: TrendingUp,
    },
  ]

  return (
    <Box
      mt={6}
      p={4}
      bg="rgba(139, 92, 246, 0.08)"
      borderRadius="xl"
      border="1px solid rgba(139, 92, 246, 0.2)"
    >
      <VStack spacing={4}>
        <HStack spacing={2}>
          <Icon as={Award} color="purple.300" boxSize={5} />
          <Heading size={{ base: 'sm', md: 'md' }} color="whiteAlpha.900">
            {t('Team Battle Summary')}
          </Heading>
          {/* UPDATED: Show overall team grade */}
          <Badge
            colorScheme={teamGrade.color}
            variant="solid"
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="full"
            fontWeight="bold"
          >
            {t('Team Grade')}: {teamGrade.grade}
          </Badge>
        </HStack>

        <Grid
          templateColumns={{
            base: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          }}
          gap={3}
          w="full"
        >
          {metrics.map(item => (
            <VStack
              key={item.labelKey}
              bg="whiteAlpha.50"
              p={3}
              borderRadius="lg"
              minH="80px"
              justifyContent="center"
              border="1px solid"
              borderColor="whiteAlpha.100"
              _hover={{
                bg: 'whiteAlpha.100',
                transform: 'translateY(-1px)',
              }}
              transition="all 0.2s ease"
            >
              <Icon as={item.icon} color={item.color} boxSize={6} />
              <Text
                color={item.color}
                fontSize={{ base: 'lg', sm: 'xl' }}
                fontWeight="bold"
              >
                {item.value}
              </Text>
              <Text
                color="whiteAlpha.700"
                fontSize="xs"
                textAlign="center"
                fontWeight="medium"
              >
                {t(item.labelKey)}
              </Text>
              {/* UPDATED: Show individual metric grade for team rating */}
              {item.grade && (
                <Badge
                  colorScheme={item.gradeColor}
                  variant="outline"
                  fontSize="xs"
                  px={2}
                  py={0.5}
                >
                  {t('Grade')}: {item.grade}
                </Badge>
              )}
            </VStack>
          ))}
        </Grid>

        {/* UPDATED: Add grade explanation */}
        <Box
          w="full"
          p={3}
          bg="blackAlpha.200"
          borderRadius="md"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <VStack spacing={2}>
            <Text
              color="whiteAlpha.900"
              fontSize="sm"
              fontWeight="bold"
              textAlign="center"
            >
              {t('Grading System')}
            </Text>
            <Grid
              templateColumns={{ base: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }}
              gap={2}
              w="full"
            >
              {[
                { grade: 'S+', range: '90-100%', color: 'purple' },
                { grade: 'S', range: '80-89%', color: 'green' },
                { grade: 'A', range: '70-79%', color: 'blue' },
                { grade: 'B', range: '60-69%', color: 'yellow' },
                { grade: 'C', range: '<60%', color: 'red' },
              ].map(({ grade, range, color }) => (
                <Badge
                  key={grade}
                  colorScheme={color}
                  variant="subtle"
                  fontSize="xs"
                  px={2}
                  py={1}
                  textAlign="center"
                  borderRadius="md"
                >
                  {grade}: {range}
                </Badge>
              ))}
            </Grid>
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
})

BattleSummaryMetrics.displayName = 'BattleSummaryMetrics'
export default BattleSummaryMetrics
