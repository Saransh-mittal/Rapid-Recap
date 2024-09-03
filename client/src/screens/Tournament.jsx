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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Trophy, Star, Clock, Crown } from 'lucide-react'

import RegistrationForm from '../components/tournamentComponents/RegistrationForm'
import LeaderboardTable from '../components/tournamentComponents/LeaderboardTable'

const MotionBox = motion(Box)

const Tournament = () => {
  const [registrationStatus, setRegistrationStatus] = useState('not-registered')
  const [userDetails, setUserDetails] = useState(null)
  const [isTournamentDay, setIsTournamentDay] = useState(false)

  const handleRegister = details => {
    setUserDetails(details)
    setRegistrationStatus('registered')
  }

  useEffect(() => {
    // Check if it's tournament day (Saturday or Sunday)
    const today = new Date().getDay()
    setIsTournamentDay(today === 0 || today === 6)
  }, [])

  const currentLeaderboardData = [
    { rank: 1, username: 'johndoe', score: 4800 },
    { rank: 2, username: 'janedoe', score: 4750 },
    { rank: 3, username: 'bobsmith', score: 4700 },
    { rank: 4, username: 'sarahlee', score: 4650 },
    { rank: 5, username: 'mikebrown', score: 4600 },
  ]

  const previousLeaderboardData = [
    { rank: 1, username: 'alexgreen', score: 5000 },
    { rank: 2, username: 'emmawhite', score: 4900 },
    { rank: 3, username: 'chrisblue', score: 4850 },
    { rank: 4, username: 'lilagray', score: 4800 },
    { rank: 5, username: 'samblack', score: 4750 },
  ]

  const gameInstructions = [
    { icon: Star, text: 'Conquer epic knowledge realms!' },
    { icon: Clock, text: '48-hour quest window awaits' },
    { icon: Trophy, text: 'Ascend ranks, claim glory' },
    { icon: Crown, text: 'Master the Current Affairs challenge' },
  ]

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
            <Tabs isFitted variant="soft-rounded" colorScheme="pink">
              <TabList mb="1em">
                <Tab
                  _selected={{
                    color: 'white',
                    bg: 'pink.500',
                    boxShadow: '0 0 15px rgba(237, 100, 166, 0.5)',
                  }}
                  fontWeight="bold"
                  transition="all 0.3s"
                >
                  {isTournamentDay ? 'Current Tournament' : 'Registration'}
                </Tab>
                <Tab
                  _selected={{
                    color: 'white',
                    bg: 'pink.500',
                    boxShadow: '0 0 15px rgba(237, 100, 166, 0.5)',
                  }}
                  fontWeight="bold"
                  transition="all 0.3s"
                >
                  Previous Tournament
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  {isTournamentDay ? (
                    <>
                      <Heading
                        size="lg"
                        mb={4}
                        display="flex"
                        alignItems="center"
                      >
                        <Trophy
                          color="#ECC94B"
                          style={{ marginRight: '0.5rem' }}
                        />
                        Tournament in Progress
                      </Heading>
                      {registrationStatus === 'registered' ? (
                        <VStack spacing={4} align="stretch">
                          <Alert status="success" color={'black'}>
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
                        <Alert status="warning" color={'black'}>
                          <AlertIcon />
                          You are not registered for this tournament.
                        </Alert>
                      )}
                    </>
                  ) : (
                    <>
                      <Heading size="lg" mb={4}>
                        Registration
                      </Heading>
                      {registrationStatus === 'not-registered' ? (
                        <RegistrationForm onRegister={handleRegister} />
                      ) : (
                        <VStack spacing={4} align="stretch">
                          <Alert status="success">
                            <AlertIcon />
                            Successfully registered! The tournament will begin
                            on Saturday.
                          </Alert>
                          <Text>Username: {userDetails.username}</Text>
                          <Text>
                            Selected Categories:{' '}
                            {userDetails.categories.join(', ')}
                          </Text>
                        </VStack>
                      )}
                    </>
                  )}
                </TabPanel>
                <TabPanel>
                  <Heading size="lg" mb={4} display="flex" alignItems="center">
                    <Crown color="#C0C0C0" style={{ marginRight: '0.5rem' }} />
                    Previous Tournament Leaderboard
                  </Heading>
                  <LeaderboardTable data={previousLeaderboardData} />
                </TabPanel>
              </TabPanels>
            </Tabs>
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
            {isTournamentDay ? (
              <>
                <Heading size="lg" mb={4} display="flex" alignItems="center">
                  <Crown color="#C0C0C0" style={{ marginRight: '0.5rem' }} />
                  Current Leaderboard
                </Heading>
                <LeaderboardTable data={currentLeaderboardData} />
              </>
            ) : (
              <>
                <Heading size="lg" mb={4}>
                  Epic Quest Guide
                </Heading>
                <VStack align="start" spacing={4}>
                  {gameInstructions.map((instruction, index) => (
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
              </>
            )}
          </MotionBox>
        </Flex>
      </Container>
    </Box>
  )
}

export default Tournament
