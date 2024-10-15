import React, { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Select,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Text,
} from '@chakra-ui/react'
import axios from 'axios'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const TournamentFeedbackAnalysis = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState({ averageRating: 0, totalFeedback: 0 })
  const [loading, setLoading] = useState(false)
  const [tournamentId, setTournamentId] = useState('')
  const [tournamentFeedback, setTournamentFeedback] = useState([])
  const [tournaments, setTournaments] = useState([])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/admin/feedback/tournament/stats')
      setStats(response.data)

      if (tournamentId) {
        const feedbackResponse = await axios.get(
          `/api/admin/feedback/tournament/${tournamentId}`,
        )
        setTournamentFeedback(feedbackResponse.data)
      }
    } catch (error) {
      console.error('Error fetching tournament feedback stats:', error)
    }
    setLoading(false)
  }

  const fetchTournaments = async () => {
    try {
      const response = await axios.get('/api/admin/tournaments')
      setTournaments(response.data)
    } catch (error) {
      console.error('Error fetching tournaments:', error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchStats()
      fetchTournaments()
    }
  }, [isOpen, tournamentId])

  const chartData = {
    labels: ['Average Rating', 'Total Feedback'],
    datasets: [
      {
        label: 'Tournament Feedback Stats',
        data: [stats.averageRating, stats.totalFeedback],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: ['rgb(75, 192, 192)', 'rgb(153, 102, 255)'],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Tournament Feedback Analysis' },
    },
    scales: { y: { beginAtZero: true } },
  }

  const selectStyles = {
    bg: 'black',
    color: 'white',
    borderColor: 'gray.600',
    _hover: {
      borderColor: 'gray.500',
    },
    _focus: {
      borderColor: 'blue.300',
      boxShadow: '0 0 0 1px #3182ce',
    },
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={'4xl'}>
      <ModalOverlay />
      <ModalContent
        bg="rgba(15, 13, 21, 1)"
        borderRadius="xl"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        border="1px solid rgba(255, 255, 255, 0.18)"
        color={'white'}
      >
        <ModalHeader>Tournament Feedback Analysis</ModalHeader>
        <ModalCloseButton />
        <ModalBody w={'80%'}>
          <VStack spacing={4} align="stretch">
            <Select
              value={tournamentId}
              onChange={e => setTournamentId(e.target.value)}
              placeholder="Select tournament"
              {...selectStyles}
            >
              {tournaments.map(tournament => (
                <option
                  key={tournament._id}
                  value={tournament._id}
                  style={{ backgroundColor: 'black' }}
                >
                  {tournament.name}
                </option>
              ))}
            </Select>
            <Box borderWidth={1} borderRadius="lg" p={4}>
              <Stat>
                <StatLabel>Average Rating</StatLabel>
                <StatNumber>{stats.averageRating.toFixed(2)}</StatNumber>
                <StatHelpText>Out of 5</StatHelpText>
                <Progress
                  value={(stats.averageRating / 5) * 100}
                  colorScheme="green"
                />
              </Stat>
            </Box>
            <Box borderWidth={1} borderRadius="lg" p={4}>
              <Stat>
                <StatLabel>Total Feedback</StatLabel>
                <StatNumber>{stats.totalFeedback}</StatNumber>
              </Stat>
            </Box>
            <Box h={'300px'}>
              <Bar data={chartData} options={chartOptions} />
            </Box>
            {tournamentId && (
              <Box borderWidth={1} borderRadius="lg" p={4}>
                <Text fontSize="xl" fontWeight="bold" mb={2}>
                  Individual Feedback
                </Text>
                {tournamentFeedback.map((feedback, index) => (
                  <Box key={index} mb={2}>
                    <Text>Rating: {feedback.rating}/5</Text>
                    <Text>Comment: {feedback.comment}</Text>
                  </Box>
                ))}
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} colorScheme="blue">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default TournamentFeedbackAnalysis
