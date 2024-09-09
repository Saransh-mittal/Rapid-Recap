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
  useToast,
  useMediaQuery,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Trophy, History, Crown } from 'lucide-react'

import TournamentHeader from '../components/tournamentComponents/TournamentHeader'
import TimeInfo from '../components/tournamentComponents/TimeInfo'
import RegistrationSection from '../components/tournamentComponents/RegistrationSection'
import LeaderboardSection from '../components/tournamentComponents/LeaderboardSection'
import PreviousTournamentLeaderboard from '../components/tournamentComponents/PreviousTournamentLeaderboard'
import EpicQuestGuide from '../components/tournamentComponents/EpicQuestGuide'
import TournamentStatus from '../components/tournamentComponents/TournamentStatus'

import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { addNoteMessage } from '../redux/appSlice'
import { setUser } from '../redux/authSlice'
import CategorySelection from '../components/tournamentComponents/CategorySelection'

const MotionBox = motion(Box)
const MotionTab = motion(Tab)

const Tournament = () => {
  const [tournamentData, setTournamentData] = useState(null)
  const [previousTournamentData, setPreviousTournamentData] = useState(null)
  const [isFetching, setIsFetching] = useState(true)
  const dispatch = useDispatch()
  const [registerLoading, setRegisterLoading] = useState(false)
  const { user, loginCheckStatus, isAuthenticated } = useSelector(
    state => state.auth,
  )
  const isScreenSmallerThan400px = useMediaQuery('(max-width: 400px)')[0]
  const [userRegistrationDetails, setUserRegistrationDetails] = useState({
    isRegistered: false,
    selectedCategories: [],
    completedCategories: [],
    totalScore: 0,
  })
  const toast = useToast()

  const fetchTournamentData = async () => {
    setIsFetching(true)
    try {
      const currTournamentData = await axios.get(
        `/api/tournament/latest?userId=${user?._id}`,
      )
      const prevTournamentData = await axios.get('/api/tournament/previous')

      setTournamentData(currTournamentData.data)
      setPreviousTournamentData(prevTournamentData.data)
      setUserRegistrationDetails({
        isRegistered: currTournamentData.data.isRegistered,
        selectedCategories: currTournamentData.data.selectedCategories || [],
        completedCategories: currTournamentData.data.completedCategories || [],
        totalScore: currTournamentData.data.totalScore || 0,
      })
      setIsFetching(false)
    } catch (error) {
      console.log(error)
      toast({
        title: 'An error occurred.',
        description: 'Failed to fetch tournament data.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  useEffect(() => {
    if (loginCheckStatus === 'fulfilled') fetchTournamentData()
  }, [loginCheckStatus])

  const handleRegister = async details => {
    const dataPayload = {
      ...details,
      tournamentId: tournamentData._id,
    }
    setRegisterLoading(true)
    try {
      const { data } = await axios.post('/api/tournament/register', dataPayload)
      setUserRegistrationDetails({
        isRegistered: true,
        selectedCategories: data.selectedCategories || [],
        completedCategories: data.completedCategories || [],
        totalScore: data.totalScore || 0,
      })
      setTournamentData({
        ...tournamentData,
        registeredCount: tournamentData.registeredCount + 1,
      })
      dispatch(
        addNoteMessage({
          messageType: 'xpAward',
          xpAwarded: 5,
          title: 'XP Awarded For Tournament Registration',
          actions: [{ actionType: 'VIEW_EXPERIENCE' }],
          width: '250px',
          xpSource: 'tournament-registration',
        }),
      )
      dispatch(
        setUser({
          ...user,
          xp: user.xp + 5,
        }),
      )
      setRegisterLoading(false)
    } catch (error) {
      console.log(error)
      toast({
        title: 'An error occurred.',
        description: 'Failed to register for the tournament.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  const handleEnterTournament = () => {
    // Logic to enter the tournament
    console.log('Entering tournament...')
  }
  const handleCategorySelect = category => {
    console.log(`Starting quiz for category: ${category}`)
    // Add logic to start the quiz for the selected category
  }

  const currentTournamentNumber = tournamentData
    ? String(tournamentData.tournamentNumber).padStart(3, '0')
    : '000'
  const previousTournamentNumber = previousTournamentData
    ? String(previousTournamentData.tournamentNumber).padStart(3, '0')
    : 'N/A'

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
        <TabList mb="0.7em" justifyContent={'center'} mx={{ base: 2, md: 4 }}>
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
            px={{ base: 2, md: 6 }}
            display={'flex'}
            height={'fit-content'}
            flexDirection={'column'}
          >
            <Text fontSize="2xs" fontWeight="bold" m={0} p={0}>
              Tournament #{currentTournamentNumber}
            </Text>
            <HStack spacing={2}>
              <Trophy width={20} height={20} />
              <Text fontSize={{ base: 'sm', md: 'lg' }} wordSpacing={'2px'}>
                {isScreenSmallerThan400px ? 'Curr.' : 'Current'} Tournament
              </Text>
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
            px={{ base: 2, md: 6 }}
            display={'flex'}
            height={'fit-content'}
            flexDirection={'column'}
          >
            <Text fontSize="xs" fontWeight="bold" m={0} p={0}>
              Tournament #{previousTournamentNumber}
            </Text>
            <HStack spacing={2}>
              <History size={20} />
              <Text fontSize={{ base: 'sm', md: 'lg' }} wordSpacing={'2px'}>
                {isScreenSmallerThan400px ? 'Prev.' : `Previous`} Tournament
              </Text>
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
              <TournamentStatus
                tournamentData={tournamentData}
                registrationStatus={
                  userRegistrationDetails.isRegistered
                    ? 'registered'
                    : 'not-registered'
                }
                handleEnterTournament={handleEnterTournament}
              />
              {tournamentData?.status === 'registration' && (
                <RegistrationSection
                  isAuthenticated={isAuthenticated}
                  userRole={user?.role}
                  tournamentData={tournamentData}
                  registrationStatus={
                    userRegistrationDetails.isRegistered
                      ? 'registered'
                      : 'not-registered'
                  }
                  handleRegister={handleRegister}
                  userDetails={{
                    inGameName: user?.inGameName,
                    categories: userRegistrationDetails?.selectedCategories,
                  }}
                  registerLoading={registerLoading}
                />
              )}
              {tournamentData?.status === 'ongoing' && (
                <VStack spacing={8} align="stretch">
                  {userRegistrationDetails.isRegistered ? (
                    <CategorySelection
                      userSelectedcategories={
                        userRegistrationDetails.selectedCategories
                      }
                      onCategorySelect={handleCategorySelect}
                    />
                  ) : (
                    <Alert status="warning" color="black">
                      <AlertIcon />
                      You are not registered for this tournament. Registration
                      is closed, but you can still view the leaderboard.
                    </Alert>
                  )}
                </VStack>
              )}
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
      <Container maxW="container.xl" py={16} px={0}>
        <TournamentHeader />
        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
          <Box
            flex={1}
            rounded="lg"
            shadow="2xl"
            py={6}
            px={2}
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
            bgGradient="linear(to-br, rgba(26, 32, 44, 0.5), rgba(49, 10, 103, 0.5))"
          >
            {tournamentData?.status !== 'ongoing' ? (
              <EpicQuestGuide />
            ) : (
              <LeaderboardSection tournamentData={tournamentData} />
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}

export default Tournament
