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

const themes = [
  { value: 'space', label: 'Space' },
  { value: 'indian_mythology', label: 'Indian Mythology' },
  { value: 'bible_mythology', label: 'Bible Mythology' },
  { value: 'greek_mythology', label: 'Greek Mythology' },
  { value: 'scifi', label: 'Sci-Fi' },
  { value: 'mystic_world', label: 'Mystic World' },
]

const StoryFeedbackAnalysis = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState('')
  const [theme, setTheme] = useState('')
  const [stats, setStats] = useState({ averageRating: 0, totalFeedback: 0 })
  const [loading, setLoading] = useState(false)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/admin/feedback/story/stats', {
        params: { category, theme },
      })
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching story feedback stats:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      fetchStats()
    }
  }, [isOpen, category, theme])

  const chartData = {
    labels: ['Average Rating', 'Total Feedback'],
    datasets: [
      {
        label: 'Story Feedback Stats',
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
      title: { display: true, text: 'Story Feedback Analysis' },
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
        <ModalHeader>Story Feedback Analysis</ModalHeader>
        <ModalCloseButton />
        <ModalBody w={'80%'}>
          <VStack spacing={4} align="stretch">
            <HStack>
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
              <Select
                value={theme}
                onChange={e => setTheme(e.target.value)}
                placeholder="Select theme"
                {...selectStyles}
              >
                {themes.map(({ value, label }) => (
                  <option
                    key={value}
                    value={value}
                    style={{ backgroundColor: 'black' }}
                  >
                    {label}
                  </option>
                ))}
              </Select>
            </HStack>
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

export default StoryFeedbackAnalysis
