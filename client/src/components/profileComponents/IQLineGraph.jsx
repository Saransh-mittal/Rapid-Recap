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
  Badge,
} from '@chakra-ui/react'
import moment from 'moment'
import axios from 'axios'
import Lock from '/images/lock.webp'
import { useDispatch, useSelector } from 'react-redux'
import useSound from '../../customHooks/useSound'
import SVGIQLineGraph from '../../assets/svg/SVGIQLineGraph'
import { addNoteMessage } from '../../redux/appSlice'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../utils/helper.utils'
import i18n from 'i18next'

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
  }) => {
    const { t } = useTranslation('IQLineGraph')
    return (
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
          {viewingHistory ? t('noDataAvailable') : t('giveQuizzes')}
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
    )
  },
)

// GraphHeader Component
const GraphHeader = React.memo(
  ({ hoveredData, loginedUserProfile, user, t }) => {
    return (
      <Flex justifyContent="space-between" position="relative">
        {loginedUserProfile && (
          <Tooltip label={t('visibilityToOthers')}>
            <Badge
              m={0}
              position="absolute"
              top={0}
              right={0}
              colorScheme="green"
            >
              {user.profilePrivacy.lineGraph ? t('hidden') : t('visible')}
            </Badge>
          </Tooltip>
        )}
        <Flex justifyContent="space-between" w="100%" marginTop="2rem">
          <Flex flexDirection="column">
            <Text textAlign="left" color="#9CAFAA" p={0} m={0}>
              {t('iqScore')}
            </Text>
            <Text textAlign="left" fontSize="1.5rem">
              {hoveredData?.IQScore}
            </Text>
          </Flex>
          <Flex flexDirection="column">
            <Text textAlign="left" color="#9CAFAA" p={0} m={0}>
              {t('date')}
            </Text>
            <Text textAlign="left">
              {hoveredData?.date
                ? formatDate(hoveredData.date, i18n.language)
                : ''}
            </Text>
          </Flex>
          <Flex flexDirection="column">
            <Text textAlign="left" color="#9CAFAA" p={0} m={0}>
              {t('dailyRank')}
            </Text>
            <Text textAlign="left">{hoveredData?.dailyRank}</Text>
          </Flex>
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

const IQLineGraph = ({
  lineGraph,
  privateLineGraph,
  loginedUserProfile,
  viewingHistory = false,
  isNavIQ = false,
  iOpenedFromNav = false,
  graphwidth,
  isGuest,
  t,
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
  const dispatch = useDispatch()
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
        title: t('errorOccurred'),
        description: t('unableToFetch'),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [playClick, toast, t])

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
    return (
      <Flex h="300px">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <NoDataMessage
            viewingHistory={viewingHistory}
            getExpectedIQ={getExpectedIQ}
            showExpectedIQ={showExpectedIQ}
            expectedIQ={expectedIQ}
            isLoading={isLoading}
            setShowExpectedIQ={setShowExpectedIQ}
          />
        )}
      </Flex>
    )
  }

  return (
    <Flex
      w="100%"
      justifyContent="space-between"
      flexDirection="column"
      boxShadow={{
        xl: 'none',
        base: '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
      }}
    >
      <GraphHeader
        hoveredData={hoveredData}
        loginedUserProfile={loginedUserProfile}
        user={user}
        t={t}
      />
      <GraphBody
        chartData={chartData}
        responsiveChartWidth={responsiveChartWidth}
        handleHover={handleHover}
        graphwidth={graphwidth}
      />
    </Flex>
  )
}

export default IQLineGraph
