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
  Skeleton,
  Center,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Star,
  Clock,
  Crown,
  Calendar,
  Clipboard,
  History,
  Scroll,
} from 'lucide-react'
import axios from 'axios'

import RegistrationForm from '../components/tournamentComponents/RegistrationForm'
import LeaderboardTable from '../components/tournamentComponents/LeaderboardTable'
import {
  mockPreviousTournamentData,
  mockTournamentData,
} from '../components/tournamentComponents/mockData'

const MotionBox = motion(Box)
const MotionTab = motion(Tab)

const Tournament = () => {
  const [tournamentData, setTournamentData] = useState(null)
  const [previousTournamentData, setPreviousTournamentData] = useState(null)
  const [isFetching, setIsFetching] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState('not-registered')
  const [userDetails, setUserDetails] = useState(null)

  const fetchTournamentData = async () => {
    setIsFetching(true)
    try {
      // Simulating API call with setTimeout
      setTimeout(() => {
        setTournamentData(mockTournamentData.registration)
        setPreviousTournamentData(mockPreviousTournamentData)
        setIsFetching(false)
      }, 1000)
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

  const renderTimeInfo = () => {
    if (!tournamentData) return null

    const startDate = new Date(tournamentData.startDate)
    const endDate = new Date(tournamentData.endDate)

    return (
      <VStack spacing={4} align="stretch">
        <HStack spacing={4} justify="center">
          <Box
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            as={MotionBox}
          >
            <VStack
              bg="rgba(237, 100, 166, 0.1)"
              p={4}
              rounded="lg"
              shadow="md"
              borderWidth={1}
              borderColor="pink.400"
            >
              <Text fontSize="sm" fontWeight="bold" color="pink.400">
                Starts
              </Text>
              <Text
                fontSize="xl"
                fontWeight="bold"
                w={'85px'}
                textAlign={'center'}
              >
                {startDate.toLocaleDateString()}
              </Text>
              <Text fontSize="md">{startDate.toLocaleTimeString()}</Text>
            </VStack>
          </Box>
          <Box
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            as={MotionBox}
          >
            <VStack
              bg="rgba(237, 100, 166, 0.1)"
              p={4}
              rounded="lg"
              shadow="md"
              borderWidth={1}
              borderColor="pink.400"
            >
              <Text fontSize="sm" fontWeight="bold" color="pink.400">
                Ends
              </Text>
              <Text fontSize="xl" fontWeight="bold">
                {endDate.toLocaleDateString()}
              </Text>
              <Text fontSize="md">{endDate.toLocaleTimeString()}</Text>
            </VStack>
          </Box>
        </HStack>
        <Box
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          as={MotionBox}
        >
          <Text
            fontSize="lg"
            textAlign="center"
            fontStyle="italic"
            color="gray.300"
            my={{ base: 6, md: 0 }}
          >
            Join the epic quest for{' '}
            {Math.ceil((endDate - startDate) / (1000 * 60 * 60))} hours of
            glory!
          </Text>
        </Box>
      </VStack>
    )
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
          <Box
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
            as={MotionBox}
          >
            <Heading as="h2" size="xl" mb={4} color="pink.400">
              No Tournament Data Available
            </Heading>
            <Text fontSize="xl" color="gray.300">
              Stay tuned for upcoming tournaments!
            </Text>
          </Box>
        </Center>
      )
    }

    return (
      <Tabs isFitted variant="soft-rounded" colorScheme="pink">
        <TabList mb="1em" justifyContent={'center'}>
          <MotionTab
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            bg="rgba(237, 100, 166, 0.1)"
            _selected={{ bg: 'pink.500', color: 'white' }}
            borderRadius="full"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            fontSize="lg"
            fontWeight="bold"
            py={3}
            px={6}
          >
            <HStack spacing={2}>
              <Trophy size={20} />
              <Text>Current Tournament</Text>
            </HStack>
          </MotionTab>
          <MotionTab
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            bg="rgba(237, 100, 166, 0.1)"
            _selected={{ bg: 'pink.500', color: 'white' }}
            borderRadius="full"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            fontSize="lg"
            fontWeight="bold"
            py={3}
            px={6}
          >
            <HStack spacing={2}>
              <History size={20} />
              <Text>Previous Tournament</Text>
            </HStack>
          </MotionTab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box
              bg="rgba(0, 0, 0, 0.2)"
              backdropFilter="blur(10px)"
              borderRadius="lg"
              p={6}
              boxShadow="0 8px 32px rgba(31, 38, 135, 0.37)"
            >
              {renderTimeInfo()}
              {tournamentData.status === 'registration' && (
                <>
                  <Heading size="lg" mb={4} justifyContent={'center'}>
                    Registration Open
                  </Heading>
                  {registrationStatus === 'not-registered' ? (
                    <RegistrationForm onRegister={handleRegister} />
                  ) : (
                    <VStack spacing={4} align="stretch">
                      <Alert status="success" color="black">
                        <AlertIcon />
                        Successfully registered! The tournament will begin soon.
                      </Alert>
                      <Text>Username: {userDetails.username}</Text>
                      <Text>
                        Selected Categories: {userDetails.categories.join(', ')}
                      </Text>
                    </VStack>
                  )}
                </>
              )}
              {tournamentData.status === 'upcoming' && (
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
                  <LeaderboardTable
                    data={tournamentData.participants.slice(0, 5)}
                  />
                </>
              )}
            </Box>
          </TabPanel>
          <TabPanel>
            <Box
              bg="rgba(0, 0, 0, 0.2)"
              backdropFilter="blur(10px)"
              borderRadius="lg"
              p={6}
              boxShadow="0 8px 32px rgba(31, 38, 135, 0.37)"
            >
              <Heading
                size={{ base: 'sm', md: 'lg' }}
                mb={4}
                display="flex"
                alignItems="center"
              >
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
          </TabPanel>
        </TabPanels>
      </Tabs>
    )
  }

  return (
    <Box color="white" mt={{ base: 4, md: 8 }} minHeight="100vh">
      <Container maxW="container.xl" py={16} px={0}>
        <Box
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          as={MotionBox}
        >
          <Heading as="h1" size={'2xl'} mb={8} textAlign="center">
            Rapid Recap Tournament
          </Heading>
        </Box>

        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
          <Box
            flex={1}
            rounded="lg"
            shadow="2xl"
            p={6}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            bg="rgba(0, 0, 0, 0.1)"
            backdropFilter="blur(5px)"
            as={MotionBox}
          >
            {renderTournamentContent()}
          </Box>

          <Box
            flex={1}
            rounded="lg"
            shadow="2xl"
            p={6}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            bg="rgba(0, 0, 0, 0.1)"
            backdropFilter="blur(5px)"
            as={MotionBox}
          >
            {tournamentData && tournamentData.status === 'ongoing' ? (
              <>
                <Heading size="lg" mb={4} display="flex" alignItems="center">
                  <Crown color="#C0C0C0" style={{ marginRight: '0.5rem' }} />
                  Current Leaderboard
                </Heading>
                <LeaderboardTable
                  data={tournamentData.participants.slice(0, 5)}
                />
              </>
            ) : (
              <>
                <Heading size="lg" mb={4}>
                  Epic Quest Guide
                </Heading>
                <VStack align="start" spacing={4}>
                  {[
                    { icon: Star, text: 'Conquer epic knowledge realms!' },
                    { icon: Clock, text: '48-hour quest window awaits' },
                    { icon: Trophy, text: 'Ascend ranks, claim glory' },
                    {
                      icon: Crown,
                      text: 'Master the Current Affairs challenge',
                    },
                  ].map((instruction, index) => (
                    <Box
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      display="flex"
                      alignItems="center"
                      as={MotionBox}
                    >
                      <Box as={instruction.icon} mr={2} color="pink.400" />
                      <Text
                        fontSize={{ base: 'md', md: 'lg' }}
                        fontWeight="semibold"
                      >
                        {instruction.text}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </>
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}

export default Tournament
