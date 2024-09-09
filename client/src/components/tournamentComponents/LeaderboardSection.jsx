import React, { useState, useEffect, useCallback, useRef } from 'react'
import { VStack, Heading, Box, Spinner, Center } from '@chakra-ui/react'
import { Trophy } from 'lucide-react'
import LeaderboardTable from './LeaderboardTable'
import LeaderboardSearch from './LeaderboardSearch'
import axios from 'axios'
import { useInView } from 'react-intersection-observer'

const LeaderboardSection = ({ tournamentData }) => {
  const [leaderboardData, setLeaderboardData] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [firstLoadComplete, setFirstLoadComplete] = useState(false)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  const lock = useRef(false)

  const fetchLeaderboard = useCallback(
    async (isFirstLoad = false, resetPage = false) => {
      if (isLoading || (!hasMore && !resetPage) || lock.current) return

      lock.current = true
      setIsLoading(true)
      try {
        const response = await axios.get(`/api/tournament/leaderboard`, {
          params: {
            tournamentId: tournamentData._id,
            page: resetPage ? 1 : page,
            limit: 50,
          },
        })
        const newData = response.data.leaderboard
        setLeaderboardData(prevData =>
          resetPage ? newData : [...prevData, ...newData],
        )
        setHasMore(response.data.hasMore)
        setPage(prevPage => (resetPage ? 2 : prevPage + 1))

        if (isFirstLoad) setFirstLoadComplete(true)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setIsLoading(false)
        lock.current = false
      }
    },
    [tournamentData._id, page, hasMore, isLoading],
  )

  useEffect(() => {
    fetchLeaderboard(true)
  }, [])

  useEffect(() => {
    if (
      inView &&
      !isLoading &&
      hasMore &&
      !lock.current &&
      firstLoadComplete &&
      !isSearchActive
    ) {
      fetchLeaderboard()
    }
  }, [inView, isLoading, hasMore, firstLoadComplete, isSearchActive])

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
      />
      <Box>
        <LeaderboardTable data={leaderboardData} ref={ref} />
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
    </VStack>
  )
}

export default LeaderboardSection
