// src/components/quizComponents/submittedQuizInterface/ProgressChart.jsx

import React from 'react'
import { Box, Flex, Icon, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Register the required chart elements and scales
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

const MotionBox = motion(Box)

const ProgressChart = ({ step, pastRQMs, isTournament }) => {
  const { t } = useTranslation('SubmittedQuizInterface')

  if (step < 4 || !pastRQMs?.length) return null

  const labels = Array.from(
    { length: pastRQMs.length - 1 },
    (_, i) => `${t('quiz')} ${i + 1}`,
  )
  labels.push(t('currentQuiz'))

  const chartData = {
    labels,
    datasets: [
      {
        label: t('rqmScore'),
        data: pastRQMs,
        fill: false,
        backgroundColor: isTournament
          ? 'rgba(255, 215, 0, 0.6)'
          : 'rgba(138, 43, 226, 0.6)',
        borderColor: isTournament
          ? 'rgba(255, 215, 0, 1)'
          : 'rgba(138, 43, 226, 1)',
        pointStyle: 'circle',
        pointRadius: 5,
        pointBorderColor: isTournament ? '#FFD700' : '#8A2BE2',
        pointBorderWidth: 2,
        tension: 0.1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            weight: 'bold',
          },
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            weight: 'bold',
          },
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            weight: 'bold',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
  }

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      bg="whiteAlpha.50"
      backdropFilter="blur(8px)"
      rounded="xl"
      p={4}
      borderWidth={1}
      borderColor="whiteAlpha.100"
    >
      <Flex align="center" gap={2} mb={3}>
        <Icon
          as={Star}
          boxSize={5}
          color={isTournament ? 'yellow.400' : 'purple.400'}
        />
        <Text
          fontSize="sm"
          fontWeight="medium"
          color={isTournament ? 'yellow.200' : 'purple.200'}
        >
          {t('todaysRqmUpdate')}
        </Text>
      </Flex>

      <Box position="relative" w="100%" h="200px">
        <Line data={chartData} options={chartOptions} />
      </Box>
    </MotionBox>
  )
}

export default ProgressChart
