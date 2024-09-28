import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from 'react'
import {
  VStack,
  Heading,
  Box,
  Spinner,
  Center,
  HStack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import axios from 'axios'
import { useInView } from 'react-intersection-observer'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next' // Import useTranslation
import { setRefetchLeaderBoard } from '../../redux/tournamentSlice'

// Lazy load components
const LeaderboardTable = React.lazy(() => import('./LeaderboardTable'))
const LeaderboardSearch = React.lazy(() => import('./LeaderboardSearch'))
const UserStatsModal = React.lazy(() => import('./UserStatsModal'))
const TrophySVG = React.lazy(() => import('../../assets/svg/TrophySVG'))
const Medal = React.lazy(() => import('../../assets/svg/Medal'))

const LeaderboardSection = ({ tournamentData }) => {
  const { t } = useTranslation('LeaderboardSection')
  const { t: userStatstranlate } = useTranslation('UserStatsModal')

  const [leaderboardData, setLeaderboardData] = useState([])
  const [userStanding, setUserStanding] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [firstLoadComplete, setFirstLoadComplete] = useState(false)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const { ref, inView } = useInView({ threshold: 0, triggerOnce: false })
  const { user } = useSelector(state => state.auth)
  const { refetchLeaderBoard } = useSelector(state => state.tournament)
  const dispatch = useDispatch()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedUserStats, setSelectedUserStats] = useState(null)

  const lock = useRef(false)

  const fetchLeaderboard = useCallback(
    async (isFirstLoad = false, resetPage = false) => {
      if (
        isLoading ||
        (!hasMore && !resetPage && !refetchLeaderBoard) ||
        lock.current
      )
        return

      lock.current = true
      setIsLoading(true)
      try {
        const response = await axios.get(`/api/tournament/leaderboard`, {
          params: {
            tournamentId: tournamentData._id,
            page: resetPage || refetchLeaderBoard ? 1 : page,
            limit: 50,
            userId: user?._id,
          },
        })

        const newData = response.data.leaderboard

        setLeaderboardData(prevData =>
          resetPage || refetchLeaderBoard ? newData : [...prevData, ...newData],
        )
        setHasMore(response.data.hasMore)
        setPage(prevPage => (resetPage ? 2 : prevPage + 1))
        setUserStanding(response.data.userStanding)
        dispatch(setRefetchLeaderBoard(false))
        if (isFirstLoad) setFirstLoadComplete(true)
      } catch (error) {
        console.error(t('fetchError'), error)
      } finally {
        setIsLoading(false)
        lock.current = false
      }
    },
    [
      tournamentData._id,
      page,
      hasMore,
      isLoading,
      user?._id,
      refetchLeaderBoard,
      dispatch,
      t,
    ],
  )

  const handleUserStandingClick = useCallback(async () => {
    if (user && userStanding) {
      try {
        const response = await axios.get(
          `/api/tournament/user-stats/${tournamentData._id}/${user._id}`,
        )
        setSelectedUserStats({
          ...response.data,
          inGameName: userStanding.inGameName,
        })
        onOpen()
      } catch (error) {
        console.error(t('fetchError'), error)
      }
    }
  }, [user, userStanding, tournamentData._id, onOpen, t])

  useEffect(() => {
    fetchLeaderboard(true)
  }, [refetchLeaderBoard])

  useEffect(() => {
    if (
      inView &&
      !lock.current &&
      firstLoadComplete &&
      !isSearchActive &&
      !refetchLeaderBoard
    ) {
      fetchLeaderboard()
    }
  }, [inView, firstLoadComplete, isSearchActive, refetchLeaderBoard])

  const handleSearch = useCallback(searchResults => {
    setLeaderboardData(searchResults)
    setIsSearchActive(true)
    setHasMore(false)
  }, [])

  const handleEmptySearch = useCallback(() => {
    setIsSearchActive(false)
    setPage(1)
    setHasMore(true)
    fetchLeaderboard(false, true)
  }, [fetchLeaderboard])

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" display="flex" alignItems="center">
        <TrophySVG color="#ECC94B" style={{ marginRight: '0.5rem' }} />
        {tournamentData?.status === 'completed'
          ? t(`Leaderboard`)
          : t('currentLeaderboard')}
      </Heading>
      <Suspense fallback={<Spinner size="xl" />}>
        <LeaderboardSearch
          onSearch={handleSearch}
          setSearchLoad={setIsLoading}
          tournamentId={tournamentData._id}
          onEmptySearch={handleEmptySearch}
          setIsSearchActive={setIsSearchActive}
        />
      </Suspense>
      {userStanding && (
        <Box
          bg="whiteAlpha.200"
          p={4}
          borderRadius="md"
          boxShadow="md"
          cursor="pointer"
          onClick={handleUserStandingClick}
          _hover={{ bg: 'whiteAlpha.300' }}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <HStack>
              <Medal color="#ECC94B" />
              <VStack alignItems="flex-start" spacing={0}>
                <Text fontWeight="bold">
                  {tournamentData?.status === 'completed'
                    ? t('Your Rank')
                    : t('yourCurrentRank')}
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="pink.400">
                  #{userStanding.rank}
                </Text>
              </VStack>
            </HStack>
            <VStack alignItems="flex-end" spacing={0}>
              <Text fontWeight="bold">{userStanding.name}</Text>
              <Text color="gray.400">@{userStanding.inGameName}</Text>
              <Text fontSize="xl" fontWeight="bold" color="pink.400">
                {t('score')}: {userStanding.score}
              </Text>
            </VStack>
          </HStack>
        </Box>
      )}
      <Box>
        <Suspense
          fallback={
            <Center mt={4}>
              <Spinner size="xl" />
            </Center>
          }
        >
          <LeaderboardTable
            data={leaderboardData}
            ref={ref}
            tournamentId={tournamentData._id}
          />
        </Suspense>
        {isLoading && (
          <Center mt={4}>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="pink.500"
              size="xl"
            />
          </Center>
        )}
      </Box>
      <Suspense fallback={null}>
        <UserStatsModal
          isOpen={isOpen}
          onClose={onClose}
          userStats={selectedUserStats}
          t={userStatstranlate}
        />
      </Suspense>
    </VStack>
  )
}

export default LeaderboardSection
