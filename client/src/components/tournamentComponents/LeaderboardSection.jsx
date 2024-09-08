// components/tournamentComponents/LeaderboardSection.js
import { VStack, Heading, Button, Alert, AlertIcon } from '@chakra-ui/react'
import LeaderboardTable from './LeaderboardTable'
import { Trophy } from 'lucide-react'

const LeaderboardSection = ({ tournamentData, registrationStatus }) => {
  return (
    <>
      {tournamentData.status === 'ongoing' && (
        <>
          <Heading size="lg" mb={4} display="flex" alignItems="center">
            <Trophy color="#ECC94B" style={{ marginRight: '0.5rem' }} />
            Tournament in Progress
          </Heading>
          {registrationStatus === 'registered' ? (
            <VStack spacing={4} align="stretch">
              <Alert status="success" color="black">
                <AlertIcon />
                You're registered for the tournament!
              </Alert>
              <Button
                colorScheme="pink"
                size="lg"
                onClick={() => console.log('Enter tournament')}
                boxShadow="0 0 15px rgba(237, 100, 166, 0.5)"
                _hover={{
                  boxShadow: '0 0 20px rgba(237, 100, 166, 0.7)',
                }}
              >
                Enter Tournament
              </Button>
            </VStack>
          ) : (
            <Alert status="warning" color="black">
              <AlertIcon />
              You are not registered for this tournament.
            </Alert>
          )}
        </>
      )}
      {tournamentData.status === 'completed' && (
        <>
          <Heading size="lg" mb={4}>
            Tournament Completed
          </Heading>
          <Alert status="info" color="black">
            <AlertIcon />
            This tournament has ended. Check out the results below!
          </Alert>
          <LeaderboardTable data={tournamentData.participants.slice(0, 5)} />
        </>
      )}
    </>
  )
}

export default LeaderboardSection
