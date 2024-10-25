// src/components/quizComponents/ProgressChart.jsx
import React, { useMemo } from 'react'
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
import { CHART_STYLES } from '../../../models/submittedQuizInterfaceConstants'

// Register Chart.js components
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

const ProgressChart = React.memo(
  ({ step, pastRQMs, isTournament, animationDelay }) => {
    const { t } = useTranslation('SubmittedQuizInterface')

    const chartConfig = useMemo(() => {
      if (!pastRQMs?.length) return null

      const labels = Array.from(
        { length: pastRQMs.length - 1 },
        (_, i) => `${t('quiz')} ${i + 1}`,
      ).concat([t('currentQuiz')])

      return {
        data: {
          labels,
          datasets: [
            {
              label: t('rqmScore'),
              data: pastRQMs,
              fill: false,
              ...CHART_STYLES[isTournament ? 'TOURNAMENT' : 'REGULAR'],
              pointStyle: 'circle',
              pointRadius: 5,
              pointBorderWidth: 2,
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 2000,
            easing: 'easeInOutQuart',
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.8)',
                font: { weight: 'bold' },
              },
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.8)',
                font: { weight: 'bold' },
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                color: 'rgba(255, 255, 255, 0.8)',
                font: { weight: 'bold' },
              },
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              padding: 10,
              displayColors: false,
              callbacks: {
                label: context => `RQM Score: ${context.raw}`,
              },
            },
          },
        },
      }
    }, [pastRQMs, isTournament, t])

    if (step < 4 || !pastRQMs?.length) return null

    return (
      <MotionBox
        transition={{ duration: 0.3, delay: animationDelay }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        bg="whiteAlpha.50"
        rounded="xl"
        p={4}
        borderWidth={1}
        borderColor="whiteAlpha.100"
        w={'100%'}
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
          <Line data={chartConfig.data} options={chartConfig.options} />
        </Box>
      </MotionBox>
    )
  },
)

export default ProgressChart
