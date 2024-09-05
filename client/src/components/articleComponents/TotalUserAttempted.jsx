import React, { useState, useEffect, useRef } from 'react'
import { Text, Box } from '@chakra-ui/react'
import { Chart, registerables } from 'chart.js'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
Chart.register(...registerables)

const TotalUserAttempted = ({
  totalUsersGivenQuiz,
  notLoggedIn,
  RQM_score,
  articleId,
}) => {
  const { t } = useTranslation('TotalUserAttempted')
  const [updatedTotalUsersGivenQuiz, setUpdatedTotalUsersGivenQuiz] =
    useState(totalUsersGivenQuiz)
  const [avgRQM, setAvgRQM] = useState(0)
  const chartRef = useRef(null)

  const getAvgRQM = async () => {
    try {
      const { data } = await axios.get(
        `/api/articles/getAvgRQMOnArticle?articleId=${articleId}`,
      )
      setAvgRQM(data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getAvgRQM()
    setUpdatedTotalUsersGivenQuiz(totalUsersGivenQuiz)
  }, [totalUsersGivenQuiz])

  useEffect(() => {
    if (totalUsersGivenQuiz === null) return

    const ctx = document.getElementById('quizChart').getContext('2d')

    // Destroy existing chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    // Create new chart
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [t('Attempted'), t('AvgScore'), t('YourScore')],
        datasets: [
          {
            label: t('quizStatistics'),
            data: [updatedTotalUsersGivenQuiz, avgRQM, RQM_score],
            backgroundColor: [
              'rgba(253, 226, 243, 0.6)',
              'rgba(229, 190, 237, 0.6)',
              'rgba(145, 127, 179, 0.6)',
            ],
            borderColor: [
              'rgba(253, 226, 243, 1)',
              'rgba(229, 190, 237, 1)',
              'rgba(145, 127, 179, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#e0e0e0',
            },
          },
          x: {
            ticks: {
              color: '#e0e0e0',
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: '#e0e0e0',
            },
          },
        },
      },
    })

    // Cleanup function to destroy chart when component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [updatedTotalUsersGivenQuiz, RQM_score, avgRQM])

  return (
    <Box
      style={
        notLoggedIn
          ? { filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }
          : { userSelect: 'text', border: '2px', padding: '1.5rem' }
      }
      // css={css}
      borderRadius="8px"
      backgroundColor="rgba(26, 21, 39, 0.7)"
      mb={{ base: '1rem', md: '2rem' }}
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      p={{ base: '1rem', md: '1.5rem' }}
    >
      <Box className="sidebar" w="100%">
        <Box mb={{ base: '4', md: '6' }}>
          <Text fontSize={{ base: '1.2rem', md: '1.7rem' }} color="white">
            {t('quizStatistics')}
          </Text>
          <Box
            as="canvas"
            id="quizChart"
            width="100%"
            height={{ base: '200', md: '400' }}
          ></Box>
        </Box>
      </Box>
    </Box>
  )
}

export default TotalUserAttempted
