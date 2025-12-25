// components/quickClashComponents/team/battleAnalysis/components/TeamOverviewStats.jsx
import React from 'react'
import { Box, Text, Icon, HStack, VStack, Grid, Circle, Badge } from '@chakra-ui/react'
import { Shield, Flame, Trophy, Users, Zap } from 'lucide-react'

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
      colorScheme: 'cyan',
      gradient: 'linear(to-br, cyan.600, blue.700)',
      glowColor: 'rgba(6, 182, 212, 0.3)',
      borderColor: 'cyan.400',
      show: teamData.userTeamMembers.length > 0,
      isUser: true,
    },
    {
      name: teamData.opponentTeamName,
      totalScore: teamData.opponentTeamTotalScore,
      wins: teamData.opponentTeamWins,
      active: teamData.opponentTeamStats.completionCount,
      membersCount: teamData.opponentTeamMembers.length,
      icon: Flame,
      colorScheme: 'red',
      gradient: 'linear(to-br, red.600, orange.700)',
      glowColor: 'rgba(248, 113, 113, 0.25)',
      borderColor: 'red.400',
      show: teamData.opponentTeamMembers.length > 0,
      isUser: false,
    },
  ].filter(team => team.show)

  const StatBox = ({ value, label, icon: StatIcon, color }) => (
    <VStack spacing={0}>
      <HStack spacing={1}>
        <Icon as={StatIcon} color={color} boxSize={3} />
        <Text fontSize="xl" fontWeight="extrabold" color="white">
          {value}
        </Text>
      </HStack>
      <Text fontSize="2xs" color="whiteAlpha.700" fontWeight="medium" textTransform="uppercase">
        {label}
      </Text>
    </VStack>
  )

  return (
    <Box
      p={config.padding}
      position="relative"
      borderBottom={isExpanded ? '1px solid rgba(6, 182, 212, 0.2)' : '0'}
    >
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
        {teamsToShow.map(team => (
          <Box
            key={team.name}
            position="relative"
            overflow="hidden"
            borderRadius="xl"
            bgGradient={team.gradient}
            p={4}
            border="2px solid"
            borderColor={team.borderColor}
            boxShadow={`0 0 25px ${team.glowColor}, inset 0 1px 0 rgba(255,255,255,0.15)`}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: `0 0 35px ${team.glowColor}, 0 8px 25px rgba(0,0,0,0.3)`,
            }}
            transition="all 0.3s ease"
            cursor="pointer"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
              borderRadius: 'xl xl 0 0',
              pointerEvents: 'none',
            }}
          >
            <VStack spacing={3} position="relative" zIndex={1}>
              {/* Team Name Header */}
              <HStack spacing={2} justify="center">
                <Circle
                  size="28px"
                  bg="whiteAlpha.200"
                  border="1px solid"
                  borderColor="whiteAlpha.400"
                >
                  <Icon
                    as={team.icon}
                    color="white"
                    boxSize={4}
                    filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
                  />
                </Circle>
                <Text
                  color="white"
                  fontWeight="bold"
                  fontSize="md"
                  noOfLines={1}
                  textShadow="0 1px 3px rgba(0,0,0,0.3)"
                >
                  {team.name}
                </Text>
                {team.isUser && (
                  <Badge
                    bg="whiteAlpha.200"
                    color="white"
                    fontSize="2xs"
                    px={2}
                    borderRadius="full"
                  >
                    YOU
                  </Badge>
                )}
              </HStack>

              {/* Stats Row */}
              <HStack spacing={6} justify="center" w="full">
                <StatBox
                  value={team.totalScore || 0}
                  label={t('Points')}
                  icon={Trophy}
                  color="yellow.300"
                />
                <Box w="1px" h="30px" bg="whiteAlpha.300" />
                <StatBox
                  value={team.wins || 0}
                  label={t('Wins')}
                  icon={Zap}
                  color="green.300"
                />
                <Box w="1px" h="30px" bg="whiteAlpha.300" />
                <StatBox
                  value={`${team.active || 0}/${team.membersCount || 0}`}
                  label={t('Active')}
                  icon={Users}
                  color="blue.200"
                />
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
