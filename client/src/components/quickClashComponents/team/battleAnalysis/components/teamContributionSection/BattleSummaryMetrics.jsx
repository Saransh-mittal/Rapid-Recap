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
  Flex,
} from '@chakra-ui/react'
import { Award, TrendingUp, Users, Target } from 'lucide-react'

const BattleSummaryMetrics = React.memo(({ userTeamStats, t }) => {
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
      color: 'purple',
      borderColor: 'rgba(168, 85, 247, 0.5)',
      iconBg: 'rgba(168, 85, 247, 0.2)',
      icon: Award,
      grade: teamGrade.grade,
    },
    {
      labelKey: 'Teamwork',
      value: `${Math.round(userTeamStats.teamwork)}%`,
      color: 'green',
      borderColor: 'rgba(34, 197, 94, 0.5)',
      iconBg: 'rgba(34, 197, 94, 0.2)',
      icon: Users,
    },
    {
      labelKey: 'Consistency',
      value: `${Math.round(userTeamStats.consistency)}%`,
      color: 'blue',
      borderColor: 'rgba(59, 130, 246, 0.5)',
      iconBg: 'rgba(59, 130, 246, 0.2)',
      icon: Target,
    },
    {
      labelKey: 'Avg Score',
      value: `${Math.round(userTeamStats.avgScore)}`,
      color: 'yellow',
      borderColor: 'rgba(234, 179, 8, 0.5)',
      iconBg: 'rgba(234, 179, 8, 0.2)',
      icon: TrendingUp,
    },
  ]

  return (
    <Box
      mt={6}
      p={4}
      bg="transparent"
      borderRadius="xl"
      border="1px solid"
      borderColor="rgba(6, 182, 212, 0.3)"
      position="relative"
      overflow="hidden"
    >
      {/* Subtle gradient overlay synced with background */}
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(135deg, rgba(6, 182, 212, 0.05) 0%, transparent 50%, rgba(168, 85, 247, 0.03) 100%)"
        pointerEvents="none"
        borderRadius="xl"
      />

      <VStack spacing={4} position="relative" zIndex={1}>
        {/* Header */}
        <Flex
          justify="space-between"
          align="center"
          w="full"
          wrap="wrap"
          gap={2}
        >
          <HStack spacing={2}>
            <Icon as={Award} color="purple.400" boxSize={5} />
            <Heading size={{ base: 'sm', md: 'md' }} color="white">
              {t('Team Battle Summary')}
            </Heading>
          </HStack>
          <Badge
            colorScheme={teamGrade.color}
            variant="solid"
            fontSize="xs"
            px={3}
            py={1}
            borderRadius="full"
            fontWeight="bold"
          >
            {t('Team Grade')}: {teamGrade.grade}
          </Badge>
        </Flex>

        {/* Metrics Grid - Fixed 2x2 on mobile, 4 columns on desktop */}
        <Grid
          templateColumns={{
            base: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          }}
          gap={3}
          w="full"
        >
          {metrics.map(item => (
            <VStack
              key={item.labelKey}
              bg="transparent"
              p={3}
              borderRadius="lg"
              border="1px solid"
              borderColor={item.borderColor}
              spacing={2}
              _hover={{
                bg: 'rgba(255,255,255,0.03)',
                borderColor: `${item.color}.400`,
              }}
              transition="all 0.2s ease"
            >
              <Box
                p={2}
                borderRadius="lg"
                bg={item.iconBg}
              >
                <Icon
                  as={item.icon}
                  color={`${item.color}.400`}
                  boxSize={5}
                />
              </Box>
              <Text
                color={`${item.color}.300`}
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
              {item.grade && (
                <Badge
                  colorScheme={teamGrade.color}
                  variant="outline"
                  fontSize="2xs"
                  px={2}
                  py={0.5}
                >
                  {item.grade}
                </Badge>
              )}
            </VStack>
          ))}
        </Grid>

        {/* Grading System - Compact horizontal layout */}
        <Box
          w="full"
          p={3}
          bg="rgba(6, 182, 212, 0.03)"
          borderRadius="lg"
          border="1px solid"
          borderColor="rgba(6, 182, 212, 0.2)"
        >
          <VStack spacing={2}>
            <Text
              color="whiteAlpha.800"
              fontSize="xs"
              fontWeight="bold"
              textAlign="center"
            >
              {t('Grading System')}
            </Text>
            <HStack spacing={2} wrap="wrap" justify="center">
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
                  fontSize="2xs"
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  {grade}: {range}
                </Badge>
              ))}
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
})

BattleSummaryMetrics.displayName = 'BattleSummaryMetrics'
export default BattleSummaryMetrics
