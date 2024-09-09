import React from 'react'
import { VStack, Alert, AlertIcon, Heading } from '@chakra-ui/react'
import { Clock } from 'lucide-react'
import RegisteredUsersCount from './RegisteredUsersCount'

const TournamentStatus = ({ tournamentData }) => {
  return (
    <>
      {tournamentData?.status === 'upcoming' && (
        <VStack spacing={6} align="stretch">
          <Heading size="lg" mb={4} display="flex" alignItems="center">
            <Clock color="#4FD1C5" style={{ marginRight: '0.5rem' }} />
            Tournament Starting Soon
          </Heading>
          <Alert status="info" borderRadius="md" bg="blue.700" color="white">
            <AlertIcon color="blue.200" />
            The tournament will begin shortly. Get ready!
          </Alert>
          <RegisteredUsersCount count={tournamentData.registeredCount} />
        </VStack>
      )}
      {tournamentData?.status === 'completed' && (
        <VStack spacing={6} align="stretch">
          <Heading size={{ base: 'md', md: 'lg' }} mb={4}>
            Tournament Completed
          </Heading>
          <Alert status="info" borderRadius="md" bg="blue.700" color="white">
            <AlertIcon color="blue.200" />
            This tournament has ended. Check out the results below!
          </Alert>
        </VStack>
      )}
    </>
  )
}

export default TournamentStatus
