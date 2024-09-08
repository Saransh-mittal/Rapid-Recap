// components/tournamentComponents/PreviousTournamentLeaderboard.js
import { Box, Heading, Alert, AlertIcon } from '@chakra-ui/react'
import { Crown } from 'lucide-react'
import LeaderboardTable from './LeaderboardTable'

const PreviousTournamentLeaderboard = ({ previousTournamentData }) => {
  return (
    <Box
      bg="rgba(0, 0, 0, 0.2)"
      backdropFilter="blur(10px)"
      borderRadius="lg"
      p={6}
      boxShadow="0 8px 32px rgba(31, 38, 135, 0.37)"
    >
      <Heading size="lg" mb={4} display="flex" alignItems="center">
        <Crown color="#C0C0C0" style={{ marginRight: '0.5rem' }} />
        Previous Tournament Leaderboard
      </Heading>
      {previousTournamentData ? (
        <LeaderboardTable
          data={previousTournamentData.participants.slice(0, 5)}
        />
      ) : (
        <Alert status="info" color="black">
          <AlertIcon />
          No previous tournament data available.
        </Alert>
      )}
    </Box>
  )
}

export default PreviousTournamentLeaderboard
