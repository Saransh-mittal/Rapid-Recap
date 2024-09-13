import React, { useMemo, lazy, Suspense } from 'react'
import { VStack, Alert, AlertIcon, Heading, Text, Flex } from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { Clock, UserCheck, UserPlus, Trophy } from 'lucide-react'

// Lazy load RegisteredUsersCount component
const RegisteredUsersCount = lazy(() => import('./RegisteredUsersCount'))

const TournamentStatus = ({ tournamentData, registrationStatus }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth)

  // Memoize the tournament status to avoid re-renders when not required
  const status = useMemo(() => tournamentData?.status, [tournamentData?.status])

  const registeredCount = useMemo(
    () => tournamentData?.registeredCount,
    [tournamentData?.registeredCount],
  )

  return (
    <>
      {status === 'upcoming' && (
        <VStack spacing={6} align="stretch">
          <Heading
            size="lg"
            mb={4}
            display="flex"
            alignItems="center"
            fontSize={{ base: 'lg', md: 'xl' }}
          >
            <Suspense fallback={<div>Loading...</div>}>
              <Clock color="#4FD1C5" style={{ marginRight: '0.5rem' }} />
            </Suspense>
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
                <Suspense fallback={<div>Loading...</div>}>
                  <UserCheck style={{ marginRight: '0.5rem' }} size={16} />
                </Suspense>
                <Text>You're registered! Get ready for the tournament.</Text>
              </Flex>
            ) : (
              <>
                <Flex align="center">
                  <Suspense fallback={<div>Loading...</div>}>
                    <UserPlus className="mr-2" size={16} />
                  </Suspense>
                  <Text>You have not registered for the tournament!</Text>
                </Flex>
                <Text mt={2} color="gray.600" textAlign="center">
                  Don’t miss out on future tournaments! Register on time to
                  secure your spot in the upcoming competitions.
                </Text>
              </>
            )}
          </Flex>
          <Suspense fallback={<div>Loading...</div>}>
            <RegisteredUsersCount count={registeredCount} />
          </Suspense>
        </VStack>
      )}
      {status === 'ongoing' && (
        <VStack spacing={6} align="stretch">
          <Heading size="lg" mb={4} display="flex" alignItems="center">
            <Suspense fallback={<div>Loading...</div>}>
              <Trophy color="#ECC94B" style={{ marginRight: '0.5rem' }} />
            </Suspense>
            Tournament in Progress
          </Heading>
        </VStack>
      )}
      {status === 'completed' && (
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

export default React.memo(TournamentStatus)
