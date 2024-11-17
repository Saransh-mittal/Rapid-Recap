import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import {
  Box,
  Flex,
  Spinner,
  Text,
  Heading,
  Icon,
  useDisclosure,
  VStack,
  SimpleGrid,
  Badge,
  Tooltip as ChakraTooltip,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { keyframes } from '@emotion/react'

const CategoryStatsCard = lazy(() =>
  import('../../tournamentComponents/CategoryStatsCard'),
)
const ProfileButton = lazy(() => import('../../miscellaneous/ProfileButton'))
const TournamentSelectorDrawer = lazy(() =>
  import('./TournamentSectionComponent/TournamentSelectorDrawer'),
)
const QuizReport = lazy(() => import('../../quizComponents/QuizReport'))
const LastTournamentRank = lazy(() =>
  import('./TournamentSectionComponent/LastTournamentRank'),
)
const HistogramSVG = lazy(() => import('../../../assets/svg/HistogramSVG'))
const TrophySVG = lazy(() => import('../../../assets/svg/TrophySVG'))

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

const TournamentSection = ({
  loginedUserProfile,
  isGuest,
  privateTournament,
  userId,
}) => {
  const [tournamentData, setTournamentData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastTournamentRank, setLastTournamentRank] = useState(null)
  const { user } = useSelector(state => state.auth)
  const [userStats, setUserStats] = useState(null)
  const { t: translate } = useTranslation('TournamentSection')
  const { t: userStatstranslate } = useTranslation('UserStatsModal')
  const { inGameName } = useParams()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [tournamentId, setTournamentId] = useState(null)
  const [lastUserStats, setLastUserStats] = useState(null)
  const [lastTournamentId, setLastTournamentId] = useState(null)
  const [showProfileQuizSummary, setShowProfileQuizSummary] = useState(false)
  const [profileCategory, setProfileCategory] = useState(null)

  const fetchUserTournamentData = async userId => {
    try {
      setLoading(true)
      const response = await axios.get(
        `/api/user/getUserTournamentData/${userId}`,
      )
      if (response.data && Array.isArray(response.data.tournamentPerformance)) {
        setTournamentData(response.data.tournamentPerformance)
        if (response.data.tournamentPerformance.length > 0) {
          setLastTournamentRank(
            response.data.tournamentPerformance[
              response.data.tournamentPerformance.length - 1
            ].rank,
          )
        }
      } else {
        setTournamentData([])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching user tournament data:', error)
      setError('Failed to load tournament data')
      setLoading(false)
    }
  }

  const fetchTournamentCategoriesScores = useCallback(async () => {
    if (userId && tournamentId) {
      try {
        const response = await axios.get(
          `/api/tournament/user-stats/${tournamentId}/${userId}`,
        )
        setUserStats({
          ...response.data,
          inGameName: user.inGameName,
        })
        onOpen()
      } catch (error) {
        console.error(translate('fetchError'), error)
      }
    }
  }, [userId, tournamentId, translate])

  const fetchLastGivenTournamentCategoriesScores = useCallback(async () => {
    if (userId && lastTournamentId) {
      try {
        const response = await axios.get(
          `/api/tournament/user-stats/${lastTournamentId}/${userId}`,
        )
        setLastUserStats({
          ...response.data,
          inGameName: user.inGameName,
        })
      } catch (error) {
        console.error(translate('fetchError'), error)
      }
    }
  }, [userId, lastTournamentId, translate])

  useEffect(() => {
    if (userId) {
      fetchUserTournamentData(userId)
    }
  }, [userId])

  useEffect(() => {
    if (userId && tournamentId) {
      fetchTournamentCategoriesScores()
    }
  }, [tournamentId])

  useEffect(() => {
    if (userId && lastTournamentId) {
      fetchLastGivenTournamentCategoriesScores()
    }
  }, [lastTournamentId])

  useEffect(() => {
    if (tournamentData.length > 0) {
      const lastTournament = tournamentData[tournamentData.length - 1]
      setLastTournamentId(lastTournament.tournament._id)
    }
  }, [tournamentData])

  const categoryStats = useMemo(
    () => userStats?.categoryStats || [],
    [userStats],
  )

  const lastCategoryStats = useMemo(
    () => lastUserStats?.categoryStats || [],
    [lastUserStats],
  )

  const data = tournamentData.map((performance, index) => ({
    score: performance.score,
    date: new Date(performance.endDate).toLocaleDateString(),
    rank: performance.rank,
    index: index + 1,
    ...performance.tournament,
  }))

  const chartData = useMemo(() => {
    return {
      labels: data.map(item => item.index),
      datasets: [
        {
          label: translate('chart.label'),
          data: data.map(item => item.score),
          borderColor: 'rgba(183, 148, 244, 1)',
          backgroundColor: 'rgba(183, 148, 244, 0.5)',
          pointBackgroundColor: 'rgba(85, 60, 154, 1)',
          pointBorderColor: 'rgba(183, 148, 244, 1)',
          pointHoverBackgroundColor: 'rgba(159, 122, 234, 1)',
          pointHoverBorderColor: 'rgba(159, 122, 234, 1)',
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
        },
      ],
    }
  }, [data, translate])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: "'Cinzel', serif",
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: "'Cinzel', serif",
          size: 14,
        },
        bodyFont: {
          family: "'Cinzel', serif",
          size: 12,
        },
        callbacks: {
          label: context => {
            const dataPoint = data[context.dataIndex]
            return [
              `${translate('chart.score')}: ${dataPoint.score}`,
              `${translate('chart.rank')}: ${dataPoint.rank}`,
              `${translate('chart.date')}: ${dataPoint.date}`,
            ]
          },
        },
      },
    },
  }

  const handleQuizReportClose = () => {
    setShowProfileQuizSummary(false)
  }

  const handleQuizReportOpen = () => {
    if (!loginedUserProfile) return
    setShowProfileQuizSummary(true)
  }

  const hoverAnimation = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }`

  if (loading)
    return (
      <Spinner
        size="xl"
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.700"
        color="purple.500"
      />
    )
  if (error) return <Text color="red.400">{error}</Text>

  if (isGuest) {
    return (
      <Flex
        w="full"
        mt={10}
        mx="auto"
        p={{ base: 4, md: 6 }}
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        borderRadius="lg"
        border="1px"
        borderColor="gray.700"
        style={{
          backgroundColor: 'rgba(15, 13, 21, 0.8)',
          boxShadow:
            '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Text color="gray.400" fontSize="lg" textAlign="center">
          {translate('guestMessage')}
        </Text>
      </Flex>
    )
  }

  if (tournamentData.length === 0) {
    return (
      <Flex
        w="full"
        mt={10}
        mx="auto"
        p={{ base: 4, md: 6 }}
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        borderRadius="lg"
        border="1px"
        borderColor="gray.700"
        style={{
          backgroundColor: 'rgba(15, 13, 21, 0.8)',
          boxShadow:
            '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Icon boxSize={8} color="purple.400" mb={4}>
          <HistogramSVG width="20px" height="20px" fill="#9F7AEA" />
        </Icon>
        <Text color="gray.400" fontSize="lg" textAlign="center">
          {translate('noTournamentData')}
        </Text>
      </Flex>
    )
  }

  return (
    <>
      <Box w="full" mx="auto" p={{ base: 4, md: 6 }} borderRadius="lg">
        {privateTournament ? (
          <Flex
            w={'100%'}
            h={'400px'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <Text
              backgroundColor="#0f0d15"
              m={0}
              top={0}
              right={10}
              color="#9CAFAA"
              display="flex"
              justifyContent="center"
              alignItems="center"
              w="60px"
              height="30px"
            >
              {translate('hidden')}
            </Text>
          </Flex>
        ) : loading ? (
          <Spinner />
        ) : (
          <>
            <VStack spacing={8} align="stretch">
              <Flex
                direction={{ base: 'column', xl: 'row' }}
                justify="space-between"
                align={{ base: 'center', xl: 'flex-start' }}
              >
                <VStack
                  spacing={4}
                  align="stretch"
                  w={{ base: '100%', xl: '40%' }}
                >
                  <Flex align="center">
                    <Icon boxSize={8} color="purple.400" mr={2}>
                      <HistogramSVG width="20px" height="20px" fill="#9F7AEA" />
                    </Icon>
                    <Heading
                      fontSize="lg"
                      fontWeight="bold"
                      color="gray.100"
                      fontFamily="'Cinzel', serif"
                    >
                      {translate('performanceHeading')}
                    </Heading>
                  </Flex>
                  <Box h={{ base: '300px', md: '310px' }} w="100%">
                    <Line data={chartData} options={chartOptions} />
                  </Box>
                  <Flex w={'100%'} justifyContent={'center'}>
                    <LastTournamentRank rank={lastTournamentRank} />
                  </Flex>
                </VStack>

                <VStack
                  spacing={6}
                  align="stretch"
                  w={{ base: '100%', xl: '55%' }}
                  mt={{ base: 8, xl: 0 }}
                >
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    bg="rgba(128, 90, 213, 0.1)"
                    borderRadius="lg"
                    p={4}
                    boxShadow="0 4px 6px rgba(128, 90, 213, 0.1)"
                  >
                    <Box position="relative" mb={2}>
                      <TrophySVG size={32} color="#B794F4" />
                      <Box
                        position="absolute"
                        top="-2px"
                        left="-2px"
                        right="-2px"
                        bottom="-2px"
                        borderRadius="full"
                        bg="rgba(183, 148, 244, 0.2)"
                        filter="blur(8px)"
                        zIndex="-1"
                      />
                    </Box>
                    <Heading
                      fontSize="2xl"
                      fontWeight="bold"
                      color="purple.300"
                      textAlign="center"
                      fontFamily="'Cinzel', serif"
                      letterSpacing="wide"
                    >
                      {translate('lastTournamentHeading')}
                    </Heading>
                    <Text
                      fontSize="sm"
                      color="gray.400"
                      mt={1}
                      fontStyle="italic"
                      textAlign="center"
                    >
                      {translate('lastTournamentSubheading')}
                    </Text>
                  </Flex>

                  <SimpleGrid columns={{ base: 2, xl: 3 }} spacing={4}>
                    {lastCategoryStats.map((stat, index) => (
                      <Box
                        key={index}
                        onClick={() => {
                          if (!loginedUserProfile) return
                          setProfileCategory(stat?.category)
                        }}
                      >
                        <CategoryStatsCard
                          stat={stat}
                          t={userStatstranslate}
                          userStats={lastUserStats}
                          isProfile={true}
                          setShowQuizSummary={handleQuizReportOpen}
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                  <Flex position={'relative'}>
                    <ProfileButton
                      buttonText={translate('analyticsButton')}
                      inGameName={inGameName}
                      stateUserInGameName={user?.inGameName}
                      Private={user?.profilePrivacy.tournamentAnalytics}
                      hoverAnimation={hoverAnimation}
                      onClick={onOpen}
                      icon={
                        <HistogramSVG width="20px" height="20px" fill="#fff" />
                      }
                      notShowVisibility={true}
                      top="0.9rem"
                    />
                  </Flex>
                </VStack>
              </Flex>
            </VStack>
          </>
        )}
      </Box>

      <TournamentSelectorDrawer
        isOpen={isOpen}
        onClose={onClose}
        hoverAnimation={hoverAnimation}
        data={data}
        userStats={userStats}
        categoryStats={categoryStats}
        setTournamentId={setTournamentId}
        tournamentId={tournamentId}
        tournamentData={tournamentData}
        loginedUserProfile={loginedUserProfile}
      />

      {showProfileQuizSummary && (
        <Suspense fallback={null}>
          <QuizReport
            isOpen={showProfileQuizSummary}
            onClose={handleQuizReportClose}
            isTournament={true}
            tournamentId={lastTournamentId}
            category={profileCategory}
          />
        </Suspense>
      )}
    </>
  )
}

export default TournamentSection
