import React, { useState, useEffect, useCallback, useRef } from 'react'
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
import { Trophy, Medal } from 'lucide-react'
import LeaderboardTable from './LeaderboardTable'
import LeaderboardSearch from './LeaderboardSearch'
import axios from 'axios'
import { useInView } from 'react-intersection-observer'
import { useDispatch, useSelector } from 'react-redux'
import { setRefetchLeaderBoard } from '../../redux/tournamentSlice'
import UserStatsModal from './UserStatsModal'

const LeaderboardSection = ({ tournamentData }) => {
  const [leaderboardData, setLeaderboardData] = useState([])
  const [userStanding, setUserStanding] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [firstLoadComplete, setFirstLoadComplete] = useState(false)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  })
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
            userId: user?._id, // Pass the user ID to get user standings
          },
        })

        const newData = response.data.leaderboard

        setLeaderboardData(prevData =>
          resetPage || refetchLeaderBoard ? newData : [...prevData, ...newData],
        )
        setHasMore(response.data.hasMore)
        setPage(prevPage => (resetPage ? 2 : prevPage + 1))
        setUserStanding(response.data.userStanding) // Set user standings
        dispatch(setRefetchLeaderBoard(false))
        if (isFirstLoad) setFirstLoadComplete(true)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
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
    ],
  )

  const handleUserStandingClick = async () => {
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
        console.error('Error fetching user stats:', error)
      }
    }
  }

  useEffect(() => {
    fetchLeaderboard(true)
  }, [refetchLeaderBoard])

  useEffect(() => {
    if (
      inView &&
      !isLoading &&
      hasMore &&
      !lock.current &&
      firstLoadComplete &&
      !isSearchActive &&
      !refetchLeaderBoard
    ) {
      fetchLeaderboard()
    }
  }, [
    inView,
    isLoading,
    hasMore,
    firstLoadComplete,
    isSearchActive,
    refetchLeaderBoard,
  ])

  const handleSearch = searchResults => {
    setLeaderboardData(searchResults)
    setIsSearchActive(true)
    setHasMore(false)
  }

  const handleEmptySearch = () => {
    setIsSearchActive(false)
    setPage(1)
    setHasMore(true)
    fetchLeaderboard(false, true)
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" display="flex" alignItems="center">
        <Trophy color="#ECC94B" style={{ marginRight: '0.5rem' }} />
        Current Leaderboard
      </Heading>
      <LeaderboardSearch
        onSearch={handleSearch}
        setSearchLoad={setIsLoading}
        tournamentId={tournamentData._id}
        onEmptySearch={handleEmptySearch}
        setIsSearchActive={setIsSearchActive}
      />
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
                <Text fontWeight="bold">Your Current Rank</Text>
                <Text fontSize="2xl" fontWeight="bold" color="pink.400">
                  #{userStanding.rank}
                </Text>
              </VStack>
            </HStack>
            <VStack alignItems="flex-end" spacing={0}>
              <Text fontWeight="bold">{userStanding.name}</Text>
              <Text color="gray.400">@{userStanding.inGameName}</Text>
              <Text fontSize="xl" fontWeight="bold" color="pink.400">
                Score: {userStanding.score}
              </Text>
            </VStack>
          </HStack>
        </Box>
      )}
      <Box>
        <LeaderboardTable
          data={leaderboardData}
          ref={ref}
          tournamentId={tournamentData._id}
        />
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
      <UserStatsModal
        isOpen={isOpen}
        onClose={onClose}
        userStats={selectedUserStats}
      />
    </VStack>
  )
}

export default LeaderboardSection
