// components/quickClashComponents/team/teamBattlePageComponents/TeamsGrid.jsx
import React, { memo, useMemo } from 'react'
import { Box, VStack, useBreakpointValue } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import TeamCard from './teamsGrid/TeamCard'
import VSSection from './teamsGrid/VSSection'

/**
 * TeamsGrid Component (Animations Removed)
 */
const TeamsGrid = memo(({ currentBattle, userTeam, userId }) => {
  const { t } = useTranslation('QuickClash')

  // Responsive values
  const containerPadding = useBreakpointValue({ base: 2, sm: 3, md: 4, lg: 8 })
  const vsSpacing = useBreakpointValue({ base: '8px', md: '12px', lg: '16px' })
  const vsSectionEffectiveWidth = useBreakpointValue({
    base: '70px',
    md: '90px',
    lg: '120px',
  })
  const gapValue = useBreakpointValue({ base: 1, md: 2, lg: 3 })

  // Calculate responsive gaps
  const gapSizeToPx = themeSpaceUnit => themeSpaceUnit * 4
  const totalGapWidthInPx = useBreakpointValue({
    base: gapSizeToPx(1) * 2,
    md: gapSizeToPx(2) * 2,
    lg: gapSizeToPx(3) * 2,
  })
  const cardMaxWidth = `calc((100% - ${vsSectionEffectiveWidth} - ${totalGapWidthInPx}px) / 2)`

  // Memoize team arrangements (user's team always on left)
  const { leftTeam, rightTeam } = useMemo(() => {
    if (!currentBattle) {
      return {
        leftTeam: {
          data: null,
          members: [],
          wins: 0,
          type: 'teamA',
          isUserTeam: false,
          avgTrophies: 0,
          formationInfo: null,
        },
        rightTeam: {
          data: null,
          members: [],
          wins: 0,
          type: 'teamB',
          isUserTeam: false,
          avgTrophies: 0,
          formationInfo: null,
        },
      }
    }

    const isUserTeamA = userTeam === 'teamA'
    const isUserTeamB = userTeam === 'teamB'

    const teamAData = {
      data: currentBattle.teamA || {
        name: t('Team A'),
        avgTrophies: 0,
        formationInfo: { isAutoFormed: true },
      },
      members: currentBattle.teamAMembers || [],
      wins: currentBattle.teamAWins || 0,
      avgTrophies: currentBattle.teamA?.avgTrophies,
      formationInfo: currentBattle.teamA?.formationInfo,
      type: 'teamA',
      isUserTeam: isUserTeamA,
    }

    const teamBData = {
      data: currentBattle.teamB || {
        name: t('Team B'),
        avgTrophies: 0,
        formationInfo: { isAutoFormed: true },
      },
      members: currentBattle.teamBMembers || [],
      wins: currentBattle.teamBWins || 0,
      avgTrophies: currentBattle.teamB?.avgTrophies,
      formationInfo: currentBattle.teamB?.formationInfo,
      type: 'teamB',
      isUserTeam: isUserTeamB,
    }

    if (isUserTeamA) return { leftTeam: teamAData, rightTeam: teamBData }
    if (isUserTeamB) return { leftTeam: teamBData, rightTeam: teamAData }
    // Default: if user is not in either team (spectator), show A on left, B on right
    return { leftTeam: teamAData, rightTeam: teamBData }
  }, [currentBattle, userTeam, t])

  return (
    <Box mx={containerPadding} mb={{ base: 4, md: 6 }} px={{ base: 1, md: 0 }}>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="stretch"
        justifyContent="space-between"
        gap={gapValue}
        width="100%"
      >
        {/* Left Team */}
        <VStack
          spacing={0}
          align="stretch"
          flexGrow={1}
          flexShrink={1}
          flexBasis="0%"
          maxW={cardMaxWidth}
          minWidth="0"
        >
          <TeamCard team={leftTeam} position="left" userId={userId} />
        </VStack>

        {/* VS Section */}
        <VSSection
          leftTeam={leftTeam}
          rightTeam={rightTeam}
          vsSectionEffectiveWidth={vsSectionEffectiveWidth}
          vsSpacing={vsSpacing}
        />

        {/* Right Team */}
        <VStack
          spacing={0}
          align="stretch"
          flexGrow={1}
          flexShrink={1}
          flexBasis="0%"
          maxW={cardMaxWidth}
          minWidth="0"
          mr={'-0.65rem'}
        >
          <TeamCard team={rightTeam} position="right" userId={userId} />
        </VStack>
      </Box>
    </Box>
  )
})

TeamsGrid.displayName = 'TeamsGrid'

export default TeamsGrid
