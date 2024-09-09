import React, { useState, useEffect, useCallback, useRef } from 'react'
import { VStack, Heading, Box, Spinner, Center } from '@chakra-ui/react'
import { Trophy } from 'lucide-react'
import LeaderboardTable from './LeaderboardTable'
import axios from 'axios'
import { useInView } from 'react-intersection-observer'

const LeaderboardSection = ({ tournamentData }) => {
  const [leaderboardData, setLeaderboardData] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [firstLoadComplete, setFirstLoadComplete] = useState(false) // Track if the first load is done
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  const lock = useRef(false) // Prevent multiple simultaneous requests

  const fetchLeaderboard = useCallback(
    async (isFirstLoad = false) => {
      if (isLoading || !hasMore || lock.current) return

      lock.current = true
      setIsLoading(true)
      try {
        const response = await axios.get(`/api/tournament/leaderboard`, {
          params: {
            tournamentId: tournamentData._id,
            page,
            limit: 50,
          },
        })
        const newData = response.data.leaderboard
        setLeaderboardData(prevData => [...prevData, ...newData])
        setHasMore(response.data.hasMore)
        setPage(prevPage => prevPage + 1)

        // Mark the first load as complete
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

  // Fetch leaderboard on initial load
  useEffect(() => {
    fetchLeaderboard(true) // Pass true to mark this as the initial load
  }, [])

  // Fetch leaderboard when element is in view, but only after the first load is complete
  useEffect(() => {
    if (inView && !isLoading && hasMore && !lock.current && firstLoadComplete) {
      fetchLeaderboard()
    }
  }, [inView, isLoading, hasMore, firstLoadComplete])

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" display="flex" alignItems="center">
        <Trophy color="#ECC94B" style={{ marginRight: '0.5rem' }} />
        Current Leaderboard
      </Heading>
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
