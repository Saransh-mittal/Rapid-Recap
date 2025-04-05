// components/quickClashComponents/team/TeamsGrid.jsx
import React from 'react'
import { Grid, Flex, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import TeamSection from './TeamSection'

const MotionFlex = motion(Flex)

/**
 * Component to display both teams with a "VS" separator
 */
const TeamsGrid = ({ currentBattle, userTeam, userId, variants }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Grid templateColumns={{ base: '1fr', md: '1fr auto 1fr' }} gap={4} mb={6}>
      {/* Team A */}
      <TeamSection
        team={currentBattle.teamA}
        teamName={currentBattle.teamA?.name}
        teamType="teamA"
        members={currentBattle.teamAMembers}
        wins={currentBattle.teamAWins}
        userTeam={userTeam}
        userId={userId}
        variants={variants}
      />

      {/* VS Section */}
      <MotionFlex
        variants={variants}
        display={{ base: 'none', md: 'flex' }}
        align="center"
        justify="center"
        p={4}
      >
        <Text fontSize="2xl" fontWeight="bold" color="whiteAlpha.700">
          VS
        </Text>
      </MotionFlex>

      {/* Team B */}
      <TeamSection
        team={currentBattle.teamB}
        teamName={currentBattle.teamB?.name}
        teamType="teamB"
        members={currentBattle.teamBMembers}
        wins={currentBattle.teamBWins}
        userTeam={userTeam}
        userId={userId}
        variants={variants}
      />
    </Grid>
  )
}

export default TeamsGrid
