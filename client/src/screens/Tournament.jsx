import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
  lazy,
} from 'react'
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
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Trophy, History } from 'lucide-react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { addNoteMessage } from '../redux/appSlice'
import { setUser } from '../redux/authSlice'
import { setIsOpen, setTournamentQuiz } from '../redux/quizSlice'
import {
  setCategory,
  setCompletedCategories,
  setTournamentId,
} from '../redux/tournamentSlice'
import { useTranslation } from 'react-i18next'
import TournamentContent from '../components/tournamentComponents/TournamentContent'

// Lazy load components for code splitting
const TournamentHeader = lazy(() =>
  import('../components/tournamentComponents/TournamentHeader'),
)
const TimeInfo = lazy(() =>
  import('../components/tournamentComponents/TimeInfo'),
)
const RegistrationSection = lazy(() =>
  import('../components/tournamentComponents/RegistrationSection'),
)
const LeaderboardSection = lazy(() =>
  import('../components/tournamentComponents/LeaderboardSection'),
)
const PreviousTournamentLeaderboard = lazy(() =>
  import('../components/tournamentComponents/PreviousTournamentLeaderboard'),
)
const EpicQuestGuide = lazy(() =>
  import('../components/tournamentComponents/EpicQuestGuide'),
)
const TournamentStatus = lazy(() =>
  import('../components/tournamentComponents/TournamentStatus'),
)
const CategorySelection = lazy(() =>
  import('../components/tournamentComponents/CategorySelection'),
)
const FullScreenLoadingSpinner = lazy(() =>
  import(
    '../components/tournamentComponents/tournamentQuiz/FullScreenLoadingSpinner'
  ),
)

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
  const { t } = useTranslation('Tournament')

  const isScreenSmallerThan400px = useMediaQuery('(max-width: 400px)')[0]

  const [userRegistrationDetails, setUserRegistrationDetails] = useState({
    isRegistered: false,
    selectedCategories: [],
    completedCategories: [],
    totalScore: 0,
  })

  const toast = useToast()

  const fetchTournamentData = useCallback(async () => {
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
      dispatch(
        setCompletedCategories(
          currTournamentData.data.completedCategories || [],
        ),
      )
      setIsFetching(false)
    } catch (error) {
      console.log(error)
      setTournamentData(null)
      setIsFetching(false)
    }
  }, [dispatch, toast, user?._id])

  useEffect(() => {
    if (loginCheckStatus === 'fulfilled') fetchTournamentData()
  }, [loginCheckStatus, fetchTournamentData])

  const handleRegister = useCallback(
    async details => {
      const dataPayload = { ...details, tournamentId: tournamentData._id }
      setRegisterLoading(true)
      try {
        const { data } = await axios.post(
          '/api/tournament/register',
          dataPayload,
        )
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
            title: t('registrationSuccess.title'),
            actions: [{ actionType: 'VIEW_EXPERIENCE' }],
            width: '250px',
            xpSource: 'tournament-registration',
          }),
        )
        dispatch(setUser({ ...user, xp: user.xp + 5 }))
        setRegisterLoading(false)
      } catch (error) {
        console.log(error)
        toast({
          title: t('errorOccurred'),
          description: t('errorMessages.registerError'),
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      }
    },
    [dispatch, toast, tournamentData, user],
  )

  const handleCategorySelect = useCallback(
    category => {
      dispatch(setTournamentId(tournamentData._id))
      dispatch(setCategory(category))
      dispatch(setTournamentQuiz(true))
      dispatch(setIsOpen(true))
    },
    [dispatch, tournamentData?._id],
  )

  const currentTournamentNumber = useMemo(
    () =>
      tournamentData
        ? String(tournamentData.tournamentNumber).padStart(3, '0')
        : '000',
    [tournamentData],
  )
  const previousTournamentNumber = useMemo(
    () =>
      previousTournamentData
        ? String(previousTournamentData.tournamentNumber).padStart(3, '0')
        : 'N/A',
    [previousTournamentData],
  )

  const renderTournamentContent = useCallback(() => {
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
              {t('noTournamentData.title')}
            </Heading>
            <Text fontSize="xl" color="gray.300">
              {t('noTournamentData.description')}
            </Text>
          </MotionBox>
        </Center>
      )
    }

    return (
      <Tabs isFitted variant="soft-rounded" colorScheme="pink">
        <TabList mb="0.7em" justifyContent="center" mx={{ base: 2, md: 4 }}>
          <MotionTab
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            bg="rgba(237, 100, 166, 0.1)"
            _selected={{ bg: 'pink.500', color: 'white' }}
            borderRadius="full"
            boxShadow="0 4px 6px rgba(0, 0, 0,            0.1)"
            fontSize="lg"
            fontWeight="bold"
            py={3}
            px={{ base: 2, md: 6 }}
            display="flex"
            height="fit-content"
            flexDirection="column"
          >
            <Text fontSize="2xs" fontWeight="bold" m={0} p={0}>
              {t('tournamentNumber', {
                number: currentTournamentNumber,
              })}
            </Text>
            <HStack spacing={2}>
              <Trophy width={20} height={20} />
              <Text fontSize={{ base: 'sm', md: 'lg' }} wordSpacing="2px">
                {isScreenSmallerThan400px ? t('curr') : t('current')}{' '}
                {t('tournament')}
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
            display="flex"
            height="fit-content"
            flexDirection="column"
          >
            <Text fontSize="xs" fontWeight="bold" m={0} p={0}>
              {t('tournamentNumber', {
                number: previousTournamentNumber,
              })}
            </Text>
            <HStack spacing={2}>
              <History size={20} />
              <Text fontSize={{ base: 'sm', md: 'lg' }} wordSpacing="2px">
                {isScreenSmallerThan400px ? t('prev') : t('previous')}{' '}
                {t('tournament')}
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
              <Suspense fallback={<Skeleton height="40px" />}>
                <TimeInfo tournamentData={tournamentData} />
              </Suspense>
              <Suspense fallback={<Skeleton height="40px" />}>
                <TournamentStatus
                  tournamentData={tournamentData}
                  registrationStatus={
                    userRegistrationDetails.isRegistered
                      ? 'registered'
                      : 'not-registered'
                  }
                />
              </Suspense>
              {tournamentData?.status === 'registration' && (
                <Suspense fallback={<Skeleton height="40px" />}>
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
                </Suspense>
              )}
              {tournamentData?.status === 'ongoing' && (
                <VStack spacing={8} align="stretch">
                  {userRegistrationDetails.isRegistered ? (
                    <Suspense fallback={<Skeleton height="40px" />}>
                      <CategorySelection
                        userSelectedcategories={
                          userRegistrationDetails.selectedCategories
                        }
                        onCategorySelect={handleCategorySelect}
                        tournamentId={tournamentData._id}
                      />
                    </Suspense>
                  ) : (
                    <Alert status="warning" color="black">
                      <AlertIcon />
                      {t('tournamentStatus.notRegistered')}
                    </Alert>
                  )}
                </VStack>
              )}
            </Box>
          </TabPanel>
          <TabPanel>
            <Suspense fallback={<Skeleton height="40px" />}>
              <PreviousTournamentLeaderboard
                previousTournamentData={previousTournamentData}
              />
            </Suspense>
          </TabPanel>
        </TabPanels>
      </Tabs>
    )
  }, [
    isFetching,
    tournamentData,
    previousTournamentData,
    userRegistrationDetails,
    handleRegister,
    handleCategorySelect,
    currentTournamentNumber,
    previousTournamentNumber,
    isAuthenticated,
    isScreenSmallerThan400px,
  ])

  return (
    <Box color="white" mt={{ base: 4, md: 8 }} minHeight="100vh">
      {isFetching && <FullScreenLoadingSpinner />}
      <Container maxW="container.xl" py={16} px={0}>
        <Suspense fallback={<Skeleton height="40px" />}>
          <TournamentHeader />
        </Suspense>
        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
          <MotionBox
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
          >
            {/* {renderTournamentContent()} */}
            <TournamentContent
              isFetching={isFetching}
              tournamentData={tournamentData}
              previousTournamentData={previousTournamentData}
              userRegistrationDetails={userRegistrationDetails}
              isAuthenticated={isAuthenticated}
              isScreenSmallerThan400px={isScreenSmallerThan400px}
              handleRegister={handleRegister}
              handleCategorySelect={handleCategorySelect}
              user={user}
              registerLoading={registerLoading}
              t={t}
            />
            {tournamentData?.status === 'completed' && (
              <Suspense fallback={<Skeleton height="40px" />}>
                <LeaderboardSection tournamentData={tournamentData} />
              </Suspense>
            )}
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
            bgGradient="linear(to-br, rgba(26, 32, 44, 0.5), rgba(49, 10, 103, 0.5))"
          >
            {tournamentData?.status !== 'ongoing' ? (
              <Suspense fallback={<Skeleton height="40px" />}>
                <EpicQuestGuide />
              </Suspense>
            ) : (
              <Suspense fallback={<Skeleton height="40px" />}>
                <LeaderboardSection tournamentData={tournamentData} />
              </Suspense>
            )}
          </MotionBox>
        </Flex>
      </Container>
    </Box>
  )
}

export default Tournament
