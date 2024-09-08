// pages/Tournament.js
import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Flex,
  VStack,
  Skeleton,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  Center,
  Heading,
  HStack,
  Text,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Trophy, History, Crown } from 'lucide-react'

import TournamentHeader from '../components/tournamentComponents/TournamentHeader'
import TimeInfo from '../components/tournamentComponents/TimeInfo'
import RegistrationSection from '../components/tournamentComponents/RegistrationSection'
import LeaderboardSection from '../components/tournamentComponents/LeaderboardSection'
import PreviousTournamentLeaderboard from '../components/tournamentComponents/PreviousTournamentLeaderboard'
import EpicQuestGuide from '../components/tournamentComponents/EpicQuestGuide'

import {
  mockTournamentData,
  mockPreviousTournamentData,
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
    setTimeout(() => {
      setTournamentData(mockTournamentData.registration)
      setPreviousTournamentData(mockPreviousTournamentData)
      setIsFetching(false)
    }, 1000)
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

    return (
      <Tabs isFitted variant="soft-rounded" colorScheme="pink">
        <TabList mb="1em">
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
              <TimeInfo tournamentData={tournamentData} />
              <RegistrationSection
                tournamentData={tournamentData}
                registrationStatus={registrationStatus}
                handleRegister={handleRegister}
                userDetails={userDetails}
              />
              <LeaderboardSection
                tournamentData={tournamentData}
                registrationStatus={registrationStatus}
              />
            </Box>
          </TabPanel>
          <TabPanel>
            <PreviousTournamentLeaderboard
              previousTournamentData={previousTournamentData}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    )
  }

  return (
    <Box color="white" mt={{ base: 4, md: 8 }} minHeight="100vh">
      <Container maxW="container.xl" py={16}>
        <TournamentHeader />
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
            {tournamentData?.status !== 'ongoing' ? (
              <EpicQuestGuide />
            ) : (
              <Heading size="lg" mb={4}>
                Current Leaderboard
              </Heading>
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}

export default Tournament
