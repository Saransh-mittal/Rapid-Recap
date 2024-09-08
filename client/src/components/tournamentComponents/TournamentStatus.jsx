import { VStack, Alert, AlertIcon, Heading, Button } from '@chakra-ui/react'
import { Trophy } from 'lucide-react'

const TournamentStatus = ({
  tournamentData,
  registrationStatus,
  handleEnterTournament,
}) => {
  return (
    <>
      {tournamentData?.status === 'upcoming' && (
        <>
          <Heading size="lg" mb={4}>
            Tournament Starting Soon
          </Heading>
          <Alert status="info" color="black">
            <AlertIcon />
            The tournament will begin shortly. Get ready!
          </Alert>
        </>
      )}
      {tournamentData?.status === 'ongoing' && (
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
                onClick={handleEnterTournament}
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
      {tournamentData?.status === 'completed' && (
        <>
          <Heading size="lg" mb={4}>
            Tournament Completed
          </Heading>
          <Alert status="info" color="black">
            <AlertIcon />
            This tournament has ended. Check out the results below!
          </Alert>
        </>
      )}
    </>
  )
}

export default TournamentStatus
