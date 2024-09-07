import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Text,
  Heading,
  Button,
  Container,
  Flex,
  Alert,
  AlertIcon,
  useToast,
  Skeleton,
  Center,
  Progress,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Trophy, Star, Clock, Crown, Calendar } from 'lucide-react'
import axios from 'axios'

import RegistrationForm from '../components/tournamentComponents/RegistrationForm'
import LeaderboardTable from '../components/tournamentComponents/LeaderboardTable'

const MotionBox = motion(Box)

const Tournament = () => {
  const [tournamentData, setTournamentData] = useState(null)
  const [previousTournamentData, setPreviousTournamentData] = useState(null)
  const [isFetching, setIsFetching] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState('not-registered')
  const [userDetails, setUserDetails] = useState(null)

  const fetchTournamentData = async () => {
    setIsFetching(true)
    try {
      const [latestResponse, previousResponse] = await Promise.all([
        axios.get('/api/tournament/latest'),
        axios.get('/api/tournament/previous'),
      ])

      setTournamentData(latestResponse.data)
      setPreviousTournamentData(previousResponse.data)

      setIsFetching(false)
    } catch (error) {
      console.error(error)
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchTournamentData()
  }, [])

  const handleRegister = details => {
    setUserDetails(details)
    setRegistrationStatus('registered')
  }

  const renderTournamentContent = () => {
    if (isFetching) {
      return (
        <VStack spacing={4} width="100%">
          <Skeleton height="40px" width="100%" />
          <Skeleton height="20px" width="80%" />
          <Skeleton height="20px" width="90%" />
          <Skeleton height="20px" width="70%" />
          <Skeleton height="40px" width="60%" />
        </VStack>
      )
    }

    if (!tournamentData && !previousTournamentData) {
      return (
        <Center height="300px">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
          >
            <Heading as="h2" size="xl" mb={4} color="pink.400">
              No Tournament Data Available
            </Heading>
            <Text fontSize="xl" color="gray.300">
              Stay tuned for upcoming tournaments!
            </Text>
          </MotionBox>
        </Center>
      )
    }

    const renderPreviousTournamentLeaderboard = () => (
      <VStack spacing={4} align="stretch">
        <Heading size="lg" mb={4} display="flex" alignItems="center">
          <Trophy color="#ECC94B" style={{ marginRight: '0.5rem' }} />
          Previous Tournament Results
        </Heading>
        <Text fontSize="xl">
          Tournament ended:{' '}
          {new Date(previousTournamentData.endDate).toLocaleDateString()}
        </Text>
        <LeaderboardTable
          data={previousTournamentData.participants.slice(0, 5)}
        />
      </VStack>
    )

    if (!tournamentData || tournamentData.status === 'completed') {
      return (
        <>
          {renderPreviousTournamentLeaderboard()}
          <Alert status="info" color="black" mt={4}>
            <AlertIcon />
            The next tournament registration will open soon. Stay tuned!
          </Alert>
        </>
      )
    }

    switch (tournamentData.status) {
      case 'registration':
        return (
          <>
            <VStack spacing={4} align="stretch">
              <Heading size="lg" mb={4} display="flex" alignItems="center">
                <Calendar color="#ECC94B" style={{ marginRight: '0.5rem' }} />
                Tournament Registration Open
              </Heading>
              {renderTimeInfo()}
              {registrationStatus === 'registered' ? (
                <Alert status="success" color="black">
                  <AlertIcon />
                  You're registered for the tournament!
                </Alert>
              ) : (
                <RegistrationForm onRegister={handleRegister} />
              )}
            </VStack>
            {previousTournamentData && (
              <Box mt={8}>{renderPreviousTournamentLeaderboard()}</Box>
            )}
          </>
        )
      case 'upcoming':
        return (
          <>
            <VStack spacing={4} align="stretch">
              <Heading size="lg" mb={4} display="flex" alignItems="center">
                <Trophy color="#ECC94B" style={{ marginRight: '0.5rem' }} />
                Tournament Starting Soon
              </Heading>
              {renderTimeInfo()}
              <Text fontSize="xl">
                Get ready! The tournament will begin shortly.
              </Text>
              {registrationStatus === 'registered' ? (
                <Alert status="info" color="black">
                  <AlertIcon />
                  You're registered and ready to participate!
                </Alert>
              ) : (
                <Alert status="warning" color="black">
                  <AlertIcon />
                  Registration has closed. You won't be able to participate in
                  this tournament.
                </Alert>
              )}
            </VStack>
            {previousTournamentData && (
              <Box mt={8}>{renderPreviousTournamentLeaderboard()}</Box>
            )}
          </>
        )
      case 'ongoing':
        return (
          <VStack spacing={4} align="stretch">
            <Heading size="lg" mb={4} display="flex" alignItems="center">
              <Trophy color="#ECC94B" style={{ marginRight: '0.5rem' }} />
              Tournament in Progress
            </Heading>
            {renderTimeInfo()}
            {registrationStatus === 'registered' ? (
              <>
                <Alert status="success" color="black">
                  <AlertIcon />
                  You're participating in the tournament!
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
              </>
            ) : (
              <Alert status="warning" color="black">
                <AlertIcon />
                You are not registered for this tournament.
              </Alert>
            )}
          </VStack>
        )
      default:
        return null
    }
  }

  return (
    <Box color="white" mt={{ base: 4, md: 8 }} minHeight="100vh">
      <Container maxW="container.xl" py={16}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Heading as="h1" size="2xl" mb={8} textAlign="center">
            Rapid Recap Tournament
          </Heading>
        </MotionBox>

        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
          <MotionBox
            flex={1}
            rounded="lg"
            shadow="2xl"
            p={6}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            bg="rgba(0, 0, 0, 0.1)"
            backdropFilter="blur(5px)"
          >
            {renderTournamentContent()}
          </MotionBox>

          <MotionBox
            flex={1}
            rounded="lg"
            shadow="2xl"
            p={6}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            bg="rgba(0, 0, 0, 0.1)"
            backdropFilter="blur(5px)"
          >
            <Heading size="lg" mb={4}>
              Epic Quest Guide
            </Heading>
            <VStack align="start" spacing={4}>
              {[
                { icon: Star, text: 'Conquer epic knowledge realms!' },
                { icon: Clock, text: '48-hour quest window awaits' },
                { icon: Trophy, text: 'Ascend ranks, claim glory' },
                { icon: Crown, text: 'Master the Current Affairs challenge' },
              ].map((instruction, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  display="flex"
                  alignItems="center"
                >
                  <Box as={instruction.icon} mr={2} color="pink.400" />
                  <Text
                    fontSize={{ base: 'md', md: 'lg' }}
                    fontWeight="semibold"
                  >
                    {instruction.text}
                  </Text>
                </MotionBox>
              ))}
            </VStack>
          </MotionBox>
        </Flex>
      </Container>
    </Box>
  )
}

export default Tournament
