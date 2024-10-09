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
  HStack,
  Select,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
} from '@chakra-ui/react'
import axios from 'axios'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const categories = [
  'top',
  'general',
  'world',
  'politics',
  'business',
  'technology',
  'sports',
  'health',
  'science',
  'environment',
  'crime',
  'education',
  'entertainment',
  'food',
  'lifestyle',
  'tourism',
]

const QuizFeedbackAnalysis = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState('')
  const [stats, setStats] = useState({ averageRating: 0, totalFeedback: 0 })
  const [loading, setLoading] = useState(false)
  const [quizId, setQuizId] = useState('')
  const [quizFeedback, setQuizFeedback] = useState([])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/admin/feedback/quiz/stats', {
        params: { category },
      })
      setStats(response.data)

      if (quizId) {
        const feedbackResponse = await axios.get(
          '/api/admin/feedback/quiz/:quizId',
          {
            params: { quizId },
          },
        )
        setQuizFeedback(feedbackResponse.data)
      }
    } catch (error) {
      console.error('Error fetching quiz feedback stats:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      fetchStats()
    }
  }, [isOpen, category, quizId])

  const chartData = {
    labels: ['Average Rating', 'Total Feedback'],
    datasets: [
      {
        label: 'Quiz Feedback Stats',
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
      title: { display: true, text: 'Quiz Feedback Analysis' },
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
        <ModalHeader>Quiz Feedback Analysis</ModalHeader>
        <ModalCloseButton />
        <ModalBody w={'80%'}>
          <VStack spacing={4} align="stretch">
            <Select
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="Select category"
              {...selectStyles}
            >
              {categories.map(cat => (
                <option
                  key={cat}
                  value={cat}
                  style={{ backgroundColor: 'black' }}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
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

export default QuizFeedbackAnalysis
