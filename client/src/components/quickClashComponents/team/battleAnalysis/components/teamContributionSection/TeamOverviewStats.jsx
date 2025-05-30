// components/quickClashComponents/team/battleAnalysis/components/TeamOverviewStats.jsx
import React from 'react'
import { Box, Text, Icon, HStack, VStack, Grid } from '@chakra-ui/react'
import { Shield, Flame } from 'lucide-react'

const TeamOverviewStats = React.memo(({ teamData, isExpanded, config, t }) => {
  if (
    !(
      teamData.userTeamMembers.length > 0 ||
      teamData.opponentTeamMembers.length > 0
    )
  ) {
    return null
  }

  const teamsToShow = [
    {
      name: teamData.userTeamName,
      totalScore: teamData.userTeamTotalScore,
      wins: teamData.userTeamWins,
      active: teamData.userTeamStats.completionCount,
      membersCount: teamData.userTeamMembers.length,
      icon: Shield,
      colorScheme: 'blue',
      show: teamData.userTeamMembers.length > 0,
    },
    {
      name: teamData.opponentTeamName,
      totalScore: teamData.opponentTeamTotalScore,
      wins: teamData.opponentTeamWins,
      active: teamData.opponentTeamStats.completionCount,
      membersCount: teamData.opponentTeamMembers.length,
      icon: Flame,
      colorScheme: 'red',
      show: teamData.opponentTeamMembers.length > 0,
    },
  ].filter(team => team.show)

  return (
    <Box
      p={config.padding}
      bg="rgba(255,255,255,0.02)"
      borderBottom={isExpanded ? '1px solid rgba(255,255,255,0.08)' : '0'}
    >
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={3}>
        {teamsToShow.map(team => (
          <Box
            key={team.name}
            bg={`rgba(${
              team.colorScheme === 'blue' ? '59,130,246' : '239,68,68'
            }, 0.08)`}
            borderRadius="lg"
            p={3}
            border="1px solid"
            borderColor={`rgba(${
              team.colorScheme === 'blue' ? '59,130,246' : '239,68,68'
            }, 0.2)`}
          >
            <VStack spacing={2}>
              <HStack>
                <Icon
                  as={team.icon}
                  color={`${team.colorScheme}.400`}
                  boxSize={4}
                />
                <Text
                  color={`${team.colorScheme}.300`}
                  fontWeight="bold"
                  fontSize="sm"
                  noOfLines={1}
                >
                  {team.name}
                </Text>
              </HStack>
              <HStack spacing={3} justify="space-around" w="full">
                <VStack spacing={0}>
                  <Text fontSize="md" fontWeight="bold" color="white">
                    {team.totalScore || 0}
                  </Text>
                  <Text fontSize="3xs" color="whiteAlpha.600">
                    {t('Points')}
                  </Text>
                </VStack>
                <VStack spacing={0}>
                  <Text fontSize="md" fontWeight="bold" color="white">
                    {team.wins || 0}
                  </Text>
                  <Text fontSize="3xs" color="whiteAlpha.600">
                    {t('Wins')}
                  </Text>
                </VStack>
                <VStack spacing={0}>
                  <Text fontSize="md" fontWeight="bold" color="white">
                    {team.active || 0}/{team.membersCount || 0}
                  </Text>
                  <Text fontSize="3xs" color="whiteAlpha.600">
                    {t('Active')}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Box>
        ))}
      </Grid>
    </Box>
  )
})

TeamOverviewStats.displayName = 'TeamOverviewStats'
export default TeamOverviewStats
