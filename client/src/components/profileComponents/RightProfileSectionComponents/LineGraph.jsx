import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Flex,
  Text,
  Image,
  Spinner,
  useBreakpointValue,
} from '@chakra-ui/react'
import moment from 'moment'

import { useDispatch, useSelector } from 'react-redux'

import SVGIQLineGraph from '../../../assets/svg/SVGIQLineGraph'
import { addNoteMessage } from '../../../redux/appSlice'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../../utils/helper.utils'
import i18n from 'i18next'

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
const NoDataMessage = React.memo(({ viewingHistory }) => {
  const { t } = useTranslation('LineGraph')
  return (
    <Flex
      w="100%"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      position="relative"
    >
      <Text m={0}>
        {viewingHistory ? t('noDataAvailable') : t('giveQuizzes')}
      </Text>

      <Image h="200px" w="200px" background="transparent" src={Lock} />
    </Flex>
  )
})

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

// GraphHeader Component
const GraphHeader = React.memo(
  ({ hoveredData, loginedUserProfile, user, t, quantities }) => {
    return (
      <Flex justifyContent="space-between" position="relative">
        <Flex justifyContent="space-between" w="100%">
          {quantities.map((quantity, index) => (
            <Flex flexDirection="column" key={index}>
              <Text textAlign="left" color="#9CAFAA" p={0} m={0}>
                {quantity.label}
              </Text>
              <Text textAlign="left" fontSize="1.5rem">
                {quantity.key === 'date' && hoveredData?.date
                  ? formatDate(hoveredData.date, i18n.language) // Use the formatDate function here
                  : hoveredData?.[quantity.key] || ''}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    )
  },
)

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

const LineGraph = ({
  lineGraph,
  privateLineGraph,
  loginedUserProfile,
  viewingHistory = false,
  graphwidth,
  isGuest,
  t,
  quantities, // New prop for quantities configuration
}) => {
  const { user } = useSelector(state => state.auth)
  const [isLoading, setIsLoading] = useState(true)

  const responsiveChartWidth = useBreakpointValue({
    base: 350,
    md: 300,
    lg: 400,
    xl: 300,
    '2xl': 390,
  })
  const dispatch = useDispatch()
  const [hoveredData, setHoveredData] = useState(null)

  const chartData = useMemo(() => {
    // Ensure lineGraph is an array
    return (Array.isArray(lineGraph) ? lineGraph : []).map(entry => ({
      date: entry.date ? moment(entry.date, 'YYYY-MM-DD').toDate() : null, // Parse the date correctly
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

  useEffect(() => {
    setHoveredData(chartData[chartData.length - 2])
    setIsLoading(false)
  }, [chartData])

  if (isGuest) {
    return (
      <Flex
        w={'100%'}
        h={'250px'}
        justifyContent={'center'}
        alignItems={'center'}
        flexDirection={'column'}
        zIndex={1001}
      >
        <Image
          h="200px"
          w="200px"
          background="transparent"
          src={Lock}
          onClick={() =>
            dispatch(
              addNoteMessage({
                title: t('registerToView'),
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

  if (privateLineGraph) {
    return <HiddenGraphMessage />
  }
  if (chartData?.length === 0) {
    return (
      <>
        {isLoading ? (
          <Flex h="300px">
            <LoadingSpinner />
          </Flex>
        ) : (
          <Flex width={'100%'} h={'100%'}>
            <NoDataMessage viewingHistory={viewingHistory} />
          </Flex>
        )}
      </>
    )
  }
  return (
    <Flex w="100%" p={2} justifyContent="space-between" flexDirection="column">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <GraphHeader
            hoveredData={hoveredData}
            loginedUserProfile={loginedUserProfile}
            user={user}
            t={t}
            quantities={quantities} // Pass the dynamic quantities
          />
          <GraphBody
            chartData={chartData}
            responsiveChartWidth={responsiveChartWidth}
            handleHover={handleHover}
            graphwidth={graphwidth}
          />
        </>
      )}
    </Flex>
  )
}

export default LineGraph
