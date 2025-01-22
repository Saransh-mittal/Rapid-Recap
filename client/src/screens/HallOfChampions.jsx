import React, { useState } from 'react'
import { Box, VStack } from '@chakra-ui/react'
import AnimatedBackground from '../components/HallOfChampions/AnimatedBackground'
import ChampionCard from '../components/HallOfChampions/ChampionCard'
import TournamentCard from '../components/HallOfChampions/TournamentCard'
import HallOfChampionsHeader from '../components/HallOfChampions/HallOfChampionsHeader'
import ChampionDetailsModal from '../components/HallOfChampions/ChampionDetailsModal'
import EnhancedTabs from '../components/HallOfChampions/EnhancedTabs'
import { useTranslation } from 'react-i18next'

const HallOfChampions = () => {
  const [selectedChampion, setSelectedChampion] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleChampionClick = champion => {
    setSelectedChampion(champion)
    setIsModalOpen(true)
  }
  return (
    <Box minH="100vh" position="relative">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Content Container */}
      <Box
        position="relative"
        zIndex="1"
        pt={{ base: '60px', md: '80px' }}
        pb={8}
      >
        <HallOfChampionsHeader />

        {/* Content Section */}
        <VStack maxW="1200px" mx="auto" px={4} spacing={8}>
          <EnhancedTabs
            onTabChange={() => {
              //add logic here
            }}
          >
            <VStack spacing={4}>
              {championsData.map((champion, index) => (
                <ChampionCard
                  key={champion.id}
                  champion={champion}
                  index={index}
                  onClick={() => handleChampionClick(champion)}
                />
              ))}
            </VStack>
            <VStack spacing={4}>
              {tournamentData.map((champion, index) => (
                <TournamentCard
                  key={champion.id}
                  data={champion}
                  index={index}
                />
              ))}
            </VStack>
          </EnhancedTabs>
        </VStack>
      </Box>
      {/* Champion Details Modal */}
      <ChampionDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        champion={selectedChampion}
      />
    </Box>
  )
}

export default HallOfChampions
const championsData = [
  {
    id: 1,
    name: 'Seema Tayal',
    username: '@SeemaTayal',
    avatar: 'ST',
    iqScore: {
      start: 150.2,
      final: 153.9,
      peak: 154.1,
    },
    expLevel: 44,
    submissions: 940,
    rqmScore: {
      average: 41,
      highest: 45,
    },
    quizStats: {
      total: 120,
      perfectScores: 15,
    },
    society: 'Titans',
    circle: 'Elite Performers',
    finalRank: 1,
    displayName: 'Seema Tayal',
    profilePicture: 'https://example.com/images/ST.jpg',
    month: 1,
    year: 2025,
  },
  {
    id: 2,
    name: 'Sima Mittal',
    username: '@SimaMittal',
    avatar: 'SM',
    iqScore: {
      start: 152.0,
      final: 153.6,
      peak: 153.8,
    },
    expLevel: 56,
    submissions: 775,
    rqmScore: {
      average: 42,
      highest: 44,
    },
    quizStats: {
      total: 110,
      perfectScores: 12,
    },
    society: 'Titans',
    circle: 'Strong Finishers',
    finalRank: 2,
    displayName: 'Sima Mittal',
    profilePicture: 'https://example.com/images/SM.jpg',
    month: 1,
    year: 2025,
  },
  {
    id: 3,
    name: 'Nikhil Varshney',
    username: '@Nikhil',
    avatar: 'NV',
    iqScore: {
      start: 148.5,
      final: 150.3,
      peak: 151.2,
    },
    expLevel: 36,
    submissions: 357,
    rqmScore: {
      average: 59,
      highest: 62,
    },
    quizStats: {
      total: 105,
      perfectScores: 10,
    },
    society: 'Titans',
    circle: 'Top Scientists',
    finalRank: 3,
    displayName: 'Nikhil Varshney',
    profilePicture: 'https://example.com/images/NV.jpg',
    month: 1,
    year: 2025,
  },
  {
    id: 4,
    name: 'Saransh Mittal',
    username: '@saransh_1234',
    avatar: 'SM',
    iqScore: {
      start: 146.5,
      final: 147.3,
      peak: 148.0,
    },
    expLevel: 54,
    submissions: 501,
    rqmScore: {
      average: 60,
      highest: 63,
    },
    quizStats: {
      total: 95,
      perfectScores: 8,
    },
    society: 'Mavericks',
    circle: 'Innovators Circle',
    finalRank: 4,
    displayName: 'Saransh Mittal',
    profilePicture: 'https://example.com/images/Saransh.jpg',
    month: 1,
    year: 2025,
  },
  {
    id: 5,
    name: 'Priya Sharma',
    username: '@PriyaS',
    avatar: 'PS',
    iqScore: {
      start: 144.5,
      final: 145.8,
      peak: 146.2,
    },
    expLevel: 48,
    submissions: 620,
    rqmScore: {
      average: 55,
      highest: 58,
    },
    quizStats: {
      total: 95,
      perfectScores: 9,
    },
    society: 'Innovators',
    circle: 'Historians Club',
    finalRank: 5,
    displayName: 'Priya Sharma',
    profilePicture: 'https://example.com/images/PS.jpg',
    month: 1,
    year: 2025,
  },
  {
    id: 6,
    name: 'Amit Patel',
    username: '@AmitP123',
    avatar: 'AP',
    iqScore: {
      start: 143.0,
      final: 144.1,
      peak: 144.5,
    },
    expLevel: 39,
    submissions: 488,
    rqmScore: {
      average: 63,
      highest: 66,
    },
    quizStats: {
      total: 90,
      perfectScores: 7,
    },
    society: 'Titans',
    circle: 'Tech Wizards',
    finalRank: 6,
    displayName: 'Amit Patel',
    profilePicture: 'https://example.com/images/AP.jpg',
    month: 1,
    year: 2025,
  },
  {
    id: 7,
    name: 'Divya Kapoor',
    username: '@DivyaK',
    avatar: 'DK',
    iqScore: {
      start: 141.5,
      final: 142.5,
      peak: 143.0,
    },
    expLevel: 51,
    submissions: 555,
    rqmScore: {
      average: 58,
      highest: 60,
    },
    quizStats: {
      total: 85,
      perfectScores: 6,
    },
    society: 'Innovators',
    circle: 'Creative Minds',
    finalRank: 7,
    displayName: 'Divya Kapoor',
    profilePicture: 'https://example.com/images/DK.jpg',
    month: 1,
    year: 2025,
  },
  {
    id: 8,
    name: 'Rajesh Kumar',
    username: '@RajeshK',
    avatar: 'RK',
    iqScore: {
      start: 140.5,
      final: 141.9,
      peak: 142.3,
    },
    expLevel: 42,
    submissions: 410,
    rqmScore: {
      average: 61,
      highest: 64,
    },
    quizStats: {
      total: 75,
      perfectScores: 5,
    },
    society: 'Mavericks',
    circle: 'Sports Enthusiasts',
    finalRank: 8,
    displayName: 'Rajesh Kumar',
    profilePicture: 'https://example.com/images/RK.jpg',
    month: 1,
    year: 2025,
  },
  {
    id: 9,
    name: 'Sneha Reddy',
    username: '@SnehaR',
    avatar: 'SR',
    iqScore: {
      start: 139.0,
      final: 140.2,
      peak: 141.0,
    },
    expLevel: 45,
    submissions: 380,
    rqmScore: {
      average: 65,
      highest: 68,
    },
    quizStats: {
      total: 70,
      perfectScores: 4,
    },
    society: 'Titans',
    circle: 'Elite Thinkers',
    finalRank: 9,
    displayName: 'Sneha Reddy',
    profilePicture: 'https://example.com/images/SR.jpg',
    month: 1,
    year: 2025,
  },
  {
    id: 10,
    name: 'Vikram Singh',
    username: '@VikramS',
    avatar: 'VS',
    iqScore: {
      start: 138.0,
      final: 139.5,
      peak: 140.0,
    },
    expLevel: 37,
    submissions: 320,
    rqmScore: {
      average: 68,
      highest: 70,
    },
    quizStats: {
      total: 65,
      perfectScores: 3,
    },
    society: 'Innovators',
    circle: 'Visionaries',
    finalRank: 10,
    displayName: 'Vikram Singh',
    profilePicture: 'https://example.com/images/VS.jpg',
    month: 1,
    year: 2025,
  },
]

const tournamentData = [
  {
    id: 1,
    name: 'Nikhil Varshney',
    username: '@Nikhil',
    totalScore: 2500,
    categoriesPlayed: ['General', 'Science', 'Technology'],
    bestCategory: { name: 'Science', score: 950 },
    badges: [{ type: 'ACE', category: 'Science' }],
  },
  {
    id: 2,
    name: 'Priya Sharma',
    username: '@PriyaS',
    totalScore: 2350,
    categoriesPlayed: ['History', 'Geography', 'General'],
    bestCategory: { name: 'History', score: 880 },
    badges: [
      { type: 'MVP', category: 'History' },
      { type: 'STAR', category: 'General' },
    ],
  },
  {
    id: 3,
    name: 'Amit Patel',
    username: '@AmitP123',
    totalScore: 2100,
    categoriesPlayed: ['Technology', 'Mathematics', 'Science'],
    bestCategory: { name: 'Technology', score: 800 },
    badges: [{ type: 'EXPERT', category: 'Technology' }],
  },
  {
    id: 4,
    name: 'Divya Kapoor',
    username: '@DivyaK',
    totalScore: 2200,
    categoriesPlayed: ['Literature', 'Arts', 'History'],
    bestCategory: { name: 'Literature', score: 850 },
    badges: [
      { type: 'MASTER', category: 'Literature' },
      { type: 'ACE', category: 'Arts' },
    ],
  },
  {
    id: 5,
    name: 'Rajesh Kumar',
    username: '@RajeshK',
    totalScore: 1950,
    categoriesPlayed: ['General', 'Sports', 'Entertainment'],
    bestCategory: { name: 'Sports', score: 750 },
    badges: [{ type: 'STAR', category: 'Sports' }],
  },
]
