import React, { useState, useEffect, Suspense, lazy } from 'react'
import { Box, VStack, useToast } from '@chakra-ui/react'

// Lazy load major components
const AnimatedBackground = lazy(() =>
  import('../components/HallOfChampions/AnimatedBackground'),
)
const ChampionCard = lazy(() =>
  import('../components/HallOfChampions/ChampionCard'),
)
const TournamentCard = lazy(() =>
  import('../components/HallOfChampions/TournamentCard'),
)
const HallOfChampionsHeader = lazy(() =>
  import('../components/HallOfChampions/HallOfChampionsHeader'),
)
const ChampionDetailsModal = lazy(() =>
  import('../components/HallOfChampions/ChampionDetailsModal'),
)
const EnhancedTabs = lazy(() =>
  import('../components/HallOfChampions/EnhancedTabs'),
)

// Keep ShimmerTournamentCard eager loaded since it's used for loading states
import ShimmerTournamentCard from '../components/HallOfChampions/ShimmerTournamentCard'

// Loading fallback component
const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
    <ShimmerTournamentCard />
  </Box>
)

const HallOfChampions = () => {
  const [selectedChampion, setSelectedChampion] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [championsData, setChampionsData] = useState([])
  const [tournamentData, setTournamentData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  const handleChampionClick = champion => {
    setSelectedChampion(champion)
    setIsModalOpen(true)
  }

  const fetchLeaderboardData = async (month, year) => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/leaderboard/monthly?month=${month}&year=${year}&includeModalStats=true`,
      )
      const data = await response.json()
      if (data.status === 'success') {
        setChampionsData(data.data.leaderboard)
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch leaderboard data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTournamentChange = async tournamentId => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/tournament/leaders/${tournamentId}`)
      const data = await response.json()
      if (data.status === 'success') {
        setTournamentData(data.data.leaders)
      }
    } catch (error) {
      console.error('Error fetching tournament data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tournament data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeaderboardChange = ({ month, year }) => {
    fetchLeaderboardData(month, year)
  }

  const fetchTournamentLeaderboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tournament/hall-of-champions/leaders')
      const data = await response.json()
      if (data.status === 'success') {
        setTournamentData(data.data.leaders)
      }
    } catch (error) {
      console.error('Error fetching tournament data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tournament data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTournamentLeaderboardData()
  }, [])

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Box minH="100vh" position="relative">
        <Suspense fallback={<Box minH="100vh" bg="gray.900" />}>
          <AnimatedBackground />
        </Suspense>

        <Box
          position="relative"
          zIndex="1"
          pt={{ base: '60px', md: '80px' }}
          pb={8}
        >
          <Suspense fallback={<Box h="100px" />}>
            <HallOfChampionsHeader />
          </Suspense>

          <VStack maxW="1200px" mx="auto" px={4} spacing={8}>
            <Suspense fallback={<LoadingFallback />}>
              <EnhancedTabs
                onTournamentChange={handleTournamentChange}
                onLeaderboardFilterChange={handleLeaderboardChange}
              >
                <VStack spacing={4} w="full">
                  {isLoading ? (
                    <>
                      <ShimmerTournamentCard />
                      <ShimmerTournamentCard />
                      <ShimmerTournamentCard />
                    </>
                  ) : championsData.length === 0 ? (
                    <Box>No champions data available yet</Box>
                  ) : (
                    <Suspense fallback={<LoadingFallback />}>
                      {championsData.map((champion, index) => (
                        <ChampionCard
                          key={champion.id || index}
                          champion={champion}
                          index={index}
                          onClick={() => handleChampionClick(champion)}
                        />
                      ))}
                    </Suspense>
                  )}
                </VStack>
                <VStack spacing={4} w="full">
                  {isLoading ? (
                    <>
                      <ShimmerTournamentCard />
                      <ShimmerTournamentCard />
                      <ShimmerTournamentCard />
                    </>
                  ) : (
                    <Suspense fallback={<LoadingFallback />}>
                      {tournamentData.map((tournament, index) => (
                        <TournamentCard
                          key={tournament.id}
                          data={tournament}
                          index={index}
                        />
                      ))}
                    </Suspense>
                  )}
                </VStack>
              </EnhancedTabs>
            </Suspense>
          </VStack>
        </Box>

        <Suspense fallback={null}>
          <ChampionDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            champion={selectedChampion}
          />
        </Suspense>
      </Box>
    </Suspense>
  )
}

export default HallOfChampions
