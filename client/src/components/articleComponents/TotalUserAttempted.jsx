import React, { useState, useEffect, useContext, useRef } from 'react'
import { Button, Flex, Text, Box } from '@chakra-ui/react'
import { AppContext } from '../../contextAPI/appContext'
import { Chart, registerables } from 'chart.js'
import axios from 'axios'
Chart.register(...registerables)

const TotalUserAttempted = ({
  css,
  totalUsersGivenQuiz,
  notLoggedIn,
  RQM_score,
  articleId,
}) => {
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
        labels: ['Attempted', 'Avg. Score', 'Your Score'],
        datasets: [
          {
            label: 'Quiz Statistics',
            data: [updatedTotalUsersGivenQuiz, avgRQM, RQM_score],
            backgroundColor: [
              'rgba(253, 226, 243, 0.6)',
              'rgba(229, 190, 236, 0.6)',
              'rgba(145, 127, 179, 0.6)',
            ],
            borderColor: [
              'rgba(253, 226, 243, 1)',
              'rgba(229, 190, 236, 1)',
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
      css={css}
      borderRadius="8px"
      backgroundColor="#1a1527"
      mb={{ base: '1rem', md: '2rem' }}
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      p={{ base: '1rem', md: '1.5rem' }}
    >
      <Box className="sidebar" w="100%">
        <Box mb={{ base: '4', md: '6' }}>
          <Text as="h3" fontSize={{ base: 'lg', md: 'xl' }} color="white">
            Quiz Statistics
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
