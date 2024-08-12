import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  lazy,
  Suspense,
} from 'react'
import {
  Flex,
  Text,
  Tooltip,
  Image,
  Spinner,
  Tag,
  useToast,
  useBreakpointValue,
} from '@chakra-ui/react'
import moment from 'moment'
import axios from 'axios'
import Lock from '/images/lock.webp'
import { useSelector } from 'react-redux'
import useSound from '../../customHooks/useSound'
import SVGIQLineGraph from '../../assets/svg/SVGIQLineGraph'

// Lazy load the ExpectedIQModal component
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

// NoDataMessage Component
const NoDataMessage = React.memo(
  ({
    viewingHistory,
    getExpectedIQ,
    showExpectedIQ,
    expectedIQ,
    isLoading,
    setShowExpectedIQ,
  }) => (
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
        {viewingHistory
          ? `No Data Available`
          : `Give 10 Quizzes to get the IQ score and enter the ranking`}
      </Text>

      <Image
        h="200px"
        w="200px"
        background="transparent"
        src={Lock}
        onClick={getExpectedIQ}
      />

      {showExpectedIQ && (
        <Suspense fallback={<Spinner />}>
          <ExpectedIQModal
            expectedIQ={expectedIQ}
            setShowExpectedIQ={setShowExpectedIQ}
            isLoading={isLoading}
          />
        </Suspense>
      )}
    </Flex>
  ),
)

// GraphHeader Component
const GraphHeader = React.memo(({ hoveredData, loginedUserProfile, user }) => (
  <Flex justifyContent="space-between" position="relative">
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
          {user.profilePrivacy.lineGraph ? 'HIDDEN' : 'VISIBLE'}
        </Tag>
      </Tooltip>
    )}
    <Flex justifyContent="space-between" w="100%" marginTop="2rem">
      <Flex flexDirection="column">
        <Text textAlign="left" color="#9CAFAA" p={0} m={0}>
          IQ Score
        </Text>
        <Text textAlign="left" fontSize="1.5rem">
          {hoveredData?.IQScore}
        </Text>
      </Flex>
      <Flex flexDirection="column">
        <Text textAlign="left" color="#9CAFAA" p={0} m={0}>
          Date
        </Text>
        <Text textAlign="left">
          {hoveredData?.date
            ? moment(hoveredData.date).format('MMM DD, YYYY')
            : ''}
        </Text>
      </Flex>
      <Flex flexDirection="column">
        <Text textAlign="left" color="#9CAFAA" p={0} m={0}>
          Daily Rank
        </Text>
        <Text textAlign="left">{hoveredData?.dailyRank}</Text>
      </Flex>
    </Flex>
  </Flex>
))

// GraphBody Component
const GraphBody = React.memo(
  ({ chartData, responsiveChartWidth, handleHover, graphwidth }) => (
    <Flex
      height="150px"
      marginTop="1rem"
      justifyContent={'center'}
      alignItems={'center'}
    >
      <SVGIQLineGraph
        data={chartData}
        width={graphwidth ? graphwidth : responsiveChartWidth}
        height={150}
        onHover={handleHover}
      />
    </Flex>
  ),
)

const IQLineGraph = ({
  lineGraph,
  privateLineGraph,
  loginedUserProfile,
  viewingHistory = false,
  isNavIQ = false,
  iOpenedFromNav = false,
  graphwidth,
}) => {
  const { playClick } = useSound()
  const { user } = useSelector(state => state.auth)
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()
  const responsiveChartWidth = useBreakpointValue({
    base: 350,
    md: 300,
    lg: 400,
    xl: 300,
    '2xl': 500,
  })
  const [hoveredData, setHoveredData] = useState(null)
  const [expectedIQ, setExpectedIQ] = useState(0)
  const [showExpectedIQ, setShowExpectedIQ] = useState(false)

  const chartData = useMemo(() => {
    return lineGraph.map(entry => ({
      date: entry.date ? moment(entry.date, 'YYYY:MM:DD').toDate() : null,
      IQScore: entry.IQScore,
      dailyRank: entry.dailyRank,
    }))
  }, [lineGraph])

  const handleHover = useCallback(
    index => {
      if (index !== null && index < chartData.length) {
        setHoveredData(chartData[index])
      } else {
        setHoveredData(chartData[chartData.length - 1])
      }
    },
    [chartData],
  )

  const getExpectedIQ = useCallback(async () => {
    playClick()
    setIsLoading(true)
    setShowExpectedIQ(true)
    try {
      const response = await axios.get('/api/user/expectedIQScore')
      if (response.data.ExpectedIQScore) {
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

  useEffect(() => {
    setHoveredData(chartData[chartData.length - 2])
    setIsLoading(false)
  }, [chartData])

  if (privateLineGraph) {
    return (
      <Flex h="100%" w="100%" justifyContent="center" alignItems="center">
        <Text
          backgroundColor="#0f0d15"
          m={0}
          top={0}
          right={10}
          color="#9CAFAA"
          display="flex"
          justifyContent="center"
          alignItems="center"
          w="60px"
          height="30px"
        >
          Hidden
        </Text>
      </Flex>
    )
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (chartData.length <= 10) {
    return (
      <NoDataMessage
        viewingHistory={viewingHistory}
        getExpectedIQ={getExpectedIQ}
        showExpectedIQ={showExpectedIQ}
        expectedIQ={expectedIQ}
        isLoading={isLoading}
        setShowExpectedIQ={setShowExpectedIQ}
      />
    )
  }

  return (
    <Flex
      w="100%"
      flexDirection="column"
      borderRight={{ xl: iOpenedFromNav ? '0' : '1px' }}
      padding={{ base: '20px', xl: '0' }}
      paddingX={{ base: '20px', xl: '30px' }}
      flex={1}
      paddingRight="30px"
      backgroundColor={{ base: 'rgba(15, 13, 21, 0.8)', xl: 'transparent' }}
      boxShadow={{
        xl: 'none',
        base: '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
      }}
      className="iq-line-graph"
    >
      <GraphHeader
        hoveredData={hoveredData}
        loginedUserProfile={loginedUserProfile}
        user={user}
      />
      <GraphBody
        graphwidth={graphwidth}
        chartData={chartData}
        responsiveChartWidth={responsiveChartWidth}
        handleHover={handleHover}
      />
    </Flex>
  )
}

export default React.memo(IQLineGraph)
