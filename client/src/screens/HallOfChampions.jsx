import React from 'react'
import { Box, VStack } from '@chakra-ui/react'
import AnimatedBackground from '../components/HallOfChampions/AnimatedBackground'
import ChampionCard from '../components/HallOfChampions/ChampionCard'
import TournamentCard from '../components/HallOfChampions/TournamentCard'
import HallOfChampionsHeader from '../components/HallOfChampions/HallOfChampionsHeader'
import EnhancedTabs from '../components/HallOfChampions/EnhancedTabs'

const HallOfChampions = () => {
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
    iqScore: 153.9,
    expLevel: 44,
    submissions: 940,
    rqm: 41,
    society: 'Titans',
    streak: 7,
    rank: 1,
  },
  {
    id: 2,
    name: 'Sima Mittal',
    username: '@SimaMittal',
    avatar: 'SM',
    iqScore: 153.6,
    expLevel: 56,
    submissions: 775,
    rqm: 42,
    society: 'Titans',
    streak: 5,
    rank: 2,
  },
  // Additional mock data for ranks 3-10
  {
    id: 3,
    name: 'Nikhil Varshney',
    username: '@Nikhil',
    avatar: 'NV',
    iqScore: 150.3,
    expLevel: 36,
    submissions: 357,
    rqm: 59,
    society: 'Titans',
    streak: 3,
    rank: 3,
  },
  {
    id: 4,
    name: 'Saransh Mittal',
    username: '@saransh_1234',
    avatar: 'SM',
    iqScore: 147.3,
    expLevel: 54,
    submissions: 501,
    rqm: 60,
    society: 'Mavericks',
    streak: 4,
    rank: 4,
  },
  // Add remaining mock data for ranks 5-10 here...
  {
    id: 5,
    name: 'Priya Sharma',
    username: '@PriyaS',
    avatar: 'PS',
    iqScore: 145.8,
    expLevel: 48,
    submissions: 620,
    rqm: 55,
    society: 'Innovators',
    streak: 6,
    rank: 5,
  },
  {
    id: 6,
    name: 'Amit Patel',
    username: '@AmitP123',
    avatar: 'AP',
    iqScore: 144.1,
    expLevel: 39,
    submissions: 488,
    rqm: 63,
    society: 'Titans',
    streak: 2,
    rank: 6,
  },
  {
    id: 7,
    name: 'Divya Kapoor',
    username: '@DivyaK',
    avatar: 'DK',
    iqScore: 142.5,
    expLevel: 51,
    submissions: 555,
    rqm: 58,
    society: 'Innovators',
    streak: 8,
    rank: 7,
  },
  {
    id: 8,
    name: 'Rajesh Kumar',
    username: '@RajeshK',
    avatar: 'RK',
    iqScore: 141.9,
    expLevel: 42,
    submissions: 410,
    rqm: 61,
    society: 'Mavericks',
    streak: 1,
    rank: 8,
  },
  {
    id: 9,
    name: 'Sneha Reddy',
    username: '@SnehaR',
    avatar: 'SR',
    iqScore: 140.2,
    expLevel: 45,
    submissions: 380,
    rqm: 65,
    society: 'Titans',
    streak: 9,
    rank: 9,
  },
  {
    id: 10,
    name: 'Vikram Singh',
    username: '@VikramS',
    avatar: 'VS',
    iqScore: 139.5,
    expLevel: 37,
    submissions: 320,
    rqm: 68,
    society: 'Innovators',
    streak: 3,
    rank: 10,
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
