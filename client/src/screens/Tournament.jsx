import React, { useState, useEffect, useCallback, useMemo, lazy } from 'react'
import { Helmet } from 'react-helmet'
import { Box, Container, Flex, useToast, useMediaQuery } from '@chakra-ui/react'
import { motion } from 'framer-motion'

import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { addNoteMessage } from '../redux/appSlice'
import { setUser } from '../redux/authSlice'
import { setIsOpen, setTournamentQuiz } from '../redux/quizSlice'
import {
  setCategory,
  setCompletedCategories,
  setIsRegistered,
  setTournamentId,
  updateCategoryStatus,
} from '../redux/tournamentSlice'
import { useTranslation } from 'react-i18next'
import TournamentContent from '../components/tournamentComponents/TournamentContent'

// Lazy load components for code splitting
const TournamentHeader = lazy(() =>
  import('../components/tournamentComponents/TournamentHeader'),
)
const LeaderboardSection = lazy(() =>
  import('../components/tournamentComponents/LeaderboardSection'),
)

const EpicQuestGuide = lazy(() =>
  import('../components/tournamentComponents/EpicQuestGuide'),
)
const FullScreenLoadingSpinner = lazy(() =>
  import(
    '../components/tournamentComponents/tournamentQuiz/FullScreenLoadingSpinner'
  ),
)

const MotionBox = motion(Box)

const Tournament = () => {
  const [tournamentData, setTournamentData] = useState(null)
  const [previousTournamentData, setPreviousTournamentData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
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
    categoryAttempts: {},
  })

  const toast = useToast()

  const fetchTournamentData = useCallback(async () => {
    setIsLoading(true)
    try {
      const currTournamentData = await axios.get(
        `/api/tournament/latest?userId=${user?._id}`,
      )
      // const currTournamentData = await axios.get(
      //   `/api/admin/tournament/test/latest?userId=${user?._id}`,
      // )
      const prevTournamentData = await axios.get('/api/tournament/previous', {
        params: {
          userId: user?._id,
        },
      })

      setTournamentData(currTournamentData.data)
      setPreviousTournamentData(prevTournamentData.data)
      setUserRegistrationDetails({
        isRegistered: currTournamentData.data.isRegistered,
        selectedCategories: currTournamentData.data.selectedCategories || [],
        completedCategories: currTournamentData.data.completedCategories || [],
        totalScore: currTournamentData.data.totalScore || 0,
        categoryAttempts: currTournamentData.data.categoryAttempts || {},
      })
      for (
        let i = 0;
        i < Object.keys(currTournamentData.data.categoryScores).length;
        i++
      ) {
        dispatch(
          updateCategoryStatus({
            category: Object.keys(currTournamentData.data.categoryScores)[i],
            score: Object.values(currTournamentData.data.categoryScores)[i],
            attemptsLeft:
              2 - Object.values(currTournamentData.data.categoryAttempts)[i],
          }),
        )
      }
      dispatch(
        setCompletedCategories(
          currTournamentData.data.completedCategories || [],
        ),
      )
      setIsLoading(false)
    } catch (error) {
      console.log(error)
      setTournamentData(null)
      setIsLoading(false)
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
        dispatch(setIsRegistered(true))
        setRegisterLoading(false)
      } catch (error) {
        console.error(error)
        setRegisterLoading(false)

        let errorMessage = t('errorMessages.registerError')

        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          errorMessage = error.response.data.message
        }

        toast({
          title: t('errorOccurred'),
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      }
    },
    [
      dispatch,
      toast,
      tournamentData,
      user,
      t,
      setRegisterLoading,
      setUserRegistrationDetails,
      setTournamentData,
    ],
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

  // SEO-related data
  const pageTitle = tournamentData
    ? `Tournament #${tournamentData.tournamentNumber} | Rapid Recap`
    : 'Tournaments | Rapid Recap'
  const pageDescription = tournamentData
    ? `Join Tournament #${tournamentData.tournamentNumber}. Compete with players worldwide, test your skills, and win exciting prizes!`
    : 'Participate in our regular tournaments, compete with players worldwide, and win exciting prizes!'
  const canonicalUrl = `https://www.rapidrecap.co.in/tournament`

  // Structured data for SEO
  const structuredData = tournamentData
    ? {
        '@context': 'https://schema.org',
        '@type': 'QuizEvent',
        name: `Tournament #${tournamentData.tournamentNumber}`,
        description: pageDescription,
        startDate: tournamentData.startDate,
        endDate: tournamentData.endDate,
        url: canonicalUrl,
        location: {
          '@type': 'VirtualLocation',
          name: 'Rapid Recap',
        },
        organizer: {
          '@type': 'Organization',
          name: 'Rapid Recap',
          url: 'https://www.rapidrecap.co.in/',
        },
        competitor: {
          '@type': 'Person',
          name: 'Tournament Participants',
        },
      }
    : null

  if (isLoading) {
    return <FullScreenLoadingSpinner />
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/tourBGDark.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="/images/tourBGDark.webp" />
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
      </Helmet>
      <Box color="white" mt={{ base: 4, md: 8 }} minHeight="100vh">
        {isLoading && <FullScreenLoadingSpinner />}
        <Container maxW="container.xl" py={16} px={0}>
          {/* <Suspense fallback={<Skeleton height="40px" />}> */}
          <TournamentHeader />
          {/* </Suspense> */}
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
              bg="rgba(0, 0, 0, 0.5)"
            >
              <TournamentContent
                isFetching={isLoading}
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
                // <Suspense fallback={<Skeleton height="40px" />}>
                <LeaderboardSection tournamentData={tournamentData} />
                // </Suspense>
              )}
            </MotionBox>
            <MotionBox
              flex={1}
              rounded="lg"
              shadow={{ base: 'none', lg: '2xl' }}
              p={6}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              bg="rgba(0, 0, 0, 0.4)"
              bgGradient="linear(to-br, rgba(26, 32, 44, 0.5), rgba(49, 10, 103, 0.5))"
            >
              {tournamentData?.status !== 'ongoing' ? (
                <EpicQuestGuide />
              ) : (
                <LeaderboardSection tournamentData={tournamentData} />
              )}
            </MotionBox>
          </Flex>
        </Container>
      </Box>
    </>
  )
}

export default Tournament
