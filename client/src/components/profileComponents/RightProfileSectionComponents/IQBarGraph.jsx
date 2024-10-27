import React, { useEffect, useState, useCallback } from 'react'
import {
  Badge,
  Flex,
  Image,
  Spinner,
  Text,
  Tooltip,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux'

import SVGBarGraph from '../../../assets/svg/SVGBarGraph'
import { addNoteMessage } from '../../../redux/appSlice'

//SSR images
const Lock = '/images/lock.webp'

// LoadingSpinner Component
const LoadingSpinner = React.memo(() => (
  <Flex
    w="100%"
    justifyContent="center"
    alignItems="center"
    flexDirection="column"
    position="relative"
    height={'150px'}
  >
    <Spinner />
  </Flex>
))

// HiddenGraphMessage Component
const HiddenGraphMessage = React.memo(() => (
  <Flex h="220px" w="100%" justifyContent="center" alignItems="center">
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
const NoDataMessage = React.memo(({ t }) => {
  return (
    <Flex
      w="100%"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      position="relative"
    >
      <Text m={0}>{t('giveQuizzesToUnlock')}</Text>
      <Image h="200px" w="200px" src={Lock} cursor="pointer" />
    </Flex>
  )
})

const IQBarGraph = ({
  barGraph,
  privateBarGraph,
  loginedUserProfile,
  isGuest,
  t,
}) => {
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
    '2xl': 390,
  })
  const [hoveredData, setHoveredData] = useState({
    percentile: null,
    range: null,
    count: null,
  })
  const [isLoading, setIsLoading] = useState(true)

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

  if (isGuest) {
    return (
      <Flex
        w={'100%'}
        h={'250px'}
        justifyContent={'center'}
        alignItems={'center'}
        flexDirection={'column'}
      >
        <Image
          h="200px"
          w="200px"
          background="transparent"
          src={Lock}
          onClick={() =>
            dispatch(
              addNoteMessage({
                title: t('registerToViewStandings'),
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
        <Text>{t('noDataForGuest')}</Text>
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
    return <NoDataMessage t={t} />
  }

  return (
    <Flex
      w="100%"
      flexDirection="column"
      flex={1}
      justifyContent="center"
      alignItems="center"
      className="iq-bar-graph"
      position={'relative'}
    >
      <Flex width="100%" position="relative">
        <Flex marginStart="15px" flexDirection="column">
          <Text textAlign="left" color="#9CAFAA" p={0} m={0}>
            {t('top')}
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
            <Text textAlign="left">
              {hoveredData.count} {t('users')}
            </Text>
          </Flex>
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
