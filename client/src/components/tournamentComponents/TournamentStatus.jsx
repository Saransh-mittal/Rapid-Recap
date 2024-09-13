import React from 'react'
import {
  VStack,
  Alert,
  AlertIcon,
  Heading,
  Text,
  Flex,
  Button,
} from '@chakra-ui/react'
import { Clock, Trophy, UserCheck, UserPlus } from 'lucide-react'
import RegisteredUsersCount from './RegisteredUsersCount'
import { useSelector } from 'react-redux'

const TournamentStatus = ({ tournamentData, registrationStatus }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth)
  return (
    <>
      {tournamentData?.status === 'upcoming' && (
        <VStack spacing={6} align="stretch">
          <Heading
            size="lg"
            mb={4}
            display="flex"
            alignItems="center"
            fontSize={{ base: 'lg', md: 'xl' }}
          >
            <Clock color="#4FD1C5" style={{ marginRight: '0.5rem' }} />
            Tournament Starting Soon
          </Heading>
          <Flex
            direction="column"
            align="center"
            justify="center"
            borderRadius="md"
            p={4}
            fontSize="sm"
            fontWeight="semibold"
            bg={registrationStatus === 'registered' ? 'green.100' : 'blue.100'}
            color={
              registrationStatus === 'registered' ? 'green.800' : 'blue.800'
            }
            borderColor={
              registrationStatus === 'registered' ? 'green.500' : 'blue.500'
            }
            borderWidth="1px"
            wordBreak="break-word"
          >
            {!isAuthenticated ? (
              <Text>
                To join the Rapid Recap tournament, please log in with a
                verified email.
              </Text>
            ) : user?.role === 'guest' ? (
              <Text>
                Guest users are not allowed to participate in the tournament.
                Please register to participate.
              </Text>
            ) : registrationStatus === 'registered' ? (
              <Flex align="center">
                <UserCheck style={{ marginRight: '0.5rem' }} size={16} />
                <Text>You're registered! Get ready for the tournament.</Text>
              </Flex>
            ) : (
              <>
                <Flex align="center">
                  <UserPlus className="mr-2" size={16} />
                  <Text>You have not registered for the tournament!</Text>
                </Flex>
                <Text mt={2} color="gray.600" textAlign="center">
                  Don’t miss out on future tournaments! Register on time to
                  secure your spot in the upcoming competitions.
                </Text>
              </>
            )}
          </Flex>
          <RegisteredUsersCount count={tournamentData?.registeredCount} />
        </VStack>
      )}
      {tournamentData?.status === 'ongoing' && (
        <VStack spacing={6} align="stretch">
          <Heading size="lg" mb={4} display="flex" alignItems="center">
            <Trophy color="#ECC94B" style={{ marginRight: '0.5rem' }} />
            Tournament in Progress
          </Heading>
        </VStack>
      )}{' '}
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
