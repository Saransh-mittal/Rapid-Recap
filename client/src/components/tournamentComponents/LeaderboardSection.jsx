import React from 'react'
import { VStack, Heading, Box } from '@chakra-ui/react'
import { Trophy } from 'lucide-react'
import LeaderboardTable from './LeaderboardTable'

const LeaderboardSection = ({ tournamentData }) => {
  const leaderboardData = tournamentData.leaderboard || []
  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" display="flex" alignItems="center">
        <Trophy color="#ECC94B" style={{ marginRight: '0.5rem' }} />
        Current Leaderboard
      </Heading>
      <Box>
        <LeaderboardTable data={leaderboardData} />
      </Box>
    </VStack>
  )
}

export default LeaderboardSection
