import React, {
  useEffect,
  useState,
  lazy,
  Suspense,
  useCallback,
  useMemo,
} from 'react'
import {
  Flex,
  Image,
  Spinner,
  Tag,
  Text,
  Tooltip,
  useBreakpointValue,
  useToast,
} from '@chakra-ui/react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'

import Lock from '/images/lock.webp'
import useSound from '../../customHooks/useSound'
import SVGBarGraph from '../../assets/svg/SVGBarGraph'
import { addNoteMessage } from '../../redux/appSlice'

// Lazy load ExpectedIQModal component
const ExpectedIQModal = lazy(() =>
  import('../articleComponents/ExpectedIQModal'),
)

// LoadingSpinner Component
const LoadingSpinner = React.memo(() => (
  <Flex
    w="100%"
    justifyContent="center"
    alignItems="center"
    flexDirection="column"
    position="relative"
    backgroundColor={{ base: 'rgba(15, 13, 21, 0.8)', xl: 'transparent' }}
    boxShadow={{
      xl: 'none',
      base: '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
    }}
    height={'150px'}
  >
    <Spinner />
  </Flex>
))

// HiddenGraphMessage Component
const HiddenGraphMessage = React.memo(() => (
  <Flex h="100%" w="100%" justifyContent="center" alignItems="center">
    <Text
      bg="#0f0d15"
      color="#9CAFAA"
      w="60px"
      h="30px"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      Hidden
    </Text>
  </Flex>
))

// NoDataMessage Component
const NoDataMessage = React.memo(
  ({ getExpectedIQ, expectedIQ, setShowExpectedIQ, showExpectedIQ }) => (
    <Flex
      w="100%"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      position="relative"
      backgroundColor={{ base: 'rgba(15, 13, 21, 0.8)', xl: 'transparent' }}
      boxShadow={{
        xl: 'none',
        base: '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Text m={0}>
        Give 10 Quizzes to get the IQ score and Unlock the bar graph
      </Text>
      <Image
        h="200px"
        w="200px"
        src={Lock}
        onClick={getExpectedIQ}
        cursor="pointer"
      />
      {showExpectedIQ && (
        <Suspense fallback={<Spinner />}>
          <ExpectedIQModal
            expectedIQ={expectedIQ}
            setShowExpectedIQ={setShowExpectedIQ}
          />
        </Suspense>
      )}
    </Flex>
  ),
)

const IQBarGraph = ({
  barGraph,
  privateBarGraph,
  loginedUserProfile,
  viewingHistory = false,
  isGuest,
}) => {
  const { playClick } = useSound()
  const { user } = useSelector(state => state.auth)
  const [graphData, setGraphData] = useState({
    userIQ: null,
    topPercent: null,
    filteredIQData: [],
    filteredLabels: [],
    percentileData: [],
  })
  const dispatch = useDispatch()
  const responsiveChartWidth = useBreakpointValue({
    base: 350,
    md: 300,
    lg: 400,
    xl: 300,
    '2xl': 400,
  })
  const [hoveredData, setHoveredData] = useState({
    percentile: null,
    range: null,
    count: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [expectedIQ, setExpectedIQ] = useState(0)
  const [showExpectedIQ, setShowExpectedIQ] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (barGraph) {
      setGraphData({
        userIQ: barGraph.USER_IQ,
        topPercent: barGraph.Top_Percentage,
        filteredIQData: barGraph.filteredIQData,
        filteredLabels: barGraph.filteredLabels,
        percentileData: barGraph.percentileData,
      })
      setHoveredData({
        percentile: barGraph.Top_Percentage,
        range: null,
        count: null,
      })
      setIsLoading(false)
    }
  }, [barGraph])

  const handleHover = useCallback(
    (event, array) => {
      if (array && array.length) {
        const index = array[0].index
        const percentile = graphData.percentileData[index].percentile
        const range = `${graphData.percentileData[index].lowerBound}-${graphData.percentileData[index].upperBound}`
        const count = graphData.percentileData[index].count
        setHoveredData({ percentile, range, count })
      } else {
        setHoveredData({
          percentile: graphData.topPercent,
          range: null,
          count: null,
        })
      }
    },
    [graphData],
  )

  const getExpectedIQ = useCallback(async () => {
    playClick()
    setIsLoading(true)
    setShowExpectedIQ(true)
    try {
      const response = await axios.get('/api/user/expectedIQScore')
      if (response.data.ExpectedIQScore !== null) {
        setExpectedIQ(response.data.ExpectedIQScore)
      }
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
  }, [playClick, toast])

  if (isGuest) {
    return (
      <Flex
        w={'100%'}
        h={'250px'}
        justifyContent={'center'}
        alignItems={'center'}
        flexDirection={'column'}
        backgroundColor={{ base: 'rgba(15, 13, 21, 0.8)', xl: 'transparent' }}
        boxShadow={{
          xl: 'none',
          base: '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Image
          h="200px"
          w="200px"
          background="transparent"
          src={Lock}
          onClick={() =>
            dispatch(
              addNoteMessage({
                title: 'Register to view your standings',
                duration: 10000,
                width: '250px',
                actions: [
                  {
                    actionType: 'SECURE_YOUR_PROGRESS',
                  },
                ],
              }),
            )
          }
          _hover={{ cursor: 'pointer' }}
        />
        <Text>No data for guest user</Text>
      </Flex>
    )
  }

  if (privateBarGraph) {
    return <HiddenGraphMessage />
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (graphData.userIQ === 0) {
    return (
      <NoDataMessage
        getExpectedIQ={getExpectedIQ}
        expectedIQ={expectedIQ}
        setShowExpectedIQ={setShowExpectedIQ}
        showExpectedIQ={showExpectedIQ}
      />
    )
  }

  return (
    <Flex
      w="100%"
      padding={'20px'}
      flexDirection="column"
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor={{ base: 'rgba(15, 13, 21, 0.8)', xl: 'transparent' }}
      boxShadow={{
        xl: 'none',
        base: '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
      }}
      className="iq-bar-graph"
      position={'relative'}
    >
      <Flex width="100%" position="relative">
        <Flex marginStart="15px" flexDirection="column">
          <Text textAlign="left" color="#9CAFAA" p={0} m={0}>
            Top
          </Text>
          <Text textAlign="left" fontSize="1.5rem">
            {hoveredData.percentile}%
          </Text>
        </Flex>
        {hoveredData.range && hoveredData.count && (
          <Flex marginLeft="40px" flexDirection="column">
            <Text textAlign="left" color="#9CAFAA" p={0} m={0}>
              {hoveredData.range}
            </Text>
            <Text textAlign="left">{hoveredData.count} users</Text>
          </Flex>
        )}
        {loginedUserProfile && (
          <Tooltip label="Visibility to others">
            <Tag
              backgroundColor="#0f0d15"
              m={0}
              position="absolute"
              top={0}
              right={0}
              color="#9CAFAA"
              display="flex"
              justifyContent="center"
              alignItems="center"
              w="60px"
              height="30px"
            >
              {user.profilePrivacy.barGraph ? 'HIDDEN' : 'VISIBLE'}
            </Tag>
          </Tooltip>
        )}
      </Flex>
      <Flex
        height="150px"
        width="100%"
        justifyContent="center"
        alignItems={'center'}
      >
        <SVGBarGraph
          data={graphData.filteredIQData}
          labels={graphData.filteredLabels}
          height={150}
          width={responsiveChartWidth}
          onHover={handleHover}
          userIQ={graphData.userIQ}
        />
      </Flex>
    </Flex>
  )
}

export default React.memo(IQBarGraph)
