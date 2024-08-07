import React, { useContext, useEffect, useRef, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Button,
  Flex,
  Image,
  Spinner,
  Tag,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react'
import Chart from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import axios from 'axios'
import ExpectedIQModal from '../articleComponents/ExpectedIQModal'
import { AppContext } from '../../contextAPI/appContext'
import Lock from '/images/lock.webp'
import useSound from '../../customHooks/useSound'
import { useSelector } from 'react-redux'

const IQBarGraph = ({
  barGraph,
  privateBarGraph,
  loginedUserProfile,
  viewingHistory = false,
}) => {
  const { playClick } = useContext(AppContext)
  const { user } = useSelector(state => state.auth)
  const [USER_IQ, setUSER_IQ] = useState(null) // [USER_IQ, setUSER_IQ
  const [TOP_PERCENT, setTOP_PERCENT] = useState(null)
  const [filteredIQData, setFilteredIQData] = useState(null)
  const [filteredLabels, setFilteredLabels] = useState(null)
  const [percentileData, setPercentileData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()
  const [hoveredPercentile, setHoveredPercentile] = useState(null)
  const [isHovering, setIsHovering] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [currentData, setCurrentData] = useState(null)
  const [expectedIQ, setExpectedIQ] = useState(0)
  const [showExpectedIQ, setShowExpectedIQ] = useState(false)

  //console.log(filteredLabels, filteredIQData);
  const [chartData, setChartData] = useState(null)

  const handleHover = (event, array) => {
    setIsHovering(true)
    //console.log(array);
    //console.log("hovering");
    if (array && array.length) {
      const point = array[0]
      const index = point.index
      const percentile = percentileData[index].percentile

      setHoveredIndex(index)
      //console.log(percentile);
      setHoveredPercentile(percentile)
    } else {
      setHoveredPercentile(TOP_PERCENT)
    }
  }
  const options = {
    animation: {
      duration: 0,
    },
    indexAxis: 'x',
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        grid: {
          display: false,
        },
        ticks: {
          display: false,
          stepSize: 1,
        },
      },
      x: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    },
    plugins: {
      tooltip: {
        enabled: false, // Disable default tooltip
      },
      legend: {
        display: false,
      },
      minHeightBar: {
        minHeight: 100, // Minimum height for each bar (in pixels)
      },
    },
    layout: {
      padding: {
        left: 5,
        right: 5,
      },
    },
    onHover: handleHover,
    hover: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      line: {
        borderWidth: 0, // Hide the line
      },
      point: {
        radius: 10, // Hide the point
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  }
  const chartRef = useRef(null)
  const fetchBarIQData = async () => {
    try {
      //const response = await axios.get(`/api/user/currentTopPercentOfUser`);

      setUSER_IQ(barGraph.USER_IQ)
      setTOP_PERCENT(barGraph.Top_Percentage)
      setHoveredPercentile(barGraph.Top_Percentage)
      setPercentileData(barGraph.percentileData)
      setFilteredLabels(barGraph.filteredLabels)
      setFilteredIQData(barGraph.filteredIQData)
      setChartData({
        labels: barGraph.filteredLabels,
        datasets: [
          {
            label: 'Number of People',
            data: barGraph.filteredIQData,
            backgroundColor: barGraph.filteredLabels.map(threshold => {
              const [lowerBound, upperBound] = threshold.split('-').map(Number)

              //console.log(USER_IQ, lowerBound, upperBound);

              // Check if USER_IQ falls within the range
              return barGraph.USER_IQ < lowerBound + 10 &&
                barGraph.USER_IQ >= lowerBound
                ? '#776B5D'
                : '#DED0B6'
            }),
            borderColor: '#1a1527',
            borderRadius: '5',
            minBarLength: '15',
          },
        ],
      })
    } catch (error) {
      toast({
        title: 'An error occurred.',
        description: 'Unable to fetch IQ Bar Data. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {
    fetchBarIQData()
  }, [barGraph])
  useEffect(() => {
    const chartCanvas = chartRef.current?.canvas
    const handleMouseLeave = () => {
      setIsHovering(false)
      setHoveredIndex(null)
      setHoveredPercentile(TOP_PERCENT)
      setCurrentData(null)
    }

    if (chartCanvas) {
      chartCanvas.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (chartCanvas) {
        chartCanvas.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [isHovering])

  useEffect(() => {
    if (percentileData) {
      const count = percentileData[hoveredIndex]
        ? percentileData[hoveredIndex].count
        : null
      const range = percentileData[hoveredIndex]
        ? `${percentileData[hoveredIndex].lowerBound}-${percentileData[hoveredIndex].upperBound}`
        : null
      setCurrentData({ range, count })
    }
    if (chartData) {
      setChartData(prevChartData => ({
        ...prevChartData,
        datasets: prevChartData.datasets.map(dataset => ({
          ...dataset,
          backgroundColor: filteredLabels.map((threshold, idx) => {
            const [lowerBound, upperBound] = threshold.split('-').map(Number)
            return (USER_IQ < lowerBound + 10 &&
              USER_IQ >= lowerBound &&
              !isHovering) ||
              idx === hoveredIndex
              ? '#776B5D'
              : '#DED0B6'
          }),
        })),
      }))
    }
  }, [hoveredIndex])

  const getExpectedIQ = async () => {
    playClick()
    setIsLoading(true)
    try {
      const response = await axios.get('/api/user/expectedIQScore')
      if (response.data.ExpectedIQScore) {
        setExpectedIQ(response.data.ExpectedIQScore)
      }
      setShowExpectedIQ(true)
    } catch (error) {
      toast({
        title: 'An error occurred.',
        description: 'Unable to fetch expected IQ. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Flex
      w={'100%'}
      padding={{ base: '20px', xl: '0' }}
      flexDirection={'column'}
      flex={1}
      justifyContent={'center'}
      alignItems={'center'}
      backgroundColor={{ base: 'rgba(15, 13, 21, 0.8)', xl: 'transparent' }}
      boxShadow={{
        xl: 'none',
        base: '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
      }}
      className="iq-bar-graph"
    >
      {showExpectedIQ && (
        <ExpectedIQModal
          expectedIQ={expectedIQ}
          setShowExpectedIQ={setShowExpectedIQ}
        />
      )}
      {privateBarGraph ? (
        <Flex
          h={'100%'}
          w={'100%'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Text
            backgroundColor="#0f0d15"
            m={0}
            top={0}
            right={10}
            color={'#9CAFAA'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            w={'60px'}
            height={'30px'}
          >
            Hidden
          </Text>
        </Flex>
      ) : isLoading ? (
        <Spinner />
      ) : USER_IQ === 0 ? (
        <Flex
          w={'100%'}
          justifyContent={'center'}
          alignItems={'center'}
          flexDirection={'column'}
          position={'relative'}
          px={5}
        >
          <Text m={0}>
            {viewingHistory
              ? `No Data Available`
              : `Give 10 Quizzes to get the IQ score and Unlock the bar graph`}
          </Text>

          <Button
            backgroundColor="transparent"
            onClick={getExpectedIQ}
            h={'200px'}
            w={'200px'}
            borderRadius={'50%'}
            _hover={{
              backgroundColor: { base: '#0f0d15', xl: 'transparent' },
              backgroundImage: {
                xl: 'none',
                base: 'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
              },
              boxShadow: {
                xl: 'none',
                base: '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
              },
            }}
            _active={{
              bg: '#dddfe2',
              transform: 'scale(0.98)',
              borderColor: '#bec3c9',
            }}
          >
            <Image
              h={'200px'}
              w={'200px'}
              background={'transparent'}
              src={Lock}
            />
          </Button>
        </Flex>
      ) : (
        <>
          <Flex width={'100%'} position={'relative'}>
            <Flex marginStart={'15px'} flexDirection={'column'}>
              <Text textAlign={'left'} color={'#9CAFAA'} p={0} m={0}>
                Top
              </Text>
              <Text textAlign={'left'} fontSize={'1.5rem'}>
                {hoveredPercentile}%
              </Text>
            </Flex>
            {currentData && currentData.range && currentData.count ? (
              <Flex marginLeft={'40px'} flexDirection={'column'}>
                <Text textAlign={'left'} color={'#9CAFAA'} p={0} m={0}>
                  {currentData.range}
                </Text>

                <Text textAlign={'left'}>{currentData.count} users</Text>
              </Flex>
            ) : null}
            {loginedUserProfile && (
              <Tooltip label="Visibility to others">
                <Tag
                  backgroundColor="#0f0d15"
                  m={0}
                  position={'absolute'}
                  top={0}
                  right={0}
                  color={'#9CAFAA'}
                  display={'flex'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  w={'60px'}
                  height={'30px'}
                >
                  {user.profilePrivacy.barGraph ? 'HIDDEN' : 'VISIBLE'}
                </Tag>
              </Tooltip>
            )}
          </Flex>
          <Flex height={'150px'} width={'100%'} justifyContent={'center'}>
            {chartData && (
              <Bar ref={chartRef} data={chartData} options={options} />
            )}
          </Flex>
        </>
      )}
    </Flex>
  )
}

export default IQBarGraph
