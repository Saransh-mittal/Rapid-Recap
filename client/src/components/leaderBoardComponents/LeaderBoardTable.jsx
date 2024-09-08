import React, { useMemo, useCallback, Suspense, useRef } from 'react'
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Box,
  useColorModeValue,
  useBreakpointValue,
  Skeleton,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const LeaderBoardRow = React.lazy(() => import('./LeaderBoardRow'))
const LoadingState = React.lazy(() => import('./LoadingState'))
const VerticalDotsSeparator = React.lazy(() =>
  import('./VerticalDotsSeparator'),
)

const LeaderBoardTable = ({
  leaders,
  searchResults,
  searchLoad,
  currUserChar,
  navigate,
  isLoading,
  PAGE_LIMIT,
  hasMore,
  onLoadMore,
}) => {
  const { t } = useTranslation('LeaderBoardTable')
  const data = useMemo(
    () => (searchResults.length > 0 ? searchResults : leaders),
    [searchResults, leaders],
  )
  const scrollRef = useRef(null)

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      if (
        scrollHeight - scrollTop <= clientHeight * 1.5 &&
        hasMore &&
        !isLoading
      ) {
        onLoadMore()
      }
    }
  }, [hasMore, isLoading, onLoadMore])

  const uniqueData = useMemo(() => {
    const seenUserIds = new Set()
    return data.filter(user => {
      if (seenUserIds.has(user._id)) {
        return false
      } else {
        seenUserIds.add(user._id)
        return true
      }
    })
  }, [data])

  const handleNavigate = useCallback(route => navigate(route), [navigate])

  const textColor = useColorModeValue('gray.100', 'gray.50')
  const accentColor = useColorModeValue('purple.500', 'purple.300')
  const bgColor = useColorModeValue('gray.800', 'gray.900')

  const isMobile = useBreakpointValue({ base: true, md: false })
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false })
  const isDesktop = useBreakpointValue({ base: false, lg: true })

  const renderHeader = () => (
    <Thead>
      <Tr>
        {isMobile ? (
          <Th textAlign="center" color={accentColor} width={'40%'}>
            {t('rankAndPlayer')}
          </Th>
        ) : (
          <>
            <Th width="10%" textAlign="center" color={accentColor}>
              {t('rank')}
            </Th>
            <Th width="25%" textAlign="left" color={accentColor}>
              {t('Player')}
            </Th>
          </>
        )}
        <Th
          width={isMobile ? '30%' : '15%'}
          textAlign="center"
          color={accentColor}
        >
          {t('iqScores')}
        </Th>
        {isDesktop && (
          <>
            <Th width="20%" textAlign="center" color={accentColor}>
              {t('quizSubmissions')}
            </Th>
            <Th width="15%" textAlign="center" color={accentColor}>
              {t('avgRQMScore')}
            </Th>
          </>
        )}
      </Tr>
    </Thead>
  )

  const renderLoadingSkeleton = () => {
    console.log('renderLoadingSkeleton')
    return (
      <Tbody>
        {Array.from({ length: PAGE_LIMIT }).map((_, index) => (
          <Tr key={index}>
            <Td colSpan={isDesktop ? 6 : 4}>
              <Skeleton
                height="50px"
                width={'100%'}
                startColor="gray.600"
                endColor="gray.800"
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    )
  }

  return (
    <Box position="relative" width="100%">
      <Box position="sticky" top="0" zIndex="2" bg={bgColor} width="100%">
        <Table variant="unstyled" layout="fixed" width="100%">
          {renderHeader()}
        </Table>
      </Box>
      <Box
        overflowY="auto"
        maxHeight="calc(100vh - 200px)"
        width="100%"
        ref={scrollRef}
        onScroll={handleScroll}
        css={{ '&::-webkit-scrollbar': { display: 'none' } }}
      >
        <Table variant="unstyled" layout="fixed" width="100%">
          <Suspense fallback={<LoadingState />}>
            {isLoading ? (
              renderLoadingSkeleton()
            ) : searchLoad ? (
              <LoadingState />
            ) : (
              <Tbody>
                {uniqueData.length > 0 &&
                  uniqueData.map((user, index) => (
                    <LeaderBoardRow
                      key={`${user._id}-${index}`}
                      user={user}
                      index={index}
                      currUserChar={currUserChar}
                      isMobile={isMobile}
                      isTablet={isTablet}
                      isDesktop={isDesktop}
                      navigate={handleNavigate}
                      textColor={textColor}
                      accentColor={accentColor}
                    />
                  ))}
                {currUserChar?.rank > 500 && (
                  <>
                    <Tr>
                      <Td colSpan={isDesktop ? 6 : 4}>
                        <VerticalDotsSeparator />
                      </Td>
                    </Tr>
                    <LeaderBoardRow
                      key={`currentUser-${currUserChar._id}`}
                      user={currUserChar}
                      index={50}
                      currUserChar={currUserChar}
                      isMobile={isMobile}
                      isTablet={isTablet}
                      isDesktop={isDesktop}
                      navigate={handleNavigate}
                      textColor={textColor}
                      accentColor={accentColor}
                    />
                  </>
                )}
              </Tbody>
            )}
          </Suspense>
        </Table>
      </Box>
    </Box>
  )
}

export default LeaderBoardTable
