import React, { useState, useEffect } from 'react'
import { Box, VStack, useToast } from '@chakra-ui/react'
import AnimatedBackground from '../components/HallOfChampions/AnimatedBackground'
import ChampionCard from '../components/HallOfChampions/ChampionCard'
import TournamentCard from '../components/HallOfChampions/TournamentCard'
import HallOfChampionsHeader from '../components/HallOfChampions/HallOfChampionsHeader'
import ChampionDetailsModal from '../components/HallOfChampions/ChampionDetailsModal'
import EnhancedTabs from '../components/HallOfChampions/EnhancedTabs'
import ShimmerTournamentCard from '../components/HallOfChampions/ShimmerTournamentCard'

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
    <Box minH="100vh" position="relative">
      <AnimatedBackground />

      <Box
        position="relative"
        zIndex="1"
        pt={{ base: '60px', md: '80px' }}
        pb={8}
      >
        <HallOfChampionsHeader />

        <VStack maxW="1200px" mx="auto" px={4} spacing={8}>
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
                championsData.map((champion, index) => (
                  <ChampionCard
                    key={champion.id || index}
                    champion={champion}
                    index={index}
                    onClick={() => handleChampionClick(champion)}
                  />
                ))
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
                tournamentData.map((tournament, index) => (
                  <TournamentCard
                    key={tournament.id}
                    data={tournament}
                    index={index}
                  />
                ))
              )}
            </VStack>
          </EnhancedTabs>
        </VStack>
      </Box>

      <ChampionDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        champion={selectedChampion}
      />
    </Box>
  )
}

export default HallOfChampions
